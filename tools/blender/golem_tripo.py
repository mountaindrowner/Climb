# The golem: the Warden at the top of each region, a colossus standing in the cavern behind the floor. A stone golem
# modelled and rigged by the game's designer in Tripo (a Mixamo-style skeleton, two clips of rage), made ready here:
#   - Tripo's stray icosphere dropped, bones renamed to the names posekit uses (hips, chest, upperarm.r, foot.l, ...)
#   - textures brought down from 2K to 1K
#   - Tripo's two clips kept as the roar (arms flung up) and the taunt (fists on the chest), travel taken out
#   - his body's clips authored with posekit: looming over the floor, leaning in to reach, reeling (slumped forward, face
#     down), a flinch, and the fall. The game reaches his arms to the floor itself (two-bone IK, src/boss/view.js), so
#     these pose the body, not the arms
#
#   <venv with bpy>/bin/python tools/blender/golem_tripo.py -- assets/source/golem-tripo.glb
#   -> assets/models/golem/golem.glb
import os, sys, json
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from posekit import Poser, D
from mathutils import Vector

SRC = sys.argv[sys.argv.index('--') + 1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'assets', 'models', 'golem', 'golem.glb')
TEX = int(os.environ.get('G_TEX', 1024))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for o in list(bpy.data.objects):
    if o.type == 'MESH' and len(o.data.vertices) < 100: bpy.data.objects.remove(o, do_unlink=True)   # Tripo's stray icosphere
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE'); arm.name = 'Rig'
body = next(o for o in bpy.data.objects if o.type == 'MESH'); body.name = 'Golem_Body'
if arm.animation_data: arm.animation_data.action = None
for m in bpy.data.materials: m.name = 'golem_stone'

# ---- 1. bone names: posekit's
MAP = {'Hips': 'hips', 'Spine': 'spine', 'Spine1': 'spine1', 'Spine2': 'chest', 'Neck': 'neck', 'Head': 'head', 'HeadTop_End': 'head_end'}
for s, side in (('l', 'Left'), ('r', 'Right')):
    MAP.update({side + 'Shoulder': 'shoulder.' + s, side + 'Arm': 'upperarm.' + s, side + 'ForeArm': 'lowerarm.' + s, side + 'Hand': 'hand.' + s,
                side + 'UpLeg': 'upperleg.' + s, side + 'Leg': 'lowerleg.' + s, side + 'Foot': 'foot.' + s, side + 'ToeBase': 'toes.' + s, side + 'Toe_End': 'toes_end.' + s})
    for f in ('Thumb', 'Index', 'Middle', 'Ring', 'Pinky'):
        for k in range(1, 5): MAP[f'{side}Hand{f}{k}'] = f'{f.lower()}{k}.{s}'
for b in arm.data.bones:
    n = b.name.replace('mixamorig:', ''); b.name = MAP.get(n, n)
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'; pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
bpy.context.view_layer.update()

# ---- 2. textures: 1K
for img in bpy.data.images:
    if img.size[0] > TEX: img.scale(TEX, TEX); print('texture', img.name, '->', TEX)
    try: img.pack()
    except Exception: pass

# ---- 3. Tripo's clips, travel out (the game places him): the roar and the taunt
B = arm.data.bones
H = B['head_end'].head_local.z                     # his height in armature units; the specs below are in fractions of it
for src, name in (('angry_01', 'Roar'), ('angry_03', 'Taunt')):
    act = bpy.data.actions[src]; act.name = name
    fcs = act.fcurves if hasattr(act, 'fcurves') else [fc for l in act.layers for s in l.strips for cb in s.channelbags for fc in cb.fcurves]
    for fc in fcs:
        if fc.data_path == 'pose.bones["hips"].location' and fc.array_index != 1:
            v0 = fc.keyframe_points[0].co.y if len(fc.keyframe_points) else 0
            for kp in fc.keyframe_points: kp.co.y = v0; kp.handle_left.y = v0; kp.handle_right.y = v0

# ---- 4. the fight's clips
po = Poser(arm)
po.keyed = [b.name for b in B if b.use_deform or b.name == 'hips']
base = po.snapshot()
feet0 = po.ankles(base)
for s, sx in (('l', 1), ('r', -1)): feet0[s] = feet0[s] + Vector((sx * 0.025 * H, 0, 0))   # a wide, heavy stance
def sc(spec):
    out = dict(spec)
    if 'hips' in out: out['hips'] = tuple(x * H for x in out['hips'])
    if 'feet' in out: out['feet'] = {s: tuple(x * H for x in v) for s, v in out['feet'].items()}
    return out
L = lambda *a: D(*a, side='l')
# the stance: knees bent under the weight, back hunched, head thrust forward, the great fists hanging in front
ARMS = {'armR': [D(0.25, -1, 0.42), D(0.55, -1, 0.12)], 'armL': [L(0.25, -1, 0.42), L(0.55, -1, 0.12)]}
STAND = {'hips': (0, -0.05), 'spine': D(0.2, 1), 'chest': D(0.35, 1), 'head': D(0.25, 1), **ARMS, 'feet': {'l': (0.06, 0), 'r': (-0.06, 0)}}
def P_(spec, plant=True): return po.pose(base, sc({**STAND, **spec}), feet0, plant)
def keyed(name, keys): po.make_action(name, keys)
def mix(a, b, t=0.5):
    out = dict(a)
    for k, v in b.items():
        x = a.get(k, STAND.get(k))
        if k in ('hips',): out[k] = tuple(p + (q - p) * t for p, q in zip(x, v))
        elif k == 'feet': out[k] = {s: tuple(p + (q - p) * t for p, q in zip(x.get(s, (0, 0)), v.get(s, (0, 0)))) for s in 'lr'}
        elif k in ('armR', 'armL'): out[k] = [(x[i] * (1 - t) + v[i] * t).normalized() for i in range(2)]
        else:
            dx, tx = x if isinstance(x, tuple) else (x, 0.0); dv, tv = v if isinstance(v, tuple) else (v, 0.0)
            out[k] = ((dx * (1 - t) + dv * t).normalized(), tx * (1 - t) + tv * t)
    return out
MARKS = {}

# He is a colossus: he stands in the depths of a cavern behind the floor, his torso rising above it, and the game reaches
# his arms to the floor itself (two-bone IK on the arms, every frame). So these clips pose the body, not the arms; the
# roar and the taunt (Tripo's) are the only ones whose arms play as keyed.
# Loom: leaning in over the floor, the head down to watch it, the shoulders heaving
LOOM = {'hips': (0, -0.02), 'spine': D(0.45, 1), 'chest': D(0.6, 1), 'head': D(0.55, 1)}
keyed('Loom', [(0, P_(LOOM)), (36, P_({**LOOM, 'chest': D(0.5, 1), 'head': D(0.5, 1)})), (72, P_(LOOM))])
# Reach: leaning further in, as the arm goes out over the floor
keyed('Reach', [(0, P_({**LOOM, 'spine': D(0.7, 1), 'chest': D(0.85, 1), 'head': D(0.7, 1)}))])
# Reel: struck down, slumped forward over the floor, the face down at it (the game lowers him until the head rests on
# the floor's edge: the punish window)
REEL = {'hips': (-0.03, -0.04), 'spine': D(1, 0.35), 'chest': D(1, -0.15), 'head': D(0.9, -0.55)}
keyed('Reel', [(0, P_(REEL)), (20, P_({**REEL, 'head': D(0.95, -0.45)})), (40, P_(REEL))])
# Hit: a flinch back
keyed('Hit', [(0, P_(LOOM)), (3, P_({**LOOM, 'spine': D(0.25, 1), 'chest': D(0.3, 1), 'head': D(0.2, 1)})), (10, P_(LOOM))])
# Die: thrown back, arms flung up, toppling away into the dark (the game sinks him)
d_b = {'hips': (-0.05, 0), 'spine': D(-0.6, 1), 'chest': D(-0.9, 1), 'head': D(-0.9, 0.6), 'armR': [D(0.2, 1, 0.6), D(-0.2, 1, 0.3)], 'armL': [L(0.2, 1, 0.6), L(-0.2, 1, 0.3)]}
keyed('Die', [(0, P_(LOOM)), (10, P_({**LOOM, 'spine': D(0.2, 1), 'chest': D(0.0, 1), 'head': D(-0.3, 1)})), (30, P_(d_b)), (40, P_(d_b))])

po.restore(base)
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
MARKS = {'height': round(H, 5)}
arm['golem_marks'] = json.dumps(MARKS)     # read by the game (glTF extras on the Rig node)
print('marks', MARKS)
print('clips', sorted(a.name for a in bpy.data.actions))

# ---- 5. export
for a in bpy.data.actions: a.use_fake_user = True
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_image_format='JPEG', export_extras=True,
                          export_jpeg_quality=85, export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes')
