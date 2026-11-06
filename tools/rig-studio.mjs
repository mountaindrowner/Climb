// Studio sheets of a warrior GLB, outside the game: a turnaround of the rest pose and a filmstrip of each clip, under
// neutral light and under the game's cave light. For judging the asset itself (proportions, clipping, silhouette).
// Usage: node tools/rig-studio.mjs [path.glb] [clip,clip,...]  -> tools/out/studio-<name>-*.png
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const { chromium } = (() => { for (const r of [root, '/opt/node-tools/']) { try { return createRequire(r)('playwright'); } catch {} } process.exit(2); })();
const outDir = fileURLToPath(new URL('./out/', import.meta.url)); mkdirSync(outDir, { recursive: true });
const file = process.argv[2] || 'assets/models/knight/knight.glb', name = basename(file).replace(/\.\w+$/, '');
const only = process.argv[3] ? process.argv[3].split(',') : null;
const PORT = 8126;
const server = spawn(process.execPath, [root + 'tools/serve.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 500));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const W = 1200, H = 260;
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', e => console.error(e.message));
await page.goto(`http://localhost:${PORT}/tools/serve.mjs`);
await page.setContent(`<body style="margin:0;background:#16131c"><script src="/vendor/three/three.min.js"></script><script src="/vendor/three/GLTFLoader.js"></script></body>`);
await page.waitForFunction(() => window.THREE && THREE.GLTFLoader);
const clips = await page.evaluate(async ([file, W, H]) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.outputEncoding = THREE.sRGBEncoding; document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x16131c);
  const at = (l, x, y, z) => { l.position.set(x, y, z); return l; };
  const lights = {
    studio: [new THREE.HemisphereLight(0xffffff, 0x404040, 0.9), at(new THREE.DirectionalLight(0xffffff, 0.9), 2, 4, 3)],
    cave: [new THREE.HemisphereLight(0x6f7fa8, 0x241c22, 0.55), at(new THREE.PointLight(0xffb070, 2.2, 12, 2), 1.5, 3, 2.5), at(new THREE.DirectionalLight(0x8fb4ff, 0.6), -3, 2, -2)],
  };
  const g = await new Promise((res, rej) => new THREE.GLTFLoader().load('/' + file, res, undefined, rej));
  const N = 8, cells = [];
  // one model per cell: clone by reloading (SkeletonUtils is not vendored)
  const models = [];
  for (let i = 0; i < N; i++){ const gg = i ? await new Promise(res => new THREE.GLTFLoader().load('/' + file, res)) : g; const m = gg.scene; m.traverse(o => { if (o.name === 'Knight_Head') o.material = new THREE.MeshBasicMaterial({ color: 0x040306, skinning: true }); if (/^eye_/.test(o.name)) o.material = new THREE.MeshBasicMaterial({ color: 0xa9d6ff }); if (o.isMesh && o.material && /knight_texture|barbarian_texture/.test(o.material.name)) o.material.color.setRGB(1.55, 1.42, 1.28); /* as in the game */ if (/^wep_(pick|spear)/.test(o.name)) o.visible = !!window.__wep && o.name === 'wep_' + window.__wep; if (o.name === 'wep_sword') o.visible = !window.__wep; }); m.position.x = (i - (N - 1) / 2) * 1.55; scene.add(m); models.push({ m, mixer: new THREE.AnimationMixer(m), anims: gg.animations }); }
  const box = new THREE.Box3().setFromObject(g.scene), h = box.max.y - box.min.y || 2;
  for (const { m } of models) m.scale.setScalar(2 / h);
  const cam = new THREE.OrthographicCamera(-W / H * 1.45, W / H * 1.45, 1.45, -1.45, 0.1, 50); cam.position.set(0, 1.15, 10); cam.lookAt(0, 1.15, 0);
  window.__shoot = (clip, mode, light) => {
    for (const k in lights) for (const l of lights[k]) scene.remove(l);
    for (const l of lights[light]) scene.add(l);
    models.forEach(({ m, mixer, anims }, i) => {
      mixer.stopAllAction();
      if (mode === 'turn'){ m.rotation.y = i * Math.PI / 4; const a = anims.find(a => a.name === clip); if (a){ const x = mixer.clipAction(a); x.play(); x.time = 0; } }
      else { m.rotation.y = Math.PI / 2; const a = anims.find(a => a.name === clip); if (a){ const x = mixer.clipAction(a); x.play(); x.time = a.duration * i / (N - 1) * 0.999; } }
      mixer.update(0);
    });
    renderer.render(scene, cam);
  };
  // a close look at the face: the front and three-quarter models of the turnaround
  window.__face = light => {
    window.__shoot('Idle', 'turn', light);
    const m0 = models[0].m, m1 = models[1].m, b = new THREE.Box3().setFromObject(m0);
    const fc = cam.clone(); fc.zoom = 4.2; fc.position.set((m0.position.x + m1.position.x) / 2, b.max.y - 0.28, 10); fc.lookAt(fc.position.x, fc.position.y, 0); fc.updateProjectionMatrix();
    renderer.render(scene, fc);
  };
  return g.animations.map(a => a.name);
}, [file, W, H]);
const want = only || clips;
const shoot = async (clip, mode, light, tag) => { await page.evaluate(([c, m, l]) => window.__shoot(c, m, l), [clip, mode, light]); await page.screenshot({ path: `${outDir}studio-${name}-${tag}.png` }); };
await shoot('Idle', 'turn', 'studio', 'turn');
await shoot('Idle', 'turn', 'cave', 'turn-cave');
for (const l of ['studio', 'cave']){ await page.evaluate(l => window.__face(l), l); await page.screenshot({ path: `${outDir}studio-${name}-face-${l}.png` }); }
for (const c of want) if (clips.includes(c)) await shoot(c, 'strip', 'studio', 'clip-' + c);
console.log('clips:', clips.join(' '));
await browser.close(); server.kill(); process.exit(0);
