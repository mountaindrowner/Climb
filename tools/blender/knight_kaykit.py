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
SHAPE = {'head': float(os.environ.get('K_HEAD', 0.35)), 'leg': float(os.environ.get('K_LEG', 2.35)),
         'trunk': float(os.environ.get('K_TRUNK', 1.32)), 'arm': float(os.environ.get('K_ARM', 1.5)),
         'waist': 0.6, 'chest': 1.12, 'hips': 0.8, 'limb': 0.9, 'bicep': 1.12,
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
    k = SHAPE['limb']                                   # limbs a little leaner as they get longer
    P['upperleg.' + s].scale = (k, SHAPE['leg'], k); P['lowerleg.' + s].scale = (k, SHAPE['leg'], k)
    P['upperarm.' + s].scale = (SHAPE['bicep'], SHAPE['arm'], SHAPE['bicep']); P['lowerarm.' + s].scale = (1.0, SHAPE['arm'], 1.0)   # built arms
# a torso that tapers to the waist instead of a barrel: narrow hips and waist, the chest a little less
P['hips'].scale = (SHAPE['hips'], 1, SHAPE['hips'])
P['spine'].scale = (SHAPE['waist'], SHAPE['trunk'], SHAPE['waist'] * 1.1); P['chest'].scale = (SHAPE['chest'], SHAPE['trunk'], SHAPE['chest'] * 1.05)   # V-taper
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

# ---- 3. bis: kit. Cloth wraps on the forearms and shins, a scarf wound over the collar, a pouch on the hip: rigid
# pieces on the bones they sit on, sized from the body mesh around each bone so they hug it without cutting in.
import math
def hsh(x, y, z, seed=0.0):
    h = math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453
    return h - math.floor(h)
def plain(name, rgb, rough=0.9):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = 0.0
    return m
LINEN, LEATHER = plain('kit_linen', (0.33, 0.28, 0.21)), plain('kit_leather', (0.3, 0.2, 0.13))   # old, dirty cloth
def girth(mesh_name, bone, frac):
    """The body's radius around a bone at a fraction of its length (rest pose, armature space)."""
    o = bpy.data.objects[mesh_name]; vg = o.vertex_groups.get(bone); b = arm.data.bones[bone]
    h, t = b.head_local, b.tail_local; ax = (t - h); L = ax.length; ax = ax / L
    rs = []
    for v in o.data.vertices:
        if vg is None or not any(g.group == vg.index and g.weight > 0.4 for g in v.groups): continue
        p = o.matrix_world @ v.co; u = (p - h).dot(ax) / L
        if abs(u - frac) < 0.1: rs.append(((p - h) - ax * (p - h).dot(ax)).length)
    rs.sort()
    best = rs[int(len(rs) * 0.7)] if rs else 0.0      # a typical radius: the max catches guards and flares
    return best, h + (t - h) * frac, ax
def on_bone(obj, bone):
    mw = obj.matrix_world.copy(); obj.parent = arm; obj.parent_type = 'BONE'; obj.parent_bone = bone; obj.matrix_world = mw
# the waist: the pack's torso is a straight block; pull it in around the belt so the chest reads broad above it
sb = arm.data.bones['spine']; zc = sb.head_local.z + (sb.tail_local.z - sb.head_local.z) * 0.15; sg = (sb.tail_local.z - sb.head_local.z) * 0.45
for name in ('Knight_Body',):
    o = bpy.data.objects[name]
    for v in o.data.vertices:
        p = o.matrix_world @ v.co; k = 1 - 0.26 * math.exp(-((p.z - zc) / sg) ** 2)
        v.co = o.matrix_world.inverted() @ Vector((p.x * k, p.y * (0.55 + 0.45 * k), p.z))
def wrap(mesh_name, bone, fracs, name, thick=1.04):
    bm = bmesh.new()
    for i, f in enumerate(fracs):
        r, c, ax = girth(mesh_name, bone, f)
        if r <= 0: continue
        rr = r * (thick + 0.04 * hsh(i, f, 3))
        res = bmesh.ops.create_cone(bm, cap_ends=False, segments=9, radius1=rr, radius2=rr * 0.96, depth=r * 0.38)
        tilt = Matrix.Rotation((hsh(i, f, 5) - 0.5) * 0.35, 4, 'X')        # each turn of cloth a little askew
        rot = Vector((0, 0, 1)).rotation_difference(ax).to_matrix().to_4x4()
        bmesh.ops.transform(bm, matrix=Matrix.Translation(c) @ rot @ tilt, verts=res['verts'])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(LINEN)
    for p in me.polygons: p.use_smooth = False
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); on_bone(o, bone); return o
for s_ in 'lr':
    side = 'Right' if s_ == 'r' else 'Left'
    wrap('Knight_Arm' + side, 'lowerarm.' + s_, (0.42, 0.52, 0.62, 0.72, 0.82), 'kit_wrist_' + s_)
    wrap('Knight_Leg' + side, 'lowerleg.' + s_, (0.3, 0.42, 0.54, 0.66), 'kit_shin_' + s_, 1.04)
# the scarf: two loose turns over the collar
nb = arm.data.bones['head']; neck = nb.head_local
body = bpy.data.objects['Knight_Body']
rs = [((body.matrix_world @ v.co) - neck).xy.length for v in body.data.vertices if abs((body.matrix_world @ v.co).z - (neck.z - 0.06)) < 0.05]
cr = max(rs) if rs else 0.25
bm = bmesh.new()
for i, (dz, k, tl) in enumerate(((-0.1, 0.74, 0.1), (-0.05, 0.66, -0.08))):   # snug to the neck, not a ruff
    res = bmesh.ops.create_cone(bm, cap_ends=False, segments=12, radius1=cr * k * 1.02, radius2=cr * k * 0.9, depth=0.06)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(neck + Vector((0, 0.01, dz))) @ Matrix.Rotation(tl, 4, 'X'), verts=res['verts'])
me = bpy.data.meshes.new('kit_scarf'); bm.to_mesh(me); bm.free(); me.materials.append(LINEN)
scarf = bpy.data.objects.new('kit_scarf', me); bpy.context.collection.objects.link(scarf); on_bone(scarf, 'chest')
# a pouch on the far hip, away from the sword arm and clear of the swinging thigh
hb = arm.data.bones['hips']; hip = hb.head_local
bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
bmesh.ops.scale(bm, vec=(0.11, 0.07, 0.12), verts=bm.verts)
lw = [ (bpy.data.objects['Knight_Body'].matrix_world @ v.co) for v in bpy.data.objects['Knight_Body'].data.vertices]
hx = max(p.x for p in lw if abs(p.z - hip.z) < 0.08) if lw else 0.25
bmesh.ops.translate(bm, vec=Vector((hx + 0.03, 0.06, hip.z - 0.04)), verts=bm.verts)
me = bpy.data.meshes.new('kit_pouch'); bm.to_mesh(me); bm.free(); me.materials.append(LEATHER)
pouch = bpy.data.objects.new('kit_pouch', me); bpy.context.collection.objects.link(pouch); on_bone(pouch, 'hips')
print('kit: collar r %.3f, hip x %.3f' % (cr, hx))

# ---- 3a. weathering: a long climb's worth of wear. Dented metal, the crest knocked flat, the cape torn short; the
# pack's bright palette dulled to old iron, dried oxblood and worn leather; grime, mud and rust baked as vertex colour.
import math
import numpy as np
def vnoise(p, cell, seed=0.0):
    """Smooth value noise at a cell size: blotches rather than speckle."""
    x, y, z = p.x / cell, p.y / cell, p.z / cell; ix, iy, iz = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - ix, y - iy, z - iz; fx, fy, fz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    acc = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (fx if dx else 1 - fx) * (fy if dy else 1 - fy) * (fz if dz else 1 - fz)
                acc += w * hsh(ix + dx, iy + dy, iz + dz, seed)
    return acc

# the palette: every texture's colours pushed from parade-ground to field-worn
def weather_image(img):
    px = np.array(img.pixels[:], dtype=np.float32).reshape(-1, 4); rgb = px[:, :3]
    mx, mn = rgb.max(1), rgb.min(1); sat = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0); lum = rgb @ np.array([0.3, 0.59, 0.11], dtype=np.float32)
    r, g, b = rgb[:, 0], rgb[:, 1], rgb[:, 2]
    red = (sat > 0.45) & (r > g * 1.5) & (r > b * 1.3)
    gold = (sat > 0.35) & (r >= g) & (g > b * 1.25) & ~red
    grey = sat < 0.22
    out = rgb.copy()
    out[red] = lum[red, None] * np.array([0.62, 0.3, 0.24]) * 0.95           # dried oxblood
    out[gold] = lum[gold, None] * np.array([0.6, 0.44, 0.3]) * 0.8           # worn leather, old brass
    out[grey] = lum[grey, None] * np.array([0.78, 0.76, 0.72]) * 0.7 + 0.015  # dark iron, not polished steel
    rest = ~(red | gold | grey)
    out[rest] = out[rest] * 0.55 + lum[rest, None] * 0.45 * np.array([0.95, 0.88, 0.78])   # everything else dulled, warmed
    px[:, :3] = np.clip(out, 0, 1); img.pixels[:] = px.ravel().tolist(); img.update()
    try: img.pack()
    except Exception: pass
for img in bpy.data.images:
    if img.size[0] > 0: weather_image(img); print('weathered texture', img.name)

def mesh_objects():
    return [o for o in bpy.data.objects if o.type == 'MESH' and o.name not in ('Knight_Head',) and not o.name.startswith('eye')]

# battered geometry: every vertex nudged by a position hash (coincident seam vertices move together, so nothing cracks)
def batter(o, amp):
    k = 1.0 / max(1e-6, o.matrix_world.to_scale().x)
    for v in o.data.vertices:
        w = o.matrix_world @ v.co
        d = Vector((hsh(w.x, w.y, w.z, 1) - 0.5, hsh(w.x, w.y, w.z, 2) - 0.5, hsh(w.x, w.y, w.z, 3) - 0.5))
        big = vnoise(w, 0.18, 4) - 0.5                       # broad dents, not just jitter
        v.co += (d * amp + d.normalized() * big * amp * 1.6) * k
AMP = {'Knight_Helmet': 0.016, 'shield': 0.02, 'wep_sword': 0.01, 'wep_pick': 0.01, 'Knight_Cape': 0.008}
for o in mesh_objects():
    batter(o, AMP.get(o.name, 0.009))

# the helmet: the crest and spikes knocked off flush, one hard dent on the brow
hel = bpy.data.objects['Knight_Helmet']
hw = [hel.matrix_world @ v.co for v in hel.data.vertices]; hz1 = max(p.z for p in hw); hz0 = min(p.z for p in hw)
cut = hz1 - (hz1 - hz0) * 0.12; inv = hel.matrix_world.inverted()
for v, p in zip(hel.data.vertices, hw):
    if p.z > cut: v.co = inv @ Vector((p.x * 0.92, p.y * 0.92, cut + (p.z - cut) * 0.15))
dent = Vector((-0.09, min(p.y for p in hw) + 0.05, hz0 + (hz1 - hz0) * 0.72))
for v in hel.data.vertices:
    p = hel.matrix_world @ v.co; d = (p - dent).length
    if d < 0.1: v.co = inv @ (p + Vector((0, 0.035, -0.012)) * (1 - d / 0.1) ** 2)

# the cape: torn short and ragged, a jagged hem
cape = bpy.data.objects['Knight_Cape']
cape.scale = (cape.scale.x * 0.86, cape.scale.y, cape.scale.z)        # it widened with the chest; a rag, not a mantle
bpy.context.view_layer.update()
bm = bmesh.new(); bm.from_mesh(cape.data)
bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2, use_grid_fill=True)
cw = cape.matrix_world; ci = cw.inverted()
zs = [(cw @ v.co).z for v in bm.verts]; cz0, cz1 = min(zs), max(zs)
for v in bm.verts:
    p = cw @ v.co; t = (cz1 - p.z) / max(1e-4, cz1 - cz0)                  # 0 at the shoulders, 1 at the hem
    t2 = t * 0.72                                                          # shorter
    rag = (hsh(round(p.x, 2), 0, 0, 7) * 0.22 + vnoise(p, 0.07, 8) * 0.12) * max(0, t - 0.55) / 0.45
    nz = cz1 - (t2 - rag * 0.72) * (cz1 - cz0)
    v.co = ci @ Vector((p.x, p.y + 0.02 * math.sin(p.x * 31) * t, nz))
bm.to_mesh(cape.data); bm.free()

# grime as vertex colour: crevices and undersides darker, mud up the legs, rust in patches, every surface uneven
for o in mesh_objects():
    me = o.data
    attr = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    me.color_attributes.active_color = attr; me.color_attributes.render_color_index = me.color_attributes.find('Col')
    for poly in me.polygons:
        n = (o.matrix_world.to_3x3() @ poly.normal).normalized()
        for li in poly.loop_indices:
            p = o.matrix_world @ me.vertices[me.loops[li].vertex_index].co
            f = 0.55 + 0.45 * vnoise(p, 0.06, 11) ** 0.8                                 # uneven grime, in blotches
            f *= 0.72 + 0.28 * hsh(round(p.x, 3), round(p.y, 3), round(p.z, 3), 12)      # speckle
            f *= 0.8 + 0.2 * min(1.0, p.z / 2.4)                                         # dirtier toward the ground
            if n.z < -0.3: f *= 0.78                                                     # undersides in shadow
            c = Vector((f, f, f))
            mud = max(0.0, min(1.0, (1.05 - p.z + 0.25 * vnoise(p, 0.09, 14)) / 0.8))   # caked up from the boots, ragged edge
            if mud: c = c.lerp(Vector((0.3, 0.22, 0.14)) * (0.6 + 0.4 * f), mud * 0.95)
            rust = vnoise(p, 0.1, 13)
            if rust > 0.55 and o.name not in ('Knight_Cape',): c = c.lerp(Vector((0.5, 0.24, 0.1)) * (0.7 + 0.3 * f), min(1, (rust - 0.55) * 4) * 0.9)
            if o.name == 'Knight_Cape': c *= 0.75 + 0.25 * min(1.0, (p.z - 0.9) / 1.2)                  # the hem filthiest
            attr.data[li].color = (min(1, c.x), min(1, c.y), min(1, c.z), 1.0)
print('weathered', [o.name for o in mesh_objects()])

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
        if m.name.startswith('knight_texture'): b.inputs['Metallic'].default_value = 0.05; b.inputs['Roughness'].default_value = 0.8   # old iron under grime
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
# a tired guard: sword low and forward, shield hanging, shoulders and head down
GUARD_R, GUARD_BLADE = [D(0.15, -1, 0.3), D(1, 0.15, 0.12)], D(1, 0.6)
SHIELD_L = [D(0.25, -1, 0.35, 'l'), D(1, -0.1, -0.2, 'l')]
guard = {'armR': GUARD_R, 'blade': GUARD_BLADE, 'armL': SHIELD_L, 'chest': D(0.3, 1), 'spine': D(0.12, 1), 'head': D(0.05, 1)}   # hunched, ready
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
CROUCH = {'hips': (0.12, -0.86), 'spine': D(0.95, 1), 'chest': D(0.45, 1), 'head': D(-0.3, 1),
          'armR': [D(0.3, -1, 0.35), D(0.7, 0.8, 0.1)], 'blade': D(0.15, 1)}     # the blade kept upright, clear of the step ahead
c = P_({**CROUCH, 'feet': {'l': (0.12, 0), 'r': (-0.12, 0)}})
po.make_action('K_Crouch', [(0, c), (12, c)])
def crown(snap):
    po.restore(snap); return (po.P['head'].matrix @ Vector((0, po.B['head'].length * 1.9, 0))).z
print('crouch crown / standing crown: %.2f' % (crown(c) / crown(base)))
steps = [((0.14, 0), (-0.14, 0), 0), ((0, 0), (0, 0.08), 0.025), ((-0.14, 0), (0.14, 0), 0), ((0, 0.08), (0, 0), 0.025)]
keys = []
for i, (l, r, bob) in enumerate(steps + steps[:1]):
    keys.append((i * 6, P_({**CROUCH, 'hips': (0.12, -0.86 + bob), 'feet': {'l': l, 'r': r}})))
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
GUARD_SPEC = {'hips': (0, 0), 'chest': (D(0.3, 1), 0.0), 'spine': D(0, 1), 'armR': GUARD_R, 'blade': GUARD_BLADE, 'feet': {'l': (0, 0), 'r': (0, 0)}}
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
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_vertex_color='ACTIVE',
                          export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
print('wrote', os.path.normpath(OUT), os.path.getsize(OUT), 'bytes', SHAPE)
