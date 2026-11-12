// The recorded score: one piece at a time through the music bus, faded from one to the next, going round while it is
// wanted. A piece is fetched and decoded when first asked for (and the one before last is let go, they are large).
// makeScore() -> { has(key), play(key), duck(v), now }. Where there is no recording of a piece the game's own
// generated score (side/music.js) plays instead.
import { ac, musicBus, MANIFEST } from './sfx.js';
export function makeScore(){
  const bufs = new Map(), loading = new Set(); let cur = null, want = '', duck = null;
  const S = { now: '' };
  S.has = key => !!MANIFEST.music[key];
  function start(key){
    const A = ac(), bus = musicBus(); if (!A || !bus) return;
    if (!duck){ duck = A.createGain(); duck.connect(bus); }
    if (cur){ const o = cur; o.g.gain.cancelScheduledValues(A.currentTime); o.g.gain.setTargetAtTime(0, A.currentTime, 0.5); try { o.s.stop(A.currentTime + 2.6); } catch (e){} cur = null; }
    S.now = key; if (!key) return;
    const s = A.createBufferSource(), g = A.createGain(); s.buffer = bufs.get(key); s.loop = true; g.gain.value = 0; g.gain.setTargetAtTime((MANIFEST.music[key].v || 1) * 0.8, A.currentTime + 0.25, 0.6);
    s.connect(g).connect(duck); s.start(); cur = { s, g, key };
    for (const k of [...bufs.keys()]) if (k !== key && bufs.size > 2) bufs.delete(k);
  }
  S.play = key => {
    key = key && S.has(key) ? key : ''; want = key; if (key === S.now) return;
    if (!key || bufs.has(key)){ start(key); return; }
    if (loading.has(key)) return; loading.add(key); const A = ac(); if (!A){ loading.delete(key); return; }
    fetch(MANIFEST.base + MANIFEST.music[key].f).then(r => r.arrayBuffer()).then(b => A.decodeAudioData(b)).then(buf => { bufs.set(key, buf); loading.delete(key); if (want === key) start(key); }).catch(() => { loading.delete(key); delete MANIFEST.music[key]; });
  };
  S.duck = v => { const A = ac(); if (duck && A) duck.gain.setTargetAtTime(v, A.currentTime, 0.15); };
  return S;
}
