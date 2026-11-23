#!/usr/bin/env python3
# A weapon's approved strips into the hero's folder (docs/weapons-sheet.md, step 4). The strips come from a state of the
# hero (tools/pixellab-state.py, tools/pixellab-strips.py) and each begins with the standing picture: here the frames
# wanted are picked, held to the palette, and given the place of his feet so they line up with his other drawings.
# It adds to assets/side/<hero>/sprite.json and touches nothing else there (pixellab.py pull rewrites the whole folder).
#   python3 tools/weapon-strips.py hammer | tooth | clapper
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
  'hm_atk3': ('hm_atk3', range(1, 13)),                        # twelve, as the spade's great blow was: it lands on the eighth
  # its plunge (build 90): he rides the hammer down. Begun from the "in the air" drawing on a taller canvas, so it is
  # placed by hand: his boots are at row 80 and the shaft at column 54; he is drawn a little over where he is, the
  # stone head a little under
  'hm_plunge': ('hm_plunge3', range(4, 9), {'foot': 88, 'cx': 54.5}) },
 # the Wyrm's tooth (build 91; approved 23 Nov, its thrusts, its upward and its downward strike in their second round)
 'tooth': {
  'tt_idle': ('tt_idle', range(1, 9)), 'tt_run': ('tt_run', range(2, 9)), 'tt_air': ('tt_air', range(3, 9)), 'tt_land': ('tt_land', [4, 5, 6, 8, 1]),
  'tt_crouch': ('tt_crouch', range(1, 6)), 'tt_crouch_walk': ('tt_crouch_walk', range(4, 9)), 'tt_roll': ('tt_roll', range(1, 13)), 'tt_hurt': ('tt_hurt', range(1, 9)),
  'tt_atk1': ('tt_atk1b', range(2, 12)),          # ten: the thrust is out on the fifth
  'tt_atk2': ('tt_atk2c', range(1, 12)),          # eleven: out on the sixth
  'tt_atk3': ('tt_atk3b', range(1, 13)),          # twelve: the charge runs from the fifth to the eleventh
  'tt_up': ('tt_up2', range(1, 13)),              # twelve: up on the sixth
  # the dive: head first behind the spear. His body is drawn where he is; the spear reaches two and a half metres under him
  'tt_plunge': ('tt_down4', range(3, 9), {'foot': 70, 'cx': 50}) },
 # the Toll's clapper (build 92; approved 23 Nov, "Yeah, we're set. Plunge A")
 'clapper': {
  'cl_idle': ('cl_idle', range(1, 9)), 'cl_run': ('cl_run', range(2, 9)), 'cl_land': ('cl_land', range(3, 9)),
  'cl_crouch': ('cl_crouch', range(1, 6)), 'cl_crouch_walk': ('cl_crouch_walk', range(3, 9)), 'cl_roll': ('cl_roll', range(1, 13)), 'cl_hurt': ('cl_hurt', range(1, 9)),
  'cl_air': ('cl_jump', range(5, 13), {'foot': 56, 'cx': 40}),        # the jump that left the ground, from where his feet are off it
  'cl_atk1': ('cl_atk1', range(1, 13)),          # twelve: the head out at full length on the seventh
  'cl_atk2': ('cl_atk2', range(1, 13)),          # down in front on the sixth
  'cl_atk3': ('cl_atk3', range(1, 13)),          # the whirl, from the fourth to the tenth
  'cl_up': ('cl_up', range(1, 13)),              # straight up on the eighth
  'cl_plunge': ('cl_plunge', range(2, 9), {'foot': 80, 'cx': 45}) },   # A: the whirl over his head, then the chain cast straight down
 # the Thunderhead's storm bow (build 93; approved 23 Nov). The arrows are the game's own: where a strip paints one far
 # from him, that frame is left out
 'bow': {
  'bw_idle': ('bw_idle', range(1, 9)), 'bw_run': ('bw_run', range(2, 9)), 'bw_land': ('bw_land', range(3, 9)),
  'bw_crouch': ('bw_crouch', range(1, 7)), 'bw_crouch_walk': ('bw_crouch_walk', range(3, 9)), 'bw_roll': ('bw_roll', range(1, 13)), 'bw_hurt': ('bw_hurt', range(1, 9)),
  'bw_air': ('bw_jump', range(5, 13), {'foot': 61, 'cx': 44}),
  'bw_atk1': ('bw_atk1', range(1, 11)),          # ten: loosed on the last (the painted flash after it is left out: too big in play)
  'bw_atk2': ('bw_atk2b', range(1, 11)),         # ten: kneeling, loosed on the last
  'bw_atk3': ('bw_atk3', range(1, 11)),          # ten: the full draw, loosed on the last (its painted flash left out; the game makes its own)
  'bw_up': ('bw_up2', range(1, 10)),             # nine: the arrow aimed straight up, loosed on the eighth
  'bw_down': ('bw_down', range(0, 6), {'foot': 76, 'cx': 55}) },   # six, in the air: the bow turned down, loosed on the last
 # Mother Thorn's thorns (build 94; approved 23 Nov): the last of the six
 'thorns': {
  'th_idle': ('th_idle', range(1, 9)), 'th_run': ('th_run', range(2, 9)), 'th_land': ('th_land', range(3, 9)),
  'th_crouch': ('th_crouch', range(1, 9)), 'th_crouch_walk': ('th_crouch_walk', range(3, 9)), 'th_roll': ('th_roll', range(1, 13)), 'th_hurt': ('th_hurt', range(1, 9)),
  'th_air': ('th_jump', range(5, 13), {'foot': 62, 'cx': 36}),
  'th_atk1': ('th_atk1', range(1, 13)),          # two cuts: the second and the sixth
  'th_atk2': ('th_atk2', range(1, 13)),          # two cuts: the fourth and the sixth
  'th_atk3': ('th_atk3', range(1, 13)),          # the burst: the flurry, then both blades thrust on the eighth
  'th_up': ('th_up', range(2, 13)),              # eleven: both blades up over him on the fifth
  'th_plunge': ('th_plunge4', range(4, 9), {'foot': 122, 'cx': 52}) }}   # the fourth try: upright, both points down by his boots
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
    made = json.load(open(os.path.join(src, 'frames.json')))['frames'] if os.path.exists(os.path.join(src, 'frames.json')) else {}
    for name, (strip, keep, *more) in SETS[which].items():
        im = Image.open(os.path.join(src, strip + '.png')).convert('RGBA'); h = im.height; n = made.get(strip) or im.width // h; w = im.width // n   # (a strip begun from a picture of its own has that picture's canvas, not a square one)
        fr = [snap(im.crop((i * w, 0, i * w + w, h))) for i in range(n)]; foot, cx = feet(fr[0])
        if more: foot, cx = more[0].get('foot', foot), more[0].get('cx', cx)   # the standing picture every strip begins with: where he stands on its canvas (a roll leaves that place and comes back to it)
        out = Image.new('RGBA', (w * len(keep), h))
        for k, i in enumerate(keep): out.paste(fr[i], (k * w, 0))
        out.save(os.path.join(HERO, name + '.png'))
        meta['anims'][name] = {'frames': len(keep), 'w': w, 'h': h, 'foot': foot, 'cx': cx, 'footLast': foot, 'cxLast': cx}
        if os.path.exists(os.path.join(HERO, name + '_n.png')): meta['anims'][name]['n'] = 1
        print(name, len(keep), 'frames', 'foot', foot, 'cx', cx)
    json.dump(meta, open(sp, 'w'), indent=1)
if __name__ == '__main__': main(sys.argv[1] if len(sys.argv) > 1 else 'hammer')
