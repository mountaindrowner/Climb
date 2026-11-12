// What is kept between sittings: how far up he has got and what he has found (G, the save), and how the player likes
// the game set (OPT). Both live in the browser's own storage; nothing leaves the device.
//   G.level   the region he is in         G.top     the highest he has reached (he may go back down to any below it)
//   G.beat[n] region n's keeper has fallen (and what it taught is his: TEACH)
//   G.shards  the currency                G.threads scarf threads found (three make a heart)
//   G.hearts, G.flasks, G.edge            bought or won: hearts and flask draughts over the first, the blade tempered
//   G.relics  ids of the relics he carries (RELICS)
//   G.got[n]  what has been taken in region n (chests, threads, urns), G.broke[n] the cracked rock broken there
//   G.met     how many times each person has been spoken to, by region; G.charts regions whose chart he has bought
//   G.falls   how many times he has fallen, which is how many times he has been raised
import { TUNE } from '../config/tuning.js';
const KEY = 'climb-side', OKEY = 'climb-side-opts';
const blank = () => ({ level: 0, top: 0, beat: [], shards: 0, threads: 0, hearts: 0, flasks: 0, edge: 0, relics: [], got: {}, broke: {}, met: {}, charts: [], began: false, falls: 0 });
export const G = blank();
export const OPT = { music: 0.7, sfx: 1, shake: 1, flash: 1, diff: 1, synth: false, rumble: true };   // diff: 0 story, 1 climber, 2 summit
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e){ return null; } };
export function loadSave(){ const s = read(KEY); Object.assign(G, blank()); if (s && typeof s === 'object'){ Object.assign(G, s); G.top = Math.max(G.top || 0, G.level || 0); G.began = true; } const o = read(OKEY); if (o) Object.assign(OPT, o); return G; }
export function store(){ try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e){} }
export function storeOpt(){ try { localStorage.setItem(OKEY, JSON.stringify(OPT)); } catch (e){} }
export function wipe(){ Object.assign(G, blank()); try { localStorage.removeItem(KEY); } catch (e){} }
export const has = id => G.relics.includes(id);
export const THREADS_A_HEART = 3;
export const maxHearts = () => Math.max(2, Math.min(9, TUNE.player.hp + Math.floor(G.threads / THREADS_A_HEART) + G.hearts + [2, 0, -2][OPT.diff]));
export const maxFlask = () => Math.min(6, TUNE.player.flask + G.flasks);
export const took = (n, id) => (G.got[n] || []).includes(id);
export const take = (n, id) => { (G.got[n] = G.got[n] || []).push(id); store(); };
export const DIFF = ['Story', 'Climber', 'Summit'];
// the relics: one hidden in each region
export const RELICS = {
  whetstone:   { name: 'Whetstone',        line: 'The third cut bites deeper.' },
  lodestone:   { name: 'Lodestone',        line: 'Shards and embers come to him from further off.' },
  featherfall: { name: 'Featherfall Charm', line: 'No fall can hurt him.' },
  stormglass:  { name: 'Stormglass',       line: 'His plunge lands with lightning: wider, and harder.' },
  seedheart:   { name: 'Seed-heart',       line: 'Seven embers mend a heart, where it took ten.' },
  starcompass: { name: 'Star Compass',     line: 'The map shows what is still to be found.' },
};
// what each keeper leaves him, by region
export const TEACH = [
  { can: 'breaker', name: 'The Warden\'s Weight', lines: ['His plunge and his finishing cut now break cracked stone.', 'Plunge: down + cut, in the air.'] },
  { can: 'dash',    name: 'The Toll\'s Step',     lines: ['A roll begun in the air now flies level and fast.', 'Once, each time he leaves the ground.'] },
  { can: 'glide',   name: 'The Wyrm\'s Wind',     lines: ['The thread opens: jump again when the jumps are spent, and hold.', 'In rising air it carries him. He need not do it all himself.'] },
  { heart: 1,       name: 'A Storm\'s Heart',     lines: ['A heart more: the thread grows a length.'] },
  { flask: 1,       name: 'The Garden\'s Dew',    lines: ['The flask holds a draught more of the water.'] },
  { name: '', lines: [] },
];
