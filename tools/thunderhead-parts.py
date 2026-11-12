#!/usr/bin/env python3
"""The Thunderhead's pieces (assets/side/thunderhead/*.png), painted by rule at the game's pixel scale on its palette, the
way the other keepers' are (tools/boss-parts.py): a puppet of flat pieces that src/side/thunderhead.js puts together.
  puff_a, puff_b, puff_c   the storm itself: heavy lumps of cloud, three sizes
  mask                      its face: a pale mask with a crown of tines, slanted eyes cut through, a barred mouth
  core                      its heart: a ball of lightning
  rod                       a lightning rod of the old works: an iron mast, copper coils, a forked head
Run: python3 tools/thunderhead-parts.py   (then: python3 tools/thunderhead-parts.py sheet out.png)"""
import os, sys, math, random
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'side')
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
P = {k: H(v) for k, v in dict(ink='#181425', deep='#262b44', dark='#3a4466', mid='#5a6988', light='#8b9bb4', pale='#c0cbdc', white='#ffffff',
     navy='#124e89', blue='#0099db', cyan='#2ce8f5', plum='#68386c', wood0='#3e2731', wood1='#733e39', wood2='#b86f50',
     fire0='#be4a2f', rust='#d77643', fire1='#f77622', fire2='#feae34', fire3='#fee761', bone='#ead4aa').items()}
CLEAR = (0, 0, 0, 0)
B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
dith = lambda x, y: B4[(y & 3) * 4 + (x & 3)] / 16 - 0.5
def outline(im, col=None):
    col = col or P['ink']; px = im.load(); w, h = im.size; edge = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3]: continue
            if any(0 <= x + a < w and 0 <= y + b < h and px[x + a, y + b][3] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): edge.append((x, y))
    for x, y in edge: px[x, y] = col
    return im
def save(name, im):
    d = os.path.join(ROOT, 'thunderhead'); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name + '.png')); print('thunderhead/' + name + '.png', im.size)

# ---- cloud: balls along a sagging line, lit from the upper left, flat and dark underneath
def puff(w, h, n, seed):
    R = random.Random(seed); im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    balls = []
    for k in range(n):                                               # the body: big lumps along a line that sags in the middle
        t = (k + 0.5) / n; r = h * (0.27 + 0.10 * math.sin(t * math.pi)) * (0.9 + R.random() * 0.25)
        balls.append((r + 3 + t * (w - 2 * r - 6), h * 0.56 + (R.random() - 0.5) * h * 0.08, r))
    for k in range(n + 1):                                           # heads of cloud boiling up along its top
        t = k / n; r = h * 0.17 * (0.8 + R.random() * 0.6)
        balls.append((r + 4 + t * (w - 2 * r - 8), h * 0.30 - math.sin(t * math.pi) * h * 0.08 + (R.random() - 0.5) * 3, r))
    for k in range(n):                                               # bellies hanging under
        t = (k + 0.5) / n; r = h * 0.14 * (0.8 + R.random() * 0.5)
        balls.append((r + 6 + t * (w - 2 * r - 12) + (R.random() - 0.5) * 6, h * 0.80 + (R.random() - 0.5) * 3, r))
    ramp = [P['ink'], P['deep'], P['deep'], P['dark'], P['mid'], P['light']]
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            best = None
            for (cx, cy, r) in balls:
                dx, dy = (x + 0.5 - cx) / r, (y + 0.5 - cy) / r; d = dx * dx + dy * dy
                if d < 1:
                    z = math.sqrt(1 - d)
                    if best is None or z * r + (h - cy) * 0.15 > best[0]: best = (z * r + (h - cy) * 0.15, dx, dy, z, cy)
            if best is None: continue
            _, dx, dy, z, cy = best
            lit = -dx * 0.6 - dy * 0.8                                   # lit from the upper left: a bright crescent on each lump
            k = 1.9 + lit * 2.6 + (0.9 if lit > 0.55 and z < 0.75 else 0) - (1.2 if z < 0.28 and lit < 0.2 else 0) - max(0, (y / h) - 0.55) * 3.2 + dith(x, y) * 0.8
            px[x, y] = ramp[max(0, min(5, int(round(k))))]
    return outline(im)

# ---- the mask
def mask():
    w, h = 92, 84; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2
    top = 20                                                         # the brow line: the crown's tines stand over it
    def half(t):                                                     # half its width down the face, t 0 at the brow to 1 at the chin
        if t < 0.12: return 30 + 8 * (t / 0.12)
        if t < 0.5: return 38 - 4 * ((t - 0.12) / 0.38)
        return 34 * (1 - ((t - 0.5) / 0.5) ** 1.5) + 1.5
    ramp = [P['mid'], P['light'], P['pale'], P['pale'], P['white']]
    for y in range(top, h - 1):
        t = (y - top) / (h - 2 - top); hw = half(t)
        for x in range(w):
            u = (x + 0.5 - cx) / hw
            if abs(u) > 1: continue
            k = 2.9 - abs(u + 0.35) * 1.9 - (0.9 if u > 0.62 else 0) - t * 0.5 + dith(x, y) * 0.5
            px[x, y] = ramp[max(0, min(4, int(round(k))))]
    # the crown: five tines like forked lightning, the middle one tallest, tipped with gold
    for k, (dx, hh, lean) in enumerate(((-26, 12, -4), (-13, 16, -2), (0, 20, 0), (13, 16, 2), (26, 12, 4))):
        for j in range(hh):
            f = j / hh; hw2 = max(0.6, 4.2 * (1 - f)); xx = cx + dx + lean * f + (1.5 if 0.35 < f < 0.6 else 0) * (1 if k % 2 else -1)
            for x in range(int(xx - hw2), int(xx + hw2) + 1):
                if 0 <= x < w: px[x, top - j] = P['fire3'] if f > 0.72 else P['fire2'] if f > 0.55 else (P['pale'] if x < xx else P['light'])
    # the brow: a heavy ridge, in shadow underneath
    for x in range(w):
        u = (x + 0.5 - cx) / 38
        if abs(u) > 1: continue
        yb = top + 9 + abs(u) * 3 - (3 if abs(u) < 0.12 else 0)
        for y in range(int(yb), int(yb) + 2):
            if px[x, y][3]: px[x, y] = P['mid']
        if px[x, int(yb) - 1][3]: px[x, int(yb) - 1] = P['white'] if u < 0.3 else P['pale']
    # the eyes: slanted, cut through to the dark
    def eye(ex, ey, s):
        for b in range(-8, 9):
            for a in range(-13, 14):
                if abs(a) / 13 + abs(b + s * a * 0.42) / 6.4 < 1:
                    x, y = int(ex + a), int(ey + b)
                    if px[x, y][3]: px[x, y] = P['ink']
        for a in range(-13, 14):                                   # a lid of shadow over it
            x, y = int(ex + a), int(ey - 7 - s * a * 0.42)
            if px[x, y][3] and px[x, y] != P['ink']: px[x, y] = P['mid']
    eye(cx - 18, top + 23, -1); eye(cx + 18, top + 23, 1)
    # the nose: a ridge, lit on its left
    for y in range(top + 12, top + 36):
        px[int(cx) - 1, y] = P['white']; px[int(cx), y] = P['pale']; px[int(cx) + 1, y] = P['mid']
    for a in (-3, -2, 2, 3): px[int(cx) + a, top + 36] = P['mid']
    # lines cut in the cheeks
    for s in (-1, 1):
        for j in range(14):
            for off in (0, 6):
                x, y = int(cx + s * (22 + off + j * 0.45)), top + 31 + j
                if px[x, y][3] and px[x, y] != P['ink']: px[x, y] = P['mid']
    # the mouth: a barred slot, turned down at its ends
    for a in range(-17, 18):
        y0 = top + 43 + int(abs(a) * 0.22)
        for y in range(y0, y0 + 7 - int(abs(a) * 0.1)):
            x = int(cx + a)
            if px[x, y][3]: px[x, y] = P['ink'] if a % 4 else P['light']
        x = int(cx + a)
        if px[x, y0 - 1][3]: px[x, y0 - 1] = P['mid']
    # a crack down from the crown through the left eye, and a rune of blue set in the brow
    x, y = cx - 22, top + 2
    for j in range(30):
        if px[int(x), int(y)][3] and px[int(x), int(y)] != P['ink']: px[int(x), int(y)] = P['dark']
        y += 1; x += (1 if j % 5 in (1, 2) else -1 if j % 7 == 3 else 0) * 0.9
    for a, b in ((0, 0), (0, 1), (0, 2), (-1, 1), (1, 1), (0, 3)): px[int(cx) + a, top + 3 + b] = P['cyan'] if b in (1, 2) and a == 0 else P['blue']
    return outline(im)

# ---- its heart
def core():
    w = h = 44; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); c = w / 2
    for y in range(h):
        for x in range(w):
            dx, dy = x + 0.5 - c, y + 0.5 - c; r = math.hypot(dx, dy); a = math.atan2(dy, dx)
            ray = 13 + 6 * max(0, math.cos(a * 4)) ** 6 + 2 * max(0, math.cos(a * 8 + 0.6)) ** 4     # four long points, small ones between
            if r > ray: continue
            px[x, y] = P['white'] if r < 5 + dith(x, y) * 1.5 else P['fire3'] if r < 9 + dith(x, y) * 2 else P['fire2'] if r < 12.5 else P['fire1']
    for k in range(40):                                              # a ring of pale light tilted round it
        a = k / 40 * math.pi * 2; x, y = int(c + math.cos(a) * 17), int(c + math.sin(a) * 6 + math.cos(a) * 3)
        if math.sin(a) > -0.2 or not px[x, y][3]: px[x, y] = P['pale'] if k % 3 else P['white']
    return outline(im)

# ---- a lightning rod
def rod():
    w, h = 28, 88; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w // 2
    def box(x0, y0, x1, y1, col):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): px[x, y] = P[col]
    box(cx - 8, h - 5, cx + 8, h - 2, 'dark'); box(cx - 8, h - 5, cx + 8, h - 5, 'light'); box(cx - 5, h - 8, cx + 5, h - 6, 'mid'); box(cx - 5, h - 8, cx + 5, h - 8, 'light')
    for bx in (cx - 7, cx + 6): box(bx, h - 4, bx + 1, h - 3, 'pale')
    box(cx - 1, 20, cx + 1, h - 9, 'mid'); box(cx - 1, 20, cx - 1, h - 9, 'light'); box(cx + 1, 20, cx + 1, h - 9, 'dark')          # the mast
    for k, y in enumerate((64, 50, 36)):                              # coils of copper round it
        for j in range(5):
            half = 5 if j in (1, 2, 3) else 4
            box(cx - half, y + j, cx + half, y + j, 'rust' if j % 2 else 'fire0'); px[cx - half + 1, y + j] = P['fire2'] if j % 2 else P['rust']
        box(cx - 3, y - 2, cx + 3, y - 1, 'bone'); box(cx - 3, y + 5, cx + 3, y + 5, 'wood1')
    box(cx - 9, 19, cx + 9, 21, 'mid'); box(cx - 9, 19, cx + 9, 19, 'light')                                                         # the head: a bar, three tines
    for tx, top in ((cx - 9, 9), (cx, 3), (cx + 9, 9)):
        box(tx - 1, top, tx + 1, 19, 'mid'); box(tx - 1, top, tx - 1, 19, 'light'); px[tx, top - 1] = P['pale']; px[tx, top - 2] = P['white']
    box(cx - 2, 1, cx + 2, 4, 'pale'); box(cx - 1, 0, cx + 1, 5, 'pale'); px[cx - 1, 1] = P['white']; px[cx, 1] = P['white']; px[cx + 2, 4] = P['light']   # the ball
    return outline(im)

PARTS = {'puff_a': lambda: puff(120, 64, 5, 11), 'puff_b': lambda: puff(88, 52, 4, 23), 'puff_c': lambda: puff(60, 40, 3, 37), 'mask': mask, 'core': core, 'rod': rod}
if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'sheet':
        ims = [Image.open(os.path.join(ROOT, 'thunderhead', n + '.png')) for n in PARTS]; W = sum(i.width for i in ims) + 8 * len(ims); Hh = max(i.height for i in ims) + 8
        o = Image.new('RGBA', (W, Hh), (18, 78, 137, 255)); x = 4
        for i in ims: o.paste(i, (x, Hh - 4 - i.height), i); x += i.width + 8
        o.resize((W * 3, Hh * 3), Image.NEAREST).save(sys.argv[2]); print(sys.argv[2])
    else:
        for n, f in PARTS.items(): save(n, f())
