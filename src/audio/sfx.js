// The game's sound. Every sound has a name, and is asked for the same way: sfx.hit(), sfx.swing(true). If there is a
// recording of it (assets/audio, made with PixelLab and packed by tools/audio-pack.py; manifest.json lists them) that is
// played, a little different in pitch each time; if not, a sound synthesised here stands in, so nothing is ever silent
// for want of a file, and a new recording dropped in the folder is used without a change to the game.
// Four volumes: the master (settings), and under it the effects, the music and the voices (MIX), each its own bus.
import { SET } from '../core/settings.js';
import { utter } from './voice.js';
let AC = null, OUT = null, SFX = null, MUS = null, VOX = null;   // OUT: the master; SFX, MUS, VOX (the voices): the buses under it
export const MIX = { sfx: 1, music: 0.7, voice: 0.8 };
export const MANIFEST = { sfx: {}, music: {}, base: 'assets/audio/' };
const BANK = {}, LAST = {};
// The recordings are fetched in the order they are wanted, a few at a time, so they never crowd out the pictures the
// first minute needs: warm() starts it (the game calls it once the opening is in hand; the first press does too). What
// is fetched before the sound is allowed to start (a browser waits for a press) is kept, and decoded the moment it can be.
const FIRST = ['crack', 'whoosh', 'thunder', 'bell', 'splash', 'impact', 'ui', 'talk', 'step', 'jump', 'land', 'swing', 'hit', 'roll', 'amb_cave', 'urn', 'shard'];
const RAW = {};
let warmed = false;
const decode = name => { if (!AC || !RAW[name] || BANK[name]) return; const b = RAW[name]; RAW[name] = null; AC.decodeAudioData(b).then(buf => { if (buf) BANK[name] = buf; }).catch(() => {}); };
const READY = (typeof fetch === 'function' && typeof location !== 'undefined')
  ? fetch(MANIFEST.base + 'manifest.json').then(r => r.ok ? r.json() : null).then(m => { if (m){ Object.assign(MANIFEST.sfx, m.sfx); Object.assign(MANIFEST.music, m.music); } }).catch(() => {})
  : Promise.resolve();
export const manifestReady = () => READY;
export function warm(){
  if (warmed) return; warmed = true;
  READY.then(() => {
    const names = Object.keys(MANIFEST.sfx), queue = [...FIRST.filter(n => names.includes(n)), ...names.filter(n => !FIRST.includes(n))];
    const next = () => { const name = queue.shift(); if (!name) return;
      fetch(MANIFEST.base + MANIFEST.sfx[name].f).then(r => r.ok ? r.arrayBuffer() : null).then(b => { if (b){ RAW[name] = b; decode(name); } }).catch(() => {}).finally(next); };
    for (let k = 0; k < 4; k++) next();
  });
}
function loadBank(){ warm(); for (const name in RAW) decode(name); }
export function ac(){
  if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); OUT = AC.createGain(); OUT.gain.value = SET.volume; OUT.connect(AC.destination);
    SFX = AC.createGain(); SFX.gain.value = MIX.sfx; SFX.connect(OUT); MUS = AC.createGain(); MUS.gain.value = MIX.music; MUS.connect(OUT); VOX = AC.createGain(); VOX.gain.value = MIX.voice * MIX.voice; VOX.connect(OUT); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  if (AC) loadBank();
  return AC;
}
export const musicBus = () => MUS;
export const loaded = () => Object.keys(BANK).length;   // how many recordings are in (a check)
export function setMix(k, v){ MIX[k] = v; const b = k === 'sfx' ? SFX : k === 'voice' ? VOX : MUS; if (b && AC) b.gain.setTargetAtTime(k === 'voice' ? v * v : v, AC.currentTime, 0.05); }   // the voices' loudness follows the square of the setting, so its steps sound even
// the voices: one syllable of a speaker's mumble (voice.js), on their own bus
export function say(V, syl){ if (AC && VOX && AC.state === 'running') utter(AC, VOX, V, syl); }
// a recording, if there is one: false if not (the caller falls back). vol, rate; jitter: how far its pitch may stray
function sample(name, vol = 1, rate = 1, jitter = 0.05, gap = 0.04){
  const buf = BANK[name]; if (!buf || !AC) return false;
  const now = AC.currentTime; if (now - (LAST[name] || -9) < gap) return true; LAST[name] = now;   // not the same sound twice in a moment
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = buf; s.playbackRate.value = rate * (1 + (Math.random() * 2 - 1) * jitter); g.gain.value = vol;
  s.connect(g).connect(SFX); s.start(now); return true;
}
// an ambience: a recording that goes round under everything, one at a time, faded between
let ambNow = '', ambNode = null;
export function ambience(name, vol = 0.5){
  if (!AC) return; const key = name ? 'amb_' + name : '';
  if (key === ambNow && (ambNode || !key)) return; if (key && !BANK[key]){ if (ambNow && !key) ambNow = ''; if (!MANIFEST.sfx[key]) return; if (ambNow !== key && ambNode){ ambNode.g.gain.setTargetAtTime(0, AC.currentTime, 0.5); ambNode.s.stop(AC.currentTime + 2.5); ambNode = null; } ambNow = key; return; }
  if (ambNode){ ambNode.g.gain.setTargetAtTime(0, AC.currentTime, 0.5); ambNode.s.stop(AC.currentTime + 2.5); ambNode = null; }
  ambNow = key; if (!key) return;
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = BANK[key]; s.loop = true; g.gain.value = 0; g.gain.setTargetAtTime(vol, AC.currentTime, 0.8); s.connect(g).connect(SFX); s.start(); ambNode = { s, g };
}
function tone(freq, dur, type, vol, slide){
  const a = AC; if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(SFX); o.start(t); o.stop(t + dur + 0.02);
}
let noiseBuf = null;
function noise(dur, vol, freq){
  const a = AC; if (!a) return;
  if (!noiseBuf){
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq || 1200;
  g.gain.setValueAtTime(vol || 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(SFX); s.start(t); s.stop(t + dur + 0.02);
}
export function setVolume(v){ if (OUT) OUT.gain.value = v; }
const SYNTH = {
  step(){ tone(72, 0.09, 'sine', 0.22, -30); noise(0.05, 0.05, 380); },
  rewind(){ tone(110, 1.6, 'sawtooth', 0.05, 1500); tone(220, 1.6, 'triangle', 0.05, 2600); noise(1.5, 0.05, 5200); },   // everything running back: rising, thin, fast
  creep(){ tone(64, 0.06, 'sine', 0.06, -16); noise(0.035, 0.015, 300); },   // a crouched, careful footfall: barely there
  jump(){ tone(260, 0.12, 'square', 0.04, 220); },
  slash(){ noise(0.09, 0.09, 2600); },
  hit(){ tone(170, 0.1, 'square', 0.07, -90); noise(0.06, 0.07, 1500); },
  impact(heavy){ tone(heavy ? 70 : 92, heavy ? 0.18 : 0.12, 'sine', heavy ? 0.4 : 0.3, -55); noise(heavy ? 0.1 : 0.07, heavy ? 0.12 : 0.09, 750); tone(1400, 0.05, 'triangle', 0.03, -500); },   // the weight under a landed blow
  clang(){ tone(620, 0.12, 'triangle', 0.06, -200); },
  parry(){ tone(1150, 0.16, 'triangle', 0.1, 600); tone(1700, 0.1, 'sine', 0.05, 300); },
  block(){ tone(300, 0.08, 'square', 0.05, -100); noise(0.05, 0.06, 900); },
  hurt(){ tone(120, 0.28, 'sawtooth', 0.09, -60); },
  gold(){ tone(900, 0.06, 'square', 0.035, 300); },
  crack(){ noise(0.25, 0.08, 700); },
  slam(){ tone(48, 0.45, 'sine', 0.35, -18); noise(0.35, 0.14, 300); },
  roar(){ tone(70, 0.9, 'sawtooth', 0.08, -30); noise(0.8, 0.06, 500); },
  spit(){ tone(420, 0.2, 'sawtooth', 0.05, -250); },
  splash(){ noise(0.8, 0.16, 900); tone(220, 0.5, 'sine', 0.06, 300); },
  fall(){ tone(500, 1.4, 'sine', 0.05, -440); },
  repair(){ tone(520, 0.08, 'square', 0.05, 0); setTimeout(() => tone(780, 0.12, 'square', 0.05, 0), 90); },
  drink(){ tone(340, 0.25, 'sine', 0.07, 260); },
  creak(){ tone(130, 0.4, 'sawtooth', 0.025, 70); noise(0.3, 0.03, 420); },
  shriek(){ tone(1900, 0.16, 'square', 0.03, 900); tone(2500, 0.12, 'sine', 0.02, -700); },
  rumble(){ noise(0.45, 0.07, 220); tone(52, 0.45, 'sine', 0.12, -10); },
  whoosh(){ noise(0.28, 0.07, 1700); },
  // a heavy swing: the air torn (a bright noise sweep), a low thump under it, more of both for a finisher
  swing(big){ noise(big ? 0.22 : 0.16, big ? 0.16 : 0.12, big ? 1900 : 2400); tone(big ? 95 : 140, big ? 0.2 : 0.12, 'sine', big ? 0.32 : 0.2, big ? -45 : -70); tone(big ? 520 : 760, 0.06, 'triangle', 0.04, -400); },
  dash(){ noise(0.24, 0.12, 2800); tone(260, 0.18, 'sawtooth', 0.035, -180); },
  crackbell(big){ tone(big ? 196 : 392, big ? 0.9 : 0.5, 'triangle', 0.1, -8); tone(big ? 277 : 554, 0.5, 'square', 0.025, -14); noise(0.1, 0.04, 3000); },
  snap(){ noise(0.08, 0.1, 3200); tone(300, 0.08, 'square', 0.05, -150); },
};
// which recording a name asks for, and how: a name, or [name, vol, rate, jitter], or a function of the call's arguments.
// A name not here asks for the recording of the same name.
const USE = {
  step: ['step', 0.3, 1, 0.14, 0.09], creep: ['step', 0.12, 0.9, 0.1], jump: ['jump', 0.5], land: ['land', 0.5], slash: ['swing', 0.6],
  swing: big => big ? ['swing_big', 0.8] : ['swing', 0.6, 1, 0.08], hit: ['hit', 0.75, 1, 0.08], impact: heavy => ['impact', heavy ? 1 : 0.7], clang: ['block', 0.7, 1.2],
  parry: ['parry', 0.8], block: ['block', 0.7], hurt: ['hurt', 0.8], gold: ['shard', 0.5, 1, 0.1], shard: ['shard', 0.45, 1, 0.12, 0.05], ember: ['ember', 0.4, 1, 0.15, 0.05],
  crack: ['crack', 0.7], slam: ['slam', 0.9], roar: ['roar', 1], spit: ['spit', 0.6], drink: ['drink', 0.7], creak: ['creak', 0.6], rumble: ['rumble', 0.7],
  whoosh: ['roll', 0.45, 1.1, 0.1], roll: ['roll', 0.55], dash: ['dash', 0.7], snap: ['thorn', 0.7], bossDie: ['boss_die', 1], talk: ['talk', 0.35, 1, 0.12, 0.03], ui: ['ui', 0.5],
  crackbell: big => ['bell', big ? 0.9 : 0.5, big ? 0.71 : 1.42, 0.04],   // the Bell-Foundry's iron: the house's bell, off its note
  thunder: ['thunder', 0.9, 1, 0.1, 0.3], glass: ['glass', 0.3, 1, 0.03, 0.5], gust: ['gust', 0.5, 1, 0.08, 0.8], zap: ['zap', 0.6, 1, 0.1], bell: ['bell', 0.9, 1, 0.01],
};
// any name can be called: the recording if it is loaded, else the synthesised sound, else nothing
export const sfx = new Proxy(SYNTH, { get: (o, k) => (...a) => {
  const u = typeof USE[k] === 'function' ? USE[k](...a) : USE[k] || k, [name, vol, rate, jit, gap] = Array.isArray(u) ? u : [u, 0.7];
  if (!sample(name, vol, rate, jit, gap) && o[k]) o[k](...a);
} });
export function buzz(ms){ try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

// ---- the creatures' own voices (docs/phase6-sheet.md 4), made here: each family a kind of sound, each creature its
// pitch; three each: it notices him, it attacks, it dies. `vol` 0 to 1 (main.js: quieter with distance)
const FAMILY = {   // creature: [family, pitch]
  crawler: ['chitter', 1], burrower: ['chitter', 0.6], thornback: ['chitter', 0.75], lasher: ['rustle', 1], puff: ['rustle', 1.6],
  flitter: ['wing', 1.3], gargoyle: ['wing', 0.7], harpy: ['wing', 1], spitter: ['wet', 1], lamprey: ['wet', 0.8], barnacle: ['wet', 0.65], toad: ['wet', 0.45],
  acolyte: ['grunt', 1], sexton: ['grunt', 0.6], copyist: ['grunt', 1.5], corrector: ['grunt', 0.45], blot: ['wet', 1.3], slag: ['chitter', 0.5], setting: ['chime', 1.6], moth: ['chitter', 1.8], housekeeper: ['chime', 0.35], wheel: ['chime', 0.7], sluicer: ['grunt', 0.5], strider: ['chitter', 1.5], lock: ['grunt', 0.3], hush: ['wet', 0.35], crackedbell: ['chime', 0.3], clapper: ['chime', 0.8], cairn: ['crackle', 0.5], hiscairn: ['crackle', 0.4], turned: ['moan', 0.6], brazier: ['crackle', 1.2], server: ['grunt', 1.2], lever: ['crackle', 1.4], coil: ['crackle', 1.6], crane: ['chime', 0.6], jar: ['crackle', 0.4], sitter: ['moan', 1], seated: ['moan', 0.4], yeti: ['grunt', 0.75], wraith: ['moan', 1], wisp: ['moan', 1.6],
  squall: ['crackle', 0.8], nimbus: ['crackle', 0.6], spark: ['crackle', 1.5], mote: ['chime', 1.4], oculus: ['chime', 1], sentinel: ['chime', 0.5],
};
const later = (ms, f) => setTimeout(f, ms);
const VOICE = {
  chitter: { notice: (p, v) => { for (let k = 0; k < 3; k++) later(k * 55, () => tone(520 * p + k * 60, 0.04, 'square', 0.05 * v, 200)); }, attack: (p, v) => { tone(300 * p, 0.14, 'sawtooth', 0.07 * v, 500); noise(0.08, 0.05 * v, 2400); }, death: (p, v) => { tone(600 * p, 0.25, 'square', 0.06 * v, -520 * p); noise(0.15, 0.06 * v, 1800); } },
  wing: { notice: (p, v) => tone(1500 * p, 0.12, 'sawtooth', 0.045 * v, 700), attack: (p, v) => { tone(1900 * p, 0.18, 'sawtooth', 0.05 * v, -900); noise(0.1, 0.04 * v, 3000); }, death: (p, v) => { tone(1700 * p, 0.22, 'sawtooth', 0.05 * v, -1400 * p); } },
  wet: { notice: (p, v) => { tone(160 * p, 0.12, 'sine', 0.12 * v, 90); noise(0.08, 0.04 * v, 500); }, attack: (p, v) => { tone(120 * p, 0.2, 'sine', 0.13 * v, 160); later(120, () => noise(0.06, 0.06 * v, 900)); }, death: (p, v) => { noise(0.22, 0.12 * v, 700); tone(200 * p, 0.2, 'sine', 0.1 * v, -150 * p); } },
  grunt: { notice: (p, v) => tone(130 * p, 0.16, 'sawtooth', 0.09 * v, 30), attack: (p, v) => { tone(110 * p, 0.26, 'sawtooth', 0.11 * v, 60); noise(0.1, 0.03 * v, 600); }, death: (p, v) => tone(140 * p, 0.5, 'sawtooth', 0.1 * v, -90 * p) },
  moan: { notice: (p, v) => tone(300 * p, 0.4, 'sine', 0.07 * v, 120), attack: (p, v) => tone(260 * p, 0.35, 'triangle', 0.08 * v, 500), death: (p, v) => tone(500 * p, 0.6, 'sine', 0.07 * v, -420 * p) },
  crackle: { notice: (p, v) => { for (let k = 0; k < 4; k++) later(k * 35, () => noise(0.02, 0.07 * v, 5000 * p)); }, attack: (p, v) => { noise(0.14, 0.09 * v, 4200 * p); tone(90 * p, 0.12, 'square', 0.05 * v, 0); }, death: (p, v) => { noise(0.3, 0.09 * v, 3000 * p); tone(240 * p, 0.3, 'square', 0.04 * v, -200 * p); } },
  rustle: { notice: (p, v) => noise(0.16, 0.06 * v, 2600 * p), attack: (p, v) => { noise(0.1, 0.08 * v, 3400 * p); tone(380 * p, 0.08, 'triangle', 0.05 * v, 300); }, death: (p, v) => { tone(500 * p, 0.07, 'sine', 0.12 * v, 500); noise(0.12, 0.07 * v, 1500); } },
  chime: { notice: (p, v) => { tone(1320 * p, 0.3, 'sine', 0.05 * v, 0); later(70, () => tone(1760 * p, 0.3, 'sine', 0.04 * v, 0)); }, attack: (p, v) => tone(880 * p, 0.3, 'triangle', 0.07 * v, 660 * p), death: (p, v) => { for (let k = 0; k < 4; k++) later(k * 60, () => tone((1760 - k * 290) * p, 0.25, 'sine', 0.05 * v, 0)); } },
};
export function beast(type, what, vol = 1){ const F = FAMILY[type]; if (!F || vol <= 0.02) return; const V = VOICE[F[0]]; if (V && V[what]) V[what](F[1], Math.min(1, vol)); }
export const BEASTS = FAMILY;

