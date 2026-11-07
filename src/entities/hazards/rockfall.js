// Rockfall. Grit trickles from the dark and a shadow grows on a step; the boulder drops when you would arrive under it.
// Answer: hold B, shield overhead (raise it as it lands to shatter it for gold); or stop short and let it fall; or roll
// through it.
// States: idle -> warn -> drop -> done
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { GOLD } from '../../config/economy.js';
import { ST } from '../../core/state.js';
import { clamp, rng } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { placeArc, vArc } from '../../render/primitives.js';
import { rock, rockMaterial } from '../../render/rocks.js';
import { burst, mote } from '../../render/particles.js';
import { float, hitstop } from '../../fx/feedback.js';
import { topAt } from '../../world/path.js';
import { hurt, head, isBlocking, isParry, isRollInvulnerable } from '../player/player.js';
import { prop } from '../../render/props.js';
import { addGold, onParry } from '../../run/run.js';
const THREE = window.THREE;
const T = TUNE.rockfall;

export const hint = 'Rocks fall where the shadow grows. Hold {block} to raise your shield under it, or stop and let it fall.';

export function build(o, { z, dyn }){
  const a = o.s * OMEGA, top = topAt(o.s), r = rng(o.k * 613 + 3);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 18), shadowMat); shadow.rotation.x = -Math.PI / 2;
  shadow.position.copy(vArc(a, R, top + 0.03)); dyn.add(shadow);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xe8b04a, transparent: true, opacity: 0, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.92, 24), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.copy(vArc(a, R, top + 0.04)); dyn.add(ring);
  const mat = rockMaterial(new THREE.Color(z.wall).multiplyScalar(0.75).getHex());
  const boulder = rock(mat, { w: 1.15, h: 1.0, d: 1.1, jag: 0.32 }, 0, 0, 0, r); boulder.visible = false; dyn.add(boulder);
  // what is left on the step when it misses you
  const rubble = new THREE.Group();
  for (let j = 0; j < 4; j++) rubble.add(rock(mat, { w: 0.4, h: 0.3, d: 0.4, jag: 0.4 }, (r() - 0.5) * 0.9, 0.12, (r() - 0.5) * 1.4, r));
  placeArc(rubble, a, R, top); rubble.visible = false; dyn.add(rubble);
  o.shadow = shadow; o.shadowMat = shadowMat; o.ring = ring; o.ringMat = ringMat; o.boulder = boulder; o.rubble = rubble; o.top = top; o.a = a; o.color = '#' + mat.color.getHexString();
}
export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  if (o.st === 'idle' && Math.abs(d) < T.warn){ o.st = 'warn'; sfx.rumble(); }
  if (o.st === 'warn'){
    if (Math.abs(d) < 2.8) G.blockHigh = true;
    // drop when he would be under it as it lands
    const toward = Math.abs(G.v) > 0.2 && Math.sign(d) === Math.sign(G.v);
    const arrive = toward ? Math.abs(d) / Math.abs(G.v) : 99;
    if (arrive <= T.fall + 0.03 || Math.abs(d) < 0.5){ o.st = 'drop'; o.tm = 0; sfx.whoosh(); }
  } else if (o.st === 'drop'){
    o.tm += dt; if (Math.abs(d) < 2.5) G.blockHigh = true;
    if (o.tm >= T.fall){
      o.st = 'done'; o.done = true;
      const under = Math.abs(G.s - o.s) < T.hitRange && G.y < o.top + 3.2;
      if (under && isRollInvulnerable(G)){ float('Rolled', head(), '#c9f5d9'); o.rubble.visible = true; sfx.slam(); }
      else if (under && isBlocking(G)){
        burst(head(1.6), 26, o.color, 4.5, 9, 0.12); ST.shake = Math.max(ST.shake, 0.25); hitstop(0.06);
        if (isParry(G)){ onParry(G, head(1.6)); const gg = addGold(GOLD.rockfallParry); float('Shattered +' + gg, head(), '#e8b04a'); sfx.parry(); }
        else { float('Blocked', head(), '#c9d2e0'); sfx.block(); }
      } else if (under){
        hurt(1, 'Crushed', o.s); o.rubble.visible = true;
      } else {
        sfx.slam(); ST.shake = Math.max(ST.shake, 0.15); o.rubble.visible = true;
        burst(vArc(o.a, R, o.top + 0.3), 18, o.color, 3, 9, 0.1);
      }
    }
  }
}
export function draw(o){
  const G = ST.G, d = G ? o.s - G.s : 99;
  if (o.st === 'warn'){
    const q = clamp((T.warn - d) / T.warn, 0, 1);
    o.shadowMat.opacity = 0.25 + 0.35 * q; o.shadow.scale.setScalar(0.5 + 0.3 * q);
    o.ringMat.opacity = (0.3 + 0.5 * q) * (0.7 + 0.3 * Math.sin(ST.time * 16)); o.ring.scale.setScalar(0.5 + 0.3 * q);
    if (Math.random() < 0.5){ const rr = R + (Math.random() - 0.5) * 1.2, a = o.a + (Math.random() - 0.5) * 0.08; mote(rr * Math.cos(a), o.top + 7, rr * Math.sin(a), 0x7a7088); }
  } else if (o.st === 'drop'){
    if (!o.dressed){ const b = prop('Boulder' + (o.k % 3)); if (b){ for (const c of o.boulder.children) c.visible = false; if (o.boulder.isMesh) o.boulder.material = o.boulder.material.clone(), o.boulder.material.visible = false; o.boulder.add(b); b.scale.setScalar(1.1); } o.dressed = true; }
    const u = clamp(o.tm / T.fall, 0, 1);
    o.shadowMat.opacity = 0.6 + 0.3 * u; o.shadow.scale.setScalar(0.8 + 0.35 * u);
    o.ringMat.opacity = 0.85; o.ring.scale.setScalar(0.8 + 0.35 * u);
    o.boulder.visible = true;
    o.boulder.position.copy(vArc(o.a, R, o.top + T.height - (T.height - 0.6) * u * u));
    o.boulder.rotation.x += 0.15; o.boulder.rotation.z += 0.09;
  } else if (o.st === 'done'){
    o.boulder.visible = false; o.shadowMat.opacity = Math.max(0, o.shadowMat.opacity - 0.03); o.ringMat.opacity = 0;
  }
}
export function hud(o, d, { drawIcon, drawTiming }){
  if (o.done) return;
  if (o.st === 'drop') drawTiming('{block}', o.tm, T.fall);
  else if (Math.abs(d) <= TUNE.climb.iconRange && o.st !== 'idle') drawIcon(vArc(o.a, R - 0.4, o.top + 2.8), '{block}', '#9fd0ff');
}
