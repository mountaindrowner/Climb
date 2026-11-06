# The flitter's body: a cave bat in the skeleton's style. Chunky, low-poly forms with painted colour, an oversized head
# and ears, a fur ruff, leather wings stretched between finger spars with a torn, scalloped trailing edge, little hooked
# feet for roosting, fangs and glowing eyes. Rigged (body, head, jaw, ears, each wing's arm, forearm, three fingers
# and a thumb, legs) and animated for the flitter's states.
#
#   <venv with bpy>/bin/python tools/blender/bat.py
#   -> assets/models/bat/bat.glb
# Clips: Roost (wings wrapped, hanging; the game turns it head-down), Unfurl (roost to spread, with a shriek), Fly (one
# wingbeat), Dive (wings swept back, mouth open, a fast flutter), Hit (crumpled: the game tumbles it).
import os, sys, math
import bpy, bmesh
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from posekit import Poser
from mathutils import Vector, Matrix
from mathutils.geometry import delaunay_2d_cdt
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'bat', 'bat.glb')
bpy.ops.wm.read_factory_settings(use_empty=True)

def hsh(x, y, z, seed=0.0):
    h = math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453
    return h - math.floor(h)
def vnoise(p, cell, seed=0.0):
    x, y, z = p.x / cell, p.y / cell, p.z / cell; ix, iy, iz = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - ix, y - iy, z - iz; fx, fy, fz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    acc = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                acc += (fx if dx else 1 - fx) * (fy if dy else 1 - fy) * (fz if dz else 1 - fz) * hsh(ix + dx, iy + dy, iz + dz, seed)
    return acc

# ---- palette, as it should show on screen (the game draws colour values straight, without an sRGB curve): the
# skeleton's dried-blood red for the leather, plum-brown fur, bone for teeth and claws
FUR, BELLY, EAR_IN, LEATHER, SPAR, BONE, NOSE = (0.2, 0.13, 0.16), (0.34, 0.22, 0.2), (0.5, 0.2, 0.18), (0.27, 0.07, 0.065), (0.11, 0.06, 0.06), (0.8, 0.72, 0.55), (0.45, 0.24, 0.24)
def to_byte(c):      # vertex colours are stored sRGB and exported linear: store the curve's inverse, so the screen gets c
    f = lambda x: 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055
    return tuple(f(max(0.0, min(1.0, v))) for v in c)

# ---- the skeleton: the bat faces -Y, up is +Z, the left wing spreads along +X (rest pose: wings spread flat)
arm = bpy.data.objects.new('BatRig', bpy.data.armatures.new('BatRig')); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
EB = arm.data.edit_bones
def bone(name, h, t, parent=None, roll_up=True):
    b = EB.new(name); b.head = Vector(h); b.tail = Vector(t)
    if parent: b.parent = EB[parent]
    b.align_roll(Vector((0, 0, 1)) if roll_up else Vector((0, -1, 0)))
    return b
Z0 = 0.0
bone('root', (0, 0.05, Z0 - 0.02), (0, -0.05, Z0 - 0.02))
bone('body', (0, 0.16, Z0), (0, -0.1, Z0 + 0.02), 'root')
bone('head', (0, -0.1, Z0 + 0.03), (0, -0.28, Z0 + 0.06), 'body')
bone('jaw', (0, -0.16, Z0 - 0.04), (0, -0.27, Z0 - 0.05), 'head')
for s, sx in (('l', 1), ('r', -1)):
    X = lambda x: x * sx
    bone('ear.' + s, (X(0.06), -0.17, Z0 + 0.1), (X(0.13), -0.14, Z0 + 0.3), 'head')
    S, E, W = (X(0.13), -0.03, Z0 + 0.04), (X(0.34), 0.03, Z0 + 0.05), (X(0.56), -0.05, Z0 + 0.05)   # short, strong arms
    bone('upperarm.' + s, S, E, 'body'); bone('forearm.' + s, E, W, 'upperarm.' + s)
    bone('finger1.' + s, W, (X(0.86), 0.02, Z0 + 0.05), 'forearm.' + s)      # the long leading finger
    bone('finger2.' + s, W, (X(0.78), 0.27, Z0 + 0.05), 'forearm.' + s)
    bone('finger3.' + s, W, (X(0.56), 0.38, Z0 + 0.05), 'forearm.' + s)
    bone('thumb.' + s, W, (X(0.6), -0.12, Z0 + 0.05), 'forearm.' + s)
    bone('leg.' + s, (X(0.05), 0.15, Z0 - 0.03), (X(0.07), 0.2, Z0 - 0.17), 'body', roll_up=False)
bone('tail', (0, 0.16, Z0), (0, 0.3, Z0 - 0.02), 'body')
JOINT = {b.name: (b.head.copy(), b.tail.copy()) for b in EB}
bpy.ops.object.mode_set(mode='OBJECT')

# ---- geometry: parts built in one bmesh, each face tagged with a material, each vertex with its bone weights
bm = bmesh.new(); col = bm.loops.layers.color.new('Col'); WEIGHTS = {}     # vert index -> {bone: w}
MATS = ['bat_fur', 'bat_leather', 'bat_bone']
def tag(verts, bone_w):
    for v in verts: WEIGHTS[v] = bone_w
def blob(center, radii, bone_name, mat=0, u=10, v=7, jag=0.12, shade=FUR, seed=0):
    res = bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=1.0)
    vs = res['verts']
    for vv in vs:
        p = vv.co.copy(); j = 1 + (hsh(p.x, p.y, p.z, seed) - 0.5) * jag      # hand-cut, not machine-round
        vv.co = Vector((p.x * radii[0] * j, p.y * radii[1] * j, p.z * radii[2] * j)) + Vector(center)
    faces = {f for vv in vs for f in vv.link_faces}
    for f in faces: f.material_index = mat; f.smooth = True
    tag(vs, {bone_name: 1.0}); return vs, faces
def cone(base, tip, r, bone_name, mat=0, segs=6, shade=None):
    base, tip = Vector(base), Vector(tip)
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=0.0, depth=(tip - base).length)
    d = (tip - base).normalized(); rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((base + tip) / 2) @ rot, verts=res['verts'])
    for f in {f for vv in res['verts'] for f in vv.link_faces}: f.material_index = mat; f.smooth = False
    tag(res['verts'], {bone_name: 1.0}); return res['verts']
def spar(a, b, r, bone_name):
    a, b = Vector(a), Vector(b)
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=r, radius2=r * 0.55, depth=(b - a).length)
    d = (b - a).normalized(); rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((a + b) / 2) @ rot, verts=res['verts'])
    for f in {f for vv in res['verts'] for f in vv.link_faces}: f.material_index = 0; f.smooth = True
    tag(res['verts'], {bone_name: 1.0}); return res['verts']

# body, belly, head, snout, ears, ruff
blob((0, 0.04, 0.0), (0.16, 0.19, 0.145), 'body', seed=1)
blob((0, -0.0, -0.045), (0.125, 0.15, 0.1), 'body', seed=2)                     # the lighter belly, pushed through below
blob((0, -0.18, 0.05), (0.14, 0.125, 0.12), 'head', seed=3)
blob((0, -0.27, 0.03), (0.055, 0.05, 0.045), 'head', u=8, v=6, seed=4)          # snout
INNER = set()                                                                      # faces painted raw (ears' insides)
def leaf(base, up, out, width, length, bone_name, cup=0.02, rows=5, inner=True):
    """A thin leaf (an ear, the nose leaf): broad at the base, pointed, cupped toward `out`, with an inner and an
    outer face."""
    up = Vector(up).normalized(); out = Vector(out); out = (out - out.dot(up) * up).normalized(); across = up.cross(out)
    th = 0.008; front, back = [], []
    for j in range(rows + 1):
        v = j / rows; w = width * (1 - v) ** 0.75; rowf, rowb = [], []
        for i in range(5):
            u = i / 4 - 0.5; c = Vector(base) + up * (length * v) + across * (u * 2 * w) - out * (cup * (1 - (2 * u) ** 2) * (1 - v * 0.6))
            rowf.append(bm.verts.new(c + out * th)); rowb.append(bm.verts.new(c - out * th))
        front.append(rowf); back.append(rowb)
    for j in range(rows):
        for i in range(4):
            f = bm.faces.new((front[j][i], front[j][i + 1], front[j + 1][i + 1], front[j + 1][i])); f.material_index = 0; f.smooth = True
            if inner: INNER.add(f)
            b = bm.faces.new((back[j][i + 1], back[j][i], back[j + 1][i], back[j + 1][i + 1])); b.material_index = 0; b.smooth = True
    for j in range(rows):                                                             # the rim, closing the edges
        for row_i in (0, 4):
            a, b_ = (front[j][row_i], front[j + 1][row_i]), (back[j][row_i], back[j + 1][row_i])
            try: bm.faces.new((a[0], a[1], b_[1], b_[0]) if row_i == 0 else (a[1], a[0], b_[0], b_[1])).material_index = 0
            except ValueError: pass
    tag([v for r in front + back for v in r], {bone_name: 1.0})
leaf((0, -0.3, 0.055), (0, -0.25, 1), (0, -1, 0.1), 0.022, 0.05, 'head', cup=0.006, rows=3, inner=False)   # the nose leaf: small and flat
for sx in (1, -1):                                                                 # brows: two hard ridges over the eyes, a scowl
    s = 'l' if sx > 0 else 'r'
    res = bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(0.055, 0.03, 0.018), verts=res['verts'])
    bmesh.ops.transform(bm, matrix=Matrix.Translation((sx * 0.058, -0.285, 0.118)) @ Matrix.Rotation(-sx * 0.45, 4, 'Y') @ Matrix.Rotation(0.3, 4, 'X'), verts=res['verts'])
    for f in {f for vv in res['verts'] for f in vv.link_faces}: f.material_index = 0; f.smooth = False
    tag(res['verts'], {'head': 1.0})
blob((0, -0.22, -0.04), (0.06, 0.06, 0.03), 'jaw', u=8, v=5, seed=5)            # lower jaw
for sx in (1, -1):
    s = 'l' if sx > 0 else 'r'
    eh, et = JOINT['ear.' + s]
    # an ear: a tall leaf, broad at the root, cupped forward and a little out, raw inside
    leaf(eh - Vector((0, 0, 0.02)), et - eh, Vector((sx * 0.45, -1, 0.0)), 0.075, (et - eh).length * 1.25, 'ear.' + s, cup=0.03)
    for k in range(2): cone((sx * (0.02 + 0.015 * k), -0.29, -0.015), (sx * (0.022 + 0.015 * k), -0.29, -0.06), 0.009, 'head', mat=2, segs=4)   # fangs
    # feet: a short shank and three hooked claws
    lh, lt = JOINT['leg.' + s]
    spar(lh, lt, 0.022, 'leg.' + s)
    for k in (-1, 0, 1): cone(lt, lt + Vector((sx * 0.012 * k, -0.035, -0.03)), 0.008, 'leg.' + s, mat=2, segs=4)
for k in range(9):
    a = k / 9 * math.tau
    base = Vector((math.cos(a) * 0.11, -0.09 + math.sin(a) * 0.02, math.sin(a) * 0.09))
    cone(base, base + Vector((math.cos(a) * 0.06, 0.05 + 0.03 * hsh(k, 0, 0), math.sin(a) * 0.05)), 0.03, 'body', segs=4)   # the ruff
cone((0, -0.16, 0.14), (0.0, -0.1, 0.2), 0.035, 'head', segs=4)                    # a tuft on the crown
tail_h, tail_t = JOINT['tail']; spar(tail_h, tail_t, 0.02, 'tail')

# wings: finger spars, then the membrane between them
for sx in (1, -1):
    s = 'l' if sx > 0 else 'r'
    for b, r in (('upperarm', 0.042), ('forearm', 0.032), ('finger1', 0.016), ('finger2', 0.014), ('finger3', 0.014), ('thumb', 0.015)):
        h, t = JOINT[b + '.' + s]; spar(h, t, r, b + '.' + s)
    th, tt = JOINT['thumb.' + s]; cone(tt, tt + Vector((sx * 0.01, -0.03, -0.02)), 0.01, 'thumb.' + s, mat=2, segs=4)   # the thumb's hook
    # the membrane's outline, in the wing plane (x, y): along the arm, out the leading finger, then a scalloped,
    # torn trailing edge from fingertip to fingertip and back to the hip
    S, E, W = JOINT['upperarm.' + s][0], JOINT['forearm.' + s][0], JOINT['forearm.' + s][1]
    F1, F2, F3 = JOINT['finger1.' + s][1], JOINT['finger2.' + s][1], JOINT['finger3.' + s][1]
    HIP = Vector((sx * 0.07, 0.2, 0.0))
    def scallop(a, b, depth, n, seed):
        out = []
        for i in range(1, n):
            u = i / n; p = a.lerp(b, u); mid = (a + b) / 2
            inward = (W - mid).normalized() if (W - mid).length > 1e-4 else Vector((0, -1, 0))
            cut = depth * math.sin(math.pi * u) * (0.75 + 0.5 * hsh(i, seed, sx))
            if hsh(i, seed, 3 * sx) > 0.72: cut += depth * 0.45                           # a tear
            out.append(p + inward * cut)
        return out
    outline = [S, E, W, F1] + scallop(F1, F2, 0.09, 6, 1) + [F2] + scallop(F2, F3, 0.08, 6, 2) + [F3] + scallop(F3, HIP, 0.07, 7, 3) + [HIP]
    spars = [(W, F1, 'finger1.'), (W, F2, 'finger2.'), (W, F3, 'finger3.'), (E, W, 'forearm.'), (S, E, 'upperarm.'), (S, HIP, 'body')]
    pts = [Vector((p.x, p.y)) for p in outline]
    edges = [(i, (i + 1) % len(pts)) for i in range(len(pts))]
    # inner points along each finger and over the panels, so the membrane bends between the spars
    for a, b, _ in spars[:3]:
        for u in (0.33, 0.66):
            pts.append(Vector(((a.x + (b.x - a.x) * u), (a.y + (b.y - a.y) * u))))
    for (a1, b1, _), (a2, b2, _) in ((spars[0], spars[1]), (spars[1], spars[2])):
        for u in (0.45, 0.8):
            m = (a1.lerp(b1, u) + a2.lerp(b2, u)) / 2; pts.append(Vector((m.x, m.y)))
    for u, w_ in ((0.3, 0.5), (0.6, 0.5), (0.45, 0.25)):
        m = S.lerp(F3, u).lerp(E.lerp(HIP, u), w_); pts.append(Vector((m.x, m.y)))
    def inside(q, poly):
        c = False
        for i in range(len(poly)):
            a, b = poly[i], poly[i - 1]
            if (a.y > q.y) != (b.y > q.y) and q.x < (b.x - a.x) * (q.y - a.y) / (b.y - a.y) + a.x: c = not c
        return c
    poly = pts[:len(outline)]; xs = [p.x for p in poly]; ys = [p.y for p in poly]
    gx = min(xs)
    while gx < max(xs):
        gy = min(ys)
        while gy < max(ys):
            q = Vector((gx + 0.012 * (hsh(gx, gy, 1) - 0.5), gy + 0.012 * (hsh(gx, gy, 2) - 0.5)))
            if inside(q, poly) and min((q - p).length for p in pts) > 0.03: pts.append(q)
            gy += 0.055
        gx += 0.055
    vco, ved, vfa, *_ = delaunay_2d_cdt(pts, edges, [], 2, 1e-5)                       # 2: inside the outline only
    base = len(bm.verts)
    nv = [bm.verts.new((p.x, p.y, 0.04)) for p in vco]; bm.verts.ensure_lookup_table()
    for f in vfa:
        try:
            face = bm.faces.new([nv[i] for i in (f if sx > 0 else reversed(f))]); face.material_index = 1; face.smooth = True
        except ValueError: pass
    # weights: shared between the two spars nearest each point (inverse distance), so the panel between them stretches
    def seg_d(p, a, b):
        ab = (b - a).xy; t = max(0, min(1, (p.xy - a.xy).dot(ab) / max(1e-8, ab.length_squared))); return (p.xy - (a.xy + ab * t)).length
    for v in nv:
        ds = sorted(((seg_d(v.co, a, b), (n + s) if n != 'body' else 'body') for a, b, n in spars))
        (d1, b1), (d2, b2) = ds[0], ds[1]
        w1 = 1 / (d1 + 0.01); w2 = 1 / (d2 + 0.01)
        WEIGHTS[v] = {b1: w1 / (w1 + w2), b2: w2 / (w1 + w2)} if b1 != b2 else {b1: 1.0}

# ---- colour: painted, uneven, darker in the hollows and at the fingers, the membrane's edges lighter where it is thin
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
for f in bm.faces:
    for l in f.loops:
        p = l.vert.co; n = vnoise(p, 0.06, 2); m = f.material_index
        if m == 2: c = Vector(BONE) * (0.85 + 0.25 * n)
        elif m == 1:
            # leather: veins darker along the spars, the free edge thin and a touch lighter, blotched
            ws = WEIGHTS.get(l.vert, {}); along = max(ws.values()) if ws else 1
            out = min(1.0, abs(p.x) / 0.8)                                               # darker toward the body, thin and warm at the tips
            c = Vector(LEATHER) * (0.75 + 0.45 * out)
            c = c.lerp(Vector(SPAR), max(0, along - 0.72) * 2.2) * (0.78 + 0.44 * n)
        else:
            c = Vector(FUR) * (0.7 + 0.6 * n)
            if p.z < -0.03 and abs(p.y) < 0.15: c = c.lerp(Vector(BELLY), 0.7)          # the belly
            if f in INNER: c = Vector(EAR_IN) * (0.8 + 0.4 * n) * (0.65 + 0.35 * min(1, (p.z - 0.1) / 0.2))   # the ear's raw inside, darker deep in
            if p.y < -0.28 and p.z > 0.0: c = c.lerp(Vector(NOSE), 0.6)
        l[col] = (*to_byte((c.x, c.y, c.z)), 1.0)
me = bpy.data.meshes.new('Bat_Body'); bm.to_mesh(me)
for ca in [c for c in me.color_attributes if c.name != 'Col']: me.color_attributes.remove(ca)
me.color_attributes.active_color = me.color_attributes['Col']; me.color_attributes.render_color_index = me.color_attributes.find('Col')
print('colour attributes', [(c.name, c.domain, c.data_type) for c in me.color_attributes])
vw = {v.index: WEIGHTS.get(v, {'body': 1.0}) for v in bm.verts}; bm.free()
body = bpy.data.objects.new('Bat_Body', me); bpy.context.collection.objects.link(body)
for name in MATS:
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'; nt.links.new(vc.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = {'bat_fur': 0.95, 'bat_leather': 0.7, 'bat_bone': 0.5}[name]
    if name == 'bat_leather': m.use_backface_culling = False                       # both faces of the membrane show
    me.materials.append(m)
for bname in {b for w in vw.values() for b in w}: body.vertex_groups.new(name=bname)
for i, w in vw.items():
    for bname, x in w.items(): body.vertex_groups[bname].add([i], x, 'REPLACE')
body.parent = arm; mod = body.modifiers.new('Armature', 'ARMATURE'); mod.object = arm
# eyes: their own mesh, so the game can light them (gold while it hunts, red as it dives)
ebm = bmesh.new()
for sx in (1, -1):
    r = bmesh.ops.create_uvsphere(ebm, u_segments=8, v_segments=6, radius=0.024)
    bmesh.ops.scale(ebm, vec=(1.45, 1.0, 1.25), verts=r['verts'])
    bmesh.ops.translate(ebm, vec=Vector((sx * 0.062, -0.287, 0.08)), verts=r['verts'])   # on the face, under the brow
eme = bpy.data.meshes.new('Bat_Eyes'); ebm.to_mesh(eme); ebm.free()
eyes = bpy.data.objects.new('Bat_Eyes', eme); bpy.context.collection.objects.link(eyes)
em = bpy.data.materials.new('bat_eye'); em.use_nodes = True; eb = em.node_tree.nodes['Principled BSDF']
eb.inputs['Base Color'].default_value = (1.0, 0.7, 0.25, 1); eb.inputs['Emission Color'].default_value = (1.0, 0.7, 0.25, 1); eb.inputs['Emission Strength'].default_value = 3.0
eme.materials.append(em)
eyes.parent = arm; eyes.parent_type = 'BONE'; eyes.parent_bone = 'head'
eyes.matrix_world = Matrix.Identity(4)
print('bat:', len(me.vertices), 'verts', len(me.polygons), 'faces')

# ---- poses, by aiming bones (armature space: -Y forward, +Z up, the left wing along +X)
po = Poser(arm); po.keyed = [b.name for b in arm.data.bones]
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'
def V(x, y, z): return Vector((x, y, z)).normalized()
def mir(v, s): return Vector((v.x if s == 'l' else -v.x, v.y, v.z))
def raise_(v, ang):      # turn a left-wing direction about the body's long axis: up for positive angles
    return Vector((v.x * math.cos(ang) - v.z * math.sin(ang), v.y, v.x * math.sin(ang) + v.z * math.cos(ang)))
SPREAD = {'upperarm': V(1, 0.22, 0), 'forearm': V(1, -0.27, 0), 'finger1': V(1, 0.19, 0), 'finger2': V(0.86, 0.95, 0), 'finger3': V(0.02, 1, 0), 'thumb': V(0.4, -0.9, 0)}
def wing(spec, s, ang=0.0, sweep=0.0, curl=0.0):
    """Aim one wing: spec directions for the left wing, raised by ang, swept back by sweep, fingers curled by curl."""
    for b in ('upperarm', 'forearm', 'finger1', 'finger2', 'finger3', 'thumb'):
        d = Vector(spec[b])
        if sweep: d = (Matrix.Rotation(-sweep if b != 'upperarm' else -sweep * 0.5, 3, 'Z') @ d)
        a = ang * (1.0 if b == 'upperarm' else 1.0 + curl * (0.5 if b == 'forearm' else 1.0))
        po.aim(b + '.' + s, mir(raise_(d, a), s))
def pose(ang=0.0, sweep=0.0, curl=0.0, head=V(0, -1, 0.15), jaw=0.0, ears=0.0, legs=V(0.1, 0.4, -1), spec=SPREAD, body_tilt=0.0, bob=0.0, root=None, ear_dir=None):
    po.restore(rest)
    if root is not None: po.aim('root', root)                                    # the whole bat turned (the roost hangs it head-down)
    pb = po.P['root']; m = pb.matrix.copy(); m.translation.z += bob; pb.matrix = m; po.update()
    if body_tilt: po.aim('body', V(0, -1, body_tilt))
    po.aim('head', head)
    po.aim('jaw', V(0, -1, -0.1 - jaw))
    for s in 'lr':
        po.aim('ear.' + s, mir(ear_dir if ear_dir is not None else V(0.35, 0.15 + ears, 1), s))
        po.aim('leg.' + s, mir(legs, s))
        wing(spec, s, ang, sweep, curl)
    return po.snapshot()
rest = po.snapshot()
FOLD = {'upperarm': V(0.5, -0.2, 0.85), 'forearm': V(-0.25, -0.5, -0.85), 'finger1': V(-0.1, -0.3, -1), 'finger2': V(0.12, -0.2, -1), 'finger3': V(0.35, -0.05, -0.95), 'thumb': V(0.25, -0.45, 0.85)}
ROOST = dict(root=V(0, 0.05, -1), head=V(0, -0.3, -1), legs=V(0.12, 0.1, 1), ear_dir=V(0.4, -0.15, -1))
roost = lambda breathe, ear: pose(spec=FOLD, jaw=0.05, bob=breathe, **{**ROOST, 'ear_dir': V(0.4, -0.15 + ear, -1)})
po.make_action('Roost', [(0, roost(0, 0)), (24, roost(0.006, 0.12)), (36, roost(0.003, -0.05)), (48, roost(0, 0))])
# unfurl: wrapped to spread, the jaw open in a shriek
unf = []
for i, f in enumerate((0, 3, 6, 9, 12)):
    u = i / 4
    spec = {k: (FOLD[k].lerp(SPREAD[k], u)).normalized() for k in SPREAD}
    unf.append((f, pose(spec=spec, ang=0.6 * u, jaw=0.6 * math.sin(math.pi * u) + 0.3 * u, root=V(0, 0.05, -1).lerp(V(0, -1, 0), u).normalized(),
                        head=V(0, -0.3, -1).lerp(V(0, -1, 0.3), u).normalized(), legs=V(0.12, 0.1, 1).lerp(V(0.1, 0.4, -1), u).normalized(),
                        ear_dir=V(0.4, -0.15, -1).lerp(V(0.35, 0.0, 1), u).normalized())))
po.make_action('Unfurl', unf)
# fly: one wingbeat; the downstroke drives the body up, the upstroke folds the hand a little to slip the air
po.make_action('Fly', [(0, pose(ang=0.85, curl=0.1, bob=-0.02)), (3, pose(ang=0.2, bob=0.0)), (6, pose(ang=-0.75, curl=-0.1, bob=0.03)),
                       (9, pose(ang=-0.1, sweep=0.25, curl=0.4, bob=0.01)), (12, pose(ang=0.85, curl=0.1, bob=-0.02))])
# dive: swept back like a falcon, mouth open, ears flat, a quick shiver at the tips
DIVE = dict(sweep=0.75, head=V(0, -1, -0.1), jaw=0.55, ears=0.6, legs=V(0.05, 1, -0.3), body_tilt=-0.15)
po.make_action('Dive', [(0, pose(ang=0.15, curl=0.2, **DIVE)), (2, pose(ang=-0.1, curl=0.3, **DIVE)), (4, pose(ang=0.15, curl=0.2, **DIVE))])
# hit: crumpled, one wing folding, the other flung up, jaw slack
hit_spec = {k: (FOLD[k] * 0.6 + SPREAD[k] * 0.4).normalized() for k in SPREAD}
po.make_action('Hit', [(0, pose(spec=hit_spec, ang=0.9, jaw=0.4, head=V(0, -0.6, -0.8), ears=0.4)), (6, pose(spec=hit_spec, ang=0.5, jaw=0.5, head=V(0, -0.7, -0.6), ears=0.5))])
po.restore(rest)
print('clips', [a.name for a in bpy.data.actions])

os.makedirs(os.path.dirname(OUT), exist_ok=True)
for a in bpy.data.actions: a.use_fake_user = True
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_vertex_color='MATERIAL',
                          export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes')
