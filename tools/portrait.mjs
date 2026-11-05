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
  import { makeWarden } from '/src/wardens/model.js';
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
    const M = makeWarden(z); M.G.position.set((R - 1.2) * Math.cos(a), 0.2, (R - 1.2) * Math.sin(a)); face(M.G); root.add(M.G);
  };
  window.__studioOff = () => { if (window.__studioRoot) scene.remove(window.__studioRoot); window.__studioRoot = null; };
  window.__ready2 = true;` });
await page.waitForFunction(() => window.__ready2);
await page.evaluate(() => { const c = window.__climb.TUNE.camera.title; c.back = -3.4; c.up = 4.6; c.look = 3.1; document.getElementById('overlay').classList.remove('show'); });
for (const [z, off, tag] of [[0, 0.45, 'z1'], [2, -0.45, 'z3'], [0, 2.6, 'z1-back']]){
  await page.evaluate(([z, off]) => window.__studio(z, 'body', off), [z, off]); await page.waitForTimeout(500); await shot(`studio-warden-${tag}`);
}
await page.evaluate(() => { window.__studioOff(); document.getElementById('overlay').classList.add('show'); });

// ---- the warrior, close: every move, caught mid-motion
const I = (k, v) => page.evaluate(([k, v]) => window.__climb.input.hold(k, v), [k, v]);
const T = k => page.evaluate(k => window.__climb.input.tap(k), k);
let poseN = 0;
const until = (fn, ms = 4000) => { const n = ++poseN; return page.waitForFunction(fn, null, { timeout: ms, polling: 8 }).catch(async () => console.log('missed pose ' + n, await page.evaluate(() => { const G = window.__climb.ST.G; return JSON.stringify({ atk: G.atk, roll: G.roll, vy: G.vy, g: G.grounded, mode: window.__climb.ST.mode }); }))); };
await page.evaluate(() => { window.__go(2.3); window.__climb.ST.G.maxHp = 99; window.__climb.ST.G.hp = 99; });
await cam(3.4, 1.9, 1.15, 0.12);
await page.waitForTimeout(900); await shot('move-idle');
await I('right', true); await page.waitForTimeout(260); await shot('move-run');
await I('jump', true); await until(() => window.__climb.ST.G.vy > 4); await shot('move-jump'); await I('jump', false);
await until(() => window.__climb.ST.G.grounded); await I('right', false); await page.waitForTimeout(250);
await page.evaluate(() => { window.__climb.ST.timeScale = 0.2; });
await T('roll'); await until(() => window.__climb.ST.G.roll > 0 && window.__climb.ST.G.roll < 0.24); await shot('move-roll');
await page.evaluate(() => { window.__climb.ST.timeScale = 1; });
await page.waitForTimeout(700);
await I('down', true); await I('right', true); await page.waitForTimeout(300); await shot('move-crouch'); await I('right', false); await I('down', false);
await page.waitForTimeout(300);
// time stands still while each pose is photographed, then runs on slowly to the next one
const frozen = async name => { await page.evaluate(() => { window.__climb.ST.timeScale = 0; }); await shot(name); await page.evaluate(() => { window.__climb.ST.timeScale = 0.15; }); };
await page.evaluate(() => { window.__climb.ST.timeScale = 0.15; });
await T('attack'); await until(() => { const A = window.__climb.ST.G.atk; return A && A.phase === 'wind' && A.t > 0.03; }); await frozen('atk-1-wind');
await until(() => { const A = window.__climb.ST.G.atk; return A && A.phase === 'active' && A.t > 0.03; }); await frozen('atk-1-strike');
await T('attack'); await until(() => { const A = window.__climb.ST.G.atk; return A && A.i === 1 && A.phase === 'active' && A.t > 0.03; }); await frozen('atk-2-strike');
await T('attack'); await until(() => { const A = window.__climb.ST.G.atk; return A && A.i === 2 && A.phase === 'wind' && A.t > 0.07; }); await frozen('atk-3-wind');
await until(() => { const A = window.__climb.ST.G.atk; return A && A.i === 2 && A.phase === 'active' && A.t > 0.04; }); await frozen('atk-3-strike');
await page.evaluate(() => { window.__climb.ST.timeScale = 1; });
await page.waitForTimeout(500);
await I('block', true); await page.waitForTimeout(200); await shot('move-block'); await I('block', false);
await cam(-3.4, 3.2, 1.45, 0.17);
await I('right', true); await page.waitForTimeout(900); await shot('move-gameplay'); await I('right', false);

// ---- the threat catalog: each threat at its tell, at gameplay distance and close up
await page.addScriptTag({ type: 'module', content: `
  import { content } from '/src/world/generate.js';
  import { ST } from '/src/core/state.js';
  import { startClimb } from '/src/modes/climb.js';
  import { hideMenu } from '/src/ui/overlay.js';
  window.__practice = id => { hideMenu(); ST.practice = id; startClimb(0); ST.G.maxHp = 99; ST.G.hp = 99; window.__climb.input.hold('right', true); };
  window.__firstOf = id => { const cs = [...content.values()].sort((a, b) => a.k - b.k); for (const c of cs) for (const o of c.obs) if (o.type === id && !o.done && o.st !== 'gone') return o; return null; };
  window.__ready3 = true;` });
await page.waitForFunction(() => window.__ready3);
const TELL = {
  gap:      'o.s - G.s < 1.7 && o.s - G.s > 0.9',
  beam:     'o.s - G.s < 1.6 && o.s - G.s > 0.6',
  rockfall: "o.st === 'drop' && o.tm > 0.32",
  swing:    "o.st === 'swing' && o.tm > 0.42",
  crawler:  "o.st === 'windup' && o.tm > 0.3",
  spitter:  "o.st === 'charge' && o.tm > 0.42",
  burrower: "o.st === 'travel' && o.s - G.s < 2.4",
  flitter:  "o.st === 'dive' && o.tm > 0.5",
};
for (const [tag, cam] of [['play', [-3.4, 3.2, 1.45, 0.17]], ['close', [2.4, 2.1, 1.35, 0.22]]]){
  await page.evaluate(c => { const t = window.__climb.TUNE.camera.climb; [t.back, t.up, t.look, t.lead] = c; window.__climb.ST.cam.r = c[0]; }, cam);
  for (const [id, pred] of Object.entries(TELL)){
    await page.evaluate(id => window.__practice(id), id);
    const ok = await page.waitForFunction(new Function(`const G = window.__climb.ST.G, o = window.__firstOf('${id}'); return !!o && (${pred});`), null, { timeout: 30000, polling: 16 }).then(() => true, () => false);
    if (!ok) console.log('no tell for ' + id);
    await shot(`cat-${tag}-${id}`);
  }
}
await page.evaluate(() => { const t = window.__climb.TUNE.camera.climb; [t.back, t.up, t.look, t.lead] = [-3.4, 3.2, 1.45, 0.17]; });

if (errors.length){ console.error(errors.join('\n')); process.exit(1); }
console.log('portraits written to tools/out/');
await browser.close(); server.kill(); process.exit(0);
