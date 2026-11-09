#!/usr/bin/env python3
# The side view's art from PixelLab (pixellab.ai): characters, their animations, and the strips the game loads.
# The API token is not in this repository: the session's network proxy adds it to requests for api.pixellab.ai, so the
# Authorization header here carries a placeholder. Files are fetched through the API's own zip export (its file host is
# not reachable from the build machine).
#
#   python3 tools/pixellab.py balance
#   python3 tools/pixellab.py character <name> "<description>" [size] [detail] -> creates it, records its id in assets/side/pixellab.json
#   python3 tools/pixellab.py animate <name> <anim> "<action>" [frames]       -> a side-view animation (east; west is the mirror)
#   python3 tools/pixellab.py pull <name>                                      -> downloads every animation and packs strips:
#        assets/side/<name>/<anim>.png (frames left to right) + assets/side/<name>/sprite.json
#   python3 tools/pixellab.py image <file> "<description>" <w> <h> [alpha]     -> assets/side/<file>.png (backgrounds, props)
#   python3 tools/pixellab.py tileset <file> "<material>" "<top layer>"        -> assets/side/<file>/ (32px side-scroller tiles)
#   python3 tools/pixellab.py unbg <file>                                      -> clears a flat backdrop the image came with
import json, os, sys, time, io, zipfile, urllib.request
API = 'https://api.pixellab.ai/v2'
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(ROOT, 'assets', 'side'); BOOK = os.path.join(OUT, 'pixellab.json')

def call(method, path, body=None, raw=False):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer from-proxy', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r: data = r.read()
    return data if raw else json.loads(data)
def book():
    try: return json.load(open(BOOK))
    except Exception: return {}
def save_book(b): os.makedirs(OUT, exist_ok=True); json.dump(b, open(BOOK, 'w'), indent=1)
def wait(job, what):
    while True:
        j = call('GET', f'/background-jobs/{job}')
        if j['status'] in ('completed', 'failed', 'cancelled'):
            print(what, j['status']); return j
        print(what, j['status'], round((j.get('last_response') or {}).get('progress') or 0, 2)); time.sleep(8)

def character(name, desc, size=128, detail='highly detailed'):
    r = call('POST', '/create-character-v3', {'description': desc, 'image_size': {'width': size, 'height': size}, 'view': 'side', 'no_background': True,
                                              'outline': 'single color black outline', 'detail': detail})
    b = book(); b[name] = {'id': r['character_id'], 'description': desc, 'anims': {}}; save_book(b)
    wait(r['background_job_id'], 'character ' + name)
def animate(name, anim, action, frames=8):
    b = book(); c = b[name]
    r = call('POST', '/characters/animations', {'character_id': c['id'], 'mode': 'v3', 'action_description': action, 'animation_name': anim, 'frame_count': int(frames), 'directions': ['east']})
    c['anims'][anim] = {'action': action, 'frames': int(frames), 'group': r.get('animation_group_id')}; save_book(b)
    for j in r['background_job_ids']: wait(j, f'{name} {anim}')
def pull(name):
    from PIL import Image
    b = book(); c = b[name]
    z = zipfile.ZipFile(io.BytesIO(call('GET', f"/characters/{c['id']}/zip", raw=True)))
    groups = {}
    for n in z.namelist():
        parts = n.split('/')
        if len(parts) >= 5 and parts[1] == 'animations' and parts[3] == 'east' and n.endswith('.png'): groups.setdefault(parts[2], []).append(n)
        if n.endswith('rotations/east.png'): groups.setdefault('stand', []).append(n)
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True); meta = {'name': name, 'ppu': 32, 'anims': {}}   # drawn for 32 pixels to a world unit
    for anim, files in groups.items():
        frames = [Image.open(io.BytesIO(z.read(f))).convert('RGBA') for f in sorted(files)]
        w = max(f.width for f in frames); h = max(f.height for f in frames)
        strip = Image.new('RGBA', (w * len(frames), h))
        for i, f in enumerate(frames): strip.paste(f, (i * w + (w - f.width) // 2, h - f.height))
        strip.save(os.path.join(d, anim + '.png'))
        # where the body is in the frame: its feet (the lowest painted row over every frame) and its middle (the
        # first frame's painted columns), so animations on different canvases line up
        bb = [f.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() for f in frames]
        foot = max(b_[3] for b_ in bb if b_) + (h - frames[0].height)
        b0 = bb[0] or (0, 0, w, h); cx = (b0[0] + b0[2]) / 2 + (w - frames[0].width) / 2
        meta['anims'][anim] = {'frames': len(frames), 'w': w, 'h': h, 'foot': foot, 'cx': cx}
        print(name, anim, len(frames), 'frames', w, 'x', h)
    json.dump(meta, open(os.path.join(d, 'sprite.json'), 'w'), indent=1)

def find_b64(o):
    """the first base64 image anywhere in a response"""
    if isinstance(o, dict):
        if isinstance(o.get('base64'), str) and len(o['base64']) > 100: return o['base64']
        for v in o.values():
            r = find_b64(v)
            if r: return r
    if isinstance(o, list):
        for v in o:
            r = find_b64(v)
            if r: return r
    return None
def image(fname, desc, w, h, alpha=False):
    import base64
    r = call('POST', '/create-image-pixflux-background', {'description': desc, 'image_size': {'width': int(w), 'height': int(h)}, 'no_background': bool(alpha), 'view': 'side', 'detail': 'highly detailed', 'shading': 'detailed shading'})
    if r.get('background_job_id'): r = wait(r['background_job_id'], 'image ' + fname)
    b = find_b64(r)
    if not b: print('no image in', json.dumps(r)[:600]); return
    path = os.path.join(OUT, fname + '.png'); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(base64.b64decode(b.split(',')[-1])); print('wrote', path, r.get('usage'))
def unbg(fname, tol=26):
    """an image asked for without a background sometimes comes on a flat one: flood it away from the border"""
    from PIL import Image
    path = os.path.join(OUT, fname + '.png'); im = Image.open(path).convert('RGBA'); px = im.load(); w, h = im.size
    seen = set(); stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    ref = [px[x, y] for x, y in stack if px[x, y][3] > 0]
    if not ref: print('already clear', fname); return
    bg = max(set(ref), key=ref.count)
    near = lambda c: c[3] == 0 or sum(abs(c[i] - bg[i]) for i in range(3)) <= tol
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h) or not near(px[x, y]): continue
        seen.add((x, y)); px[x, y] = (0, 0, 0, 0); stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    im.save(path); print('cleared', len(seen), 'pixels of', bg, 'from', fname)
def tileset(fname, lower, top):
    import base64
    r = call('POST', '/create-tileset-sidescroller', {'lower_description': lower, 'transition_description': top, 'tile_size': {'width': 32, 'height': 32}, 'transition_size': 0.25 if top else 0.0, 'detail': 'highly detailed'})
    print(json.dumps(r)[:400])
    tid = r.get('tileset_id') or r.get('id')
    if r.get('background_job_id'): wait(r['background_job_id'], 'tileset ' + fname)
    t = call('GET', f'/tilesets-sidescroller/{tid}')
    d = os.path.join(OUT, fname); os.makedirs(d, exist_ok=True); json.dump(t, open(os.path.join(d, 'tileset.json'), 'w'))
    n = 0
    def walk(o, path):
        nonlocal n
        if isinstance(o, dict):
            if isinstance(o.get('base64'), str) and len(o['base64']) > 100:
                open(os.path.join(d, f'tile_{n:02d}.png'), 'wb').write(base64.b64decode(o['base64'].split(',')[-1])); n += 1; return
            for k, v in o.items(): walk(v, path + [k])
        elif isinstance(o, list):
            for i, v in enumerate(o): walk(v, path + [i])
    walk(t, []); print('tiles', n)

if __name__ == '__main__':
    cmd, *a = sys.argv[1:]
    if cmd == 'balance': print(call('GET', '/balance'))
    elif cmd == 'character': character(a[0], a[1], int(a[2]) if len(a) > 2 else 128, a[3] if len(a) > 3 else 'highly detailed')
    elif cmd == 'animate': animate(a[0], a[1], a[2], a[3] if len(a) > 3 else 8)
    elif cmd == 'pull': pull(a[0])
    elif cmd == 'image': image(a[0], a[1], a[2], a[3], len(a) > 4 and a[4] == 'alpha')
    elif cmd == 'unbg': unbg(a[0])
    elif cmd == 'tileset': tileset(a[0], a[1], a[2] if len(a) > 2 else '')
