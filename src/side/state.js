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
const blank = () => ({ seamed: 1, level: 0, top: 0, beat: [], shards: 0, threads: 0, hearts: 0, flasks: 0, edge: 0, relics: [], worn: [], knots: 0, arms: [], wield: 'blade', got: {}, broke: {}, met: {}, charts: [], began: false, falls: 0, seen: {}, slain: {}, keepers: {}, blocked: {}, fallsBy: {}, sealed: {}, rooms: {}, joined: 1 });
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
function joined(S){
  if (S.joined) return; S.joined = 1;
  for (const n of Object.keys(JOIN_MOVED)){ const [dx, dy] = JOIN_MOVED[n], mv = id => { const m = /^([a-z]?)(-?\d+),(-?\d+)$/.exec(id); return m ? m[1] + (+m[2] + dx) + ',' + (+m[3] + dy) : id; };
    for (const k of ['got', 'broke', 'blocked']) if (S[k] && S[k][n]) S[k][n] = S[k][n].map(mv); }
}
export function loadSave(){ const s = read(KEY); Object.assign(G, blank()); if (s && typeof s === 'object'){ seamed(s); joined(s); knotted(s); Object.assign(G, s); G.top = Math.max(G.top || 0, G.level || 0); G.began = true; } const o = read(OKEY); if (o) Object.assign(OPT, o); return G; }
export function store(){ try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e){} }
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
export const maxHearts = () => Math.max(2, Math.min(9, TUNE.player.hp + Math.floor(G.threads / THREADS_A_HEART) + G.hearts + [2, 0, -2][OPT.diff]));
export const maxFlask = () => Math.min(6, TUNE.player.flask + G.flasks);
export const took = (n, id) => (G.got[n] || []).includes(id);
export const take = (n, id) => { (G.got[n] = G.got[n] || []).push(id); store(); };
export const DIFF = ['Story', 'Climber', 'Summit'];
// the relics: one hidden in each region
export const RELICS = {   // name: whose it was; line: what it does; lore: whose it was, and what became of them (docs/writing.md, names 7)
  whetstone:   { name: 'Well-keeper\'s Whetstone', line: 'The last cut of each string hits harder (+1).', lore: 'Worn hollow by the Well\'s keepers, honing the hooks they drew water with.' },
  lodestone:   { name: 'Bell-ringer\'s Lodestone', line: 'Shards and embers fly to him from twice as far.', lore: 'Hung in the belfry, so the ringers knew where the summit was on a night with no light.' },
  featherfall: { name: 'Climber\'s Knot',          line: 'No fall can hurt him.',                          lore: 'Tied by one who sat down to rest. The rope is gone; the knot held.' },
  stormglass:  { name: 'Wright\'s Stormglass',     line: 'His plunge strikes with lightning: wider, and +1 harm.', lore: 'The Wrights\' first jar. It caught one bolt and kept it, which was the whole trouble.' },
  seedheart:   { name: 'Gardener\'s Seed',         line: 'Mending a heart costs 7 embers instead of 10.',  lore: 'The gardeners kept back one seed from every sowing, in case. This was the last.' },
  tally:       { name: 'Guild Tally',            line: 'Urns give 50% more shards.',                     lore: 'Every shift was chalked up and paid in shards. The last was never paid.' },
  stylus:      { name: 'Sexton\'s Stylus',       line: 'Each creature he kills gives 2 more embers.', lore: 'It scratched a mark for every one of his falls. Under them, in another hand, the whole count is struck through.' },
  starcompass: { name: 'Astronomer\'s Compass',    line: 'The map shows what is still to be found.',       lore: 'It does not point north. It points at the star that is missing.' },
};
// what each keeper leaves him, by region: `does`, plainly; `how`, with the keys ({action}, teach.js fill); `icon`, its picture
export const TEACH = [
  { can: 'breaker', icon: 'spade', name: 'The Warden\'s Spade', does: 'A heavy weapon. Only it breaks cracked stone. He cannot block with it.', how: ['{swap}: blade or spade.', 'Three slow blows; the last sends a wave along the ground.', 'In the air, {down} + {attack}: its plunge breaks the floor under him.', 'With a measure of embers, {down} + {art}: a blow runs along the floor both ways.'] },
  { can: 'dash',    icon: 'dash',    name: 'The Toll\'s Step',     does: 'The ringers\' boots. A roll in the air flies him level and fast, once a jump.', how: ['{roll}, in the air.', 'With a measure of embers, {art}: he rushes through what is before him.'] },
  { can: 'glide',   icon: 'glide',   name: 'The Wyrm\'s Wind',     does: 'A wyrm\'s scale, tied into his scarf. He can glide, and rising air lifts him.', how: ['{jump} again when his jumps are spent, and hold it.', 'With a measure of embers, {art} in the air: a wind throws what is round him.'] },
  { heart: 1,       icon: 'heart',   name: 'The Thunderhead\'s Heart', does: 'One heart more.', how: [] },
  { flask: 1,       icon: 'flask',   name: 'Mother Thorn\'s Dew',    does: 'The flask holds one draught more.', how: [] },
  { name: '', how: [] },
  { name: '', how: [] },   // the Workings: no keeper
];
