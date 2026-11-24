#!/usr/bin/env python3
# The edge climb with a weapon on his back (build 96; agreed 22 Nov: where both hands are busy, the weapon is on his back).
# As tools/compose-climb.py makes climb_own from his sword drawings, this makes one for each weapon from the strips of him
# with it slung (docs/weapons/back/<weapon>/: bk_jump, his arms up for the edge; bk_land, the crouch he comes over into).
# The last frame is the standing picture every strip begins with. Each frame gets its corner (where his hands, then his
# feet, sit on the ledge's corner) and depth, as climb_own's do. Also cuts his getting up and his taking a gift.
#   python3 tools/compose-climb-back.py blade spade clapper tooth bow thorns
import os, sys, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
D = os.path.join(ROOT, 'assets', 'side', 'mask_tall_c'); SRC = os.path.join(ROOT, 'docs', 'weapons', 'back')
PAL = json.load(open(os.path.join(ROOT, 'assets', 'side', 'palette.json')))['colors']
STAND = 7
# which frames of bk_jump are the hang, the pull, the haul and the coming over; of bk_land the crouch (the standing
# picture, frame 0 of bk_jump, ends it). Chosen by looking at the strips (docs/weapon-back-set.png)
# (the jumps' later frames turn him to face us, arms spread: only the side-on reach is used; he comes over into the
# landing's crouch. The getting-up strips begin kneeling, not lying, and some end facing us: the kneel and the rise)
JUMP = {'hang': 4, 'pull': 4, 'haul': 3}; OVER = 3; LAND = [5, 7]
GETUP = range(3, 8); RECEIVE = range(1, 13)
def snap(im):
    pal = [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in PAL]; px = im.load(); cache = {}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 128: px[x, y] = (0, 0, 0, 0); continue
            if (r, g, b) not in cache: cache[(r, g, b)] = min(pal, key=lambda p: (p[0] - r) ** 2 * 3 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 2)
            px[x, y] = cache[(r, g, b)] + (255,)
    return im
def frames(path):
    im = Image.open(path).convert('RGBA'); h = im.height; n = im.width // h; return [snap(im.crop((i * h, 0, i * h + h, h))) for i in range(n)]
def feet(f):
    px = f.load(); rows = [y for y in range(f.height) if any(px[x, y][3] > 40 for x in range(f.width))]; bot = rows[-1]
    cols = [x for x in range(f.width) if any(px[x, y][3] > 40 for y in range(bot - 2, bot + 1))]; return bot + 1, (cols[0] + cols[-1] + 1) / 2
def main(ids):
    sp = os.path.join(D, 'sprite.json'); meta = json.load(open(sp)); A = meta['anims']
    for wid in ids:
        src = os.path.join(SRC, wid); J = frames(os.path.join(src, 'bk_jump.png')); Ld = frames(os.path.join(src, 'bk_land.png'))
        W = H = J[0].width; foot0, cx0 = feet(J[0])
        seq = [(J[JUMP['hang']], 'hang'), (J[JUMP['pull']], 'pull'), (J[JUMP['haul']], 'haul'), (Ld[OVER], 'over')] + [(Ld[i], 'up') for i in LAND] + [(J[0], 'up')]
        strip = Image.new('RGBA', (W * len(seq), H)); corner, depth = {}, {}
        for k, (fr, role) in enumerate(seq):
            strip.paste(fr, (k * W, 0)); px = fr.load(); solid = lambda x, y: px[x, y][3] > 120
            x0, y0, x1, y1 = fr.getbbox(); foot = y1 - 1
            if role in ('hang', 'pull'):
                # his reaching hand: the foremost painted pixel in the top of him (not the highest one: a bow's tip, a
                # hammer's head stand above his hands on his back)
                top = next(y for y in range(H) if any(solid(x, y) for x in range(W))); band = [(x, y) for y in range(top, min(H, top + 14)) for x in range(W) if solid(x, y)]
                tx, hy = max(band); cy = hy + 1 + (6 if role == 'pull' else 0); corner[k] = [tx, cy]; depth[k] = foot - cy
            elif role in ('haul', 'over'):
                cy = y0 + round((y1 - y0) * (0.4 if role == 'haul' else 0.62)); fx = max(x for x in range(W) if solid(x, cy)); corner[k] = [fx, cy]; depth[k] = max(0, foot - cy)
            else:
                f2, c2 = feet(fr); corner[k] = [round(c2 - STAND), f2 - 1]; depth[k] = 0
        # he only rises: a frame is never held deeper under the ledge than the one before it (the haul is a different
        # drawing from the hang and can sit lower; it is drawn a little higher instead)
        for k in range(1, len(seq)):
            if depth[k] > depth[k - 1] - 2 and depth[k - 1] > 0: d2 = max(0, depth[k - 1] - 2); corner[k][1] += depth[k] - d2; depth[k] = d2
        name = 'bk_' + wid + '_'; strip.save(os.path.join(D, name + 'climb.png')); last = len(seq) - 1
        A[name + 'climb'] = {'frames': len(seq), 'w': W, 'h': H, 'foot': corner[last][1] + 1, 'cx': corner[last][0] + STAND, 'footLast': corner[last][1] + 1, 'cxLast': corner[last][0] + STAND, 'climb': {'first': 0, 'corner': corner, 'depth': depth}}
        for anim, keep in (('getup', GETUP), ('receive', RECEIVE)):
            F = frames(os.path.join(src, 'bk_' + anim + '.png')); w = F[0].width; f0, c0 = feet(F[0]); keep = [i for i in keep if i < len(F)]
            out = Image.new('RGBA', (w * len(keep), w)); [out.paste(F[i], (k * w, 0)) for k, i in enumerate(keep)]; out.save(os.path.join(D, name + anim + '.png'))
            A[name + anim] = {'frames': len(keep), 'w': w, 'h': w, 'foot': f0, 'cx': c0, 'footLast': f0, 'cxLast': c0}
        for a in ('climb', 'getup', 'receive'):
            if os.path.exists(os.path.join(D, name + a + '_n.png')): A[name + a]['n'] = 1
        print(wid, 'climb', len(seq), 'frames; corner', corner)
    json.dump(meta, open(sp, 'w'), indent=1)
if __name__ == '__main__': main(sys.argv[1:] or ['blade', 'spade', 'clapper', 'tooth', 'bow', 'thorns'])
