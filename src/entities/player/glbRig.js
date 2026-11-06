// The warrior's GLB rigs and the driver that plays their clips from gameplay state. Clips are not left to run on their
// own clock: each frame the playhead is set from what the warrior is actually doing (the swing's phase, the stride, the
// roll's progress), so the animation stays locked to the controls. Clips cross-fade quickly; squash, the cape and the
// blade's trail are layered on in code.
//   knight:  the KayKit knight (CC0), re-proportioned and armed by tools/blender/knight_kaykit.py
//   blender: our own warrior, built and animated by tools/blender/warrior.py
//   hand:    the hand-built three.js warrior in model.js (no GLB)
import { TUNE } from '../../config/tuning.js';
import { clamp, smooth } from '../../core/math.js';
import { ST } from '../../core/state.js';
import { scene } from '../../render/renderer.js';
import { PL } from './player.js';
import { swingInfo } from './motor.js';
import { makeCloth } from './cloth.js';
const THREE = window.THREE;
const MV = TUNE.move;
const loop = x => x - Math.floor(x);

// Per rig: where it loads from, how it sits in the warrior's frame (+X is forward, 1 unit = the hand-built body's
// unit), and how gameplay state picks its clips.
const RIGS = {
  knight: {
    url: 'assets/models/knight/knight.glb', label: 'Knight',
    yaw: Math.PI / 2, height: 1.9,           // glTF faces +Z; well over a head taller than the hand-built warrior
    targets: knightTargets, after: knightAfter, setup: knightSetup,
  },
  blender: {
    url: 'assets/models/warrior/warrior.glb', label: 'Blender warrior',
    yaw: 0, height: 0, flat: true,
    targets: warriorTargets, after: warriorAfter,
  },
};
export const RIG_ORDER = ['knight', 'blender', 'hand'];
export const RIG_LABEL = { knight: 'Knight', blender: 'Blender warrior', hand: 'hand-built' };
const STATE = {};
const blank = name => ({ name, ready: false, failed: false, loading: false, root: null, inner: null, mixer: null, act: {}, node: {}, weights: {}, idleT: 0, airT: 0, cfg: RIGS[name] });
// GLB is the rig on screen (a live binding, so importers always see the current one)
export let GLB = blank('none');

const KEY = 'the-climb-rig';
export function rigChoice(){ try { const v = localStorage.getItem(KEY); return RIG_ORDER.includes(v) ? v : 'knight'; } catch (e) { return 'knight'; } }
export function setRigChoice(v){ try { localStorage.setItem(KEY, v); } catch (e) {} if (RIGS[v]) loadRig(v); applyRigChoice(); }
export const usingGlb = () => GLB.ready && GLB.name === rigChoice();

// The hosted page serves models as embedded-JSON glTF (it cannot serve .glb) and lists them in CLIMB_MODEL_URLS.
const urlOf = name => (window.CLIMB_MODEL_URLS && window.CLIMB_MODEL_URLS[name]) || RIGS[name].url;
export function loadWarriorGlb(){ const c = rigChoice(); if (RIGS[c]) loadRig(c); }
export function loadRig(name){
  const R = STATE[name] || (STATE[name] = blank(name));
  if (R.ready || R.loading || R.failed) return;
  if (!THREE.GLTFLoader){ R.failed = true; return; }
  R.loading = true;
  new THREE.GLTFLoader().load(urlOf(name), gltf => {
    const cfg = RIGS[name], model = gltf.scene;
    model.traverse(o => {
      if (o.isMesh){ o.castShadow = false; o.frustumCulled = false; if (cfg.flat){ o.material.flatShading = true; o.material.needsUpdate = true; } }
      if (o.name) R.node[o.name] = o;
    });
    // root (posed by animate.js: spin, offsets) > inner (yaw and scale into the warrior's frame) > the model
    R.root = new THREE.Group(); R.inner = new THREE.Group(); R.root.add(R.inner); R.inner.add(model);
    R.inner.rotation.y = cfg.yaw;
    R.mixer = new THREE.AnimationMixer(model);
    for (const clip of gltf.animations){
      const a = R.mixer.clipAction(clip); a.play(); a.paused = true; a.setEffectiveWeight(0);
      R.act[clip.name] = a; R.weights[clip.name] = 0;
    }
    if (cfg.height){
      // measure the standing pose, then scale it to the wanted height
      for (const n in R.act) R.act[n].setEffectiveWeight(n === 'Idle' ? 1 : 0);
      R.act.Idle && (R.act.Idle.time = 0); R.mixer.update(0); model.updateMatrixWorld(true);
      R.modelH = skinnedHeight(model); R.inner.scale.setScalar(cfg.height / R.modelH);
    }
    R.base = R.inner.scale.x;
    if (cfg.setup) cfg.setup(R);
    R.root.visible = false; PL.P.add(R.root);
    R.ready = true; R.loading = false;
    applyRigChoice();
  }, undefined, () => { R.failed = true; R.loading = false; });
}
function skinnedHeight(model){
  let lo = Infinity, hi = -Infinity; const v = new THREE.Vector3();
  model.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i += 2){ v.fromBufferAttribute(p, i); o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
  });
  return hi - lo;
}
export function applyRigChoice(){
  const c = rigChoice();
  for (const n in STATE) if (STATE[n].root) STATE[n].root.visible = false;
  if (STATE[c] && STATE[c].ready) GLB = STATE[c];
  const on = usingGlb();
  if (on) GLB.root.visible = true;
  for (const n in STATE) if (STATE[n].cloth){ STATE[n].cloth.mesh.visible = on && GLB === STATE[n]; STATE[n].cloth.live = false; }
  PL.body.visible = !on;
  showWeapon(PL.wepId);
}
export function showWeapon(id){
  for (const n in STATE) for (const w of ['sword', 'pick', 'spear']){ const o = STATE[n].node['wep_' + w]; if (o) o.visible = w === (id || 'sword'); }
}

// Set one clip's playhead to a fraction of its length.
function at(name, frac){ const a = GLB.act[name]; if (a) a.time = clamp(frac, 0, 0.9999) * a.getClip().duration; }

export function animateGlb(G, dt){
  if (!usingGlb()) return;
  const cfg = GLB.cfg;
  const { T, rate } = cfg.targets(G);
  const k = Math.min(1, rate * Math.max(dt, 1 / 120));
  for (const name in GLB.act){
    const w = GLB.weights[name] + ((T[name] || 0) - GLB.weights[name]) * k;
    GLB.weights[name] = w < 0.002 ? 0 : w;
    GLB.act[name].setEffectiveWeight(GLB.weights[name]);
  }
  GLB.mixer.update(0);
  cfg.after(G, dt);
  bladeTrail(G);
}

// ---------------------------------------------------------------------------------------------------------------------
// Our Blender warrior: one clip per state, authored for this game.
function warriorTargets(G){
  const T = {};
  if (ST.mode === 'fall'){ GLB.idleT += 1 / 60; at('Flail', loop(GLB.idleT * 1.2)); T.Flail = 1; return { T, rate: 30 }; }
  if (G.hurtT > 0){ at('Hurt', 1 - G.hurtT / MV.hurtStun); T.Hurt = 1; return { T, rate: 40 }; }
  if (G.roll > 0){ at('Roll', 1 - G.roll / MV.roll.time); T.Roll = 1; return { T, rate: 45 }; }
  const A = swingInfo(G);
  if (A){
    const name = { slash: 'Slash', back: 'Back', chop: 'Chop', thrust: 'Thrust', jab: 'Thrust', lunge: 'Thrust' }[A.sw.pose];
    const p = A.phase === 'wind' ? 0.3 * (A.t / A.sw.wind) : A.phase === 'active' ? 0.3 + 0.2 * (A.t / A.sw.active) : 0.5 + 0.5 * (A.t / A.sw.rec);
    at(name, p); T[name] = 1; return { T, rate: 50 };
  }
  if (!G.grounded){
    const w = clamp((G.vy + 1.5) / 7, 0, 1);
    GLB.airT += 1 / 60; at('Rise', loop(GLB.airT)); at('Fall', loop(GLB.airT));
    T.Rise = w; T.Fall = 1 - w; return { T, rate: 28 };
  }
  GLB.airT = 0;
  if (G.blocking){ const n = G.blockHigh ? 'BlockHigh' : 'Block'; at(n, 0.5); T[n] = 1; return { T, rate: 40 }; }
  const cyc = loop(G.runPhase / (Math.PI * 2));
  if (G.crouch){ at('Crouch', cyc); T.Crouch = 1; return { T, rate: 25 }; }
  const speed = clamp(Math.abs(G.v) / MV.run, 0, 1);
  GLB.idleT += 1 / 60; at('Idle', loop(GLB.idleT / 2));
  at('Run', cyc);
  T.Run = speed > 0.05 ? clamp(speed * 1.6, 0, 1) : 0; T.Idle = 1 - T.Run;
  return { T, rate: 22 };
}
function warriorAfter(G){
  const body = GLB.node.body;
  if (body){ const [sx, sy] = squash(G); body.scale.set(sx, sy, sx); }
  const speed = Math.abs(G.v) / MV.run, sway = Math.sin(ST.time * 3.1) * 0.05;
  ['cape1', 'cape2', 'cape3'].forEach((n, i) => {
    const c = GLB.node[n]; if (!c) return;
    c.rotation.set(0, 0, (i ? 0.1 : -0.25) + speed * 0.35 * (i + 1) + (G.vy < 0 ? -0.2 : G.vy > 0 ? 0.25 : 0) + sway * (i + 1) + (G.crouch ? -0.4 : 0));
  });
}
function squash(G){
  let sx = 1, sy = 1;
  if (G.landT > 0){ const q = G.landT / 0.12; sy = 1 - 0.16 * q; sx = 1 + 0.1 * q; }
  if (!G.grounded && G.vy > 0){ const t = clamp(G.vy / 9, 0, 1); sy = 1 + 0.1 * t; sx = 1 - 0.05 * t; }
  return [sx, sy];
}

// ---------------------------------------------------------------------------------------------------------------------
// The knight: the pack's idle, run, jump and flinch clips, plus clips authored in Blender for a side-on camera (K_*):
// the guard stance, the four swings, crouch, crouch walk, the roll's tuck and the high block.
const ATTACK = { slash: 'K_Slash', back: 'K_Back', chop: 'K_Chop', thrust: 'K_Thrust', jab: 'K_Jab', lunge: 'K_Lunge' };
// The authored swings are keyed guard 0, wind-up 8, strike 14, follow-through 18, guard 32 (of 32): the wind-up phase
// plays frames 0-8, the strike 8-18, the recovery 18-32.
const HIT = [8 / 32, 18 / 32];
function knightSetup(R){
  // the face inside the visor is an unlit void with two cold glints: no features, no shading, whatever the light
  const face = R.node.Knight_Head;
  if (face) face.material = new THREE.MeshBasicMaterial({ color: 0x040306, skinning: true });
  for (const n of ['eye_l', 'eye_r']) if (R.node[n]) R.node[n].material = new THREE.MeshBasicMaterial({ color: 0xa9d6ff });
  // lift the grimy armour (texture x baked grime is dark) so it reads as dirt on iron under the cave light, not as a
  // silhouette; a touch warm so the cave's teal and violet fill reads as light, not as the iron's colour
  R.inner.traverse(o => { if (o.isMesh && o.material && /knight_texture|barbarian_texture/.test(o.material.name)) o.material.color.setRGB(1.55, 1.42, 1.28); });
  // the cape becomes cloth: measure the authored cape in the body's frame (where it pins across the shoulders, how wide
  // and long it is), pin a simulated cloth there on the chest bone, and hide the rigid one
  const cape = R.node.Knight_Cape, model = R.inner.children[0];
  if (cape){
    for (const n in R.act) R.act[n].setEffectiveWeight(0);
    R.mixer.update(0); model.updateMatrixWorld(true);
    const chest = cape.parent, toModel = new THREE.Matrix4().copy(model.matrixWorld).invert();
    const capeToModel = toModel.clone().multiply(cape.matrixWorld), pa = cape.geometry.attributes.position, pts = [];
    for (let i = 0; i < pa.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(pa, i).applyMatrix4(capeToModel));
    const top = Math.max(...pts.map(p => p.y)), bot = Math.min(...pts.map(p => p.y)), h = top - bot;
    const topPts = pts.filter(p => p.y > top - 0.12 * h), botPts = pts.filter(p => p.y < bot + 0.25 * h);
    const x0 = Math.min(...topPts.map(p => p.x)), x1 = Math.max(...topPts.map(p => p.x));
    const zTop = topPts.reduce((a, p) => a + p.z, 0) / topPts.length;
    const wTop = (x1 - x0) * 0.9, wBot = Math.max(...botPts.map(p => p.x)) - Math.min(...botPts.map(p => p.x));
    const COLS = 7, chestInv = new THREE.Matrix4().copy(chest.matrixWorld).invert(), chestFromModel = chestInv.clone().multiply(model.matrixWorld);
    R.clothPins = [];
    for (let i = 0; i < COLS; i++) R.clothPins.push(new THREE.Vector3(x0 + (x1 - x0) * (-0.02 + 1.04 * i / (COLS - 1)), top - 0.04 * h, zTop - 0.01).applyMatrix4(chestFromModel));
    const chestZ = new THREE.Vector3().setFromMatrixPosition(chest.matrixWorld).applyMatrix4(toModel).z;
    R.clothR = { torso: Math.abs(zTop - chestZ) * 0.85, leg: 0.05 * (R.modelH || 2.8) };
    R.cloth = makeCloth({ cols: COLS, rows: 9, width: wTop * 1.1, length: h * 1.3, flare: Math.max(1.15, Math.min(1.6, wBot / wTop)), color: [0.2, 0.1, 0.08] });   // dried-blood rag: the torch warms it
    PL.P.add(R.cloth.mesh); cape.visible = false;
  }
}
const _w = [], _cap = [0, 1, 2, 3, 4].map(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), r: 0 }));
const _plane = { point: new THREE.Vector3(), normal: new THREE.Vector3() }, _sc = new THREE.Vector3();
function bonePos(name, out){ return out.setFromMatrixPosition(GLB.node[name].matrixWorld); }
function stepCloth(dt){
  const C = GLB.cloth, cape = GLB.node.Knight_Cape;
  if (!C || !cape) return;
  GLB.root.updateWorldMatrix(true, true);
  const chest = cape.parent, model = GLB.inner.children[0], S = Math.abs(model.getWorldScale(_sc).z);
  GLB.clothPins.forEach((p, i) => (_w[i] || (_w[i] = new THREE.Vector3())).copy(p).applyMatrix4(chest.matrixWorld));
  // the back plane faces the body's forward, not the chest's: a hunched chest tilts its own forward down, and that
  // plane, extended down past the shoulders, slants backward and the cloth slides up it like a sail
  _plane.normal.set(0, 0, 1).transformDirection(model.matrixWorld);
  _plane.point.set(0, 0, 0); _w.forEach(p => _plane.point.add(p)); _plane.point.multiplyScalar(1 / _w.length);
  const { torso, leg } = GLB.clothR;
  bonePos('hips', _cap[0].a); bonePos('head', _cap[0].b); _cap[0].r = torso * S;
  bonePos('upperlegl', _cap[1].a); bonePos('lowerlegl', _cap[1].b); _cap[1].r = leg * S;
  bonePos('upperlegr', _cap[2].a); bonePos('lowerlegr', _cap[2].b); _cap[2].r = leg * S;
  bonePos('lowerlegl', _cap[3].a); bonePos('footl', _cap[3].b); _cap[3].r = leg * 0.8 * S;
  bonePos('lowerlegr', _cap[4].a); bonePos('footr', _cap[4].b); _cap[4].r = leg * 0.8 * S;
  C.step(dt, _w, _cap, _plane, S);
  C.draw(PL.P);
}
function knightTargets(G){
  const T = {};
  if (ST.mode === 'fall'){ GLB.idleT += 1 / 60; at('K_Jump_Idle', loop(GLB.idleT)); at('Hit_B', 0.35); T.K_Jump_Idle = 0.5; T.Hit_B = 0.5; return { T, rate: 30 }; }
  if (G.hurtT > 0){ at('Hit_A', 0.1 + 0.6 * (1 - G.hurtT / MV.hurtStun)); T.Hit_A = 1; return { T, rate: 40 }; }
  if (G.roll > 0){ at('K_Tuck', 0.5); T.K_Tuck = 1; return { T, rate: 60 }; }   // the tumble itself is in knightAfter
  const A = swingInfo(G);
  if (A){
    const name = ATTACK[A.sw.pose], [h0, h1] = HIT;
    const p = A.phase === 'wind' ? h0 * smooth(clamp(A.t / A.sw.wind, 0, 1))
      : A.phase === 'active' ? h0 + (h1 - h0) * clamp(A.t / A.sw.active, 0, 1)
      : h1 + (1 - h1) * smooth(clamp(A.t / A.sw.rec, 0, 1));
    at(name, p); T[name] = 1; return { T, rate: 60 };
  }
  if (!G.grounded){
    const w = clamp((G.vy + 1.5) / 7, 0, 1);
    GLB.airT += 1 / 60; at('K_Jump_Start', 0.9); at('K_Jump_Idle', loop(GLB.airT));
    T.K_Jump_Start = w; T.K_Jump_Idle = 1 - w; return { T, rate: 28 };
  }
  GLB.airT = 0;
  if (G.blocking){ const n = G.blockHigh ? 'K_BlockHigh' : 'Blocking'; at(n, 0.5); T[n] = 1; return { T, rate: 40 }; }
  const cyc = loop(G.runPhase / (Math.PI * 2)), speed = clamp(Math.abs(G.v) / MV.run, 0, 1);
  if (G.crouch){
    at('K_Crouch', 0.5); at('K_CrouchWalk', cyc);
    T.K_CrouchWalk = speed > 0.05 ? clamp(speed * 2, 0, 1) : 0; T.K_Crouch = 1 - T.K_CrouchWalk; return { T, rate: 30 };
  }
  GLB.idleT += 1 / 60; at('K_Guard', loop(GLB.idleT / GLB.act.K_Guard.getClip().duration / 1.6));
  at('Running_A', cyc);
  T.Running_A = speed > 0.05 ? clamp(speed * 1.6, 0, 1) : 0; T.K_Guard = 1 - T.Running_A;
  if (G.landT > 0){ at('K_Jump_Land', 0.15 + 0.5 * (1 - G.landT / 0.12)); T.K_Jump_Land = 0.6; T.K_Guard *= 0.4; T.Running_A *= 0.4; }
  return { T, rate: 22 };
}
function knightAfter(G, dt){
  // keep the measured scale; squash only the height; facing down the stair, mirror him so the sword arm stays on the
  // camera's side (a 2D flip: every swing reads the same both ways)
  const sy = squash(G)[1], s = GLB.base;
  GLB.inner.scale.set(s * (G.face < 0 && ST.mode !== 'fall' ? -1 : 1), s * sy, s);
  // the roll: a full forward tumble about the body's middle, tucked
  if (G.roll > 0 && ST.mode !== 'fall'){
    const q = 1 - G.roll / MV.roll.time, ang = -Math.PI * 2 * smooth(clamp(q * 1.15, 0, 1)), c = 0.45;
    GLB.root.rotation.z = ang; GLB.root.position.set(c * Math.sin(-ang), c - c * Math.cos(ang) - 0.3 * Math.sin(Math.PI * q), 0);
  }
  stepCloth(dt);
}

// ---------------------------------------------------------------------------------------------------------------------
// The blade's trail: a ribbon swept by the real blade (hilt to tip) over the last few frames of a strike, so the smear
// always matches the swing that made it.
const TRAIL_N = 6;
const trail = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 2 * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 2 * 3), 3));
  const idx = []; for (let i = 0; i < TRAIL_N - 1; i++){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.frustumCulled = false; m.visible = false; scene.add(m);
  return { m, pts: [], fade: 0 };
})();
const tipCache = new WeakMap();
function bladeEnds(w){
  // the blade runs along the weapon's longest local axis, from the grip out to the far end
  let c = tipCache.get(w);
  if (!c){
    const box = new THREE.Box3(); w.traverse(o => { if (o.isMesh){ o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox); } });
    const size = box.getSize(new THREE.Vector3()), ax = size.x > size.y ? (size.x > size.z ? 'x' : 'z') : (size.y > size.z ? 'y' : 'z');
    const far = Math.abs(box.max[ax]) > Math.abs(box.min[ax]) ? box.max[ax] : box.min[ax];
    const tip = new THREE.Vector3(), base = new THREE.Vector3(); tip[ax] = far; base[ax] = far * 0.6;
    c = { tip, base }; tipCache.set(w, c);
  }
  return c;
}
function bladeTrail(G){
  const A = swingInfo(G), w = GLB.node['wep_' + (PL.wepId || 'sword')];
  const live = A && w && (A.phase === 'active' || (A.phase === 'rec' && A.t < 0.04));
  if (live){
    const e = bladeEnds(w);
    trail.pts.unshift([e.base.clone().applyMatrix4(w.matrixWorld), e.tip.clone().applyMatrix4(w.matrixWorld)]);
    if (trail.pts.length > TRAIL_N) trail.pts.length = TRAIL_N;
    trail.fade = 1;
  } else {
    trail.fade -= 0.2; if (trail.pts.length) trail.pts.pop();
  }
  const n = trail.pts.length, m = trail.m;
  m.visible = n > 1 && trail.fade > 0 && !!A && A.phase !== 'wind';
  if (!m.visible) return;
  const pos = m.geometry.attributes.position, col = m.geometry.attributes.color;
  for (let i = 0; i < TRAIL_N; i++){
    const p = trail.pts[Math.min(i, n - 1)], q = i < n ? 1 - i / (n - 1 || 1) : 0, a = q * q * 0.9 * trail.fade;   // bright at the blade, gone at the tail
    pos.setXYZ(i * 2, p[0].x, p[0].y, p[0].z); pos.setXYZ(i * 2 + 1, p[1].x, p[1].y, p[1].z);
    col.setXYZ(i * 2, 0.1 * a, 0.09 * a, 0.08 * a); col.setXYZ(i * 2 + 1, a, 0.93 * a, 0.8 * a);   // additive: dark is clear
  }
  pos.needsUpdate = true; col.needsUpdate = true;
}
