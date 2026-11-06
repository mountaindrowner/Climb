// Broken step. The slab is split by glowing cracks; as you come near it crumbles into the shaft and leaves a real hole.
// Answer: ▲ jump it. Walk into the hole and you fall through: 1 health, and back on the last solid step.
// (The stair's own step is removed by the layout; the motor asks world/ground.js whether the hole is open.)
import { FL, R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { rng } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, placeArc, vArc } from '../../render/primitives.js';
import { rock, rockMaterial } from '../../render/rocks.js';
import { burst } from '../../render/particles.js';
import { topAt, flightY, riseOf } from '../../world/path.js';
const THREE = window.THREE;

export const hint = 'A broken step. It crumbles as you come near: press {jump} to jump the hole.';

export function build(o, { c, z, glow, dyn }){
  const i = Math.floor(o.s - c.k * FL), sa = (c.k * FL + i + 0.5) * OMEGA, st = flightY(c.k) + (i + 1) * riseOf(c.k);
  const r = rng(o.k * 977 + i * 31);
  const stone = rockMaterial(new THREE.Color(z.stone).multiplyScalar(0.95).getHex()), dark = rockMaterial(new THREE.Color(z.stone).multiplyScalar(0.6).getHex());
  // the slab, in pieces: two along the stair, three across it, and a heavy underside
  const chunks = [];
  for (let u = 0; u < 2; u++) for (let v = 0; v < 3; v++){
    const m = rock(u + v & 1 ? stone : dark, { w: 0.56, h: 0.5, d: 0.82, jag: 0.16 }, 0, 0, 0, r);
    const dx = (u - 0.5) * 0.6, dz = (v - 1) * 0.86;
    placeArc(m, sa + dx / R, R + dz, st - 0.26); m.rotation.x += (r() - 0.5) * 0.1; dyn.add(m);
    chunks.push({ m, vy: 0, vx: (r() - 0.5) * 1.2, vz: (r() - 0.5) * 1.2, spin: (r() - 0.5) * 6, delay: r() * 0.25 + (v === 0 ? 0.1 : 0) });
  }
  const under = rock(dark, { w: 1.1, h: 0.8, d: 2.2, jag: 0.25 }, 0, 0, 0, r); placeArc(under, sa, R, st - 0.95); dyn.add(under);
  chunks.push({ m: under, vy: 0, vx: 0, vz: 0, spin: (r() - 0.5) * 2, delay: 0.05 });
  // a jagged stub that stays in the wall
  const stub = rock(dark, { w: 0.5, h: 0.45, d: 0.4, jag: 0.4 }, 0, 0, 0, r); placeArc(stub, sa + 0.03, R + 1.2, st - 0.35); dyn.add(stub);
  // glowing cracks across the top
  const crackMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.35 });
  const cracks = new THREE.Group();
  cracks.add(mbox(0.05, 0.03, 2.4, crackMat, 0, 0, 0));
  cracks.add(mbox(1.1, 0.03, 0.05, crackMat, 0, 0, 0.43), mbox(1.1, 0.03, 0.05, crackMat, 0, 0, -0.43));
  placeArc(cracks, sa, R, st + 0.005); dyn.add(cracks);
  o.chunks = chunks; o.cracks = cracks; o.crackMat = crackMat; o.top = st; o.sa = sa; o.step0 = c.k * FL + i; o.holeOpen = false;
}
export function update(o, dt){
  const G = ST.G, centre = o.step0 + 0.5;
  if (!o.crumbling && Math.abs(centre - G.s) < TUNE.gap.crumble){
    o.crumbling = true; o.ct = 0; o.openT = 0; sfx.crack();
    burst(vArc(o.sa, R, o.top + 0.1), 16, '#8c8298', 2.4, 6, 0.09);
  }
  if (o.crumbling && !o.holeOpen){ o.openT += dt; if (o.openT > 0.28) o.holeOpen = true; }
  if (!o.done && Math.abs(G.s - centre) > 1.2 && o.holeOpen && G.grounded) o.done = true;
}
export function draw(o, dt){
  const G = ST.G, d = G ? o.s - G.s : 99;
  o.crackMat.opacity = o.crumbling ? Math.max(0, 0.9 - o.ct * 2) : d < TUNE.climb.iconRange ? 0.55 + 0.45 * Math.sin(ST.time * 14) : 0.45;
  if (!o.crumbling) return;
  o.ct += dt;
  o.cracks.visible = o.ct < 0.5;
  for (const ch of o.chunks){
    if (o.ct < ch.delay){ ch.m.position.y += (Math.random() - 0.5) * 0.02; continue; }   // shudders, then drops
    ch.vy -= 22 * dt;
    ch.m.position.x += ch.vx * dt; ch.m.position.z += ch.vz * dt; ch.m.position.y += ch.vy * dt;
    ch.m.rotation.x += ch.spin * dt; ch.m.rotation.z += ch.spin * 0.6 * dt;
    if (ch.m.position.y < o.top - 16) ch.m.visible = false;
  }
}
export function hud(o, d, { drawIcon }){
  if (!o.done && d > 0 && d <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 0.4, topAt(o.s) + 0.7), '{jump}', '#e8b04a');
}
