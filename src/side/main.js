// The side view: boot and the loop. The motor steps at a fixed 1/120 s (input is kept until it is used, core/input.js);
// the frame draws where things are. Camera: it leads the way he faces and a little up, eases after him, and stays
// inside the map. The mountain is three regions, one over the other; the way out of one leads up into the next
// (enter), and the buttons under the room's name go straight to any of them.
import { TUNE } from '../config/tuning.js';
import { IN, bindInput, endFrame, pollPads, release, rumble } from '../core/input.js';
import { SET, saveSettings } from '../core/settings.js';
import { sfx, ac, musicBus, ambience, setMix, MIX } from '../audio/sfx.js';
import { makeScore } from '../audio/score.js';
import '../ui/feel.js';
import { LEVEL, LEVELS, loadLevel, T, spawnPoint, roomAt, solidAt, PHASE, REGION_DATA, resetLevels } from './level.js';
import { makeProps } from './props.js';
import { newPlayer, stepPlayer, BODY, HOOKS, BLADE, swingOf, CAN, SIDE } from './motor.js';
import { G, OPT, loadSave, store, storeOpt, wipe, has, maxHearts, maxFlask, RELICS, TEACH, THREADS_A_HEART, DIFF } from './state.js';
import { makeItems } from './items.js';
import { makeTalk, SCRIPT } from './talk.js';
import { makeRenderer, makeSprite, VIEW_H, makeSwingFx } from './render.js';
import { spawnFx, stepFx } from './fx.js';
import { spawnEnemies, stepEnemies, strikeEnemies, slamEnemies } from './enemies.js';
import { KEEPERS } from './keepers.js';
import { makeStory, REGION_SPAN } from './story.js';
import { makeHud } from './hud.js';
import { makeScarf, SCARF } from './scarf.js';
import { makeMusic } from './music.js';
import { DEVICE } from '../core/prompts.js';
import { WEAPONS } from '../config/weapons.js';
const MV = TUNE.move;
const BUILD = 'SIDE 19';   // shown in the corner, so a stale copy is easy to spot

const canvas = document.getElementById('gl'), hud = document.getElementById('hud'), hx = hud.getContext('2d');
const R = makeRenderer(canvas);
const sp = spawnPoint();
loadSave(); setMix('music', OPT.music); setMix('sfx', OPT.sfx); if (OPT.rumble === false) SET.rumble = false;
const DEV = /[?&]level=/.test(location.search);   // straight into a region by its address: he has what the keepers below it teach
// he is made with what he has earned: hearts (threads, keepers, the difficulty), and the flask's draughts
const born = (x, y) => { const p = newPlayer(x, y); p.maxHp = maxHearts(); p.hp = p.maxHp; p.flaskMax = maxFlask(); p.flask = p.flaskMax; return p; };
let P = born(sp.x, sp.y);
const hero = { sprite: null, meta: null };
// the warrior: one of the drawn options (?hero=a|b|c|d), falling back to the first, larger drawing
const HEROES = { masked: 'mask_tall_c', a: 'px_knight', b: 'px_hood', c: 'px_mask', d: 'px_hat' }, HERO = HEROES[new URLSearchParams(location.search).get('hero')] || HEROES.masked;   // the tall masked warrior; ?hero=a..d the small options
const loadHero = name => fetch(`assets/side/${name}/sprite.json`).then(r => r.ok ? r.json() : Promise.reject()).then(meta => { hero.meta = meta; hero.name = name; hero.sprite = makeSprite(R.scene, `assets/side/${name}`, meta); });
loadHero(HERO).catch(() => loadHero('hero_a')).catch(() => loadHero('hero'));
// what a region has in it: made by setup, again each time he comes into one
let fx, E, BOSS, SHRINES, MAP, SCF, SWINGFX, PROPS, ITEMS;
const TALK = makeTalk();
let NOTE = null, SCREEN = '', DIRTY = 0, NAMED = true;
const TRAIL = [];   // where he has been since he last rose, to run back when he falls   // a card that waits for a press (something learned, a relic); which menu is up; the save wants writing
const HUD = makeHud(hud);
// embers: what he takes from what he kills. Ten grow a length of the scarf back (a heart); a full ten are kept until needed
const EMBER = { n: 0, max: 10 };
let FLIGHT = null, SLOW = 0, FLASH = 0, PAUSE = false, PLAYED = 0, PLACE = { name: '', t: 9 };
let CHECK = null, BANNER = null, WON = false, DEATH = 0;
const SUB = LEVELS.map(l => l.sub), CARD = LEVELS.map(l => l.card);   // under a region's name; and what the card says, coming up into it
// what he can do, from what he has beaten and what he carries
function learn(){
  const b = n => !!G.beat[n] || G.top > n || (DEV && LEVEL.index > n);
  CAN.breaker = b(0); CAN.dash = b(1); CAN.glide = b(2); SIDE.feather = has('featherfall'); EMBER.max = has('seedheart') ? 7 : 10;
}
let WAKE = 0;   // at the very start he lies where he fell, and gets up
function setup(){
  SWINGFX = makeSwingFx(R.scene); PROPS = makeProps(R.scene, R);
  for (const id of G.broke[LEVEL.index] || []) PROPS.breakId(id);   // the rock he broke here before stays broken
  ITEMS = makeItems(R.scene, R, LEVEL.index); learn();
  fx = spawnFx(R.scene); E = spawnEnemies(R.scene, R); SCF = makeScarf(R.scene); FLIGHT = null; BOSS = (KEEPERS[LEVEL.theme] || (() => null))(R.scene, R);   // each region's keeper
  // the shrine: it fills the flask and the hearts, and is where he wakes after a death
  SHRINES = LEVEL.marks.filter(m => m.type === 'shrine').map(m => { const x = (m.x + 0.5) * T, y = m.y * T; return { x, y, room: roomAt(x, y + 0.5) }; });
  CHECK = null; WON = false; DEATH = 0; TRAIL.length = 0;
  if (!BOSS) for (const x of R.exits) x.set(true);   // nothing guards the way on
  // the map: the region drawn a pixel a tile, each room shown once he has been in it
  const c = document.createElement('canvas'); c.width = LEVEL.W; c.height = LEVEL.H; const g = c.getContext('2d'), img = g.createImageData(LEVEL.W, LEVEL.H);
  const COL = { 0: [46, 92, 128], 2: [196, 150, 92], 3: [255, 92, 132], 5: [120, 220, 240], 6: [120, 220, 240] };
  for (let j = 0; j < LEVEL.H; j++) for (let i = 0; i < LEVEL.W; i++){ const k = COL[LEVEL.tiles[j * LEVEL.W + i]]; if (k) img.data.set([...k, 255], ((LEVEL.H - 1 - j) * LEVEL.W + i) * 4); }
  g.putImageData(img, 0, 0); MAP = { c, seen: new Set(G.charts.includes(LEVEL.index) ? LEVEL.rooms : []) };
}
setup();
// into region n: the world is made again, he stands at its start with the hearts and flask he had
function enter(n){
  loadLevel(n); R.load();
  if (hero.meta) hero.sprite = makeSprite(R.scene, `assets/side/${hero.name}`, hero.meta);
  FX2.ghosts.length = 0; setup();
  const s = spawnPoint(), old = P; P = born(s.x, s.y); P.hp = Math.max(1, Math.min(P.maxHp, old.hp)); P.flask = Math.min(P.flaskMax, old.flask);
  CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0;
  BANNER = null; NAMED = !(roomAt(s.x, s.y + 0.5) || {}).look; if (NAMED) banner(LEVEL.name, SUB[LEVEL.index] || '', 4); marks(); G.level = LEVEL.index; G.top = Math.max(G.top, G.level); G.began = true; store();
}
// going up: the picture goes dark, the next region is made, it comes back
const GO = { to: -1, t: 0, st: '', from: -1 };
const go = n => { if (!GO.st){ GO.to = n; GO.from = LEVEL.index; GO.t = 0; GO.st = 'out'; } };
// the regions' buttons
const marks = () => {};
// ---- the story's screens (story.js) and the title's buttons
const STORY = makeStory(hud, `assets/side/${HERO}`);
const MENU = document.createElement('div');
MENU.style.cssText = 'position:absolute;left:0;right:0;top:56%;display:none;flex-direction:column;align-items:center;gap:10px;z-index:7;font:600 18px "Pixelify Sans",monospace;text-transform:uppercase;letter-spacing:1px';
(document.getElementById('stage') || document.body).appendChild(MENU);
const menuButton = (text, fn, small) => { const b = document.createElement('button'); b.textContent = text;
  b.style.cssText = `background:#181425;color:${small ? '#c0cbdc' : '#fff2d0'};border:2px solid ${small ? '#3a4466' : '#ead4aa'};border-radius:0;padding:${small ? '5px 12px' : '9px 22px'};cursor:pointer;font:inherit;font-size:${small ? 13 : 18}px;min-width:${small ? 0 : 240}px;box-shadow:3px 3px 0 #0b0810;letter-spacing:inherit;text-transform:inherit`;
  b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); ac(); fn(); }); return b; };
const menuLabel = text => { const d = document.createElement('div'); d.textContent = text; d.style.cssText = 'color:#c0cbdc;font-size:13px;letter-spacing:1px;text-shadow:2px 2px 0 #0b0810;margin:2px 0'; return d; };
// the keys in a menu: up and down move, Enter or Space picks
let MSEL = 0;
const menuItems = () => [...MENU.querySelectorAll('button')];
const menuMark = () => menuItems().forEach((b, i) => { b.style.outline = i === MSEL ? '2px solid #fee761' : 'none'; b.style.outlineOffset = '2px'; });
const menuShow = (rows, left = false, back = null) => { MENU.back = back; MENU.innerHTML = ''; MENU.style.display = 'flex'; MENU.style.alignItems = left ? 'flex-start' : 'center'; MENU.style.paddingLeft = left ? '4%' : '0'; MENU.style.top = left ? '36%' : '56%'; for (const r of rows) if (r) MENU.appendChild(r); MSEL = 0; menuMark(); };
const menuHide = () => { MENU.style.display = 'none'; MENU.innerHTML = ''; MENU.back = null; release(); };   // and nothing pressed in it carries into play
function begin(){   // from the start: the fall, then he gets up at the bottom
  menuHide(); wipe(); resetLevels(); enter(0); { const s = spawnPoint(); P = born(s.x, s.y); }   // everything as it was at the first: the rock unbroken, the chests shut
  STORY.start('intro', {}, () => { WAKE = 1.7; banner(LEVEL.name, SUB[0], 4); G.began = true; store(); });
}
function resume(n){ menuHide(); STORY.kind = null; SCREEN = ''; PAUSE = false; if (LEVEL.index !== n) enter(n); else { const s = spawnPoint(); P = born(s.x, s.y); CHECK = null; if (BOSS) BOSS.reset(); banner(LEVEL.name, SUB[n] || '', 4); G.level = n; store(); } }
function title(){
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;justify-content:center;max-width:92vw';
  const top = DEV ? LEVELS.length - 1 : G.top; if (top > 0) LEVELS.forEach((l, n) => { if (n <= top) row.appendChild(menuButton(`${n + 1} ${l.name.replace('The ', '')}`, () => resume(n), true)); });
  let sure = false; const again = menuButton(G.began ? 'Begin again' : 'Begin the climb', () => { if (G.began && !sure){ sure = true; again.textContent = 'Begin again? All is lost'; return; } begin(); }, G.began);
  menuShow([G.began ? menuButton('Climb on: ' + LEVELS[Math.min(G.level, LEVELS.length - 1)].name, () => resume(Math.min(G.level, LEVELS.length - 1))) : null, again, top > 0 ? row : null, menuButton('Options', () => options(title), true)], true);
  SCREEN = ''; PAUSE = false; STORY.start('title');
}
// the options: each button steps its setting on
function options(back){
  const cyc = (label, key, vals, names, then) => { const b = menuButton('', () => { OPT[key] = vals[(vals.indexOf(OPT[key]) + 1) % vals.length]; storeOpt(); if (then) then(); show(); }, true); const show = () => { b.textContent = `${label}: ${names[Math.max(0, vals.indexOf(OPT[key]))]}`; }; show(); b.style.minWidth = '240px'; return b; };
  menuShow([menuLabel('OPTIONS'),
    cyc('Music', 'music', [0, 0.35, 0.7, 1], ['off', 'low', 'mid', 'full'], () => setMix('music', OPT.music)),
    cyc('Sound', 'sfx', [0, 0.4, 0.7, 1], ['off', 'low', 'mid', 'full'], () => { setMix('sfx', OPT.sfx); sfx.shard(); }),
    cyc('Score', 'synth', [false, true], ['recorded', 'made as it plays']),
    cyc('Shake', 'shake', [0, 0.5, 1], ['off', 'soft', 'full']),
    cyc('Flashes', 'flash', [0, 1], ['off', 'on']),
    cyc('Difficulty', 'diff', [0, 1, 2], DIFF.map((d, i) => d + [' (two hearts more)', '', ' (two hearts fewer)'][i]), () => { P.maxHp = maxHearts(); P.hp = Math.min(P.hp, P.maxHp); }),
    cyc('Rumble', 'rumble', [true, false], ['on', 'off'], () => { SET.rumble = OPT.rumble; saveSettings(); if (OPT.rumble) rumble(0.5, 0.5, 160); }),
    menuButton('Back', back, true)], false, back);
}
// the Lamplighter's wares, for shards
const WARES = () => [
  { name: 'A deeper flask of the water', cost: [120, 260][G.flasks], buy(){ G.flasks++; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } },
  { name: G.edge ? 'Temper the blade again: every cut' : 'Temper the blade: finishing cuts', cost: [180, 380][G.edge], buy(){ G.edge++; } },
  { name: 'A red strand he has kept', cost: G.boughtThread ? undefined : 150, buy(){ G.boughtThread = true; onEvent({ type: 'thread', at: { x: P.x, y: P.y + 1.2 } }); } },
  { name: 'A chart of ' + LEVEL.name, cost: G.charts.includes(LEVEL.index) ? undefined : 40, buy(){ G.charts.push(LEVEL.index); for (const r of LEVEL.rooms) MAP.seen.add(r); } },
];
function shop(){
  SCREEN = 'shop'; PAUSE = true; release();
  const rows = [menuLabel(`WHAT ORDRIC CAN DO  ·  ${G.shards} SHARDS`)];
  for (const w of WARES()){ if (w.cost === undefined) continue; const can = G.shards >= w.cost, b = menuButton(`${w.name}  ·  ${w.cost}`, () => { if (G.shards < w.cost){ sfx.block(); return; } G.shards -= w.cost; w.buy(); sfx.buy(); store(); shop(); }, true); b.style.minWidth = '300px'; if (!can) b.style.opacity = '0.5'; rows.push(b); }
  if (rows.length === 1) rows.push(menuLabel('He can do no more. The rest was never his to do.'));
  const leave = () => { SCREEN = ''; PAUSE = false; menuHide(); }; rows.push(menuButton('Leave', leave, true)); menuShow(rows, false, leave);
}
// a pause: Esc or P (or the II button): the world stops; go on, or back to the title
const PBTN = menuButton('II', () => pause(!PAUSE), true); PBTN.style.cssText += ';position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:6;padding:3px 9px;font-size:12px;display:none;opacity:0.6;background:rgba(24,20,37,.4);box-shadow:none;border:2px solid rgba(234,212,170,.5);border-radius:10px';
(document.getElementById('stage') || document.body).appendChild(PBTN);
function pause(on){
  if (STORY.active() || GO.st || TALK.on || NOTE) return; if (SCREEN === 'shop'){ SCREEN = ''; PAUSE = false; menuHide(); return; }
  PAUSE = on; SCREEN = on ? 'pause' : ''; if (!on){ menuHide(); return; } release();
  menuShow([menuButton('Go on', () => pause(false)), menuButton('Options', () => options(() => pause(true)), true), menuButton('To the title', () => { PAUSE = false; SCREEN = ''; title(); }, true)], false, () => pause(false));
}
addEventListener('keydown', e => {
  if (TALK.on || NOTE){ if (['Enter', 'Space', 'KeyE', 'KeyS', 'ArrowDown', 'KeyJ'].includes(e.code)) press(); return; }
  if (MENU.style.display !== 'none' && MENU.children.length){   // a menu is up: move in it, pick from it
    const items = menuItems(); if (['ArrowDown', 'KeyS'].includes(e.code)){ MSEL = (MSEL + 1) % items.length; menuMark(); e.preventDefault(); return; } if (['ArrowUp', 'KeyW'].includes(e.code)){ MSEL = (MSEL + items.length - 1) % items.length; menuMark(); e.preventDefault(); return; }
    if (e.code === 'Enter' || e.code === 'Space'){ const b = items[MSEL]; if (b) b.dispatchEvent(new PointerEvent('pointerdown')); menuMark(); e.preventDefault(); return; }
  }
  if ((e.code === 'Escape' || e.code === 'KeyP') && !STORY.active()){ pause(!PAUSE); return; }
  if (STORY.active() && STORY.kind !== 'title') STORY.press();
});
// a controller, outside play (input.js's pollPads drives him; this drives everything round him): up and down on the
// stick or the d-pad move in a menu, A / cross picks, B / circle goes back, Start pauses and goes on; A or Start hurries
// a story's screen, someone speaking, or a card
const PADUI = { last: [], dir: 0, next: 0 };
function padUI(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : []; let pad = null; for (const q of pads) if (q && q.connected){ pad = q; break; }
  if (!pad) return; const now = pad.buttons.map(b => !!b && (b.pressed || b.value > 0.5)), was = PADUI.last, edge = i => now[i] && !was[i]; PADUI.last = now;
  const ay = pad.axes[1] || 0, dir = now[12] || ay < -0.6 ? -1 : now[13] || ay > 0.6 ? 1 : 0, t = performance.now();
  const menu = MENU.style.display !== 'none' && MENU.children.length;
  if (TALK.on || NOTE){ if (edge(9)) press(); return; }   // A and X come through play's own input (the frame hands them on)
  if (STORY.active() && STORY.kind !== 'title'){ if (edge(0) || edge(9)) STORY.press(); return; }
  if (menu){
    const items = menuItems(); if (!items.length) return;
    if (dir !== PADUI.dir){ PADUI.dir = dir; PADUI.next = t + 360; if (dir){ MSEL = (MSEL + dir + items.length) % items.length; menuMark(); sfx.ui(); } }
    else if (dir && t > PADUI.next){ PADUI.next = t + 140; MSEL = (MSEL + dir + items.length) % items.length; menuMark(); }
    if (edge(0)){ const b = items[MSEL]; if (b) b.dispatchEvent(new PointerEvent('pointerdown')); menuMark(); }
    else if ((edge(1) || edge(9)) && MENU.back) MENU.back();
    return;
  }
  PADUI.dir = dir;
  if (edge(9) && !GO.st) pause(!PAUSE);
}
// a buzz in the hands, for a blow that lands, one taken, and the big moments (Options: Rumble)
const buzz = (s, w, ms) => { if (OPT.rumble !== false) rumble(s, w, ms); };
// a press while someone is speaking, or a card is up: on with it
function press(){ if (TALK.on) TALK.press(); else if (NOTE && NOTE.t > 0.7){ NOTE = null; } }
addEventListener('pointerdown', () => { if (TALK.on || NOTE) press(); else if (STORY.active()) STORY.press(); });
// ---- the score (music.js): which piece, by where he is; it starts with the first key or touch (a browser's rule)
let MUSIC = null, HEARD = false, MUTED = (() => { try { return localStorage.getItem('climb-side-mute') === '1'; } catch (e){ return false; } })();
const hear = () => { HEARD = true; ac(); }; addEventListener('pointerdown', hear); addEventListener('keydown', hear);
addEventListener('keydown', e => { if (e.code === 'KeyM'){ MUTED = !MUTED; try { localStorage.setItem('climb-side-mute', MUTED ? '1' : '0'); } catch (err){} banner('', MUTED ? 'music off' : 'music on', 1.6); } });
const SCORE = makeScore(), AMB = { roots: 'cave', cloister: 'cave', spires: 'wind', tempest: 'storm', gardens: 'garden', firmament: 'wind' };
function score(){
  if (!HEARD) return; const A = ac(); if (!A) return; if (!MUSIC) MUSIC = makeMusic(A, musicBus() || A.destination);
  const k = STORY.kind, fight = BOSS && BOSS.active() && BOSS.st !== 'die', quiet = BOSS && (BOSS.st === 'die' || (BOSS.st === 'dead' && !WON));
  const here = R.look(), door = !fight && R.exits.find(x => x.on && x.next && Math.hypot(P.x - x.x, P.y - x.y) < 7);   // by an open way on, the next region can be heard
  const rec = k === 'title' || k === 'intro' ? 'title' : k === 'ending' ? 'ending' : fight ? (LEVEL.index === LEVELS.length - 1 ? 'boss_final' : 'boss') : here;
  const gen = k === 'title' || k === 'intro' ? 'title' : k === 'ending' ? 'ending' : fight ? 'boss_' + LEVEL.theme : here;
  // the recording of the piece if there is one; else the score made as it plays
  if (SCORE.has(rec) && !OPT.synth){ SCORE.play(quiet ? '' : rec); MUSIC.play(''); } else { SCORE.play(''); MUSIC.play(quiet ? '' : gen); }
  const v = MUTED ? 0 : PAUSE || TALK.on ? 0.35 : 1; SCORE.duck(v); MUSIC.volume(v * 0.7); MUSIC.tick();
  const amb = door ? door.next : here; ambience(k || MUTED ? '' : AMB[amb] || '', amb === 'tempest' ? 0.5 : door ? 0.45 : 0.3);
}
function hudBegin(){ const w = hud.clientWidth, h = hud.clientHeight, dpr = devicePixelRatio || 1; if (hud.width !== Math.round(w * dpr)){ hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr); } hx.setTransform(dpr, 0, 0, dpr, 0, 0); hx.clearRect(0, 0, w, h); }
const banner = (a, b, t = 3.2) => { BANNER = { a, b, t, life: t }; };
const FEEL_FX = { hitstop: 0, shake: 0, kick: 0 };
const FX2 = { ghosts: [], ghostT: 0, runDust: 0 };   // the dash's afterimages; the run's dust
// the aim assist: with nothing in reach ahead and a creature in reach behind, a swing turns to it
HOOKS.aim = P => {
  const reach = BLADE.reach + MV.aim; let ahead = false, behind = false;
  for (const e of E.list){ if (!e.alive || Math.abs(e.y - P.y) > 2.2) continue; const d = (e.x - P.x) * P.face; if (d > -0.3 && d < reach) ahead = true; else if (d <= -0.3 && d > -reach) behind = true; }
  return !ahead && behind ? -P.face : 0;
};
const CAM = { x: sp.x, y: sp.y + 2, lead: 0, zoom: 1 };
bindInput(); marks();
if (/[?&](level|play)\b/.test(location.search)){ NAMED = !(roomAt(sp.x, sp.y + 0.5) || {}).look; if (NAMED) banner(LEVEL.name, SUB[LEVEL.index] || '', 4); } else title();   // straight in with ?level=2 or ?play

// the drawings the masked warrior uses for these moves, where he has them
const MOVES = { roll: ['roll2_px', 'roll_px', 'roll'], flip: ['flip_px'], climb: ['climb_hang2', 'climb_px', 'climb_v3'], land: ['land_px', 'land_v3'] };
const LAND_T = 0.3;   // how long a landing plays (cut short if he runs on)
const SINK = 2 / 16;  // he is drawn two pixels into the floor's lip, so his boots stand in it, not on its outline
// the ledge climb, set on the ledge: for each frame of the drawing, the column and row of its canvas that sit on the
// ledge's corner (the wall's face, the ledge's top), so his hands hold the lip while he hangs, his arms come over it as
// he hauls, and his feet land on it. `depth` is how far his feet hang under the ledge in that frame, in pixels: he
// comes into the climb at the frame that fits how far under it he caught it (a full hang from far below, a scramble
// from just under). Tuned by eye against a drawn corner.
const CLIMB = {
  // made from a start frame of him hanging (PixelLab, a custom start frame): he hangs, hauls, gets his chest over, a knee
  // up, stands. Its canvas is 64 x 84
  climb_hang2: { first: 0, corner: { 0: [37, 24], 1: [38, 29], 2: [38, 32], 3: [37, 36], 4: [35, 40], 5: [32, 43], 6: [30, 46], 7: [28, 49], 8: [26, 52], 9: [25, 54], 10: [26, 54], 11: [29, 54] },
    depth: { 0: 43, 1: 41, 2: 39, 3: 34, 4: 27, 5: 22, 6: 16, 7: 9, 8: 2, 9: 0, 10: 0, 11: 0 } },
  climb_px: { first: 3, corner: { 3: [31, 7], 4: [31, 7], 5: [31, 8], 6: [30, 11], 7: [30, 14], 8: [33, 25], 9: [31, 31], 10: [27, 35], 11: [12, 43], 12: [14, 38] },
  depth: { 3: 41, 4: 42, 5: 42, 6: 41, 7: 37, 8: 24, 9: 19, 10: 14, 11: 0, 12: 0 } } };
let landT = 0;
const PLUNGE_LAND = 0.5; let PLUNGE_T = 0;   // how long the plunge's landing plays
// which of his animations, and how far into it (and, for a climb, to place it by where it ends)
function heroPose(P, t){
  const A = hero.meta ? hero.meta.anims : {}, has = n => !!A[n], pick = k => MOVES[k].find(has);
  if (WAKE > 0 && has('getup')) return ['getup', Math.min(0.999, Math.max(0, 1 - WAKE / 1.4))];   // where he fell: up off the ground
  if (P.mantle && pick('climb')){
    const name = pick('climb'), C = CLIMB[name], M = P.mantle;
    if (C && M.wall != null){
      const n = A[name].frames, hpx = (M.y1 - M.y0) * 16; let f0 = C.first; while (f0 < n - 2 && C.depth[f0] > hpx + 5) f0++;   // the frame that fits where he caught it
      const f = Math.min(n - 1, f0 + Math.floor(M.t / M.dur * (n - f0))), [cx, foot] = C.corner[f];
      return [name, (f + 0.5) / n, { cx, foot, ledge: true }];
    }
    return [name, Math.min(0.999, 0.15 + 0.85 * M.t / M.dur), 'last'];   // its first frames are him standing: from the reach up
  }
  if (P.hp <= 0 && has('hurt')) return ['hurt', 0.999];
  if (P.hurtT > 0 && has('hurt')) return ['hurt', 1 - P.hurtT / MV.hurtStun];
  if (P.roll > 0 && pick('roll')) return [pick('roll'), 1 - P.roll / MV.roll.time];
  if (P.flip > 0 && !P.grounded && pick('flip')) return [pick('flip'), Math.min(0.999, 0.08 + 0.92 * (1 - P.flip / MV.flip))];   // the double jump's somersault, drawn
  // the plunge: the blade turned point-down (two frames), then the dive held, the cape streaming; drawn by his boots, so
  // the blade reaches below his feet
  if (P.dive && has('plunge_fall')){ const t = P.dive.t || 0, f = t < 0.12 ? Math.floor(t / 0.12 * 2) : 2 + Math.floor((t - 0.12) * 12) % 6; return ['plunge_fall', (f + 0.5) / 8, { foot: 46 }]; }
  if (P.dive && has('plunge')) return ['plunge', 0.6];
  // its landing: the blade driven in, a deep crouch, up again (its last eight frames); cut short if he moves off
  if (P.grounded && PLUNGE_T > 0 && has('plunge_land') && !(Math.abs(P.vx) > 1.5 && P.plant <= 0)) return ['plunge_land', (4 + Math.min(7.99, (1 - PLUNGE_T / PLUNGE_LAND) * 8)) / 12];
  if (P.atk){
    // the swing's drawing, timed so the blade lands on its impact frame as the cut strikes
    const W = swingOf(P, P.atk), sw = has(W.anim) ? W.anim : { 0: 'attack1', 1: 'attack2', 2: 'attack3' }[P.atk.i];
    if (has(sw)){
      const hit = W.hit || 0.5, end = W.hitEnd || hit + 1 / A[sw].frames, t = P.atk.t, ph = P.atk.phase;
      const f = ph === 'wind' ? hit * t / W.wind : ph === 'active' ? hit + (end - hit) * t / W.active : end + (1 - end) * t / W.rec;
      return [sw, Math.min(0.999, f)];
    }
  }
  if (!P.grounded && !P.mantle){
    if (P.vy > 0 && has('jump')) return ['jump', Math.min(0.999, P.jumpT / 0.45)];
    if (has('fall')) return ['fall', t * 2];
    if (has('jump')) return ['jump', 0.8];
  }
  if (P.grounded && landT > 0 && pick('land') && !(Math.abs(P.vx) > 1.5 && landT < LAND_T - 0.08)) return [pick('land'), Math.min(0.999, 0.2 + 0.8 * (1 - landT / LAND_T))];   // from the moment his feet meet the floor
  if (P.grounded && Math.abs(P.vx) > 0.3){ const run = has('sprint') ? 'sprint' : 'run'; if (has(run)) return [run, (P.dist || 0) / 2.6]; }
  if (has('idle')) return ['idle', t / 1.4];
  return ['stand', 0];
}

let last = 0, acc = 0, time = 0;
// capture: for recording play frame by frame (tools), the game moves only when asked, a fixed step each time
const CAPTURE = { on: false, left: 0, dt: 1 / 24 };
function frame(ts){
  const now = ts / 1000; let dt = last ? Math.min(0.05, now - last) : 1 / 60; last = now;
  if (CAPTURE.on){ if (CAPTURE.left <= 0){ requestAnimationFrame(frame); return; } CAPTURE.left--; dt = CAPTURE.dt; }
  pollPads(); padUI(); score();
  PBTN.style.display = STORY.active() || DEVICE.kind !== 'touch' ? 'none' : 'block';
  if (DIRTY > 0 && (DIRTY -= dt) <= 0) store();
  if (TALK.on || NOTE){   // someone is speaking, or a card is up: the world waits
    if (IN.pressed.has('jump') || IN.pressed.has('attack')){ IN.pressed.clear(); press(); }
    if (NOTE) NOTE.t += dt; drawHud(dt); endFrame(); requestAnimationFrame(frame); return; }
  if (PAUSE){ drawHud(0); endFrame(); requestAnimationFrame(frame); return; }
  if (STORY.active() && !GO.st){ hudBegin(); STORY.draw(dt); endFrame(); requestAnimationFrame(frame); return; }   // a story screen is up: the world waits
  if (WAKE > 0) WAKE -= dt;
  if (!NAMED && R.look() === LEVEL.theme && !GO.st){ NAMED = true; banner(LEVEL.name, SUB[LEVEL.index] || '', 4.5); sfx.gust(); }   // out of the way in: this is the new place
  // an open way on breathes the next region out: its air drifts from the arch
  for (const x of R.exits) if (x.on && Math.random() < dt * 16){ const a = Math.random() * Math.PI * 2; fx.burst({ x: x.x + Math.cos(a) * 0.6, y: x.y + 1.3 + Math.sin(a) * 0.9 }, 1, x.cols[Math.random() < 0.5 ? 0 : 1]); }
  for (let i = LATER.length - 1; i >= 0; i--) if ((LATER[i].t -= dt) <= 0){ const L = LATER[i]; LATER.splice(i, 1); L.f(); }
  // hit-stop: a hit freezes the world a few frames (the effects keep running)
  let sdt = dt; if (FEEL_FX.hitstop > 0){ FEEL_FX.hitstop -= dt; sdt = dt * 0.06; }
  if (SLOW > 0){ SLOW -= dt; sdt *= 0.3; }   // a boss's last moment, drawn out
  FLASH = Math.max(0, FLASH - dt); PLAYED += dt; PHASE.t += sdt; PROPS.step(sdt, time);
  if (PROPS.glass.some(K => K.turned && Math.abs(K.x - P.x) < 11 && Math.abs(K.y - P.y) < 7)) sfx.glass();   // the star-glass turns: it can be heard
  acc += sdt; time += dt;
  const evs = [];
  // what is in reach to use: someone to talk to, a chest to open (down)
  USE = P.hp > 0 && P.grounded && !FLIGHT && !GO.st && WAKE <= 0 && !(BOSS && BOSS.active() && BOSS.st !== 'dead') ? ITEMS.near(P) : null;
  if (USE && IN.pressed.has('down')){ IN.pressed.delete('down'); if (USE.type === 'npc') talkTo(USE); else ITEMS.open(USE, evs); }
  const h = 1 / 120;
  while (acc >= h){ const x0 = P.x; if (DEATH <= 0 && !FLIGHT && !GO.st && WAKE <= 0) stepPlayer(P, h); P.dist = (P.dist || 0) + Math.abs(P.x - x0); acc -= h; }
  endFrame();
  if (P.hp > 0 && !FLIGHT && !GO.st && (TRAILT -= dt) <= 0){ TRAILT = 0.05; const [an, fr] = heroPose(P, time); TRAIL.push({ x: P.x, y: P.y, face: P.face, an, fr });
    if (TRAIL.length > 2400) TRAIL.splice(0, 1200, ...TRAIL.slice(0, 1200).filter((_, i) => i % 2)); }   // a long way: the far end of it kept more thinly
  stepEnemies(E, P, sdt, fx, evs); ITEMS.step(sdt, time, P, evs);
  { const RD = REGION_DATA[LEVEL.index]; if (RD.tick) RD.tick(sdt, time, TICK); }   // the region's own weather and workings (its file)
  if (BOSS) BOSS.step(P, sdt, fx, evs);
  for (const e of P.events) onEvent(e);
  P.events.length = 0;
  for (const e of evs) onEvent(e);
  // a death: he is gone in a burst; the scarf hangs there a moment, then goes back alone to the last shrine (or the
  // start), and he gets up under it. The boss waits again
  // a fall. He is gone in a burst; then everything he did since he last rose runs back, fast (FLIGHT: his own path, the
  // other way), to the water at the bottom of the world, which gives him back (raise): he gets up at the last flame he
  // reached. What he killed is there again. What he found, lit and learned is kept
  if (P.hp <= 0 && DEATH <= 0 && !FLIGHT){ DEATH = 0.7; P.vx = 0; fx.burst({ x: P.x, y: P.y + 0.9 }, 36, 0xff5060); fx.burst({ x: P.x, y: P.y + 1.5 }, 14, 0xffffff); FEEL_FX.hitstop = 0.22; R.glint(P.x, P.y + 1, 0xff6050, 1, 5, 0.4); sfx.hurt(); sfx.death(); buzz(1, 1, 450); }
  if (DEATH > 0){ DEATH -= dt; if (DEATH <= 0){ const n = TRAIL.length; G.falls = (G.falls || 0) + 1; FLIGHT = { t: 0, dur: Math.max(1.2, Math.min(2.8, 1.0 + n * 0.0015)), n, x: P.x, y: P.y + 1.3, face: P.face, g: 0 }; sfx.rewind(); SCORE.warp(2.4); } }
  if (FLIGHT){
    const F = FLIGHT; F.t += dt; const u = Math.min(1, F.t / F.dur), e = u * u * (0.4 + 0.6 * u);   // slowly at first, then faster than can be followed
    if (F.n > 1){ const k = (1 - e) * (F.n - 1), i = Math.floor(k), a = TRAIL[i], b = TRAIL[Math.min(F.n - 1, i + 1)], f = k - i; F.s = a; P.x = a.x + (b.x - a.x) * f; P.y = a.y + (b.y - a.y) * f; P.face = a.face; }
    P.mantle = null; P.roll = 0; P.flip = 0; P.dive = null; P.atk = null; F.x = P.x; F.y = P.y + 1.3; F.face = P.face;
    if ((F.g -= dt) <= 0 && hero.sprite && F.s){ F.g = 0.028; const m = hero.sprite.ghost(0x9fd0ff); if (m) FX2.ghosts.push({ m, life: 0.22 }); }
    if (Math.random() < 0.6) fx.burst({ x: P.x, y: P.y + 1.2 }, 1, 0xcfe6ff);
    if (u >= 1){ FLIGHT = null; SCORE.warp(1); raise(); }
  }
  for (const S of SHRINES) if (Math.abs(P.x - S.x) < 1.1 && Math.abs(P.y - S.y) < 1.5 && P.hp > 0 && (CHECK !== S || P.flask < P.flaskMax || P.hp < P.maxHp)){
    const first = CHECK !== S; CHECK = S; P.flask = P.flaskMax; P.hp = P.maxHp; if (first) sfx.shrine(); else sfx.drink(); store(); fx.ring({ x: S.x, y: S.y + 1 }, 0xffd27a); R.glint(S.x, S.y + 1, 0xffd27a, 1, 7, 0.8);
    if (first) banner('A flame is kept here', 'when he falls, he will be raised beside it');
  }
  if ((!BOSS || BOSS.st === 'dead') && !WON && R.exits.some(x => Math.abs(P.x - x.x) < 1 && Math.abs(P.y - x.y) < 1.5)){
    WON = true; sfx.gold();
    if (LEVEL.index < LEVELS.length - 1) go(LEVEL.index + 1); else { G.done = true; store(); STORY.start('ending', {}, title); }   // the beacon: the end of the climb
  }
  if (GO.st){
    GO.t += dt;
    if (GO.st === 'out' && GO.t > 0.6){ GO.st = 'load'; GO.t = 0; }                 // a frame fully dark before the work
    else if (GO.st === 'load' && GO.t > 0.05){ const up = GO.to === GO.from + 1; enter(GO.to); acc = 0; GO.t = 0;
      if (up){ GO.st = 'card'; STORY.start('card', { from: GO.from, to: GO.to, name: LEVEL.name, line: CARD[GO.to] || '' }, () => { GO.st = 'in'; GO.t = 0; }); } else GO.st = 'in'; }   // going up: the card shows the mountain and where he is on it
    else if (GO.st === 'in' && GO.t > 0.7) GO.st = '';
    if (GO.st === 'card'){ hudBegin(); STORY.draw(dt); endFrame(); requestAnimationFrame(frame); return; }
  }
  // camera
  // in the Warden's arena the camera draws back to show the whole fight, and keeps inside the arena
  const fight = BOSS && BOSS.active();
  CAM.zoom = 1;   // flat pixels are never scaled: the arena is framed by where the camera keeps
  CAM.lead += (P.face * 2.4 - CAM.lead) * Math.min(1, dt * 2.2);
  let wantX = P.x + CAM.lead, wantY = P.y + 1.8 + (P.grounded ? 0 : Math.min(0, P.vy) * 0.08);
  if (FLIGHT){ wantX = FLIGHT.x; wantY = FLIGHT.y + 0.6; }   // the view goes back with him
  if (fight) wantY = Math.max(wantY, BOSS.stageY + 4.6);   // the stage near the bottom, the Warden's head near the top
  CAM.x += (wantX - CAM.x) * Math.min(1, dt * (FLIGHT ? 16 : 5)); CAM.y += (wantY - CAM.y) * Math.min(1, dt * (FLIGHT ? 16 : P.grounded ? 4 : 6));
  const halfH = VIEW_H / 2 * CAM.zoom, halfW = halfH * (R.size().w / R.size().h);
  const box = fight && !FLIGHT ? BOSS.room : { x0: 0, y0: 0, x1: LEVEL.W * T, y1: LEVEL.H * T };
  const cx = Math.max(box.x0 + halfW, Math.min(box.x1 - halfW, CAM.x)), cy = Math.max(box.y0 + halfH, Math.min(box.y1 - halfH, CAM.y));
  FEEL_FX.shake = Math.max(0, FEEL_FX.shake - dt * 1.2); const sk = FEEL_FX.shake * OPT.shake;
  FEEL_FX.kick *= Math.exp(-dt * 14);   // a blow nudges the view the way it goes
  R.setCamera(cx + (Math.random() - 0.5) * sk + FEEL_FX.kick, cy + (Math.random() - 0.5) * sk, CAM.zoom);
  // the warrior (not while he is dead and the scarf is on its way)
  const gone = P.hp <= 0 && DEATH < 0.45 && !FLIGHT; if (hero.sprite) hero.sprite.g.visible = !gone;
  if (hero.sprite){
    const pose = heroPose(P, time), RW = FLIGHT && FLIGHT.s, anim = RW ? RW.an : pose[0], frac = RW ? RW.fr : pose[1], anchor = RW ? null : pose[2];   // running back: the drawing he had there
    let rot = 0;
    if (P.flip > 0 && !MOVES.flip.includes(anim)){ const q = 1 - P.flip / MV.flip; rot = -Math.PI * 2 * Math.min(1, q * 1.1) * (P.face < 0 ? -1 : 1); }   // no drawn flip: turn the sprite
    if (anchor && anchor.ledge) hero.sprite.show(anim, frac, P.mantle.wall, P.mantle.y1 - SINK, P.mantle.d, 0.05, 0, anchor);   // the climb, on the ledge's corner
    else if (anchor && typeof anchor === 'object') hero.sprite.show(anim, frac, P.x, P.y - SINK, P.face, 0.05, 0, anchor);
    else if (anchor === 'last'){
      // the climb is drawn rising a little under a unit; what the ledge is higher than that, he is eased up through
      const M = P.mantle, A = hero.meta.anims[anim], drawn = (A.foot - A.footLast) / (hero.meta.ppu || 16), u = Math.min(1, M.t / M.dur), e = u * u * (3 - 2 * u);
      hero.sprite.show(anim, frac, M.x1, M.y1 - SINK - Math.max(0, (M.y1 - M.y0) - drawn) * (1 - e), P.face, 0.05, 0, 'last');
    }
    else hero.sprite.show(anim, frac, P.x, P.y - SINK, P.face, 0.05, rot);

    SWINGFX.show(anim, frac, P.x, P.y - SINK, P.face);
    // the dash cut leaves afterimages and streaks, and kicks the floor up behind him
    FX2.dashGhost = Math.max(0, (FX2.dashGhost || 0) - dt);
    if (((P.atk && P.atk.special === 'dash' && P.atk.phase !== 'rec') || FX2.dashGhost > 0) && (FX2.ghostT -= dt) <= 0){
      FX2.ghostT = 0.035; const m = hero.sprite.ghost(0x4fc8ff); if (m) FX2.ghosts.push({ m, life: 0.22 });
      fx.streak({ x: P.x, y: P.y }, P.face); if (P.grounded) fx.kick({ x: P.x, y: P.y }, -P.face, 3, 3);
    }
  }
  for (let i = FX2.ghosts.length - 1; i >= 0; i--){ const G = FX2.ghosts[i]; G.life -= dt; G.m.material.opacity = Math.max(0, G.life / 0.22) * 0.8; if (G.life <= 0){ R.scene.remove(G.m); G.m.material.map.dispose(); G.m.material.dispose(); FX2.ghosts.splice(i, 1); } }
  landT = Math.max(0, landT - dt); PLUNGE_T = Math.max(0, PLUNGE_T - dt);
  // dust at his feet as he runs, now and then
  if (P.grounded && Math.abs(P.vx) > 4 && !P.atk){ FX2.runDust += Math.abs(P.vx) * dt; if (FX2.runDust > 1.3){ FX2.runDust = 0; fx.kick({ x: P.x, y: P.y }, -Math.sign(P.vx), 3, 1.4); } }
  if (hero.sprite){
    hero.sprite.mat.emissive.setHex(FLIGHT ? 0x4a6a90 : P.inv > 0 && Math.floor(time * 20) % 2 ? 0x803030 : 0x000000);
  }
  // the scarf: from his neck (lower when he crouches or rolls), as long as his hearts; the wind is the region's
  { const M = P.mantle, low = P.roll > 0 ? 0.8 : P.crouch ? 1.15 : P.dive ? 1.5 : WAKE > 0.5 ? 0.9 : 1.92;
    const ax = FLIGHT ? FLIGHT.x : M ? M.wall - M.d * 0.25 : P.x - P.face * 0.14, ay = FLIGHT ? FLIGHT.y : M ? Math.min(M.y1 + 1.8, P.y + 1.9) : P.y + low - SINK, fc = FLIGHT ? FLIGHT.face : M ? M.d : P.face;
    const links = hp => SCARF.base + Math.min(5, Math.max(0, hp)) * SCARF.perHeart + Math.max(0, hp - 5) * SCARF.more, want = links(FLIGHT ? 1 : P.hp), lk = R.look(), out = (roomAt(P.x, P.y) || {}).open !== false, wind = (lk === 'spires' || lk === 'tempest') && out ? (lk === 'tempest' ? -7 : -5) : lk === 'spires' || lk === 'tempest' || lk === 'firmament' ? -1.2 : lk === 'gardens' && out ? -2 : -0.6;
    SCF.step(dt, ax, ay, fc, want, wind, solidAt, P.glide ? 15 : 0); SCF.draw(!(P.hp <= 0 && DEATH > 0.45 && !FLIGHT) || true, EMBER.n / EMBER.max * (P.hp < P.maxHp ? 1 : 0.6)); }
  // embers go to him; ten make a heart
  stepFx(fx, dt, P.hp > 0 ? { x: P.x, y: P.y + 1.3 } : null, () => {
    EMBER.n = Math.min(EMBER.max, EMBER.n + 1); sfx.step();
    if (EMBER.n >= EMBER.max && P.hp < P.maxHp){ EMBER.n = 0; P.hp++; sfx.drink(); fx.ring({ x: P.x, y: P.y + 1.2 }, 0xff8060); R.glint(P.x, P.y + 1.2, 0xff8060, 0.9, 5, 0.5); }
  });
  if (EMBER.n >= EMBER.max && P.hp > 0 && P.hp < P.maxHp){ EMBER.n = 0; P.hp++; sfx.drink(); fx.ring({ x: P.x, y: P.y + 1.2 }, 0xff8060); }   // a full ten kept until it was needed
  R.frame(time, P);
  drawHud(dt);
  requestAnimationFrame(frame);
}
// cracked rock within r of a blow: it breaks if he has the Warden's weight; if not, he is told once what it wants
const HINTED = {}, LATER = []; let PURSE = 0, USE = null, TRAILT = 0;
function breakRock(x, y, r){
  if (r < 0){ if (!CAN.breaker && PROPS.nearCrack(x, y, 1.3) && !HINTED.crack){ HINTED.crack = 1; banner('', 'cracked stone: something heavier would break it', 3); } return; }
  if (!PROPS.nearCrack(x, y, r)) return;
  if (!CAN.breaker){ if (!HINTED.crack){ HINTED.crack = 1; banner('', 'cracked stone: something heavier would break it', 3); } return; }
  for (const C of PROPS.breakAt(x, y, r)){
    sfx.break(); fx.dust({ x: C.x, y: C.y - C.h / 2 }, 30, 5); fx.burst({ x: C.x, y: C.y }, 26, 0xc0cbdc); R.shock(C.x, C.y, true); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.4);
    (G.broke[LEVEL.index] = G.broke[LEVEL.index] || []).push(C.id); store();
  }
}
// someone is spoken to: all they have to say here the first time, the last of it after; the Scribe counts what is unfound,
// the Lamplighter trades when he has spoken
function talkTo(N){
  const k = LEVEL.index + ':' + N.who, n = G.met[k] || 0, S0 = (SCRIPT[N.who] || [])[LEVEL.index] || ['...'], lines = n === 0 ? S0.slice() : [S0[S0.length - 1]];
  if (N.who === 'scribe'){ const L = ITEMS.left(), pl = (c, w) => `${c} ${w}${c === 1 ? '' : 's'}`; lines.push(L.threads + L.chests === 0 ? 'My page for this place is full. There is nothing here you have not found.' : `Not yet entered as found, here: ${pl(L.threads, 'red strand')}, ${pl(L.chests, 'chest')}${L.relic ? ', and something old behind cracked stone' : ''}.`); }
  G.met[k] = n + 1; store(); release(); sfx.ui(); TALK.start(N.who, lines, N.who === 'lamplighter' ? shop : null, N.art);
}
// the water gives him back: its screen, then he gets up at the last flame he reached (or where the region begins), whole.
// The creatures are there again
const POOL_LINES = ['The water gives him back.', 'Again.', 'He is raised. It is not his doing.', 'What falls here does not stay fallen.', 'The light has not let go of the thread.', 'Up. He is expected.', 'It costs him nothing. That is the hard part.'];
function raise(){
  const s = CHECK || spawnPoint(), keep = EMBER.n, n = G.falls || 1;
  P = born(s.x, s.y); refill(); if (BOSS) BOSS.reset(); EMBER.n = keep; SCF.reset(s.x, s.y + 1.8); TRAIL.length = 0; CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0; FX2.ghosts.forEach(G2 => { G2.life = 0; }); store();
  STORY.start('pool', { line: POOL_LINES[(n - 1) % POOL_LINES.length], count: n > 1 ? `RAISED ${n} TIMES` : '' }, () => { WAKE = 1.1; fx.ring({ x: s.x, y: s.y + 1 }, 0xcfe6ff); R.glint(s.x, s.y + 1, 0xcfe6ff, 1.2, 7, 0.9); sfx.shrine(); });
}
// the creatures of the region, made again (what a creature made for itself in the scene goes with it)
function refill(){
  for (const e of E.list) for (const v of Object.values(e)){ if (!v || typeof v !== 'object') continue; if (v.isObject3D) R.scene.remove(v); else if (v.g && v.g.isObject3D) R.scene.remove(v.g); else if (v.m && v.m.isObject3D) R.scene.remove(v.m); }
  E = spawnEnemies(R.scene, R);
}
// what a region's tick is handed: the renderer, him, the effects, sound, a flash of the whole picture, a shake
const TICK = { R, get P(){ return P; }, get fx(){ return fx; }, sfx, LEVEL, flash: v => { FLASH = Math.max(FLASH, v); }, shake: v => { FEEL_FX.shake = Math.max(FEEL_FX.shake, v); }, get room(){ return roomAt(P.x, P.y); } };
function onEvent(e){
  const at = { x: P.x, y: P.y };
  switch (e.type){
    case 'jump': sfx.jump(); fx.puff(at, 8, 1.6); break;
    case 'doubleJump': sfx.jump(); fx.ring(at, 0x9ff0ff); FX2.flipped = true; break;
    case 'land': sfx.step(); fx.puff(at, e.hard ? 20 : 8, e.hard ? 3.2 : 2); if (e.hard) FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); if (e.hard || (e.drop || 0) > 0.8 || FX2.flipped){ landT = LAND_T; } FX2.flipped = false; break;
    case 'slam': { PLUNGE_T = PLUNGE_LAND; landT = 0; sfx.slam(); fx.puff(at, 24, 3.6); R.shock(P.x, P.y + 0.3, true); fx.ring(at, 0xffd27a);
      buzz(0.55, 0.45, 150); const storm = has('stormglass'), rad = MV.dive.radius * (storm ? 1.5 : 1), dmg = MV.dive.dmg + (storm ? 1 : 0) + (G.edge ? 1 : 0), out = [];
      if (storm){ sfx.thunder(); R.glint(P.x, P.y + 1, 0xcfe6ff, 1.4, 8, 0.25); FLASH = Math.max(FLASH, 0.1); for (let k = 0; k < 14; k++) fx.burst({ x: P.x + (Math.random() - 0.5) * 0.5, y: P.y + k * 0.7 }, 3, 0xcfe6ff); }
      slamEnemies(E, P, rad, dmg, out); if (BOSS) BOSS.slam(P, rad, dmg, out); ITEMS.slam(P, rad, out); breakRock(P.x, P.y + 0.2, 1.5); for (const o of out) onEvent(o); break; }
    case 'roll': sfx.whoosh(); fx.kick(at, -P.rollDir, 10, 2.6); break;
    case 'dashCut': sfx.dash(); fx.kick(at, -P.face, 14, 3.4); FX2.ghostT = 0; break;
    case 'dive': sfx.whoosh(); break;
    case 'glide': sfx.glide(); if (LEVEL.updrafts.some(u => P.x >= u.x0 && P.x < u.x1 && P.y + 1 >= u.y0 && P.y + 1 < u.y1)) sfx.gust(); break;
    case 'airDash': sfx.dash(); fx.ring({ x: P.x, y: P.y + 1 }, 0xffd27a); FX2.dashGhost = 0.2; break;
    case 'bloom': sfx.bloom(); PROPS.bounce(e.m); fx.puff(at, 14, 3); fx.burst({ x: P.x, y: P.y + 0.3 }, 10, 0xf6757a); R.glint(P.x, P.y + 0.5, 0xfeae34, 0.7, 4, 0.3); break;
    case 'strike': {
      // the blow: the swoosh of light, the air bending round it, the floor kicked up, a thump, the view nudged
      const big = e.finisher, tilt = { atk_slam_v3: -0.7, atk_slam_px: -0.7, atk_rise_px: 1.0, atk_spin_px: 0.1, atk_dash_px: 0.25 }[e.sw.anim] || 0;
      sfx.swing(big); if (!SWINGFX.has(e.sw.anim)) fx.crescent({ x: P.x + P.face * 1.15, y: P.y + 1.25 }, P.face, big, tilt);   // the combo's cuts have their own drawn effect
      R.glint(P.x + P.face * 1.3, P.y + 1.3, big ? 0xffd27a : 0xbfe8ff, big ? 0.9 : 0.6, 4.5, 0.22); R.shock(P.x + P.face * 1.3, P.y + 1.2, big);
      if (P.grounded) fx.kick(at, -P.face, big ? 12 : 7, big ? 3 : 2.2);
      FEEL_FX.shake = Math.max(FEEL_FX.shake, big ? 0.14 : 0.07); FEEL_FX.kick = P.face * (big ? 0.22 : 0.12);
      // the dash cut strikes all along where he dashed
      const from = e.sw.dash && P.dashFrom != null ? { ...P, x: P.dashFrom } : P, reach = BLADE.reach + (e.sw.dash && P.dashFrom != null ? Math.abs(P.x - P.dashFrom) : 0);
      const dmg = e.sw.dmg + (big && has('whetstone') ? 1 : 0) + (G.edge >= 2 || (G.edge && big) ? 1 : 0), out = [];   // the whetstone, and the tempering
      strikeEnemies(E, from, reach, dmg, out); if (BOSS) BOSS.strike(from, reach, dmg, out); ITEMS.strike(from, reach, out);
      breakRock(P.x + P.face * 1.2, P.y + 1.2, big ? 1.3 : -1); for (const o of out) onEvent(o); break; }
    case 'hit': buzz(e.heavy ? 0.35 : 0.15, e.heavy ? 0.5 : 0.3, e.heavy ? 90 : 50); sfx.hit(); fx.burst(e.at, e.heavy ? 18 : 12, 0xffe0a8); R.glint(e.at.x, e.at.y, 0xffe0a8, e.heavy ? 0.9 : 0.6, 3.5, 0.16); FEEL_FX.hitstop = e.heavy ? 0.09 : 0.05; FEEL_FX.shake = Math.max(FEEL_FX.shake, e.heavy ? 0.18 : 0.1); break;
    case 'kill': sfx.kill(); ITEMS.spill(e.at.x, e.at.y, 1 + Math.min(5, e.e ? e.e.d.hp : 1)); fx.burst(e.at, 26, 0xff70d0); fx.ring(e.at, 0xffc0ff); FEEL_FX.hitstop = 0.1; fx.ember(e.at, 2 + Math.min(5, e.e ? e.e.d.hp : 2)); R.glint(e.at.x, e.at.y, 0xff9040, 1, 5, 0.35); break;
    case 'parry': buzz(0.3, 0.7, 110); sfx.parry(); fx.ring(e.at, 0x9fd0ff); FEEL_FX.hitstop = 0.12; break;
    case 'block': sfx.block(); fx.burst(e.at, 8, 0xc9d2e0); break;
    case 'spit': sfx.spit(); break;
    case 'tell': e.e.tellT = 0.6; break;
    case 'step': sfx.step(); break;
    case 'mantle': sfx.whoosh(); break;
    case 'hurt': { buzz(0.7, 0.5, 200); sfx.hurt(); fx.burst({ x: P.x, y: P.y + 1.3 }, 10, 0xff6060); const a = SCF.tip(); fx.burst({ x: a.x, y: a.y }, 12, 0xff7030); fx.burst({ x: a.x, y: a.y }, 6, 0xfee761); FLASH = Math.max(FLASH, 0.12); break; }   // the end of the scarf burns off
    case 'skid': fx.kick(at, Math.sign(P.vx) || P.face, 6, 2.2); break;
    case 'bossWake': buzz(0.6, 0.4, 500); sfx.roar(); FEEL_FX.shake = 0.5; BOSS.shown = false; break;   // its name comes up with the bars (drawHud)
    case 'bossToll': sfx.parry(); sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2); break;
    case 'bossTell': sfx.creak(); break;
    case 'bossSlam': buzz(e.soft ? 0.4 : 0.8, 0.5, e.soft ? 120 : 260); sfx.impact(true); sfx.slam(); fx.dust(e.at, e.soft ? 10 : 26, 4); R.glint(e.at.x, e.at.y + 0.5, 0xffd27a, e.soft ? 0.4 : 0.9, 6, 0.3); if (!e.soft) fx.ring(e.at, 0xffd27a); FEEL_FX.shake = Math.max(FEEL_FX.shake, e.soft ? 0.18 : 0.42); break;
    case 'bossSweep': sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.15); break;
    case 'rockLand': sfx.crack(); fx.dust(e.at, 8, 2); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); break;
    case 'bossPhase': sfx.roar(); FEEL_FX.shake = 0.6; banner(BOSS.name + ' rages', BOSS.rage); break;
    case 'bossDie': buzz(1, 0.9, 700); sfx.roar(); sfx.bossDie(); FEEL_FX.hitstop = 0.3; FEEL_FX.shake = 0.8; SLOW = 1.3; FLASH = 0.5; break;
    case 'bossDead': { for (const x of R.exits) x.set(true); sfx.door(); banner(BOSS.name + ' falls', BOSS.fell); ITEMS.spill(BOSS.cx, BOSS.stageY + 2, 60);
      // what it leaves him, the first time
      const n = LEVEL.index, t = TEACH[n];
      if (!G.beat[n]){ G.beat[n] = true; if (t && t.heart){ G.hearts += t.heart; P.maxHp = maxHearts(); P.hp = P.maxHp; } if (t && t.flask){ G.flasks += t.flask; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } learn(); store();
        if (t && t.name) LATER.push({ t: 3.4, f: () => { NOTE = { title: t.name, lines: t.lines, t: 0 }; sfx.ability(); release(); } }); }
      break; }
    case 'shard': G.shards += e.v; sfx.shard(); PURSE = 2.5; DIRTY = DIRTY > 0 ? DIRTY : 2; break;
    case 'urn': sfx.urn(); fx.dust(e.at, 10, 3); fx.burst(e.at, 6, 0xd77643); break;
    case 'chest': sfx.chest(); fx.ring(e.at, 0xffd27a); fx.burst(e.at, 16, 0xfee761); R.glint(e.at.x, e.at.y, 0xffd27a, 1, 5, 0.5); break;
    case 'thread': { G.threads++; sfx.thread(); fx.ring(e.at, 0xff5040); fx.burst(e.at, 18, 0xe43b44); R.glint(e.at.x, e.at.y, 0xff5040, 1, 5, 0.5); const k = G.threads % THREADS_A_HEART;
      if (k === 0){ const m = maxHearts(); if (m > P.maxHp){ P.maxHp = m; P.hp = m; } banner('The thread lengthens', 'three strands: a heart more', 4); } else banner('A red strand', `${k} of ${THREADS_A_HEART} toward a heart`, 3.4);
      store(); break; }
    case 'relic': { const r = RELICS[e.id]; if (!r || has(e.id)) break; G.relics.push(e.id); learn(); store(); sfx.relic(); LATER.push({ t: 0.7, f: () => { NOTE = { title: r.name, lines: [r.line], t: 0, relic: true }; release(); } }); break; }
    case 'flask': if (P.flask > 0 && P.hp < P.maxHp){ P.flask--; P.hp = Math.min(P.maxHp, P.hp + TUNE.player.flaskHeal); sfx.drink(); fx.ring({ x: P.x, y: P.y + 0.8 }, 0x5ce1c6); } break;
  }
}
// the lines of help at the foot of the screen, for what he is playing with. A controller's are its own buttons, as bound
const PADN = { xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT'], ps: ['CROSS', 'CIRCLE', 'SQUARE', 'TRIANGLE', 'L1', 'R1', 'L2', 'R2'] };
const padKey = a => { const i = (SET.pad[a] || [])[0], N = PADN[DEVICE.kind === 'ps' ? 'ps' : 'xbox']; return i == null ? '-' : N[i] || 'B' + i; };
const HINT = { keys: ['A D MOVE · SPACE JUMP, AGAIN IN THE AIR · SHIFT ROLL', 'CLICK CUT · S + CLICK RISING CUT · CLICK IN A ROLL: DASH CUT', 'S + CLICK IN THE AIR: PLUNGE · S + SPACE: DROP · S: TALK, OPEN · ESC PAUSE'], touch: ['TOUCH THE LEFT OF THE SCREEN AND DRAG TO MOVE', 'DRAG DOWN: CROUCH, TALK, OPEN · DOWN + A IN THE AIR: PLUNGE'],
  get pad(){ const k = padKey; return [`STICK MOVE · ${k('jump')} JUMP, AGAIN IN THE AIR · ${k('roll')} ROLL · ${k('attack')} CUT · ${k('block')} BLOCK`, `DOWN + ${k('attack')}: RISING CUT · DOWN + ${k('attack')} IN THE AIR: PLUNGE · ${k('flask')} DRINK`, `DOWN: TALK, OPEN · DOWN + ${k('jump')}: DROP · START: PAUSE`]; } };
const EPITHET = LEVELS.map(l => l.epithet);
function drawHud(dt){
  HUD.begin(R.size().w); const W = HUD.W, v = new window.THREE.Vector3();
  // a red ! over a creature winding up
  for (const e of E.list){ if (!e.alive || !(e.tellT > 0)) continue; e.tellT -= dt; v.set(e.x, e.y + e.d.h + 0.7, 0).project(R.camera); HUD.tell(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * 180)); }
  const rising = !!(BOSS && BOSS.st === 'rise');
  HUD.cinema(rising, dt, rising ? BOSS.name : '', EPITHET[LEVEL.index] || '', rising ? BOSS.tm : 0);
  if (BOSS && BOSS.st === 'fight' && !BOSS.shown){ BOSS.shown = true; banner('', BOSS.hint, 3.5); }   // once it is up: how it is hurt
  if (!rising && !TALK.on && !FLIGHT){
    HUD.status(P, EMBER.n, EMBER.max, P.flaskMax, time); PURSE = Math.max(0, PURSE - dt); HUD.purse(P, P.flaskMax, G.shards, PURSE, G.threads % THREADS_A_HEART, THREADS_A_HEART);
    const room = roomAt(P.x, P.y); if (room) MAP.seen.add(room);
    const place = LEVEL.name + (room ? ' · ' + room.name : ''); if (place !== PLACE.name){ PLACE.name = place; PLACE.t = 0; } PLACE.t += dt;
    HUD.place(place, PLACE.t < 3 ? 1 : Math.max(0.45, 1 - (PLACE.t - 3) * 0.5));
    HUD.boss(BOSS && BOSS.hud(), dt);
    const dots = SHRINES.filter(S => MAP.seen.has(S.room)).map(S => ({ x: S.x, y: S.y + 0.5, c: '#fee761' }));
    if (BOSS && MAP.seen.has(BOSS.room)) dots.push({ x: BOSS.cx, y: BOSS.stageY + 1, c: BOSS.st === 'dead' ? '#5a6988' : '#e43b44', r: 1 });
    if (has('starcompass') || G.charts.includes(LEVEL.index)) for (const it of ITEMS.left().all) dots.push({ x: it.x, y: it.y + 0.5, c: it.type === 'thread' ? '#e43b44' : '#feae34' });   // what is still to be found
    dots.push({ x: P.x, y: P.y + 0.8, c: '#ffffff', blink: true });
    HUD.map(MAP.c, LEVEL.W, LEVEL.H, MAP.seen, room, T, dots, Math.max(0, Math.min(1, P.y / (LEVEL.H * T))), REGION_SPAN, LEVEL.index, time);
  }
  if (BANNER && !TALK.on && !NOTE){ BANNER.t -= dt; HUD.banner(BANNER.a, BANNER.b, Math.max(0, Math.min(1, BANNER.t, (BANNER.life - BANNER.t) * 3))); if (BANNER.t <= 0) BANNER = null; }
  HUD.hint(HINT[DEVICE.kind === 'keys' ? 'keys' : DEVICE.kind === 'touch' ? 'touch' : 'pad'], PAUSE ? 1 : Math.max(0, Math.min(0.8, (16 - PLAYED) * 0.5)) * (rising || TALK.on || NOTE ? 0 : 1));
  HUD.label(BUILD);
  if (FLIGHT){ const u = FLIGHT.t / FLIGHT.dur; HUD.dark(0.16 + u * 0.3, '#cfe6ff'); HUD.g.globalAlpha = 0.35; for (let k = 0; k < 14; k++){ const y = (k * 37 + Math.floor(time * 60) * 13) % 180, x = (k * 71 + Math.floor(time * 60) * 29) % W; HUD.px('#ffffff', x, y, 18 + (k * 13) % 50, 1); } HUD.g.globalAlpha = 1; if (u > 0.82) HUD.dark((u - 0.82) / 0.18, '#ffffff'); }
  if (FLASH > 0 && OPT.flash) HUD.dark(FLASH * 1.4, '#ffffff');
  // over what he can use: the key for it
  if (USE && !PAUSE && !TALK.on && !NOTE){ v.set(USE.x, USE.y + (USE.type === 'npc' ? 2.6 : 1.5), 0).project(R.camera); HUD.prompt(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * 180), (DEVICE.kind === 'keys' ? 'S  ' : DEVICE.kind === 'touch' ? 'DRAG DOWN  ' : 'DOWN  ') + (USE.type === 'npc' ? 'TALK' : 'OPEN'), time); }
  TALK.draw(HUD, dt, time);
  if (NOTE){ HUD.dark(0.62); HUD.text(NOTE.relic ? 'A RELIC' : 'HE HAS LEARNED', W / 2, 44, '#c0cbdc', 1, 'center'); HUD.text(NOTE.title.toUpperCase(), W / 2, 56, '#fee761', 2, 'center'); HUD.rule(Math.round(W / 2), 78, 70, '#ead4aa');
    NOTE.lines.forEach((l, i) => HUD.text(l, W / 2, 88 + i * 11, '#fff2d0', 1, 'center')); if (NOTE.t > 0.7 && Math.floor(time * 2) % 2) HUD.text('PRESS TO GO ON', W / 2, 132, '#8b9bb4', 1, 'center'); }
  if (PAUSE && SCREEN === 'shop') HUD.dark(0.55);
  else if (PAUSE){ HUD.dark(0.66); HUD.text('PAUSED', W / 2, 14, '#fff2d0', 2, 'center'); HUD.rule(Math.round(W / 2), 34, 60, '#ead4aa');
    // what he carries
    const can = [CAN.breaker && 'THE WARDEN\'S WEIGHT', CAN.dash && 'THE TOLL\'S STEP', CAN.glide && 'THE WYRM\'S WIND'].filter(Boolean), found = Object.values(G.got).flat();
    HUD.text(`SHARDS ${G.shards}   ·   STRANDS ${G.threads}   ·   RELICS ${G.relics.length} OF 6`, W / 2, 41, '#c0cbdc', 1, 'center');
    if (G.falls) HUD.fine(`FALLEN ${G.falls} TIME${G.falls === 1 ? '' : 'S'}. RAISED ${G.falls} TIME${G.falls === 1 ? '' : 'S'}.`, W / 2, 61, '#8b9bb4', 'center');
    if (can.length) HUD.text(can.join('  ·  '), W / 2, 51, '#2ce8f5', 1, 'center');
    G.relics.slice(0, 6).forEach((id, i) => { const r = RELICS[id]; if (r) HUD.fine(`${r.name.toUpperCase()}: ${r.line.toUpperCase()}`, W / 2, 150 - (G.relics.length - 1 - i) * 7, '#fee761', 'center'); });
    HUD.hint(HINT[DEVICE.kind === 'keys' ? 'keys' : DEVICE.kind === 'touch' ? 'touch' : 'pad'], 1); }
  if (GO.st) HUD.dark(GO.st === 'out' ? Math.min(1, GO.t / 0.6) : GO.st === 'in' ? Math.max(0, 1 - GO.t / 0.7) : 1);   // going up: dark between regions
  HUD.end();
  const pips = document.getElementById('pips'), pv = '●'.repeat(P.flask) + '○'.repeat(Math.max(0, P.flaskMax - P.flask)); if (pips && pips.textContent !== pv) pips.textContent = pv;
}
window.__side = { score: SCORE, get P(){ return P; }, set P(v){ P = v; }, R, LEVEL, CAN, PHASE, G, OPT, get props(){ return PROPS; }, get items(){ return ITEMS; }, talk: TALK, shop, pause, learn, get note(){ return NOTE; }, weapons: null, CAM, input: null, get E(){ return E; }, get BOSS(){ return BOSS; }, capture: CAPTURE, go, enter, story: STORY, title, get scarf(){ return SCF; }, ember: EMBER };
import('../core/input.js').then(m => { window.__side.input = m; });
import('../config/weapons.js').then(m => { window.__side.weapons = m.WEAPONS.sword; });
addEventListener('pointerdown', () => ac(), { once: true });
requestAnimationFrame(frame);
