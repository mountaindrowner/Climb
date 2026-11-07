// Art review of a GLB through the game's own three.js: a turnaround at rest, then frames from every clip, lit like the
// shaft (a warm torch, a cold fill). Writes tools/out/model-<name>-sheet.png.
// Usage: MODEL=assets/models/bat/bat.glb node tools/model-review.mjs   (FRAMES=4 frames per clip, CLIPS=a,b only those clips, HIDE=node,node,
// FOCUS=node to frame the clips on one node, FIT=0.45 how much of the model the frame holds)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
function loadPlaywright(){
  for (const r of [root, ...(process.env.NODE_PATH || '').split(':').filter(Boolean), '/opt/node-tools']){ try { return createRequire(r.endsWith('/') ? r : r + '/')('playwright'); } catch {} }
  console.error('playwright not found'); process.exit(2);
}
const { chromium } = loadPlaywright();
const MODEL = process.env.MODEL || 'assets/models/bat/bat.glb', NAME = MODEL.split('/').pop().replace(/\.\w+$/, '');
const FRAMES = +(process.env.FRAMES || 4), PORT = 8126;
const outDir = fileURLToPath(new URL('./out/', import.meta.url)); mkdirSync(outDir, { recursive: true });
const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.route(/^(?!http:\/\/localhost)/, r => r.abort());
await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "domcontentloaded" });   /* a page of the server: the review then shares its origin */
await page.setContent(`<body style="margin:0;background:#111"><script src="http://localhost:${PORT}/vendor/three/three.min.js"></script><script src="http://localhost:${PORT}/vendor/three/GLTFLoader.js"></script></body>`);
await page.waitForFunction(() => window.THREE && THREE.GLTFLoader);
const shots = await page.evaluate(async ({ url, FRAMES, HEAD, CLIPS, HIDE, FOCUS, FIT }) => { const process = { env: { HEAD } };
  const W = 400, H = 360, r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r.setSize(W, H); document.body.appendChild(r.domElement);
  /* colour goes to the screen as the game sends it: linear, no sRGB curve */
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2630);
  scene.add(new THREE.HemisphereLight(0x8a90b8, 0x2a1c18, 0.9));
  const torch = new THREE.PointLight(0xffb070, 1.6, 0, 1.2); torch.position.set(2, 2.5, 3); scene.add(torch);
  const rim = new THREE.DirectionalLight(0x7fb6d8, 0.7); rim.position.set(-3, 2, -2); scene.add(rim);
  const gltf = await new Promise((res, rej) => new THREE.GLTFLoader().load(url, res, undefined, rej));
  const model = gltf.scene; scene.add(model);
  model.traverse(o => { if (o.isMesh){ o.frustumCulled = false; } if (HIDE.includes(o.name)) o.visible = false; });
  const mixer = new THREE.AnimationMixer(model), cam = new THREE.PerspectiveCamera(35, W / H, 0.01, 100);
  const box = new THREE.Box3().setFromObject(model), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
  const shoot = (az, el, label, fit = 1.15) => {
    const d = size * fit / (2 * Math.tan(35 * Math.PI / 360));
    cam.position.set(c.x + Math.sin(az) * Math.cos(el) * d, c.y + Math.sin(el) * d, c.z + Math.cos(az) * Math.cos(el) * d); cam.lookAt(c);
    r.render(scene, cam); return [label, r.domElement.toDataURL('image/png')];
  };
  const out = [];
  for (const [az, el, l] of [[0, 0.15, 'front'], [Math.PI / 2, 0.1, 'side'], [Math.PI, 0.2, 'back'], [0.6, 0.9, 'above'], [-0.7, 0.35, 'three-quarter']]) out.push(shoot(az, el, 'rest, ' + l));
  // close-ups of the head, front and three-quarter, in the resting pose
  const hd = model.getObjectByName(process.env.HEAD || 'head');
  if (hd){ const hc = new THREE.Vector3(); hd.getWorldPosition(hc); const keep = c.clone(); c.copy(hc); out.push(shoot(0.25, 0.15, 'head, front', 0.32), shoot(-0.9, 0.25, 'head, three-quarter', 0.32)); c.copy(keep); }
  for (const clip of gltf.animations){
    if (CLIPS && !CLIPS.includes(clip.name)) continue;
    const a = mixer.clipAction(clip); a.play();
    for (let i = 0; i < FRAMES; i++){
      a.time = clip.duration * i / FRAMES; mixer.update(0); model.updateMatrixWorld(true);
      if (FOCUS){ const f = model.getObjectByName(FOCUS); if (f){ f.getWorldPosition(c); } }
      out.push(shoot(FOCUS ? -1.25 : -0.7, FOCUS ? 0.15 : 0.3, `${clip.name} ${i + 1}/${FRAMES}`, FOCUS ? FIT : 1.15));
    }
    a.stop();
  }
  return out;
}, { url: `http://localhost:${PORT}/${MODEL}`, FRAMES, HEAD: process.env.HEAD || 'head', CLIPS: process.env.CLIPS ? process.env.CLIPS.split(',') : null, HIDE: (process.env.HIDE || '').split(','), FOCUS: process.env.FOCUS || '', FIT: +(process.env.FIT || 0.45) });
const html = `<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(5,280px);gap:4px;padding:4px;font:12px sans-serif;color:#ddd">${shots.map(([l, d]) => `<figure style="margin:0"><img src="${d}" style="width:280px;display:block"><figcaption>${l}</figcaption></figure>`).join('')}</body>`;
const sheet = await browser.newPage({ viewport: { width: 5 * 284 + 4, height: 300 } });
await sheet.setContent(html); await sheet.waitForTimeout(200);
const path = `${outDir}model-${NAME}-sheet.png`;
await sheet.screenshot({ path, fullPage: true });
if (errors.length){ console.error(errors.join('\n')); process.exit(1); }
console.log(shots.length, 'shots ->', path);
await browser.close(); server.kill(); process.exit(0);
