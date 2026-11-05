// Swinging weight: an iron-banded boulder on a chain, held cocked back up the stair by a rope to the wall.
// The rope snaps as you come near, timed so the first pass reaches the bottom of its arc, at head height, as you
// arrive. After that it keeps swinging. Answer: hold ▼ to crouch under it, roll under it, or time your run.
// States: idle (held) -> swing
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { rng } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, vArc } from '../../render/primitives.js';
import { rock, rockMaterial } from '../../render/rocks.js';
import { flatMat } from '../../render/creature.js';
import { float } from '../../fx/feedback.js';
import { topAt, posOf } from '../../world/path.js';
import { hurt, head, isLow, crownY } from '../player/player.js';
const THREE = window.THREE;
const T = TUNE.swing;

export const hint = 'A swinging weight. Crouch under it with ▼, roll under it, or time your run past it.';

const _a = new THREE.Vector3(), _b = new THREE.Vector3();
function stretch(mesh, from, to){ mesh.position.lerpVectors(from, to, 0.5); mesh.lookAt(to); mesh.scale.z = from.distanceTo(to); }

export function build(o, { z, dyn }){
  const r = rng(o.k * 211 + 5), top = topAt(o.s);
  const mat = rockMaterial(new THREE.Color(z.stone).multiplyScalar(0.8).getHex()), iron = flatMat(0x2c2a30, { rough: 0.8, metal: 0.25 });
  const weight = new THREE.Group();
  weight.add(rock(mat, { w: 1.0, h: 1.05, d: 1.0, jag: 0.25 }, 0, 0, 0, r));
  weight.add(mbox(1.12, 0.14, 1.12, iron, 0, 0.18, 0), mbox(1.12, 0.14, 1.12, iron, 0, -0.22, 0), mbox(0.2, 0.3, 0.2, iron, 0, 0.6, 0));
  dyn.add(weight);
  const chain = mbox(0.09, 0.09, 1, iron); dyn.add(chain);                                   // pivot to weight
  const upper = mbox(0.09, 0.09, 1, iron); dyn.add(upper);                                   // pivot up into the dark
  const rope = mbox(0.05, 0.05, 1, flatMat(0x8a7a5a)); dyn.add(rope);                         // holds it cocked
  // the bottom of the arc clears a crouch on the step above, not a standing head
  o.pivotY = top + 2.6 + T.length; o.weight = weight; o.chain = chain; o.upper = upper; o.rope = rope;
  o.theta = T.angle; o.top = top;
  place(o);
  stretch(upper, vArc(o.s * OMEGA, R, o.pivotY), vArc(o.s * OMEGA, R, o.pivotY + 16));
}
// Weight position from the swing angle: along the stair (positive is up the stair) and down from the pivot.
function weightAt(o){ return { s: o.s + T.length * Math.sin(o.theta), y: o.pivotY - T.length * Math.cos(o.theta) }; }
function place(o){
  const w = weightAt(o), wa = w.s * OMEGA;
  o.weight.position.copy(vArc(wa, R, w.y)); o.weight.rotation.set(0, -wa, o.theta * 0.8);
  stretch(o.chain, vArc(o.s * OMEGA, R, o.pivotY, _a), vArc(wa, R, w.y + 0.65, _b));
  if (o.rope.visible) stretch(o.rope, vArc(wa, R + 0.3, w.y + 0.3, _a), vArc(wa + 0.03, R + 1.75, w.y + 0.8, _b));
}
export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  if (o.st === 'idle'){
    o.theta = T.angle + Math.sin(ST.time * 1.3 + o.s) * 0.015;
    const toward = Math.abs(G.v) > 0.2 && Math.sign(d) === Math.sign(G.v);
    const arrive = toward ? Math.abs(d) / Math.abs(G.v) : 99;
    if (arrive <= T.period / 4 + 0.03 || Math.abs(d) < 1.0){ o.st = 'swing'; o.tm = 0; o.rope.visible = false; sfx.snap(); }
    return;
  }
  o.tm += dt;
  // the first pass is the big one; then it settles to a steady, smaller arc you can learn
  const ph = 2 * Math.PI * o.tm / T.period, amp = T.settle + (T.angle - T.settle) * Math.exp(-0.6 * o.tm);
  o.theta = amp * Math.cos(ph);
  const moving = -Math.sin(ph) >= 0 ? 1 : -1;                 // which way along the stair the weight is going
  if (Math.abs(o.theta) < 0.25 && !o.swished){ o.swished = true; sfx.whoosh(); }
  if (Math.abs(o.theta) > 0.5) o.swished = false;
  const w = weightAt(o);
  if (Math.abs(w.s - G.s) < 0.6 && w.y - 0.5 < crownY(G) && w.y + 0.5 > G.y + 0.3) hurt(1, 'Clubbed', w.s - moving);
  else if (Math.abs(w.s - G.s) < 0.6 && isLow(G) && w.y < G.y + 2.7 && !o.ducked){ o.ducked = true; float('Under', head(), '#c9f5d9'); }
  if (!o.done && G.s > o.s + 2) o.done = true;
}
export function draw(o){ place(o); }
export function hud(o, d, { drawIcon, drawTiming }){
  if (o.done) return;
  if (o.st === 'swing' && o.tm < T.period / 4) drawTiming('▼', o.tm, T.period / 4);
  else if (Math.abs(d) <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 1.2, o.top + 2.6), '▼', '#e8b04a');
}
