"""Generate separately licensed FreeDict lookup data from the preserved TEI sources.
No network calls: refresh the pinned source files deliberately before regenerating.
"""
import json, re, unicodedata
from pathlib import Path
from collections import defaultdict
import xml.etree.ElementTree as ET
ns={'t':'http://www.tei-c.org/ns/1.0'}
def clean(s): return re.sub(r'\s+', ' ', unicodedata.normalize('NFC',s)).strip().lower()
def entries(name):
 root=ET.parse(Path('external-data/freedict')/(name+'.tei')).getroot()
 for entry in root.findall('.//t:entry',ns):
  source=entry.find('t:form/t:orth',ns)
  if source is None: continue
  original=''.join(source.itertext()).strip()
  translations=[''.join(q.itertext()).strip() for q in entry.findall('.//t:cit[@type="trans"]/t:quote',ns)]
  yield original, translations

def reverse(name):
 result=defaultdict(set)
 for original, translations in entries(name):
  for translation in translations:
   key=clean(translation)
   if re.fullmatch(r"[\wÀ-ÿ '’-]{1,70}",key): result[key].add(original)
 return result
eng=reverse('spa-eng'); por=reverse('spa-por')
english={k:{'translations':sorted(v)[:8]} for k,v in eng.items()}
portuguese={k:{'translations':sorted(v)[:8]} for k,v in por.items()}
for original, translations in entries('por-eng'):
 key=clean(original)
 if key in portuguese or not re.fullmatch(r"[\wÀ-ÿ '’-]{1,70}",key): continue
 spanish=set()
 for translation in translations: spanish.update(eng.get(clean(translation),set()))
 if spanish: portuguese[key]={'translations':sorted(spanish)[:8],'indirect':True}
for lang,data in [('en',english),('pt',portuguese)]:
 Path(f'public/assets/word-help/{lang}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 print(lang,len(data),'dictionary entries')
