# The knight: the KayKit knight (CC0, Kay Lousberg, github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0),
# re-proportioned from chibi to heroic, given our three weapons, trimmed to the clips the game plays, and exported.
#
#   <venv with bpy>/bin/python tools/blender/knight_kaykit.py -- <path to the pack's kaykit_character_pack_adventures folder>
#   -> assets/models/knight/knight.glb
#
# Re-proportioning: the pack's characters are about two heads tall. We pose the rig into new proportions (smaller head,
# longer legs, arms and trunk), bake that pose into the meshes and make it the new rest pose. Every clip is keyed as
# rotations (plus the hips' offset) relative to the rest pose, so the clips carry over to the new body unchanged.
import os, sys
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from posekit import Poser, D
from mathutils import Matrix, Vector

PACK = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else sys.argv[-1]
SRC = os.path.join(PACK, 'Characters', 'gltf', 'Knight.glb')
ASSETS = os.path.join(PACK, 'Assets', 'gltf')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'knight', 'knight.glb')

# proportions, as multipliers on the pack's: the head (uniform), and lengths along the bones
SHAPE = {'head': float(os.environ.get('K_HEAD', 0.47)), 'leg': float(os.environ.get('K_LEG', 1.85)),
         'trunk': float(os.environ.get('K_TRUNK', 1.2)), 'arm': float(os.environ.get('K_ARM', 1.3)),
         'sword': float(os.environ.get('K_SWORD', 0.7)), 'shield': float(os.environ.get('K_SHIELD', 0.8))}
# the pack's clips we keep; the swings, crouch, tuck and guard are authored below for a side-on camera
KEEP_CLIPS = {'Idle', 'Running_A', 'Jump_Start', 'Jump_Idle', 'Jump_Land', 'Blocking', 'Block_Hit', 'Hit_A', 'Hit_B'}
DROP = {'1H_Sword_Offhand', '2H_Sword', 'Rectangle_Shield', 'Round_Shield', 'Spike_Shield', 'Icosphere'}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for o in list(bpy.data.objects):
    if o.name in DROP or o.name.startswith('Icosphere'): bpy.data.objects.remove(o, do_unlink=True)
for a in list(bpy.data.actions):
    if a.name not in KEEP_CLIPS: bpy.data.actions.remove(a)
arm = bpy.data.objects['Rig']
if arm.animation_data: arm.animation_data.action = None

def activate(o):
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o

# ---- 1. pose the new proportions
activate(arm); bpy.ops.object.mode_set(mode='POSE')
P = arm.pose.bones
for pb in P:
    pb.location = (0, 0, 0); pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
for b in arm.data.bones: b.inherit_scale = 'NONE'      # each bone takes only its own stretch
for s in 'lr':
    P['upperleg.' + s].scale = (1, SHAPE['leg'], 1); P['lowerleg.' + s].scale = (1, SHAPE['leg'], 1)
    P['upperarm.' + s].scale = (1, SHAPE['arm'], 1); P['lowerarm.' + s].scale = (1, SHAPE['arm'], 1)
P['spine'].scale = (1, SHAPE['trunk'], 1); P['chest'].scale = (1, SHAPE['trunk'], 1)
P['head'].scale = (SHAPE['head'],) * 3
B = arm.data.bones
leg = (B['upperleg.l'].head_local - B['lowerleg.l'].tail_local).length
P['hips'].location = (0, leg * (SHAPE['leg'] - 1), 0)  # the hips' +Y is up: lift them so the feet stay on the floor
bpy.context.view_layer.update()
print('posed: ankle', tuple(round(x, 3) for x in P['foot.l'].head), 'neck', tuple(round(x, 3) for x in P['head'].head),
      'hand', tuple(round(x, 3) for x in P['hand.r'].head))

# ---- 2. bake it: meshes take the posed shape, the pose becomes the rest pose, props keep their posed placement
bpy.ops.object.mode_set(mode='OBJECT')
props = {o.name: o.matrix_world.copy() for o in bpy.data.objects if o.parent == arm and o.parent_type == 'BONE'}
skinned = [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]
for o in skinned:
    activate(o)
    for m in [m for m in o.modifiers if m.type == 'ARMATURE']: bpy.ops.object.modifier_apply(modifier=m.name)
activate(arm); bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
for b in arm.data.bones: b.inherit_scale = 'FULL'
for o in skinned:
    m = o.modifiers.new('Armature', 'ARMATURE'); m.object = arm
for n, mw in props.items(): bpy.data.objects[n].matrix_world = mw

# ---- 3. weapons: the sword and shield slightly smaller for the new frame; an axe for the pick; a spear built here
sword = bpy.data.objects['1H_Sword']; sword.name = 'wep_sword'
shield = bpy.data.objects['Badge_Shield']; shield.name = 'shield'
def rescale(o, k):
    loc, rot, sc = o.matrix_world.decompose()
    o.matrix_world = Matrix.LocRotScale(loc, rot, sc * k)
rescale(sword, SHAPE['sword']); rescale(shield, SHAPE['shield'])

def import_prop(fname, name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, fname))
    new = [o for o in bpy.data.objects if o not in before]
    mesh = [o for o in new if o.type == 'MESH'][0]
    for o in new:
        if o is not mesh: bpy.data.objects.remove(o, do_unlink=True)
    mesh.name = name
    mw = sword.matrix_world.copy()
    mesh.parent = arm; mesh.parent_type = 'BONE'; mesh.parent_bone = 'handslot.r'
    mesh.matrix_world = mw
    return mesh
axe = import_prop('axe_1handed.gltf', 'wep_pick')
rescale(axe, 1.35)                                  # a war pick, not a hatchet

# the spear: an ash shaft with an iron leaf head and a collar, held like the sword, in the sword's own frame
lo, hi = Vector(sword.bound_box[0]), Vector(sword.bound_box[6])
ax = max(range(3), key=lambda i: abs(hi[i] - lo[i]))
tip = 1 if abs(hi[ax]) > abs(lo[ax]) else -1          # the blade runs this way along the long axis
def mat(name, rgb, rough, metal):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m
wood, iron = mat('spear_ash', (0.33, 0.2, 0.11), 0.8, 0), mat('spear_iron', (0.55, 0.57, 0.6), 0.45, 0.3)
import bmesh
bm = bmesh.new()
def along(v):  # build along +Z, then turn onto the sword's axis
    return v
def add_cyl(r1, r2, z0, z1, segs, mi):
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1, radius2=r2, depth=z1 - z0)
    for v in res['verts']: v.co.z += (z0 + z1) / 2
    for f in {f for v in res['verts'] for f in v.link_faces}: f.material_index = mi
add_cyl(0.05, 0.045, -0.3, 1.7, 7, 0)           # shaft, a short butt below the fist
add_cyl(0.075, 0.075, 1.62, 1.76, 7, 1)         # collar
add_cyl(0.12, 0.0, 1.76, 2.3, 4, 1)             # the head: a four-sided leaf
add_cyl(0.065, 0.05, -0.38, -0.27, 7, 1)        # butt cap
me = bpy.data.meshes.new('wep_spear'); bm.to_mesh(me); bm.free()
me.materials.append(wood); me.materials.append(iron)
spear = bpy.data.objects.new('wep_spear', me); bpy.context.collection.objects.link(spear)
for p in spear.data.polygons: p.use_smooth = False
# lay +Z onto the sword's blade axis, in the sword's frame, at the sword's scale
turn = {0: Matrix.Rotation(tip * 1.5708, 4, 'Y'), 1: Matrix.Rotation(-tip * 1.5708, 4, 'X'), 2: Matrix.Rotation(0 if tip > 0 else 3.1416, 4, 'X')}[ax]
spear.parent = arm; spear.parent_type = 'BONE'; spear.parent_bone = 'handslot.r'
spear.matrix_world = sword.matrix_world @ turn

# ---- 3b. the face: a dark visor with two cold glints in it, instead of the pack's cartoon face; matte armour
def material(name, rgb, rough=0.8, metal=0.0, glow=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if glow: b.inputs['Emission Color'].default_value = (*glow, 1); b.inputs['Emission Strength'].default_value = 1.0
    return m
for m in bpy.data.materials:
    if m.node_tree and 'Principled BSDF' in m.node_tree.nodes:
        b = m.node_tree.nodes['Principled BSDF']
        print('material', m.name, 'metal', round(b.inputs['Metallic'].default_value, 2), 'rough', round(b.inputs['Roughness'].default_value, 2))
        if m.name.startswith('knight_texture'): b.inputs['Metallic'].default_value = 0.1; b.inputs['Roughness'].default_value = 0.55   # steel that catches the torch, not lacquer
face = bpy.data.objects['Knight_Head']
face.data.materials.clear(); face.data.materials.append(material('visor_dark', (0.012, 0.011, 0.016), 1.0))
vs = [face.matrix_world @ v.co for v in face.data.vertices]
front = min(v.y for v in vs)
z0, z1 = min(v.z for v in vs), max(v.z for v in vs)
fr = [v for v in vs if v.y < front + 0.06]
fz0, fz1 = min(v.z for v in fr), max(v.z for v in fr)
EYE_Z = fz0 + (fz1 - fz0) * float(os.environ.get('K_EYE_Z', 0.34))
print('head', round(z0, 3), round(z1, 3), 'front', round(front, 3), 'front z', round(fz0, 3), round(fz1, 3), 'eye z', round(EYE_Z, 3))
glint = material('eye_glint', (0.7, 0.85, 1.0), 0.4, 0.0, glow=(0.75, 0.9, 1.0))
for sx in (-1, 1):
    bm2 = bmesh.new(); bmesh.ops.create_uvsphere(bm2, u_segments=8, v_segments=5, radius=1.0)
    me2 = bpy.data.meshes.new('eye'); bm2.to_mesh(me2); bm2.free(); me2.materials.append(glint)
    eye = bpy.data.objects.new('eye_' + ('l' if sx > 0 else 'r'), me2); bpy.context.collection.objects.link(eye)
    w = (z1 - z0); ex = sx * w * 0.125
    # sit just proud of the face's surface at the eye, so the glint is in the visor's shadow, not floating in front
    ey = front - w * 0.004            # level with the tip of the face: the game draws the face as an unlit void
    mw = Matrix.LocRotScale(Vector((ex, ey, EYE_Z)), None, Vector((w * 0.075, w * 0.015, w * 0.024)))
    eye.parent = arm; eye.parent_type = 'BONE'; eye.parent_bone = 'head'; eye.matrix_world = mw
    print('eye', tuple(round(x, 3) for x in mw.translation))

# ---- 3c. clips authored for a side-on camera (the pack's swings are horizontal sweeps, made for a view from above)
po = Poser(arm, weapon=sword)
idle = bpy.data.actions['Idle']
f0, f1 = int(idle.frame_range[0]), int(idle.frame_range[1])
base = po.sample(idle, f0)
feet0 = po.ankles(base)
GUARD_R, GUARD_BLADE = [D(0.25, -1, 0.35), D(1, 0.45, 0.1)], D(0.5, 1)
SHIELD_L = [D(0.45, -1, 0.4, 'l'), D(1, 0.3, -0.25, 'l')]
guard = {'armR': GUARD_R, 'blade': GUARD_BLADE, 'armL': SHIELD_L}
def P_(spec, b=None): return po.pose(b or base, {**guard, **spec}, feet0)

# guard idle: the pack's breathing idle with the sword held ready and the shield up
keys = []
for f in list(range(f0, f1, 6)) + [f1]:
    keys.append((f, po.pose(po.sample(idle, f), guard, feet0)))
po.make_action('K_Guard', keys)
# the pack's jump clips with the sword carried upright: held level at the waist it would spear the next step up
for src in ('Jump_Start', 'Jump_Idle', 'Jump_Land'):
    a = bpy.data.actions[src]; s0, s1 = int(a.frame_range[0]), int(a.frame_range[1])
    po.make_action('K_' + src, [(f, po.pose(po.sample(a, f), {'armR': [D(-0.1, -1, 0.45), D(0.5, 0.6, 0.2)], 'blade': D(0.2, 1)}, feet0, plant=False))
                                for f in list(range(s0, s1, 3)) + [s1]])
# crouch, and the crouch walk (the feet trade places over 24 frames)
CROUCH = {'hips': (0.08, -0.52), 'spine': D(0.95, 1), 'chest': D(0.45, 1), 'head': D(-0.3, 1),
          'armR': [D(0.3, -1, 0.35), D(0.7, 0.8, 0.1)], 'blade': D(0.15, 1)}     # the blade kept upright, clear of the step ahead
c = P_({**CROUCH, 'feet': {'l': (0.12, 0), 'r': (-0.12, 0)}})
po.make_action('K_Crouch', [(0, c), (12, c)])
def crown(snap):
    po.restore(snap); return (po.P['head'].matrix @ Vector((0, po.B['head'].length * 1.9, 0))).z
print('crouch crown / standing crown: %.2f' % (crown(c) / crown(base)))
steps = [((0.14, 0), (-0.14, 0), 0), ((0, 0), (0, 0.08), 0.025), ((-0.14, 0), (0.14, 0), 0), ((0, 0.08), (0, 0), 0.025)]
keys = []
for i, (l, r, bob) in enumerate(steps + steps[:1]):
    keys.append((i * 6, P_({**CROUCH, 'hips': (0.08, -0.52 + bob), 'feet': {'l': l, 'r': r}})))
po.make_action('K_CrouchWalk', keys)
# the roll's tuck: knees to the chest, head down, arms wrapped, the blade laid back along the body
t = P_({'hips': (0.0, -0.22), 'spine': D(1.0, 0.8), 'chest': D(1.6, 0.6), 'head': D(1.2, -0.3),
        'feet': {'l': (0.3, 0.42), 'r': (0.25, 0.38)},
        'armR': [D(0.9, -0.6, 0.45), D(-0.3, 1, 0.35)], 'blade': D(-0.25, 1),
        'armL': [D(0.9, -0.6, 0.2, 'l'), D(-0.2, 1, -0.3, 'l')]})
po.make_action('K_Tuck', [(0, t), (12, t)])
# the high block: shield over the head
h = P_({'armL': [D(0.5, 1, 0.55, 'l'), D(0.5, 0.4, -1, 'l')], 'hips': (0, -0.08), 'feet': {'l': (0.1, 0), 'r': (-0.1, 0)}})
po.make_action('K_BlockHigh', [(0, h), (12, h)])

# the swings, 32 frames: guard 0, on the way back 4, wind-up 8, over the top 11, strike 14, follow-through 18, on the
# way home 24, guard 32. Side-on arcs in the plane the camera sees. Overhead poses keep the arm out from the helmet;
# low ones keep the blade above the feet, and thrusts aim up the stair's slope, so nothing cuts into the steps.
LUNGE = {'feet': {'l': (-0.1, 0), 'r': (0.24, 0)}}
DEEP = {'feet': {'l': (-0.14, 0), 'r': (0.34, 0)}}
SWINGS = {
    # a forward cut: cocked back at the shoulder, swept over and through to the front, finishing low across the body
    'K_Slash': [
        {'hips': (-0.04, 0), 'chest': (D(-0.1, 1), -0.25), 'armR': [D(-0.8, 0.45, 0.6), D(-0.8, 0.6, 0.25)], 'blade': D(-1, 0.45)},
        {'hips': (0.12, -0.08), 'spine': D(0.25, 1), 'chest': (D(0.3, 1), 0.2), 'armR': [D(1, 0.25, 0.35), D(1, -0.1, 0.15)], 'blade': D(1, -0.3), **LUNGE},
        {'hips': (0.13, -0.1), 'spine': D(0.3, 1), 'chest': (D(0.32, 1), 0.25), 'armR': [D(0.9, -0.5, 0.4), D(0.8, -0.6, 0.2)], 'blade': D(1, -0.6), **LUNGE}],
    # a rising backhand: from low behind, up through the front, finishing high and forward
    'K_Back': [
        {'hips': (0, -0.06), 'chest': (D(0.1, 1), -0.25), 'armR': [D(-0.4, -1, 0.45), D(-0.7, -0.6, 0.25)], 'blade': D(-1, 0.0)},
        {'hips': (0.08, -0.04), 'spine': D(0.1, 1), 'chest': (D(-0.05, 1), 0.2), 'armR': [D(1, 0.5, 0.35), D(0.8, 0.8, 0.15)], 'blade': D(1, 0.7), **LUNGE},
        {'hips': (0.09, -0.04), 'spine': D(0.05, 1), 'chest': (D(-0.1, 1), 0.25), 'armR': [D(1, 0.75, 0.4), D(0.7, 1, 0.2)], 'blade': D(0.8, 1), **LUNGE}],
    # the overhead: raised high beside the helmet, blade down the back, brought down in front with the whole body
    'K_Chop': [
        {'hips': (-0.05, 0.03), 'spine': D(-0.25, 1), 'chest': (D(-0.3, 1), -0.15), 'armR': [D(-0.3, 1, 0.65), D(-0.6, 1, 0.3)], 'blade': D(-0.6, -1)},
        {'hips': (0.16, -0.2), 'spine': D(0.55, 1), 'chest': (D(0.6, 1), 0.15), 'armR': [D(1, -0.1, 0.3), D(1, -0.4, 0.15)], 'blade': D(1, -0.3), **DEEP},
        {'hips': (0.17, -0.22), 'spine': D(0.6, 1), 'chest': (D(0.65, 1), 0.15), 'armR': [D(0.9, -0.4, 0.35), D(1, -0.5, 0.2)], 'blade': D(1, -0.45), **DEEP}],
    # the thrust: drawn back at the hip, driven straight out, a little up the stair
    'K_Thrust': [
        {'hips': (-0.06, -0.04), 'chest': (D(-0.05, 1), -0.35), 'armR': [D(-0.8, -0.5, 0.4), D(1, 0.15, 0.3)], 'blade': D(1, 0.12)},
        {'hips': (0.18, -0.1), 'spine': D(0.25, 1), 'chest': (D(0.3, 1), 0.25), 'armR': [D(1, 0.2, 0.3), D(1, 0.15, 0.2)], 'blade': D(1, 0.18), **LUNGE},
        {'hips': (0.16, -0.1), 'spine': D(0.22, 1), 'chest': (D(0.25, 1), 0.2), 'armR': [D(1, 0.1, 0.32), D(1, 0.2, 0.2)], 'blade': D(1, 0.2), **LUNGE}],
    # the jab: quick and high, from the shoulder, hardly a step
    'K_Jab': [
        {'hips': (-0.03, 0), 'chest': (D(0, 1), -0.25), 'armR': [D(-0.6, 0.2, 0.5), D(1, 0.35, 0.3)], 'blade': D(1, 0.35)},
        {'hips': (0.08, -0.03), 'spine': D(0.1, 1), 'chest': (D(0.12, 1), 0.2), 'armR': [D(1, 0.55, 0.3), D(1, 0.4, 0.2)], 'blade': D(1, 0.35), 'feet': {'l': (-0.04, 0), 'r': (0.12, 0)}},
        {'hips': (0.07, -0.03), 'spine': D(0.08, 1), 'chest': (D(0.1, 1), 0.15), 'armR': [D(1, 0.45, 0.32), D(1, 0.4, 0.2)], 'blade': D(1, 0.35), 'feet': {'l': (-0.04, 0), 'r': (0.12, 0)}}],
    # the lunge: a long step and a low drive, the body behind it
    'K_Lunge': [
        {'hips': (-0.1, -0.06), 'spine': D(-0.1, 1), 'chest': (D(-0.1, 1), -0.4), 'armR': [D(-0.9, -0.3, 0.4), D(1, 0.05, 0.3)], 'blade': D(1, 0.08)},
        {'hips': (0.28, -0.24), 'spine': D(0.5, 1), 'chest': (D(0.55, 1), 0.3), 'armR': [D(1, 0.0, 0.3), D(1, 0.05, 0.2)], 'blade': D(1, 0.12), **DEEP},
        {'hips': (0.27, -0.25), 'spine': D(0.5, 1), 'chest': (D(0.52, 1), 0.25), 'armR': [D(1, -0.05, 0.32), D(1, 0.05, 0.2)], 'blade': D(1, 0.12), **DEEP}],
}
GUARD_SPEC = {'hips': (0, 0), 'chest': (D(0, 1), 0.0), 'spine': D(0, 1), 'armR': GUARD_R, 'blade': GUARD_BLADE, 'feet': {'l': (0, 0), 'r': (0, 0)}}
def between(a, b, up=0.5):
    """A pose halfway between two specs, so big turns of the blade go round over the top and the arm passes outside
    the helmet, never through the body."""
    out = {}
    for k in set(a) | set(b):
        x, y = a.get(k, GUARD_SPEC.get(k)), b.get(k, GUARD_SPEC.get(k))
        if x is None or y is None: out[k] = x if y is None else y; continue
        if k == 'feet': out[k] = {s: tuple((p + q) / 2 for p, q in zip(x.get(s, (0, 0)), y.get(s, (0, 0)))) for s in 'lr'}
        elif k == 'hips': out[k] = tuple((p + q) / 2 for p, q in zip(x, y))
        elif k == 'armR': out[k] = [((p + q) / 2 + Vector((-0.45, 0, 0.25 * up))).normalized() for p, q in zip(x, y)]
        elif k == 'armL': out[k] = [((p + q) / 2).normalized() for p, q in zip(x, y)]
        elif isinstance(x, tuple): out[k] = (((x[0] + y[0]) / 2).normalized(), (x[1] + y[1]) / 2)
        else: out[k] = ((x + y) / 2 + Vector((0, 0, up))).normalized()   # bias up: arc over the top
    return out
g = P_({})
for name, (wind, strike, follow) in SWINGS.items():
    over = 0.0 if name in ('K_Thrust', 'K_Jab', 'K_Lunge') else 0.8      # cuts arc over the top; thrusts drive straight
    po.make_action(name, [(0, g), (4, P_(between(GUARD_SPEC, wind))), (8, P_(wind)), (11, P_(between(wind, strike, over))),
                          (14, P_(strike)), (18, P_(follow)), (24, P_(between(follow, GUARD_SPEC))), (32, g)])
po.restore(base)
for a in list(bpy.data.actions):
    if (a.name not in KEEP_CLIPS and not a.name.startswith('K_')) or 'K_' + a.name in bpy.data.actions: bpy.data.actions.remove(a)
print('clips', sorted(a.name for a in bpy.data.actions))

# ---- 4. export
for a in bpy.data.actions: a.use_fake_user = True
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS',
                          export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes', SHAPE)
