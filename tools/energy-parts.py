#!/usr/bin/env python3
# Creatures of light, drawn by rule in the palette (PixelLab's character drawings give energy a body and a face):
#   px_spark   ball lightning: a white-hot core in a shell of blue-white, arcs jumping off it, never the same twice
#   px_mote    a cinder of the star that fell: a jagged shard of white-gold, burning, sparks trailing up off it
# Each is a strip of nine frames (assets/side/<name>/idle.png), a still (stand.png) and sprite.json, 16 pixels a unit.
#   python3 tools/energy-parts.py [sheet out.png]
import os, sys, json, math, random
from PIL import Image
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')); OUT = os.path.join(ROOT, 'assets', 'side')
PAL = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) + (255,) for k, v in {'ink': '#181425', 'navy': '#124e89', 'blue': '#0099db', 'cyan': '#2ce8f5', 'pale': '#c0cbdc', 'white': '#ffffff',
  'fire0': '#be4a2f', 'fire1': '#f77622', 'fire2': '#feae34', 'fire3': '#fee761', 'deep': '#262b44'}.items()}
B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
def put(im, x, y, c):
    if 0 <= x < im.width and 0 <= y < im.height: im.putpixel((int(x), int(y)), PAL[c])
def outline(im):
    """an ink pixel round everything drawn, as the rest of the cast has"""
    src = im.copy(); px = src.load()
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y][3]: continue
            if any(0 <= x + a < im.width and 0 <= y + b < im.height and px[x + a, y + b][3] and px[x + a, y + b] != PAL['ink'] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): im.putpixel((x, y), PAL['ink'])
def spark(f, n):
    S = 32; im = Image.new('RGBA', (S, S)); r = random.Random(f * 7 + 3); c = S / 2; R = 6.2 + math.sin(f / n * math.pi * 2) * 0.8
    for y in range(S):
        for x in range(S):
            d = math.hypot(x + 0.5 - c, y + 0.5 - c) + (r.random() - 0.5) * 0.9
            if d < R * 0.45: put(im, x, y, 'white')
            elif d < R * 0.75: put(im, x, y, 'pale' if B4[(y & 3) * 4 + (x & 3)] < 8 else 'white')
            elif d < R: put(im, x, y, 'cyan' if B4[(y & 3) * 4 + (x & 3)] < 11 else 'blue')
    for k in range(3 + f % 2):   # the arcs: jagged, out from the shell, a forked end
        a = r.random() * math.pi * 2; L = 6 + r.random() * 6; x, y = c + math.cos(a) * R, c + math.sin(a) * R
        for s in range(int(L)):
            a += (r.random() - 0.5) * 1.3; x += math.cos(a); y += math.sin(a); put(im, round(x), round(y), 'white' if s < L * 0.5 else 'cyan')
        put(im, round(x + math.cos(a + 1)), round(y + math.sin(a + 1)), 'cyan'); put(im, round(x + math.cos(a - 1)), round(y + math.sin(a - 1)), 'blue')
    outline(im); return im
def mote(f, n):
    S = 32; im = Image.new('RGBA', (S, S)); r = random.Random(f * 13 + 5); cx, cy = 16, 18; turn = f / n * math.pi * 0.5
    pts = []   # a jagged star of light: long points and short, turning a little
    for k in range(8):
        a = turn + k * math.pi / 4 + (r.random() - 0.5) * 0.15; L = (7.5 if k % 2 == 0 else 3.6) * (1 + (r.random() - 0.5) * 0.25); pts.append((a, L))
    for y in range(S):
        for x in range(S):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy; d = math.hypot(dx, dy); a = math.atan2(dy, dx)
            best = 0
            for (pa, L) in pts:
                da = abs((a - pa + math.pi) % (2 * math.pi) - math.pi); reach = L * max(0, 1 - da / 0.42)
                best = max(best, reach)
            if d < max(best, 2.4):
                put(im, x, y, 'white' if d < 1.8 else 'fire3' if d < best * 0.55 else 'fire2' if d < best * 0.85 else 'fire1')
    for k in range(5):   # sparks off it, going up
        sx, sy = cx + (r.random() - 0.5) * 10, cy - 8 - r.random() * 9 - (f % 3); put(im, sx, sy, 'fire3' if k % 2 else 'fire2')
        if r.random() < 0.5: put(im, sx, sy - 1, 'fire1')
    outline(im); return im
def save(name, make, n=9):
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
    frames = [make(f, n) for f in range(n)]; strip = Image.new('RGBA', (32 * n, 32))
    for i, fr in enumerate(frames): strip.paste(fr, (32 * i, 0))
    strip.save(os.path.join(d, 'idle.png')); frames[0].save(os.path.join(d, 'stand.png'))
    foot = max(fr.getbbox()[3] for fr in frames)
    meta = {'name': name, 'ppu': 16, 'anims': {'stand': {'frames': 1, 'w': 32, 'h': 32, 'foot': foot, 'cx': 16, 'footLast': foot, 'cxLast': 16}, 'idle': {'frames': n, 'w': 32, 'h': 32, 'foot': foot, 'cx': 16, 'footLast': foot, 'cxLast': 16}}}
    json.dump(meta, open(os.path.join(d, 'sprite.json'), 'w'), indent=1); print('wrote', d)
    return strip
if __name__ == '__main__':
    a = save('px_spark_v2', spark); b = save('px_mote_v2', mote)
    if len(sys.argv) > 2 and sys.argv[1] == 'sheet':
        sh = Image.new('RGBA', (a.width, 70), PAL['deep']); sh.paste(a, (0, 2), a); sh.paste(b, (0, 36), b); sh.resize((sh.width * 4, sh.height * 4), Image.NEAREST).save(sys.argv[2])
