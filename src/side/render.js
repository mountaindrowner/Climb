// The side view, drawn: 2.5D. The world is a plane of tiles at z = 0 seen by a narrow perspective camera, so the stone
// has depth (its top and sides show as you move) and the background layers further back slide past slower (parallax).
// Characters are pixel-art sprites (PixelLab, tools/pixellab.py) on lit planes. The look is bright and saturated: deep
// blue stone lit by warm torches and cold crystals, and everything that glows blooms.
//
// Pixel-exact: the scene renders at its native resolution (PPU pixels to a unit, so the sprites' pixels are the
// screen's) into a target, then glow is added and the frame is scaled up a whole number of times, unsmoothed.
import { T, ROCK, LEDGE, SPIKES, LEVEL, tileAt } from './level.js';
const THREE = window.THREE;
export const PPU = 64;                  // pixels to a world unit: a tile is 32, the warrior ~112 tall
export const VIEW_H = 11.25;            // world units the screen is tall (720 pixels at PPU)
const FOV = 26;

// ---- pixel textures, painted here (the rock is ours; the characters are PixelLab's)
function canvasTex(w, h, paint){
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint(g, w, h);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
function stoneTex(base, hi, lo){
  return canvasTex(32, 32, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 90; i++){ g.fillStyle = rnd() < 0.5 ? hi : lo; g.globalAlpha = 0.25 + rnd() * 0.3; g.fillRect((rnd() * 32) | 0, (rnd() * 32) | 0, 1 + (rnd() * 3 | 0), 1 + (rnd() * 2 | 0)); }
    g.globalAlpha = 1;
    // bricks: mortar lines, a lit top edge and a dark lower edge on each
    g.fillStyle = lo; for (const y of [0, 16]) g.fillRect(0, y, 32, 1);
    for (const [x, y] of [[0, 0], [16, 16]]) g.fillRect(x, y, 1, 16);
    g.fillStyle = hi; g.globalAlpha = 0.6; for (const y of [1, 17]) g.fillRect(0, y, 32, 1); g.globalAlpha = 1;
  });
}
function glowTex(color){
  return canvasTex(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

export function makeRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.autoClear = false;
  canvas.style.imageRendering = 'pixelated';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b1024);
  scene.fog = new THREE.Fog(0x0b1024, 26, 70);
  const camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.5, 200);
  const dist = (VIEW_H / 2) / Math.tan(FOV / 2 * Math.PI / 180);
  // ---- light: a cool blue fill from above, a violet bounce from below, then the torches and crystals, close up
  scene.add(new THREE.HemisphereLight(0x6f8fff, 0x40205a, 0.75));
  const key = new THREE.DirectionalLight(0xaecbff, 0.5); key.position.set(-3, 8, 10); scene.add(key);
  const heroLight = new THREE.PointLight(0xffd2a0, 1.1, 9, 2); scene.add(heroLight);
  // ---- the rock: a block per solid tile whose face shows, deep enough to read as stone in 2.5D
  const rockMat = new THREE.MeshLambertMaterial({ map: stoneTex('#2c4a6e', '#5f8fc4', '#141f38') });
  const ledgeMat = new THREE.MeshLambertMaterial({ map: stoneTex('#6b4a33', '#c79a62', '#2a1810') });
  const spikeMat = new THREE.MeshLambertMaterial({ color: 0xd9dcef, emissive: 0x401020 });
  const DEPTH = 2.2;
  const shown = [];
  for (let j = 0; j < LEVEL.H; j++) for (let i = 0; i < LEVEL.W; i++){
    const t = tileAt(i, j); if (t === 0) continue;
    if (t === ROCK){ const open = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([a, b]) => tileAt(i + a, j + b) !== ROCK); shown.push({ i, j, t, deep: !open }); }
    else shown.push({ i, j, t });
  }
  const rocks = shown.filter(s => s.t === ROCK), dummy = new THREE.Object3D();
  // the depth of the rock: a block per solid tile behind its face, its sides dark and its top (where open to the air)
  // the glowing moss of the tiles' top edges
  const side = new THREE.MeshLambertMaterial({ color: 0x1b2d52 }), mossTop = new THREE.MeshLambertMaterial({ color: 0x1f4a52, emissive: 0x041612 }), hidden = new THREE.MeshBasicMaterial({ color: 0x0b1024 });
  const exposedTop = s => tileAt(s.i, s.j + 1) !== ROCK;
  for (const top of [true, false]){
    const set = rocks.filter(s => exposedTop(s) === top);
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(T, T, DEPTH), [side, side, top ? mossTop : side, side, hidden, side], Math.max(1, set.length));
    set.forEach((s, k) => { dummy.position.set((s.i + 0.5) * T, (s.j + 0.5) * T, -DEPTH / 2 - 0.01); dummy.updateMatrix(); mesh.setMatrixAt(k, dummy.matrix); });
    scene.add(mesh);
  }
  // the faces: PixelLab's side-scroller corner tiles (tools/pixellab.py tileset), on the dual grid: one tile on each
  // corner where four map cells meet, picked by which of the four are rock; deep inside the rock they darken
  const depthTo = new Map();   // how many tiles from open air, up to 4
  for (const s of rocks){ let d = 4; for (let r = 1; r <= 3 && d === 4; r++) for (let a = -r; a <= r && d === 4; a++) for (let b = -r; b <= r; b++) if (tileAt(s.i + a, s.j + b) !== ROCK){ d = r; break; } depthTo.set(s.i + ',' + s.j, d); }
  fetch('assets/side/tiles/stone/tileset.json').then(r => r.json()).then(ts => {
    const byKey = new Map(), L = c => c === 'lower' ? 1 : 0;
    ts.tileset.tiles.forEach((t, n) => byKey.set([t.corners.NW, t.corners.NE, t.corners.SW, t.corners.SE].map(L).join(''), n));
    const groups = new Map();
    for (let vy = 0; vy <= LEVEL.H; vy++) for (let vx = 0; vx <= LEVEL.W; vx++){
      const NW = tileAt(vx - 1, vy) === ROCK, NE = tileAt(vx, vy) === ROCK, SW = tileAt(vx - 1, vy - 1) === ROCK, SE = tileAt(vx, vy - 1) === ROCK;
      if (!(NW || NE || SW || SE)) continue;
      const key = [NW, NE, SW, SE].map(Number).join(''), n = byKey.get(key); if (n == null) continue;
      const deep = Math.min(...[[vx - 1, vy], [vx, vy], [vx - 1, vy - 1], [vx, vy - 1]].map(([a, b]) => depthTo.get(a + ',' + b) ?? 0));
      (groups.get(n) || groups.set(n, []).get(n)).push({ x: vx * T, y: vy * T, deep });
    }
    for (const [n, list] of groups){
      const tex = new THREE.TextureLoader().load(`assets/side/tiles/stone/tile_${String(n).padStart(2, '0')}.png`); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
      const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(T, T), new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5 }), list.length);
      list.forEach((p, k) => { dummy.position.set(p.x, p.y, 0); dummy.updateMatrix(); mesh.setMatrixAt(k, dummy.matrix); const v = [1, 1, 0.78, 0.5, 0.3][p.deep]; col.setRGB(v, v, v); mesh.setColorAt(k, col); });
      scene.add(mesh);
    }
  });
  const col = new THREE.Color();
  const ledges = shown.filter(s => s.t === LEDGE), ledgeMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(T * 1.02, T * 0.32, DEPTH * 0.7), ledgeMat, Math.max(1, ledges.length));
  ledges.forEach((s, k) => { dummy.position.set((s.i + 0.5) * T, (s.j + 1) * T - T * 0.16, -DEPTH * 0.35); dummy.updateMatrix(); ledgeMesh.setMatrixAt(k, dummy.matrix); });
  scene.add(ledgeMesh);
  const spikes = shown.filter(s => s.t === SPIKES), spikeMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(T * 0.22, T * 0.8, 4), spikeMat, Math.max(1, spikes.length * 2));
  spikes.forEach((s, k) => { for (const o of [0.25, 0.75]){ dummy.position.set((s.i + o) * T, s.j * T + T * 0.4, -0.3); dummy.updateMatrix(); spikeMesh.setMatrixAt(k * 2 + (o > 0.5 ? 1 : 0), dummy.matrix); } });
  scene.add(spikeMesh);
  // ---- behind the play: a far wall of cave and two layers of silhouetted pillars, lit cold
  const W = LEVEL.W * T, Hh = LEVEL.H * T;
  // the painted cavern (PixelLab), far back and moving a little with the camera: the deep parallax layer. Unlit: it
  // is the dark the lit world stands against
  const farTex = new THREE.TextureLoader().load('assets/side/bg/far.png'); farTex.magFilter = farTex.minFilter = THREE.NearestFilter; farTex.generateMipmaps = false;
  const BACK_Z = -40, backH = VIEW_H * (dist - BACK_Z) / dist * 1.25;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(backH * 400 / 224, backH), new THREE.MeshBasicMaterial({ map: farTex, fog: false, color: 0x7a86a8 }));
  scene.add(back);
  // ---- marks: torches (a warm flame and light) and crystals (a cold glow), all bright enough to bloom
  const flames = [], lights = [];
  const torchGlow = glowTex('rgba(255,170,60,1)'), crystalGlow = glowTex('rgba(80,240,255,1)');
  for (const m of LEVEL.marks){
    const x = (m.x + 0.5) * T, y = m.y * T;
    if (m.type === 'torch'){
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), new THREE.MeshLambertMaterial({ color: 0x5a3a24 })); post.position.set(x, y + 0.25, -0.4); scene.add(post);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: torchGlow, transparent: true, depthWrite: false, color: 0xffd090, blending: THREE.AdditiveBlending }));
      fl.position.set(x, y + 0.62, -0.35); scene.add(fl); flames.push({ m: fl, base: y + 0.62, ph: rnd() * 9 });
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.1), new THREE.MeshBasicMaterial({ color: 0xffe6a0 })); core.position.set(x, y + 0.6, -0.38); scene.add(core);
      lights.push({ x, y: y + 0.8, color: 0xff9a40, power: 1.6, range: 7, ph: rnd() * 9 });
    }
    if (m.type === 'crystal'){
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshBasicMaterial({ color: 0x5ff6ff })); cr.scale.set(0.7, 1.6, 0.7); cr.position.set(x, y + 0.42, -0.6); scene.add(cr);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: crystalGlow, transparent: true, depthWrite: false, color: 0x60e8ff, blending: THREE.AdditiveBlending, opacity: 0.55 }));
      gl.position.set(x, y + 0.45, -0.5); scene.add(gl); flames.push({ m: gl, base: y + 0.45, ph: rnd() * 9, slow: true });
      lights.push({ x, y: y + 0.5, color: 0x40e0ff, power: 1.2, range: 6, ph: rnd() * 9 });
    }
    if (m.type === 'exit'){
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffe9a8 })); arch.position.set(x, y + 0.1, -0.6); scene.add(arch);
      lights.push({ x, y: y + 1, color: 0xffe0a0, power: 2, range: 8, ph: 0 });
    }
  }
  // ---- the air: motes of light drifting through the dark, and soft shafts of light falling through every opening in a
  // room's roof (a gap in the rock straight up)
  const moteTex = glowTex('rgba(200,240,255,1)'), motes = [];
  for (let k = 0; k < 90; k++){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshBasicMaterial({ map: moteTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: rnd() < 0.3 ? 0xffd8a0 : 0x9fe8ff }));
    m.position.set(rnd() * W, rnd() * Hh, -rnd() * 3 + 0.5); scene.add(m); motes.push({ m, vx: (rnd() - 0.5) * 0.2, vy: 0.05 + rnd() * 0.15, ph: rnd() * 9 });
  }
  const shaftTex = canvasTex(32, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(170,230,255,0.55)'); gr.addColorStop(1, 'rgba(170,230,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
  shaftTex.minFilter = shaftTex.magFilter = THREE.LinearFilter;
  for (let i = 1; i < LEVEL.W - 1; i++) for (let j = 2; j < LEVEL.H - 1; j++){
    // the bottom of an opening: open here, rock to either side a few tiles up, and open sky above for a while
    if (tileAt(i, j) !== 0 || tileAt(i, j + 1) !== 0 || tileAt(i - 1, j + 1) === 0 || i % 3) continue;
    let up = 0; while (up < 8 && tileAt(i, j + up) === 0) up++;
    if (up < 8 || tileAt(i, j - 1) !== 0) continue;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }));
    sh.position.set((i + 0.5) * T, (j + 1) * T - 3.5, -0.8); sh.rotation.z = 0.18; scene.add(sh);
  }
  // point lights are expensive: a fixed pool follows the nearest light marks
  const pool = []; for (let k = 0; k < 6; k++){ const L = new THREE.PointLight(0xffffff, 0, 7, 2); scene.add(L); pool.push(L); }

  // ---- glow: bright parts of the frame, blurred and added back
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  let main = rt(4, 4), b1 = rt(2, 2), b2 = rt(2, 2), size = { w: 4, h: 4, scale: 1 };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); const qScene = new THREE.Scene(); qScene.add(quad); const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  const bright = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, th: { value: 0.72 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float th; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(th, 1.0, l), 1.); }' });
  const blur = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb * 0.227; for (int i = 1; i < 5; i++){ float w = i == 1 ? 0.195 : i == 2 ? 0.122 : i == 3 ? 0.054 : 0.016; c += (texture2D(tex, vUv + dir * float(i)).rgb + texture2D(tex, vUv - dir * float(i)).rgb) * w; } gl_FragColor = vec4(c, 1.); }' });
  const comp = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, glow: { value: null }, amt: { value: 1.25 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform sampler2D glow; uniform float amt; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb + texture2D(glow, vUv).rgb * amt; c = c / (1.0 + 0.12 * c); gl_FragColor = vec4(pow(c, vec3(0.95)), 1.); }' });
  main.texture.minFilter = main.texture.magFilter = THREE.NearestFilter;
  function pass(mat, target){ quad.material = mat; renderer.setRenderTarget(target); renderer.clear(); renderer.render(qScene, qCam); }

  function resize(){
    const cw = canvas.clientWidth || innerWidth, ch = canvas.clientHeight || innerHeight;
    const scale = Math.max(1, Math.round(ch / 720)), w = Math.round(cw / scale), h = Math.round(ch / scale);
    if (w === size.w && h === size.h) return;
    size = { w, h, scale }; renderer.setSize(w, h, false);
    main.setSize(w, h); b1.setSize(w >> 2, h >> 2); b2.setSize(w >> 2, h >> 2);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  const cam = { x: 0, y: 0 };
  return {
    scene, camera, dist, size: () => size,
    setCamera(x, y){ cam.x = x; cam.y = y; camera.position.set(x, y + 0.3, dist); camera.lookAt(x, y, 0); back.position.set(x - (x - W / 2) * 0.08, y - (y - Hh / 2) * 0.08, BACK_Z); },
    frame(t, hero){
      resize();
      for (const o of motes){ o.m.position.x += (o.vx + Math.sin(t * 0.7 + o.ph) * 0.05) * 0.016; o.m.position.y += o.vy * 0.016; if (o.m.position.y > cam.y + 7) o.m.position.y = cam.y - 7; if (Math.abs(o.m.position.x - cam.x) > 12) o.m.position.x = cam.x + (rnd() - 0.5) * 22; o.m.material.opacity = 0.5 + 0.5 * Math.sin(t * 2 + o.ph); }
      for (const f of flames){ const k = f.slow ? 0.06 : 0.12; f.m.scale.setScalar(1 + Math.sin(t * (f.slow ? 2 : 13) + f.ph) * k + (f.slow ? 0 : Math.sin(t * 7.3 + f.ph) * 0.06)); }
      // the nearest lights get the pool
      const near = lights.map(l => ({ l, d: Math.hypot(l.x - cam.x, l.y - cam.y) })).sort((a, b) => a.d - b.d);
      pool.forEach((L, k) => { const n = near[k]; if (!n || n.d > 16){ L.intensity = 0; return; } L.position.set(n.l.x, n.l.y, 0.9); L.color.setHex(n.l.color); L.distance = n.l.range; L.intensity = n.l.power * (1 + Math.sin(t * 11 + n.l.ph) * 0.06); });
      if (hero) heroLight.position.set(hero.x, hero.y + 1.4, 1.6);
      renderer.setRenderTarget(main); renderer.clear(); renderer.render(scene, camera);
      bright.uniforms.tex.value = main.texture; pass(bright, b1);
      blur.uniforms.tex.value = b1.texture; blur.uniforms.dir.value.set(1 / b1.width, 0); pass(blur, b2);
      blur.uniforms.tex.value = b2.texture; blur.uniforms.dir.value.set(0, 1 / b1.height); pass(blur, b1);
      blur.uniforms.tex.value = b1.texture; blur.uniforms.dir.value.set(2 / b1.width, 0); pass(blur, b2);
      blur.uniforms.tex.value = b2.texture; blur.uniforms.dir.value.set(0, 2 / b1.height); pass(blur, b1);
      comp.uniforms.tex.value = main.texture; comp.uniforms.glow.value = b1.texture; pass(comp, null);
    },
  };
}

// ---- a sprite: frames from a strip (tools/pixellab.py), drawn on a lit plane, feet on its position, mirrored to face left
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
  const S = { g, plane, mat, anim: null };
  S.show = (anim, frac, x, y, face, z = 0.05, rot = 0) => {
    const A = meta.anims[anim] || meta.anims.stand; if (!A) return;
    if (S.anim !== anim){ mat.map = tex[anim] || tex.stand; mat.needsUpdate = true; S.anim = anim; }
    const n = A.frames, i = Math.min(n - 1, Math.floor(((frac % 1) + 1) % 1 * n));
    mat.map.offset.set(i / n, 0);
    const w = A.w / PPU, h = A.h / PPU;
    plane.scale.set(w * (face < 0 ? -1 : 1), h, 1);
    // its feet (the painted bottom) on y; its middle on x
    // turned (a somersault) about his middle, not his feet
    const PIV = 0.85, ox = (A.w / 2 - A.cx) / PPU * (face < 0 ? -1 : 1), oy = A.foot / PPU - h / 2 - 0.02 - PIV, c = Math.cos(rot), s = Math.sin(rot);
    plane.position.set(ox * c - oy * s, ox * s + oy * c, 0); plane.rotation.z = rot;
    g.position.set(x, y + PIV, z);
  };
  return S;
}
