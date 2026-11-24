#!/usr/bin/env python3
"""The Rime Wyrm's new pieces, painted by rule (docs/wyrm-sheet.md, part 5: "a head with horns and a frill, larger;
rings with a ridge of ice along the back; a tail with a blade"). A candidate, for approval: until then it writes to the
folder it is given, not over assets/side/wyrm/. The game's palette; light from above; a one-pixel ink outline.
  head   looking right: a long wedge of a skull, a brow, two horns swept back, a frill of four spines fanning behind
         the cheek, a socket for the eye (wyrm.js lights it), teeth along the upper jaw
  jaw    the lower jaw, teeth up
  ring   a length of its body (longer than it is tall, so the rings lie along each other as one body): scales above,
         ribbed plates below, a ridge of ice blades along the back
  tail   the last of the body, narrowing to a curved blade of ice, pointing left (it trails)
Run: python3 tools/wyrm-parts.py <folder>"""
import os, sys, math, random
from PIL import Image
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
P = {k: H(v) for k, v in dict(ink='#181425', deep='#262b44', dark='#3a4466', mid='#5a6988', light='#8b9bb4', pale='#c0cbdc', white='#ffffff',
     navy='#124e89', blue='#0099db', cyan='#2ce8f5').items()}
CLEAR = (0, 0, 0, 0)
SCALE = [P['deep'], P['navy'], P['blue'], P['light'], P['pale'], P['white']]      # its scales, dark to lit
BELLY = [P['dark'], P['mid'], P['light'], P['pale']]
ICE = [P['navy'], P['blue'], P['cyan'], P['white']]
# PAL=drawn: the colours of the head PixelLab drew (assets/side/wyrm_cand/head_open.png), so painted rings and tail
# can lie behind that head as one creature
if os.environ.get('PAL') == 'drawn':
    SCALE = [H(c) for c in ('#182652', '#5159a6', '#5e68ba', '#8ca3e9', '#c1c5f4', '#f9fafd')]
    BELLY = [H(c) for c in ('#5159a6', '#8297e0', '#c1c5f4', '#dedefe')]
    ICE = [H(c) for c in ('#182652', '#499df3', '#acdcff', '#f9fafd')]
    P['ink'] = H('#182652')
def outline(im, col=None):
    col = col or P['ink']; px = im.load(); w, h = im.size; edge = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3]: continue
            if any(0 <= x + a < w and 0 <= y + b < h and px[x + a, y + b][3] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): edge.append((x, y))
    for x, y in edge: px[x, y] = col
    return im
def put(px, w, h, x, y, c):
    if 0 <= x < w and 0 <= y < h: px[x, y] = c
def shade(k, ramp, x, y):
    """k on a ramp, with a checker between steps (the game's dither)"""
    k = max(0, min(len(ramp) - 1.001, k)); i = int(k); f = k - i
    return ramp[min(len(ramp) - 1, i + 1)] if f > 0.5 + (0.18 if (x + y) % 2 else -0.18) else ramp[i]
def blade(px, w, h, x0, y0, ang, L, wid, ramp=ICE):
    """a blade of ice from (x0, y0), along ang (radians, y down), L long, wid at its root; lit on its upper edge"""
    ca, sa = math.cos(ang), math.sin(ang)
    for k in range(int(L * 4)):
        t = k / (L * 4); half = wid * (1 - t) ** 0.8
        cx, cy = x0 + ca * t * L, y0 + sa * t * L
        for j in range(-int(half * 4), int(half * 4) + 1):
            o = j / 4; x, y = int(round(cx - sa * o)), int(round(cy + ca * o))
            edge = o < -half + 0.9
            put(px, w, h, x, y, ramp[-1] if edge else ramp[2] if t > 0.55 else ramp[1] if o > half * 0.3 else ramp[2])

def head():
    w, h = 92, 58; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    # the frill first (behind): four spines fanning back from the cheek
    for i, a in enumerate((2.55, 2.85, 3.15, 3.45)):
        blade(px, w, h, 30, 34, a, 22 - i * 2, 3.2 - i * 0.3, [P['navy'], P['navy'], P['blue'], P['cyan']])
    # membrane between them
    for y in range(18, 52):
        for x in range(8, 32):
            if px[x, y][3]: continue
            dx, dy = 30 - x, y - 34
            if dx > 0 and 0.15 < math.atan2(-dy, dx) + 0.6 < 1.25 and math.hypot(dx, dy) < 17: px[x, y] = P['navy'] if (x + y) % 3 else P['deep']
    # the skull: round behind, a long snout in front, the mouth line along its foot
    for y in range(h):
        for x in range(w):
            u, v = (x - 36) / 22, (y - 28) / 15
            skull = u * u + v * v < 1
            top = 15 + (x - 36) * 0.17; bot = 41 - (x - 36) * 0.06
            snout = 36 <= x <= 86 and top <= y <= bot and (x < 80 or (y - top) + (x - 80) * 0.9 < 14)
            if not (skull or snout): continue
            k = 5.2 - (y - 12) / 6.0 - (0.5 if x < 22 else 0)                 # lit from above
            if (x + 2 * y) % 9 == 0 and x < 56 and y > 18: k -= 1.2              # scales
            if y > 36: k = 1.6 - (y - 36) * 0.2                                 # the cheek underneath, in shadow
            px[x, y] = shade(k, SCALE, x, y)
    # the brow: a ridge from over the eye toward the snout, white on its top
    for x in range(40, 70):
        y = int(17 + (x - 40) * 0.15); put(px, w, h, x, y, P['white']); put(px, w, h, x, y + 1, P['pale'])
    # nostril
    for (x, y) in ((80, 22), (81, 22), (81, 23)): put(px, w, h, x, y, P['deep'])
    # the eye's socket (the game puts the glow in it): a slanted almond, dark, a rim of ice over it
    for b in range(-4, 5):
        for a in range(-7, 8):
            if abs(a) / 7.5 + abs(b - a * 0.22) / 3.6 < 1: put(px, w, h, 50 + a, 24 + b, P['ink'])
    for a in range(-7, 7): put(px, w, h, 50 + a, int(19 + a * 0.22), P['cyan'])
    # teeth down from the upper jaw
    for tx in range(48, 84, 4):
        L = 6 if tx < 74 else 4
        for k in range(L):
            for a in range(max(1, 2 - k // 2)): put(px, w, h, tx + a, int(41 - (tx - 36) * 0.06) + 1 + k, P['white'] if k < L - 1 else P['pale'])
    # horns: two long blades swept back and up from the crown, the far one darker
    blade(px, w, h, 30, 14, math.radians(-160), 30, 3.4, [P['deep'], P['navy'], P['navy'], P['blue']])
    blade(px, w, h, 36, 13, math.radians(-150), 34, 4.2)
    return outline(im)
def jaw():
    w, h = 58, 18; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    for y in range(5, h - 1):
        for x in range(3, w - 2):
            depth = (11 - abs(x - 16) * 0.03) * (1 - max(0, x - 10) / 50) + 1
            if y - 5 < depth and x + (y - 5) * 0.7 > 4:
                px[x, y] = shade(4.2 - (y - 5) * 0.45, BELLY, x, y) if y > 7 else P['pale']
    for tx in range(14, 50, 4):
        for k in range(5 if tx < 40 else 3):
            for a in range(max(1, 2 - k // 2)):
                if px[tx, 5][3]: put(px, w, h, tx + a, 4 - k, P['white'] if k < 4 else P['pale'])
    return outline(im)
def ring(d, ridge=3):
    """a length of body d tall, 1.3 d long; its back a ridge of `ridge` blades leaning back"""
    pad = 10; L = int(d * 1.3); w, h = L + 4, d + pad + 2; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    cx, cy, rx, ry = w / 2, pad + d / 2, L / 2, d / 2
    for k in range(ridge):
        x0 = cx + (k - (ridge - 1) / 2) * rx * 0.55
        blade(px, w, h, x0 + 1, cy - ry + 3, math.radians(-112), pad + 2 - abs(k - (ridge - 1) / 2) * 2, 2.6)
    for y in range(h):
        for x in range(w):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            q = dx * dx + dy * dy
            if q > 1: continue
            if dy > 0.42:                                                       # plates underneath, ribbed across
                k = 3.4 - (dy - 0.42) * 4 - (0.9 if int(x) % 5 == 0 else 0); px[x, y] = shade(k, BELLY, x, y)
            else:
                k = 4.6 - (dy + 1) * 2.3 - abs(dx) * 0.5
                if (x + 2 * y) % 9 == 0 or (x - 2 * y) % 9 == 0: k -= 1.0        # scales
                px[x, y] = shade(k, SCALE, x, y)
    return outline(im)
def tail():
    w, h = 66, 34; im = Image.new('RGBA', (w, h), CLEAR); px = im.load()
    # the body narrowing to the left, then a blade curving up from its end
    for x in range(20, w - 1):
        half = 3 + (x - 20) / (w - 21) * 8
        for y in range(h):
            dy = (y + 0.5 - 19) / half
            if abs(dy) > 1: continue
            k = 4.4 - (dy + 1) * 2.1 if dy < 0.4 else 2.4 - (dy - 0.4) * 2
            px[x, y] = shade(k, SCALE if dy < 0.4 else BELLY, x, y)
    for k in range(3):
        blade(px, w, h, 30 + k * 9, 19 - (4 + k * 0.7) + 2, math.radians(-120), 6 - k, 1.8)
    # the blade: from the tip of the body, a crescent sweeping left and up
    for t in range(0, 120):
        u = t / 119; ang = math.radians(180 + 55 * u); r = 24 * u
        x, y = 23 + math.cos(ang) * r, 19 + math.sin(ang) * r * 0.9 - u * 2
        half = 5.5 * (1 - u) ** 0.6 + 0.4
        for j in range(-int(half * 3), int(half * 3) + 1):
            o = j / 3; put(px, w, h, int(round(x)), int(round(y + o)), P['white'] if o < -half + 1 else P['cyan'] if o < 0 else P['blue'])
    return outline(im)

def sheet(folder, path):
    """the pieces laid out, and the Wyrm put together from them as the game does, rearing"""
    g = lambda n: Image.open(os.path.join(folder, n + '.png')).convert('RGBA')
    im = Image.new('RGBA', (420, 150), (24, 20, 37, 255)); x = 6
    for n in ('head', 'jaw', 'ring_l', 'ring_m', 'ring_s', 'tail'):
        p = g(n); im.alpha_composite(p, (x, 6)); x += p.width + 8
    im.save(path)

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for n, f in (('head', head), ('jaw', jaw), ('tail', tail)): f().save(os.path.join(out, n + '.png'))
    for n, d in (('ring_l', 30), ('ring_m', 24), ('ring_s', 18)): ring(d).save(os.path.join(out, n + '.png'))
    if len(sys.argv) > 2: sheet(out, sys.argv[2])
    print('wrote', out)
