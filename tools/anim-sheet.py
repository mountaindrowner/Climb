#!/usr/bin/env python3
# An animated preview sheet of a character's animations: each in its own cell, feet on one floor line, scaled up
# unsmoothed, labelled, all playing at once. For choosing between animations.
#   python3 tools/anim-sheet.py <character> <out.gif> [anim[=label] ...] [--cols N] [--scale N] [--fps N]
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
args = sys.argv[1:]; opt = {'--cols': '3', '--scale': '4', '--fps': '10'}
for k in list(opt):
    if k in args: i = args.index(k); opt[k] = args[i + 1]; del args[i:i + 2]
name, out, picks = args[0], args[1], args[2:]
d = os.path.join(ROOT, 'assets', 'side', name); meta = json.load(open(os.path.join(d, 'sprite.json')))
picks = [p.split('=', 1) if '=' in p else [p, p] for p in picks] or [[a, a] for a in meta['anims'] if a != 'stand']
S, cols, fps = int(opt['--scale']), int(opt['--cols']), int(opt['--fps'])
anims = []
for a, label in picks:
    A = meta['anims'][a]; strip = Image.open(os.path.join(d, a + '.png')).convert('RGBA')
    anims.append((label, A, [strip.crop((k * A['w'], 0, (k + 1) * A['w'], A['h'])) for k in range(A['frames'])]))
cw = max(A['w'] for _, A, _ in anims) + 24; ch = max(A['foot'] for _, A, _ in anims) + 18
rows = (len(anims) + cols - 1) // cols; LAB = 16
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
n = max(len(f) for _, _, f in anims) * 2
frames = []
for t in range(n):
    sheet = Image.new('RGB', (cols * cw * S, rows * (ch * S + LAB)), (24, 20, 37)); g = ImageDraw.Draw(sheet)
    for k, (label, A, fr) in enumerate(anims):
        cx, cy = (k % cols) * cw * S, (k // cols) * (ch * S + LAB)
        cell = Image.new('RGBA', (cw, ch), (38, 43, 68, 255)); floor = ch - 8
        ImageDraw.Draw(cell).rectangle((0, floor, cw, ch), fill=(58, 68, 102, 255))
        f = fr[t % len(fr)]; cell.alpha_composite(f, (int(cw / 2 - A['cx']), floor - A['foot']))
        sheet.paste(cell.resize((cw * S, ch * S), Image.NEAREST), (cx, cy + LAB))
        g.text((cx + 6, cy + 1), f"{label}  ({len(fr)} frames)", fill=(254, 231, 97), font=font)
    frames.append(sheet)
frames[0].save(out, save_all=True, append_images=frames[1:], duration=int(1000 / fps), loop=0, disposal=2)
print(out, frames[0].size, len(frames), 'frames')
