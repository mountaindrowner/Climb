# Pose authoring for headless Blender: build key poses by aiming bones at directions, pointing a held weapon, and
# planting feet with two-bone IK, then key them into actions. Used by knight_kaykit.py; written for any humanoid rig
# whose character faces -Y (glTF imports do), with bones named like the KayKit rig.
#
# Directions are armature-space vectors; D(fwd, up, out, side) builds one from the character's point of view:
# fwd is toward where it faces, up is up, out is away from the body's midline on the given side.
import bpy
from mathutils import Vector, Matrix, Quaternion

def D(fwd, up, out=0.0, side='r'):
    sx = -1.0 if side == 'r' else 1.0       # the character's right is -X when it faces -Y
    return Vector((sx * out, -fwd, up)).normalized()

class Poser:
    def __init__(self, arm, weapon=None, hand='hand.r'):
        self.arm, self.P, self.B = arm, arm.pose.bones, arm.data.bones
        self.keyed = [b.name for b in arm.data.bones if b.use_deform or b.name in ('hips', 'root')]
        self.hand = hand
        self.max_wrist = None      # radians: if set, the wrist bends at most this far and the forearm turns for the rest
        # the weapon's blade axis, in the hand bone's frame
        self.blade_local = None
        if weapon is not None:
            lo, hi = Vector(weapon.bound_box[0]), Vector(weapon.bound_box[6])
            ax = max(range(3), key=lambda i: abs(hi[i] - lo[i]))
            v = Vector((0, 0, 0)); v[ax] = 1.0 if abs(hi[ax]) > abs(lo[ax]) else -1.0
            world = (weapon.matrix_world.to_3x3().normalized() @ v).normalized()
            arm_space = (arm.matrix_world.to_3x3().inverted() @ world).normalized()
            self.blade_local = (self.B[hand].matrix_local.to_3x3().inverted() @ arm_space).normalized()
            # the blade's thinnest axis: the normal of its flat
            th = min(range(3), key=lambda i: abs(hi[i] - lo[i])); t = Vector((0, 0, 0)); t[th] = 1.0
            tw = (arm.matrix_world.to_3x3().inverted() @ (weapon.matrix_world.to_3x3().normalized() @ t)).normalized()
            self.flat_local = (self.B[hand].matrix_local.to_3x3().inverted() @ tw).normalized()

    def update(self): bpy.context.view_layer.update()

    # ---- basis snapshots: a pose as each bone's local location / rotation / scale
    def snapshot(self):
        return {n: (self.P[n].location.copy(), self.P[n].rotation_quaternion.copy(), self.P[n].scale.copy()) for n in self.keyed}
    def restore(self, snap):
        for n, (l, q, s) in snap.items():
            pb = self.P[n]; pb.location = l; pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = q; pb.scale = s
        self.update()
    def sample(self, action, frame):
        """The basis of every bone at one frame of an existing action."""
        ad = self.arm.animation_data or self.arm.animation_data_create()
        ad.action = action
        if hasattr(ad, 'action_slot') and action.slots: ad.action_slot = action.slots[0]
        bpy.context.scene.frame_set(int(frame)); self.update()
        snap = self.snapshot()
        ad.action = None
        return snap

    # ---- posing
    def aim(self, name, d, twist=0.0):
        pb = self.P[name]; m = pb.matrix.copy(); r = m.to_3x3().normalized()
        cur = (r @ Vector((0, 1, 0))).normalized(); d = d.normalized()
        r = cur.rotation_difference(d).to_matrix() @ r
        if twist: r = Matrix.Rotation(twist, 3, d) @ r
        new = r.to_4x4(); new.translation = m.translation
        pb.matrix = new; self.update()
    def point_blade(self, d, twist=0.0, flat=True):
        """Point the held weapon along d. With flat, roll it about its own axis so the flat of the blade faces the side
        camera (its broad face is what reads; edge-on, a sword is a line)."""
        pb = self.P[self.hand]; m = pb.matrix.copy(); r = m.to_3x3().normalized()
        cur = (r @ self.blade_local).normalized(); d = d.normalized()
        r = cur.rotation_difference(d).to_matrix() @ r
        if flat:
            n = (r @ self.flat_local); n = (n - n.dot(d) * d).normalized()
            x = Vector((1, 0, 0)); x = (x - x.dot(d) * d)
            if x.length > 1e-3:
                x.normalize()
                if n.dot(x) < 0: x = -x                               # either face to the camera; turn the least
                ang = n.angle(x); sgn = 1 if n.cross(x).dot(d) > 0 else -1
                r = Matrix.Rotation(sgn * ang, 3, d) @ r
        if twist: r = Matrix.Rotation(twist, 3, d) @ r
        if self.max_wrist is not None: return self._rigid_wrist(r)
        new = r.to_4x4(); new.translation = m.translation
        pb.matrix = new; self.update()
    def _rigid_wrist(self, want):
        """Give the hand the orientation `want` with the wrist bent no more than max_wrist from its rest line along the
        forearm: the forearm turns about the elbow (and rolls) to carry the rest."""
        hn = self.hand; fn = self.B[hn].parent.name
        fa, hb = self.P[fn], self.P[hn]
        rest_rel = self.B[fn].matrix_local.to_3x3().inverted() @ self.B[hn].matrix_local.to_3x3()
        F = fa.matrix.to_3x3().normalized()
        dev = (rest_rel.inverted() @ F.inverted() @ want).to_quaternion()
        ang = dev.angle if dev.angle <= 3.14159 else 6.28318 - dev.angle
        if ang > self.max_wrist:
            dev_c = Quaternion().slerp(dev, self.max_wrist / ang).to_matrix()
            F2 = want @ (rest_rel @ dev_c).inverted()
            m = F2.to_4x4(); m.translation = fa.matrix.translation.copy(); fa.matrix = m; self.update()
        new = want.to_4x4(); new.translation = hb.matrix.translation.copy(); hb.matrix = new; self.update()
    def shift_hips(self, fwd=0.0, up=0.0):
        pb = self.P['hips']; m = pb.matrix.copy(); m.translation += Vector((0, -fwd, up)); pb.matrix = m; self.update()
    def flat(self, name):
        """Give a bone its rest orientation in armature space (a foot flat on the floor)."""
        pb = self.P[name]; m = pb.matrix.copy()
        new = self.B[name].matrix_local.to_3x3().to_4x4(); new.translation = m.translation
        pb.matrix = new; self.update()
    def leg(self, side, ankle, knee_hint=None):
        """Two-bone IK: the thigh and shin reach the ankle, the knee bends toward knee_hint (forward by default)."""
        up_n, lo_n = 'upperleg.' + side, 'lowerleg.' + side
        H = self.P[up_n].head.copy(); L1, L2 = self.B[up_n].length, self.B[lo_n].length
        A = Vector(ankle); dv = A - H; d = min(dv.length, (L1 + L2) * 0.999); u = dv.normalized()
        f = knee_hint or Vector((0, -1, 0)); n = (f - f.dot(u) * u).normalized()
        ca = max(-1, min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))); sa = (1 - ca * ca) ** 0.5
        K = H + L1 * (ca * u + sa * n)
        self.aim(up_n, K - H); self.aim(lo_n, H + u * d - K); self.flat('foot.' + side)

    def pose(self, base, spec, feet0, plant=True):
        """Build one key pose from a base snapshot and a spec; returns its snapshot.
        spec keys: hips (fwd, up) shift; spine, chest, neck (head) directions with optional (dir, twist) tuples;
        armR / armL ([upper, lower] directions); blade (dir or (dir, twist)); feet {'l': (fwd, up), 'r': ...} ankle
        offsets from the base pose's ankles (both feet are re-planted so moving the hips never sinks them, unless
        plant is False: then the legs keep the base pose, as in the air)."""
        self.restore(base)
        if 'hips' in spec: self.shift_hips(*spec['hips'])
        for b in ('spine', 'chest', 'head'):
            if b in spec:
                v = spec[b]; d, tw = (v if isinstance(v, tuple) else (v, 0.0)); self.aim(b, d, tw)
        for side in ('lr' if plant else ''):
            off = spec.get('feet', {}).get(side, (0, 0))
            a = feet0[side] + Vector((0, -off[0], off[1]))
            self.leg(side, a)
        for side, key in (('r', 'armR'), ('l', 'armL')):
            if key in spec:
                up, lo = spec[key]; self.aim('upperarm.' + side, up); self.aim('lowerarm.' + side, lo)
                if side == 'l': self.flat_hand('l', spec.get('handL'))
        if 'blade' in spec:
            v = spec['blade']; d, tw = (v if isinstance(v, tuple) else (v, 0.0)); self.point_blade(d, tw)
        return self.snapshot()
    def flat_hand(self, side, d):
        if d is not None: self.aim('hand.' + side, d)
    def ankles(self, snap):
        self.restore(snap); return {s: self.P['foot.' + s].head.copy() for s in 'lr'}

    def make_action(self, name, keys):
        """keys: [(frame, snapshot)] -> a new action with every keyed bone keyed at each frame."""
        act = bpy.data.actions.new(name); act.use_fake_user = True
        ad = self.arm.animation_data or self.arm.animation_data_create()
        ad.action = act
        for frame, snap in keys:
            for n, (l, q, s) in snap.items():
                pb = self.P[n]; pb.location = l; pb.rotation_quaternion = q; pb.scale = s
                pb.keyframe_insert('location', frame=frame); pb.keyframe_insert('rotation_quaternion', frame=frame); pb.keyframe_insert('scale', frame=frame)
        ad.action = None
        return act
