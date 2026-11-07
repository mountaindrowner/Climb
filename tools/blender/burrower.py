# The burrower's body: the thing under the stair, in the skeleton's and the bat's style. A blind, armoured grub: a
# column of pale ringed segments shingled with dark chitin scutes, a bony collar ringed with small glowing pits, and a
# head of five jaw plates that close into a spiked cone (the drill it ploughs through the steps with) and splay open
# like a flower to show the teeth on their inner faces, two rings of teeth down the throat and a glow at the bottom.
# Rigged (a spine of four segments, the collar, five jaws, the throat) and animated for the burrower's states.
#
#   <venv with bpy>/bin/python tools/blender/burrower.py
#   -> assets/models/burrower/burrower.glb
# Clips: Closed (the drill, still), Rise (wriggles up, then bursts open), Open (waiting, breathing, the jaws flexing),
# Snap (slams shut and lunges, then opens again), Hit (recoils), Sink (closes and draws down). The game moves it up and
# down; the clips pose it. Built in game units: the collar's top sits 0.3 above the model's origin; it faces -Y
# (glTF +Z), up is +Z (glTF +Y).
import os, sys, math
import bpy, bmesh
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from posekit import Poser
from mathutils import Vector, Matrix
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'burrower', 'burrower.glb')
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

# ---- palette, as it should show on screen: grub-pale flesh with a sick mauve, dark plum chitin, the skeleton's bone,
# raw red inside the jaws, the throat near black
FLESH, FOLD, CHITIN, EDGE, BONE, RAW, THROAT = (0.56, 0.44, 0.44), (0.33, 0.22, 0.25), (0.15, 0.1, 0.11), (0.3, 0.22, 0.2), (0.8, 0.72, 0.55), (0.46, 0.1, 0.1), (0.1, 0.02, 0.03)
def to_byte(c):      # vertex colours are stored sRGB and exported linear: store the curve's inverse, so the screen gets c
    f = lambda x: 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055
    return tuple(f(max(0.0, min(1.0, v))) for v in c)

# ---- the skeleton: a vertical spine, the collar, five jaws hinged on its rim, the throat
N_JAW, RIM_R, RIM_Z, APEX = 5, 0.31, 0.28, Vector((0, 0, 0.92))
arm = bpy.data.objects.new('BurrowerRig', bpy.data.armatures.new('BurrowerRig')); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
EB = arm.data.edit_bones
def bone(name, h, t, parent=None, roll=Vector((0, -1, 0))):
    b = EB.new(name); b.head = Vector(h); b.tail = Vector(t)
    if parent: b.parent = EB[parent]
    b.align_roll(roll)
    return b
SEG_Z = [-1.85, -1.4, -0.95, -0.5, -0.05]
bone('root', (0, 0, -2.1), (0, 0, -1.85))
for i in range(4): bone('seg%d' % (i + 1), (0, 0, SEG_Z[i]), (0, 0, SEG_Z[i + 1]), 'root' if i == 0 else 'seg%d' % i)
bone('head', (0, 0, -0.05), (0, 0, 0.3), 'seg4')
bone('throat', (0, 0, -0.2), (0, 0, 0.1), 'head')
HINGE = []
for i in range(N_JAW):
    th = i / N_JAW * math.tau + math.pi / 2          # jaw 0 faces -Y... no: +Y; the game turns the whole body anyway
    h = Vector((RIM_R * math.cos(th), RIM_R * math.sin(th), RIM_Z)); HINGE.append((th, h))
    bone('jaw.%d' % i, h, h + (APEX - h) * 0.6, 'head', roll=Vector((math.cos(th), math.sin(th), 0)))
JOINT = {b.name: (b.head.copy(), b.tail.copy()) for b in EB}
bpy.ops.object.mode_set(mode='OBJECT')

# ---- geometry: parts in one bmesh, each face with a material, each vertex with its bone weights
bm = bmesh.new(); col = bm.loops.layers.color.new('Col'); WEIGHTS = {}; KIND = {}   # face -> paint kind
MATS = ['burrower_flesh', 'burrower_chitin', 'burrower_bone']
def tag(verts, w):
    for v in verts: WEIGHTS[v] = w
def faces_of(vs): return {f for v in vs for f in v.link_faces}
def paint(fs, kind, mat):
    for f in fs: f.material_index = mat; KIND[f] = kind
def blob(center, radii, w, kind='flesh', mat=0, u=12, v=8, jag=0.1, seed=0, smooth=True):
    res = bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=1.0); vs = res['verts']
    for vv in vs:
        p = vv.co.copy(); j = 1 + (hsh(p.x, p.y, p.z, seed) - 0.5) * jag
        vv.co = Vector((p.x * radii[0] * j, p.y * radii[1] * j, p.z * radii[2] * j)) + Vector(center)
    fs = faces_of(vs); paint(fs, kind, mat)
    for f in fs: f.smooth = smooth
    tag(vs, w); return vs
def cone(base, tip, r, w, kind='bone', mat=2, segs=5):
    base, tip = Vector(base), Vector(tip)
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=0.0, depth=(tip - base).length)
    d = (tip - base).normalized(); rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((base + tip) / 2) @ rot, verts=res['verts'])
    fs = faces_of(res['verts']); paint(fs, kind, mat)
    for f in fs: f.smooth = False
    tag(res['verts'], w); return res['verts']
def plate(center, size, normal, up, w, tilt=0.0, kind='chitin', mat=1):
    """A slab (a scute): size (across, along `up`, thick), its face turned to `normal`, its top tipped out by tilt."""
    n = Vector(normal).normalized(); u = Vector(up); u = (u - u.dot(n) * n).normalized(); a = u.cross(n)
    rot = Matrix((a, u, n)).transposed()
    rot = Matrix.Rotation(tilt, 3, a) @ rot
    res = bmesh.ops.create_cube(bm, size=1.0)
    for vv in res['verts']:
        p = vv.co; q = Vector((p.x * size[0] * (1 - 0.35 * (p.y + 0.5)), p.y * size[1], p.z * size[2]))   # tapering to the top
        vv.co = rot @ q + Vector(center)
    fs = faces_of(res['verts']); paint(fs, kind, mat)
    for f in fs: f.smooth = False
    tag(res['verts'], w); return res['verts']

# the column: ringed segments, each shingled with six scutes and a few bone barbs
for k in range(4):
    z0, z1 = SEG_Z[k], SEG_Z[k + 1]; zc = (z0 + z1) / 2; r = 0.33 + 0.012 * k; w = {'seg%d' % (k + 1): 1.0}
    blob((0, 0, zc), (r, r, 0.27), w, seed=k + 1)
    blob((0, 0, z1 - 0.02), (r * 0.88, r * 0.88, 0.09), {'seg%d' % (k + 1): 0.5, ('seg%d' % (k + 2) if k < 3 else 'head'): 0.5}, kind='fold', seed=k + 11, u=12, v=5)   # the crease between rings
    for j in range(6):
        a = j / 6 * math.tau + (0.5 if k % 2 else 0) * math.tau / 6
        n = Vector((math.cos(a), math.sin(a), 0))
        plate(n * (r + 0.015) + Vector((0, 0, zc + 0.03)), (0.24, 0.3, 0.05), n, (0, 0, 1), w, tilt=-0.28)
        if (j + k) % 3 == 0: cone(n * (r + 0.05) + Vector((0, 0, zc + 0.12)), n * (r + 0.19) + Vector((0, 0, zc + 0.27)), 0.035, w)
# the collar: a heavy ring of bony knobs, and the small glowing pits under them (the eyes, in their own mesh below)
res = bmesh.ops.create_cone(bm, cap_ends=False, segments=14, radius1=0.37, radius2=0.33, depth=0.36)
bmesh.ops.translate(bm, vec=Vector((0, 0, 0.11)), verts=res['verts'])
for vv in res['verts']: vv.co += Vector((vv.co.x, vv.co.y, 0)).normalized() * (hsh(vv.co.x, vv.co.y, vv.co.z, 4) - 0.5) * 0.04
paint(faces_of(res['verts']), 'chitin', 1); tag(res['verts'], {'head': 1.0})
for j in range(10):
    a = j / 10 * math.tau + 0.31; n = Vector((math.cos(a), math.sin(a), 0))
    blob(n * 0.355 + Vector((0, 0, 0.27)), (0.07, 0.07, 0.055), {'head': 1.0}, kind='bone', mat=2, u=6, v=4, jag=0.3, seed=j + 20, smooth=False)
# the throat: a dark funnel down from the rim, two rings of teeth on its wall pointing in and down
res = bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=0.05, radius2=0.31, depth=0.6)
bmesh.ops.translate(bm, vec=Vector((0, 0, -0.02)), verts=res['verts'])
bmesh.ops.reverse_faces(bm, faces=list(faces_of(res['verts'])))
paint(faces_of(res['verts']), 'throat', 0); tag(res['verts'], {'throat': 1.0})
for ring, (z, rr, n, ln) in enumerate(((0.2, 0.27, 11, 0.13), (0.03, 0.17, 8, 0.1))):
    for j in range(n):
        a = j / n * math.tau + ring * 0.3; d = Vector((math.cos(a), math.sin(a), 0))
        base = d * rr + Vector((0, 0, z)); cone(base, base - d * ln + Vector((0, 0, -ln * 0.6)), 0.03, {'throat': 1.0}, segs=4)
# the jaws: five curved plates, shut into an ogive cone; dark chitin outside, raw inside, teeth on the inner face
SPAN = math.tau / N_JAW * 0.94
for i, (th, h) in enumerate(HINGE):
    w = {'jaw.%d' % i: 1.0}; U, V = 5, 7; outer, inner = [], []
    for jv in range(V + 1):
        v = jv / V; ro, ri = [], []
        for ju in range(U + 1):
            u = ju / U - 0.5; a = th + u * SPAN * (1 - 0.55 * v ** 1.3)
            rad = RIM_R * (1 - v) + 0.02 * v + 0.075 * math.sin(math.pi * v) * (1 - 0.6 * v)
            zz = RIM_Z + (APEX.z - RIM_Z) * v
            p = Vector((rad * math.cos(a), rad * math.sin(a), zz))
            nrm = Vector((math.cos(a), math.sin(a), 0.35)).normalized()
            th_ = 0.04 * (1 - 0.7 * v)
            ro.append(bm.verts.new(p)); ri.append(bm.verts.new(p - nrm * th_))
        outer.append(ro); inner.append(ri)
    fo, fi = set(), set()
    for jv in range(V):
        for ju in range(U):
            fo.add(bm.faces.new((outer[jv][ju], outer[jv][ju + 1], outer[jv + 1][ju + 1], outer[jv + 1][ju])))
            fi.add(bm.faces.new((inner[jv][ju + 1], inner[jv][ju], inner[jv + 1][ju], inner[jv + 1][ju + 1])))
    rimf = set()
    for jv in range(V):                                       # the plate's edges
        for ju in (0, U):
            q = (outer[jv][ju], outer[jv + 1][ju], inner[jv + 1][ju], inner[jv][ju]); rimf.add(bm.faces.new(q if ju == 0 else tuple(reversed(q))))
    for ju in range(U):
        rimf.add(bm.faces.new((outer[0][ju + 1], outer[0][ju], inner[0][ju], inner[0][ju + 1])))
    paint(fo, 'jaw_out', 1); paint(fi, 'raw', 0); paint(rimf, 'edge', 1)
    for f in fo | fi | rimf: f.smooth = True
    tag([vv for r in outer + inner for vv in r], w)
    # teeth: a row up the middle of the inner face and two at its shoulders, pointing in toward the axis and down
    for v, u, ln in ((0.18, 0, 0.17), (0.42, 0, 0.15), (0.64, 0, 0.11), (0.3, -0.3, 0.1), (0.3, 0.3, 0.1)):
        a = th + u * SPAN * (1 - 0.55 * v ** 1.3); rad = RIM_R * (1 - v) + 0.075 * math.sin(math.pi * v) - 0.03
        base = Vector((rad * math.cos(a), rad * math.sin(a), RIM_Z + (APEX.z - RIM_Z) * v))
        cone(base, base + Vector((-math.cos(a), -math.sin(a), -0.55)).normalized() * ln, 0.032, w)
    tip = APEX + Vector((math.cos(th), math.sin(th), 0)) * 0.02
    cone(tip - Vector((0, 0, 0.1)) + Vector((math.cos(th), math.sin(th), 0)) * 0.04, tip + Vector((0, 0, 0.08)), 0.03, w)   # a hooked point

# ---- colour: painted, uneven; the flesh paler on the ridges, the chitin with lighter worn edges
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
for f in bm.faces:
    kind = KIND.get(f, 'flesh')
    for l in f.loops:
        p = l.vert.co; n = vnoise(p, 0.07, 3)
        if kind == 'bone': c = Vector(BONE) * (0.8 + 0.3 * n)
        elif kind == 'chitin': c = Vector(CHITIN).lerp(Vector(EDGE), max(0, n - 0.45) * 1.6) * (0.8 + 0.4 * n)
        elif kind == 'jaw_out': c = Vector(CHITIN).lerp(Vector(EDGE), max(0, (p.z - 0.55) * 2.2)) * (0.8 + 0.45 * n)   # the points worn pale
        elif kind == 'edge': c = Vector(EDGE) * (0.85 + 0.3 * n)
        elif kind == 'raw': c = Vector(RAW) * (0.7 + 0.5 * n)
        elif kind == 'throat': c = Vector(THROAT).lerp(Vector(RAW), max(0, (p.z - 0.05) * 2.5)) * (0.8 + 0.4 * n)
        elif kind == 'fold': c = Vector(FOLD) * (0.8 + 0.4 * n)
        else: c = Vector(FLESH).lerp(Vector(FOLD), 0.35 * (1 - n)) * (0.85 + 0.3 * n)
        l[col] = (*to_byte((c.x, c.y, c.z)), 1.0)
me = bpy.data.meshes.new('Burrower_Body'); bm.to_mesh(me)
for ca in [c for c in me.color_attributes if c.name != 'Col']: me.color_attributes.remove(ca)
me.color_attributes.active_color = me.color_attributes['Col']; me.color_attributes.render_color_index = me.color_attributes.find('Col')
vw = {v.index: WEIGHTS.get(v, {'head': 1.0}) for v in bm.verts}; bm.free()
body = bpy.data.objects.new('Burrower_Body', me); bpy.context.collection.objects.link(body)
for name in MATS:
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'; nt.links.new(vc.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = {'burrower_flesh': 0.75, 'burrower_chitin': 0.55, 'burrower_bone': 0.5}[name]
    me.materials.append(m)
for bname in {b for w in vw.values() for b in w}: body.vertex_groups.new(name=bname)
for i, w in vw.items():
    for bname, x in w.items(): body.vertex_groups[bname].add([i], x, 'REPLACE')
body.parent = arm; mod = body.modifiers.new('Armature', 'ARMATURE'); mod.object = arm
# the glow: pits round the collar and a coal deep in the throat, their own mesh, so the game lights them in the zone's glow
gbm = bmesh.new()
for j in range(8):
    a = j / 8 * math.tau + 0.1; d = Vector((math.cos(a), math.sin(a), 0))
    r = bmesh.ops.create_uvsphere(gbm, u_segments=6, v_segments=4, radius=0.028); bmesh.ops.translate(gbm, vec=d * 0.372 + Vector((0, 0, 0.13 + 0.03 * (j % 2))), verts=r['verts'])
r = bmesh.ops.create_uvsphere(gbm, u_segments=8, v_segments=6, radius=0.09); bmesh.ops.translate(gbm, vec=Vector((0, 0, -0.17)), verts=r['verts'])
gme = bpy.data.meshes.new('Burrower_Glow'); gbm.to_mesh(gme); gbm.free()
glow = bpy.data.objects.new('Burrower_Glow', gme); bpy.context.collection.objects.link(glow)
gm = bpy.data.materials.new('burrower_glow'); gm.use_nodes = True; gb = gm.node_tree.nodes['Principled BSDF']
gb.inputs['Base Color'].default_value = (1.0, 0.6, 0.3, 1); gb.inputs['Emission Color'].default_value = (1.0, 0.6, 0.3, 1); gb.inputs['Emission Strength'].default_value = 3.0
gme.materials.append(gm)
glow.parent = arm; glow.parent_type = 'BONE'; glow.parent_bone = 'head'; glow.matrix_world = Matrix.Identity(4)
print('burrower:', len(me.vertices), 'verts', len(me.polygons), 'faces')

# ---- poses
po = Poser(arm); po.keyed = [b.name for b in arm.data.bones]
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'
rest = po.snapshot()
REST_D = {i: (JOINT['jaw.%d' % i][1] - JOINT['jaw.%d' % i][0]).normalized() for i in range(N_JAW)}
def pose(open_=0.0, lean=(0.0, 0.0), coil=0.0, throat=1.0, flex=None, lift=0.0):
    """open_: the jaws, 0 shut to 1 splayed; lean: (forward, side) of the head over the column (forward is -Y); coil: an
    S-bend through the column; throat: its scale (a gulp); flex: per-jaw extra opening; lift: the head pushed up."""
    po.restore(rest)
    pb = po.P['root']; m = pb.matrix.copy(); m.translation.z += lift; pb.matrix = m; po.update()
    for k in range(4):
        u = (k + 1) / 4; f, s = lean[0] * u * u, lean[1] * u * u
        c = coil * math.sin(u * math.pi * 1.5)
        po.aim('seg%d' % (k + 1), Vector((s + c, -f, 1)).normalized())
    po.aim('head', Vector((lean[1] * 1.3, -lean[0] * 1.3, 1)).normalized())
    hb = po.P['head']; rot = hb.matrix.to_3x3().normalized() @ arm.data.bones['head'].matrix_local.to_3x3().normalized().inverted()
    for i, (th, h) in enumerate(HINGE):
        t = Vector((-math.sin(th), math.cos(th), 0)); a = (open_ + (flex[i] if flex else 0.0)) * 1.3
        po.aim('jaw.%d' % i, rot @ (Matrix.Rotation(a, 3, t) @ REST_D[i]))
    tb = po.P['throat']; tb.scale = Vector((throat, 1.0, throat)); po.update()
    return po.snapshot()
po.make_action('Closed', [(0, pose()), (12, pose(coil=0.04))])
# rise: wriggling up shut, then bursting open with an overshoot
po.make_action('Rise', [(0, pose(coil=0.18, lean=(0.1, 0))), (3, pose(coil=-0.16)), (6, pose(coil=0.12, lean=(-0.05, 0.05))), (8, pose(coil=-0.05, open_=0.05)),
                        (10, pose(open_=1.15, lift=0.08, throat=1.2)), (12, pose(open_=0.95, throat=1.0)), (14, pose(open_=1.0))])
# open: waiting, swaying round, the jaws flexing out of step, the throat working
op = []
for f in range(0, 49, 6):
    ph = f / 48 * math.tau
    op.append((f, pose(open_=0.93, lean=(0.06 * math.sin(ph), 0.06 * math.cos(ph)), flex=[0.07 * math.sin(ph * 2 + i * 1.3) for i in range(N_JAW)], throat=1.0 + 0.1 * math.sin(ph * 2))))
po.make_action('Open', op)
# snap: shut hard and lunge up and forward, hold, then open again
po.make_action('Snap', [(0, pose(open_=1.0)), (2, pose(open_=-0.05, lean=(0.35, 0), lift=0.35, throat=0.8)), (6, pose(open_=0.0, lean=(0.3, 0), lift=0.3)),
                        (10, pose(open_=0.3, lean=(0.1, 0), lift=0.1)), (14, pose(open_=1.0))])
# hit: knocked back, the jaws half shut, then up again
po.make_action('Hit', [(0, pose(open_=0.95)), (2, pose(open_=0.45, lean=(-0.4, 0.1), throat=0.85)), (5, pose(open_=0.5, lean=(-0.3, 0.05))), (10, pose(open_=0.95))])
# sink: closing and coiling as it draws down
po.make_action('Sink', [(0, pose(open_=0.9)), (5, pose(open_=0.2, coil=0.1)), (10, pose(open_=0.0, coil=-0.15)), (14, pose(open_=0.0, coil=0.1))])
po.restore(rest)
print('clips', [a.name for a in bpy.data.actions])

os.makedirs(os.path.dirname(OUT), exist_ok=True)
for a in bpy.data.actions: a.use_fake_user = True
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_vertex_color='MATERIAL',
                          export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes')
