# The crawler's body: a cave scuttler in the skeleton's and the bat's style. Six jointed legs, a low thorax, a heavy
# abdomen shingled with chitin plates (a band of old-blood red on each) and a row of spines, a blunt head with four
# glowing eyes, two short horns, and big hooked mandibles. Rigged (root, thorax, abdomen, head, two mandibles, each
# leg's femur and tibia) and animated for the crawler's states.
#
#   <venv with bpy>/bin/python tools/blender/crawler.py
#   -> assets/models/crawler/crawler.glb
# Clips: Idle (twitching), Skitter (one tripod stride), Rear (up on its hind legs, front legs high, mandibles wide:
# the wind-up, held at its end), Lunge (the strike), Stun (splayed and reeling), Death (flips onto its back, legs curl).
# Built in game units, facing -Y (glTF +Z), up +Z (glTF +Y), its feet on the ground at z = 0.
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
from creaturekit import armature, bone, Body, glow_mesh, export, hsh
from posekit import Poser
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'crawler', 'crawler.glb')
V = lambda x, y, z: Vector((x, y, z)).normalized()
Z = Vector((0, 0, 1))

# ---- palette on screen
SHELL, PLATE, EDGE, STRIPE, BELLY, LEG, JOINT, BONE = (0.23, 0.15, 0.19), (0.43, 0.3, 0.37), (0.6, 0.47, 0.48), (0.48, 0.1, 0.08), (0.52, 0.4, 0.39), (0.17, 0.11, 0.14), (0.48, 0.35, 0.34), (0.82, 0.74, 0.57)

# ---- the skeleton
arm = armature('CrawlerRig')
bone(arm, 'root', (0, 0, 0), (0, -0.25, 0), roll=Z)
bone(arm, 'body', (0, 0.15, 0.5), (0, -0.3, 0.52), 'root')
bone(arm, 'abd', (0, 0.15, 0.55), (0, 1.0, 0.62), 'body')
bone(arm, 'head', (0, -0.3, 0.52), (0, -0.62, 0.5), 'body')
for s, sx in (('l', 1), ('r', -1)):
    bone(arm, 'mand.' + s, (sx * 0.1, -0.66, 0.42), (sx * 0.16, -0.98, 0.34), 'head')
LEG_Y, LEG_A = (-0.25, -0.02, 0.2), (0.62, 0.05, -0.52)     # where each pair joins the thorax, and how far it points forward
LEGS = {}
for i in range(3):
    for s, sx in (('l', 1), ('r', -1)):
        A = Vector((sx * 0.24, LEG_Y[i], 0.48)); h = Vector((sx * math.cos(LEG_A[i]), -math.sin(LEG_A[i]), 0))
        K = A + h * 0.55 + Vector((0, 0, 0.38)); F = K + h * 0.55 + Vector((0, 0, -0.86))
        bone(arm, 'femur.%d.%s' % (i, s), A, K, 'body'); bone(arm, 'tibia.%d.%s' % (i, s), K, F, 'femur.%d.%s' % (i, s))
        LEGS[(i, s)] = (A, K, F, h)
bpy.ops.object.mode_set(mode='OBJECT')

# ---- the body
B = Body(['crawler_shell', 'crawler_bone'])
w = lambda n: {n: 1.0}
B.blob((0, -0.08, 0.52), (0.3, 0.32, 0.22), w('body'), 'shell', seed=1)
B.blob((0, -0.05, 0.4), (0.22, 0.26, 0.12), w('body'), 'belly', seed=2)
B.plate((0, -0.1, 0.72), (0.44, 0.5, 0.07), (0, 0, 1), (0, -1, 0), w('body'), 'plate', taper=0.2)
B.blob((0, 0.62, 0.62), (0.42, 0.56, 0.34), w('abd'), 'shell', seed=3)
B.blob((0, 0.6, 0.45), (0.3, 0.44, 0.16), w('abd'), 'belly', seed=4)
for k in range(4):                                   # the abdomen's plates, overlapping toward the tail, each with a spine
    y, z = 0.26 + 0.22 * k, 1.01 - 0.05 * k - 0.025 * k * k
    B.plate((0, y, z), (0.74 - 0.08 * k, 0.34, 0.08), V(0, 0.35 + 0.25 * k, 1), (0, 1, 0), w('abd'), 'plate', taper=0.15)
    B.cone((0, y + 0.06, z + 0.03), (0, y + 0.2, z + 0.26 - 0.03 * k), 0.045, w('abd'), 'spike', mat=1)
    for sx in (1, -1): B.cone((sx * (0.3 - 0.04 * k), y, z - 0.12), (sx * (0.46 - 0.05 * k), y + 0.08, z - 0.02), 0.03, w('abd'), 'spike', mat=1)
B.blob((0, -0.5, 0.52), (0.24, 0.22, 0.19), w('head'), 'shell', seed=5)
B.plate((0, -0.52, 0.66), (0.34, 0.3, 0.06), V(0, -0.4, 1), (0, -1, 0), w('head'), 'plate', taper=0.3)   # the brow
for sx in (1, -1): B.cone((sx * 0.1, -0.44, 0.68), (sx * 0.16, -0.3, 0.88), 0.04, w('head'), 'spike', mat=1)   # horns
for s, sx in (('l', 1), ('r', -1)):
    m = w('mand.' + s)
    b0, b1, b2 = Vector((sx * 0.1, -0.64, 0.43)), Vector((sx * 0.21, -0.86, 0.39)), Vector((sx * 0.09, -1.03, 0.33))
    B.cone(b0, b1, 0.065, m, 'fang', mat=1, r2=0.04); B.cone(b1, b2, 0.042, m, 'fang', mat=1)
    for u in (0.35, 0.7): p = b0.lerp(b1, u); B.cone(p, p + Vector((-sx * 0.08, -0.03, -0.02)), 0.018, m, 'spike', mat=1, segs=4)
for (i, s), (A, K, F, h) in LEGS.items():
    fm, tb = w('femur.%d.%s' % (i, s)), w('tibia.%d.%s' % (i, s))
    B.cone(A, K, 0.075, fm, 'leg', r2=0.05)
    B.blob(K, (0.07, 0.07, 0.07), fm, 'joint', u=6, v=4, seed=i)
    Fp = F + Vector((0, 0, 0.09))
    B.cone(K, Fp, 0.05, tb, 'leg', r2=0.022)
    B.cone(Fp, F + h * 0.07, 0.024, tb, 'spike', mat=1, segs=4)                                   # the claw
    for u in (0.3, 0.55): p = K.lerp(Fp, u); B.cone(p, p + h * 0.08 + Vector((0, 0, 0.05)), 0.016, tb, 'spike', mat=1, segs=4)   # spines
def colour(kind, p, n):
    if kind == 'plate':
        c = Vector(PLATE).lerp(Vector(EDGE), max(0, n - 0.55) * 1.5)
        if p.y > 0.2 and (p.y * 4.5) % 1.0 > 0.6: c = c.lerp(Vector(STRIPE), 0.75)                   # the red band on each abdominal plate
        return c * (0.8 + 0.35 * n)
    if kind == 'belly': return Vector(BELLY) * (0.8 + 0.35 * n)
    if kind == 'leg': return Vector(LEG).lerp(Vector(JOINT), max(0, n - 0.6)) * (0.85 + 0.3 * n)
    if kind == 'joint': return Vector(JOINT) * (0.8 + 0.3 * n)
    if kind == 'fang': return Vector(SHELL).lerp(Vector(BONE), min(1, max(0, (-p.y - 0.7) * 3.2))) * (0.85 + 0.25 * n)
    if kind == 'spike': return Vector(BONE) * (0.7 + 0.35 * n)
    return Vector(SHELL) * (0.75 + 0.5 * n)
B.finish(arm, 'Crawler_Body', colour, {'crawler_shell': 0.55, 'crawler_bone': 0.5})
glow_mesh(arm, 'Crawler_Eyes', 'crawler_eye', [((sx * 0.075, -0.7, 0.6), 0.042, (1.2, 1, 1)) for sx in (1, -1)] + [((sx * 0.15, -0.64, 0.57), 0.03, (1, 1, 1)) for sx in (1, -1)], 'head')

# ---- poses
po = Poser(arm); po.keyed = [b.name for b in arm.data.bones]
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'
rest = po.snapshot()
TRIPOD = {(0, 'l'), (1, 'r'), (2, 'l')}
def legdir(i, s, swing=0.0, lift=0.0, spread=0.0, flip=False):
    sx = (1 if s == 'l' else -1) * (-1 if flip else 1); a = LEG_A[i] + swing
    h = Vector((sx * math.cos(a), -math.sin(a), 0))
    return (h * 0.82 + Z * (0.57 + lift)).normalized(), (h * (0.54 + spread) - Z).normalized()
def pose(phase=None, rear=0.0, lunge=0.0, stun=0.0, dead=0.0, mand=0.0, bob=0.0, wob=0.0):
    po.restore(rest)
    pb = po.P['root']; m = pb.matrix.copy()
    m.translation.z += bob - 0.08 * stun + 0.42 * dead; m.translation.y -= 0.35 * lunge; pb.matrix = m; po.update()
    if dead: po.aim('root', V(0, -1, 0), twist=math.pi * dead)
    po.aim('body', V(wob, -1, 0.04 + 0.65 * rear - 0.28 * lunge))
    po.aim('abd', V(-wob * 0.6, 1, 0.08 - 0.35 * rear + 0.15 * lunge + 0.1 * stun))
    po.aim('head', V(wob * 1.5, -1, -0.06 + 0.45 * rear - 0.3 * lunge - 0.2 * stun))
    for s, sx in (('l', 1), ('r', -1)):
        open_ = mand + 0.9 * rear - 0.6 * lunge
        po.aim('mand.' + s, V(sx * (0.18 + 0.55 * open_), -1, -0.25 - 0.1 * stun) if not dead else V(sx * 0.6, -0.4, 0.6))
    for i in range(3):
        for s in 'lr':
            sx = 1 if s == 'l' else -1
            if dead:   # on its back: legs up and curling in
                c = min(1, dead); fd, _ = legdir(i, s, flip=True); fd = (fd * 0.4 + Z * 0.9).normalized()
                td = (Vector((sx * 0.6 * (1 - c), 0, 0)) + Vector((-sx * 0.5 * c, 0.1 * (i - 1), 0)) + Z * (0.6 - 0.9 * c)).normalized()
                po.aim('femur.%d.%s' % (i, s), fd); po.aim('tibia.%d.%s' % (i, s), td); continue
            sw, lf, sp = 0.0, 0.0, 0.0
            if phase is not None:
                ph = phase + (0 if (i, s) in TRIPOD else math.pi); sw = 0.38 * math.sin(ph); lf = 0.38 * max(0.0, math.cos(ph))
            sp += 0.45 * stun; lf -= 0.28 * stun
            fd, td = legdir(i, s, sw, lf, sp)
            if i == 0 and rear:   # the front legs raised high, claws hooked forward
                fd = fd.lerp(V(sx * 0.35, -0.55, 0.95), rear).normalized(); td = td.lerp(V(sx * 0.2, -1, -0.15), rear).normalized()
            if i == 0 and lunge:
                fd = fd.lerp(V(sx * 0.3, -1, 0.25), lunge).normalized(); td = td.lerp(V(sx * 0.15, -1, -0.55), lunge).normalized()
            if i == 2 and rear: fd = fd.lerp((fd + Vector((0, 0.3, -0.3))).normalized(), rear).normalized()   # the hind legs brace
            po.aim('femur.%d.%s' % (i, s), fd); po.aim('tibia.%d.%s' % (i, s), td)
    return po.snapshot()
po.make_action('Idle', [(0, pose()), (8, pose(mand=0.25, bob=0.01)), (12, pose(mand=0.05)), (18, pose(mand=0.2, bob=0.015, wob=0.04)), (24, pose())])
po.make_action('Skitter', [(f, pose(phase=f / 12 * math.tau, bob=0.03 * abs(math.sin(f / 12 * math.tau * 2)), mand=0.1)) for f in (0, 2, 4, 6, 8, 10, 12)])
po.make_action('Rear', [(0, pose()), (4, pose(rear=0.7)), (8, pose(rear=1.0)), (10, pose(rear=1.0, mand=0.1))])
po.make_action('Lunge', [(0, pose(rear=1.0)), (2, pose(rear=0.3, lunge=0.7)), (4, pose(lunge=1.0)), (8, pose(lunge=0.8))])
po.make_action('Stun', [(f, pose(stun=1.0, wob=0.18 * math.sin(f / 16 * math.tau), mand=-0.2)) for f in (0, 4, 8, 12, 16)])
po.make_action('Death', [(0, pose()), (3, pose(dead=0.5, mand=0.5)), (6, pose(dead=1.0)), (12, pose(dead=1.0, mand=0.3))])
po.restore(rest)
export(OUT)
