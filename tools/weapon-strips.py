#!/usr/bin/env python3
# A weapon's approved strips into the hero's folder (docs/weapons-sheet.md, step 4). The strips come from a state of the
# hero (tools/pixellab-state.py, tools/pixellab-strips.py) and each begins with the standing picture: here the frames
# wanted are picked, held to the palette, and given the place of his feet so they line up with his other drawings.
# It adds to assets/side/<hero>/sprite.json and touches nothing else there (pixellab.py pull rewrites the whole folder).
#   python3 tools/weapon-strips.py hammer
import json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
HERO = os.path.join(ROOT, 'assets', 'side', 'mask_tall_c'); PAL = json.load(open(os.path.join(ROOT, 'assets', 'side', 'palette.json')))['colors']
# name in the game: (strip made, the frames of it kept, in order)
SETS = {'hammer': {
  'hm_idle': ('hm_idle', range(1, 9)), 'hm_run': ('hm_run', range(2, 9)), 'hm_air': ('hm_air', range(4, 9)), 'hm_land': ('hm_land', [4, 5, 6, 7, 8, 1]),
  'hm_crouch': ('hm_crouch', range(1, 6)), 'hm_crouch_walk': ('hm_crouch_walk', range(4, 9)), 'hm_roll': ('hm_roll', range(1, 13)), 'hm_hurt': ('hm_hurt', range(1, 9)),
  'hm_atk1': ('hm_atk1b', range(2, 10)),                       # the second try (his word, 23 Nov): the blow lands on its seventh frame kept
  'hm_atk2': ('hm_atk2b', [2, 4, 6, 8, 9, 10, 11, 12]),        # the long crouch thinned: it lands on the fifth
  'hm_atk3': ('hm_atk3', range(1, 13)) }}                      # twelve, as the spade's great blow was: it lands on the eighth
def snap(im):
    pal = [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in PAL]; px = im.load(); cache = {}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 128: px[x, y] = (0, 0, 0, 0); continue
            k = (r, g, b)
            if k not in cache: cache[k] = min(pal, key=lambda p: (p[0] - r) ** 2 * 3 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 2)
            px[x, y] = cache[k] + (255,)
    return im
def feet(f):
    """his boots in a frame: the row under them, and the middle of what is painted in the three rows over that"""
    px = f.load(); rows = [y for y in range(f.height) if any(px[x, y][3] > 40 for x in range(f.width))]; bot = rows[-1]
    cols = [x for x in range(f.width) if any(px[x, y][3] > 40 for y in range(bot - 2, bot + 1))]
    return bot + 1, (cols[0] + cols[-1] + 1) / 2
def main(which):
    src = os.path.join(ROOT, 'docs', 'weapons', which); sp = os.path.join(HERO, 'sprite.json'); meta = json.load(open(sp))
    for name, (strip, keep) in SETS[which].items():
        im = Image.open(os.path.join(src, strip + '.png')).convert('RGBA'); h = im.height; w = h; n = im.width // w
        fr = [snap(im.crop((i * w, 0, i * w + w, h))) for i in range(n)]; foot, cx = feet(fr[0])   # the standing picture every strip begins with: where he stands on its canvas (a roll leaves that place and comes back to it)
        out = Image.new('RGBA', (w * len(keep), h))
        for k, i in enumerate(keep): out.paste(fr[i], (k * w, 0))
        out.save(os.path.join(HERO, name + '.png'))
        meta['anims'][name] = {'frames': len(keep), 'w': w, 'h': h, 'foot': foot, 'cx': cx, 'footLast': foot, 'cxLast': cx}
        if os.path.exists(os.path.join(HERO, name + '_n.png')): meta['anims'][name]['n'] = 1
        print(name, len(keep), 'frames', 'foot', foot, 'cx', cx)
    json.dump(meta, open(sp, 'w'), indent=1)
if __name__ == '__main__': main(sys.argv[1] if len(sys.argv) > 1 else 'hammer')
