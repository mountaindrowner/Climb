// The Pool: wake, pick a weapon off the floor, start from the bottom or ride a repaired lift.
import { WEAPONS } from '../../config/weapons.js';
import { S, save } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { setToast } from '../../fx/feedback.js';
import { posOf, landingS, landingY, meters, zoneOf } from '../../world/path.js';
import { setWeapon } from '../../entities/player/player.js';
import { startClimb } from '../../modes/climb.js';
import { showMenu, hideMenu, registerActions, overlayData, updatePips } from '../overlay.js';

export function poolMenu(){
  ST.mode = 'menu';
  let msg = '';
  const lf = ST.lastFall;
  if (lf) msg += `<p>You fell ${lf.h} m.${lf.lost ? ` <span class="bad">${lf.lost} gold scattered on the way down.</span>` : ''}</p>`;
  if (S.stash){ msg += `<p class="gold">${S.stash} gold waited here from the pouch you threw.</p>`; S.gold += S.stash; S.stash = 0; save(); }
  ST.lastFall = null;
  render(msg);
}
function render(msg){
  const weps = Object.keys(WEAPONS).map(id => {
    const w = WEAPONS[id];
    return `<button class="choice ${S.weapon === id ? 'sel' : ''}" data-act="wep" data-id="${id}">${w.name}<small>${w.desc}</small></button>`;
  }).join('');
  const lifts = [];
  for (const k of S.lifts) lifts.push({ k, y: landingY(k), label: 'Ride the lift' });
  for (const k of S.bosses) lifts.push({ k, y: landingY(k), label: 'Ride past the Warden' });
  lifts.sort((a, b) => a.y - b.y);
  const liftBtns = lifts.map(l => `<button class="choice" data-act="start" data-k="${l.k}"><span>${l.label}</span><span class="cost">${meters(l.y)} m</span></button>`).join('');
  showMenu(`<div class="card">
    <h2 class="pool">The Pool</h2>
    <p class="sub">It will not let you die. Your flask is full again.</p>
    ${msg || ''}
    <p class="note"><span class="gold">${S.gold} gold</span> · Best ${S.best} m · Falls ${S.falls}</p>
    <div class="grp">Weapons on the floor</div>
    <div class="weps">${weps}</div>
    <div class="grp">Start</div>
    <button class="choice go" data-act="start" data-k="-1">Climb from the bottom</button>
    ${liftBtns}
  </div>`);
  overlayData.msg = msg || '';
}
registerActions({
  wep(b){ setWeapon(b.dataset.id); render(overlayData.msg); const again = document.querySelector(`#overlay [data-act="wep"][data-id="${b.dataset.id}"]`); if (again) again.focus(); },   // stay where you were
  start(b){
    const k = +b.dataset.k;
    hideMenu();
    startClimb(k < 0 ? 0 : landingS(k) + 0.01);
    if (k >= 0){ ST.G.thudId = 'L' + k; ST.G.zoneShown = zoneOf(k); setToast('The lift groans upward', meters(posOf(ST.G.s).y) + ' m', 2); }
    updatePips();
  },
  resume(){ hideMenu(); ST.mode = 'climb'; },
});
