#!/usr/bin/env python3
# Take the shot out of a spitting creature's drawing. PixelLab drew the glob into the 'charge' animation, flying out of
# the mouth, and it is cut off where the frame ends: in the game that showed as a hard straight edge (a playtest). The
# game draws its own glob from the mouth (enemies.js shoot), so the drawing keeps only the creature: in every frame,
# what lies outside the creature's own outline at rest (its 'stand' frame, two pixels wider), and any loose piece (not
# joined to the body), is cleared. The light map (_n) is cleared the same, so the two stay one.
#   python3 tools/clip-shots.py px_barn_a px_barn_b px_barn_c px_toad_b
import sys, os, json
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'side')

def body(img, fw, f):
    """the pixels of frame f joined to its largest opaque piece"""
    px = img.load(); H = img.height; seen = set(); best = set()
    for y in range(H):
        for x in range(fw):
            if (x, y) in seen or px[f * fw + x, y][3] <= 40: continue
            comp, stack = set(), [(x, y)]; seen.add((x, y))
            while stack:
                a, b = stack.pop(); comp.add((a, b))
                for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    c, d = a + da, b + db
                    if 0 <= c < fw and 0 <= d < H and (c, d) not in seen and px[f * fw + c, d][3] > 40:
                        seen.add((c, d)); stack.append((c, d))
            if len(comp) > len(best): best = comp
    return best

def clip(name, anim='charge'):
    d = os.path.join(ROOT, name); meta = json.load(open(os.path.join(d, 'sprite.json')))
    st = Image.open(os.path.join(d, 'stand.png')).convert('RGBA'); x0, y0, x1, y1 = st.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    x0, y0, x1, y1 = x0 - 2, y0 - 2, x1 + 2, y1 + 2   # the outline at rest, a little wider
    A = meta['anims'][anim]; fw = A['w']; img = Image.open(os.path.join(d, anim + '.png')).convert('RGBA')
    nm = os.path.join(d, anim + '_n.png'); nimg = Image.open(nm).convert('RGBA') if os.path.exists(nm) else None
    px = img.load(); npx = nimg.load() if nimg else None; cleared = 0
    for f in range(A['frames']):
        keep = body(img, fw, f)
        for y in range(img.height):
            for x in range(fw):
                if px[f * fw + x, y][3] <= 40: continue
                if (x, y) in keep and x0 <= x < x1 and y0 <= y < y1: continue
                px[f * fw + x, y] = (0, 0, 0, 0); cleared += 1
                if npx: npx[f * fw + x, y] = (0, 0, 0, 0)
    img.save(os.path.join(d, anim + '.png'))
    if nimg: nimg.save(nm)
    print(name, anim, 'cleared', cleared, 'pixels')

for n in sys.argv[1:]: clip(n)
