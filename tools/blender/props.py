# Props for the threats and places, in the same painted, chunky style as the creatures: the swinging weight and its
# chain links, the boulders that fall, the rest stop's campfire, and the low things you crouch under besides the beam
# (a collapsed arch, a curtain of chains, a fallen lintel, roots grown across the stair). One file, one node per piece:
# the game clones a piece by name.
#
#   <venv with bpy>/bin/python tools/blender/props.py
#   -> assets/models/props/props.glb
# Frame, in game units: X along the stair, -Y toward the shaft's centre (glTF +Z), +Y toward the wall (1.8 away), Z up
# (glTF +Y). The low pieces stand on the step at the path (the origin); their underside is 2.38 above it where he walks
# (y = 0), above a crouch, below a standing head. The wall is at y = 1.8, the stair's inner edge near y = -1.1.
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
from creaturekit import Body, export, hsh
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'props', 'props.glb')
bpy.ops.wm.read_factory_settings(use_empty=True)
V = lambda x, y, z: Vector((x, y, z))
CLEAR = 2.38

PAL = {'stone': (0.31, 0.28, 0.3), 'stone_dk': (0.2, 0.18, 0.2), 'mortar': (0.16, 0.14, 0.15), 'rune': (0.1, 0.08, 0.09), 'iron': (0.2, 0.19, 0.21),
       'rust': (0.36, 0.17, 0.09), 'wood': (0.36, 0.23, 0.13), 'char': (0.09, 0.07, 0.06), 'rope': (0.5, 0.42, 0.28), 'root': (0.3, 0.22, 0.16),
       'moss': (0.2, 0.26, 0.14), 'fungus': (0.62, 0.55, 0.42), 'bag': (0.38, 0.3, 0.2), 'cloth': (0.4, 0.13, 0.11), 'lichen': (0.4, 0.42, 0.3), 'brass': (0.55, 0.42, 0.2), 'ember': (1.0, 0.5, 0.2), 'lamp': (1.0, 0.8, 0.45)}
MATS = ['prop_stone', 'prop_wood', 'prop_iron', 'prop_cloth']
ROUGH = {'prop_stone': 0.95, 'prop_wood': 0.9, 'prop_iron': 0.6, 'prop_cloth': 0.95}
def colour(kind, p, n):
    c = Vector(PAL.get(kind, PAL['stone']))
    if kind in ('stone', 'stone_dk'):
        c = c * (0.75 + 0.5 * n)
        if hsh(round(p.x * 6), round(p.y * 6), round(p.z * 6), 7) > 0.86: c = c.lerp(Vector(PAL['lichen']), 0.45)   # lichen
        return c
    if kind == 'wood': return c.lerp(Vector(PAL['char']), max(0, 0.5 - n) * 0.6) * (0.8 + 0.4 * n)
    if kind == 'iron': return c.lerp(Vector(PAL['rust']), max(0, n - 0.5) * 1.4) * (0.85 + 0.3 * n)
    return c * (0.8 + 0.4 * n)

class Prop(Body):
    def __init__(self): super().__init__(MATS)
    def cyl(self, a, b, r, kind, mat, segs=8, r2=None, smooth=True): return self.cone(a, b, r, None, kind, mat, segs, r if r2 is None else r2, smooth)
    def tag(self, vs, w): pass
    def rock(self, c, size, kind='stone', mat=0, seed=0, jag=0.3, sub=2, flat=0.0):
        res = bmesh.ops.create_icosphere(self.bm, subdivisions=sub, radius=1.0); vs = res['verts']
        for v in vs:
            p = v.co.copy(); k = 1 + (hsh(p.x * 2.3, p.y * 2.3, p.z * 2.3, seed) - 0.5) * jag * 2
            q = Vector((p.x * size[0] * k, p.y * size[1] * k, p.z * size[2] * k))
            if flat and q.z < -size[2] * (1 - flat): q.z = -size[2] * (1 - flat)
            v.co = q + Vector(c)
        self.paint(self.faces_of(vs), kind, mat, False); return vs
    def box(self, c, size, kind, mat, rot=None):
        res = bmesh.ops.create_cube(self.bm, size=1.0)
        m = Matrix.Diagonal((*size, 1.0)); m = (rot.to_4x4() if rot else Matrix.Identity(4)) @ m
        bmesh.ops.transform(self.bm, matrix=Matrix.Translation(Vector(c)) @ m, verts=res['verts'])
        self.paint(self.faces_of(res['verts']), kind, mat, False); return res['verts']
    def link(self, c, axis_z=True, turn=0.0, size=(0.1, 0.17), th=0.028, kind='iron', mat=2):
        """One chain link: an oval ring of short bars, its long axis along Z, its plane turned about Z by `turn`."""
        pts = []
        for i in range(10):
            a = i / 10 * math.tau; pts.append(Vector((size[0] / 2 * math.cos(a), 0, size[1] / 2 * math.sin(a))))
        R_ = Matrix.Rotation(turn, 3, 'Z')
        for i in range(10): self.cyl(Vector(c) + R_ @ pts[i], Vector(c) + R_ @ pts[(i + 1) % 10], th, kind, mat, segs=5)

def finish(p, name, parent=None, emissive=None):
    ob = p.static(name, colour, ROUGH, emissive)
    if parent: ob.parent = parent
    return ob
def empty(name):
    e = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(e); return e

# ---- the swinging weight: an iron-bound boulder with spikes, a shackle on top (the chain hooks at z = 0.62)
p = Prop()
p.rock((0, 0, 0), (0.5, 0.5, 0.53), 'stone_dk', 0, seed=3, jag=0.22)
for z in (-0.2, 0.18):
    p.cyl(V(0, 0, z - 0.07), V(0, 0, z + 0.07), 0.55, 'iron', 2, segs=12)
    for k in range(6):
        a = k / 6 * math.tau + (0.5 if z > 0 else 0); d = V(math.cos(a), math.sin(a), 0)
        p.cone(d * 0.53 + V(0, 0, z), d * 0.8 + V(0, 0, z), 0.07, None, 'iron', 2, segs=5)
p.box((0, 0, 0.52), (0.26, 0.26, 0.12), 'iron', 2)
p.link((0, 0, 0.62), size=(0.14, 0.2), th=0.035)
finish(p, 'SwingWeight')
p = Prop(); p.link((0, 0, 0)); finish(p, 'ChainLink')

# ---- boulders
for i in range(3):
    p = Prop(); p.rock((0, 0, 0), (0.58 - 0.05 * i, 0.52 + 0.04 * i, 0.5), 'stone', 0, seed=11 + i * 7, jag=0.34)
    for k in range(3): p.rock(V(math.cos(k * 2.1 + i) * 0.35, math.sin(k * 2.1 + i) * 0.35, 0.3), (0.18, 0.16, 0.12), 'stone_dk', 0, seed=40 + i * 9 + k, sub=1)
    finish(p, 'Boulder%d' % i)

# ---- the campfire: a ring of stones, a teepee of logs charred at the tips, embers, a log to sit on, the trader's pack
camp = empty('Camp')
p = Prop()
for k in range(9):
    a = k / 9 * math.tau; p.rock(V(math.cos(a) * 0.46, math.sin(a) * 0.46, 0.08), (0.13, 0.11, 0.1), 'stone', 0, seed=60 + k, sub=1, flat=0.3)
for k in range(5):
    a = k / 5 * math.tau + 0.3; base = V(math.cos(a) * 0.36, math.sin(a) * 0.36, 0.04)
    p.cyl(base, V(math.cos(a) * 0.05, math.sin(a) * 0.05, 0.55), 0.055, 'wood', 1, segs=6, r2=0.035)
    p.cyl(V(math.cos(a) * 0.12, math.sin(a) * 0.12, 0.38), V(math.cos(a) * 0.04, math.sin(a) * 0.04, 0.58), 0.04, 'char', 1, segs=6, r2=0.02)
p.cyl(V(-0.55, 0.85, 0.16), V(0.55, 0.95, 0.16), 0.16, 'wood', 1, segs=8)                              # the log seat, behind
p.cyl(V(-0.57, 0.85, 0.16), V(-0.5, 0.85, 0.16), 0.145, 'char', 1, segs=8)
# the trader's pack: a bag with a rolled blanket, leaning on a staff with a lantern hung from it
p.blob((0.95, 0.35, 0.3), (0.26, 0.2, 0.32), None, 'bag', 3, u=8, v=6, seed=5)
p.blob((0.95, 0.2, 0.42), (0.2, 0.08, 0.14), None, 'bag', 3, u=8, v=5, seed=6)
p.cyl(V(0.72, 0.42, 0.66), V(1.18, 0.42, 0.66), 0.1, 'cloth', 3, segs=8)
p.cyl(V(1.25, 0.55, 0.0), V(1.12, 0.45, 1.5), 0.03, 'wood', 1, segs=5)
p.cyl(V(1.13, 0.46, 1.42), V(1.0, 0.36, 1.45), 0.02, 'wood', 1, segs=4)
for dx, dy in ((-0.06, -0.06), (0.06, -0.06), (-0.06, 0.06), (0.06, 0.06)): p.cyl(V(1.0 + dx, 0.36 + dy, 1.16), V(1.0 + dx, 0.36 + dy, 1.36), 0.012, 'iron', 2, segs=4)
p.box((1.0, 0.36, 1.155), (0.15, 0.15, 0.03), 'iron', 2)
p.cone(V(1.0, 0.36, 1.36), V(1.0, 0.36, 1.46), 0.1, None, 'iron', 2, segs=4)
p.cyl(V(-0.95, 0.3, 0.0), V(-0.95, 0.3, 0.55), 0.04, 'wood', 1, segs=5)                                # a pot on a hook beside it
p.cyl(V(-0.95, 0.3, 0.55), V(-0.55, 0.15, 0.6), 0.03, 'wood', 1, segs=5)
p.blob((-0.55, 0.15, 0.36), (0.16, 0.16, 0.13), None, 'iron', 2, u=10, v=6, seed=8)
finish(p, 'Camp_Base', camp)
p = Prop(); p.mats = ['camp_ember']
for k in range(8): p.rock(V((hsh(k, 1, 0) - 0.5) * 0.35, (hsh(k, 2, 0) - 0.5) * 0.35, 0.06), (0.07, 0.06, 0.05), 'ember', 0, seed=k, sub=1)
finish(p, 'Camp_Embers', camp, emissive={'camp_ember': (1.0, 0.45, 0.12)})
p = Prop(); p.mats = ['camp_lamp']; p.box((1.0, 0.36, 1.26), (0.09, 0.09, 0.13), 'lamp', 0); finish(p, 'Camp_Lamp', camp, emissive={'camp_lamp': (1.0, 0.75, 0.35)})

# ---- the low things. The camera looks out from the shaft's centre, so what reads is how a thing spreads along the stair
# (X) and how high it hangs (Z): each is a broad mass overhead, from the wall out over his lane, its underside CLEAR above
# the path, nothing of it lower than that between the wall's foot and the inner edge (so nothing stands in his way).
low = empty('Low_Arch'); p = Prop()        # a broken vault: two courses of wedge stones springing from the wall, snapped off over the stair
for ring, x in enumerate((-0.32, 0.32)):
    for k in range(6):
        y0 = 1.95 - k * 0.42; y1 = y0 - 0.4; ym = (y0 + y1) / 2
        und = CLEAR + 0.06 + 0.11 * max(0, ym) ** 1.6
        hgt = 0.8 + 0.08 * hsh(k, ring, 1)
        if k == 5 and ring == 1: continue                                                        # snapped off unevenly
        p.box((x + (hsh(k, ring, 2) - 0.5) * 0.05, ym, und + hgt / 2 - (0.07 if (k, ring) == (3, 0) else 0)), (0.6, 0.39, hgt), 'stone', 0, rot=Matrix.Rotation(0.06 * (k - 2), 3, 'X'))
    p.box((x, 1.95 - 6 * 0.42 + 0.2 + (0.42 if ring else 0), CLEAR + 0.62), (0.62, 0.04, 0.6), 'stone_dk', 0)   # the broken face
p.box((0, 1.9, CLEAR + 1.2), (1.4, 0.3, 0.5), 'stone_dk', 0)                                     # the springing course in the wall
for k in range(6): p.rock(V((hsh(k, 4, 0) - 0.5) * 1.2, 1.2 + hsh(k, 5, 0) * 0.5, 0.08), (0.14, 0.12, 0.1), 'stone', 0, seed=80 + k, sub=1, flat=0.3)   # what fell, against the wall
finish(p, 'Low_Arch_Stone', low)
low = empty('Low_Chains'); p = Prop()      # a bracket out of the wall, a crossbar along the stair, a curtain of chains to the clearance
TOPB = CLEAR + 1.25
p.box((0, 1.82, TOPB + 0.1), (0.36, 0.16, 0.36), 'iron', 2)
p.cyl(V(0, 1.85, TOPB + 0.1), V(0, -0.2, TOPB), 0.07, 'iron', 2, segs=8)
p.cyl(V(-0.62, -0.2, TOPB), V(0.62, -0.2, TOPB), 0.065, 'iron', 2, segs=8)
for e in (-0.66, 0.66): p.blob((e, -0.2, TOPB), (0.08, 0.08, 0.08), None, 'iron', 2, u=6, v=4)
for j in range(7):
    x = -0.54 + j * 0.18; n = 8 + (j % 2)
    for i in range(n): p.link((x, -0.2, TOPB - 0.08 - i * 0.135), turn=(math.pi / 2) * (i % 2), size=(0.12, 0.19), th=0.032)
    tip = TOPB - 0.08 - n * 0.135
    if j % 2 == 0: p.cone(V(x, -0.2, tip), V(x + 0.05, -0.2, max(CLEAR + 0.04, tip - 0.12)), 0.03, None, 'iron', 2, segs=4)   # hooks
finish(p, 'Low_Chains_Iron', low)
low = empty('Low_Lintel'); p = Prop()      # a carved lintel, fallen and wedged: driven into the wall at one end, out over the stair
p.box((0, 0.55, CLEAR + 0.45), (0.95, 2.9, 0.9), 'stone', 0, rot=Matrix.Rotation(-0.1, 3, 'X'))
for k in range(5): p.box((-0.32 + k * 0.16, -0.88, CLEAR + 0.25), (0.06, 0.04, 0.4), 'rune', 0, rot=Matrix.Rotation(-0.1, 3, 'X'))   # carving on its end
for k in range(3): p.box((0, -0.89, CLEAR + 0.12 + k * 0.17), (0.86, 0.04, 0.04), 'rune', 0, rot=Matrix.Rotation(-0.1, 3, 'X'))
p.box((0, 0.55, CLEAR + 0.0), (0.97, 2.9, 0.05), 'stone_dk', 0, rot=Matrix.Rotation(-0.1, 3, 'X'))
for k in range(6): p.rock(V((hsh(k, 6, 0) - 0.5) * 1.1, 1.75, CLEAR + 0.2 + hsh(k, 7, 0) * 0.8), (0.2, 0.15, 0.17), 'stone_dk', 0, seed=90 + k, sub=1)   # broken wall round its end
finish(p, 'Low_Lintel_Stone', low)
low = empty('Low_Roots'); p = Prop()       # roots out of the wall high up, arching out over the stair and down to the clearance
for r_, (x, h0, reach) in enumerate(((-0.42, 3.7, -0.95), (0.0, 3.95, -1.1), (0.4, 3.6, -0.85), (0.18, 3.8, -0.6))):
    pts = []
    for i in range(10):
        t = i / 9; y = 1.95 + (reach - 1.95) * t
        z = h0 + (CLEAR + 0.16 - h0) * math.sin(t * math.pi / 2) ** 0.7 + 0.25 * max(0, t - 0.8) * 5
        pts.append(V(x + 0.1 * math.sin(t * 6 + r_ * 2), y, z))
    for i in range(9): p.cyl(pts[i], pts[i + 1], 0.22 * (1 - i / 11) - 0.03 * (r_ % 2), 'root', 1, segs=7, r2=0.22 * (1 - (i + 1) / 11) - 0.03 * (r_ % 2))
    for i in (4, 6, 8): p.blob(pts[i] + V(0, 0, 0.12), (0.07, 0.07, 0.045), None, 'fungus', 0, u=6, v=4, seed=i + r_)
    for i in (2, 3): p.cyl(pts[i], pts[i] + V(0.03, -0.02, -0.55), 0.035, 'root', 1, segs=4, r2=0.006)     # tendrils, against the wall
p.rock(V(0, 1.75, 3.7), (0.7, 0.25, 0.5), 'stone_dk', 0, seed=120, sub=1)
finish(p, 'Low_Roots_Wood', low)

export(OUT)
