// The game's sound. Every sound has a name, and is asked for the same way: sfx.hit(), sfx.swing(true). If there is a
// recording of it (assets/audio, made with PixelLab and packed by tools/audio-pack.py; manifest.json lists them) that is
// played, a little different in pitch each time; if not, a sound synthesised here stands in, so nothing is ever silent
// for want of a file, and a new recording dropped in the folder is used without a change to the game.
// Three volumes: the master (settings), and under it the effects and the music (MIX), each its own bus.
import { SET } from '../core/settings.js';
let AC = null, OUT = null, SFX = null, MUS = null;   // OUT: the master; SFX, MUS: the buses under it
export const MIX = { sfx: 1, music: 0.7 };
export const MANIFEST = { sfx: {}, music: {}, base: 'assets/audio/' };
const BANK = {}, LAST = {};
let asked = false;
function loadBank(){
  if (asked || !AC) return; asked = true;
  for (const [name, m] of Object.entries(MANIFEST.sfx)) fetch(MANIFEST.base + m.f).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && AC.decodeAudioData(b)).then(buf => { if (buf) BANK[name] = buf; }).catch(() => {});
}
if (typeof fetch === 'function' && typeof location !== 'undefined') fetch(MANIFEST.base + 'manifest.json').then(r => r.ok ? r.json() : null).then(m => { if (m){ Object.assign(MANIFEST.sfx, m.sfx); Object.assign(MANIFEST.music, m.music); if (AC){ asked = false; loadBank(); } } }).catch(() => {});
export function ac(){
  if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); OUT = AC.createGain(); OUT.gain.value = SET.volume; OUT.connect(AC.destination);
    SFX = AC.createGain(); SFX.gain.value = MIX.sfx; SFX.connect(OUT); MUS = AC.createGain(); MUS.gain.value = MIX.music; MUS.connect(OUT); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  if (AC) loadBank();
  return AC;
}
export const musicBus = () => MUS;
export const loaded = () => Object.keys(BANK).length;   // how many recordings are in (a check)
export function setMix(k, v){ MIX[k] = v; const b = k === 'sfx' ? SFX : MUS; if (b && AC) b.gain.setTargetAtTime(v, AC.currentTime, 0.05); }
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
  thunder: ['thunder', 0.9, 1, 0.1, 0.3], glass: ['glass', 0.3, 1, 0.03, 0.5], gust: ['gust', 0.5, 1, 0.08, 0.8], zap: ['zap', 0.6, 1, 0.1], bell: ['bell', 0.9, 1, 0.01],
};
// any name can be called: the recording if it is loaded, else the synthesised sound, else nothing
export const sfx = new Proxy(SYNTH, { get: (o, k) => (...a) => {
  const u = typeof USE[k] === 'function' ? USE[k](...a) : USE[k] || k, [name, vol, rate, jit, gap] = Array.isArray(u) ? u : [u, 0.7];
  if (!sample(name, vol, rate, jit, gap) && o[k]) o[k](...a);
} });
export function buzz(ms){ try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
