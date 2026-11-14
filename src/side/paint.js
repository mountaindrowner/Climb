// The painter: the region's painted layers (the play rock with its normal map, the back wall), made by hand-made rules
// in the palette (render.js says how they look). Nothing here touches the page or three.js, so it runs the same in a
// worker (paintworker.js, which paints a region before it is wanted) as on the page; render.js puts the result in the scene.
// paintRegion(n) -> { back, bh, play, normals, glows: [{ x, y, kind }] } (canvases; glows in canvas pixels of the play layer)
import { T, ROCK, LEDGE, SPIKES, EMPTY, LEVEL, rawAt, REGION_DATA } from './level.js';
import { loadLevel } from './level.js';
// what the painted layers see: the level as drawn, with cracked rock and star-glass left out (they are drawn apart, since they change)
export const paintAt = (i, j) => { const t = rawAt(i, j); return t > SPIKES ? EMPTY : t; };
export const PPU = 16;                  // pixels to a world unit: a tile is 8, the warrior ~28 tall
export const VIEW_H = 13.5;             // world units the screen is tall: 216 pixels (it was 11.25, 180: drawn back a fifth, to see more of the world)
export const TH = Math.round(VIEW_H * PPU), CELL = T * PPU;
export const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];   // ordered dither
// the palette, by what each colour is for here
export const PAL = { ink: '#181425', deep: '#262b44', dark: '#3a4466', mid: '#5a6988', light: '#8b9bb4', pale: '#c0cbdc', white: '#ffffff',
  teal: '#193c3e', moss0: '#265c42', moss1: '#3e8948', moss2: '#63c74d', navy: '#124e89', blue: '#0099db', cyan: '#2ce8f5',
  wood0: '#3e2731', wood1: '#733e39', wood2: '#b86f50', wood3: '#e4a672', bone: '#ead4aa', fire0: '#be4a2f', fire1: '#f77622', fire2: '#feae34', fire3: '#fee761',
  red0: '#a22633', red1: '#e43b44', plum: '#68386c', pink: '#b55088', rose: '#f6757a', skin: '#e8b796', tan: '#c28569', rust: '#d77643' };
export const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const PALETTE = ['#be4a2f', '#d77643', '#ead4aa', '#e4a672', '#b86f50', '#733e39', '#3e2731', '#a22633', '#e43b44', '#f77622', '#feae34', '#fee761', '#63c74d', '#3e8948', '#265c42', '#193c3e', '#124e89', '#0099db', '#2ce8f5', '#ffffff', '#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466', '#262b44', '#181425', '#ff0044', '#68386c', '#b55088', '#f6757a', '#e8b796', '#c28569'].map(rgb);
export function nearest(r, g, b){ let best = 0, bd = 1e9; for (let k = 0; k < PALETTE.length; k++){ const p = PALETTE[k], d = (p[0] - r) ** 2 * 3 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 2; if (d < bd){ bd = d; best = k; } } return PALETTE[best]; }

export function rng(seed){ let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
// a canvas: the page's, or one of its own where there is no page (a worker)
export const newCanvas = (w, h) => { if (typeof document !== 'undefined'){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } return new OffscreenCanvas(w, h); };
export function noise2(seed){
  const r = rng(seed), N = 256, v = new Float32Array(N * N); for (let k = 0; k < v.length; k++) v[k] = r();
  const g = (i, j) => v[((j & (N - 1)) * N) + (i & (N - 1))];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, w = y - j, a = u * u * (3 - 2 * u), b = w * w * (3 - 2 * w);
    return (g(i, j) * (1 - a) + g(i + 1, j) * a) * (1 - b) + (g(i, j + 1) * (1 - a) + g(i + 1, j + 1) * a) * b; };
}
// ---- the decoration, drawn small and bold in the palette. (x, y) is where it is fixed: the top of what hangs, the foot
// of what stands. Each returns nothing; some leave a glow to add (lanterns, crystals)
export const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
export const DECO = {
  stalactite(g, x, y, r){ const w = 3 + Math.floor(r() * 4), L = 4 + Math.floor(r() * 8);
    for (let k = 0; k < L; k++){ const half = Math.max(0, Math.round((1 - k / L) * w / 2)); px(g, PAL.ink, x - half - 1, y + k, half * 2 + 3); px(g, k < 2 ? PAL.light : PAL.mid, x - half, y + k, half * 2 + 1); if (half > 0) px(g, PAL.dark, x + half, y + k); } },
  vine(g, x, y, r){ const L = 6 + Math.floor(r() * 16); let cx = x;
    for (let k = 0; k < L; k++){ cx += (r() < 0.3 ? (r() < 0.5 ? -1 : 1) : 0); px(g, PAL.moss0, cx, y + k); if (k % 3 === 1) px(g, PAL.moss2, cx + (k % 6 === 1 ? 1 : -1), y + k); }
    px(g, PAL.moss2, cx, y + L); },
  root(g, x, y, r){ const branch = (bx, by, L, dir) => { let cx = bx; for (let k = 0; k < L; k++){ if (r() < 0.35) cx += dir; px(g, k < L / 2 ? PAL.wood1 : PAL.wood0, cx, by + k); if (k === Math.floor(L / 3) && L > 5) branch(cx, by + k, Math.floor(L / 2), -dir); } };
    branch(x, y, 6 + Math.floor(r() * 9), r() < 0.5 ? -1 : 1); },
  chain(g, x, y, r){ const L = 8 + Math.floor(r() * 16); for (let k = 0; k < L; k++){ px(g, k % 2 ? PAL.mid : PAL.light, x, y + k); if (k % 2) px(g, PAL.ink, x + 1, y + k); }
    px(g, PAL.dark, x - 1, y + L, 3, 2); },
  banner(g, x, y, r){ const w = 7, L = 12 + Math.floor(r() * 6); px(g, PAL.wood1, x - 1, y, w + 2, 1);
    for (let k = 1; k < L; k++){ const rag = k > L - 3 ? (k + x) % 3 : 0; px(g, PAL.ink, x - 1 + rag, y + k, w + 2 - rag * 2); px(g, k % 5 === 2 ? PAL.fire2 : PAL.red0, x + rag, y + k, w - rag * 2); px(g, PAL.red1, x + rag, y + k); } },
  lantern(g, x, y, r, glow){ px(g, PAL.mid, x, y, 1, 3); px(g, PAL.ink, x - 2, y + 3, 5, 6); px(g, PAL.wood1, x - 2, y + 3, 5, 1); px(g, PAL.fire2, x - 1, y + 4, 3, 4); px(g, PAL.fire3, x, y + 5, 1, 2); px(g, PAL.wood1, x - 2, y + 8, 5, 1); glow && glow(x, y + 6, 'lamp'); },
  crystal(g, x, y, r, glow){ const n = 1 + Math.floor(r() * 3);
    for (let s = 0; s < n; s++){ const h = 4 + Math.floor(r() * 6), cx = x + (s - (n - 1) / 2) * 3, lean = s - (n - 1) / 2;
      for (let k = 0; k < h; k++){ const half = k > h - 3 ? 0 : 1; const xx = cx + Math.round(lean * k / h); px(g, PAL.ink, xx - half - 1, y - k, half * 2 + 3); px(g, k > h - 3 ? PAL.white : PAL.blue, xx - half, y - k, half * 2 + 1); px(g, PAL.cyan, xx - half, y - k); } }
    glow && glow(x, y - 3, 'crystal'); },
  mushroom(g, x, y, r){ const n = 1 + Math.floor(r() * 3), hot = r() < 0.5;
    for (let s = 0; s < n; s++){ const h = 2 + Math.floor(r() * 3), cx = x + s * 4 - n * 2, w = 2 + Math.floor(r() * 2);
      px(g, PAL.bone, cx, y - h, 1, h); px(g, PAL.ink, cx - w - 1, y - h - 2, w * 2 + 3, 3); px(g, hot ? PAL.pink : PAL.navy, cx - w, y - h - 2, w * 2 + 1, 2); px(g, hot ? PAL.rose : PAL.cyan, cx - w + 1, y - h - 2, w, 1); } },
  bones(g, x, y, r){ px(g, PAL.ink, x - 4, y - 3, 9, 3); px(g, PAL.bone, x - 3, y - 2, 7, 1); px(g, PAL.bone, x - 4, y - 3, 1, 1); px(g, PAL.bone, x + 4, y - 3, 1, 1);
    if (r() < 0.6){ px(g, PAL.ink, x + 1, y - 6, 5, 5); px(g, PAL.bone, x + 2, y - 5, 3, 3); px(g, PAL.ink, x + 2, y - 4, 1, 1); px(g, PAL.ink, x + 4, y - 4, 1, 1); } },
  rubble(g, x, y, r){ const n = 2 + Math.floor(r() * 3);
    for (let s = 0; s < n; s++){ const w = 2 + Math.floor(r() * 3), h = 1 + Math.floor(r() * 2), cx = x + Math.floor((r() - 0.5) * 8); px(g, PAL.ink, cx - 1, y - h - 1, w + 2, h + 1); px(g, PAL.mid, cx, y - h, w, h); px(g, PAL.light, cx, y - h, w, 1); } },
  stalagmite(g, x, y, r){ const w = 3 + Math.floor(r() * 3), L = 3 + Math.floor(r() * 5);
    for (let k = 0; k < L; k++){ const half = Math.max(0, Math.round((1 - k / L) * w / 2)); px(g, PAL.ink, x - half - 1, y - k - 1, half * 2 + 3); px(g, PAL.mid, x - half, y - k - 1, half * 2 + 1); px(g, PAL.light, x - half, y - k - 1); } },
  torch(g, x, y){ px(g, PAL.ink, x - 1, y - 7, 3, 8); px(g, PAL.wood1, x, y - 6, 1, 6); px(g, PAL.mid, x - 1, y - 7, 3, 1); },
  // the back wall's ruins: a pillar, an arch
  pillar(g, x, y, r, _, k = 1){ const h = 24 + Math.floor(r() * 24), w = 7, broken = r() < 0.6;
    for (let yy = 0; yy < h; yy++){ const top = broken && yy > h - 4 ? (yy + x) % 3 : 0; px(g, PAL.ink, x - 1 + top, y - yy, w + 2 - top); px(g, PAL.dark, x + top, y - yy, w - top * 2 - 1); px(g, PAL.mid, x + top, y - yy); if (yy % 8 === 0) px(g, PAL.ink, x, y - yy, w - 1); }
    px(g, PAL.ink, x - 2, y - 2, w + 4, 3); px(g, PAL.dark, x - 1, y - 2, w + 2, 1); },
  arch(g, x, y, r){ const w = 22, h = 26;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++){
      const cx = xx - w / 2 + 0.5, inner = yy < h - 8 ? Math.abs(cx) < w / 2 - 4 : Math.hypot(cx, (yy - (h - 8)) * 1.1) < w / 2 - 4, outer = yy < h - 8 ? true : Math.hypot(cx, (yy - (h - 8)) * 1.1) < w / 2;
      if (!outer || inner) continue; const edge = (yy < h - 8 && (Math.abs(cx) > w / 2 - 1 || Math.abs(cx) < w / 2 - 3)) || (yy >= h - 8 && Math.hypot(cx, (yy - (h - 8)) * 1.1) > w / 2 - 1);
      px(g, edge ? PAL.ink : (xx + yy) % 7 === 0 ? PAL.ink : PAL.dark, x - w / 2 + xx, y - yy); }
    if (r() < 0.6) for (let k = 0; k < 6; k++) px(g, PAL.ink, x + w / 2 - 3 - k, y - h + k, 3 + k, 1); },
};

// the Cloister's and the Spires' own things
Object.assign(DECO, {
  icicle(g, x, y, r){ const L = 4 + Math.floor(r() * 9);
    for (let k = 0; k < L; k++){ const half = k < L * 0.4 ? 1 : 0; px(g, PAL.dark, x - half - 1, y + k, half * 2 + 3); px(g, k < 2 ? PAL.white : k > L - 3 ? PAL.cyan : PAL.pale, x - half, y + k, half * 2 + 1); } },
  drift(g, x, y, r){ const w = 6 + Math.floor(r() * 9);
    for (let k = 0; k < 3; k++){ const half = Math.round(w / 2 * (1 - k / 3.2)); px(g, PAL.white, x - half, y - 1 - k, half * 2 + 1); } px(g, PAL.pale, x - Math.round(w / 2) + 1, y - 1, 3, 1); px(g, PAL.pale, x + 1, y - 2, 2, 1); },
  cairn(g, x, y, r){ let yy = y; for (const w of [7, 5, 4, 2]){ const h = w > 4 ? 3 : 2, x0 = x - Math.floor(w / 2) + (w === 5 ? 1 : 0); px(g, PAL.ink, x0 - 1, yy - h - 1, w + 2, h + 1); px(g, PAL.mid, x0, yy - h, w, h); px(g, PAL.light, x0, yy - h, w, 1); yy -= h; } px(g, PAL.white, x - 1, yy - 1, 3, 1); },
  flags(g, x, y, r){ const h = 16 + Math.floor(r() * 6), dir = r() < 0.5 ? -1 : 1, cols = [PAL.red1, PAL.fire3, PAL.moss2, PAL.blue, PAL.white];
    px(g, PAL.ink, x - 1, y - h - 1, 3, h + 1); px(g, PAL.wood2, x, y - h, 1, h);
    for (let k = 0; k < 6; k++){ const fx = x + dir * (2 + k * 4), fy = y - h + Math.round(k * 0.9 + Math.sin(k) * 0.6); px(g, PAL.ink, fx, fy, dir * 4 || 1, 1); px(g, cols[k % 5], dir > 0 ? fx : fx - 2, fy + 1, 3, 3); px(g, PAL.ink, dir > 0 ? fx : fx - 2, fy + 4, 1, 1); } },
  deadtree(g, x, y, r){ const branch = (bx, by, L, dir) => { let cx = bx; for (let k = 0; k < L; k++){ if (r() < 0.4) cx += dir; px(g, PAL.ink, cx - 1, by - k, 3, 1); px(g, PAL.wood1, cx, by - k); if (k === Math.floor(L / 2) && L > 5) branch(cx, by - k, Math.floor(L / 2), -dir); } px(g, PAL.white, cx, by - L, 1, 1); };
    branch(x, y, 9 + Math.floor(r() * 8), r() < 0.5 ? -1 : 1); },
  tuft(g, x, y, r){ for (let k = -2; k <= 2; k++){ const h = 1 + Math.floor(r() * 3); px(g, k % 2 ? PAL.pale : PAL.light, x + k, y - h, 1, h); } },
  candles(g, x, y, r, glow){ const n = 2 + Math.floor(r() * 3);
    px(g, PAL.ink, x - n - 1, y - 1, n * 2 + 3, 1);
    for (let s = 0; s < n; s++){ const h = 2 + Math.floor(r() * 4), cx = x - n + 1 + s * 2; px(g, PAL.bone, cx, y - h, 1, h); px(g, PAL.fire3, cx, y - h - 1, 1, 1); px(g, PAL.fire1, cx, y - h - 2, 1, 1); }
    glow && glow(x, y - 5, 'lamp'); },
  urn(g, x, y, r){ const tall = r() < 0.5 ? 8 : 6; for (let k = 0; k < tall; k++){ const half = k === 0 || k > tall - 3 ? 1 : 2; px(g, PAL.ink, x - half - 1, y - 1 - k, half * 2 + 3); px(g, k === Math.floor(tall / 2) ? PAL.fire2 : PAL.rust, x - half, y - 1 - k, half * 2 + 1); px(g, PAL.wood3, x - half, y - 1 - k); } },
  statue(g, x, y, r){ px(g, PAL.ink, x - 5, y - 4, 11, 4); px(g, PAL.dark, x - 4, y - 3, 9, 3); px(g, PAL.light, x - 4, y - 3, 9, 1);
    for (let k = 0; k < 13; k++){ const half = k < 9 ? 2 + (k < 3 ? 1 : 0) : 1; px(g, PAL.ink, x - half - 1, y - 5 - k, half * 2 + 3); px(g, PAL.mid, x - half, y - 5 - k, half * 2 + 1); px(g, PAL.light, x - half, y - 5 - k); if (k > 9) px(g, PAL.dark, x, y - 5 - k); }
    px(g, PAL.ink, x - 2, y - 18, 5, 1); },
  chandelier(g, x, y, r, glow){ const L = 5 + Math.floor(r() * 8); for (let k = 0; k < L; k++) px(g, k % 2 ? PAL.mid : PAL.light, x, y + k);
    px(g, PAL.ink, x - 7, y + L, 15, 3); px(g, PAL.wood2, x - 6, y + L + 1, 13, 1);
    for (const o of [-5, 0, 5]){ px(g, PAL.bone, x + o, y + L - 2, 1, 2); px(g, PAL.fire3, x + o, y + L - 3, 1, 1); }
    glow && glow(x, y + L - 1, 'lamp'); },
  books(g, x, y, r){ const cols = [PAL.red0, PAL.navy, PAL.moss0, PAL.plum]; let yy = y; const n = 2 + Math.floor(r() * 3);
    for (let s = 0; s < n; s++){ const w = 5 + Math.floor(r() * 3), x0 = x - 3 + Math.floor(r() * 3); px(g, PAL.ink, x0 - 1, yy - 3, w + 2, 3); px(g, cols[Math.floor(r() * 4)], x0, yy - 2, w, 2); px(g, PAL.bone, x0 + w - 1, yy - 2, 1, 2); yy -= 2; } },
  // the belfry's bell, hung from its beam: (x, y) is the middle of the beam
  bell(g, x, y){ px(g, PAL.ink, x - 20, y - 2, 41, 6); px(g, PAL.wood1, x - 19, y - 1, 39, 4); px(g, PAL.wood3, x - 19, y - 1, 39, 1); px(g, PAL.ink, x - 2, y + 4, 5, 4); px(g, PAL.mid, x - 1, y + 4, 3, 4);
    for (let k = 0; k < 30; k++){ const half = Math.round(k < 6 ? 5 + k : k < 24 ? 11 + (k - 6) * 0.12 : 13 + (k - 24) * 1.1); px(g, PAL.ink, x - half - 1, y + 8 + k, half * 2 + 3); px(g, k > 25 ? PAL.rust : PAL.fire2, x - half, y + 8 + k, half * 2 + 1); px(g, PAL.fire3, x - half + 2, y + 8 + k, 2, 1); px(g, PAL.rust, x + half - 4, y + 8 + k, 5, 1); if (k === 8 || k === 22) px(g, PAL.wood2, x - half, y + 8 + k, half * 2 + 1); }
    px(g, PAL.ink, x - 20, y + 38, 41, 1); px(g, PAL.ink, x - 2, y + 39, 5, 5); px(g, PAL.wood1, x - 1, y + 39, 3, 4); },
  // a case of books against the back wall
  shelf(g, x, y, r){ const w = 20, h = 26, cols = [PAL.red0, PAL.navy, PAL.moss0, PAL.plum, PAL.wood2, PAL.bone];
    px(g, PAL.ink, x, y - h, w, h); px(g, PAL.wood1, x + 1, y - h + 1, w - 2, h - 1);
    for (let s = 0; s < 3; s++){ const sy = y - h + 2 + s * 8; px(g, PAL.ink, x + 2, sy, w - 4, 6); for (let bx = x + 2; bx < x + w - 2; bx++) if (r() < 0.8) px(g, cols[Math.floor(r() * cols.length)], bx, sy + (r() < 0.3 ? 1 : 0), 1, 6); } },
});
// a region's look. stone: the play rock's colours from its edge in (lipD / lip2D: how deep the lit cap goes; topEdge:
// the outline on what faces up, where it is not ink). ceil / floor: what hangs and stands, [name, weight]. back: the
// wall behind. far: the painting. air: the motes
export const THEMES = {
  roots: {
    stone: { edge: 'ink', lip: 'pale', lip2: 'light', lipD: 2, lip2D: 2, a: 'mid', aSeam: 'dark', b: 'dark', bSeam: 'deep', c: 'deep', core: 'ink', seam: 'rough' },
    moss: { c: ['moss1', 'moss2', 'moss0'], p: 0.3 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['pale', 'white'],
    ceilLow: [['stalactite', 7], ['vine', 3]], ceil: [['vine', 28], ['root', 22], ['chain', 12], ['banner', 8], ['lantern', 8], ['stalactite', 22]],
    floorWall: ['rubble', 'stalagmite', 'crystal', 'bones', 'mushroom'], floorOpen: ['mushroom', 'rubble', 'crystal', 'bones'], gem: 'crystal',
    back: { cols: ['ink', 'deep', 'dark'], dim: [0.7, 0.72, 0.85], hole: 4.6, holeOpen: 4.6, stand: [['pillar', 6], ['arch', 4]], hang: [['root', 40], ['chain', 35], ['stalactite', 25]], pStand: 0.02, pHang: 0.02 },
    far: { img: 'far', dim: 0.85 }, hemi: [0xffffff, 0x9aa6d0, 0.95], shaft: 'rgba(170,230,255,0.55)',
    amb: [0.5, 0.56, 0.74], mist: { col: 'navy', col2: 'dark', a: 0.3, drift: 0.25 }, fore: 'roots',
    air: { n: 70, cols: [0xffd8a0, 0x9fe8ff], warm: 0.3, vx: 0.2, vy: [0.05, 0.2] },
  },
  cloister: {
    stone: { edge: 'ink', lip: 'wood3', lip2: 'tan', lipD: 2, lip2D: 3, a: 'wood1', aSeam: 'wood0', b: 'wood0', bSeam: 'ink', c: 'wood0', core: 'ink', seam: 'brick' },
    moss: { c: ['moss0', 'moss1', 'moss0'], p: 0.07 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
    ceilLow: [['chain', 4], ['stalactite', 2], ['banner', 3]], ceil: [['chain', 20], ['banner', 26], ['lantern', 14], ['chandelier', 22], ['vine', 8], ['stalactite', 10]],
    floorWall: ['rubble', 'urn', 'candles', 'bones', 'statue', 'books'], floorOpen: ['candles', 'rubble', 'books', 'urn'], gem: 'candles',
    back: { cols: ['ink', 'wood0', 'wood1'], dim: [0.82, 0.8, 0.8], hole: 3.4, holeOpen: 3.4, windows: true, stand: [['pillar', 1]], hang: [['chain', 1]], pStand: 0, pHang: 0, wall: [['banner', 5], ['shelf', 4], ['chain', 3]], pWall: 0.0016, brick: true },
    far: { img: 'cloister', dim: 0.9 }, hemi: [0xffeeda, 0xb89478, 0.98], shaft: 'rgba(255,214,150,0.5)',
    amb: [0.62, 0.5, 0.48], mist: { col: 'wood1', col2: 'wood0', a: 0.3, drift: 0.12 }, fore: 'cloister',
    air: { n: 60, cols: [0xffb060, 0xffe0a0], warm: 0.5, vx: 0.15, vy: [0.12, 0.4] },
  },
  spires: {
    stone: { edge: 'ink', topEdge: 'white', lip: 'white', lip2: 'pale', lipD: 4, lip2D: 5, a: 'light', aSeam: 'mid', b: 'mid', bSeam: 'dark', c: 'dark', core: 'deep', seam: 'strata', band: [10, 14, 18] },
    moss: { c: ['white', 'white', 'pale'], p: 0.22 }, plank: ['wood1', 'white', 'wood0', 'wood2'], spike: ['cyan', 'white'],
    ceilLow: [['icicle', 8], ['stalactite', 2]], ceil: [['icicle', 60], ['stalactite', 14], ['chain', 8], ['root', 10], ['lantern', 8]],
    floorWall: ['drift', 'cairn', 'rubble', 'crystal', 'tuft', 'deadtree'], floorOpen: ['drift', 'tuft', 'flags', 'cairn', 'drift'], gem: 'crystal',
    back: { cols: ['deep', 'dark', 'mid'], dim: [0.9, 0.92, 1], hole: 4.6, holeOpen: 2.2, stand: [['pillar', 5], ['arch', 3], ['deadtree', 4]], hang: [['icicle', 70], ['stalactite', 30]], pStand: 0.012, pHang: 0.03 },
    far: { img: 'spires', raw: true }, hemi: [0xffffff, 0xc4d4f4, 1.02], shaft: null, bloom: [0.93, 0.35],   // the sky as it was painted: the palette has no pale blue for it
    amb: [0.96, 0.97, 1.02], ambIn: [0.56, 0.62, 0.8], mist: { col: 'white', col2: 'pale', a: 0.28, drift: 0.9 }, fore: 'spires',
    air: { n: 120, cols: [0xffffff, 0xdfe8ff], warm: 0.5, vx: 0.5, vy: [-1.3, -0.5], drift: -0.6, steady: true },
  },
};
// a region's file can bring its own look (themeDef) and its own decoration (deco: (px, PAL) => { name(g, x, y, r, glow){} })
for (const R of REGION_DATA){ if (R.themeDef) THEMES[R.theme] = R.themeDef; if (R.deco) Object.assign(DECO, R.deco(px, PAL)); }
export const pickOf = (list, p) => { let tot = 0; for (const [, w] of list) tot += w; let a = p * tot; for (const [n, w] of list){ if ((a -= w) < 0) return n; } return list[list.length - 1][0]; };
export const SEAMS = {
  rough: (x, y) => { const row = Math.floor(y / 6); if (y % 6 === 0) return true; const off = (row * 37) % 11, bx = x + off; const len = 8 + ((Math.floor(bx / 9) * 7 + row * 3) % 5); return bx % len === 0; },
  brick: (x, y) => { const row = Math.floor(y / 8); return y % 8 === 0 || (x + (row % 2) * 9) % 18 === 0; },   // even courses of big bricks
  strata: (x, y) => { const s = y + (x >> 2), row = Math.floor(s / 7); return s % 7 === 0 || (x + row * 23) % (17 + row % 3 * 4) === 0; },   // tilted beds, cracked across
};

// ---- the play layer
export function paintPlay(glows, TM){
  const Wc = LEVEL.W, Hc = LEVEL.H, pw = Wc * CELL, ph = Hc * CELL, rock = LEVEL.sky ? (i, j) => (j >= Hc ? 0 : paintAt(Math.max(0, Math.min(Wc - 1, i)), j) === ROCK ? 1 : 0) : (i, j) => (paintAt(i, j) === ROCK ? 1 : 0);   // under a sky, nothing over the top of the map
  const n1 = noise2(11), n2 = noise2(23);
  const crisp = new Uint8Array(Wc * Hc);   // edges that stay true: the top of anything he stands on, and the air over it
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++){ const t = paintAt(i, j), up = paintAt(i, j + 1), dn = paintAt(i, j - 1); if ((t === ROCK && up !== ROCK) || (t !== ROCK && dn === ROCK)) crisp[j * Wc + i] = 1; }
  // the shape: cell corners cut (bilinear between centres), edges worn by noise except where he stands
  const mask = new Uint8Array(pw * ph);
  for (let py = 0; py < ph; py++){
    const wy = (ph - py - 0.5) / CELL - 0.5, j0 = Math.floor(wy), ty = wy - j0, cj = Math.floor((ph - py - 0.5) / CELL);
    for (let x = 0; x < pw; x++){
      const wx = (x + 0.5) / CELL - 0.5, i0 = Math.floor(wx), tx = wx - i0;
      const a = rock(i0, j0), b = rock(i0 + 1, j0), c = rock(i0, j0 + 1), d = rock(i0 + 1, j0 + 1), s = a + b + c + d;
      let v = s === 4 ? 1 : s === 0 ? 0 : (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
      if (s % 4 && !crisp[cj * Wc + Math.floor((x + 0.5) / CELL)]) v += (n1(x / 5, py / 5) - 0.5) * 0.55;
      mask[py * pw + x] = v >= 0.5 ? 1 : 0;
    }
  }
  const dist = new Uint16Array(pw * ph);
  for (let k = 0; k < dist.length; k++) dist[k] = mask[k] ? 999 : 0;
  for (let py = 0; py < ph; py++) for (let x = 0; x < pw; x++){ const k = py * pw + x; if (!dist[k]) continue; let m = dist[k];
    if (x > 0) m = Math.min(m, dist[k - 1] + 1); if (py > 0){ m = Math.min(m, dist[k - pw] + 1); if (x > 0) m = Math.min(m, dist[k - pw - 1] + 1); if (x < pw - 1) m = Math.min(m, dist[k - pw + 1] + 1); } dist[k] = m; }
  for (let py = ph - 1; py >= 0; py--) for (let x = pw - 1; x >= 0; x--){ const k = py * pw + x; if (!dist[k]) continue; let m = dist[k];
    if (x < pw - 1) m = Math.min(m, dist[k + 1] + 1); if (py < ph - 1){ m = Math.min(m, dist[k + pw] + 1); if (x < pw - 1) m = Math.min(m, dist[k + pw + 1] + 1); if (x > 0) m = Math.min(m, dist[k + pw - 1] + 1); } dist[k] = m; }
  // big chunky stones in the edge band: rows of blocks of uneven length, a seam between
  const cnv = newCanvas(pw, ph); const g = cnv.getContext('2d', { willReadFrequently: true });
  const ncnv = newCanvas(pw, ph); const nout = ncnv.getContext('2d', { willReadFrequently: true }).createImageData(pw, ph), no = nout.data;
  for (let k = 0; k < pw * ph; k++){ no[k * 4] = 128; no[k * 4 + 1] = 128; no[k * 4 + 2] = 255; no[k * 4 + 3] = 255; }
  const out = g.createImageData(pw, ph), o = out.data, C = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, rgb(v)]));
  const ST = TM.stone, S = Object.fromEntries(Object.entries(ST).map(([k, v]) => [k, C[v]])), seam = SEAMS[ST.seam], BD = ST.band || [6, 9, 12];
  for (let py = 0; py < ph; py++) for (let x = 0; x < pw; x++){
    const k = py * pw + x, d = dist[k]; if (!d) continue;
    let up = 0; for (let u = 1; u <= ST.lip2D; u++) if (py >= u && !mask[k - pw * u]){ up = u; break; }   // how far under a face that looks up
    const dd = d + (B4[(py & 3) * 4 + (x & 3)] / 16 - 0.5) * 3;
    let c;
    if (d === 1) c = up === 1 && S.topEdge ? S.topEdge : S.edge;
    else if (up && up <= ST.lipD) c = S.lip;
    else if (up) c = S.lip2;
    else if (dd < BD[0]) c = seam(x, py) ? S.aSeam : S.a;
    else if (dd < BD[1]) c = seam(x, py) ? S.bSeam : S.b;
    else if (dd < BD[2]) c = S.c;
    else c = S.core;
    o[k * 4] = c[0]; o[k * 4 + 1] = c[1]; o[k * 4 + 2] = c[2]; o[k * 4 + 3] = 255;
    // which way it faces: out from the rock near its edge (more so the nearer), and on the faces of its blocks, away from
    // the block's middle at its seams. World up is the canvas's down
    let nx = 0, ny = 0;
    if (d < 7){ const gx = (x < pw - 1 ? dist[k + 1] : d) - (x > 0 ? dist[k - 1] : d), gy = (py < ph - 1 ? dist[k + pw] : d) - (py > 0 ? dist[k - pw] : d), gl = Math.hypot(gx, gy);
      if (gl > 0){ const t = 0.9 * Math.max(0, 1 - (d - 1) / 6); nx = -gx / gl * t; ny = gy / gl * t; } }
    if (d >= 2 && dd < BD[1] && !up){
      if (seam(x, py - 1) && !seam(x, py)) ny += 0.45; else if (seam(x, py + 1) && !seam(x, py)) ny -= 0.3;
      if (seam(x - 1, py) && !seam(x, py)) nx -= 0.35; else if (seam(x + 1, py) && !seam(x, py)) nx += 0.35;
    }
    const nl = Math.hypot(nx, ny); if (nl > 0.92){ nx *= 0.92 / nl; ny *= 0.92 / nl; }
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    no[k * 4] = (nx + 1) * 127.5; no[k * 4 + 1] = (ny + 1) * 127.5; no[k * 4 + 2] = (nz + 1) * 127.5; no[k * 4 + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  ncnv.getContext('2d', { willReadFrequently: true }).putImageData(nout, 0, 0); cnv.normals = ncnv;
  const r = rng(99), Y = j => (Hc - j) * CELL;
  // moss on the lips: clumps, and a drip now and then down the face
  for (let py = 1; py < ph - 6; py++) for (let x = 2; x < pw - 6; x++){
    const k = py * pw + x; if (!mask[k] || mask[k - pw] || n2(x / 6, py / 6) < 0.58 || r() > TM.moss.p) continue;
    const w = 2 + Math.floor(r() * 3); px(g, PAL[TM.moss.c[0]], x, py, w, 1); px(g, PAL[TM.moss.c[1]], x + Math.floor(w / 2), py - 1, 1, 1);
    if (r() < 0.2) px(g, PAL[TM.moss.c[2]], x + 1, py + 1, 1, 1 + Math.floor(r() * 3));
  }
  // ledges: planks
  for (let j = 0; j < Hc; j++){
    let i = 0;
    while (i < Wc){
      if (paintAt(i, j) !== LEDGE){ i++; continue; }
      let e = i; while (paintAt(e + 1, j) === LEDGE) e++;
      const x0 = i * CELL, x1 = (e + 1) * CELL, y0 = Y(j + 1);
      const PK = TM.plank.map(k => PAL[k]);
      px(g, PAL.ink, x0 - 1, y0 - 1, x1 - x0 + 2, 5); px(g, PK[0], x0, y0, x1 - x0, 3); px(g, PK[1], x0, y0, x1 - x0, 1); px(g, PK[2], x0, y0 + 2, x1 - x0, 1);
      for (let x = x0 + 4 + Math.floor(r() * 4); x < x1 - 2; x += 6 + Math.floor(r() * 5)) px(g, PK[2], x, y0 + 1, 1, 1);
      for (const [x, dir] of [[x0, -1], [x1 - 1, 1]]){
        if (paintAt(dir < 0 ? i - 1 : e + 1, j) === ROCK) for (let k = 0; k < 4; k++) px(g, PAL.wood0, x - dir * k, y0 + 3 + k);
        else if (r() < 0.5) px(g, PAL.wood2, x - dir, y0 + 3, 1, 3 + Math.floor(r() * 5));
      }
      i = e + 1;
    }
  }
  // spikes
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (paintAt(i, j) === SPIKES){
    const x0 = i * CELL, yb = Y(j);
    for (let s = 0; s < 2; s++){ const cx = x0 + 2 + s * 4, h = 5 + s;
      for (let y = 0; y < h; y++){ const half = Math.round((h - y) / h * 1.5); px(g, PAL.ink, cx - half - 1, yb - y - 1, half * 2 + 3); px(g, y > h - 2 ? PAL[TM.spike[1]] : PAL[TM.spike[0]], cx - half, yb - y - 1, half * 2 + 1); } }
  }
  // decoration, by where it sits
  const isRock = (i, j) => paintAt(i, j) === ROCK, isAir = (i, j) => paintAt(i, j) === EMPTY;
  const airBelow = (i, j) => { let n = 0; while (n < 20 && isAir(i, j - n)) n++; return n; };
  const walkedNear = (i, j) => { for (let d = 1; d <= 6; d++) if (isAir(i, j - d) && (isRock(i, j - d - 1) || paintAt(i, j - d - 1) === LEDGE)) return true; return false; };
  const marksNear = (i, j, rr) => LEVEL.marks.some(m => Math.abs(m.x - i) <= rr && Math.abs(m.y - j) <= rr);
  for (let j = 1; j < Hc - 1; j++){
    let skip = 0;
    for (let i = 1; i < Wc - 1; i++){
      if (skip > 0){ skip--; continue; }
      if (!(isAir(i, j) && isRock(i, j + 1) && isRock(i - 1, j + 1) && isRock(i + 1, j + 1) && isAir(i - 1, j) && isAir(i + 1, j))) continue;
      const room = airBelow(i, j), busy = walkedNear(i, j) || room < 9, x = i * CELL + 4, y = Y(j + 1) - 1;
      if (r() > (busy ? 0.3 : 0.6)) continue;
      const p = r();
      DECO[pickOf(busy || room < 7 ? TM.ceilLow : TM.ceil, p)](g, x, y, r, glows);
      skip = 1 + Math.floor(r() * 4);
    }
  }
  for (let j = 1; j < Hc - 1; j++){
    let skip = 0;
    for (let i = 1; i < Wc - 1; i++){
      if (skip > 0){ skip--; continue; }
      if (!(isAir(i, j) && isRock(i, j - 1) && isRock(i - 1, j - 1) && isRock(i + 1, j - 1) && isAir(i, j + 1)) || marksNear(i, j, 2)) continue;
      const nearWall = isRock(i - 2, j) || isRock(i + 2, j) || isRock(i - 1, j + 1) || isRock(i + 1, j + 1);
      if (r() > (nearWall ? 0.55 : 0.18)) continue;
      const set = nearWall ? TM.floorWall : TM.floorOpen;
      DECO[set[Math.floor(r() * set.length)]](g, i * CELL + 4, Y(j), r, glows);
      skip = 2 + Math.floor(r() * 5);
    }
  }
  return cnv;
}

// ---- the back wall, in its own space: what is behind world point w is drawn at FB * w
export const FB = 0.86, MARGIN_X = 15, MARGIN_Y = 7;
export function paintBack(TM){
  const Lw = LEVEL.W * T, Lh = LEVEL.H * T, bw = Math.ceil((FB * Lw + MARGIN_X * 2) * PPU), bh = Math.ceil((FB * Lh + MARGIN_Y * 2) * PPU);
  const Wc = LEVEL.W, Hc = LEVEL.H;
  const open = new Float32Array(Wc * Hc).fill(99);   // tiles to the nearest rock
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (paintAt(i, j) === ROCK) open[j * Wc + i] = 0;
  for (let pass = 0; pass < 2; pass++) for (let s = 0; s < Wc * Hc; s++){
    const k = pass ? Wc * Hc - 1 - s : s, i = k % Wc, j = (k - i) / Wc, sg = pass ? 1 : -1;
    for (const [a, b] of [[sg, 0], [0, sg], [sg, sg], [-sg, sg]]){ const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < Wc && jj < Hc) open[k] = Math.min(open[k], open[jj * Wc + ii] + (a && b ? 1.41 : 1)); }
  }
  const openAt = (wx, wy) => { const i = Math.floor(wx / T), j = Math.floor(wy / T); if (LEVEL.sky && j >= Hc) return 99; if (i < 0 || j < 0 || i >= Wc || j >= Hc) return 0; return open[j * Wc + i]; };   // over the top of a region under the sky: sky
  const n1 = noise2(51), n2 = noise2(77), n3 = noise2(91);
  const BK = TM.back, skyT = new Uint8Array(Wc * Hc);   // tiles out under the sky: the wall behind is only a fringe of rock there
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++){ const rm = LEVEL.rooms.find(q => i >= q.tx0 && i < q.tx1 && j >= q.ty0 && j < q.ty1); skyT[j * Wc + i] = rm ? (rm.open ? 1 : 0) : (LEVEL.sky ? 1 : 0); }
  const skyAt = (wx, wy) => { const i = Math.floor(wx / T), j = Math.floor(wy / T); return i < 0 || j < 0 || i >= Wc ? 0 : j >= Hc ? (LEVEL.sky ? 1 : 0) : skyT[j * Wc + i]; };
  const cnv = newCanvas(bw, bh); const g = cnv.getContext('2d', { willReadFrequently: true });
  const out = g.createImageData(bw, bh), o = out.data, hole = new Uint8Array(bw * bh), ink = rgb(PAL[BK.cols[0]]), deep = rgb(PAL[BK.cols[1]]), dark = rgb(PAL[BK.cols[2]]);
  for (let py = 0; py < bh; py++) for (let x = 0; x < bw; x++){
    const wx = (x / PPU - MARGIN_X) / FB, wy = ((bh - py) / PPU - MARGIN_Y) / FB;
    const v = openAt(wx, wy) + (n1(x / 20, py / 20) - 0.5) * 5 + (n2(x / 5, py / 5) - 0.5) * 1.2;
    let rim = false;
    if (BK.windows){
      // a wall of tall arched windows, wherever there is room behind for one
      const lx = x % 56, ly = (bh - py) % 84, arch = (rad) => ly < 52 ? Math.abs(lx - 27.5) < rad : Math.hypot(lx - 27.5, ly - 52) < rad;
      const inWin = ly >= 14 && arch(11), inRim = ly >= 12 && arch(13);
      if (v > BK.hole && inWin && lx !== 27 && lx !== 28 && ly !== 40){ hole[py * bw + x] = 1; continue; }
      rim = v > BK.hole && inRim && !inWin;
    }
    else if (v > (skyAt(wx, wy) ? BK.holeOpen : BK.hole)){ hole[py * bw + x] = 1; continue; }
    // cracked cave stone: the contour lines of a noise field are the cracks between stones
    const cn = n3(x / 15, py / 11), isSeam = BK.brick ? (py % 10 === 0 || (x + (Math.floor(py / 10) % 2) * 13) % 26 === 0) : Math.abs(cn - 0.5) < 0.022;
    const tone = n1(x / 70 + 9, py / 70) + (B4[(py & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.12;   // broad patches, dithered
    const c = rim ? dark : !BK.windows && v > (skyAt(wx, wy) ? BK.holeOpen : BK.hole) - 0.6 ? (B4[(py & 3) * 4 + (x & 3)] < 8 ? dark : deep) : isSeam ? ink : tone > 0.62 ? dark : tone < 0.3 ? ink : deep;
    const q = (py * bw + x) * 4; o[q] = c[0]; o[q + 1] = c[1]; o[q + 2] = c[2]; o[q + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const r = rng(321);
  for (let py = 6; py < bh - 6; py += 2) for (let x = 0; x < bw; x += 2){
    const k = py * bw + x;
    if (hole[k] && !hole[k + bw * 2] && r() < BK.pStand) DECO[pickOf(BK.stand, r())](g, x, py + 2, r);
    if (hole[k] && !hole[k - bw * 2] && r() < BK.pHang){ const p = r(); g.globalAlpha = 1; DECO[pickOf(BK.hang, p)](g, x, py - 1, r); }
    if (BK.wall && !hole[k] && r() < BK.pWall){ const wx = (x / PPU - MARGIN_X) / FB, wy = ((bh - py) / PPU - MARGIN_Y) / FB; if (openAt(wx, wy) > 4 && openAt(wx, wy - 2) > 2) DECO[pickOf(BK.wall, r())](g, x, py, r); }   // on the wall itself, where a room is in front of it
  }
  // the back is behind: everything on it pushed toward the dark
  const d2 = g.getImageData(0, 0, bw, bh), p2 = d2.data, cache = new Map();
  for (let i = 0; i < p2.length; i += 4){ if (!p2[i + 3]) continue; const key = (p2[i] << 16) | (p2[i + 1] << 8) | p2[i + 2]; let q = cache.get(key); if (!q){ q = nearest(p2[i] * BK.dim[0], p2[i + 1] * BK.dim[1], p2[i + 2] * BK.dim[2]); cache.set(key, q); } p2[i] = q[0]; p2[i + 1] = q[1]; p2[i + 2] = q[2]; }
  g.putImageData(d2, 0, 0);
  return { cnv, bw, bh };
}

// one painting laid into another over some rectangles, its edge broken up: solid `band` pixels in from a rectangle's
// edge, dithered and ragged before that (a room that wears another region's look: its stone gives way to this one's)
export function blend(dst, src, rects, band, extra){
  const g = dst.getContext('2d', { willReadFrequently: true }), sg = src.getContext('2d', { willReadFrequently: true }), n = noise2(7), eg = extra ? extra[0].getContext('2d', { willReadFrequently: true }) : null, es = extra ? extra[1].getContext('2d', { willReadFrequently: true }) : null;
  for (let [x0, y0, x1, y1] of rects){
    x0 = Math.max(0, Math.round(x0)); y0 = Math.max(0, Math.round(y0)); x1 = Math.min(dst.width, Math.round(x1)); y1 = Math.min(dst.height, Math.round(y1)); const w = x1 - x0, h = y1 - y0; if (w < 2 || h < 2) continue;
    const a = g.getImageData(x0, y0, w, h), b = sg.getImageData(x0, y0, w, h), ea = eg ? eg.getImageData(x0, y0, w, h) : null, eb = es ? es.getImageData(x0, y0, w, h) : null;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const d = Math.min(x, y, w - 1 - x, h - 1 - y), k = d / band + (n((x0 + x) / 26, (y0 + y) / 26) - 0.5) * 1.1 - 0.15;
      if (k < 1 && B4[((y0 + y) & 3) * 4 + ((x0 + x) & 3)] / 16 >= k) continue;
      const q = (y * w + x) * 4; a.data[q] = b.data[q]; a.data[q + 1] = b.data[q + 1]; a.data[q + 2] = b.data[q + 2]; a.data[q + 3] = b.data[q + 3];
      if (ea){ ea.data[q] = eb.data[q]; ea.data[q + 1] = eb.data[q + 1]; ea.data[q + 2] = eb.data[q + 2]; ea.data[q + 3] = eb.data[q + 3]; }
    }
    g.putImageData(a, x0, y0); if (eg) eg.putImageData(ea, x0, y0);
  }
}

// ---- a whole region's painting: the back wall and the play rock (with the looks of the region below and above where
// rooms wear them), and what the marks draw into the rock (torches, crystals, the belfry's bell, the shrine). `own`:
// build the region first (a worker has none of its own); else it is the region already loaded here
export function paintRegion(n, own = true){
  if (own) loadLevel(n);
  const TM = THEMES[LEVEL.theme] || THEMES.roots;
  const ALT = [...new Set(LEVEL.rooms.map(r => r.look).filter(l => l && THEMES[l] && THEMES[l] !== TM))];
  const lookAt = (wx, wy) => { const r = LEVEL.rooms.find(q => wx >= q.x0 && wx < q.x1 && wy >= q.y0 && wy < q.y1); return r && r.look && ALT.includes(r.look) ? r.look : null; };
  const pxLook = (x, y) => lookAt(x / PPU, (LEVEL.H * CELL - y) / PPU), glows = [], glow = (x, y, kind) => glows.push({ x, y, kind });
  const back = paintBack(TM);
  for (const l of ALT) blend(back.cnv, paintBack(THEMES[l]).cnv, LEVEL.rooms.filter(r => r.look === l).map(r => [(r.x0 * FB + MARGIN_X) * PPU, back.bh - (r.y1 * FB + MARGIN_Y) * PPU, (r.x1 * FB + MARGIN_X) * PPU, back.bh - (r.y0 * FB + MARGIN_Y) * PPU]), 44);
  const play = paintPlay((x, y, kind) => { if (!pxLook(x, y)) glow(x, y, kind); }, TM), g = play.getContext('2d', { willReadFrequently: true }), Y = j => (LEVEL.H - j) * CELL, rr = rng(5);
  for (const l of ALT){ const alt = paintPlay((x, y, kind) => { if (pxLook(x, y) === l) glow(x, y, kind); }, THEMES[l]);
    blend(play, alt, LEVEL.rooms.filter(r => r.look === l).map(r => [r.tx0 * CELL, (LEVEL.H - r.ty1) * CELL, r.tx1 * CELL, (LEVEL.H - r.ty0) * CELL]), 52, play.normals && alt.normals ? [play.normals, alt.normals] : null); }
  for (const m of LEVEL.marks){
    const x = (m.x + 0.5) * T, y = m.y * T, cx = Math.round(x * PPU);
    if (m.type === 'torch') DECO.torch(g, cx, Y(m.y) - 2);
    if (m.type === 'crystal') DECO[(THEMES[lookAt(x, y + 0.2)] || TM).gem](g, cx, Y(m.y), rr, glow);
    if (m.type === 'bell') DECO.bell(g, cx, Y(m.y));
    if (m.type === 'shrine'){ const b = Y(m.y);
      px(g, PAL.ink, cx - 8, b - 6, 17, 6); px(g, PAL.dark, cx - 7, b - 5, 15, 5); px(g, PAL.light, cx - 7, b - 5, 15, 1);
      for (let k = 0; k < 12; k++){ const half = Math.round(Math.sin(Math.PI * k / 12) * 3); px(g, PAL.ink, cx - half - 1, b - 6 - k, half * 2 + 3); px(g, k > 7 ? PAL.fire3 : PAL.fire2, cx - half, b - 6 - k, half * 2 + 1); } }
  }
  return { n, back: back.cnv, bh: back.bh, play, normals: play.normals || null, glows };
}
