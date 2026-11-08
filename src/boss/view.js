// The Warden on the floor, drawn: the golem (tools/blender/golem_tripo.py), the floor's broken edge where the stair
// ends, the rubble that comes down behind you, the shockwaves, the leap's shadow, the rocks from the roof.
import { R, RW, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { ZONES } from '../config/zones.js';
import { ST } from '../core/state.js';
import { scene } from '../render/renderer.js';
import { placeArc, vArc } from '../render/primitives.js';
import { rock, rockMaterial, rng } from '../render/rocks.js';
import { burst } from '../render/particles.js';
import { loadModel, instance, pose, poseOnce, clipBelow } from '../render/glbModel.js';
import { BOSS_FLIGHT, ZF, MAXK } from '../config/constants.js';
import { hasFloor, floorSpan, flightY, zoneOf } from '../world/path.js';
const THREE = window.THREE;
const T = TUNE.golem;
export const GOLEM = loadModel('golem', 'assets/models/golem/golem.glb');
const SRC_H = 0.728;   // the model's height, sole to crown, in its own units
// where each clip's phases change (frames; golem_tripo.py writes the same into the model as golem_marks)
const MARKS = { Slam: [0, 12, 15, 27, 38], Sweep: [0, 11, 16, 30], Stomp: [0, 12, 14, 28], Leap: [0, 10, 22, 26, 36], Stagger: [0, 6, 30, 40], walk_stride: 0.2615 };
let MK = null;   // the model's own marks (three.js keeps a glTF node's extras on its userData), else ours
const marks = () => {
  if (!MK && GOLEM.ready){ MK = MARKS; GOLEM.src.traverse(o => { if (o.userData && o.userData.golem_marks) try { MK = JSON.parse(o.userData.golem_marks); } catch {} }); }
  return MK || MARKS;
};

// ---- the floors' fixed dressing: at the far edge, the broken end of the stone where the stair above has fallen away
for (let z = 0; z * ZF + BOSS_FLIGHT < MAXK; z++){
  const kB = z * ZF + BOSS_FLIGHT; if (!hasFloor(kB)) continue;
  const { s0, s1 } = floorSpan(kB), y = flightY(kB), r = rng(kB * 37 + 5), zz = ZONES[zoneOf(kB)];
  const m = rockMaterial(new THREE.Color(zz.stone).multiplyScalar(0.75).getHex()), g = new THREE.Group();
  for (let i = 0; i < 9; i++){ const a = (s1 - 0.1 + (r() - 0.6) * 0.5) * OMEGA, rr = R + (r() - 0.5) * 2.2; g.add(rock(m, { w: 0.4 + r() * 0.5, h: 0.4 + r() * 0.6, d: 0.5 + r() * 0.5, jag: 0.45 }, rr * Math.cos(a), y - 0.15 + r() * 0.25, rr * Math.sin(a), r)); }
  // broken teeth of the steps that were: hanging off the edge below the floor
  for (let i = 0; i < 4; i++){ const a = (s1 + 0.15 + r() * 0.3) * OMEGA, rr = R + (r() - 0.5) * 1.8; g.add(rock(m, { w: 0.35, h: 0.8 + r() * 0.6, d: 0.45, jag: 0.5 }, rr * Math.cos(a), y - 1.0 - r() * 0.4, rr * Math.sin(a), r)); }
  // two stumps of fallen columns against the wall, framing the floor
  for (const u of [0.3, 0.75]){ const a = (s0 + (s1 - s0) * u) * OMEGA; for (let j = 0; j < 3; j++) g.add(rock(m, { w: 0.9 - j * 0.15, h: 0.8, d: 0.9 - j * 0.15, jag: 0.25 }, (RW - 0.75) * Math.cos(a), y + 0.4 + j * 0.75, (RW - 0.75) * Math.sin(a), r)); }
  scene.add(g);
}

// ---- one fight's things
let V = null;
const floorLight = new THREE.PointLight(0xffa860, 0, 18, 2); scene.add(floorLight);   // braziers' glow over the floor while he stands (added once: a new light recompiles every shader)
export function buildGolemView(W){
  const zz = ZONES[W.z], r = rng(W.kB * 13 + 1), M = new THREE.Group(); scene.add(M);
  const rm = rockMaterial(new THREE.Color(zz.stone).multiplyScalar(0.7).getHex());
  // the rubble that comes down behind you
  const seal = new THREE.Group(), sa = (W.span.s0 + 0.15) * OMEGA;
  for (let i = 0; i < 14; i++){ const h = r() * 2.6, a = sa + (r() - 0.5) * 0.04, rr = R + (r() - 0.5) * 2.4; seal.add(rock(rm, { w: 0.5 + r() * 0.6, h: 0.5 + r() * 0.5, d: 0.6 + r() * 0.5, jag: 0.4 }, rr * Math.cos(a), h, rr * Math.sin(a), r)); }
  seal.visible = false; scene.add(seal);
  // a shockwave: a crest of broken stone; a falling rock and its dust mark; the leap's shadow
  const waves = [], rocks = [], marksM = [];
  for (let i = 0; i < 8; i++){ const g = new THREE.Group(); for (let j = 0; j < 3; j++) g.add(rock(rm, { w: 0.35, h: 0.3 + j * 0.12, d: 0.6, jag: 0.5 }, (j - 1) * 0.18, 0.12 + j * 0.05, (r() - 0.5) * 0.8, r)); g.visible = false; scene.add(g); waves.push(g); }
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
  const disc = () => { const d = new THREE.Mesh(new THREE.CircleGeometry(1, 20), shadowMat.clone()); d.rotation.x = -Math.PI / 2; d.visible = false; scene.add(d); return d; };
  for (let i = 0; i < 6; i++){ const k = rock(rm, { w: 0.7, h: 0.6, d: 0.7, jag: 0.45 }, 0, 0, 0, r); k.visible = false; scene.add(k); rocks.push(k); marksM.push(disc()); }
  const shadow = disc();
  V = { W, M, seal, waves, rocks, marks: marksM, shadow, B: null, sealT: -1, mats: [] };
}
export function removeGolemView(){
  floorLight.intensity = 0;
  if (!V) return;
  for (const o of [V.M, V.seal, V.shadow, ...V.waves, ...V.rocks, ...V.marks]) scene.remove(o);
  V = null;
}
export function golemPoint(h = 2){ const W = ST.W; return W ? vArc(W.s * OMEGA, R, W.y + W.yOff + h) : new THREE.Vector3(); }
export function sealFall(){ if (V){ V.seal.visible = true; V.sealT = 0; } }
export function sealClear(W){
  if (!V) return;
  V.seal.visible = false; burst(vArc((W.span.s0 + 0.15) * OMEGA, R, W.y + 1), 40, ZONES[W.z].stone, 5, 7, 0.14);
}

// ---- every frame
export function drawGolem(dt){
  const W = ST.W; if (!V || !W || V.W !== W) return;
  const t = ST.time;
  // the rubble drops into place
  if (V.sealT >= 0){ V.sealT += dt; V.seal.position.y = W.y + Math.max(0, 7 - 28 * V.sealT * V.sealT); }
  else V.seal.position.y = W.y;
  if (!GOLEM.ready) return;
  if (!V.B){
    V.B = instance(GOLEM, T.height / SRC_H); V.B.g.rotation.y = Math.PI / 2; V.M.add(V.B.g);
    // stone, not metal: Tripo's metal map reads as black with nothing to reflect
    V.B.model.traverse(o => { if (o.isMesh && o.material){ const m = o.material; m.metalness = 0; m.metalnessMap = null; m.roughness = 0.9; m.needsUpdate = true; V.mats.push(m); } });
  }
  const B = V.B, crumbling = W.st === 'risen';
  const mid = (W.span.s0 + W.span.s1) / 2; floorLight.position.copy(vArc(mid * OMEGA, R - 1.5, W.y + 5)); floorLight.intensity += ((crumbling ? 0 : 1.5) - floorLight.intensity) * Math.min(1, dt * 2);
  placeArc(V.M, W.s * OMEGA, R, W.y + W.yOff - (crumbling ? Math.min(1, W.tm / T.crumble) ** 2 * T.height : 0), W.face < 0);
  V.M.visible = !(crumbling && W.tm > T.crumble);
  if (crumbling){ clipBelow(B, W.y - 0.05); if (Math.random() < 0.5) burst(vArc(W.s * OMEGA, R, W.y + 0.2), 3, ZONES[W.z].stone, 2.5, 6, 0.1); }
  // the clip: by state, each attack's phases mapped onto its own marks
  const mk = marks(), seg = (name, i, f) => { const m = mk[name]; return (m[i] + (m[i + 1] - m[i]) * Math.min(1, Math.max(0, f))) / m[m.length - 1]; };
  let clip = 'Idle', frac = t / 2.6, once = false;
  if (W.st === 'intro'){ clip = 'Roar'; frac = W.tm / T.intro; once = true; }
  else if (W.st === 'taunt'){ clip = 'Taunt'; frac = W.tm / T.taunt; once = true; }
  else if (W.st === 'walk'){ clip = 'Walk'; frac = W.walked / (mk.walk_stride * T.height / SRC_H); }
  else if (W.st === 'stagger'){ const D = T.stagger[W.phase - 1]; clip = 'Stagger'; once = true; frac = W.tm < 0.18 ? seg('Stagger', 0, W.tm / 0.18) : W.tm < D - 0.4 ? seg('Stagger', 1, (W.tm - 0.18) / (D - 0.58)) : seg('Stagger', 2, (W.tm - D + 0.4) / 0.4); }
  else if (W.st === 'dying' || crumbling){ clip = 'Die'; frac = crumbling ? 1 : W.tm / T.dying; once = true; }
  else if (W.st === 'atk' && W.atk){
    const A = W.atk, name = { slam: 'Slam', sweep: 'Sweep', stomp: 'Stomp', leap: 'Leap' }[A.kind], [, dur] = A.phases[Math.min(A.i, A.phases.length - 1)];
    clip = name; once = true; frac = seg(name, Math.min(A.i, mk[name].length - 2), A.t / dur);
  }
  else if (W.hitT > 0 && W.st === 'idle'){ clip = 'Hit'; frac = (0.18 - W.hitT) / 0.18 * 0.6; once = true; }
  (once ? poseOnce : pose)(B, clip, frac, dt, 16);
  // a blow lands: a flash; the wind-up of anything unanswerable smoulders red
  const red = W.st === 'atk' && W.atk && W.atk.i === 0 && Math.sin(t * 28) > 0;
  for (const m of V.mats) if (m.emissive) m.emissive.setHex(W.flash > 0 ? 0x806050 : red ? 0x3a0c08 : 0x000000);
  // the shockwaves
  V.waves.forEach((g, i) => {
    const v = W.waves[i]; g.visible = !!v; if (!v) return;
    placeArc(g, v.s * OMEGA, R, W.y, v.dir < 0); g.scale.setScalar(0.8 + 0.3 * Math.sin(t * 30 + i));
    if (Math.random() < 0.6) burst(vArc(v.s * OMEGA, R + (Math.random() - 0.5) * 1.6, W.y + 0.2), 2, ZONES[W.z].stone, 2.4, 7, 0.09);
  });
  // the rocks from the roof: dust trickles and a shadow grows, then the rock
  V.rocks.forEach((k, i) => {
    const q = W.rocks[i], mk2 = V.marks[i]; k.visible = mk2.visible = !!q; if (!q) return;
    const f = Math.max(0, q.t) / TUNE.golem.rocks.warn, a = q.s * OMEGA, p = vArc(a, R, W.y + 0.03);
    mk2.position.copy(p); mk2.scale.setScalar(0.25 + 0.45 * Math.min(1, f)); mk2.material.opacity = q.hit ? Math.max(0, 0.45 - (q.t - TUNE.golem.rocks.warn) * 0.8) : 0.15 + 0.3 * f;
    k.visible = q.t > TUNE.golem.rocks.warn - 0.35 && !q.hit;
    k.position.copy(vArc(a, R, W.y + 0.35 + 9 * Math.max(0, (TUNE.golem.rocks.warn - q.t) / 0.35)));
    if (q.t > 0 && !q.hit && Math.random() < 0.4) burst(vArc(a, R, W.y + 7), 1, '#8c8298', 0.6, -9, 0.05);
  });
  // the leap: a shadow where he will come down
  const A = W.atk, leaping = W.st === 'atk' && A && A.kind === 'leap' && A.i <= 1 && A.to != null;
  V.shadow.visible = leaping;
  if (leaping){ const f = A.i === 0 ? 0.3 : 0.3 + 0.7 * (A.t / A.phases[1][1]); V.shadow.position.copy(vArc(A.to * OMEGA, R, W.y + 0.04)); V.shadow.scale.setScalar(TUNE.golem.leap.crush * f); }
}
