"""Public RSS headlines only. Never generates headlines or copies full articles."""
import datetime as dt
import email.utils
import hashlib
import json
import pathlib
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGET = ROOT / 'public/assets/briefing.json'
FEEDS = [('en','World','BBC News','https://feeds.bbci.co.uk/news/world/rss.xml',('bbc.com','bbc.co.uk')),('en','Technology','BBC News','https://feeds.bbci.co.uk/news/technology/rss.xml',('bbc.com','bbc.co.uk')),('pt','Brasil','Agência Brasil','https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml',('agenciabrasil.ebc.com.br',))]
now=dt.datetime.now(dt.timezone.utc)
def date(text):
 try:
  value=email.utils.parsedate_to_datetime(text)
  return value.replace(tzinfo=value.tzinfo or dt.timezone.utc)
 except Exception:
  try: return dt.datetime.fromisoformat(text.replace('Z','+00:00')).replace(tzinfo=dt.timezone.utc)
  except Exception: return None
try: previous=json.loads(TARGET.read_text())
except (OSError,ValueError): previous={'stories':[]}
stories=[]; failures=[]; successful=[]
for language,topic,source,url,hosts in FEEDS:
 try:
  request=urllib.request.Request(url,headers={'User-Agent':'LanguageOS/1.0 (RSS headline reader)'})
  with urllib.request.urlopen(request,timeout=25) as response:
   payload=response.read(4_000_001)
  if len(payload)>4_000_000: raise ValueError('Feed exceeds size limit')
  items=ET.fromstring(payload).findall('.//item')
  added=0
  for item in items[:30]:
   title=(item.findtext('title') or '').strip(); link=(item.findtext('link') or '').strip(); published=date(item.findtext('pubDate') or '')
   parsed=urllib.parse.urlparse(link)
   if not title or not published or parsed.scheme!='https' or not any(parsed.hostname==h or (parsed.hostname or '').endswith('.'+h) for h in hosts): continue
   if published>now+dt.timedelta(hours=24) or published<now-dt.timedelta(days=3): continue
   stories.append({'id':hashlib.sha256(link.encode()).hexdigest()[:16],'language':language,'topic':topic,'source':source,'title':title[:240],'url':link,'published':published.isoformat()});added+=1
   if added>=6: break
  if not added: raise ValueError('No recent, dated headlines available')
  successful.append((language,topic))
 except Exception as error:
  failures.append({'language':language,'topic':topic,'message':str(error)[:180]})
for story in previous.get('stories',[]):
 if (story['language'],story['topic']) not in successful: stories.append(story)
unique={story['url']:story for story in stories}
output={'checkedAt':now.isoformat(),'stories':list(unique.values()),'unavailable':[{'language':f['language'],'topic':f['topic']} for f in failures]}
TARGET.parent.mkdir(parents=True,exist_ok=True);TARGET.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(f"Saved {len(unique)} verified feed headlines; {len(failures)} feeds unavailable. Previous headlines retained where needed.")
