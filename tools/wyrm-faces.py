#!/usr/bin/env python3
"""The Rime Wyrm's faces (build 100; docs/wyrm-sheet.md, "Its faces"): its head with each face, with its mouth open
(the jaw is a piece of its own, swung by wyrm.js) and shut (a drawing of its own: the jaw swung shut and the join
redrawn by PixelLab). From what PixelLab drew, kept in docs/wyrm-looks/:
  drawn/head_open.png      the head as drawn; faces/<face>.png the same head with only its eye and brow repainted
  faces/seam_1.png         the head with its mouth shut
Writes assets/side/wyrm/head[_shut][_angry|_wince|_dazed].png (the plain open head is head.png, as before).
Run: python3 tools/wyrm-faces.py"""
import os
from PIL import Image
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')); F = os.path.join(ROOT, 'docs', 'wyrm-looks'); OUT = os.path.join(ROOT, 'assets', 'side', 'wyrm')
# the jaw's part of the drawn head (as split in build 99: docs/wyrm-looks/b/jaw.png)
inj = lambda x, y: (x >= 60 and y >= 47) or (52 <= x < 60 and y >= 47 + (60 - x) * 1.1)
FACES = { '': ('drawn/head_open.png', None), '_angry': ('faces/angry_i1.png', (40, 18, 80, 38)), '_wince': ('faces/wince_i1.png', (50, 24, 74, 38)), '_dazed': ('faces/dazed_i1.png', (50, 24, 74, 38)) }
def split(im):
    px = im.load(); out = Image.new('RGBA', im.size); o = out.load()
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y][3] and not inj(x, y): o[x, y] = px[x, y]
    return out
shut = Image.open(os.path.join(F, 'faces', 'seam_1.png')).convert('RGBA')
for k, (src, box) in FACES.items():
    face = Image.open(os.path.join(F, src)).convert('RGBA')
    split(face).save(os.path.join(OUT, 'head' + k + '.png'))
    s = shut.copy()
    if box: eyes = Image.new('RGBA', face.size); eyes.paste(face.crop(box), box[:2]); s.alpha_composite(eyes)
    s.save(os.path.join(OUT, 'head_shut' + k + '.png')); print('head' + k, 'head_shut' + k)
