#!/usr/bin/env python3
"""The Toll's and the Rime Wyrm's pieces (assets/side/toll/*.png, assets/side/wyrm/*.png), painted by rule at the game's
pixel scale on its palette, the way the Warden's slabs are (tools/warden-parts.py): each boss is a puppet of flat
pieces that src/side/toll.js and src/side/wyrm.js put together and move.
  the Toll   a great bronze bell with a face cut in it, its clapper, the beam it hangs from, a length of chain
  the Wyrm   a head and its lower jaw, body rings in three sizes with an ice spine on each, a tail spike
Run: python3 tools/boss-parts.py   (then: python3 tools/boss-parts.py sheet out.png)"""
import os, sys, math, random
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'side')
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
P = {k: H(v) for k, v in dict(ink='#181425', deep='#262b44', dark='#3a4466', mid='#5a6988', light='#8b9bb4', pale='#c0cbdc', white='#ffffff',
     navy='#124e89', blue='#0099db', cyan='#2ce8f5', teal='#193c3e', moss0='#265c42', moss1='#3e8948',
     wood0='#3e2731', wood1='#733e39', wood2='#b86f50', fire0='#be4a2f', rust='#d77643', fire1='#f77622', fire2='#feae34', fire3='#fee761', bone='#ead4aa').items()}
CLEAR = (0, 0, 0, 0)
def outline(im, col=None):
    """a one-pixel dark line round everything painted"""
    col = col or P['ink']; px = im.load(); w, h = im.size; edge = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3]: continue
            if any(0 <= x + a < w and 0 <= y + b < h and px[x + a, y + b][3] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): edge.append((x, y))
    for x, y in edge: px[x, y] = col
    return im
def save(folder, name, im):
    d = os.path.join(ROOT, folder); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name + '.png')); print(folder + '/' + name + '.png', im.size)

# ---- the Toll
def bell_half(y, h):
    """half the bell's width at row y of h: a crown, round shoulders, a long waist, a lip that flares"""
    t = y / (h - 1)
    if t < 0.10: return 5 + 3 * math.sin(t / 0.10 * math.pi)                 # the crown it hangs by
    if t < 0.30: return 9 + 17 * math.sin((t - 0.10) / 0.20 * math.pi / 2)    # shoulders
    if t < 0.82: return 26 + 7 * ((t - 0.30) / 0.52) ** 1.6                    # waist
    return 33 + 9 * ((t - 0.82) / 0.18) ** 0.8                                 # lip
def bell():
    w, h = 90, 88; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx = w / 2; R = random.Random(5)
    ramp = [P['wood0'], P['fire0'], P['rust'], P['fire2'], P['fire3']]
    for y in range(1, h - 1):
        half = bell_half(y, h); t = y / (h - 1)
        for x in range(w):
            u = (x + 0.5 - cx) / half
            if abs(u) > 1: continue
            # lit from the upper left: a bright band left of the middle, falling to shadow at the right
            k = 3.1 - abs(u + 0.42) * 2.3 - (0.7 if u > 0.55 else 0) - (0.5 if t > 0.9 else 0)
            k += ((x * 7 + y * 13) % 5 - 2) * 0.07                               # a little grain
            c = ramp[max(0, min(4, int(round(k))))]
            px[x, y] = c
    # bands cast in it: under the shoulders, over the lip
    for band, col in ((0.33, 'wood1'), (0.36, 'fire3'), (0.80, 'wood1'), (0.83, 'fire3'), (0.955, 'wood1')):
        y = int(band * (h - 1)); half = bell_half(y, h)
        for x in range(w):
            if abs(x + 0.5 - cx) < half - 1 and px[x, y][3]: px[x, y] = P[col] if col != 'fire3' or (x + 0.5 - cx) / half < 0.2 else px[x, y]
    # runes between the upper bands... a row of small marks
    for k in range(-4, 5):
        x = int(cx + k * 6); y = int(0.40 * h)
        for a, b in ((0, 0), (0, 1), (0, 2), (1, 0), (-1, 2)) if k % 2 else ((0, 0), (1, 1), (0, 2), (-1, 1)):
            if px[x + a, y + b][3]: px[x + a, y + b] = P['wood0']
    # the face: two slanted eyes and a ragged mouth, cut through to the dark inside
    def eye(ex, ey, s):
        for b in range(-4, 5):
            for a in range(-7, 8):
                if abs(a) / 7 + abs(b - s * a * 0.28) / 3.6 < 1: px[int(ex + a), int(ey + b)] = P['ink']
    eye(cx - 13, 0.55 * h, -1); eye(cx + 13, 0.55 * h, 1)
    for a in range(-17, 18):
        top = 0.70 * h + (2 if (a // 3) % 2 else -1) + abs(a) * 0.08; bot = 0.70 * h + 5 - (2 if ((a + 1) // 3) % 2 else 0) - abs(a) * 0.1
        for y in range(int(top), int(bot) + 1): px[int(cx + a), y] = P['ink']
    # cracks, and green where the rain ran down it
    for (x0, y0, n) in ((cx + 22, 0.34 * h, 14), (cx - 24, 0.6 * h, 10)):
        x, y = x0, y0
        for _ in range(n):
            if px[int(x), int(y)][3]: px[int(x), int(y)] = P['wood0']
            y += 1; x += R.choice((-1, 0, 0, 1))
    for x in range(w):
        if R.random() < 0.16:
            top = next((y for y in range(h) if px[x, y][3]), None)
            if top is None or top > 0.4 * h: continue
            for y in range(top + 1, top + 3 + R.randint(2, 12)):
                if px[x, y][3] and px[x, y] != P['ink']: px[x, y] = P['moss0'] if (y - top) % 4 else P['teal']
    return outline(im)
def clapper():
    w, h = 16, 44; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    for y in range(1, 30):
        for x in (7, 8): px[x, y] = P['mid'] if x == 7 else P['dark']
    for y in range(28, 43):
        for x in range(w):
            d = math.hypot(x + 0.5 - 8, y + 0.5 - 35.5)
            if d < 6.6: px[x, y] = P['pale'] if math.hypot(x - 5.5, y - 33) < 2 else P['light'] if x < 8 and y < 36 else P['mid'] if d < 5 else P['dark']
    return outline(im)
def beam():
    w, h = 72, 18; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    for y in range(3, 13):
        for x in range(2, w - 2):
            px[x, y] = P['wood2'] if y == 3 else P['wood0'] if y == 12 or (x * 5 + y * 3) % 23 == 0 else P['wood1']
    for bx in (8, 34, 60):                                     # iron straps
        for y in range(2, 14):
            for x in range(bx, bx + 4): px[x, y] = P['light'] if x == bx else P['dark'] if x == bx + 3 else P['mid']
    for wx in (14, 56):                                        # the wheels it runs on
        for y in range(0, 8):
            for x in range(wx - 4, wx + 4):
                if math.hypot(x + 0.5 - wx, y + 0.5 - 3.5) < 3.8: px[x, y] = P['mid'] if math.hypot(x + 0.5 - wx, y + 0.5 - 3.5) > 1.5 else P['pale']
    for y in range(12, 17):                                    # the ring the chain hangs from
        for x in range(33, 39):
            if not (34 <= x <= 37 and 13 <= y <= 15): px[x, y] = P['mid']
    return outline(im)
def chain():
    """two links, to repeat down its length: one seen flat, one edge on"""
    w, h = 8, 16; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    for y in range(0, 9):
        for x in range(1, 7):
            ring = (x in (1, 6) and 1 <= y <= 7) or (y in (0, 8) and 2 <= x <= 5)
            if ring: px[x, y] = P['light'] if x == 1 or y == 0 else P['mid']
    for y in range(7, 16):
        for x in (3, 4): px[x, y] = P['pale'] if x == 3 else P['dark']
    for y in (0, 8, 15):
        for x in (2, 5):
            if not px[x, y][3]: px[x, y] = P['ink']
    for y in range(h):
        for x in (0, 7):
            if px[1 if x == 0 else 6, y][3]: px[x, y] = P['ink']
        for x in (2, 5):
            if 7 <= y and not px[x, y][3] and px[3, y][3]: px[x, y] = P['ink']
    return im

# ---- the Wyrm
ICE = [P['navy'], P['blue'], P['light'], P['pale'], P['white']]
def ring(d, spine=True, seed=1):
    """a ring of its body, seen from the side: scales lit from above, plates under, a blade of ice on its back"""
    pad = 9 if spine else 2; w, h = d + 4, d + pad + 2; im = Image.new('RGBA', (w, h), CLEAR); px = im.load(); cx, cy, r = w / 2, pad + d / 2, d / 2
    for y in range(h):
        for x in range(w):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy; q = math.hypot(dx, dy)
            if q > r: continue
            k = 3.0 - dy / r * 1.9 - abs(dx) / r * 0.4                       # light from above
            if dy > r * 0.45: k = 3.0 - (dy / r - 0.45) * 3 + (0.6 if int(x) % 4 == 0 else 0)   # the plates under it: paler, ribbed
            sc = (x + y) % 8 == 0 or (x - y) % 8 == 0                          # scales: a lattice of diamonds
            if sc and dy <= r * 0.45: k -= 1
            px[x, y] = ICE[max(0, min(4, int(round(k))))]
    if spine:
        for k in range(pad + 3):                                              # the blade: a shard leaning back
            half = max(0, (pad + 3 - k) // 3); xx = int(cx - 2 - k * 0.35)
            for a in range(-half, half + 1):
                y = int(cy - r + 3 - k)
                if 0 <= y < h and 0 <= xx + a < w: px[xx + a, y] = P['white'] if a <= 0 and k > 2 else P['cyan'] if k > 1 else P['blue']
    return outline(im, P['ink'])
def head():
    """its head, looking right: a long wedge of a skull, horns swept back, teeth along the upper jaw; the eye is a hole"""
    w, h = 70, 46; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    for y in range(h):
        for x in range(w):
            # the skull: an ellipse behind, drawn out to a blunt snout in front
            u, v = (x - 24) / 24, (y - 22) / 13
            skull = u * u + v * v < 1
            snout = 24 <= x <= 64 and abs(y - (22 + (x - 24) * 0.05)) < 12.5 - (x - 24) * 0.16 and y < 30
            if not (skull or snout): continue
            k = 3.3 - (y - 10) / 8 - (0.6 if x < 12 else 0)
            if ((x + y) % 8 == 0 or (x - y) % 8 == 0) and x < 40: k -= 0.9                # scales, behind the snout
            px[x, y] = ICE[max(0, min(4, int(round(k))))]
    # brow ridge, nostril, the eye's socket
    for x in range(26, 46):
        y = int(13 + (x - 26) * 0.12); px[x, y] = P['white']; px[x, y + 1] = P['pale']
    for (x, y) in ((60, 19), (61, 19), (60, 20)): px[x, y] = P['navy']
    for b in range(-3, 4):
        for a in range(-5, 6):
            if abs(a) / 5.5 + abs(b - a * 0.25) / 3 < 1: px[36 + a, 20 + b] = P['ink']
    # teeth along the upper jaw, pointing down
    for tx in range(34, 64, 4):
        for k in range(5 if tx < 58 else 3):
            for a in range(0, max(1, 2 - k // 2)):
                if 0 <= 29 + k < h: px[tx + a, 29 + k] = P['white']
    # horns: two blades sweeping back and up from the crown, one behind the other
    for (x0, y0, L, lift, col) in ((20, 12, 22, 0.55, 'cyan'), (14, 15, 16, 0.3, 'blue')):
        for k in range(L):
            x = int(x0 - k * 0.8); y = int(y0 - k * lift); half = max(0, int(3 * (1 - k / L) + 0.5))
            for b in range(-half, half + 1):
                if 0 <= y + b < h and 0 <= x < w: px[x, y + b] = P['white'] if b == -half and half else P[col]
    return outline(im)
def jaw():
    w, h = 46, 16; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    for y in range(4, h - 1):
        for x in range(2, w - 2):
            if y - 4 < (9 - abs(x - 14) * 0.02) * (1 - max(0, x - 8) / 44) + 1 and x + (y - 4) * 0.6 > 3:
                px[x, y] = ICE[4] if y == 4 else ICE[3] if y < 7 else ICE[2] if y < 10 else ICE[1]
    for tx in range(12, 40, 4):                                               # teeth, pointing up
        for k in range(4):
            if px[tx, 4][3] or px[tx, 5][3]: px[tx, 3 - k if k < 3 else 1] = P['white']; px[tx + (1 if k < 2 else 0), 3 - k if k < 3 else 1] = P['white']
    return outline(im)
def tail():
    w, h = 34, 16; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()     # a spike, pointing left (it trails)
    for x in range(2, w - 1):
        half = (x - 2) / (w - 3) * 6
        for y in range(h):
            if abs(y + 0.5 - 8) <= half: px[x, y] = P['white'] if y < 8 and x > 8 else P['cyan'] if x < 14 else P['light'] if y < 9 else P['mid']
    return outline(im)

def build():
    save('toll', 'bell', bell()); save('toll', 'clapper', clapper()); save('toll', 'beam', beam()); save('toll', 'chain', chain())
    save('wyrm', 'head', head()); save('wyrm', 'jaw', jaw()); save('wyrm', 'tail', tail())
    for n, d in (('ring_l', 30), ('ring_m', 24), ('ring_s', 18)): save('wyrm', n, ring(d, True, d))
def sheet(path):
    g = lambda f, n: Image.open(os.path.join(ROOT, f, n + '.png')).convert('RGBA')
    im = Image.new('RGBA', (330, 150), P['ink'])
    im.alpha_composite(g('toll', 'beam'), (10, 4))
    ch = g('toll', 'chain')
    for k in range(2): im.alpha_composite(ch, (42, 20 + k * 16))
    im.alpha_composite(g('toll', 'clapper'), (38, 96)); im.alpha_composite(g('toll', 'bell'), (1, 50))
    x = 300
    im.alpha_composite(g('wyrm', 'jaw'), (x - 46 - 4, 46)); im.alpha_composite(g('wyrm', 'head'), (x - 70, 14)); x -= 64
    for n in ('ring_l', 'ring_l', 'ring_m', 'ring_m', 'ring_s'):
        r = g('wyrm', n); x -= r.width - 8; im.alpha_composite(r, (x, 60 - r.height)); 
    im.alpha_composite(g('wyrm', 'tail'), (x - 28, 36))
    im.resize((im.width * 4, im.height * 4), Image.NEAREST).save(path); print('wrote', path)
if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'sheet': sheet(sys.argv[2])
    else: build()
