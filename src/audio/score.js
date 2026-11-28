// The recorded score: one piece at a time through the music bus, faded from one to the next, going round while it is
// wanted. A piece is fetched and decoded when first asked for (and the one before last is let go, they are large).
// makeScore() -> { has(key), play(key), duck(v), now }. Where there is no recording of a piece the game's own
// generated score (side/music.js) plays instead.
import { ac, musicBus, MANIFEST } from './sfx.js';
export function makeScore(){
  const bufs = new Map(), loading = new Set(), since = new Map(), failed = new Map(); let cur = null, want = '', duck = null, wall = null, wallAt = 20000;
  const now = () => performance.now() / 1000;
  const S = { now: '' };
  S.has = key => !!MANIFEST.music[key];
  // the watchdog: a piece that failed to come, or has been coming for more than ten seconds, is not to be waited for.
  // The game plays its own made score meanwhile (main.js score), and a failed piece is asked for again after twenty
  S.ready = key => { const f = failed.get(key); if (f && now() - f < 20) return false; if (f) failed.delete(key); const t = since.get(key); return !(loading.has(key) && t && now() - t > 10); };
  const fail = key => { loading.delete(key); since.delete(key); failed.set(key, now()); };
  // a piece fetched ahead (before the sound may start, or while something else plays): kept as it came, decoded when asked for
  const raw = new Map();
  S.prefetch = key => { if (!S.has(key) || raw.has(key) || bufs.has(key)) return Promise.resolve(); const p = fetch(MANIFEST.base + MANIFEST.music[key].f).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null); raw.set(key, p); return p; };
  function start(key, hard){
    const A = ac(), bus = musicBus(); if (!A || !bus) return;
    if (!duck){ duck = A.createGain(); wall = A.createBiquadFilter(); wall.type = 'lowpass'; wall.Q.value = 0.5; wall.frequency.value = wallAt; duck.connect(wall).connect(bus); }
    if (cur){ const o = cur; o.g.gain.cancelScheduledValues(A.currentTime); o.g.gain.setTargetAtTime(0, A.currentTime, 0.5); try { o.s.stop(A.currentTime + 2.6); } catch (e){} cur = null; }
    S.now = key; if (!key) return;
    const s = A.createBufferSource(), g = A.createGain(); s.buffer = bufs.get(key); s.loop = true; const lv = (MANIFEST.music[key].v || 1) * 0.8; if (hard) g.gain.value = lv; else { g.gain.value = 0; g.gain.setTargetAtTime(lv, A.currentTime + 0.25, 0.6); }   // hard: in on the beat (a keeper's name), not faded up
    s.connect(g).connect(duck); s.start(); cur = { s, g, key };
    for (const k of [...bufs.keys()]) if (k !== key && bufs.size > 2) bufs.delete(k);
  }
  S.play = (key, hard = false) => {
    key = key && S.has(key) ? key : ''; want = key; if (key === S.now) return;
    if (!key || bufs.has(key)){ start(key, hard); return; }
    if (loading.has(key) || !S.ready(key)) return; loading.add(key); since.set(key, now()); const A = ac(); if (!A){ loading.delete(key); return; }
    (raw.get(key) || fetch(MANIFEST.base + MANIFEST.music[key].f).then(r => r.arrayBuffer())).then(b => { raw.delete(key); return A.decodeAudioData(b); }).then(buf => { bufs.set(key, buf); loading.delete(key); since.delete(key); if (want === key) start(key); }).catch(() => fail(key));
  };
  // fetched and decoded ahead, so that when it is played it starts at once (a keeper's music, while its hall shuts)
  S.load = key => { if (!S.has(key) || bufs.has(key) || loading.has(key) || !S.ready(key)) return; const A = ac(); if (!A) return; loading.add(key); since.set(key, now());
    (raw.get(key) || fetch(MANIFEST.base + MANIFEST.music[key].f).then(r => r.arrayBuffer())).then(b => { raw.delete(key); return A.decodeAudioData(b); }).then(buf => { bufs.set(key, buf); loading.delete(key); since.delete(key); if (want === key && S.now !== key) start(key, true); }).catch(() => fail(key)); };
  // the piece run fast (a fall, run back) or at its own speed again
  S.warp = rate => { const A = ac(); if (cur && A) cur.s.playbackRate.setTargetAtTime(rate, A.currentTime, 0.12); };
  // (build 132) the piece heard through a wall: a place's (music.js placeSound) muffles it, smoothly, as he walks in
  S.wall = cut => { wallAt = cut; const A = ac(); if (wall && A) wall.frequency.setTargetAtTime(cut, A.currentTime, 0.6); };
  S.duck = v => { const A = ac(); if (duck && A) duck.gain.setTargetAtTime(v, A.currentTime, 0.15); };
  return S;
}
