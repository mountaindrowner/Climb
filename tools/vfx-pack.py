#!/usr/bin/env python3
"""PixelLab VFX Creator effects, made around one of the warrior's strips, made ready for the game.
An effect's game pack (assets/side/vfx/<name>/pack: behind.png, front.png, manifest.json) places its clips by an anchor
on its own canvas. This finds where the warrior's strip sat on that canvas (by matching the first frame of the
'whole-with-sprite' clip, where nothing has happened yet, to the strip's first frame) and writes fx.json: each layer's
sheet and frames, and its top-left in the strip's pixels measured from the drawing's own anchor (cx, foot), which is
how the game places the warrior. The effect's frame i goes with the strip's frame i (made at the same rate).
Run: python3 tools/vfx-pack.py <name> <strip>   e.g.  python3 tools/vfx-pack.py cut1 atk_slam_v3"""
import os, sys, json
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'side')
def build(name, anim):
    d = os.path.join(ROOT, 'vfx', name); pack = os.path.join(d, 'pack'); man = json.load(open(os.path.join(pack, 'manifest.json')))
    meta = json.load(open(os.path.join(ROOT, 'mask_tall_c', 'sprite.json')))['anims'][anim]
    strip = Image.open(os.path.join(ROOT, 'mask_tall_c', anim + '.png')).convert('RGBA'); w = meta['w']
    f0 = strip.crop((0, 0, w, strip.height)); sb = f0.getbbox()
    clips = {c['name']: c for c in man['clips']}; ws = clips['whole-with-sprite']; ax, ay = man['anchor']['x'], man['anchor']['y']
    sheet = Image.open(os.path.join(pack, ws['sheets'][0]['file'])).convert('RGBA'); fw, fh = ws['frame']['w'], ws['frame']['h']
    first = sheet.crop((0, 0, fw, fh)); wb = first.getbbox()
    # the strip's top-left on the effect's canvas
    ox = ax + ws['offset']['x'] + wb[0] - sb[0]; oy = ay + ws['offset']['y'] + wb[1] - sb[1]
    layers = []
    for depth in ('behind', 'front'):
        c = clips.get(depth)
        if not c: continue
        s = c['sheets'][0]
        layers.append({'file': 'pack/' + s['file'], 'depth': depth, 'start': c['start_frame'], 'frames': c['frames'], 'cols': s['columns'], 'rows': s['rows'], 'fw': c['frame']['w'], 'fh': c['frame']['h'],
                       'dx': ax + c['offset']['x'] - ox - meta['cx'], 'dy': ay + c['offset']['y'] - oy - meta['foot']})
    out = {'anim': anim, 'fps': man['fps'], 'frames': man['frames'], 'layers': layers}
    json.dump(out, open(os.path.join(d, 'fx.json'), 'w'), indent=1); print(name, json.dumps(out))
if __name__ == '__main__': build(sys.argv[1], sys.argv[2])
