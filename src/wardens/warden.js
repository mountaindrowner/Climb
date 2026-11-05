// The Warden fight is a running fight. It keeps pace behind the wall over the last flights of its zone while you climb,
// breaking through to swipe, slam and spit. After each attack the arm or head is stuck in the breach for a moment:
// that is the opening, and you hit it as you pass. Reach the top of its stretch alive and it tears the stair out.
import { OMEGA, R, RW } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../zones/index.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { float, setToast, hitstop, flash } from '../fx/feedback.js';
import { zoneOf, topAt } from '../world/path.js';
import { setAllFlights } from '../world/stair.js';
import { buildWardenScene, destroyWardenScene } from './visuals.js';
import * as deep from './movesets/deep.js';
import { hurt, head } from '../entities/player/player.js';
const W = TUNE.warden;
const MOVESETS = { deep };

export function startBoss(k){
  const z = zoneOf(k), zone = ZONES[z], hp = W.hp(z), G = ST.G;
  ST.B = { k, z, name: zone.boss, moves: MOVESETS[zone.warden] || deep, hp, max: hp, phase: 1, st: 'intro', tm: 0, atk: null, queue: [], T: 1,
    s: G.s + W.lead, a: 0, y: 0, flash: 0, orb: null, stg: W.kneel1, slammed: false, scars: 0 };
  anchor();
  buildWardenScene(ST.B);
  sfx.roar(); ST.shake = 0.5;
  setToast(zone.boss, 'It is behind the wall. Keep climbing. Strike what it puts through.', 3);
}
// Where the next attack lands: a little way up the stair from where you are now.
function anchor(){ const B = ST.B; B.s = ST.G.s + W.lead; B.a = B.s * OMEGA; B.y = topAt(B.s); }
function go(st, stagger){ const B = ST.B; B.st = st; B.tm = 0; if (stagger != null) B.stg = stagger; }
const kneelTime = B => B.phase === 1 ? W.kneel1 : W.kneel2;
function next(){
  const B = ST.B;
  if (!B.queue.length){
    B.queue.push(B.moves.pick());
    if (B.phase === 2 && Math.random() < W.comboChance) B.queue.push(B.moves.pick());
  }
  B.atk = B.queue.shift();
  B.T = B.phase === 1 ? W.windup1(B.z) : W.windup2(B.z);
  anchor(); B.scars++;
  sfx.crack();
  go('tele');
}
export function updWarden(dt){
  const B = ST.B, G = ST.G;
  B.tm += dt; B.flash = Math.max(0, B.flash - dt);
  if (B.st === 'tele' || B.st === 'orb' || B.st === 'opening' || B.st === 'strike') G.fightSlow = true;
  switch (B.st){
    case 'intro': if (B.tm > W.intro) go('idle'); break;
    case 'idle': if (B.tm > (B.queue.length ? 0.25 : (B.phase === 1 ? 0.75 : 0.45))) next(); break;
    case 'tele':
      if (B.tm >= B.T - 0.3 && !B.slammed){ B.slammed = true; burst(vArc(B.a, RW - 0.5, B.y + 2.2), 22, ZONES[B.z].wall, 4, 7, 0.14); ST.shake = Math.max(ST.shake, 0.25); if (B.atk === 'slam') sfx.slam(); else sfx.hit(); }
      if (B.tm >= B.T){
        B.slammed = false;
        const atk = B.moves.attacks[B.atk];
        if (atk.answer === 'block'){ B.orb = { t: 0, dur: W.spitFlight }; sfx.spit(); go('orb'); }
        else {
          const ok = atk.answer === 'jump' ? G.jump > 0 : G.duck > 0;
          if (ok) float('Dodged', head(), '#c9f5d9');
          else { hurt(atk.damage, atk.hitText); if (ST.mode !== 'climb') return; }
          go('strike');
        }
      }
      break;
    case 'orb':
      B.orb.t += dt;
      if (B.orb.t >= B.orb.dur){
        const since = ST.time - G.lastBlock;
        if (G.block > 0 && since <= TUNE.player.parryWindow){ B.orb = { t: 0, dur: W.reflect, back: true }; sfx.parry(); flash(-0.25); hitstop(TUNE.feel.hitstopParry); float('Parry!', head(), '#9fd0ff'); go('reflect'); }
        else if (G.block > 0){ B.orb = null; sfx.block(); float('Blocked', head(), '#c9d2e0'); go('strike'); }
        else { B.orb = null; hurt(B.moves.attacks.spit.damage, B.moves.attacks.spit.hitText); if (ST.mode !== 'climb') return; go('strike'); }
      }
      break;
    case 'reflect':
      B.orb.t += dt;
      if (B.orb.t >= B.orb.dur){ B.orb = null; damageBoss(W.reflectDamage, 'Reflected'); if (ST.B && ST.B.st !== 'dying') go('opening', kneelTime(B) + W.parryKneelBonus); }
      break;
    case 'strike': if (B.tm > W.strike){ if (B.queue.length) go('withdraw'); else go('opening', kneelTime(B)); } break;
    case 'opening': if (B.tm > B.stg) go('withdraw'); break;
    case 'withdraw': if (B.tm > W.withdraw){ burst(vArc(B.a, RW - 0.4, B.y + 2), 10, ZONES[B.z].wall, 2.5, 7, 0.1); go('idle'); } break;
    case 'dying': if (B.tm > W.dying) bossDefeated(); break;
  }
}
// Is a part of it in the lane right now, and where.
export const exposed = B => B.st === 'strike' || B.st === 'opening' || B.st === 'orb' || B.st === 'reflect' || (B.st === 'tele' && B.slammed);
export function bossTop(){ const B = ST.B; return B.atk === 'spit' ? vArc(B.a, RW - 1.3, B.y + 4.3) : vArc(B.a, R + 0.2, B.y + (B.atk === 'slam' ? 1.6 : 2.6)); }
// A swing while it is stuck in the breach and you are close enough hits it. Returns whether the swing was spent on it.
export function bossHit(dmg){
  const B = ST.B;
  if (!B || B.st === 'dying' || B.st === 'intro') return false;
  const near = Math.abs(B.s - ST.G.s) < W.hitRange;
  if (!near || !exposed(B)) return false;
  if (B.st === 'opening') damageBoss(dmg);
  else { sfx.clang(); float('Clang', bossTop(), '#968ca3'); }
  return true;
}
export function damageBoss(n, txt){
  const B = ST.B;
  B.hp -= n; B.flash = 0.12; sfx.hit(); ST.shake = Math.max(ST.shake, 0.2);
  burst(bossTop(), 14, '#ffd9a8', 4); hitstop(0.06);
  float(txt || ('-' + n), bossTop(), '#ffd9a8');
  if (B.hp <= 0){ B.hp = 0; go('dying'); sfx.roar(); ST.shake = 0.6; return; }
  if (B.phase === 1 && B.hp <= B.max / 2){ B.phase = 2; B.queue = []; ST.shake = 0.4; sfx.roar(); setToast('It stops warning you', 'Watch the wall, not the prompts', 2.2); }
}
export function removeBoss(){
  if (ST.B) destroyWardenScene();
  ST.B = null;
}
function bossDefeated(){
  const B = ST.B, G = ST.G, g = GOLD.warden(B.z); G.gold += g;
  burst(vArc(B.a, RW - 1, B.y + 3), 50, ZONES[B.z].glow, 6);
  S.bosses.push(B.k); S.gold = G.gold; save();
  const name = B.name;
  removeBoss();
  setAllFlights();
  setToast(name + ' falls', '+' + g + ' gold · a lift runs here from the Pool · the stair above is open', 3.2);
  float('+' + g, head(), '#e8b04a');
}
