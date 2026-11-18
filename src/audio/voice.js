// How the mountain's folk talk: mumble speech, made on the spot (no recordings). One vowel a syllable, through three
// formant bands, pitched by the punctuation; each speaker a small profile. After the method in the owner's notes on
// mumble speech (docs/voices.md): the typewriter (talk.js) waits after each character by pauseAfter(), and each letter
// that starts a syllable plays one sound, so the voice can never drift from the words.
//   planLine(text)              -> Map(index -> { v, p, g, c, end }): where each syllable starts, its vowel, its pitch,
//                                  its gain, how it begins (c: the kind of consonant before it), and whether it ends its phrase
//   pauseAfter(text, i)         -> how many base waits after the character at i
//   VOICES, voiceOf(who)        -> a speaker's profile (anyone not listed gets a fixed one from their name)
//   utter(ac, bus, profile, syl, at) -> plays one syllable (now, or at a given time)
// Pure planning above the line `// ---- the sound` (it runs in node: tests/voice.test.mjs); Web Audio below it.

// ---- the profiles. f0: the buzz's pitch (Hz); tract: the tube's length (1 a grown man, ~1.15 a woman, ~1.3 a child);
// breath, rasp, nasal, whisper 0-1; wobble (a fraction) at wobbleHz; rate: speed; range: how far the tune moves; lilt:
// sing-song; bright: the top end; closed: a mouth half shut; vol: loudness against the others.
// Since phase 8, each a sharper character, and a hint of the words: `artic` 0-1 is how clearly a syllable's consonant
// is shaped (voice.js onsetOf: a hiss, a pop, a hum, a roll); `hold` stretches or clips each vowel; `rise` lifts the
// last syllable of a phrase; `comma` stretches the waits at commas (talk.js, through pauseAfter).
export const VOICES = {
  // Ordric, an old moth who keeps the lamps: low, slow and warm, long vowels, a slow wobble of age, soft consonants
  lamplighter: { f0: 138, tract: 1.04, breath: 0.4, whisper: 0.16, wobble: 0.04, wobbleHz: 2.1, rate: 0.72, hold: 1.35, range: 0.7, lilt: 0.02, bright: 0.8, artic: 0.5, vol: 1.08 },
  // Mirel, a pilgrim under a borrowed shell, keeping her count: quick, clipped and breathless, the mouth half shut,
  // each phrase turned up at its end as if it were a question she is not asking
  wren: { f0: 212, tract: 1.13, breath: 0.3, closed: true, rate: 1.2, hold: 0.8, range: 0.5, rise: 0.09, bright: 0.94, artic: 0.8, vol: 0.95 },
  // Mirel with the shell put down (the Gardens up): the same woman, slower, opened out, a little lilt, no more rising
  wren_free: { f0: 214, tract: 1.14, breath: 0.2, rate: 0.92, hold: 1.1, range: 0.95, lilt: 0.04, bright: 1.04, artic: 0.7, vol: 1 },
  // Corwen, a rook who writes the mountain down exactly: dry and even, every consonant in its place, a rook's gravel,
  // through the nose, a small pause at each comma
  scribe: { f0: 122, tract: 0.97, rasp: 0.3, nasal: 0.25, rate: 1.08, hold: 0.9, range: 0.3, comma: 1.7, bright: 1.12, artic: 1, vol: 1 },
  // Hob of the guild, a mole in the Deep: a low gravelly mutter into his chest, the words run together
  hob: { f0: 92, tract: 0.9, closed: true, rasp: 0.45, breath: 0.32, rate: 0.9, hold: 1.05, range: 0.6, bright: 0.7, artic: 0.35, vol: 1.12 },
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
// how a syllable begins, from the consonants written before its vowel: 's' a hiss (s f h sh th z x v c before e or i),
// 'p' a pop (p b t d k g q j ch, a hard c), 'm' a hum (m n), 'r' a roll (r l w y), '' nothing (it opens on the vowel).
// The sound nearest the vowel decides, except that a hiss before a roll stays a hiss (sl, fr, thr)
export function onsetOf(before, vowel = ''){
  const b = String(before).toLowerCase().replace(/[^a-z]/g, ''); if (!b) return '';
  if (/(sh|th|ph)$/.test(b)) return 's'; if (/ch$/.test(b)) return 'p';
  const kind = c => 'sfhzxv'.includes(c) ? 's' : 'pbtdkgqj'.includes(c) ? 'p' : 'mn'.includes(c) ? 'm' : 'rlwy'.includes(c) ? 'r' : c === 'c' ? 'c' : '';
  let k = kind(b[b.length - 1]); if (k === 'c') k = /^[eiy]/i.test(vowel) ? 's' : 'p';
  if (k === 'r' && b.length > 1){ let k2 = kind(b[b.length - 2]); if (k2 === 'c') k2 = 'p'; if (k2 === 's' || k2 === 'p') return k2; }
  return k;
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
        let c0 = k; while (c0 > 0 && !VOW.includes(word[c0 - 1].toLowerCase()) || (c0 === 1 && word[0].toLowerCase() === 'y')) c0--;   // the consonants before it, back to the last vowel
        mine.push({ at: i + k, v: vowelOf(grp), caps, c: onsetOf(word.slice(c0, k), grp) });
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
      out.set(x.at, { v: x.v, p: +p.toFixed(3), g: +g.toFixed(3), c: x.c, end: k === n - 1 });
    });
  }
  return out;
}
// the typing rhythm: how many base waits after the character at i
export function pauseAfter(text, i, V = null){
  const c = text[i], next = text[i + 1], end = next === undefined || next === ' ' || next === '"' || next === "'";
  if (c === '…') return 9;
  if (c === '.' && next === '.') return 1;
  if (c === '.' && text[i - 1] === '.' && text[i - 2] === '.') return 4;
  if ((c === '.' || c === '?' || c === '!') && end) return 6;
  if ((c === ',' || c === ';' || c === ':') && end) return 3 * (V && V.comma || 1);   // (a speaker who weighs his clauses waits longer)
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
  const A = V.artic == null ? 0.6 : V.artic, on = A > 0 ? syl.c || '' : '', lead = on === 's' ? 0.045 : on === 'm' ? 0.04 : on === 'p' ? 0.012 : 0;   // the consonant's own moment, before the vowel
  const tc = at != null ? at : ac.currentTime + 0.005, t0 = tc + lead, rate = V.rate || 1, dur = (0.13 / Math.sqrt(rate) + 0.04) * (V.hold || 1);
  const range = V.range != null ? V.range : 1, lilt = 1 + (V.lilt || 0) * Math.sin(K++ * 1.9), nudge = 1 + (Math.random() * 2 - 1) * 0.025;
  const f = V.f0 * (1 + (syl.p - 1) * range) * lilt * nudge * (syl.end && V.rise ? 1 + V.rise : 1);
  // the buzz, its pitch drawn over the sound: a sag, a wobble on the clock, a rasp's jitter
  const osc = ac.createOscillator(); osc.type = V.wave || 'sawtooth';
  const curve = new Float32Array(12);
  for (let k = 0; k < 12; k++){ const u = k / 11, t = t0 + u * dur; curve[k] = f * (syl.end && V.rise ? 1 + V.rise * (u - 0.5) : 1 - 0.03 * u) * (1 + (V.wobble || 0) * Math.sin(t * 2 * Math.PI * (V.wobbleHz || 2))) * (1 + (V.rasp || 0) * (Math.random() * 2 - 1) * 0.03); }
  try { osc.frequency.setValueCurveAtTime(curve, t0, dur); } catch (e){ osc.frequency.value = f; }
  const src = ac.createGain(); src.gain.value = 1 - 0.92 * (V.whisper || 0); osc.connect(src);
  const nodes = [osc];
  if (V.rasp){ const o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f / 2; const g2 = ac.createGain(); g2.gain.value = 0.55 * V.rasp; o2.connect(g2).connect(src); nodes.push(o2); }   // the folds catching every other cycle
  const air = (V.breath || 0) + (V.rasp || 0) * 0.15 + (V.whisper || 0) * 0.9;
  if (air > 0){ const n = ac.createBufferSource(); n.buffer = noiseOf(ac); n.loop = true; const ng = ac.createGain(); ng.gain.value = air * 0.9; n.connect(ng).connect(src); nodes.push(n); }
  // the tube: three bands at the vowel's formants, moved together by the tract; a half-shut mouth pulls them together
  const tract = V.tract || 1, mix = ac.createGain(); let fm = F[syl.v] || F.a;
  if (V.closed){ const mid = (fm[0] + fm[1]) / 2; fm = [fm[0] + (mid - fm[0]) * 0.35, fm[1] + (mid - fm[1]) * 0.35, fm[2]]; }
  // (after a roll, r l w, the second band slides up into place: the mouth opening into the vowel)
  fm.forEach((hz, k) => { const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = hz * tract; bp.Q.value = hz * tract / BW[k];
    if (on === 'r' && k === 1){ bp.frequency.setValueAtTime(hz * tract * (1 - 0.4 * A), t0); bp.frequency.linearRampToValueAtTime(hz * tract, t0 + 0.07); }
    const a = ac.createGain(); a.gain.value = AMP[k] * (V.nasal && k === 0 ? 1 - 0.4 * V.nasal : 1); src.connect(bp).connect(a).connect(mix); });
  let out = mix;
  if (V.nasal){ const hum = ac.createBiquadFilter(); hum.type = 'bandpass'; hum.frequency.value = 260; hum.Q.value = 4; const hg = ac.createGain(); hg.gain.value = 0.6 * V.nasal; src.connect(hum).connect(hg).connect(mix);
    const notch = ac.createBiquadFilter(); notch.type = 'notch'; notch.frequency.value = 1000; notch.Q.value = 2; out.connect(notch); out = notch; }
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = (V.closed ? 1900 : 4200) * (V.bright || 1); out.connect(lp);
  // the shape in time: it swells, holds, lets go (not struck)
  const env = ac.createGain(), peak = 0.075 * 9 * (V.vol || 1) * (syl.g || 1);   // 9: the bands take most of the buzz away (this sits it level with the other sounds)
  const attack = on === 'p' ? 0.03 - 0.022 * A : on === 'r' ? 0.03 + 0.025 * A : 0.03;   // struck after a pop, eased in after a roll
  env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(peak, t0 + attack); env.gain.setValueAtTime(peak, t0 + dur * 0.6); env.gain.linearRampToValueAtTime(0, t0 + dur);
  // the consonant, a hint of it, just before the vowel: a hiss of air (s, f, h), a pop (p, t, k), a hum in the nose (m, n)
  const cpk = 0.075 * (V.vol || 1) * (syl.g || 1) * A;
  if (on === 's' || on === 'p'){ const n = ac.createBufferSource(); n.buffer = noiseOf(ac); n.loop = true; const bp = ac.createBiquadFilter(); bp.type = on === 's' ? 'highpass' : 'bandpass'; bp.frequency.value = on === 's' ? 3400 * (V.bright || 1) : 1700 * tract; bp.Q.value = 0.8;
    const cg = ac.createGain(), pk = cpk * (on === 's' ? 0.8 : 1.5), off = on === 's' ? tc + lead + 0.025 : tc + 0.03;
    cg.gain.setValueAtTime(0, tc); cg.gain.linearRampToValueAtTime(pk, tc + 0.006); if (on === 's') cg.gain.setValueAtTime(pk, tc + lead); cg.gain.linearRampToValueAtTime(0, off);
    n.connect(bp).connect(cg).connect(bus); n.start(tc); n.stop(off + 0.02); n.onended = () => { try { cg.disconnect(); } catch (e){} }; }
  else if (on === 'm'){ const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lo = ac.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = 330;
    const cg = ac.createGain(), pk = cpk * 1.6; cg.gain.setValueAtTime(0, tc); cg.gain.linearRampToValueAtTime(pk, tc + 0.015); cg.gain.setValueAtTime(pk, t0); cg.gain.linearRampToValueAtTime(0, t0 + 0.035);
    o.connect(lo).connect(cg).connect(bus); o.start(tc); o.stop(t0 + 0.06); o.onended = () => { try { cg.disconnect(); } catch (e){} }; }
  lp.connect(env).connect(bus);
  for (const n of nodes){ n.start(t0); n.stop(t0 + dur + 0.02); }
  nodes[0].onended = () => { try { env.disconnect(); } catch (e){} };
}
