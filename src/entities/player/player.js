// The warrior's run state (ST.G), his actions, and the four-button input routing.
import { R, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { WEAPONS } from '../../config/weapons.js';
import { S, save } from '../../save/store.js';
import { ST } from '../../core/state.js';
import { sfx, buzz, ac } from '../../audio/sfx.js';
import { scene } from '../../render/renderer.js';
import { vArc } from '../../render/primitives.js';
import { burst } from '../../render/particles.js';
import { float, setToast, hitstop } from '../../fx/feedback.js';
import { posOf, landingS, meters, special } from '../../world/path.js';
import { flight } from '../../world/generate.js';
import { ENTITIES } from '../registry.js';
import { makePlayer, setWeaponModel } from './model.js';
import { bossHit } from '../../wardens/warden.js';
import { startFall, grab } from '../../modes/fall.js';
import { updatePips } from '../../ui/overlay.js';
const P = TUNE.player;

export const PL = makePlayer(); scene.add(PL.P); setWeaponModel(PL, S.weapon);

export function newRunState(startS){
  return {
    s: startS, prevS: startS, hp: P.hp, maxHp: P.hp, flask: P.flask, flaskMax: P.flask,
    gold: S.gold, weapon: S.weapon, bonusDmg: 0, hearts: 0,
    jump: 0, duck: 0, block: 0, lastBlock: -9, atk: 0, atkCd: 0, inv: 0, squash: 0, thudId: null, stumble: 0,
    campDone: new Set(), zoneShown: -1, grabCd: 0, engaged: false, fightSlow: false, slowK: 0,
    spd: 2.25, blockHigh: false, lastAtk: -9,
  };
}
export function tickTimers(dt, gameplay){
  const G = ST.G; if (!G) return;
  const gdt = gameplay ? dt : 0;
  G.jump = Math.max(0, G.jump - gdt); G.duck = Math.max(0, G.duck - gdt); G.block = Math.max(0, G.block - gdt);
  G.atk = Math.max(0, G.atk - gdt); G.atkCd = Math.max(0, G.atkCd - gdt); G.inv = Math.max(0, G.inv - gdt);
  G.stumble = Math.max(0, G.stumble - gdt); G.squash = Math.max(0, G.squash - dt * 6); G.grabCd = Math.max(0, G.grabCd - dt);
}

export function playerWorld(out){
  const G = ST.G, p = posOf(G.s);
  const jy = G.jump > 0 ? Math.sin(Math.PI * (1 - G.jump / P.jump)) * P.jumpHeight : 0;
  return vArc(p.a, R, p.y + jy, out);
}
export const head = h => { const v = playerWorld(); v.y += (h == null ? 2.5 : h); return v; };

export function hurt(n, msg){
  const G = ST.G;
  if (!G || G.inv > 0) return;
  G.hp -= n; G.inv = P.invuln; ST.shake = TUNE.feel.shakeHurt; ST.flash = 0.35; sfx.hurt(); buzz(50); hitstop(TUNE.feel.hitstopHurt);
  float(msg || ('-' + n), head(), '#ff8a78');
  if (G.hp <= 0){ G.hp = 0; startFall(); }
}
export function drink(){
  const G = ST.G;
  if (!G || ST.mode !== 'climb') return;
  if (G.flask <= 0){ float('Flask empty', head(), '#968ca3'); return; }
  if (G.hp >= G.maxHp){ float('Already full', head(), '#968ca3'); return; }
  G.flask--; G.hp = Math.min(G.maxHp, G.hp + P.flaskHeal); sfx.drink(); updatePips();
  burst(head(0.6), 12, '#5ce1c6', 2, -2); float('+' + P.flaskHeal, head(), '#5ce1c6');
}
export function attack(){
  const G = ST.G;
  if (G.atkCd > 0) return;
  const w = WEAPONS[G.weapon]; G.atkCd = w.cd; G.atk = 0.2; G.lastAtk = ST.time; sfx.slash();
  const dmg = w.dmg + G.bonusDmg;
  if (ST.B && bossHit(dmg)) return;   // the Warden's arm or head is in the lane and takes the hit
  const p = posOf(G.s); let tgt = null, best = 1e9;
  for (let kk = p.k - 1; kk <= p.k + 1; kk++){
    if (kk < 0) continue;
    for (const o of flight(kk).obs){
      const e = ENTITIES[o.type];
      if (!e.hittable || !e.hittable(o)) continue;
      // most threats are reached along the stair; a flier says for itself whether it is within the swing
      const d = e.inReach ? (e.inReach(o, w.reach) ? 0 : null) : o.s - G.s;
      if (d === null || (!e.inReach && (d <= -0.3 || d >= w.reach))) continue;
      if (d < best){ best = d; tgt = o; }
    }
  }
  if (tgt) ENTITIES[tgt.type].hit(tgt, dmg);
}
function repairLift(k, y){
  S.lifts.push(k); save(); sfx.repair();
  burst(vArc(landingS(k) * OMEGA, R - 1.0, y + 2.2), 18, '#e8b04a', 3);
  setToast('Lift repaired', 'It now runs from the Pool to ' + meters(y) + ' m', 2.4);
}
export function setWeapon(id){ ST.G && (ST.G.weapon = id); S.weapon = id; save(); setWeaponModel(PL, id); }

// One of the four buttons (or the flask) was pressed.
export function press(k){
  ac();
  const G = ST.G, mode = ST.mode;
  if (mode === 'climb'){
    if (k === 'up'){
      const p = posOf(G.s);
      if (!ST.practice && p.land && special(p.k) === 'lift' && !S.lifts.includes(p.k)){ repairLift(p.k, p.y); return; }
      if (G.jump <= 0){ G.jump = P.jump; sfx.jump(); }
    } else if (k === 'down'){ G.duck = P.duck; }
    else if (k === 'a'){ attack(); }
    else if (k === 'b'){ G.block = P.block; G.lastBlock = ST.time; }
    else if (k === 'flask'){ drink(); }
  } else if (mode === 'fall' && k === 'up'){ grab(); }
}
