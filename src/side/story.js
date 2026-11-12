// The story's screens: the title, the fall that begins it, the card between regions, the ending. Each is drawn small
// (320 x 180, the game's own pixel) in the palette and scaled up whole, with its words over it at the screen's size.
//   The story (docs/story.md): he fell from the top of the world into the water at its roots, and the water gave him
//   back. A light is calling him home, and it is not by his own strength that he goes: every fall ends in the water,
//   and the water gives him back again (the 'pool' screen). These screens say so and show where on the mountain he is.
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
// The mountain. It is too large to be seen whole: its foot runs off both sides of the picture and out of the bottom of
// it, and its peak leans out over its own base. Where its middle and its two flanks are at each row (the apex at APEX):
const APEX = 20, FOOT = 178, PEAK_X = 214;
const bump = (y, at, wide) => Math.exp(-Math.pow((y - at) / wide, 2));
const flank = y => { const t = Math.max(0, (y - APEX) / (FOOT - APEX)), w = 2 + 30 * t + 150 * Math.pow(t, 4.2), cx = PEAK_X - 52 * Math.pow(t, 1.25) + Math.sin(y * 0.05) * 4;   // a spire, steep nearly to its foot, leaning out over it
  return { l: Math.round(cx - w * 1.05 - Math.sin(y * 0.31) * 3 * t - bump(y, 110, 5) * 8 - bump(y, 134, 4) * 6), r: Math.round(cx + w * 0.8 + Math.sin(y * 0.27 + 2) * 3 * t + bump(y, 34, 5) * 6 + bump(y, 57, 4) * 11 + bump(y, 82, 5) * 7) }; };
// how high he is, 0 at the foot to 1 at the top, to a place on its left ridge
const ridge = f => { const y = FOOT - 2 - f * (FOOT - 2 - APEX - 3), F = flank(y); return { x: Math.max(6, F.l + 2 + (1 - f) * 10), y }; };
export const REGION_SPAN = [[0, 0.2], [0.2, 0.36], [0.36, 0.54], [0.54, 0.7], [0.7, 0.85], [0.85, 1]];   // each region's share of the climb, bottom to top

// the mountain, at night or at dawn: sky, a moon it stands in front of, far ranges and a sea of cloud that only reach
// its knees, and the mountain with its six regions told apart; and, for a sense of how large it is, the small things
// of people: a castle on a foothill, a watchtower on its shoulder, a village's lights, birds. A piece of its summit
// broke away once and has not come down.
function paintMountain(dawn){
  const c = canvas(CW, CH), g = c.getContext('2d'), r = rng(dawn ? 77 : 31), px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const dith = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
  const sky = dawn ? [PAL.deep, PAL.dark, PAL.plum, PAL.pink, PAL.rose, PAL.fire2, PAL.fire3] : [PAL.ink, PAL.ink, PAL.deep, PAL.deep, PAL.dark, PAL.dark, PAL.plum];
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++){ const k = y / CH * (sky.length - 1), i = Math.floor(k), f = k - i; px(sky[dith(x, y) < f ? i + 1 : i], x, y); }
  if (!dawn) for (let k = 0; k < 110; k++){ const x = Math.floor(r() * CW), y = Math.floor(r() * 124); px(r() < 0.25 ? PAL.white : PAL.light, x, y); if (r() < 0.06){ px(PAL.white, x - 1, y); px(PAL.white, x + 1, y); px(PAL.white, x, y - 1); px(PAL.white, x, y + 1); } }
  // the moon, vast, behind its shoulder (the sun at dawn, low, far off to the left)
  if (!dawn){ const mx = 238, my = 52, R = 31; for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++){ const d = Math.hypot(x, y); if (d > R) continue; const sh = Math.hypot(x + 9, y + 7) / R;
      px(d > R - 1.2 ? PAL.light : sh > 1.02 ? (dith(mx + x, my + y) < 0.5 ? PAL.mid : PAL.dark) : sh > 0.82 ? (dith(mx + x, my + y) < 0.5 ? PAL.light : PAL.mid) : dith(mx + x, my + y) < 0.2 ? PAL.light : PAL.pale, mx + x, my + y); }
    for (const [cx, cy, cr] of [[-10, -8, 4], [6, 4, 6], [-4, 12, 3], [12, -12, 3]]) for (let y = -cr; y <= cr; y++) for (let x = -cr; x <= cr; x++) if (Math.hypot(x, y) < cr && dith(x + 40, y + 40) < 0.55) px(PAL.light, mx + cx + x, my + cy + y); }
  else for (let y = -16; y <= 16; y++) for (let x = -16; x <= 16; x++){ const d = Math.hypot(x, y); if (d < 16) px(d < 12 ? PAL.white : dith(x + 40, y + 40) < 0.5 ? PAL.white : PAL.fire3, 58 + x, 122 + y); }
  // far ranges: whole mountains, and they come up to its knees. A sea of cloud lies between them
  const range = (base, amp, col, seed) => { for (let x = 0; x < CW; x++){ const top = Math.round(base - Math.abs(Math.sin(x * 0.045 + seed)) * amp - Math.abs(Math.sin(x * 0.13 + seed * 2)) * amp * 0.3); px(col, x, top, 1, CH - top); } };
  range(128, 20, dawn ? PAL.plum : PAL.deep, 3);
  for (let k = 0; k < 40; k++){ const cx = Math.floor(r() * CW), cy = 138 + Math.floor(r() * 10), w = 10 + Math.floor(r() * 22); for (let yy = 0; yy < 4; yy++){ const half = Math.round(w / 2 * Math.sqrt(1 - Math.pow((yy - 3) / 4, 2))); px(dawn ? (yy ? PAL.rose : PAL.fire3) : (yy ? PAL.dark : PAL.mid), cx - half, cy + yy, half * 2 + 1, 1); } }
  range(152, 16, dawn ? PAL.dark : PAL.ink, 9);
  // the mountain
  const body = dawn ? PAL.deep : PAL.ink, lit = dawn ? PAL.rose : PAL.dark, snow = dawn ? PAL.white : PAL.pale;
  for (let y = APEX; y < CH; y++){ const F = flank(Math.min(y, FOOT)); px(body, F.l, y, F.r - F.l, 1); px(lit, F.l, y, 1 + (y % 5 === 0 ? 1 : 0), 1); if (dawn && y % 2) px(PAL.dark, F.l + 2, y, Math.max(0, Math.round((F.r - F.l) * 0.12)), 1);
    if (y % 7 === 3 && F.r - F.l > 30) for (let x = F.l + 8; x < F.r - 6; x += 5 + Math.floor(r() * 9)) if (r() < 0.35) px(dawn ? PAL.dark : PAL.deep, x, y, 2 + Math.floor(r() * 4), 1); }   // strata, here and there
  // the piece that broke from its summit, and hangs there still
  for (const [sx, sy, sh, sw] of [[241, 26, 22, 3], [248, 40, 8, 2], [237, 52, 5, 1]]) for (let k = 0; k < sh; k++){ const half = Math.round(sw * Math.sin(Math.PI * (k + 0.5) / sh)), x = sx + Math.round(k * 0.22); px(body, x - half, sy + k, half * 2 + 1, 1); px(snow, x - half, sy + k, 1, 1); }
  // the Roots: crystals and cracks of cold light; and at the very bottom, the water
  for (let k = 0; k < 44; k++){ const y = 149 + Math.floor(r() * 29), F = flank(Math.min(y, FOOT)), x = Math.max(4, F.l + 6) + Math.floor(r() * Math.max(1, Math.min(CW - 8, F.r) - Math.max(4, F.l + 6) - 6)); px(r() < 0.4 ? PAL.cyan : PAL.blue, x, y, 1, 1 + Math.floor(r() * 3)); if (r() < 0.3) px(PAL.navy, x + 1, y + 1, 2, 1); }
  { const P = ridge(0); px(PAL.navy, P.x + 3, 175, 13, 2); px(PAL.cyan, P.x + 5, 175, 9, 1); px(PAL.white, P.x + 8, 175, 3, 1); for (let k = 1; k < 9; k++) if (k % 2) px(PAL.cyan, P.x + 9, 175 - k * 2); }
  // the Cloister: rows of lit windows, and its bell tower standing off the face
  for (let row = 0; row < 3; row++){ const y = 126 + row * 8, F = flank(y); for (let x = Math.max(4, F.l + 10); x < Math.min(F.r - 8, CW - 4); x += 9) if (r() < 0.62){ px(PAL.fire2, x, y, 2, 3); px(PAL.fire3, x, y, 1, 1); px(PAL.wood1, x - 1, y + 3, 4, 1); } }
  { const F = flank(124), x = F.l - 3; px(body, x, 112, 4, 14); px(body, x + 1, 109, 2, 3); px(lit, x, 112, 1, 14); px(PAL.fire2, x + 1, 115, 2, 2); }
  // the Spires: snow on the slopes, needles of rock standing off them
  for (let y = 96; y < 123; y++){ const F = flank(y), d = Math.max(1, Math.round((124 - y) / 6 + Math.sin(y * 0.9) * 1.5)); px(snow, F.l, y, d, 1); if (y % 3 === 0) px(PAL.light, F.r - Math.round(d * 0.5) - 1, y, Math.round(d * 0.5), 1); }
  for (const [x, top, h] of [[flank(112).r + 6, 94, 28], [flank(116).r + 13, 104, 20], [flank(112).l - 9, 100, 16]]) for (let k = 0; k < h; k++){ const half = Math.round(k / h * 2.5); px(body, x - half, top + k, half * 2 + 1, 1); px(snow, x - half, top + k, 1, 1); }
  // the Gardens: green terraces in the sun, a tree or two, and water falling from the shelf into the storm
  for (let y = 49; y < 72; y++){ const F = flank(y), w = F.r - F.l; if (y % 6 === 2){ px(dawn ? '#63c74d' : PAL.moss1, F.l + 1, y, Math.round(w * 0.6), 1); px(PAL.moss1, F.l + 1, y + 1, Math.round(w * 0.4), 1); for (let x = F.l + 3; x < F.l + w * 0.55; x += 6) if (r() < 0.5){ px(PAL.moss1, x, y - 2, 3, 2); px(dawn ? '#63c74d' : PAL.moss1, x + 1, y - 3, 1, 1); if (r() < 0.4) px(PAL.rose, x, y - 2, 1, 1); } } }
  { const F = flank(57); for (let y = 58; y < 80; y++) if (y % 2 || y < 66) px(y < 62 ? PAL.white : PAL.pale, F.r - 3, y); }
  // the Firmament: pale stone, the observatory's ring under the flame
  for (let y = APEX; y < 48; y++){ const F = flank(y); px(dawn ? PAL.pale : PAL.dark, F.l, y, Math.max(1, Math.round((F.r - F.l) * 0.3)), 1); }
  { const cx = flank(38).l + 6, cy = 38; for (let a = 0; a < 44; a++){ const t = a / 44 * Math.PI * 1.25 - 0.2; px(PAL.fire2, cx + Math.cos(t) * 7, cy - Math.sin(t) * 6); } px(PAL.wood1, cx - 6, cy + 1, 12, 1); px(PAL.cyan, cx + 1, cy - 2, 1, 1); }
  // the Tempest: the storm that wraps it, cloud on cloud across the mountain and out past its flanks
  { const cl = dawn ? [PAL.dark, PAL.mid, PAL.light] : [PAL.ink, PAL.deep, PAL.dark];
    for (let k = 0; k < 54; k++){ const cy = 74 + Math.floor(r() * 21), F = flank(cy), cx = F.l - 30 + Math.floor(r() * (F.r - F.l + 60)), w = 7 + Math.floor(r() * 13), h = 3 + Math.floor(r() * 3), col = cl[Math.floor(r() * 3)];
      for (let yy = 0; yy < h; yy++){ const half = Math.round(w / 2 * Math.sqrt(1 - Math.pow((yy - h + 1) / h, 2))); px(col, cx - half, cy + yy, half * 2 + 1, 1); } if (r() < 0.5) px(cl[2], cx - 2, cy, 4, 1); }
    if (!dawn) for (const [x, y] of [[152, 86], [155, 88], [154, 90], [157, 92], [226, 82], [224, 84], [227, 86]]) px(PAL.fire3, x, y, 1, 2); }
  // the way he fell: a faint scar down its face, from the summit to the water
  for (let y = APEX + 6; y < 172; y += 3){ const F = flank(y); if (F.l > 2 && (y < 74 || y > 96)) px(dawn ? PAL.light : PAL.mid, F.l + 4 + Math.round(Math.sin(y * 0.4) * 1.5), y); }
  // a flame kept at the foot of each region, up its ridge
  for (const [a] of REGION_SPAN){ const P = ridge(a + 0.012); if (a > 0 && P.x > 4){ px(PAL.fire1, P.x + 3, P.y - 1, 1, 2); px(PAL.fire3, P.x + 3, P.y - 2, 1, 1); } }
  // ---- how large it is: the small things of people at its foot
  { const hill = (x0, w, h, col) => { for (let x = 0; x < w; x++){ const hh = Math.round(h * Math.sin(Math.PI * x / w)); px(col, x0 + x, CH - hh, 1, hh); } };
    hill(250, 80, 13, dawn ? PAL.dark : PAL.ink); hill(-12, 70, 9, dawn ? PAL.dark : PAL.ink);
    // a castle on the hill: a keep, two towers, a wall, lit
    const bx = 276, by = 167, k = dawn ? PAL.deep : PAL.deep; px(k, bx, by - 6, 13, 6); px(k, bx - 2, by - 9, 3, 9); px(k, bx + 12, by - 10, 3, 10); px(k, bx + 5, by - 11, 4, 5); for (const tx of [bx - 2, bx, bx + 12, bx + 14, bx + 5, bx + 8]) px(k, tx, by - (tx === bx + 5 || tx === bx + 8 ? 12 : tx >= bx + 12 ? 11 : 10), 1, 1);
    px(PAL.fire2, bx + 2, by - 4, 1, 2); px(PAL.fire2, bx + 9, by - 4, 1, 2); px(PAL.fire3, bx + 6, by - 9, 1, 1); px(PAL.red1 || '#e43b44', bx + 7, by - 14, 2, 1); px(k, bx + 6, by - 14, 1, 3);
    // a village under it, and another across the valley
    for (let n = 0; n < 9; n++) px(n % 3 ? PAL.fire2 : PAL.fire3, 256 + (n * 7) % 26, 172 + (n * 5) % 5); for (let n = 0; n < 5; n++) px(PAL.fire2, 12 + (n * 9) % 34, 175 + n % 3);
    // a watchtower on the mountain's shoulder, one window lit
    const F = flank(150), wx = Math.max(10, F.l + 16); px(dawn ? PAL.dark : PAL.deep, wx, 141, 3, 8); px(dawn ? PAL.dark : PAL.deep, wx - 1, 140, 5, 1); px(PAL.fire3, wx + 1, 143, 1, 1);
    // birds, high up, and still far below the top
    for (const [x, y] of [[118, 66], [125, 70], [110, 73], [131, 64], [96, 80]]){ px(dawn ? PAL.ink : PAL.light, x, y); px(dawn ? PAL.ink : PAL.light, x - 1, y - 1); px(dawn ? PAL.ink : PAL.light, x + 1, y - 1); } }
  return c;
}
// the water at the bottom of the world, and the light that comes down to it: where he is given back
function paintPool(){
  const c = canvas(CW, CH), g = c.getContext('2d'), r = rng(909), px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  px(PAL.ink, 0, 0, CW, CH);
  // the cavern: its walls close in from both sides, darker than dark
  for (let y = 0; y < CH; y++){ const l = Math.round(46 + Math.sin(y * 0.07) * 14 + Math.sin(y * 0.23) * 5 + (y > 120 ? (y - 120) * 0.9 : 0)), rr = Math.round(CW - 50 - Math.sin(y * 0.06 + 1) * 15 - Math.sin(y * 0.19) * 5 - (y > 120 ? (y - 120) * 0.8 : 0));
    px(PAL.deep, l, y, rr - l, 1); for (let x = l; x < rr; x++) if (B4[(y & 3) * 4 + (x & 3)] / 16 < 0.45 - Math.min(x - l, rr - x) / 70) px(PAL.ink, x, y); }
  // the light, from far above: a shaft, widening, dithered at its edge
  for (let y = 0; y < 136; y++){ const half = 7 + y * 0.16; for (let x = Math.round(160 - half - 6); x <= 160 + half + 6; x++){ const d = Math.abs(x - 160) / half, a = d < 0.55 ? 0.8 : d < 1 ? 0.45 : 0.16; if (d < 1.35 && B4[(y & 3) * 4 + (x & 3)] / 16 < a * (0.45 + y / 240)) px(d < 0.4 ? PAL.pale : PAL.light, x, y); } }
  // the water: still, pale where the light lies on it
  for (let y = 130; y < CH; y++) for (let x = 0; x < CW; x++){ const d = Math.hypot((x - 160) / 2.2, (y - 136) * 1.6), k = B4[(y & 3) * 4 + (x & 3)] / 16;
    px(d < 14 ? PAL.white : d < 30 ? (k < 0.5 ? PAL.pale : PAL.cyan) : d < 52 ? (k < 0.5 ? PAL.cyan : PAL.blue) : d < 80 ? (k < 0.4 ? PAL.blue : PAL.navy) : k < 0.3 ? PAL.navy : PAL.deep, x, y); }
  for (let k = 0; k < 26; k++){ const y = 132 + Math.floor(r() * 44), x = 30 + Math.floor(r() * 260), w = 4 + Math.floor(r() * 14); px(r() < 0.5 ? PAL.cyan : PAL.navy, x, y, w, 1); }
  // stones on the bank, a few reeds
  for (const [x, w, h] of [[38, 22, 9], [70, 12, 5], [252, 26, 10], [228, 10, 4]]) for (let k = 0; k < h; k++){ const half = Math.round(w / 2 * Math.sqrt(1 - Math.pow(k / h, 2))); px(PAL.ink, x - half, 134 - k, half * 2 + 1, 1); if (k === h - 1) px(PAL.dark, x - half + 2, 134 - k, Math.max(1, half), 1); }
  for (const x of [58, 61, 240, 244, 247]) px(PAL.dark, x, 118 + (x % 5), 1, 16 - (x % 5));
  return c;
}

export function makeStory(hud, heroBase){
  const hx = hud.getContext('2d'), cv = canvas(CW, CH), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const night = paintMountain(false), dawn = paintMountain(true), pool = paintPool();
  const far = { firmament: img('assets/side/bg/firmament.png'), gardens: img('assets/side/bg/gardens.png'), tempest: img('assets/side/bg/tempest.png'), spires: img('assets/side/bg/spires.png'), cloister: img('assets/side/bg/cloister.png'), roots: img('assets/side/bg/far.png') };
  // the rock between two regions, as he falls past: dark, its edges broken up
  const rock = canvas(CW, 50); { const rg = rock.getContext('2d'); rg.fillStyle = PAL.ink; for (let yy = 0; yy < 50; yy++) for (let x = 0; x < CW; x++){ const e = Math.min(yy, 49 - yy) / 8; if (e >= 1 || B4[(yy & 3) * 4 + (x & 3)] / 16 < e) rg.fillRect(x, yy, 1, 1); } }
  const hero = { fall: img(`${heroBase}/fall.png`), stand: img(`${heroBase}/stand.png`), getup: img(`${heroBase}/getup.png`) };
  const S = { kind: null, t: 0, opts: {}, done: null, snow: Array.from({ length: 60 }, (_, k) => ({ x: (k * 53) % CW, y: (k * 97) % CH, v: 20 + (k * 7) % 30 })) };
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  S.active = () => !!S.kind;
  S.start = (kind, opts = {}, done = null) => { S.kind = kind; S.t = 0; S.opts = opts; S.done = done; S.said = -1; };
  const end = () => { const d = S.done; S.kind = null; S.done = null; if (d) d(); };
  // a press: the title waits for its buttons; the rest can be hurried on once they have begun
  S.press = () => { if (!S.kind || S.kind === 'title') return; if (S.t > 0.6){ if (S.kind === 'card') S.t = Math.max(S.t, LEN.card - 0.5); else if (S.kind === 'pool') S.t = Math.max(S.t, LEN.pool - 0.4); else end(); } };
  const LEN = { intro: 29.5, card: 3.6, ending: 30, pool: 3.0 };

  function beacon(on, t){
    const x = PEAK_X, y = APEX - 3; px(PAL.wood1, x - 1, y, 3, 3); px(PAL.ink, x - 2, y + 3, 5, 1);
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
  // x: where it is set from (left), if not the middle
  const say = (text, y, size, alpha, col = '#fff2d0', x = null) => words.push({ text, y, size, alpha, col, x });

  function title(dt){
    g.drawImage(night, 0, 0); beacon(false, S.t); marker(0, S.t); snowfall(dt, -8);
    say('THE CLIMB', 0.115, 0.08, Math.min(1, S.t / 1.2), '#fff2d0', 12);
    say('what fell is called back up', 0.262, 0.032, ease((S.t - 0.8) / 1.2) * 0.85, '#cfe6ff', 13);
  }
  function intro(dt){
    const t = S.t;
    // the lines, each with when it comes and goes
    const L = [[0.6, 4.6, 'He stood at the top of the world, and he fell.'], [5.3, 7.5, 'Past the stars.'], [7.7, 10.0, 'Past gardens no one tends.'], [10.2, 12.5, 'Through the storm.'], [12.7, 15.0, 'Past the spires of ice.'], [15.2, 17.5, 'Past the halls of stone.'],
      [17.8, 21.0, 'Down, into the roots of the mountain, and the water there.'], [22.0, 24.6, 'The water gave him back.'], [24.9, 27.0, 'Far above, a light.'], [27.2, 29.3, 'He was not made to stay where he was left.']];
    const FALL0 = 5, FALL1 = 21.4;
    if (t < FALL0){
      // the summit, and him off it
      g.drawImage(night, 0, 0); beacon(t < 2.2, t); snowfall(dt, -14);
      const u = ease((t - 2.2) / 2.8), x = PEAK_X - 3 - u * 60, y = APEX - 8 + u * u * 150;
      figure(u > 0 ? hero.fall : hero.stand, Math.floor(t * 8), x, y, -u * 5, 14);
      if (t > 2.2 && t < 2.5) px(PAL.white, 0, 0, CW, CH);
      if (t > 2.2 && S.said < 0){ S.said = 0; sfx.crack && sfx.crack(); }
    } else if (t < FALL1){
      // the fall: the mountain's six regions go up past him, each behind its own rock
      const u = (t - FALL0) / (FALL1 - FALL0), scroll = u * u * 0.3 + u * 0.7, band = [far.firmament, far.gardens, far.tempest, far.spires, far.cloister, far.roots], n = band.length;
      const total = n * 224 + (n - 1) * 50, y0 = -scroll * (total - CH * 0.4);
      px(PAL.ink, 0, 0, CW, CH);
      band.forEach((im, k) => { const y = y0 + k * (224 + 50); if (im.complete && im.naturalWidth && y < CH && y > -224) g.drawImage(im, 40, 0, 320, 224, 0, Math.round(y), 320, 224); });
      for (let k = 0; k < n - 1; k++){ const y = Math.round(y0 + 224 + k * 274); if (y < CH && y > -50) g.drawImage(rock, 0, y); }
      for (let k = 0; k < 26; k++){ const x = (k * 71 + 13) % CW, y = (k * 47 + t * 520) % (CH + 40) - 20; px(k % 3 ? PAL.light : PAL.white, x, CH - y, 1, 6 + k % 5); }
      figure(hero.fall, Math.floor(t * 10), 160 + Math.sin(t * 2.1) * 10, 80 + Math.sin(t * 1.3) * 6, t * 4.5, 56);
      const dim = ease((t - (FALL1 - 1.4)) / 1.2); if (dim > 0){ g.globalAlpha = dim; px(PAL.ink, 0, 0, CW, CH); g.globalAlpha = 1; }
    } else {
      // the water, in the dark; and then the light on it
      const k = ease((t - 21.9) / 2.2); px(PAL.ink, 0, 0, CW, CH); g.globalAlpha = k; g.drawImage(pool, 0, 0); g.globalAlpha = 1;
      if (S.said < 1){ S.said = 1; sfx.impact && sfx.impact(true); }
      rise(t - 23.2, t);
    }
    for (const [a, b, text] of L) if (t > a && t < b) say(text, 0.88, 0.042, Math.min(1, (t - a) / 0.6, (b - t) / 0.6));
    if (t < 3) say('press any key to skip', 0.96, 0.022, 0.5 * Math.min(1, t), '#cfe6ff');
    if (t >= LEN.intro) end();
  }
  // him, in the water under the light, getting up; motes of it going up round him
  function rise(u, t){
    const im = hero.getup; if (im.complete && im.naturalWidth && u > 0){ const n = Math.max(1, Math.round(im.naturalWidth / im.naturalHeight)), w = im.naturalWidth / n, f = Math.min(n - 1, Math.floor(u / 1.6 * n)); g.drawImage(im, f * w, 0, w, im.naturalHeight, 160 - 22, 96, 44, 44); px(PAL.pale, 148, 138, 24, 1); px(PAL.white, 154, 139, 12, 1); }
    for (let n = 0; n < 16; n++){ const y = 134 - ((t * (14 + n % 5 * 5) + n * 23) % 120), x = 160 + Math.sin(n * 2.4 + t * 0.8) * (8 + n % 4 * 5); if (y > 0) px(n % 3 ? PAL.pale : PAL.white, x, y, 1, 1 + n % 2); }
  }
  // he is given back: the water at the bottom of the world, the light down on it, a line
  function poolScreen(dt){
    const t = S.t, a = Math.min(1, t / 0.35, (LEN.pool - t) / 0.45);
    px(PAL.white, 0, 0, CW, CH); g.globalAlpha = Math.min(1, t / 0.5); g.drawImage(pool, 0, 0); g.globalAlpha = 1; rise(t - 0.35, t + 7);
    say(S.opts.line || '', 0.88, 0.042, a); if (S.opts.count) say(S.opts.count, 0.955, 0.022, a * 0.6, '#8b9bb4');
    if (t > LEN.pool - 0.45){ g.globalAlpha = Math.min(1, (t - (LEN.pool - 0.45)) / 0.4); px(PAL.white, 0, 0, CW, CH); g.globalAlpha = 1; }   // and up, into the light
    if (t >= LEN.pool) end();
  }
  function card(dt){
    const t = S.t, o = S.opts, a = REGION_SPAN[o.from] ? REGION_SPAN[o.from][1] - 0.04 : 0, b = REGION_SPAN[o.to][0] + 0.02, f = a + (b - a) * ease(t / 2.4);
    g.drawImage(night, 0, 0); beacon(false, t); marker(f, t); snowfall(dt, -8);
    say(o.name, 0.115, 0.08, Math.min(1, t / 0.5, (LEN.card - t) / 0.5), '#fff2d0', 12);
    say(o.line, 0.262, 0.034, Math.min(1, (t - 0.3) / 0.5, (LEN.card - t) / 0.5), '#cfe6ff', 13);
    if (t >= LEN.card) end();
  }
  function ending(dt){
    const t = S.t, k = ease((t - 9) / 9);
    g.drawImage(night, 0, 0); if (k > 0){ g.globalAlpha = k; g.drawImage(dawn, 0, 0); g.globalAlpha = 1; }
    beacon(t > 1.5, t); if (t < 1.8) marker(1, t); if (k < 0.5) snowfall(dt, -6);
    figure(hero.stand, 0, PEAK_X - 5, APEX - 8, 0, 14);
    if (t > 1.5 && S.said < 0){ S.said = 0; sfx.shrine && sfx.shrine(); }
    // the light goes down the way he fell, to the water: it was never only at the top
    if (t > 6 && t < 16){ const u = ease((t - 6) / 6); for (let y = APEX + 4; y < APEX + 4 + u * 152; y += 2){ const F = flank(y); if (F.l > 2) px(y % 4 ? PAL.fire3 : PAL.white, F.l + 4 + Math.round(Math.sin(y * 0.4) * 1.5), y); } }
    const L = [[2.2, 5.6, 'The flame he had let die was burning.'], [6.2, 9.4, 'It had never gone out.'], [9.8, 13.6, 'It had gone down into the dark to find him.'], [14.2, 18.4, 'Below lay the whole of the mountain: the garden, the storm, the ice, the stone, the water.'], [19.0, 22.6, 'He had not climbed it alone.']];
    for (const [a, b, text] of L) if (t > a && t < b) say(text, 0.88, 0.042, Math.min(1, (t - a) / 0.6, (b - t) / 0.6));
    if (t > 23.4){ say('THE CLIMB', 0.115, 0.08, ease((t - 23.4) / 1.5), '#fff2d0', 12); say('thank you for playing', 0.262, 0.03, ease((t - 24.6) / 1.5) * 0.85, '#c0cbdc', 13); }
    if (t >= LEN.ending) end();
  }

  // draws the screen that is up, over everything
  S.draw = dt => {
    if (!S.kind) return;
    S.t += dt; words.length = 0; g.globalAlpha = 1;
    ({ title, intro, card, ending, pool: poolScreen })[S.kind](dt);
    if (!S.kind) return;
    // its words, in the game's lettering, on the small picture: a size of 0.1 and over is the title's, 0.06 a name's
    for (const s of words){ g.globalAlpha = Math.max(0, Math.min(1, s.alpha)); text(g, s.text, s.x == null ? CW / 2 : s.x, Math.round(s.y * CH) - 4, s.col, s.size >= 0.1 ? 4 : s.size >= 0.06 ? 3 : 1, s.x == null ? 'center' : 'left'); } g.globalAlpha = 1;
    const w = hud.clientWidth, h = hud.clientHeight, k = Math.max(w / CW, h / CH), dw = CW * k, dh = CH * k;
    hx.save(); hx.imageSmoothingEnabled = false; hx.shadowColor = 'transparent'; hx.fillStyle = PAL.ink; hx.fillRect(0, 0, w, h); hx.drawImage(cv, (w - dw) / 2, (h - dh) / 2, dw, dh);
    hx.restore();
  };
  return S;
}
