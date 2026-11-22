# one state of the hero: him holding another weapon. Usage: state.py <name> "<edit>" [size]
import sys, json, time, urllib.request, os
API = 'https://api.pixellab.ai/v2'; HERO = 'd7a74957-c00a-4100-869a-2dc1c65c80e2'
OUT = os.path.dirname(os.path.abspath(__file__))
def call(method, path, body=None, raw=False):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None, headers={'Authorization': 'Bearer from-proxy', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r: data = r.read()
    return data if raw else json.loads(data)
name, edit = sys.argv[1], sys.argv[2]; size = int(sys.argv[3]) if len(sys.argv) > 3 else 0
body = {'character_id': HERO, 'edit_description': edit, 'state_name': name[:20], 'use_color_palette_from_reference': True}
if size: body['override_frame_size'] = {'width': size, 'height': size}
r = call('POST', '/create-character-state', body); print(json.dumps(r)[:400])
job = r.get('background_job_id') or (r.get('background_job_ids') or [None])[0]
while True:
    j = call('GET', f'/background-jobs/{job}'); print(name, j['status']); 
    if j['status'] in ('completed', 'failed', 'cancelled'): break
    time.sleep(8)
json.dump({'request': body, 'response': r, 'job': {k: v for k, v in j.items() if k != 'last_response'}, 'last_keys': list((j.get('last_response') or {}).keys())}, open(os.path.join(OUT, name + '.json'), 'w'), indent=1)
print(json.dumps(j)[:600])
