# The whole mountain as one picture: every region as built, stitched where they join, rooms named, wings framed, and
# everyone and everything of note marked and named.
#   node tools/map-dump.mjs /tmp/map.json
#   python3 tools/map-render.py /tmp/map.json the-climb-map.png "build 72" [page_dir]
# With page_dir it also writes what the interactive map page needs: map.png (the same, without its marks) and
# map-data.json (every room and mark, in the picture's pixels and in the game's tiles).
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
D = json.load(open(sys.argv[1])); OUT = sys.argv[2]; CAPTION = sys.argv[3] if len(sys.argv) > 3 else ''; PAGE = sys.argv[4] if len(sys.argv) > 4 else None; PX = 4
def font(sz, bold=False):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''), '/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf' % ('Bold' if bold else 'Regular')]:
        try: return ImageFont.truetype(p, sz)
        except Exception: pass
    return ImageFont.load_default()
F_ROOM, F_WING, F_REG, F_LEG, F_TAG = font(13), font(17, True), font(40, True), font(18), font(14, True)
TH = { 'roots': ((122, 84, 56), (58, 38, 30), (255, 196, 120)), 'cloister': ((112, 104, 134), (50, 46, 66), (214, 200, 255)), 'spires': ((150, 190, 214), (62, 84, 108), (210, 240, 255)),
       'tempest': ((70, 98, 140), (30, 42, 68), (160, 210, 255)), 'gardens': ((120, 160, 96), (48, 72, 50), (200, 255, 170)), 'firmament': ((84, 78, 140), (34, 30, 66), (255, 226, 150)),
       'workings': ((104, 70, 58), (44, 28, 26), (255, 170, 120)), 'vein': ((58, 78, 112), (16, 20, 36), (160, 230, 255)),
       'flooded': ((46, 104, 96), (12, 34, 36), (150, 255, 200)), 'shaft': ((70, 72, 92), (14, 14, 22), (255, 190, 120)), 'hollow': ((96, 78, 72), (20, 14, 18), (255, 200, 140)) }
WINGCOL = { 'THE OSSUARY': (196, 180, 150), 'THE SCRIPTORIUM': (206, 176, 120), 'THE BELL-FOUNDRY': (214, 120, 70), 'THE PILGRIMS\' CAIRNS': (190, 200, 210), 'THE GLACIER GALLERIES': (130, 220, 240),
            'THE WRECK OF THE WORKS': (200, 150, 90), 'THE EYE OF THE STORM': (236, 244, 255), 'THE AQUEDUCTS': (90, 190, 220), 'THE KEEPERS\' HOUSES': (230, 180, 120), 'THE ORRERY WING': (240, 180, 70) }
SEAMCOL = (150, 140, 120)
KIND = { 'keeper': (230, 60, 70), 'elite': (255, 150, 40), 'person': (255, 255, 255), 'relic': (255, 214, 80), 'thread': (255, 120, 200), 'water': (60, 170, 255), 'way': (120, 255, 140), 'shards': (200, 170, 110), 'creature': (190, 120, 120), 'thing': (150, 200, 190) }
SHORT = { 'ORDRIC OF THE VIGIL': 'Ordric', 'MIREL THE PENITENT': 'Mirel', 'CORWEN THE ANNALIST': 'Corwen', 'HOB OF THE GUILD': 'Hob' }
# where each level sits: the join above one is the join below the next; the Deep's levels one under another, under the foot
off = {0: (0, 0)}; climb = [d for d in D if not d['deep']]
for a, b in zip(climb, climb[1:]): u, dn = a['joins']['up'], b['joins']['down']; off[b['n']] = (off[a['n']][0] + u['x'] - dn['x'], off[a['n']][1] + u['y'] - dn.get('y', 0))
deep = sorted([d for d in D if d['deep']], key=lambda d: -(d.get('depth') or [0, 0])[1]); gap = 30; yy = 0   # the Deep, by how far down each is
for d in deep: yy -= d['H'] + gap; off[d['n']] = (off[0][0], yy)
x0 = min(off[d['n']][0] for d in D); y0 = min(off[d['n']][1] for d in D); x1 = max(off[d['n']][0] + d['W'] for d in D); y1 = max(off[d['n']][1] + d['H'] for d in D)
ML, MR, MT, MB = 330, 60, 120, 150; W = (x1 - x0) * PX + ML + MR; H = (y1 - y0) * PX + MT + MB
def X(lv, tx): return ML + (off[lv][0] + tx - x0) * PX
def Y(lv, ty): return H - MB - (off[lv][1] + ty - y0) * PX      # y up: the foot of the mountain at the bottom
ROCK, LEDGE, SPIKES = 1, 2, 3
def mix(a, b, t): return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))
ORDER = sorted(D, key=lambda d: (not d['deep'], d['n']))

def base():
    im = Image.new('RGB', (W, H), (14, 14, 26)); dr = ImageDraw.Draw(im)
    for y in range(H): c = int(10 + 22 * (1 - y / H)); dr.line([(0, y), (W, y)], fill=(c // 2, c // 2 + 3, c + 14))
    px = im.load(); labels = []
    for d in ORDER:                                    # the mountain itself, under everything: rock that is in no room
        lv = d['n']; Wd, Hd, T = d['W'], d['H'], d['tiles']; inroom = set()
        for r in d['rooms']:
            if r['ghost']: continue
            for ty in range(r['ty0'], r['ty1']):
                for tx in range(r['tx0'], r['tx1']): inroom.add((tx, ty))
        for ty in range(Hd):
            for tx in range(Wd):
                if T[ty * Wd + tx] != ROCK or (tx, ty) in inroom: continue
                gx, gy = X(lv, tx), Y(lv, ty) - PX
                for b in range(PX):
                    for a in range(PX):
                        if 0 <= gx + a < W and 0 <= gy + b < H: px[gx + a, gy + b] = (30, 30, 44)
    for d in ORDER:
        lv = d['n']; air, rock, acc = TH.get(d['theme'], TH['roots']); Wd, Hd, T = d['W'], d['H'], d['tiles']; roomOf = {}
        for r in d['rooms']:
            if r['ghost']: continue
            for ty in range(r['ty0'], r['ty1']):
                for tx in range(r['tx0'], r['tx1']): roomOf[(tx, ty)] = r
        for ty in range(Hd):
            for tx in range(Wd):
                r = roomOf.get((tx, ty))
                if r is None: continue
                t = T[ty * Wd + tx]; gx, gy = X(lv, tx), Y(lv, ty) - PX; wc = WINGCOL.get(r['title']); seam = (not r['wing']) and r['title'] and r['title'] not in WINGCOL and not r['nook']
                a2, r2 = air, rock
                if wc: a2, r2 = mix(air, wc, 0.5), mix(rock, wc, 0.22)
                elif seam: a2, r2 = mix(air, SEAMCOL, 0.45), mix(rock, SEAMCOL, 0.15)
                if t == ROCK or t in (4, 7, 9): col = r2
                elif t == LEDGE or t in (5, 6, 14, 16, 17): col = (196, 150, 92)
                elif t == SPIKES: col = (214, 70, 70)
                elif t == 10: col = (150, 210, 255)
                elif t in (8, 11, 12, 13, 15, 18, 19): col = mix(a2, (255, 255, 255), 0.45)   # doors, panes, ice, cloud: things that open
                else: col = a2
                for b in range(PX):
                    for a in range(PX):
                        if 0 <= gx + a < W and 0 <= gy + b < H: px[gx + a, gy + b] = col
        wings = {}
        for r in d['rooms']:
            if r['ghost']: continue
            bx0, by0, bx1, by1 = X(lv, r['tx0']), Y(lv, r['ty1']), X(lv, r['tx1']), Y(lv, r['ty0']); wc = WINGCOL.get(r['title'])
            dr.rectangle([bx0, by0, bx1 - 1, by1 - 1], outline=(wc if wc else mix(acc, (0, 0, 0), 0.45)), width=1)
            labels.append(((bx0 + bx1) // 2, by0 + 12, ('Corwen\'s nook' if r['nook'] else r['name'])))
            if r['title']: w = wings.setdefault(r['title'], [bx0, by0, bx1, by1, wc]); w[0] = min(w[0], bx0); w[1] = min(w[1], by0); w[2] = max(w[2], bx1); w[3] = max(w[3], by1)
        for title, (a, b, c, e, wc) in wings.items():
            col = wc or SEAMCOL; dr.rectangle([a - 2, b - 2, c + 1, e + 1], outline=col, width=3)
            tw = dr.textlength(title, font=F_WING); tx = max(4, min(W - tw - 4, (a + c) // 2 - tw // 2)); dr.rectangle([tx - 4, b - 26, tx + tw + 4, b - 3], fill=(14, 14, 26)); dr.text((tx, b - 25), title, font=F_WING, fill=col)
        core = [r for r in d['rooms'] if not r['ghost'] and not r['wing'] and not r['title']]
        cy = (Y(lv, max(r['ty1'] for r in core)) + Y(lv, min(r['ty0'] for r in core))) // 2
        dr.text((24, cy - 44), d['name'].upper(), font=F_REG, fill=acc)
        n_w = len({r['title'] for r in d['rooms'] if r['title'] in WINGCOL}); scr = sum((r['tx1'] - r['tx0']) * (r['ty1'] - r['ty0']) for r in d['rooms'] if not r['ghost']) / (40 * 23)
        dr.text((26, cy + 4), ('the Deep: off the climb, under it' if d['deep'] else 'region %d' % (lv + 1)) + '\n%d screens%s' % (round(scr), ', %d wing%s' % (n_w, '' if n_w == 1 else 's') if n_w else ''), font=F_LEG, fill=(200, 200, 215))
    for cx, cy, text in labels:
        tw = dr.textlength(text, font=F_ROOM); dr.text((cx - tw // 2 + 1, cy - 7), text, font=F_ROOM, fill=(0, 0, 0)); dr.text((cx - tw // 2, cy - 8), text, font=F_ROOM, fill=(235, 235, 245))
    dr.text((24, 28), 'THE CLIMB: the whole mountain as built', font=F_REG, fill=(255, 255, 255)); dr.text((26, 78), CAPTION, font=F_LEG, fill=(200, 200, 215))
    return im

def glyph(dr, kind, cx, cy, s=1.0):
    c = KIND[kind]; q = lambda v: int(round(v * s))
    if kind == 'keeper': dr.polygon([(cx, cy - q(12)), (cx + q(12), cy), (cx, cy + q(12)), (cx - q(12), cy)], fill=c, outline=(255, 255, 255))
    elif kind == 'elite': dr.polygon([(cx, cy - q(10)), (cx + q(10), cy), (cx, cy + q(10)), (cx - q(10), cy)], fill=c, outline=(60, 30, 0))
    elif kind == 'person': dr.ellipse([cx - q(7), cy - q(7), cx + q(7), cy + q(7)], fill=c, outline=(0, 0, 0), width=2)
    elif kind == 'relic': dr.regular_polygon((cx, cy, q(9)), 5, fill=c, outline=(60, 40, 0))
    elif kind == 'thread': dr.rectangle([cx - q(5), cy - q(5), cx + q(5), cy + q(5)], fill=c, outline=(60, 0, 40))
    elif kind == 'water': dr.ellipse([cx - q(6), cy - q(6), cx + q(6), cy + q(6)], fill=c, outline=(255, 255, 255))
    elif kind == 'way': dr.polygon([(cx - q(7), cy + q(7)), (cx + q(7), cy + q(7)), (cx, cy - q(8))], fill=c, outline=(0, 60, 0))
    elif kind == 'shards': dr.rectangle([cx - q(4), cy - q(3), cx + q(4), cy + q(3)], fill=c, outline=(60, 40, 10))
    else: dr.ellipse([cx - q(3), cy - q(3), cx + q(3), cy + q(3)], fill=c)

im = base()
if PAGE:
    os.makedirs(PAGE, exist_ok=True); im.save(os.path.join(PAGE, 'map.png'))
    levels, rooms, marks, seen = [], [], [], {}
    for d in D:
        lv = d['n']; levels.append({ 'n': lv, 'name': d['name'], 'sub': d.get('sub', ''), 'deep': d['deep'], 'dark': d.get('dark', False), 'x': X(lv, 0), 'y': Y(lv, d['H']), 'w': d['W'] * PX, 'h': d['H'] * PX, 'ox': X(lv, 0), 'oy': Y(lv, 0) })
        for k, r in enumerate(d['rooms']):
            if r['ghost']: continue
            rooms.append({ 'id': 'L%d.%s.%d.%d' % (lv, r['name'], r['tx0'], r['ty0']), 'lv': lv, 'name': 'Corwen\'s nook' if r['nook'] else r['name'], 'title': r['title'], 'wing': r['wing'] or r['title'] in WINGCOL, 'gate': r['gate'], 'after': r['after'], 'x': X(lv, r['tx0']), 'y': Y(lv, r['ty1']), 'w': (r['tx1'] - r['tx0']) * PX, 'h': (r['ty1'] - r['ty0']) * PX, 'scr': round((r['tx1'] - r['tx0']) * (r['ty1'] - r['ty0']) / 920, 2) })
        for m in d['marks']:
            # two things on one tile (the Orrery's three arms share a hub) still need ids of their own
            mid = 'L%d.%s.%d.%d' % (lv, m['type'], m['x'], m['y']); seen[mid] = seen.get(mid, 0) + 1
            if seen[mid] > 1: mid += '.%d' % seen[mid]
            marks.append({ 'id': mid, 'lv': lv, 'k': m['kind'], 't': m['type'], 'n': m['name'], 's': m.get('sub', ''), 'x': X(lv, m['x']) + PX // 2, 'y': Y(lv, m['y']) - PX * 2, 'tx': m['x'], 'ty': m['y'] })
    json.dump({ 'caption': CAPTION, 'px': PX, 'W': W, 'H': H, 'levels': levels, 'rooms': rooms, 'marks': marks }, open(os.path.join(PAGE, 'map-data.json'), 'w'), separators=(',', ':'))
# the full picture: everyone and everything marked, and named where it is someone or something to find
dr = ImageDraw.Draw(im); tags = []
for d in ORDER:
    lv = d['n']
    for kind in ['thing', 'creature', 'shards', 'way', 'water', 'thread', 'relic', 'person', 'elite', 'keeper']:
        for m in d['marks']:
            if m['kind'] != kind or kind in ('thing', 'creature'): continue
            cx, cy = X(lv, m['x']) + PX // 2, Y(lv, m['y']) - PX * 2; glyph(dr, kind, cx, cy)
            if kind in ('keeper', 'elite', 'person', 'relic'): tags.append((cx, cy, SHORT.get(m['name'], m['name']), KIND[kind]))
placed = []
for cx, cy, text, col in sorted(tags, key=lambda t: (t[1], t[0])):
    tw = int(dr.textlength(text, font=F_TAG)); bx, by = cx + 13, cy - 9
    if bx + tw + 8 > W - 4: bx = cx - 13 - tw - 8
    for _ in range(6):
        if any(abs(by - q[1]) < 18 and bx < q[0] + q[2] + 4 and q[0] < bx + tw + 8 for q in placed): by += 18
        else: break
    placed.append((bx, by, tw + 8)); dr.rectangle([bx, by, bx + tw + 8, by + 18], fill=(10, 10, 20), outline=col); dr.text((bx + 4, by + 1), text, font=F_TAG, fill=col)
lx, ly = 26, H - MB + 30
for label, k in [('keeper', 'keeper'), ('wing keeper', 'elite'), ('a person', 'person'), ('relic', 'relic'), ('thread', 'thread'), ('water (rest)', 'water'), ('a way in or out', 'way'), ('chest of shards', 'shards')]:
    glyph(dr, k, lx + 10, ly + 11); dr.text((lx + 28, ly), label, font=F_LEG, fill=(220, 220, 232)); lx += 48 + int(dr.textlength(label, font=F_LEG))
dr.text((26, H - 76), 'Tan: planks and platforms. Red: spikes. Pale: a door that opens by a rule.', font=F_LEG, fill=(170, 170, 190))
dr.text((26, H - 46), 'Coloured frames with a name over them: wings. Sand-coloured frames: the passages between regions. One square of the grid is one tile; a screen is 40 by 23.', font=F_LEG, fill=(170, 170, 190))
im.save(OUT); print(im.size)
