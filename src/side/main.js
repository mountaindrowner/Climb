// The side view: boot and the loop. The motor steps at a fixed 1/120 s (input is kept until it is used, core/input.js);
// the frame draws where things are. Camera: it leads the way he faces and a little up, eases after him, and stays
// inside the map. The mountain is three regions, one over the other; the way out of one leads up into the next
// (enter), and the buttons under the room's name go straight to any of them.
import { TUNE } from '../config/tuning.js';
import { IN, bindInput, endFrame, pollPads, release, rumble } from '../core/input.js';
import { SET, saveSettings } from '../core/settings.js';
import { sfx, ac, musicBus, ambience, setMix, MIX, warm, manifestReady, say, beast } from '../audio/sfx.js';
import { voiceOf } from '../audio/voice.js';
import { makeScore } from '../audio/score.js';
import '../ui/feel.js';
import { LEVEL, LEVELS, loadLevel, T, spawnPoint, roomAt, solidAt, PHASE, REGION_DATA, resetLevels, CLIMB_TOP, DEEP, tileAt, LEDGE, MEETINGS, SILL, prepare, RULE, SPIKES, setGates, breath, setPan, keyRun, railSend } from './level.js';
import { makeTeach, keyName, fill, INTRO, CARDS, drawIcon } from './teach.js';
import { makeProps } from './props.js';
import { newPlayer, stepPlayer, BODY, HOOKS, BLADE, swingOf, weaponOf, CAN, SIDE, ARTS, startArt, hurt, isRollInv, ARMS, POGO, pogo, BOW } from './motor.js';
import { width as textWidth, width as pxWidth, text as pxText } from './pixelfont.js';
const wrapText = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(' ')){ const t = line ? line + ' ' + word : word; if (textWidth(t) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
const wrapFine = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(' ')){ const t = line ? line + ' ' + word : word; if (textWidth(t, 1, true) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };   // (the small print's widths)
import { G, OPT, loadSave, store, storeOpt, wipe, saveText, readSaveText, takeSaveText, rebase, TRY, WATCHING, fresh, has, owns, wear, knots, KNOTS, maxHearts, maxFlask, RELICS, TEACH, ABILITY, ARRIVES, BOON, THREADS_A_HEART, DIFF } from './state.js';
import { makeItems } from './items.js';
import { makeTalk, SCRIPT, HOB_UP, SUMMIT } from './talk.js';
import { ANNALS, PEOPLE_PAGE } from './annals.js';
import { makeRenderer, makeSprite, VIEW_H, makeSwingFx, LOW, MOOD, DRAW } from './render.js';
import { spawnFx, stepFx } from './fx.js';
import { spawnEnemies, stepEnemies, strikeEnemies, slamEnemies, hitBox, keepOut } from './enemies.js';
import { KEEPERS } from './keepers.js';
import { makeEntrance } from './entrance.js';
import { makeStory, REGION_SPAN, storyImages } from './story.js';
import { makeHud } from './hud.js';
import { makeScarf, SCARF } from './scarf.js';
import { makeMusic } from './music.js';
import { DEVICE } from '../core/prompts.js';
import { vibrate } from './vibrate.js';
import { WEAPONS } from '../config/weapons.js';
const MV = TUNE.move;
// Where the game is, set with every build: the build's number, the day, which phase of the plan (docs/roadmap.md) it
// is in, and the last thing built. Shown on the title and the opening (top right), over the pause screen, and (the
// number alone) in the corner in play, so a stale copy is easy to spot
const VERSION = { build: 130, date: '28 NOV 2026', phase: 20, phases: 22, last: 'LESS DRAWN WHEN THE PHONE IS SLOW; THE BUTTONS LAID OUT' };
const BUILD = 'SIDE ' + VERSION.build, VERSION_LINES = [`BUILD ${VERSION.build} - ${VERSION.date}`, `PHASE ${VERSION.phase} OF ${VERSION.phases} - ${VERSION.last}`];

const canvas = document.getElementById('gl'), hud = document.getElementById('hud'), hx = hud.getContext('2d');
const R = makeRenderer(canvas);
const sp = spawnPoint();
loadSave();
// (build 130) the touch buttons as Options has them: which ring is bottom right, and how big they are (side.html)
const padLayout = () => { document.body.dataset.pad = OPT.pad; document.body.dataset.ring = OPT.ring; }; padLayout();
// ---- the throw, and the Deep's doors (build 121, docs/phase18-sheet.md 1; decision 0.26). G.due: he has come to the
// door of the last region and is about to be thrown. G.thrown: he has been. G.out: he has climbed out of the Deep
// since. The Deep's doors in the climb are shut until he is out (level.js DEEP.shut), and open after, both ways.
// (A save that was in the last region already, or past the end, is not thrown: the Deep is open to it)
if (G.thrown == null && !G.due && ((G.top || 0) >= CLIMB_TOP || G.done)){ G.thrown = 1; G.out = 1; }
const deepDoors = () => { const shut = !G.out; if (DEEP.shut === shut) return false; DEEP.shut = shut; resetLevels(); return true; };
if (deepDoors()) loadLevel(LEVEL.index);
const HOLLOW = REGION_DATA.findIndex(r => r.name === 'The Hollow');
let THROWT = 0, OUTNOW = false;
// the phone mode: by the device (a touch screen no wider than a small tablet), or as the options say
const phoneNow = () => OPT.phone === 'auto' ? (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches && Math.max(screen.width, screen.height) <= 1400) : !!OPT.phone;
LOW.on = phoneNow();
setMix('music', OPT.music); setMix('sfx', OPT.sfx); setMix('voice', OPT.voice); if (OPT.rumble === false) SET.rumble = false;
const DEV = /[?&]level=/.test(location.search);   // straight into a region by its address: he has what the keepers below it teach
// he is made with what he has earned: hearts (threads, keepers, the difficulty), and the flask's draughts
let GIFTING = false;   // a keeper's gift is on its way to him: it is his when he takes it (giftStep)
const armed = id => id === 'blade' || (G.arms || []).includes(id);
// the touch button for blade and spade: there once he has the spade
function swapButton(){ const b = document.getElementById('swapbtn'); if (b) b.style.display = (G.arms || []).length ? '' : 'none'; }
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
// embers: what fallen creatures and landed blows give him, three measures of ten. A measure pays for an ember art (the
// art key: ARTS in motor.js). They do not heal: the flask is the only way (build 81)
const EMBER = { n: 0, cap: 30 };
let FLIGHT = null, SLOW = 0, FLASH = 0, PAUSE = false, PLAYED = 0, PLACE = { name: '', t: 9 };
let CHECK = null, BANNER = null, WON = false, DEATH = 0;
const SPANS = REGION_DATA.map((R, n) => R.depth || REGION_SPAN[n]);   // each region's height on the mountain (the Deep's below the water: negative)
// how high he is in this region, 0 to 1: from the middle of the sill he came in by to the middle of the one he leaves by
// (the same place in two regions reads the same height: the mountain is one climb)
const heightHere = () => { const J = LEVEL.joins || {}, y0 = J.down ? (J.down.y + SILL.floor) * T : (LEVEL.Y0 || 0) * T, y1 = J.up ? (J.up.y + SILL.floor) * T : (LEVEL.H - (LEVEL.over || 0)) * T; return Math.max(0, Math.min(1, (P.y - y0) / (y1 - y0))); };
const SUB = LEVELS.map(l => l.sub), CARD = LEVELS.map(l => l.card);   // under a region's name; and what the card says, coming up into it
// what he can do, from what he has beaten and what he carries
function learn(){
  const b = n => !!G.beat[n] || G.top > n || (DEV && LEVEL.index > n);
  const got = c => !!(G.can && G.can[c]) || (DEV && LEVEL.index >= ARRIVES[c]); CAN.breaker = b(0); CAN.dash = got('dash'); CAN.glide = got('glide');   // (build 87: the dash and the glide are his when he is given them, G.can; not when a keeper has fallen) CAN.grip = !!G.beat[TEACH.findIndex(t => t.can === 'grip')];
  if (CAN.breaker && !armed('spade') && !GIFTING){ (G.arms = G.arms || []).push('spade'); swapButton(); }   // the Warden's gift is the hammer (a save from before has it now)
  if ((b(1) || (DEV && LEVEL.index > 1)) && !armed('clapper') && !GIFTING){ (G.arms = G.arms || []).push('clapper'); swapButton(); }   // the Toll's is the clapper (build 92; a save whose Toll had fallen has it now)
  if ((b(4) || (DEV && LEVEL.index > 4)) && !armed('thorns') && !GIFTING){ (G.arms = G.arms || []).push('thorns'); swapButton(); }   // Mother Thorn's are the thorns (build 94)
  if ((b(3) || (DEV && LEVEL.index > 3)) && !armed('bow') && !GIFTING){ (G.arms = G.arms || []).push('bow'); swapButton(); }   // the Thunderhead's is the bow (build 93)
  if ((b(2) || (DEV && LEVEL.index > 2)) && !armed('tooth') && !GIFTING){ (G.arms = G.arms || []).push('tooth'); swapButton(); }   // the Wyrm's is the tooth (build 91; a save whose Wyrm had fallen has it now)
  SIDE.feather = has('featherfall'); SIDE.stone = has('turnstone'); SIDE.boots = has('boots'); SIDE.calm = has('stillair'); SIDE.bell = has('shiftbell'); SIDE.rope = has('lastrope'); if (CAN.breaker && !G.lamp){ G.lamp = 1; G.lampNew = 1; } if (P){ P.flaskMax = maxFlask(); P.flask = Math.min(P.flask, P.flaskMax); const mh = maxHearts(); if (mh > P.maxHp) P.hp += mh - P.maxHp; P.maxHp = mh; P.hp = Math.min(P.hp, mh); }
  // (the yoke, the second place: worn or taken off; then the Gardener's Seed. This last statement has twice been found
  // inside a comment, doing nothing: builds 49 to 66, and 69 to 77. tests/side-swallowed.test.mjs now looks for that)
}
let WAKE = 0;   // at the very start he lies where he fell, and gets up
const GLITTER = { lv: null, at: [] };   // the Vein: where its crystals are (they light the dark round them)
const CALMS = { wait: 2.5, open: 4, near: 4.5, ease: 0.5 }, EYE = { door: null, p: 0, held: null };   // the Eye of the Storm (regions/eye.js CALMS says the same): the door of cloud he waits at, and how long he has waited
const WAY = { was: false, said: new Map(), fall: [], lines: [], lv: -1, n: 0 };
// words that are on a thing in the world, said as he stands by it: what is said before them, and for how long (by the deco's kind)
const SPOKEN = { reason: ['Scratched on the stone: ', 2.6], keepline: ['Cut in the wall: ', 4], shelfmark: ['On the shelf\'s label: ', 4], ledger: ['In the binders\' ledger: ', 5], castmark: ['Cast in the rim: ', 4], mainmark: ['Cut over the channel: ', 4.5], doorplate: ['On the plate by the door: ', 4], ringplate: ['Cut in the brass: ', 4.5], chalk: ['Chalked on the board: ', 4.5] }; let SHUTSAID = false, LOOKT = 0;   // the Pilgrims' Cairns: whether the stones of the way were gone last step; when each stone's words were last said
// `walked`: he has walked in from the next region (cross): he and his scarf are as they were
// what his save holds in this level, moved with it if it has grown west or down since (state.js): as soon as the level is made
const rebased = () => { if (rebase(LEVEL.index, LEVEL.X0 || 0, LEVEL.Y0 || 0) && G.began) store(); };
function setup(walked = false){
  RULE.upset = 0; RULE.unkept = !!(G.unkept && G.unkept[LEVEL.index]);   // the Keepers' Houses: everything in its place; and whether their keeper is broken (its own switch: the Gardens have two wing keepers, and the Lock's is `still`)
  setGates((G.gates && G.gates[LEVEL.index]) || {}, (G.pans && G.pans[LEVEL.index]) || {}, (G.walls && G.walls[LEVEL.index]) || [], (G.rails && G.rails[LEVEL.index]) || {});   // the Drowned Galleries: each gate as he left it, and the water it holds
  RULE.wetAll = false; RULE.wet = new Set(LEVEL.marks.filter(m => m.type === 'wheel' && m.open !== false).map(m => m.key)); { const W0 = G.wet && G.wet[LEVEL.index]; if (W0) for (const k of Object.keys(W0)){ if (W0[k]) RULE.wet.add(k); else RULE.wet.delete(k); } }   // the Aqueducts: each sluice wheel as he left it (or as its keeper did)
  RULE.hush = 0; RULE.open = 0; RULE.calmFree = false; EYE.door = EYE.held = null; EYE.p = 0;   // the Eye of the Storm: its doors of cloud shut
  RULE.sw = (G.sw && G.sw[LEVEL.index]) || 0; RULE.surge = 0; RULE.swFree = false;   // the Wreck of the Works: the lever as he left it
  RULE.litAll = false; RULE.lit = new Set((G.lit && G.lit[LEVEL.index]) || []);   // the Glacier Galleries: the fires he has lit here burn on
  RULE.turned = false; RULE.down = !!G.cairnDown; WAY.was = false; WAY.said = new Map(); WAY.fall.length = 0;   // the Pilgrims' Cairns: the way is whole as he comes in; his own cairn, once down, stays down
  RULE.tide = 1; RULE.bore = 0;
  RULE.sat = !!G.seatedDown;   // the Glacier Galleries' Seated, once down
  RULE.ring = 0; RULE.still = !!(G.still && G.still[LEVEL.index]);   // the Bell-Foundry: nothing rings as he comes in; its Cracked Bell, once fallen, stays fallen
  RULE.fallen = !!(G.beat[LEVEL.index] || G.top > LEVEL.index || !KEEPERS[LEVEL.theme]);   // has this region's keeper fallen: what it held is let go (level.js RULE)
  SWINGFX = makeSwingFx(R.scene); PROPS = makeProps(R.scene, R);
  PROPS.toll = (shut, doors) => { const d = Math.min(...doors.map(B => Math.hypot(B.x - P.x, B.y - P.y))); if (d < 26){ sfx.bell(0.14 + 0.32 * (1 - d / 26) ** 2); if (d < 12) FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.08); } };   // the bell the doors turn on, heard when he is near one
  for (const id of G.broke[LEVEL.index] || []) PROPS.breakId(id);   // the rock he broke here before stays broken
  ITEMS = makeItems(R.scene, R, LEVEL.index); learn(); swapButton();
  SHUTSAID = false; for (const m of LEVEL.marks) if (m.type === 'pass' && m.shut){ const w = (m.w || 2) * 8 + 8, c = document.createElement('canvas'); c.width = w; c.height = 6; const g = c.getContext('2d'), px = (col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
    px('#181425', 0, 1, w, 5); for (let x = 1; x < w - 1; x += 8){ px('#5a3a34', x, 2, 7, 3); px('#733e39', x, 2, 7, 1); px('#3e2731', x + 6, 2, 1, 3); }   // the boards
    for (const x of [6, w - 10]){ px('#181425', x - 1, 0, 6, 6); px('#5a6988', x, 1, 4, 4); px('#8b9bb4', x, 1, 4, 1); px('#181425', x + 1, 3, 1, 1); }   // the straps, a nail in each
    { const x = (w >> 1) - 3; px('#181425', x - 1, 0, 8, 6); px('#a22633', x, 1, 6, 4); px('#e43b44', x + 1, 1, 4, 1); px('#feae34', x + 2, 2, 2, 2); }   // the seal
    const tx = new THREE.CanvasTexture(c); tx.magFilter = tx.minFilter = THREE.NearestFilter; const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w / 16, 6 / 16), new THREE.MeshBasicMaterial({ map: tx, transparent: true, color: 0xb8b8c8 })); mesh.position.set((m.x + (m.w || 2) / 2) * T, m.y * T + 2 / 16, 0.02); R.scene.add(mesh); }
  fx = spawnFx(R.scene); E = spawnEnemies(R.scene, R); if (!walked || !SCF) SCF = makeScarf(R.scene); FLIGHT = null;
  BOSS = G.beat[LEVEL.index] || G.top > LEVEL.index ? null : (KEEPERS[LEVEL.theme] || (() => null))(R.scene, R);   // each region's keeper; one that has fallen stays fallen (he can walk back down through its hall)
  ENT = makeEntrance(R.scene, R, { fx: () => fx, sfx, shake: v => { FEEL_FX.shake = Math.max(FEEL_FX.shake, v); }, flash: v => { FLASH = Math.max(FLASH, Math.min(0.42, v)); }, buzz: (a, b, ms) => buzz(a, b, ms), slow: v => { SLOW = Math.max(SLOW, v); } });
  // the shrine: it fills the flask and the hearts, and is where he wakes after a death
  // where the water is: the region's raising pool (a pool that is not plain: a fall raises him there) and the leaks (they
  // mend him and fill the flask, nothing more). Both are where he chooses his knots. `half`: how near counts as at it
  SHRINES = [
    ...LEVEL.marks.filter(m => m.type === 'pool' && !m.plain).map(m => { const w = (m.w || 8) * T, x = m.x * T + w / 2, y = m.y * T; return { x, y, half: w / 2, raise: true, room: roomAt(x, y + 0.5), id: 'r' }; }),
    ...LEVEL.marks.filter(m => m.type === 'shrine').map(m => { const x = (m.x + 0.5) * T, y = m.y * T; return { x, y, half: 1.1, raise: false, room: roomAt(x, y + 0.5), id: m.x + ',' + m.y }; }),
  ];
  RAISE = SHRINES.find(S => S.raise) || null; TOUCHED.clear();
  CHECK = null; WON = false; DEATH = 0; TRAIL.length = 0;
  if (!BOSS) for (const x of R.exits) x.set(true);   // nothing guards the way on
  // the map: the region drawn a pixel a tile, each room shown once he has been in it
  const c = document.createElement('canvas'); c.width = LEVEL.W; c.height = LEVEL.H; const g = c.getContext('2d'), img = g.createImageData(LEVEL.W, LEVEL.H);
  const COL = { 0: [46, 92, 128], 21: [46, 92, 128], 22: [46, 92, 128], 2: [196, 150, 92], 3: [255, 92, 132], 5: [120, 220, 240], 6: [120, 220, 240] };
  for (let j = 0; j < LEVEL.H; j++) for (let i = 0; i < LEVEL.W; i++){ const k = COL[LEVEL.tiles[j * LEVEL.W + i]]; if (k) img.data.set([...k, 255], ((LEVEL.H - 1 - j) * LEVEL.W + i) * 4); }
  g.putImageData(img, 0, 0); MAP = { c, seen: new Set(((G.rooms || {})[LEVEL.index] || []).map(k => LEVEL.rooms[k]).filter(Boolean)) };   // the rooms he has been in before are still on the map (he can walk back into a region)
}
rebased();   // (the level that is there as the game starts was made by level.js itself, not by enter(): its save is moved here)
setup();
// into region n: the world is made again, he stands at its start with the hearts and flask he had
const ENTERED = [];
// `at`: where he comes in, by name (an arrive mark: a passage's other end); else the region's start
function enter(n, at){
  const from0 = LEVEL.index;
  if (G.thrown && !G.out && !REGION_DATA[n].deep && REGION_DATA[from0].deep){ G.out = 1; OUTNOW = true; }   // (build 121) up out of the Deep, the first time since he was thrown: its doors are open now
  deepDoors();
  ARROWS.length = 0;   // (the scene is made new: the arrows in flight go with it)
  ENT.reset();   // a hall shut behind him is open again before he goes (its tiles are the region's own)
  const t0 = performance.now(); loadLevel(n); for (const J of Object.values(LEVEL.joins || {})) prepare(J.to); loadLevel(n); rebased(); const t1 = performance.now(); R.load(); const t2 = performance.now();   // and the regions it joins, made now, in the dark, for walking into
  if (hero.meta) hero.sprite = makeSprite(R.scene, `assets/side/${hero.name}`, hero.meta);
  FX2.ghosts.length = 0; setup(); const t3 = performance.now();
  ENTERED.push({ n, build: Math.round(t1 - t0), load: Math.round(t2 - t1), setup: Math.round(t3 - t2) });   // what going into a region costs (a check: window.__side.entered)
  // (`at` beginning '@': up out of one of its waters, by the water's id: travel through the water)
  const ws = at && at[0] === '@' ? SHRINES.find(S => S.id === at.slice(1)) || RAISE : null;
  const am = at && !ws && LEVEL.marks.find(m => m.type === 'arrive' && m.name === at), s = ws ? { x: ws.x, y: ws.y } : am ? { x: (am.x + 0.5) * T, y: am.y * T } : spawnPoint(), old = P; P = born(s.x, s.y); PASS.cool = 1.2; P.hp = Math.max(1, Math.min(P.maxHp, old.hp)); P.flask = Math.min(P.flaskMax, old.flask);
  CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0;
  if (ws){ TOUCHED.add(ws); WAKE = 1.5; LATER.push({ t: 0.75, f: () => splash(s.x, s.y) }); }
  giftEnd(); BANNER = null; NAMED = !(roomAt(s.x, s.y + 0.5) || {}).look; if (NAMED) banner(LEVEL.name, SUB[LEVEL.index] || '', 4); marks(); G.level = LEVEL.index; if (!LEVEL.deep) G.top = Math.max(G.top, G.level); G.began = true;
  if (n === CLIMB_TOP && from0 === CLIMB_TOP - 1 && !G.thrown && !TRY.on) G.due = 1;   // (build 121) he has come up into the last region: what is at its door is waiting
  if (OUTNOW){ OUTNOW = false; LATER.push({ t: 5, f: () => banner('Out of the Deep', 'Its doors are open now, both ways.', 6) }); }
  store();
}
// ---- what the keeper holds in its region, where it needs the game's hand (phase 9, docs/phase9-sheet.md 3). Level.js
// RULE and props.js do the rest. The Tempest: its rods are struck in turn, the nearest few, each with a warning (a red
// mark where it will land, a glow at the rod's tip, 0.7 s) and then the bolt; within a step of the rod, he is struck.
// When the storm breaks there is no rain and more light. The Gardens: a wall of thorn hurts to touch
const RODS = { k: -1, t: 1.5, st: 'wait' };
function ruleStep(dt){
  MOOD.calm += ((LEVEL.theme === 'tempest' && RULE.fallen ? 1 : 0) - MOOD.calm) * Math.min(1, dt * 0.8);
  if (RULE.fallen || PAUSE || !PROPS || GO.st || STORY.kind) return;
  const rods = PROPS.rods.filter(Q => Math.hypot(Q.x - P.x, Q.y - P.y) < 30);
  if (rods.length){ RODS.t -= dt; const Q = rods[Math.max(0, RODS.k) % rods.length];
    if (RODS.st === 'wait' && RODS.t <= 0){ RODS.k = (RODS.k + 1) % rods.length; RODS.st = 'warn'; RODS.t = 0.7; if (Math.hypot(rods[RODS.k].x - P.x, rods[RODS.k].y - P.y) < 14) sfx.zap(); }
    else if (RODS.st === 'warn'){ Q.warn = 1 - Math.max(0, RODS.t) / 0.7;
      if (RODS.t <= 0){ Q.warn = 0; Q.boltT = 0.16; RODS.st = 'wait'; RODS.t = 0.75; const d = Math.hypot(Q.x - P.x, Q.y - P.y);
        R.glint(Q.x, Q.y + 2, 0xffffff, 3, 9, 0.2); if (d < 22){ sfx.thunder(); FLASH = Math.max(FLASH, d < 9 ? 0.22 : 0.08); FEEL_FX.shake = Math.max(FEEL_FX.shake, d < 9 ? 0.3 : 0.1); fx.burst({ x: Q.x, y: Q.y + 0.2 }, 14, 0xdff4ff); }
        if (Math.abs(P.x - Q.x) < 1.3 && P.y > Q.y - 0.6 && P.y < Q.y + 5 && !isRollInv(P) && P.hp > 0 && !DISS) hurt(P, 1, Q.x, 'Struck by lightning'); } }
    for (const O of PROPS.rods) if (O !== Q) O.warn = 0; }
  if (LEVEL.theme === 'gardens') for (const B of PROPS.held) if (B.look === 'thorn' && P.x + 0.5 > B.x0 && P.x - 0.5 < B.x1 && P.y + 2.5 > B.y0 && P.y - 0.15 < B.y1 && P.hp > 0 && !DISS && !isRollInv(P)){ hurt(P, 1, B.x, 'Thorns'); break; }
}
// ---- the wings' own things (phase 10): vellum tears when he goes through it in the Toll's step; the Scriptorium's
// book says what it is the first time he stands at it; the Blank Leaf is whole again at any water
function wingStep(dt){
  if (!PROPS || !P || GO.st) return;
  // the Pilgrims' Cairns: he has turned round on the stones of the way, and they are gone (motor.js); or they are back
  // (build 81: each stone is seen to drop, tilting, and fade as it goes; they used to blink out)
  for (let i = WAY.fall.length - 1; i >= 0; i--){ const F = WAY.fall[i]; if ((F.wait -= dt) > 0) continue; F.t += dt; F.vy -= 34 * dt; F.m.position.y += F.vy * dt; F.m.rotation.z += F.spin * dt; F.m.material.opacity = Math.max(0, 1 - F.t / 0.75); if (F.t > 0.75){ R.scene.remove(F.m); F.m.material.dispose(); WAY.fall.splice(i, 1); } }
  if (RULE.turned !== WAY.was){ WAY.was = RULE.turned; PROPS.show(); if (RULE.turned){ sfx.crack(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); for (const B of PROPS.ways) if (Math.hypot(B.x - P.x, B.y - P.y) < 22){ const m = B.m.clone(); m.material = B.m.material.clone(); m.material.transparent = true; m.visible = true; R.scene.add(m); WAY.fall.push({ m, t: 0, vy: 0, wait: Math.abs(B.x - P.x) * 0.02, spin: (B.x < P.x ? 1 : -1) * (0.6 + Math.random()) }); }
    for (const B of PROPS.ways) if (Math.hypot(B.x - P.x, B.y - P.y) < 14) fx.dust({ x: B.x, y: B.y }, 8, 2.5); if (!G.turnedOnce){ G.turnedOnce = 1; store(); banner('', 'You turned back, and the path fell away. Here, only go forward.', 3); } } }
  // the refectory's table, the first time he stands at it
  if (!G.refectory && P.grounded && LEVEL.theme === 'cloister') for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'tablehead' && Math.abs(m.x * T - P.x) < 6 && Math.abs(m.y * T - P.y) < 2.5){ G.refectory = 1; store(); banner('The refectory', 'The table is still laid for pilgrims. The bread has turned to stone.', 6); }
  // its stones' words, as he stands by one; and his own cairn, the first time he comes to it
  // (build 116: in every region. Until now this ran only in the Spires, and the lines the keepers cut in the walls of the
  // Drowned Galleries, builds 107 to 112, were never said)
  if (P.grounded){ const now = performance.now() / 1000; if (WAY.lv !== LEVEL.index || WAY.n !== LEVEL.marks.length){ WAY.lv = LEVEL.index; WAY.n = LEVEL.marks.length; WAY.lines = LEVEL.marks.filter(m => m.type === 'deco' && m.says && SPOKEN[m.kind]); }
    for (const m of WAY.lines) if (Math.abs((m.x + 0.5) * T - P.x) < 1.3 && Math.abs(m.y * T - P.y) < 1.5 && now - (WAY.said.get(m) || -99) > 14 && !(BANNER && BANNER.t > 0)){ WAY.said.set(m, now); banner('', SPOKEN[m.kind][0] + m.says, SPOKEN[m.kind][1]); }
    if (LEVEL.theme === 'spires' && !G.cairnSeen) for (const e of E.list) if (e.type === 'hiscairn' && e.alive && Math.abs(e.x - P.x) < 3.2 && Math.abs(e.y - P.y) < 2){ G.cairnSeen = 1; store(); banner('Your own cairn', 'Your name is on the top stone, from before you fell. Under it: NOT YET.', 6.5); } }
  // the Eye of the Storm: how long he has stood still (the Hush stir on it: regions/eye.js); the door of cloud he stands
  // by thins as he waits, and opens; it is open a little while, and not shut on him while he is in it
  if (PROPS.calms.length && !PAUSE){
    const still = P.grounded && Math.abs(P.vx) < 0.6 && !(P.dashT > 0) && !IN.held.left && !IN.held.right; RULE.hush = still ? RULE.hush + dt : 0;   // still: on his feet, not moving, and not pushing either way (leaning on the door is not waiting)
    let near = null, nd = CALMS.near; for (const B of PROPS.calms){ if (P.y + 2.4 < B.y0 || P.y > B.y1 + 0.5) continue; const d = Math.max(B.x0 - P.x, P.x - B.x1, 0); if (B.flat && (d > 0 || Math.abs(P.y - B.y1) > 0.3)) continue; if (d < nd){ nd = d; near = B; } }   // (a floor of cloud: only for one who stands on it)
    if (near !== EYE.door){ EYE.door = near; EYE.p = 0; }
    if (near && !near.open){ EYE.p = still ? EYE.p + dt : Math.max(0, EYE.p - dt * CALMS.ease);
      if (!G.eyeTold && nd < 1.5){ G.eyeTold = 1; store(); banner('A door of cloud', 'Pushing does nothing. Stand still in front of it and wait: it opens.', 6); }
      if (EYE.p >= CALMS.wait){ if (EYE.held) EYE.held.open = false; EYE.held = near; near.open = true; EYE.p = 0; RULE.open = CALMS.open; RULE.ox0 = near.i0; RULE.ox1 = near.i1; RULE.oy0 = near.j0; RULE.oy1 = near.j1; sfx.whoosh(); fx.dust({ x: near.x, y: near.y0 }, 14, 3); } }
    for (const B of PROPS.calms) B.p = B === EYE.door && !B.open ? Math.min(1, EYE.p / CALMS.wait) : 0;
    if (RULE.open > 0){ RULE.open -= dt; if (RULE.open <= 0){ const B = EYE.held, inIt = B && P.x + 0.6 > B.x0 && P.x - 0.6 < B.x1 && P.y + 2.5 > B.y0 && P.y < B.y1; if (inIt) RULE.open = 0.05; else { RULE.open = 0; if (B) B.open = false; EYE.held = null; sfx.whoosh(); } } }
    if (!G.eyeSeat && P.grounded) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'seat' && Math.abs(m.x * T - P.x) < 3 && Math.abs(m.y * T - P.y) < 2){ G.eyeSeat = 1; store(); banner('Its seat', RULE.fallen ? 'The Thunderhead sat here, and the storm turned around it. Not any more.' : 'Something sat here, and the storm turned around it. It has gone down.', 7); }
  }
  // the Keepers' Houses: how many things are out of their place (and one more while their keeper is after him): while
  // any is, his house is shut (level.js KEPT). He is not shut in its doorway
  if (PROPS.kepts.length){ let n = 0; for (const e of E.list){ if (e.type === 'setting' && e.broken) n++; else if (e.type === 'housekeeper' && e.alive && e.wronged) n++; }
    if (n !== RULE.upset){ const was = RULE.upset; RULE.upset = n; PROPS.show(); if (!RULE.unkept && (was === 0) !== (n === 0)){ if (PROPS.kepts.some(B => Math.hypot(B.x - P.x, B.y - P.y) < 24)) sfx.door(); for (const B of PROPS.kepts) if (n > 0 && P.x + 0.4 > B.x0 && P.x - 0.4 < B.x1 && P.y + 2.4 > B.y0 && P.y < B.y1) P.y = B.y1 + 0.52; } } }
  // the lamp (phase 15): Ordric's, his from the Warden on (learn: a save already past the Warden has it at once). Where
  // it is dark it is the light he has; and the guild's lamps he comes to with it are lit, and stay lit. What lives in
  // the dark and gives its own light is seen by it
  // the Deep is off the climb (build 77, from a playtest: a player went down it early and did not know if he was meant
  // to). At a way down into it from the climb, and the first time he is in it, the game says so
  if (!(G.taught || {}).card_flask && P.hp < P.maxHp && P.hp > 0 && P.flask > 0 && P.grounded && !(BOSS && BOSS.active() && BOSS.st !== 'dead') && !E.list.some(e => e.alive && !e.d.harmless && Math.hypot(e.x - P.x, e.y - P.y) < 9)) firstCard('flask');   // the flask, the first time he is hurt, has a drink, and nothing is near
  // the Deep is shut (decision 0.12): standing on its hatch, he is told so, once a visit
  if (!SHUTSAID && P.grounded) for (const m of LEVEL.marks) if (m.type === 'pass' && m.shut && Math.abs((m.x + (m.w || 2) / 2) * T - P.x) < (m.w || 2) * T / 2 + 0.3 && Math.abs(P.y - m.y * T) < 0.8 && !(BANNER && BANNER.t > 0)){ SHUTSAID = true; sfx.block(); banner('The way down is shut', 'The guild nailed this hatch down. It does not open yet.', 5); }
  if (!G.deepWarn && P.grounded && !REGION_DATA[LEVEL.index].deep) for (const m of LEVEL.marks) if (m.type === 'pass' && !m.shut && REGION_DATA[m.to] && REGION_DATA[m.to].deep && Math.abs((m.x + (m.w || 2) / 2) * T - P.x) < 9 && P.y - m.y * T < 6 && P.y - m.y * T > -1 && !(BANNER && BANNER.t > 0)){ G.deepWarn = 1; store(); banner('A way down', 'This goes to the Deep, under the mountain. It is optional, and harder. The climb is the other way: up.', 8); }
  if (!G.deepTold && REGION_DATA[LEVEL.index].deep && P.grounded && !(BANNER && BANNER.t > 0)){ G.deepTold = 1; store(); if (G.thrown && !G.out) banner('The bottom of the mountain', 'You were thrown down. The way out is up.', 8); else banner('The Deep', 'You have left the climb. This place is optional. To go on with the climb, go back up.', 8); }
  // deep water, the first time: what it does with him (without the Wyrm's wind; and with it)
  if (P.swim && P.depth > 1.3){ if (!CAN.glide && !G.floatTold){ G.floatTold = 1; store(); banner('Deep water', 'You float, but you cannot dive yet. That takes a wind to carry you.', 5.5); } else if (CAN.glide && !G.swimTold){ G.swimTold = 1; store(); banner('Swimming', 'Jump: swim up. Down: dive. Let go to float in place.', 7); } }
  { const dark = !!REGION_DATA[LEVEL.index].dark;
    if (dark && G.lamp) R.glint(P.x, P.y + 1.4, P.under ? 0xd8ffd0 : 0xffe2b0, 1.25, (has('lampstone') ? 11.5 : 8.5) * (P.under ? 0.8 : 1), 0);   // (under the water it reaches a little less far, and goes green)
    if (G.lamp && PROPS.glamps.length) for (const Q of PROPS.glamps) if (!RULE.lit.has(Q.id) && Math.abs(Q.x - P.x) < 1.5 && Q.y > P.y - 0.5 && Q.y < P.y + 5.5){ RULE.lit.add(Q.id); (G.lit = G.lit || {})[LEVEL.index] = [...RULE.lit]; store(); sfx.relic(); fx.burst({ x: Q.x, y: Q.y }, 14, 0xffd9a0); R.glint(Q.x, Q.y, 0xffffff, 1.2, 7, 0.5);
      if (!G.glampTold){ G.glampTold = 1; store(); banner('A guild lamp', 'Lit from your lamp. It stays lit.', 5); } }
    if (dark){ if (!GLITTER.lv || GLITTER.lv !== LEVEL){ GLITTER.lv = LEVEL; GLITTER.at = LEVEL.marks.filter(m => m.type === 'crystal').map(m => [(m.x + 0.5) * T, m.y * T + 0.4]); }
      let g = 0; for (const q of GLITTER.at.filter(q => Math.abs(q[0] - P.x) < 14 && Math.abs(q[1] - P.y) < 9).sort((u, v) => Math.hypot(u[0] - P.x, u[1] - P.y) - Math.hypot(v[0] - P.x, v[1] - P.y))){ if (++g > 3) break; R.glint(q[0], q[1], 0x9fe8ff, 0.75, 4.6, 0); }
      let n = 0; for (const e of E.list){ if (!e.alive || Math.abs(e.x - P.x) > 16 || Math.abs(e.y - P.y) > 10) continue; if (e.type === 'echo' && e.shown) R.glint(e.x, e.y + 1.2, 0x9fd8ff, 0.42, 2.6, 0); else if (e.type === 'assayer') R.glint(e.x, e.y + 3, 0xffd9a0, 0.6, 7.5, 0); else if (e.type === 'pump') R.glint(e.x, e.y + 2.4, 0x9fffc0, 0.7, 8, 0); else if (e.type === 'valve') R.glint(e.x, e.y + 0.7, 0xffc880, 0.5, 2.6, 0); else if (e.type === 'eel' && e.st !== 'idle' && e.st !== 'rest') R.glint(e.x, e.y + 0.3, 0xa8f070, 0.5, 2.4, 0); else if (e.type === 'glimmer' && n++ < 3) R.glint(e.x, e.y + 0.4, 0x9fe8ff, e.dormant ? 0.3 : 0.5, 2, 0); } }
    if (!G.under && dark) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'shiftlamp' && Math.abs((m.x + 0.5) * T - P.x) < 1.8 && Math.abs(m.y * T - P.y) < 2.6){ G.under = 1; oldWaters(); store(); sfx.shrine(); fx.ring({ x: P.x, y: P.y + 1.2 }, 0x9fffd0); R.glint(P.x, P.y + 1.2, 0xd8ffd0, 1.3, 9, 1.2);
      card({ head: 'NEW: FAST TRAVEL', title: 'Travel by water', icon: 'flask', does: 'At any pool or spring you have found, you can dive in and come up at another.', how: ['Stand in the water and press {down}. Then choose Travel.', 'You find a pool or spring by standing in it.'], lore: 'The lamp on this altar was never filled, and has not gone out. All the water in the mountain is one water.' }); }
    // the Great Shaft's floor: the light that comes up out of the hole in it, and the first time he stands by it
    if (dark) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'breach' && Math.abs(m.x * T - P.x) < 18 && Math.abs(m.y * T - P.y) < 9){ R.glint(m.x * T, m.y * T + 0.4, 0xffb060, 1.05 + 0.08 * Math.sin(time * 1.7), 7, 0); if (!G.floorSeen && P.grounded && Math.abs(m.x * T - P.x) < 7){ G.floorSeen = 1; store(); banner('The floor of the Shaft', 'Light comes up through the hole in the floor. You can drop down it.', 7); } }
    // the Hollow: the last page of the tally, on the camp's table; and the Source
    if (dark && P.grounded) for (const m of LEVEL.marks){ if (m.type !== 'deco') continue; const near = Math.abs((m.x + 0.5) * T - P.x) < 2.2 && Math.abs(m.y * T - P.y) < 2;
      if (m.kind === 'tally' && near && !G.tallySeen){ G.tallySeen = 1; store(); banner('The last page of the tally', 'The guild\'s last entry: a depth, and under it one word.', 8); }
      if (m.kind === 'sourceflame'){ R.glint((m.x + 0.5) * T, m.y * T + 0.7, 0xff9a40, 1.9 + 0.15 * Math.sin(time * 2.1), 13, 0); if (Math.abs((m.x + 0.5) * T - P.x) < 16 && Math.random() < 0.08) fx.burst({ x: (m.x + 0.5) * T + (Math.random() - 0.5) * 0.3, y: m.y * T + 1 }, 1, 0xfee761);
        if (Math.abs((m.x + 0.5) * T - P.x) < 6 && !G.source){ G.source = 1; G.flasks = (G.flasks || 0) + 1; P.flaskMax = maxFlask(); P.flask = P.flaskMax; P.hp = P.maxHp; store(); sfx.shrine(); fx.ring({ x: P.x, y: P.y + 1 }, 0xffd9a0); R.glint(P.x, P.y + 1.2, 0xfff0d0, 1.4, 10, 1.5);
          card({ head: 'THE BOTTOM OF THE MOUNTAIN', title: 'The Source', icon: 'flask', does: 'Your flask now holds one more drink, for good.', how: ['This is a pool: you can rest here and travel from here.'], lore: 'A spring rises here. Beside it burns a small flame that no one tends. All the water in the mountain comes up from this place.' }); } } }
    if (!G.lipSeen && dark && P.grounded) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'shaft' && Math.abs(m.x * T - P.x) < 12 && P.y > m.y * T + 3 && P.y < m.y * T + 10 /* (build 120: on the lip, not anywhere over it. It was said in the glitter, four screens up) */){ G.lipSeen = 1; store(); banner('The lip', 'The Great Shaft. It goes down further than your lamp reaches.', 7); } }
  // the Orrery Wing: the hours cut in the wall, the first time he stands by them
  if (!G.datesSeen && P.grounded && (LEVEL.movers || []).length) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'dates' && Math.abs(m.x * T - P.x) < 3 && Math.abs(m.y * T - P.y) < 2){ G.datesSeen = 1; store(); banner('The hours', 'Every hour the almanac gave for the flame to return. All of them have passed.', 7); }
  // the Aqueducts: the head, the first time he stands at it
  if (!G.headSeen && P.grounded && (LEVEL.flows || []).length) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'spout' && Math.abs(m.x * T - P.x) < 3.5 && Math.abs(m.y * T - P.y) < 2){ G.headSeen = 1; store(); banner('The head', 'This water comes up from the pool at the bottom of the mountain. It is the same water.', 7); }
  // the Wreck of the Works: the Jar's discharge runs through all the iron for a moment (level.js liveAt)
  if (RULE.surge > 0 && !PAUSE){ RULE.surge = Math.max(0, RULE.surge - dt); if (RULE.surge === 0) PROPS.show(); }
  // the Bell-Foundry's ringing dies away: in silence the shutters go up (the tongues and the slag see RULE.ring for themselves)
  if (RULE.ring > 0 && !PAUSE){ RULE.ring = Math.max(0, RULE.ring - dt); if (RULE.ring === 0){ PROPS.show(); if (PROPS.shutters.some(B => Math.hypot(B.x - P.x, B.y - P.y) < 26)) sfx.creak(); } }
  if (P.dashT > 0) for (const S of PROPS.tear(P)){ sfx.swing(true); fx.burst({ x: S.x, y: S.y }, 28, 0xead4aa); fx.dust({ x: S.x, y: S.y0 }, 12, 3); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2); (G.broke[LEVEL.index] = G.broke[LEVEL.index] || []).push(S.id); store(); }
  if (!G.lectern && P.grounded) for (const m of LEVEL.marks) if (m.type === 'deco' && m.kind === 'lectern' && Math.abs((m.x + 0.5) * T - P.x) < 1.6 && Math.abs(m.y * T - P.y) < 2){ G.lectern = 1; store(); banner('The book they copy', 'It is open at its first page. The page is blank.', 5.5); }
}
// ---- walking from one region into the next (phase 9, docs/phase9-sheet.md): no dark, no card. Each join has a sill
// (level.js): a tunnel through rock that is the same, to the tile and the pixel, in the region below and the region
// above. Near it the other region's paintings are made ready (R.stage); past its middle the other region is put in
// place around him (cross): he, his scarf, the view, the air's motes and the light are carried over, moved by how far
// apart the two regions count the same sill. A step past the middle before it happens, so turning round in the middle
// does not change regions back and forth
const CROSSED = [];   // what each crossing cost, for a check (window.__side.crossed)
function joinStep(){
  if (GO.st || FLIGHT || DISS || P.hp <= 0 || STORY.kind || GIFT) return;
  for (const side of ['up', 'down']){ const J = LEVEL.joins && LEVEL.joins[side]; if (!J) continue;
    const x0 = J.x * T, x1 = x0 + SILL.w * T, y0 = J.y * T, mid = (x0 + x1) / 2;
    if (P.y < y0 - 12 || P.y > y0 + SILL.h * T + 12 || P.x < x0 - 40 || P.x > x1 + 40) continue;
    if (side === 'up' && BOSS && BOSS.st !== 'dead') continue;   // not while its keeper stands
    R.stage(J.to);
    if (P.x < x0 || P.x > x1 || P.y < y0 || P.y > y0 + SILL.h * T) continue;
    if ((P.x - mid) * J.dir * (side === 'up' ? 1 : -1) > 1){
      if (R.staged(J.to)){ JOINWAIT = 0; cross(J, side); return; }
      // the other region is not ready (the phone mode keeps one region's paintings at a time; or a slow machine): after
      // a moment, the old way, through the dark, and he comes out where he was in the sill
      if (LOW.on || (JOINWAIT += 1 / 60) > 5){ JOINWAIT = 0; const j0 = { x: J.x, y: J.y }, px = P.x, py = P.y; go(J.to, null); GO.join = { side, j0, px, py }; return; }
    } else JOINWAIT = 0;
  }
}
let JOINWAIT = 0;
function cross(J, side){
  const t0 = performance.now(), from = LEVEL.index;
  ENT.reset(); deepDoors(); loadLevel(J.to); rebased();
  const J2 = LEVEL.joins[side === 'up' ? 'down' : 'up'], dx = (J2.x - J.x) * T, dy = (J2.y - J.y) * T;
  if (hero.sprite) hero.sprite.g.userData.keep = true; if (SCF) SCF.g.userData.keep = true;
  const t1 = performance.now(); R.load({ carry: true, shift: { x: dx, y: dy }, at: { x: P.x + dx, y: P.y + dy } }); const t2 = performance.now();
  FX2.ghosts.length = 0; setup(true);
  P.x += dx; P.y += dy; P.airTop += dy; if (P.mantle){ P.mantle.x0 += dx; P.mantle.x1 += dx; P.mantle.y0 += dy; P.mantle.y1 += dy; if (P.mantle.wall != null) P.mantle.wall += dx; }
  CAM.x += dx; CAM.y += dy; SCF.shift(dx, dy);
  NAMED = side === 'down'; G.level = LEVEL.index; if (!LEVEL.deep) G.top = Math.max(G.top, G.level); if (LEVEL.index === CLIMB_TOP && from === CLIMB_TOP - 1 && !G.thrown && !TRY.on) G.due = 1; learn(); store();   // going up, the region is named when he comes out into its own look; going down he knows where he is
  setTimeout(() => { for (const K of Object.values(LEVEL.joins || {})) prepare(K.to); }, 2500);   // the region beyond this one, made while he walks on
  CROSSED.push({ from, to: LEVEL.index, load: Math.round(t1 - t0), scene: Math.round(t2 - t1), setup: Math.round(performance.now() - t2) });
}
// ---- the throw (build 121): the screen (story.js 'thrown'), and then he is at the bottom of the mountain: the Hollow's
// water, whole, with everything he has
function throwDown(){
  release(); BANNER = null; P.vx = 0; THROWT = 0;
  STORY.start('thrown', {}, () => { G.thrown = 1; G.due = 0; enter(HOLLOW); P.hp = P.maxHp; P.flask = P.flaskMax; WAKE = 1.7; const s = spawnPoint(); splash(s.x, s.y); G.deepTold = 0; store(); });
}
// going up: the picture goes dark, the next region is made, it comes back
const GO = { to: -1, t: 0, st: '', from: -1, at: null, join: null };
const go = (n, at = null) => { if (!GO.st){ GO.to = n; GO.from = LEVEL.index; GO.at = at; GO.t = 0; GO.st = 'out'; GO.join = null; } };
// a passage (pass marks): walked into, it takes him to another region, to its arrive mark of that name. Not again until
// he has been out of it a moment (he comes in beside the other end's)
const PASS = { cool: 0 };
// the regions' buttons
const marks = () => {};
// ---- the story's screens (story.js) and the title's buttons
const STORY = makeStory(hud, `assets/side/${HERO}`); STORY.note = VERSION_LINES;   // where the game is, in the top right of the title and the opening
const MENU = document.createElement('div');
MENU.style.cssText = 'position:absolute;left:0;right:0;top:56%;display:none;flex-direction:column;align-items:center;gap:10px;z-index:7;font:600 18px "Pixelify Sans",monospace;text-transform:uppercase;letter-spacing:1px';
(document.getElementById('stage') || document.body).appendChild(MENU);
// a number in the HUD's own pixel digits, as a small picture to set in a menu's button (the menus' typeface has a 2, a
// 5 and an 8 too alike to tell apart at this size: a playtest read 120 as 180)
const pixNum = (n, color = '#fff2d0', k = 2) => { const str = String(n), c = document.createElement('canvas'); c.width = pxWidth(str) + 1; c.height = 8; pxText(c.getContext('2d'), str, 0, 0, color, 1, 'left', '#181425');
  c.style.cssText = `width:${c.width * k}px;height:${c.height * k}px;image-rendering:pixelated;vertical-align:-3px`; c.setAttribute('aria-label', str); return c; };
const menuButton = (text, fn, small) => { const b = document.createElement('button'); b.textContent = text;
  b.style.cssText = `background:#181425;color:${small ? '#c0cbdc' : '#fff2d0'};border:2px solid ${small ? '#3a4466' : '#ead4aa'};border-radius:0;padding:${small ? '5px 12px' : '9px 22px'};cursor:pointer;font:inherit;font-size:${small ? 13 : 18}px;min-width:${small ? 0 : 240}px;box-shadow:3px 3px 0 #0b0810;letter-spacing:inherit;text-transform:inherit`;
  b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); ac(); fn(); }); return b; };
const menuLabel = text => { const d = document.createElement('div'); d.textContent = text; d.style.cssText = 'color:#c0cbdc;font-size:13px;letter-spacing:1px;text-shadow:2px 2px 0 #0b0810;margin:2px 0'; return d; };
// the keys in a menu: up and down move, Enter or Space picks
let MSEL = 0;
const menuItems = () => [...MENU.querySelectorAll('button')];
const menuMark = () => menuItems().forEach((b, i) => { const on = i === MSEL; if (b.dataset.ghost) return; if (b.dataset.edge == null) b.dataset.edge = b.style.borderColor; b.style.outline = 'none'; b.style.borderColor = on ? '#fff2d0' : b.dataset.edge; b.style.boxShadow = on ? 'inset 5px 0 0 #e43b44, inset 6px 0 0 #a22633, 3px 3px 0 #0b0810' : '3px 3px 0 #0b0810'; b.style.color = on ? '#fff2d0' : (b.dataset.ink || (b.dataset.ink = b.style.color)); });   // the chosen one wears a piece of his ribbon down its left edge
const menuShow = (rows, left = false, back = null) => { MENU.back = back; MENU.innerHTML = ''; MENU.style.transform = ''; MENU.style.bottom = ''; MENU.style.gap = '10px'; MENU.style.width = ''; MENU.style.right = '0'; MENU.style.display = 'flex'; MENU.style.alignItems = left ? 'flex-start' : 'center'; MENU.style.paddingLeft = left ? '4%' : '0'; MENU.style.top = left ? '36%' : '56%'; for (const r of rows) if (r) MENU.appendChild(r); MSEL = 0; menuMark(); requestAnimationFrame(menuFit); };
// (build 128) a menu a quarter bigger with large text; and any menu taller than the screen (Options, on a phone held
// sideways) moved up, and made smaller only if it still does not fit, so that all of it can be reached
function menuFit(){ if (MENU.style.display === 'none') return; MENU.style.transform = ''; const par = MENU.offsetParent || document.body, pr = par.getBoundingClientRect(), r = MENU.getBoundingClientRect();
  const H = pr.height || innerHeight, sc = Math.min(OPT.big ? 1.25 : 1, (H - 8) / Math.max(1, r.height)), top = r.top - pr.top;
  MENU.style.transformOrigin = MENU.style.alignItems === 'flex-start' ? 'top left' : 'top center'; if (sc !== 1) MENU.style.transform = `scale(${sc.toFixed(3)})`;
  if (top + r.height * sc > H - 4) MENU.style.top = Math.max(4, H - 4 - r.height * sc) + 'px'; }
addEventListener('resize', () => requestAnimationFrame(menuFit));
const menuHide = () => { MENU.style.display = 'none'; MENU.innerHTML = ''; MENU.back = null; release(); };   // and nothing pressed in it carries into play
function begin(){   // from the start: the fall, then he gets up at the bottom
  // a first climb finds the Roots already made (they were made behind the title, as they are at the first): made again
  // only when there is something to undo, so the press does not wait on the painting
  const fresh = !G.began && LEVEL.index === 0 && !Object.keys(G.broke || {}).length;
  menuHide(); wipe(); deepDoors(); if (!fresh){ resetLevels(); enter(0); } { const s = spawnPoint(); P = born(s.x, s.y); }   // everything as it was at the first: the rock unbroken, the chests shut
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
function watch(list){ if (!VIEW.on){ VIEW.snap = JSON.stringify(G); VIEW.on = true; WATCHING.on = true; } VIEW.list = list.slice(); SIDE.watching = true; nextView(); }
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
function endView(){ VIEW.on = false; WATCHING.on = false; VIEW.list = []; SIDE.watching = false; ENT.reset(); if (BOSS) BOSS.reset(); for (const k of Object.keys(G)) delete G[k]; Object.assign(G, JSON.parse(VIEW.snap)); store(); }
// ---- trying a place (from the title): any level from its start, or one of a few moments, with what he would have by
// then. It is for looking at the game, a level at a time. It is not his save: that is put by when a trial begins and
// is back, untouched, when he returns to the title (state.js TRY: what a trial stores is written beside it)
const TRYING = { snap: null, all: false };   // all: every weapon from the start, wherever he tries (a dev tool, build 98)
const ALL_ARMS = ['spade', 'clapper', 'tooth', 'bow', 'thorns'];   // in the order the swap goes round them, after the sword
// what he would have: on the climb, what the keepers below have left him; in the Deep, all that the climb gives short of
// its last keeper. `more`: a moment's own (who else has fallen, where he stands)
const TRIES = () => { const deep = LEVELS.map((l, n) => n).filter(n => REGION_DATA[n].deep).sort((a, b) => (REGION_DATA[b].depth || [0, 0])[1] - (REGION_DATA[a].depth || [0, 0])[1]);
  return [...LEVELS.map((l, n) => n).filter(n => !REGION_DATA[n].deep), ...deep].map(n => ({ n, name: LEVELS[n].name })); };
const MOMENTS = () => { const at = name => LEVELS.findIndex(l => l.name === name), W = at('The Workings'), F = at('The Flooded Levels'), H = at('The Hollow');
  return [
    { name: 'Deep water, before the Wyrm', n: W, gifts: 2, room: 'cistern', tx: 17, ty: 13, say: 'The cistern. You have the hammer and the air dash, but not the glide.' },
    { name: 'Deep water, with the wind', n: W, room: 'cistern', tx: 17, ty: 13, say: 'The cistern. The way down is in its floor, under the water.' },
    { name: 'The Pump', n: F, room: 'pumphouse', tx: 22, ty: 17, say: 'Go down the trunk, under the wall, and up into its hall.' },
    { name: 'The Auger', n: H, room: 'circles', tx: 44, ty: 4, say: 'Its hall is down the hole to the west.' },
    { name: 'The grip (the Auger still)', n: H, beat: [H], room: 'bore', tx: 60, ty: 2, say: 'The foot of its pit. The east wall is rough rock: climb it.' },
  ].filter(m => m.n >= 0); };
function tryMenu(){
  const rows = [menuLabel('TRY A PLACE  ·  FROM ITS START, WITH WHAT YOU WOULD HAVE BY THEN')], grid = document.createElement('div'), grid2 = document.createElement('div');
  for (const g of [grid, grid2]) g.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:min(94vw,600px)';
  const arms = menuButton('', () => { TRYING.all = !TRYING.all; show(); }, true), show = () => { arms.textContent = 'Weapons: ' + (TRYING.all ? 'all six' : 'what you would have by then'); }; show(); rows.push(arms);
  for (const t of TRIES()) grid.appendChild(menuButton(t.name.replace(/^The /, ''), () => tryStart(t), true)); rows.push(grid);
  rows.push(menuLabel('OR A MOMENT')); for (const m of MOMENTS()) grid2.appendChild(menuButton(m.name, () => tryStart(m), true)); rows.push(grid2);
  rows.push(menuLabel('NOTHING HERE IS SAVED. YOUR OWN SAVE IS NOT TOUCHED.')); rows.push(menuButton('Back', title, true)); menuShow(rows, false, title); MENU.style.top = '30%';
}
function tryStart(t){
  if (!TRY.on){ TRYING.snap = JSON.stringify(G); TRY.on = true; }
  const n = t.n, deep = !!REGION_DATA[n].deep, gifts = t.gifts != null ? t.gifts : deep ? CLIMB_TOP : n;   // how many of the climb's keepers have fallen
  fresh(); for (let k = 0; k < gifts; k++){ G.beat[k] = true; const g = TEACH[k]; if (g && g.heart) G.hearts += g.heart; if (g && g.flask) G.flasks += g.flask; } for (const c of Object.keys(ARRIVES)) if (gifts >= ARRIVES[c]) G.can[c] = 1;
  for (const k of t.beat || []) G.beat[k] = true;
  G.top = deep ? Math.max(0, gifts) : n; G.level = n; G.began = true; G.shards = 150; G.lampNew = 0;
  if (deep && (REGION_DATA[n].depth || [0, 0])[1] < -2) G.under = 1;   // below the Flooded Levels he has been through its chapel
  G.taught = { move: 1, jump: 1, cut: 1, block: 1, parry: 1, crouch: 1, drop: 1, double: 1 };
  if (TRYING.all){ G.arms = ALL_ARMS.slice(); G.taught.swap = 1; }
  menuHide(); STORY.kind = null; SCREEN = ''; PAUSE = false; resetLevels(); enter(n); G.lampNew = 0; G.top = deep ? Math.max(0, gifts) : n; store();
  if (t.room){ const r = LEVEL.rooms.find(q => q.name === t.room); if (r){ const x = r.x0 + (t.tx + 0.5) * T, y = r.y0 + t.ty * T; P = born(x, y); P.grounded = false; P.airTop = y; CAM.x = x; CAM.y = y + 2; CAM.lead = 0; if (SCF) SCF.reset(x, y + 1.8); } }
  if (TRYING.all){ G.arms = ALL_ARMS.slice(); swapButton(); }
  LATER.push({ t: t.room ? 0.6 : 4.6, f: () => banner('Trying: ' + (t.name || LEVEL.name), (t.say || 'This is not your save. Nothing here is saved.') + (TRYING.all ? ` All six weapons: ${kname('swap')} to swap.` : ''), 6) });
}
// (the world is made again as his own save has it while the trial is still on, so that making it stores nothing of
// his: a climb never begun stays never begun)
function endTry(){ const back = () => { for (const k of Object.keys(G)) delete G[k]; Object.assign(G, JSON.parse(TRYING.snap)); }; ENT.reset(); back(); resetLevels(); enter(Math.min(G.level || 0, LEVELS.length - 1)); back(); TRY.on = false; TRYING.snap = null; BANNER = null; LATER.length = 0; }
function resume(n){ menuHide(); STORY.kind = null; SCREEN = ''; PAUSE = false; if (LEVEL.index !== n) enter(n); else { const s = spawnPoint(); P = born(s.x, s.y); CHECK = null; if (BOSS) BOSS.reset(); ENT.reset(); banner(LEVEL.name, SUB[n] || '', 4); G.level = n; store(); } }
function title(){
  STORY.after = () => ({ done: !!G.done, source: !!G.source });   // the title after the end shows the light down the scar (story.js)
  if (VIEW.on) endView();   // back from watching: the save as it was
  if (TRY.on) endTry();     // back from trying a place: his own save, as it was
  // until the opening is in hand the title is shown without its buttons, a thin bar filling under it
  if (!GATE.ready){ menuHide(); SCREEN = ''; PAUSE = false; STORY.start('title', { progress: GATE.progress }); if (!GATE.waiting){ GATE.waiting = true; GATE.p.then(() => { if (STORY.kind === 'title' && !SCREEN) title(); }); } return; }
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;justify-content:center;max-width:92vw';
  const top = DEV ? LEVELS.length - 1 : G.top; if (top > 0) LEVELS.forEach((l, n) => { if (n <= top) row.appendChild(menuButton(`${n + 1} ${l.name.replace('The ', '')}`, () => resume(n), true)); });
  let sure = false; const again = menuButton(G.began ? 'Begin again' : 'Begin the climb', () => { if (G.began && !sure){ sure = true; again.textContent = 'Begin again? Your save will be erased'; return; } begin(); }, G.began);
  menuShow([G.began ? menuButton('Continue: ' + LEVELS[Math.min(G.level, LEVELS.length - 1)].name, () => resume(Math.min(G.level, LEVELS.length - 1))) : null, again, top > 0 ? row : null, menuButton('Try a place', tryMenu, true), menuButton('The keepers', keepers, true), menuButton('Options', () => options(title), true)], true);
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
    cyc('Text size', 'big', [false, true], ['normal', 'large'], () => requestAnimationFrame(menuFit)),
    cyc('Drawing', 'draw', ['auto', 'full', 'light'], [DRAW.step && OPT.draw === 'auto' ? `auto (lighter: ${DRAW.step})` : 'auto', 'full', 'light'], () => { if (OPT.draw === 'auto') DRAW.step = 0; }),
    cyc('Hints', 'hints', [true, false], ['on', 'off']),
    cyc('Score', 'synth', [false, true], ['recorded', 'made as it plays']),
    cyc('Shake', 'shake', [0, 0.5, 1], ['off', 'soft', 'full']),
    cyc('Flashes', 'flash', [0, 1], ['off', 'on']),
    cyc('Difficulty', 'diff', [0, 1, 2], DIFF.map((d, i) => d + [' (two hearts more)', '', ' (two hearts fewer)'][i]), () => { P.maxHp = maxHearts(); P.hp = Math.min(P.hp, P.maxHp); }),
    cyc('Phone mode', 'phone', ['auto', true, false], [phoneNow() && OPT.phone === 'auto' ? 'auto (on)' : 'auto', 'on', 'off'], () => { LOW.on = phoneNow(); banner('', 'phone mode ' + (LOW.on ? 'on' : 'off') + ': from the next region', 2.4); }),
    cyc('Place', 'place', [false, true], ['hidden', 'shown (for notes)']),
    cyc('Rumble and vibration', 'rumble', [true, false], ['on', 'off'], () => { SET.rumble = OPT.rumble; saveSettings(); if (OPT.rumble) buzz(0.5, 0.5, 160); }),
    cyc('Buttons', 'pad', ['jump', 'attack'], ['jump bottom right', 'attack bottom right'], padLayout), cyc('Button size', 'ring', ['small', 'mid', 'large'], ['small', 'middle', 'large'], padLayout),
    menuButton('Copy save', () => copySave(() => options(back)), true), menuButton('Paste save', () => pasteSave(() => options(back)), true)]),
    menuButton('Back', back, true)], false, back); MENU.style.top = '34%';
}
// ---- a copy of the save the player holds (phase 20): the save as one line of text, to keep, or to paste into the game
// somewhere else (Safari to the Home Screen, one phone to another). Pasted, it takes the place of the save here
function saveBox(text, ro){ const ta = document.createElement('textarea'); ta.value = text; ta.readOnly = !!ro; ta.spellcheck = false; ta.rows = 4;
  ta.style.cssText = 'width:min(88vw,520px);background:#0b0810;color:#fff2d0;border:2px solid #3a4466;font:12px monospace;padding:6px;resize:none;word-break:break-all;text-transform:none';
  for (const k of ['keydown', 'keyup']) ta.addEventListener(k, e => { if (e.key !== 'Escape') e.stopPropagation(); });   // typing is not play
  return ta; }
function copySave(back){
  const ta = saveBox(G.began ? saveText() : '', true), said = menuLabel(G.began ? 'YOUR SAVE, AS ONE LINE. KEEP IT, OR PASTE IT INTO THE GAME ON ANOTHER PHONE' : 'THERE IS NO SAVE YET');
  const copy = menuButton('Copy it', () => { ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e){}
    const done = y => { copy.textContent = y ? 'Copied' : 'Select it and copy it yourself'; }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(() => done(true), () => done(ok)); else done(ok); }, true);
  menuShow([menuLabel('COPY SAVE'), said, G.began ? ta : null, G.began ? copy : null, menuButton('Back', back, true)], false, back); MENU.style.top = '24%';
  if (G.began){ ta.focus(); ta.select(); }
}
function pasteSave(back){
  const ta = saveBox('', false), said = menuLabel('PASTE A SAVE YOU COPIED. IT TAKES THE PLACE OF THE SAVE HERE'); ta.placeholder = 'CLIMB-SAVE-1:...';
  let sure = false; const take = menuButton('Load this save', () => {
    if (!readSaveText(ta.value)){ take.textContent = 'That is not a save. Try copying it again'; sure = false; return; }
    if (G.began && !sure){ sure = true; take.textContent = 'Load it? The save here will be replaced'; return; }
    if (!takeSaveText(ta.value)){ take.textContent = 'It could not be written here'; return; }
    deepDoors(); resetLevels(); enter(Math.min(G.level || 0, LEVELS.length - 1)); title(); banner('', 'Save loaded', 2.4); }, true);
  ta.addEventListener('input', () => { sure = false; take.textContent = 'Load this save'; });
  menuShow([menuLabel('PASTE SAVE'), said, ta, take, menuButton('Back', back, true)], false, back); MENU.style.top = '24%'; ta.focus();
}
// ---- Corwen's Annals: a page for each region (its keeper and its creatures) and one for the three who climb. Drawn on
// the HUD (drawAnnals); the buttons under it turn the pages; so do left and right (and the shoulder buttons)
let PAGE = 0;
// art: a character's folder (its standing drawing, cropped to head and shoulders), or a picture's path (a keeper's piece, fitted whole)
const PORTRAIT = {}, portrait = art => { if (!art) return null; if (PORTRAIT[art]) return PORTRAIT[art]; const im = new Image(); im.src = art.includes('/') ? `assets/side/${art}.png` : `assets/side/${art}/stand.png`; return PORTRAIT[art] = im; };
// what is marked on the map: the flames, the keeper, the three's stations he has found, what is still to be found (with
// the compass or a chart), and him
// ---- Corwen's map (phase 8). Until he has been met the map is only where he has been. After, it is Corwen's: it marks
// the ways he could not take and what would open them, how often he has fallen in the region, and whether the region's
// page is full (sealed: every room seen, every strand, chest and relic found)
const corwenMet = () => Object.keys(G.met || {}).some(k => k.endsWith(':scribe'));
let WAYT = 0;
// cracked stone he comes close to and cannot break: remembered (a way he could not take)
function noteWays(dt){
  if ((WAYT -= dt) > 0) return; WAYT = 0.4; sealPage();
  const B = (G.blocked = G.blocked || {}), mine = (B[LEVEL.index] = B[LEVEL.index] || []);
  if (!CAN.dash) for (const S of PROPS.sheets) if (!S.gone && !mine.includes(S.id) && P.x > S.x0 - 5 && P.x < S.x1 + 5 && P.y + 1.2 > S.y0 - 2.5 && P.y + 1.2 < S.y1 + 2.5){ mine.push(S.id); DIRTY = DIRTY > 0 ? DIRTY : 2; }   // vellum, come to without the Toll's step
  if (!CAN.dash && !HINTED.sheet && P) for (const S of PROPS.sheets) if (!S.gone && P.x > S.x0 - 1.6 && P.x < S.x1 + 1.6 && P.y + 1.2 > S.y0 && P.y + 1.2 < S.y1){ HINTED.sheet = 1; sfx.block(); banner('', LEVEL.theme === 'spires' ? 'Thin ice. It wants speed, not weight.' : 'Vellum, stretched tight. It wants speed.', 4); LATER.push({ t: 20, f: () => { HINTED.sheet = 0; } }); break; }   // a way he cannot open yet says so (the playtest of 21 Nov, T5)
  if (CAN.breaker) return;
  for (const C of PROPS.cracks) if (!C.gone && !mine.includes(C.id) && Math.abs(C.x - P.x) < C.w / 2 + 4 && Math.abs(C.y - (P.y + 1.2)) < C.h / 2 + 2.5){ mine.push(C.id); DIRTY = DIRTY > 0 ? DIRTY : 2; }
}
// is the region's page full; if it has just become so, it is sealed (once) and he is told
function pageFull(){ const L = ITEMS.left(); return L.threads + L.chests === 0 && !L.relic && LEVEL.rooms.every(r => r.ghost || MAP.seen.has(r)); }
function sealPage(){ const n = LEVEL.index; if ((G.sealed = G.sealed || {})[n] || !corwenMet() || !pageFull()) return; G.sealed[n] = 1; store(); sfx.relic(); banner('Region complete', `You have found everything in ${LEVEL.name}.`, 4.5); }
function mapDots(){
  const dots = SHRINES.filter(S => MAP.seen.has(S.room)).map(S => ({ x: S.x, y: S.y + 0.5, c: '#0099db', r: S.raise ? 1 : 0 }));   // the water: the raising pool larger
  if (BOSS && MAP.seen.has(BOSS.room)) dots.push({ x: BOSS.cx, y: BOSS.stageY + 1, c: BOSS.st === 'dead' ? '#5a6988' : '#e43b44', r: 1 });
  for (const N of ITEMS.people) if (MAP.seen.has(roomAt(N.x, N.y + 0.5))) dots.push({ x: N.x, y: N.y + 0.5, c: { lamplighter: '#feae34', wren: '#63c74d', scribe: '#2ce8f5' }[N.who] });   // the stations he has found
  if (has('starcompass')) for (const it of ITEMS.left().all) dots.push({ x: it.x, y: it.y + 0.5, c: '#f6757a', find: true });   // what is still to be found
  // Corwen's map (once he has been met): the ways he could not take, where he came to them. Grey while he lacks what
  // opens them; gold and beating once he has it, until he has been through
  if (corwenMet()) for (const C of PROPS.cracks){ if (C.gone || !(G.blocked[LEVEL.index] || []).includes(C.id)) continue; dots.push({ x: C.x, y: C.y, c: CAN.breaker ? '#fee761' : '#8b9bb4', r: 1, blink: CAN.breaker, way: CAN.breaker ? 'open' : 'shut' }); }
  if (corwenMet()) for (const S of PROPS.sheets){ if (S.gone || !(G.blocked[LEVEL.index] || []).includes(S.id)) continue; dots.push({ x: S.x, y: S.y, c: CAN.dash ? '#fee761' : '#8b9bb4', r: 1, blink: CAN.dash, way: CAN.dash ? 'open' : 'shut', by: 'step' }); }
  if (corwenMet() && RULE.fallen) for (const r of LEVEL.rooms) if (r.quick && MAP.seen.has(r)) dots.push({ x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2, c: '#fee761', r: 1, way: 'quick' });   // the quick way the keeper's fall left, once he has been through it
  dots.push({ x: P.x, y: P.y + 0.8, c: '#ffffff', blink: true });
  return dots;
}
// the whole map, from the pause (or M, or Select)
function keysScreen(){ SCREEN = 'keys'; PAUSE = true; release(); menuShow([menuButton('Back', () => pause(true), true)], false, () => pause(true)); MENU.style.top = 'auto'; MENU.style.bottom = '1.5%'; MSEL = 0; menuMark(); }
function mapScreen(){
  SCREEN = 'map'; PAUSE = true; release(); const T2 = (G.taught = G.taught || {}); T2.mapN = (T2.mapN || 0) + 1; store();
  menuShow([menuButton('Back', () => pause(true), true)], false, () => pause(true)); MENU.style.top = 'auto'; MENU.style.bottom = '1.5%'; MSEL = 0; menuMark();
}
// the rooms he has not been in but knows are there: each has a way into it from a room he has been in (open tiles
// on both sides of the wall they share; cracked stone is not a way until it is broken). Drawn as cloud (decision 0.16)
const CLOUD = { key: '', list: [] };
function clouds(){
  const key = LEVEL.index + ':' + MAP.seen.size + ':' + ((G.broke[LEVEL.index] || []).length); if (CLOUD.key === key) return CLOUD.list;
  const open = (x, y) => { const v = tileAt(x, y); return v !== 1 && v !== 4; }, out = [];
  for (const r of LEVEL.rooms){ if (r.ghost || MAP.seen.has(r)) continue; let known = false;
    for (const s of MAP.seen){ if (known) break;
      if (s.tx1 === r.tx0 || r.tx1 === s.tx0){ const x = s.tx1 === r.tx0 ? r.tx0 : s.tx0; for (let y = Math.max(s.ty0, r.ty0); y < Math.min(s.ty1, r.ty1); y++) if (open(x - 1, y) && open(x, y)){ known = true; break; } }
      if (!known && (s.ty1 === r.ty0 || r.ty1 === s.ty0)){ const y = s.ty1 === r.ty0 ? r.ty0 : s.ty0; for (let x = Math.max(s.tx0, r.tx0); x < Math.min(s.tx1, r.tx1); x++) if (open(x, y - 1) && open(x, y)){ known = true; break; } } }
    if (known) out.push(r); }
  CLOUD.key = key; CLOUD.list = out; return out;
}
function drawMap(){ const met = corwenMet(), dots = mapDots();
  HUD.fullmap(MAP.c, LEVEL.W, LEVEL.H, MAP.seen, roomAt(P.x, P.y), T, dots, time, LEVEL.name, clouds(), (x, y, w, h) => slab(x, y, w, h, 'The map', LEVEL.name));
  if (met){ const n = LEVEL.index, falls = (G.fallsBy || {})[n] || 0, shut = dots.filter(d => d.way === 'shut').length, open = dots.filter(d => d.way === 'open').length, parts = [];
    parts.push(falls ? `YOU HAVE DIED HERE ${falls} TIME${falls === 1 ? '' : 'S'}` : 'YOU HAVE NOT DIED HERE');
    const sv = dots.filter(d => d.way === 'shut' && d.by === 'step').length, ov = dots.filter(d => d.way === 'open' && d.by === 'step').length, sc = shut - sv, oc = open - ov, ways = (k, w) => `${k} WAY${k === 1 ? '' : 'S'} ${w}`;
    if (sc) parts.push(ways(sc, 'BLOCKED BY CRACKED STONE: NEEDS A HEAVY WEAPON')); if (sv) parts.push(ways(sv, 'BLOCKED BY ICE OR VELLUM: NEEDS AN AIR DASH')); if (oc) parts.push(ways(oc, 'YOUR HAMMER CAN OPEN NOW')); if (ov) parts.push(ways(ov, 'YOUR AIR DASH CAN OPEN NOW'));
    HUD.fine(parts.join('  ·  '), HUD.W / 2, 150 + (HUD.keyRows || 1) * 8, '#8b9bb4', 'center');
    if ((G.sealed || {})[n]){ HUD.seal(HUD.W - 43, 36); HUD.fine('REGION', HUD.W - 43, 48, '#fee761', 'center'); HUD.fine('COMPLETE', HUD.W - 43, 55, '#fee761', 'center'); HUD.fine('EVERYTHING', HUD.W - 43, 66, '#c0cbdc', 'center'); HUD.fine('HERE IS FOUND', HUD.W - 43, 73, '#c0cbdc', 'center'); }
    return; }
  if (((G.taught || {}).mapN || 0) <= 3 && OPT.hints !== false){ let y = 50; for (const para of [CARDS.map.does, ...CARDS.map.how[0].split(/(?<=\.)\s+/)]){ let line = ''; for (const w of para.toUpperCase().split(' ')){ if (line && (line + ' ' + w).length > 17){ HUD.fine(line, HUD.W - 43, y, '#c0cbdc', 'center'); y += 7; line = w; } else line = line ? line + ' ' + w : w; } HUD.fine(line, HUD.W - 43, y, '#c0cbdc', 'center'); y += 12; } } }   // what the marks are, the first few times
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
  HUD.fine(known ? line.toUpperCase() : 'NOT SEEN YET.', x + 29, y + 10, known ? '#c0cbdc' : '#5a6988', 'left');
  if (known && note) HUD.fine(note, x + 29, y + 17, '#8b9bb4', 'left');
}
function drawAnnals(W){
  HUD.dark(1, '#181425'); const people = PAGE >= ANNALS.length, A = ANNALS[PAGE];
  HUD.text("CORWEN'S ANNALS", W / 2, 5, '#2ce8f5', 1, 'center');
  HUD.text(people ? 'PEOPLE' : A.region.toUpperCase(), W / 2, 14, '#fff2d0', 2, 'center');
  HUD.rule(Math.round(W / 2), 33, 70, '#ead4aa'); HUD.fine(`${PAGE + 1} OF ${ANNALS.length + 1}`, W / 2 + 76, 31, '#8b9bb4', 'left');
  const x = Math.max(6, Math.round(W / 2 - 150));
  if (people){ PEOPLE_PAGE.forEach((p, i) => { const met = Object.keys(G.met).filter(k => k.endsWith(':' + p.who)).length; entry(x, 44 + i * 30, p.art, p.name, p.line, met > 0, met ? `MET IN ${met} REGION${met === 1 ? '' : 'S'}` : '', '#fee761'); }); return; }
  const K = A.keeper, met = (G.keepers || {})[K.theme] || G.beat[PAGE];
  entry(x, 41, K.art, K.name, K.line, !!met, G.beat[PAGE] ? 'BEATEN' : met ? 'NOT BEATEN YET' : '', '#e43b44');
  const step = A.creatures.length > 7 ? 22 : 24;   // a long page: its entries a little closer
  A.creatures.forEach((c, i) => { const seen = (G.seen || {})[c.type], n = (G.slain || {})[c.type] || 0; entry(x, 67 + i * step, c.art, c.name, c.line, !!seen, n ? `KILLED ${n}` : 'SEEN, NOT KILLED YET', '#fee761'); });
}
// the Lamplighter's wares, for shards
const WARES = () => [
  // (build 88, docs/gifts-sheet.md: every price up by about two thirds. A region pays about 500 to 700 shards to one
  // who finds everything in it, wings and all, and about 350 on its main way; so a region buys one thing, not three)
  { icon: 'flask', name: 'A bigger flask', does: 'Your flask holds one more drink.', own: `YOU HAVE ${maxFlask()} DRINKS`, say: 'One more mouthful, for a longer road.', cost: [200, 430][G.flasks], buy(){ G.flasks++; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } },
  { icon: 'blade', name: G.edge ? 'Sharpen the sword again' : 'Sharpen the sword', does: G.edge ? 'Every sword hit does +1 damage.' : 'The last hit of each sword combo does +1 damage.', own: G.edge ? 'SHARPENED ONCE' : 'NOT SHARPENED YET', say: 'An edge remembers its work.', cost: [300, 630][G.edge], buy(){ G.edge++; } },
  { icon: 'heart', name: 'A red strand', does: 'A piece of a heart. Three strands make one new heart.', own: `${G.threads % THREADS_A_HEART} OF ${THREADS_A_HEART} STRANDS`, say: 'I found it on the stair. It is yours more than mine.', cost: G.boughtThread ? undefined : 250, buy(){ G.boughtThread = true; onEvent({ type: 'thread', at: { x: P.x, y: P.y + 1.2 } }); } },
  { icon: 'knot', name: 'Another relic slot', does: 'One more relic slot.', own: `${knots()} OF ${KNOTS.most} SLOTS`, say: 'Another knot in the scarf. Tie what you find to it.', cost: knots() < KNOTS.most ? KNOTS.cost[G.knots || 0] : undefined, buy(){ G.knots = (G.knots || 0) + 1; } },
  // (no map is sold, and Corwen gives none: decision 0.16, 21 Nov 2026. The map is what he has walked)
];
let SHOP = [];
// (build 84, docs/screens-sheet.md: the shop is Ordric's own sheet of paper, pinned up. Each thing a line on it: its
// picture, its name, what he has of it, its price. His shards apart, large. Ordric, what the thing does, and a word
// from him about it. The lines are buttons with nothing drawn on them, laid over the paper, so every way of
// choosing still works; the paper itself is drawn by drawShop)
const SHEET = W => { const x = 12, y = 6, pw = Math.round(W * 0.52), ph = 152; return { x, y, pw, ph, row: i => y + 46 + i * 24, rx: x + pw + 10 }; };
function shop(){
  SCREEN = 'shop'; PAUSE = true; release(); const keep = MSEL, W = HUD.W, S0 = SHEET(W);
  SHOP = WARES().filter(w => w.cost !== undefined);
  const rows = SHOP.map((w, i) => { const b = menuButton('', () => { MSEL = i; if (G.shards < w.cost){ sfx.block(); menuMark(); return; } G.shards -= w.cost; w.buy(); sfx.buy(); store(); shop(); }, true);
    b.dataset.ghost = '1'; b.setAttribute('aria-label', `${w.name}, ${w.cost} shards`); b.style.cssText = `position:absolute;left:${(S0.x + 4) / W * 100}%;top:${(S0.row(i) - 1) / 180 * 100}%;width:${(S0.pw - 8) / W * 100}%;height:${22 / 180 * 100}%;background:transparent;border:none;box-shadow:none;padding:0;cursor:pointer;outline:none`;
    b.addEventListener('pointerenter', () => { if (MSEL !== i){ MSEL = i; menuMark(); } }); return b; });
  const leave = () => { SCREEN = ''; PAUSE = false; menuHide(); }, lb = menuButton('Leave', leave, true); lb.style.cssText += `;position:absolute;left:${S0.rx / W * 100}%;top:${152 / 180 * 100}%`; rows.push(lb);
  menuShow(rows, false, leave); MENU.style.top = '0'; MENU.style.bottom = '0'; MSEL = Math.min(keep, Math.max(0, menuItems().length - 1)); menuMark();
}
function drawShop(W){
  HUD.dark(0.9, '#181425'); const px = HUD.px, { x, y, pw, ph, row, rx } = SHEET(W), INK = '#3e2731', BROWN = '#733e39', PALE = '#a8977a';
  // the sheet: bone paper, a lit top edge, a worn right edge, a torn foot, and the pin that holds it
  px('#0d0b12', x + 3, y + 4, pw, ph); px('#ead4aa', x, y, pw, ph); px('#f3e2bd', x + 1, y + 1, pw - 2, 1); px('#d9c08f', x + pw - 2, y + 2, 2, ph - 4); px('#d9c08f', x, y + ph - 3, pw, 3);
  for (let i = 0; i < pw; i += 5) px('#181425', x + i, y + ph - ((i / 5) % 3 === 0 ? 3 : (i / 5) % 3 === 1 ? 1 : 2), 3, 3);
  { const cx = x + Math.round(pw / 2); px('#181425', cx - 4, y - 3, 8, 9); px('#a22633', cx - 3, y - 2, 6, 7); px('#e43b44', cx - 3, y - 2, 6, 2); px('#f6757a', cx - 2, y - 2, 2, 1); px('#733e39', cx - 3, y + 3, 6, 2); }
  HUD.text('ORDRIC', x + 10, y + 12, INK, 2, 'left', false); HUD.fine('LAMPS, FLASKS, WHAT YOU NEED', x + 10, y + 30, BROWN, 'left', 0); px(BROWN, x + 10, y + 39, pw - 20, 1); px('#d9c08f', x + 10, y + 40, pw - 20, 1);
  if (!SHOP.length){ HUD.text('NOTHING MORE TO SELL.', x + 10, y + 56, INK, 1, 'left', false); HUD.fine('YOU HAVE BOUGHT EVERYTHING.', x + 10, y + 68, BROWN, 'left', 0); }
  SHOP.forEach((w, i) => { const ry = row(i), on = i === MSEL, can = G.shards >= w.cost;
    if (on){ px('#f8ecd0', x + 6, ry - 1, pw - 12, 22); px('#d9c08f', x + 6, ry + 20, pw - 12, 1); px('#181425', x + 2, ry, 5, 20); px('#a22633', x + 3, ry + 1, 3, 18); px('#e43b44', x + 3, ry + 1, 1, 18); }
    HUD.g.globalAlpha = can ? 1 : 0.45; drawIcon(px, w.icon, x + 10, ry + 2, 1); HUD.g.globalAlpha = 1;
    HUD.fine(w.name.toUpperCase(), x + 30, ry + 3, can ? INK : PALE, 'left', 0); HUD.fine(w.own, x + 30, ry + 12, can ? BROWN : PALE, 'left', 0);
    const cw = textWidth(String(w.cost)); HUD.text(String(w.cost), x + pw - 10 - cw, ry + 6, can ? '#a22633' : PALE, 1, 'left', false); px(can ? '#124e89' : PALE, x + pw - 17 - cw, ry + 8, 3, 5); px(can ? '#0099db' : PALE, x + pw - 18 - cw, ry + 9, 5, 3); });
  if (SHOP.some(w => G.shards < w.cost)) HUD.fine('PALE: YOU CANNOT PAY FOR IT YET', x + 10, y + ph - 13, PALE, 'left', 0);
  // his shards, apart and large
  const rw = W - rx - 8; slab(rx, 6, rw, 42, 'Your shards'); px('#181425', rx + 11, 25, 9, 13); px('#2ce8f5', rx + 14, 26, 3, 11); px('#0099db', rx + 12, 29, 7, 5); px('#ffffff', rx + 15, 26, 1, 4); HUD.text(String(G.shards), rx + 26, 25, '#fff2d0', 2, 'left');
  // Ordric: what the thing chosen does, and a word from him about it
  const w = SHOP[MSEL]; slab(rx, 54, rw, 94, 'Ordric');
  { const f = TALK.face && TALK.face('lamplighter'); px('#5a6988', rx + 9, 73, 26, 26); px('#262b44', rx + 10, 74, 24, 24); if (f){ HUD.g.imageSmoothingEnabled = false; HUD.g.drawImage(f.im, f.x, f.y, f.s, f.s, rx + 10, 74, 24, 24); } }
  if (w){ HUD.fine(w.name.toUpperCase(), rx + 40, 77, '#fee761', 'left', 0); HUD.rich(`[${kname('jump')}] BUY`, rx + 40, 89, G.shards >= w.cost ? '#c0cbdc' : '#5a6988'); let yy = 104; for (const ln of wrapFine(w.does.toUpperCase(), rw - 20)){ HUD.fine(ln, rx + 10, yy, '#fff2d0', 'left', 0); yy += 8; } flavour(w.say || '', rx + rw / 2, yy + 3, rw - 14, W); }
  else { HUD.fine('COME BACK WHEN', rx + 40, 80, '#c0cbdc', 'left', 0); HUD.fine('YOU NEED A LAMP LIT.', rx + 40, 88, '#c0cbdc', 'left', 0); flavour(''); }
}
// the knots: at a flame, he chooses which relics he wears. Each is a knot in his scarf; he can carry more than he can
// wear. The one picked is tied or untied; with every knot tied, one must be untied first
let KSEL = null, KNOTMSG = '';
function knotMenu(){
  SCREEN = 'knots'; PAUSE = true; release(); const keep = MSEL;
  const rows = [menuLabel(`RELICS  ·  ${G.worn.length} OF ${knots()} SLOTS USED`)], grid = document.createElement('div');
  grid.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:min(92vw,560px)';
  KSEL = G.relics.filter(id => RELICS[id]);
  KSEL.forEach((id, i) => { const on = has(id), b = menuButton(RELICS[id].name, () => {
      if (!wear(id, !on)){ sfx.block(); KNOTMSG = 'All slots are full. Remove a relic first.'; } else { KNOTMSG = ''; on ? sfx.ui() : sfx.relic(); learn(); store(); }
      MSEL = i; knotMenu(); }, true);
    b.addEventListener('pointerenter', () => { if (MSEL !== i){ MSEL = i; menuMark(); } });   // what it does shows under the mouse too
    if (on){ b.style.color = '#fee761'; b.style.borderColor = '#fee761'; } grid.appendChild(b); });
  rows.push(grid);
  const leave = () => { SCREEN = ''; PAUSE = false; KSEL = null; KNOTMSG = ''; menuHide(); };
  if (G.under) rows.push(menuButton('Travel', () => waterMenu()));
  rows.push(menuButton('Leave the pool', leave, true));
  menuShow(rows, false, leave); MENU.style.top = '30%'; MSEL = Math.min(keep, menuItems().length - 1); menuMark();
}
// ---- travel through the water (phase 16, docs/phase16-sheet.md): given at the lamp in the chapel of the shift. At any
// water he has found he can go under, and come up at another. G.wat[n]: the waters of region n he has stood in ('r'
// its raising water; a leak by its place and its room's name)
let ATWATER = null, UNDER = null, WSEL = null;
const found = S => { const L = ((G.wat = G.wat || {})[LEVEL.index] = G.wat[LEVEL.index] || []), key = S.raise ? 'r' : S.id + '|' + ((S.room && S.room.name) || 'a leak'); if (!L.some(k => k.split('|')[0] === key.split('|')[0])){ L.push(key); store(); } };
// a save from before this had no list: the raising water of every region he has been in is his
function oldWaters(){ G.wat = G.wat || {}; for (let n = 0; n < LEVELS.length; n++){ const been = REGION_DATA[n].deep ? !!(G.rooms && (G.rooms[n] || []).length) : G.began && n <= G.top; if (been && !(G.wat[n] = G.wat[n] || []).includes('r')) G.wat[n].unshift('r'); } }
// the waters he can come up at: the mountain from its top down, then the Deep; the one he stands in left out
function waterList(){ const out = [], here = ATWATER ? ATWATER.id : ''; const order = [...LEVELS.keys()].filter(n => !REGION_DATA[n].deep).reverse().concat([...LEVELS.keys()].filter(n => REGION_DATA[n].deep));
  for (const n of order) for (const k of (G.wat && G.wat[n]) || []){ const [id, room] = k.split('|'); if (n === LEVEL.index && id === here) continue; if (G.thrown && !G.out && !REGION_DATA[n].deep) continue;   /* (build 121) thrown down, he does not come up by the water until he has climbed out once */ out.push({ n, id, raise: id === 'r', name: LEVELS[n].name.replace(/^The /, ''), room: room || '' }); }
  return out; }
function waterMenu(){
  SCREEN = 'under'; PAUSE = true; release(); oldWaters(); WSEL = waterList();
  const rows = [menuLabel('TRAVEL  ·  CHOOSE WHERE TO COME UP')], grid = document.createElement('div');
  grid.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:min(94vw,620px)';
  WSEL.forEach((w, i) => { const b = menuButton(w.raise ? w.name : w.name + ' · ' + w.room, () => goUnder(w), true); if (w.raise){ b.style.color = '#9fe8ff'; b.style.borderColor = '#9fe8ff'; } b.addEventListener('pointerenter', () => { if (MSEL !== i){ MSEL = i; menuMark(); } }); grid.appendChild(b); });
  rows.push(grid); const back = () => { WSEL = null; knotMenu(); }; rows.push(menuButton('Not now', back, true));
  menuShow(rows, false, back); MENU.style.top = '26%'; MSEL = 0; menuMark();
}
function drawUnder(W){
  HUD.dark(0.9, '#0b1020'); HUD.text('THE WATER', W / 2, 14, '#cfe6ff', 2, 'center'); HUD.rule(Math.round(W / 2), 34, 60, '#9fe8ff');
  const w = WSEL && WSEL[MSEL];
  if (!WSEL || !WSEL.length) HUD.fine('YOU HAVE NOT FOUND ANOTHER POOL OR SPRING YET.', W / 2, 150, '#8b9bb4', 'center');
  else if (w){ HUD.text(LEVELS[w.n].name.toUpperCase(), W / 2, 146, '#fff2d0', 1, 'center'); HUD.fine(w.raise ? 'CHECKPOINT POOL' : 'A SPRING: ' + w.room.toUpperCase(), W / 2, 158, '#9fe8ff', 'center'); }
}
// under: he comes apart into the water he stands in, as in a fall; and rises out of the other. It is not a fall
function goUnder(w){ SCREEN = ''; PAUSE = false; KSEL = null; WSEL = null; KNOTMSG = ''; menuHide(); BANNER = null; P.vx = P.vy = 0; UNDER = { t: 0, went: false, drops: dissolve(), n: w.n, id: w.id }; fx.ring({ x: P.x, y: P.y + 0.6 }, 0xcfe6ff); fx.burst({ x: P.x, y: P.y + 1.2 }, 18, 0xdff4ff); sfx.splash(); }
const dropsStep = (drops, dt, quiet) => { for (const d of drops){ if (d.sunk){ d.sunk += dt; d.m.scale.y = Math.max(0.05, 1 - d.sunk * 2); d.m.position.y -= dt * 0.25; d.m.material.opacity = Math.max(0, 1 - d.sunk * 1.6); continue; }
    d.vy -= 16 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.m.position.set(d.x, d.y, 0.06);
    if (d.vy < 0 && (solidAt(d.x, d.y - 0.03) || (d.y < d.floor + 0.02))){ d.y = Math.max(d.y, d.floor); d.sunk = 0.001; d.m.position.y = d.y; if (!quiet && Math.random() < 0.15) sfx.step(); } } };
const dropsEnd = drops => { for (const d of drops){ R.scene.remove(d.m); d.m.geometry.dispose(); d.m.material.dispose(); } };
function drawKnots(W){
  HUD.dark(0.9, '#181425'); HUD.text('THE KNOTS', W / 2, 14, '#fff2d0', 2, 'center'); HUD.rule(Math.round(W / 2), 34, 60, '#ead4aa');
  const id = KSEL && KSEL[MSEL], r = id && RELICS[id];
  if (r){ HUD.text(r.name.toUpperCase(), W / 2, 100, has(id) ? '#fee761' : '#c0cbdc', 1, 'center'); let y = 111; for (const ln of wrapText(r.line, W - 48)){ HUD.text(ln, W / 2, y, '#fff2d0', 1, 'center'); y += 10; }
    HUD.fine(has(id) ? 'EQUIPPED. SELECT IT TO REMOVE IT.' : 'NOT EQUIPPED. SELECT IT TO EQUIP IT.', W / 2, y + 2, '#8b9bb4', 'center'); }
  else HUD.fine('NOTHING CAN HURT YOU WHILE YOU CHOOSE.', W / 2, 104, '#8b9bb4', 'center');
  if (KNOTMSG) HUD.fine(KNOTMSG.toUpperCase(), W / 2, 140, '#f6757a', 'center');
}
// a pause: Esc or P (or the II button): the world stops; go on, or back to the title
const PBTN = menuButton('II', () => pause(!PAUSE), true); PBTN.style.cssText += ';position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:6;padding:3px 9px;font-size:12px;display:none;opacity:0.6;background:rgba(24,20,37,.4);box-shadow:none;border:2px solid rgba(234,212,170,.5);border-radius:10px';
(document.getElementById('stage') || document.body).appendChild(PBTN);
// ---- what he is doing, said plainly (build 77, from a playtest: nobody could say where to go or why). Two lines, at
// the top of the pause menu: the goal of the whole game, and the next step from where he is
const KEEPER_OF = ['the Warden', 'the Toll', 'the Rime Wyrm', 'the Thunderhead', 'Mother Thorn', 'the Fallen'];
function goalLines(){
  const n = LEVEL.index, goal = 'GOAL: CLIMB TO THE FLAME AT THE TOP OF THE MOUNTAIN', beat = k => !!G.beat[k] || G.top > k;
  if (REGION_DATA[n] && REGION_DATA[n].deep) return [goal, G.thrown && !G.out ? 'YOU WERE THROWN DOWN TO THE BOTTOM OF THE MOUNTAIN. CLIMB OUT: THE WAY IS UP.' : 'YOU ARE IN THE DEEP, UNDER THE MOUNTAIN. IT IS OPTIONAL. THE CLIMB IS ABOVE.'];
  if (n >= 5) return [goal, beat(n) ? 'THE SUMMIT IS OPEN. GO UP.' : 'NEXT: THE SUMMIT. FACE WHAT WAITS THERE.'];
  return [goal, beat(n) ? `NEXT: ${KEEPER_OF[n].toUpperCase()} IS BEATEN. TAKE THE WAY UP TO ${LEVELS[n + 1].name.toUpperCase()}.` : `NEXT: FIND ${KEEPER_OF[n].toUpperCase()} AT THE TOP OF ${LEVEL.name.toUpperCase()}. IT BLOCKS THE WAY UP.`];
}
function pause(on){
  if (STORY.active() || GO.st || TALK.on || NOTE) return; if (SCREEN === 'shop' || SCREEN === 'knots' || SCREEN === 'under'){ SCREEN = ''; PAUSE = false; menuHide(); return; }
  PAUSE = on; SCREEN = on ? 'pause' : ''; if (!on){ menuHide(); return; } release();
  // (build 83, docs/screens-sheet.md: tabs down the left, the goal across the top, what he has on the right, and
  // the list of keys on a tab of its own. It was a column of text over a row of buttons over five lines of keys)
  const tabs = [['Resume', () => pause(false)], ['Map', mapScreen], ['Inventory', carryScreen], ['Lore book', () => annals(LEVEL.index)], ['Keys', keysScreen], ['Options', () => options(() => pause(true))], ['Quit to title', () => { PAUSE = false; SCREEN = ''; title(); }]];
  menuShow(tabs.map(([name, fn]) => { const b = menuButton(name, fn, true); b.style.minWidth = '128px'; b.style.textAlign = 'left'; b.style.padding = '4px 12px 4px 14px'; return b; }), true, () => pause(false)); MENU.style.top = '31%'; MENU.style.gap = '5px';
}
addEventListener('keydown', e => {
  if (TALK.on || NOTE){ if (['Enter', 'Space', 'KeyE', 'KeyS', 'ArrowDown', 'KeyJ'].includes(e.code)) press(); return; }
  if (SCREEN === 'annals' && ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)){ PAGE = (PAGE + (['ArrowLeft', 'KeyA', 'KeyQ'].includes(e.code) ? -1 : 1) + ANNALS.length + 1) % (ANNALS.length + 1); sfx.ui(); e.preventDefault(); return; }
  if (MENU.style.display !== 'none' && MENU.children.length){   // a menu is up: move in it, pick from it
    const items = menuItems(); if (['ArrowDown', 'KeyS'].includes(e.code)){ MSEL = (MSEL + 1) % items.length; menuMark(); e.preventDefault(); return; } if (['ArrowUp', 'KeyW'].includes(e.code)){ MSEL = (MSEL + items.length - 1) % items.length; menuMark(); e.preventDefault(); return; }
    if (e.code === 'Enter' || e.code === 'Space'){ const b = items[MSEL]; if (b) b.dispatchEvent(new PointerEvent('pointerdown')); menuMark(); e.preventDefault(); return; }
  }
  // the menu key: Tab, P or Escape. In a screen that came from another it goes back one, not all the way out to play.
  // (Tab because a browser keeps Escape for leaving full screen, which is how the game is played on its page)
  if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Tab'){ if (e.code === 'Tab') e.preventDefault(); if (e.repeat) return;
    if (MENU.style.display !== 'none' && MENU.children.length && MENU.back){ MENU.back(); sfx.ui(); return; }
    if (!STORY.active()){ pause(!PAUSE); return; } }
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
// a buzz in the hands, for a blow that lands, one taken, and the big moments (Options: Rumble): a pad's, or the phone's (vibrate.js)
const buzz = (s, w, ms) => { if (OPT.rumble !== false){ rumble(s, w, ms); vibrate(s, w, ms); } };
// (phase 20) a save still waiting to be written when the page is put away (the phone locked, another app, the tab shut) is written then
const flush = () => { if (DIRTY > 0 && !VIEW.on){ DIRTY = 0; store(); } };
addEventListener('pagehide', flush); document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
// a press while someone is speaking, or a card is up: on with it
function press(){ if (TALK.on) TALK.press(); else if (NOTE && NOTE.t > 0.7){ NOTE = null; } }
addEventListener('pointerdown', () => { if (TALK.on || NOTE) press(); else if (STORY.active()) STORY.press(); });
// ---- the score (music.js): which piece, by where he is; it starts with the first key or touch (a browser's rule)
let MUSIC = null, HEARD = false, MUTED = (() => { try { return localStorage.getItem('climb-side-mute') === '1'; } catch (e){ return false; } })();
// the title says to press for sound until there has been a press; a phone lets sound start on a tap's end
const hear = () => { HEARD = true; ac(); }; STORY.quiet = () => !HEARD; for (const ev of ['pointerdown', 'keydown', 'click', 'touchend']) addEventListener(ev, hear);
document.addEventListener('fullscreenchange', () => { try { const kb = navigator.keyboard; if (kb && kb.lock){ if (document.fullscreenElement) kb.lock(['Escape']).catch(() => {}); else if (kb.unlock) kb.unlock(); } } catch (err){} });
addEventListener('keydown', e => { if (e.code === 'F2'){ e.preventDefault(); OPT.place = !OPT.place; storeOpt(); banner('', OPT.place ? 'place shown: read it out with your notes' : 'place hidden', 2); } });
addEventListener('keydown', e => { if (e.code === 'KeyN'){ MUTED = !MUTED; try { localStorage.setItem('climb-side-mute', MUTED ? '1' : '0'); } catch (err){} banner('', MUTED ? 'music off' : 'music on', 1.6); } });
// a region with no music of its own has another's (musicOf: the Workings, the Roots')
const alias = theme => { const R = REGION_DATA.find(q => q.theme === theme); return (R && R.musicOf) || theme; };
const SCORE = makeScore(), AMB = { hollow: 'cave', flooded: 'cave', shaft: 'wind', vein: 'cave', workings: 'cave', roots: 'cave', cloister: 'cave', spires: 'wind', tempest: 'storm', gardens: 'garden', firmament: 'wind' };
function score(){
  if (!HEARD) return; const A = ac(); if (!A) return; if (!MUSIC) MUSIC = makeMusic(A, musicBus() || A.destination);
  const k = STORY.kind, fight = BOSS && BOSS.active() && BOSS.st !== 'die', inHall = BOSS && BOSS.room && P.x >= BOSS.room.x0 && P.x < BOSS.room.x1 && P.y >= BOSS.room.y0 - 1 && P.y < BOSS.room.y1, quiet = ENT.hush || (BOSS && (BOSS.st === 'die' || (BOSS.st === 'dead' && !WON && inHall)));   // (a fallen keeper's hall is silent; the rest of its region has its music again. Until build 78 the whole region stayed silent until he left it)
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
// the aim assist: with nothing in reach ahead and a creature in reach behind, a swing turns to it. Not to a thing that is
// no creature (a brazier, a cairn, a bell's tongue): a swing never turns round to light a fire or ring iron he did not mean to
HOOKS.aim = P => {
  const reach = BLADE.reach + MV.aim; let ahead = false, behind = false;
  for (const e of E.list){ if (!e.alive || e.d.harmless || e.d.prop || e.d.noAim || Math.abs(e.y - P.y) > 2.2) continue; const d = (e.x - P.x) * P.face; if (d > -0.3 && d < reach) ahead = true; else if (d <= -0.3 && d > -reach) behind = true; }
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
  // with the hammer in hand, its own drawing where there is one (build 89: a whole set, `hm_`, made from one picture of
  // him holding it, docs/weapons-sheet.md; until then nine drawings of the spade it used to be)
  const pre = weaponOf(P).pre, held = n => pre && has(pre + n) ? pre + n : n;   // (build 91: by the weapon's own prefix, motor.js ARMS)
  // where his hands are busy, his weapon is on his back (build 96; agreed 22 Nov): his climb, his getting up, his taking a gift
  const bk = n => has('bk_' + (P.weapon || 'blade') + '_' + n) ? 'bk_' + (P.weapon || 'blade') + '_' + n : n;
  if (WAKE > 0 && has('getup')) return [bk('getup'), Math.min(0.999, Math.max(0, 1 - WAKE / 1.4))];   // where he fell: up off the ground
  if (RECEIVE > 0 && has('receive')) return [bk('receive'), Math.min(0.999, 1 - RECEIVE / RECEIVE_T)];   // taking a keeper's gift
  if (P.art){ if (P.art.k === 'slam' && P.weapon === 'spade' && has('hm_atk3')) return ['hm_atk3', (6 + Math.min(5.99, P.art.t / P.art.dur * 6)) / 12];   // the slam, with the hammer: its great blow
    if (P.weapon === 'tooth'){ const u = Math.min(0.999, P.art.t / P.art.dur), a = { cleave: ['tt_atk3', (4 + u * 7) / 12], gust: ['tt_up', (5 + u * 6) / 12], slam: ['tt_land', u] }[P.art.k]; if (a && has(a[0])) return a; }
    if (P.weapon === 'thorns'){ const u = Math.min(0.999, P.art.t / P.art.dur), a = { cleave: ['th_atk3', (5 + u * 6.9) / 12], gust: ['th_up', (3 + u * 7.9) / 11], slam: ['th_land', u] }[P.art.k]; if (a && has(a[0])) return a; }
    if (P.weapon === 'bow'){ const u = Math.min(0.999, P.art.t / P.art.dur), a = { cleave: ['bw_atk1', (7 + u * 2.9) / 10], gust: ['bw_up', (6 + u * 2.9) / 9], slam: ['bw_land', u] }[P.art.k]; if (a && has(a[0])) return a; }
    if (P.weapon === 'clapper'){ const u = Math.min(0.999, P.art.t / P.art.dur), a = { cleave: ['cl_atk1', (5 + u * 6) / 12], gust: ['cl_up', (6 + u * 5) / 12], slam: ['cl_atk2', (4 + u * 7) / 12] }[P.art.k]; if (a && has(a[0])) return a; }   // the arts, with the tooth: its charge, its upward thrust, a landing
    const name = { cleave: 'atk_dash_px', gust: 'atk_rise_px', slam: 'plunge_land' }[P.art.k]; if (has(name)) return [name, Math.min(0.999, P.art.t / P.art.dur)]; }   // an ember art
  if (P.mantle && pick('climb')){
    const name = has(bk('climb')) && bk('climb') !== 'climb' ? bk('climb') : pick('climb'), C = CLIMB[name] || A[name].climb, M = P.mantle;   // climb_own carries its table (tools/compose-climb.py)
    if (C && M.wall != null){
      const n = A[name].frames, hpx = (M.y1 - M.y0) * 16; let f0 = C.first; while (f0 < n - 2 && C.depth[f0] > hpx + 5) f0++;   // the frame that fits where he caught it
      const f = Math.min(n - 1, f0 + Math.floor(M.t / M.dur * (n - f0))), [cx, foot] = C.corner[f];
      return [name, (f + 0.5) / n, { cx, foot, ledge: true }];
    }
    return [name, Math.min(0.999, 0.15 + 0.85 * M.t / M.dur), 'last'];   // its first frames are him standing: from the reach up
  }
  if (P.hp <= 0 && has('hurt')) return [held('hurt'), 0.999];
  if (P.hurtT > 0 && has('hurt')) return [held('hurt'), 1 - P.hurtT / MV.hurtStun];
  if (P.roll > 0 && pick('roll')) return [held('roll') !== 'roll' ? held('roll') : pick('roll'), 1 - P.roll / MV.roll.time];
  if (P.flip > 0 && !P.grounded && pick('flip')) return [pick('flip'), Math.min(0.999, 0.08 + 0.92 * (1 - P.flip / MV.flip))];   // the double jump's somersault, drawn
  // the plunge: the blade turned point-down (two frames), then the dive held, the cape streaming; drawn by his boots, so
  // the blade reaches below his feet
  // the hammer's plunge: he rides it down, its stone head under his boots (build 90: a drawing of its own, begun from
  // the "in the air" one; until then it borrowed two frames of the great blow). It lands with that blow's end
  if (P.dive && P.weapon === 'thorns' && has('th_plunge')){ const n = A.th_plunge.frames; return ['th_plunge', (Math.min(n - 1, Math.floor((P.dive.t || 0) * 12)) + 0.5) / n]; }   // the thorns' plunge: both points down by his boots
  if (P.grounded && PLUNGE_T > 0 && P.weapon === 'thorns' && has('th_land') && !(Math.abs(P.vx) > 1.5 && P.plant <= 0)) return ['th_land', Math.min(0.999, 1 - PLUNGE_T / PLUNGE_LAND)];
  if (P.dive && P.weapon === 'clapper' && has('cl_plunge')){ const n = A.cl_plunge.frames; return ['cl_plunge', (Math.min(n - 1, Math.floor((P.dive.t || 0) * 14)) + 0.5) / n]; }   // the clapper's: a whirl over his head, then the chain cast down, held
  if (P.grounded && PLUNGE_T > 0 && P.weapon === 'clapper' && has('cl_atk2') && !(Math.abs(P.vx) > 1.5 && P.plant <= 0)) return ['cl_atk2', (6 + Math.min(4.99, (1 - PLUNGE_T / PLUNGE_LAND) * 5)) / 12];   // landing: its head on the ground in front of him
  if (P.dive && P.weapon === 'tooth' && has('tt_plunge')){ const n = A.tt_plunge.frames; return ['tt_plunge', ((Math.floor((P.dive.t || 0) * 10) % n) + 0.5) / n]; }   // the tooth's dive: head first behind the spear
  if (P.grounded && PLUNGE_T > 0 && P.weapon === 'tooth' && has('tt_land') && !(Math.abs(P.vx) > 1.5 && P.plant <= 0)) return ['tt_land', Math.min(0.999, 1 - PLUNGE_T / PLUNGE_LAND)];
  if (P.dive && P.weapon === 'spade' && has('hm_plunge')){ const n = A.hm_plunge.frames; return ['hm_plunge', ((Math.floor((P.dive.t || 0) * 10) % n) + 0.5) / n]; }
  if (P.grounded && PLUNGE_T > 0 && P.weapon === 'spade' && has('hm_atk3') && !(Math.abs(P.vx) > 1.5 && P.plant <= 0)) return ['hm_atk3', (7 + Math.min(4.99, (1 - PLUNGE_T / PLUNGE_LAND) * 5)) / 12];   // its landing: the hammer driven in
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
  if (P.grounded && landT > 0 && pick('land') && !(Math.abs(P.vx) > 1.5 && landT < LAND_T - 0.08)) return held('land') !== 'land' ? [held('land'), Math.min(0.999, 1 - landT / LAND_T)] : [pick('land'), Math.min(0.999, 0.2 + 0.8 * (1 - landT / LAND_T))];   // from the moment his feet meet the floor
  // crouched: down into it (its first frames, then held); moving, the low shuffle, by how far he has gone
  if (P.grounded && P.crouch){ if (Math.abs(P.vx) > 0.3 && has(held('crouch_walk'))) return [held('crouch_walk'), (P.dist || 0) / 1.6]; if (has(held('crouch'))) return [held('crouch'), Math.min(0.999, CROUCH_T / 0.16)]; }
  if (P.grounded && Math.abs(P.vx) > 0.3){ const run = held(has('sprint') ? 'sprint' : 'run'); if (has(run)) return [run, (P.dist || 0) / 2.6]; }
  if (held('idle') !== 'idle') return [held('idle'), t / 1.6];   // standing with the hammer
  if (has('idle')) return ['idle', t / 1.4];
  return ['stand', 0];
}

let last = 0, acc = 0, time = 0;
// capture: for recording play frame by frame (tools), the game moves only when asked, a fixed step each time
const CAPTURE = { on: false, left: 0, dt: 1 / 24 };
// frames a second, as they come (Options, Place: shown beside the place), so what a phone does is a number. Read off
// the time between frames before it is capped; a gap of more than half a second (the page put away) is left out
const FPS = { n: 60, slow: 0, odd: false };
// (build 130) when the phone cannot keep up, less is drawn (render.js DRAW): under 45 frames a second for three seconds
// together, one step down; and again if it is still slow. Never back up while the game is open: it does not flicker
// between the two. Options, Drawing: auto (this), full (never), light (all three steps at once)
function drawStep(gap){
  if (OPT.draw === 'full'){ DRAW.step = 0; return; } if (OPT.draw === 'light'){ DRAW.step = 3; return; }
  if (PAUSE || STORY.active() || GO.st || DRAW.step >= 3) { FPS.slow = 0; return; }   // (a menu, a story screen or a region being made is not play)
  FPS.slow = FPS.n < 45 ? FPS.slow + gap : 0; if (FPS.slow >= 3){ DRAW.step++; FPS.slow = -2; FPS.n = 60; }   // (and two seconds' grace after a step, to see what it does)
}
function frame(ts){
  if (DRAW.step >= 3 && (FPS.odd = !FPS.odd)){ requestAnimationFrame(frame); return; }   // thirty frames a second: every other one is let go
  const now = ts / 1000, gap = last ? now - last : 0; let dt = last ? Math.min(DRAW.step >= 3 ? 0.07 : 0.05, gap) : 1 / 60; last = now;
  if (gap > 0 && gap < 0.5){ FPS.n += (1 / gap - FPS.n) * 0.05; drawStep(gap); }
  if (CAPTURE.on){ if (CAPTURE.left <= 0){ requestAnimationFrame(frame); return; } CAPTURE.left--; dt = CAPTURE.dt; }
  pollPads(); padUI(); score();
  PBTN.style.display = STORY.active() || DEVICE.kind !== 'touch' ? 'none' : 'block'; artButton();
  if (DIRTY > 0 && (DIRTY -= dt) <= 0) store();
  if (TALK.on || NOTE){   // someone is speaking, or a card is up: the world waits
    if (IN.pressed.has('jump') || IN.pressed.has('attack')){ IN.pressed.clear(); press(); }
    if (NOTE) NOTE.t += dt; drawHud(dt); endFrame(); requestAnimationFrame(frame); return; }
  if (PAUSE){ drawHud(0); endFrame(); requestAnimationFrame(frame); return; }
  if (G.due && !G.thrown && LEVEL.index === CLIMB_TOP && !GO.st && !STORY.active() && !PAUSE && !SCREEN && P.hp > 0 && !DISS && !UNDER && !TRY.on){ THROWT += dt; if (THROWT > 1.6 && P.grounded) throwDown(); } else THROWT = 0;   // (build 121) a moment in the last region's door, and then the throw
  if (STORY.active() && !GO.st){ hudBegin(); STORY.draw(dt); endFrame(); requestAnimationFrame(frame); return; }   // a story screen is up: the world waits (on the title, until a press: a browser lets no sound play before one)
  ruleStep(dt); wingStep(dt);
  joinStep();   // first in the frame: if he has walked through a sill's middle, the region is changed before anything looks at it
  if (WAKE > 0) WAKE -= dt;
  if (!NAMED && R.look() === LEVEL.theme && !GO.st && !ENT.st){ NAMED = true; banner(LEVEL.name, SUB[LEVEL.index] || '', 4.5); sfx.gust(); }   // out of the way in: this is the new place
  // an open way on breathes the next region out: its air drifts from the arch
  for (const x of R.exits) if (x.on && Math.random() < dt * 16){ const a = Math.random() * Math.PI * 2; fx.burst({ x: x.x + Math.cos(a) * 0.6, y: x.y + 1.3 + Math.sin(a) * 0.9 }, 1, x.cols[Math.random() < 0.5 ? 0 : 1]); }
  for (let i = LATER.length - 1; i >= 0; i--) if ((LATER[i].t -= dt) <= 0){ const L = LATER[i]; LATER.splice(i, 1); L.f(); }
  if (!NOTE && CARDQ.length){ NOTE = CARDQ.shift(); release(); }   // the next card, in its turn
  noteWays(dt);
  giftStep(dt); if (RECEIVE > 0) RECEIVE -= dt;
  // a hint, if he is struggling (teach.js); not while something else has the screen
  TEACHER.step(dt, { P, held: IN.held, solidAt, onPlank, busy: !!(WAKE > 0 || DISS || FLIGHT || GO.st || ENT.st || DEATH > 0 || (BOSS && BOSS.st === 'rise')),
    foes: TEACHER.known('cut') ? null : E.list.filter(e => e.alive) });
  // hit-stop: a hit freezes the world a few frames (the effects keep running)
  let sdt = dt; if (FEEL_FX.hitstop > 0){ FEEL_FX.hitstop -= dt; sdt = dt * 0.06; }
  if (SLOW > 0){ SLOW -= dt; sdt *= 0.3; }   // a boss's last moment, drawn out
  FLASH = Math.max(0, FLASH - dt); PLAYED += dt; PHASE.t += sdt; PROPS.step(sdt, time, P);
  if (PROPS.glass.some(K => K.turned && Math.abs(K.x - P.x) < 11 && Math.abs(K.y - P.y) < 7)) sfx.glass();   // the star-glass turns: it can be heard
  acc += sdt; time += dt;
  const evs = [];
  // what is in reach to use: someone to talk to, a chest to open (down)
  if (VIEW.on) viewStep(dt);
  if (ENT.lead && !ENT.first && (IN.pressed.has('jump') || IN.pressed.has('attack'))){ IN.pressed.delete('jump'); IN.pressed.delete('attack'); ENT.skip(); }   // seen it before: a press goes straight to the keeper
  USE = P.hp > 0 && P.grounded && !FLIGHT && !GO.st && WAKE <= 0 && !(BOSS && BOSS.active() && BOSS.st !== 'dead') ? ITEMS.near(P) : null;
  if (!USE && P.hp > 0 && P.grounded && !FLIGHT && !GO.st && WAKE <= 0 && (G.relics.length || G.under)){ const S = SHRINES.find(S => Math.abs(P.x - S.x) < S.half && Math.abs(P.y - S.y) < 1.5); if (S) USE = { type: 'flame', x: S.x, y: S.y, S }; }   // at a flame: the knots
  if (USE && IN.pressed.has('down')){ IN.pressed.delete('down'); if (USE.type === 'npc') talkTo(USE); else if (USE.type === 'flame'){ ATWATER = USE.S; knotMenu(); } else ITEMS.open(USE, evs); }
  const h = 1 / 120;
  while (acc >= h){ const x0 = P.x; if (DEATH <= 0 && !FLIGHT && !DISS && !UNDER && !GO.st && WAKE <= 0 && RECEIVE <= 0 && !ENT.lead) { stepPlayer(P, h); toothStep(); arrowsStep(h); } else if (ENT.lead){ P.vx = 0; if (ENT.face) P.face = ENT.face; if (ENT.brace && !P.blocking){ P.blocking = true; P.blockAt = performance.now() / 1000; } } P.dist = (P.dist || 0) + Math.abs(P.x - x0); acc -= h; }
  endFrame();
  if (P.hp > 0 && !FLIGHT && !GO.st && (TRAILT -= dt) <= 0){ TRAILT = 0.05; const [an, fr] = heroPose(P, time); TRAIL.push({ x: P.x, y: P.y, face: P.face, an, fr });
    if (TRAIL.length > 2400) TRAIL.splice(0, 1200, ...TRAIL.slice(0, 1200).filter((_, i) => i % 2)); }   // a long way: the far end of it kept more thinly
  if (!ENT.lead) stepEnemies(E, P, sdt, fx, evs); if (BOSS && BOSS.room && BOSS.active() && BOSS.st !== 'dead') keepOut(E, BOSS.room); stepArts(sdt); ITEMS.step(sdt, time, P, evs);   // while a keeper's hall shuts and he cannot move, nothing else moves either
  for (const e of E.list) if (e.alive && !e.d.harmless && !(G.seen = G.seen || {})[e.type] && Math.abs(e.x - P.x) < 9 && Math.abs(e.y - P.y) < 5){ G.seen[e.type] = 1; DIRTY = DIRTY > 0 ? DIRTY : 2; }   // met: entered in the Annals
  { const RD = REGION_DATA[LEVEL.index]; if (RD.tick) RD.tick(sdt, time, TICK); }   // the region's own weather and workings (its file)
  if (BOSS) BOSS.step(P, ENT.lead ? 0 : sdt, fx, evs);   // held, while its hall shuts and the ground begins to go
  ENT.step(sdt, P);
  for (const e of P.events) onEvent(e);
  // a passage: walked into, he goes through it
  PASS.cool = Math.max(0, PASS.cool - dt);
  if (!GO.st && PASS.cool <= 0 && P.hp > 0 && !FLIGHT) for (const m of LEVEL.marks) if (m.type === 'pass' && !m.shut){ const x0 = m.x * T, y0 = m.y * T, x1 = x0 + (m.w || 2) * T, y1 = y0 + (m.h || 2) * T, cy = P.y + 0.8;
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
  if (P.hp <= 0 && DEATH <= 0 && !FLIGHT && !DISS){ DEATH = 0.7; P.vx = 0; G.falls = (G.falls || 0) + 1; (G.fallsBy = G.fallsBy || {})[LEVEL.index] = (G.fallsBy[LEVEL.index] || 0) + 1; DISS = { t: 0, raised: false, drops: dissolve() }; BANNER = null; fx.burst({ x: P.x, y: P.y + 1.2 }, 18, 0xdff4ff); FEEL_FX.hitstop = 0.22; R.glint(P.x, P.y + 1, 0x9fe8ff, 1, 5, 0.5); sfx.hurt(); sfx.death(); buzz(1, 1, 450); }
  if (DEATH > 0) DEATH -= dt;
  if (UNDER){ const U = UNDER; U.t += dt; dropsStep(U.drops, dt, true); if (U.t >= 0.7 && !U.went){ U.went = true; dropsEnd(U.drops); U.drops = []; go(U.n, '@' + U.id); } if (U.went && !GO.st) UNDER = null; }
  if (DISS){
    const D = DISS; D.t += dt;
    dropsStep(D.drops, dt);   // into the ground
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
    const first = !TOUCHED.has(S); TOUCHED.add(S); found(S); if (G.lampNew){ G.lampNew = 0; banner('The lamp', 'Ordric left this lamp for you. It lights dark places and never runs out.', 7); } P.flask = P.flaskMax; P.hp = P.maxHp; SIDE.leaf = has('blankleaf'); SIDE.hour = has('lastpage'); SIDE.tally = has('tallysend'); if (first) sfx.shrine(); else sfx.drink(); store(); fx.ring({ x: P.x, y: S.y + 0.6 }, 0x9fe8ff); R.glint(P.x, S.y + 1, 0x9fe8ff, 0.8, 6, 0.8);
    if (first) (BANNER ? f => LATER.push({ t: 4, f }) : f => f())(() => banner(S.raise ? 'Checkpoint pool' : 'A spring', S.raise ? 'If you die, you come back here. Stand in it to heal and refill your flask.' : 'It heals you and refills your flask. It is not a checkpoint.', 4));   // after the place's own name, if that is up
  }

  if ((!BOSS || BOSS.st === 'dead') && !WON && R.exits.some(x => Math.abs(P.x - x.x) < 1 && Math.abs(P.y - x.y) < 1.5)){
    WON = true; sfx.gold();
    if (LEVEL.index < CLIMB_TOP) go(LEVEL.index + 1); else { G.done = true; store(); STORY.start('ending', { source: !!G.source }, title); }   // the beacon: the end of the climb
  }
  if (GO.st){
    GO.t += dt;
    if (GO.st === 'out' && GO.t > 0.6){ GO.st = 'load'; GO.t = 0; }                 // a frame fully dark before the work
    else if (GO.st === 'load' && GO.t > 0.05){ const up = GO.to === GO.from + 1 && GO.to <= CLIMB_TOP && !GO.join; enter(GO.to, GO.at); acc = 0; GO.t = 0;
      if (GO.join){ const Q = GO.join, J2 = LEVEL.joins[Q.side === 'up' ? 'down' : 'up']; if (J2){ P.x = Q.px + (J2.x - Q.j0.x) * T; P.y = Q.py + (J2.y - Q.j0.y) * T; CAM.x = P.x; CAM.y = P.y + 1.8; SCF.reset(P.x, P.y + 1.8); BANNER = null; NAMED = Q.side === 'down'; } GO.join = null; }   // through a sill, the slow way: where he was in it
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
  // up held, standing still: he looks up, and the view goes up with his eyes (decided 22 Nov 2026)
  LOOKT = IN.held.up && P.grounded && Math.abs(P.vx) < 0.6 && !P.atk && P.hp > 0 && !TALK.on ? LOOKT + dt : 0;
  let wantX = P.x + CAM.lead, wantY = P.y + 1.8 + (P.grounded ? 0 : Math.min(0, P.vy) * 0.08) + (LOOKT > 0.3 ? 3.4 : 0);
  if (FLIGHT){ wantX = FLIGHT.x; wantY = FLIGHT.y + 0.6; }   // the view goes back with him
  if (fight) wantY = Math.max(wantY, BOSS.stageY + 4.6);   // the stage near the bottom, the Warden's head near the top
  if (ENT.cam){ wantX = ENT.cam.x; wantY = ENT.cam.y; }   // the entrance: to the slab coming down, then to where it will rise
  CAM.x += (wantX - CAM.x) * Math.min(1, dt * (FLIGHT ? 16 : ENT.cam ? 2.6 : 5)); CAM.y += (wantY - CAM.y) * Math.min(1, dt * (FLIGHT ? 16 : P.grounded ? 4 : 6));
  const halfH = VIEW_H / 2 * CAM.zoom, halfW = halfH * (R.size().w / R.size().h);
  const box = fight && !FLIGHT ? BOSS.view || BOSS.room : { x0: 0, y0: 0, x1: LEVEL.W * T, y1: LEVEL.H * T };   // (a keeper's own view of its hall: the Wyrm's goes lower, so its bar is not over the pass)
  const keep = (c, a, b, h) => b - a < h * 2 ? (a + b) / 2 : Math.max(a + h, Math.min(b - h, c));   // a hall smaller than the view: kept in the middle of it
  const cx = keep(CAM.x, box.x0, box.x1, halfW), cy = keep(CAM.y, box.y0, box.y1, halfH);
  FEEL_FX.shake = Math.max(0, FEEL_FX.shake - dt * 1.2); const sk = FEEL_FX.shake * OPT.shake;
  FEEL_FX.kick *= Math.exp(-dt * 14);   // a blow nudges the view the way it goes
  R.setCamera(cx + (Math.random() - 0.5) * sk + FEEL_FX.kick, cy + (Math.random() - 0.5) * sk, CAM.zoom);
  // the warrior (not while he is dead and the scarf is on its way)
  const gone = (P.hp <= 0 && DEATH < 0.6 && !FLIGHT) || (DISS && !DISS.raised) || (UNDER && (!UNDER.went || GO.st === 'out' || GO.st === 'load')); if (hero.sprite) hero.sprite.g.visible = !gone;   // come apart, he is gone
  if (hero.sprite){
    const pose = heroPose(P, time), RW = FLIGHT && FLIGHT.s, anim = RW ? RW.an : pose[0], frac = RW ? RW.fr : pose[1], anchor = RW ? null : pose[2];   // running back: the drawing he had there
    let rot = 0;
    if (P.swim && CAN.glide && P.under) rot = -P.face * Math.min(1, Math.abs(P.vx) / 5) * 0.75;   // carried under the water: he lies along the way he is going
    if (P.under && !PAUSE && Math.random() < 0.06) fx.burst({ x: P.x + P.face * 0.2, y: P.y + 2.1 }, 1, 0xbfe8ff);
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
const TEACHER = makeTeach(G, OPT, store), kname = a => keyName(a, DEVICE.kind, SET), keyed = str => fill(str, a => '[' + kname(a) + ']').replace(/^./, c => c.toUpperCase());   // a key's name goes in brackets: the HUD draws it as a key (hud.js rich)
const CARDQ = [], card = c => { CARDQ.push({ t: 0, ...c, how: (c.how || []).map(keyed) }); };
// once each: a system's card, the first time it matters
const firstCard = id => { const T2 = (G.taught = G.taught || {}); if (T2['card_' + id]) return; T2['card_' + id] = 1; store(); card(CARDS[id]); };
// the embers are shown, and talked of, once he has something to spend them on
const embersKnown = () => CAN.breaker || CAN.dash || CAN.glide;
// a card: the picture in a frame, what kind of thing it is, its name; what it does, large; how, with his keys; whose it
// was, small and quiet; a last word (the knot). `modal`: over the game, darkened, waiting for a press; else on a page
// words set in a true italic, over the picture at the screen's own sharpness: flavour (docs/screens-sheet.md, rule 1:
// the pixel letters are five pixels tall and cannot slant and stay readable). x, y, w in the HUD's own pixels
const FLAV = document.createElement('div'); FLAV.style.cssText = 'position:absolute;display:none;pointer-events:none;z-index:6;font-style:italic;font-family:Georgia,"Times New Roman",serif;color:#b9a98a;text-align:center;line-height:1.25;text-shadow:0 1px 0 #181425'; (document.getElementById('stage') || document.body).appendChild(FLAV);
const flavour = (str, cx, y, w, W) => { if (!str){ FLAV.style.display = 'none'; return; } const st = FLAV.parentNode, k = st.clientHeight / 180; if (FLAV.textContent !== str) FLAV.textContent = str; FLAV.style.display = 'block'; FLAV.style.left = (cx - w / 2) / W * 100 + '%'; FLAV.style.width = w / W * 100 + '%'; FLAV.style.top = y * k + 'px'; FLAV.style.fontSize = Math.max(11, 7.2 * k) + 'px'; };
const wrapRich = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(/ (?![^\[]*\])/)){ const t = line ? line + ' ' + word : word; if (HUD.richW(t) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
// the slab every screen is cut from (build 83): the mountain's stone, his red ribbon tied across its head with the
// knot and its two tails, and on the ribbon what this is (and, to the right, where it is from)
function slab(x, y, ww, hh, head, from){ const px = HUD.px;
  // the slab: a shadow under it, stone at its edge (lit from above), chipped corners
  px('#0d0b12', x + 3, y + 4, ww, hh); px('#3a4466', x, y, ww, hh); px('#8b9bb4', x + 1, y, ww - 2, 1); px('#5a6988', x, y + 1, 1, hh - 2); px('#262b44', x + 1, y + hh - 1, ww - 2, 1); px('#181425', x + 2, y + 2, ww - 4, hh - 4);
  for (const [a, b] of [[0, 0], [ww - 1, 0], [0, hh - 1], [ww - 1, hh - 1]]) px('#0d0b12', x + a, y + b, 1, 1); px('#181425', x + 1, y + 1, 2, 1); px('#181425', x + ww - 4, y + hh - 2, 3, 1); px('#262b44', x + 2, y + 2, ww - 4, 1);
  // the ribbon: across the head, past both edges, its ends folded back; a knot near the left, its two tails hanging
  const ry = y + 6; px('#68386c', x - 5, ry + 2, 5, 9); px('#68386c', x + ww, ry + 2, 5, 9); px('#181425', x - 5, ry + 11, 5, 1); px('#181425', x + ww, ry + 11, 5, 1);
  px('#181425', x - 2, ry - 1, ww + 4, 13); px('#a22633', x - 1, ry, ww + 2, 11); px('#e43b44', x - 1, ry, ww + 2, 2); px('#f6757a', x - 1, ry, ww + 2, 1); px('#733e39', x - 1, ry + 9, ww + 2, 2);
  { const kx = x + 12; px('#181425', kx + 1, ry + 11, 4, 12); px('#a22633', kx + 2, ry + 11, 2, 11); px('#181425', kx + 6, ry + 11, 4, 8); px('#a22633', kx + 7, ry + 11, 2, 7); px('#e43b44', kx + 2, ry + 11, 1, 10); px('#e43b44', kx + 7, ry + 11, 1, 6);
    px('#181425', kx - 1, ry - 2, 13, 15); px('#be4a2f', kx, ry - 1, 11, 13); px('#e43b44', kx + 1, ry - 1, 9, 3); px('#f6757a', kx + 2, ry, 5, 1); px('#733e39', kx, ry + 9, 11, 3); px('#181425', kx + 5, ry + 3, 1, 5); }
  HUD.fine(String(head || '').toUpperCase(), x + 30, ry + 3, '#fff2d0', 'left', 0); if (from) HUD.fine(String(from).toUpperCase(), x + ww - 8, ry + 3, '#f6c9a8', 'right', 0);
}
// the window: one frame for everything gained (docs/screens-sheet.md, rule 3), in the game's own things. A slab of the
// mountain's stone; his red ribbon tied across its head, saying what kind of thing this is; the thing's picture in a
// niche; its name; what it does; how, each line with its key; a line of flavour; and the key that closes it
function drawWindow(c, W, at = null){   // at: { x, y, w } sets it in a pane of a screen, not over play (no dark behind it, no key to close it)
  if (!at) HUD.dark(0.72); const px = HUD.px, ww = at ? at.w : 236, x = at ? at.x : Math.round(W / 2) - ww / 2, cx = x + ww / 2, tw = ww - 62;
  const title = c.title.toUpperCase(), big = textWidth(title, 2) <= tw ? 2 : 1, does = wrapText(c.does, tw), hows = (c.how || []).flatMap(h => wrapRich(h.toUpperCase(), ww - 24)), lore = c.lore ? 2 : 0;
  const headH = Math.max(40, 7 * big + 6 + does.length * 9), hh = 20 + headH + 8 + hows.length * 12 + (hows.length ? 4 : 0) + (lore ? 22 : 0) + (c.foot ? 10 : 0) + (at ? 6 : 16), y = at ? at.y : Math.max(2, Math.round((180 - hh) / 2));
  slab(x, y, ww, hh, c.head || 'YOU GOT', c.from);
  // its picture, in a niche cut in the stone; its name and what it does beside it
  let yy = y + 24; if (c.icon){ px('#0d0b12', x + 10, yy, 40, 40); px('#5a6988', x + 11, yy + 1, 38, 38); px('#ead4aa', x + 12, yy + 1, 36, 1); px('#262b44', x + 12, yy + 2, 36, 36); px('#181425', x + 12, yy + 2, 36, 2); drawIcon(px, c.icon, x + 14, yy + 5, 2); }
  const tx = c.icon ? x + 58 : x + 12; HUD.text(title, tx, yy + 1, '#fee761', big, 'left'); let ty = yy + 7 * big + 6; for (const ln of does){ HUD.text(ln, tx, ty, '#fff2d0', 1, 'left'); ty += 9; }
  yy += headH + 2; if (hows.length){ px('#3a4466', x + 10, yy, ww - 20, 1); yy += 6; for (const ln of hows){ HUD.rich(ln, x + 12, yy, '#c0cbdc'); yy += 12; } }
  if (lore){ yy += 2; flavour(c.lore, cx, yy, ww - 28, W); yy += 20; } else flavour('');
  if (c.foot){ HUD.fine(c.foot.toUpperCase(), x + 12, yy, '#8b9bb4', 'left', 0); yy += 10; }
  if (!at && c.t > 0.7){ const key = DEVICE.kind === 'touch' ? null : kname('jump'), lw = textWidth('OK', 1, true), kw = key ? HUD.capW(key) + 3 : 0; if (key) HUD.cap(x + ww - 12 - lw - kw, y + hh - 14, key); HUD.fine(key ? 'OK' : 'TAP', x + ww - 12 - (key ? lw : textWidth('TAP', 1, true)), y + hh - 12, Math.floor(time * 2) % 2 ? '#fff2d0' : '#8b9bb4', 'left', 0); }
}
function drawCard(c, W, modal, top = 8){
  if (modal) return drawWindow(c, W);
  const cx = Math.round(W / 2); let y = top;
  if (c.icon){ HUD.px('#181425', cx - 19, y, 38, 38); HUD.px('#ead4aa', cx - 18, y + 1, 36, 36); HUD.px('#262b44', cx - 17, y + 2, 34, 34); drawIcon(HUD.px, c.icon, cx - 16, y + 3, 2); y += 42; }
  if (c.head){ HUD.fine(c.head, cx, y, '#8b9bb4', 'center'); y += 8; }
  const big = textWidth(c.title.toUpperCase(), 2) <= W - 24 ? 2 : 1; HUD.text(c.title.toUpperCase(), cx, y, '#fee761', big, 'center'); y += 7 * big + 5; HUD.rule(cx, y, 60, '#ead4aa'); y += 6;
  for (const ln of wrapText(c.does, W - 40)){ HUD.text(ln, cx, y, '#fff2d0', 1, 'center'); y += 10; }
  y += 2; for (const h of c.how || []){ y += 3; for (const ln of wrapRich(h.toUpperCase(), W - 24)){ HUD.rich(ln, cx, y, '#2ce8f5', 'center'); y += 11; } }   // (the small print: with square pixels the larger letters are wider, and a card has to fit over its buttons)
  if ((c.how || []).length) y += 2;
  if (c.lore){ y += 3; for (const ln of wrapText(c.lore.toUpperCase(), W - 30)){ HUD.fine(ln, cx, y, '#8b9bb4', 'center'); y += 7; } }
  if (c.foot){ y += 3; HUD.fine(c.foot.toUpperCase(), cx, y, '#c0cbdc', 'center'); y += 8; }
  if (modal && c.t > 0.7 && Math.floor(time * 2) % 2) HUD.text('PRESS TO CONTINUE', cx, Math.min(170, Math.max(150, y + 6)), '#8b9bb4', 1, 'center');
}
// ---- what he carries (from the pause): his gifts, weapons and relics, each a button; the one picked shows its card
let CARRY = [];
const carryCards = () => [
  ...[...Object.values(ABILITY), ...TEACH].filter(t => t.can && t.can !== 'breaker' && CAN[t.can]).map(t => ({ head: 'AN ABILITY', title: t.name, icon: t.icon, does: t.does, how: [...t.how, ...(t.more || [])] })),
  { head: 'A WEAPON' + (P.weapon === 'blade' ? ' · IN USE' : ''), title: 'The sword', icon: 'blade', does: 'Fast three-hit combos. You can block with it. It cannot break stone.', how: ['{attack}: attack. {block}: block.'] },
  ...(G.arms || []).map(id => TEACH.find(t => t.arm === id)).filter(Boolean).map(t => ({ head: 'A WEAPON' + (P.weapon === t.arm ? ' · IN USE' : ''), title: t.name, icon: t.icon, does: t.does, how: [...t.how, ...(t.more || [])] })),
  ...G.relics.filter(id => RELICS[id]).map(id => ({ head: has(id) ? 'A RELIC · EQUIPPED' : 'A RELIC · NOT EQUIPPED', title: RELICS[id].name, icon: id, does: RELICS[id].line, lore: RELICS[id].lore })),
].map(c => ({ ...c, how: (c.how || []).map(keyed) }));
// (build 83, docs/screens-sheet.md: his things as pictures in a grid on the left, under three headings; the one
// chosen in the window on the right; the knots of his ribbon along the foot. It was a row of names under a card)
function carryScreen(){
  SCREEN = 'carry'; PAUSE = true; release(); const keep = MSEL; CARRY = carryCards();
  const col = document.createElement('div'); col.style.cssText = 'display:flex;flex-direction:column;gap:3px;width:100%';
  let n = 0; for (const [label, test] of [['Abilities', c => /ABILITY/.test(c.head)], ['Weapons', c => /WEAPON/.test(c.head)], ['Relics', c => /RELIC/.test(c.head)]]){
    const items = CARRY.map((c, i) => [c, i]).filter(([c]) => test(c)); const lab = menuLabel(label); lab.style.cssText += ';font-size:11px;color:#feae34;margin:3px 0 0'; col.appendChild(lab);
    const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:4px'; col.appendChild(grid);
    if (!items.length){ const none = menuLabel('none yet'); none.style.cssText += ';font-size:10px;color:#5a6988;grid-column:1 / -1;margin:0'; grid.appendChild(none); }
    for (const [c, i] of items){ const b = menuButton('', () => { MSEL = b.k; menuMark(); sfx.ui(); }, true); b.k = n++; b.setAttribute('aria-label', c.title); b.title = c.title; b.style.padding = '2px'; b.style.minWidth = '0'; b.style.lineHeight = '0'; b.dataset.card = i;
      const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d'); drawIcon((cl, x, y, w, h) => { g.fillStyle = cl; g.fillRect(x, y, w, h); }, c.icon, 0, 0, 1); cv.style.cssText = 'width:100%;image-rendering:pixelated;display:block;opacity:' + (/NOT EQUIPPED/.test(c.head) ? '0.55' : '1'); b.appendChild(cv);
      b.addEventListener('pointerenter', () => { if (MSEL !== b.k){ MSEL = b.k; menuMark(); } }); grid.appendChild(b); } }
  const back = menuButton('Back', () => pause(true), true); back.style.marginTop = '6px'; back.style.alignSelf = 'flex-start';
  menuShow([col, back], true, () => pause(true)); MENU.style.top = '19%'; MENU.style.paddingLeft = '4.5%'; MENU.style.width = '33%'; MENU.style.right = 'auto'; MSEL = Math.min(keep, Math.max(0, n - 1)); menuMark();
}
function drawCarry(W){
  HUD.dark(0.9, '#181425'); const lw = Math.round(W * 0.38); slab(6, 5, lw, 156, 'What you carry');
  const items = menuItems(), b = items[MSEL], c = b && b.dataset.card != null ? CARRY[+b.dataset.card] : null;
  if (c) drawWindow(c, W, { x: lw + 12, y: 5, w: W - lw - 18 }); else flavour('');
  // the knots of his ribbon: one for each relic slot, tied where a relic is equipped
  if (G.relics.length){ const n = knots(), worn = G.worn.filter(id => RELICS[id]).length, x0 = lw + 16, y = 150; HUD.fine(`${worn} OF ${n} RELIC SLOTS USED`, x0 + n * 16 + 4, y, '#c0cbdc', 'left', 0); HUD.fine('CHOOSE AT A POOL', x0 + n * 16 + 4, y + 8, '#8b9bb4', 'left', 0); for (let k = 0; k < n; k++){ if (k < worn) drawIcon(HUD.px, 'knot', x0 + k * 16, y - 3, 1); else { HUD.px('#a22633', x0 + k * 16, y + 4, 14, 2); HUD.px('#3a4466', x0 + k * 16 + 5, y + 2, 4, 6); } } }
}
// ---- a keeper's gift (decision 0.5): the thing gathers out of the fallen keeper, light drawn in to it; it hangs a
// moment, then comes down to him; he reaches up and takes it to his chest (his `receive` drawing; he is held while he
// does); then its card. GIFT: { t, st: gather | hang | come | take, x, y, m (its picture), teach }
let GIFT = null, RECEIVE = 0; const RECEIVE_T = 1.3;
function giftStart(t, from = null){   // from: out of a chest (a wing's prize), not out of a keeper
  const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d'); drawIcon((col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); }, t.icon, 0, 0, 1);
  const tex = new THREE.CanvasTexture(c); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  const x = from ? from.x : BOSS ? BOSS.cx : P.x, y = from ? from.y + 2.4 : (BOSS ? BOSS.stageY : P.y) + 3.2; m.position.set(x, y, 0.07); m.renderOrder = 50; R.scene.add(m);
  GIFT = { t: 0, st: 'gather', x, y, y0: y, m, teach: t }; sfx.relic && sfx.relic();
}
// he has left before it reached him (a way on, the title): it is his all the same, and its card comes
function giftEnd(){ if (GIFTING){ GIFTING = false; learn(); } RECEIVE = 0; if (!GIFT) return; const t = GIFT.teach; R.scene.remove(GIFT.m); GIFT.m.material.map.dispose(); GIFT.m.material.dispose(); GIFT.m.geometry.dispose(); GIFT = null;
  if (t.arm){ if (!armed(t.arm)) (G.arms = G.arms || []).push(t.arm); P.weapon = G.wield = t.arm; swapButton(); } store(); card({ head: t.can ? 'NEW ABILITY' : 'YOU GOT', title: t.name, icon: t.icon, does: t.does, how: t.how }); if (t.can) firstCard('embers'); }
function giftStep(dt){
  const Gf = GIFT; if (!Gf) return; Gf.t += dt; const at = { x: Gf.x, y: Gf.y };
  if (Gf.st === 'gather'){ const u = Math.min(1, Gf.t / 1.5); Gf.m.material.opacity = u; Gf.m.scale.setScalar(0.4 + 0.9 * u);
    if (Math.random() < dt * 40){ const a = Math.random() * Math.PI * 2, r = 3.2 * (1 - u) + 0.5; fx.burst({ x: Gf.x + Math.cos(a) * r, y: Gf.y + Math.sin(a) * r }, 1, Math.random() < 0.5 ? 0xfee761 : 0xfff2d0); }
    if (u >= 1){ Gf.st = 'hang'; Gf.t = 0; fx.ring(at, 0xfee761); R.glint(Gf.x, Gf.y, 0xfee761, 1.2, 6, 0.5); sfx.chest(); } }
  else if (Gf.st === 'hang'){ Gf.y = Gf.y0 + Math.sin(Gf.t * 4) * 0.12; Gf.m.scale.setScalar(1.3); if (Gf.t > 0.9){ Gf.st = 'come'; Gf.t = 0; } }
  else if (Gf.st === 'come'){ const tx = P.x, ty = P.y + 3.1, dx = tx - Gf.x, dy = ty - Gf.y, d = Math.hypot(dx, dy), sp = Math.min(d, (5 + Gf.t * 9) * dt);
    if (d > 0.001){ Gf.x += dx / d * sp; Gf.y += dy / d * sp; } if (Math.random() < dt * 24) fx.burst(at, 1, 0xfee761);
    if (d < 0.25 && P.grounded && P.hp > 0 && !P.atk && P.roll <= 0){ Gf.st = 'take'; Gf.t = 0; RECEIVE = RECEIVE_T; P.vx = 0; release(); sfx.thread(); } }
  else if (Gf.st === 'take'){ const u = Math.min(1, Gf.t / RECEIVE_T);   // into his hands over his head, then down to his chest, and in
    Gf.x = P.x + P.face * 0.1; Gf.y = P.y + (u < 0.35 ? 3.1 - u / 0.35 * 0.45 : 2.65 - (u - 0.35) / 0.65 * 1.0); Gf.m.scale.setScalar(1.3 - 0.5 * u); Gf.m.material.opacity = u < 0.7 ? 1 : Math.max(0, 1 - (u - 0.7) / 0.3);
    if (u >= 1){ const t = Gf.teach; R.scene.remove(Gf.m); Gf.m.material.map.dispose(); Gf.m.material.dispose(); Gf.m.geometry.dispose(); GIFT = null;
      fx.ring({ x: P.x, y: P.y + 1.5 }, 0xfee761); fx.burst({ x: P.x, y: P.y + 1.5 }, 24, 0xfee761); R.glint(P.x, P.y + 1.5, 0xfee761, 1.3, 7, 0.6); sfx.ability();
      GIFTING = false; learn(); if (t.arm){ if (!armed(t.arm)) (G.arms = G.arms || []).push(t.arm); P.weapon = G.wield = t.arm; swapButton(); store(); }   // a weapon: in his hand at once (the hammer, for the wall in front of him)
      card({ head: t.can ? 'NEW ABILITY' : 'YOU GOT', title: t.name, icon: t.icon, does: t.does, how: t.how }); if (t.can) firstCard('embers'); } }
  if (GIFT){ Gf.m.position.x = Gf.x; Gf.m.position.y = Gf.y; if (Math.floor(Gf.t * 10) !== Math.floor((Gf.t - dt) * 10)) R.glint(Gf.x, Gf.y, 0xfee761, 0.5, 3, 0.15); }
}
// ---- the tooth (build 91). Two of its moves strike as they go, not at one moment:
//   the dive   what is under the spear's point, a creature or spikes, and he is thrown back up off it (motor.js pogo)
//   the charge everything it passes through, once each
function toothStep(){
  if (!P || !E || P.weapon !== 'tooth' || P.hp <= 0) return;
  if (P.dive && !P.dive.art){
    const out = [], seen = new Set(); hitBox(E, P.x - 0.75, P.x + 0.75, P.y - 2.0, P.y + 0.4, POGO.dmg + (G.edge ? 1 : 0), out, seen, P.x);
    let spikes = false; for (const dy of [0.3, 0.8, 1.3]) for (const dx of [-0.3, 0.3]) if (tileAt(Math.floor((P.x + dx) / T), Math.floor((P.y - dy) / T)) === SPIKES) spikes = true;
    const boss = BOSS && BOSS.slam && BOSS.active && BOSS.active() ? BOSS.slam({ ...P, y: P.y - 1.2 }, 0.9, POGO.dmg, out) : false;   // a keeper under him: as a plunge lands on it
    if (seen.size || spikes || boss){ pogo(P); for (const o of out) onEvent(o); }
  }
  const A = P.atk, sw = A && swingOf(P, A);
  if (A && sw && sw.pierce && A.phase === 'active'){ A.seen = A.seen || new Set(); const out = [], x0 = Math.min(P.x, P.x + P.face * (weaponOf(P).reach)), x1 = Math.max(P.x, P.x + P.face * weaponOf(P).reach);
    hitBox(E, x0, x1, P.y + 0.5, P.y + 2.1, sw.dmg + (has('whetstone') ? 1 : 0), out, A.seen, P.x - P.face); for (const o of out) onEvent(o); }
}
// ---- the bow's arrows (build 93): a streak of lightning, the width of a room. Each strikes the first thing it meets
// (the third shot, all it passes through), breaks an urn, finds a keeper's parts; it stops at rock. They cost nothing
const ARROWS = []; let ARROW_TEX = null;
function arrowMesh(){
  if (!ARROW_TEX){ const c = document.createElement('canvas'); c.width = 16; c.height = 3; const g = c.getContext('2d'); g.fillStyle = '#0099db'; g.fillRect(0, 1, 13, 1); g.fillStyle = '#2ce8f5'; g.fillRect(3, 0, 10, 3); g.fillStyle = '#ffffff'; g.fillRect(11, 0, 5, 3); g.fillRect(6, 1, 10, 1);
    ARROW_TEX = new THREE.CanvasTexture(c); ARROW_TEX.magFilter = ARROW_TEX.minFilter = THREE.NearestFilter; ARROW_TEX.generateMipmaps = false; }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshBasicMaterial({ map: ARROW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.renderOrder = 40; R.scene.add(m); return m;
}
function loose(sw){
  const down = sw === BOW.down, up = !down && (sw === BOW.rise || !!(P.atk && P.atk.up)), dir = P.face || 1, sp = BOW.speed;
  const a = { x: P.x + (up || down ? dir * 0.25 : dir * 0.9), y: P.y + (up ? 2.7 : down ? -0.1 : P.crouch ? 0.5 : 1.05),   // (level: low enough to find a crawler, 0.8 tall; crouched, lower still)
    vx: up || down ? 0 : dir * sp, vy: up ? sp : down ? -sp : 0, dmg: sw.dmg + (has('whetstone') && sw.pierce ? 1 : 0) + (G.edge >= 2 ? 1 : 0), pierce: !!sw.pierce, seen: new Set(), left: BOW.range, m: arrowMesh() };
  a.m.rotation.z = up ? Math.PI / 2 : down ? -Math.PI / 2 : dir > 0 ? 0 : Math.PI; ARROWS.push(a);
  sfx.swing(!!sw.pierce); sfx.crackle && sfx.crackle(); fx.ring({ x: a.x, y: a.y }, 0x2ce8f5); R.glint(a.x, a.y, 0xdff4ff, sw.pierce ? 1.1 : 0.7, 4.5, 0.2); if (sw.pierce){ FLASH = Math.max(FLASH, 0.12); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); }
  if (down) P.vy = Math.max(P.vy, 5);   // the shot's kick holds him up a moment
}
function arrowsStep(dt){
  for (let i = ARROWS.length - 1; i >= 0; i--){
    const a = ARROWS[i], st = Math.abs(a.vx || a.vy) * dt, n = Math.max(1, Math.ceil(st / 0.3)); let done = false;
    for (let k = 0; k < n && !done; k++){
      a.x += a.vx * dt / n; a.y += a.vy * dt / n; a.left -= st / n;
      const out = [], vert = !a.vx, before = a.seen.size;
      hitBox(E, a.x - (vert ? 0.35 : 0.5), a.x + (vert ? 0.35 : 0.5), a.y - (vert ? 0.6 : 0.5), a.y + (vert ? 0.6 : 0.5), a.dmg, out, a.seen, a.x - Math.sign(a.vx || 0));
      const dir = Math.sign(a.vx) || P.face || 1, from = { x: a.x - dir * 0.4, y: a.y - 1.3, face: dir, grounded: true };
      if (!vert && BOSS && BOSS.strike && !a.boss){ const o2 = []; BOSS.strike(from, 0.8, a.dmg, o2); if (o2.length){ a.boss = true; out.push(...o2); } }
      if (!vert) ITEMS.strike(from, 0.8, out);
      for (const o of out) onEvent(o);
      if (a.seen.size > before || a.boss){ fx.burst({ x: a.x, y: a.y }, 8, 0x2ce8f5); if (!a.pierce) done = true; }
      if (solidAt(a.x + (a.vx ? Math.sign(a.vx) * 0.6 : 0), a.y + (a.vy ? Math.sign(a.vy) * 0.6 : 0))){ fx.burst({ x: a.x, y: a.y }, 6, 0xdff4ff); fx.dust({ x: a.x, y: a.y }, 4, 1.5); done = true; }
      if (a.left <= 0) done = true;
    }
    if (done){ R.scene.remove(a.m); a.m.geometry.dispose(); a.m.material.dispose(); ARROWS.splice(i, 1); }
    else a.m.position.set(a.x, a.y, 0.08);
  }
}
const onPlank = P => { const j = Math.floor((P.y - 0.02) / T); for (const x of [P.x - BODY.hw + 0.01, P.x + BODY.hw - 0.01]) if (tileAt(Math.floor(x / T), j) === LEDGE) return true; return false; };
// ---- the ember arts. Which: down = the slam (the Warden's weight), in the air = the gust (the Wyrm's wind), else the
// cleave (the Toll's step); each needs its gift and a measure of embers. Their blows are hitBox's (enemies.js): once a
// creature, and they give no embers back
const ART_GIFT = { slam: 'breaker', cleave: 'dash', gust: 'glide' }, WAVES = [];
function art(e){
  const kind = e.down ? 'slam' : e.air ? 'gust' : 'cleave';
  if (!CAN[ART_GIFT[kind]]){ sfx.block(); if (!HINTED.artGift){ HINTED.artGift = 1; banner('', 'You do not have that power yet.', 2.4); } return; }
  if (kind === 'slam' && P.swim){ sfx.block(); return; }   // no slam in deep water: it would spend the embers on nothing
  if (EMBER.n < ARTS.cost){ sfx.block(); fx.burst({ x: P.x, y: P.y + 1.3 }, 4, 0x5a6988); if (!HINTED.artCost){ HINTED.artCost = 1; banner('', 'You need 10 embers for that.', 2.4); } return; }
  EMBER.n -= ARTS.cost; const how = startArt(P, kind), at = { x: P.x, y: P.y + 1.2 };
  fx.ember(at, 0); R.glint(at.x, at.y, 0xff8060, 1.1, 6, 0.4); buzz(0.5, 0.4, 160);
  if (how === 'slam'){ sfx.slam(); sfx.impact(true); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.4); fx.puff({ x: P.x, y: P.y }, 26, 4); fx.ring({ x: P.x, y: P.y + 0.2 }, 0xffd27a); R.shock(P.x, P.y + 0.3, true); waves(P.x, P.y); }
  else if (how === 'dive') sfx.whoosh();
  else if (how === 'cleave'){ sfx.dash(); sfx.swing(true); P.art.seen = new Set(); FEEL_FX.kick = P.face * 0.3; }
  else if (how === 'gust'){ sfx.whoosh(); sfx.gust(); const out = []; hitBox(E, P.x - 2.6, P.x + 2.6, P.y - 0.6, P.y + 3.2, 2, out, new Set(), P.x, 1.2); if (BOSS) BOSS.slam(P, 2.4, 1, out); for (const o of out){ o.art = true; onEvent(o); }
    fx.ring({ x: P.x, y: P.y + 1 }, 0xc0f4ff); fx.burst({ x: P.x, y: P.y + 1 }, 24, 0xc0cbdc); R.shock(P.x, P.y + 1, false); }
}
// the slam's blow, run out along the floor both ways: it strikes what it reaches, breaks cracked stone, stops at a wall
function waves(x, y, dirs = [-1, 1], life = 0.8){ const dig = !!weaponOf(P).digs; for (const dir of dirs) WAVES.push({ x: x + dir * 0.6, y, dir, t: 0, life, dig, seen: new Set(), boss: false }); }
function stepArts(dt){
  const out = [];
  if (P.art && P.art.k === 'cleave'){ const a = P.art;   // all that he rushes through
    hitBox(E, Math.min(a.from, P.x) - 0.7, Math.max(a.from, P.x) + 0.7, P.y - 0.3, P.y + 2.6, 2, out, a.seen, P.x - a.dir * 2);
    if (BOSS && !a.boss && BOSS.strike(P, 1.6, 2, out)) a.boss = true;
    fx.streak({ x: P.x, y: P.y }, a.dir); if (Math.random() < 0.6) fx.burst({ x: P.x, y: P.y + 1.2 }, 2, 0xfee761); }
  if (P.art && P.art.k === 'gust'){ fx.burst({ x: P.x + Math.cos(P.art.t * 30) * 1.2, y: P.y + 1 + Math.sin(P.art.t * 30) * 0.6 }, 2, 0xc0f4ff); }
  for (let i = WAVES.length - 1; i >= 0; i--){ const w = WAVES[i]; w.t += dt; w.x += w.dir * 14 * dt;
    if (w.t > w.life || solidAt(w.x + w.dir * 0.3, w.y + 0.4) || !solidAt(w.x, w.y - 0.3)){ breakRock(w.x + w.dir * 0.4, w.y + 0.2, 0.9, w.dig); fx.dust({ x: w.x, y: w.y }, 8, 2.5); WAVES.splice(i, 1); continue; }   // a wall (cracked stone breaks), or the floor ends
    hitBox(E, w.x - 0.7, w.x + 0.7, w.y - 0.3, w.y + 1.8, 2, out, w.seen, w.x - w.dir);
    if (BOSS && !w.boss && BOSS.slam({ x: w.x, y: w.y, face: w.dir }, 0.7, 1, out)) w.boss = true;
    breakRock(w.x, w.y + 0.2, 0.9, w.dig);
    fx.kick({ x: w.x, y: w.y }, w.dir, 3, 3); R.glint(w.x, w.y + 0.4, 0xffd27a, 0.5, 3); }
  for (const o of out){ o.art = true; onEvent(o); }
}
function breakRock(x, y, r, dig = false){
  if (!PROPS.nearCrack(x, y, Math.max(r, 1.3))) return;
  // only the spade breaks stone (decision 0.3): the blade rings off it, and he is told what it wants
  if (!dig){ if (!HINTED.crack){ HINTED.crack = 1; sfx.block(); banner('', armed('spade') ? 'Cracked stone. Hit it with the hammer.' : 'Cracked stone. You cannot break it yet: come back with a heavier weapon.', 3); } return; }
  if (!PROPS.nearCrack(x, y, r)) return;
  for (const C of PROPS.breakAt(x, y, r)){
    sfx.break(); fx.dust({ x: C.x, y: C.y - C.h / 2 }, 30, 5); fx.burst({ x: C.x, y: C.y }, 26, 0xc0cbdc); R.shock(C.x, C.y, true); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.4);
    (G.broke[LEVEL.index] = G.broke[LEVEL.index] || []).push(C.id); store();
  }
}
// someone is spoken to: all they have to say here the first time, the last of it after; the Scribe counts what is unfound,
// the Lamplighter trades when he has spoken
function talkTo(N){
  if (N.summit){   // (build 126) at the summit, after the Fallen: their last words, said in full once, then the last again; no shop, no tally
    const k = 'summit:' + N.who, n = G.met[k] || 0, S0 = SUMMIT[N.who](!!G.source); G.met[k] = n + 1; store(); release(); sfx.ui(); TALK.start(N.who, n === 0 ? S0.slice() : [S0[S0.length - 1]], null, N.art); return; }
  const climbing = N.who === 'hob' && G.thrown && !G.out && HOB_UP[LEVEL.index];   // (build 122) Hob, met by one climbing out of the Deep: his lines for that
  const k = LEVEL.index + ':' + N.who, n = G.met[k] || 0, S0 = climbing || (SCRIPT[N.who] || [])[LEVEL.index] || ['...'], lines = n === 0 ? S0.slice() : [S0[S0.length - 1]];
  // a story beat he walked past (phase 8): the first time they speak here, they say what he missed of the last one
  if (n === 0 && (MEETINGS[LEVEL.index] || {})[N.who] === 'story') for (let q = LEVEL.index - 1; q >= 0; q--) if ((MEETINGS[q] || {})[N.who] === 'story'){
    const was = (SCRIPT[N.who] || [])[q]; if (!G.met[q + ':' + N.who] && was && was[0] !== INTRO[N.who]){ lines.unshift(was[0]); G.met[q + ':' + N.who] = 1; } break; }
  if (INTRO[N.who] && !Object.keys(G.met).some(m => m.endsWith(':' + N.who)) && !lines.includes(INTRO[N.who])) lines.unshift(INTRO[N.who]);   // the first meeting anywhere: who they are (teach.js)
  if (N.who === 'scribe'){ const L = ITEMS.left(), pl = (c, w) => `${c} ${w}${c === 1 ? '' : 's'}`; lines.push(L.threads + L.chests === 0 ? 'You have found everything in this region.' : `Still to find in this region: ${pl(L.threads, 'red strand')}, ${pl(L.chests, 'chest')}${L.relic ? ', and a relic behind a way that is still blocked' : ''}.`);
    if (G.lectern && !G.lecternSaid){ G.lecternSaid = 1; lines.push('You found the book they copy. Its first page is blank. No one has dared to write on it.'); } }
  if (N.who === 'lamplighter' && LEVEL.index === 3 && !CAN.glide) lines.splice(Math.max(0, lines.length - 1), 0, 'The air up here would carry a man who could spread himself on it. You cannot yet.', 'One who sat down in the ice of the Spires kept such a wind. East of the horn, past thin ice.');   // (build 91: the glide is the Seated's)
  if (N.who === 'lamplighter' && LEVEL.index === 2 && !CAN.dash) lines.splice(Math.max(0, lines.length - 1), 0, 'Ice has grown across the way above. Weight will not break it.', 'The founders, east of the bell tower below, cast a thing that could. They threw it down in their pit.');   // (build 87: the way to the Spires wants the Cracked Bell's gift. A hint of where, not of how: decision 0.18)
  if (N.who === 'wren' && LEVEL.index === 2 && G.lit && (G.lit[2] || []).length && !G.satSaid){ G.satSaid = 1; lines.push('I sat down in the galleries once, to rest. I got up. I do not know yet which was harder.'); }
  if (N.who === 'wren' && G.still && G.still[1] && !G.stillSaid){ G.stillSaid = 1; lines.push('The cracked bell has stopped. I kept my count by it. Now I keep it myself.'); }
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
const POOL_LINES = ['The water brings you back.', 'Again.', 'You did not earn this.', 'What falls here does not stay fallen.', 'The light has not let go of you.', 'Get up. You are expected.', 'It costs you nothing. That is the hard part.'];
let RISEN = null;   // the word over him as he comes up: { t, line, n }
function raise(){
  const s = RAISE ? { x: RAISE.x, y: RAISE.y } : spawnPoint(), keep = EMBER.n, n = G.falls || 1;
  P = born(s.x, s.y); refill(); if (BOSS) BOSS.reset(); ENT.reset(); EMBER.n = keep; SIDE.leaf = has('blankleaf'); SIDE.hour = has('lastpage'); SIDE.tally = has('tallysend'); SCF.reset(s.x, s.y + 1.8); TRAIL.length = 0; CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0; FX2.ghosts.forEach(G2 => { G2.life = 0; }); store();
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
// a creature's own voice, quieter the further off it is
// the Bell-Foundry: how long iron rings (a touch, a blow on the Bell); the Founder's Felt (how far a parry's ring stills, how long)
const RING = [3.6, 4.6], FELT = { r: 7, t: 1.1 }, SURGE = 0.6;
// a wing's keeper has no hall of its own: its name and strength show once it has been struck, while he is near it
const miniHud = () => { if (!E || !P) return null; const e = E.list.find(q => q.d.name && q.alive && q.woke && Math.hypot(q.x - P.x, q.y - P.y) < 34); return e ? { name: e.d.name, frac: Math.max(0, e.hp / e.d.hp), phase: e.two ? 2 : 1 } : null; };
const cry = (c, what) => { if (!c) return; const d = Math.hypot(c.x - P.x, c.y - P.y); beast(c.type, what, Math.max(0, 1 - d / 22)); };
function onEvent(e){
  const at = { x: P.x, y: P.y }; TEACHER.event(e, TCTX);
  switch (e.type){
    case 'jump': sfx.jump(); fx.puff(at, 8, 1.6); break;
    case 'doubleJump': sfx.jump(); fx.ring(at, 0x9ff0ff); FX2.flipped = true; break;
    // deep water: into it (the harder he came, the more of it), out of it
    case 'splash': sfx.splash(); fx.ring({ x: P.x, y: P.y + P.depth }, 0xcfe6ff); fx.burst({ x: P.x, y: P.y + P.depth }, Math.min(26, 8 + Math.round((e.v || 0) * 1.2)), 0xbfe8ff); break;
    case 'cling': sfx.step(); fx.puff({ x: P.x + P.face * 0.3, y: P.y + 1.2 }, 5, 1.2); if (!G.gripTold){ G.gripTold = 1; store(); } break;
    case 'turned': sfx.parry(); fx.ring({ x: P.x, y: P.y + 1.2 }, 0xead4aa); banner('', 'The Tally\'s End blocked the Echo.', 2.6); break;
    case 'surface': sfx.splash(); fx.burst({ x: P.x, y: P.y + 1.4 }, 10, 0xdff4ff); break;
    case 'land': sfx.step(); fx.puff(at, e.hard ? 20 : 8, e.hard ? 3.2 : 2); if (e.hard) FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); if (e.hard || (e.drop || 0) > 0.8 || FX2.flipped){ landT = LAND_T; } FX2.flipped = false; break;
    case 'slam': { if (e.art) waves(P.x, P.y); PLUNGE_T = PLUNGE_LAND; landT = 0; sfx.slam(); fx.puff(at, 24, 3.6); R.shock(P.x, P.y + 0.3, true); fx.ring(at, 0xffd27a);
      buzz(0.55, 0.45, 150); const storm = has('stormglass'), spade = P.weapon === 'spade', rad = MV.dive.radius * (storm ? 1.5 : 1) * (spade ? 0.8 : P.weapon === 'tooth' ? 0.5 : P.weapon === 'clapper' ? 1.5 : P.weapon === 'thorns' ? 0.7 : 1), dmg = MV.dive.dmg + (storm ? 1 : 0) + (G.edge && !spade ? 1 : 0), out = [];   // the spade's plunge: narrower, and it breaks what is under him
      if (storm){ sfx.thunder(); R.glint(P.x, P.y + 1, 0xcfe6ff, 1.4, 8, 0.25); FLASH = Math.max(FLASH, 0.1); for (let k = 0; k < 14; k++) fx.burst({ x: P.x + (Math.random() - 0.5) * 0.5, y: P.y + k * 0.7 }, 3, 0xcfe6ff); }
      slamEnemies(E, P, rad, dmg, out); if (BOSS) BOSS.slam(P, rad, dmg, out); ITEMS.slam(P, rad, out); breakRock(P.x, P.y + 0.2, 1.5, spade); for (const o of out) onEvent(o); break; }
    case 'roll': sfx.whoosh(); fx.kick(at, -P.rollDir, 10, 2.6); break;
    case 'dashCut': sfx.dash(); fx.kick(at, -P.face, 14, 3.4); FX2.ghostT = 0; break;
    case 'dive': sfx.whoosh(); break;
    case 'rang': sfx.chime ? sfx.chime() : sfx.clang(); fx.ring(e.at, 0xfeae34); break;
    case 'pogo': sfx.parry(); sfx.jump(); fx.ring({ x: P.x, y: P.y - 0.4 }, 0xdff4ff); fx.burst({ x: P.x, y: P.y - 0.6 }, 12, 0xdff4ff); R.glint(P.x, P.y - 0.5, 0xdff4ff, 0.9, 4.5, 0.25); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); FEEL_FX.hitstop = 0.05; PLUNGE_T = 0; break;
    case 'glide': sfx.glide(); if (LEVEL.updrafts.some(u => P.x >= u.x0 && P.x < u.x1 && P.y + 1 >= u.y0 && P.y + 1 < u.y1)) sfx.gust(); break;
    case 'airDash': sfx.dash(); fx.ring({ x: P.x, y: P.y + 1 }, 0xffd27a); FX2.dashGhost = 0.2; break;
    case 'bloom': sfx.bloom(); PROPS.bounce(e.m); fx.puff(at, 14, 3); fx.burst({ x: P.x, y: P.y + 0.3 }, 10, 0xf6757a); R.glint(P.x, P.y + 0.5, 0xfeae34, 0.7, 4, 0.3); break;
    case 'strike': {
      if (weaponOf(P).shoots){ loose(e.sw); break; }   // the bow: an arrow, not a blow
      if (e.sw.hits > 1 && !e.again){ const A0 = P.atk; for (let k = 1; k < e.sw.hits; k++) LATER.push({ t: e.sw.gap * k, f: () => { if (P.atk === A0 && P.hp > 0) onEvent({ ...e, again: true }); } }); }   // the thorns: a second cut, if the blow has not been broken off
      // the blow: the swoosh of light, the air bending round it, the floor kicked up, a thump, the view nudged
      const big = e.finisher, thrust = !!weaponOf(P).narrow || !!weaponOf(P).ring, tilt = { hm_atk3: -0.9, hm_atk2: 0.9, atk_spade: -0.9, atk_slam_v3: -0.7, atk_slam_px: -0.7, atk_rise_px: 1.0, atk_spin_px: 0.1, atk_dash_px: 0.25 }[e.sw.anim] || 0;
      sfx.swing(big); if (!SWINGFX.has(e.sw.anim) && !thrust) fx.crescent({ x: P.x + P.face * 1.15, y: P.y + 1.25 }, P.face, big, tilt);   // the combo's cuts have their own drawn effect
      { const upw = !!(P.atk && P.atk.up), gx = upw ? P.x + P.face * 0.3 : P.x + P.face * 1.3, gy = upw ? P.y + 2.9 : P.y + 1.3; R.glint(gx, gy, big ? 0xffd27a : 0xbfe8ff, big ? 0.9 : 0.6, 4.5, 0.22); R.shock(gx, gy - 0.1, big); }
      if (P.grounded) fx.kick(at, -P.face, big ? 12 : 7, big ? 3 : 2.2);
      FEEL_FX.shake = Math.max(FEEL_FX.shake, big ? 0.14 : 0.07); FEEL_FX.kick = P.face * (big ? 0.22 : 0.12);
      // the dash cut strikes all along where he dashed
      const along = e.sw.dash && !e.sw.pierce && P.dashFrom != null, from = along ? { ...P, x: P.dashFrom } : P, reach = (e.sw.reach || weaponOf(P).reach) + (along ? Math.abs(P.x - P.dashFrom) : 0);   // (a thrust has its own reach; the tooth's charge strikes as it goes, toothStep)
      if (thrust && !(P.atk && P.atk.up)){ R.glint(P.x + P.face * reach, P.y + 1.3, 0xdff4ff, 0.8, 4, 0.2); fx.burst({ x: P.x + P.face * reach, y: P.y + 1.3 }, 5, 0xdff4ff); } if (thrust && P.atk && P.atk.up){ R.glint(P.x, P.y + 2.4 + reach, 0xdff4ff, 0.8, 4, 0.2); }
      const digs = !!weaponOf(P).digs, dmg = digs ? (P.grounded ? e.sw.dmg : Math.max(1, e.sw.dmg - 2)) + (big && has('whetstone') ? 1 : 0) : e.sw.dmg + (big && has('whetstone') ? 1 : 0) + (G.edge >= 2 || (G.edge && big) ? 1 : 0), out = [];   // the whetstone; the blade's tempering; the spade weak in the air
      strikeEnemies(E, from, reach, dmg, out, !!(P.atk && P.atk.up), P.weapon !== 'blade' ? { ...weaponOf(P), round: !!e.sw.round } : null); if (BOSS) BOSS.strike(from, reach, dmg, out); ITEMS.strike(from, reach, out);
      breakRock(P.x + P.face * (digs ? 1.8 : 1.2), P.y + (digs ? 0.6 : 1.2), digs ? 1.5 : 1.3, digs);   // the spade digs where it lands; the blade rings off
      if (e.sw.wave && P.grounded){ waves(P.x + P.face * 1.6, P.y, [P.face], 0.38); sfx.slam(); R.shock(P.x + P.face * 1.8, P.y + 0.3, true); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.3); }   // its last blow runs on along the ground, a little way
      for (const o of out) onEvent(o); break; }
    case 'hit': if (!e.art) EMBER.n = Math.min(EMBER.cap, EMBER.n + (has('flint') ? 2 : 1));   // a landed blow gives an ember (not an art's)
      buzz(e.heavy ? 0.35 : 0.15, e.heavy ? 0.5 : 0.3, e.heavy ? 90 : 50); sfx.hit(); fx.burst(e.at, e.heavy ? 18 : 12, 0xffe0a8); R.glint(e.at.x, e.at.y, 0xffe0a8, e.heavy ? 0.9 : 0.6, 3.5, 0.16); FEEL_FX.hitstop = e.heavy ? 0.09 : 0.05; FEEL_FX.shake = Math.max(FEEL_FX.shake, e.heavy ? 0.18 : 0.1); break;
    case 'swap': {   // round the weapons he has: the sword, then each a keeper has left him, in the order he got them
      const order = ['blade', ...(G.arms || [])], to = order[(Math.max(0, order.indexOf(P.weapon)) + 1) % order.length]; if (order.length < 2){ if (!HINTED.swap){ HINTED.swap = 1; banner('', 'You only have the sword.', 2.2); } break; }
      P.weapon = G.wield = to; P.atk = null; store(); sfx.whoosh(); fx.ring({ x: P.x, y: P.y + 1.1 }, { blade: 0xffd27a, spade: 0xc0cbdc, clapper: 0xfeae34, tooth: 0xdff4ff, bow: 0x2ce8f5, thorns: 0xead4aa }[to] || 0xffd27a); banner('', ARMS[to].title, 1.4); break; }
    // iron has been touched in the Bell-Foundry (regions/foundry.js): it rings, a while; the shutters come down
    case 'ring': { if (RULE.still) break; const was = RULE.ring > 0, d = Math.hypot(e.at.x - P.x, e.at.y - P.y); RULE.ring = Math.max(RULE.ring, RING[e.big ? 1 : 0]);
      sfx.crackbell(!!e.big); if (e.big) sfx.clang(); fx.ring(e.at, 0xfeae34); if (e.big) fx.ring(e.at, 0xffffff); R.shock(e.at.x, e.at.y, !!e.big); R.glint(e.at.x, e.at.y, 0xfeae34, e.big ? 1.2 : 0.7, e.big ? 9 : 5, 0.3); FEEL_FX.shake = Math.max(FEEL_FX.shake, e.big ? 0.3 : d < 10 ? 0.12 : 0.05);
      if (!was){ PROPS.show(); let near = false; for (const B of PROPS.shutters) if (Math.hypot(B.x - P.x, B.y - P.y) < 26){ near = true; fx.dust({ x: B.x, y: B.y0 }, 8, 2); } if (near) sfx.door(); } break; }
    // a cold brazier struck (regions/glacier.js): it is lit, for good, and the ice that answers to it melts: the way it
    // closed, what was kept in it, whoever sat in it
    case 'thaw': { if (RULE.lit.has(e.key)) break; RULE.lit.add(e.key); ((G.lit = G.lit || {})[LEVEL.index] = G.lit[LEVEL.index] || []).push(e.key); store(); PROPS.show();
      sfx.ember && sfx.ember(); sfx.glass(); fx.burst(e.at, 20, 0xfeae34); fx.ring(e.at, 0xfeae34); R.glint(e.at.x, e.at.y, 0xfeae34, 1.2, 8, 0.6); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12);
      for (const B of PROPS.ices) if (B.fire === e.key){ fx.dust({ x: B.x, y: B.y }, 18, 3.5); fx.burst({ x: B.x, y: B.y }, 14, 0xcfeaff); }
      if (!G.thawSaid){ G.thawSaid = 1; store(); banner('', 'The fire is lit. The ice near it melts.', 3); } break; }
    // a lever struck in the Wreck of the Works (regions/works.js): the current goes to the other half of the iron
    case 'switch': { if (RULE.still) break; RULE.sw = RULE.sw ? 0 : 1; (G.sw = G.sw || {})[LEVEL.index] = RULE.sw; store(); PROPS.show(); sfx.creak(); sfx.zap(); fx.burst(e.at, 14, 0xbfe8ff); R.glint(e.at.x, e.at.y, 0xbfe8ff, 0.9, 6, 0.3); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1);
      for (const D of PROPS.decks) if (D.works && Math.hypot(D.x - P.x, D.y - P.y) < 24) R.glint(D.x, D.y, 0xbfe8ff, 0.5, 2.5, 0.2);
      if (!G.swSaid){ G.swSaid = 1; store(); banner('', 'The lever moves the current to the other half of the iron.', 3.4); } break; }
    // the Drowned Galleries: a windlass turned. Its gate goes up, or comes down; a gate that comes down holds the water
    // behind it at the height it has now. His save keeps both
    // the Empty Shelves (build 117): a ladder struck. It rolls to the other end of its rail; his save keeps where it is going
    case 'rail': { const nd = (LEVEL.movers || []).find(m => m.key === e.key && m.needs);   // (build 120) a cage whose engine is not going: its lever does nothing
      if (nd && !RULE.gates.has(nd.needs)){ sfx.creak(); banner('', 'It does not move. Nothing is turning its drum.', 3); break; }
      const to = railSend(e.key); if (to == null) break; ((G.rails = G.rails || {})[LEVEL.index] = G.rails[LEVEL.index] || {})[e.key] = to; store(); sfx.creak(); sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); fx.dust(e.at, 10, 2);
      if (!nd && !G.railTold){ G.railTold = 1; store(); banner('A ladder on a rail', 'Struck, it rolls to the other end of its rail.', 4); } break; }
    case 'windlass': { const up = !RULE.gates.has(e.key), holds = LEVEL.marks.some(m => m.type === 'gate' && m.key === e.key && m.holds);
      const runs = (LEVEL.movers || []).some(m => m.key === e.key || m.needs === e.key);   // (build 116) a windlass may turn a chain or a lift, and no gate
      if (up){ RULE.gates.add(e.key); delete RULE.held[e.key]; } else { RULE.gates.delete(e.key); if (holds) RULE.held[e.key] = breath(); }
      if (runs) keyRun(e.key, up);
      ((G.gates = G.gates || {})[LEVEL.index] = G.gates[LEVEL.index] || {})[e.key] = up ? 1 : { held: holds ? RULE.held[e.key] : null }; store(); PROPS.show();
      sfx.creak(); sfx.door(); sfx.rumble(); fx.burst(e.at, 12, 0xc0cbdc); R.glint(e.at.x, e.at.y, 0xc0cbdc, 0.9, 5, 0.3); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.18);
      for (const B of PROPS.sluices || []) if (B.key === e.key) fx.dust({ x: B.x, y: B.y }, 14, 3);
      if (e.key === 'hatch') banner('', up ? 'The hatch in the hall\'s floor has lifted.' : 'The hatch has shut.', 3);
      else if (runs) banner('', up ? (e.says || 'Somewhere a chain has begun to turn.') : 'It has stopped.', 3.2);
      else if (e.says && up) banner('', e.says, 3.2);   // (build 120: a windlass with its own line says it)
      else if (!G.gateTold){ G.gateTold = 1; store(); banner('A windlass', up ? 'Somewhere a gate has gone up. The chain on the wall shows where.' : 'Its gate has come down again.', 5); }
      else banner('', up ? 'A gate has gone up.' : holds ? 'Its gate has come down. The water behind it will stay as it is.' : 'Its gate has come down.', 2.6); break; }
    // the Ossuary's scales: what is in a pan has changed (a stack knocked into it; a Tallyman taking a piece out; his own
    // weight on it or off it). Its slab goes up or comes down by as much. His save keeps what lies in each pan
    case 'pan': { const was = RULE.lift[e.key] || 0; setPan(e.key, e.load, e.eff == null ? e.load : e.eff); const now = RULE.lift[e.key] || 0;
      const ST = (RULE.stacks[e.key] = RULE.stacks[e.key] || []); if (e.stack != null && !ST.includes(e.stack)) ST.push(e.stack); else if (e.by === 'tally' && ST.length) ST.pop();   // (a stack of one that went over; or the last of them carried back to its ledge)
      if (e.kept !== false){ const GP = ((G.pans = G.pans || {})[LEVEL.index] = G.pans[LEVEL.index] || {}); GP[e.key] = RULE.pan[e.key]; if (ST.length || GP[e.key + '#']) GP[e.key + '#'] = ST.slice(); store(); }
      if (now !== was){ PROPS.show(); sfx.creak(); if (now > was) sfx.door(); else sfx.slam(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); for (const B of PROPS.sluices || []) if (B.key === e.key) fx.dust({ x: B.x, y: B.y }, 10, 3); }
      if (e.fell){ sfx.crack(); fx.burst(e.at, 16, 0xead4aa); if (!G.panTold){ G.panTold = 1; store(); banner('The scales', 'Weight in a pan lifts a slab somewhere else. The chain shows where.', 5); } }
      else if (e.by === 'tally' && Math.hypot(e.at.x - P.x, e.at.y - P.y) < 24 && !G.tallyTold){ G.tallyTold = 1; store(); banner('', 'A Tallyman is taking the bones back out of the pan.', 4); } break; }
    // the Pilgrims' Cairns: a wind-break knocked down. The wind goes through, for good; his save keeps it
    case 'windbreak': { if (RULE.walls.has(e.key)) break; RULE.walls.add(e.key); const W = ((G.walls = G.walls || {})[LEVEL.index] = G.walls[LEVEL.index] || []); if (!W.includes(e.key)) W.push(e.key); store();
      sfx.crack(); sfx.slam(); sfx.gust(); fx.burst(e.at, 18, 0xc0cbdc); fx.dust(e.at, 16, 4); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2);
      if (!G.wallTold){ G.wallTold = 1; store(); banner('A wind-break', 'The wind goes through now. Somewhere behind it the air is rising.', 5); } else banner('', 'The wind goes through.', 2.6); break; }
    case 'arc': if (Math.hypot(e.at.x - P.x, e.at.y - P.y) < 16) sfx.zap(); break;
    // the Aqueducts: a sluice wheel turned (by him, or put back by its keeper); a keeper's arm come down; the Lock letting go
    case 'sluice': { const on = !RULE.wet.has(e.key); if (on) RULE.wet.add(e.key); else RULE.wet.delete(e.key); ((G.wet = G.wet || {})[LEVEL.index] = G.wet[LEVEL.index] || {})[e.key] = on ? 1 : 0; store();
      const hear = Math.hypot(e.at.x - P.x, e.at.y - P.y) < 22; if (hear){ sfx.creak(); if (on) sfx.splash(); else sfx.door(); } fx.burst(e.at, 12, 0xbfe8ff); R.glint(e.at.x, e.at.y, 0xbfe8ff, 0.9, 5, 0.3); if (!e.by) FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.08);
      if (!e.by && !G.wetTold){ G.wetTold = 1; store(); banner('A sluice wheel', on ? 'Its water is running. Hit it again to stop it.' : 'Its water has stopped. Hit it again to start it.', 5); }
      else if (e.by && hear && !G.keptTold){ G.keptTold = 1; store(); banner('', 'The lock-keeper has turned the wheel back.', 4); } break; }
    // the Keepers' Houses: a setting broken (a few shards, the first time ever); set right; the Housekeeper's sweep; a servants' door
    case 'upset': { sfx.glass(); fx.burst(e.at, 12, 0xffffff); fx.dust(e.at, 6, 2); const id = 's' + Math.round(e.e.home.x / T) + ',' + Math.round(e.e.home.y / T), B = (G.broke[LEVEL.index] = G.broke[LEVEL.index] || []); if (!B.includes(id)){ B.push(id); ITEMS.spill(e.at.x, e.at.y, 3); } store();
      if (!G.upsetTold && !RULE.unkept){ G.upsetTold = 1; store(); banner('Out of its place', 'You knocked something over. The housekeeper is coming to put it back.', 6); } break; }
    case 'setright': if (Math.hypot(e.at.x - P.x, e.at.y - P.y) < 20){ sfx.relic(); R.glint(e.at.x, e.at.y, 0xfff2d0, 0.9, 4, 0.3); } break;
    case 'swept': if (Math.hypot(e.at.x - P.x, e.at.y - P.y) < 18){ sfx.swing(true); fx.dust(e.at, 10, 3); } break;
    case 'servdoor': if (Math.hypot(e.at.x - P.x, e.at.y - P.y) < 22){ sfx.creak(); fx.dust(e.at, 6, 2); } break;
    // the Orrery Wing: an hour called; a hammer down (the first that lands on him: what the wing is wrong about, said once)
    case 'called': if (Math.hypot(e.e.x - P.x, e.e.y - P.y) < 30) sfx.crackbell(false); break;
    case 'hammer': if (Math.hypot(e.at.x - P.x, e.at.y - P.y) < 26){ sfx.slam(); fx.dust(e.at, 12, 3); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.22); R.glint(e.at.x, e.at.y + 0.3, 0xfeae34, 1, 4, 0.2); }
      if (e.hit && !G.hourTold){ G.hourTold = 1; store(); banner('An hour late', 'It struck the hour after the one it called. It always does.', 6); } break;
    case 'thud': if (Math.hypot(e.at.x - P.x, e.at.y - P.y) < 18){ sfx.slam(); fx.dust(e.at, 12, 3); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.18); } break;
    case 'flood': { RULE.surge = e.secs; sfx.rumble(); sfx.splash(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.5); fx.burst(e.at, 34, 0xbfe8ff); fx.dust(e.at, 16, 5); break; }
    // the Jar lets go: for a moment the current is in every piece of iron in the works
    case 'surge': { RULE.surge = SURGE; sfx.thunder(); sfx.zap(); FLASH = Math.max(FLASH, 0.3); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.4); fx.ring(e.at, 0xffffff); fx.burst(e.at, 30, 0xbfe8ff); R.shock(e.at.x, e.at.y, true); for (const D of PROPS.decks) if (D.works) R.glint(D.x, D.y, 0xffffff, 1, 3, 0.3); break; }
    case 'kill':
      // the Jar is broken: the works are dead, for good. No iron shocks; the coils and the arms are still; the grates lift
      if (e.e && e.e.type === 'assayer'){ RULE.still = true; (G.still = G.still || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.door(); sfx.crack(); FEEL_FX.shake = 0.6; SLOW = Math.max(SLOW, 0.9); fx.burst(e.at, 36, 0xffd9a0); ITEMS.spill(e.e.x, e.e.y + 1.5, 30); for (const B of PROPS.grates) fx.dust({ x: B.x, y: B.y }, 14, 3); banner('The Assayer is beaten', 'It weighed you, and its scale did not move.', 5.5); }
      if (e.e && e.e.type === 'pump'){ RULE.still = true; RULE.tide = 0; (G.still = G.still || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.door(); sfx.rumble(); sfx.splash(); FEEL_FX.shake = 0.7; SLOW = Math.max(SLOW, 0.9); fx.burst(e.at, 40, 0xbfe8ff); ITEMS.spill(e.e.x, e.e.y + 1.5, 30); for (const B of PROPS.grates) fx.dust({ x: B.x, y: B.y }, 14, 3); banner('The Pump is broken', 'It runs free now. The water is draining: the way on is open.', 6); }
      if (e.e && e.e.type === 'almanac'){ RULE.still = true; (G.still = G.still || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.door(); sfx.crack(); FEEL_FX.shake = 0.6; SLOW = Math.max(SLOW, 0.9); fx.burst(e.at, 36, 0xfeae34); ITEMS.spill(e.e.x, e.e.y + 1.5, 30); for (const B of PROPS.grates) fx.dust({ x: B.x, y: B.y }, 14, 3); banner('The Almanac is beaten', 'It was an hour late for this, too.', 5.5); }
      if (e.e && e.e.type === 'housekeeper'){ RULE.unkept = true; (G.unkept = G.unkept || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.door(); sfx.crack(); FEEL_FX.shake = 0.5; SLOW = Math.max(SLOW, 0.9); fx.burst(e.at, 30, 0xfff2d0); ITEMS.spill(e.e.x, e.e.y + 1.5, 30); banner('The Housekeeper is beaten', 'Nothing in these houses will be put back again.', 5.5); }
      if (e.e && e.e.type === 'lock'){ RULE.still = true; RULE.surge = 0; (G.still = G.still || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.door(); sfx.rumble(); sfx.splash(); FEEL_FX.shake = 0.7; SLOW = Math.max(SLOW, 0.9); fx.burst(e.at, 40, 0xbfe8ff); ITEMS.spill(e.e.x, e.e.y + 1.5, 30); for (const B of PROPS.grates) fx.dust({ x: B.x, y: B.y }, 14, 3); banner('The Lock is open', 'The water runs freely now. Its keepers stand down.', 5.5); }
      if (e.e && e.e.type === 'jar'){ RULE.still = true; RULE.surge = 0; (G.still = G.still || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.glass(); sfx.thunder(); sfx.door(); FEEL_FX.shake = 0.7; SLOW = Math.max(SLOW, 0.9); FLASH = Math.max(FLASH, 0.4); fx.burst(e.at, 40, 0xbfe8ff); ITEMS.spill(e.e.x, e.e.y + 1.5, 30); for (const B of PROPS.grates) fx.dust({ x: B.x, y: B.y }, 14, 3); banner('The Jar is broken', 'The lightning it held has gone back to the storm.', 5.5); }
      if (e.e && e.e.type === 'seated'){ G.seatedDown = 1; RULE.sat = true; store(); banner('The Seated is beaten', 'The fire freed what the ice was holding.', 5); }
      // a thing that is not a creature (his own cairn): it is knocked down, and that is all
      if (e.e && e.e.d.prop){ sfx.crack(); sfx.break(); fx.dust(e.at, 26, 4); fx.burst(e.at, 14, 0xc0cbdc); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.3); if (e.e.type === 'hiscairn'){ G.cairnDown = 1; RULE.down = true; store(); banner('It is down', 'The stone with your name on it lies with the others.', 5); } break; }
      // the Cracked Bell falls: the wing is still, for good. Nothing in it rings again; the shutters stay up; the grates lift
      if (e.e && e.e.type === 'crackedbell'){ RULE.still = true; RULE.ring = 0; (G.still = G.still || {})[LEVEL.index] = 1; store(); PROPS.show(); sfx.crackbell(true); sfx.slam(); sfx.door(); FEEL_FX.shake = 0.7; SLOW = Math.max(SLOW, 0.9); FLASH = Math.max(FLASH, 0.3);
        const fy = e.e.floor != null ? e.e.floor : e.at.y; fx.dust({ x: e.e.x, y: fy }, 40, 6); R.shock(e.e.x, fy + 1, true); ITEMS.spill(e.e.x, fy + 1.5, 30); for (const B of PROPS.grates) fx.dust({ x: B.x, y: B.y }, 14, 3); banner('The Cracked Bell is beaten', 'Everything that answered it has stopped too.', 5.5); }
      if (e.e){ (G.slain = G.slain || {})[e.e.type] = (G.slain[e.e.type] || 0) + 1; (G.seen = G.seen || {})[e.e.type] = 1; DIRTY = DIRTY > 0 ? DIRTY : 2; } sfx.kill(); cry(e.e, 'death'); ITEMS.spill(e.at.x, e.at.y, 1 + Math.min(5, e.e ? e.e.d.hp : 1)); fx.burst(e.at, 26, 0xff70d0); fx.ring(e.at, 0xffc0ff);
      if (e.e && e.e.d.ai === 'spitter'){ const col = e.e.d.orb || 0x9dff70; fx.burst(e.at, 30, col); fx.ring(e.at, col); for (let k = 0; k < 8; k++) fx.burst({ x: e.at.x + Math.cos(k * 0.785) * 0.7, y: e.at.y + Math.sin(k * 0.785) * 0.7 }, 3, col); R.glint(e.at.x, e.at.y, col, 1, 5, 0.3); }   // a spitter bursts, in its own colour
      FEEL_FX.hitstop = 0.1; fx.ember(e.at, 2 + Math.min(5, e.e ? e.e.d.hp : 2) + (has('stylus') ? 2 : 0)); R.glint(e.at.x, e.at.y, 0xff9040, 1, 5, 0.35); break;
    // his guard turns a blow: it is seen to bounce off. A block: sparks off the blade, a flash, he gives a step, the
    // creature is thrown back. A parry (raised as it landed): a bright ring and a white flash, a held beat, the creature
    // thrown further and staggered, sparks both ways (enemies.js, stunned)
    case 'parry': buzz(0.3, 0.7, 110); sfx.parry(); fx.ring(e.at, 0x9fd0ff); FEEL_FX.hitstop = 0.12;
      if (e.mine && has('felt')){ for (const q of E.list) if (q.alive && Math.hypot(q.x - P.x, q.y - P.y) < FELT.r) q.stilled = FELT.t; fx.ring({ x: P.x, y: P.y + 1.2 }, 0xc0cbdc); sfx.bell(); }   // the Founder's Felt: a parry rings, and what is near is stilled for a breath
      if (e.mine){ fx.ring(e.at, 0xffffff); fx.burst(e.at, 22, 0xfff2d0); fx.burst(e.at, 10, 0x9fd0ff); R.glint(e.at.x, e.at.y, 0xffffff, 1.4, 5, 0.3); FLASH = Math.max(FLASH, 0.06); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.16); FEEL_FX.kick = -P.face * 0.18; } break;
    case 'block': sfx.block(); fx.burst(e.at, 8, 0xc9d2e0);
      if (e.mine){ fx.burst(e.at, 12, 0xfee761); R.glint(e.at.x, e.at.y, 0xfff2d0, 0.8, 3.5, 0.18); FEEL_FX.hitstop = Math.max(FEEL_FX.hitstop, 0.05); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.08); if (P.grounded && !e.shot) P.vx = -P.face * 3; } break;
    case 'spit': sfx.spit(); break;
    case 'tell': e.e.tellT = 0.6; cry(e.e, 'attack'); break;
    // a creature has seen him: a pale mark over it, and its own sound (enemies.js rest, docs/phase6-sheet.md)
    case 'notice': e.e.noticeT = 0.5; cry(e.e, 'notice'); break;
    // the worm: it is heard running under the floor; the ground cracks where it will come up; it bursts out
    case 'ripple': if (Math.abs(e.at.x - P.x) < 12) sfx.creep && sfx.creep(); break;
    case 'crack': sfx.crack(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); fx.dust(e.at, 10, 2.6); break;
    case 'burst': sfx.break(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2); fx.dust(e.at, 22, 4.5); fx.burst({ x: e.at.x, y: e.at.y + 0.4 }, 14, 0xd0a070); R.shock(e.at.x, e.at.y + 0.3, true); break;
    case 'step': sfx.step(); break;
    case 'mantle': sfx.whoosh(); break;
    case 'lastpage': { sfx.relic(); fx.ring({ x: P.x, y: P.y + 1.2 }, 0xfeae34); SLOW = Math.max(SLOW, 0.5); banner('', 'The Last Page saved you.', 2.6); break; }
    case 'spared': { sfx.block(); fx.burst({ x: P.x, y: P.y + 1.4 }, 18, 0xead4aa); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.25); banner('', 'The Blank Leaf took the hit.', 2.2); break; }
    case 'hurt': { window.__side.lastHurt = e.msg; buzz(0.7, 0.5, 200); sfx.hurt(); fx.burst({ x: P.x, y: P.y + 1.3 }, 10, 0xff6060); const a = SCF.tip(); fx.burst({ x: a.x, y: a.y }, 12, 0xff7030); fx.burst({ x: a.x, y: a.y }, 6, 0xfee761); FLASH = Math.max(FLASH, 0.12); break; }   // the end of the scarf burns off
    case 'skid': fx.kick(at, Math.sign(P.vx) || P.face, 6, 2.2); break;
    case 'bossWake': { const first = !(G.keepers && G.keepers[LEVEL.theme]); (G.keepers = G.keepers || {})[LEVEL.theme] = 1; store(); BOSS.shown = false; BANNER = null; ENT.start(BOSS, first, P, { theme: LEVEL.theme, epithet: EPITHET[LEVEL.index] || '' }); SCORE.load(LEVEL.index === CLIMB_TOP ? 'boss_final' : 'boss'); break; }   // the hall shuts, then it comes (entrance.js); its name comes up with the bars (drawHud)
    case 'bossToll': sfx.parry(); sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2); break;
    case 'bossTell': sfx.creak(); break;
    case 'bossSlam': buzz(e.soft ? 0.4 : 0.8, 0.5, e.soft ? 120 : 260); sfx.impact(true); sfx.slam(); fx.dust(e.at, e.soft ? 10 : 26, 4); R.glint(e.at.x, e.at.y + 0.5, 0xffd27a, e.soft ? 0.4 : 0.9, 6, 0.3); if (!e.soft) fx.ring(e.at, 0xffd27a); FEEL_FX.shake = Math.max(FEEL_FX.shake, e.soft ? 0.18 : 0.42); break;
    case 'bossSweep': sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.15); break;
    case 'rockLand': sfx.crack(); fx.dust(e.at, 8, 2); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); break;
    case 'bossPhase': sfx.roar(); FEEL_FX.shake = 0.6; banner(BOSS.name + ' rages', BOSS.rage); break;
    case 'bossDie': buzz(1, 0.9, 700); sfx.roar(); sfx.bossDie(); FEEL_FX.hitstop = 0.3; FEEL_FX.shake = 0.8; SLOW = 1.3; FLASH = 0.5; break;
    case 'bossDead': { ENT.open(); for (const x of R.exits) x.set(true); sfx.door();
      RULE.fallen = true; ITEMS.wake();   // (build 126: at the summit, the three come up on to it)
      for (const C of PROPS.release()) if (Math.hypot(C.x - P.x, C.y - P.y) < 30){ sfx.break(); fx.dust({ x: C.x, y: C.y - C.h / 2 }, 30, 5); fx.burst({ x: C.x, y: C.y }, 26, 0xc0cbdc); R.shock(C.x, C.y, true); }   // what it held is let go: the stone over the way out comes down
      // (its banner and what it spills were inside that comment from build 56 to 77, and never happened)
      banner(BOSS.name + ' is beaten', BOSS.fell, 5); ITEMS.spill(BOSS.cx, BOSS.stageY + 2, 60);
      // what it leaves him, the first time
      const n = LEVEL.index, t = TEACH[n];
      if (!G.beat[n]){ G.beat[n] = true; GIFTING = !!(t && t.name); if (t && t.can) (G.can = G.can || {})[t.can] = 1; if (t && t.heart){ G.hearts += t.heart; P.maxHp = maxHearts(); P.hp = P.maxHp; } if (t && t.flask){ G.flasks += t.flask; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } learn(); store();
        if (t && t.name){ LATER.push({ t: 2.4, f: () => giftStart(t) }); } }   // what it leaves gathers out of it, and comes to him (decision 0.5)
      break; }
    case 'shard': G.shards += e.v; sfx.shard(); PURSE = 2.5; DIRTY = DIRTY > 0 ? DIRTY : 2; break;
    case 'urn': sfx.urn(); fx.dust(e.at, 10, 3); fx.burst(e.at, 6, 0xd77643); break;
    case 'chest': sfx.chest(); fx.ring(e.at, 0xffd27a); fx.burst(e.at, 16, 0xfee761); R.glint(e.at.x, e.at.y, 0xffd27a, 1, 5, 0.5); break;
    case 'thread': { G.threads++; sfx.thread(); fx.ring(e.at, 0xff5040); fx.burst(e.at, 18, 0xe43b44); R.glint(e.at.x, e.at.y, 0xff5040, 1, 5, 0.5); const k = G.threads % THREADS_A_HEART;
      if (k === 0){ const m = maxHearts(); if (m > P.maxHp){ P.maxHp = m; P.hp = m; } banner('New heart', 'Three red strands make a heart. You have one more.', 4); } else banner('A red strand', `${k} of ${THREADS_A_HEART}. Three make a new heart.`, 3.4);
      store(); break; }
    // a wing's prize, out of its chest (build 87): the ability gathers over the chest and comes to him, as a keeper's
    // gift does. It is his from the moment the chest is open. One who had it already (a save from before) finds shards
    case 'gift': { const B = BOON[e.id]; if (B){ if (B.boon === 'heart'){ G.hearts += 1; P.maxHp = maxHearts(); P.hp = P.maxHp; } else { G.flasks += 1; P.flaskMax = maxFlask(); P.flask = P.flaskMax; } GIFTING = true; store(); sfx.relic && sfx.relic(); LATER.push({ t: 0.6, f: () => giftStart(B, e.at) }); break; }   // a heart, a drink (build 95): his at once, the chest is opened once
      const A = ABILITY[e.id]; if (!A) break; if (G.can[e.id]){ ITEMS.spill(e.at.x, e.at.y, 60); break; } G.can[e.id] = 1; GIFTING = true; store(); learn(); sfx.relic && sfx.relic(); LATER.push({ t: 0.6, f: () => giftStart(A, e.at) }); break; }
    case 'held': if (!HINTED.held){ HINTED.held = 1; sfx.block(); banner('', 'Held shut. Its guardian still stands.', 3.5); LATER.push({ t: 6, f: () => { HINTED.held = 0; } }); } break;
    case 'relic': { const r = RELICS[e.id]; if (!r || owns(e.id)) break; G.relics.push(e.id); const tied = wear(e.id, true); learn(); store(); sfx.relic();   // tied into the scarf, if a knot is free
      const knot = tied ? 'Equipped.' : 'Your relic slots are full. Rest at a pool to choose which you equip.';
      LATER.push({ t: 0.7, f: () => { card({ head: 'A RELIC', title: r.name, icon: e.id, does: r.line, foot: knot, lore: r.lore }); firstCard('knots'); } }); break; }
    case 'flask': if (P.flask > 0 && P.hp < P.maxHp){ P.flask--; P.hp = Math.min(P.maxHp, P.hp + TUNE.player.flaskHeal + (has('seedheart') ? 1 : 0)); sfx.drink(); fx.ring({ x: P.x, y: P.y + 0.8 }, 0x5ce1c6); }
      break;
    case 'art': art(e); break;
  }
}
// the lines of help at the foot of the screen, for what he is playing with. A controller's are its own buttons, as bound
const PADN = { xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT'], ps: ['CROSS', 'CIRCLE', 'SQUARE', 'TRIANGLE', 'L1', 'R1', 'L2', 'R2'] };
const padKey = a => { const i = (SET.pad[a] || [])[0], N = PADN[DEVICE.kind === 'ps' ? 'ps' : 'xbox']; return i == null ? '-' : N[i] || 'B' + i; };
const HINT = { keys: ['[A] [D] MOVE · [SPACE] JUMP, AGAIN IN THE AIR · [SHIFT] ROLL', '[CLICK] ATTACK · [RIGHT CLICK] OR [K] BLOCK · [CLICK] IN A ROLL: DASH ATTACK', '[W] LOOK UP · [W] + [CLICK] STRIKE UPWARD · [S] + [CLICK] RISING ATTACK. IN THE AIR: SLAM', '[S] + [SPACE] DROP THROUGH A PLANK', '[S] TALK, OPEN · [M] MAP · [TAB] MENU · [Q] DRINK YOUR FLASK', '[E] EMBER POWER, COSTS 10 (ALSO [S] + [E], AND IN THE AIR)'], touch: ['TOUCH THE LEFT OF THE SCREEN AND DRAG TO MOVE', 'DRAG DOWN: CROUCH, TALK, OPEN · DOWN + A IN THE AIR: SLAM', 'DRAG UP: LOOK UP · UP + A: STRIKE UPWARD', 'EMBERS: A POWER, COSTS 10 (WITH DOWN, OR IN THE AIR) · FLASK: DRINK'],
  get pad(){ const k = padKey; return [`STICK MOVE · [${k('jump')}] JUMP, AGAIN IN THE AIR · [${k('roll')}] ROLL · [${k('attack')}] ATTACK · [${k('block')}] BLOCK`, `UP: LOOK UP · UP + [${k('attack')}]: STRIKE UPWARD`, `DOWN + [${k('attack')}]: RISING ATTACK · DOWN + [${k('attack')}] IN THE AIR: SLAM · [${k('flask')}] DRINK`, `DOWN: TALK, OPEN · DOWN + [${k('jump')}]: DROP THROUGH A PLANK · SELECT: MAP · START: PAUSE`, `[${k('art')}]: EMBER POWER, COSTS 10 (WITH DOWN, OR IN THE AIR)`]; } };
const EPITHET = LEVELS.map(l => l.epithet);
// each part of the HUD is pointed out once, the first time it is there to see (docs/screens-sheet.md, rule 4: nothing
// is on the screen that has not been explained). One at a time, for a few seconds, and never over a card or a talk
const TIPS = [['hearts', () => true, () => [16, 6, P.maxHp * 8, 6], 'YOUR HEARTS'], ['flask', () => P.flaskMax > 0, () => [HUD.flaskAt, 5, P.flaskMax * 8 - 2, 8], 'YOUR FLASK: EACH ONE IS A DRINK'], ['embers', () => embersKnown(), () => [16, 14, (HUD.emberEnd || 70) - 18, 7], 'EMBERS: A FULL PART PAYS FOR A POWER'],
  ['shards', () => G.shards > 0, () => [HUD.shardAt - 2, 5, 10 + textWidth(String(G.shards)), 8], 'SHARDS: MONEY'], ['strands', () => G.threads % THREADS_A_HEART > 0, () => [(HUD.strandAt || 40) - 1, 15, THREADS_A_HEART * 6, 6], `RED STRANDS: ${THREADS_A_HEART} MAKE A HEART`]];
let TIP = null;
function hudTips(dt){
  if (PAUSE || NOTE || TALK.on || GO.st || STORY.active() || OPT.hints === false || (BOSS && BOSS.active() && BOSS.st !== 'dead')) return;
  const T2 = (G.taught = G.taught || {});
  if (!TIP){ if (PLAYED < 2.5) return; const next = TIPS.find(t => !T2['hud_' + t[0]] && t[1]()); if (!next) return; T2['hud_' + next[0]] = 1; store(); TIP = { tip: next, t: 0 }; }
  TIP.t += dt; const a = Math.max(0, Math.min(1, TIP.t / 0.3, (6 - TIP.t) / 0.6)), [x, y, w, h] = TIP.tip[2](); HUD.point(x, y, w, h, TIP.tip[3], a, TIP.t); if (TIP.t > 6) TIP = null;
}
const HUDEL = document.getElementById('hud'); let HUDROW = 0;
function drawHud(dt){
  // the HUD's own picture is 180 tall, and as wide as that makes the window: its pixels are square. (Until build 78 it
  // took the world's width, which grew each time the view was drawn back, to 440 by 180 on a 16:9 screen: everything
  // in it was drawn 37% taller than wide. A playtest saw it in the portraits.) Never narrower than 288: a 16:10 screen
  // Large text (Options, Text size) draws it 144 tall over the play, so all of it is a quarter bigger; the pages
  // over a pause (the map, the Annals, the shop) are laid out for 180 and keep it
  const HH = OPT.big && !PAUSE && !NOTE ? 144 : 180;
  HUD.begin(Math.max(288 * HH / 180, R.size().w * HH / R.size().h), HH); const W = HUD.W, v = new window.THREE.Vector3();
  { const k = (HUDEL.clientHeight || 1) / HH; if (Math.abs(k - HUDROW) > 0.01){ HUDROW = k; document.documentElement.style.setProperty('--hud-row', k.toFixed(3) + 'px'); } }   // the touch buttons are set by it (side.html)
  // a red ! over a creature winding up
  for (const e of E.list){ if (e.alive && e.noticeT > 0 && !(e.tellT > 0)){ e.noticeT -= dt; v.set(e.x, e.y + e.d.h + 0.7, 0).project(R.camera); HUD.tell(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * HH), '#fee761'); }
    if (!e.alive || !(e.tellT > 0)) continue; e.tellT -= dt; v.set(e.x, e.y + e.d.h + 0.7, 0).project(R.camera); HUD.tell(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * HH)); }
  const rising = !!(BOSS && BOSS.st === 'rise');
  HUD.dark((ENT.vig || 0) * 0.32, ENT.tint); HUD.vignette(ENT.vig || 0, ENT.vigCol); HUD.sweep(ENT.sweep);   // the hall darkens, the sky too, and closes in; something passes over
  HUD.cinema(rising && ENT.st !== 'seal', dt, '', '', 0);   // the bars; its name is the entrance's (HUD.title)
  HUD.title(ENT.title);
  if (BOSS && BOSS.st === 'fight' && !BOSS.shown && !ENT.title){ BOSS.shown = true; banner('', BOSS.hint, 3.5); }   // once it is up: how it is hurt
  if (!rising && !TALK.on && !FLIGHT){
    const onKeys = DEVICE.kind !== 'touch';
    HUD.status(P, EMBER.n, EMBER.cap, P.flaskMax, time, ARTS.cost, embersKnown(), { art: onKeys ? kname('art') : null }); HUD.weapon(weaponOf(P).icon, (G.arms || []).length && onKeys ? kname('swap') : null, drawIcon); PURSE = Math.max(0, PURSE - dt);
    HUD.purse(P, P.flaskMax, G.shards, PURSE, G.threads % THREADS_A_HEART, THREADS_A_HEART, onKeys && P.hp < P.maxHp && P.flask > 0 ? kname('flask') : null);   // the flask's key stands by it while a drink would help
    hudTips(dt);
    const room = roomAt(P.x, P.y); if (room && !MAP.seen.has(room)){ MAP.seen.add(room); const k = LEVEL.rooms.indexOf(room), list = ((G.rooms = G.rooms || {})[LEVEL.index] = G.rooms[LEVEL.index] || []); if (k >= 0 && !list.includes(k)){ list.push(k); DIRTY = DIRTY > 0 ? DIRTY : 2; } }
    const st = ITEMS.station(P), place = (room && room.sill ? '' : LEVEL.name + (room ? ' · ' : '')) + (room ? room.title || room.name : '') + (st ? ' · ' + st.station.name : '');   // beside one of the three: their station's name
    if (place !== PLACE.name){ PLACE.name = place; PLACE.t = 0; } PLACE.t += dt;
    HUD.place(place, PLACE.t < 3 ? 1 : Math.max(0.45, 1 - (PLACE.t - 3) * 0.5));
    HUD.boss((BOSS && BOSS.hud()) || miniHud(), dt);
    const dots = mapDots();
    HUD.map(MAP.c, LEVEL.W, LEVEL.H, MAP.seen, room, T, dots, heightHere(), SPANS, LEVEL.index, time, P, clouds());
  }
  if (BANNER && !TALK.on && !NOTE && !(PAUSE && SCREEN && SCREEN !== 'pause')){ BANNER.t -= dt; HUD.banner(BANNER.a, BANNER.b, Math.max(0, Math.min(1, BANNER.t, (BANNER.life - BANNER.t) * 3))); if (BANNER.t <= 0) BANNER = null; }
  { const L = TEACHER.shown(); if (L && !PAUSE && !TALK.on && !NOTE && !rising){ v.set(P.x, P.y, 0).project(R.camera); const sx = Math.round((v.x + 1) / 2 * W), sy = Math.round((1 - v.y) / 2 * HH);
    HUD.lesson(L.show.map(([a, word]) => [kname(a), word]), sx, sy > HH - 30 ? sy - 52 : sy + 6, L.a, time); } }   // under him (over him, if he is low on the screen)
  HUD.label(TRY.on ? 'TRYING - NOT KEPT - ' + BUILD : BUILD);
  // where he is, for telling someone exactly: the room's name and his tile in it (Options: Place, or the F2 key)
  if (OPT.place){ const r = roomAt(P.x, P.y), s = r ? `${r.name.toUpperCase()} ${Math.floor(P.x / T) - r.tx0},${Math.floor(P.y / T) - r.ty0}` : `${Math.floor(P.x / T)},${Math.floor(P.y / T)}`; HUD.fine(`${Math.round(FPS.n)} FPS${DRAW.step ? ' D' + DRAW.step : ''} · ${LEVEL.index + 1} ${s}`, Math.round(HUD.W / 2), HH - 9, '#fee761', 'center'); }
  if (FLIGHT){ const u = FLIGHT.t / FLIGHT.dur; HUD.dark(0.16 + u * 0.3, '#cfe6ff'); HUD.g.globalAlpha = 0.35; for (let k = 0; k < 14; k++){ const y = (k * 37 + Math.floor(time * 60) * 13) % HH, x = (k * 71 + Math.floor(time * 60) * 29) % W; HUD.px('#ffffff', x, y, 18 + (k * 13) % 50, 1); } HUD.g.globalAlpha = 1; if (u > 0.82) HUD.dark((u - 0.82) / 0.18, '#ffffff'); }
  // a fall: the dark comes down after the drops have sunk, and lifts off him rising out of the water; the word over him
  if (DISS){ const t = DISS.t, k = t < DISS_T.dark ? 0 : t < DISS_T.raise ? (t - DISS_T.dark) / (DISS_T.raise - DISS_T.dark) : 1 - (t - DISS_T.raise) / (DISS_T.end - DISS_T.raise); if (k > 0) HUD.dark(Math.min(1, k), '#0b0810'); }
  if (RISEN){ RISEN.t += dt; const t = RISEN.t, a = Math.max(0, Math.min(1, (t - 0.5) / 0.6, (3.4 - t) / 0.8));
    if (a > 0){ HUD.g.globalAlpha = a; HUD.text('PERSEVERE', W / 2, 52, '#cfe6ff', 2, 'center'); HUD.rule(Math.round(W / 2), 72, 46, '#9fe8ff'); HUD.text(RISEN.line, W / 2, 80, '#fff2d0', 1, 'center'); if (RISEN.n > 1) HUD.fine(`${RISEN.n} TIMES`, W / 2, 92, '#8b9bb4', 'center'); HUD.g.globalAlpha = 1; }
    if (t > 3.4) RISEN = null; }
  if (FLASH > 0 && OPT.flash) HUD.dark(FLASH * 1.4, '#ffffff');
  // over what he can use: the key for it
  if (USE && !PAUSE && !TALK.on && !NOTE){ v.set(USE.x, USE.y + (USE.type === 'npc' ? 2.6 : 1.5), 0).project(R.camera); HUD.prompt(Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * HH), USE.type === 'npc' ? 'TALK' : USE.type === 'flame' ? (G.under ? 'THE WATER' : 'TIE KNOTS') : 'OPEN', time, kname('down')); }
  TALK.draw(HUD, dt, time);
  if (NOTE) drawCard(NOTE, W, true); else if (!(PAUSE && (SCREEN === 'carry' || SCREEN === 'shop'))) flavour('');
  if (PAUSE && SCREEN === 'annals') drawAnnals(W);
  else if (PAUSE && SCREEN === 'map') drawMap();
  else if (PAUSE && SCREEN === 'shop') drawShop(W);
  else if (PAUSE && SCREEN === 'knots') drawKnots(W);
  else if (PAUSE && SCREEN === 'under') drawUnder(W);
  else if (PAUSE && SCREEN === 'carry') drawCarry(W);
  else if (PAUSE && SCREEN === 'keys'){ HUD.dark(0.82); const lines = []; for (const l of HINT[DEVICE.kind === 'keys' ? 'keys' : DEVICE.kind === 'touch' ? 'touch' : 'pad']){ let cur = ''; for (const part of String(l).split(' · ')){ const t = cur ? cur + ' · ' + part : part; if (cur && HUD.richW(t) > 270){ lines.push(cur); cur = part; } else cur = t; } if (cur) lines.push(cur); }
    const hh = 30 + lines.length * 13, x = Math.round(W / 2) - 150, y = Math.max(4, Math.round((160 - hh) / 2)); slab(x, y, 300, hh, 'The keys'); lines.forEach((l, i) => HUD.rich(l, x + 14, y + 26 + i * 13, '#c0cbdc')); }
  else if (PAUSE){ HUD.dark(0.72);
    // his goal, across the top: what the whole game is for, and the next step from here
    const nl = wrapFine(goalLines()[1], W - 64); { const [goal] = goalLines(); slab(8, 5, W - 16, 30 + nl.length * 9, 'Your goal', LEVEL.name); HUD.fine(goal, 38, 24, '#fee761', 'left', 0); nl.forEach((l, i) => HUD.fine(l, 38, 33 + i * 9, '#fff2d0', 'left', 0)); }   // (clear of the ribbon's tails; the next step on two lines where it is long)
    // what he has, on the right: each with its own picture, and no sentence anywhere
    { const x = 104, w = W - x - 8, worn = G.worn.filter(id => RELICS[id]), spare = G.relics.length - worn.length, rows = [];
      rows.push(['heart', `${P.hp} OF ${P.maxHp} HEARTS`]); rows.push(['flask', `${P.flask} OF ${P.flaskMax} DRINKS IN YOUR FLASK`]); rows.push(['shard', `${G.shards} SHARDS`]);
      if (G.threads) rows.push(['strand', `${G.threads % THREADS_A_HEART} OF ${THREADS_A_HEART} RED STRANDS TOWARD A HEART`]);
      if (embersKnown()) rows.push(['embers', `${Math.floor(EMBER.n / ARTS.cost)} EMBER POWER${Math.floor(EMBER.n / ARTS.cost) === 1 ? '' : 'S'} READY`]);
      if (G.relics.length) rows.push(['knot', `${worn.length} OF ${knots()} RELIC SLOTS USED${spare ? ` · ${spare} NOT EQUIPPED` : ''}`]);
      rows.push(['skull', G.falls ? `DIED ${G.falls} TIME${G.falls === 1 ? '' : 'S'}` : 'NO DEATHS YET']);
      const hh = 26 + rows.length * 11; const y0 = 44 + nl.length * 9; slab(x, y0, w, hh, 'What you have');
      rows.forEach(([ic, str], i) => { const yy = y0 + 21 + i * 11, px = HUD.px;
        if (ic === 'heart'){ px('#181425', x + 12, yy - 1, 9, 7); px('#e43b44', x + 13, yy, 7, 4); px('#f6757a', x + 13, yy, 7, 1); px('#a22633', x + 13, yy + 3, 7, 1); }
        else if (ic === 'shard'){ px('#2ce8f5', x + 15, yy - 1, 3, 6); px('#0099db', x + 14, yy + 1, 5, 2); px('#ffffff', x + 16, yy - 1, 1, 2); }
        else if (ic === 'strand'){ px('#181425', x + 13, yy - 1, 7, 7); px('#e43b44', x + 14, yy, 5, 5); px('#f6757a', x + 14, yy, 5, 1); }
        else if (ic === 'skull'){ px('#c0cbdc', x + 14, yy - 1, 5, 4); px('#c0cbdc', x + 15, yy + 3, 3, 2); px('#181425', x + 15, yy + 1, 1, 1); px('#181425', x + 17, yy + 1, 1, 1); }
        else { HUD.g.save(); HUD.g.beginPath(); HUD.g.rect(x + 9, yy - 3, 16, 11); HUD.g.clip(); drawIcon(px, ic, x + 9, yy - 6, 1); HUD.g.restore(); }
        HUD.fine(str, x + 30, yy, '#c0cbdc', 'left', 0); });
      }
    HUD.version(VERSION_LINES.slice(0, 1), 0.5, 8, 'left', 170); }
  if (GO.st) HUD.dark(GO.st === 'out' ? Math.min(1, GO.t / 0.6) : GO.st === 'in' ? Math.max(0, 1 - GO.t / 0.7) : 1);   // going up: dark between regions
  HUD.end();
  const pips = document.getElementById('pips'), pv = '●'.repeat(P.flask) + '○'.repeat(Math.max(0, P.flaskMax - P.flask)); if (pips && pips.textContent !== pv) pips.textContent = pv;
}
window.__side = { TRYING, DRAW, options, copySave, pasteSave, FPS, get arrows(){ return ARROWS; }, knotMenu, tryMenu, tryStart, TRIES, MOMENTS, TRY, waterMenu, goUnder, waterList, get under(){ return UNDER; }, set atWater(v){ ATWATER = v; }, get shrines(){ return SHRINES; }, giftStart, get gift(){ return GIFT; }, teach: TEACHER, card, carryScreen, onEvent: e => onEvent(e), get music(){ return MUSIC; }, get GO(){ return GO; }, get ENT(){ return ENT; }, low: LOW, entered: ENTERED, crossed: CROSSED, gate: GATE, annals, score: SCORE, get P(){ return P; }, set P(v){ P = v; }, R, LEVEL, RULE, VERSION, CAN, PHASE, G, OPT, get props(){ return PROPS; }, get items(){ return ITEMS; }, talk: TALK, shop, pause, learn, get note(){ return NOTE; }, weapons: null, CAM, input: null, get E(){ return E; }, get BOSS(){ return BOSS; }, capture: CAPTURE, go, enter, story: STORY, title, get scarf(){ return SCF; }, ember: EMBER };
import('../core/input.js').then(m => { window.__side.input = m; });
import('../config/weapons.js').then(m => { window.__side.weapons = m.WEAPONS.sword; });
addEventListener('pointerdown', () => ac(), { once: true });
requestAnimationFrame(frame);
