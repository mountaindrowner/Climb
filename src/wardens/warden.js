// The Warden fight: intro, telegraphed attacks, the kneel that opens it to damage, phase 2 at half health, death.
import { FH, R, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { GOLD } from '../config/economy.js';
import { ZONES } from '../config/zones.js';
import { S, save } from '../save/store.js';
import { ST } from '../core/state.js';
import { sfx } from '../audio/sfx.js';
import { scene } from '../render/renderer.js';
import { placeArc, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { float, setToast, hitstop, flash } from '../fx/feedback.js';
import { zoneOf, landingS, meters } from '../world/path.js';
import { setAllFlights } from '../world/stair.js';
import { makeWarden } from './model.js';
import { hideWardenFx } from './visuals.js';
import * as deep from './movesets/deep.js';
import { hurt, head } from '../entities/player/player.js';
import { wardenFellMenu } from '../ui/screens/victory.js';
const W = TUNE.warden;
const MOVESETS = { deep };

export function startBoss(k){
  const z = zoneOf(k), ls = landingS(k), zone = ZONES[z];
  const model = makeWarden(z), hp = W.hp(z);
  ST.B = { k, z, name: zone.boss, moves: MOVESETS[zone.warden] || deep, hp, max: hp, phase: 1, st: 'intro', tm: 0, atk: null, queue: [], T: 1,
    a: ls * OMEGA + 0.55, y: k * FH + FH, r: R - 0.9, flash: 0, orb: null, stg: W.kneel1, model, slammed: false };
  placeArc(model.G, ST.B.a, ST.B.r, ST.B.y, true); scene.add(model.G);
  ST.mode = 'boss'; sfx.roar(); ST.shake = 0.4;
  setToast(zone.boss, 'Read the wind-up. Strike when it kneels.', 2.6);
}
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
  go('tele');
}
export function updBoss(dt){
  const B = ST.B, G = ST.G;
  B.tm += dt; B.flash = Math.max(0, B.flash - dt);
  switch (B.st){
    case 'intro': if (B.tm > W.intro) go('idle'); break;
    case 'idle': if (B.tm > (B.queue.length ? 0.25 : (B.phase === 1 ? 0.75 : 0.45))) next(); break;
    case 'tele':
      if (B.atk === 'slam' && B.tm >= B.T - 0.3 && !B.slammed){ B.slammed = true; sfx.slam(); ST.shake = 0.3; }
      if (B.tm >= B.T){
        B.slammed = false;
        const atk = B.moves.attacks[B.atk];
        if (atk.answer === 'block'){ B.orb = { t: 0, dur: W.spitFlight }; sfx.spit(); go('orb'); }
        else {
          const ok = atk.answer === 'jump' ? G.jump > 0 : G.duck > 0;
          if (ok) float('Dodged', head(), '#c9f5d9');
          else { hurt(atk.damage, atk.hitText); if (ST.mode !== 'boss') return; }
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
        else { B.orb = null; hurt(B.moves.attacks.spit.damage, B.moves.attacks.spit.hitText); if (ST.mode !== 'boss') return; go('strike'); }
      }
      break;
    case 'reflect':
      B.orb.t += dt;
      if (B.orb.t >= B.orb.dur){ B.orb = null; damageBoss(W.reflectDamage, 'Reflected'); if (ST.B && ST.B.st !== 'dying') go('stagger', kneelTime(B) + W.parryKneelBonus); }
      break;
    case 'strike': if (B.tm > W.strike){ if (B.queue.length) go('idle'); else go('stagger', kneelTime(B)); } break;
    case 'stagger': if (B.tm > B.stg) go('idle'); break;
    case 'dying': if (B.tm > W.dying) bossDefeated(); break;
  }
}
export function bossTop(){ const B = ST.B; return vArc(B.a, B.r, B.y + 6.4); }
// A only damages the Warden while it kneels. Any other time it just clangs.
export function bossHit(dmg){
  const B = ST.B;
  if (!B || B.st === 'dying' || B.st === 'intro') return;
  if (B.st === 'stagger') damageBoss(dmg);
  else { sfx.clang(); float('Clang', bossTop(), '#968ca3'); }
}
export function damageBoss(n, txt){
  const B = ST.B;
  B.hp -= n; B.flash = 0.12; sfx.hit(); ST.shake = Math.max(ST.shake, 0.2);
  burst(vArc(B.a - 0.12, B.r, B.y + 2.8), 14, '#ffd9a8', 4); hitstop(0.06);
  float(txt || ('-' + n), bossTop(), '#ffd9a8');
  if (B.hp <= 0){ B.hp = 0; go('dying'); sfx.roar(); ST.shake = 0.6; return; }
  if (B.phase === 1 && B.hp <= B.max / 2){ B.phase = 2; B.queue = []; ST.shake = 0.4; sfx.roar(); setToast('It stops warning you', 'Watch its body, not the prompts', 2.2); }
}
export function removeBoss(){
  if (ST.B && ST.B.model) scene.remove(ST.B.model.G);
  hideWardenFx();
}
function bossDefeated(){
  const B = ST.B, G = ST.G, g = GOLD.warden(B.z); G.gold += g;
  burst(vArc(B.a, B.r, B.y + 1.5), 40, ZONES[B.z].glow, 6);
  S.bosses.push(B.k); S.gold = G.gold; save();
  const name = B.name, h = meters(B.y);
  removeBoss(); ST.B = null; ST.mode = 'menu';
  setAllFlights();
  wardenFellMenu(name, g, h);
}
