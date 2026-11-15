// A keeper's entrance (docs/keepers.md: what the research says, and each keeper's). Before a keeper rises its hall
// shuts behind him, it goes quiet, the dread builds in that keeper's own way, and at the keeper's best moment its name
// comes up big and its music comes in on the beat, with that keeper's own burst. No two are the same:
//   seal    how the ways out shut: stone (the Roots), an iron grate (the Cloister), ice (the Spires), a wall of storm
//           (the Tempest), thorns (the Gardens), star-glass (the Firmament)
//   dread   what he hears and sees while he waits: a heartbeat in the rock, a bell tolling closer, the wind dying and a
//           shadow passing over, lightning without rain, the ground pulsing and petals falling, the stars going out
//   reveal  when, in the keeper's own rise (its B.tm), its name comes; burst: what happens then
// The first time is the whole of it, its length by how much the keeper matters (the last is the longest); after that
// a short one, and a press of jump or attack skips it (G.keepers). If he falls, the hall is open when he is raised; when
// the keeper falls, the seals break.
//   makeEntrance(scene, R, H) -> { start(B, first, P, info), step(dt, P), skip(), open(), reset(),
//                                  lead, hush, cue, cam, face, brace, vig, tint, vigCol, sweep, title, st, first }
//   H: { fx(), sfx, shake(v), flash(v), buzz(strong, weak, ms), slow(s) } from main.js
import { T, LEVEL, ROCK, EMPTY, LEDGE } from './level.js';
import { lit, MOOD } from './render.js';
const THREE = window.THREE;

// each keeper's. role: the line over its name; name / glow: the name's colours; accent: its light (hex number);
// tint / vigCol: what the picture darkens to and closes in with; wait: seconds of dread the first time
export const STYLES = {
  roots:     { role: 'KEEPER OF THE ROOTS',     name: '#ead4aa', glow: '#feae34', accent: 0xfeae34, seal: 'stone', dread: 'heart',  wait: 3.0, reveal: 2.1, burst: 'quake', tint: '#181425', vigCol: '#181425' },
  cloister:  { role: 'KEEPER OF THE CLOISTER',  name: '#feae34', glow: '#f77622', accent: 0xfeae34, seal: 'grate', dread: 'toll',   wait: 3.4, reveal: 0.9, burst: 'toll',  tint: '#181425', vigCol: '#3e2731' },
  spires:    { role: 'KEEPER OF THE PASS',      name: '#ffffff', glow: '#2ce8f5', accent: 0x2ce8f5, seal: 'ice',   dread: 'frost',  wait: 3.2, reveal: 1.0, burst: 'frost', tint: '#262b44', vigCol: '#c0cbdc' },
  tempest:   { role: 'KEEPER OF THE STORM',     name: '#fee761', glow: '#ffffff', accent: 0xfee761, seal: 'storm', dread: 'static', wait: 3.2, reveal: 1.8, burst: 'bolt',  tint: '#262b44', vigCol: '#181425' },
  gardens:   { role: 'KEEPER OF THE GARDENS',   name: '#f6757a', glow: '#63c74d', accent: 0x63c74d, seal: 'thorn', dread: 'roots',  wait: 3.0, reveal: 2.0, burst: 'bloom', tint: '#193c3e', vigCol: '#193c3e' },
  firmament: { role: 'AT THE TOP OF THE WORLD', name: '#ffffff', glow: '#8b9bb4', accent: 0xc0cbdc, seal: 'glass', dread: 'stars',  wait: 4.6, reveal: 2.3, burst: 'star',  tint: '#000000', vigCol: '#000000' },
};
const PLAIN = STYLES.roots;
// how each kind of seal comes: slide (down, or across a floor), grow (up, or across), fade, strike (all at once, with a
// bolt); how long
const SEALS = {
  stone: { how: 'slide', t: 0.24 }, grate: { how: 'slide', t: 0.14 }, ice: { how: 'grow', t: 0.45 },
  storm: { how: 'strike', t: 0.05 }, thorn: { how: 'grow', t: 0.6 }, glass: { how: 'fade', t: 0.7 },
};

// the openings in a room's walls he could leave by: runs of open tiles through the wall band (two tiles), on the sides
// and the floor (not the roof, which may be the sky), no wider than a doorway
function openings(rm){
  const L = LEVEL, at = (i, j) => i < 0 || j < 0 || i >= L.W || j >= L.H ? ROCK : L.tiles[j * L.W + i], open = t => t === EMPTY || t === LEDGE;
  const tx0 = rm.tx0 != null ? rm.tx0 : Math.round(rm.x0 / T), tx1 = rm.tx1 != null ? rm.tx1 : Math.round(rm.x1 / T), ty0 = rm.ty0 != null ? rm.ty0 : Math.round(rm.y0 / T), ty1 = rm.ty1 != null ? rm.ty1 : Math.round(rm.y1 / T);
  const out = [], run = (side, cells) => { if (cells.length && cells.length <= 2 * 9) out.push({ side, cells }); };   // a doorway: up to nine tiles across (the band is two deep)
  for (const [side, band, out1] of [['l', [tx0, tx0 + 1], tx0 - 1], ['r', [tx1 - 1, tx1 - 2], tx1]]){
    let cur = [];
    for (let j = ty0; j <= ty1; j++){ const ok = j < ty1 && band.every(i => open(at(i, j))) && open(at(out1, j)); if (ok) cur.push(j); else { run(side, cur.flatMap(j => band.map(i => [i, j]))); cur = []; } }
  }
  // a way up through the floor is shut at its mouth, where he came out of it (in sight), not at the bottom of the room
  const mouth = cols => { const a = cols[0] - 1, b = cols[cols.length - 1] + 1; let j = ty0; while (j + 1 < ty1 && cols.every(i => open(at(i, j + 1))) && at(a, j + 1) === ROCK && at(b, j + 1) === ROCK) j++; return Math.max(ty0 + 1, j); };
  let cur = [];
  for (let i = tx0; i <= tx1; i++){ const ok = i < tx1 && open(at(i, ty0)) && open(at(i, ty0 + 1)) && open(at(i, ty0 - 1)); if (ok) cur.push(i); else { if (cur.length){ const top = mouth(cur); run('b', cur.flatMap(i => [[i, top - 1], [i, top]])); } cur = []; } }
  return out;
}

// ---- the seals, drawn: 8 pixels a tile, in the palette
const rnd = (a, b) => a + Math.random() * (b - a);
function paint(kind, wt, ht, side){
  const px = 8, c = document.createElement('canvas'); c.width = wt * px; c.height = ht * px; const g = c.getContext('2d'), W = c.width, H = c.height;
  const dot = (x, y, col, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  if (kind === 'stone'){
    g.fillStyle = '#181425'; g.fillRect(0, 0, W, H);
    const bw = side === 'b' ? 16 : W, bh = 8;
    for (let y = 0; y < H; y += bh) for (let x = -((y / bh) % 2) * bw / 2; x < W; x += bw){ dot(x + 1, y + 1, (x + y) % 3 ? '#3a4466' : '#262b44', bw - 2, bh - 2); dot(x + 1, y + 1, '#5a6988', bw - 2, 1); }
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.32;   // the keeper's mark, cut and burning
    for (let a = 0; a < Math.PI * 2; a += 0.08) dot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, '#e43b44');
    dot(cx, cy - r * 1.4, '#e43b44', 1, Math.round(r * 2.8)); dot(cx, cy - 1, '#feae34', 1, 3);
  }
  else if (kind === 'grate'){
    // an iron grate: bars up and across, gold rivets where they cross, the dark through it
    const step = 6;
    for (let x = 1; x < W; x += step){ dot(x, 0, '#262b44', 3, H); dot(x, 0, '#5a6988', 1, H); }
    for (let y = 2; y < H; y += step * 2){ dot(0, y, '#262b44', W, 2); dot(0, y, '#8b9bb4', W, 1); for (let x = 1; x < W; x += step) dot(x + 1, y, '#feae34'); }
    if (side !== 'b') for (let x = 1; x < W; x += step) dot(x, H - 3, '#8b9bb4', 3, 3);
  }
  else if (kind === 'ice'){
    // a wall of ice: pale, cold light in it, cracks running up it
    g.fillStyle = 'rgba(192,203,220,0.92)'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < W * H / 30; k++) dot(rnd(0, W), rnd(0, H), Math.random() < 0.5 ? '#ffffff' : '#2ce8f5', Math.random() < 0.3 ? 2 : 1, 1);
    for (let k = 0; k < 4; k++){ const x = rnd(0, W); for (let y = 0; y < H; y++) dot(x + Math.sin(y * 0.3 + k) * 2, y, '#8b9bb4'); }
    for (let x = 0; x < W; x++) dot(x, 0, '#ffffff', 1, 1 + ((x * 7) % 3));
  }
  else if (kind === 'storm'){
    // the storm stood up in the doorway: dark, lightning crawling in it
    g.fillStyle = 'rgba(38,43,68,0.85)'; g.fillRect(0, 0, W, H);
    for (let b = 0; b < 3; b++){ let x = rnd(2, W - 2), y = 0; while (y < H){ const nx = Math.max(0, Math.min(W - 1, x + rnd(-3, 3))); dot(Math.min(x, nx), y, '#fee761', Math.abs(nx - x) + 1, 1); dot(nx, y, '#ffffff'); x = nx; y += 1 + Math.floor(Math.random() * 3); } }
  }
  else if (kind === 'thorn'){
    // thorns grown across it: dark stems knotted, red points, a flower or two
    for (let k = 0; k < 18; k++){ let x = rnd(0, W), y = rnd(0, H), a = rnd(0, 6.28); for (let s = 0; s < 40; s++){ dot(x, y, s % 3 ? '#265c42' : '#193c3e', 2, 2); if (s % 6 === 0) dot(x + 2, y - 1, '#e43b44'); x += Math.cos(a) * 1.2; y += Math.sin(a) * 1.2; a += rnd(-0.6, 0.6); } }
    for (let k = 0; k < 3; k++){ const x = rnd(3, W - 3), y = rnd(3, H - 3); dot(x - 1, y, '#f6757a', 3, 1); dot(x, y - 1, '#f6757a', 1, 3); dot(x, y, '#fee761'); }
  }
  else {
    // star-glass: deep blue, stars in it, a constellation drawn through
    g.fillStyle = 'rgba(18,78,137,0.8)'; g.fillRect(0, 0, W, H);
    const pts = []; for (let k = 0; k < 6; k++) pts.push([rnd(2, W - 2), rnd(2, H - 2)]);
    for (let k = 1; k < pts.length; k++){ const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], n = Math.hypot(x1 - x0, y1 - y0); for (let s = 0; s < n; s += 2) dot(x0 + (x1 - x0) * s / n, y0 + (y1 - y0) * s / n, '#0099db'); }
    for (const [x, y] of pts){ dot(x - 1, y, '#ffffff', 3, 1); dot(x, y - 1, '#ffffff', 1, 3); }
    for (let k = 0; k < W * H / 40; k++) dot(rnd(0, W), rnd(0, H), '#c0cbdc');
  }
  if (kind === 'stone' || kind === 'storm' || kind === 'glass'){ g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1; g.strokeRect(0.5, 0.5, W - 1, H - 1); }
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}

export function makeEntrance(scene, R, H){
  const E = { st: '', t: 0, lead: false, hush: false, cue: false, cam: null, face: 0, brace: false, vig: 0, tint: '#181425', vigCol: '#181425', sweep: -1, title: null,
    B: null, S: PLAIN, first: true, seals: [], revealed: false, beatT: 0, beats: 0, star: null, later: [] };
  const ease = t => t * t, later = (t, f) => E.later.push({ t, f });
  const roof = () => E.B.room.y1 - 1.2;

  function seal(){
    const rm = E.B.room; if (!rm) return;
    const kind = E.S.seal, how = SEALS[kind];
    openings(rm).forEach(o => {
      const xs = o.cells.map(c => c[0]), ys = o.cells.map(c => c[1]), i0 = Math.min(...xs), i1 = Math.max(...xs), j0 = Math.min(...ys), j1 = Math.max(...ys);
      const w = (i1 - i0 + 1) * T, h = (j1 - j0 + 1) * T, x = (i0 * T) + w / 2, y = (j0 * T) + h / 2, soft = kind !== 'stone';
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit({ map: paint(kind, i1 - i0 + 1, j1 - j0 + 1, o.side), transparent: soft }));
      if (soft) m.material.alphaTest = 0.05;
      m.position.set(x, y, 0.05); m.visible = false; scene.add(m);
      const was = o.cells.map(([i, j]) => LEVEL.tiles[j * LEVEL.W + i]);
      E.seals.push({ o, m, x, y, w, h, was, at: 0, down: false, how: how.how, dur: how.t, from: o.side === 'b' ? x - w - 1 : y + h + 2 });
    });
    // the one he came in by first (the nearest), then the rest
    const P = E.hero; if (P) E.seals.sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
    E.seals.forEach((S, k) => { S.at = 0.2 + k * (E.first ? 0.25 : 0.08); });
  }
  // how a seal stands at k (0 to 1 of its coming)
  function pose(S, k){
    const m = S.m, floor = S.o.side === 'b', e = Math.max(0.02, Math.min(1, k));
    if (S.how === 'slide'){ const s = ease(e); if (floor) m.position.set(S.from + (S.x - S.from) * s, S.y, 0.05); else m.position.set(S.x, S.from + (S.y - S.from) * s, 0.05); }
    else if (S.how === 'grow'){ if (floor){ m.scale.set(e, 1, 1); m.position.set(S.x - S.w / 2 + S.w * e / 2, S.y, 0.05); } else { m.scale.set(1, e, 1); m.position.set(S.x, S.y - S.h / 2 + S.h * e / 2, 0.05); } }
    else if (S.how === 'fade'){ m.position.set(S.x, S.y, 0.05); m.material.opacity = e; }
    else { m.position.set(S.x, S.y, 0.05); m.material.opacity = k >= 1 ? 0.7 + Math.random() * 0.3 : 0; }   // the storm: struck, and crawling
  }
  function shut(S, P){
    // he is never shut into the stone: if he stands in the doorway, the seal puts him into the hall
    const xs = S.o.cells.map(c => c[0]), lo = Math.min(...xs) * T, hi = (Math.max(...xs) + 1) * T;
    if (P && S.o.side !== 'b' && P.x > lo - 0.45 && P.x < hi + 0.45 && P.y < S.y + S.h / 2 && P.y + 2.4 > S.y - S.h / 2) P.x = S.o.side === 'l' ? hi + 0.5 : lo - 0.5;
    S.o.cells.forEach(([i, j]) => { LEVEL.tiles[j * LEVEL.W + i] = ROCK; });
    const fx = H.fx(), foot = S.o.side === 'b' ? S.y + S.h / 2 : S.y - S.h / 2, kind = E.S.seal, sfx = H.sfx;
    R.shock(S.x, S.y, true); H.buzz(0.7, 0.5, 220);
    if (kind === 'stone'){ sfx.slam(); sfx.impact(true); H.shake(0.42); fx.dust({ x: S.x, y: foot }, 22, 4); fx.debris(S.x - S.w, S.x + S.w, S.y + S.h / 2 + 3, foot, 10); R.glint(S.x, S.y, 0xe43b44, 1.4, 7, 2.2); }
    else if (kind === 'grate'){ sfx.clang(); sfx.slam(); H.shake(0.35); fx.burst({ x: S.x, y: foot }, 18, 0xfeae34); fx.dust({ x: S.x, y: foot }, 12, 3); R.glint(S.x, foot, 0xfeae34, 1.1, 5, 0.6); }
    else if (kind === 'ice'){ sfx.crack(); sfx.snap(); H.shake(0.25); fx.burst({ x: S.x, y: S.y }, 26, 0xc0cbdc); fx.debris(S.x - S.w, S.x + S.w, S.y + S.h / 2 + 2, foot, 14, [0xffffff, 0xc0cbdc], true); R.glint(S.x, S.y, 0x2ce8f5, 1.2, 6, 1.5); }
    else if (kind === 'storm'){ sfx.impact(true); sfx.crack(); H.flash(0.45); H.shake(0.5); fx.burst({ x: S.x, y: S.y }, 24, 0xfee761); R.glint(S.x, S.y + 3, 0xffffff, 2.2, 12, 0.35); R.glint(S.x, S.y, 0xfee761, 1.2, 6, 2); }
    else if (kind === 'thorn'){ sfx.snap(); H.shake(0.22); fx.burst({ x: S.x, y: S.y }, 16, 0x63c74d); fx.burst({ x: S.x, y: S.y }, 6, 0xf6757a); R.glint(S.x, S.y, 0x63c74d, 0.9, 5, 1.2); }
    else { sfx.parry(); H.shake(0.15); fx.burst({ x: S.x, y: S.y }, 30, 0xffffff); R.glint(S.x, S.y, 0x0099db, 1.4, 7, 2); }
  }
  // the growing kinds make their sound as they start
  function begin(){ const kind = E.S.seal; if (kind === 'thorn') H.sfx.creak(); if (kind === 'ice') H.sfx.crack(); if (kind === 'glass') H.sfx.parry(); }
  function unshut(S, crumble){
    S.o.cells.forEach(([i, j], k) => { LEVEL.tiles[j * LEVEL.W + i] = S.was[k]; });
    if (crumble){ const fx = H.fx(), col = { stone: 0x8b9bb4, grate: 0x5a6988, ice: 0xc0cbdc, storm: 0xfee761, thorn: 0x265c42, glass: 0x0099db }[E.S.seal]; fx.burst({ x: S.x, y: S.y }, 30, col); fx.dust({ x: S.x, y: S.y - S.h / 2 }, 20, 4); }
    scene.remove(S.m); S.m.geometry.dispose();
  }

  // ---- the dread, each keeper's own. k: 0 to 1 through it
  const DREAD = {
    // the Warden: a heartbeat in the rock, slow and then quick; the roof coming down with each
    heart(k, dt, B, rm, fx){
      MOOD.dark = 0.2 + 0.65 * k; MOOD.flicker = k * 0.8;
      if ((E.beatT -= dt) <= 0){ E.beatT = 1.0 - 0.55 * k; H.sfx.impact(false); H.shake(0.12 + 0.4 * k); H.buzz(0.3 + 0.5 * k, 0.4, 140); fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 3 + Math.floor(8 * k));
        later(0.17, () => { H.sfx.impact(false); H.shake(0.08 + 0.25 * k); }); fx.dust({ x: rnd(rm.x0 + 2, rm.x1 - 2), y: B.stageY }, 6, 2); }
    },
    // the Toll: a bell, far off and then close, each stroke a ring through the hall and a light going out
    toll(k, dt, B, rm, fx){
      const at = [0.08, 0.32, 0.54, 0.72, 0.87];
      while (E.beats < at.length && k >= at[E.beats]){ E.beats++; const n = E.beats;
        H.sfx.parry(); H.sfx.rumble(); H.shake(0.15 + n * 0.07); H.buzz(0.3 + n * 0.1, 0.3, 200);
        fx.ring({ x: B.cx, y: rm.y1 - 4 }, 0xfeae34); later(0.12, () => fx.ring({ x: B.cx, y: rm.y1 - 4 }, 0xf77622)); R.shock(B.cx, rm.y1 - 4, n > 2);
        R.glint(B.cx, rm.y1 - 4, 0xfeae34, 0.4 + n * 0.2, 8, 0.6); fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 4 + n * 2); }
      MOOD.dark = 0.12 + 0.15 * E.beats; MOOD.flicker = 0.3;
    },
    // the Wyrm: the wind drops, snow comes down slow, the cold closes in white, and something huge passes over
    frost(k, dt, B, rm, fx){
      MOOD.dark = 0.15 + 0.45 * k; MOOD.flicker = 0;
      if (Math.random() < 0.6) fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 1 + Math.floor(k * 3), [0xffffff, 0xc0cbdc], true);
      if (E.beats === 0 && k > 0.4){ E.beats = 1; E.sweep = 0; H.sfx.whoosh(); later(0.35, () => H.sfx.whoosh()); H.shake(0.2); }
      if (E.beats === 1 && k > 0.82){ E.beats = 2; H.sfx.whoosh(); H.shake(0.3); fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 30, [0xffffff, 0xc0cbdc], true); }
      if (E.sweep >= 0) E.sweep += dt / 1.3;
    },
    // the Thunderhead: no rain, no wind; the air crackling, and lightning closer and closer
    static(k, dt, B, rm, fx){
      MOOD.dark = 0.3 + 0.5 * k; MOOD.flicker = 0.4;
      if (Math.random() < dt * (3 + 6 * k)) H.sfx.snap();
      // never more than two flashes a second (under the three a second that can harm a player sensitive to light)
      E.gap = (E.gap || 0) - dt; if (E.gap <= 0 && Math.random() < dt * (0.8 + 2.5 * k)){ E.gap = 0.5; const x = rnd(rm.x0 + 2, rm.x1 - 2); H.flash(0.2 + 0.2 * k); H.sfx.crack(); H.shake(0.1 + 0.3 * k); R.glint(x, rm.y1 - 2, 0xffffff, 1.4 + k, 14, 0.2); fx.burst({ x, y: rm.y1 - 2 }, 8, 0xfee761); }
    },
    // Mother Thorn: the light goes green, petals come down, and the ground under him swells and settles like breath
    roots(k, dt, B, rm, fx){
      MOOD.dark = 0.2 + 0.5 * k; MOOD.flicker = 0;
      if (Math.random() < 0.5) fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 1 + Math.floor(k * 2), [0xf6757a, 0xfee761, 0x63c74d], true);
      if ((E.beatT -= dt) <= 0){ E.beatT = 1.2 - 0.45 * k; H.sfx.creak(); H.shake(0.1 + 0.3 * k); H.buzz(0.2 + 0.4 * k, 0.5, 300); for (let i = 0; i < 4; i++) fx.dust({ x: rnd(rm.x0 + 2, rm.x1 - 2), y: B.stageY }, 4, 1.5); }
    },
    // the Fallen: nothing moves. The lights go out, then the stars; his own steps; then one star falls
    stars(k, dt, B, rm, fx){
      MOOD.dark = 0.15 + 0.8 * k; MOOD.flicker = 0;
      if (E.beats === 0 && k > 0.3){ E.beats = 1; H.sfx.step(); } if (E.beats === 1 && k > 0.55){ E.beats = 2; H.sfx.step(); }
      if (E.beats === 2 && k > 0.78){ E.beats = 3; E.star = { t: 0, x0: rm.x0 + 3, y0: rm.y1 - 1, x1: B.x != null ? B.x : B.cx, y1: B.stageY + 1.5 }; H.sfx.whoosh(); }
      if (E.star && E.star.t < 1){ const S = E.star; S.t = Math.min(1, S.t + dt / 0.75); const u = S.t * S.t, x = S.x0 + (S.x1 - S.x0) * u, y = S.y0 + (S.y1 - S.y0) * u;
        fx.burst({ x, y }, 3, 0xffffff); R.glint(x, y, 0xfee761, 0.8, 4, 0.12);
        if (S.t >= 1){ fx.burst({ x, y }, 30, 0xfee761); H.sfx.parry(); R.glint(x, y, 0xffffff, 1.4, 8, 0.6); } }
    },
  };
  // ---- the reveal: its name, its music, and its own burst
  const BURST = {
    quake(B, rm, fx){ H.shake(1.0); H.flash(0.3); H.buzz(1, 0.9, 700); H.sfx.roar(); H.sfx.impact(true); fx.ring({ x: B.cx, y: B.stageY }, 0xffd27a); fx.dust({ x: B.cx, y: B.stageY }, 50, 7); fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 60); R.shock(B.cx, B.stageY + 2, true); },
    toll(B, rm, fx){ H.shake(0.8); H.flash(0.35); H.buzz(1, 0.7, 600); H.sfx.parry(); H.sfx.roar(); for (let i = 0; i < 4; i++) later(i * 0.12, () => { fx.ring({ x: B.cx, y: B.stageY + 4 }, i % 2 ? 0xf77622 : 0xfeae34); R.shock(B.cx, B.stageY + 4, true); }); R.glint(B.cx, B.stageY + 5, 0xfeae34, 1.8, 12, 1); },
    frost(B, rm, fx){ H.shake(0.7); H.flash(0.6); H.buzz(0.9, 0.8, 500); H.sfx.roar(); H.sfx.crack(); fx.burst({ x: B.cx, y: B.stageY + 4 }, 60, 0xc0cbdc); fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 90, [0xffffff, 0xc0cbdc, 0x2ce8f5], true); R.glint(B.cx, B.stageY + 5, 0x2ce8f5, 1.6, 12, 1); },
    bolt(B, rm, fx){ H.shake(0.95); H.flash(0.9); H.buzz(1, 1, 500); H.sfx.impact(true); H.sfx.crack(); H.sfx.roar(); fx.burst({ x: B.cx, y: B.stageY }, 50, 0xfee761); fx.ring({ x: B.cx, y: B.stageY }, 0xffffff); R.glint(B.cx, B.stageY + 2, 0xffffff, 2.4, 16, 0.4); R.shock(B.cx, B.stageY + 1, true); },
    bloom(B, rm, fx){ H.shake(0.55); H.flash(0.25); H.buzz(0.7, 0.8, 600); H.sfx.roar(); H.sfx.creak(); fx.burst({ x: B.cx, y: B.stageY + 4 }, 50, 0xf6757a); fx.burst({ x: B.cx, y: B.stageY + 4 }, 20, 0xfee761); fx.ring({ x: B.cx, y: B.stageY }, 0x63c74d); fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 50, [0xf6757a, 0xfee761, 0x63c74d], true); },
    star(B, rm, fx){ const x = B.x != null ? B.x : B.cx; H.slow(1.1); H.flash(0.6); H.shake(0.5); H.buzz(0.8, 1, 700); H.sfx.parry(); H.sfx.impact(true); fx.burst({ x, y: B.stageY + 1.5 }, 70, 0xffffff); fx.burst({ x, y: B.stageY + 1.5 }, 30, 0xfee761); fx.ring({ x, y: B.stageY }, 0xc0cbdc); R.glint(x, B.stageY + 2, 0xffffff, 2, 12, 1.2); },
  };

  E.start = (B, first, P, info = {}) => {
    if (E.st) return;
    E.B = B; E.S = STYLES[info.theme] || PLAIN; E.first = first; E.hero = P; E.st = 'seal'; E.t = 0; E.lead = true; E.hush = true; E.cue = false; E.revealed = false;
    E.beatT = 0; E.beats = 0; E.star = null; E.later = []; E.sweep = -1; E.title = null; E.seals = [];
    E.info = { name: B.name, epithet: info.epithet || '' }; E.tint = E.S.tint; E.vigCol = E.S.vigCol;
    E.wait = first ? E.S.wait : 0.8;
    seal(); E.cam = E.seals.length ? { x: E.seals[0].x, y: E.seals[0].y + 2 } : null;
  };
  // a press during a short one (he has seen it): straight to the keeper
  E.skip = () => { if (!E.lead || E.first) return; for (const S of E.seals){ S.m.visible = true; pose(S, 1); if (!S.down){ S.down = true; shut(S, E.hero); } } E.st = 'rise'; E.t = 0; E.lead = false; E.cam = null; E.brace = false; E.star = null; };
  E.step = (dt, P) => {
    if (!E.st) return;
    E.t += dt; const B = E.B, rm = B.room, fx = H.fx();
    for (let i = E.later.length - 1; i >= 0; i--){ const L = E.later[i]; if ((L.t -= dt) <= 0){ E.later.splice(i, 1); L.f(); } }
    if (E.title) E.title.t += dt;
    // the seals come, one after another
    if (E.st === 'seal' || E.st === 'dread') for (const S of E.seals){
      if (E.st === 'seal' && E.t < S.at) continue;
      if (!S.m.visible){ S.m.visible = true; begin(); }
      const k = E.st === 'seal' ? (E.t - S.at) / S.dur : 1; pose(S, k);
      if (k >= 1 && !S.down){ S.down = true; shut(S, P); E.face = Math.sign(S.x - P.x) || E.face; }
    }
    else for (const S of E.seals) if (S.how === 'strike') pose(S, 1);   // the storm keeps crawling
    if (E.st === 'seal'){
      const L = E.seals[E.seals.length - 1], last = L ? L.at + L.dur + 0.35 : 0;
      E.vig = Math.min(0.25, E.t * 0.3);
      if (E.t >= Math.max(E.first ? 1.0 : 0.45, last)){ E.st = 'dread'; E.t = 0; }
    }
    else if (E.st === 'dread'){
      const k = Math.min(1, E.t / E.wait);
      E.cam = { x: B.x != null && E.S.dread === 'stars' ? B.x : B.cx, y: B.stageY + 4.6 }; E.face = Math.sign(E.cam.x - P.x) || E.face;
      E.vig = 0.25 + 0.75 * k; E.brace = k > 0.6;
      if (rm) DREAD[E.S.dread](k, dt, B, rm, fx);
      if (E.t >= E.wait && (!E.star || E.star.t >= 1)){ E.st = 'rise'; E.t = 0; E.lead = false; E.cam = null; E.brace = false; }
    }
    else if (E.st === 'rise'){
      // its own rise; at its moment, its name and its music
      MOOD.flicker = Math.max(0, MOOD.flicker - dt);
      if (!E.revealed && E.S.dread === 'frost' && rm && Math.random() < 0.5) fx.debris(rm.x0 + 1, rm.x1 - 1, roof(), B.stageY, 2, [0xffffff, 0xc0cbdc], true);
      if (!E.revealed && (B.tm >= (E.first ? E.S.reveal : Math.min(E.S.reveal, 0.6)) || B.st !== 'rise')){
        E.revealed = true; E.hush = false; E.cue = true;
        E.title = { t: 0, name: E.info.name.toUpperCase(), role: E.S.role, epithet: E.info.epithet, color: E.S.name, glow: E.S.glow };
        if (rm) BURST[E.S.burst](B, rm, fx);
      }
      if (E.revealed){ MOOD.dark += (0.25 - MOOD.dark) * Math.min(1, dt * 2); E.vig = Math.max(0.3, E.vig - dt * 0.5); }
      if (E.revealed && B.st !== 'rise'){ E.st = 'after'; E.t = 0; }
    }
    else { MOOD.dark = Math.max(0, MOOD.dark - dt * 0.4); MOOD.flicker = 0; E.vig = Math.max(0, E.vig - dt * 0.5); if (E.title && E.title.t > 5) E.title = null; if (MOOD.dark <= 0 && E.vig <= 0 && !E.title) E.st = 'held'; }
  };
  const clear = () => { E.seals = []; E.st = ''; E.lead = false; E.hush = false; E.cue = false; E.cam = null; E.brace = false; E.vig = 0; E.sweep = -1; E.title = null; E.later = []; E.star = null; MOOD.dark = 0; MOOD.flicker = 0; };
  // the keeper falls: the seals break, the way out is open
  E.open = () => { E.seals.forEach(S => unshut(S, true)); if (E.B) H.sfx.crack(); clear(); };
  // he fell, or left: gone as if they were never there
  E.reset = () => { E.seals.forEach(S => unshut(S, false)); clear(); };
  return E;
}
