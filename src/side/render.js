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
// Shape: the warrior, the creatures and the bosses have normal maps (tools/pixellab.py normals: which way each pixel
// faces), and the rock has one worked out here from its own shape (its edges round off, its blocks are bevelled), so a
// torch lights the side of a thing that faces it. That light comes in steps too (lit()), like the rest of the art.
// Light: the last pass darkens the picture to the region's ambient and lifts it again round every light (torches,
// crystals, the shrine, the warrior, a boss's eyes, a blow), in steps, dithered, so the pools of light are banded like
// the art. Mist drifts behind the play layer and a little in front; dark shapes close to the eye (things hanging from
// the top of the view, things standing at its foot) slide past faster than the world, for depth.
import { T, ROCK, LEDGE, SPIKES, EMPTY, LEVEL, rawAt, REGION_DATA } from './level.js';
import { paintAt, PPU, VIEW_H, TH, CELL, B4, PAL, rgb, PALETTE, nearest, rng, newCanvas, noise2, px, DECO, THEMES, pickOf, SEAMS, paintPlay, FB, MARGIN_X, MARGIN_Y, paintBack, blend, paintRegion } from './paint.js';
export { PPU, VIEW_H, PAL };
const THREE = window.THREE;
// ---- the paintings, by region. A region's painting never changes (cracked rock and star-glass are drawn apart), so
// each is made once, in a worker where the page allows one (paintworker.js: it never stops the game), and kept; the
// region above him is made ahead, while he climbs this one. Where there is no worker the region he is in is painted
// here, as it always was. At most KEEP are kept (the bitmaps of the oldest are let go).
const PAINTED = new Map(), KEEP = 3, ASKED = new Map();
let LOADS = 0, READY = false, WK = null, WK_OK = null;
function worker(){
  if (WK !== null) return WK;
  if (typeof Worker === 'undefined' || /[?&]noworker\b/.test(location.search)){ WK = false; return WK; }
  try { WK = new Worker(new URL('./paintworker.js', import.meta.url), { type: 'module' }); } catch (e){ WK = false; return WK; }
  WK_OK = new Promise(res => { const t = setTimeout(() => res(false), 5000);
    WK.addEventListener('message', e => { if (e.data && e.data.hello){ clearTimeout(t); res(true); } });
    WK.addEventListener('error', () => { clearTimeout(t); res(false); }); });
  WK.addEventListener('message', e => { const d = e.data; if (!d || d.hello) return; const q = ASKED.get(d.n); if (!q) return; ASKED.delete(d.n); if (d.error) q.no(d.error); else q.ok(d); });
  WK.addEventListener('error', () => { for (const q of ASKED.values()) q.no('worker'); ASKED.clear(); });
  return WK;
}
const viaWorker = n => { const w = worker(); if (!w) return Promise.reject('no worker');
  return WK_OK.then(ok => ok ? new Promise((ok2, no) => { ASKED.set(n, { ok: ok2, no }); w.postMessage({ n }); }) : Promise.reject('no worker')); };
// region n's paintings (a promise); `local`: if no worker can, paint it here (only the region loaded here can be)
export function painted(n, local = false){
  if (PAINTED.has(n)){ const p = PAINTED.get(n); PAINTED.delete(n); PAINTED.set(n, p); return p; }   // the most recent last
  const p = viaWorker(n).catch(e => { if (local && LEVEL.index === n) return paintRegion(n, false); PAINTED.delete(n); throw e; });
  PAINTED.set(n, p);
  while (PAINTED.size > KEEP){ const [k, old] = PAINTED.entries().next().value; PAINTED.delete(k); old.then(r => { for (const b of [r.back, r.play, r.normals]) if (b && b.close) b.close(); }).catch(() => {}); }
  return p;
}
// region n made ahead, if a worker can (never here: that would stop the game)
export const want = n => { if (n >= 0 && n < REGION_DATA.length && !PAINTED.has(n)) painted(n).catch(() => {}); };
// a material lit by the scene's lights through a normal map (if it has one), the light it gets held to a few steps so
// shading stays banded like pixel art
const SHADE_STEPS = 6;
// how the lights meet what has a shape: less light from everywhere, more from the torches, and the torches close to the
// plane so their light rakes across it (a face turned to the torch is lit, one turned away is in shadow)
const AMB_IN_MAT = 0.6, LIGHT_GAIN = 2.6, LIGHT_Z = 0.7;
const FLAT = typeof location !== 'undefined' && /[?&]flat\b/.test(location.search);   // ?flat: no normal maps, to compare
export function lit(opts){
  if (FLAT) opts = { ...opts, normalMap: null };
  const m = new THREE.MeshPhongMaterial({ shininess: 0, specular: 0x000000, ...opts });
  m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;',
    `vec3 lightIn = (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse) / max(diffuseColor.rgb, vec3(0.004));
     lightIn = floor(lightIn * ${SHADE_STEPS}.0 + 0.5) / ${SHADE_STEPS}.0;
     vec3 outgoingLight = lightIn * diffuseColor.rgb + totalEmissiveRadiance;`); };
  m.customProgramCacheKey = () => 'banded';
  return m;
}
export function pixTex(url){ const t = new THREE.TextureLoader().load(url, x => { x.needsUpdate = true; }); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
function canvasTex(c){ const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
function glowTex(color){
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
const loadImg = url => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
// an image held to the palette (the far painting)
function onPalette(img, dim = 1, dither = 0){
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data, cache = new Map();
  if (dither){   // a soft sky: each pixel pushed by an ordered pattern before it is matched, so the bands between two colours mix
    for (let i = 0; i < p.length; i += 4){ const k = i / 4, x = k % c.width, y = (k - x) / c.width, o = (B4[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * dither, q = nearest(p[i] * dim + o, p[i + 1] * dim + o, p[i + 2] * dim + o); p[i] = q[0]; p[i + 1] = q[1]; p[i + 2] = q[2]; }
    g.putImageData(d, 0, 0); return c;
  }
  for (let i = 0; i < p.length; i += 4){ const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2]; let q = cache.get(key); if (!q){ q = nearest(p[i] * dim, p[i + 1] * dim, p[i + 2] * dim); cache.set(key, q); } p[i] = q[0]; p[i + 1] = q[1]; p[i + 2] = q[2]; }
  g.putImageData(d, 0, 0); return c;
}
// a canvas onto the scene as planes no bigger than 1024 pixels, its top-left at (x, y)
// the paintings' pieces waiting to go to the graphics card. Sent one at a time, between frames, before the region is
// shown, so its first frame does not stop for all of them at once
const UPLOAD = [];
function canvasPlanes(scene, c, x, y, z, isLit, nrm){
  const group = new THREE.Group(), S = 1024;
  for (let oy = 0; oy < c.height; oy += S) for (let ox = 0; ox < c.width; ox += S){
    const w = Math.min(S, c.width - ox), h = Math.min(S, c.height - oy), part = document.createElement('canvas'); part.width = w; part.height = h;
    part.getContext('2d').drawImage(c, ox, oy, w, h, 0, 0, w, h);
    let np = null; if (nrm){ np = document.createElement('canvas'); np.width = w; np.height = h; np.getContext('2d').drawImage(nrm, ox, oy, w, h, 0, 0, w, h); }
    const mat = isLit ? lit({ map: canvasTex(part), normalMap: np ? canvasTex(np) : null, transparent: true, alphaTest: 0.5 }) : new THREE.MeshBasicMaterial({ map: canvasTex(part), transparent: true, alphaTest: 0.5 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w / PPU, h / PPU), mat);
    m.position.set((ox + w / 2) / PPU, -(oy + h / 2) / PPU, 0); group.add(m);
    UPLOAD.push(mat.map); if (mat.normalMap) UPLOAD.push(mat.normalMap);   // sent to the graphics card a piece at a time (uploaded())
  }
  group.position.set(x, y, z); scene.add(group); return group;
}

// ---- a torch's flame, four frames side by side; mist, to repeat; and what is close to the eye
function flameStrip(){
  const c = document.createElement('canvas'); c.width = 32; c.height = 12; const g = c.getContext('2d'), half = [2, 2.5, 3, 3, 2.5, 2.5, 2, 1.5, 1.5, 1, 0.5, 0];
  for (let f = 0; f < 4; f++) for (let y = 0; y < 12; y++){ const sway = Math.round(Math.sin(f * Math.PI / 2 + y * 0.55) * (y / 11) * 1.6), h = half[y] + (f % 2 && y > 6 ? -0.5 : 0);
    for (let x = 0; x < 8; x++){ const d = Math.abs(x + 0.5 - 4 - sway); if (d > h) continue; px(g, d < h * 0.4 && y < 7 ? (y < 4 ? PAL.white : PAL.fire3) : d < h * 0.75 ? PAL.fire2 : PAL.fire1, f * 8 + x, 11 - y); } }
  const t = canvasTex(c); t.repeat.set(0.25, 1); return t;
}
// smooth noise that repeats every `cells` (so a texture of it tiles)
function tileNoise(seed, cells){ const r = rng(seed), v = []; for (let k = 0; k < cells * cells; k++) v.push(r());
  const g = (i, j) => v[(((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells)];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, w = y - j, a = u * u * (3 - 2 * u), b = w * w * (3 - 2 * w); return (g(i, j) * (1 - a) + g(i + 1, j) * a) * (1 - b) + (g(i, j + 1) * (1 - a) + g(i + 1, j + 1) * a) * b; }; }
function mistTex(M, seed, thin){
  const W = 256, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), n1 = tileNoise(seed, 8), n2 = tileNoise(seed + 5, 16);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const v = n1(x / 32, y / 16) * 0.7 + n2(x / 16, y / 8) * 0.3, a = (v - (thin ? 0.66 : 0.56)) * 3.2;   // long low banks
    if (a > 0 && B4[(y & 3) * 4 + (x & 3)] / 16 < a) px(g, a > 0.7 ? PAL[M.col] : PAL[M.col2], x, y);
  }
  const t = canvasTex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// dark shapes close to the eye: hanging from the top of the view and standing at its foot, never where he is
function foreTex(kind){
  const W = 512, H = TH, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(kind.length * 97 + 3);
  const twice = draw => { draw(0); draw(-W); draw(W); };   // so it meets itself at the edge
  const spikeDown = (x, L, w, tip) => twice(o => { for (let k = 0; k < L; k++){ const half = Math.max(0, Math.round((1 - k / L) * w / 2)); px(g, PAL.ink, x + o - half, k, half * 2 + 1); if (half) px(g, PAL.deep, x + o - half, k); } if (tip) px(g, tip, x + o, L - 1, 1, 2); });
  const strand = (x, L, kinks, col) => twice(o => { let cx = x; for (let k = 0; k < L; k++){ if (kinks && r() < 0.25) cx += r() < 0.5 ? -1 : 1; px(g, PAL.ink, cx + o, k, col ? 2 : 1); if (col && k % 3 === 0) px(g, col, cx + o, k); } });
  const mound = (x, w, h, cap) => twice(o => { for (let k = 0; k < h; k++){ const half = Math.round(w / 2 * Math.sqrt(1 - Math.pow(k / h, 2))); px(g, PAL.ink, x + o - half, H - 1 - k, half * 2 + 1); } if (cap) for (let a = -Math.round(w / 2) + 2; a < w / 2 - 2; a++){ const k = Math.round(h * Math.sqrt(Math.max(0, 1 - Math.pow(a / (w / 2), 2)))); px(g, cap, x + o + a, H - 1 - k, 1, 1); } else px(g, PAL.deep, x + o - Math.round(w / 4), H - h, Math.round(w / 3), 1); });
  let x = 20;
  while (x < W - 20){
    const p = r();
    if (kind === 'roots'){ if (p < 0.5) spikeDown(x, 10 + Math.floor(r() * 22), 5 + Math.floor(r() * 8)); else strand(x, 14 + Math.floor(r() * 26), true); }
    else if (kind === 'cloister'){ if (p < 0.55) strand(x, 16 + Math.floor(r() * 28), false, PAL.dark); else twice(o => { const L = 18 + Math.floor(r() * 10); for (let k = 0; k < L; k++){ const rag = k > L - 4 ? (k + x) % 3 : 0; px(g, PAL.ink, x + o + rag, k, 9 - rag * 2); if (k % 6 === 3) px(g, PAL.wood0, x + o + 1 + rag, k, 7 - rag * 2); } }); }
    else { spikeDown(x, 8 + Math.floor(r() * 18), 3 + Math.floor(r() * 4), PAL.pale); }
    x += 46 + Math.floor(r() * 90);
  }
  x = 40;
  while (x < W - 30){
    const p = r();
    if (kind === 'roots'){ mound(x, 18 + Math.floor(r() * 26), 6 + Math.floor(r() * 8)); if (p < 0.5) twice(o => { for (let b = 0; b < 4; b++) px(g, PAL.ink, x + o + 14 + b * 3, H - 9 - Math.floor(r() * 7), 1, 12); }); }
    else if (kind === 'cloister'){ twice(o => { const w = 10 + Math.floor(r() * 14), h = 6 + Math.floor(r() * 10); px(g, PAL.ink, x + o, H - h, w, h); px(g, PAL.wood0, x + o, H - h, w, 1); if (p < 0.6){ px(g, PAL.ink, x + o + w + 4, H - 12, 2, 12); px(g, PAL.fire2, x + o + w + 4, H - 14, 2, 2); px(g, PAL.fire3, x + o + w + 4, H - 15, 1, 1); } }); }
    else { mound(x, 22 + Math.floor(r() * 30), 5 + Math.floor(r() * 7), PAL.white); if (p < 0.4) twice(o => { let cx = x + 20; for (let k = 0; k < 16; k++){ if (r() < 0.4) cx += 1; px(g, PAL.ink, cx + o, H - 6 - k, 1, 1); if (k === 9) for (let b = 0; b < 6; b++) px(g, PAL.ink, cx + o - b, H - 6 - k - b, 1, 1); } }); }
    x += 90 + Math.floor(r() * 120);
  }
  const t = canvasTex(c); t.wrapS = THREE.RepeatWrapping; return t;
}

let TM_NOW = null;
export const themeNow = () => TM_NOW || THEMES.roots;   // the look of the region in play (props.js draws cracked rock in its stone)
export function makeRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.autoClear = false;
  canvas.style.imageRendering = 'pixelated';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(PAL.ink);
  const camera = new THREE.OrthographicCamera(-10, 10, VIEW_H / 2, -VIEW_H / 2, -200, 200); camera.position.z = 100;
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa6d0, 0.95), heroLight = new THREE.PointLight(0xffd2a0, 0.5, 7, 2), rnd = rng(7);
  const torchGlow = glowTex('rgba(255,170,60,1)'), crystalGlow = glowTex('rgba(80,240,255,1)');
  const layers = [], exits = [], lights = [], flames = [], motes = [], pool = [], burning = [], veils = [], glints = [], fars = [];
  let ALT = [];        // the other looks worn in this region
  const LOOKW = {};   // how far he is into a room that wears another region's look, by that look: 0 not at all, 1 deep in it
  const flameTexs = [flameStrip(), flameStrip(), flameStrip()], ambNow = [1, 1, 1];
  let ready = null, TM = THEMES.roots;
  // ---- the region: everything in the scene is made here, and made again when he goes up to the next (load)
  function build(){
  for (const o of [...scene.children]){ scene.remove(o); o.traverse(m => { if (m.geometry) m.geometry.dispose(); const mt = m.material; if (mt){ if (mt.map && mt.map !== torchGlow && mt.map !== crystalGlow) mt.map.dispose(); mt.dispose(); } }); }
  layers.length = exits.length = lights.length = flames.length = motes.length = pool.length = burning.length = veils.length = glints.length = fars.length = 0; for (const k in LOOKW) delete LOOKW[k];
  TM = THEMES[LEVEL.theme] || THEMES.roots; TM_NOW = TM;
  hemi.color.setHex(TM.hemi[0]); hemi.groundColor.setHex(TM.hemi[1]); hemi.intensity = TM.hemi[2] * AMB_IN_MAT; scene.add(hemi); scene.add(heroLight);
  const W = LEVEL.W * T, Hh = LEVEL.H * T;
  // ---- the far cavern: held to the palette, a pixel a pixel, nearly still
  // rooms that wear another region's look (the way in still looks like where he came from): which looks, and where
  ALT = [...new Set(LEVEL.rooms.map(r => r.look).filter(l => l && THEMES[l] && THEMES[l] !== TM))];
  const lookAt = (wx, wy) => { const r = LEVEL.rooms.find(q => wx >= q.x0 && wx < q.x1 && wy >= q.y0 && wy < q.y1); return r && r.look && ALT.includes(r.look) ? r.look : null; };
  const FF = 0.04;
  const farOf = (TMx, look, z) => { const far = new THREE.Mesh(new THREE.PlaneGeometry(400 / PPU, 224 / PPU), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: !!look, opacity: look ? 0 : 1, depthWrite: false })); far.position.z = z; scene.add(far);
    loadImg(`assets/side/bg/${TMx.far.img}.png`).then(img => { if (img){ far.material.map = TMx.far.raw ? canvasTex(img) : canvasTex(onPalette(img, TMx.far.dim, TMx.far.dither || 0)); far.material.needsUpdate = true; } });
    layers.push({ obj: far, f: FF, ax: W / 2, ay: Hh / 2, far: true }); if (look) fars.push({ m: far, look }); };   // drawn at anchor + (camera - anchor) * (1 - f)
  farOf(TM, null, -60); ALT.forEach((l, k) => farOf(THEMES[l], l, -59.9 + k * 0.01));
  { const sp = LEVEL.marks.find(m => m.type === 'spawn'), l0 = sp && lookAt((sp.x + 0.5) * T, sp.y * T + 0.5); for (const l of ALT) LOOKW[l] = l === l0 ? 1 : 0; LOOKW[''] = l0 ? 0 : 1; }   // the look he wakes in, before the first frame

  // ---- the painted layers
  const glowAt = (x, y, kind) => {   // canvas pixels of the play layer to a glow in the world
    const wx = x / PPU, wy = (LEVEL.H * CELL - y) / PPU, warm = kind === 'lamp';
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(warm ? 1.4 : 1.2, warm ? 1.4 : 1.2), new THREE.MeshBasicMaterial({ map: warm ? torchGlow : crystalGlow, transparent: true, depthWrite: false, color: warm ? 0xffb060 : 0x60e8ff, blending: THREE.AdditiveBlending, opacity: warm ? 0.7 : 0.4 }));
    gl.position.set(wx, wy, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: !warm });
    if (rnd() < 0.5) lights.push({ x: wx, y: wy, color: warm ? 0xff9a40 : 0x40e0ff, power: warm ? 1.0 : 0.7, range: 5, ph: rnd() * 9 });
  };
  const gen = ++LOADS; READY = false;
  ready = (async () => {
    // the paintings: made ahead in the worker where it can (painted() keeps them), else here; then put in the scene
    const PT = await painted(LEVEL.index, true);
    if (gen !== LOADS) return;   // he has gone on to another region while it was being painted
    const backGroup = canvasPlanes(scene, PT.back, 0, 0, -30, false);
    layers.push({ obj: backGroup, back: true, h: PT.bh / PPU });
    for (const q of PT.glows) glowAt(q.x, q.y, q.kind);
    for (const m of LEVEL.marks){
      const x = (m.x + 0.5) * T, y = m.y * T;
      if (m.type === 'torch'){
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffb060, blending: THREE.AdditiveBlending, opacity: 0.85 }));
        fl.position.set(x, y + 0.65, 1); scene.add(fl); flames.push({ m: fl, ph: rnd() * 9 });
        const ft = flameTexs[burning.length % flameTexs.length], core = new THREE.Mesh(new THREE.PlaneGeometry(8 / PPU, 12 / PPU), new THREE.MeshBasicMaterial({ map: ft, transparent: true, alphaTest: 0.5 })); core.position.set(x, y + 0.86, 0.9); scene.add(core); burning.push(core);   // the flame itself, drawn, four frames
        lights.push({ x, y: y + 0.8, color: 0xff9a40, power: 1.5, range: 7, ph: rnd() * 9, torch: true });
      }
      if (m.type === 'shrine'){
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffd27a, blending: THREE.AdditiveBlending, opacity: 0.6 }));
        gl.position.set(x, y + 0.7, 1); scene.add(gl); flames.push({ m: gl, ph: rnd() * 9, slow: true });
        lights.push({ x, y: y + 1, color: 0xffc860, power: 1.8, range: 7, ph: rnd() * 9 });
      }
    }
    canvasPlanes(scene, PT.play, 0, Hh, 0, true, PT.normals);
    await new Promise(done => { const next = () => { if (gen !== LOADS) return done(); const t = UPLOAD.shift(); if (!t) return done(); try { renderer.initTexture(t); } catch (e){} setTimeout(next, 0); }; next(); });
    if (gen !== LOADS) return;
    try { renderer.compile(scene, camera); } catch (e){}   // and its shaders made now, not on the first frame he can see
    READY = true;
    want(LEVEL.index + 1);   // and the region above, ahead of him
  })();
  // the way on: shut until the keeper falls. A tall arch, and in it a little of the next region's sky: where he is going
  // can be seen from here (the last region's is only light: the beacon)
  const NEXT = REGION_DATA[LEVEL.index + 1], NTM = NEXT && THEMES[NEXT.theme];
  for (const m of LEVEL.marks) if (m.type === 'exit'){
    const x = (m.x + 0.5) * T, y = m.y * T, tint = NTM ? NTM.air.cols[1] : 0xffe0a0;
    const c = document.createElement('canvas'); c.width = 34; c.height = 46; const gg = c.getContext('2d'), tex = canvasTex(c);
    const frame = img => { gg.clearRect(0, 0, 34, 46);
      for (let yy = 0; yy < 46; yy++) for (let xx = 0; xx < 34; xx++){ const cx = xx - 16.5, top = yy < 17 ? Math.hypot(cx, yy - 17) : Math.abs(cx), inner = top < 13, outer = top < 16.5; if (!outer) continue;
        gg.fillStyle = inner ? PAL.white : top > 15.5 || top < 14 ? PAL.ink : (xx + yy) % 5 === 0 ? PAL.dark : PAL.mid; gg.fillRect(xx, yy, 1, 1); }
      if (img){ gg.save(); gg.beginPath(); for (let yy = 0; yy < 46; yy++){ const half = yy < 17 ? Math.sqrt(Math.max(0, 13 * 13 - (yy - 17) * (yy - 17))) : 13; gg.rect(Math.round(16.5 - half) + 1, yy, Math.round(half * 2) - 1, 1); } gg.clip(); gg.imageSmoothingEnabled = false; gg.drawImage(img, 120, 20, 104, 184, 3, 0, 28, 46); gg.restore(); }
      tex.needsUpdate = true; };
    frame(null); if (NTM) loadImg(`assets/side/bg/${NTM.far.img}.png`).then(img => { if (img) frame(img); });
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(34 / PPU, 46 / PPU), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    arch.position.set(x, y + 23 / PPU, 0.02); scene.add(arch);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: tint, blending: THREE.AdditiveBlending, opacity: 0.45 })); gl.position.set(x, y + 1.4, 0.015); scene.add(gl); flames.push({ m: gl, ph: 0, slow: true });   // behind the arch: a halo round it, the picture in it left clear
    const light = { x, y: y + 1.4, color: 0xffffff, power: 1.6, range: 7, ph: 0, off: true }; lights.push(light);
    arch.visible = gl.visible = false; exits.push({ x, y, tint, cols: NTM ? NTM.air.cols : [0xffe0a0, 0xfee761], next: NEXT ? NEXT.theme : '', on: false, set(on){ this.on = on; arch.visible = gl.visible = on; light.off = !on; } });
  }
  // ---- the air: motes, a pixel each, drifting (the region's, and those of any other look worn in it: `look` says whose)
  const airOf = (TMx, look) => { for (let k = 0; k < TMx.air.n; k++){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1 / PPU, 1 / PPU), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: rnd() < TMx.air.warm ? TMx.air.cols[0] : TMx.air.cols[1] }));
    m.position.set(rnd() * W, rnd() * Hh, 2); scene.add(m); motes.push({ m, look, vx: (rnd() - 0.5) * TMx.air.vx + (TMx.air.drift || 0), vy: TMx.air.vy[0] + rnd() * (TMx.air.vy[1] - TMx.air.vy[0]), steady: !!TMx.air.steady, ph: rnd() * 9 });
  } };
  airOf(TM, null); for (const l of ALT) airOf(THEMES[l], l);
  // ---- soft shafts of light under openings in a roof, dithered
  const sc = document.createElement('canvas'); sc.width = 16; sc.height = 64;
  { const gg = sc.getContext('2d'); gg.fillStyle = TM.shaft || 'rgba(0,0,0,0)'; for (let y = 0; y < 64; y++) for (let x = 0; x < 16; x++){ const a = (1 - y / 64) * (1 - Math.abs(x - 7.5) / 8) * 0.7; if (B4[(y & 3) * 4 + (x & 3)] / 16 < a) gg.fillRect(x, y, 1, 1); } }
  const shaftTex = canvasTex(sc);
  if (TM.shaft) for (let i = 1; i < LEVEL.W - 1; i++) for (let j = 2; j < LEVEL.H - 1; j++){
    if (paintAt(i, j) !== 0 || paintAt(i, j + 1) !== 0 || paintAt(i - 1, j + 1) === 0 || i % 3) continue;
    let up = 0; while (up < 8 && paintAt(i, j + up) === 0) up++;
    if (up < 8 || paintAt(i, j - 1) !== 0) continue;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }));
    sh.position.set((i + 0.5) * T, (j + 1) * T - 3.5, -1); sh.rotation.z = 0.18; scene.add(sh);
  }
  for (let k = 0; k < 6; k++){ const L = new THREE.PointLight(0xffffff, 0, 7, 2); scene.add(L); pool.push(L); }
  // ---- mist behind the play layer and a thin one before it, and the dark shapes close to the eye; all ride with the
  // camera, their pictures sliding at their own rates
  const veil = (tex, z, f, opacity, drift, tw, th, look) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(44, VIEW_H + 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false })); m.position.z = z; scene.add(m); veils.push({ m, tex, f, drift, tw, th, w: 44 * PPU, h: (VIEW_H + 1) * PPU, look, a: opacity }); };
  const mistOf = (TMx, look, dz) => {
    if (TMx.mist){ veil(mistTex(TMx.mist, 41, false), -6 + dz, 0.8, TMx.mist.a, TMx.mist.drift, 256, 128, look); veil(mistTex(TMx.mist, 87, true), 3 + dz, 1.15, TMx.mist.a * 0.45, TMx.mist.drift * 1.6, 256, 128, look); }
    if (TMx.fore){ const t = foreTex(TMx.fore), m = new THREE.Mesh(new THREE.PlaneGeometry(44, VIEW_H), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.position.z = 6 + dz; scene.add(m); veils.push({ m, tex: t, f: 1.4, drift: 0, tw: 512, th: TH, w: 44 * PPU, h: TH, fore: true, look, a: 1 }); }
  };
  mistOf(TM, null, 0); ALT.forEach((l, k) => mistOf(THEMES[l], l, 0.01 * (k + 1)));
  for (let k = 0; k < 3; k++) ambNow[k] = TM.amb[k];
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
  // the final pass lights the picture (ambient, and a pool round each light, in dithered steps), adds the glow, and
  // bends it round a blow: a ring that runs out from it, pushing pixels outward (two at once)
  const NL = 12, lp = [], lc = []; for (let k = 0; k < NL; k++){ lp.push(new THREE.Vector3()); lc.push(new THREE.Vector3()); }
  const comp = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, glow: { value: null }, amt: { value: 1.1 }, sh0: { value: new THREE.Vector4() }, sh1: { value: new THREE.Vector4() }, aspect: { value: 16 / 9 },
    lp: { value: lp }, lc: { value: lc }, amb: { value: new THREE.Vector3(1, 1, 1) }, res: { value: new THREE.Vector2(320, 180) }, vig: { value: 0.3 } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform sampler2D glow; uniform float amt; uniform vec4 sh0; uniform vec4 sh1; uniform float aspect; varying vec2 vUv;
      uniform vec3 lp[${NL}]; uniform vec3 lc[${NL}]; uniform vec3 amb; uniform vec2 res; uniform float vig;
      vec2 ring(vec2 uv, vec4 s){ if (s.w <= 0.0) return vec2(0.0); vec2 d = uv - s.xy; d.x *= aspect; float r = length(d); float k = s.w * exp(-pow((r - s.z) / 0.03, 2.0)); return r > 1e-4 ? vec2(d.x / aspect, d.y) / r * k : vec2(0.0); }
      float b2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
      float b4(vec2 a){ return b2(0.5 * a) * 0.25 + b2(a); }
      void main(){
        vec2 uv = vUv - ring(vUv, sh0) - ring(vUv, sh1);
        vec3 L = amb;
        for (int i = 0; i < ${NL}; i++){ vec2 d = vUv - lp[i].xy; d.x *= aspect; float f = clamp(1.0 - length(d) / max(lp[i].z, 1e-4), 0.0, 1.0); L += lc[i] * f * f; }
        vec2 q = vUv - 0.5; L *= 1.0 - vig * smoothstep(0.35, 0.8, length(q * vec2(0.9, 1.15)));
        L = floor(L * 9.0 + 0.25 + b4(floor(vUv * res)) * 0.5) / 9.0;    // steps of light, half dithered between: banded like the art, not noisy
        vec3 c = texture2D(tex, uv).rgb * min(L, vec3(1.45)) + texture2D(glow, uv).rgb * amt; c = c / (1.0 + 0.1 * c); gl_FragColor = vec4(c, 1.);
      }` });
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
    scene, camera, exits, get ready(){ return ready; }, get isReady(){ return READY; }, look: () => { let best = LEVEL.theme, w = LOOKW[''] === undefined ? 1 : LOOKW['']; for (const l in LOOKW) if (l && LOOKW[l] > w){ w = LOOKW[l]; best = l; } return best; }, lookW: () => LOOKW, size: () => size, load(){ build(); bloom(); }, theme: () => LEVEL.theme,
    // a light for a moment (a blow, a burst) or for this frame only (a boss's eyes, kept up by calling it each frame)
    glint(x, y, color, power = 1, range = 4, life = 0){ glints.push({ x, y, color, power, range, life, t: 0 }); },
    shock(x, y, big){ const S = shocks[shockK]; shockK = (shockK + 1) % shocks.length; Object.assign(S, { t: 0, x, y, big: !!big }); },
    // where something at parallax f (1 moves with the world, 0 with the camera), anchored at (ax, ay), is drawn now
    parallax: (f, ax, ay) => ({ x: snap(ax + (cam.x - ax) * (1 - f)), y: snap(ay + (cam.y - ay) * (1 - f)) }),
    setCamera(x, y){
      cam.x = snap(x); cam.y = snap(y); camera.position.set(cam.x, cam.y, 100);
      for (const L of layers){
        // the back canvas: back-space point b sits at b + camera * (1 - FB), so what is behind w shows behind w
        if (L.back){ L.obj.position.set(snap(cam.x * (1 - FB) - MARGIN_X), snap(cam.y * (1 - FB) - MARGIN_Y + L.h), L.obj.position.z); continue; }
        if (L.far){   // the painting: never so far off the middle that its edge shows, and made larger only if the view is larger than it
          const vw = size.w / PPU, sc = Math.max(1, (vw + 0.4) / (400 / PPU), (VIEW_H + 0.4) / (224 / PPU)), sx = Math.max(0, (400 / PPU * sc - vw) / 2 - 0.1), sy = Math.max(0, (224 / PPU * sc - VIEW_H) / 2 - 0.1);
          L.obj.scale.set(sc, sc, 1); L.obj.position.set(snap(cam.x + Math.max(-sx, Math.min(sx, (L.ax - cam.x) * L.f))), snap(cam.y + Math.max(-sy, Math.min(sy, (L.ay - cam.y) * L.f))), L.obj.position.z); continue; }
        L.obj.position.set(snap(L.ax + (cam.x - L.ax) * (1 - L.f)), snap(L.ay + (cam.y - L.ay) * (1 - L.f)), L.obj.position.z);
      }
      for (const V of veils){ V.m.position.x = cam.x; V.m.position.y = cam.y; }
    },
    frame(t, hero){
      resize();
      // how deep he is in a room that wears another look: from its edge in, over five units
      { for (const l of ALT) LOOKW[l] = 0; const rm = hero && LEVEL.rooms.find(r => hero.x >= r.x0 && hero.x < r.x1 && hero.y >= r.y0 && hero.y < r.y1);
        if (rm && rm.look && ALT.includes(rm.look)){ const d = Math.min(hero.x - rm.x0, rm.x1 - hero.x, hero.y + 1 - rm.y0, rm.y1 - hero.y - 1), u = Math.max(0, Math.min(1, d / 5)); LOOKW[rm.look] = u * u * (3 - 2 * u); }
        let own = 1; for (const l of ALT) own -= LOOKW[l]; LOOKW[''] = Math.max(0, own); for (const F of fars) F.m.material.opacity = LOOKW[F.look]; }
      const wOf = look => LOOKW[look || ''];
      for (const o of motes){ o.m.position.x += (o.vx + Math.sin(t * 0.7 + o.ph) * 0.05) * 0.016; o.m.position.y += o.vy * 0.016; if (o.m.position.y > cam.y + 7) o.m.position.y = cam.y - 7; else if (o.m.position.y < cam.y - 7) o.m.position.y = cam.y + 7; if (Math.abs(o.m.position.x - cam.x) > 12) o.m.position.x = cam.x + (rnd() - 0.5) * 22; o.m.material.opacity = (o.steady ? 0.9 : 0.5 + 0.5 * Math.sin(t * 2 + o.ph)) * wOf(o.look); }
      for (const f of flames){ const k = f.slow ? 0.06 : 0.12; f.m.scale.setScalar(1 + Math.sin(t * (f.slow ? 2 : 13) + f.ph) * k + (f.slow ? 0 : Math.sin(t * 7.3 + f.ph) * 0.06)); }
      const near = lights.filter(l => !l.off).map(l => ({ l, d: Math.hypot(l.x - cam.x, l.y - cam.y) })).sort((a, b) => a.d - b.d);
      pool.forEach((L, k) => { const n = near[k]; if (!n || n.d > 16){ L.intensity = 0; return; } L.position.set(n.l.x, n.l.y, LIGHT_Z); L.color.setHex(n.l.color); L.distance = n.l.range * 1.15; L.intensity = n.l.power * LIGHT_GAIN * (1 + Math.sin(t * 11 + n.l.ph) * 0.06); });
      if (hero) heroLight.position.set(hero.x, hero.y + 2.4, 1.4);
      // flames: four frames, each torch a little out of step with the next
      flameTexs.forEach((ft, k) => ft.offset.set(Math.floor(t * 9 + k * 1.3) % 4 / 4, 0));
      // mist and the near shapes slide at their own rates (and the mist drifts), a whole pixel at a time
      for (const V of veils){ V.m.material.opacity = V.a * wOf(V.look); V.m.visible = V.m.material.opacity > 0.01; V.tex.repeat.set(V.w / V.tw, V.h / V.th); V.tex.offset.set(Math.round(cam.x * PPU * V.f + t * V.drift * PPU) / V.tw, V.fore ? 0 : Math.round(cam.y * PPU * V.f) / V.th); }
      // light: the region's ambient (dimmer inside, where it has an inside), then the nearest lights
      { const rm = hero && LEVEL.rooms.find(r => hero.x >= r.x0 && hero.x < r.x1 && hero.y >= r.y0 && hero.y < r.y1), inOf = TMx => TMx.ambIn && rm && !rm.open ? TMx.ambIn : TMx.amb, want = [0, 0, 0];
        for (let k = 0; k < 3; k++){ want[k] = inOf(TM)[k] * LOOKW['']; for (const l of ALT) want[k] += inOf(THEMES[l])[k] * LOOKW[l]; }
        for (let k = 0; k < 3; k++) ambNow[k] += (want[k] - ambNow[k]) * 0.06; comp.uniforms.amb.value.set(ambNow[0], ambNow[1], ambNow[2]); comp.uniforms.res.value.set(size.w, size.h);
        const hw = size.w / 2 / PPU, hh = VIEW_H / 2, list = [];
        if (hero) list.push({ x: hero.x, y: hero.y + 1.3, color: 0xffe2c0, power: 0.42, range: 5.5, d: -1 });
        for (const n of near){ if (n.d > 20) break; const l = n.l; list.push({ x: l.x, y: l.y, color: l.color, power: (l.torch ? 0.62 : l.power > 1.6 ? 0.7 : 0.34) * (1 + Math.sin(t * 11 + l.ph) * 0.05 + Math.sin(t * 3.1 + l.ph * 2) * 0.04), range: l.torch ? 6.5 : l.range > 6 ? 7 : 4.2, d: n.d }); }
        for (let i = glints.length - 1; i >= 0; i--){ const G = glints[i]; G.t += 1 / 60; const k = G.life > 0 ? Math.max(0, 1 - G.t / G.life) : 1; list.push({ x: G.x, y: G.y, color: G.color, power: G.power * k, range: G.range, d: -0.5 }); if (G.life <= 0 || G.t >= G.life) glints.splice(i, 1); }
        list.sort((a, b) => a.d - b.d);
        for (let k = 0; k < NL; k++){ const l = list[k]; if (!l){ lc[k].set(0, 0, 0); lp[k].set(0, 0, 0.001); continue; }
          lp[k].set(0.5 + (l.x - cam.x) / (hw * 2), 0.5 + (l.y - cam.y) / (hh * 2), l.range / VIEW_H); lc[k].set((l.color >> 16 & 255) / 255 * l.power, (l.color >> 8 & 255) / 255 * l.power, (l.color & 255) / 255 * l.power); } }
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
  const t = new THREE.TextureLoader().load(url, tx => { tx.needsUpdate = true; tx.ready = true; }, undefined, () => { t.ready = true; });
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.repeat.set(1 / frames, 1);
  return t;
}
export function makeSprite(scene, base, meta){
  const g = new THREE.Group(); scene.add(g);
  const mat = lit({ transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x000000 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); g.add(plane);
  // strips are loaded when first drawn (a character has more than it uses); a strip's normal map shares its frames
  const tex = {}, nrm = {}, texOf = a => tex[a] || (tex[a] = strip(`${base}/${a}.png`, meta.anims[a].frames)), nrmOf = a => !meta.anims[a].n ? null : nrm[a] || (nrm[a] = strip(`${base}/${a}_n.png`, meta.anims[a].frames));
  const ppu = meta.ppu || 64, S = { g, plane, mat, anim: null };
  // the strips asked for ahead of their first use (all of them, or those named), so nothing is drawn before it is in;
  // in(): whether every strip asked for so far has come
  S.warm = names => { for (const a of names || Object.keys(meta.anims)) if (meta.anims[a]){ texOf(a); if (!FLAT) nrmOf(a); } return S; };
  S.in = () => Object.values(tex).every(t => t.ready);
  // anchor 'last': place the drawing by where its last frame stands (a climb ends on top of the ledge he is put on).
  // anchor { foot, cx }: place it by that row and column of its canvas (a climb, each frame set on the ledge's corner)
  S.show = (anim, frac, x, y, face, z = 0.05, rot = 0, anchor = null) => {
    const A0 = meta.anims[anim] || meta.anims.stand; if (!A0) return;
    const A = anchor === 'last' && A0.footLast != null ? { ...A0, foot: A0.footLast, cx: A0.cxLast } : anchor && typeof anchor === 'object' ? { ...A0, ...anchor } : A0;
    if (S.anim !== anim){ const key = meta.anims[anim] ? anim : 'stand'; mat.map = texOf(key); mat.normalMap = FLAT ? null : nrmOf(key); mat.needsUpdate = true; S.anim = anim; }
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

// ---- the combo's cuts, drawn by PixelLab's VFX Creator around the warrior's own strips (tools/vfx-pack.py): each effect
// has a layer behind him and one in front, and its frame i goes with the strip's frame i. show() every frame: it draws
// the effect for that strip and frame, or nothing
const SWING_FX = ['cut1', 'cut2', 'cut3'];
export function makeSwingFx(scene){
  const byAnim = {}, meshes = [];
  for (const name of SWING_FX) fetch(`assets/side/vfx/${name}/fx.json`).then(r => r.ok ? r.json() : null).then(fx => {
    if (!fx) return;
    byAnim[fx.anim] = fx.layers.map(L => {
      const t = pixTex(`assets/side/vfx/${name}/${L.file}`); t.repeat.set(1 / L.cols, 1 / L.rows);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(L.fw / PPU, L.fh / PPU), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: false }));
      m.visible = false; m.position.z = L.depth === 'behind' ? 0.045 : 0.06; scene.add(m); meshes.push(m); return { L, m, t, frames: fx.frames };
    });
  }).catch(() => {});
  return {
    has: anim => !!byAnim[anim],
    // anim, frac: the warrior's drawing and how far into it; x, y: his feet; face: which way
    show(anim, frac, x, y, face){
      for (const m of meshes) m.visible = false;
      const set = byAnim[anim]; if (!set) return;
      for (const { L, m, t, frames } of set){
        const i = Math.min(frames - 1, Math.floor(frac * frames)), k = i - L.start; if (k < 0 || k >= L.frames) continue;
        t.offset.set((k % L.cols) / L.cols, 1 - (Math.floor(k / L.cols) + 1) / L.rows);
        const cx = (L.dx + L.fw / 2) / PPU, cy = (L.dy + L.fh / 2) / PPU;
        m.position.x = Math.round((x + cx * face) * PPU) / PPU; m.position.y = Math.round((y - cy) * PPU) / PPU; m.scale.x = face; m.visible = true;
      }
    },
  };
}
