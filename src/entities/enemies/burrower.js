// Burrower: something under the stair. A mound of rubble ploughs down the steps toward you, spitting dust; where it
// stops a ring of teeth breaks the surface, and the jaws snap shut as you cross. Answer: ▲ jump.
// The mound's position follows yours, so it always arrives as you do, however fast you are climbing.
// States: idle -> travel -> rise -> snap -> gone
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
import { hurt, head } from '../player/player.js';
const THREE = window.THREE;
const T = TUNE.burrower;

export const hint = 'A burrower is ploughing toward you under the stair. Tap ▲ to jump its jaws.';

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
  if (o.st === 'idle' && d < T.wake){ o.st = 'travel'; sfx.rumble(); }
  if (o.st === 'travel'){
    o.sm = o.s + T.lead * clamp((d - T.jaws) / (T.wake - T.jaws), 0, 1);
    if (d <= T.jaws){ o.st = 'rise'; o.tm = 0; sfx.crack(); burst(vArc(o.s * OMEGA, R, o.top + 0.2), 18, o.dustC, 3.5, 9, 0.1); }
  }
  if (o.st === 'rise') o.tm += dt;
  if ((o.st === 'rise' || o.st === 'travel') && G.prevS < o.s && G.s >= o.s){
    o.st = 'snap'; o.tm = 0; o.done = true; sfx.snap();
    if (G.jump <= 0) hurt(1, 'Snapped'); else float('Leapt', head(), '#c9f5d9');
  }
  if (o.st === 'snap'){ o.tm += dt; if (o.tm > T.linger) o.st = 'gone'; }
}
export function draw(o){
  const t = ST.time;
  o.mound.visible = o.st === 'travel';
  o.markMat.opacity = o.st === 'travel' ? 0.45 + 0.4 * Math.sin(t * 14) : o.st === 'rise' ? 0.9 : 0;
  // the furrow: from where it surfaced down to the mound
  const span = o.sm != null ? o.s + T.lead - o.sm : 0;
  o.furrowMat.opacity = o.st === 'travel' ? 0.55 : o.st === 'rise' || o.st === 'snap' ? Math.max(0, o.furrowMat.opacity - 0.02) : 0;
  o.furrow.forEach((m, j) => { const s = o.sm + (j + 0.5) / o.furrow.length * span; m.visible = span > 0.1 && o.furrowMat.opacity > 0; if (m.visible){ m.position.copy(vArc(s * OMEGA, R, topAt(s) + 0.02)); m.rotation.z = -s * OMEGA; } });
  if (o.st === 'travel'){
    const a = o.sm * OMEGA;
    placeArc(o.mound, a, R, topAt(o.sm) + Math.abs(Math.sin(t * 22)) * 0.06, true);
    if (Math.random() < 0.45) burst(vArc(a, R + (Math.random() - 0.5) * 1.4, topAt(o.sm) + 0.25), 1, o.dustC, 1.6, 7, 0.09);
  }
  o.jaws.visible = o.st === 'rise' || o.st === 'snap';
  if (!o.jaws.visible) return;
  // rises with the teeth splayed; snaps them shut and lunges; then sinks back
  let up = 0, open = 0;
  if (o.st === 'rise'){ up = clamp(o.tm / 0.25, 0, 1) * 0.75; open = 1; }
  else { const q = o.tm / T.linger; up = o.tm < 0.12 ? 0.75 + o.tm * 4 : Math.max(-0.9, 1.2 - (q - 0.17) * 3.2); open = Math.max(0, 1 - o.tm * 9); }
  o.rise.position.y = -0.9 + up;
  for (const th of o.teeth){ const tilt = 0.15 + 0.55 * open; th.tj.rotation.set(Math.sin(th.ang) * tilt, 0, -Math.cos(th.ang) * tilt); }
}
export function hud(o, d, { drawIcon }){
  if (!o.done && (o.st === 'travel' || o.st === 'rise') && d > 0 && d <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 0.4, o.top + 0.9), '▲', '#e8b04a');
}
