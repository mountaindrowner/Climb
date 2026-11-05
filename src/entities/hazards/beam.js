// Fallen beam: a splintered timber wedged diagonally across the stair, its top end driven into the wall a step up,
// its broken end resting on the inner edge a step down, crossing your lane at head height. Iron-banded, a frayed rope
// hanging from the broken end. It creaks and sheds dust as you near. It is a low ceiling: you cannot pass it standing,
// and running into it hurts. Answer: hold ▼ to crouch-walk under it, or roll under it.
import { R, RW, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { rng } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, vArc } from '../../render/primitives.js';
import { rock, rockMaterial } from '../../render/rocks.js';
import { flatMat, segment, spike, joint } from '../../render/creature.js';
import { mote } from '../../render/particles.js';
import { topAt } from '../../world/path.js';
import { hurt, isLow } from '../player/player.js';
const THREE = window.THREE;

export const hint = 'A fallen beam. Hold ▼ to crouch under it, or roll under it. Running into it hurts.';

export function build(o, { z, dyn }){
  const top = topAt(o.s), r = rng(o.k * 331 + 7);
  // the line it lies along: crosses radius R at path distance o.s, about head height
  const A = vArc((o.s + 1.1) * OMEGA, RW + 0.2, top + 2.5), Bp = vArc((o.s - 0.9) * OMEGA, R - 1.6, top + 1.45);
  const len = A.distanceTo(Bp);
  const g = new THREE.Group(); g.position.lerpVectors(A, Bp, 0.5); g.lookAt(Bp); dyn.add(g);   // local +z runs from the wall end to the broken end
  const shake = joint(g);
  const wood = flatMat(0x7a5030, { rough: 0.95 }), woodHi = flatMat(0x9a6a40, { rough: 0.9 }), iron = flatMat(0x2c2a30, { rough: 0.7, metal: 0.3 });
  const n = 3, segL = len / n;
  for (let j = 0; j < n; j++){
    const m = mbox(0.36, 0.38, segL * 1.02, j === 1 ? woodHi : wood, 0, 0, -len / 2 + (j + 0.5) * segL);
    m.rotation.z = (r() - 0.5) * 0.12; m.rotation.x = (r() - 0.5) * 0.05; shake.add(m);
  }
  shake.add(mbox(0.42, 0.44, 0.1, iron, 0, 0, -len * 0.2), mbox(0.42, 0.44, 0.1, iron, 0, 0, len * 0.15));
  for (let j = 0; j < 5; j++){ const s = spike(woodHi, 0.35 + r() * 0.3, 0.05); s.position.set((r() - 0.5) * 0.28, (r() - 0.5) * 0.28, len / 2 - 0.05); s.rotation.x = Math.PI / 2 + (r() - 0.5) * 0.5; s.rotation.z = (r() - 0.5) * 0.5; shake.add(s); }
  // where it went into the wall: a ring of broken stone
  const stone = rockMaterial(new THREE.Color(z.wall).multiplyScalar(0.55).getHex());
  for (let j = 0; j < 7; j++){ const ang = j / 7 * Math.PI * 2; shake.add(rock(stone, { w: 0.35, h: 0.3, d: 0.3, jag: 0.4 }, Math.cos(ang) * 0.32, Math.sin(ang) * 0.32, -len / 2 + 0.3, r)); }
  // a frayed rope hanging from the broken end (kept upright in draw)
  const rope = new THREE.Group(); rope.position.copy(Bp).add(new THREE.Vector3(0, -0.15, 0)); dyn.add(rope);
  const ropeSeg = segment(flatMat(0x8a7a5a), 0.9, 0.03, 0.02); ropeSeg.rotation.x = Math.PI; rope.add(ropeSeg);
  o.m = g; o.shake = shake; o.rope = rope; o.mats = [wood, woodHi]; o.top = top; o.A = A; o.Bp = Bp; o.halfWidth = 0.38;
}
export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  o.bonkT = Math.max(0, (o.bonkT || 0) - dt);
  if (!o.creaked && Math.abs(d) < TUNE.beam.creak){ o.creaked = true; sfx.creak(); }
  if (!isLow(G) && Math.abs(G.s - o.s) < o.halfWidth){
    // standing, or in the air, inside the beam: it stops him at the side he came from
    const side = Math.sign(G.prevS - o.s) || -G.face, fast = Math.abs(G.v) > TUNE.move.bonkSpeed;
    G.s = G.prevS = o.s + side * o.halfWidth; G.v = 0;
    if (fast) hurt(1, 'Smack', o.s);
    else if (o.bonkT <= 0){ sfx.block(); o.bonkT = 0.5; }
  }
  if (!o.done && G.s > o.s + 0.8) o.done = true;
}
export function draw(o){
  const G = ST.G, d = G ? o.s - G.s : 99, near = !o.done && d > 0 && d < TUNE.beam.creak, t = ST.time;
  o.shake.rotation.z = near ? Math.sin(t * 38) * 0.012 : 0;
  o.rope.rotation.z = Math.sin(t * 1.9 + o.s) * 0.12;
  const glow = near && Math.sin(t * 14) > 0 ? 0x3a1d08 : 0x000000;
  for (const m of o.mats) m.emissive.setHex(glow);
  if (near && Math.random() < 0.35){ const p = new THREE.Vector3().lerpVectors(o.A, o.Bp, Math.random()); mote(p.x, p.y - 0.2, p.z, 0x8a7a6a); }
}
export function hud(o, d, { drawIcon }){
  if (!o.done && d > 0 && d <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 1.2, topAt(o.s) + 2.7), '▼', '#e8b04a');
}
