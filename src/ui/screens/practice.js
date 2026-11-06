// Practice: pick one threat from the catalog and climb nine flights of only that, to learn its tell and its answer.
// Nothing a practice run does is saved: no best height, no falls, no gold, no lifts.
import { CATALOG, catalogById } from '../../entities/catalog.js';
import { ST } from '../../core/state.js';
import { setToast } from '../../fx/feedback.js';
import { startClimb } from '../../modes/climb.js';
import { showMenu, hideMenu, registerActions, updatePips } from '../overlay.js';
import { say } from '../../core/prompts.js';

export function practiceMenu(msg){
  ST.mode = 'menu'; ST.practice = null;
  const row = t => `<button class="choice threat" data-act="practice-go" data-id="${t.id}">
      <span class="key" aria-hidden="true">${say(t.answer)}</span>
      <span class="what"><b>${t.name}</b><small>${t.tell}</small></span>
      <span class="verb">${t.verb}</span></button>`;
  const list = kind => CATALOG.filter(t => t.kind === kind).map(row).join('');
  showMenu(`<div class="card wide">
    <h2>Practice</h2>
    <p class="sub">Pick a threat and climb nine flights of only that. Nothing here is saved.</p>
    ${msg ? `<p class="bad">${msg}</p>` : ''}
    <div class="grp">Hazards</div>
    ${list('hazard')}
    <div class="grp">Creatures</div>
    ${list('enemy')}
    <button class="choice go" data-act="practice-back">Back</button>
  </div>`);
}
export function practiceDone(){
  const t = catalogById(ST.practice), id = ST.practice;
  ST.mode = 'menu';
  showMenu(`<div class="card">
    <h2>${t.name}</h2>
    <p class="sub">Nine flights cleared.</p>
    <button class="choice go" data-act="practice-go" data-id="${id}">Again</button>
    <button class="choice" data-act="practice-menu">Choose another</button>
    <button class="choice" data-act="practice-back">Back to the title</button>
  </div>`);
}
registerActions({
  'practice-menu'(){ practiceMenu(); },
  'practice-go'(b){
    const t = catalogById(b.dataset.id);
    hideMenu(); ST.practice = t.id;
    startClimb(0);
    setToast('Practice: ' + t.name, t.verb + ' · ' + t.answer, 2.4);
    updatePips();
  },
  'practice-back'(){ ST.practice = null; import('./title.js').then(m => m.titleMenu()); },
});
