// The Pool: wake, pick a weapon off the floor, start from the bottom or ride a repaired lift.
import { WEAPONS, OFFERED, usable } from '../../config/weapons.js';
import { S, save } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { sfx } from '../../audio/sfx.js';
import { setToast } from '../../fx/feedback.js';
import { posOf, landingS, landingY, meters, zoneOf } from '../../world/path.js';
import { setWeapon } from '../../entities/player/player.js';
import { startClimb } from '../../modes/climb.js';
import { showMenu, hideMenu, registerActions, overlayData, updatePips } from '../overlay.js';
import { MARKS, UPGRADES, OATHS, RUNES } from '../../config/run.js';
import { buyBlueprint, blueprintCost, buyUpgrade, upgradeCost } from '../../run/run.js';

// What the last climb came to: how high, what it found, what the fall cost.
export function poolMenu(){
  ST.mode = 'menu';
  let msg = '';
  const lf = ST.lastFall;
  if (lf){
    const sworn = Object.entries(lf.oaths || {}).filter(([, n]) => n).map(([id, n]) => `<span style="color:${OATHS[id].color}">${OATHS[id].name} ${n}</span>`).join(' ');
    msg += `<p>You climbed to <b>${lf.peak || lf.h} m</b> and fell ${lf.h} m.${lf.kills ? ` ${lf.kills} things ended.` : ''}${sworn ? ` Sworn: ${sworn}.` : ''}</p>`;
    const losses = [lf.lost ? `${lf.lost} gold scattered` : '', lf.lostWell ? `<span class="well">${lf.lostWell} wellstone</span> you carried is gone` : ''].filter(Boolean).join(', ');
    if (losses) msg += `<p class="bad">On the way down: ${losses}.</p>`;
    if (lf.banked) msg += `<p><span class="well">${lf.banked} wellstone</span> you sent down is waiting.</p>`;
    if (lf.found && lf.found.length) msg += `<p>Blueprints found: ${lf.found.map(id => MARKS[id].name).join(', ')}.</p>`;
  }
  if (S.stash){ msg += `<p class="gold">${S.stash} gold waited here from the pouch you threw.</p>`; S.gold += S.stash; S.stash = 0; save(); }
  ST.lastFall = null;
  render(msg);
}
// Fetch, here too: blueprints found and not yet bought, and the Pool's own upgrades, all for banked wellstone.
function fetchHtml(){
  const bps = S.found.filter(id => !S.unlocked.includes(id)).map(id => { const c = blueprintCost(id);
    return `<button class="choice" data-act="bp" data-id="${id}" ${S.well < c ? 'disabled' : ''}><span>${MARKS[id].name}<small>${MARKS[id].desc}. Fetch will offer it at rest stops</small></span><span class="cost well">${c}</span></button>`; }).join('');
  const ups = Object.keys(UPGRADES).map(id => { const U = UPGRADES[id], t = S.upgrades[id] || 0, c = upgradeCost(id);
    return c == null ? `<p class="note">${U.name}: all ${U.costs.length} bought.</p>`
      : `<button class="choice" data-act="up" data-id="${id}" ${S.well < c ? 'disabled' : ''}><span>${U.name}${t ? ` ${t + 1}` : ''}<small>${U.desc}</small></span><span class="cost well">${c}</span></button>`; }).join('');
  const runes = S.runes.map(id => RUNES[id].name).join(', ');
  return `<div class="grp">Fetch · <span class="well">${S.well} wellstone</span></div>
    ${bps || (S.found.length ? '' : '<p class="note">No blueprints yet. They turn up on the climb: in hidden halls, and now and then where something dies.</p>')}
    ${ups}
    ${runes ? `<p class="note">Kept for good: ${runes}.</p>` : ''}`;
}
function render(msg){
  const weps = OFFERED.length < 2 ? '' : OFFERED.map(id => {
    const w = WEAPONS[id];
    return `<button class="choice ${usable(S.weapon) === id ? 'sel' : ''}" data-act="wep" data-id="${id}">${w.name}<small>${w.desc}</small></button>`;
  }).join('');
  const lifts = [];
  for (const k of S.lifts) lifts.push({ k, y: landingY(k), label: 'Ride the lift' });
  for (const k of S.bosses) lifts.push({ k, y: landingY(k), label: 'Ride past the Warden' });
  lifts.sort((a, b) => a.y - b.y);
  const liftBtns = lifts.map(l => `<button class="choice" data-act="start" data-k="${l.k}"><span>${l.label}<small>Quicker, but it skips the oath stones, the wellstone and the finds below</small></span><span class="cost">${meters(l.y)} m</span></button>`).join('');
  showMenu(`<div class="card">
    <h2 class="pool">The Pool</h2>
    <p class="sub">It will not let you die. Your flask is full again.</p>
    ${msg || ''}
    <p class="note"><span class="gold">${S.gold} gold</span> · Best ${S.best} m · Falls ${S.falls}</p>
    ${fetchHtml()}
    ${weps ? `<div class="grp">Weapons on the floor</div>
    <div class="weps">${weps}</div>` : ''}
    <div class="grp">Start</div>
    <button class="choice go" data-act="start" data-k="-1">Climb from the bottom</button>
    ${liftBtns}
  </div>`);
  overlayData.msg = msg || '';
}
registerActions({
  bp(b){ if (buyBlueprint(b.dataset.id)) sfx.repair(); render(overlayData.msg); },
  up(b){ if (buyUpgrade(b.dataset.id)) sfx.repair(); render(overlayData.msg); },
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
