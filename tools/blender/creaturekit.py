# Shared parts for the creatures built in headless Blender (the crawler and those after it; bat.py and burrower.py
# came first and carry their own copies): painted, chunky, low-poly forms in one bmesh with a material and a paint kind
# per face and bone weights per vertex, a separate glow mesh the game lights in the zone's colour, and the export.
import os, math
import bpy, bmesh
from mathutils import Vector, Matrix

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
def to_byte(c):      # vertex colours are stored sRGB and exported linear: store the curve's inverse, so the screen gets c
    f = lambda x: 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055
    return tuple(f(max(0.0, min(1.0, v))) for v in c)

def armature(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    arm = bpy.data.objects.new(name, bpy.data.armatures.new(name)); bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
    return arm
def bone(arm, name, h, t, parent=None, roll=Vector((0, 0, 1))):
    EB = arm.data.edit_bones; b = EB.new(name); b.head = Vector(h); b.tail = Vector(t)
    if parent: b.parent = EB[parent]
    b.align_roll(roll)
    return b

class Body:
    """One mesh being built: parts tagged with a material index, a paint kind and bone weights."""
    def __init__(self, mats):
        self.bm = bmesh.new(); self.col = self.bm.loops.layers.color.new('Col'); self.W = {}; self.KIND = {}; self.mats = mats
    def faces_of(self, vs): return {f for v in vs for f in v.link_faces}
    def tag(self, vs, w):
        for v in vs: self.W[v] = w
    def paint(self, fs, kind, mat, smooth=True):
        for f in fs: f.material_index = mat; self.KIND[f] = kind; f.smooth = smooth
    def blob(self, center, radii, w, kind, mat=0, u=12, v=8, jag=0.1, seed=0, smooth=True):
        res = bmesh.ops.create_uvsphere(self.bm, u_segments=u, v_segments=v, radius=1.0); vs = res['verts']
        for vv in vs:
            p = vv.co.copy(); j = 1 + (hsh(p.x, p.y, p.z, seed) - 0.5) * jag
            vv.co = Vector((p.x * radii[0] * j, p.y * radii[1] * j, p.z * radii[2] * j)) + Vector(center)
        self.paint(self.faces_of(vs), kind, mat, smooth); self.tag(vs, w); return vs
    def cone(self, base, tip, r, w, kind, mat=0, segs=5, r2=0.0, smooth=False):
        base, tip = Vector(base), Vector(tip)
        res = bmesh.ops.create_cone(self.bm, cap_ends=True, segments=segs, radius1=r, radius2=r2, depth=max(1e-4, (tip - base).length))
        d = (tip - base).normalized(); rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
        bmesh.ops.transform(self.bm, matrix=Matrix.Translation((base + tip) / 2) @ rot, verts=res['verts'])
        self.paint(self.faces_of(res['verts']), kind, mat, smooth); self.tag(res['verts'], w); return res['verts']
    def plate(self, center, size, normal, up, w, kind, mat=0, tilt=0.0, taper=0.35):
        n = Vector(normal).normalized(); u = Vector(up); u = (u - u.dot(n) * n).normalized(); a = u.cross(n)
        rot = Matrix.Rotation(tilt, 3, a) @ Matrix((a, u, n)).transposed()
        res = bmesh.ops.create_cube(self.bm, size=1.0)
        for vv in res['verts']:
            p = vv.co; vv.co = rot @ Vector((p.x * size[0] * (1 - taper * (p.y + 0.5)), p.y * size[1], p.z * size[2])) + Vector(center)
        self.paint(self.faces_of(res['verts']), kind, mat, False); self.tag(res['verts'], w); return res['verts']
    def finish(self, arm, name, colour, rough):
        """colour(kind, p, n) -> (r, g, b) on screen; rough: {material name: roughness}."""
        bm = self.bm; bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
        for f in bm.faces:
            kind = self.KIND.get(f, '')
            for l in f.loops:
                c = colour(kind, l.vert.co, vnoise(l.vert.co, 0.07, 3)); l[self.col] = (*to_byte(c), 1.0)
        me = bpy.data.meshes.new(name); bm.to_mesh(me)
        for ca in [c for c in me.color_attributes if c.name != 'Col']: me.color_attributes.remove(ca)
        me.color_attributes.active_color = me.color_attributes['Col']; me.color_attributes.render_color_index = me.color_attributes.find('Col')
        root = arm.data.bones[0].name
        vw = {v.index: self.W.get(v, {root: 1.0}) for v in bm.verts}; bm.free()
        ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
        for mname in self.mats:
            m = bpy.data.materials.new(mname); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
            vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'; nt.links.new(vc.outputs['Color'], b.inputs['Base Color'])
            b.inputs['Roughness'].default_value = rough.get(mname, 0.7); me.materials.append(m)
        for bname in {b for w in vw.values() for b in w}: ob.vertex_groups.new(name=bname)
        for i, w in vw.items():
            for bname, x in w.items(): ob.vertex_groups[bname].add([i], x, 'REPLACE')
        ob.parent = arm; mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = arm
        print(name + ':', len(me.vertices), 'verts', len(me.polygons), 'faces')
        return ob

def glow_mesh(arm, name, mat_name, spheres, bone_name, colour=(1.0, 0.6, 0.3)):
    """Small emissive spheres [(center, radius, (sx, sy, sz))] parented to one bone: eyes, pits, coals."""
    gbm = bmesh.new()
    for c, r, sc in spheres:
        res = bmesh.ops.create_uvsphere(gbm, u_segments=8, v_segments=6, radius=r)
        bmesh.ops.scale(gbm, vec=sc, verts=res['verts']); bmesh.ops.translate(gbm, vec=Vector(c), verts=res['verts'])
    me = bpy.data.meshes.new(name); gbm.to_mesh(me); gbm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    m = bpy.data.materials.new(mat_name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colour, 1); b.inputs['Emission Color'].default_value = (*colour, 1); b.inputs['Emission Strength'].default_value = 3.0
    me.materials.append(m)
    ob.parent = arm; ob.parent_type = 'BONE'; ob.parent_bone = bone_name; ob.matrix_world = Matrix.Identity(4)
    return ob

def export(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for a in bpy.data.actions: a.use_fake_user = True
    print('clips', [a.name for a in bpy.data.actions])
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_vertex_color='MATERIAL',
                              export_yup=True, export_cameras=False, export_lights=False, export_optimize_animation_size=False)
    print('wrote', os.path.normpath(path), os.path.getsize(path), 'bytes')
