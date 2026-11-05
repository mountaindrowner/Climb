// Placeholder sounds synthesised in the browser. Real samples will live in assets/audio and load through this same API.
let AC = null;
export function ac(){
  if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(freq, dur, type, vol, slide){
  const a = AC; if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
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
  s.connect(f).connect(g).connect(a.destination); s.start(t); s.stop(t + dur + 0.02);
}
export const sfx = {
  step(){ tone(72, 0.09, 'sine', 0.22, -30); noise(0.05, 0.05, 380); },
  jump(){ tone(260, 0.12, 'square', 0.04, 220); },
  slash(){ noise(0.09, 0.09, 2600); },
  hit(){ tone(170, 0.1, 'square', 0.07, -90); noise(0.06, 0.07, 1500); },
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
};
export function buzz(ms){ try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
