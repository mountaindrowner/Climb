#!/usr/bin/env python3
# The Warden's arms in armour: its stone arms (assets/side/colossus/*16.png) made wider, with iron plates strapped over
# the stone, rivets, and the Warden's teal runes burning in the plates; a gauntlet over the fist. Each with a normal map
# worked out from its own shape (each plate bevelled, the stone rounded), so the core's light catches the edges.
#   python3 tools/armor_arms.py  -> assets/side/colossus/{upperarm,forearm,fist}_armor16.png and _n.png
import os, math
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.normpath(os.path.join(HERE, '..', 'assets', 'side', 'colossus'))
INK, DEEP, DARK, MID, LIGHT, PALE, TEAL, TEAL2 = (24, 20, 37), (38, 43, 68), (58, 68, 102), (90, 105, 136), (139, 155, 180), (192, 203, 220), (44, 232, 245), (0, 153, 219)

def canvas(w, h): return Image.new('RGBA', (w, h), (0, 0, 0, 0))
def put(im, x, y, c, h=None):
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((x, y), c + (255,))
        if h is not None: H[(x, y)] = h
H = {}   # height of each armour pixel, for the normal map (the stone keeps a height from its own shape)

def span_of(im, y):
    xs = [x for x in range(im.width) if im.getpixel((x, y))[3] > 0]
    return (min(xs), max(xs)) if xs else None

def plate(im, y0, y1, grow=3, rune=False, ridge=False, ref=None):
    """a plate wrapped round the arm from row y0 to y1: as wide as the arm there and a little more, curved like a band
    round a cylinder (its ends lower than its middle), shaded round (dark at the edges, a bright band a third across),
    lit along its top edge, shadowed under, a rivet at each end"""
    ref = ref or im; rows = [span_of(ref, y) for y in range(y0, y1 + 1)]; rows = [r for r in rows if r]
    if not rows: return
    x0 = min(r[0] for r in rows) - grow; x1 = max(r[1] for r in rows) + grow; w = x1 - x0
    for x in range(x0, x1 + 1):
        u = (x - x0) / max(1, w); bend = round(2.2 * (2 * u - 1) ** 2)   # the curve round the arm
        for y in range(y0 + bend, y1 + bend + 1):
            edge = x in (x0, x1) or y in (y0 + bend, y1 + bend)
            if edge: c = INK
            elif y == y0 + bend + 1: c = PALE if 0.25 < u < 0.5 else LIGHT
            elif y >= y1 + bend - 1: c = DEEP
            else: c = DEEP if u < 0.1 or u > 0.88 else MID if u < 0.26 else LIGHT if u < 0.4 else MID if u < 0.6 else DARK
            if ridge and abs(x - (x0 + x1) / 2) < 1 and not edge: c = PALE
            put(im, x, y, c, 1.5 if edge else 2.5 + 1.5 * math.sin(u * math.pi))
        if x in (x0 + 2, x1 - 2):
            put(im, x, (y0 + y1) // 2 + bend, PALE, 4.5)
    if rune:   # the rune: a line and a hook, burning teal
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        for d in range(-3, 4): put(im, cx + d, cy, TEAL if abs(d) < 3 else TEAL2, 3.6)
        put(im, cx, cy - 2, TEAL, 3.6); put(im, cx, cy - 1, TEAL, 3.6); put(im, cx + 2, cy + 1, TEAL2, 3.6)

def strap(im, y, ref):
    r = span_of(ref, y)
    if not r: return
    for x in range(r[0], r[1] + 1):
        u = (x - r[0]) / max(1, r[1] - r[0]); b = round(1.2 * (2 * u - 1) ** 2)
        put(im, x, y + b, INK, 2.0); put(im, x, y + b + 1, MID if 0.2 < u < 0.7 else DEEP, 2.3)

def widen(src, w, k=1.45):
    """the stone arm made thicker (half as wide again), centred on a wider canvas"""
    s = src.resize((round(src.width * k), src.height), Image.NEAREST); im = canvas(w, src.height); ox = (w - s.width) // 2; im.paste(s, (ox, 0), s); return im, ox

def normals(im, name):
    """a normal map from the shape: height is distance in from the edge (the stone), or the plate's own height"""
    w, h = im.size; a = [[im.getpixel((x, y))[3] > 0 for x in range(w)] for y in range(h)]
    dist = [[0.0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if not a[y][x]: continue
            d = 0
            while d < 6 and all(0 <= x + dx < w and 0 <= y + dy < h and a[y + dy][x + dx] for dx, dy in ((d + 1, 0), (-d - 1, 0), (0, d + 1), (0, -d - 1))): d += 1
            dist[y][x] = min(6, d) * 0.6 + H.get((x, y), 0)
    out = Image.new('RGBA', (w, h), (128, 128, 255, 0))
    for y in range(h):
        for x in range(w):
            if not a[y][x]: continue
            hx = dist[y][min(w - 1, x + 1)] - dist[y][max(0, x - 1)]; hy = dist[min(h - 1, y + 1)][x] - dist[max(0, y - 1)][x]
            nx, ny, nz = -hx, hy, 2.0; l = math.sqrt(nx * nx + ny * ny + nz * nz)
            out.putpixel((x, y), (int(128 + 127 * nx / l), int(128 + 127 * ny / l), int(128 + 127 * nz / l), 255))
    out.save(os.path.join(D, name + '_n.png'))

def upper():
    global H; H = {}
    im, ox = widen(Image.open(os.path.join(D, 'upperarm16.png')).convert('RGBA'), 48); ref = im.copy()
    # three lames over the stone, overlapping like a pauldron's, the middle one with its rune
    for i, (y0, y1) in enumerate(((5, 17), (26, 39), (49, 62))): plate(im, y0, y1, rune=i == 1, ridge=i != 1, ref=ref)
    for y in (22, 44, 68): strap(im, y, ref)
    im.save(os.path.join(D, 'upperarm_armor16.png')); normals(im, 'upperarm_armor16')

def fore():
    global H; H = {}
    im, ox = widen(Image.open(os.path.join(D, 'forearm16.png')).convert('RGBA'), 48); ref = im.copy()
    # a vambrace: a long plate with a ridge down it, runes along it, strapped; a cuff at the wrist end
    plate(im, 12, 50, grow=2, ridge=True, ref=ref)
    for y in (24, 38): strap(im, y, ref)
    cx = 24
    for y in range(17, 48, 9): put(im, cx - 5, y, TEAL, 3.8); put(im, cx + 5, y + 4, TEAL2, 3.8)
    plate(im, 60, 70, grow=4, ref=ref); strap(im, 56, ref)
    im.save(os.path.join(D, 'forearm_armor16.png')); normals(im, 'forearm_armor16')

def fist():
    global H; H = {}
    src = Image.open(os.path.join(D, 'fist16.png')).convert('RGBA'); src = src.resize((54, 54), Image.NEAREST)
    im = canvas(56, 56); im.paste(src, (1, 2), src); ref = im.copy()
    # a gauntlet: a plate over the back of the hand and one across the knuckles, studded
    plate(im, 8, 16, grow=1, ridge=True, ref=ref); plate(im, 20, 28, grow=2, rune=True, ref=ref)
    r = span_of(ref, 20)
    if r:
        for x in range(r[0] + 6, r[1] - 4, 9):
            for dy in range(3): put(im, x, 19 - dy, PALE if dy == 2 else LIGHT, 4.5 + dy); put(im, x + 1, 19 - dy, MID, 4.2 + dy)
    im.save(os.path.join(D, 'fist_armor16.png')); normals(im, 'fist_armor16')

if __name__ == '__main__':
    upper(); fore(); fist(); print('wrote', D)
