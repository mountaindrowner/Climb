// Overlay menus: title, the Pool, the rest stop, and the Warden-defeated card.
import { FH } from '../config/constants.js';
import { WEAPONS } from '../config/weapons.js';
import { CAMP, burstChance } from '../config/economy.js';
import { S, save, resetSave } from '../core/save.js';
import { ST } from '../core/state.js';
import { sfx, ac } from '../audio/sfx.js';
import { setToast } from '../fx/feedback.js';
import { posOf, landingS, meters, zoneOf } from '../world/path.js';
import { setAllFlights } from '../world/stair.js';
import { setWeapon } from '../entities/player/player.js';
import { startClimb } from '../modes/climb.js';

const overlay = document.getElementById('overlay');
const pipsEl = document.getElementById('pips');

export function updatePips(){ const G = ST.G; pipsEl.textContent = G ? '●'.repeat(G.flask) + '○'.repeat(Math.max(0, G.flaskMax - G.flask)) : '●●●'; }
export function showMenu(html){
  overlay.innerHTML = html; overlay.classList.add('show');
  const b = overlay.querySelector('.choice.go, .choice'); if (b) b.focus({ preventScroll: true });
}
export function hideMenu(){ overlay.classList.remove('show'); overlay.innerHTML = ''; }
export const menuOpen = () => overlay.classList.contains('show');

export function titleMenu(){
  ST.mode = 'title';
  showMenu(`<div class="card">
    <h1>The Climb</h1>
    <p class="sub">Fight your way up the spiral of an impossibly deep mine.</p>
    <button class="choice go" data-act="pool">Wake in the Pool</button>
    <div class="how">
      <b>You climb on your own.</b> The camera circles with you. Every heavy step is a beat.<br>
      <b>▲</b> jump gaps, repair lifts, grab roots while falling<br>
      <b>▼</b> duck beams and sweeps<br>
      <b>A</b> attack · <b>B</b> block, tap it right as a hit lands to parry<br>
      <b>Flask</b> heals. Only the Pool refills it.<br>
      Fall and you drop all the way down. Repaired lifts stay repaired.
    </div>
    ${S.best ? `<p class="note">Best height ${S.best} m · Falls ${S.falls}</p>` : ''}
    <button class="link" data-act="reset">Reset progress</button>
  </div>`);
}
export function poolMenu(){
  ST.mode = 'menu';
  let msg = '';
  const lf = ST.lastFall;
  if (lf) msg += `<p>You fell ${lf.h} m.${lf.lost ? ` <span class="bad">${lf.lost} gold scattered on the way down.</span>` : ''}</p>`;
  if (S.stash){ msg += `<p class="gold">${S.stash} gold waited here from the pouch you threw.</p>`; S.gold += S.stash; S.stash = 0; save(); }
  ST.lastFall = null;
  renderPool(msg);
}
function renderPool(msg){
  const weps = Object.keys(WEAPONS).map(id => {
    const w = WEAPONS[id];
    return `<button class="choice ${S.weapon === id ? 'sel' : ''}" data-act="wep" data-id="${id}">${w.name}<small>${w.desc}</small></button>`;
  }).join('');
  const lifts = [];
  for (const k of S.lifts) lifts.push({ k, y: k * FH + FH, label: 'Ride the lift' });
  for (const k of S.bosses) lifts.push({ k, y: k * FH + FH, label: 'Ride past the Warden' });
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
  overlay.dataset.msg = msg || '';
}
let campMsg = '';
export function openCamp(k){ ST.mode = 'menu'; campMsg = ''; renderCamp(k); }
function renderCamp(k){
  const G = ST.G, h = meters(posOf(G.s).y), pct = burstChance(h);
  const others = Object.keys(WEAPONS).filter(id => id !== G.weapon).map(id =>
    `<button class="choice" data-act="swap" data-id="${id}" data-k="${k}"><span>Swap to ${WEAPONS[id].name}<small>${WEAPONS[id].desc}</small></span><span class="cost">free</span></button>`).join('');
  const opt = (act, label, sub, cost, ok) =>
    `<button class="choice" data-act="${act}" data-k="${k}" ${(!ok || G.gold < cost) ? 'disabled' : ''}><span>${label}<small>${sub}</small></span><span class="cost">${cost}g</span></button>`;
  showMenu(`<div class="card">
    <h2>Rest stop</h2>
    <p class="sub">A cold fire and a trader who never says how he got down here.</p>
    <p><span class="gold">${G.gold} gold</span> · ${G.hp}/${G.maxHp} health · flask ${G.flask}/${G.flaskMax}</p>
    ${campMsg ? `<p>${campMsg}</p>` : ''}
    ${opt('refill', 'Refill one flask charge', 'Heals 2', CAMP.refill, G.flask < G.flaskMax)}
    ${opt('whet', 'Whetstone', '+1 damage for this climb', CAMP.whetstone, G.bonusDmg < CAMP.whetstoneMax)}
    ${opt('heart', 'Iron heart', '+1 max health for this climb', CAMP.ironHeart, G.hearts < CAMP.ironHeartMax)}
    <button class="choice" data-act="throw" data-k="${k}" ${G.gold < 1 ? 'disabled' : ''}><span>Throw your gold down the shaft<small>Safe in the Pool if it lands. ${pct}% chance the pouch bursts.</small></span><span class="cost">all</span></button>
    ${others}
    <button class="choice go" data-act="resume">Keep climbing</button>
  </div>`);
}

const ACTIONS = {
  pool(){ ST.lastFall = null; poolMenu(); },
  reset(){ resetSave(); setAllFlights(); titleMenu(); },
  wep(b){ setWeapon(b.dataset.id); renderPool(overlay.dataset.msg); },
  start(b){
    const k = +b.dataset.k;
    hideMenu();
    startClimb(k < 0 ? 0 : landingS(k) + 0.01);
    if (k >= 0){ ST.G.thudId = 'L' + k; ST.G.zoneShown = zoneOf(k); setToast('The lift groans upward', meters(posOf(ST.G.s).y) + ' m', 2); }
    updatePips();
  },
  resume(){ hideMenu(); ST.mode = 'climb'; },
  refill(b){ const G = ST.G; G.gold -= CAMP.refill; G.flask++; updatePips(); sfx.drink(); campMsg = 'Flask topped up.'; renderCamp(+b.dataset.k); },
  whet(b){ const G = ST.G; G.gold -= CAMP.whetstone; G.bonusDmg++; sfx.repair(); campMsg = 'Your edge bites deeper.'; renderCamp(+b.dataset.k); },
  heart(b){ const G = ST.G; G.gold -= CAMP.ironHeart; G.hearts++; G.maxHp++; G.hp++; sfx.repair(); campMsg = 'You feel heavier, in a good way.'; renderCamp(+b.dataset.k); },
  swap(b){ setWeapon(b.dataset.id); campMsg = 'You take the ' + WEAPONS[ST.G.weapon].name.toLowerCase() + '.'; renderCamp(+b.dataset.k); },
  throw(b){
    const G = ST.G, h = meters(posOf(G.s).y), pct = burstChance(h), amt = G.gold; G.gold = 0;
    if (Math.random() * 100 < pct){ campMsg = `<span class="bad">You hear the pouch burst on the rocks. ${amt} gold gone.</span>`; sfx.crack(); }
    else { S.stash += amt; campMsg = `<span class="gold">${amt} gold is waiting in the Pool.</span>`; sfx.gold(); }
    S.gold = G.gold; save(); renderCamp(+b.dataset.k);
  },
};
overlay.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  ac();
  const fn = ACTIONS[b.dataset.act]; if (fn) fn(b);
});
