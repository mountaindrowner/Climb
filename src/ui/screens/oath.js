// An oath stone's choice: swear one of the two oaths cut into it, for the rest of this climb, or walk past.
import { OATHS } from '../../config/run.js';
import { ST } from '../../core/state.js';
import { oath, swear } from '../../run/run.js';
import { S, save } from '../../save/store.js';
import { showMenu, hideMenu, registerActions } from '../overlay.js';

let cur = null;
export function openOath(st){
  cur = st; ST.mode = 'menu';
  const first = !S.seen.includes('oath');
  const btn = id => { const O = OATHS[id], n = oath(id);
    return `<button class="choice" data-act="swear" data-id="${id}"><span><b style="color:${O.color}">The ${O.name}</b> <i>${O.line}</i><small>${O.desc}${n ? ` · sworn ${n} time${n > 1 ? 's' : ''} this climb` : ''}</small></span></button>`; };
  showMenu(`<div class="card">
    <h2>An oath stone</h2>
    <p class="sub">Two lines of the Lanternbearer's oath are cut into it.${first ? ' Swear one and it holds for the rest of this climb: the more you swear, the stronger it grows. A fall undoes them all.' : ''}</p>
    ${st.offer.map(btn).join('')}
    <button class="choice go" data-act="resume">Walk past</button>
  </div>`);
}
registerActions({
  swear(b){
    const id = b.dataset.id; swear(id);
    if (cur){ cur.sworn = id; cur.usedAt = ST.time; }
    if (!S.seen.includes('oath')){ S.seen.push('oath'); save(); }
    hideMenu(); ST.mode = 'climb';
  },
});
