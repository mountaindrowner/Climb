import json, sys
from PIL import Image, ImageDraw, ImageFont
# The whole mountain as one picture: every region as built, stitched where they join, rooms named, wings framed.
#   node tools/map-dump.mjs /tmp/map.json && python3 tools/map-render.py /tmp/map.json the-climb-map.png "build 71"
D=json.load(open(sys.argv[1])); PX=4
def font(sz, bold=False):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''), '/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf' % ('Bold' if bold else 'Regular')]:
        try: return ImageFont.truetype(p, sz)
        except Exception: pass
    return ImageFont.load_default()
F_ROOM, F_WING, F_REG, F_LEG = font(13), font(17, True), font(40, True), font(18)
# theme: (open air in a room, rock in a room, accent for the name)
TH = { 'roots': ((122, 84, 56), (58, 38, 30), (255, 196, 120)), 'cloister': ((112, 104, 134), (50, 46, 66), (214, 200, 255)), 'spires': ((150, 190, 214), (62, 84, 108), (210, 240, 255)),
       'tempest': ((70, 98, 140), (30, 42, 68), (160, 210, 255)), 'gardens': ((120, 160, 96), (48, 72, 50), (200, 255, 170)), 'firmament': ((84, 78, 140), (34, 30, 66), (255, 226, 150)), 'workings': ((104, 70, 58), (44, 28, 26), (255, 170, 120)) }
WINGCOL = { 'THE OSSUARY': (196, 180, 150), 'THE SCRIPTORIUM': (206, 176, 120), 'THE BELL-FOUNDRY': (214, 120, 70), 'THE PILGRIMS\' CAIRNS': (190, 200, 210), 'THE GLACIER GALLERIES': (130, 220, 240),
            'THE WRECK OF THE WORKS': (200, 150, 90), 'THE EYE OF THE STORM': (236, 244, 255), 'THE AQUEDUCTS': (90, 190, 220), 'THE KEEPERS\' HOUSES': (230, 180, 120), 'THE ORRERY WING': (240, 180, 70) }
SEAMCOL = (150, 140, 120)
# where each level sits: the join above one is the join below the next
off = {0: (0, 0)}; climb = [d for d in D if not d['deep']]
for a, b in zip(climb, climb[1:]): u, dn = a['joins']['up'], b['joins']['down']; off[b['n']] = (off[a['n']][0] + u['x'] - dn['x'], off[a['n']][1] + u['y'] - dn.get('y', 0))
deep = [d for d in D if d['deep']]; gap = 30
for d in deep: off[d['n']] = (off[0][0], -d['H'] - gap)
x0 = min(off[d['n']][0] for d in D); y0 = min(off[d['n']][1] for d in D); x1 = max(off[d['n']][0] + d['W'] for d in D); y1 = max(off[d['n']][1] + d['H'] for d in D)
ML, MR, MT, MB = 330, 60, 120, 150; W = (x1 - x0) * PX + ML + MR; H = (y1 - y0) * PX + MT + MB
im = Image.new('RGB', (W, H), (14, 14, 26)); dr = ImageDraw.Draw(im)
for y in range(H): c = int(10 + 22 * (1 - y / H)); dr.line([(0, y), (W, y)], fill=(c // 2, c // 2 + 3, c + 14))
def X(lv, tx): return ML + (off[lv][0] + tx - x0) * PX
def Y(lv, ty): return H - MB - (off[lv][1] + ty - y0) * PX      # y up: the foot of the mountain at the bottom
ROCK, LEDGE, SPIKES = 1, 2, 3
def mix(a, b, t): return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))
px = im.load(); labels = []
ORDER = sorted(D, key=lambda d: (not d['deep'], d['n']))
# first the mountain itself, under everything: the rock of every region that is in no room
for d in ORDER:
    lv = d['n']; Wd, Hd, T = d['W'], d['H'], d['tiles']; inroom = set()
    for r in d['rooms']:
        if r['ghost']: continue
        for ty in range(r['ty0'], r['ty1']):
            for tx in range(r['tx0'], r['tx1']): inroom.add((tx, ty))
    for ty in range(Hd):
        for tx in range(Wd):
            if T[ty * Wd + tx] != ROCK or (tx, ty) in inroom: continue
            gx, gy = X(lv, tx), Y(lv, ty) - PX
            for yy in range(PX):
                for xx in range(PX):
                    if 0 <= gx + xx < W and 0 <= gy + yy < H: px[gx + xx, gy + yy] = (30, 30, 44)
for d in ORDER:
    lv = d['n']; air, rock, acc = TH.get(d['theme'], TH['roots']); Wd, Hd, T = d['W'], d['H'], d['tiles']
    roomOf = {}
    for r in d['rooms']:
        if r['ghost']: continue
        for ty in range(r['ty0'], r['ty1']):
            for tx in range(r['tx0'], r['tx1']): roomOf[(tx, ty)] = r
    for ty in range(Hd):
        for tx in range(Wd):
            t = T[ty * Wd + tx]; r = roomOf.get((tx, ty)); gx, gy = X(lv, tx), Y(lv, ty) - PX
            if r is None: continue
            else:
                wc = WINGCOL.get(r['title']); seam = (not r['wing']) and r['title'] and r['title'] not in WINGCOL and not r['nook']
                a2, r2 = air, rock
                if wc: a2, r2 = mix(air, wc, 0.5), mix(rock, wc, 0.22)
                elif seam: a2, r2 = mix(air, SEAMCOL, 0.45), mix(rock, SEAMCOL, 0.15)
                if t == ROCK or t in (4, 7, 9): col = r2
                elif t == LEDGE or t in (5, 6, 14, 16, 17): col = (196, 150, 92)
                elif t == SPIKES: col = (214, 70, 70)
                elif t == 10: col = (150, 210, 255)
                elif t in (8, 11, 12, 13, 15, 18, 19): col = mix(a2, (255, 255, 255), 0.45)   # doors, panes, ice, cloud: things that open
                else: col = a2
            for yy in range(PX):
                for xx in range(PX):
                    if 0 <= gx + xx < W and 0 <= gy + yy < H: px[gx + xx, gy + yy] = col
    # the rooms' outlines and names
    wings = {}
    for r in d['rooms']:
        if r['ghost']: continue
        bx0, by0, bx1, by1 = X(lv, r['tx0']), Y(lv, r['ty1']), X(lv, r['tx1']), Y(lv, r['ty0'])
        wc = WINGCOL.get(r['title'])
        dr.rectangle([bx0, by0, bx1 - 1, by1 - 1], outline=(wc if wc else mix(acc, (0, 0, 0), 0.45)), width=1)
        labels.append(((bx0 + bx1) // 2, (by0 + by1) // 2, ('Corwen' if r['nook'] == 'corwen' else r['nook'] or r['name']), (255, 255, 255)))
        if r['title']: w = wings.setdefault(r['title'], [bx0, by0, bx1, by1, wc]); w[0] = min(w[0], bx0); w[1] = min(w[1], by0); w[2] = max(w[2], bx1); w[3] = max(w[3], by1)
    for title, (a, b, c, e, wc) in wings.items():
        col = wc or SEAMCOL; dr.rectangle([a - 2, b - 2, c + 1, e + 1], outline=col, width=3)
        tw = dr.textlength(title, font=F_WING); tx = max(4, min(W - tw - 4, (a + c) // 2 - tw // 2)); dr.rectangle([tx - 4, b - 26, tx + tw + 4, b - 3], fill=(14, 14, 26)); dr.text((tx, b - 25), title, font=F_WING, fill=col)
    # what is in it
    for m in d['marks']:
        cx, cy = X(lv, m['x']) + PX // 2, Y(lv, m['y']) - PX * 2
        if m['type'] == 'boss': dr.polygon([(cx, cy - 11), (cx + 11, cy), (cx, cy + 11), (cx - 11, cy)], fill=(230, 60, 70), outline=(255, 255, 255))
        elif m['type'] in ('shrine', 'pool'): dr.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(60, 170, 255), outline=(255, 255, 255))
        elif m['type'] == 'chest' and m['holds'].startswith('relic'): dr.regular_polygon((cx, cy, 8), 5, rotation=0, fill=(255, 214, 80), outline=(60, 40, 0))
        elif m['type'] == 'chest' and m['holds'] == 'thread': dr.rectangle([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 120, 200), outline=(60, 0, 40))
        elif m['type'] == 'npc': dr.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255), outline=(0, 0, 0))
        elif m['type'] == 'spawn': dr.polygon([(cx - 7, cy + 7), (cx + 7, cy + 7), (cx, cy - 8)], fill=(120, 255, 140), outline=(0, 60, 0))
        elif m['type'] not in ('chest', 'exit', 'pass', 'thread'): dr.polygon([(cx, cy - 9), (cx + 9, cy), (cx, cy + 9), (cx - 9, cy)], fill=(255, 150, 40), outline=(60, 30, 0))   # a wing's keeper
    # the region's name, at its side
    core = [r for r in d['rooms'] if not r['ghost'] and not r['wing'] and not r['title']]
    cy = (Y(lv, max(r['ty1'] for r in core)) + Y(lv, min(r['ty0'] for r in core))) // 2
    name = d['name'].upper(); dr.text((24, cy - 44), name, font=F_REG, fill=acc)
    n_w = len({r['title'] for r in d['rooms'] if r['title'] in WINGCOL}); scr = sum((r['tx1'] - r['tx0']) * (r['ty1'] - r['ty0']) for r in d['rooms'] if not r['ghost']) / (40 * 23)
    dr.text((26, cy + 4), ('the Deep: off the climb, under it' if d['deep'] else 'region %d' % (lv + 1)) + '\n%d screens%s' % (round(scr), ', %d wing%s' % (n_w, '' if n_w == 1 else 's') if n_w else ''), font=F_LEG, fill=(200, 200, 215))
for cx, cy, text, col in labels:
    tw = dr.textlength(text, font=F_ROOM); dr.text((cx - tw // 2 + 1, cy - 7), text, font=F_ROOM, fill=(0, 0, 0)); dr.text((cx - tw // 2, cy - 8), text, font=F_ROOM, fill=col)
dr.text((24, 28), 'THE CLIMB: the whole mountain as built', font=F_REG, fill=(255, 255, 255)); dr.text((26, 78), sys.argv[3] if len(sys.argv) > 3 else '', font=F_LEG, fill=(200, 200, 215))
# the legend
lx, ly = 26, H - MB + 30
items = [('keeper', 'boss'), ('wing keeper', 'wk'), ('water (rest)', 'water'), ('relic', 'relic'), ('thread', 'thread'), ('a person', 'npc'), ('where he starts', 'spawn'), ('plank or platform', 'ledge'), ('spikes', 'spikes'), ('a door that opens by a rule', 'door')]
for label, k in items:
    cx, cy = lx + 10, ly + 11
    if k == 'boss': dr.polygon([(cx, cy - 10), (cx + 10, cy), (cx, cy + 10), (cx - 10, cy)], fill=(230, 60, 70), outline=(255, 255, 255))
    elif k == 'wk': dr.polygon([(cx, cy - 9), (cx + 9, cy), (cx, cy + 9), (cx - 9, cy)], fill=(255, 150, 40), outline=(60, 30, 0))
    elif k == 'water': dr.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(60, 170, 255), outline=(255, 255, 255))
    elif k == 'relic': dr.regular_polygon((cx, cy, 8), 5, fill=(255, 214, 80), outline=(60, 40, 0))
    elif k == 'thread': dr.rectangle([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 120, 200), outline=(60, 0, 40))
    elif k == 'npc': dr.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255), outline=(0, 0, 0))
    elif k == 'spawn': dr.polygon([(cx - 7, cy + 7), (cx + 7, cy + 7), (cx, cy - 8)], fill=(120, 255, 140), outline=(0, 60, 0))
    elif k == 'ledge': dr.rectangle([cx - 9, cy - 2, cx + 9, cy + 2], fill=(196, 150, 92))
    elif k == 'spikes': dr.rectangle([cx - 9, cy - 2, cx + 9, cy + 2], fill=(214, 70, 70))
    elif k == 'door': dr.rectangle([cx - 4, cy - 9, cx + 4, cy + 9], fill=(200, 205, 225))
    dr.text((lx + 28, ly), label, font=F_LEG, fill=(220, 220, 232)); lx += 44 + int(dr.textlength(label, font=F_LEG))
    if lx > W - 320: lx = 26; ly += 34
dr.text((26, H - 40), 'Coloured frames with a name over them: wings. Sand-coloured frames: the passages between regions. One square of the grid is one tile; a screen is 40 by 23.', font=F_LEG, fill=(170, 170, 190))
im.save(sys.argv[2]); print(im.size)
