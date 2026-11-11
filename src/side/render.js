// The side view, drawn flat: a stylized 2D pixel world on one palette (assets/side/palette.json, Endesga 32).
// Everything renders into a small target, 180 pixels tall at 16 pixels to a world unit, scaled up to the screen whole and
// unsmoothed, so the warrior, the creatures, the rock and the background share one big pixel. Depth is parallax only.
//
// The level is painted once, at load, by hand-made rules, not textures, in the palette's colours:
//   play   the rock as a base shape (the tile map with its corners cut and its edges worn: no boxes), a band of big
//          chunky stones at the edge with a lit lip on what faces up and moss on it, then dithered steps into a dark
//          silhouette, so solid ground always reads as solid. On it, decoration fitted to where it sits: stalactites,
//          vines, roots, chains, banners and lanterns from ceilings; crystals, mushrooms, bones and rubble on floors.
//          Sparse where he walks, thick where he cannot go. Ledges are planks, spikes are teeth.
//   back   the cave wall behind, darker and slower, big blocks, opening onto the far cavern, with ruined pillars and
//          arches and things hanging.
//   far    the painted cavern, held to the palette, nearly still.
// Each region has its own look (THEMES): the Roots' blue caves, the Cloister's warm brick and candles, the Spires' pale
// rock and snow under an open sky; the colours, the stonework, what hangs and stands, the back wall, the weather.
// Torches, crystals, lanterns and the shrine glow; bloom makes bright things shine.
import { T, ROCK, LEDGE, SPIKES, EMPTY, LEVEL, tileAt } from './level.js';
const THREE = window.THREE;
export const PPU = 16;                  // pixels to a world unit: a tile is 8, the warrior ~28 tall
export const VIEW_H = 11.25;            // world units the screen is tall: 180 pixels
const TH = Math.round(VIEW_H * PPU), CELL = T * PPU;
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];   // ordered dither
// the palette, by what each colour is for here
export const PAL = { ink: '#181425', deep: '#262b44', dark: '#3a4466', mid: '#5a6988', light: '#8b9bb4', pale: '#c0cbdc', white: '#ffffff',
  teal: '#193c3e', moss0: '#265c42', moss1: '#3e8948', moss2: '#63c74d', navy: '#124e89', blue: '#0099db', cyan: '#2ce8f5',
  wood0: '#3e2731', wood1: '#733e39', wood2: '#b86f50', wood3: '#e4a672', bone: '#ead4aa', fire0: '#be4a2f', fire1: '#f77622', fire2: '#feae34', fire3: '#fee761',
  red0: '#a22633', red1: '#e43b44', plum: '#68386c', pink: '#b55088', rose: '#f6757a', skin: '#e8b796', tan: '#c28569', rust: '#d77643' };
const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PALETTE = ['#be4a2f', '#d77643', '#ead4aa', '#e4a672', '#b86f50', '#733e39', '#3e2731', '#a22633', '#e43b44', '#f77622', '#feae34', '#fee761', '#63c74d', '#3e8948', '#265c42', '#193c3e', '#124e89', '#0099db', '#2ce8f5', '#ffffff', '#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466', '#262b44', '#181425', '#ff0044', '#68386c', '#b55088', '#f6757a', '#e8b796', '#c28569'].map(rgb);
function nearest(r, g, b){ let best = 0, bd = 1e9; for (let k = 0; k < PALETTE.length; k++){ const p = PALETTE[k], d = (p[0] - r) ** 2 * 3 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 2; if (d < bd){ bd = d; best = k; } } return PALETTE[best]; }

function rng(seed){ let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function canvasTex(c){ const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
function glowTex(color){
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
const loadImg = url => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
function noise2(seed){
  const r = rng(seed), N = 256, v = new Float32Array(N * N); for (let k = 0; k < v.length; k++) v[k] = r();
  const g = (i, j) => v[((j & (N - 1)) * N) + (i & (N - 1))];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, w = y - j, a = u * u * (3 - 2 * u), b = w * w * (3 - 2 * w);
    return (g(i, j) * (1 - a) + g(i + 1, j) * a) * (1 - b) + (g(i, j + 1) * (1 - a) + g(i + 1, j + 1) * a) * b; };
}
// an image held to the palette (the far painting)
function onPalette(img, dim = 1, dither = 0){
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data, cache = new Map();
  if (dither){   // a soft sky: each pixel pushed by an ordered pattern before it is matched, so the bands between two colours mix
    for (let i = 0; i < p.length; i += 4){ const k = i / 4, x = k % c.width, y = (k - x) / c.width, o = (B4[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * dither, q = nearest(p[i] * dim + o, p[i + 1] * dim + o, p[i + 2] * dim + o); p[i] = q[0]; p[i + 1] = q[1]; p[i + 2] = q[2]; }
    g.putImageData(d, 0, 0); return c;
  }
  for (let i = 0; i < p.length; i += 4){ const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2]; let q = cache.get(key); if (!q){ q = nearest(p[i] * dim, p[i + 1] * dim, p[i + 2] * dim); cache.set(key, q); } p[i] = q[0]; p[i + 1] = q[1]; p[i + 2] = q[2]; }
  g.putImageData(d, 0, 0); return c;
}
// a canvas onto the scene as planes no bigger than 1024 pixels, its top-left at (x, y)
function canvasPlanes(scene, c, x, y, z, lit){
  const group = new THREE.Group(), S = 1024;
  for (let oy = 0; oy < c.height; oy += S) for (let ox = 0; ox < c.width; ox += S){
    const w = Math.min(S, c.width - ox), h = Math.min(S, c.height - oy), part = document.createElement('canvas'); part.width = w; part.height = h;
    part.getContext('2d').drawImage(c, ox, oy, w, h, 0, 0, w, h);
    const mat = lit ? new THREE.MeshLambertMaterial({ map: canvasTex(part), transparent: true, alphaTest: 0.5 }) : new THREE.MeshBasicMaterial({ map: canvasTex(part), transparent: true, alphaTest: 0.5 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w / PPU, h / PPU), mat);
    m.position.set((ox + w / 2) / PPU, -(oy + h / 2) / PPU, 0); group.add(m);
  }
  group.position.set(x, y, z); scene.add(group); return group;
}

// ---- the decoration, drawn small and bold in the palette. (x, y) is where it is fixed: the top of what hangs, the foot
// of what stands. Each returns nothing; some leave a glow to add (lanterns, crystals)
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const DECO = {
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
const THEMES = {
  roots: {
    stone: { edge: 'ink', lip: 'pale', lip2: 'light', lipD: 2, lip2D: 2, a: 'mid', aSeam: 'dark', b: 'dark', bSeam: 'deep', c: 'deep', core: 'ink', seam: 'rough' },
    moss: { c: ['moss1', 'moss2', 'moss0'], p: 0.3 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['pale', 'white'],
    ceilLow: [['stalactite', 7], ['vine', 3]], ceil: [['vine', 28], ['root', 22], ['chain', 12], ['banner', 8], ['lantern', 8], ['stalactite', 22]],
    floorWall: ['rubble', 'stalagmite', 'crystal', 'bones', 'mushroom'], floorOpen: ['mushroom', 'rubble', 'crystal', 'bones'], gem: 'crystal',
    back: { cols: ['ink', 'deep', 'dark'], dim: [0.7, 0.72, 0.85], hole: 4.6, holeOpen: 4.6, stand: [['pillar', 6], ['arch', 4]], hang: [['root', 40], ['chain', 35], ['stalactite', 25]], pStand: 0.02, pHang: 0.02 },
    far: { img: 'far', dim: 0.85 }, hemi: [0xffffff, 0x9aa6d0, 0.95], shaft: 'rgba(170,230,255,0.55)',
    air: { n: 70, cols: [0xffd8a0, 0x9fe8ff], warm: 0.3, vx: 0.2, vy: [0.05, 0.2] },
  },
  cloister: {
    stone: { edge: 'ink', lip: 'wood3', lip2: 'tan', lipD: 2, lip2D: 3, a: 'wood1', aSeam: 'wood0', b: 'wood0', bSeam: 'ink', c: 'wood0', core: 'ink', seam: 'brick' },
    moss: { c: ['moss0', 'moss1', 'moss0'], p: 0.07 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
    ceilLow: [['chain', 4], ['stalactite', 2], ['banner', 3]], ceil: [['chain', 20], ['banner', 26], ['lantern', 14], ['chandelier', 22], ['vine', 8], ['stalactite', 10]],
    floorWall: ['rubble', 'urn', 'candles', 'bones', 'statue', 'books'], floorOpen: ['candles', 'rubble', 'books', 'urn'], gem: 'candles',
    back: { cols: ['ink', 'wood0', 'wood1'], dim: [0.82, 0.8, 0.8], hole: 3.4, holeOpen: 3.4, windows: true, stand: [['pillar', 1]], hang: [['chain', 1]], pStand: 0, pHang: 0, wall: [['banner', 5], ['shelf', 4], ['chain', 3]], pWall: 0.0016, brick: true },
    far: { img: 'cloister', dim: 0.9 }, hemi: [0xffeeda, 0xb89478, 0.98], shaft: 'rgba(255,214,150,0.5)',
    air: { n: 60, cols: [0xffb060, 0xffe0a0], warm: 0.5, vx: 0.15, vy: [0.12, 0.4] },
  },
  spires: {
    stone: { edge: 'ink', topEdge: 'white', lip: 'white', lip2: 'pale', lipD: 4, lip2D: 5, a: 'light', aSeam: 'mid', b: 'mid', bSeam: 'dark', c: 'dark', core: 'deep', seam: 'strata', band: [10, 14, 18] },
    moss: { c: ['white', 'white', 'pale'], p: 0.22 }, plank: ['wood1', 'white', 'wood0', 'wood2'], spike: ['cyan', 'white'],
    ceilLow: [['icicle', 8], ['stalactite', 2]], ceil: [['icicle', 60], ['stalactite', 14], ['chain', 8], ['root', 10], ['lantern', 8]],
    floorWall: ['drift', 'cairn', 'rubble', 'crystal', 'tuft', 'deadtree'], floorOpen: ['drift', 'tuft', 'flags', 'cairn', 'drift'], gem: 'crystal',
    back: { cols: ['deep', 'dark', 'mid'], dim: [0.9, 0.92, 1], hole: 4.6, holeOpen: 2.2, stand: [['pillar', 5], ['arch', 3], ['deadtree', 4]], hang: [['icicle', 70], ['stalactite', 30]], pStand: 0.012, pHang: 0.03 },
    far: { img: 'spires', dim: 0.92, dither: 30 }, hemi: [0xffffff, 0xc4d4f4, 1.02], shaft: null, bloom: [0.9, 0.4],
    air: { n: 120, cols: [0xffffff, 0xdfe8ff], warm: 0.5, vx: 0.5, vy: [-1.3, -0.5], drift: -0.6, steady: true },
  },
};
const pickOf = (list, p) => { let tot = 0; for (const [, w] of list) tot += w; let a = p * tot; for (const [n, w] of list){ if ((a -= w) < 0) return n; } return list[list.length - 1][0]; };
const SEAMS = {
  rough: (x, y) => { const row = Math.floor(y / 6); if (y % 6 === 0) return true; const off = (row * 37) % 11, bx = x + off; const len = 8 + ((Math.floor(bx / 9) * 7 + row * 3) % 5); return bx % len === 0; },
  brick: (x, y) => { const row = Math.floor(y / 8); return y % 8 === 0 || (x + (row % 2) * 9) % 18 === 0; },   // even courses of big bricks
  strata: (x, y) => { const s = y + (x >> 2), row = Math.floor(s / 7); return s % 7 === 0 || (x + row * 23) % (17 + row % 3 * 4) === 0; },   // tilted beds, cracked across
};
// ---- the play layer
function paintPlay(glows, TM){
  const Wc = LEVEL.W, Hc = LEVEL.H, pw = Wc * CELL, ph = Hc * CELL, rock = LEVEL.sky ? (i, j) => (j >= Hc ? 0 : tileAt(Math.max(0, Math.min(Wc - 1, i)), j) === ROCK ? 1 : 0) : (i, j) => (tileAt(i, j) === ROCK ? 1 : 0);   // under a sky, nothing over the top of the map
  const n1 = noise2(11), n2 = noise2(23);
  const crisp = new Uint8Array(Wc * Hc);   // edges that stay true: the top of anything he stands on, and the air over it
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++){ const t = tileAt(i, j), up = tileAt(i, j + 1), dn = tileAt(i, j - 1); if ((t === ROCK && up !== ROCK) || (t !== ROCK && dn === ROCK)) crisp[j * Wc + i] = 1; }
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
  const cnv = document.createElement('canvas'); cnv.width = pw; cnv.height = ph; const g = cnv.getContext('2d');
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
  }
  g.putImageData(out, 0, 0);
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
      if (tileAt(i, j) !== LEDGE){ i++; continue; }
      let e = i; while (tileAt(e + 1, j) === LEDGE) e++;
      const x0 = i * CELL, x1 = (e + 1) * CELL, y0 = Y(j + 1);
      const PK = TM.plank.map(k => PAL[k]);
      px(g, PAL.ink, x0 - 1, y0 - 1, x1 - x0 + 2, 5); px(g, PK[0], x0, y0, x1 - x0, 3); px(g, PK[1], x0, y0, x1 - x0, 1); px(g, PK[2], x0, y0 + 2, x1 - x0, 1);
      for (let x = x0 + 4 + Math.floor(r() * 4); x < x1 - 2; x += 6 + Math.floor(r() * 5)) px(g, PK[2], x, y0 + 1, 1, 1);
      for (const [x, dir] of [[x0, -1], [x1 - 1, 1]]){
        if (tileAt(dir < 0 ? i - 1 : e + 1, j) === ROCK) for (let k = 0; k < 4; k++) px(g, PAL.wood0, x - dir * k, y0 + 3 + k);
        else if (r() < 0.5) px(g, PAL.wood2, x - dir, y0 + 3, 1, 3 + Math.floor(r() * 5));
      }
      i = e + 1;
    }
  }
  // spikes
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (tileAt(i, j) === SPIKES){
    const x0 = i * CELL, yb = Y(j);
    for (let s = 0; s < 2; s++){ const cx = x0 + 2 + s * 4, h = 5 + s;
      for (let y = 0; y < h; y++){ const half = Math.round((h - y) / h * 1.5); px(g, PAL.ink, cx - half - 1, yb - y - 1, half * 2 + 3); px(g, y > h - 2 ? PAL[TM.spike[1]] : PAL[TM.spike[0]], cx - half, yb - y - 1, half * 2 + 1); } }
  }
  // decoration, by where it sits
  const isRock = (i, j) => tileAt(i, j) === ROCK, isAir = (i, j) => tileAt(i, j) === EMPTY;
  const airBelow = (i, j) => { let n = 0; while (n < 20 && isAir(i, j - n)) n++; return n; };
  const walkedNear = (i, j) => { for (let d = 1; d <= 6; d++) if (isAir(i, j - d) && (isRock(i, j - d - 1) || tileAt(i, j - d - 1) === LEDGE)) return true; return false; };
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
const FB = 0.86, MARGIN_X = 15, MARGIN_Y = 7;
function paintBack(TM){
  const Lw = LEVEL.W * T, Lh = LEVEL.H * T, bw = Math.ceil((FB * Lw + MARGIN_X * 2) * PPU), bh = Math.ceil((FB * Lh + MARGIN_Y * 2) * PPU);
  const Wc = LEVEL.W, Hc = LEVEL.H;
  const open = new Float32Array(Wc * Hc).fill(99);   // tiles to the nearest rock
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++) if (tileAt(i, j) === ROCK) open[j * Wc + i] = 0;
  for (let pass = 0; pass < 2; pass++) for (let s = 0; s < Wc * Hc; s++){
    const k = pass ? Wc * Hc - 1 - s : s, i = k % Wc, j = (k - i) / Wc, sg = pass ? 1 : -1;
    for (const [a, b] of [[sg, 0], [0, sg], [sg, sg], [-sg, sg]]){ const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < Wc && jj < Hc) open[k] = Math.min(open[k], open[jj * Wc + ii] + (a && b ? 1.41 : 1)); }
  }
  const openAt = (wx, wy) => { const i = Math.floor(wx / T), j = Math.floor(wy / T); if (LEVEL.sky && j >= Hc) return 99; if (i < 0 || j < 0 || i >= Wc || j >= Hc) return 0; return open[j * Wc + i]; };   // over the top of a region under the sky: sky
  const n1 = noise2(51), n2 = noise2(77), n3 = noise2(91);
  const BK = TM.back, skyT = new Uint8Array(Wc * Hc);   // tiles out under the sky: the wall behind is only a fringe of rock there
  for (let j = 0; j < Hc; j++) for (let i = 0; i < Wc; i++){ const rm = LEVEL.rooms.find(q => i >= q.tx0 && i < q.tx1 && j >= q.ty0 && j < q.ty1); skyT[j * Wc + i] = rm ? (rm.open ? 1 : 0) : (LEVEL.sky ? 1 : 0); }
  const skyAt = (wx, wy) => { const i = Math.floor(wx / T), j = Math.floor(wy / T); return i < 0 || j < 0 || i >= Wc ? 0 : j >= Hc ? (LEVEL.sky ? 1 : 0) : skyT[j * Wc + i]; };
  const cnv = document.createElement('canvas'); cnv.width = bw; cnv.height = bh; const g = cnv.getContext('2d');
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

export function makeRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.autoClear = false;
  canvas.style.imageRendering = 'pixelated';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(PAL.ink);
  const camera = new THREE.OrthographicCamera(-10, 10, VIEW_H / 2, -VIEW_H / 2, -200, 200); camera.position.z = 100;
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa6d0, 0.95), heroLight = new THREE.PointLight(0xffd2a0, 0.6, 7, 2), rnd = rng(7);
  const torchGlow = glowTex('rgba(255,170,60,1)'), crystalGlow = glowTex('rgba(80,240,255,1)');
  const layers = [], exits = [], lights = [], flames = [], motes = [], pool = [];
  let ready = null, TM = THEMES.roots;
  // ---- the region: everything in the scene is made here, and made again when he goes up to the next (load)
  function build(){
  for (const o of [...scene.children]){ scene.remove(o); o.traverse(m => { if (m.geometry) m.geometry.dispose(); const mt = m.material; if (mt){ if (mt.map && mt.map !== torchGlow && mt.map !== crystalGlow) mt.map.dispose(); mt.dispose(); } }); }
  layers.length = exits.length = lights.length = flames.length = motes.length = pool.length = 0;
  TM = THEMES[LEVEL.theme] || THEMES.roots;
  hemi.color.setHex(TM.hemi[0]); hemi.groundColor.setHex(TM.hemi[1]); hemi.intensity = TM.hemi[2]; scene.add(hemi); scene.add(heroLight);
  const W = LEVEL.W * T, Hh = LEVEL.H * T;
  // ---- the far cavern: held to the palette, a pixel a pixel, nearly still
  const FF = 0.04, far = new THREE.Mesh(new THREE.PlaneGeometry(400 / PPU, 224 / PPU), new THREE.MeshBasicMaterial({ color: 0xffffff })); far.position.z = -60; scene.add(far);
  loadImg(`assets/side/bg/${TM.far.img}.png`).then(img => { if (img){ far.material.map = canvasTex(onPalette(img, TM.far.dim, TM.far.dither || 0)); far.material.needsUpdate = true; } });
  layers.push({ obj: far, f: FF, ax: W / 2, ay: Hh / 2 });   // drawn at anchor + (camera - anchor) * (1 - f)

  // ---- the painted layers
  const glowAt = (x, y, kind) => {   // canvas pixels of the play layer to a glow in the world
    const wx = x / PPU, wy = (LEVEL.H * CELL - y) / PPU, warm = kind === 'lamp';
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(warm ? 1.4 : 1.2, warm ? 1.4 : 1.2), new THREE.MeshBasicMaterial({ map: warm ? torchGlow : crystalGlow, transparent: true, depthWrite: false, color: warm ? 0xffb060 : 0x60e8ff, blending: THREE.AdditiveBlending, opacity: warm ? 0.7 : 0.4 }));
    gl.position.set(wx, wy, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: !warm });
    if (rnd() < 0.5) lights.push({ x: wx, y: wy, color: warm ? 0xff9a40 : 0x40e0ff, power: warm ? 1.0 : 0.7, range: 5, ph: rnd() * 9 });
  };
  ready = (async () => {
    const back = paintBack(TM), backGroup = canvasPlanes(scene, back.cnv, 0, 0, -30, false);
    layers.push({ obj: backGroup, back: true, h: back.bh / PPU });
    const play = paintPlay(glowAt, TM), g = play.getContext('2d'), Y = j => (LEVEL.H - j) * CELL, rr = rng(5);
    for (const m of LEVEL.marks){
      const x = (m.x + 0.5) * T, y = m.y * T, cx = Math.round(x * PPU);
      if (m.type === 'torch'){
        DECO.torch(g, cx, Y(m.y) - 2);
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffb060, blending: THREE.AdditiveBlending, opacity: 0.85 }));
        fl.position.set(x, y + 0.65, 1); scene.add(fl); flames.push({ m: fl, ph: rnd() * 9 });
        const core = new THREE.Mesh(new THREE.PlaneGeometry(3 / PPU, 4 / PPU), new THREE.MeshBasicMaterial({ color: 0xfee761 })); core.position.set(x, y + 0.62, 0.9); scene.add(core); flames.push({ m: core, ph: rnd() * 9 });
        lights.push({ x, y: y + 0.8, color: 0xff9a40, power: 1.5, range: 7, ph: rnd() * 9 });
      }
      if (m.type === 'crystal') DECO[TM.gem](g, cx, Y(m.y), rr, glowAt);
      if (m.type === 'bell') DECO.bell(g, cx, Y(m.y));
      if (m.type === 'shrine'){
        const b = Y(m.y);
        px(g, PAL.ink, cx - 8, b - 6, 17, 6); px(g, PAL.dark, cx - 7, b - 5, 15, 5); px(g, PAL.light, cx - 7, b - 5, 15, 1);
        for (let k = 0; k < 12; k++){ const half = Math.round(Math.sin(Math.PI * k / 12) * 3); px(g, PAL.ink, cx - half - 1, b - 6 - k, half * 2 + 3); px(g, k > 7 ? PAL.fire3 : PAL.fire2, cx - half, b - 6 - k, half * 2 + 1); }
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffd27a, blending: THREE.AdditiveBlending, opacity: 0.6 }));
        gl.position.set(x, y + 0.7, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: true });
        lights.push({ x, y: y + 1, color: 0xffc860, power: 1.8, range: 7, ph: rnd() * 9 });
      }
    }
    canvasPlanes(scene, play, 0, Hh, 0, true);
  })();
  // the way on: shut until the Warden falls
  for (const m of LEVEL.marks) if (m.type === 'exit'){
    const x = (m.x + 0.5) * T, y = m.y * T;
    const c = document.createElement('canvas'); c.width = 24; c.height = 32; const gg = c.getContext('2d');
    gg.fillStyle = PAL.ink; gg.fillRect(2, 4, 20, 28); gg.fillStyle = PAL.fire3; gg.fillRect(4, 6, 16, 26); gg.fillStyle = PAL.white; gg.fillRect(7, 9, 10, 23);
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(24 / PPU, 32 / PPU), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true }));
    arch.position.set(x, y + 1, 0.02); scene.add(arch);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffe0a0, blending: THREE.AdditiveBlending, opacity: 0.7 })); gl.position.set(x, y + 1, 1); scene.add(gl);
    const light = { x, y: y + 1, color: 0xffe0a0, power: 2.4, range: 9, ph: 0, off: true }; lights.push(light);
    arch.visible = gl.visible = false; exits.push({ x, y, set(on){ arch.visible = gl.visible = on; light.off = !on; } });
  }
  // ---- the air: motes, a pixel each, drifting

  for (let k = 0; k < TM.air.n; k++){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, 1 / PPU), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: rnd() < TM.air.warm ? TM.air.cols[0] : TM.air.cols[1] }));
    m.position.set(rnd() * W, rnd() * Hh, 2); scene.add(m); motes.push({ m, vx: (rnd() - 0.5) * TM.air.vx + (TM.air.drift || 0), vy: TM.air.vy[0] + rnd() * (TM.air.vy[1] - TM.air.vy[0]), steady: !!TM.air.steady, ph: rnd() * 9 });
  }
  // ---- soft shafts of light under openings in a roof, dithered
  const sc = document.createElement('canvas'); sc.width = 16; sc.height = 64;
  { const gg = sc.getContext('2d'); gg.fillStyle = TM.shaft || 'rgba(0,0,0,0)'; for (let y = 0; y < 64; y++) for (let x = 0; x < 16; x++){ const a = (1 - y / 64) * (1 - Math.abs(x - 7.5) / 8) * 0.7; if (B4[(y & 3) * 4 + (x & 3)] / 16 < a) gg.fillRect(x, y, 1, 1); } }
  const shaftTex = canvasTex(sc);
  if (TM.shaft) for (let i = 1; i < LEVEL.W - 1; i++) for (let j = 2; j < LEVEL.H - 1; j++){
    if (tileAt(i, j) !== 0 || tileAt(i, j + 1) !== 0 || tileAt(i - 1, j + 1) === 0 || i % 3) continue;
    let up = 0; while (up < 8 && tileAt(i, j + up) === 0) up++;
    if (up < 8 || tileAt(i, j - 1) !== 0) continue;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }));
    sh.position.set((i + 0.5) * T, (j + 1) * T - 3.5, -1); sh.rotation.z = 0.18; scene.add(sh);
  }
  for (let k = 0; k < 6; k++){ const L = new THREE.PointLight(0xffffff, 0, 7, 2); scene.add(L); pool.push(L); }
  }
  build();

  // ---- the frame: the scene into the small target, glow added, then up to the screen whole
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  let main = rt(4, 4), b1 = rt(2, 2), b2 = rt(2, 2), size = { w: 4, h: TH };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); const qScene = new THREE.Scene(); qScene.add(quad); const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  const bright = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, th: { value: 0.7 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float th; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(th, 1.0, l), 1.); }' });
  const blur = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb * 0.227; for (int i = 1; i < 5; i++){ float w = i == 1 ? 0.195 : i == 2 ? 0.122 : i == 3 ? 0.054 : 0.016; c += (texture2D(tex, vUv + dir * float(i)).rgb + texture2D(tex, vUv - dir * float(i)).rgb) * w; } gl_FragColor = vec4(c, 1.); }' });
  // the final pass also bends the picture round a blow: a ring that runs out from it, pushing pixels outward (two at once)
  const comp = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, glow: { value: null }, amt: { value: 1.1 }, sh0: { value: new THREE.Vector4() }, sh1: { value: new THREE.Vector4() }, aspect: { value: 16 / 9 } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform sampler2D glow; uniform float amt; uniform vec4 sh0; uniform vec4 sh1; uniform float aspect; varying vec2 vUv;
      vec2 ring(vec2 uv, vec4 s){ if (s.w <= 0.0) return vec2(0.0); vec2 d = uv - s.xy; d.x *= aspect; float r = length(d); float k = s.w * exp(-pow((r - s.z) / 0.03, 2.0)); return r > 1e-4 ? vec2(d.x / aspect, d.y) / r * k : vec2(0.0); }
      void main(){ vec2 uv = vUv - ring(vUv, sh0) - ring(vUv, sh1); vec3 c = texture2D(tex, uv).rgb + texture2D(glow, uv).rgb * amt; c = c / (1.0 + 0.1 * c); gl_FragColor = vec4(c, 1.); }` });
  const bloom = () => { const b = TM.bloom || [0.7, 1.1]; bright.uniforms.th.value = b[0]; comp.uniforms.amt.value = b[1]; }; bloom();   // how much bright things shine, by region
  const shocks = [{ t: 9, x: 0, y: 0, big: false }, { t: 9, x: 0, y: 0, big: false }]; let shockK = 0;
  main.texture.minFilter = main.texture.magFilter = THREE.NearestFilter;
  function pass(mat, target){ quad.material = mat; renderer.setRenderTarget(target); renderer.clear(); renderer.render(qScene, qCam); }
  function resize(){
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight;
    const w = Math.round(TH * cw / ch / 2) * 2;
    if (w === size.w && cw === size.cw && ch === size.ch) return;
    size = { w, h: TH, cw, ch }; renderer.setSize(cw, ch, false);
    main.setSize(w, TH); b1.setSize(w >> 1, TH >> 1); b2.setSize(w >> 1, TH >> 1);
    const hw = w / 2 / PPU; camera.left = -hw; camera.right = hw; camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  const cam = { x: 0, y: 0 }, snap = v => Math.round(v * PPU) / PPU;
  return {
    scene, camera, exits, get ready(){ return ready; }, size: () => size, load(){ build(); bloom(); }, theme: () => LEVEL.theme,
    shock(x, y, big){ const S = shocks[shockK]; shockK = (shockK + 1) % shocks.length; Object.assign(S, { t: 0, x, y, big: !!big }); },
    // where something at parallax f (1 moves with the world, 0 with the camera), anchored at (ax, ay), is drawn now
    parallax: (f, ax, ay) => ({ x: snap(ax + (cam.x - ax) * (1 - f)), y: snap(ay + (cam.y - ay) * (1 - f)) }),
    setCamera(x, y){
      cam.x = snap(x); cam.y = snap(y); camera.position.set(cam.x, cam.y, 100);
      for (const L of layers){
        // the back canvas: back-space point b sits at b + camera * (1 - FB), so what is behind w shows behind w
        if (L.back){ L.obj.position.set(snap(cam.x * (1 - FB) - MARGIN_X), snap(cam.y * (1 - FB) - MARGIN_Y + L.h), L.obj.position.z); continue; }
        L.obj.position.set(snap(L.ax + (cam.x - L.ax) * (1 - L.f)), snap(L.ay + (cam.y - L.ay) * (1 - L.f)), L.obj.position.z);
      }
    },
    frame(t, hero){
      resize();
      for (const o of motes){ o.m.position.x += (o.vx + Math.sin(t * 0.7 + o.ph) * 0.05) * 0.016; o.m.position.y += o.vy * 0.016; if (o.m.position.y > cam.y + 7) o.m.position.y = cam.y - 7; else if (o.m.position.y < cam.y - 7) o.m.position.y = cam.y + 7; if (Math.abs(o.m.position.x - cam.x) > 12) o.m.position.x = cam.x + (rnd() - 0.5) * 22; o.m.material.opacity = o.steady ? 0.9 : 0.5 + 0.5 * Math.sin(t * 2 + o.ph); }
      for (const f of flames){ const k = f.slow ? 0.06 : 0.12; f.m.scale.setScalar(1 + Math.sin(t * (f.slow ? 2 : 13) + f.ph) * k + (f.slow ? 0 : Math.sin(t * 7.3 + f.ph) * 0.06)); }
      const near = lights.filter(l => !l.off).map(l => ({ l, d: Math.hypot(l.x - cam.x, l.y - cam.y) })).sort((a, b) => a.d - b.d);
      pool.forEach((L, k) => { const n = near[k]; if (!n || n.d > 16){ L.intensity = 0; return; } L.position.set(n.l.x, n.l.y, 1.2); L.color.setHex(n.l.color); L.distance = n.l.range; L.intensity = n.l.power * (1 + Math.sin(t * 11 + n.l.ph) * 0.06); });
      if (hero) heroLight.position.set(hero.x, hero.y + 1.4, 1.6);
      renderer.setRenderTarget(main); renderer.clear(); renderer.render(scene, camera);
      bright.uniforms.tex.value = main.texture; pass(bright, b1);
      blur.uniforms.tex.value = b1.texture; blur.uniforms.dir.value.set(1 / b1.width, 0); pass(blur, b2);
      blur.uniforms.tex.value = b2.texture; blur.uniforms.dir.value.set(0, 1 / b1.height); pass(blur, b1);
            // the rings: where in the picture, how far out, how strong
      shocks.forEach((S, k) => { S.t += 1 / 60; const u = S.t / (S.big ? 0.32 : 0.24), hw = size.w / 2 / PPU, hh = VIEW_H / 2;
        comp.uniforms['sh' + k].value.set(0.5 + (S.x - cam.x) / (hw * 2), 0.5 + (S.y - cam.y) / (hh * 2), (S.big ? 0.2 : 0.14) * Math.sqrt(Math.min(1, u)), u >= 1 ? 0 : (S.big ? 0.012 : 0.007) * (1 - u)); });
      comp.uniforms.aspect.value = size.w / size.h;
      comp.uniforms.tex.value = main.texture; comp.uniforms.glow.value = b1.texture; pass(comp, null);
    },
  };
}

// ---- a sprite: frames from a strip (tools/pixellab.py), on a lit plane, feet on its position, mirrored to face left,
// placed on the pixel grid. A strip says its own pixels to a unit (32 now; the first art was drawn at 64)
function strip(url, frames){
  const t = new THREE.TextureLoader().load(url, tx => { tx.needsUpdate = true; });
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.repeat.set(1 / frames, 1);
  return t;
}
export function makeSprite(scene, base, meta){
  const g = new THREE.Group(); scene.add(g);
  const mat = new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x000000 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); g.add(plane);
  const tex = {}; for (const a in meta.anims) tex[a] = strip(`${base}/${a}.png`, meta.anims[a].frames);
  const ppu = meta.ppu || 64, S = { g, plane, mat, anim: null };
  // anchor 'last': place the drawing by where its last frame stands (a climb ends on top of the ledge he is put on).
  // anchor { foot, cx }: place it by that row and column of its canvas (a climb, each frame set on the ledge's corner)
  S.show = (anim, frac, x, y, face, z = 0.05, rot = 0, anchor = null) => {
    const A0 = meta.anims[anim] || meta.anims.stand; if (!A0) return;
    const A = anchor === 'last' && A0.footLast != null ? { ...A0, foot: A0.footLast, cx: A0.cxLast } : anchor && typeof anchor === 'object' ? { ...A0, ...anchor } : A0;
    if (S.anim !== anim){ mat.map = tex[anim] || tex.stand; mat.needsUpdate = true; S.anim = anim; }
    const n = A.frames, i = Math.min(n - 1, Math.floor(((frac % 1) + 1) % 1 * n));
    mat.map.offset.set(i / n, 0);
    const w = A.w / ppu, h = A.h / ppu;
    plane.scale.set(w * (face < 0 ? -1 : 1), h, 1);
    // its feet (the painted bottom) on y, its middle on x; turned (a somersault) about its middle, not its feet
    const PIV = meta.anims.stand ? meta.anims.stand.h / ppu * 0.45 : 0.85, ox = (A.w / 2 - A.cx) / ppu * (face < 0 ? -1 : 1), oy = A.foot / ppu - h / 2 - 0.02 - PIV, c = Math.cos(rot), s = Math.sin(rot);
    plane.position.set(ox * c - oy * s, ox * s + oy * c, 0); plane.rotation.z = rot;
    g.position.set(Math.round(x * PPU) / PPU, Math.round((y + PIV) * PPU) / PPU, z);
  };
  // an afterimage: this frame, tinted, left where it is to fade (the caller fades and removes it)
  S.ghost = (color) => {
    if (!mat.map || !mat.map.image) return null;
    const t = mat.map.clone(); t.needsUpdate = true;
    const m = new THREE.Mesh(plane.geometry, new THREE.MeshBasicMaterial({ map: t, color, transparent: true, alphaTest: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.position.set(g.position.x + plane.position.x, g.position.y + plane.position.y, g.position.z - 0.01); m.scale.copy(plane.scale); m.rotation.z = plane.rotation.z;
    scene.add(m); return m;
  };
  return S;
}
