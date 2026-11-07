// The rest stop: refill a flask charge, whetstone, iron heart, swap weapons, or throw your gold down the shaft.
import { WEAPONS, OFFERED } from '../../config/weapons.js';
import { CAMP, burstChance } from '../../config/economy.js';
import { S, save } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { sfx } from '../../audio/sfx.js';
import { posOf, meters } from '../../world/path.js';
import { setWeapon } from '../../entities/player/player.js';
import { showMenu, registerActions, updatePips } from '../overlay.js';
import { MARKS, MARK_SLOTS } from '../../config/run.js';
import { bank, offeredMarks, takeMark } from '../../run/run.js';
import { runSeed } from '../../world/generate.js';

let campMsg = '';
export function openCamp(k){ ST.mode = 'menu'; campMsg = ''; render(k); }
function render(k){
  const G = ST.G, h = meters(posOf(G.s).y), pct = burstChance(h);
  const others = OFFERED.filter(id => id !== G.weapon).map(id =>
    `<button class="choice" data-act="swap" data-id="${id}" data-k="${k}"><span>Swap to ${WEAPONS[id].name}<small>${WEAPONS[id].desc}</small></span><span class="cost">free</span></button>`).join('');
  const opt = (act, label, sub, cost, ok) =>
    `<button class="choice" data-act="${act}" data-k="${k}" ${(!ok || G.gold < cost) ? 'disabled' : ''}><span>${label}<small>${sub}</small></span><span class="cost">${cost}g</span></button>`;
  // Fetch's marks: three on offer here, one to take at each rest stop, three at most a climb
  const took = G.campMark && G.campMark[k], full = G.marks.length >= MARK_SLOTS;
  const marks = offeredMarks(runSeed, k).map(id => `<button class="choice" data-act="mark" data-id="${id}" data-k="${k}" ${took || full ? 'disabled' : ''}><span>${MARKS[id].name}<small>${MARKS[id].desc}</small></span><span class="cost">take</span></button>`).join('');
  const have = G.marks.length ? G.marks.map(id => MARKS[id].name.replace('Mark of the ', '').replace('Mark of ', '')).join(', ') : 'none yet';
  showMenu(`<div class="card">
    <h2>Rest stop</h2>
    <p class="sub">A fire, and Fetch, the trader, who never says how he got down here.</p>
    <p><span class="gold">${G.gold} gold</span> · <span class="well">${G.well} wellstone</span> · ${G.hp}/${G.maxHp} health · flask ${G.flask}/${G.flaskMax}</p>
    ${campMsg ? `<p>${campMsg}</p>` : ''}
    <button class="choice" data-act="bank" data-k="${k}" ${G.well < 1 ? 'disabled' : ''}><span>Send your wellstone down to the Pool<small>Safe there for good, to spend between climbs. Carried, a fall loses it.</small></span><span class="cost">${G.well}</span></button>
    <div class="grp">Marks · ${G.marks.length}/${MARK_SLOTS} · ${have}</div>
    ${marks || '<p class="note">Fetch has nothing you do not already carry.</p>'}
    <div class="grp">Fetch's wares</div>
    ${opt('refill', 'Refill one flask charge', 'Heals 2', CAMP.refill, G.flask < G.flaskMax)}
    ${opt('whet', 'Whetstone', '+1 damage for this climb', CAMP.whetstone, G.bonusDmg < CAMP.whetstoneMax)}
    ${opt('heart', 'Iron heart', '+1 max health for this climb', CAMP.ironHeart, G.hearts < CAMP.ironHeartMax)}
    <button class="choice" data-act="throw" data-k="${k}" ${G.gold < 1 ? 'disabled' : ''}><span>Throw your gold down the shaft<small>Safe in the Pool if it lands. ${pct}% chance the pouch bursts.</small></span><span class="cost">all</span></button>
    ${others}
    <button class="choice go" data-act="resume">Keep climbing</button>
  </div>`);
}
registerActions({
  bank(b){ const n = bank(); sfx.gold(); campMsg = `<span class="well">${n} wellstone</span> goes down the shaft in Fetch's sack. It will be waiting.`; render(+b.dataset.k); },
  mark(b){ const G = ST.G, k = +b.dataset.k; if (takeMark(b.dataset.id)){ (G.campMark = G.campMark || {})[k] = true; campMsg = 'Fetch cuts the ' + MARKS[b.dataset.id].name.toLowerCase() + ' into your arm. It does not bleed.'; } render(k); },
  refill(b){ const G = ST.G; G.gold -= CAMP.refill; G.flask++; updatePips(); sfx.drink(); campMsg = 'Flask topped up.'; render(+b.dataset.k); },
  whet(b){ const G = ST.G; G.gold -= CAMP.whetstone; G.bonusDmg++; sfx.repair(); campMsg = 'Your edge bites deeper.'; render(+b.dataset.k); },
  heart(b){ const G = ST.G; G.gold -= CAMP.ironHeart; G.hearts++; G.maxHp++; G.hp++; sfx.repair(); campMsg = 'You feel heavier, in a good way.'; render(+b.dataset.k); },
  swap(b){ setWeapon(b.dataset.id); campMsg = 'You take the ' + WEAPONS[ST.G.weapon].name.toLowerCase() + '.'; render(+b.dataset.k); },
  throw(b){
    const G = ST.G, h = meters(posOf(G.s).y), pct = burstChance(h), amt = G.gold; G.gold = 0;
    if (Math.random() * 100 < pct){ campMsg = `<span class="bad">You hear the pouch burst on the rocks. ${amt} gold gone.</span>`; sfx.crack(); }
    else { S.stash += amt; campMsg = `<span class="gold">${amt} gold is waiting in the Pool.</span>`; sfx.gold(); }
    S.gold = G.gold; save(); render(+b.dataset.k);
  },
});
