// The story's screens: the title, the fall that begins it, the card between regions, the ending. Each is drawn small
// (320 x 180, the game's own pixel) in the palette and scaled up whole, with its words over it at the screen's size.
//   The story: from the top of the world he fell, to the roots of the mountain. There is one way to go. The game is
//   that climb, the Roots, the Cloister, the Spires, to the beacon at the summit; these screens say so and show where
//   on the mountain he is.
// makeStory(hud) returns { active(), start(kind, opts), draw(dt), press() }; kinds: 'title', 'intro', 'card', 'ending'.
import { sfx } from '../audio/sfx.js';
import { text } from './pixelfont.js';
const PAL = { ink: '#181425', deep: '#262b44', dark: '#3a4466', mid: '#5a6988', light: '#8b9bb4', pale: '#c0cbdc', white: '#ffffff', navy: '#124e89', blue: '#0099db', cyan: '#2ce8f5',
  plum: '#68386c', pink: '#b55088', rose: '#f6757a', fire1: '#f77622', fire2: '#feae34', fire3: '#fee761', wood0: '#3e2731', wood1: '#733e39', moss1: '#3e8948' };
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], CW = 320, CH = 180;
const rng = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const img = url => { const i = new Image(); i.src = url; return i; };
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
// the mountain's shape: where its middle and its two flanks are at each row (the apex at APEX, the foot off the bottom)
const APEX = 24, FOOT = 178;
const flank = y => { const t = Math.max(0, (y - APEX) / (FOOT - APEX)), w = 3 + Math.pow(t, 1.2) * 118, cx = 160 + Math.sin(y * 0.045) * 7; return { l: Math.round(cx - w * 0.92 - Math.sin(y * 0.31) * 3 * t - Math.sin(y * 0.11) * 6 * t), r: Math.round(cx + w * 1.06 + Math.sin(y * 0.27 + 2) * 3 * t + Math.sin(y * 0.09 + 1) * 7 * t) }; };
// how high he is, 0 at the foot to 1 at the top, to a place on its left ridge
const ridge = f => { const y = FOOT - 2 - f * (FOOT - 2 - APEX - 3), F = flank(y); return { x: F.l + 2 + (1 - f) * 10, y }; };
export const REGION_SPAN = [[0, 0.2], [0.2, 0.36], [0.36, 0.54], [0.54, 0.7], [0.7, 0.85], [0.85, 1]];   // each region's share of the climb, bottom to top

// the mountain, at night or at dawn: sky, far ranges, and the mountain with its three regions told apart: crystals in
// its roots, lit windows in its middle, snow and spires at its top
function paintMountain(dawn){
  const c = canvas(CW, CH), g = c.getContext('2d'), r = rng(dawn ? 77 : 31), px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const sky = dawn ? [PAL.deep, PAL.dark, PAL.plum, PAL.pink, PAL.rose, PAL.fire2, PAL.fire3] : [PAL.ink, PAL.ink, PAL.deep, PAL.deep, PAL.dark, PAL.dark, PAL.plum];
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++){ const k = y / CH * (sky.length - 1), i = Math.floor(k), f = k - i; px(sky[B4[(y & 3) * 4 + (x & 3)] / 16 < f ? i + 1 : i], x, y); }
  if (!dawn) for (let k = 0; k < 90; k++){ const x = Math.floor(r() * CW), y = Math.floor(r() * 120); px(r() < 0.25 ? PAL.white : PAL.light, x, y); }
  if (!dawn){ for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) if (Math.hypot(x, y) < 7 && Math.hypot(x - 3, y - 2) > 6) px(PAL.pale, 258 + x, 30 + y); }
  else for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) if (Math.hypot(x, y) < 9) px(PAL.white, 70 + x, 150 + y);
  // far ranges
  for (const [base, amp, col, seed] of [[118, 26, dawn ? PAL.plum : PAL.deep, 3], [140, 22, dawn ? PAL.dark : PAL.ink, 9]])
    for (let x = 0; x < CW; x++){ const top = Math.round(base - Math.abs(Math.sin(x * 0.045 + seed)) * amp - Math.abs(Math.sin(x * 0.13 + seed * 2)) * amp * 0.3); px(col, x, top, 1, CH - top); }
  // the mountain
  const body = dawn ? PAL.deep : PAL.ink, lit = dawn ? PAL.rose : PAL.dark;
  for (let y = APEX; y < CH; y++){ const F = flank(Math.min(y, FOOT)); px(body, F.l, y, F.r - F.l, 1); px(lit, F.l, y, 1 + (y % 5 === 0 ? 1 : 0), 1); if (dawn && y % 2) px(PAL.dark, F.l + 2, y, Math.max(0, Math.round((F.r - F.l) * 0.12)), 1); }
  // the Spires: snow on the high slopes, needles of rock beside the peak
  for (let y = APEX; y < 84; y++){ const F = flank(y), d = Math.max(1, Math.round((84 - y) / 7 + Math.sin(y * 0.9) * 1.5)); px(dawn ? PAL.white : PAL.pale, F.l, y, d, 1); if (y % 3 === 0) px(PAL.light, F.r - Math.round(d * 0.5) - 1, y, Math.round(d * 0.5), 1); }
  for (const [x, top, h] of [[190, 44, 30], [198, 58, 22], [128, 60, 16]]) for (let k = 0; k < h; k++){ const half = Math.round(k / h * 2.5); px(body, x - half, top + k, half * 2 + 1, 1); px(dawn ? PAL.white : PAL.pale, x - half, top + k, 1, 1); }
  // the Cloister: rows of lit windows
  for (let row = 0; row < 4; row++){ const y = 94 + row * 9, F = flank(y); for (let x = F.l + 10; x < F.r - 8; x += 9) if (r() < 0.62){ px(PAL.fire2, x, y, 2, 3); px(PAL.fire3, x, y, 1, 1); px(PAL.wood1, x - 1, y + 3, 4, 1); } }
  // the Roots: crystals and cracks of cold light
  for (let k = 0; k < 46; k++){ const y = 134 + Math.floor(r() * 44), F = flank(Math.min(y, FOOT)), x = F.l + 6 + Math.floor(r() * Math.max(1, F.r - F.l - 12)); px(r() < 0.4 ? PAL.cyan : PAL.blue, x, y, 1, 1 + Math.floor(r() * 3)); if (r() < 0.3) px(PAL.navy, x + 1, y + 1, 2, 1); }
  return c;
}

export function makeStory(hud, heroBase){
  const hx = hud.getContext('2d'), cv = canvas(CW, CH), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const night = paintMountain(false), dawn = paintMountain(true);
  const far = { spires: img('assets/side/bg/spires.png'), cloister: img('assets/side/bg/cloister.png'), roots: img('assets/side/bg/far.png') };
  // the rock between two regions, as he falls past: dark, its edges broken up
  const rock = canvas(CW, 50); { const rg = rock.getContext('2d'); rg.fillStyle = PAL.ink; for (let yy = 0; yy < 50; yy++) for (let x = 0; x < CW; x++){ const e = Math.min(yy, 49 - yy) / 8; if (e >= 1 || B4[(yy & 3) * 4 + (x & 3)] / 16 < e) rg.fillRect(x, yy, 1, 1); } }
  const hero = { fall: img(`${heroBase}/fall.png`), stand: img(`${heroBase}/stand.png`) };
  const S = { kind: null, t: 0, opts: {}, done: null, snow: Array.from({ length: 60 }, (_, k) => ({ x: (k * 53) % CW, y: (k * 97) % CH, v: 20 + (k * 7) % 30 })) };
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  S.active = () => !!S.kind;
  S.start = (kind, opts = {}, done = null) => { S.kind = kind; S.t = 0; S.opts = opts; S.done = done; S.said = -1; };
  const end = () => { const d = S.done; S.kind = null; S.done = null; if (d) d(); };
  // a press: the title waits for its buttons; the rest can be hurried on once they have begun
  S.press = () => { if (!S.kind || S.kind === 'title') return; if (S.t > 0.6){ if (S.kind === 'card') S.t = Math.max(S.t, LEN.card - 0.5); else end(); } };
  const LEN = { intro: 21, card: 3.4, ending: 20 };

  function beacon(on, t){
    const x = 160, y = APEX - 3; px(PAL.wood1, x - 1, y, 3, 3); px(PAL.ink, x - 2, y + 3, 5, 1);
    if (on){ px(PAL.fire3, x - 1, y - 3, 3, 3); px(PAL.white, x, y - 2, 1, 1); for (let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2 + t * 0.6, L = 6 + Math.sin(t * 5 + k) * 2; for (let d = 3; d < L; d++) if ((d + k) % 2) px(k % 2 ? PAL.fire2 : PAL.fire3, x + Math.cos(a) * d, y - 2 + Math.sin(a) * d); } }
  }
  function marker(f, t){ const p = ridge(f); px(PAL.ink, p.x - 2, p.y - 2, 5, 5); px(PAL.white, p.x - 1, p.y - 1, 3, 3); if (Math.floor(t * 3) % 2) px(PAL.fire3, p.x, p.y, 1, 1); }
  function snowfall(dt, drift){ for (const s of S.snow){ s.y += s.v * dt; s.x += drift * dt; if (s.y > CH) s.y = 0; if (s.x < 0) s.x += CW; px(PAL.white, s.x, s.y); } }
  function figure(im, frame, x, y, rot, size){
    if (!im.complete || !im.naturalWidth) return; const n = Math.max(1, Math.round(im.naturalWidth / im.naturalHeight)), w = im.naturalWidth / n;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(rot); g.drawImage(im, (frame % n) * w, 0, w, im.naturalHeight, -size / 2, -size / 2, size, size); g.restore();
  }
  // words over the picture, at the screen's own size
  const words = [];
  const say = (text, y, size, alpha, col = '#fff2d0') => words.push({ text, y, size, alpha, col });

  function title(dt){
    g.drawImage(night, 0, 0); beacon(false, S.t); marker(0, S.t); snowfall(dt, -8);
    say('THE CLIMB', 0.26, 0.13, Math.min(1, S.t / 1.2));
    say('from the roots of the mountain to its summit', 0.46, 0.032, ease((S.t - 0.8) / 1.2) * 0.85, '#cfe6ff');
  }
  function intro(dt){
    const t = S.t;
    // the lines, each with when it comes and goes
    const L = [[0.6, 4.6, 'From the top of the world, he fell.'], [5.4, 8.6, 'Past the spires of ice.'], [8.9, 12.0, 'Past the halls of stone.'], [12.3, 15.2, 'Down, to the roots of the mountain.'], [16.0, 18.4, 'He woke in the dark.'], [18.6, 20.8, 'There was only one way to go.']];
    if (t < 5){
      // the summit, and him off it
      g.drawImage(night, 0, 0); beacon(t < 2.2, t); snowfall(dt, -14);
      const u = ease((t - 2.2) / 2.8), x = 160 - 3 - u * 46, y = APEX - 8 + u * u * 150;
      figure(u > 0 ? hero.fall : hero.stand, Math.floor(t * 8), x, y, -u * 5, 14);
      if (t > 2.2 && t < 2.5) px(PAL.white, 0, 0, CW, CH);
      if (t > 2.2 && S.said < 0){ S.said = 0; sfx.crack && sfx.crack(); }
    } else if (t < 15.6){
      // the fall: the mountain's three regions go up past him, each behind its own rock
      const u = (t - 5) / 10.6, scroll = u * u * 0.35 + u * 0.65, band = [['spires', far.spires], ['cloister', far.cloister], ['roots', far.roots]];
      const total = 3 * 224 + 2 * 50, y0 = -scroll * (total - CH * 0.4);
      px(PAL.ink, 0, 0, CW, CH);
      band.forEach(([, im], k) => { const y = y0 + k * (224 + 50); if (im.complete && im.naturalWidth && y < CH && y > -224) g.drawImage(im, 40, 0, 320, 224, 0, Math.round(y), 320, 224); });
      for (let k = 0; k < 2; k++){ const y = Math.round(y0 + 224 + k * 274); if (y < CH && y > -50) g.drawImage(rock, 0, y); }
      for (let k = 0; k < 26; k++){ const x = (k * 71 + 13) % CW, y = (k * 47 + t * 520) % (CH + 40) - 20; px(k % 3 ? PAL.light : PAL.white, x, CH - y, 1, 6 + k % 5); }
      figure(hero.fall, Math.floor(t * 10), 160 + Math.sin(t * 2.1) * 10, 80 + Math.sin(t * 1.3) * 6, t * 4.5, 56);
      const dim = ease((t - 14.2) / 1.2); if (dim > 0){ g.globalAlpha = dim; px(PAL.ink, 0, 0, CW, CH); g.globalAlpha = 1; }
    } else {
      px(PAL.ink, 0, 0, CW, CH);
      if (S.said < 1){ S.said = 1; sfx.impact && sfx.impact(true); }
      if (t > 18.4){ const k = ease((t - 18.4) / 1.5); for (let n = 0; n < 14; n++) px(n % 3 ? PAL.blue : PAL.cyan, 60 + (n * 53) % 200, 150 - (n * 29) % 40 * k, 1, 1 + n % 3); }
    }
    for (const [a, b, text] of L) if (t > a && t < b) say(text, t < 5 || t >= 15.6 ? 0.5 : 0.82, 0.042, Math.min(1, (t - a) / 0.6, (b - t) / 0.6));
    if (t < 3) say('press any key to skip', 0.95, 0.022, 0.5 * Math.min(1, t), '#cfe6ff');
    if (t >= LEN.intro) end();
  }
  function card(dt){
    const t = S.t, o = S.opts, a = REGION_SPAN[o.from] ? REGION_SPAN[o.from][1] - 0.04 : 0, b = REGION_SPAN[o.to][0] + 0.02, f = a + (b - a) * ease(t / 2.4);
    g.drawImage(night, 0, 0); beacon(false, t); marker(f, t); snowfall(dt, -8);
    say(o.name, 0.32, 0.085, Math.min(1, t / 0.5, (LEN.card - t) / 0.5));
    say(o.line, 0.42, 0.034, Math.min(1, (t - 0.3) / 0.5, (LEN.card - t) / 0.5), '#cfe6ff');
    if (t >= LEN.card) end();
  }
  function ending(dt){
    const t = S.t, k = ease((t - 5) / 7);
    g.drawImage(night, 0, 0); if (k > 0){ g.globalAlpha = k; g.drawImage(dawn, 0, 0); g.globalAlpha = 1; }
    beacon(t > 1.5, t); if (t < 1.8) marker(1, t); if (k < 0.5) snowfall(dt, -6);
    figure(hero.stand, 0, 160 - 5, APEX - 8, 0, 14);
    if (t > 1.5 && S.said < 0){ S.said = 0; sfx.gold && sfx.gold(); }
    const L = [[2.2, 6, 'The beacon burned again.'], [6.6, 10.4, 'Below him lay the whole of the mountain.'], [10.8, 14.2, 'He had climbed it.']];
    for (const [a, b, text] of L) if (t > a && t < b) say(text, 0.86, 0.042, Math.min(1, (t - a) / 0.6, (b - t) / 0.6));
    if (t > 14.8){ say('THE CLIMB', 0.26, 0.13, ease((t - 14.8) / 1.5)); say('thank you for playing', 0.44, 0.03, ease((t - 16) / 1.5) * 0.85, '#c0cbdc'); }
    if (t >= LEN.ending) end();
  }

  // draws the screen that is up, over everything
  S.draw = dt => {
    if (!S.kind) return;
    S.t += dt; words.length = 0; g.globalAlpha = 1;
    ({ title, intro, card, ending })[S.kind](dt);
    if (!S.kind) return;
    // its words, in the game's lettering, on the small picture: a size of 0.1 and over is the title's, 0.06 a name's
    for (const s of words){ g.globalAlpha = Math.max(0, Math.min(1, s.alpha)); text(g, s.text, CW / 2, Math.round(s.y * CH) - 4, s.col, s.size >= 0.1 ? 4 : s.size >= 0.06 ? 3 : 1, 'center'); } g.globalAlpha = 1;
    const w = hud.clientWidth, h = hud.clientHeight, k = Math.max(w / CW, h / CH), dw = CW * k, dh = CH * k;
    hx.save(); hx.imageSmoothingEnabled = false; hx.shadowColor = 'transparent'; hx.fillStyle = PAL.ink; hx.fillRect(0, 0, w, h); hx.drawImage(cv, (w - dw) / 2, (h - dh) / 2, dw, dh);
    hx.restore();
  };
  return S;
}
