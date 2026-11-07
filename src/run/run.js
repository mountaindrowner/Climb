// The run layer at work: what a kill frees, banking and losing wellstone, finding blueprints, swearing oaths, taking
// marks, the Pool's upgrades on a new climb, and the small rules the oaths and marks bend (damage, swing speed, the
// parry window, the roll, the sprint, the flask, a last breath). Definitions in config/run.js; the climb's state is ST.G.
import { WELL, OATHS, MARKS, BLUEPRINTS, UPGRADES, RUNES, MARK_SLOTS, edgeMul, knellSpeed, knellParry } from '../config/run.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { burst } from '../render/particles.js';
import { float, setToast } from '../fx/feedback.js';
import { updatePips } from '../ui/overlay.js';
import { knownMarks, offeredMarks, offeredOaths } from './picks.js';
export { knownMarks, offeredMarks, offeredOaths };

const G_ = () => ST.G;
export const hasMark = (id, G = G_()) => !!(G && G.marks && G.marks.includes(id));
export const oath = (id, G = G_()) => (G && G.oaths && G.oaths[id]) || 0;

// ---- a new climb: the Pool's upgrades applied, the run's own state empty
export function runState(base){
  const u = S.upgrades || {};
  base.flaskMax += u.flask || 0; base.flask = base.flaskMax;
  base.maxHp += u.mail || 0; base.hp = base.maxHp;
  base.gold += 15 * (u.credit || 0);
  return Object.assign(base, { well: 0, wellBanked: 0, oaths: { edge: 0, lantern: 0, knell: 0 }, marks: [], kills: 0, found: [], rootUsed: false, breathUsed: false, wardAt: -99, peakY: 0, oathSeen: new Set() });
}

// ---- gold, with the tithe
export function addGold(n, G = G_()){ const v = hasMark('tithe', G) ? Math.ceil(n * 1.5) : n; G.gold += v; return v; }

// ---- a kill: wellstone freed from it (teal motes and a count), perhaps a blueprint, the vigil
export function killed(type, pos){
  const G = G_(); if (!G || ST.practice) return;
  G.kills++;
  let n = WELL.kill[type] || 1; if (hasMark('seam')) n = Math.ceil(n * 1.5);
  G.well += n;
  if (pos){ burst(pos, 10 + n * 3, '#5ce1c6', 2.6, -1.5, 0.07); const p = pos.clone(); p.y += 0.9; float('+' + n + ' wellstone', p, '#5ce1c6'); }
  if (!S.seen.includes('well')){ S.seen.push('well'); save(); setToast('Wellstone', 'The light it held. Send it to the Pool from a rest stop: carried, a fall loses it', 4); }
  if (hasMark('vigil') && G.kills % 4 === 0 && G.hp < G.maxHp){ G.hp++; if (pos) float('+1', pos.clone().setY(pos.y + 1.4), '#ff8a78'); }
  if (Math.random() < WELL.blueprintChance) findBlueprint(pos);
}
// a blueprint not yet found, kept for good from this moment; null if every one is found
export function findBlueprint(pos){
  const left = BLUEPRINTS.filter(id => !S.found.includes(id));
  if (!left.length) return null;
  const id = left[Math.floor(Math.random() * left.length)];
  S.found.push(id); save(); const G = G_(); if (G) G.found.push(id);
  sfx.repair(); if (pos) burst(pos, 16, '#efe6d2', 2.4, -1, 0.06);
  setToast('Blueprint: ' + MARKS[id].name, 'Kept for good. Buy it at the Pool and Fetch will offer it', 3.6);
  return id;
}
export function giveRune(id){
  if (S.runes.includes(id)) return false;
  S.runes.push(id); save(); sfx.repair();
  setToast(RUNES[id].name, RUNES[id].desc, 5);
  return true;
}
// ---- banking at a rest stop, and what a fall costs
export function bank(G = G_()){ const n = G.well; S.well += n; G.wellBanked += n; G.well = 0; save(); return n; }
export function fallCost(G){ const lostWell = G.well; G.well = 0; const keep = hasMark('tithe', G) ? 0.75 : 0.5; const kept = Math.floor(G.gold * keep); return { lostWell, kept, lostGold: G.gold - kept }; }

// ---- the oaths and marks at work
export const damage = (G, swing, finisher) => (swing.dmg + G.bonusDmg) * edgeMul(oath('edge', G)) + (finisher && hasMark('finisher', G) ? 1 : 0);
export const swingRate = G => knellSpeed(oath('knell', G));
export const parryBonus = G => knellParry(oath('knell', G));
export const rollCooldown = (G, base) => hasMark('fleet', G) ? base * 0.5 : base;
export const sprintMul = G => hasMark('fleet', G) ? 1.1 : 1;
export const flaskHeal = (G, base) => hasMark('bearer', G) ? 3 : base;
export function onParry(G = G_(), at){
  if (!G || !hasMark('ward', G) || ST.time - G.wardAt < 8 || G.hp >= G.maxHp) return;
  G.wardAt = ST.time; G.hp++; if (at) float('+1', at, '#ff8a78');
}
// after a hit lands: the second breath, once a climb, when it leaves him on 1
export function afterHurt(G){ if (G.hp === 1 && hasMark('breath', G) && !G.breathUsed){ G.breathUsed = true; G.hp = Math.min(G.maxHp, 3); setToast('Second breath', 'Up again', 1.6); sfx.drink(); } }

export function swear(id, G = G_()){
  G.oaths[id]++;
  if (id === 'lantern'){ G.maxHp++; G.hp = Math.min(G.maxHp, G.hp + 1); }
  sfx.repair(); updatePips();
}
export function takeMark(id, G = G_()){ if (G.marks.length >= MARK_SLOTS || G.marks.includes(id)) return false; G.marks.push(id); sfx.repair(); return true; }
// ---- at the Pool
export const blueprintCost = id => MARKS[id].cost;
export function buyBlueprint(id){ const c = blueprintCost(id); if (S.well < c || S.unlocked.includes(id) || !S.found.includes(id)) return false; S.well -= c; S.unlocked.push(id); save(); return true; }
export const upgradeCost = id => { const t = (S.upgrades[id] || 0); return UPGRADES[id].costs[t]; };
export function buyUpgrade(id){ const c = upgradeCost(id); if (c == null || S.well < c) return false; S.well -= c; S.upgrades[id] = (S.upgrades[id] || 0) + 1; save(); return true; }
