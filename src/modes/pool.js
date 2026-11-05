// After a splash: a moment in the water, then the Pool menu.
import { ST } from '../core/state.js';
import { poolMenu } from '../ui/screens/pool.js';
import { practiceMenu } from '../ui/screens/practice.js';
export function update(dt){
  ST.poolT += dt;
  if (ST.poolT > 1.4){ ST.G.s = 0; ST.G.prevS = 0; if (ST.practice){ ST.practice = null; ST.lastFall = null; practiceMenu('You fell. Try it again.'); } else poolMenu(); }
}
