# The golem: the Warden at the top of each region. A stone golem modelled and rigged by the game's designer in Tripo (a
# Mixamo-style skeleton, two clips of rage), made ready for the game here:
#   - Tripo's stray icosphere dropped, bones renamed to the names posekit uses (hips, chest, upperarm.r, foot.l, ...)
#   - textures brought down from 2K to 1K
#   - Tripo's two clips kept as the roar (arms flung up) and the taunt (fists on the chest), travel taken out
#   - the fight's clips authored with posekit for a side-on camera: a heavy idle, a stomping walk, the overhead slam, the
#     backhand sweep, the stomp that sends a shockwave, the leap, a stagger onto one knee, and the death
# The game drives each fight clip by fraction; the marks in each clip's comment are where its phases change (golem.js
# reads them from GOLEM_MARKS, written into the Rig's extras).
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

# Idle: breathing, the shoulders heaving, a slow sway
i1 = {'hips': (0, -0.06), 'chest': D(0.3, 1), 'armR': [D(0.3, -1, 0.44), D(0.6, -1, 0.14)], 'armL': [L(0.3, -1, 0.44), L(0.6, -1, 0.14)]}
keyed('Idle', [(0, P_({})), (30, P_(i1)), (60, P_({}))])

# Walk: a heavy stomp, a step each half, the body dropping onto each foot and the opposite fist swinging
S_ = 0.1
w_l = {'hips': (0, -0.08), 'feet': {'l': (S_, 0), 'r': (-S_, 0)}, 'chest': (D(0.35, 1), 0.12), 'armR': [D(0.5, -1, 0.4), D(0.8, -0.8, 0.1)], 'armL': [L(-0.1, -1, 0.42), L(0.2, -1, 0.12)]}
w_pl = {'hips': (0, -0.02), 'feet': {'l': (0, 0), 'r': (0, 0.07)}}
w_r = {'hips': (0, -0.08), 'feet': {'l': (-S_, 0), 'r': (S_, 0)}, 'chest': (D(0.35, 1), -0.12), 'armL': [L(0.5, -1, 0.4), L(0.8, -0.8, 0.1)], 'armR': [D(-0.1, -1, 0.42), D(0.2, -1, 0.12)]}
w_pr = {'hips': (0, -0.02), 'feet': {'l': (0, 0.07), 'r': (0, 0)}}
keyed('Walk', [(0, P_(w_l)), (8, P_(w_pl)), (16, P_(w_r)), (24, P_(w_pr)), (32, P_(w_l))])
MARKS['walk_stride'] = round(4 * S_ * H, 5)                    # model units the feet travel per loop

# Slam: both fists raised high overhead, the body arched back; brought down onto the floor in front; held there (the
# opening); heaved back up.   marks: wind 0-12, strike 12-15, hold 15-27, recover 27-38
s_wind = {'hips': (-0.04, -0.02), 'spine': D(-0.2, 1), 'chest': D(-0.4, 1), 'head': D(-0.05, 1), 'feet': {'l': (0.1, 0), 'r': (-0.1, 0)},
          'armR': [D(-0.15, 1, 0.22), D(-0.3, 1, 0.05)], 'armL': [L(-0.15, 1, 0.22), L(-0.3, 1, 0.05)]}
s_hit = {'hips': (0.06, -0.2), 'spine': D(1, 0.55), 'chest': D(1.2, 0.3), 'head': D(0.9, 1), 'feet': {'l': (0.16, 0), 'r': (-0.13, 0)},
         'armR': [D(1, -0.75, 0.15), D(0.7, -1, 0.04)], 'armL': [L(1, -0.75, 0.15), L(0.7, -1, 0.04)]}
s_hold = {**s_hit, 'hips': (0.06, -0.22), 'chest': D(1.25, 0.28)}
keyed('Slam', [(0, P_({})), (7, P_(mix(STAND, s_wind, 0.75))), (12, P_(s_wind)), (13, P_(mix(s_wind, s_hit, 0.5))), (15, P_(s_hit)), (27, P_(s_hold)), (32, P_(mix(s_hold, STAND, 0.5))), (38, P_({}))])
MARKS['Slam'] = [0, 12, 15, 27, 38]

# Sweep: the right arm flung back and wide, the torso wound round; it swings across in front at chest height and on
# through.   marks: wind 0-11, strike 11-16, recover 16-30
w_sw = {'hips': (-0.02, -0.1), 'spine': D(0.35, 1), 'chest': (D(0.3, 1), -0.75), 'head': D(0.3, 1), 'feet': {'l': (0.12, 0), 'r': (-0.12, 0)},
        'armR': [D(-0.7, -0.1, 0.75), D(-0.9, 0.0, 0.45)], 'armL': [L(0.8, -0.4, 0.3), L(0.9, 0.1, -0.1)]}
h_sw = {'hips': (0.06, -0.14), 'spine': D(0.7, 1), 'chest': (D(0.75, 1), 0.2), 'head': D(0.5, 1), 'feet': {'l': (0.14, 0), 'r': (-0.13, 0)},
        'armR': [D(0.6, -0.35, 0.8), D(0.9, -0.3, 0.3)], 'armL': [L(-0.4, -0.8, 0.4), L(-0.1, -1, 0.2)]}
f_sw = {'hips': (0.08, -0.14), 'spine': D(0.75, 1), 'chest': (D(0.8, 1), 0.75), 'head': D(0.5, 1), 'feet': {'l': (0.14, 0), 'r': (-0.13, 0)},
        'armR': [D(1, -0.35, -0.35), D(0.6, -0.3, -0.8)], 'armL': [L(-0.5, -0.8, 0.45), L(-0.3, -1, 0.2)]}
keyed('Sweep', [(0, P_({})), (6, P_(mix(STAND, w_sw, 0.7))), (11, P_(w_sw)), (13, P_(h_sw)), (16, P_(f_sw)), (22, P_(mix(f_sw, STAND, 0.4))), (30, P_({}))])
MARKS['Sweep'] = [0, 11, 16, 30]

# Stomp: the front foot raised high, both fists up for the weight; driven down so the floor jumps.
# marks: wind 0-12, strike 12-14, recover 14-28
st_w = {'hips': (-0.04, 0.0), 'spine': D(-0.05, 1), 'chest': D(0.0, 1), 'head': D(0.2, 1), 'feet': {'l': (0.12, 0.2), 'r': (-0.06, 0)},
        'armR': [D(0.2, 0.3, 0.75), D(0.1, 1, 0.3)], 'armL': [L(0.2, 0.3, 0.75), L(0.1, 1, 0.3)]}
st_h = {'hips': (0.05, -0.16), 'spine': D(0.45, 1), 'chest': D(0.6, 1), 'head': D(0.4, 1), 'feet': {'l': (0.16, 0), 'r': (-0.1, 0)},
        'armR': [D(0.3, -1, 0.7), D(0.6, -1, 0.3)], 'armL': [L(0.3, -1, 0.7), L(0.6, -1, 0.3)]}
keyed('Stomp', [(0, P_({})), (7, P_(mix(STAND, st_w, 0.7))), (12, P_(st_w)), (14, P_(st_h)), (20, P_(st_h)), (28, P_({}))])
MARKS['Stomp'] = [0, 12, 14, 28]

# Leap: sunk down onto the haunches, arms back; launched (in the air: knees up, fists high); the landing, crouched,
# fists on the floor.   marks: crouch 0-10, air 10-22, land 22-26, recover 26-36
l_c = {'hips': (0.02, -0.3), 'spine': D(0.9, 1), 'chest': D(0.9, 0.8), 'head': D(0.7, 1), 'feet': {'l': (0.1, 0), 'r': (-0.08, 0)},
       'armR': [D(-0.8, -0.6, 0.35), D(-0.7, -0.6, 0.15)], 'armL': [L(-0.8, -0.6, 0.35), L(-0.7, -0.6, 0.15)]}
l_air = {'hips': (0, 0), 'spine': D(0.1, 1), 'chest': D(0.0, 1), 'head': D(0.3, 1), 'feet': {'l': (0.12, 0.2), 'r': (-0.02, 0.16)},
         'armR': [D(0.3, 1, 0.4), D(0.1, 1, 0.2)], 'armL': [L(0.3, 1, 0.4), L(0.1, 1, 0.2)]}
l_land = {**l_c, 'hips': (0.05, -0.28), 'armR': [D(0.9, -0.8, 0.35), D(0.5, -1, 0.1)], 'armL': [L(0.9, -0.8, 0.35), L(0.5, -1, 0.1)]}
keyed('Leap', [(0, P_({})), (10, P_(l_c)), (13, P_(l_air, plant=False)), (22, P_(l_air, plant=False)), (24, P_(l_land)), (28, P_(l_land)), (36, P_({}))])
MARKS['Leap'] = [0, 10, 22, 26, 36]

# Stagger: knocked down onto one knee, a fist on the floor holding him up, head low (the punish window), then up.
# marks: fall 0-6, down 6-30, rise 30-40
k_dn = {'hips': (0.0, -0.36), 'spine': D(0.8, 1), 'chest': D(0.9, 0.7), 'head': D(0.6, 0.6), 'feet': {'l': (0.16, 0), 'r': (-0.16, -0.0)},
        'armR': [D(0.6, -1, 0.3), D(0.4, -1, 0.1)], 'armL': [L(0.2, -1, 0.5), L(0.5, -0.6, 0.2)]}
keyed('Stagger', [(0, P_({})), (6, P_(k_dn)), (30, P_({**k_dn, 'hips': (0.0, -0.37)})), (35, P_(mix(k_dn, STAND, 0.5))), (40, P_({}))])
MARKS['Stagger'] = [0, 6, 30, 40]

# Hit: a short flinch back (played over a few frames when a blow lands)
keyed('Hit', [(0, P_({})), (3, P_({'hips': (-0.03, -0.06), 'spine': D(-0.05, 1), 'chest': D(-0.1, 1), 'head': D(-0.1, 1)})), (10, P_({}))])

# Die: to the knees, sagging, then pitched forward onto his fists, the head down
d_k = {'hips': (0.0, -0.4), 'spine': D(0.6, 1), 'chest': D(0.4, 1), 'head': D(-0.1, 1), 'feet': {'l': (0.14, 0), 'r': (-0.14, 0)},
       'armR': [D(0.0, -1, 0.5), D(0.1, -1, 0.3)], 'armL': [L(0.0, -1, 0.5), L(0.1, -1, 0.3)]}
d_f = {'hips': (0.05, -0.42), 'spine': D(1, 0.25), 'chest': D(1, -0.1), 'head': D(0.8, -0.6), 'feet': {'l': (0.14, 0), 'r': (-0.14, 0)},
       'armR': [D(1, -0.9, 0.4), D(0.4, -1, 0.2)], 'armL': [L(1, -0.9, 0.4), L(0.4, -1, 0.2)]}
keyed('Die', [(0, P_({})), (10, P_(d_k)), (22, P_(d_k)), (32, P_(d_f)), (40, P_(d_f))])

po.restore(base)
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
MARKS['height'] = round(H, 5)
arm['golem_marks'] = json.dumps(MARKS)     # read by the game (glTF extras on the Rig node)
print('marks', MARKS)
print('clips', sorted(a.name for a in bpy.data.actions))

# ---- 5. export
for a in bpy.data.actions: a.use_fake_user = True
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_image_format='JPEG', export_extras=True,
                          export_jpeg_quality=85, export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes')
