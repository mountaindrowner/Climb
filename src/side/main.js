// The side view: boot and the loop. The motor steps at a fixed 1/120 s (input is kept until it is used, core/input.js);
// the frame draws where things are. Camera: it leads the way he faces and a little up, eases after him, and stays
// inside the map. The mountain is three regions, one over the other; the way out of one leads up into the next
// (enter), and the buttons under the room's name go straight to any of them.
import { TUNE } from '../config/tuning.js';
import { IN, bindInput, endFrame, pollPads, release, rumble } from '../core/input.js';
import { SET, saveSettings } from '../core/settings.js';
import { sfx, ac, musicBus, ambience, setMix, MIX, warm, manifestReady, say } from '../audio/sfx.js';
import { voiceOf } from '../audio/voice.js';
import { makeScore } from '../audio/score.js';
import '../ui/feel.js';
import { LEVEL, LEVELS, loadLevel, T, spawnPoint, roomAt, solidAt, PHASE, REGION_DATA, resetLevels, CLIMB_TOP, tileAt, LEDGE } from './level.js';
import { makeTeach, keyName, fill, INTRO, CARDS, drawIcon } from './teach.js';
import { makeProps } from './props.js';
import { newPlayer, stepPlayer, BODY, HOOKS, BLADE, swingOf, weaponOf, CAN, SIDE, ARTS, startArt } from './motor.js';
import { width as textWidth } from './pixelfont.js';
const wrapText = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(' ')){ const t = line ? line + ' ' + word : word; if (textWidth(t) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
import { G, OPT, loadSave, store, storeOpt, wipe, has, owns, wear, knots, KNOTS, maxHearts, maxFlask, RELICS, TEACH, THREADS_A_HEART, DIFF } from './state.js';
import { makeItems } from './items.js';
import { makeTalk, SCRIPT } from './talk.js';
import { ANNALS, PEOPLE_PAGE } from './annals.js';
import { makeRenderer, makeSprite, VIEW_H, makeSwingFx, LOW } from './render.js';
import { spawnFx, stepFx } from './fx.js';
import { spawnEnemies, stepEnemies, strikeEnemies, slamEnemies, hitBox } from './enemies.js';
import { KEEPERS } from './keepers.js';
import { makeEntrance } from './entrance.js';
import { makeStory, REGION_SPAN, storyImages } from './story.js';
import { makeHud } from './hud.js';
import { makeScarf, SCARF } from './scarf.js';
import { makeMusic } from './music.js';
import { DEVICE } from '../core/prompts.js';
import { WEAPONS } from '../config/weapons.js';
const MV = TUNE.move;
const BUILD = 'SIDE 48';   // shown in the corner, so a stale copy is easy to spot

const canvas = document.getElementById('gl'), hud = document.getElementById('hud'), hx = hud.getContext('2d');
const R = makeRenderer(canvas);
const sp = spawnPoint();
loadSave();
// the phone mode: by the device (a touch screen no wider than a small tablet), or as the options say
const phoneNow = () => OPT.phone === 'auto' ? (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches && Math.max(screen.width, screen.height) <= 1400) : !!OPT.phone;
LOW.on = phoneNow();
setMix('music', OPT.music); setMix('sfx', OPT.sfx); setMix('voice', OPT.voice); if (OPT.rumble === false) SET.rumble = false;
const DEV = /[?&]level=/.test(location.search);   // straight into a region by its address: he has what the keepers below it teach
// he is made with what he has earned: hearts (threads, keepers, the difficulty), and the flask's draughts
const armed = id => id === 'blade' || (G.arms || []).includes(id);
// the touch button for blade and spade: there once he has the spade
function swapButton(){ const b = document.getElementById('swapbtn'); if (b) b.style.display = armed('spade') ? '' : 'none'; }
// the embers button, on a phone: only once he has something to spend them on
let ARTBTN = null; function artButton(){ ARTBTN = ARTBTN || document.querySelector('.btn.art'); const want = embersKnown() ? '' : 'none'; if (ARTBTN && ARTBTN.style.display !== want) ARTBTN.style.display = want; }
const born = (x, y) => { const p = newPlayer(x, y); p.weapon = armed(G.wield) ? G.wield : 'blade'; p.maxHp = maxHearts(); p.hp = p.maxHp; p.flaskMax = maxFlask(); p.flask = p.flaskMax; return p; };
let P = born(sp.x, sp.y);
const hero = { sprite: null, meta: null };
// the warrior: one of the drawn options (?hero=a|b|c|d), falling back to the first, larger drawing
const HEROES = { masked: 'mask_tall_c', a: 'px_knight', b: 'px_hood', c: 'px_mask', d: 'px_hat' }, HERO = HEROES[new URLSearchParams(location.search).get('hero')] || HEROES.masked;   // the tall masked warrior; ?hero=a..d the small options
// his list of drawings is asked for with the build in its address (a new drawing changes it, and an old copy is never
// used); if that is refused, by its plain address
const loadHero = name => fetch(`assets/side/${name}/sprite.json?b=${encodeURIComponent(BUILD)}`).catch(() => null).then(r => r && r.ok ? r : fetch(`assets/side/${name}/sprite.json`)).then(r => r.ok ? r.json() : Promise.reject()).then(meta => { hero.meta = meta; hero.name = name; hero.sprite = makeSprite(R.scene, `assets/side/${name}`, meta); });
const HERO_P = loadHero(HERO).catch(() => loadHero('hero_a')).catch(() => loadHero('hero')).catch(() => {});
// what a region has in it: made by setup, again each time he comes into one
let RAISE = null, DISS = null; const TOUCHED = new Set();   // the region's raising water; a fall coming apart; the waters touched since he came in
const DISS_T = { dark: 1.25, raise: 1.85, end: 2.7 };   // a fall: the drops; the dark from `dark`; raised at `raise`; the dark gone by `end`
let fx, E, BOSS, SHRINES, MAP, SCF, SWINGFX, PROPS, ITEMS, ENT = { lead: false, reset(){}, step(){}, start(){}, open(){} };   // ENT: the keeper's entrance (entrance.js)
const TALK = makeTalk();
let NOTE = null, SCREEN = '', DIRTY = 0, NAMED = true;
const TRAIL = [];   // where he has been since he last rose, to run back when he falls   // a card that waits for a press (something learned, a relic); which menu is up; the save wants writing
const HUD = makeHud(hud);
// embers: what he takes from what he kills. Ten grow a length of the scarf back (a heart); a full ten are kept until needed
// embers: what fallen creatures and landed blows give him, three measures of ten. A measure mends a heart (when the
// flask is dry: the flask key), or pays for an ember art (the art key: ARTS in motor.js). The Gardener's Seed: seven mend
const EMBER = { n: 0, cap: 30, mend: 10 };
let FLIGHT = null, SLOW = 0, FLASH = 0, PAUSE = false, PLAYED = 0, PLACE = { name: '', t: 9 };
let CHECK = null, BANNER = null, WON = false, DEATH = 0;
const SPANS = REGION_DATA.map((R, n) => R.depth || REGION_SPAN[n]);   // each region's height on the mountain (the Deep's below the water: negative)
const SUB = LEVELS.map(l => l.sub), CARD = LEVELS.map(l => l.card);   // under a region's name; and what the card says, coming up into it
// what he can do, from what he has beaten and what he carries
function learn(){
  const b = n => !!G.beat[n] || G.top > n || (DEV && LEVEL.index > n);
  CAN.breaker = b(0); CAN.dash = b(1); CAN.glide = b(2); SIDE.feather = has('featherfall'); EMBER.mend = has('seedheart') ? 7 : 10;
}
let WAKE = 0;   // at the very start he lies where he fell, and gets up
function setup(){
  SWINGFX = makeSwingFx(R.scene); PROPS = makeProps(R.scene, R);
  for (const id of G.broke[LEVEL.index] || []) PROPS.breakId(id);   // the rock he broke here before stays broken
  ITEMS = makeItems(R.scene, R, LEVEL.index); learn(); swapButton();
  fx = spawnFx(R.scene); E = spawnEnemies(R.scene, R); SCF = makeScarf(R.scene); FLIGHT = null; BOSS = (KEEPERS[LEVEL.theme] || (() => null))(R.scene, R);   // each region's keeper
  ENT = makeEntrance(R.scene, R, { fx: () => fx, sfx, shake: v => { FEEL_FX.shake = Math.max(FEEL_FX.shake, v); }, flash: v => { FLASH = Math.max(FLASH, Math.min(0.42, v)); }, buzz: (a, b, ms) => buzz(a, b, ms), slow: v => { SLOW = Math.max(SLOW, v); } });
  // the shrine: it fills the flask and the hearts, and is where he wakes after a death
  // where the water is: the region's raising pool (a pool that is not plain: a fall raises him there) and the leaks (they
  // mend him and fill the flask, nothing more). Both are where he chooses his knots. `half`: how near counts as at it
  SHRINES = [
    ...LEVEL.marks.filter(m => m.type === 'pool' && !m.plain).map(m => { const w = (m.w || 8) * T, x = m.x * T + w / 2, y = m.y * T; return { x, y, half: w / 2, raise: true, room: roomAt(x, y + 0.5) }; }),
    ...LEVEL.marks.filter(m => m.type === 'shrine').map(m => { const x = (m.x + 0.5) * T, y = m.y * T; return { x, y, half: 1.1, raise: false, room: roomAt(x, y + 0.5) }; }),
  ];
  RAISE = SHRINES.find(S => S.raise) || null; TOUCHED.clear();
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
const ENTERED = [];
// `at`: where he comes in, by name (an arrive mark: a passage's other end); else the region's start
function enter(n, at){
  ENT.reset();   // a hall shut behind him is open again before he goes (its tiles are the region's own)
  const t0 = performance.now(); loadLevel(n); const t1 = performance.now(); R.load(); const t2 = performance.now();
  if (hero.meta) hero.sprite = makeSprite(R.scene, `assets/side/${hero.name}`, hero.meta);
  FX2.ghosts.length = 0; setup(); const t3 = performance.now();
  ENTERED.push({ n, build: Math.round(t1 - t0), load: Math.round(t2 - t1), setup: Math.round(t3 - t2) });   // what going into a region costs (a check: window.__side.entered)
  const am = at && LEVEL.marks.find(m => m.type === 'arrive' && m.name === at), s = am ? { x: (am.x + 0.5) * T, y: am.y * T } : spawnPoint(), old = P; P = born(s.x, s.y); PASS.cool = 1.2; P.hp = Math.max(1, Math.min(P.maxHp, old.hp)); P.flask = Math.min(P.flaskMax, old.flask);
  CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0;
  BANNER = null; NAMED = !(roomAt(s.x, s.y + 0.5) || {}).look; if (NAMED) banner(LEVEL.name, SUB[LEVEL.index] || '', 4); marks(); G.level = LEVEL.index; if (!LEVEL.deep) G.top = Math.max(G.top, G.level); G.began = true; store();
}
// going up: the picture goes dark, the next region is made, it comes back
const GO = { to: -1, t: 0, st: '', from: -1, at: null };
const go = (n, at = null) => { if (!GO.st){ GO.to = n; GO.from = LEVEL.index; GO.at = at; GO.t = 0; GO.st = 'out'; } };
// a passage (pass marks): walked into, it takes him to another region, to its arrive mark of that name. Not again until
// he has been out of it a moment (he comes in beside the other end's)
const PASS = { cool: 0 };
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
const menuShow = (rows, left = false, back = null) => { MENU.back = back; MENU.innerHTML = ''; MENU.style.bottom = ''; MENU.style.display = 'flex'; MENU.style.alignItems = left ? 'flex-start' : 'center'; MENU.style.paddingLeft = left ? '4%' : '0'; MENU.style.top = left ? '36%' : '56%'; for (const r of rows) if (r) MENU.appendChild(r); MSEL = 0; menuMark(); };
const menuHide = () => { MENU.style.display = 'none'; MENU.innerHTML = ''; MENU.back = null; release(); };   // and nothing pressed in it carries into play
function begin(){   // from the start: the fall, then he gets up at the bottom
  // a first climb finds the Roots already made (they were made behind the title, as they are at the first): made again
  // only when there is something to undo, so the press does not wait on the painting
  const fresh = !G.began && LEVEL.index === 0 && !Object.keys(G.broke || {}).length;
  menuHide(); wipe(); if (!fresh){ resetLevels(); enter(0); } { const s = spawnPoint(); P = born(s.x, s.y); }   // everything as it was at the first: the rock unbroken, the chests shut
  STORY.start('intro', {}, () => { WAKE = 1.7; const s = spawnPoint(); splash(s.x, s.y); banner(LEVEL.name, SUB[0], 4); G.began = true; store(); });   // the fall ends in the water: he comes up out of it
}
// ---- the keepers' entrances, to watch (the title's 'The keepers'): each in full, as the first time it is met, then
// back to the list. Nothing touches him; the save is put back as it was when he is done watching
const VIEW = { on: false, list: [], snap: null, n: -1, wait: false, done: false, t: 0, back: null };
const KEPT = () => LEVELS.map((l, n) => ({ n, region: l.name, keeper: KEEPERS[l.theme] && ANNALS[n] && ANNALS[n].region === l.name ? ANNALS[n].keeper.name : '' })).filter(k => k.keeper);
function keepers(){
  const list = KEPT(), rows = [menuLabel('THE KEEPERS: HOW EACH ONE COMES')];
  rows.push(menuButton(`All ${list.length}, one after another`, () => watch(list.map(k => k.n))));
  const grid = document.createElement('div'); grid.style.cssText = 'display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;justify-content:center;max-width:min(92vw,560px)';
  for (const k of list) grid.appendChild(menuButton(k.keeper, () => watch([k.n]), true)); rows.push(grid);
  rows.push(menuButton('Back', title, true)); menuShow(rows, false, title);
}
function watch(list){ if (!VIEW.on){ VIEW.snap = JSON.stringify(G); VIEW.on = true; } VIEW.list = list.slice(); SIDE.watching = true; nextView(); }
function nextView(){
  if (!VIEW.list.length){ VIEW.wait = true; VIEW.n = -1; setTimeout(() => { title(); keepers(); }, 0); return; }   // after this frame is done (it would wake the keeper again)
  const n = VIEW.list.shift(); VIEW.n = n; VIEW.wait = true; VIEW.done = false; G.keepers = {};   // as if it were the first time
  if (BOSS) BOSS.reset(); ENT.reset(); resume(n);
}
function viewStep(dt){
  if (VIEW.wait){
    if (GO.st || !BOSS || LEVEL.index !== VIEW.n || !R.isReady) return;
    VIEW.wait = false; const B = BOSS; BOSS.reset(); ENT.reset(); P = born(Math.max(B.cx - 5, B.room.x0 + 10), B.stageY + 0.02); P.face = 1; CHECK = null; WAKE = 0; BANNER = null;
    CAM.x = P.x; CAM.y = P.y + 2; NAMED = true; return;
  }
  P.hp = P.maxHp;
  if (!VIEW.done && ENT.title && ENT.title.t > 4.2){ VIEW.done = true; VIEW.t = 0.8; }
  if (VIEW.done && (VIEW.t -= dt) <= 0){ VIEW.done = false; nextView(); }
}
function endView(){ VIEW.on = false; VIEW.list = []; SIDE.watching = false; ENT.reset(); if (BOSS) BOSS.reset(); for (const k of Object.keys(G)) delete G[k]; Object.assign(G, JSON.parse(VIEW.snap)); store(); }
function resume(n){ menuHide(); STORY.kind = null; SCREEN = ''; PAUSE = false; if (LEVEL.index !== n) enter(n); else { const s = spawnPoint(); P = born(s.x, s.y); CHECK = null; if (BOSS) BOSS.reset(); ENT.reset(); banner(LEVEL.name, SUB[n] || '', 4); G.level = n; store(); } }
function title(){
  if (VIEW.on) endView();   // back from watching: the save as it was
  // until the opening is in hand the title is shown without its buttons, a thin bar filling under it
  if (!GATE.ready){ menuHide(); SCREEN = ''; PAUSE = false; STORY.start('title', { progress: GATE.progress }); if (!GATE.waiting){ GATE.waiting = true; GATE.p.then(() => { if (STORY.kind === 'title' && !SCREEN) title(); }); } return; }
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;justify-content:center;max-width:92vw';
  const top = DEV ? LEVELS.length - 1 : G.top; if (top > 0) LEVELS.forEach((l, n) => { if (n <= top) row.appendChild(menuButton(`${n + 1} ${l.name.replace('The ', '')}`, () => resume(n), true)); });
  let sure = false; const again = menuButton(G.began ? 'Begin again' : 'Begin the climb', () => { if (G.began && !sure){ sure = true; again.textContent = 'Begin again? All is lost'; return; } begin(); }, G.began);
  menuShow([G.began ? menuButton('Climb on: ' + LEVELS[Math.min(G.level, LEVELS.length - 1)].name, () => resume(Math.min(G.level, LEVELS.length - 1))) : null, again, top > 0 ? row : null, menuButton('The keepers', keepers, true), menuButton('Options', () => options(title), true)], true);
  SCREEN = ''; PAUSE = false; if (STORY.kind === 'title') STORY.opts = {}; else STORY.start('title');   // already up (it was waiting): it is not begun again
}
// the options: each button steps its setting on
function options(back){
  const cyc = (label, key, vals, names, then) => { const b = menuButton('', () => { OPT[key] = vals[(vals.indexOf(OPT[key]) + 1) % vals.length]; storeOpt(); if (then) then(); show(); }, true); const show = () => { b.textContent = `${label}: ${names[Math.max(0, vals.indexOf(OPT[key]))]}`; }; show(); b.style.minWidth = '240px'; return b; };
  // in two columns, so the list fits a short screen (a phone held sideways)
  const grid = rows => { const d = document.createElement('div'); d.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;max-width:min(94vw,560px)'; for (const r of rows){ r.style.minWidth = '0'; r.style.whiteSpace = 'normal'; d.appendChild(r); } return d; };
  menuShow([menuLabel('OPTIONS'), grid([
    cyc('Music', 'music', [0, 0.35, 0.7, 1], ['off', 'low', 'mid', 'full'], () => setMix('music', OPT.music)),
    cyc('Sound', 'sfx', [0, 0.4, 0.7, 1], ['off', 'low', 'mid', 'full'], () => { setMix('sfx', OPT.sfx); sfx.shard(); }),
    cyc('Voices', 'voice', [0, 0.4, 0.8, 1], ['off', 'low', 'mid', 'full'], () => { setMix('voice', OPT.voice); say(voiceOf('lamplighter'), { v: 'a', p: 1, g: 1 }); }),
    cyc('Text', 'text', ['slow', 'normal', 'fast', 'now'], ['slow', 'normal', 'fast', 'at once']),
    cyc('Hints', 'hints', [true, false], ['on', 'off']),
    cyc('Score', 'synth', [false, true], ['recorded', 'made as it plays']),
    cyc('Shake', 'shake', [0, 0.5, 1], ['off', 'soft', 'full']),
    cyc('Flashes', 'flash', [0, 1], ['off', 'on']),
    cyc('Difficulty', 'diff', [0, 1, 2], DIFF.map((d, i) => d + [' (two hearts more)', '', ' (two hearts fewer)'][i]), () => { P.maxHp = maxHearts(); P.hp = Math.min(P.hp, P.maxHp); }),
    cyc('Phone mode', 'phone', ['auto', true, false], [phoneNow() && OPT.phone === 'auto' ? 'auto (on)' : 'auto', 'on', 'off'], () => { LOW.on = phoneNow(); banner('', 'phone mode ' + (LOW.on ? 'on' : 'off') + ': from the next region', 2.4); }),
    cyc('Rumble', 'rumble', [true, false], ['on', 'off'], () => { SET.rumble = OPT.rumble; saveSettings(); if (OPT.rumble) rumble(0.5, 0.5, 160); })]),
    menuButton('Back', back, true)], false, back); MENU.style.top = '34%';
}
// ---- Corwen's Annals: a page for each region (its keeper and its creatures) and one for the three who climb. Drawn on
// the HUD (drawAnnals); the buttons under it turn the pages; so do left and right (and the shoulder buttons)
let PAGE = 0;
// art: a character's folder (its standing drawing, cropped to head and shoulders), or a picture's path (a keeper's piece, fitted whole)
const PORTRAIT = {}, portrait = art => { if (!art) return null; if (PORTRAIT[art]) return PORTRAIT[art]; const im = new Image(); im.src = art.includes('/') ? `assets/side/${art}.png` : `assets/side/${art}/stand.png`; return PORTRAIT[art] = im; };
// what is marked on the map: the flames, the keeper, the three's stations he has found, what is still to be found (with
// the compass or a chart), and him
function mapDots(){
  const dots = SHRINES.filter(S => MAP.seen.has(S.room)).map(S => ({ x: S.x, y: S.y + 0.5, c: '#0099db', r: S.raise ? 1 : 0 }));   // the water: the raising pool larger
  if (BOSS && MAP.seen.has(BOSS.room)) dots.push({ x: BOSS.cx, y: BOSS.stageY + 1, c: BOSS.st === 'dead' ? '#5a6988' : '#e43b44', r: 1 });
  for (const N of ITEMS.people) if (MAP.seen.has(roomAt(N.x, N.y + 0.5))) dots.push({ x: N.x, y: N.y + 0.5, c: { lamplighter: '#feae34', wren: '#63c74d', scribe: '#2ce8f5' }[N.who] });   // the stations he has found
  if (has('starcompass') || G.charts.includes(LEVEL.index)) for (const it of ITEMS.left().all) dots.push({ x: it.x, y: it.y + 0.5, c: '#f6757a', find: true });   // what is still to be found
  dots.push({ x: P.x, y: P.y + 0.8, c: '#ffffff', blink: true });
  return dots;
}
// the whole map, from the pause (or M, or Select)
function mapScreen(){
  SCREEN = 'map'; PAUSE = true; release(); const T2 = (G.taught = G.taught || {}); T2.mapN = (T2.mapN || 0) + 1; store();
  menuShow([menuButton('Back', () => pause(true), true)], false, () => pause(true)); MENU.style.top = 'auto'; MENU.style.bottom = '1.5%'; MSEL = 0; menuMark();
}
function drawMap(){ HUD.fullmap(MAP.c, LEVEL.W, LEVEL.H, MAP.seen, roomAt(P.x, P.y), T, mapDots(), time, LEVEL.name);
  if (((G.taught || {}).mapN || 0) <= 3 && OPT.hints !== false){ HUD.fine(CARDS.map.does.toUpperCase(), HUD.W / 2, 156, '#c0cbdc', 'center'); HUD.fine(CARDS.map.how[0].toUpperCase(), HUD.W / 2, 163, '#c0cbdc', 'center'); } }   // what the marks are, the first few times
function annals(page){
  SCREEN = 'annals'; PAUSE = true; PAGE = Math.max(0, Math.min(ANNALS.length, page)); release();
  const turn = d => () => { PAGE = (PAGE + d + ANNALS.length + 1) % (ANNALS.length + 1); sfx.ui(); };
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px';
  row.appendChild(menuButton('<', turn(-1), true)); row.appendChild(menuButton('Back', () => pause(true), true)); row.appendChild(menuButton('>', turn(1), true));
  menuShow([row], false, () => pause(true)); MENU.style.top = 'auto'; MENU.style.bottom = '1.5%'; MSEL = 1; menuMark();
}
// one entry: a portrait (the head and shoulders of its drawing; a keeper, too large to fit, has a mark), its name, its
// line, and what is known of it. What he has not met is not yet entered
const CROP = {};
function entry(x, y, art, name, line, known, note, col){
  const g = HUD.g, im = portrait(art), whole = art.includes('/'); HUD.px('#181425', x, y, 24, 24); HUD.px(whole ? '#3a1a24' : '#262b44', x + 1, y + 1, 22, 22);
  if (whole && known && im.complete && im.naturalWidth){ const sc = Math.min(1, 22 / im.naturalWidth, 22 / im.naturalHeight), w = Math.max(1, Math.round(im.naturalWidth * sc)), h = Math.max(1, Math.round(im.naturalHeight * sc)); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, x + 1 + Math.round((22 - w) / 2), y + 1 + Math.round((22 - h) / 2), w, h); }
  else if (!whole && known && im.complete && im.naturalWidth){
    let c = CROP[art]; if (!c){ const tc = document.createElement('canvas'); tc.width = im.naturalWidth; tc.height = im.naturalHeight; const tg = tc.getContext('2d', { willReadFrequently: true }); tg.drawImage(im, 0, 0);
      const d = tg.getImageData(0, 0, tc.width, tc.height).data; let x0 = tc.width, x1 = 0, y0 = tc.height; for (let yy = 0; yy < tc.height; yy++) for (let xx = 0; xx < tc.width; xx++) if (d[(yy * tc.width + xx) * 4 + 3] > 40){ x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, yy); }
      c = CROP[art] = { x: Math.max(0, Math.round((x0 + x1) / 2) - 11), y: Math.max(0, y0 - 1) }; }
    g.imageSmoothingEnabled = false; g.drawImage(im, c.x, c.y, 22, 22, x + 1, y + 1, 22, 22); }
  else HUD.text('?', x + 12, y + 8, '#5a6988', 1, 'center');
  HUD.text(known ? name.toUpperCase() : '? ? ?', x + 29, y + 1, known ? col : '#5a6988', 1, 'left');
  HUD.fine(known ? line.toUpperCase() : 'NOT YET ENTERED.', x + 29, y + 10, known ? '#c0cbdc' : '#5a6988', 'left');
  if (known && note) HUD.fine(note, x + 29, y + 17, '#8b9bb4', 'left');
}
function drawAnnals(W){
  HUD.dark(1, '#181425'); const people = PAGE >= ANNALS.length, A = ANNALS[PAGE];
  HUD.text("CORWEN'S ANNALS", W / 2, 5, '#2ce8f5', 1, 'center');
  HUD.text(people ? 'THOSE WHO CLIMB' : A.region.toUpperCase(), W / 2, 14, '#fff2d0', 2, 'center');
  HUD.rule(Math.round(W / 2), 33, 70, '#ead4aa'); HUD.fine(`${PAGE + 1} OF ${ANNALS.length + 1}`, W / 2 + 76, 31, '#8b9bb4', 'left');
  const x = Math.max(6, Math.round(W / 2 - 150));
  if (people){ PEOPLE_PAGE.forEach((p, i) => { const met = Object.keys(G.met).filter(k => k.endsWith(':' + p.who)).length; entry(x, 44 + i * 30, p.art, p.name, p.line, met > 0, met ? `MET IN ${met} REGION${met === 1 ? '' : 'S'}` : '', '#fee761'); }); return; }
  const K = A.keeper, met = (G.keepers || {})[K.theme] || G.beat[PAGE];
  entry(x, 41, K.art, K.name, K.line, !!met, G.beat[PAGE] ? 'IT HAS FALLEN' : met ? 'IT STILL STANDS' : '', '#e43b44');
  A.creatures.forEach((c, i) => { const seen = (G.seen || {})[c.type], n = (G.slain || {})[c.type] || 0; entry(x, 67 + i * 24, c.art, c.name, c.line, !!seen, n ? `SLAIN ${n}` : 'MET, NOT YET SLAIN', '#fee761'); });
}
// the Lamplighter's wares, for shards
const WARES = () => [
  { name: 'A deeper flask of the water', cost: [120, 260][G.flasks], buy(){ G.flasks++; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } },
  { name: G.edge ? 'Temper the blade again: every cut' : 'Temper the blade: finishing cuts', cost: [180, 380][G.edge], buy(){ G.edge++; } },
  { name: 'A red strand he has kept', cost: G.boughtThread ? undefined : 150, buy(){ G.boughtThread = true; onEvent({ type: 'thread', at: { x: P.x, y: P.y + 1.2 } }); } },
  { name: 'Tie another knot in the scarf', cost: knots() < KNOTS.most ? KNOTS.cost[G.knots || 0] : undefined, buy(){ G.knots = (G.knots || 0) + 1; } },
  { name: 'A chart of ' + LEVEL.name, cost: G.charts.includes(LEVEL.index) ? undefined : 40, buy(){ G.charts.push(LEVEL.index); for (const r of LEVEL.rooms) MAP.seen.add(r); } },
];
function shop(){
  SCREEN = 'shop'; PAUSE = true; release();
  const rows = [menuLabel(`WHAT ORDRIC CAN DO  ·  ${G.shards} SHARDS`)];
  for (const w of WARES()){ if (w.cost === undefined) continue; const can = G.shards >= w.cost, b = menuButton(`${w.name}  ·  ${w.cost}`, () => { if (G.shards < w.cost){ sfx.block(); return; } G.shards -= w.cost; w.buy(); sfx.buy(); store(); shop(); }, true); b.style.minWidth = '300px'; if (!can) b.style.opacity = '0.5'; rows.push(b); }
  if (rows.length === 1) rows.push(menuLabel('He can do no more. The rest was never his to do.'));
  const leave = () => { SCREEN = ''; PAUSE = false; menuHide(); }; rows.push(menuButton('Leave', leave, true)); menuShow(rows, false, leave);
}
// the knots: at a flame, he chooses which relics he wears. Each is a knot in his scarf; he can carry more than he can
// wear. The one picked is tied or untied; with every knot tied, one must be untied first
let KSEL = null, KNOTMSG = '';
function knotMenu(){
  SCREEN = 'knots'; PAUSE = true; release(); const keep = MSEL;
  const rows = [menuLabel(`HIS SCARF  ·  ${G.worn.length} OF ${knots()} KNOTS TIED`)], grid = document.createElement('div');
  grid.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:min(92vw,560px)';
  KSEL = G.relics.filter(id => RELICS[id]);
  KSEL.forEach((id, i) => { const on = has(id), b = menuButton(RELICS[id].name, () => {
      if (!wear(id, !on)){ sfx.block(); KNOTMSG = 'every knot is tied: untie one first'; } else { KNOTMSG = ''; on ? sfx.ui() : sfx.relic(); learn(); store(); }
      MSEL = i; knotMenu(); }, true);
    b.addEventListener('pointerenter', () => { if (MSEL !== i){ MSEL = i; menuMark(); } });   // what it does shows under the mouse too
    if (on){ b.style.color = '#fee761'; b.style.borderColor = '#fee761'; } grid.appendChild(b); });
  rows.push(grid);
  const leave = () => { SCREEN = ''; PAUSE = false; KSEL = null; KNOTMSG = ''; menuHide(); }; rows.push(menuButton('Leave the water', leave, true));
  menuShow(rows, false, leave); MENU.style.top = '30%'; MSEL = Math.min(keep, menuItems().length - 1); menuMark();
}
function drawKnots(W){
  HUD.dark(0.9, '#181425'); HUD.text('THE KNOTS', W / 2, 14, '#fff2d0', 2, 'center'); HUD.rule(Math.round(W / 2), 34, 60, '#ead4aa');
  const id = KSEL && KSEL[MSEL], r = id && RELICS[id];
  if (r){ HUD.text(r.name.toUpperCase(), W / 2, 100, has(id) ? '#fee761' : '#c0cbdc', 1, 'center'); let y = 111; for (const ln of wrapText(r.line, W - 48)){ HUD.text(ln, W / 2, y, '#fff2d0', 1, 'center'); y += 10; }
    HUD.fine(has(id) ? 'TIED. PICK IT TO UNTIE IT.' : 'CARRIED. PICK IT TO TIE IT.', W / 2, y + 2, '#8b9bb4', 'center'); }
  else HUD.fine('THE WATER WILL KEEP HIM WHILE HE CHOOSES.', W / 2, 104, '#8b9bb4', 'center');
  if (KNOTMSG) HUD.fine(KNOTMSG.toUpperCase(), W / 2, 140, '#f6757a', 'center');
}
// a pause: Esc or P (or the II button): the world stops; go on, or back to the title
const PBTN = menuButton('II', () => pause(!PAUSE), true); PBTN.style.cssText += ';position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:6;padding:3px 9px;font-size:12px;display:none;opacity:0.6;background:rgba(24,20,37,.4);box-shadow:none;border:2px solid rgba(234,212,170,.5);border-radius:10px';
(document.getElementById('stage') || document.body).appendChild(PBTN);
function pause(on){
  if (STORY.active() || GO.st || TALK.on || NOTE) return; if (SCREEN === 'shop' || SCREEN === 'knots'){ SCREEN = ''; PAUSE = false; menuHide(); return; }
  PAUSE = on; SCREEN = on ? 'pause' : ''; if (!on){ menuHide(); return; } release();
  menuShow([menuButton('Go on', () => pause(false)), menuButton('The Map', mapScreen, true), menuButton('What he carries', carryScreen, true), menuButton('The Annals', () => annals(LEVEL.index), true), menuButton('Options', () => options(() => pause(true)), true), menuButton('To the title', () => { PAUSE = false; SCREEN = ''; title(); }, true)], false, () => pause(false));
}
addEventListener('keydown', e => {
  if (TALK.on || NOTE){ if (['Enter', 'Space', 'KeyE', 'KeyS', 'ArrowDown', 'KeyJ'].includes(e.code)) press(); return; }
  if (SCREEN === 'annals' && ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)){ PAGE = (PAGE + (['ArrowLeft', 'KeyA', 'KeyQ'].includes(e.code) ? -1 : 1) + ANNALS.length + 1) % (ANNALS.length + 1); sfx.ui(); e.preventDefault(); return; }
  if (MENU.style.display !== 'none' && MENU.children.length){   // a menu is up: move in it, pick from it
    const items = menuItems(); if (['ArrowDown', 'KeyS'].includes(e.code)){ MSEL = (MSEL + 1) % items.length; menuMark(); e.preventDefault(); return; } if (['ArrowUp', 'KeyW'].includes(e.code)){ MSEL = (MSEL + items.length - 1) % items.length; menuMark(); e.preventDefault(); return; }
    if (e.code === 'Enter' || e.code === 'Space'){ const b = items[MSEL]; if (b) b.dispatchEvent(new PointerEvent('pointerdown')); menuMark(); e.preventDefault(); return; }
  }
  if ((e.code === 'Escape' || e.code === 'KeyP') && !STORY.active()){ pause(!PAUSE); return; }
  if (e.code === 'KeyM' && !STORY.active() && !GO.st && !TALK.on && !NOTE){ if (SCREEN === 'map') pause(false); else mapScreen(); return; }
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
  if (menu && SCREEN === 'annals'){ const ax = pad.axes[0] || 0, side = now[14] || ax < -0.6 ? -1 : now[15] || ax > 0.6 ? 1 : 0; if (side && side !== PADUI.side){ PAGE = (PAGE + side + ANNALS.length + 1) % (ANNALS.length + 1); sfx.ui(); } PADUI.side = side; if (edge(4)){ PAGE = (PAGE + ANNALS.length) % (ANNALS.length + 1); sfx.ui(); } if (edge(5)){ PAGE = (PAGE + 1) % (ANNALS.length + 1); sfx.ui(); } }
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
  if (edge(8) && !GO.st && !STORY.active()){ if (SCREEN === 'map') pause(false); else mapScreen(); }   // Select: the map
}
// a buzz in the hands, for a blow that lands, one taken, and the big moments (Options: Rumble)
const buzz = (s, w, ms) => { if (OPT.rumble !== false) rumble(s, w, ms); };
// a press while someone is speaking, or a card is up: on with it
function press(){ if (TALK.on) TALK.press(); else if (NOTE && NOTE.t > 0.7){ NOTE = null; } }
addEventListener('pointerdown', () => { if (TALK.on || NOTE) press(); else if (STORY.active()) STORY.press(); });
// ---- the score (music.js): which piece, by where he is; it starts with the first key or touch (a browser's rule)
let MUSIC = null, HEARD = false, MUTED = (() => { try { return localStorage.getItem('climb-side-mute') === '1'; } catch (e){ return false; } })();
// the title says to press for sound until there has been a press; a phone lets sound start on a tap's end
const hear = () => { HEARD = true; ac(); }; STORY.quiet = () => !HEARD; for (const ev of ['pointerdown', 'keydown', 'click', 'touchend']) addEventListener(ev, hear);
addEventListener('keydown', e => { if (e.code === 'KeyN'){ MUTED = !MUTED; try { localStorage.setItem('climb-side-mute', MUTED ? '1' : '0'); } catch (err){} banner('', MUTED ? 'music off' : 'music on', 1.6); } });
// a region with no music of its own has another's (musicOf: the Workings, the Roots')
const alias = theme => { const R = REGION_DATA.find(q => q.theme === theme); return (R && R.musicOf) || theme; };
const SCORE = makeScore(), AMB = { workings: 'cave', roots: 'cave', cloister: 'cave', spires: 'wind', tempest: 'storm', gardens: 'garden', firmament: 'wind' };
function score(){
  if (!HEARD) return; const A = ac(); if (!A) return; if (!MUSIC) MUSIC = makeMusic(A, musicBus() || A.destination);
  const k = STORY.kind, fight = BOSS && BOSS.active() && BOSS.st !== 'die', quiet = ENT.hush || (BOSS && (BOSS.st === 'die' || (BOSS.st === 'dead' && !WON)));
  const here = R.look(), door = !fight && R.exits.find(x => x.on && x.next && Math.hypot(P.x - x.x, P.y - x.y) < 7);   // by an open way on, the next region can be heard
  const rec = k === 'title' || k === 'intro' ? 'title' : k === 'ending' ? 'ending' : fight ? (LEVEL.index === CLIMB_TOP ? 'boss_final' : 'boss') : alias(here);
  const gen = k === 'title' || k === 'intro' ? 'title' : k === 'ending' ? 'ending' : fight ? 'boss_' + LEVEL.theme : alias(here);
  // the recording of the piece if there is one; else the score made as it plays
  const cue = ENT.cue; ENT.cue = false;   // a keeper's name: its music in on the beat, not faded up
  // (a recording that is slow to come, or failed, is not waited for in silence: the made score plays until it is in)
  const recOk = SCORE.has(rec) && !OPT.synth, waiting = recOk && !SCORE.ready(rec) && SCORE.now !== rec;
  if (recOk && !waiting){ SCORE.play(quiet ? '' : rec, cue); MUSIC.play(''); }
  else if (waiting){ SCORE.play(''); MUSIC.play(quiet ? '' : gen); }   // not another place's piece: this place's, made
  else { SCORE.play(''); MUSIC.play(quiet ? '' : gen, cue ? 0.05 : undefined); }
  const v = MUTED ? 0 : PAUSE || TALK.on ? 0.35 : 1; SCORE.duck(v); MUSIC.volume(v * 0.7); MUSIC.tick();
  const amb = door ? door.next : here; ambience(k || MUTED || ENT.hush ? '' : AMB[amb] || '', amb === 'tempest' ? 0.5 : door ? 0.45 : 0.3);
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
// ---- the opening, made ready before it is offered. The title's buttons wait until the pictures of the fall, his
// drawings, the Roots and the opening's music are in; then the rest (every sound, the rest of his drawings) comes on
// behind, a few at a time. On a quick line it is not seen; on a slow one a thin bar fills under the title. It never
// waits longer than GATE_MAX: past that the climb is offered as it is
const GATE_MAX = 25000;
const GATE = (() => {
  const LM = THREE.DefaultLoadingManager, prev = LM.onProgress; let tot = 0, got = 0, last = performance.now();
  LM.onProgress = (u, l, t) => { got = l; tot = t; last = performance.now(); if (prev) prev(u, l, t); };
  let mus = 0, heroOk = 0;
  const music = manifestReady().then(() => Promise.all(['title', 'roots'].map(k => SCORE.prefetch(k)))).then(() => { mus = 1; });
  // his drawings for the first minute: the rest are asked for once the opening is in
  const FIRST = ['stand', 'idle', 'run', 'jump', 'air', 'crouch', 'crouch_walk', 'fall', 'getup', 'land_px', 'roll2_px', 'block', 'atk_slam_px', 'atk_spin_px', 'atk_rise_px', 'atk_dash_px', 'hurt', 'climb_own'];
  const heroIn = HERO_P.then(() => { if (hero.sprite) hero.sprite.warm(FIRST); }).then(() => new Promise(res => { const chk = () => (!hero.sprite || hero.sprite.in()) ? res() : setTimeout(chk, 80); chk(); })).then(() => { heroOk = 1; });
  // the textures all in, and nothing new asked for in a moment
  const quiet = () => new Promise(res => { const chk = () => (got >= tot && performance.now() - last > 350) ? res() : setTimeout(chk, 80); chk(); });
  const G0 = { ready: false, waiting: false };
  G0.progress = () => { if (G0.ready) return null; const st = storyImages(); return Math.min(0.99, (st.done + got + mus * 3 + heroOk * 2) / Math.max(1, st.all + tot + 3 + 2)); };
  const at = k => () => { G0.times[k] = Math.round(performance.now()); };   // when each part came in (a check: window.__side.gate.times)
  G0.times = {};
  const all = Promise.all([storyImages().ready.then(at('story')), R.ready.then(at('roots')), heroIn.then(at('hero')), music.then(at('music'))]).then(quiet).then(at('quiet'));
  G0.p = Promise.race([all, new Promise(r => setTimeout(r, GATE_MAX))]).then(() => { G0.ready = true; warm(); if (hero.sprite) hero.sprite.warm(); });
  return G0;
})();
bindInput(); marks();
if (/[?&](level|play)\b/.test(location.search)){ NAMED = !(roomAt(sp.x, sp.y + 0.5) || {}).look; if (NAMED) banner(LEVEL.name, SUB[LEVEL.index] || '', 4); } else title();   // straight in with ?level=2 or ?play

// the drawings the masked warrior uses for these moves, where he has them
const MOVES = { roll: ['roll2_px', 'roll_px', 'roll'], flip: ['flip_px'], climb: ['climb_own', 'climb_hang2', 'climb_px', 'climb_v3'], land: ['land_px', 'land_v3'] };
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
let landT = 0, CROUCH_T = 0;   // CROUCH_T: how long he has been crouched (the crouch's drawing goes down into it)
const PLUNGE_LAND = 0.5; let PLUNGE_T = 0;   // how long the plunge's landing plays
// which of his animations, and how far into it (and, for a climb, to place it by where it ends)
function heroPose(P, t){
  const A = hero.meta ? hero.meta.anims : {}, has = n => !!A[n], pick = k => MOVES[k].find(has);
  const held = n => P.weapon === 'spade' && has('spade_' + n) ? 'spade_' + n : n;   // with the spade in hand, its own drawing where there is one
  if (WAKE > 0 && has('getup')) return ['getup', Math.min(0.999, Math.max(0, 1 - WAKE / 1.4))];   // where he fell: up off the ground
  if (P.art){ const name = { cleave: 'atk_dash_px', gust: 'atk_rise_px', slam: 'plunge_land' }[P.art.k]; if (has(name)) return [name, Math.min(0.999, P.art.t / P.art.dur)]; }   // an ember art
  if (P.mantle && pick('climb')){
    const name = pick('climb'), C = CLIMB[name] || A[name].climb, M = P.mantle;   // climb_own carries its table (tools/compose-climb.py)
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
  // the guard: the blade comes up and level in its first five frames (as fast as the parry's moment), then is held,
  // breathing, for as long as he blocks
  if (P.blocking && has('block')){ const bt = performance.now() / 1000 - (P.blockAt || 0), UP = 0.12, n = A.block.frames, f = bt < UP ? Math.floor(bt / UP * 5) : 5 + Math.floor((bt - UP) * 4) % (n - 5); return ['block', (Math.min(n - 1, f) + 0.5) / n]; }
  if (!P.grounded && !P.mantle){
    // in the air: the spring off the ground (the blade's), then knees up at the top and the coat lifting as he drops,
    // by how fast he is rising or falling; held at the end, the last two frames fluttering
    const air = held('air');
    if (P.vy > 0 && P.jumpT < 0.3 && has('jump') && air === 'air') return ['jump', Math.min(0.999, P.jumpT / 0.45)];
    if (has(air)){ const n = A[air].frames, u = Math.max(0, Math.min(1, (4 - P.vy) / 14)); let f = Math.round(u * (n - 2)); if (u >= 1) f = n - 2 + (Math.floor(t * 8) % 2); return [air, (f + 0.5) / n]; }
    if (P.vy > 0 && has('jump')) return ['jump', Math.min(0.999, P.jumpT / 0.45)];
    if (has('fall')) return ['fall', t * 2];
    if (has('jump')) return ['jump', 0.8];
  }
  if (P.grounded && landT > 0 && pick('land') && !(Math.abs(P.vx) > 1.5 && landT < LAND_T - 0.08)) return [pick('land'), Math.min(0.999, 0.2 + 0.8 * (1 - landT / LAND_T))];   // from the moment his feet meet the floor
  // crouched: down into it (its first frames, then held); moving, the low shuffle, by how far he has gone
  if (P.grounded && P.crouch){ if (Math.abs(P.vx) > 0.3 && has(held('crouch_walk'))) return [held('crouch_walk'), (P.dist || 0) / 1.6]; if (has(held('crouch'))) return [held('crouch'), Math.min(0.999, CROUCH_T / 0.16)]; }
  if (P.grounded && Math.abs(P.vx) > 0.3){ const run = held(has('sprint') ? 'sprint' : 'run'); if (has(run)) return [run, (P.dist || 0) / 2.6]; }
  if (P.weapon === 'spade' && has('spade_idle')) return ['spade_idle', t / 1.6];   // leaning on the spade
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
  PBTN.style.display = STORY.active() || DEVICE.kind !== 'touch' ? 'none' : 'block'; artButton();
  if (DIRTY > 0 && (DIRTY -= dt) <= 0) store();
  if (TALK.on || NOTE){   // someone is speaking, or a card is up: the world waits
    if (IN.pressed.has('jump') || IN.pressed.has('attack')){ IN.pressed.clear(); press(); }
    if (NOTE) NOTE.t += dt; drawHud(dt); endFrame(); requestAnimationFrame(frame); return; }
  if (PAUSE){ drawHud(0); endFrame(); requestAnimationFrame(frame); return; }
  if (STORY.active() && !GO.st){ hudBegin(); STORY.draw(dt); endFrame(); requestAnimationFrame(frame); return; }   // a story screen is up: the world waits (on the title, until a press: a browser lets no sound play before one)
  if (WAKE > 0) WAKE -= dt;
  if (!NAMED && R.look() === LEVEL.theme && !GO.st && !ENT.st){ NAMED = true; banner(LEVEL.name, SUB[LEVEL.index] || '', 4.5); sfx.gust(); }   // out of the way in: this is the new place
  // an open way on breathes the next region out: its air drifts from the arch
  for (const x of R.exits) if (x.on && Math.random() < dt * 16){ const a = Math.random() * Math.PI * 2; fx.burst({ x: x.x + Math.cos(a) * 0.6, y: x.y + 1.3 + Math.sin(a) * 0.9 }, 1, x.cols[Math.random() < 0.5 ? 0 : 1]); }
  for (let i = LATER.length - 1; i >= 0; i--) if ((LATER[i].t -= dt) <= 0){ const L = LATER[i]; LATER.splice(i, 1); L.f(); }
  if (!NOTE && CARDQ.length){ NOTE = CARDQ.shift(); release(); }   // the next card, in its turn
  // a hint, if he is struggling (teach.js); not while something else has the screen
  TEACHER.step(dt, { P, held: IN.held, solidAt, onPlank, busy: !!(WAKE > 0 || DISS || FLIGHT || GO.st || ENT.st || DEATH > 0 || (BOSS && BOSS.st === 'rise')),
    foes: TEACHER.known('cut') ? null : E.list.filter(e => e.alive) });
  // hit-stop: a hit freezes the world a few frames (the effects keep running)
  let sdt = dt; if (FEEL_FX.hitstop > 0){ FEEL_FX.hitstop -= dt; sdt = dt * 0.06; }
  if (SLOW > 0){ SLOW -= dt; sdt *= 0.3; }   // a boss's last moment, drawn out
  FLASH = Math.max(0, FLASH - dt); PLAYED += dt; PHASE.t += sdt; PROPS.step(sdt, time);
  if (PROPS.glass.some(K => K.turned && Math.abs(K.x - P.x) < 11 && Math.abs(K.y - P.y) < 7)) sfx.glass();   // the star-glass turns: it can be heard
  acc += sdt; time += dt;
  const evs = [];
  // what is in reach to use: someone to talk to, a chest to open (down)
  if (VIEW.on) viewStep(dt);
  if (ENT.lead && !ENT.first && (IN.pressed.has('jump') || IN.pressed.has('attack'))){ IN.pressed.delete('jump'); IN.pressed.delete('attack'); ENT.skip(); }   // seen it before: a press goes straight to the keeper
  USE = P.hp > 0 && P.grounded && !FLIGHT && !GO.st && WAKE <= 0 && !(BOSS && BOSS.active() && BOSS.st !== 'dead') ? ITEMS.near(P) : null;
  if (!USE && P.hp > 0 && P.grounded && !FLIGHT && !GO.st && WAKE <= 0 && G.relics.length){ const S = SHRINES.find(S => Math.abs(P.x - S.x) < S.half && Math.abs(P.y - S.y) < 1.5); if (S) USE = { type: 'flame', x: S.x, y: S.y }; }   // at a flame: the knots
  if (USE && IN.pressed.has('down')){ IN.pressed.delete('down'); if (USE.type === 'npc') talkTo(USE); else if (USE.type === 'flame') knotMenu(); else ITEMS.open(USE, evs); }
  const h = 1 / 120;
  while (acc >= h){ const x0 = P.x; if (DEATH <= 0 && !FLIGHT && !DISS && !GO.st && WAKE <= 0 && !ENT.lead) stepPlayer(P, h); else if (ENT.lead){ P.vx = 0; if (ENT.face) P.face = ENT.face; if (ENT.brace && !P.blocking){ P.blocking = true; P.blockAt = performance.now() / 1000; } } P.dist = (P.dist || 0) + Math.abs(P.x - x0); acc -= h; }
  endFrame();
  if (P.hp > 0 && !FLIGHT && !GO.st && (TRAILT -= dt) <= 0){ TRAILT = 0.05; const [an, fr] = heroPose(P, time); TRAIL.push({ x: P.x, y: P.y, face: P.face, an, fr });
    if (TRAIL.length > 2400) TRAIL.splice(0, 1200, ...TRAIL.slice(0, 1200).filter((_, i) => i % 2)); }   // a long way: the far end of it kept more thinly
  if (!ENT.lead) stepEnemies(E, P, sdt, fx, evs); stepArts(sdt); ITEMS.step(sdt, time, P, evs);   // while a keeper's hall shuts and he cannot move, nothing else moves either
  for (const e of E.list) if (e.alive && !(G.seen = G.seen || {})[e.type] && Math.abs(e.x - P.x) < 9 && Math.abs(e.y - P.y) < 5){ G.seen[e.type] = 1; DIRTY = DIRTY > 0 ? DIRTY : 2; }   // met: entered in the Annals
  { const RD = REGION_DATA[LEVEL.index]; if (RD.tick) RD.tick(sdt, time, TICK); }   // the region's own weather and workings (its file)
  if (BOSS) BOSS.step(P, ENT.lead ? 0 : sdt, fx, evs);   // held, while its hall shuts and the ground begins to go
  ENT.step(sdt, P);
  for (const e of P.events) onEvent(e);
  // a passage: walked into, he goes through it
  PASS.cool = Math.max(0, PASS.cool - dt);
  if (!GO.st && PASS.cool <= 0 && P.hp > 0 && !FLIGHT) for (const m of LEVEL.marks) if (m.type === 'pass'){ const x0 = m.x * T, y0 = m.y * T, x1 = x0 + (m.w || 2) * T, y1 = y0 + (m.h || 2) * T, cy = P.y + 0.8;
    if (P.x >= x0 && P.x <= x1 && cy >= y0 && cy <= y1){ PASS.cool = 9; go(m.to, m.at); break; } }
  P.events.length = 0;
  for (const e of evs) onEvent(e);
  // a death: he is gone in a burst; the scarf hangs there a moment, then goes back alone to the last shrine (or the
  // start), and he gets up under it. The boss waits again
  // a fall. He is gone in a burst; then everything he did since he last rose runs back, fast (FLIGHT: his own path, the
  // other way), to the water at the bottom of the world, which gives him back (raise): he gets up at the last flame he
  // reached. What he killed is there again. What he found, lit and learned is kept
  // a fall (decision 0.2): he comes apart into water; the drops fall, and where they meet the ground they sink into it;
  // the picture goes dark, and he is raised out of the region's raising water (raise). What he killed is there again;
  // what he found, lit and learned is kept. (The old rewind, his path run back, is kept in reserve: FLIGHT)
  if (P.hp <= 0 && DEATH <= 0 && !FLIGHT && !DISS){ DEATH = 0.7; P.vx = 0; G.falls = (G.falls || 0) + 1; DISS = { t: 0, raised: false, drops: dissolve() }; BANNER = null; fx.burst({ x: P.x, y: P.y + 1.2 }, 18, 0xdff4ff); FEEL_FX.hitstop = 0.22; R.glint(P.x, P.y + 1, 0x9fe8ff, 1, 5, 0.5); sfx.hurt(); sfx.death(); buzz(1, 1, 450); }
  if (DEATH > 0) DEATH -= dt;
  if (DISS){
    const D = DISS; D.t += dt;
    for (const d of D.drops){ if (d.sunk){ d.sunk += dt; d.m.scale.y = Math.max(0.05, 1 - d.sunk * 2); d.m.position.y -= dt * 0.25; d.m.material.opacity = Math.max(0, 1 - d.sunk * 1.6); continue; }
      d.vy -= 16 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.m.position.set(d.x, d.y, 0.06);
      if (d.vy < 0 && (solidAt(d.x, d.y - 0.03) || (d.y < d.floor + 0.02))){ d.y = Math.max(d.y, d.floor); d.sunk = 0.001; d.m.position.y = d.y; if (Math.random() < 0.15) sfx.step(); } }   // into the ground
    if (D.t >= DISS_T.raise && !D.raised){ D.raised = true; for (const d of D.drops){ R.scene.remove(d.m); d.m.geometry.dispose(); d.m.material.dispose(); } D.drops = []; raise(); }
    if (D.t >= DISS_T.end) DISS = null;
  }
  if (FLIGHT){
    const F = FLIGHT; F.t += dt; const u = Math.min(1, F.t / F.dur), e = u * u * (0.4 + 0.6 * u);   // slowly at first, then faster than can be followed
    if (F.n > 1){ const k = (1 - e) * (F.n - 1), i = Math.floor(k), a = TRAIL[i], b = TRAIL[Math.min(F.n - 1, i + 1)], f = k - i; F.s = a; P.x = a.x + (b.x - a.x) * f; P.y = a.y + (b.y - a.y) * f; P.face = a.face; }
    P.mantle = null; P.roll = 0; P.flip = 0; P.dive = null; P.atk = null; F.x = P.x; F.y = P.y + 1.3; F.face = P.face;
    if ((F.g -= dt) <= 0 && hero.sprite && F.s){ F.g = 0.028; const m = hero.sprite.ghost(0x9fd0ff); if (m) FX2.ghosts.push({ m, life: 0.22 }); }
    if (Math.random() < 0.6) fx.burst({ x: P.x, y: P.y + 1.2 }, 1, 0xcfe6ff);
    if (u >= 1){ FLIGHT = null; SCORE.warp(1); raise(); }
  }
  // at the water: mended, the flask filled. The first time at each, what it is: the raising pool gives him back after a
  // fall; a leak only mends
  for (const S of SHRINES) if (Math.abs(P.x - S.x) < S.half && Math.abs(P.y - S.y) < 1.5 && P.hp > 0 && !DISS && (!TOUCHED.has(S) || P.flask < P.flaskMax || P.hp < P.maxHp)){
    const first = !TOUCHED.has(S); TOUCHED.add(S); P.flask = P.flaskMax; P.hp = P.maxHp; if (first) sfx.shrine(); else sfx.drink(); store(); fx.ring({ x: P.x, y: S.y + 0.6 }, 0x9fe8ff); R.glint(P.x, S.y + 1, 0x9fe8ff, 0.8, 6, 0.8);
    if (first) (BANNER ? f => LATER.push({ t: 4, f }) : f => f())(() => banner(S.raise ? 'The water gathers here' : 'Water seeps through the rock here', S.raise ? 'when he falls, it gives him back here' : 'it mends him, and fills the flask', 4));   // after the place's own name, if that is up
  }

  if ((!BOSS || BOSS.st === 'dead') && !WON && R.exits.some(x => Math.abs(P.x - x.x) < 1 && Math.abs(P.y - x.y) < 1.5)){
    WON = true; sfx.gold();
    if (LEVEL.index < CLIMB_TOP) go(LEVEL.index + 1); else { G.done = true; store(); STORY.start('ending', {}, title); }   // the beacon: the end of the climb
  }
  if (GO.st){
    GO.t += dt;
    if (GO.st === 'out' && GO.t > 0.6){ GO.st = 'load'; GO.t = 0; }                 // a frame fully dark before the work
    else if (GO.st === 'load' && GO.t > 0.05){ const up = GO.to === GO.from + 1 && GO.to <= CLIMB_TOP; enter(GO.to, GO.at); acc = 0; GO.t = 0;
      if (up){ GO.st = 'card'; STORY.start('card', { from: GO.from, to: GO.to, name: LEVEL.name, line: CARD[GO.to] || '' }, () => { GO.st = 'in'; GO.t = 0; }); } else GO.st = 'in'; }   // going up: the card shows the mountain and where he is on it
    else if (GO.st === 'in' && !R.isReady) GO.t = 0;   // dark until the region's paintings are in
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
  if (ENT.cam){ wantX = ENT.cam.x; wantY = ENT.cam.y; }   // the entrance: to the slab coming down, then to where it will rise
  CAM.x += (wantX - CAM.x) * Math.min(1, dt * (FLIGHT ? 16 : ENT.cam ? 2.6 : 5)); CAM.y += (wantY - CAM.y) * Math.min(1, dt * (FLIGHT ? 16 : P.grounded ? 4 : 6));
  const halfH = VIEW_H / 2 * CAM.zoom, halfW = halfH * (R.size().w / R.size().h);
  const box = fight && !FLIGHT ? BOSS.room : { x0: 0, y0: 0, x1: LEVEL.W * T, y1: LEVEL.H * T };
  const keep = (c, a, b, h) => b - a < h * 2 ? (a + b) / 2 : Math.max(a + h, Math.min(b - h, c));   // a hall smaller than the view: kept in the middle of it
  const cx = keep(CAM.x, box.x0, box.x1, halfW), cy = keep(CAM.y, box.y0, box.y1, halfH);
  FEEL_FX.shake = Math.max(0, FEEL_FX.shake - dt * 1.2); const sk = FEEL_FX.shake * OPT.shake;
  FEEL_FX.kick *= Math.exp(-dt * 14);   // a blow nudges the view the way it goes
  R.setCamera(cx + (Math.random() - 0.5) * sk + FEEL_FX.kick, cy + (Math.random() - 0.5) * sk, CAM.zoom);
  // the warrior (not while he is dead and the scarf is on its way)
  const gone = (P.hp <= 0 && DEATH < 0.6 && !FLIGHT) || (DISS && !DISS.raised); if (hero.sprite) hero.sprite.g.visible = !gone;   // come apart, he is gone
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
  landT = Math.max(0, landT - dt); PLUNGE_T = Math.max(0, PLUNGE_T - dt); CROUCH_T = P.crouch && P.grounded ? CROUCH_T + dt : 0;
  // dust at his feet as he runs, now and then
  if (P.grounded && Math.abs(P.vx) > 4 && !P.atk){ FX2.runDust += Math.abs(P.vx) * dt; if (FX2.runDust > 1.3){ FX2.runDust = 0; fx.kick({ x: P.x, y: P.y }, -Math.sign(P.vx), 3, 1.4); } }
  if (hero.sprite){
    hero.sprite.mat.emissive.setHex(FLIGHT ? 0x4a6a90 : P.inv > 0 && Math.floor(time * 20) % 2 ? 0x803030 : 0x000000);
  }
  // the scarf: from his neck (lower when he crouches or rolls), as long as his hearts; the wind is the region's
  { const M = P.mantle, low = P.roll > 0 ? 0.8 : P.crouch ? 1.15 : P.dive ? 1.5 : WAKE > 0.5 ? 0.9 : 1.92;
    const ax = FLIGHT ? FLIGHT.x : M && M.wall != null ? M.wall - M.d * 0.25 : P.x - P.face * 0.14, ay = FLIGHT ? FLIGHT.y : M ? Math.min(M.y1 + 1.8, P.y + 1.9) : P.y + low - SINK, fc = FLIGHT ? FLIGHT.face : M ? M.d : P.face;
    const links = hp => SCARF.base + Math.min(5, Math.max(0, hp)) * SCARF.perHeart + Math.max(0, hp - 5) * SCARF.more, want = links(FLIGHT ? 1 : P.hp), lk = R.look(), out = (roomAt(P.x, P.y) || {}).open !== false, wind = (lk === 'spires' || lk === 'tempest') && out ? (lk === 'tempest' ? -7 : -5) : lk === 'spires' || lk === 'tempest' || lk === 'firmament' ? -1.2 : lk === 'gardens' && out ? -2 : -0.6;
    SCF.step(dt, ax, ay, fc, want, wind, solidAt, P.glide ? 15 : 0); SCF.draw(!(DISS && !DISS.raised && DISS.t > 0.15), EMBER.n / EMBER.cap, G.worn); }
  // embers go to him; ten make a heart
  stepFx(fx, dt, P.hp > 0 ? { x: P.x, y: P.y + 1.3 } : null, () => {
    EMBER.n = Math.min(EMBER.cap, EMBER.n + 1); sfx.step();
  });
  R.frame(time, P);
  drawHud(dt);
  requestAnimationFrame(frame);
}
// cracked rock within r of a blow: it breaks if he has the Warden's weight; if not, he is told once what it wants
const HINTED = {}, LATER = []; let PURSE = 0, USE = null, TRAILT = 0;
// ---- teaching (teach.js): hints when he struggles, and cards. A card is a page in the middle: a picture, a name, what
// it does (plainly, large), how (with his keys), and whose it was (small); they wait their turn (CARDQ)
const TEACHER = makeTeach(G, OPT, store), kname = a => keyName(a, DEVICE.kind, SET), keyed = str => fill(str, kname).replace(/^./, c => c.toUpperCase());
const CARDQ = [], card = c => { CARDQ.push({ t: 0, ...c, how: (c.how || []).map(keyed) }); };
// once each: a system's card, the first time it matters
const firstCard = id => { const T2 = (G.taught = G.taught || {}); if (T2['card_' + id]) return; T2['card_' + id] = 1; store(); card(CARDS[id]); };
// the embers are shown, and talked of, once he has something to spend them on
const embersKnown = () => CAN.breaker || CAN.dash || CAN.glide || has('seedheart');
// a card: the picture in a frame, what kind of thing it is, its name; what it does, large; how, with his keys; whose it
// was, small and quiet; a last word (the knot). `modal`: over the game, darkened, waiting for a press; else on a page
function drawCard(c, W, modal, top = 8){
  if (modal) HUD.dark(0.7);
  const cx = Math.round(W / 2); let y = top;
  if (c.icon){ HUD.px('#181425', cx - 19, y, 38, 38); HUD.px('#ead4aa', cx - 18, y + 1, 36, 36); HUD.px('#262b44', cx - 17, y + 2, 34, 34); drawIcon(HUD.px, c.icon, cx - 16, y + 3, 2); y += 42; }
  if (c.head){ HUD.fine(c.head, cx, y, '#8b9bb4', 'center'); y += 8; }
  const big = textWidth(c.title.toUpperCase(), 2) <= W - 24 ? 2 : 1; HUD.text(c.title.toUpperCase(), cx, y, '#fee761', big, 'center'); y += 7 * big + 5; HUD.rule(cx, y, 60, '#ead4aa'); y += 6;
  for (const ln of wrapText(c.does, W - 40)){ HUD.text(ln, cx, y, '#fff2d0', 1, 'center'); y += 10; }
  for (const h of c.how || []){ y += 2; for (const ln of wrapText(h, W - 48)){ HUD.text(ln, cx, y, '#2ce8f5', 1, 'center'); y += 10; } }
  if (c.lore){ y += 3; for (const ln of wrapText(c.lore.toUpperCase(), W - 30)){ HUD.fine(ln, cx, y, '#8b9bb4', 'center'); y += 7; } }
  if (c.foot){ y += 3; HUD.fine(c.foot.toUpperCase(), cx, y, '#c0cbdc', 'center'); y += 8; }
  if (modal && c.t > 0.7 && Math.floor(time * 2) % 2) HUD.text('PRESS TO GO ON', cx, Math.min(170, Math.max(150, y + 6)), '#8b9bb4', 1, 'center');
}
// ---- what he carries (from the pause): his gifts, weapons and relics, each a button; the one picked shows its card
let CARRY = [];
const carryCards = () => [
  ...TEACH.filter(t => t.can && CAN[t.can]).map(t => ({ head: 'A GIFT', title: t.name, icon: t.icon, does: t.does, how: t.how })),
  { head: 'IN HIS HAND' + (P.weapon !== 'spade' ? '' : ' NOW: THE SPADE'), title: 'The blade', icon: 'blade', does: 'Quick cuts, three to a string; it can block.', how: ['{attack}: cut. {block}: block.'] },
  ...(armed('spade') ? [{ head: 'A WEAPON', title: 'The Sexton\'s Spade', icon: 'spade', does: 'One great swing: slow, long, and it breaks cracked stone where it lands. He cannot block with it.', how: ['{swap}: blade or spade.'] }] : []),
  ...G.relics.filter(id => RELICS[id]).map(id => ({ head: has(id) ? 'A RELIC · TIED' : 'A RELIC · CARRIED, NOT TIED', title: RELICS[id].name, icon: id, does: RELICS[id].line, lore: RELICS[id].lore })),
].map(c => ({ ...c, how: (c.how || []).map(keyed) }));
function carryScreen(){
  SCREEN = 'carry'; PAUSE = true; release(); const keep = MSEL; CARRY = carryCards();
  const grid = document.createElement('div'); grid.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:min(94vw,600px)';
  CARRY.forEach((c, i) => { const b = menuButton(c.title, () => { MSEL = i; menuMark(); sfx.ui(); }, true); b.style.fontSize = '11px'; b.style.padding = '3px 7px'; b.addEventListener('pointerenter', () => { if (MSEL !== i){ MSEL = i; menuMark(); } }); grid.appendChild(b); });
  menuShow([grid, menuButton('Back', () => pause(true), true)], false, () => pause(true)); MENU.style.top = 'auto'; MENU.style.bottom = '1.5%'; MSEL = Math.min(keep, CARRY.length - 1); menuMark();
}
function drawCarry(W){
  HUD.dark(0.92, '#181425'); HUD.text('WHAT HE CARRIES', W / 2, 4, '#fff2d0', 1, 'center');
  const spare = G.relics.length - G.worn.length;
  HUD.fine(`${P.maxHp} HEARTS · ${G.threads % THREADS_A_HEART} OF ${THREADS_A_HEART} STRANDS TOWARD ANOTHER · FLASK ${P.flaskMax} · ${G.worn.length} OF ${knots()} KNOTS TIED${spare > 0 ? ` · ${spare} MORE CARRIED` : ''}`, W / 2, 13, '#8b9bb4', 'center');
  const c = CARRY[MSEL]; if (c) drawCard(c, W, false, 22);
}
const onPlank = P => { const j = Math.floor((P.y - 0.02) / T); for (const x of [P.x - BODY.hw + 0.01, P.x + BODY.hw - 0.01]) if (tileAt(Math.floor(x / T), j) === LEDGE) return true; return false; };
// ---- the ember arts. Which: down = the slam (the Warden's weight), in the air = the gust (the Wyrm's wind), else the
// cleave (the Toll's step); each needs its gift and a measure of embers. Their blows are hitBox's (enemies.js): once a
// creature, and they give no embers back
const ART_GIFT = { slam: 'breaker', cleave: 'dash', gust: 'glide' }, WAVES = [];
function art(e){
  const kind = e.down ? 'slam' : e.air ? 'gust' : 'cleave';
  if (!CAN[ART_GIFT[kind]]){ sfx.block(); if (!HINTED.artGift){ HINTED.artGift = 1; banner('', 'he has not been given that yet', 2.4); } return; }
  if (EMBER.n < ARTS.cost){ sfx.block(); fx.burst({ x: P.x, y: P.y + 1.3 }, 4, 0x5a6988); if (!HINTED.artCost){ HINTED.artCost = 1; banner('', 'it takes a full measure of embers', 2.4); } return; }
  EMBER.n -= ARTS.cost; const how = startArt(P, kind), at = { x: P.x, y: P.y + 1.2 };
  fx.ember(at, 0); R.glint(at.x, at.y, 0xff8060, 1.1, 6, 0.4); buzz(0.5, 0.4, 160);
  if (how === 'slam'){ sfx.slam(); sfx.impact(true); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.4); fx.puff({ x: P.x, y: P.y }, 26, 4); fx.ring({ x: P.x, y: P.y + 0.2 }, 0xffd27a); R.shock(P.x, P.y + 0.3, true); waves(P.x, P.y); }
  else if (how === 'dive') sfx.whoosh();
  else if (how === 'cleave'){ sfx.dash(); sfx.swing(true); P.art.seen = new Set(); FEEL_FX.kick = P.face * 0.3; }
  else if (how === 'gust'){ sfx.whoosh(); sfx.gust(); const out = []; hitBox(E, P.x - 2.6, P.x + 2.6, P.y - 0.6, P.y + 3.2, 2, out, new Set(), P.x, 1.2); if (BOSS) BOSS.slam(P, 2.4, 1, out); for (const o of out){ o.art = true; onEvent(o); }
    fx.ring({ x: P.x, y: P.y + 1 }, 0xc0f4ff); fx.burst({ x: P.x, y: P.y + 1 }, 24, 0xc0cbdc); R.shock(P.x, P.y + 1, false); }
}
// the slam's blow, run out along the floor both ways: it strikes what it reaches, breaks cracked stone, stops at a wall
function waves(x, y){ for (const dir of [-1, 1]) WAVES.push({ x: x + dir * 0.6, y, dir, t: 0, seen: new Set(), boss: false }); }
function stepArts(dt){
  const out = [];
  if (P.art && P.art.k === 'cleave'){ const a = P.art;   // all that he rushes through
    hitBox(E, Math.min(a.from, P.x) - 0.7, Math.max(a.from, P.x) + 0.7, P.y - 0.3, P.y + 2.6, 2, out, a.seen, P.x - a.dir * 2);
    if (BOSS && !a.boss && BOSS.strike(P, 1.6, 2, out)) a.boss = true;
    fx.streak({ x: P.x, y: P.y }, a.dir); if (Math.random() < 0.6) fx.burst({ x: P.x, y: P.y + 1.2 }, 2, 0xfee761); }
  if (P.art && P.art.k === 'gust'){ fx.burst({ x: P.x + Math.cos(P.art.t * 30) * 1.2, y: P.y + 1 + Math.sin(P.art.t * 30) * 0.6 }, 2, 0xc0f4ff); }
  for (let i = WAVES.length - 1; i >= 0; i--){ const w = WAVES[i]; w.t += dt; w.x += w.dir * 14 * dt;
    if (w.t > 0.8 || solidAt(w.x + w.dir * 0.3, w.y + 0.4) || !solidAt(w.x, w.y - 0.3)){ breakRock(w.x + w.dir * 0.4, w.y + 0.2, 0.9); fx.dust({ x: w.x, y: w.y }, 8, 2.5); WAVES.splice(i, 1); continue; }   // a wall (cracked stone breaks), or the floor ends
    hitBox(E, w.x - 0.7, w.x + 0.7, w.y - 0.3, w.y + 1.8, 2, out, w.seen, w.x - w.dir);
    if (BOSS && !w.boss && BOSS.slam({ x: w.x, y: w.y, face: w.dir }, 0.7, 1, out)) w.boss = true;
    breakRock(w.x, w.y + 0.2, 0.9);
    fx.kick({ x: w.x, y: w.y }, w.dir, 3, 3); R.glint(w.x, w.y + 0.4, 0xffd27a, 0.5, 3); }
  for (const o of out){ o.art = true; onEvent(o); }
}
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
  if (INTRO[N.who] && !Object.keys(G.met).some(m => m.endsWith(':' + N.who)) && !lines.includes(INTRO[N.who])) lines.unshift(INTRO[N.who]);   // the first meeting anywhere: who they are (teach.js)
  if (N.who === 'scribe'){ const L = ITEMS.left(), pl = (c, w) => `${c} ${w}${c === 1 ? '' : 's'}`; lines.push(L.threads + L.chests === 0 ? 'My page for this place is full. There is nothing here you have not found.' : `Not yet entered as found, here: ${pl(L.threads, 'red strand')}, ${pl(L.chests, 'chest')}${L.relic ? ', and something old behind cracked stone' : ''}.`); }
  G.met[k] = n + 1; store(); release(); sfx.ui(); TALK.start(N.who, lines, N.who === 'lamplighter' ? shop : null, N.art);
}
// his body as drops of water: pixels of his drawing's colours (the pale of the water, the red of the thread), each
// thrown a little out and let fall; `floor` is the ground under him, where they sink
function dissolve(){
  const out = [], cols = [0xdff4ff, 0x9fe8ff, 0x2ce8f5, 0x0099db, 0xffffff, 0xe43b44], floor = P.y;
  for (let k = 0; k < 110; k++){ const m = new THREE.Mesh(new THREE.PlaneGeometry((k % 3 ? 1 : 2) / 16, (k % 4 ? 2 : 3) / 16), new THREE.MeshBasicMaterial({ color: cols[k % 11 === 0 ? 5 : k % 5], transparent: true }));
    const x = P.x + (Math.random() - 0.5) * 0.7, y = P.y + 0.1 + Math.random() * 2.2; m.position.set(x, y, 0.06); R.scene.add(m);
    out.push({ m, x, y, vx: (Math.random() - 0.5) * 1.6 + (x - P.x) * 1.5, vy: Math.random() * 1.6, floor, sunk: 0 }); }
  return out;
}
// the water gives him back: out of the region's raising water, whole, and one word over it (decision 0.2). The creatures
// are there again
const POOL_LINES = ['The water gives him back.', 'Again.', 'It is not his doing.', 'What falls here does not stay fallen.', 'The light has not let go of the thread.', 'Up. He is expected.', 'It costs him nothing. That is the hard part.'];
let RISEN = null;   // the word over him as he comes up: { t, line, n }
function raise(){
  const s = RAISE ? { x: RAISE.x, y: RAISE.y } : spawnPoint(), keep = EMBER.n, n = G.falls || 1;
  P = born(s.x, s.y); refill(); if (BOSS) BOSS.reset(); ENT.reset(); EMBER.n = keep; SCF.reset(s.x, s.y + 1.8); TRAIL.length = 0; CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0; FX2.ghosts.forEach(G2 => { G2.life = 0; }); store();
  WAKE = 1.1; RISEN = { t: 0, line: POOL_LINES[(n - 1) % POOL_LINES.length], n }; if (RAISE) TOUCHED.add(RAISE);   // raised in it: it needs no telling
  splash(s.x, s.y); sfx.shrine();
}
// he comes up out of the water: rings on it, drops thrown up, the light
function splash(x, y){ fx.ring({ x, y: y + 0.6 }, 0xcfe6ff); fx.burst({ x, y: y + 0.8 }, 22, 0xdff4ff); fx.burst({ x, y: y + 0.4 }, 10, 0x2ce8f5); R.glint(x, y + 1, 0xcfe6ff, 1.2, 7, 0.9); sfx.splash && sfx.splash(); }
// the creatures of the region, made again (what a creature made for itself in the scene goes with it)
function refill(){
  for (const e of E.list) for (const v of Object.values(e)){ if (!v || typeof v !== 'object') continue; if (v.isObject3D) R.scene.remove(v); else if (v.g && v.g.isObject3D) R.scene.remove(v.g); else if (v.m && v.m.isObject3D) R.scene.remove(v.m); }
  E = spawnEnemies(R.scene, R);
}
// what a region's tick is handed: the renderer, him, the effects, sound, a flash of the whole picture, a shake
const TICK = { R, get P(){ return P; }, get fx(){ return fx; }, sfx, LEVEL, flash: v => { FLASH = Math.max(FLASH, v); }, shake: v => { FEEL_FX.shake = Math.max(FEEL_FX.shake, v); }, get room(){ return roomAt(P.x, P.y); } };
const TCTX = { get P(){ return P; }, solidAt };
function onEvent(e){
  const at = { x: P.x, y: P.y }; TEACHER.event(e, TCTX);
  switch (e.type){
    case 'jump': sfx.jump(); fx.puff(at, 8, 1.6); break;
    case 'doubleJump': sfx.jump(); fx.ring(at, 0x9ff0ff); FX2.flipped = true; break;
    case 'land': sfx.step(); fx.puff(at, e.hard ? 20 : 8, e.hard ? 3.2 : 2); if (e.hard) FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); if (e.hard || (e.drop || 0) > 0.8 || FX2.flipped){ landT = LAND_T; } FX2.flipped = false; break;
    case 'slam': { if (e.art) waves(P.x, P.y); PLUNGE_T = PLUNGE_LAND; landT = 0; sfx.slam(); fx.puff(at, 24, 3.6); R.shock(P.x, P.y + 0.3, true); fx.ring(at, 0xffd27a);
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
      const big = e.finisher, tilt = { atk_spade: -0.9, atk_slam_v3: -0.7, atk_slam_px: -0.7, atk_rise_px: 1.0, atk_spin_px: 0.1, atk_dash_px: 0.25 }[e.sw.anim] || 0;
      sfx.swing(big); if (!SWINGFX.has(e.sw.anim)) fx.crescent({ x: P.x + P.face * 1.15, y: P.y + 1.25 }, P.face, big, tilt);   // the combo's cuts have their own drawn effect
      R.glint(P.x + P.face * 1.3, P.y + 1.3, big ? 0xffd27a : 0xbfe8ff, big ? 0.9 : 0.6, 4.5, 0.22); R.shock(P.x + P.face * 1.3, P.y + 1.2, big);
      if (P.grounded) fx.kick(at, -P.face, big ? 12 : 7, big ? 3 : 2.2);
      FEEL_FX.shake = Math.max(FEEL_FX.shake, big ? 0.14 : 0.07); FEEL_FX.kick = P.face * (big ? 0.22 : 0.12);
      // the dash cut strikes all along where he dashed
      const from = e.sw.dash && P.dashFrom != null ? { ...P, x: P.dashFrom } : P, reach = weaponOf(P).reach + (e.sw.dash && P.dashFrom != null ? Math.abs(P.x - P.dashFrom) : 0);
      const dmg = e.sw.dmg + (big && has('whetstone') ? 1 : 0) + (G.edge >= 2 || (G.edge && big) ? 1 : 0), out = [];   // the whetstone, and the tempering
      strikeEnemies(E, from, reach, dmg, out); if (BOSS) BOSS.strike(from, reach, dmg, out); ITEMS.strike(from, reach, out);
      if (weaponOf(P).digs) breakRock(P.x + P.face * 1.8, P.y + 0.6, 1.5); else breakRock(P.x + P.face * 1.2, P.y + 1.2, big ? 1.3 : -1); for (const o of out) onEvent(o); break; }   // the spade digs where it lands
    case 'hit': if (!e.art) EMBER.n = Math.min(EMBER.cap, EMBER.n + 1);   // a landed blow gives an ember (not an art's)
      buzz(e.heavy ? 0.35 : 0.15, e.heavy ? 0.5 : 0.3, e.heavy ? 90 : 50); sfx.hit(); fx.burst(e.at, e.heavy ? 18 : 12, 0xffe0a8); R.glint(e.at.x, e.at.y, 0xffe0a8, e.heavy ? 0.9 : 0.6, 3.5, 0.16); FEEL_FX.hitstop = e.heavy ? 0.09 : 0.05; FEEL_FX.shake = Math.max(FEEL_FX.shake, e.heavy ? 0.18 : 0.1); break;
    case 'swap': {   // blade and spade, if he has the spade
      const to = P.weapon === 'spade' ? 'blade' : 'spade'; if (!armed(to)){ if (!HINTED.swap){ HINTED.swap = 1; banner('', 'he has only the blade', 2.2); } break; }
      P.weapon = G.wield = to; store(); sfx.whoosh(); fx.ring({ x: P.x, y: P.y + 1.1 }, to === 'spade' ? 0xc0cbdc : 0xffd27a); banner('', to === 'spade' ? 'the sexton\'s spade' : 'the blade', 1.4); break; }
    case 'kill': if (e.e && e.e.type === 'sexton' && !armed('spade')){ (G.arms = G.arms || []).push('spade'); store(); swapButton();   // the Sexton's spade: his, now
        LATER.push({ t: 1.1, f: () => card({ head: 'HE TAKES IT UP', title: 'The Sexton\'s Spade', icon: 'spade', does: 'One great swing: slow, long, and it breaks cracked stone where it lands. He cannot block with it.', how: ['{swap}: blade or spade.'] }) }); }
      if (e.e){ (G.slain = G.slain || {})[e.e.type] = (G.slain[e.e.type] || 0) + 1; (G.seen = G.seen || {})[e.e.type] = 1; DIRTY = DIRTY > 0 ? DIRTY : 2; } sfx.kill(); ITEMS.spill(e.at.x, e.at.y, 1 + Math.min(5, e.e ? e.e.d.hp : 1)); fx.burst(e.at, 26, 0xff70d0); fx.ring(e.at, 0xffc0ff); FEEL_FX.hitstop = 0.1; fx.ember(e.at, 2 + Math.min(5, e.e ? e.e.d.hp : 2) + (has('stylus') ? 2 : 0)); R.glint(e.at.x, e.at.y, 0xff9040, 1, 5, 0.35); break;
    // his guard turns a blow: it is seen to bounce off. A block: sparks off the blade, a flash, he gives a step, the
    // creature is thrown back. A parry (raised as it landed): a bright ring and a white flash, a held beat, the creature
    // thrown further and staggered, sparks both ways (enemies.js, stunned)
    case 'parry': buzz(0.3, 0.7, 110); sfx.parry(); fx.ring(e.at, 0x9fd0ff); FEEL_FX.hitstop = 0.12;
      if (e.mine){ fx.ring(e.at, 0xffffff); fx.burst(e.at, 22, 0xfff2d0); fx.burst(e.at, 10, 0x9fd0ff); R.glint(e.at.x, e.at.y, 0xffffff, 1.4, 5, 0.3); FLASH = Math.max(FLASH, 0.06); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.16); FEEL_FX.kick = -P.face * 0.18; } break;
    case 'block': sfx.block(); fx.burst(e.at, 8, 0xc9d2e0);
      if (e.mine){ fx.burst(e.at, 12, 0xfee761); R.glint(e.at.x, e.at.y, 0xfff2d0, 0.8, 3.5, 0.18); FEEL_FX.hitstop = Math.max(FEEL_FX.hitstop, 0.05); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.08); if (P.grounded && !e.shot) P.vx = -P.face * 3; } break;
    case 'spit': sfx.spit(); break;
    case 'tell': e.e.tellT = 0.6; break;
    case 'step': sfx.step(); break;
    case 'mantle': sfx.whoosh(); break;
    case 'hurt': { buzz(0.7, 0.5, 200); sfx.hurt(); fx.burst({ x: P.x, y: P.y + 1.3 }, 10, 0xff6060); const a = SCF.tip(); fx.burst({ x: a.x, y: a.y }, 12, 0xff7030); fx.burst({ x: a.x, y: a.y }, 6, 0xfee761); FLASH = Math.max(FLASH, 0.12); break; }   // the end of the scarf burns off
    case 'skid': fx.kick(at, Math.sign(P.vx) || P.face, 6, 2.2); break;
    case 'bossWake': { const first = !(G.keepers && G.keepers[LEVEL.theme]); (G.keepers = G.keepers || {})[LEVEL.theme] = 1; store(); BOSS.shown = false; BANNER = null; ENT.start(BOSS, first, P, { theme: LEVEL.theme, epithet: EPITHET[LEVEL.index] || '' }); SCORE.load(LEVEL.index === CLIMB_TOP ? 'boss_final' : 'boss'); break; }   // the hall shuts, then it comes (entrance.js); its name comes up with the bars (drawHud)
    case 'bossToll': sfx.parry(); sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2); break;
    case 'bossTell': sfx.creak(); break;
    case 'bossSlam': buzz(e.soft ? 0.4 : 0.8, 0.5, e.soft ? 120 : 260); sfx.impact(true); sfx.slam(); fx.dust(e.at, e.soft ? 10 : 26, 4); R.glint(e.at.x, e.at.y + 0.5, 0xffd27a, e.soft ? 0.4 : 0.9, 6, 0.3); if (!e.soft) fx.ring(e.at, 0xffd27a); FEEL_FX.shake = Math.max(FEEL_FX.shake, e.soft ? 0.18 : 0.42); break;
    case 'bossSweep': sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.15); break;
    case 'rockLand': sfx.crack(); fx.dust(e.at, 8, 2); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); break;
    case 'bossPhase': sfx.roar(); FEEL_FX.shake = 0.6; banner(BOSS.name + ' rages', BOSS.rage); break;
    case 'bossDie': buzz(1, 0.9, 700); sfx.roar(); sfx.bossDie(); FEEL_FX.hitstop = 0.3; FEEL_FX.shake = 0.8; SLOW = 1.3; FLASH = 0.5; break;
    case 'bossDead': { ENT.open(); for (const x of R.exits) x.set(true); sfx.door(); banner(BOSS.name + ' falls', BOSS.fell); ITEMS.spill(BOSS.cx, BOSS.stageY + 2, 60);
      // what it leaves him, the first time
      const n = LEVEL.index, t = TEACH[n];
      if (!G.beat[n]){ G.beat[n] = true; if (t && t.heart){ G.hearts += t.heart; P.maxHp = maxHearts(); P.hp = P.maxHp; } if (t && t.flask){ G.flasks += t.flask; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } learn(); store();
        if (t && t.name) LATER.push({ t: 3.4, f: () => { card({ head: 'HE HAS BEEN GIVEN', title: t.name, icon: t.icon, does: t.does, how: t.how }); sfx.ability(); if (t.can) firstCard('embers'); } }); }
      break; }
    case 'shard': G.shards += e.v; sfx.shard(); PURSE = 2.5; DIRTY = DIRTY > 0 ? DIRTY : 2; break;
    case 'urn': sfx.urn(); fx.dust(e.at, 10, 3); fx.burst(e.at, 6, 0xd77643); break;
    case 'chest': sfx.chest(); fx.ring(e.at, 0xffd27a); fx.burst(e.at, 16, 0xfee761); R.glint(e.at.x, e.at.y, 0xffd27a, 1, 5, 0.5); break;
    case 'thread': { G.threads++; sfx.thread(); fx.ring(e.at, 0xff5040); fx.burst(e.at, 18, 0xe43b44); R.glint(e.at.x, e.at.y, 0xff5040, 1, 5, 0.5); const k = G.threads % THREADS_A_HEART;
      if (k === 0){ const m = maxHearts(); if (m > P.maxHp){ P.maxHp = m; P.hp = m; } banner('The thread lengthens', 'three strands: a heart more', 4); } else banner('A red strand', `${k} of ${THREADS_A_HEART} toward a heart`, 3.4);
      store(); break; }
    case 'relic': { const r = RELICS[e.id]; if (!r || owns(e.id)) break; G.relics.push(e.id); const tied = wear(e.id, true); learn(); store(); sfx.relic();   // tied into the scarf, if a knot is free
      const knot = tied ? 'He ties it into his scarf.' : 'Every knot is tied. At the water, he chooses what he wears.';
      LATER.push({ t: 0.7, f: () => { card({ head: 'A RELIC', title: r.name, icon: e.id, does: r.line, lore: r.lore, foot: knot }); firstCard('knots'); } }); break; }
    case 'flask': if (P.flask > 0 && P.hp < P.maxHp){ P.flask--; P.hp = Math.min(P.maxHp, P.hp + TUNE.player.flaskHeal); sfx.drink(); fx.ring({ x: P.x, y: P.y + 0.8 }, 0x5ce1c6); }
      else if (P.hp < P.maxHp && EMBER.n >= EMBER.mend){ EMBER.n -= EMBER.mend; P.hp++; sfx.drink(); fx.ring({ x: P.x, y: P.y + 1.2 }, 0xff8060); R.glint(P.x, P.y + 1.2, 0xff8060, 0.9, 5, 0.5); fx.ember({ x: P.x, y: P.y + 1.2 }, 0); }   // the flask is dry: a measure of embers mends a heart
      else if (P.hp < P.maxHp && !HINTED.mend && embersKnown()){ HINTED.mend = 1; banner('', 'a full measure of embers will mend a heart', 2.8); }
      break;
    case 'art': art(e); break;
  }
}
// the lines of help at the foot of the screen, for what he is playing with. A controller's are its own buttons, as bound
const PADN = { xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT'], ps: ['CROSS', 'CIRCLE', 'SQUARE', 'TRIANGLE', 'L1', 'R1', 'L2', 'R2'] };
const padKey = a => { const i = (SET.pad[a] || [])[0], N = PADN[DEVICE.kind === 'ps' ? 'ps' : 'xbox']; return i == null ? '-' : N[i] || 'B' + i; };
const HINT = { keys: ['A D MOVE · SPACE JUMP, AGAIN IN THE AIR · SHIFT ROLL', 'CLICK CUT · RIGHT CLICK OR K BLOCK · S + CLICK RISING CUT · CLICK IN A ROLL: DASH CUT', 'S + CLICK IN THE AIR: PLUNGE · S + SPACE: DROP · S: TALK, OPEN · M MAP · ESC PAUSE', 'E: EMBER ART (S + E, OR IN THE AIR) · Q: FLASK, OR EMBERS TO MEND'], touch: ['TOUCH THE LEFT OF THE SCREEN AND DRAG TO MOVE', 'DRAG DOWN: CROUCH, TALK, OPEN · DOWN + A IN THE AIR: PLUNGE', 'EMBERS: AN ART (WITH DOWN, OR IN THE AIR) · FLASK: DRINK, OR MEND'],
  get pad(){ const k = padKey; return [`STICK MOVE · ${k('jump')} JUMP, AGAIN IN THE AIR · ${k('roll')} ROLL · ${k('attack')} CUT · ${k('block')} BLOCK`, `DOWN + ${k('attack')}: RISING CUT · DOWN + ${k('attack')} IN THE AIR: PLUNGE · ${k('flask')} DRINK`, `DOWN: TALK, OPEN · DOWN + ${k('jump')}: DROP · SELECT: MAP · START: PAUSE`, `${k('art')}: EMBER ART (WITH DOWN, OR IN THE AIR) · ${k('flask')} WITH NONE LEFT: EMBERS MEND`]; } };
const EPITHET = LEVELS.map(l => l.epithet);
function drawHud(dt){
  HUD.begin(R.size().w); const W = HUD.W, v = new window.THREE.Vector3();
  // a red ! over a creature winding up
  for (const e of E.list){ if (!e.alive || !(e.tellT > 0)) continue; e.tellT -= dt; v.set(e.x, e.y + e.d.h + 0.7, 0).project(R.camera); HUD.tell(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * 180)); }
  const rising = !!(BOSS && BOSS.st === 'rise');
  HUD.dark((ENT.vig || 0) * 0.32, ENT.tint); HUD.vignette(ENT.vig || 0, ENT.vigCol); HUD.sweep(ENT.sweep);   // the hall darkens, the sky too, and closes in; something passes over
  HUD.cinema(rising && ENT.st !== 'seal', dt, '', '', 0);   // the bars; its name is the entrance's (HUD.title)
  HUD.title(ENT.title);
  if (BOSS && BOSS.st === 'fight' && !BOSS.shown && !ENT.title){ BOSS.shown = true; banner('', BOSS.hint, 3.5); }   // once it is up: how it is hurt
  if (!rising && !TALK.on && !FLIGHT){
    HUD.status(P, EMBER.n, EMBER.cap, P.flaskMax, time, ARTS.cost, embersKnown()); HUD.weapon(P.weapon === 'spade' ? 'spade' : 'blade', armed('spade') ? kname('swap') : null, drawIcon); PURSE = Math.max(0, PURSE - dt); HUD.purse(P, P.flaskMax, G.shards, PURSE, G.threads % THREADS_A_HEART, THREADS_A_HEART);
    const room = roomAt(P.x, P.y); if (room) MAP.seen.add(room);
    const st = ITEMS.station(P), place = LEVEL.name + (room ? ' · ' + (room.title || room.name) : '') + (st ? ' · ' + st.station.name : '');   // beside one of the three: their station's name if (place !== PLACE.name){ PLACE.name = place; PLACE.t = 0; } PLACE.t += dt;
    HUD.place(place, PLACE.t < 3 ? 1 : Math.max(0.45, 1 - (PLACE.t - 3) * 0.5));
    HUD.boss(BOSS && BOSS.hud(), dt);
    const dots = mapDots();
    HUD.map(MAP.c, LEVEL.W, LEVEL.H, MAP.seen, room, T, dots, Math.max(0, Math.min(1, P.y / (LEVEL.H * T))), SPANS, LEVEL.index, time, P);
  }
  if (BANNER && !TALK.on && !NOTE && SCREEN !== 'annals'){ BANNER.t -= dt; HUD.banner(BANNER.a, BANNER.b, Math.max(0, Math.min(1, BANNER.t, (BANNER.life - BANNER.t) * 3))); if (BANNER.t <= 0) BANNER = null; }
  { const L = TEACHER.shown(); if (L && !PAUSE && !TALK.on && !NOTE && !rising){ v.set(P.x, P.y, 0).project(R.camera); const sx = Math.round((v.x + 1) / 2 * W), sy = Math.round((1 - v.y) / 2 * 180);
    HUD.lesson(L.show.map(([a, word]) => [kname(a), word]), sx, sy > 150 ? sy - 52 : sy + 6, L.a, time); } }   // under him (over him, if he is low on the screen)
  HUD.label(BUILD);
  if (FLIGHT){ const u = FLIGHT.t / FLIGHT.dur; HUD.dark(0.16 + u * 0.3, '#cfe6ff'); HUD.g.globalAlpha = 0.35; for (let k = 0; k < 14; k++){ const y = (k * 37 + Math.floor(time * 60) * 13) % 180, x = (k * 71 + Math.floor(time * 60) * 29) % W; HUD.px('#ffffff', x, y, 18 + (k * 13) % 50, 1); } HUD.g.globalAlpha = 1; if (u > 0.82) HUD.dark((u - 0.82) / 0.18, '#ffffff'); }
  // a fall: the dark comes down after the drops have sunk, and lifts off him rising out of the water; the word over him
  if (DISS){ const t = DISS.t, k = t < DISS_T.dark ? 0 : t < DISS_T.raise ? (t - DISS_T.dark) / (DISS_T.raise - DISS_T.dark) : 1 - (t - DISS_T.raise) / (DISS_T.end - DISS_T.raise); if (k > 0) HUD.dark(Math.min(1, k), '#0b0810'); }
  if (RISEN){ RISEN.t += dt; const t = RISEN.t, a = Math.max(0, Math.min(1, (t - 0.5) / 0.6, (3.4 - t) / 0.8));
    if (a > 0){ HUD.g.globalAlpha = a; HUD.text('PERSEVERE', W / 2, 52, '#cfe6ff', 2, 'center'); HUD.rule(Math.round(W / 2), 72, 46, '#9fe8ff'); HUD.text(RISEN.line, W / 2, 80, '#fff2d0', 1, 'center'); if (RISEN.n > 1) HUD.fine(`${RISEN.n} TIMES`, W / 2, 92, '#8b9bb4', 'center'); HUD.g.globalAlpha = 1; }
    if (t > 3.4) RISEN = null; }
  if (FLASH > 0 && OPT.flash) HUD.dark(FLASH * 1.4, '#ffffff');
  // over what he can use: the key for it
  if (USE && !PAUSE && !TALK.on && !NOTE){ v.set(USE.x, USE.y + (USE.type === 'npc' ? 2.6 : 1.5), 0).project(R.camera); HUD.prompt(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * 180), USE.type === 'npc' ? 'TALK' : USE.type === 'flame' ? 'TIE KNOTS' : 'OPEN', time, kname('down')); }
  TALK.draw(HUD, dt, time);
  if (NOTE) drawCard(NOTE, W, true);
  if (PAUSE && SCREEN === 'annals') drawAnnals(W);
  else if (PAUSE && SCREEN === 'map') drawMap();
  else if (PAUSE && SCREEN === 'shop') HUD.dark(0.55);
  else if (PAUSE && SCREEN === 'knots') drawKnots(W);
  else if (PAUSE && SCREEN === 'carry') drawCarry(W);
  else if (PAUSE){ HUD.dark(0.66); HUD.text('PAUSED', W / 2, 14, '#fff2d0', 2, 'center'); HUD.rule(Math.round(W / 2), 34, 60, '#ead4aa');
    // what he carries
    const can = [CAN.breaker && 'THE WARDEN\'S WEIGHT', CAN.dash && 'THE TOLL\'S STEP', CAN.glide && 'THE WYRM\'S WIND'].filter(Boolean), found = Object.values(G.got).flat();
    HUD.text(`SHARDS ${G.shards}   ·   STRANDS ${G.threads}   ·   RELICS ${G.relics.length} OF ${Object.keys(RELICS).length}`, W / 2, 41, '#c0cbdc', 1, 'center');
    if (G.falls) HUD.fine(`FALLEN ${G.falls} TIME${G.falls === 1 ? '' : 'S'}. RAISED ${G.falls} TIME${G.falls === 1 ? '' : 'S'}.`, W / 2, 61, '#8b9bb4', 'center');
    if (can.length) HUD.text(can.join('  ·  '), W / 2, 51, '#2ce8f5', 1, 'center');
    const worn = G.worn.filter(id => RELICS[id]), spare = G.relics.length - worn.length;   // what is tied in his scarf; what he only carries (what each does: the knots, at a flame)
    if (G.relics.length){ let ky = 71; HUD.fine(`${worn.length} OF ${knots()} KNOTS TIED${spare ? `  ·  ${spare} MORE CARRIED: CHOOSE AT THE WATER` : ''}`, W / 2, ky, '#8b9bb4', 'center');
      for (const ln of wrapText(worn.map(id => RELICS[id].name.toUpperCase()).join('  ·  '), W - 60)){ ky += 8; HUD.fine(ln, W / 2, ky, '#fee761', 'center'); } }
    HUD.hint(HINT[DEVICE.kind === 'keys' ? 'keys' : DEVICE.kind === 'touch' ? 'touch' : 'pad'], 1); }
  if (GO.st) HUD.dark(GO.st === 'out' ? Math.min(1, GO.t / 0.6) : GO.st === 'in' ? Math.max(0, 1 - GO.t / 0.7) : 1);   // going up: dark between regions
  HUD.end();
  const pips = document.getElementById('pips'), pv = '●'.repeat(P.flask) + '○'.repeat(Math.max(0, P.flaskMax - P.flask)); if (pips && pips.textContent !== pv) pips.textContent = pv;
}
window.__side = { knotMenu, teach: TEACHER, card, carryScreen, onEvent: e => onEvent(e), get music(){ return MUSIC; }, get GO(){ return GO; }, get ENT(){ return ENT; }, low: LOW, entered: ENTERED, gate: GATE, annals, score: SCORE, get P(){ return P; }, set P(v){ P = v; }, R, LEVEL, CAN, PHASE, G, OPT, get props(){ return PROPS; }, get items(){ return ITEMS; }, talk: TALK, shop, pause, learn, get note(){ return NOTE; }, weapons: null, CAM, input: null, get E(){ return E; }, get BOSS(){ return BOSS; }, capture: CAPTURE, go, enter, story: STORY, title, get scarf(){ return SCF; }, ember: EMBER };
import('../core/input.js').then(m => { window.__side.input = m; });
import('../config/weapons.js').then(m => { window.__side.weapons = m.WEAPONS.sword; });
addEventListener('pointerdown', () => ac(), { once: true });
requestAnimationFrame(frame);
