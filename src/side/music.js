// The score, made in the browser as it plays (no recordings): a few simple instruments and a step sequencer. One tune
// runs through all of it, the climb: four phrases, each starting higher than the last and each rising to a held note,
// the last coming down to turn back to the first. Every piece is that tune over the same four chords, set differently:
//   title     slow, a bell over a held chord
//   roots     low and sparse: a drone, a few plucked notes, the tune far off
//   cloister  a fifth higher and quicker: a harpsichord running in sixteenths over an organ, the tune on bells
//   spires    higher again, airy: bells in the high octaves, wind
//   boss      the region's own key, half as fast again, with drums and a driven bass, the tune in octaves
//   ending    the tune turned to the major
// makeMusic(ctx, out) -> { play(name), tick(), volume(v), stop() }. tick() is called every frame: it writes the next
// third of a second of notes. With an OfflineAudioContext, schedule(until) writes a whole stretch at once (the test).
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
// the four chords (bass note, three voices) and the tune over them, in D minor; a piece moves all of it by `shift`
const MINOR = { prog: [{ b: 38, n: [50, 53, 57] }, { b: 34, n: [50, 53, 58] }, { b: 43, n: [50, 55, 58] }, { b: 45, n: [49, 52, 57] }],   // Dm, Bb, Gm, A: each for two bars
  tune: [[0, 0, 74, 4], [0, 4, 76, 4], [0, 8, 77, 4], [0, 12, 81, 14], [2, 0, 74, 4], [2, 4, 77, 4], [2, 8, 79, 4], [2, 12, 82, 14], [4, 0, 79, 4], [4, 4, 81, 4], [4, 8, 82, 4], [4, 12, 86, 14], [6, 0, 81, 6], [6, 6, 79, 6], [6, 12, 77, 4], [7, 0, 76, 12]] };
const MAJOR = { prog: [{ b: 38, n: [50, 54, 57] }, { b: 43, n: [50, 55, 59] }, { b: 43, n: [50, 55, 59] }, { b: 45, n: [49, 52, 57] }],   // D, G, G, A
  tune: [[0, 0, 74, 4], [0, 4, 76, 4], [0, 8, 78, 4], [0, 12, 81, 14], [2, 0, 74, 4], [2, 4, 78, 4], [2, 8, 79, 4], [2, 12, 83, 14], [4, 0, 79, 4], [4, 4, 81, 4], [4, 8, 83, 4], [4, 12, 86, 14], [6, 0, 81, 6], [6, 6, 79, 6], [6, 12, 78, 4], [7, 0, 74, 14]] };
const _ = null;
export const SONGS = {
  title:    { set: MINOR, shift: 0, bpm: 58, pad: { g: 0.42, cut: 900 }, bass: { g: 0.3, at: [0] }, lead: { inst: 'bell', g: 0.3, oct: 0, every: 1 } },
  roots:    { set: MINOR, shift: 0, bpm: 66, pad: { g: 0.34, cut: 650 }, bass: { g: 0.34, at: [0, 10] }, arp: { inst: 'pluck', g: 0.16, oct: 12, pat: [0, _, _, _, _, _, 2, _, _, _, 1, _, _, _, _, _] }, lead: { inst: 'bell', g: 0.16, oct: -12, every: 2 }, drip: 0.05 },
  cloister: { set: MINOR, shift: 7, bpm: 92, pad: { g: 0.26, cut: 1500, organ: true }, bass: { g: 0.3, at: [0, 8], walk: [0, 2] }, arp: { inst: 'harpsi', g: 0.13, oct: 12, pat: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 4, 3, 2, 1] }, lead: { inst: 'bell', g: 0.2, oct: 0, every: 2 } },
  spires:   { set: MINOR, shift: 2, bpm: 80, pad: { g: 0.3, cut: 2000 }, bass: { g: 0.22, at: [0] }, arp: { inst: 'bell', g: 0.1, oct: 24, pat: [2, _, 4, _, 3, _, 5, _, 2, _, 4, _, 6, _, 4, _] }, lead: { inst: 'pluck', g: 0.2, oct: 12, every: 2 }, wind: 0.35 },
  ending:   { set: MAJOR, shift: 0, bpm: 66, pad: { g: 0.4, cut: 1600 }, bass: { g: 0.3, at: [0, 8] }, arp: { inst: 'pluck', g: 0.12, oct: 12, pat: [0, _, 1, _, 2, _, 3, _, 2, _, 1, _, 2, _, 3, _] }, lead: { inst: 'bell', g: 0.3, oct: 0, every: 1 } },
};
// a boss's piece: its region's, driven
for (const [name, from] of [['boss_roots', 'roots'], ['boss_cloister', 'cloister'], ['boss_spires', 'spires']]){ const S = SONGS[from];
  SONGS[name] = { set: MINOR, shift: S.shift, bpm: Math.round(S.bpm * (from === 'cloister' ? 1.3 : 1.5)), pad: { g: 0.22, cut: 1300, stab: true }, bass: { g: 0.34, at: [0, 2, 4, 6, 8, 10, 12, 14], drive: true },
    arp: { inst: 'saw', g: 0.09, oct: 12, pat: [0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2, 4, 3, 2, 1] }, lead: { inst: 'saw', g: 0.15, oct: 0, every: 1, octaves: true }, drums: { kick: [0, 4, 8, 11, 12], snare: [4, 12], hat: [2, 6, 10, 14], g: 0.5 } }; }

export function makeMusic(ctx, out){
  const master = ctx.createGain(); master.gain.value = 0.5; master.connect(out);
  // a room for it to sound in: noise dying away
  const verb = ctx.createConvolver(); { const len = Math.floor(ctx.sampleRate * 2.4), buf = ctx.createBuffer(2, len, ctx.sampleRate); let s = 12345;
    for (let c = 0; c < 2; c++){ const d = buf.getChannelData(c); for (let i = 0; i < len; i++){ s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 * 2 - 1) * Math.pow(1 - i / len, 2.6); } } verb.buffer = buf; }
  const wet = ctx.createGain(); wet.gain.value = 0.32; verb.connect(wet).connect(master);
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = noiseBuf.getChannelData(0); let s = 777; for (let i = 0; i < d.length; i++){ s = (s * 16807) % 2147483647; d[i] = s / 2147483647 * 2 - 1; } }
  const M = { song: null, name: '', bus: null, step: 0, at: 0, wind: null };
  const env = (g, t, peak, a, d, hold = 0) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); if (hold) g.gain.setValueAtTime(Math.max(0.0002, peak), t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + d); };
  const send = (node, bus, wetAmt) => { node.connect(bus); if (wetAmt){ const w = ctx.createGain(); w.gain.value = wetAmt; node.connect(w).connect(verb); } };
  const osc = (type, f, t, stop, detune = 0) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune; o.start(t); o.stop(stop); return o; };
  // ---- the instruments
  const I = {
    pad(bus, notes, t, dur, g, cut, organ){ const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; f.Q.value = 0.6; const v = ctx.createGain(); env(v, t, g / notes.length * 1.6, Math.min(0.9, dur * 0.3), Math.min(1.6, dur * 0.5), dur * 0.55);
      for (const n of notes){ osc('sawtooth', mtof(n), t, t + dur * 1.4 + 2, -7).connect(f); osc('sawtooth', mtof(n), t, t + dur * 1.4 + 2, 7).connect(f); if (organ){ const o = osc('sine', mtof(n + 12), t, t + dur * 1.4 + 2); const og = ctx.createGain(); og.gain.value = 0.5; o.connect(og).connect(f); } }
      f.connect(v); send(v, bus, 0.5); },
    bass(bus, n, t, dur, g, drive){ const v = ctx.createGain(); env(v, t, g, 0.01, dur * 0.8, dur * 0.2); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = drive ? 520 : 300;
      osc(drive ? 'sawtooth' : 'triangle', mtof(n), t, t + dur + 0.3).connect(f); osc('sine', mtof(n - 12 < 28 ? n : n - 12), t, t + dur + 0.3).connect(f); f.connect(v); send(v, bus, 0.05); },
    pluck(bus, n, t, g){ const v = ctx.createGain(); env(v, t, g, 0.004, 0.7); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.3);
      osc('triangle', mtof(n), t, t + 1).connect(f); const o2 = osc('square', mtof(n), t, t + 1), g2 = ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2).connect(f); f.connect(v); send(v, bus, 0.6); },
    harpsi(bus, n, t, g){ const v = ctx.createGain(); env(v, t, g, 0.002, 0.3); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 260;
      osc('sawtooth', mtof(n), t, t + 0.5).connect(f); const o2 = osc('square', mtof(n + 12), t, t + 0.5), g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2).connect(f); f.connect(v); send(v, bus, 0.35); },
    saw(bus, n, t, g, len = 0.22){ const v = ctx.createGain(); env(v, t, g, 0.005, len); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(700, t + len);
      osc('sawtooth', mtof(n), t, t + len + 0.2, -5).connect(f); osc('sawtooth', mtof(n), t, t + len + 0.2, 5).connect(f); f.connect(v); send(v, bus, 0.25); },
    bell(bus, n, t, g, len = 2.2){ const v = ctx.createGain(); env(v, t, g, 0.003, len); const c = osc('sine', mtof(n), t, t + len + 0.2), m = osc('sine', mtof(n) * 3.5, t, t + len + 0.2), mg = ctx.createGain();
      mg.gain.setValueAtTime(mtof(n) * 1.6, t); mg.gain.exponentialRampToValueAtTime(1, t + len * 0.5); m.connect(mg).connect(c.frequency); c.connect(v); send(v, bus, 0.7); },
    kick(bus, t, g){ const v = ctx.createGain(); env(v, t, g, 0.002, 0.16); const o = ctx.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); o.start(t); o.stop(t + 0.25); o.connect(v); v.connect(bus); },
    noise(bus, t, g, len, type, freq){ const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = 0.8; const v = ctx.createGain(); env(v, t, g, 0.002, len); s.connect(f).connect(v); send(v, bus, 0.15); s.start(t, (t * 7.3) % 1.5); s.stop(t + len + 0.1); },
  };
  // one sixteenth of a piece, written at time t
  function write(S, bus, step, t){
    const stepDur = 60 / S.bpm / 4, bar = Math.floor(step / 16), s = step % 16, loop = bar % 8, cyc = Math.floor(bar / 8), ch = S.set.prog[Math.floor(loop / 2)], sh = S.shift, barDur = stepDur * 16;
    if (S.pad && (s === 0 || (S.pad.stab && s === 8))) I.pad(bus, ch.n.map(n => n + sh), t, S.pad.stab ? barDur * 0.3 : barDur, S.pad.g, S.pad.cut, S.pad.organ);
    if (S.bass && S.bass.at.includes(s)){ const k = S.bass.at.indexOf(s), n = S.bass.walk && k ? ch.n[S.bass.walk[k] % 3] - 12 : ch.b; I.bass(bus, n + sh, t, S.bass.drive ? stepDur * 1.7 : stepDur * 7, S.bass.g, S.bass.drive); }
    if (S.arp && S.arp.pat[s] != null){ const k = S.arp.pat[s], n = ch.n[k % 3] + 12 * Math.floor(k / 3) + S.arp.oct + sh; I[S.arp.inst](bus, n, t, S.arp.g * (s % 4 === 0 ? 1.25 : 1)); }
    if (S.lead && cyc % S.lead.every === 0) for (const [b, st, n, len] of S.set.tune) if (b === loop && st === s){ const L = Math.max(0.4, len * stepDur * 1.1), note = n + sh + S.lead.oct;
      if (S.lead.inst === 'bell') I.bell(bus, note, t, S.lead.g, Math.max(1.6, L)); else if (S.lead.inst === 'saw'){ I.saw(bus, note, t, S.lead.g, L); if (S.lead.octaves) I.saw(bus, note - 12, t, S.lead.g * 0.8, L); } else I.pluck(bus, note, t, S.lead.g * 1.3); }
    if (S.drums){ const D = S.drums; if (D.kick.includes(s)) I.kick(bus, t, D.g); if (D.snare.includes(s)) I.noise(bus, t, D.g * 0.32, 0.14, 'bandpass', 1900); if (D.hat.includes(s)) I.noise(bus, t, D.g * 0.12, 0.04, 'highpass', 7000); else if (s % 2 === 1) I.noise(bus, t, D.g * 0.05, 0.03, 'highpass', 8000); }
    if (S.drip && ((step * 7919 + 13) % 97) / 97 < S.drip) I.pluck(bus, ch.n[(step * 31) % 3] + 36 + sh, t, 0.07);   // water, somewhere, now and then
  }
  M.schedule = until => { if (!M.song) return; const stepDur = 60 / M.song.bpm / 4; while (M.at < until){ write(M.song, M.bus, M.step, M.at); M.step++; M.at += stepDur; } };
  M.tick = () => { if (M.song) M.schedule(ctx.currentTime + 0.35); };
  M.play = (name, fade = 1.4) => {
    if (name === M.name) return; const now = ctx.currentTime;
    if (M.bus){ const old = M.bus; old.gain.cancelScheduledValues(now); old.gain.setValueAtTime(old.gain.value, now); old.gain.linearRampToValueAtTime(0.0001, now + fade); if (M.wind){ try { M.wind.stop(now + fade); } catch (e){} M.wind = null; } }
    M.name = name; M.song = SONGS[name] || null; if (!M.song){ M.bus = null; return; }
    M.bus = ctx.createGain(); M.bus.gain.setValueAtTime(0.0001, now); M.bus.gain.linearRampToValueAtTime(1, now + fade * 0.7); M.bus.connect(master); M.step = 0; M.at = now + 0.08;
    if (M.song.wind){ const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 0.7; const g = ctx.createGain(); g.gain.value = M.song.wind * 0.22;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 260; lfo.connect(lg).connect(f.frequency); lfo.start(now); s.connect(f).connect(g).connect(M.bus); s.start(now); M.wind = s; }
  };
  M.volume = v => { master.gain.setTargetAtTime(v, ctx.currentTime, 0.2); };
  M.stop = () => M.play('', 0.6);
  return M;
}
