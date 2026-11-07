# The spitter's body: a bloated wall tick in the skeleton's and the bat's style. A flat, ridged carapace pressed to the
# wall with a fringe of barbs, six long hooked legs gripping the stone, and hanging from it a swollen, veined sac that
# glows (its own mesh: the game lights it in the zone's colour and brightens it as it charges), a blunt head below with
# three glowing eyes and a puckered mouth of hooked lips.
# Rigged (root, body, sac, head, mouth, each leg's two segments) and animated for the spitter's states.
#
#   <venv with bpy>/bin/python tools/blender/spitter.py
#   -> assets/models/spitter/spitter.glb
# Clips: Cling (breathing, legs shifting), Charge (the sac swells, the head lifts, the mouth opens: held at its end),
# Spit (the sac clenches and the head jerks), Death (the sac collapses, the legs let go and curl).
# Built in game units. It faces -Y (glTF +Z: out from the wall toward the shaft), up +Z; the wall is the plane y = 0.36.
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
from creaturekit import armature, bone, Body, glow_mesh, export
from posekit import Poser
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'spitter', 'spitter.glb')
V = lambda x, y, z: Vector((x, y, z)).normalized()
WALL = 0.36

SHELL, RIDGE, VEIN, LEG, BONE, FLESH = (0.15, 0.11, 0.14), (0.34, 0.25, 0.3), (0.2, 0.06, 0.08), (0.1, 0.07, 0.09), (0.8, 0.72, 0.55), (0.42, 0.28, 0.3)

arm = armature('SpitterRig')
bone(arm, 'root', (0, WALL, 0), (0, WALL - 0.2, 0), roll=Vector((0, 0, 1)))
bone(arm, 'body', (0, 0.3, 0.05), (0, 0.05, 0.05), 'root', roll=Vector((0, 0, 1)))
bone(arm, 'sac', (0, 0.05, 0.12), (0, -0.25, 0.12), 'body', roll=Vector((0, 0, 1)))
bone(arm, 'head', (0, 0.1, -0.36), (0, -0.2, -0.56), 'body', roll=Vector((0, 0, 1)))
bone(arm, 'mouth', (0, -0.22, -0.58), (0, -0.4, -0.63), 'head', roll=Vector((0, 0, 1)))
LEGS = []
for i in range(6):
    phi = (i + 0.5) / 6 * math.tau; out = Vector((math.cos(phi), 0, math.sin(phi)))
    H = Vector((0.4 * math.cos(phi), 0.16, 0.34 * math.sin(phi) + 0.05))
    K = H + out * 0.46 + Vector((0, -0.3, 0)); F = K + out * 0.42 + Vector((0, WALL - K.y, 0))
    bone(arm, 'leg%d.a' % i, H, K, 'body'); bone(arm, 'leg%d.b' % i, K, F, 'leg%d.a' % i)
    LEGS.append((phi, out, H, K, F))
bpy.ops.object.mode_set(mode='OBJECT')

B = Body(['spitter_shell', 'spitter_bone'])
w = lambda n: {n: 1.0}
B.blob((0, 0.2, 0.06), (0.62, 0.2, 0.54), w('body'), 'shell', seed=1)                    # the carapace, flat to the wall
for k in range(5):                                                                       # ridges across it
    z = -0.3 + 0.16 * k
    B.plate((0, 0.05 - 0.04 * math.cos((k - 2) * 0.6), z + 0.05), (0.95 - 0.12 * abs(k - 2), 0.12, 0.05), V(0, -1, 0.15), (0, 0, 1), w('body'), 'ridge', taper=0.1)
for j in range(14):                                                                      # the barbed fringe
    a = j / 14 * math.tau; d = Vector((math.cos(a), 0, math.sin(a)))
    base = d * 0.56 + Vector((0, 0.2, 0.06 + 0.0)); B.cone(base, base + d * 0.17 + Vector((0, -0.06, 0)), 0.035, w('body'), 'spike', mat=1, segs=4)
for k in range(7):                                                                       # veins down the sac's face (they swell with it)
    az = k / 7 * math.tau + 0.3
    pts = [Vector((0, -0.12, 0.12)) + Vector((0.44 * math.sin(th) * math.cos(az + 0.25 * th), -0.38 * math.cos(th), 0.42 * math.sin(th) * math.sin(az + 0.25 * th))) * 1.03
           for th in (0.3, 0.75, 1.2, 1.65, 2.1)]
    for p, q in zip(pts, pts[1:]): B.cone(p, q, 0.026, w('sac'), 'vein', r2=0.02, segs=4)
B.blob((0, 0.0, -0.46), (0.24, 0.22, 0.2), w('head'), 'shell', seed=2)
B.blob((0, -0.1, -0.5), (0.2, 0.2, 0.16), w('head'), 'flesh', seed=3)
for j in range(7):                                                                       # the puckered mouth's hooked lips
    a = j / 7 * math.tau; d = Vector((math.cos(a), 0, math.sin(a)))
    base = Vector((0, -0.26, -0.58)) + d * 0.08; B.cone(base, base + d * 0.06 + Vector((0, -0.11, 0)), 0.03, w('mouth'), 'spike', mat=1, segs=4)
for i, (phi, out, H, K, F) in enumerate(LEGS):
    B.cone(H, K, 0.05, w('leg%d.a' % i), 'leg', r2=0.035); B.blob(K, (0.045, 0.045, 0.045), w('leg%d.a' % i), 'ridge', u=6, v=4)
    B.cone(K, F - out * 0.04, 0.035, w('leg%d.b' % i), 'leg', r2=0.015)
    B.cone(F - out * 0.04, F + Vector((0, 0.05, 0)), 0.02, w('leg%d.b' % i), 'spike', mat=1, segs=4)          # the hook into the stone
def colour(kind, p, n):
    if kind == 'ridge': return Vector(RIDGE) * (0.8 + 0.4 * n)
    if kind == 'vein': return Vector(VEIN) * (0.8 + 0.4 * n)
    if kind == 'leg': return Vector(LEG) * (0.85 + 0.35 * n)
    if kind == 'spike': return Vector(BONE) * (0.7 + 0.35 * n)
    if kind == 'flesh': return Vector(FLESH) * (0.8 + 0.4 * n)
    return Vector(SHELL) * (0.8 + 0.45 * n)
B.finish(arm, 'Spitter_Body', colour, {'spitter_shell': 0.55, 'spitter_bone': 0.5})
# the sac: its own glowing mesh on the sac bone, lumpy
sbm = bmesh.new(); res = bmesh.ops.create_uvsphere(sbm, u_segments=14, v_segments=10, radius=1.0)
for v in res['verts']:
    p = v.co.copy(); j = 1 + 0.08 * math.sin(p.x * 7) * math.sin(p.z * 6 + 1)
    v.co = Vector((p.x * 0.44 * j, p.y * 0.38 * j, p.z * 0.42 * j)) + Vector((0, -0.12, 0.12))
sme = bpy.data.meshes.new('Spitter_Sac'); sbm.to_mesh(sme); sbm.free()
for poly in sme.polygons: poly.use_smooth = True
sac = bpy.data.objects.new('Spitter_Sac', sme); bpy.context.collection.objects.link(sac)
sm = bpy.data.materials.new('spitter_sac'); sm.use_nodes = True; sb = sm.node_tree.nodes['Principled BSDF']
sb.inputs['Base Color'].default_value = (0.5, 0.35, 0.6, 1); sb.inputs['Emission Color'].default_value = (0.5, 0.35, 0.6, 1); sb.inputs['Emission Strength'].default_value = 1.0; sb.inputs['Roughness'].default_value = 0.3
sme.materials.append(sm)
sac.parent = arm; sac.parent_type = 'BONE'; sac.parent_bone = 'sac'; sac.matrix_world = Matrix.Identity(4)
glow_mesh(arm, 'Spitter_Eyes', 'spitter_eye', [((x, -0.17, -0.38), 0.032, (1, 1, 1)) for x in (-0.09, 0, 0.09)], 'head')
glow_mesh(arm, 'Spitter_Maw', 'spitter_maw', [((0, -0.25, -0.58), 0.06, (1, 0.6, 1))], 'mouth')

po = Poser(arm); po.keyed = [b.name for b in arm.data.bones]
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'
rest = po.snapshot()
def pose(swell=1.0, lift=0.0, mouth=1.0, grip=0.0, dead=0.0, breathe=0.0):
    po.restore(rest)
    po.P['sac'].scale = Vector((swell, swell * 0.9 + 0.1, swell)); po.update()
    po.aim('head', V(0, -0.3 - 0.9 * lift, -0.65 + 0.5 * lift - 0.6 * dead))
    po.P['mouth'].scale = Vector((mouth, 1, mouth)); po.update()
    for i, (phi, out, H, K, F) in enumerate(LEGS):
        wig = 0.06 * math.sin(phi * 3 + breathe * math.tau)
        a = (K - H).normalized(); b = (F - K).normalized()
        if dead:   # let go: the legs fold in toward the belly
            a = a.lerp(V(-out.x * 0.3, -1, -out.z * 0.3), dead).normalized(); b = b.lerp(V(-out.x, -0.4, -out.z), dead).normalized()
        else:
            a = (a + Vector((0, -grip * 0.3, 0)) + out * wig).normalized(); b = (b + Vector((0, grip * 0.2, 0))).normalized()
        po.aim('leg%d.a' % i, a); po.aim('leg%d.b' % i, b)
    if dead: po.aim('body', V(0, -1, -0.4 * dead))
    return po.snapshot()
po.make_action('Cling', [(f, pose(swell=1.0 + 0.04 * math.sin(f / 48 * math.tau), breathe=f / 48)) for f in (0, 12, 24, 36, 48)])
po.make_action('Charge', [(0, pose()), (8, pose(swell=1.15, lift=0.3, mouth=1.2, grip=0.3)), (16, pose(swell=1.35, lift=0.7, mouth=1.6, grip=0.6)), (24, pose(swell=1.45, lift=1.0, mouth=1.9, grip=0.8))])
po.make_action('Spit', [(0, pose(swell=1.45, lift=1.0, mouth=1.9, grip=0.8)), (2, pose(swell=0.85, lift=1.2, mouth=2.3, grip=0.2)), (5, pose(swell=0.95, lift=0.5, mouth=1.3)), (8, pose())])
po.make_action('Death', [(0, pose()), (4, pose(swell=0.5, dead=0.4, mouth=1.6)), (12, pose(swell=0.25, dead=1.0, mouth=0.8))])
po.restore(rest)
export(OUT)
