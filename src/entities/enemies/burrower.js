// Burrower: something under the stair. A ring of glowing cracks marks a step; a mound with a fin of bone ploughs toward
// it and a ring of teeth breaks the surface there. The jaws wait open on the step and snap at anything that stands in
// them. Answer: ▲ jump over it, or strike its head with A while it is up.
// States: idle -> travel -> rise -> up <-> snap; sink -> gone
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { clamp, rng } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, placeArc, vArc } from '../../render/primitives.js';
import { rock, rockMaterial } from '../../render/rocks.js';
import { flatMat, spike, blob, joint, outline, outlineMat } from '../../render/creature.js';
import { burst } from '../../render/particles.js';
import { float } from '../../fx/feedback.js';
import { topAt } from '../../world/path.js';
import { hurt, head, isInvulnerable } from '../player/player.js';
import { GOLD } from '../../config/economy.js';
import { hitstop } from '../../fx/feedback.js';
const THREE = window.THREE;
const T = TUNE.burrower;

export const hint = 'A burrower. Jump its jaws with {jump}, or strike its head with {attack} while it is up.';

export function build(o, { z, glow, dyn }){
  const r = rng(o.k * 401 + 9), top = topAt(o.s);
  const mat = rockMaterial(new THREE.Color(z.stone).multiplyScalar(1.1).getHex());
  const bone = flatMat(0xd6c8a8, { rough: 0.6 }), flesh = flatMat(0x5a3448, { rough: 0.6 }), rim = outlineMat(glow, 0.55);
  const mound = new THREE.Group();
  for (let j = 0; j < 8; j++) mound.add(rock(mat, { w: 0.45 + r() * 0.3, h: 0.35, d: 0.5 + r() * 0.35, jag: 0.4 }, (r() - 0.5) * 0.8, 0.08 + r() * 0.14, (r() - 0.5) * 1.3, r));
  // a fin of bone shards slicing through the rubble, the first thing you see of it
  for (let j = 0; j < 3; j++){ const f = spike(bone, 0.85 - j * 0.18, 0.12); f.position.set(-j * 0.3, 0.2, 0); f.rotation.z = 0.45; mound.add(f); outline(f, rim, 1.25); }
  mound.scale.setScalar(1.45); mound.visible = false; dyn.add(mound);
  // where the jaws will come up: a ring of glowing cracks on the step, lit from the moment it starts toward you
  const markMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0, depthWrite: false });
  const mark = new THREE.Group();
  for (let j = 0; j < 9; j++){ const ang = j / 9 * Math.PI * 2, c = mbox(0.08, 0.03, 0.32, markMat, Math.cos(ang) * 0.6, 0.02, Math.sin(ang) * 0.6); c.rotation.y = -ang; mark.add(c); }
  placeArc(mark, o.s * OMEGA, R, top); dyn.add(mark);
  // the furrow it leaves on the steps, glowing
  const furrowMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0, depthWrite: false });
  const furrow = []; for (let j = 0; j < 10; j++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), furrowMat); m.rotation.x = -Math.PI / 2; m.visible = false; dyn.add(m); furrow.push(m); }
  // the maw: a dark pit, a ring of teeth, a worm head inside
  const jaws = new THREE.Group(); placeArc(jaws, o.s * OMEGA, R, top); dyn.add(jaws);
  const pit = new THREE.Mesh(new THREE.CircleGeometry(0.62, 12), new THREE.MeshBasicMaterial({ color: 0x050307 })); pit.rotation.x = -Math.PI / 2; pit.position.y = 0.02; jaws.add(pit);
  const rise = joint(jaws); rise.position.y = -0.9;
  const teeth = [];
  for (let i = 0; i < 8; i++){
    const ang = i / 8 * Math.PI * 2, tj = joint(rise, Math.cos(ang) * 0.5, 0, Math.sin(ang) * 0.5);
    tj.add(spike(bone, 0.55 + (i % 2) * 0.15, 0.08)); teeth.push({ tj, ang });
  }
  const worm = blob(flesh, 0.7, 0.8, 0.7); worm.position.y = -0.1; rise.add(worm); outline(worm, rim, 1.12);
  const eye = new THREE.MeshBasicMaterial({ color: glow });
  for (const s of [1, -1]){ const e = blob(eye, 0.08, 0.08, 0.08, 0); e.position.set(0.28, 0.12, s * 0.15); rise.add(e); }
  jaws.visible = false;
  o.mound = mound; o.jaws = jaws; o.rise = rise; o.teeth = teeth; o.top = top; o.dustC = '#' + mat.color.getHexString(); o.furrow = furrow; o.furrowMat = furrowMat; o.markMat = markMat;
}
export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  const go = st => { o.st = st; o.tm = 0; };
  o.tm += dt;
  switch (o.st){
    case 'idle':
      if (Math.abs(d) < T.wake){ o.side = Math.sign(d) || 1; o.sm = o.s + o.side * T.lead; o.hp = T.hp; go('travel'); sfx.rumble(); }
      break;
    case 'travel':
      o.sm -= o.side * T.plough * dt;
      if ((o.sm - o.s) * o.side <= 0){ o.sm = o.s; go('rise'); sfx.crack(); burst(vArc(o.s * OMEGA, R, o.top + 0.2), 18, o.dustC, 3.5, 9, 0.1); }
      break;
    case 'rise': if (o.tm >= T.rise) go('up'); break;
    case 'snap': if (o.tm >= T.snapShut) go('up'); break;
    case 'sink': if (o.tm > 0.7) go('gone'); break;
  }
  if (o.st === 'up' && G.grounded && Math.abs(G.s - o.s) < 0.45 && !isInvulnerable(G)){ go('snap'); sfx.snap(); hurt(1, 'Snapped', o.s); }
  else if ((o.st === 'up' || o.st === 'rise') && !G.grounded && Math.abs(G.s - o.s) < 0.5 && !o.leapt){ o.leapt = true; float('Leapt', head(), '#c9f5d9'); }
  // once he is well past it, it sinks back
  if ((o.st === 'up' || o.st === 'snap') && (G.s - o.s) * o.side > 2.6){ go('sink'); o.done = true; }
}
export const hittable = o => o.st === 'up' || o.st === 'snap' || o.st === 'rise';
export function hit(o, dmg){
  const G = ST.G;
  o.hp -= dmg; o.flash = 0.12; sfx.hit(); hitstop(TUNE.feel.hitstopHit);
  burst(vArc(o.s * OMEGA, R, o.top + 0.8), 12, '#ffd9a8', 3.5);
  if (o.hp <= 0){ o.st = 'sink'; o.tm = 0; o.done = true; o.killed = true; G.gold += GOLD.burrower; float('+' + GOLD.burrower, head(), '#e8b04a'); sfx.gold(); hitstop(TUNE.feel.hitstopKill); }
}
export function draw(o){
  const t = ST.time;
  o.mound.visible = o.st === 'travel';
  o.markMat.opacity = o.st === 'travel' ? 0.45 + 0.4 * Math.sin(t * 14) : o.st === 'rise' || o.st === 'up' ? 0.75 : 0;
  // the furrow: from where it surfaced to the mound
  const start = o.side ? o.s + o.side * T.lead : 0, span = o.st === 'travel' ? Math.abs(start - o.sm) : 0;
  o.furrowMat.opacity = o.st === 'travel' ? 0.55 : Math.max(0, o.furrowMat.opacity - 0.02);
  o.furrow.forEach((m, j) => { const s = o.sm + o.side * (j + 0.5) / o.furrow.length * span; m.visible = span > 0.1; if (m.visible){ m.position.copy(vArc(s * OMEGA, R, topAt(s) + 0.02)); m.rotation.z = -s * OMEGA; } });
  if (o.st === 'travel'){
    const a = o.sm * OMEGA;
    placeArc(o.mound, a, R, topAt(o.sm) + Math.abs(Math.sin(t * 22)) * 0.06, o.side > 0);
    if (Math.random() < 0.45) burst(vArc(a, R + (Math.random() - 0.5) * 1.4, topAt(o.sm) + 0.25), 1, o.dustC, 1.6, 7, 0.09);
  }
  o.jaws.visible = o.st === 'rise' || o.st === 'up' || o.st === 'snap' || o.st === 'sink';
  if (!o.jaws.visible) return;
  // rises with the teeth splayed, waits breathing, snaps shut and lunges, sinks when dead or left behind
  let up = 0, open = 1;
  if (o.st === 'rise') up = clamp(o.tm / T.rise, 0, 1) * 0.75;
  else if (o.st === 'up'){ up = 0.75 + Math.sin(t * 4) * 0.04; open = 0.85 + Math.sin(t * 6) * 0.15; }
  else if (o.st === 'snap'){ const q = o.tm / T.snapShut; up = 0.75 + Math.sin(Math.PI * q) * 0.45; open = q < 0.25 ? 0 : (q - 0.25) / 0.75; }
  else { up = 0.75 - clamp(o.tm / 0.6, 0, 1) * 1.7; open = 0.3; }
  o.rise.position.y = -0.9 + up;
  for (const th of o.teeth){ const tilt = 0.15 + 0.55 * open; th.tj.rotation.set(Math.sin(th.ang) * tilt, 0, -Math.cos(th.ang) * tilt); }
}
export function hud(o, d, { drawIcon }){
  if ((o.st === 'travel' || o.st === 'rise' || o.st === 'up') && Math.abs(d) <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 0.4, o.top + 1.2), '{jump}', '#e8b04a');
}
