// Fallen beam across the stair at head height: duck or take a hit.
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { lam, mbox, placeArc, vArc } from '../../render/primitives.js';
import { topAt } from '../../world/path.js';
import { hurt } from '../player/player.js';
const THREE = window.THREE;

export function build(o, { dyn }){
  const a = o.s * OMEGA, top = topAt(o.s);
  const mat = new THREE.MeshLambertMaterial({ color: 0x7a5636, emissive: 0x000000 });
  const m = mbox(0.36, 0.36, 3.3, mat); placeArc(m, a, R, top + 1.85); dyn.add(m);
  const n1 = mbox(0.36, 0.08, 0.08, lam(0xc9b48f)); n1.position.set(0, 0.1, 1.1); m.add(n1);
  const n2 = n1.clone(); n2.position.z = -1.1; m.add(n2);
  o.m = m; o.mat = mat;
}
export function update(o){
  const G = ST.G;
  if (!o.done && G.prevS < o.s && G.s >= o.s){ o.done = true; if (G.duck <= 0) hurt(1, 'Smack'); }
}
export function draw(o){
  const G = ST.G, near = G && !o.done && o.s > G.s && o.s - G.s < 3;
  o.mat.emissive.setHex(near && Math.sin(ST.time * 14) > 0 ? 0x553311 : 0x000000);
}
export function hud(o, d, { drawIcon }){
  if (!o.done && d > 0 && d <= TUNE.climb.iconRange) drawIcon(vArc(o.s * OMEGA, R - 1.2, topAt(o.s) + 2.6), '▼', '#e8b04a');
}
