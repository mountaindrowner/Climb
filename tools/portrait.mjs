// Close-up screenshots of the warrior (climbing, attacking, blocking, ducking) and the Warden (idle, slam, sweep, kneel)
// for art review. Writes tools/out/portrait-*.png. Usage: node tools/portrait.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
function loadPlaywright(){
  for (const r of [root, ...(process.env.NODE_PATH || '').split(':').filter(Boolean), '/opt/node-tools']){ try { return createRequire(r.endsWith('/') ? r : r + '/')('playwright'); } catch {} }
  console.error('playwright not found'); process.exit(2);
}
const { chromium } = loadPlaywright();
const out = new URL('./out/', import.meta.url); mkdirSync(out, { recursive: true });
const PORT = 8124;
const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.route(/^(?!http:\/\/localhost)/, r => r.abort());
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__climb && window.__climb.ST.mode === 'title');
await page.addScriptTag({ type: 'module', content: `
  import { startClimb } from '/src/modes/climb.js';
  import { landingS } from '/src/world/path.js';
  import { hideMenu } from '/src/ui/overlay.js';
  window.__go = s => { hideMenu(); startClimb(s); };
  window.__landingS = landingS; window.__ready = true;` });
await page.waitForFunction(() => window.__ready);
const shot = name => page.screenshot({ path: fileURLToPath(new URL(`./portrait-${name}.png`, out)), clip: { x: 0, y: 0, width: 390, height: 640 } });
const cam = (back, up, look, lead) => page.evaluate(([b, u, l, d]) => { const c = window.__climb.TUNE.camera.climb; c.back = b; c.up = u; c.look = l; c.lead = d; }, [back, up, look, lead]);

// ---- studio: the Warden on its own, in front of the title camera, with the through-the-wall arm and head beside it
await page.addScriptTag({ type: 'module', content: `
  import { makeWarden, makeWardenArm, makeWardenHead } from '/src/wardens/model.js';
  import { scene, camera } from '/src/render/renderer.js';
  import { ST } from '/src/core/state.js';
  import { R } from '/src/config/constants.js';
  window.__studio = (z, what, off = -0.55) => {
    if (window.__studioRoot) scene.remove(window.__studioRoot);
    const root = new window.THREE.Group(); window.__studioRoot = root; scene.add(root);
    const a = ST.cam.ang;
    // rotation.y = t points local +x at (cos t, 0, -sin t); aim +x (the face) at the camera, then turn by off
    const face = (obj) => { const dx = camera.position.x - obj.position.x, dz = camera.position.z - obj.position.z; obj.rotation.y = Math.atan2(-dz, dx) + off; };
    const key = new window.THREE.PointLight(0xffd9a8, 1.3, 20, 2); key.position.set((R - 4) * Math.cos(a - 0.4), 6, (R - 4) * Math.sin(a - 0.4)); root.add(key);
    const fill = new window.THREE.PointLight(0x8fb4ff, 0.5, 20, 2); fill.position.set((R - 3) * Math.cos(a + 0.5), 2, (R - 3) * Math.sin(a + 0.5)); root.add(fill);
    if (what === 'body'){ const M = makeWarden(z); M.G.position.set((R - 1.2) * Math.cos(a), 0.2, (R - 1.2) * Math.sin(a)); face(M.G); root.add(M.G); }
    else {
      const A = makeWardenArm(z); A.g.position.set((R - 1.0) * Math.cos(a + 0.12), 3.2, (R - 1.0) * Math.sin(a + 0.12)); face(A.g); A.g.rotation.y += 0.6; A.g.rotation.z = -0.5; root.add(A.g);
      const H = makeWardenHead(z); H.g.position.set((R - 1.4) * Math.cos(a - 0.28), 0.6, (R - 1.4) * Math.sin(a - 0.28)); face(H.g); H.g.rotation.y += 0.25; root.add(H.g);
    }
  };
  window.__studioOff = () => { if (window.__studioRoot) scene.remove(window.__studioRoot); window.__studioRoot = null; };
  window.__ready2 = true;` });
await page.waitForFunction(() => window.__ready2);
await page.evaluate(() => { const c = window.__climb.TUNE.camera.title; c.back = -3.4; c.up = 4.6; c.look = 3.1; document.getElementById('overlay').classList.remove('show'); });
for (const [z, off, tag] of [[0, 0.45, 'z1'], [2, -0.45, 'z3'], [0, 2.6, 'z1-back']]){
  await page.evaluate(([z, off]) => window.__studio(z, 'body', off), [z, off]); await page.waitForTimeout(500); await shot(`studio-warden-${tag}`);
}
await page.evaluate(() => window.__studio(0, 'parts', 0)); await page.waitForTimeout(500); await shot('studio-parts');
await page.evaluate(() => { window.__studioOff(); document.getElementById('overlay').classList.add('show'); });

// ---- the warrior, close
await page.evaluate(() => { window.__climb.TUNE.climb.baseSpeed = 0.0001; window.__go(3.3); });
await cam(3.6, 1.9, 1.15, 0.12);
await page.waitForTimeout(900); await shot('warrior-climb');
await page.evaluate(() => window.__climb.press('a')); await page.waitForTimeout(110); await shot('warrior-attack');
await page.waitForTimeout(400);
await page.evaluate(() => window.__climb.press('b')); await page.waitForTimeout(120); await shot('warrior-block');
await page.waitForTimeout(500);
await page.evaluate(() => window.__climb.press('down')); await page.waitForTimeout(150); await shot('warrior-duck');
await page.waitForTimeout(600);
await page.evaluate(() => { window.__climb.TUNE.climb.baseSpeed = 2.25; });
await cam(-2.3, 2.9, 1.3, 0.17);
await page.waitForTimeout(700); await shot('warrior-gameplay');

// ---- the Warden's stretch: it hunts from behind the wall while you climb
await page.evaluate(() => { window.__climb.TUNE.climb.baseSpeed = 0.35; window.__go(window.__landingS(9) + 2); });
await page.waitForFunction(() => !!window.__climb.ST.B, null, { timeout: 15000 });
await page.evaluate(() => { const G = window.__climb.ST.G; G.maxHp = 99; G.hp = 99; });
await page.waitForTimeout(1200); await shot('warden-loom');
const waitSt = (pred, label) => page.waitForFunction(pred, null, { timeout: 30000 }).catch(() => console.log('no ' + label));
const force = atk => page.evaluate(a => { const B = window.__climb.ST.B; if (B && B.st === 'idle'){ B.queue = [a]; B.tm = 9; } }, atk);
await force('slam');
await waitSt(() => { const B = window.__climb.ST.B; return B && B.atk === 'slam' && (B.st === 'strike' || (B.st === 'tele' && B.slammed)); }, 'slam');
await page.waitForTimeout(120); await shot('warden-slam');
await waitSt(() => { const B = window.__climb.ST.B; return B && B.st === 'opening'; }, 'opening');
await page.waitForTimeout(300); await shot('warden-opening');
await waitSt(() => { const B = window.__climb.ST.B; return B && B.st === 'idle'; }, 'idle');
await force('sweep');
await waitSt(() => { const B = window.__climb.ST.B; return B && B.atk === 'sweep' && B.st === 'strike'; }, 'sweep');
await page.waitForTimeout(150); await shot('warden-sweep');
await waitSt(() => { const B = window.__climb.ST.B; return B && B.st === 'idle'; }, 'idle');
await force('spit');
await waitSt(() => { const B = window.__climb.ST.B; return B && B.atk === 'spit' && B.st === 'orb'; }, 'spit');
await page.waitForTimeout(200); await shot('warden-spit');
if (errors.length){ console.error(errors.join('\n')); process.exit(1); }
console.log('portraits written to tools/out/');
await browser.close(); server.kill(); process.exit(0);
