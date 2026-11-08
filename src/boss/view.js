// The Warden drawn: the floor at the top of each region, the cavern that opens behind it (the wall of the shaft is gone
// there, shaft.js), and the colossus standing in its depths (tools/blender/golem_tripo.py) with his arms reached to the
// floor by two-bone IK every frame; the rubble that comes down behind you, the slams' shadows, the shockwaves, the rocks.
import { R, OMEGA, ZF, BOSS_FLIGHT, MAXK } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { ZONES } from '../config/zones.js';
import { ST } from '../core/state.js';
import { scene } from '../render/renderer.js';
import { placeArc, vArc } from '../render/primitives.js';
import { rock, rockMaterial, rng } from '../render/rocks.js';
import { outerTex } from '../render/textures.js';
import { burst } from '../render/particles.js';
import { loadModel, instance, pose, poseOnce } from '../render/glbModel.js';
import { hasFloor, floorSpan, flightY, zoneOf } from '../world/path.js';
const THREE = window.THREE;
const T = TUNE.golem;
export const GOLEM = loadModel('golem', 'assets/models/golem/golem.glb');
const SRC_H = 0.728;   // the model's height, sole to crown, in its own units
export const CAVE = { r: 62, below: 46, above: 30, half: 1.0 };   // the cavern behind each floor: its far wall, how far it opens below and above the floor, its half-angle

// ---- each floor's fixed things: a broad stage of stone, its broken end, and the cavern behind
for (let z = 0; z * ZF + BOSS_FLIGHT < MAXK; z++){
  const kB = z * ZF + BOSS_FLIGHT; if (!hasFloor(kB)) continue;
  const { s0, s1 } = floorSpan(kB), y = flightY(kB), r = rng(kB * 37 + 5), zz = ZONES[zoneOf(kB)], aMid = (s0 + s1) / 2 * OMEGA;
  const m = rockMaterial(new THREE.Color(zz.stone).multiplyScalar(0.75).getHex()), dark = rockMaterial(new THREE.Color(zz.wall).multiplyScalar(0.3).getHex()), g = new THREE.Group();
  // the stage: a deep slab under the floor, out to where his fists come down, its underside ragged rock over the drop
  const a0 = s0 * OMEGA, a1 = s1 * OMEGA, slabMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(zz.stone).multiplyScalar(0.62), map: outerTex }), N = 16;
  for (let i = 0; i < N; i++){   // blocks along the arc, from just in front of the lane out to where his fists land
    const a = a0 + (i + 0.5) / N * (a1 - a0), b = new THREE.Mesh(new THREE.BoxGeometry((a1 - a0) / N * (R + 1.5) * 1.06, 2.6, 4.4), slabMat);
    b.position.copy(vArc(a, R + 1.0, y - 1.32)); b.rotation.y = -a + Math.PI / 2; g.add(b);
  }
  for (let i = 0; i < 26; i++){ const a = a0 + r() * (a1 - a0), rr = R + 0.5 + r() * 2.6; g.add(rock(dark, { w: 1 + r() * 1.4, h: 1.2 + r() * 2.2, d: 1 + r() * 1.2, jag: 0.45 }, rr * Math.cos(a), y - 2.6 - r() * 1.4, rr * Math.sin(a), r)); }
  // the far edge, broken off where the stair above has fallen away
  for (let i = 0; i < 9; i++){ const a = (s1 - 0.1 + (r() - 0.6) * 0.5) * OMEGA, rr = R + (r() - 0.3) * 3.6; g.add(rock(m, { w: 0.4 + r() * 0.5, h: 0.4 + r() * 0.6, d: 0.5 + r() * 0.5, jag: 0.45 }, rr * Math.cos(a), y - 0.15 + r() * 0.25, rr * Math.sin(a), r)); }
  // the cavern: a far wall of dark rock, spires rising out of the depths and hanging from the roof, for scale
  const cave = new THREE.Mesh(new THREE.CylinderGeometry(CAVE.r, CAVE.r, CAVE.below + CAVE.above + 20, 40, 1, true, Math.PI / 2 - aMid - CAVE.half - 0.4, 2 * CAVE.half + 0.8),
    new THREE.MeshLambertMaterial({ color: new THREE.Color(zz.wall).multiplyScalar(0.5), map: outerTex, side: THREE.BackSide }));
  cave.position.y = y + (CAVE.above - CAVE.below) / 2; g.add(cave);
  for (let i = 0; i < 16; i++){
    const a = aMid + (r() - 0.5) * 2 * CAVE.half, rr = 34 + r() * 24, up = r() < 0.5, hgt = 12 + r() * 26;
    g.add(rock(dark, { w: 3 + r() * 4, h: hgt, d: 3 + r() * 4, jag: 0.3, tilt: 0.08 }, rr * Math.cos(a), up ? y - CAVE.below + hgt / 2 - 6 : y + CAVE.above - hgt / 2 + 6, rr * Math.sin(a), r));
  }
  scene.add(g);
}

// ---- one fight's things
let V = null;
const floorLight = new THREE.PointLight(0xffa860, 0, 20, 2); scene.add(floorLight);    // braziers' glow over the floor (lights are added once: a new one recompiles every shader)
export function buildGolemView(W){
  const zz = ZONES[W.z], r = rng(W.kB * 13 + 1), M = new THREE.Group(); scene.add(M);
  const rm = rockMaterial(new THREE.Color(zz.stone).multiplyScalar(0.7).getHex());
  const seal = new THREE.Group(), sa = (W.span.s0 + 0.15) * OMEGA;
  for (let i = 0; i < 14; i++){ const h = r() * 2.6, a = sa + (r() - 0.5) * 0.04, rr = R + (r() - 0.5) * 2.4; seal.add(rock(rm, { w: 0.5 + r() * 0.6, h: 0.5 + r() * 0.5, d: 0.6 + r() * 0.5, jag: 0.4 }, rr * Math.cos(a), h, rr * Math.sin(a), r)); }
  seal.visible = false; scene.add(seal);
  const waves = [], rocks = [], marks = [];
  for (let i = 0; i < 8; i++){ const g = new THREE.Group(); for (let j = 0; j < 3; j++) g.add(rock(rm, { w: 0.35, h: 0.3 + j * 0.12, d: 0.6, jag: 0.5 }, (j - 1) * 0.18, 0.12 + j * 0.05, (r() - 0.5) * 0.8, r)); g.visible = false; scene.add(g); waves.push(g); }
  const disc = () => { const d = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })); d.rotation.x = -Math.PI / 2; d.visible = false; scene.add(d); return d; };
  for (let i = 0; i < 6; i++){ const k = rock(rm, { w: 0.7, h: 0.6, d: 0.7, jag: 0.45 }, 0, 0, 0, r); k.visible = false; scene.add(k); rocks.push(k); marks.push(disc()); }
  V = { W, M, seal, waves, rocks, marks, shadows: [disc(), disc()], B: null, sealT: -1, mats: [], bones: null, base: null, lowSide: null, fist: null, headP: null };
}
export function removeGolemView(){
  floorLight.intensity = 0;
  if (scene.fog) scene.fog.density = TUNE.camera.fogDensity;
  if (!V) return;
  for (const o of [V.M, V.seal, ...V.shadows, ...V.waves, ...V.rocks, ...V.marks]) scene.remove(o);
  V = null;
}
const handWorld = (W, i) => { const p = W.hands[i].pos; return vArc(p.s * OMEGA, p.r, W.y + p.h); };
export function golemHandPoint(i){ return V && V.fist ? V.fist[i].clone() : handWorld(ST.W, i); }
export function golemHeadPoint(){ return V && V.headP ? V.headP.clone() : vArc(ST.W.mid * OMEGA, R + 6, ST.W.y + 3); }
export function sealFall(){ if (V){ V.seal.visible = true; V.sealT = 0; } }
export function sealClear(W){ if (!V) return; V.seal.visible = false; burst(vArc((W.span.s0 + 0.15) * OMEGA, R, W.y + 1), 40, ZONES[W.z].stone, 5, 7, 0.14); }

// ---- the arms: two-bone IK on the skinned bones, after the clip has posed the body
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _d = new THREE.Quaternion();
const wpos = o => o.getWorldPosition(new THREE.Vector3());
function boneOf(model, names){ for (const n of names){ const b = model.getObjectByName(n); if (b) return b; } return null; }
function aim(bone, along, dir){   // turn bone so its own `along` axis points along dir (world)
  bone.getWorldQuaternion(_q); const cur = along.clone().applyQuaternion(_q).normalize();
  _d.setFromUnitVectors(cur, dir.clone().normalize()); _q.premultiply(_d);
  bone.parent.getWorldQuaternion(_q2); bone.quaternion.copy(_q2.invert().multiply(_q)); bone.updateMatrixWorld(true);
}
function bonesOf(model){
  const side = s => {
    const up = boneOf(model, ['upperarm' + s, 'upperarm.' + s, 'upperarm_' + s]), lo = boneOf(model, ['lowerarm' + s, 'lowerarm.' + s, 'lowerarm_' + s]), hand = boneOf(model, ['hand' + s, 'hand.' + s, 'hand_' + s]);
    const tip = boneOf(model, ['middle4' + s, 'middle4.' + s, 'middle3' + s, 'middle3.' + s]);
    // each bone's own axis along itself: toward its child (bones need not point along +y)
    const toward = (b, c) => { const m = new THREE.Matrix4().copy(b.matrixWorld).invert().multiply(c.matrixWorld); return new THREE.Vector3().setFromMatrixPosition(m).normalize(); };
    return { up, lo, hand, tip, aUp: toward(up, lo), aLo: toward(lo, hand), aHand: tip ? toward(hand, tip) : new THREE.Vector3(0, 1, 0) };
  };
  model.updateMatrixWorld(true);
  return { r: side('r'), l: side('l'), head: boneOf(model, ['head']) };
}
function reach(arm, target, pole, handDir, w){
  const S_ = wpos(arm.up), E = wpos(arm.lo), Wr = wpos(arm.hand);
  const L1 = S_.distanceTo(E), L2 = E.distanceTo(Wr), qU = arm.up.quaternion.clone(), qL = arm.lo.quaternion.clone(), qH = arm.hand.quaternion.clone();
  const dv = target.clone().sub(S_), d = Math.max(0.2 * (L1 + L2), Math.min(dv.length(), (L1 + L2) * 0.999)), u = dv.normalize();
  const n = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
  const ca = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))), sa = Math.sqrt(1 - ca * ca);
  const elbow = S_.clone().add(u.clone().multiplyScalar(L1 * ca)).add(n.multiplyScalar(L1 * sa));
  aim(arm.up, arm.aUp, elbow.clone().sub(S_));
  aim(arm.lo, arm.aLo, S_.clone().add(u.clone().multiplyScalar(d)).sub(elbow));
  aim(arm.hand, arm.aHand, handDir);
  if (w < 1){
    arm.up.quaternion.copy(qU.slerp(arm.up.quaternion, w)); arm.lo.quaternion.copy(qL.slerp(arm.lo.quaternion, w)); arm.hand.quaternion.copy(qH.slerp(arm.hand.quaternion, w));
    arm.up.updateMatrixWorld(true);
  }
}

// ---- every frame
export function drawGolem(dt){
  const W = ST.W; if (!V || !W || V.W !== W) return;
  const t = ST.time, aMid = W.mid * OMEGA, out = new THREE.Vector3(Math.cos(aMid), 0, Math.sin(aMid)), tan = new THREE.Vector3(-Math.sin(aMid), 0, Math.cos(aMid));
  // the cavern clears: thinner haze while he is there, so its far side reads
  if (scene.fog) scene.fog.density += (TUNE.camera.fogDensity * 0.42 - scene.fog.density) * Math.min(1, dt * 1.5);
  if (V.sealT >= 0){ V.sealT += dt; V.seal.position.y = W.y + Math.max(0, 7 - 28 * V.sealT * V.sealT); } else V.seal.position.y = W.y;
  floorLight.position.copy(vArc(aMid, R - 1.5, W.y + 5)); floorLight.intensity += ((W.st === 'risen' ? 0 : 1.5) - floorLight.intensity) * Math.min(1, dt * 2);
  drawFx(W, t);
  if (!GOLEM.ready) return;
  if (!V.B){
    V.B = instance(GOLEM, T.height / SRC_H); V.M.add(V.B.g);
    V.B.model.traverse(o => { if (o.isMesh && o.material){ const m = o.material; m.metalness = 0; m.metalnessMap = null; m.roughness = 0.9; m.needsUpdate = true; V.mats.push(m); } });
  }
  const B = V.B;
  // the body's clip
  let clip = 'Loom', frac = t / 5, once = false;
  if (W.st === 'intro'){ clip = 'Roar'; frac = W.tm / T.intro; once = true; }
  else if (W.st === 'taunt'){ clip = 'Taunt'; frac = W.tm / T.taunt; once = true; }
  else if (W.st === 'reel'){ clip = 'Reel'; frac = t / 2; }
  else if (W.st === 'dying' || W.st === 'risen'){ clip = 'Die'; frac = W.st === 'risen' ? 1 : W.tm / T.dying; once = true; }
  else if (W.hands.some(h => h.act)){ clip = 'Reach'; frac = 0; }
  (once ? poseOnce : pose)(B, clip, frac, dt, 6);
  // where he stands: facing the floor from out in the depths
  V.M.rotation.set(0, Math.atan2(-out.x, -out.z), 0);
  if (!V.base){   // measured once, on his looming pose: how far his shoulders sit in front of and above his feet
    V.M.position.copy(vArc(aMid, R + T.back, W.y)); V.M.updateMatrixWorld(true);
    V.bones = bonesOf(B.model);
    const sh = wpos(V.bones.r.up).add(wpos(V.bones.l.up)).multiplyScalar(0.5);
    V.base = { fwd: -sh.clone().sub(V.M.position).dot(out), up: sh.y - V.M.position.y };
    V.lowSide = wpos(V.bones.r.up).dot(tan) < wpos(V.bones.l.up).dot(tan) ? 'r' : 'l';   // which arm works the floor's low end: the one whose shoulder is nearer it
  }
  let rad = R + T.back + V.base.fwd, y = W.y + T.shoulder - V.base.up;
  if (W.st === 'dying' || W.st === 'risen'){ const f = W.st === 'dying' ? (W.tm / T.dying) ** 2 * 0.25 : 0.25 + 0.75 * Math.min(1, W.tm / T.crumble) ** 2; rad += 12 * f; y -= 60 * f; }
  V.M.position.copy(vArc(aMid, rad, y)); V.M.updateMatrixWorld(true);
  // reeling: lowered until his head rests on the floor's far edge
  if (W.reelF > 0){
    const want = vArc(aMid, R + 4.6, W.y + 1.8).sub(wpos(V.bones.head));
    V.M.position.add(want.multiplyScalar(W.reelF)); V.M.updateMatrixWorld(true);
  }
  // the arms to the hands' targets: each target is where the middle of the fist goes
  V.fist = [];
  for (const hd of W.hands){
    const arm = V.bones[hd.i === 0 ? V.lowSide : (V.lowSide === 'r' ? 'l' : 'r')];
    const target = handWorld(W, hd.i), high = Math.min(1, Math.max(0, (hd.pos.h - 3) / 8));
    const handDir = out.clone().negate().multiplyScalar(1 - high * 0.6).add(new THREE.Vector3(0, -high, 0)).normalize();   // knuckles toward you, and down as it rises to come down
    const fl = arm.tip ? wpos(arm.hand).distanceTo(wpos(arm.tip)) : 3;
    const wrist = target.clone().sub(handDir.clone().multiplyScalar(fl * 0.55));
    const pole = tan.clone().multiplyScalar(hd.i === 0 ? -1 : 1).add(new THREE.Vector3(0, 0.15, 0)).add(out.clone().multiplyScalar(0.45));   // elbows out to the sides (and a little back), so the arms frame the floor instead of roofing it
    if (W.ik > 0) reach(arm, wrist, pole, handDir, W.ik);
    V.fist.push(wpos(arm.hand).add(handDir.clone().multiplyScalar(fl * 0.55)));
  }
  V.headP = wpos(V.bones.head).add(new THREE.Vector3(0, 2.5, 0));
  // a blow lands: a flash; a fist about to come down smoulders red; reeling, he glows dully
  const red = W.hands.some(h => h.act && h.act.pi === 0) && Math.sin(t * 24) > 0;
  for (const m of V.mats) if (m.emissive) m.emissive.setHex(W.flash > 0 ? 0x806050 : red ? 0x2a0806 : W.st === 'reel' ? 0x201408 : 0x0b0d16);   // at rest, a faint cold sheen from the cavern so his bulk reads in the dark
}
function drawFx(W, t){
  // a slam's shadow on the floor, growing as the fist rises over it; a sweep's dust where the hand will come in
  V.shadows.forEach((d, i) => {
    const hd = W.hands[i], A = hd.act, on = A && A.kind === 'slam' && A.pi <= 1 && A.pt >= 0;
    d.visible = !!on; if (!on) return;
    const f = A.pi === 0 ? A.pt / A.phases[0][1] : 1;
    d.position.copy(vArc(hd.pos.s * OMEGA, R + 0.3, W.y + 0.04)); d.scale.setScalar(T.slam.half * (0.35 + 0.65 * f)); d.material.opacity = 0.2 + 0.4 * f;
  });
  for (const hd of W.hands){ const A = hd.act; if (A && A.kind === 'sweep' && A.pi === 0 && Math.random() < 0.5) burst(vArc(A.start * OMEGA, R + 0.5, W.y + 0.4), 2, ZONES[W.z].stone, 2.5, 6, 0.1); }
  V.waves.forEach((g, i) => {
    const v = W.waves[i]; g.visible = !!v; if (!v) return;
    placeArc(g, v.s * OMEGA, R, W.y, v.dir < 0); g.scale.setScalar(0.8 + 0.3 * Math.sin(t * 30 + i));
    if (Math.random() < 0.6) burst(vArc(v.s * OMEGA, R + (Math.random() - 0.5) * 1.6, W.y + 0.2), 2, ZONES[W.z].stone, 2.4, 7, 0.09);
  });
  const RK = T.rocks;
  V.rocks.forEach((k, i) => {
    const q = W.rocks[i], mk = V.marks[i]; k.visible = mk.visible = !!q; if (!q) return;
    const f = Math.max(0, q.t) / RK.warn, a = q.s * OMEGA;
    mk.position.copy(vArc(a, R, W.y + 0.03)); mk.scale.setScalar(0.25 + 0.45 * Math.min(1, f)); mk.material.opacity = q.hit ? Math.max(0, 0.45 - (q.t - RK.warn) * 0.8) : 0.15 + 0.3 * f;
    k.visible = q.t > RK.warn - 0.35 && !q.hit;
    k.position.copy(vArc(a, R, W.y + 0.35 + 9 * Math.max(0, (RK.warn - q.t) / 0.35)));
    if (q.t > 0 && !q.hit && Math.random() < 0.4) burst(vArc(a, R, W.y + 7), 1, '#8c8298', 0.6, -9, 0.05);
  });
}
