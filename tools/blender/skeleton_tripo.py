# The skeleton: the player's warrior. A stylized skeleton in a bucket helm, scarf and ragged cape, modelled and rigged
# by the game's designer in Tripo (a Mixamo-style skeleton, eight clips), made ready for the game here:
#   - bones renamed to the names the game and posekit use (hips, spine, chest, head, upperarm.r, foot.l, ...)
#   - the cape cut free of the body into its own mesh, so the game can hang it on simulated cloth
#   - textures brought down from 2K to 1K (he is a couple of hundred pixels tall on screen)
#   - fists closed, and the knight's three weapons put in his right hand, scaled to his size
#   - the clip set the game plays (the knight's, by name): Tripo's idle, run and flinch with the travel taken out (the
#     game moves him), and everything else authored with posekit for a side-on camera, from the knight's own specs
#
#   <venv with bpy>/bin/python tools/blender/skeleton_tripo.py -- assets/source/skeleton-tripo.glb
#   -> assets/models/skeleton/skeleton.glb
import os, sys, math
import bpy, bmesh
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from posekit import Poser, D
from mathutils import Matrix, Vector, Quaternion

SRC = sys.argv[sys.argv.index('--') + 1]
HERE = os.path.dirname(os.path.abspath(__file__))
KNIGHT = os.path.join(HERE, '..', '..', 'assets', 'models', 'knight', 'knight.glb')
OUT = os.path.join(HERE, '..', '..', 'assets', 'models', 'skeleton', 'skeleton.glb')
TEX = int(os.environ.get('S_TEX', 1024))

def activate(o):
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for o in list(bpy.data.objects):
    if o.type == 'MESH' and len(o.data.vertices) < 100: bpy.data.objects.remove(o, do_unlink=True)   # Tripo's stray icosphere
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE'); arm.name = 'Rig'
body = next(o for o in bpy.data.objects if o.type == 'MESH'); body.name = 'Skeleton_Body'
if arm.animation_data: arm.animation_data.action = None

# ---- 1. bone names: the game's (and posekit's). Renaming a bone renames its vertex group and the clips' channels.
MAP = {'Hips': 'hips', 'Spine': 'spine', 'Spine1': 'spine1', 'Spine2': 'chest', 'Neck': 'neck', 'Head': 'head', 'HeadTop_End': 'head_end'}
for s, side in (('l', 'Left'), ('r', 'Right')):
    MAP.update({side + 'Shoulder': 'shoulder.' + s, side + 'Arm': 'upperarm.' + s, side + 'ForeArm': 'lowerarm.' + s, side + 'Hand': 'hand.' + s,
                side + 'UpLeg': 'upperleg.' + s, side + 'Leg': 'lowerleg.' + s, side + 'Foot': 'foot.' + s, side + 'ToeBase': 'toes.' + s, side + 'Toe_End': 'toes_end.' + s})
    for f in ('Thumb', 'Index', 'Middle', 'Ring', 'Pinky'):
        for k in range(1, 5): MAP[f'{side}Hand{f}{k}'] = f'{f.lower()}{k}.{s}'
for b in arm.data.bones:
    n = b.name.replace('mixamorig:', '')
    b.name = MAP.get(n, n)
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'; pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
bpy.context.view_layer.update()      # the rest pose: the import leaves the armature posed by its first clip
print('bones', len(arm.data.bones), sorted(b.name for b in arm.data.bones)[:12], '...')

# ---- 2. the cape: its own mesh. Tripo splits the surface along its texture seams; the cape's pieces are the ones that
# hang behind the back between the shoulders and the knees (both faces of it, and the rags of the hem).
me = body.data
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
seen, cape_v = set(), set()
for v in bm.verts:
    if v.index in seen: continue
    st, comp = [v], []; seen.add(v.index)
    while st:
        x = st.pop(); comp.append(x)
        for e in x.link_edges:
            o = e.other_vert(x)
            if o.index not in seen: seen.add(o.index); st.append(o)
    my = sum(c.co.y for c in comp) / len(comp); mz = sum(c.co.z for c in comp) / len(comp)
    if my > 0.05 and 0.25 < mz < 0.75: cape_v.update(c.index for c in comp)
for f in bm.faces: f.select = all(v.index in cape_v for v in f.verts)
bm.to_mesh(me); bm.free()
activate(body); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
cape = next(o for o in bpy.data.objects if o.type == 'MESH' and o is not body); cape.name = 'Cape'
# rigid on the chest: the game replaces it with cloth, but a cape that moves with the chest is the honest fallback
for g in list(cape.vertex_groups): cape.vertex_groups.remove(g)
vg = cape.vertex_groups.new(name='chest'); vg.add(list(range(len(cape.data.vertices))), 1.0, 'REPLACE')
print('cape', len(cape.data.vertices), 'verts; body', len(body.data.vertices))

# ---- 3. textures: 1K
for img in bpy.data.images:
    if img.size[0] > TEX: img.scale(TEX, TEX); print('texture', img.name, '->', TEX)
    try: img.pack()
    except Exception: pass

# ---- 4. travel out of the clips: the game moves him, so the hips stay over his feet (the bob stays)
def fcurves(act):
    if hasattr(act, 'fcurves'): return list(act.fcurves)
    return [fc for ly in act.layers for st in ly.strips for cb in st.channelbags for fc in cb.fcurves]   # Blender 4.4+: slotted actions
def detrend(act):
    paths = sorted({fc.data_path for fc in fcurves(act)})
    if not any('"hips"' in p for p in paths): print('no hips channels in', act.name, paths[:4])
    for fc in fcurves(act):
        if fc.data_path != 'pose.bones["hips"].location': continue
        kp = fc.keyframe_points
        if len(kp) < 2: continue
        t0, t1 = kp[0].co.x, kp[-1].co.x; v0, v1 = kp[0].co.y, kp[-1].co.y
        horiz = fc.array_index != 1                     # the hips bone's local Y is up: X and Z are the ground plane
        mean = sum(k.co.y for k in kp) / len(kp) if horiz else 0.0
        for k in kp:
            d = (v1 - v0) * (k.co.x - t0) / max(1e-6, t1 - t0)
            if horiz: d += mean - (v1 - v0) / 2
            k.co.y -= d; k.handle_left.y -= d; k.handle_right.y -= d
        fc.update()
# first, how far each loop carries him: his stride (a loop is one full cycle, two steps)
def set_act(a):
    ad = arm.animation_data or arm.animation_data_create(); ad.action = a
    if hasattr(ad, 'action_slot') and a and a.slots: ad.action_slot = a.slots[0]
def hips_at(f): bpy.context.scene.frame_set(f); return arm.matrix_world @ arm.pose.bones['hips'].head
GAIT = {}
for n in ('walk', 'run'):
    a = bpy.data.actions[n]; f0_, f1_ = int(a.frame_range[0]), int(a.frame_range[1]); set_act(a)
    d = hips_at(f1_) - hips_at(f0_); GAIT[n] = {'stride': round((d.x ** 2 + d.y ** 2) ** 0.5, 4)}
for n in ('walk', 'run', 'run_upstairs'):
    if n in bpy.data.actions: detrend(bpy.data.actions[n])
# then where in the loop the left foot strikes (furthest forward of the hips): walk and run are played in step by it
for n in ('walk', 'run'):
    a = bpy.data.actions[n]; f0_, f1_ = int(a.frame_range[0]), int(a.frame_range[1]); set_act(a)
    fw = []
    for f in range(f0_, f1_):
        bpy.context.scene.frame_set(f); P_ = arm.pose.bones
        fw.append(((arm.matrix_world @ P_['hips'].head).y - (arm.matrix_world @ P_['foot.l'].head).y, f))
    GAIT[n]['strike'] = round((max(fw)[1] - f0_) / (f1_ - f0_), 4)
    ups = sum(1 for i in range(len(fw)) if fw[i - 1][0] < fw[i][0] >= fw[(i + 1) % len(fw)][0])
    print('gait', n, GAIT[n], 'left-foot peaks per loop', ups)
set_act(None)
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
bpy.context.view_layer.update()

# ---- 5. weapons: the knight's three, out of our own knight.glb, scaled to this body and closed in his right fist
before, acts_before = set(bpy.data.objects), set(bpy.data.actions)
bpy.ops.import_scene.gltf(filepath=KNIGHT)
for a_ in [a_ for a_ in bpy.data.actions if a_ not in acts_before]: bpy.data.actions.remove(a_)   # only its weapons are wanted
kn = [o for o in bpy.data.objects if o not in before]
krig = next(o for o in kn if o.type == 'ARMATURE')
if krig.animation_data: krig.animation_data.action = None
for pb in krig.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
kz = [(o.matrix_world @ v.co).z for o in kn if o.type == 'MESH' and o.name.startswith('Knight') for v in o.evaluated_get(dg).data.vertices]
K_H = max(kz) - min(kz)
ARMSP = arm.matrix_world.inverted()
B = arm.data.bones
sz = [(body.matrix_world @ v.co).z for v in body.data.vertices]
S_H = max(sz) - min(sz)
K = S_H / K_H                                            # the knight's units -> this body's
print('heights: knight %.3f, skeleton %.3f, k %.3f' % (K_H, S_H, K))
weps = {o.name.split('.')[0]: o for o in kn if o.type == 'MESH' and o.name.split('.')[0] in ('wep_sword', 'wep_pick', 'wep_spear')}
ksw = weps['wep_sword'].matrix_world.copy()
rel = {n: ksw.inverted() @ o.matrix_world for n, o in weps.items()}
for n, o in weps.items():
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
for o in kn:
    if o.name.split('.')[0] not in weps: bpy.data.objects.remove(o, do_unlink=True)
for n, o in weps.items(): o.name = n
sword = weps['wep_sword']
# the sword's blade axis and the normal of its flat, in its own frame
lo, hi = Vector(sword.bound_box[0]), Vector(sword.bound_box[6])
ax = max(range(3), key=lambda i: abs(hi[i] - lo[i])); th = min(range(3), key=lambda i: abs(hi[i] - lo[i]))
blade = Vector((0, 0, 0)); blade[ax] = 1.0 if abs(hi[ax]) > abs(lo[ax]) else -1.0
flatn = Vector((0, 0, 0)); flatn[th] = 1.0
# the hand's frame, measured from its bones: the fingers' direction, the knuckle line (pinky to index) and the palm's
# side (the thumb's tip sits in front of the palm)
def hand_frame(s):
    kn = [B[f + '1.' + s].head_local for f in ('index', 'middle', 'ring', 'pinky')]
    K_ = sum(kn, Vector()) / 4
    d = (sum((B[f + '2.' + s].head_local for f in ('index', 'middle', 'ring', 'pinky')), Vector()) / 4 - K_).normalized()
    line = (B['index1.' + s].head_local - B['pinky1.' + s].head_local); line = (line - line.dot(d) * d).normalized()
    n = d.cross(line).normalized()
    if n.dot(B['thumb3.' + s].head_local - K_) < 0: n = -n
    L1 = sum(((B[f + '2.' + s].head_local - B[f + '1.' + s].head_local).length for f in ('index', 'middle', 'ring', 'pinky'))) / 4
    L2 = sum(((B[f + '3.' + s].head_local - B[f + '2.' + s].head_local).length for f in ('index', 'middle', 'ring', 'pinky'))) / 4
    return K_, d, line, n, L1, L2
# in the fist: the handle runs along the knuckle line through the hole the curled fingers make, the blade out past the
# thumb, its edge along the fingers so the flat faces the palm's way (the side camera, with the arm down)
K_, fd, kline, pn, L1, L2 = hand_frame('r')
grip = K_ + pn * (L1 * 0.55) - fd * (L2 * 0.45)
want_b, want_f = kline, pn
src = Matrix((blade, flatn, blade.cross(flatn))).transposed(); dst = Matrix((want_b, want_f, want_b.cross(want_f))).transposed()
rot = (dst @ src.inverted()).to_4x4()
sc = sword.matrix_world.to_scale().x * K * float(os.environ.get('S_WEP', 1.1))    # a hand-and-a-half sword: room on the grip for both fists
new_sw = Matrix.Translation(arm.matrix_world @ grip) @ rot @ Matrix.Scale(sc, 4)
for n, o in weps.items():
    o.matrix_world = new_sw @ rel[n] if n != 'wep_sword' else new_sw
    mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = 'hand.r'; o.matrix_world = mw
print('weapons in hand at', tuple(round(x, 3) for x in grip), 'scale', round(sc, 3))

# ---- 6. fists: each finger curled in toward the palm, the thumb across it (the same in every clip)
activate(arm); bpy.ops.object.mode_set(mode='POSE')
P = arm.pose.bones
for pb in P: pb.rotation_mode = 'QUATERNION'; pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
bpy.context.view_layer.update()
FINGERS = [b.name for b in arm.data.bones if any(b.name.startswith(f) for f in ('thumb', 'index', 'middle', 'ring', 'pinky'))]
FIST = {}
for s in 'lr':
    _, _, line_s, palm, _, _ = hand_frame(s)
    for f, angs in (('index', (80, 100, 60)), ('middle', (85, 100, 60)), ('ring', (88, 100, 60)), ('pinky', (92, 100, 60)), ('thumb', (30, 45, 35))):
        for k, a in zip((1, 2, 3), angs):
            pb = P[f'{f}{k}.{s}']; m = pb.matrix.copy(); r = m.to_3x3().normalized()
            d = (r @ Vector((0, 1, 0))).normalized()
            toward = palm if f != 'thumb' else (palm - line_s * 0.6).normalized()          # the thumb folds across the fingers
            axis = d.cross(toward)
            if axis.length < 1e-4: continue
            r = Matrix.Rotation(math.radians(a), 3, axis.normalized()) @ r
            new = r.to_4x4(); new.translation = m.translation; pb.matrix = new; bpy.context.view_layer.update()
for n in FINGERS: FIST[n] = P[n].rotation_quaternion.copy()
for n in FINGERS: P[n].rotation_quaternion = (1, 0, 0, 0)
bpy.context.view_layer.update()
bpy.ops.object.mode_set(mode='OBJECT')
def fist(snap):
    for n in FINGERS:
        if n in snap: l, q, s_ = snap[n]; snap[n] = (l, FIST[n].copy(), s_)
    return snap

# ---- 7. the clips the game plays (the knight's names, so the same driver plays them)
po = Poser(arm, weapon=sword)
po.max_wrist = math.radians(float(os.environ.get('S_WRIST', 15)))   # a rigid wrist: the hand stays in line with the forearm
po.keyed = [b.name for b in arm.data.bones if b.use_deform or b.name == 'hips']
idle = bpy.data.actions['idle']
f0, f1 = int(idle.frame_range[0]), int(idle.frame_range[1])
base = fist(po.sample(idle, f0))
feet0 = po.ankles(base)
def sk(spec):
    """The knight's hip and foot offsets are in its units: scale them to this body."""
    out = dict(spec)
    if 'hips' in out: out['hips'] = tuple(x * K for x in out['hips'])
    if 'feet' in out: out['feet'] = {s: tuple(x * K for x in v) for s, v in out['feet'].items()}
    return out
GUARD_R, GUARD_BLADE = [D(0.95, -0.45, 0.3), D(1, 0.35, 0.04)], D(1, 0.7)   # the arms out in front, the sword held ahead of him, not tucked to the chest
FIST_L = [D(0.55, -0.85, 0.35, 'l'), D(1, -0.15, 0.1, 'l')]               # no shield: the off hand a loose fist, out ahead of him
guard = {'armR': GUARD_R, 'blade': GUARD_BLADE, 'armL': FIST_L, 'chest': D(0.3, 1), 'spine': D(0.12, 1), 'head': D(0.05, 1)}
# ---- two hands on the grip. The left fist closes on the handle just below the right, its knuckles along the handle
# like the right's and its fingers curling the same way (so its palm faces the other way, as in any two-handed grip).
# His arms are short: where the left hand cannot reach, both hands bring the sword in toward the body until it can.
KL, fdl, klinel, pnl, L1l, L2l = hand_frame('l')
Lrest, Rrest = B['hand.l'].matrix_local.to_3x3(), B['hand.r'].matrix_local.to_3x3()
grip_l_local = Lrest.inverted() @ (KL + pnl * (L1l * 0.55) - fdl * (L2l * 0.45) - B['hand.l'].head_local)
grip_r_local = Rrest.inverted() @ (grip - B['hand.r'].head_local)
fd_r_local, fd_l_local, kl_l_local = Rrest.inverted() @ fd, Lrest.inverted() @ fdl, Lrest.inverted() @ klinel
FIST_W = (B['index1.r'].head_local - B['pinky1.r'].head_local).length
def basis(a, b):
    a = a.normalized(); b = (b - b.dot(a) * a).normalized(); return Matrix((a, b, a.cross(b))).transposed()
def arm_ik(s, A, hint):
    up_n, lo_n = 'upperarm.' + s, 'lowerarm.' + s
    H = po.P[up_n].head.copy(); L1_, L2_ = B[up_n].length, B[lo_n].length
    dv = A - H; d = max(1e-4, min(dv.length, (L1_ + L2_) * 0.999)); u = dv.normalized()
    n = (hint - hint.dot(u) * u).normalized()
    ca = max(-1.0, min(1.0, (L1_ * L1_ + d * d - L2_ * L2_) / (2 * L1_ * d))); sa = (1 - ca * ca) ** 0.5
    E = H + (ca * u + sa * n) * L1_
    po.aim(up_n, E - H); po.aim(lo_n, H + u * d - E)
def set_rot(name, R):
    pb = po.P[name]; m = R.to_4x4(); m.translation = pb.matrix.translation.copy(); pb.matrix = m; po.update()
def two_hand():
    hr = po.P['hand.r']; Rr = hr.matrix.to_3x3().normalized()
    bd = (Rr @ po.blade_local).normalized(); fdr = (Rr @ fd_r_local).normalized()
    reach = (B['upperarm.l'].length + B['lowerarm.l'].length) * 0.96
    for _ in range(3):                                                             # bring the sword in until the off hand reaches it
        gl = (hr.matrix @ grip_r_local) - bd * (FIST_W * 1.15)
        R = basis(fdr, bd) @ basis(fd_l_local, kl_l_local).inverted()
        H = gl - R @ grip_l_local; sh = po.P['upperarm.l'].head
        over = (H - sh).length - reach
        if over <= 0: break
        shift = (sh - H).normalized() * (over + 0.005)
        arm_ik('r', hr.head + shift, Vector((-0.5, 0.2, -1))); set_rot('hand.r', Rr)
    arm_ik('l', H, Vector((0.6, 0.2, -1))); set_rot('hand.l', R)
def P_(spec, b=None, plant=True, two=True):
    po.pose(b or base, sk({**guard, **spec}), feet0, plant)
    if two: two_hand()
    return fist(po.snapshot())
def keyed(name, keys): po.make_action(name, keys)
# the guard: Tripo's breathing idle with the sword held ready, hunched
def guard_at(f, extra=None):
    po.pose(fist(po.sample(idle, f)), {**guard, **(extra or {})}, feet0); return fist(po.snapshot())   # one hand on the hilt: two would pull the sword in to his chest
keyed('K_Guard', [(f, guard_at(f)) for f in list(range(f0, f1, 6)) + [f1]])
# idles: now and then he looks up the shaft, or round at the camera and back down the stair behind him
look_keys = lambda heads: [(f, guard_at(f0 + f, h)) for f, h in heads]
keyed('K_LookUp', look_keys([(0, {}), (14, {'head': D(-0.45, 1), 'chest': D(0.05, 1)}), (44, {'head': (D(-0.5, 1), 0.25), 'chest': D(0.0, 1)}), (60, {})]))
keyed('K_LookAround', look_keys([(0, {}), (12, {'head': (D(0.1, 1), -0.9)}), (30, {'head': (D(0.1, 1), -0.95)}), (44, {'head': (D(0.05, 1), 0.85), 'chest': (D(0.25, 1), 0.3)}),
                                 (60, {'head': (D(0.05, 1), 0.9), 'chest': (D(0.25, 1), 0.3)}), (72, {})]))
# the run: Tripo's, with the sword carried forward and up, clear of the steps
run = bpy.data.actions['run']; r0, r1 = int(run.frame_range[0]), int(run.frame_range[1])
CARRY = {'armR': [D(0.25, -1, 0.35), D(1, 0.45, 0.15)], 'blade': D(0.9, 0.8)}
# the walk and the run: Tripo's own, arms swinging naturally, the weapon riding in the swinging fist
keyed('Running_A', [(f, fist(po.sample(run, f))) for f in range(r0, r1 + 1)])
walk = bpy.data.actions['walk']; w0, w1 = int(walk.frame_range[0]), int(walk.frame_range[1])
keyed('K_Walk', [(f, fist(po.sample(walk, f))) for f in range(w0, w1 + 1)])
GAIT['Running_A'] = GAIT.pop('run'); GAIT['K_Walk'] = GAIT.pop('walk')
# the flinch: Tripo's hit, the sword held
hit = bpy.data.actions['hit_to_side']; h0, h1 = int(hit.frame_range[0]), int(hit.frame_range[1])
keyed('Hit_A', [(f, fist(po.pose(fist(po.sample(hit, f)), CARRY, feet0, plant=False))) for f in range(h0, h1 + 1, 2)])
keyed('Hit_B', [(f, fist(po.pose(fist(po.sample(hit, f)), CARRY, feet0, plant=False))) for f in range(h0, h1 + 1, 2)])
# the jump: off the toes, knees up in the air, a soft landing; the blade upright so it never spears the next step
UP = {'armR': [D(-0.1, -1, 0.45), D(0.5, 0.6, 0.2)], 'blade': D(0.2, 1), 'armL': [D(0.5, 0.4, 0.4, 'l'), D(0.9, 0.5, 0.1, 'l')]}
j_start = P_({**UP, 'hips': (0.02, -0.06), 'chest': D(0.35, 1), 'feet': {'l': (0.05, 0.04), 'r': (-0.12, 0.08)}}, two=False)
j_go = P_({**UP, 'hips': (0, 0.04), 'chest': D(0.15, 1), 'feet': {'l': (0.08, 0.22), 'r': (-0.1, 0.12)}}, two=False)
j_air = P_({**UP, 'chest': D(0.2, 1), 'feet': {'l': (0.16, 0.36), 'r': (0.02, 0.24)}}, two=False)
j_air2 = P_({**UP, 'chest': D(0.22, 1), 'feet': {'l': (0.12, 0.32), 'r': (0.04, 0.28)}}, two=False)
j_land = P_({**UP, 'hips': (0.06, -0.22), 'chest': D(0.5, 1), 'feet': {'l': (0.1, 0), 'r': (-0.1, 0)}}, two=False)
keyed('K_Jump_Start', [(0, j_start), (8, j_go)])
keyed('K_Jump_Idle', [(0, j_air), (12, j_air2), (24, j_air)])
keyed('K_Jump_Land', [(0, j_land), (8, P_({**UP, 'hips': (0.03, -0.1), 'feet': {'l': (0.06, 0), 'r': (-0.06, 0)}}, two=False)), (16, P_({}, two=False))])
# the block: the blade held across in front, point up, the off hand braced behind it; the high block: overhead
blk = P_({'armR': [D(0.6, -0.5, 0.15), D(0.6, 0.8, -0.35)], 'blade': D(0.2, 1, -0.1), 'armL': [D(0.5, -0.4, 0.2, 'l'), D(0.8, 0.5, 0.45, 'l')],
          'hips': (-0.03, -0.06), 'feet': {'l': (0.1, 0), 'r': (-0.1, 0)}})
keyed('Blocking', [(0, blk), (12, blk)])
hb_ = P_({'armR': [D(0.4, 1, 0.55), D(0.8, 0.5, -0.6)], 'blade': D(1, 0.12), 'armL': [D(0.4, 0.9, 0.3, 'l'), D(0.4, 0.6, -0.9, 'l')],
          'hips': (0, -0.08), 'feet': {'l': (0.1, 0), 'r': (-0.1, 0)}})
keyed('K_BlockHigh', [(0, hb_), (12, hb_)])
# crouch, crouch walk and the roll's tuck: the knight's
# crouch: coiled, not squashed. Hips down and forward, the back bent over the knees, the head up looking ahead, the
# blade held low and ready, and the off hand reaching down to the stone
HAND_DOWN = [D(0.55, -1, 0.3, 'l'), D(0.35, -1, 0.05, 'l')]
CROUCH = {'hips': (0.2, -0.62), 'spine': D(0.95, 1), 'chest': D(0.7, 1), 'head': D(0.1, 1),
          'armR': [D(0.35, -1, 0.3), D(0.85, 0.55, 0.1)], 'blade': D(0.75, 0.7), 'armL': HAND_DOWN}
c = P_({**CROUCH, 'feet': {'l': (0.2, 0), 'r': (-0.16, 0)}}, two=False)
keyed('K_Crouch', [(0, c), (24, P_({**CROUCH, 'hips': (0.2, -0.6), 'feet': {'l': (0.2, 0), 'r': (-0.16, 0)}}, two=False)), (48, c)])
print('crouch crown / standing crown: %.2f' % ((lambda sn: (po.restore(sn), (po.P['head'].matrix @ Vector((0, B['head'].length * 1.9, 0))).z)[1])(c) /
      (lambda sn: (po.restore(sn), (po.P['head'].matrix @ Vector((0, B['head'].length * 1.9, 0))).z)[1])(base)))
# the crouch walk: a slow creep, a long low step at a time, the off hand padding forward with the opposite foot
F_ = 0.24
creep = [((F_, 0), (-F_, 0), 0.0, 0.4), ((0, 0), (0, 0.1), 0.02, 0.0), ((-F_, 0), (F_, 0), 0.0, -0.4), ((0, 0.1), (0, 0), 0.02, 0.0)]
GAIT['K_CrouchWalk'] = {'stride': round(4 * F_ * K, 4), 'strike': 0.0}         # the feet trade F_ each way, twice a loop
keyed('K_CrouchWalk', [(i * 8, P_({**CROUCH, 'hips': (0.2, -0.62 + bob), 'feet': {'l': l, 'r': r},
                                    'armL': [D(0.55 + reach, -1, 0.3, 'l'), D(0.35 + reach, -1, 0.05, 'l')]}, two=False))
                       for i, (l, r, bob, reach) in enumerate(creep + creep[:1])])
t = P_({'hips': (0.0, -0.22), 'spine': D(1.0, 0.8), 'chest': D(1.6, 0.6), 'head': D(1.2, -0.3), 'feet': {'l': (0.3, 0.42), 'r': (0.25, 0.38)},
        'armR': [D(0.9, -0.6, 0.45), D(-0.3, 1, 0.35)], 'blade': D(-0.25, 1), 'armL': [D(0.9, -0.6, 0.2, 'l'), D(-0.2, 1, -0.3, 'l')]}, two=False)
keyed('K_Tuck', [(0, t), (12, t)])
# the swings: the knight's specs, keyed the same (guard 0, wind-up 8, strike 14, follow-through 18, guard 32)
LUNGE = {'feet': {'l': (-0.1, 0), 'r': (0.24, 0)}}
BACK_L = [D(-0.55, -0.6, 0.5, 'l'), D(-0.35, -0.85, 0.3, 'l')]                   # the off arm flung back for balance in a lunging cut
DEEP = {'feet': {'l': (-0.14, 0), 'r': (0.34, 0)}}
SWINGS = {
    # the sword combo, in front of him and in the plane the camera sees (sword in the right hand, both hands where they
    # reach): a cut down from high on his right; reset high and down again; then a rising cut from low on his left up to
    # high on his right, the finisher
    # the cuts reach: at the strike the sword arm is out straight and the body lunges after it (one hand on the hilt then,
    # the off arm flung back for balance); the wind-ups and the recovery take both hands
    'K_Slash': [
        {'hips': (-0.16, -0.14), 'spine': D(-0.3, 1), 'chest': (D(-0.35, 1), -0.6), 'head': D(0.1, 1), 'armR': [D(0.15, 1, 0.5), D(0.05, 1, 0.15)], 'blade': D(-0.15, 1, 0.05),
         'feet': {'l': (-0.18, 0), 'r': (0.2, 0)}},
        {'hips': (0.44, -0.2), 'spine': D(0.45, 1), 'chest': (D(0.5, 1), 0.55), 'armR': [D(1, 0.15, 0.2), D(1, 0.08, 0.06)], 'blade': D(1, -0.1), 'armL': BACK_L, 'feet': {'l': (-0.32, 0), 'r': (0.66, 0)}},
        {'hips': (0.46, -0.23), 'spine': D(0.55, 1), 'chest': (D(0.6, 1), 0.65), 'armR': [D(0.95, -0.35, 0.22), D(0.95, -0.4, 0.08)], 'blade': D(0.85, -0.6), 'armL': BACK_L, 'feet': {'l': (-0.32, 0), 'r': (0.66, 0)}}],
    'K_Back': [
        {'hips': (-0.12, -0.12), 'spine': D(-0.2, 1), 'chest': (D(-0.25, 1), -0.5), 'armR': [D(0.3, 1, 0.45), D(0.25, 1, 0.12)], 'blade': D(0.1, 1), 'feet': {'l': (-0.1, 0), 'r': (0.3, 0)}},
        {'hips': (0.42, -0.19), 'spine': D(0.42, 1), 'chest': (D(0.48, 1), 0.5), 'armR': [D(1, 0.22, 0.2), D(1, 0.12, 0.06)], 'blade': D(1, 0.0), 'armL': BACK_L, 'feet': {'l': (-0.34, 0), 'r': (0.66, 0)}},
        {'hips': (0.45, -0.22), 'spine': D(0.52, 1), 'chest': (D(0.58, 1), 0.6), 'armR': [D(0.95, -0.3, 0.22), D(0.95, -0.35, 0.08)], 'blade': D(0.9, -0.55), 'armL': BACK_L, 'feet': {'l': (-0.34, 0), 'r': (0.66, 0)}}],
    'K_Chop': [
        {'hips': (-0.1, -0.36), 'spine': D(0.75, 1), 'chest': (D(0.7, 1), 0.55), 'head': D(0.35, 1), 'armR': [D(-0.1, -1, -0.25), D(-0.5, -0.8, -0.35)], 'blade': D(-0.7, -0.75, -0.25),
         'feet': {'l': (-0.25, 0), 'r': (0.3, 0)}},
        {'hips': (0.38, -0.15), 'spine': D(0.35, 1), 'chest': (D(0.3, 1), 0.0), 'armR': [D(1, -0.05, 0.2), D(1, 0.15, 0.06)], 'blade': D(1, 0.3, 0.05), 'armL': BACK_L, 'feet': {'l': (-0.36, 0), 'r': (0.68, 0)}},
        {'hips': (0.4, 0.0), 'spine': D(0.05, 1), 'chest': (D(-0.15, 1), -0.45), 'head': D(-0.1, 1), 'armR': [D(0.75, 0.85, 0.4), D(0.65, 1, 0.22)], 'blade': D(0.6, 1, 0.15), 'armL': BACK_L,
         'feet': {'l': (-0.36, 0), 'r': (0.68, 0.06)}}],
    'K_Thrust': [
        {'hips': (-0.06, -0.04), 'chest': (D(-0.05, 1), -0.35), 'armR': [D(-0.8, -0.5, 0.4), D(1, 0.15, 0.3)], 'blade': D(1, 0.12)},
        {'hips': (0.18, -0.1), 'spine': D(0.25, 1), 'chest': (D(0.3, 1), 0.25), 'armR': [D(1, 0.2, 0.3), D(1, 0.15, 0.2)], 'blade': D(1, 0.18), **LUNGE},
        {'hips': (0.16, -0.1), 'spine': D(0.22, 1), 'chest': (D(0.25, 1), 0.2), 'armR': [D(1, 0.1, 0.32), D(1, 0.2, 0.2)], 'blade': D(1, 0.2), **LUNGE}],
    'K_Jab': [
        {'hips': (-0.03, 0), 'chest': (D(0, 1), -0.25), 'armR': [D(-0.6, 0.2, 0.5), D(1, 0.35, 0.3)], 'blade': D(1, 0.35)},
        {'hips': (0.08, -0.03), 'spine': D(0.1, 1), 'chest': (D(0.12, 1), 0.2), 'armR': [D(1, 0.55, 0.3), D(1, 0.4, 0.2)], 'blade': D(1, 0.35), 'feet': {'l': (-0.04, 0), 'r': (0.12, 0)}},
        {'hips': (0.07, -0.03), 'spine': D(0.08, 1), 'chest': (D(0.1, 1), 0.15), 'armR': [D(1, 0.45, 0.32), D(1, 0.4, 0.2)], 'blade': D(1, 0.35), 'feet': {'l': (-0.04, 0), 'r': (0.12, 0)}}],
    'K_Lunge': [
        {'hips': (-0.1, -0.06), 'spine': D(-0.1, 1), 'chest': (D(-0.1, 1), -0.4), 'armR': [D(-0.9, -0.3, 0.4), D(1, 0.05, 0.3)], 'blade': D(1, 0.08)},
        {'hips': (0.28, -0.24), 'spine': D(0.5, 1), 'chest': (D(0.55, 1), 0.3), 'armR': [D(1, 0.0, 0.3), D(1, 0.05, 0.2)], 'blade': D(1, 0.12), **DEEP},
        {'hips': (0.27, -0.25), 'spine': D(0.5, 1), 'chest': (D(0.52, 1), 0.25), 'armR': [D(1, -0.05, 0.32), D(1, 0.05, 0.2)], 'blade': D(1, 0.12), **DEEP}],
}
GUARD_SPEC = {'hips': (0, 0), 'chest': (D(0.3, 1), 0.0), 'spine': D(0, 1), 'armR': GUARD_R, 'blade': GUARD_BLADE, 'feet': {'l': (0, 0), 'r': (0, 0)}}
def between(a, b, up=0.5):
    out = {}
    for k in set(a) | set(b):
        x, y = a.get(k, GUARD_SPEC.get(k)), b.get(k, GUARD_SPEC.get(k))
        if x is None or y is None: out[k] = x if y is None else y; continue
        if k == 'feet': out[k] = {s: tuple((p + q) / 2 for p, q in zip(x.get(s, (0, 0)), y.get(s, (0, 0)))) for s in 'lr'}
        elif k == 'hips': out[k] = tuple((p + q) / 2 for p, q in zip(x, y))
        elif k == 'armR': out[k] = [((p + q) / 2 + Vector((-0.45, 0, 0.25 * up))).normalized() for p, q in zip(x, y)]
        elif k == 'armL': out[k] = [((p + q) / 2).normalized() for p, q in zip(x, y)]
        elif isinstance(x, tuple): out[k] = (((x[0] + y[0]) / 2).normalized(), (x[1] + y[1]) / 2)
        else: out[k] = ((x + y) / 2 + Vector((0, 0, up))).normalized()
    return out
g = P_({}, two=False)
for name, (wind, strike, follow) in SWINGS.items():
    over = {'K_Thrust': 0.0, 'K_Jab': 0.0, 'K_Lunge': 0.0, 'K_Chop': -0.5, 'K_Slash': 0.35, 'K_Back': 0.35}.get(name, 0.8)   # how far the arc bows up between the wind-up and the cut (the finisher bows low: it rises)
    one = name in ('K_Slash', 'K_Back', 'K_Chop')            # the sword cuts are one-handed, as the guard is (two hands would pull the blade in)
    keyed(name, [(0, g), (4, P_(between(GUARD_SPEC, wind), two=not one)), (8, P_(wind, two=not one)), (11, P_(between(wind, strike, over), two=not one)),
                 (14, P_(strike, two=not one)), (18, P_(follow, two=not one)), (24, P_(between(follow, GUARD_SPEC), two=not one)), (32, g)])
po.restore(base)
for a in list(bpy.data.actions):
    if not (a.name.startswith('K_') or a.name in ('Running_A', 'Hit_A', 'Hit_B', 'Blocking')): bpy.data.actions.remove(a)
import json
arm['climb_gait'] = json.dumps(GAIT)     # read by the game (glTF extras on the Rig node): stride per loop in model units
print('gait', GAIT)
print('clips', sorted(a.name for a in bpy.data.actions))
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)

# ---- 8. export
for a in bpy.data.actions: a.use_fake_user = True
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_image_format='JPEG', export_extras=True,
                          export_jpeg_quality=85, export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes')
