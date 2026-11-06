// The Warden of the Deep's moveset. Every zone currently reuses it with faster timing.
// A moveset lists attacks; each has a tell, the answer, and the damage. Phase-2 behaviour is shared in warden.js.
// To give a zone its own Warden, write a new moveset here and point ZONES[z].warden at it.
import { TUNE } from '../../config/tuning.js';
const W = TUNE.warden;

export const attacks = {
  slam:  { answer: 'jump', prompt: '{jump}', damage: W.slamDamage,  hitText: 'Crushed' }, // both arms rise, shockwave rolls along the floor
  sweep: { answer: 'duck', prompt: '{down}', damage: W.sweepDamage, hitText: 'Swept' },   // one arm pulls back, red band at head height
  spit:  { answer: 'block', prompt: 'B', damage: W.spitDamage, hitText: 'Burned' },  // mouth glows, aim line to the warrior
};
export const order = ['slam', 'sweep', 'spit'];
export const pick = () => order[(Math.random() * order.length) | 0];
