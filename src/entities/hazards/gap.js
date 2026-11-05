// Broken step: jump it or stumble. The step itself is removed from the instanced stair by generate.js.
import { FL, FH, RISE, R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { lam, mbox, placeArc, vArc } from '../../render/primitives.js';
import { topAt } from '../../world/path.js';
import { hurt } from '../player/player.js';
const THREE = window.THREE;

export function build(o, { c, z, dyn }){
  const i = Math.floor(o.s - c.k * FL), sa = (c.k * FL + i + 0.5) * OMEGA, st = c.k * FH + (i + 1) * RISE;
  const r1 = mbox(0.3, 0.5, 0.8, lam(new THREE.Color(z.stone).multiplyScalar(0.7).getHex())); placeArc(r1, sa - 0.03, R + 0.7, st - 1.15); dyn.add(r1);
  const r2 = mbox(0.25, 0.4, 0.6, lam(new THREE.Color(z.stone).multiplyScalar(0.6).getHex())); placeArc(r2, sa + 0.04, R - 0.6, st - 1.2); dyn.add(r2);
  const warn = mbox(1.1, 0.04, 2.6, new THREE.MeshBasicMaterial({ color: 0xffdc8c, transparent: true, opacity: 0 })); placeArc(warn, sa, R, st - RISE + 0.02); dyn.add(warn);
  o.warn = warn;
}
export function update(o){
  const G = ST.G;
  if (!o.done && G.prevS < o.s && G.s >= o.s){
    o.done = true;
    if (G.jump <= 0){ G.stumble = TUNE.player.stumble; hurt(1, 'Stumbled'); }
  }
}
export function draw(o){
  const G = ST.G, near = G && !o.done && o.s > G.s && o.s - G.s < 3;
  o.warn.material.opacity = near ? 0.35 + 0.35 * Math.sin(ST.time * 14) : 0;
}
export function hud(o, d, { drawIcon }){
  if (!o.done && d > 0 && d <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 0.4, topAt(o.s) + 0.7), '▲', '#e8b04a');
}
