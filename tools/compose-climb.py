#!/usr/bin/env python3
# The ledge climb, made from his own drawings so it is always him (the drawn climbs turned him away from us mid-climb):
# he reaches up from his jump (arms up, gripping the edge), is drawn a little higher as he hauls, gets his knees up, comes
# over into the crouch of his landing, and rises to his idle. Written as one strip, assets/side/mask_tall_c/climb_own.png
# (and its normal map, from theirs), and its entry in sprite.json, which carries the climb's table: for each frame the
# column and row of its canvas that sit on the ledge's corner (his hands while he hangs, his feet once he is up) and how
# far under the ledge his feet are (main.js starts the climb at the frame that fits how far under it he caught it).
#   python3 tools/compose-climb.py [sheet out.png]
import os, sys, json
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'side', 'mask_tall_c')
meta = json.load(open(os.path.join(D, 'sprite.json'))); A = meta['anims']
STAND = 7   # pixels from the ledge's corner to his middle once he is up (the motor puts him 0.42 of a unit past it)
# (strip, frame, what he is doing): hang = held by his hands; pull = his hands at the corner, drawn higher; haul = his
# chest at the corner; up = standing on the ledge
SEQ = [('jump', 3, 'hang'), ('jump', 3, 'pull'), ('jump', 4, 'haul'), ('jump', 5, 'over'), ('land_px', 3, 'up'), ('land_px', 5, 'up'), ('land_px', 7, 'up'), ('idle', 0, 'up')]
W = H = 64
def frame(name, i, suffix=''):
    a = A[name]; im = Image.open(os.path.join(D, name + suffix + '.png')).convert('RGBA')
    fr = im.crop((i * a['w'], 0, (i + 1) * a['w'], a['h'])); out = Image.new('RGBA', (W, H)); ox, oy = (W - a['w']) // 2, H - a['h']
    out.paste(fr, (ox, oy)); return out, ox, oy
strip, nstrip, corner, depth = Image.new('RGBA', (W * len(SEQ), H)), Image.new('RGBA', (W * len(SEQ), H)), {}, {}
for k, (name, i, role) in enumerate(SEQ):
    fr, ox, oy = frame(name, i); nf, _, _ = frame(name, i, '_n'); strip.paste(fr, (k * W, 0)); nstrip.paste(nf, (k * W, 0))
    px = fr.load(); solid = lambda x, y: px[x, y][3] > 120
    x0, y0, x1, y1 = fr.getbbox(); foot = y1 - 1
    if role in ('hang', 'pull'):
        top = next(y for y in range(H) if any(solid(x, y) for x in range(W))); tx = max(x for x in range(W) if solid(x, top))
        cy = top + 1 + (6 if role == 'pull' else 0); corner[k] = [tx, cy]; depth[k] = foot - cy
    elif role in ('haul', 'over'):
        cy = y0 + round((y1 - y0) * (0.4 if role == 'haul' else 0.62)); fx = max(x for x in range(W) if solid(x, cy)); corner[k] = [fx, cy]; depth[k] = max(0, foot - cy)
    else:
        corner[k] = [round(A[name]['cx'] + ox - STAND), foot]; depth[k] = 0
strip.save(os.path.join(D, 'climb_own.png')); nstrip.save(os.path.join(D, 'climb_own_n.png'))
last = len(SEQ) - 1
A['climb_own'] = {'frames': len(SEQ), 'w': W, 'h': H, 'foot': corner[last][1] + 1, 'cx': corner[last][0] + STAND, 'footLast': corner[last][1] + 1, 'cxLast': corner[last][0] + STAND, 'n': 1,
                  'climb': {'first': 0, 'corner': corner, 'depth': depth}}
json.dump(meta, open(os.path.join(D, 'sprite.json'), 'w'), indent=1)
print('climb_own', len(SEQ), 'frames; corner', corner, 'depth', depth)
if len(sys.argv) > 2 and sys.argv[1] == 'sheet':   # each frame with its corner marked, and a ledge drawn there
    sh = Image.new('RGBA', (strip.width, H + 8), (38, 43, 68, 255)); sh.paste(strip, (0, 4), strip); p = sh.load()
    for k, (cx, cy) in corner.items():
        for x in range(cx, min(cx + 24, sh.width - k * W)): p[k * W + x, cy + 4] = (255, 220, 120, 255)
        for y in range(cy, min(cy + 16, H)): p[k * W + cx, y + 4] = (255, 220, 120, 255)
    sh.resize((sh.width * 3, sh.height * 3), Image.NEAREST).save(sys.argv[2])
