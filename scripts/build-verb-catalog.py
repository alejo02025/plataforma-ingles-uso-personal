"""Rebuild the offline verb index from pinned WordNet / OMW inputs. No network.
Verb senses are aligned by WordNet 3.0 synset, not inferred from spelling.
"""
import json, re, hashlib, unicodedata
from pathlib import Path
from collections import defaultdict
root = Path('external-data/wordnet')
manifest=json.loads((root/'SOURCES.json').read_text())
for name, sha in manifest['sha256'].items():
    assert hashlib.sha256((root/name).read_bytes()).hexdigest()==sha, name

def lemmas(name):
    result=defaultdict(set)
    for line in (root/name).read_text().splitlines():
        p=line.split('\t')
        if len(p)==3 and p[0].endswith('-v') and p[1]=='lemma':
            word=unicodedata.normalize('NFC',p[2].replace('_',' ')).strip()
            if re.fullmatch(r"[\wÀ-ÿ ’'-]+",word): result[p[0]].add(word)
    return result
spa,por=lemmas('wn-data-spa.tab'),lemmas('wn-data-por.tab')
result={'en':defaultdict(list),'pt':defaultdict(list)}
for line in (root/'data.verb').read_text().splitlines():
    if not line or not line[0].isdigit(): continue
    body, gloss=line.split('|',1); parts=body.split(); sid=parts[0]+'-v'
    if not spa[sid]: continue
    count=int(parts[3],16)
    eng=[parts[4+i*2].replace('_',' ') for i in range(count)]
    meaning=sorted(spa[sid])
    # Preserve separate senses: never present all synonyms as interchangeable.
    for lang,words in [('en',eng),('pt',por[sid])]:
        for word in words:
            if not re.fullmatch(r"[\wÀ-ÿ ’'-]+",word): continue
            if lang=='pt' and not re.search(r'(ar|er|ir|or)(-se)?$',word): continue
            result[lang][word].append({'id':sid,'es':meaning,'gloss':gloss.strip()})
for lang,verbs in result.items():
    rows=[{'word':w,'senses':s} for w,s in sorted(verbs.items(), key=lambda x:x[0].casefold())]
    Path(f'public/assets/verbs/{lang}.json').write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
    print(lang,len(rows),'unique verbs / verb expressions')
