// What stands in the world and changes: star-glass ledges that keep time, blooms that throw him, rising air, and cracked
// rock that breaks. The painted layers leave these out (render.js, paintAt); they are drawn here, small meshes over them.
//   makeProps(scene, R) -> { step(dt, t, P), bounce(mark), breakAt(x, y, r) -> [{ id, x, y }], breakId(id), cracks }
import { T, LEVEL, CRACKED, GLASS_A, GLASS_B, EMPTY, HOLD, DOOR, GIVEN, LIVE, VELLUM, SHUTTER, STILLED, FACED, MELT, RULE, rawAt, glassOn, gustOn, PHASE } from './level.js';
import { PPU, PAL, lit, themeNow } from './render.js';
const THREE = window.THREE;
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const texOf = c => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const rng = seed => { let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// a plank of star-glass, n tiles long: pale, bright along its top, a star set in it here and there
function glassTex(n, warm){
  const w = n * 8, c = cnv(w, 6), g = c.getContext('2d'), hi = warm ? PAL.fire3 : PAL.white, mid = warm ? PAL.fire2 : PAL.cyan, low = warm ? PAL.fire1 : PAL.blue;
  px(g, hi, 1, 0, w - 2, 1); px(g, mid, 0, 1, w, 2); px(g, low, 1, 3, w - 2, 1);
  for (let x = 0; x < w; x++){ if (B4[(x & 3) * 4 + 1] < 6) px(g, low, x, 2); if (x % 8 === 4) px(g, hi, x, 1, 1, 2); if (B4[(x & 3) * 4 + 2] < 5) px(g, mid, x, 4); if (x % 16 === 9) px(g, low, x, 5); }
  return texOf(c);
}
// a bloom: broad leaves, a wide flower open to the sky, its heart bright
function bloomTex(){
  const c = cnv(28, 16), g = c.getContext('2d');
  for (let x = 0; x < 28; x++){ const d = Math.abs(x - 13.5), h = Math.round(3 - d * 0.16); if (d > 13) continue; px(g, PAL.ink, x, 16 - h - 1, 1, h + 1); px(g, d > 8 ? PAL.moss0 : PAL.moss1, x, 16 - h, 1, h); if (x % 5 === 2) px(g, PAL.moss2, x, 16 - h); }
  for (let y = 0; y < 9; y++) for (let x = 0; x < 24; x++){   // the cup of petals
    const cx = x - 11.5, top = 4 + (cx * cx) / 26, bot = 12.2 - Math.abs(cx) * 0.05; if (y + 2 < top || y + 2 > bot || Math.abs(cx) > 11.6) continue;
    const edge = y + 2 - top < 1 || Math.abs(cx) > 10.6 || y + 2 > bot - 1;
    px(g, edge ? PAL.ink : Math.abs(cx) > 7 ? PAL.pink : (Math.round(cx) % 4 === 0 ? PAL.pink : PAL.rose), x + 2, y + 2); }
  px(g, PAL.ink, 10, 4, 8, 4); px(g, PAL.fire2, 11, 5, 6, 3); px(g, PAL.fire3, 12, 5, 4, 1); px(g, PAL.white, 13, 5, 1, 1);
  return texOf(c);
}
// cracked rock, w x h tiles: the region's own stone, split
function crackTex(w, h, seed){
  const c = cnv(w * 8, h * 8), g = c.getContext('2d'), r = rng(seed), S = themeNow().stone, col = k => PAL[S[k]] || PAL.mid;
  px(g, col('a'), 0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++){ const row = Math.floor(y / 6); if (y % 6 === 0 || (x + row * 5) % 11 === 0) px(g, col('aSeam'), x, y); else if (B4[(y & 3) * 4 + (x & 3)] < 3) px(g, col('b'), x, y); }
  px(g, col('lip2'), 1, 1, c.width - 2, 1);
  for (let k = 0; k < Math.max(2, Math.round(w * h / 5)); k++){   // the cracks: from an edge inward, forking
    let x = Math.floor(r() * c.width), y = r() < 0.5 ? 0 : c.height - 1, dy = y ? -1 : 1;
    for (let n = 0; n < c.height * 0.8; n++){ px(g, PAL.ink, x, y); if (r() < 0.5) x += r() < 0.5 ? -1 : 1; else y += dy; if (r() < 0.12) px(g, PAL.ink, x + (r() < 0.5 ? -1 : 1), y, 2, 1); if (y < 0 || y >= c.height) break; } }
  g.strokeStyle = PAL.ink; g.lineWidth = 1; g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
  return texOf(c);
}

// what a keeper holds, drawn apart from the painting since it goes when the keeper falls (level.js RULE): by look
//   stone  a seal, or the stone over a quick way: dressed courses in the region's stone, no cracks (the spade is no use)
//   slab   a slab of the roof pressed down into a doorway (the Roots): the same stone, dark under its weight
//   door   a door on the bell's beat (the Cloister): planks banded with iron
//   thorn  a wall of thorn (the Gardens)
//   iron   a shutter (the Bell-Foundry): plates, riveted;  grate: its bars
function holdTex(w, h, look, seed){
  const c = cnv(w * 8, h * 8), g = c.getContext('2d'), r = rng(seed), S = themeNow().stone, col = k => PAL[S[k]] || PAL.mid, W = c.width, H = c.height;
  if (look === 'door'){ px(g, PAL.wood1, 0, 0, W, H); for (let x = 0; x < W; x += 5) px(g, PAL.wood0, x, 0, 1, H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (B4[(y & 3) * 4 + (x & 3)] < 2) px(g, PAL.wood2, x, y);
    for (const y of [3, H >> 1, H - 6]){ px(g, PAL.ink, 0, y - 1, W, 5); px(g, PAL.mid, 0, y, W, 3); px(g, PAL.light, 0, y, W, 1); for (let x = 2; x < W; x += 5) px(g, PAL.ink, x, y + 1, 1, 1); } }
  else if (look === 'iron'){ px(g, PAL.dark, 0, 0, W, H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (B4[(y & 3) * 4 + (x & 3)] < 4) px(g, PAL.deep, x, y); for (let y = 0; y < H; y += 8){ px(g, PAL.ink, 0, y, W, 1); px(g, PAL.mid, 0, y + 1, W, 1); for (let x = 2; x < W; x += 4) px(g, PAL.light, x, y + 3, 1, 1); } px(g, PAL.rust, 1, H - 2, W - 2, 1); }
  else if (look === 'grate'){ g.clearRect(0, 0, W, H); const flat = W > H; for (let k = 1; k < (flat ? W : H); k += 4){ if (flat){ px(g, PAL.ink, k, 0, 2, H); px(g, PAL.mid, k, 0, 1, H); } else { px(g, PAL.ink, 0, k, W, 2); px(g, PAL.mid, 0, k, W, 1); } } if (flat){ px(g, PAL.ink, 0, 0, W, 2); px(g, PAL.dark, 0, 0, W, 1); px(g, PAL.ink, 0, H - 2, W, 2); } else { px(g, PAL.ink, 0, 0, 2, H); px(g, PAL.dark, 0, 0, 1, H); px(g, PAL.ink, W - 2, 0, 2, H); } return texOf(c); }
  else if (look === 'thorn'){ px(g, PAL.ink, 0, 0, W, H); for (let k = 0; k < W * H / 5; k++){ let x = Math.floor(r() * W), y = Math.floor(r() * H); const dx = r() < 0.5 ? -1 : 1, dy = r() < 0.5 ? -1 : 1, L = 4 + Math.floor(r() * 9); for (let n = 0; n < L; n++){ px(g, n % 3 ? PAL.moss0 : PAL.moss1, x, y); if (r() < 0.6) x += dx; if (r() < 0.6) y += dy; } if (r() < 0.5) px(g, PAL.red1, x, y); else px(g, PAL.pale, x, y); } }
  else { px(g, col('a'), 0, 0, W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const row = Math.floor(y / 6); if (y % 6 === 0 || (x + row * 5) % 11 === 0) px(g, col('aSeam'), x, y); else if (B4[(y & 3) * 4 + (x & 3)] < 3) px(g, col('b'), x, y); }
    px(g, col('lip2'), 1, 1, W - 2, 1);
    if (look === 'slab'){ for (let y = H - 5; y < H; y++) for (let x = 0; x < W; x++) if (B4[(y & 3) * 4 + (x & 3)] < (y - (H - 6)) * 3) px(g, PAL.ink, x, y); for (let x = 3; x < W - 2; x += 6){ px(g, PAL.ink, x, H - 8, 1, 3); px(g, PAL.ink, x + 1, H - 6, 1, 1); px(g, PAL.ink, x - 1, H - 6, 1, 1); } } }
  g.strokeStyle = PAL.ink; g.lineWidth = 1; g.strokeRect(0.5, 0.5, W - 1, H - 1);
  return texOf(c);
}
function plankTex(w){ const c = cnv(w * 8, 5), g = c.getContext('2d'); px(g, PAL.ink, 0, 0, c.width, 5); px(g, PAL.wood1, 1, 1, c.width - 2, 3); px(g, PAL.wood2, 1, 1, c.width - 2, 1); for (let x = 7; x < c.width; x += 8) px(g, PAL.ink, x, 1, 1, 3); return texOf(c); }

// the water at the bottom of the world: a band of it, lit; and the light that comes down to it from far above
function waterTex(w, h = 6){
  const c = cnv(w, h), g = c.getContext('2d');
  // the surface bright and broken, then down into the deep: cyan, blue, navy, dithered
  for (let x = 0; x < w; x++){ px(g, x % 9 < 5 ? PAL.white : PAL.pale, x, 0); px(g, (x + 3) % 7 < 3 ? PAL.pale : PAL.cyan, x, 1); for (let y = 2; y < h; y++){ const d = (y - 2) / Math.max(1, h - 2), b = B4[(y & 3) * 4 + (x & 3)] / 16; px(g, d < 0.35 ? (b < 0.7 - d ? PAL.cyan : PAL.blue) : d < 0.75 ? (b < 0.9 - d ? PAL.blue : PAL.navy) : PAL.navy, x, y); } }
  const t = texOf(c); t.wrapS = THREE.RepeatWrapping; return t;
}
// the cistern's apse: a tall round-arched niche in worn blocks between two columns, dark inside and lit from below by the
// water, a ring carved at its crown. Older than the house above it; no one remembers who cut it
const apseW = 128, apseH = 150;
function apseTex(){
  const W = apseW, H = apseH, c = cnv(W, H), g = c.getContext('2d', { willReadFrequently: true }), r = (() => { let s = 77; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const cx = W / 2, R0 = 34, R1 = 46, base = H - 2, spring = 64;   // the niche's radius, the arch's outer radius, its foot, where the arch springs
  const inNiche = (x, y) => y >= spring ? Math.abs(x - cx) < R0 : Math.hypot(x - cx, y - spring) < R0;
  const inArch = (x, y) => y >= spring ? Math.abs(x - cx) < R1 : Math.hypot(x - cx, y - spring) < R1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    if (inNiche(x, y)){   // the niche: deep dark, and the water's light rising in it from the foot, dithered
      const l = Math.max(0, 1 - (base - y) / 70), b = B4[(y & 3) * 4 + (x & 3)] / 16;
      px(g, l > 0.82 && b < (l - 0.82) * 2.4 ? PAL.cyan : l > 0.45 && b < (l - 0.45) * 1.6 ? PAL.blue : l > 0.12 && b < l * 0.9 ? PAL.navy : PAL.ink, x, y); continue; }
    if (inArch(x, y)){   // the arch: voussoirs, each a worn block with a lit edge facing the light
      const a = Math.atan2(y - spring, x - cx), seg = Math.floor((a + Math.PI) / (Math.PI / 9)), rr = y >= spring ? Math.abs(x - cx) : Math.hypot(x - cx, y - spring);
      const edge = rr < R0 + 1.5 || rr > R1 - 1.5 || (y < spring && Math.abs(((a + Math.PI) / (Math.PI / 9)) - seg) < 0.08) || (y >= spring && (y - spring) % 12 === 0);
      px(g, edge ? PAL.ink : rr < R0 + 3 ? PAL.light : (seg + (y >> 3)) % 3 ? PAL.mid : PAL.dark, x, y); continue; }
  }
  // the columns either side, with a capital and a base
  for (const sx of [cx - R1 - 9, cx + R1 + 1]){
    px(g, PAL.ink, sx - 1, 40, 10, base - 40 + 1); px(g, PAL.dark, sx, 41, 8, base - 41); px(g, PAL.mid, sx + 1, 41, 2, base - 41); px(g, PAL.light, sx + 1, 41, 1, base - 41);
    for (let y = 48; y < base - 6; y += 9) px(g, PAL.ink, sx, y, 8, 1);   // its drums
    px(g, PAL.ink, sx - 3, 35, 14, 6); px(g, PAL.light, sx - 2, 36, 12, 1); px(g, PAL.mid, sx - 2, 37, 12, 3);   // capital
    px(g, PAL.ink, sx - 3, base - 5, 14, 6); px(g, PAL.mid, sx - 2, base - 4, 12, 4); px(g, PAL.light, sx - 2, base - 4, 12, 1); }
  // the ring carved at its crown, the water's light in it, and a line down from it into the niche
  const ry = spring - R1 + 4;
  for (let k = 0; k < 40; k++){ const a = k / 40 * Math.PI * 2; px(g, PAL.ink, cx + Math.cos(a) * 5 - 0.5, ry + Math.sin(a) * 5); px(g, PAL.cyan, cx + Math.cos(a) * 4 - 0.5, ry + Math.sin(a) * 4); }
  // water stains down the stones, and moss at the foot
  for (let k = 0; k < 14; k++){ const x = Math.floor(r() * W), y0 = Math.floor(r() * 60) + 30, L = 8 + Math.floor(r() * 30); for (let y = y0; y < Math.min(base, y0 + L); y++){ const p = g.getImageData(x, y, 1, 1).data; if (p[3] && !inNiche(x, y)) px(g, (y + x) % 3 ? PAL.navy : PAL.teal, x, y); } }
  for (let x = 0; x < W; x++){ const p = g.getImageData(x, base - 1, 1, 1).data; if (p[3] && r() < 0.5) px(g, r() < 0.5 ? PAL.moss1 : PAL.moss0, x, base - 1 - Math.floor(r() * 2), 1, 2); }
  feather(c, 6, 4); return texOf(c);
}
// ---- what stands behind each region's raising water (the Roots' is the apse, above). Each is drawn in the palette,
// standing on the floor behind the water, and says where the water comes from: `src` are the points it falls from
// ({ x from the middle, y up from the floor, in pixels; kind: a thread, a stream, drips }); `still`: none falls, it is
// a mirror. 96 wide, 100 high unless said
const BACK = {
  // the Crypt Stair: a pointed niche in the founders' dressed stone, a carved shell over it the water runs out of
  arch(g, W, H){
    const cx = W / 2, base = H - 1, R = 30, spring = 46;
    const inN = (x, y) => y >= spring ? Math.abs(x - cx) < 22 : (Math.hypot(x - (cx - 8), y - spring) < R && Math.hypot(x - (cx + 8), y - spring) < R);
    const inA = (x, y) => y >= spring ? Math.abs(x - cx) < 30 : (Math.hypot(x - (cx - 8), y - spring) < R + 8 && Math.hypot(x - (cx + 8), y - spring) < R + 8);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
      if (inN(x, y)){ const l = Math.max(0, 1 - (base - y) / 60), b = B4[(y & 3) * 4 + (x & 3)] / 16; px(g, l > 0.75 && b < (l - 0.75) * 3 ? PAL.cyan : l > 0.35 && b < (l - 0.35) * 1.6 ? PAL.blue : l > 0.1 && b < l ? PAL.navy : PAL.ink, x, y); continue; }
      if (inA(x, y)){ const edge = !inA(x - 1, y) || !inA(x + 1, y) || !inA(x, y - 1) || inN(x - 1, y) || inN(x + 1, y) || inN(x, y - 1); px(g, edge ? PAL.ink : ((x >> 3) + (y >> 3)) % 2 ? PAL.mid : PAL.dark, x, y); if (!edge && (y % 8 === 0 || x % 8 === 0)) px(g, PAL.deep, x, y); }
    }
    // the shell at its crown, ribbed, the water's lip at its foot
    for (let k = -6; k <= 6; k++){ const h = 7 - Math.abs(k) * 0.6; px(g, PAL.ink, cx + k, 24 - h, 1, h + 2); px(g, k % 2 ? PAL.pale : PAL.light, cx + k, 25 - h, 1, h); }
    px(g, PAL.ink, cx - 2, 26, 4, 2); px(g, PAL.cyan, cx - 1, 26, 2, 1);
    return [{ x: 0, y: H - 27, kind: 'thread' }];
  },
  // the Spires: a hollow in the ice under the gate, its roof hung with icicles, meltwater dripping from their tips
  ice(g, W, H){
    const cx = W / 2, base = H - 1, top = 30;
    for (let y = top; y < H; y++) for (let x = 0; x < W; x++){
      const half = 44 - Math.max(0, (y - top) < 10 ? (10 - (y - top)) * 2.2 : 0) + Math.sin(y * 0.5) * 2;
      const d = Math.abs(x - cx); if (d > half) continue;
      const inner = d < half - 6 && y > top + 6, b = B4[(y & 3) * 4 + (x & 3)] / 16, l = Math.max(0, 1 - (base - y) / 50);
      if (inner){ if (l > 0.5 && b < (l - 0.5) * 2) px(g, PAL.cyan, x, y); else if (b < 0.18) px(g, PAL.navy, x, y); continue; }   // inside: the room's own wall shows, the cold over it here and there
      px(g, d > half - 2 || y < top + 2 ? PAL.ink : (x + y) % 5 ? PAL.pale : PAL.white, x, y);
    }
    const tips = [];
    for (let k = 0; k < 9; k++){ const x = Math.round(cx - 30 + k * 7.5), L = 6 + ((k * 7) % 11); for (let y = 0; y < L; y++){ const w = Math.max(1, Math.round(3 - y * 3 / L)); px(g, PAL.ink, x - w, top + 6 + y, w * 2 + 1, 1); px(g, y < L - 2 ? PAL.pale : PAL.white, x - w + 1, top + 6 + y, Math.max(1, w * 2 - 1), 1); } if (k % 3 === 1) tips.push({ x: x - cx, y: H - (top + 6 + L), kind: 'drip' }); }
    return tips;
  },
  // the Last Hut's path: the climbers' iron pipe down the rock, catching the rain off the scree, its mouth over the water
  pipe(g, W, H){
    const cx = W / 2;
    // the pipe: down from the top left, a bend, along, and down to its mouth, riveted, rusted
    const seg = (x, y, w, h) => { px(g, PAL.ink, x - 1, y - 1, w + 2, h + 2); px(g, PAL.rust, x, y, w, h); px(g, PAL.fire0, x, y + (h > w ? 0 : h - 1), w > h ? w : 1, w > h ? 1 : h); };
    seg(16, 0, 5, 40); seg(16, 36, cx - 14, 5); seg(cx - 1, 36, 5, 22);
    for (const [x, y] of [[18, 8], [18, 24], [30, 38], [cx + 1, 50]]) px(g, PAL.bone, x, y);
    px(g, PAL.ink, cx - 3, 58, 9, 3); px(g, PAL.rust, cx - 2, 58, 7, 2);   // its lip
    return [{ x: 1.5, y: H - 60, kind: 'stream' }];
  },
  // the Breach: the garden's spring, out of a carved spout in the broken wall, the vines down over it
  spout(g, W, H){
    const cx = W / 2;
    const ragL = y => 14 + Math.round(Math.abs(Math.sin(y * 0.37)) * 6 + (Math.floor(y / 9) % 2) * 3), ragR = y => W - 14 - Math.round(Math.abs(Math.sin(y * 0.29 + 1)) * 6 + (Math.floor(y / 9) % 2) * 3);   // the wall's broken ends, course by course
    for (let y = 26; y < H; y++) for (let x = ragL(y); x < ragR(y); x++){ const top = 26 + Math.abs(Math.sin(x * 0.21)) * 10; if (y < top) continue; const edge = y < top + 1 || x === ragL(y) || x === ragR(y) - 1; px(g, edge ? PAL.ink : (y % 9 === 0 || (x + (Math.floor(y / 9) % 2) * 6) % 12 === 0) ? PAL.deep : (x + y) % 7 ? PAL.mid : PAL.light, x, y); }
    // the spout: a carved lip out of the wall, a leaf over it
    px(g, PAL.ink, cx - 6, 48, 12, 7); px(g, PAL.pale, cx - 5, 49, 10, 2); px(g, PAL.light, cx - 5, 51, 10, 3); px(g, PAL.ink, cx - 2, 54, 4, 2);
    for (let k = 0; k < 7; k++){ px(g, PAL.moss1, cx - 3 + k, 44 - Math.abs(k - 3), 1, 3); } px(g, PAL.moss2, cx, 41, 1, 2);
    // the vines down the stone
    for (const [x0, L] of [[16, 50], [24, 34], [70, 44], [80, 56]]) for (let y = 30; y < 30 + L; y++){ const x = x0 + Math.round(Math.sin(y * 0.25 + x0) * 2); px(g, y % 5 ? PAL.moss1 : PAL.moss2, x, y); if (y % 7 === 0) px(g, PAL.moss2, x + 1, y, 2, 1); }
    return [{ x: 0, y: H - 56, kind: 'stream' }];
  },
  // the Long Stair's foot: a brass ring stood on end over still water, stars in it; nothing falls, the water is a mirror
  ring(g, W, H){
    const cx = W / 2, cy = 46, R = 34;
    for (let k = 0; k < 360; k++){ const a = k / 180 * Math.PI; for (const [r, c] of [[R + 2, PAL.ink], [R + 1, PAL.fire2], [R, PAL.fire3], [R - 1, PAL.wood2], [R - 2, PAL.ink]]) px(g, c, cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    for (let k = 0; k < 12; k++){ const a = k / 6 * Math.PI; px(g, PAL.ink, cx + Math.cos(a) * (R + 4) - 1, cy + Math.sin(a) * (R + 4) - 1, 3, 3); px(g, PAL.fire3, cx + Math.cos(a) * (R + 4), cy + Math.sin(a) * (R + 4)); }   // its marks, the hours
    let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 18; k++){ const a = r() * Math.PI * 2, d = r() * (R - 6); px(g, r() < 0.3 ? PAL.white : PAL.pale, cx + Math.cos(a) * d, cy + Math.sin(a) * d); }
    // its foot: a brass stand into the floor
    px(g, PAL.ink, cx - 4, cy + R, 8, H - cy - R); px(g, PAL.fire2, cx - 3, cy + R, 6, H - cy - R); px(g, PAL.fire3, cx - 3, cy + R, 1, H - cy - R);
    return [];
  },
  // the Workings: the hewers' trough under a wooden pipe on its frame, the water that came down the shafts
  trough(g, W, H){
    const cx = W / 2;
    const beam = (x, y, w, h) => { px(g, PAL.ink, x - 1, y - 1, w + 2, h + 2); px(g, PAL.wood1, x, y, w, h); px(g, PAL.wood2, x, y, w > h ? w : 1, w > h ? 1 : h); };
    beam(12, 30, 5, H - 30); beam(W - 17, 30, 5, H - 30); beam(8, 28, W - 16, 5);   // the frame
    beam(20, 40, cx - 18, 4); px(g, PAL.ink, cx + 1, 40, 3, 7); px(g, PAL.wood0, cx + 2, 41, 1, 5);   // the pipe along it, and its spout down
    for (const x of [24, 40, W - 30]) { px(g, PAL.ink, x, 33, 1, 7); }   // its lashings
    return [{ x: 2.5, y: H - 47, kind: 'stream' }];
  },
};
const SLAB = new Set(['arch', 'spout']);   // the pieces that are a broad slab of stone: their edges let go into the room. The rest are drawn in lines (a ring, a pipe, a frame, icicles), which the fade would only break
// made once for each look and kept: the picture is the same wherever it stands, and making it was the whole second
// that going into the Cloister or the Gardens cost (reading a canvas back from the graphics card)
const BACKS = new Map();
function backTex(look){ if (BACKS.has(look)) return BACKS.get(look);
  const W = 96, H = 100, c = cnv(W, H), g = c.getContext('2d', { willReadFrequently: SLAB.has(look) }), src = BACK[look](g, W, H); if (SLAB.has(look)) feather(c, 7, 3);
  const B = { tex: texOf(c), w: W, h: H, src }; BACKS.set(look, B); return B; }
// a piece's edges let go into the room in the dither the painting uses, rather than stopping on a line: each pixel within
// `r` of the piece's outside (or the canvas's sides and top) is kept by the ordered dither, more surely the further in.
// The bottom `keep` rows stand on the floor and are left whole
function feather(c, r, keep){
  const W = c.width, H = c.height, g = c.getContext('2d', { willReadFrequently: true }), im = g.getImageData(0, 0, W, H), d = im.data, a = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) a[k] = d[k * 4 + 3] > 40 ? 1 : 0;
  const dist = new Float32Array(W * H).fill(r + 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ if (!a[y * W + x]) continue; let m = Math.min(x + 1, W - x, y + 1, r + 1);
    for (let dy = -r; dy <= r && m > 1; dy++) for (let dx = -r; dx <= r; dx++){ const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; if (!a[yy * W + xx]){ const q = Math.hypot(dx, dy); if (q < m) m = q; } }
    dist[y * W + x] = m; }
  for (let y = 0; y < H - keep; y++) for (let x = 0; x < W; x++){ const k = y * W + x; if (!a[k] || dist[k] > r) continue; if (B4[(y & 3) * 4 + (x & 3)] / 16 > dist[k] / r) d[k * 4 + 3] = 0; }
  g.putImageData(im, 0, 0);
}
// Ordric's lamp over the raising water: an iron hook on a post at its edge, the lantern hung out over it
function hookTex(){
  const c = cnv(26, 60), g = c.getContext('2d');
  px(g, PAL.ink, 21, 6, 4, 54); px(g, PAL.dark, 22, 7, 2, 53); px(g, PAL.mid, 22, 7, 1, 53);   // the post
  px(g, PAL.ink, 4, 4, 21, 3); px(g, PAL.dark, 5, 5, 19, 1);                                    // the arm out over the water
  px(g, PAL.ink, 7, 7, 1, 5);                                                                    // the chain
  px(g, PAL.ink, 3, 12, 9, 10); px(g, PAL.fire2, 4, 13, 7, 8); px(g, PAL.fire3, 5, 14, 5, 5); px(g, PAL.white, 6, 15, 2, 2); px(g, PAL.ink, 7, 12, 1, 10);   // the lantern
  px(g, PAL.ink, 18, 57, 10, 3); return texOf(c);
}
// the lip at one end of the water (s: -1 its left end, 1 its right): worn stone, rounded where the water meets it, a bright
// line of the water's edge against it
function lipTex(s){
  const W = 6, H = 13, c = cnv(W, H), g = c.getContext('2d');
  for (let y = 0; y < H; y++){ const w = y < 2 ? 3 + y : y < 9 ? 5 : Math.max(2, 5 - (y - 8)); for (let k = 0; k < w; k++){ const x = s > 0 ? W - 1 - k : k, edge = k === w - 1 || y === 0;
    px(g, edge ? PAL.ink : (k + y) % 4 === 0 ? PAL.light : y < 3 ? PAL.pale : PAL.mid, x, y); }
    if (y >= 3 && y < 9){ const x = s > 0 ? W - 1 - w : w; px(g, y === 3 ? PAL.white : PAL.cyan, x, y); } }   // the water's edge, lit, against the stone
  return texOf(c);
}
// a falling thread of water: bright dashes on a faint line, repeating, run downward
function fallTex(){ const c = cnv(1, 32), g = c.getContext('2d'); for (let y = 0; y < 32; y++) px(g, y % 8 < 3 ? PAL.white : y % 8 < 5 ? PAL.pale : PAL.cyan, 0, y); const t = texOf(c); t.wrapT = THREE.RepeatWrapping; return t; }
// a soft round glow
function glowTexOf(){ const c = cnv(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }
function shaftTex(){
  const c = cnv(48, 144), g = c.getContext('2d');
  for (let y = 0; y < 144; y++){ const half = 5 + y * 0.12; for (let x = 0; x < 48; x++){ const d = Math.abs(x - 23.5) / half, a = d < 0.5 ? 0.75 : d < 1 ? 0.4 : 0.12; if (d < 1.3 && B4[(y & 3) * 4 + (x & 3)] / 16 < a * (0.35 + y / 260)) px(g, d < 0.4 ? '#ffffff' : '#bfe8ff', x, y); } }
  return texOf(c);
}
export function makeProps(scene, R){
  const W = LEVEL.W, H = LEVEL.H, glass = [], blooms = [], drafts = [], cracks = [], rnd = rng(99), warm = LEVEL.theme === 'gardens';
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, ...o });
  // ---- star-glass: each run along a row is one plank
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){
    const k = rawAt(i, j); if ((k !== GLASS_A && k !== GLASS_B) || rawAt(i - 1, j) === k) continue;
    let e = i; while (rawAt(e + 1, j) === k) e++;
    const n = e - i + 1, m = new THREE.Mesh(new THREE.PlaneGeometry(n * T, 6 / PPU), basic(glassTex(n, warm)));
    m.position.set((i + n / 2) * T, (j + 1) * T - 3 / PPU, 0.02); scene.add(m);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(n * T + 0.6, 0.9), basic(null, { color: warm ? 0xffc060 : 0x60d8ff, blending: THREE.AdditiveBlending, opacity: 0.16 })); gl.position.set(m.position.x, m.position.y - 0.05, 0.015); scene.add(gl);
    glass.push({ k, m, gl, x: m.position.x, y: m.position.y, was: null });
  }
  // ---- blooms
  const bt = bloomTex();
  for (const mk of LEVEL.marks) if (mk.type === 'bloom'){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(28 / PPU, 16 / PPU), basic(bt, { alphaTest: 0.5 })); m.geometry.translate(0, 8 / PPU, 0);
    m.position.set((mk.x + 0.5) * T, mk.y * T, 0.03); scene.add(m); blooms.push({ mk, m, t: 9 });
  }
  // ---- rising air: pale streaks going up through it
  // (and the wind the Wyrm holds: the same streaks, driven down in its beats; turned, they rise)
  for (const u of [...LEVEL.updrafts, ...(LEVEL.gusts || []).map(g => ({ ...g, gust: true }))]){
    const n = Math.min(160, Math.max(8, Math.round((u.x1 - u.x0) * (u.y1 - u.y0) * (u.gust ? 0.5 : 0.9))));
    for (let k = 0; k < n; k++){ const len = 3 + Math.floor(rnd() * 7), m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, len / PPU), basic(null, { color: rnd() < 0.3 ? 0xffffff : 0xa8d8ff, blending: THREE.AdditiveBlending, opacity: 0.5 }));
      m.position.set(u.x0 + rnd() * (u.x1 - u.x0), u.y0 + rnd() * (u.y1 - u.y0), 0.6); scene.add(m); drafts.push({ m, u, v: 5 + rnd() * 6, ph: rnd() * 9, x: m.position.x }); }
  }
  // ---- cracked rock: each patch of it is one block. A seal (the way out of a keeper's hall, level.js build) is drawn the
  // apart, below, as a hold: it comes down when the keeper falls
  const SEAL = new Set((LEVEL.joins && LEVEL.joins.up && LEVEL.joins.up.seal) || []);
  const seen = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){
    if (rawAt(i, j) !== CRACKED || seen[j * W + i]) continue;
    const tiles = [], st = [[i, j]]; seen[j * W + i] = 1; let x0 = i, x1 = i, y0 = j, y1 = j;
    while (st.length){ const [a, b] = st.pop(); tiles.push([a, b]); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
      for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const na = a + da, nb = b + db; if (na >= 0 && nb >= 0 && na < W && nb < H && !seen[nb * W + na] && rawAt(na, nb) === CRACKED){ seen[nb * W + na] = 1; st.push([na, nb]); } } }
    const w = x1 - x0 + 1, h = y1 - y0 + 1, m = new THREE.Mesh(new THREE.PlaneGeometry(w * T, h * T), lit({ map: crackTex(w, h, i * 131 + j * 17 + 5), transparent: false }));
    m.position.set((x0 + w / 2) * T, (y0 + h / 2) * T, 0.01); scene.add(m);
    cracks.push({ id: `${i},${j}`, tiles, m, x: m.position.x, y: m.position.y, w: w * T, h: h * T, gone: false });
  }
  // ---- vellum: a sheet stretched over a way (the Scriptorium). Each patch one sheet; torn by the Toll's step (tear)
  const sheets = [];
  { const seenV = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){ if (rawAt(i, j) !== VELLUM || seenV[j * W + i]) continue;
      const tiles = [], st = [[i, j]]; seenV[j * W + i] = 1; let x0 = i, x1 = i, y0 = j, y1 = j;
      while (st.length){ const [a, b] = st.pop(); tiles.push([a, b]); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
        for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const na = a + da, nb = b + db; if (na >= 0 && nb >= 0 && na < W && nb < H && !seenV[nb * W + na] && rawAt(na, nb) === VELLUM){ seenV[nb * W + na] = 1; st.push([na, nb]); } } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, c = cnv(Math.max(8, w * 8), h * 8), g = c.getContext('2d'), r = rng(i * 53 + j * 11 + 3);
      px(g, PAL.bone, 0, 0, c.width, c.height); for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (B4[(y & 3) * 4 + (x & 3)] < 2) px(g, PAL.wood3, x, y);
      for (let y = 5; y < c.height - 3; y += 4){ const a = 1 + Math.floor(r() * 2), b = c.width - 1 - Math.floor(r() * 3); px(g, PAL.tan, a, y, Math.max(1, b - a), 1); }   // the lines ruled on it, nothing written
      px(g, PAL.wood0, 0, 0, c.width, 1); px(g, PAL.wood0, 0, c.height - 1, c.width, 1); for (let y = 2; y < c.height; y += 6){ px(g, PAL.wood0, 0, y, 1, 2); px(g, PAL.wood0, c.width - 1, y, 1, 2); }   // laced to its frame
      if (LEVEL.theme === 'spires'){ px(g, '#bfeaff', 0, 0, c.width, c.height); for (let k = 0; k < c.width * c.height / 9; k++) px(g, r() < 0.5 ? '#ffffff' : '#7cc4ea', Math.floor(r() * c.width), Math.floor(r() * c.height), 1, 1 + Math.floor(r() * 3)); px(g, '#ffffff', 0, 0, 1, c.height); px(g, '#4a90c8', c.width - 1, 0, 1, c.height); let cx = c.width >> 1; for (let y = 0; y < c.height; y++){ cx += [0, 1, -1, 0, 1, 0, -1, -1][y & 7]; px(g, '#4a90c8', Math.max(0, Math.min(c.width - 1, cx)), y, 1, 1); } }   // in the Spires a sheet is a pane of thin ice (the Glacier Galleries): the Toll's step goes through it the same
      const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(1, w) * T, h * T), basic(texOf(c), { opacity: 0.96 })); m.position.set((x0 + w / 2) * T, (y0 + h / 2) * T, 0.013); scene.add(m);
      sheets.push({ id: `${i},${j}`, tiles, m, x: m.position.x, y: m.position.y, x0: x0 * T, x1: (x1 + 1) * T, y0: y0 * T, y1: (y1 + 1) * T, gone: false }); } }
  const rip = S => { if (S.gone) return; S.gone = true; for (const [a, b] of S.tiles) LEVEL.tiles[b * W + a] = EMPTY; scene.remove(S.m); S.m.geometry.dispose(); S.m.material.map.dispose(); S.m.material.dispose(); };
  // ---- what the keeper holds: each patch of holds (and given planks) one block, each door one; shown while they hold
  // ---- the stones of the way (the Pilgrims' Cairns): each run of them a line of flat stones; gone when he turns round
  const ways = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){ if (rawAt(i, j) !== FACED || (i > 0 && rawAt(i - 1, j) === FACED)) continue; let n = 1; while (rawAt(i + n, j) === FACED) n++;
    const c = cnv(n * 8, 6), g = c.getContext('2d'), r = rng(i * 37 + j * 13 + 1); for (let x = 0; x < n * 8;){ const w = 5 + Math.floor(r() * 5), ww = Math.min(w, n * 8 - x); px(g, PAL.ink, x, 0, ww, 6); px(g, PAL.mid, x + 1, 1, Math.max(1, ww - 2), 4); px(g, PAL.light, x + 1, 1, Math.max(1, ww - 2), 1); px(g, PAL.pale, x + 1, 1, Math.max(1, Math.min(3, ww - 2)), 1); px(g, PAL.dark, x + 1, 4, Math.max(1, ww - 2), 1); x += ww + (r() < 0.4 ? 1 : 0); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(n * T, 6 / PPU), basic(texOf(c), { opacity: 1 })); m.position.set((i + n / 2) * T, (j + 1) * T - 3 / PPU, 0.012); scene.add(m); ways.push({ m, x: m.position.x, y: m.position.y, w: n * T }); }
  // ---- ice a fire melts (the Glacier Galleries): each patch of it that answers to one brazier a block of clear ice, what
  // is in it seen through it; gone when its fire is lit
  const ices = [];
  { const seenI = new Uint8Array(W * H), fireOf = k => LEVEL.meltOf.get(k);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){ if (rawAt(i, j) !== MELT || seenI[j * W + i]) continue; const fire = fireOf(j * W + i), st = [[i, j]]; seenI[j * W + i] = 1; let x0 = i, x1 = i, y0 = j, y1 = j; const cells = [];
      while (st.length){ const [a, b] = st.pop(); cells.push([a, b]); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
        for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const na = a + da, nb = b + db; if (na >= 0 && nb >= 0 && na < W && nb < H && !seenI[nb * W + na] && rawAt(na, nb) === MELT && fireOf(nb * W + na) === fire){ seenI[nb * W + na] = 1; st.push([na, nb]); } } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, c = cnv(w * 8, h * 8), g = c.getContext('2d'), r = rng(i * 41 + j * 7 + 2); g.clearRect(0, 0, c.width, c.height);
      for (const [a, b] of cells){ const X = (a - x0) * 8, Y = (y1 - b) * 8; px(g, '#8fd4f0', X, Y, 8, 8); for (let q = 0; q < 5; q++) px(g, r() < 0.5 ? '#c8f0ff' : '#5aa8d8', X + Math.floor(r() * 8), Y + Math.floor(r() * 8), 1 + Math.floor(r() * 3), 1); }
      for (const [a, b] of cells){ const X = (a - x0) * 8, Y = (y1 - b) * 8, has = (da, db) => cells.some(([p, q]) => p === a + da && q === b + db); if (!has(0, 1)) px(g, '#ffffff', X, Y, 8, 1); if (!has(-1, 0)) px(g, '#e0f8ff', X, Y, 1, 8); if (!has(1, 0)) px(g, '#3a78b0', X + 7, Y, 1, 8); if (!has(0, -1)) px(g, '#3a78b0', X, Y + 7, 8, 1); }
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w * T, h * T), basic(texOf(c), { opacity: 0.62 })); m.position.set((x0 + w / 2) * T, (y0 + h / 2) * T, 0.046); scene.add(m);
      ices.push({ m, fire, x: m.position.x, y: m.position.y, w: w * T, h: h * T }); } }
  const held = [], doors = [], shutters = [], grates = [];
  { const seen2 = new Uint8Array(W * H), kind = t => t === HOLD || t === GIVEN ? 1 : t === DOOR ? 2 : t === SHUTTER ? 3 : t === STILLED ? 4 : 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){
      const k = kind(rawAt(i, j)); if (!k || seen2[j * W + i]) continue;
      const tiles = [], st = [[i, j]]; seen2[j * W + i] = 1; let x0 = i, x1 = i, y0 = j, y1 = j, given = [];
      while (st.length){ const [a, b] = st.pop(); tiles.push([a, b]); if (rawAt(a, b) === GIVEN) given.push([a, b]); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
        for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const na = a + da, nb = b + db; if (na >= 0 && nb >= 0 && na < W && nb < H && !seen2[nb * W + na] && kind(rawAt(na, nb)) === k){ seen2[nb * W + na] = 1; st.push([na, nb]); } } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, look = k === 3 ? 'iron' : k === 4 ? 'grate' : k === 2 ? 'door' : tiles.some(([a, b]) => SEAL.has(a + ',' + b)) ? 'stone' : LEVEL.theme === 'roots' && h <= 3 && given.length === 0 ? 'slab' : LEVEL.theme === 'gardens' ? 'thorn' : 'stone';
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w * T, h * T), lit({ map: holdTex(w, h, look, i * 131 + j * 17 + 9), transparent: look === 'grate', alphaTest: look === 'grate' ? 0.5 : 0 })); m.position.set((x0 + w / 2) * T, (y0 + h / 2) * T, 0.012); scene.add(m);
      const B = { look, tiles, m, x: m.position.x, y: m.position.y, w: w * T, h: h * T, x0: x0 * T, x1: (x1 + 1) * T, y0: y0 * T, y1: (y1 + 1) * T, plank: null, stub: null };
      if (given.length){ const gx0 = Math.min(...given.map(q => q[0])), gx1 = Math.max(...given.map(q => q[0])), gy = given[0][1], pw = gx1 - gx0 + 1; B.plank = new THREE.Mesh(new THREE.PlaneGeometry(pw * T, 5 / PPU), basic(plankTex(pw), { opacity: 1 })); B.plank.position.set((gx0 + pw / 2) * T, (gy + 1) * T - 2.5 / PPU, 0.012); scene.add(B.plank); }
      if (k === 2){ B.stub = new THREE.Mesh(new THREE.PlaneGeometry(w * T, T), lit({ map: holdTex(w, 1, 'door', i * 7 + 3), transparent: false })); B.stub.position.set(B.x, B.y1 - T / 2, 0.012); scene.add(B.stub); doors.push(B); }
      else if (k === 3){ if (h > w){ B.stub = new THREE.Mesh(new THREE.PlaneGeometry(w * T, T), lit({ map: holdTex(w, 1, 'iron', i * 7 + 5), transparent: false })); B.stub.position.set(B.x, B.y1 - T / 2, 0.012); scene.add(B.stub); } shutters.push(B); }   // a shutter: up in its doorway (its foot showing) until iron rings
      else if (k === 4) grates.push(B);
      else held.push(B);
    } }
  const showHeld = () => { for (const B of held){ B.m.visible = !RULE.fallen; if (B.plank) B.plank.visible = RULE.fallen; } for (const B of doors){ const shut = RULE.shut && !RULE.fallen; B.m.visible = shut; B.stub.visible = !shut; }
    for (const B of shutters){ const shut = RULE.ring > 0 && !RULE.still; B.m.visible = shut; if (B.stub) B.stub.visible = !shut; } for (const B of grates) B.m.visible = !RULE.still; for (const B of ways) B.m.visible = !RULE.turned; for (const B of ices) B.m.visible = !(RULE.litAll || RULE.lit.has(B.fire)); };
  RULE.shut = false; showHeld(); let bellT = 1.2;
  // ---- the storm's gantries (live decks): each run an iron grating; while the storm rules it spits
  const decks = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){ if (rawAt(i, j) !== LIVE || (i > 0 && rawAt(i - 1, j) === LIVE)) continue; let n = 1; while (rawAt(i + n, j) === LIVE) n++;
    const c = cnv(n * 8, 5), g = c.getContext('2d'); px(g, PAL.ink, 0, 0, c.width, 5); px(g, PAL.mid, 1, 1, c.width - 2, 1); for (let x = 1; x < c.width - 1; x += 2) px(g, PAL.dark, x, 2, 1, 2); px(g, PAL.light, 1, 1, 1, 1); px(g, PAL.light, c.width - 2, 1, 1, 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(n * T, 5 / PPU), basic(texOf(c), { opacity: 1 })); m.position.set((i + n / 2) * T, (j + 1) * T - 2.5 / PPU, 0.012); scene.add(m); decks.push({ m, x: (i + n / 2) * T, y: (j + 1) * T, w: n * T, ph: rnd() * 9 }); }
  // ---- the storm's rods ('rod' marks): an iron mast with a ball at its tip. main.js strikes them in turn (rod.warn 0 to 1
  // as the strike comes, rod.bolt while it lands); here they are drawn: the mark of where it will land, and the bolt
  const rods = [];
  { const c = cnv(7, 52), g = c.getContext('2d'); px(g, PAL.ink, 2, 4, 3, 48); px(g, PAL.mid, 3, 4, 1, 48); px(g, PAL.ink, 1, 0, 5, 5); px(g, PAL.light, 2, 1, 3, 3); px(g, PAL.white, 2, 1, 1, 1); px(g, PAL.ink, 0, 49, 7, 3); px(g, PAL.dark, 1, 50, 5, 1); for (const y of [16, 30]){ px(g, PAL.ink, 1, y, 5, 2); px(g, PAL.light, 1, y, 5, 1); }
    const rodT = texOf(c);
    for (const mk of LEVEL.marks) if (mk.type === 'rod'){ const x = (mk.x + 0.5) * T, y = mk.y * T;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(7 / PPU, 52 / PPU), basic(rodT, { opacity: 1 })); m.position.set(x, y + 26 / PPU, 0.02); scene.add(m);
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 9), basic(null, { color: 0xff5a5a, blending: THREE.AdditiveBlending, opacity: 0 })); mark.position.set(x, y + 4.5, 0.07); scene.add(mark);
      const bolt = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 14), basic(null, { color: 0xffffff, blending: THREE.AdditiveBlending, opacity: 0 })); bolt.position.set(x, y + 3.2 + 7, 0.08); scene.add(bolt);
      rods.push({ x, y, m, mark, bolt, warn: 0, boltT: 0 }); } }
  // ---- the raising water: each region's pool, where the water gives him back (the Roots' is the first, the sacred pool in
  // its cistern, under the apse). The water is a basin in the floor, deep and lit from below, and he stands in it; behind
  // it, its region's back (BACK: the apse, a niche, ice, a pipe, a spout, a ring, a trough), the water falling into it
  // from where that says, a shaft of light, motes rising; Ordric's lamp on its hook over it. A `plain` pool is only
  // water (the cistern's), nothing holy about it
  const pools = [], hookT = hookTex();
  for (const mk of LEVEL.marks) if (mk.type === 'pool'){
    const w = (mk.w || 8) * T, x = mk.x * T + w / 2, y = mk.y * T, wpx = Math.round(w * PPU), deep = 10, wt = waterTex(wpx, deep);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(w - 4 / PPU, deep / PPU), basic(wt, { opacity: 0.8 })); water.position.set(x, y + T + 2 / PPU - deep / 2 / PPU, 0.07); scene.add(water);   // before him: he stands in it
    // its two ends: a worn stone lip each, the water's edge curling against it, so it sits in a basin and does not stop on a line
    for (const s of [-1, 1]){ const L = new THREE.Mesh(new THREE.PlaneGeometry(6 / PPU, (deep + 3) / PPU), basic(lipTex(s), { opacity: 1 })); L.position.set(x + s * (w / 2 - 1 / PPU), y + T + 3.5 / PPU - (deep + 3) / 2 / PPU, 0.072); scene.add(L); }
    if (mk.plain){ pools.push({ x, y, w, water, wt, plain: true, falls: [], motes: [] }); continue; }
    const look = mk.look || 'apse', floor = y + T;
    let src;
    if (look === 'apse'){ const apse = new THREE.Mesh(new THREE.PlaneGeometry(apseW / PPU, apseH / PPU), basic(apseTex(), { opacity: 1 })); apse.position.set(x, floor + apseH / 2 / PPU - 2 / PPU, -0.4); scene.add(apse); src = [-0.32, 0.12, 0.38].map(f => ({ x: f * w * PPU, y: 144, kind: 'thread' })); }
    else { const B = backTex(look), m = new THREE.Mesh(new THREE.PlaneGeometry(B.w / PPU, B.h / PPU), basic(B.tex, { opacity: 1 })); m.position.set(x, floor + B.h / 2 / PPU - 2 / PPU, -0.4); scene.add(m); src = B.src; }
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, 3), basic(glowTexOf(), { blending: THREE.AdditiveBlending, opacity: 0.2, color: 0x9fe8ff })); glow.position.set(x, floor + 0.3, 0.06); scene.add(glow);
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(64 / PPU, 160 / PPU), basic(shaftTex(), { blending: THREE.AdditiveBlending, opacity: 0.3 })); shaft.position.set(x, y + 80 / PPU, 0.012); scene.add(shaft);
    // the water falling in, each with its rings where it lands: a thread (a fine line), a stream (wider), drips (a broken line)
    const falls = src.map((S, k) => { const fx = x + S.x / PPU, top = floor + S.y / PPU, len = Math.max(0.2, top - floor), wd = S.kind === 'stream' ? 2 : 1;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(wd / PPU, len), basic(fallTex(), { blending: THREE.AdditiveBlending, opacity: S.kind === 'drip' ? 0.3 : 0.55 })); m.position.set(fx, floor + len / 2, 0.065); m.material.map.repeat.set(1, len * PPU / (S.kind === 'drip' ? 64 : 32)); scene.add(m);
      return { m, x: fx, ph: k * 1.7, spl: [], drip: S.kind === 'drip' }; });
    const motes = []; for (let k = 0; k < 22; k++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, 1 / PPU), basic(null, { color: look === 'ring' ? 0xfff2d0 : 0xdff4ff, blending: THREE.AdditiveBlending })); m.position.set(x + (rnd() - 0.5) * w, y + rnd() * 7, 0.6); scene.add(m); motes.push({ m, x: m.position.x, v: 0.25 + rnd() * 0.5, ph: rnd() * 6 }); }
    // Ordric's lamp: on its hook at the water's right edge, the lantern out over it (not over the Roots' first pool, which
    // was there before him)
    let lamp = null; if (look !== 'apse'){ lamp = new THREE.Mesh(new THREE.PlaneGeometry(26 / PPU, 60 / PPU), basic(hookT, { opacity: 1 })); lamp.position.set(x + w / 2 - 4 / PPU, floor + 30 / PPU - 1 / PPU, 0.02); scene.add(lamp); }
    pools.push({ x, y, w, water, wt, shaft, glow, falls, motes, lamp, look, lx: x + w / 2 - 10 / PPU, ly: floor + 43 / PPU });
  }
  // ---- water running down a stair (a 'runnel' mark at the head of it: n steps, each `run` tiles long, going down toward
  // dir): a thin fall down each step's face and a sheen along each tread. The Crypt Stair: it runs down to meet him
  const runnels = [];
  for (const mk of LEVEL.marks) if (mk.type === 'runnel'){ const n = mk.n || 6, run = mk.run || 2, dir = mk.dir || 1, X = a => (mk.x + (dir > 0 ? a : 1 - a)) * T;
    for (let k = 0; k < n; k++){
      const tread = new THREE.Mesh(new THREE.PlaneGeometry(run * T, 1 / PPU), basic(null, { color: 0x9fe8ff, blending: THREE.AdditiveBlending, opacity: 0.25 })); tread.position.set((X(k * run) + X((k + 1) * run)) / 2, (mk.y - k) * T + 1 / PPU, 0.066); scene.add(tread);
      const fall = new THREE.Mesh(new THREE.PlaneGeometry(2 / PPU, T), basic(fallTex(), { blending: THREE.AdditiveBlending, opacity: 0.5 })); fall.position.set(X((k + 1) * run) + dir / PPU, (mk.y - k - 0.5) * T, 0.066); fall.material.map.repeat.set(1, T * PPU / 32); scene.add(fall);
      runnels.push({ tread, fall, ph: k * 0.9 }); } }
  // ---- the leaks: water seeping out of a crack in the rock into a stone bowl on the floor (the bowl is painted, paint.js);
  // the drip, its rings, a little cold light. They mend him and fill the flask; they do not raise him (main.js)
  const leaks = [];
  for (const mk of LEVEL.marks) if (mk.type === 'shrine'){
    const x = (mk.x + 0.5) * T, floor = mk.y * T + 5 / PPU, len = 2.2;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, len), basic(fallTex(), { blending: THREE.AdditiveBlending, opacity: 0.4 })); m.position.set(x, floor + len / 2, 0.065); m.material.map.repeat.set(1, len * PPU / 48); scene.add(m);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), basic(glowTexOf(), { blending: THREE.AdditiveBlending, opacity: 0.22, color: 0x9fe8ff })); glow.position.set(x, floor + 0.2, 0.06); scene.add(glow);
    leaks.push({ x, y: floor, m, glow, ph: rnd() * 6, spl: [] });
  }
  const shatter = (C, quiet) => { if (C.gone) return; C.gone = true; for (const [a, b] of C.tiles) LEVEL.tiles[b * W + a] = EMPTY; scene.remove(C.m); C.m.geometry.dispose(); C.m.material.map.dispose(); C.m.material.dispose(); };
  const API = {
    cracks, glass, blooms, pools, leaks,
    step(dt, t, P){
      for (const W of pools){ W.wt.offset.x = Math.floor(t * 5) / (W.w * PPU); if (W.plain) continue; W.shaft.material.opacity = 0.26 + Math.sin(t * 0.9) * 0.05; W.glow.material.opacity = 0.17 + Math.sin(t * 1.3) * 0.04; R.glint(W.x, W.y + 1.6, 0xbfe8ff, 0.7, 7);
        for (const F of W.falls){ F.m.material.map.offset.y = -((t * 3 + F.ph) % 1); F.m.material.opacity = 0.45 + Math.sin(t * 2 + F.ph) * 0.12;
          if (rnd() < dt * 5){ const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / PPU), basic(null, { color: 0xdff4ff, blending: THREE.AdditiveBlending, opacity: 0.8 })); ring.position.set(F.x, W.y + T + 1 / PPU, 0.075); scene.add(ring); F.spl.push({ m: ring, t: 0 }); }
          for (const S of F.spl){ S.t += dt; S.m.scale.set(0.15 + S.t * 1.6, 1, 1); S.m.material.opacity = Math.max(0, 0.8 - S.t * 1.6); }
          while (F.spl.length && F.spl[0].t > 0.5){ const S = F.spl.shift(); scene.remove(S.m); S.m.geometry.dispose(); S.m.material.dispose(); } }
        for (const M of W.motes){ M.m.position.y += M.v * dt; M.m.position.x = M.x + Math.sin(t * 0.8 + M.ph) * 0.25; if (M.m.position.y > W.y + 8){ M.m.position.y = W.y + 0.5; M.x = W.x + (rnd() - 0.5) * W.w; } M.m.material.opacity = 0.4 + 0.4 * Math.sin(t * 2 + M.ph); } }
      for (const W of pools) if (W.lamp) R.glint(W.lx, W.ly, 0xffb060, 0.3, 3.2);   // Ordric's lamp over the water, small and warm
      // the doors on the bell's beat: every toll they turn, shut to open and back; one will not shut on him (the toll
      // waits until he is clear). props.toll(shut) is main.js's, for the sound
      if (doors.length && !RULE.fallen){ bellT -= dt;
        if (bellT <= 0){ const to = !RULE.shut, inWay = to && P && doors.some(B => P.x + 0.5 > B.x0 && P.x - 0.5 < B.x1 && P.y + 2.5 > B.y0 && P.y < B.y1);
          if (!inWay){ RULE.shut = to; bellT = to ? 2.2 : 2.8; showHeld(); if (API.toll) API.toll(to, doors); } } }
      for (const D of decks){ const live = !RULE.fallen; D.m.material.color.setHex(live && Math.sin(t * 31 + D.ph) > 0.86 ? 0xbfe0ff : live ? 0xffffff : 0x8f96a8); if (live && rnd() < dt * 1.5) R.glint(D.x + (rnd() - 0.5) * D.w, D.y + 0.1, 0x9fd0ff, 0.9, 2.2, 0.12); }
      for (const Q of rods){ Q.mark.material.opacity = RULE.fallen ? 0 : Q.warn * (0.1 + 0.06 * Math.sin(t * 40)); Q.boltT = Math.max(0, Q.boltT - dt); Q.bolt.material.opacity = Q.boltT > 0 ? 0.9 : 0; Q.bolt.scale.x = 0.6 + rnd() * 0.9; Q.m.material.color.setHex(RULE.fallen ? 0x8f96a8 : 0xffffff); if (!RULE.fallen && Q.warn > 0) R.glint(Q.x, Q.y + 3.2, 0xbfe0ff, 0.5 + Q.warn, 3.5); }
      for (const Q of runnels){ Q.fall.material.map.offset.y = -((t * 1.8 + Q.ph) % 1); Q.tread.material.opacity = 0.18 + 0.1 * Math.sin(t * 5 + Q.ph * 3); }
      for (const L of leaks){
        L.m.material.map.offset.y = -((t * 2.2 + L.ph) % 1); L.glow.material.opacity = 0.18 + Math.sin(t * 1.7 + L.ph) * 0.05; R.glint(L.x, L.y + 0.6, 0x9fe8ff, 0.45, 4.2);
        if (rnd() < dt * 2.5){ const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / PPU), basic(null, { color: 0xdff4ff, blending: THREE.AdditiveBlending, opacity: 0.8 })); ring.position.set(L.x, L.y + 1 / PPU, 0.075); scene.add(ring); L.spl.push({ m: ring, t: 0 }); }
        for (const S of L.spl){ S.t += dt; S.m.scale.set(0.1 + S.t * 0.9, 1, 1); S.m.material.opacity = Math.max(0, 0.8 - S.t * 1.8); }
        while (L.spl.length && L.spl[0].t > 0.45){ const S = L.spl.shift(); scene.remove(S.m); S.m.geometry.dispose(); S.m.material.dispose(); } }
      const left = PHASE.period - (PHASE.t % PHASE.period);   // until the beat turns
      for (const G of glass){ const on = glassOn(G.k), going = on && left < 0.5 && !PHASE.all;
        G.m.material.opacity = on ? (going && Math.floor(t * 16) % 2 ? 0.45 : 1) : 0.13; G.gl.material.opacity = on ? 0.16 + Math.sin(t * 3 + G.x) * 0.04 : 0.02; G.turned = G.was !== null && G.was !== on; G.was = on; }
      for (const B of blooms){ B.t += dt; const u = Math.min(1, B.t / 0.5), k = u < 0.18 ? 1 - u / 0.18 * 0.55 : 0.45 + 0.55 * (1 - Math.cos((u - 0.18) / 0.82 * Math.PI * 2.5) * Math.exp(-(u - 0.18) * 5)) ; B.m.scale.set(1 + (1 - Math.min(1, k)) * 0.35, Math.max(0.4, k) + Math.sin(t * 1.7 + B.mk.x) * 0.02, 1); }
      const blow = gustOn();
      for (const D of drafts){ const m = D.m, down = D.u.gust && !RULE.fallen; if (down && !blow){ m.material.opacity = Math.max(0, m.material.opacity - dt * 2); continue; }
        m.position.y += (down ? -2.4 : 1) * D.v * dt; m.position.x = D.x + Math.sin(t * 2 + D.ph) * 0.12; if (m.position.y > D.u.y1 || m.position.y < D.u.y0){ m.position.y = down ? D.u.y1 : D.u.y0; D.x = D.u.x0 + rnd() * (D.u.x1 - D.u.x0); }
        const f = Math.min(1, (m.position.y - D.u.y0) / 1.2, (D.u.y1 - m.position.y) / 1.5); m.material.opacity = 0.5 * Math.max(0, f); }
    },
    bounce(mk){ const B = blooms.find(b => b.mk === mk); if (B) B.t = 0; },
    // everything cracked within r of (x, y) breaks; returns what broke
    breakAt(x, y, r){ const out = []; for (const C of cracks){ if (C.gone) continue; const dx = Math.max(Math.abs(x - C.x) - C.w / 2, 0), dy = Math.max(Math.abs(y - C.y) - C.h / 2, 0); if (Math.hypot(dx, dy) <= r){ shatter(C); out.push(C); } } return out; },
    held, doors, decks, rods, sheets, shutters, grates, ways, ices, show: showHeld,   // show: the rule has changed (a ring begun or ended, the wing gone still): what is shut is drawn shut
    // the sheets of vellum his body is in or against (he is in the Toll's step): torn. Returns them
    tear(P){ const out = []; for (const S of sheets) if (!S.gone && P.x + 0.6 > S.x0 && P.x - 0.6 < S.x1 && P.y + 2.4 > S.y0 && P.y < S.y1){ rip(S); out.push(S); } return out; },
    // the keeper has fallen (main.js has set RULE.fallen): what it held is let go. Returns the blocks, for their dust
    release(){ showHeld(); return held.concat(doors); },
    nearCrack(x, y, r){ return cracks.find(C => !C.gone && Math.hypot(Math.max(Math.abs(x - C.x) - C.w / 2, 0), Math.max(Math.abs(y - C.y) - C.h / 2, 0)) <= r) || null; },
    breakId(id){ const C = cracks.find(c => c.id === id); if (C) shatter(C, true); const S = sheets.find(s => s.id === id); if (S) rip(S); },
  };
  return API;
}
