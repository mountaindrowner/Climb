// What is kept between sittings: how far up he has got and what he has found (G, the save), and how the player likes
// the game set (OPT). Both live in the browser's own storage; nothing leaves the device.
//   G.level   the region he is in         G.top     the highest he has reached (he may go back down to any below it)
//   G.beat[n] region n's keeper has fallen (and what it taught is his: TEACH)
//   G.shards  the currency                G.threads scarf threads found (three make a heart)
//   G.hearts, G.flasks, G.edge            bought or won: hearts and flask draughts over the first, the blade tempered
//   G.relics  ids of the relics he carries (RELICS); G.worn the ones tied into his scarf (one a knot: KNOTS)
//   G.knots   knots Ordric has tied in the scarf over the first two
//   G.arms    what he has besides the blade ('spade'); G.wield which he has in hand
//   G.got[n]  what has been taken in region n (chests, threads, urns), G.broke[n] the cracked rock broken there
//   G.met     how many times each person has been spoken to, by region; G.charts regions whose chart he has bought
//   G.falls   how many times he has fallen, which is how many times he has been raised; G.fallsBy[n] in region n
//   G.blocked[n] the cracked stone he has come to in region n and could not break (Corwen's map marks it);
//   G.sealed[n] region n's page is full: every room seen, every strand, chest and relic found
//   G.seen, G.slain, G.keepers: what he has met, killed, and which keepers he has faced (Corwen's Annals, annals.js)
import { TUNE } from '../config/tuning.js';
const KEY = 'climb-side', OKEY = 'climb-side-opts';
const blank = () => ({ can: {}, seamed: 1, level: 0, top: 0, beat: [], shards: 0, threads: 0, hearts: 0, flasks: 0, edge: 0, relics: [], worn: [], knots: 0, arms: [], wield: 'blade', got: {}, broke: {}, met: {}, charts: [], began: false, falls: 0, seen: {}, slain: {}, keepers: {}, blocked: {}, fallsBy: {}, sealed: {}, rooms: {}, joined: 1, winged: 4 });
export const G = blank();
export const OPT = { music: 0.7, sfx: 1, voice: 0.8, text: 'normal', shake: 1, flash: 1, diff: 1, synth: false, rumble: true, phone: 'auto', hints: true };   // hints: the opening's help when he struggles (teach.js)   // phone: 'auto' (by the device), true, false   // diff: 0 story, 1 climber, 2 summit
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e){ return null; } };
// the seams (build 30) moved the Cloister and the regions above it up three rooms (69 tiles): what a save had found and
// broken there is by tile, so it is moved up with them, once
const SEAM_ROWS = 69;
function seamed(S){
  if (S.seamed) return; S.seamed = 1;
  const up = id => { const m = /^([a-z]?)(-?\d+),(-?\d+)$/.exec(id); return m ? m[1] + m[2] + ',' + (+m[3] + SEAM_ROWS) : id; };
  for (const n of [1, 2, 3, 4, 5]){ if (S.got && S.got[n]) S.got[n] = S.got[n].map(up); if (S.broke && S.broke[n]) S.broke[n] = S.broke[n].map(up); }
}
// the joins (build 56) moved the regions again: rows under each for the sill and the passage's lower stretch, and the
// Tempest a room to the right. By region: [tiles right, tiles up] (tests/side-join.test.mjs holds these to level.js)
export const JOIN_MOVED = { 1: [0, 46], 2: [0, 69], 3: [40, 69], 4: [0, 46], 5: [0, 69] };
// the Scriptorium (build 60) is three rooms to the west of the Cloister: its places moved 120 tiles east with it
// the Pilgrims' Cairns (build 62) are three rooms to the west of the Spires: the same, there. [dx, dy, since]: `since`
// the count a save's `winged` must be under for the move still to be owed
// the Wreck of the Works (build 66) is three rooms to the west of the Tempest, which stood one room in already: 80 tiles
// the Aqueducts (build 68) are three rooms to the west of the Gardens: 120 tiles
export const WING_MOVED = { 1: [120, 0, 1], 2: [120, 0, 2], 3: [80, 0, 3], 4: [120, 0, 4] };
function winged(S){
  const have = S.winged || 0; if (have >= 4) return; S.winged = 4;
  for (const n of Object.keys(WING_MOVED)){ const [dx, dy, since] = WING_MOVED[n]; if (have >= since) continue; const mv = id => { const m = /^([a-z]?)(-?\d+),(-?\d+)$/.exec(id); return m ? m[1] + (+m[2] + dx) + ',' + (+m[3] + dy) : id; };
    for (const k of ['got', 'broke', 'blocked', 'lit']) if (S[k] && S[k][n]) S[k][n] = S[k][n].map(mv); }
}
function joined(S){
  if (S.joined) return; S.joined = 1;
  for (const n of Object.keys(JOIN_MOVED)){ const [dx, dy] = JOIN_MOVED[n], mv = id => { const m = /^([a-z]?)(-?\d+),(-?\d+)$/.exec(id); return m ? m[1] + (+m[2] + dx) + ',' + (+m[3] + dy) : id; };
    for (const k of ['got', 'broke', 'blocked']) if (S[k] && S[k][n]) S[k][n] = S[k][n].map(mv); }
}
// (build 87) what he can do is no longer read off which keepers have fallen: the air dash is the Cracked Bell's. A save
// from before keeps what it had
function gifted(S){ if (S.can) return; const b = n => !!(S.beat && S.beat[n]) || (S.top || 0) > n; S.can = {}; if (b(1)) S.can.dash = 1; if (b(2)) S.can.glide = 1; }
export function loadSave(){ const s = read(KEY); Object.assign(G, blank()); if (s && typeof s === 'object'){ seamed(s); joined(s); winged(s); knotted(s); gifted(s); Object.assign(G, s); G.top = Math.max(G.top || 0, G.level || 0); G.began = true; } const o = read(OKEY); if (o) Object.assign(OPT, o); return G; }
// trying a place from the title (main.js tryStart): what happens then is not his save. It is written beside it, and his
// own is not touched
export const TRY = { on: false };
export function store(){ try { localStorage.setItem(TRY.on ? KEY + '-try' : KEY, JSON.stringify(G)); } catch (e){} }
// the save in hand made new, the one in the browser left as it is
export function fresh(){ for (const k of Object.keys(G)) delete G[k]; Object.assign(G, blank()); }
export function storeOpt(){ try { localStorage.setItem(OKEY, JSON.stringify(OPT)); } catch (e){} }
export function wipe(){ Object.assign(G, blank()); try { localStorage.removeItem(KEY); } catch (e){} }
// a relic works only while it is tied into the scarf; he can carry more than he can wear, and chooses at a flame
export const has = id => (G.worn || []).includes(id);
export const owns = id => G.relics.includes(id);
export const KNOTS = { base: 2, most: 5, cost: [120, 240, 400] };   // two to start; Ordric ties the rest, for shards
export const knots = () => Math.min(KNOTS.most, KNOTS.base + (G.knots || 0));
// tie (or untie) a relic he carries: false when there is no knot free, or he does not carry it
export function wear(id, on = !has(id)){
  if (!owns(id)) return false; const W = G.worn = G.worn || [];
  if (!on){ if (W.includes(id)) W.splice(W.indexOf(id), 1); return true; }
  if (W.includes(id)) return true; if (W.length >= knots()) return false; W.push(id); return true;
}
// a save from before the knots (build 39): what he carried, he wore, as many as there are knots for
function knotted(S){ if (!Array.isArray(S.worn)){ const n = (S.relics || []).length; S.knots = Math.max(0, Math.min(KNOTS.most - KNOTS.base, n - KNOTS.base)); S.worn = (S.relics || []).slice(0, KNOTS.base + S.knots); } }
export const THREADS_A_HEART = 3;
export const maxHearts = () => Math.max(2, Math.min(10, Math.min(9, TUNE.player.hp + Math.floor(G.threads / THREADS_A_HEART) + G.hearts + [2, 0, -2][OPT.diff]) + (has('place') ? 1 : 0)));   // (the Second Place: one heart more)
export const maxFlask = () => Math.min(7, Math.min(6, TUNE.player.flask + G.flasks) + (has('yoke') ? 1 : 0));   // (the Carrier's Yoke: one draught more)
export const took = (n, id) => (G.got[n] || []).includes(id);
export const take = (n, id) => { (G.got[n] = G.got[n] || []).push(id); store(); };
export const DIFF = ['Story', 'Climber', 'Summit'];
// the relics: one hidden in each region
export const RELICS = {   // name: whose it was; line: what it does; lore: whose it was, and what became of them (docs/writing.md, names 7)
  whetstone:   { name: 'Well-keeper\'s Whetstone', line: 'The last hit of each combo does +1 damage.', lore: 'Worn hollow by the Well\'s keepers, honing the hooks they drew water with.' },
  lodestone:   { name: 'Bell-ringer\'s Lodestone', line: 'Shards and embers fly to you from twice as far.', lore: 'Hung in the belfry, so the ringers knew where the summit was on a night with no light.' },
  featherfall: { name: 'Climber\'s Knot',          line: 'You take no damage from falling.',                          lore: 'Tied by one who sat down to rest. The rope is gone; the knot held.' },
  stormglass:  { name: 'Wright\'s Stormglass',     line: 'Your slam strikes with lightning: wider, and +1 damage.', lore: 'The Wrights\' first jar. It caught one bolt and kept it, which was the whole trouble.' },
  seedheart:   { name: 'Gardener\'s Seed',         line: 'Each drink from your flask heals 1 more heart.',  lore: 'The gardeners kept back one seed from every sowing, in case. This was the last.' },
  tally:       { name: 'Guild Tally',            line: 'Urns give 50% more shards.',                     lore: 'Every shift was chalked up and paid in shards. The last was never paid.' },
  stylus:      { name: 'Sexton\'s Stylus',       line: 'Each creature you kill gives 2 more embers.', lore: 'It scratched a mark for every one of his falls. Under them, in another hand, the whole count is struck through.' },
  blankleaf:   { name: 'Copyist\'s Blank Leaf',   line: 'After you rest at a pool, the first hit you take does no damage.', lore: 'The one page in the house that was never spoiled. Nothing was ever written on it.' },
  felt:        { name: 'Founder\'s Felt',        line: 'A perfect block stuns every creature near you for a moment.', lore: 'The founders wrapped a tongue in it when a bell was to be struck and not heard.' },
  boots:       { name: 'Wright\'s Boots',         line: 'Electrified iron does not hurt you.', lore: 'Cork and gum. The Wrights wore them to walk their own works. They did not take them off to sleep.' },
  stillair:    { name: 'A Breath of the Eye',    line: 'You sink more slowly while gliding.', lore: 'Air from the middle of the storm, where nothing moves. It was kept behind a door that opens to no one in a hurry.' },
  yoke:        { name: 'Carrier\'s Yoke',        line: 'Your flask holds one more drink.', lore: 'Before the channel was cut, the water came up from the pool on men\'s shoulders. One of them left this at the head.' },
  place:       { name: 'The Second Place',       line: 'You have one more heart.', lore: 'In his house the table was laid for two. He took his own place from it. The other is still laid.' },
  lastpage:    { name: 'The Last Page',          line: 'Once per rest, a hit that would kill you leaves you with one heart.', lore: 'The almanac\'s last page. Every other has an hour on it. This one is blank.' },
  shiftbell:   { name: 'The Shift Bell',         line: 'You swim faster, and eels do not notice you.', lore: 'It called the shift up at the end of the day. That night nobody rang it.' },
  tallysend:   { name: 'The Tally\'s End',       line: 'Once per rest, the first Echo that catches you does no damage.', lore: 'The last leaf of the guild\'s tally. A depth, and under it, in the hand that wrote every entry for two hundred years, one word: ENOUGH.' },
  lastrope:    { name: 'The Last Rope',          line: 'You climb up onto edges twice as fast.', lore: 'The camp hung on it. It was let out to its end and tied off, and nobody came back up it.' },
  lampstone:   { name: 'Raw Lampstone',          line: 'Your lamp lights a wider area.', lore: 'A piece of the vein that gives light without being broken. The guild sealed the level it came from, and then opened it again.' },
  flint:       { name: 'Climber\'s Flint',        line: 'Each hit you land gives 2 embers instead of 1.', lore: 'It lit the shelter\'s fire every night of the climb. On the last night no one struck it.' },
  turnstone:   { name: 'Pilgrim\'s Stone',        line: 'After you are hit, nothing can hit you again for a little longer.', lore: 'The top stone of a cairn. You carried it up once, and set it down. NOT YET is scratched on it.' },
  starcompass: { name: 'Astronomer\'s Compass',    line: 'Your map shows what is left to find.',       lore: 'It does not point north. It points at the star that is missing.' },
};
// what each keeper leaves him, by region: `does`, plainly; `how`, with the keys ({action}, teach.js fill); `icon`, its picture
// What a wing's keeper guards (build 87; decision 0.13: abilities from minibosses, weapons from keepers). It is in a
// chest of its own kind that opens when the keeper of the wing has fallen (items.js: `holds: 'gift:dash'`), and it is
// his from then on: G.can
export const ABILITY = {
  dash: { can: 'dash', icon: 'dash', name: 'The Bell\'s Step', does: 'An air dash. You fly level and fast, once per jump.', how: ['{roll} in the air: dash.', 'A dash breaks thin ice and tears vellum: the pale sheets across some ways.'], more: ['With 10 embers, {art}: rush through everything in front of you.'] },
};
// by which region of the climb he has each thing he can do, if he has done what the way there asks (a place tried from
// the title, and the tests' "what he arrives with")
export const ARRIVES = { breaker: 1, dash: 2, glide: 3 };
export const TEACH = [
  { can: 'breaker', icon: 'hammer', name: 'The Warden\'s Hammer', does: 'A heavy weapon. Slow, triple damage, and it knocks creatures back. It breaks cracked stone. It cannot block.', how: ['{swap}: switch between sword and hammer.', 'In the air, {down} + {attack}: slam down. It breaks cracked floors.'], more: ['Its third hit sends a wave along the ground.', 'With 10 embers, {down} + {art}: a shockwave along the floor, both ways.'] },
  { heart: 1,       icon: 'heart',   name: 'The Toll\'s Heart',    does: 'You have one more heart.', how: [] },   // (until its weapon is made: docs/gifts-sheet.md. The air dash it used to leave is the Cracked Bell's: ABILITY)
  { can: 'glide',   icon: 'glide',   name: 'The Wyrm\'s Wind',     does: 'You can glide. Rising air lifts you. In deep water you can dive.', how: ['In the air with no jumps left: hold {jump} to glide.', 'In deep water: {jump} to swim up, {down} to dive.'], more: ['With 10 embers, {art} in the air: a gust throws back everything near you.'] },
  { heart: 1,       icon: 'heart',   name: 'The Thunderhead\'s Heart', does: 'You have one more heart.', how: [] },
  { flask: 1,       icon: 'flask',   name: 'Mother Thorn\'s Dew',    does: 'Your flask holds one more drink.', how: [] },
  { name: '', how: [] },
  { name: '', how: [] },   // the Workings: no keeper
  { name: '', how: [] },   // the Vein: none of the mountain's keepers (the Assayer is its own, as a wing's is)
  { name: '', how: [] },   // the Flooded Levels: the Pump is its own
  { name: '', how: [] },   // the Great Shaft: nobody
  { can: 'grip',    icon: 'grip',    name: 'The Auger\'s Grip',    does: 'You can climb rough rock: the pale, chiselled walls.', how: ['Push into a rough wall to grab it. Keep pushing to climb.', '{down}: climb down. {jump}: jump off.'] },
];
