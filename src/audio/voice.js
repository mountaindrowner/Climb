// How the mountain's folk talk: mumble speech, made on the spot (no recordings). One vowel a syllable, through three
// formant bands, pitched by the punctuation; each speaker a small profile. After the method in the owner's notes on
// mumble speech (docs/voices.md): the typewriter (talk.js) waits after each character by pauseAfter(), and each letter
// that starts a syllable plays one sound, so the voice can never drift from the words.
//   planLine(text)              -> Map(index -> { v, p, g }): where each syllable starts, its vowel, its pitch, its gain
//   pauseAfter(text, i)         -> how many base waits after the character at i
//   VOICES, voiceOf(who)        -> a speaker's profile (anyone not listed gets a fixed one from their name)
//   utter(ac, bus, profile, syl, at) -> plays one syllable (now, or at a given time)
// Pure planning above the line `// ---- the sound` (it runs in node: tests/voice.test.mjs); Web Audio below it.

// ---- the profiles. f0: the buzz's pitch (Hz); tract: the tube's length (1 a grown man, ~1.15 a woman, ~1.3 a child);
// breath, rasp, nasal, whisper 0-1; wobble (a fraction) at wobbleHz; rate: speed; range: how far the tune moves; lilt:
// sing-song; bright: the top end; closed: a mouth half shut; vol: loudness against the others.
export const VOICES = {
  // Ordric, an old moth who keeps the flames: papery, slow, a slow wobble of age, soft at the top
  lamplighter: { f0: 152, tract: 1.06, breath: 0.42, whisper: 0.22, wobble: 0.035, wobbleHz: 2.2, rate: 0.8, range: 0.75, lilt: 0.02, bright: 0.82, vol: 1.05 },
  // Mirel, a pilgrim under a borrowed shell, keeping her count: even and held in, the mouth half shut
  wren: { f0: 206, tract: 1.13, breath: 0.18, closed: true, rate: 1.02, range: 0.5, bright: 0.92, vol: 0.95 },
  // Mirel with the shell put down (the Gardens up): the same woman, opened out, a little lilt in it
  wren_free: { f0: 214, tract: 1.14, breath: 0.22, rate: 0.95, range: 0.95, lilt: 0.04, bright: 1.04, vol: 1 },
  // Corwen, a rook who writes the mountain down exactly: clipped and quick, flat, a rook's gravel, through the nose
  scribe: { f0: 124, tract: 0.97, rasp: 0.3, nasal: 0.25, rate: 1.18, range: 0.42, bright: 1.1, vol: 1 },
  // Hob of the guild, a mole in the Deep: low, dark, a mutter, a little gravel, unhurried
  hob: { f0: 98, tract: 0.9, closed: true, rasp: 0.2, breath: 0.3, rate: 0.86, range: 0.8, bright: 0.74, vol: 1.1 },
};
const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
// anyone not in VOICES: a grown man or woman, fixed by the name, so a new speaker never sounds like a default
export function voiceOf(who){
  if (VOICES[who]) return VOICES[who];
  const h = hash(who), r = k => ((h >>> (k * 4)) & 15) / 15, woman = h & 1;
  return { f0: woman ? 190 + r(1) * 40 : 100 + r(1) * 40, tract: woman ? 1.1 + r(2) * 0.08 : 0.94 + r(2) * 0.08, breath: r(3) * 0.3, rate: 0.85 + r(4) * 0.3, range: 0.5 + r(5) * 0.7, vol: 1 };
}

// ---- reading a line
const VOW = 'aeiouyáéíóúü';
const fold = c => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' })[c] || c;
const isL = c => /[a-záéíóúü']/i.test(c || '');
// the vowel group's first letters pick one of five vowels
function vowelOf(g){
  const s = g.toLowerCase().split('').map(fold).join('');
  if (s.startsWith('oo') || s.startsWith('ou')) return 'u';
  if (s.startsWith('ee') || s.startsWith('ea') || s.startsWith('ie')) return 'i';
  if (s.startsWith('ai') || s.startsWith('ay') || s.startsWith('ei')) return 'e';
  if (s.startsWith('oa')) return 'o';
  return s[0] === 'y' ? 'i' : s[0];
}
// the syllables of a line: each phrase (closed by , ; : — . ? ! …) keeps its closing marks, which set its tune
export function planLine(text){
  const out = new Map(), T = String(text), N = T.length;
  // phrases: [start, end) and the marks that close them
  const phrases = []; let s = 0;
  for (let i = 0; i < N; i++){
    if (!/[,;:—–.?!…]/.test(T[i])) continue;
    let j = i; while (j + 1 < N && /[,;:—–.?!…"')]/.test(T[j + 1])) j++;
    phrases.push({ s, e: j + 1, marks: T.slice(i, j + 1) }); s = j + 1; i = j;
  }
  if (s < N) phrases.push({ s, e: N, marks: '' });
  for (const ph of phrases){
    // the syllables in it, word by word
    const syl = []; let i = ph.s, words = 0;
    while (i < ph.e){
      if (!isL(T[i])){ i++; continue; }
      let j = i; while (j < ph.e && isL(T[j])) j++;
      const word = T.slice(i, j), letters = word.replace(/'/g, ''), caps = letters.length > 1 && letters === letters.toUpperCase() && /[A-Z]/.test(letters);
      const mine = [];
      for (let k = 0; k < word.length; k++){
        const c = word[k].toLowerCase(), v = VOW.includes(c) && !(c === 'y' && k === 0);
        if (!v) continue;
        const prev = k > 0 ? word[k - 1].toLowerCase() : '', prevV = prev !== '' && VOW.includes(prev) && !(prev === 'y' && k - 1 === 0);
        if (prevV) continue;   // inside a vowel group
        let g = k; while (g < word.length && VOW.includes(word[g].toLowerCase())) g++;
        const grp = word.slice(k, g);
        // a silent final e: a lone e ending a word of more than three letters, once it has had a syllable
        if (grp.toLowerCase() === 'e' && g === word.length && letters.length > 3 && mine.length) continue;
        mine.push({ at: i + k, v: vowelOf(grp), caps });
      }
      if (mine.length){ for (const m of mine) syl.push({ ...m, wordId: words }); words++; }   // each syllable knows its word
      i = j;
    }
    if (!syl.length) continue;
    const q = ph.marks.includes('?'), ex = ph.marks.includes('!'), trail = ph.marks.includes('…') || ph.marks.includes('...');
    const hi = ex ? 1.14 : 1.05, lo = ex ? 0.98 : 0.94, n = syl.length, lastWord = syl[n - 1].wordId, inLast = syl.filter(x => x.wordId === lastWord).length;
    let seenLast = 0;
    syl.forEach((x, k) => {
      const u = n > 1 ? k / (n - 1) : 0;
      let p = hi + (lo - hi) * u, g = 1;
      // a question: its last word rises (a one-word question less)
      if (q && x.wordId === lastWord){ p += inLast > 1 ? 0.12 + 0.12 * seenLast / (inLast - 1) : n > 1 ? 0.24 : 0.12; seenLast++; }
      if (trail){ g *= 1 - 0.55 * u; p -= 0.04 * u; }
      if (x.caps){ p *= 1.22; g *= 1.55; }
      out.set(x.at, { v: x.v, p: +p.toFixed(3), g: +g.toFixed(3) });
    });
  }
  return out;
}
// the typing rhythm: how many base waits after the character at i
export function pauseAfter(text, i){
  const c = text[i], next = text[i + 1], end = next === undefined || next === ' ' || next === '"' || next === "'";
  if (c === '…') return 9;
  if (c === '.' && next === '.') return 1;
  if (c === '.' && text[i - 1] === '.' && text[i - 2] === '.') return 4;
  if ((c === '.' || c === '?' || c === '!') && end) return 6;
  if ((c === ',' || c === ';' || c === ':') && end) return 3;
  if ((c === '—' || c === '–' || c === '-') && next === ' ') return 3;
  return 1;
}
export const BASE = 0.03;   // seconds a character, before the speaker's rate and the player's text speed

// ---- the sound
// a grown man's formants (Peterson and Barney), F1 F2 F3
const F = { a: [730, 1090, 2440], e: [530, 1840, 2480], i: [270, 2290, 3010], o: [570, 840, 2410], u: [300, 870, 2240] };
const BW = [90, 110, 160], AMP = [1, 1, 0.6];
let NOISE = null;
const noiseOf = ac => { if (NOISE && NOISE.sampleRate === ac.sampleRate) return NOISE; const n = ac.sampleRate, b = ac.createBuffer(1, n, n), d = b.getChannelData(0); for (let k = 0; k < n; k++) d[k] = Math.random() * 2 - 1; return NOISE = b; };
let K = 0;   // syllables so far: the lilt's step
export function utter(ac, bus, V, syl, at = null){   // at: when (a recording of a line made ahead of time); else now
  if (!ac || !bus || !syl) return;
  const t0 = at != null ? at : ac.currentTime + 0.005, rate = V.rate || 1, dur = 0.13 / Math.sqrt(rate) + 0.04;
  const range = V.range != null ? V.range : 1, lilt = 1 + (V.lilt || 0) * Math.sin(K++ * 1.9), nudge = 1 + (Math.random() * 2 - 1) * 0.025;
  const f = V.f0 * (1 + (syl.p - 1) * range) * lilt * nudge;
  // the buzz, its pitch drawn over the sound: a sag, a wobble on the clock, a rasp's jitter
  const osc = ac.createOscillator(); osc.type = V.wave || 'sawtooth';
  const curve = new Float32Array(12);
  for (let k = 0; k < 12; k++){ const u = k / 11, t = t0 + u * dur; curve[k] = f * (1 - 0.03 * u) * (1 + (V.wobble || 0) * Math.sin(t * 2 * Math.PI * (V.wobbleHz || 2))) * (1 + (V.rasp || 0) * (Math.random() * 2 - 1) * 0.03); }
  try { osc.frequency.setValueCurveAtTime(curve, t0, dur); } catch (e){ osc.frequency.value = f; }
  const src = ac.createGain(); src.gain.value = 1 - 0.92 * (V.whisper || 0); osc.connect(src);
  const nodes = [osc];
  if (V.rasp){ const o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f / 2; const g2 = ac.createGain(); g2.gain.value = 0.55 * V.rasp; o2.connect(g2).connect(src); nodes.push(o2); }   // the folds catching every other cycle
  const air = (V.breath || 0) + (V.rasp || 0) * 0.15 + (V.whisper || 0) * 0.9;
  if (air > 0){ const n = ac.createBufferSource(); n.buffer = noiseOf(ac); n.loop = true; const ng = ac.createGain(); ng.gain.value = air * 0.9; n.connect(ng).connect(src); nodes.push(n); }
  // the tube: three bands at the vowel's formants, moved together by the tract; a half-shut mouth pulls them together
  const tract = V.tract || 1, mix = ac.createGain(); let fm = F[syl.v] || F.a;
  if (V.closed){ const mid = (fm[0] + fm[1]) / 2; fm = [fm[0] + (mid - fm[0]) * 0.35, fm[1] + (mid - fm[1]) * 0.35, fm[2]]; }
  fm.forEach((hz, k) => { const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = hz * tract; bp.Q.value = hz * tract / BW[k]; const a = ac.createGain(); a.gain.value = AMP[k] * (V.nasal && k === 0 ? 1 - 0.4 * V.nasal : 1); src.connect(bp).connect(a).connect(mix); });
  let out = mix;
  if (V.nasal){ const hum = ac.createBiquadFilter(); hum.type = 'bandpass'; hum.frequency.value = 260; hum.Q.value = 4; const hg = ac.createGain(); hg.gain.value = 0.6 * V.nasal; src.connect(hum).connect(hg).connect(mix);
    const notch = ac.createBiquadFilter(); notch.type = 'notch'; notch.frequency.value = 1000; notch.Q.value = 2; out.connect(notch); out = notch; }
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = (V.closed ? 1900 : 4200) * (V.bright || 1); out.connect(lp);
  // the shape in time: it swells, holds, lets go (not struck)
  const env = ac.createGain(), peak = 0.075 * 9 * (V.vol || 1) * (syl.g || 1);   // 9: the bands take most of the buzz away (this sits it level with the other sounds)
  env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(peak, t0 + 0.03); env.gain.setValueAtTime(peak, t0 + dur * 0.6); env.gain.linearRampToValueAtTime(0, t0 + dur);
  lp.connect(env).connect(bus);
  for (const n of nodes){ n.start(t0); n.stop(t0 + dur + 0.02); }
  nodes[0].onended = () => { try { env.disconnect(); } catch (e){} };
}
