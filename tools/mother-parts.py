#!/usr/bin/env python3
"""Mother Thorn's pieces (assets/side/mother/*.png), painted by rule at the game's pixel scale on its palette, the way the
Toll's and the Wyrm's are (tools/boss-parts.py): a puppet of flat pieces that src/side/mother.js puts together and moves.
  stalk    a length of her thorned stem (stacked along a curve from the root to the head)
  sepal    a leaf of the bud's green armour, thorns down its edges      petal   one great petal (its foot is its pivot)
  calyx    the cup the bud sits in                                        heart   what is inside: bared when she opens
  vine     a length of a vine arm        club   the thorned knot at an arm's end
  leaves   the rosette at her root       thorn  a spike out of the ground        pod   a seed she throws
Run: python3 tools/mother-parts.py   (then: python3 tools/mother-parts.py sheet out.png)"""
import os, sys, math, random
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'side')
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
P = {k: H(v) for k, v in dict(ink='#181425', deep='#262b44', teal='#193c3e', moss0='#265c42', moss1='#3e8948', moss2='#63c74d',
     plum='#68386c', pink='#b55088', rose='#f6757a', skin='#e8b796', white='#ffffff', red0='#a22633', red1='#e43b44',
     wood0='#3e2731', wood1='#733e39', wood2='#b86f50', tan='#c28569', bone='#ead4aa', fire1='#f77622', fire2='#feae34', fire3='#fee761').items()}
CLEAR = (0, 0, 0, 0)
GREEN = [P['teal'], P['moss0'], P['moss1'], P['moss2']]
PETAL = [P['plum'], P['pink'], P['rose'], P['skin']]
HORN = [P['wood1'], P['tan'], P['bone'], P['white']]
def ramp(cols, k): return cols[max(0, min(len(cols) - 1, int(round(k))))]
def outline(im, col=None):
    col = col or P['ink']; px = im.load(); w, h = im.size; edge = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3]: continue
            if any(0 <= x + a < w and 0 <= y + b < h and px[x + a, y + b][3] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): edge.append((x, y))
    for x, y in edge: px[x, y] = col
    return im
def save(name, im):
    d = os.path.join(ROOT, 'mother'); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name + '.png')); print('mother/' + name + '.png', im.size)
def spike(px, w, h, x0, y0, dx, dy, L, base=2, cols=HORN):
    """a thorn from (x0, y0) along (dx, dy), L long, `base` wide at its root"""
    n = math.hypot(dx, dy) or 1; dx /= n; dy /= n
    for k in range(L * 2):
        t = k / (L * 2); half = base * (1 - t) / 2
        for s in range(-3, 4):
            if abs(s * 0.5) > half + 0.01: continue
            x = int(round(x0 + dx * k / 2 - dy * s * 0.5)); y = int(round(y0 + dy * k / 2 + dx * s * 0.5))
            if 0 <= x < w and 0 <= y < h: px[x, y] = ramp(cols, 1 + t * 2.4 - (0.8 if s > 0 else 0))

def stalk():
    """a length of stem, drawn upright: it is stacked bottom to top, each over the last"""
    w, h = 26, 20; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2
    for y in range(h):
        half = 6.6 + 0.9 * math.sin(y / h * math.pi * 2)             # it swells and narrows: a knuckle each length
        for x in range(w):
            u = (x + 0.5 - cx) / half
            if abs(u) > 1: continue
            k = 2.9 - abs(u + 0.45) * 2.0 - (0.6 if u > 0.5 else 0) + ((x * 5 + y * 3) % 4 - 1.5) * 0.12
            if y % 10 == 4: k -= 1.0                                    # a ring round it
            px[x, y] = ramp(GREEN, k)
    spike(px, w, h, cx - 6, 7, -1, -0.5, 5, 3); spike(px, w, h, cx + 6, 15, 1, -0.4, 5, 3)
    save('stalk', outline(im))
def vine():
    """a length of a vine arm, drawn lying along x"""
    w, h = 20, 14; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cy = h / 2
    for x in range(w):
        half = 3.8 + 0.6 * math.sin(x / w * math.pi * 2)
        for y in range(h):
            v = (y + 0.5 - cy) / half
            if abs(v) > 1: continue
            k = 2.7 - abs(v + 0.5) * 1.9 - (0.6 if v > 0.45 else 0) + ((x * 3 + y * 5) % 4 - 1.5) * 0.12
            if x % 10 == 3: k -= 0.9
            px[x, y] = ramp(GREEN, k - 0.25)
    spike(px, w, h, 6, cy - 3, -0.3, -1, 3, 2); spike(px, w, h, 14, cy + 3, 0.3, 1, 3, 2)
    save('vine', outline(im))
def club():
    """the knot at the end of an arm: a hard green bulb, all thorns, a seam of red where it splits"""
    w = h = 42; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = cy = w / 2; R = 12.5
    for k in range(11):
        a = k / 11 * math.pi * 2 + 0.3; spike(px, w, h, cx + math.cos(a) * (R - 2), cy + math.sin(a) * (R - 2), math.cos(a), math.sin(a), 7, 4)
    for y in range(h):
        for x in range(w):
            dx = x + 0.5 - cx; dy = y + 0.5 - cy; r = math.hypot(dx, dy)
            if r > R: continue
            k = 2.6 - math.hypot(dx + 4.5, dy + 4.5) / R * 1.9 + ((x * 7 + y * 3) % 5 - 2) * 0.07
            px[x, y] = ramp(GREEN, k)
            if abs(dy - math.sin(dx * 0.55) * 2.2) < 1.1 and abs(dx) < R - 2: px[x, y] = P['red0'] if abs(dy - math.sin(dx * 0.55) * 2.2) < 0.6 else P['teal']
    save('club', outline(im))
def petal():
    """one great petal, its foot at the bottom middle: rose, darker to its edges and its foot, veined, a pale lip"""
    w, h = 32, 74; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2
    for y in range(1, h - 1):
        t = 1 - y / (h - 1)                                             # 0 at the foot, 1 at the tip
        half = 14.2 * (math.sin(math.pi * min(1, t ** 0.72)) ** 0.8) * (1 - 0.25 * t) + 1.2 * (1 - t)
        if t > 0.96: half = max(0.5, half)
        for x in range(w):
            u = (x + 0.5 - cx) / max(0.5, half)
            if abs(u) > 1: continue
            k = 2.3 - abs(u + 0.3) * 1.5 + t * 0.9 - (0.9 if t < 0.16 else 0) + ((x * 5 + y * 7) % 5 - 2) * 0.08
            vein = abs(u) < 0.07 or abs(abs(u) - (0.25 + t * 0.3)) < 0.05 * (1.2 - t)
            if vein and t < 0.86: k -= 0.9
            if abs(u) > 0.86 and t > 0.25: k = max(k, 2.6) if u < 0 else k - 0.6                    # a pale lip on the lit edge
            px[x, y] = ramp(PETAL, k)
    save('petal', outline(im))
def sepal():
    """a leaf of the bud's armour, its foot at the bottom middle: dark green, a ridge up it, thorns down both edges"""
    w, h = 30, 56; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2
    prof = lambda t: 9.5 * (math.sin(math.pi * min(1, t ** 0.6)) ** 0.9) * (1 - 0.35 * t) + 1.5 * (1 - t)
    for k in range(4):
        t = 0.2 + k * 0.19; y = (1 - t) * (h - 1)
        for s in (-1, 1): spike(px, w, h, cx + s * (prof(t) - 1), y, s, -0.6, 5, 3)
    for y in range(1, h - 1):
        t = 1 - y / (h - 1); half = prof(t)
        for x in range(w):
            u = (x + 0.5 - cx) / max(0.5, half)
            if abs(u) > 1: continue
            k = 2.2 - abs(u + 0.35) * 1.7 + ((x * 3 + y * 5) % 5 - 2) * 0.08 - (0.5 if t < 0.12 else 0)
            if abs(u) < 0.12: k += 0.9                                  # the ridge
            if int(y) % 9 == 2 and abs(u) > 0.15: k -= 0.7               # plates
            px[x, y] = ramp(GREEN, k - 0.2)
    spike(px, w, h, cx, 4, 0, -1, 4, 3)
    save('sepal', outline(im))
def calyx():
    """the cup the bud sits in: ribbed green, a scalloped lip"""
    w, h = 60, 28; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2
    for y in range(h):
        for x in range(w):
            dx = (x + 0.5 - cx) / 28; top = 5 + 3 * abs(math.sin(dx * 9)) - (1 - dx * dx) * 4
            if abs(dx) > 1 or y < top: continue
            bot = 6 + math.sqrt(max(0, 1 - dx * dx)) * 20
            if y > bot: continue
            k = 2.5 - abs(dx + 0.4) * 1.8 - (y - top) / 22 * 0.9 + ((x * 3 + y * 5) % 5 - 2) * 0.08
            if abs(math.sin(dx * 9)) < 0.16: k -= 0.9                    # ribs
            if y - top < 1.6: k += 0.8
            px[x, y] = ramp(GREEN, k)
    for s in (-1, 1): spike(px, w, h, cx + s * 22, 14, s, 0.5, 6, 4)
    save('calyx', outline(im))
def heart():
    """what the bud keeps: a globe of gold light with one dark slit, and a ring of stamens round it"""
    w = h = 40; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = cy = w / 2; R = 13.5
    for k in range(12):
        a = k / 12 * math.pi * 2
        for d in range(int(R), int(R) + 5):
            x = int(round(cx + math.cos(a) * d)); y = int(round(cy + math.sin(a) * d)); px[x, y] = P['fire2'] if d < R + 4 else P['fire3']
        x = int(round(cx + math.cos(a) * (R + 5))); y = int(round(cy + math.sin(a) * (R + 5)))
        for a2, b2 in ((0, 0), (1, 0), (0, 1), (-1, 0), (0, -1)):
            if 0 <= x + a2 < w and 0 <= y + b2 < h: px[x + a2, y + b2] = P['fire3'] if (a2, b2) != (0, 0) else P['white']
    cols = [P['fire1'], P['fire2'], P['fire3'], P['white']]
    for y in range(h):
        for x in range(w):
            dx = x + 0.5 - cx; dy = y + 0.5 - cy; r = math.hypot(dx, dy)
            if r > R: continue
            k = 3.3 - math.hypot(dx + 3.5, dy + 3.5) / R * 2.6 + ((x + y) % 2) * 0.25
            px[x, y] = ramp(cols, k)
            sl = abs(dx) / max(0.4, 3.2 * math.cos(dy / R * math.pi / 2) ** 0.8) if abs(dy) < R - 2 else 9   # the slit: an almond
            if sl < 1: px[x, y] = P['ink'] if sl < 0.55 else P['red0']
    save('heart', outline(im, P['wood1']))
def leaves():
    """the rosette at her root: broad leaves lying out to both sides, a few standing"""
    w, h = 156, 40; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2; R = random.Random(11)
    def leaf(a, L, wd, sh):
        for k in range(L * 2):
            t = k / (L * 2); half = wd * math.sin(math.pi * t ** 0.7) + 0.5; droop = (t ** 2) * L * 0.35
            x0 = cx + math.cos(a) * k / 2; y0 = h - 3 - math.sin(a) * k / 2 + droop
            for s in range(-int(half) - 1, int(half) + 2):
                if abs(s) > half: continue
                x = int(round(x0 - math.sin(a) * s * 0.6)); y = int(round(y0 - abs(math.cos(a)) * s))
                if 0 <= x < w and 0 <= y < h:
                    kk = 1.5 + sh - s / max(1, half) * 0.9 + (0.9 if s == 0 else 0) + ((x + y) % 3 - 1) * 0.12
                    px[x, y] = ramp(GREEN, kk)
    for a, L, wd, sh in ((0.12, 74, 6, 0), (math.pi - 0.12, 74, 6, -0.2), (0.42, 58, 6, 0.4), (math.pi - 0.42, 58, 6, 0.2), (0.85, 40, 5, 0.6), (math.pi - 0.85, 40, 5, 0.4), (1.25, 26, 4, 0.8), (math.pi - 1.3, 28, 4, 0.7)):
        leaf(a, L, wd, sh)
    save('leaves', outline(im))
def thorn():
    """a spike out of the ground: dark wood, curved, a pale point; its foot at the bottom middle"""
    w, h = 20, 46; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2
    cols = [P['wood0'], P['wood1'], P['wood2'], P['bone']]
    for y in range(1, h):
        t = 1 - y / (h - 1); half = 5.2 * (1 - t) ** 0.8 + 0.4; off = math.sin(t * 2.2) * 2.6
        for x in range(w):
            u = (x + 0.5 - cx - off) / half
            if abs(u) > 1: continue
            k = 1.9 - abs(u + 0.45) * 1.6 + (1.6 if t > 0.78 else 0) + ((x + y * 3) % 4 - 1.5) * 0.1
            if int(y) % 8 == 3 and t < 0.7: k -= 0.7
            px[x, y] = ramp(cols, k)
    for k, s in ((0.25, -1), (0.45, 1)):
        y = (1 - k) * (h - 1); spike(px, w, h, cx + math.sin(k * 2.2) * 2.6 + s * 3, y, s, -0.7, 4, 2)
    save('thorn', outline(im))
def pod():
    """a seed she throws: a hard brown husk split by a red seam"""
    w = h = 16; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = cy = w / 2
    cols = [P['wood0'], P['wood1'], P['wood2'], P['tan']]
    for y in range(h):
        for x in range(w):
            dx = (x + 0.5 - cx) / 5.2; dy = (y + 0.5 - cy) / 6.4
            if dx * dx + dy * dy > 1: continue
            k = 2.6 - math.hypot(dx + 0.4, dy + 0.4) * 2.0
            px[x, y] = ramp(cols, k) if abs(dx - math.sin(dy * 3) * 0.12) > 0.14 else P['red1']
    spike(px, w, h, cx, 2, 0, -1, 2, 2)
    save('pod', outline(im))

def sheet(out):
    d = os.path.join(ROOT, 'mother'); names = ['petal', 'sepal', 'calyx', 'heart', 'stalk', 'vine', 'club', 'leaves', 'thorn', 'pod']
    ims = [Image.open(os.path.join(d, n + '.png')) for n in names]; S = 4
    W = sum(i.width for i in ims) + 6 * (len(ims) + 1); Hh = max(i.height for i in ims) + 12
    sh = Image.new('RGBA', (W, Hh), (58, 68, 102, 255)); x = 6
    for i in ims: sh.alpha_composite(i, (x, Hh - 6 - i.height)); x += i.width + 6
    sh.resize((W * S, Hh * S), Image.NEAREST).save(out); print(out)

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'sheet': sheet(sys.argv[2])
    else:
        for f in (stalk, vine, club, petal, sepal, calyx, heart, leaves, thorn, pod): f()
