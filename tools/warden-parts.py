#!/usr/bin/env python3
"""The Warden's body, in pieces (assets/side/warden/*16.png), at the game's pixel scale and on its palette. The arms
were PixelLab's (stacked stone, moss, glowing seams) and are the look the rest is held to. PixelLab will not draw a
slab flat on, so the slabs (chest, neck, the two blocks of its waist) are painted here by rule in that look: a
silhouette cut into courses of big blocks, each lit from above, moss on what faces up, runes in the seams. The head,
the shoulder and the crystals on its back are PixelLab's, brought down to scale; the head is cut in two at the jaw so
it can open. Run: python3 tools/warden-parts.py   (then tools/warden-parts.py sheet out.png to look at them together)"""
import os, random, sys, math
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'side', 'warden')
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
P = {k: H(v) for k, v in dict(ink='#181425', deep='#262b44', dark='#3a4466', mid='#5a6988', light='#8b9bb4', pale='#c0cbdc', white='#ffffff',
     moss0='#265c42', moss1='#3e8948', moss2='#63c74d', teal='#193c3e', navy='#124e89', blue='#0099db', cyan='#2ce8f5').items()}
ENDESGA = [H(c) for c in '#be4a2f #d77643 #ead4aa #e4a672 #b86f50 #733e39 #3e2731 #a22633 #e43b44 #f77622 #feae34 #fee761 #63c74d #3e8948 #265c42 #193c3e #124e89 #0099db #2ce8f5 #ffffff #c0cbdc #8b9bb4 #5a6988 #3a4466 #262b44 #181425 #ff0044 #68386c #b55088 #f6757a #e8b796 #c28569'.split()]
RAMP = [P['deep'], P['dark'], P['mid'], P['light'], P['pale']]

def poly(points):
    def inside(x, y):
        x += 0.5; y += 0.5; n = False
        for i in range(len(points)):
            (x0, y0), (x1, y1) = points[i], points[(i + 1) % len(points)]
            if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0): n = not n
        return n
    return inside

def slab(w, h, inside, seed, row=10, brick=(14, 22), rune=None, core=None, moss=0.6, ring=0):
    """a piece of stacked stone: courses `row` high of blocks `brick` long; rune(x, y) says which seams glow"""
    R = random.Random(seed); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); px = im.load()
    M = [[inside(x, y) for x in range(w)] for y in range(h)]
    inm = lambda x, y: 0 <= x < w and 0 <= y < h and M[y][x]
    # the courses: where each starts, and in each the blocks' starts and tones
    rows = []; y = -R.randint(0, 3)
    while y < h:
        rh = row + R.randint(-1, 2); xs = []; x = -R.randint(0, brick[0])
        while x < w: bw = R.randint(*brick); xs.append((x, x + bw, R.choice([1, 2, 2, 2, 2, 1, 2]))); x += bw
        rows.append((y, y + rh, xs)); y += rh
    if core:   # a seam straight through the core, up and down and across, so its runes have a line to follow
        cx, cy, cr = core
    def block(x, y):
        for (y0, y1, xs) in rows:
            if y0 <= y < y1:
                for (x0, x1, tone) in xs:
                    if x0 <= x < x1: return x0, y0, x1, y1, tone
        return 0, 0, w, h, 2
    for y in range(h):
        for x in range(w):
            if not M[y][x]: continue
            x0, y0, x1, y1, tone = block(x, y)
            edge = not (inm(x - 1, y) and inm(x + 1, y) and inm(x, y - 1) and inm(x, y + 1))
            seam = x == x0 or y == y0
            if core and (abs(x - cx) < 1 or abs(y - cy) < 1): seam = True
            if edge: c = P['ink']
            elif seam:
                c = P['deep']
                if rune and rune(x, y): c = P['cyan'] if (x + y) % 5 else P['white']
            else:
                c = RAMP[tone]
                if y == y0 + 1 or not inm(x, y - 2): c = RAMP[tone + 1]                    # lit from above
                elif y == y1 - 1 or x == x1 - 1: c = RAMP[tone - 1]                          # its own shadow
                elif x == x0 + 1 and y < y1 - 2: c = RAMP[tone + 1] if tone == 1 else RAMP[tone]
                # a rune's glow on the stone beside it
                if rune and c != P['ink'] and any(rune(x + a, y + b) and (x + a == block(x + a, y + b)[0] or y + b == block(x + a, y + b)[1] or (core and (abs(x + a - cx) < 1 or abs(y + b - cy) < 1))) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): c = P['blue']
                if R.random() < 0.012: c = RAMP[max(0, tone - 1)]                            # a chip
            px[x, y] = c + (255,)
    # moss on what faces up: clumps along the top edge and on a few courses, a drip here and there
    for x in range(w):
        top = next((y for y in range(h) if M[y][x]), None)
        if top is None: continue
        n = math.sin(x * 0.31 + seed) + math.sin(x * 0.13 + seed * 2.1)
        if n > 1.2 - moss * 1.6:
            d = 2 + int((n + 2) * 0.8) + R.randint(0, 1)
            for k in range(1, d):
                if inm(x, top + k) and inm(x, top + k + 1): px[x, top + k] = (P['moss2'] if k == 1 else P['moss1'] if k < d - 1 else P['moss0']) + (255,)
            if R.random() < 0.18:
                for k in range(d, d + R.randint(2, 6)):
                    if inm(x, top + k + 1): px[x, top + k] = P['moss0'] + (255,)
    if core:
        # the socket: a ring of rune light, the dark of the socket, and the crystal in it
        for y in range(h):
            for x in range(w):
                d = math.hypot(x - cx + 0.5, y - cy + 0.5)
                if not inm(x, y): continue
                if ring and abs(d - ring) < 0.8: px[x, y] = (P['cyan'] if (x * 3 + y) % 4 else P['white']) + (255,)
                elif ring and abs(d - ring) < 1.8 and px[x, y][:3] != P['ink']: px[x, y] = P['blue'] + (255,)
                if d < cr + 3: px[x, y] = (P['ink'] if d > cr + 1.5 else P['teal']) + (255,)
                m = abs(x - cx + 0.5) + abs(y - cy + 0.5) * 0.8
                if m < cr: px[x, y] = (P['white'] if m < cr * 0.3 and x < cx else P['cyan'] if m < cr * 0.62 else P['blue'] if m < cr - 1 else P['navy']) + (255,)
    return im

def snap(im, scale):
    """PixelLab's picture brought down to the game's scale and held to the palette"""
    im = im.convert('RGBA'); im = im.resize((im.width // scale, im.height // scale), Image.NEAREST); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 128: px[x, y] = (0, 0, 0, 0); continue
            px[x, y] = min(ENDESGA, key=lambda p: (p[0] - r) ** 2 * 3 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 2) + (255,)
    return im

def build():
    out = lambda name, im: (im.save(os.path.join(ROOT, name + '16.png')), print(name + '16.png', im.size))
    cx, cy = 58, 36
    chest = slab(116, 78, poly([(12, 2), (104, 2), (115, 20), (112, 34), (92, 76), (24, 76), (4, 34), (1, 20)]), 7, row=11, brick=(15, 24), core=(cx, cy, 9), ring=15,
                 rune=lambda x, y: (abs(x - cx) < 1 and 16 < abs(y - cy) < 34) or (abs(y - cy) < 1 and 16 < abs(x - cx) < 44))
    out('chest', chest)
    out('neck', slab(30, 18, poly([(4, 0), (26, 0), (30, 6), (27, 18), (3, 18), (0, 6)]), 3, row=8, brick=(9, 13), moss=0.2))
    out('belly1', slab(74, 26, poly([(10, 0), (64, 0), (74, 9), (64, 26), (10, 26), (0, 9)]), 11, row=9, brick=(13, 20), moss=0.35, rune=lambda x, y: 11 <= y <= 13 and 14 < x < 60))
    out('belly2', slab(56, 24, poly([(8, 0), (48, 0), (56, 8), (46, 24), (10, 24), (0, 8)]), 19, row=9, brick=(12, 18), moss=0.3, rune=lambda x, y: 10 <= y <= 12 and 12 < x < 44))
    head = snap(Image.open(os.path.join(ROOT, 'head_d.png')), 2); JAW = 46
    top = head.copy(); top.paste((0, 0, 0, 0), (0, JAW, 64, 64)); out('head', top)
    jaw = head.copy(); jaw.paste((0, 0, 0, 0), (0, 0, 64, JAW)); out('jaw', jaw)
    out('shoulder', snap(Image.open(os.path.join(ROOT, 'shoulder.png')), 4))
    cr = snap(Image.open(os.path.join(ROOT, 'crown.png')), 2); px = cr.load()   # the crystals without the earth they grew in
    keep = {P[k] for k in ('ink', 'deep', 'dark', 'navy', 'blue', 'cyan', 'white', 'pale', 'light', 'teal', 'moss0', 'moss1', 'moss2')}
    for y in range(cr.height):
        for x in range(cr.width):
            if px[x, y][3] and (px[x, y][:3] not in keep or y > 30): px[x, y] = (0, 0, 0, 0)
    out('crystals', cr)

def sheet(path):
    """the pieces put together as the game does, to look at"""
    g = lambda n: Image.open(os.path.join(ROOT, n + '16.png')).convert('RGBA')
    arm = lambda n: Image.open(os.path.join(ROOT, '..', 'colossus', n + '16.png')).convert('RGBA')
    W, Hh = 260, 230; im = Image.new('RGBA', (W, Hh), P['ink'] + (255,)); mid = W // 2
    def put(p, cx, cy, flip=False, rot=0):
        if flip: p = p.transpose(Image.FLIP_LEFT_RIGHT)
        if rot: p = p.rotate(rot, Image.NEAREST, expand=True)
        im.alpha_composite(p, (int(cx - p.width / 2), int(cy - p.height / 2)))
    cy = 120
    put(g('crystals'), mid - 44, cy - 52, rot=22); put(g('crystals'), mid + 44, cy - 52, True, -22)
    put(g('belly2'), mid, cy + 70); put(g('belly1'), mid, cy + 48); put(g('chest'), mid, cy); put(g('neck'), mid, cy - 42)
    put(g('jaw'), mid, cy - 71); put(g('head'), mid, cy - 71)
    for s in (-1, 1):
        put(arm('upperarm'), mid + s * 84, cy + 20, s > 0, s * -20); put(arm('forearm'), mid + s * 104, cy + 80, s > 0); put(arm('fist'), mid + s * 104, cy + 96, s > 0)
        put(g('shoulder'), mid + s * 68, cy - 22, s > 0)
    im.resize((W * 4, Hh * 4), Image.NEAREST).save(path); print('wrote', path)

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'sheet': sheet(sys.argv[2])
    else: build()
