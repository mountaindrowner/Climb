# The warrior, built and animated in headless Blender, exported to glTF for the game.
#
#   <venv with `pip install bpy==5.2.3`>/bin/python tools/blender/warrior.py
#   -> assets/models/warrior/warrior.glb
#
# Everything is authored in the GAME's axes and converted on the way in: +x forward (the way he faces),
# +y up, +z his right side (the side that faces the camera). Model units: he stands about 1.6 tall and the
# game scales him by 1.5. The rig is a hierarchy of joints (empties) with rigid low-poly parts, the same shape
# as the hand-built rig in src/entities/player/model.js, so gameplay heights do not change.
# Each animation clip is a set of keyframes on the joints, exported as one named glTF animation.
# Clips animate the limbs, head, body and weapon; the cape and squash-and-stretch stay procedural in the game.
import math, os, sys
import bpy, bmesh
from mathutils import Vector, Matrix

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'models', 'warrior', 'warrior.glb')
FPS = 30

bpy.ops.wm.read_factory_settings(use_empty=True)
SC = bpy.context.scene
SC.render.fps = FPS

# ---------------------------------------------------------------- axes
def B(x, y, z):
    """Game axes (x fwd, y up, z right) -> Blender axes (x, -z, y)."""
    return Vector((x, -z, y))

def set_rot(obj, rx=0.0, ry=0.0, rz=0.0):
    """A game-axes Euler (three.js 'XYZ' order) -> the same rotation in Blender ('YZX' order, axes remapped)."""
    obj.rotation_mode = 'YZX'
    obj.rotation_euler = (rx, -rz, ry)

def hsh(*v):
    h = 0
    for x in v: h = (h * 2654435761 + int(x * 1000) + 97) & 0xFFFFFFFF
    h ^= h >> 15; h = (h * 2246822519) & 0xFFFFFFFF; h ^= h >> 13
    return (h & 0xFFFF) / 65535.0

# ---------------------------------------------------------------- materials
def material(name, rough=0.85, metal=0.0, emit=None):
    m = bpy.data.materials.new(name)
    if hasattr(m, 'use_nodes') and not m.node_tree: m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes.get('Principled BSDF')
    col = nt.nodes.new('ShaderNodeVertexColor'); col.layer_name = 'Col'
    nt.links.new(col.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emit:
        bsdf.inputs['Emission Color'].default_value = (*emit, 1)
        bsdf.inputs['Emission Strength'].default_value = 2.0
    return m

MAT = {
    'cloth': material('cloth', 0.95), 'leather': material('leather', 0.8), 'skin': material('skin', 0.85),
    # modest metalness: under the Pool's teal light, very metallic parts mirror it as cyan streaks
    'mail': material('mail', 0.7, 0.18), 'steel': material('steel', 0.55, 0.3), 'wood': material('wood', 0.9),
    'hair': material('hair', 1.0), 'glow': material('glow', 0.5, 0.0, (1.0, 0.75, 0.4)),
}
def srgb(h, lift=1.15):
    """Hex colour to the linear-ish 0..1 values the vertex colours carry, lifted a touch: the shaft is dark."""
    return [min(1.0, ((h >> s) & 255) / 255.0 * lift) for s in (16, 8, 0)]
COL = {
    'cloth': srgb(0x6e2f22), 'tabard': srgb(0x7a3426), 'leather': srgb(0x4a3322), 'leatherHi': srgb(0x5e412b),
    'skin': srgb(0xc9966f), 'mail': srgb(0x5a6070), 'steel': srgb(0x8a93a2), 'steelDk': srgb(0x5c636f),
    'wood': srgb(0x5b3f25), 'hair': srgb(0x3a2a20), 'dark': srgb(0x241c24), 'cape': srgb(0x3b2430),
    'brass': srgb(0xb08a3a), 'blade': srgb(0xc3cad6), 'glow': srgb(0xffc36b), 'eye': srgb(0x140f14),
}

# ---------------------------------------------------------------- the rig
def joint(name, parent=None, at=(0, 0, 0), rot=(0, 0, 0)):
    o = bpy.data.objects.new(name, None); SC.collection.objects.link(o)
    o.empty_display_size = 0.05; o.parent = parent; o.location = B(*at); set_rot(o, *rot)
    return o

# ---------------------------------------------------------------- mesh helpers (all in game axes, relative to a joint)
def finish(name, bm, parent, mat, color, shade=(0.82, 1.06), stripes=0.0, bottom_dark=0.18):
    """Write a bmesh as a flat-shaded part with baked vertex colour: per-face variation, a darkening toward the
    underside (cheap ambient occlusion) and optional horizontal stripes (mail rings)."""
    for v in bm.verts: v.co = B(*v.co)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    attr = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    zs = [v.co.z for v in me.vertices]; z0, z1 = min(zs), max(zs); span = max(1e-4, z1 - z0)
    for poly in me.polygons:
        n = poly.normal; f = shade[0] + (shade[1] - shade[0]) * hsh(poly.center.x, poly.center.y, poly.center.z)
        if n.z < -0.5: f *= 0.72                    # faces looking down sit in shadow
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            g = 1.0 - bottom_dark * (1.0 - (v.z - z0) / span)
            s = 1.0 - stripes * (0.5 + 0.5 * math.sin(v.z * 140.0)) if stripes else 1.0
            c = [min(1.0, ch * f * g * s) for ch in color]
            attr.data[li].color = (*c, 1.0)
    me.materials.append(MAT[mat])
    for p in me.polygons: p.use_smooth = False
    o = bpy.data.objects.new(name, me); SC.collection.objects.link(o); o.parent = parent
    return o

def box(name, parent, size, at=(0, 0, 0), mat='leather', color='leather', bevel=0.012, taper=None, **kw):
    """A chamfered box. taper=(sx, sz) scales the top face, for wedges and tapered plates."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        x, y, z = v.co
        if taper and y > 0: x *= taper[0]; z *= taper[1]
        v.co = Vector((x * size[0] + at[0], y * size[1] + at[1], z * size[2] + at[2]))
    if bevel: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES', profile=0.5)
    return finish(name, bm, parent, mat, COL[color], **kw)

def limb(name, parent, length, r_top, r_bot, at=(0, 0, 0), sides=6, squash=1.0, mat='cloth', color='cloth', down=True, **kw):
    """A tapered prism hanging along -y (or rising along +y) from its joint."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=sides, radius1=r_bot, radius2=r_top, depth=length)
    for v in bm.verts:
        x, y, z = v.co          # the cone runs along z; lay it along y
        y2 = z + (-length / 2 if down else length / 2)
        v.co = Vector((x + at[0], y2 + at[1], y * squash + at[2]))
    return finish(name, bm, parent, mat, COL[color], **kw)

def lathe(name, parent, profile, at=(0, 0, 0), sides=8, mat='steel', color='steel', squash=1.0, **kw):
    """Spin a (radius, height) profile around y: helmets, pommels, bosses."""
    bm = bmesh.new(); rings = []
    for r, y in profile:
        ring = []
        for i in range(sides):
            a = (i + 0.5) / sides * math.tau
            ring.append(bm.verts.new((math.cos(a) * r + at[0], y + at[1], math.sin(a) * r * squash + at[2])))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(sides):
            j = (i + 1) % sides
            try: bm.faces.new((a[i], a[j], b[j], b[i]))
            except ValueError: pass
    if profile[0][0] > 0: bm.faces.new(list(reversed(rings[0])))
    if profile[-1][0] > 0: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, parent, mat, COL[color], **kw)

def plate(name, parent, w, h, t, at, mat='steel', color='steel', curve=0.0, segs=4, **kw):
    """A slightly curved plate in the x-y plane, t thick along z: shields, cape panels, tassets."""
    bm = bmesh.new(); front, back = [], []
    for i in range(segs + 1):
        u = i / segs - 0.5
        zc = curve * (u * u * 4 - 1) * 0.5
        for (lst, dz) in ((front, t / 2), (back, -t / 2)):
            lst.append((bm.verts.new((u * w + at[0], -h / 2 + at[1], zc + dz + at[2])), bm.verts.new((u * w + at[0], h / 2 + at[1], zc + dz + at[2]))))
    for i in range(segs):
        f0, f1, b0, b1 = front[i], front[i + 1], back[i], back[i + 1]
        bm.faces.new((f0[0], f1[0], f1[1], f0[1])); bm.faces.new((b0[1], b1[1], b1[0], b0[0]))
        bm.faces.new((f0[1], f1[1], b1[1], b0[1])); bm.faces.new((b0[0], b1[0], f1[0], f0[0]))
    bm.faces.new((back[0][0], front[0][0], front[0][1], back[0][1])); bm.faces.new((front[-1][0], back[-1][0], back[-1][1], front[-1][1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, parent, mat, COL[color], **kw)

# ---------------------------------------------------------------- build
HIP_Y, TORSO_Y = 0.80, 0.92
root = joint('warrior')
body = joint('body', root)

# legs: hip -> thigh -> knee -> shin, boot
for side, tag in ((1, 'R'), (-1, 'L')):
    hip = joint(f'leg{tag}_hip', body, (0, HIP_Y, side * 0.1))
    limb(f'thigh{tag}', hip, 0.37, 0.078, 0.062, at=(0.0, 0, 0), sides=7, mat='cloth', color='cloth')
    box(f'hipStrap{tag}', hip, (0.15, 0.08, 0.15), at=(0, -0.04, 0), color='leather')
    knee = joint(f'leg{tag}_knee', hip, (0, -0.36, 0))
    box(f'kneeCop{tag}', knee, (0.09, 0.08, 0.1), at=(0.045, -0.01, 0), mat='steel', color='steelDk', bevel=0.02)
    limb(f'shin{tag}', knee, 0.25, 0.06, 0.052, at=(0, 0, 0), sides=7, mat='leather', color='dark')
    limb(f'bootCuff{tag}', knee, 0.13, 0.068, 0.062, at=(0, -0.2, 0), sides=7, mat='leather', color='leatherHi')
    box(f'boot{tag}', knee, (0.24, 0.1, 0.12), at=(0.05, -0.39, 0), color='leather', taper=(0.85, 0.9), bevel=0.018)
    box(f'greave{tag}', knee, (0.03, 0.2, 0.08), at=(0.06, -0.13, 0), mat='steel', color='steel', bevel=0.008)

# pelvis: belt, buckle, tassets, pouch, lantern
box('belt', body, (0.22, 0.09, 0.3), at=(0, HIP_Y + 0.07, 0), color='leather', bevel=0.015)
box('buckle', body, (0.03, 0.06, 0.07), at=(0.115, HIP_Y + 0.07, 0.0), mat='steel', color='brass', bevel=0.006)
for side in (1, -1):
    plate(f'tasset{side}', body, 0.12, 0.16, 0.025, at=(0.07, HIP_Y - 0.03, side * 0.1), mat='steel', color='steelDk', curve=0.02)
box('pouch', body, (0.1, 0.12, 0.08), at=(0.04, HIP_Y - 0.01, -0.17), color='leatherHi', bevel=0.02)
lantern = joint('lantern', body, (0.03, HIP_Y - 0.09, 0.2))
box('lanternCage', lantern, (0.1, 0.13, 0.1), mat='steel', color='dark', bevel=0.01)
box('lanternLight', lantern, (0.07, 0.09, 0.07), mat='glow', color='glow', bevel=0.0, shade=(1, 1), bottom_dark=0)

# torso: mail shirt tapering in at the waist, a tabard, a chest strap
torso = joint('torso', body, (0, TORSO_Y, 0))
box('waist', torso, (0.21, 0.17, 0.27), at=(0, 0.085, 0), mat='mail', color='mail', taper=(1.12, 1.15), stripes=0.18)
box('chest', torso, (0.25, 0.2, 0.34), at=(0, 0.24, 0), mat='mail', color='mail', taper=(1.05, 1.08), stripes=0.18, bevel=0.03)
box('tabard', torso, (0.03, 0.36, 0.2), at=(0.125, 0.12, 0), mat='cloth', color='tabard', taper=(1, 1.15), bevel=0.006)
box('strap', torso, (0.27, 0.05, 0.36), at=(0.0, 0.2, 0.0), color='leather', bevel=0.008)
box('collar', torso, (0.2, 0.07, 0.24), at=(0, 0.345, 0), mat='steel', color='steelDk', bevel=0.02)

# head: skull, nose, eyes, brow, beard; helmet lathed with a brim, nose guard and cheek guards
neck = joint('neck', torso, (0, 0.34, 0))
limb('neckSkin', neck, 0.08, 0.05, 0.055, at=(0, 0.08, 0), down=True, mat='skin', color='skin')
head = joint('head', neck, (0, 0.06, 0))
box('skull', head, (0.19, 0.2, 0.18), at=(0.01, 0.1, 0), mat='skin', color='skin', bevel=0.035)
box('nose', head, (0.05, 0.06, 0.045), at=(0.11, 0.085, 0), mat='skin', color='skin', taper=(0.6, 0.8), bevel=0.01)
for s in (1, -1): box(f'eye{s}', head, (0.02, 0.025, 0.035), at=(0.1, 0.115, s * 0.048), mat='hair', color='eye', bevel=0.0, shade=(1, 1))
box('brow', head, (0.04, 0.03, 0.15), at=(0.1, 0.14, 0), mat='hair', color='hair', bevel=0.008)
box('beard', head, (0.1, 0.13, 0.17), at=(0.07, 0.01, 0), mat='hair', color='hair', taper=(1.2, 1.1), bevel=0.02)
box('beardTip', head, (0.07, 0.06, 0.09), at=(0.09, -0.07, 0), mat='hair', color='hair', taper=(1.5, 1.6), bevel=0.01)
box('moustache', head, (0.03, 0.025, 0.12), at=(0.115, 0.06, 0), mat='hair', color='hair', bevel=0.006)
lathe('helmet', head, [(0.0, 0.33), (0.06, 0.325), (0.1, 0.3), (0.122, 0.26), (0.13, 0.2), (0.132, 0.165)], at=(0.005, 0, 0), sides=9, color='steel', squash=0.95)
lathe('brim', head, [(0.128, 0.155), (0.142, 0.165), (0.14, 0.19), (0.126, 0.2)], at=(0.005, 0, 0), sides=9, color='steelDk', squash=0.95)
box('noseGuard', head, (0.025, 0.13, 0.035), at=(0.125, 0.12, 0), mat='steel', color='steel', bevel=0.006)
for s in (1, -1): plate(f'cheek{s}', head, 0.1, 0.12, 0.018, at=(0.03, 0.1, s * 0.115), mat='steel', color='steelDk', curve=0.0)
box('crest', head, (0.16, 0.025, 0.03), at=(0.0, 0.335, 0), mat='steel', color='steelDk', bevel=0.006)

# arms: shoulder (pauldron) -> upper arm -> elbow -> forearm + bracer -> hand
for side, tag in ((1, 'R'), (-1, 'L')):
    sh = joint(f'arm{tag}_shoulder', torso, (0, 0.30, side * 0.21))
    lathe(f'pauldron{tag}', sh, [(0.0, 0.085), (0.07, 0.075), (0.1, 0.04), (0.105, 0.0), (0.09, -0.03)], at=(0, 0, side * 0.02), sides=8, color='steel', squash=1.0)
    lathe(f'pauldronLip{tag}', sh, [(0.1, -0.02), (0.112, -0.035), (0.11, -0.06), (0.095, -0.065)], at=(0, 0, side * 0.02), sides=8, color='steelDk')
    limb(f'upperArm{tag}', sh, 0.3, 0.058, 0.05, sides=7, mat='mail', color='mail', stripes=0.15)
    el = joint(f'arm{tag}_elbow', sh, (0, -0.3, 0))
    box(f'elbowWrap{tag}', el, (0.09, 0.07, 0.09), at=(0, -0.015, 0), color='leather')
    limb(f'forearm{tag}', el, 0.28, 0.047, 0.04, sides=7, mat='skin', color='skin')
    limb(f'bracer{tag}', el, 0.15, 0.054, 0.05, at=(0, -0.11, 0), sides=7, mat='leather', color='leatherHi')
    hand = joint(f'arm{tag}_hand', el, (0, -0.28, 0))
    box(f'glove{tag}', hand, (0.075, 0.085, 0.065), at=(0.01, -0.04, 0), color='leather', bevel=0.015)

# shield on the left forearm: a curved, banded heater with a boss
shield = joint('shield', bpy.data.objects['armL_elbow'], (0.02, -0.14, -0.08), (0, math.pi / 2, 0))
plate('shieldBoard', shield, 0.46, 0.56, 0.05, at=(0, 0, 0), mat='wood', color='wood', curve=0.06, segs=6)
for y in (0.2, -0.2): plate(f'shieldBand{y}', shield, 0.48, 0.05, 0.06, at=(0, y, 0.005), mat='steel', color='steelDk', curve=0.06, segs=6)
plate('shieldRim', shield, 0.05, 0.56, 0.06, at=(0.23, 0, -0.01), mat='steel', color='steelDk', segs=1)
plate('shieldRim2', shield, 0.05, 0.56, 0.06, at=(-0.23, 0, -0.01), mat='steel', color='steelDk', segs=1)
lathe('shieldBoss', shield, [(0.0, 0.07), (0.05, 0.06), (0.075, 0.03), (0.08, 0.0)], at=(0, 0, 0), sides=8, color='steel')
bpy.data.objects['shieldBoss'].rotation_mode = 'XYZ'; bpy.data.objects['shieldBoss'].rotation_euler = (math.pi / 2, 0, 0)

# cape: three hanging panels from the upper back (the game animates these)
cape = joint('cape1', torso, (-0.135, 0.31, 0))
plate('capePanel1', cape, 0.04, 0.28, 0.36, at=(0, -0.13, 0), mat='cloth', color='cape', segs=1)
c2 = joint('cape2', cape, (0, -0.26, 0)); plate('capePanel2', c2, 0.04, 0.28, 0.34, at=(0, -0.13, 0), mat='cloth', color='cape', segs=1)
c3 = joint('cape3', c2, (0, -0.26, 0)); plate('capePanel3', c3, 0.04, 0.28, 0.3, at=(0, -0.13, 0), mat='cloth', color='cape', segs=1, bottom_dark=0.3)

# weapons in the right hand, blade along +y from the grip
grip = joint('grip', bpy.data.objects['armR_hand'], (0.02, -0.04, 0), (0, 0, -1.5))
sword = joint('wep_sword', grip)
limb('swordGrip', sword, 0.16, 0.022, 0.022, at=(0, -0.08, 0), down=False, sides=6, color='leather')
box('swordGuard', sword, (0.06, 0.04, 0.28), at=(0, 0.01, 0), mat='steel', color='brass', bevel=0.01, taper=(1, 0.9))
lathe('swordPommel', sword, [(0.0, -0.21), (0.03, -0.2), (0.035, -0.175), (0.02, -0.16)], sides=6, color='brass')
box('swordBlade', sword, (0.016, 0.66, 0.1), at=(0, 0.36, 0), mat='steel', color='blade', taper=(0.6, 0.55), bevel=0.004, shade=(0.95, 1.1), bottom_dark=0.05)
box('swordFuller', sword, (0.02, 0.45, 0.025), at=(0, 0.3, 0), mat='steel', color='steelDk', bevel=0.0)
pick = joint('wep_pick', grip)
limb('pickHaft', pick, 0.92, 0.026, 0.03, at=(0, -0.16, 0), down=False, sides=6, mat='wood', color='wood')
box('pickHead', pick, (0.62, 0.11, 0.1), at=(0.1, 0.72, 0), mat='steel', color='steel', taper=(1.0, 0.8), bevel=0.015)
box('pickSpike', pick, (0.16, 0.07, 0.07), at=(0.47, 0.66, 0), mat='steel', color='steelDk', taper=(0.4, 0.5), bevel=0.006)
box('pickCollar', pick, (0.06, 0.12, 0.06), at=(0, 0.72, 0), mat='steel', color='brass', bevel=0.008)
spear = joint('wep_spear', grip)
limb('spearShaft', spear, 1.62, 0.022, 0.025, at=(0, -0.2, 0), down=False, sides=6, mat='wood', color='wood')
box('spearHead', spear, (0.022, 0.3, 0.11), at=(0, 1.55, 0), mat='steel', color='blade', taper=(0.3, 0.15), bevel=0.004)
box('spearSocket', spear, (0.05, 0.1, 0.05), at=(0, 1.38, 0), mat='steel', color='steelDk', bevel=0.008)

root.scale = (1, 1, 1)

# ---------------------------------------------------------------- clips
J = {o.name: o for o in bpy.data.objects if o.type == 'EMPTY'}
REST = {n: (o.location.copy(), o.rotation_euler.copy()) for n, o in J.items()}
ANIMATED = ['body', 'legR_hip', 'legR_knee', 'legL_hip', 'legL_knee', 'torso', 'neck', 'head',
            'armR_shoulder', 'armR_elbow', 'armR_hand', 'armL_shoulder', 'armL_elbow', 'armL_hand', 'grip']
GUARD = {'armR_shoulder': (0.15, 0, -0.25), 'armR_elbow': (0, 0, 0.9), 'armL_shoulder': (-0.25, 0, -0.1), 'armL_elbow': (0, 0, 0.8), 'grip': (0, 0, -1.5)}

def pose(frame, rots, body_pos=None, extra=None):
    """rots: joint -> (rx, ry, rz) in game axes. Anything in ANIMATED not given goes to its rest (or guard) value."""
    return (frame, rots, body_pos, extra or {})

def clip(name, frames, joints=ANIMATED, extra_joints=()):
    for jn in list(joints) + list(extra_joints):
        o = J[jn]; o.animation_data_create()
        act = bpy.data.actions.new(f'{name}|{jn}'); o.animation_data.action = act
        for frame, rots, body_pos, extra in frames:
            r = rots.get(jn, GUARD.get(jn, (0, 0, 0)))
            set_rot(o, *r)
            if jn == 'body':
                p = body_pos or (0, 0, 0); o.location = B(*p)
                o.keyframe_insert('location', frame=frame)
            if jn in extra:            # a joint that moves as well as turns (the shield in a block)
                o.location = B(*extra[jn]); o.keyframe_insert('location', frame=frame)
            o.keyframe_insert('rotation_euler', frame=frame)
        tr = o.animation_data.nla_tracks.new(); tr.name = name
        tr.strips.new(name, int(frames[0][0]), act)
        o.animation_data.action = None
        o.location, o.rotation_euler = REST[jn][0].copy(), REST[jn][1].copy()

def legs(rh, rk, lh, lk):
    return {'legR_hip': (0, 0, rh), 'legR_knee': (0, 0, rk), 'legL_hip': (0, 0, lh), 'legL_knee': (0, 0, lk)}
def arms(rs, re, rt, ls, le, lt, grip=-1.5):
    return {'armR_shoulder': (rt, 0, rs), 'armR_elbow': (0, 0, re), 'armL_shoulder': (lt, 0, ls), 'armL_elbow': (0, 0, le), 'grip': (0, 0, grip)}
def trunk(lean=0.0, twist=0.0, neck=0.0, head=0.0, look=0.0):
    return {'torso': (0, twist, -lean), 'neck': (0, 0, neck), 'head': (0, look, head)}
def merge(*ds):
    out = {}
    for d in ds: out.update(d)
    return out

# Idle: weight settled, breathing, a glance
idle = []
for f in range(0, 61, 6):
    t = f / 60 * math.tau
    idle.append(pose(f + 1, merge(legs(0.18, -0.25, -0.18, -0.12), arms(-0.25 + 0.03 * math.sin(t), 0.9, 0.15, -0.1, 0.8, -0.25),
                                  trunk(0.04 + 0.015 * math.sin(t), 0, 0.02 * math.sin(t), 0, 0.12 * math.sin(t * 0.5))), (0, 0.008 * math.sin(t), 0)))
clip('Idle', idle)

# Run: one stride cycle; the game maps its stride phase onto it
run = []
for f in range(0, 21):
    ph = f / 20 * math.tau
    sR, sL = math.sin(ph), math.sin(ph + math.pi)
    run.append(pose(f + 1, merge(legs(0.9 * sR, -(0.15 + 1.45 * max(0, math.cos(ph))), 0.9 * sL, -(0.15 + 1.45 * max(0, math.cos(ph + math.pi)))),
                                 arms(-0.25 - 0.6 * sR, 0.95 + 0.35 * abs(sR), 0.15, -0.1 + 0.5 * sR, 0.8, -0.25),
                                 trunk(0.24 + 0.03 * abs(math.cos(ph)), 0.1 * sR, 0.16, 0, 0)), (0, -0.055 * abs(math.cos(ph)), 0)))
clip('Run', run)

# Crouch-walk: low, short steps, shield forward
crouch = []
for f in range(0, 25):
    ph = f / 24 * math.tau; w = math.sin(ph)
    crouch.append(pose(f + 1, merge(legs(1.2 + 0.35 * w, -2.0 + 0.3 * max(0, w), 1.0 - 0.35 * w, -1.9 + 0.3 * max(0, -w)),
                                    arms(0.1, 1.2, 0.2, 0.5, 1.1, -0.3), trunk(0.55, 0, 0.45, 0, 0)), (0, -0.36 - 0.02 * abs(w), 0)))
clip('Crouch', crouch)

# Rise and Fall: the two halves of a jump (the game blends between them by vertical speed)
clip('Rise', [pose(1, merge(legs(1.1, -1.5, -0.2, -0.5), arms(-1.2, 0.9, 0.3, -0.9, 0.8, -0.25), trunk(0.15, 0, 0.2, 0, 0))),
              pose(10, merge(legs(1.2, -1.65, -0.25, -0.55), arms(-1.3, 0.8, 0.3, -1.0, 0.8, -0.25), trunk(0.17, 0, 0.22, 0, 0)))])
clip('Fall', [pose(1, merge(legs(0.5, -0.4, -0.15, -0.2), arms(0.6, 0.9, 0.3, 0.8, 0.8, -0.25), trunk(0.15, 0, -0.1, 0, 0))),
              pose(10, merge(legs(0.55, -0.35, -0.1, -0.15), arms(0.75, 0.7, 0.3, 0.95, 0.7, -0.25), trunk(0.12, 0, -0.15, 0, 0)))])

# Roll: a tucked forward roll about his middle
roll = []
for f in range(0, 13):
    q = f / 12; e = min(1.0, q * 1.15); e = e * e * (3 - 2 * e)
    ang = -math.tau * e; c = 0.55
    bp = (c * math.sin(-ang), c - c * math.cos(ang) - 0.25 * math.sin(math.pi * q), 0)
    roll.append(pose(f + 1, merge({'body': (0, 0, ang)}, legs(1.5, -2.2, 1.4, -2.1), arms(0.9, 1.6, 0.2, 1.1, 1.5, -0.2, grip=-2.6), trunk(0.7, 0, 0.5, 0, 0)), bp))
clip('Roll', roll)

# Swings: 30 frames each, wind-up 0-9, strike 9-15 (an overshoot at 11), recovery 15-30.
# Poses: (shoulder, elbow, arm twist, torso twist, torso lean) and the blade angle.
SW = {
    'Slash':  dict(wind=(-2.3, 1.3, 0.35, -0.45, -0.1), hit=(1.7, 0.2, 0.1, 0.55, 0.35), blade=-1.2),
    'Back':   dict(wind=(1.4, 0.3, 0.1, 0.4, 0.25), hit=(-2.5, 0.7, 0.4, -0.5, -0.05), blade=-1.9),
    'Chop':   dict(wind=(-3.0, 1.5, 0.2, -0.2, -0.3), hit=(1.25, 0.05, 0.05, 0.2, 0.55), blade=-1.4),
    'Thrust': dict(wind=(-0.5, 1.8, 0.1, -0.35, -0.2), hit=(1.55, 0.0, 0.05, 0.3, 0.4), blade=-1.57),
}
for name, P in SW.items():
    w, h = P['wind'], P['hit']
    over = tuple(h[i] + (h[i] - w[i]) * 0.1 for i in range(5))
    def frame(f, p, blade, stance, dip=0.0, off=0.0):
        rs, re, rt, tw, ln = p
        return pose(f, merge(stance, {'armR_shoulder': (rt, 0, rs), 'armR_elbow': (0, 0, re), 'grip': (0, 0, blade),
                                      'armL_shoulder': (-0.25, 0, -0.1 + off), 'armL_elbow': (0, 0, 0.8)}, trunk(ln, tw, 0.12, 0, 0)), (0, dip, 0))
    ready = legs(0.18, -0.25, -0.18, -0.12); coil = legs(0.3, -0.55, -0.25, -0.3); lunge = legs(0.55, -0.65, -0.45, -0.15)
    guard = (-0.25, 0.9, 0.15, 0.0, 0.04)
    clip(name, [frame(1, guard, -1.5, ready), frame(10, w, P['blade'], coil, -0.03, 0.35), frame(12, over, P['blade'], lunge, -0.07, -0.45),
                frame(16, h, P['blade'], lunge, -0.05, -0.35), frame(31, guard, -1.5, ready)])

# Block, and the shield overhead against falling rock. The shield turns (and shifts) as well as the arm.
def shield_track(name, at, rot):
    o = J['shield']; o.animation_data_create(); tr = o.animation_data.nla_tracks.new(); tr.name = name
    act = bpy.data.actions.new(f'{name}|shield'); o.animation_data.action = act
    for f in (1, 4):
        o.location = B(*at); set_rot(o, *rot)
        o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f)
    tr.strips.new(name, 1, act); o.animation_data.action = None
    o.location, o.rotation_euler = REST['shield'][0].copy(), REST['shield'][1].copy()

hold = {'armR_shoulder': (0.15, 0, -0.25), 'armR_elbow': (0, 0, 0.9), 'grip': (0, 0, -1.5)}
clip('Block', [pose(f, merge(legs(0.3, -0.5, -0.25, -0.3), hold, {'armL_shoulder': (-0.35, 0, 1.35), 'armL_elbow': (0, 0, 1.0)}, trunk(0.16, 0, 0.1, 0, 0)), (0, -0.06, 0)) for f in (1, 4)])
shield_track('Block', (0.04, -0.14, -0.08), (0.2, math.pi / 2 + 0.3, 0))
clip('BlockHigh', [pose(f, merge(legs(0.3, -0.55, -0.25, -0.3), hold, {'armL_shoulder': (-0.2, 0, 2.9), 'armL_elbow': (0, 0, 0.4)}, trunk(0.08, 0, -0.2, 0, 0)), (0, -0.08, 0)) for f in (1, 4)])
shield_track('BlockHigh', (0.02, -0.16, -0.04), (math.pi / 2, 0, 0.1))

# Hurt: thrown back, arms out, then recovering
hurt = []
for f in range(0, 8):
    q = 1 - f / 7
    hurt.append(pose(f + 1, merge(legs(-0.3 * q, -0.4 * q - 0.1, 0.4 * q, -0.6 * q - 0.1), arms(-1.5 * q - 0.25 * (1 - q), 0.6, 0.4, 1.0 * q - 0.1 * (1 - q), 0.4 + 0.4 * (1 - q), -0.4),
                                  trunk(-0.45 * q, 0, -0.3 * q, 0, 0))))
clip('Hurt', hurt)

# Flail: the long fall
flail = []
for f in range(0, 21):
    t = f / 20 * math.tau
    flail.append(pose(f + 1, merge(legs(0.6 + 0.3 * math.sin(t), -0.8, -0.4 + 0.3 * math.cos(t), -0.5),
                                   arms(2.6 + 0.4 * math.sin(t * 2), 0.6, 0, 2.4 + 0.4 * math.cos(t * 2), 0.6, 0), trunk(-0.2, 0, 0.3, 0, 0))))
clip('Flail', flail)

# ---------------------------------------------------------------- export
os.makedirs(os.path.dirname(OUT), exist_ok=True)
# Held poses (a channel that never changes inside a clip) must survive: the exporter's size optimisation drops them.
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS',
                          export_yup=True, export_cameras=False, export_lights=False, export_apply=False,
                          export_optimize_animation_size=False, export_optimize_animation_keep_anim_object=True)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes')
