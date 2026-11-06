// Art review of one warrior rig: every move caught mid-motion, close up from both sides and at gameplay distance, each
// weapon's strike, the fall and the hurt flinch; then contact sheets of them. Writes tools/out/review-<rig>-*.png.
// Usage: RIG=knight node tools/rig-review.mjs   (RIG = knight | blender | hand)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
function loadPlaywright(){
  for (const r of [root, ...(process.env.NODE_PATH || '').split(':').filter(Boolean), '/opt/node-tools']){ try { return createRequire(r.endsWith('/') ? r : r + '/')('playwright'); } catch {} }
  console.error('playwright not found'); process.exit(2);
}
const { chromium } = loadPlaywright();
const outDir = fileURLToPath(new URL('./out/', import.meta.url)); mkdirSync(outDir, { recursive: true });
const PORT = 8125, RIG = process.env.RIG || 'knight';
const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.route(/^(?!http:\/\/localhost)/, r => r.abort());
await page.addInitScript(rig => { try { localStorage.setItem('the-climb-rig', rig); } catch (e) {} }, RIG);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__climb && window.__climb.ST.mode === 'title');
if (RIG !== 'hand') await page.waitForFunction(rig => import('/src/entities/player/glbRig.js').then(m => m.GLB.ready && m.GLB.name === rig), RIG, { timeout: 20000, polling: 200 });
await page.addScriptTag({ type: 'module', content: `
  import { startClimb } from '/src/modes/climb.js';
  import { hideMenu } from '/src/ui/overlay.js';
  import { setWeapon, PL } from '/src/entities/player/player.js';
  window.__go = s => { hideMenu(); startClimb(s); const G = window.__climb.ST.G; G.maxHp = 99; G.hp = 99; };
  window.__wep = id => setWeapon(id);
  window.__ready = true;` });
await page.waitForFunction(() => window.__ready);

const shots = [];
const shot = async (name, label) => { const path = `${outDir}review-${RIG}-${name}.png`; await page.screenshot({ path, clip: { x: 280, y: 40, width: 720, height: 640 } });   // the middle of the landscape frame shots.push([path, label || name]); };
const cam = (back, up, look, lead) => page.evaluate(([b, u, l, d]) => { const c = window.__climb.TUNE.camera.climb; c.back = b; c.up = u; c.look = l; c.lead = d; window.__climb.ST.cam.r = b; }, [back, up, look, lead]);
const I = (k, v) => page.evaluate(([k, v]) => window.__climb.input.hold(k, v), [k, v]);
const T = k => page.evaluate(k => window.__climb.input.tap(k), k);
const speed = v => page.evaluate(v => { window.__climb.ST.timeScale = v; }, v);
const until = (fn, arg, ms = 5000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 8 }).then(() => true, () => { console.log('missed', String(fn).slice(0, 90)); return false; });
const frozen = async (name, label) => { await speed(0); await page.waitForTimeout(60); await shot(name, label); await speed(0.15); };
// camera presets as radii from the shaft's centre: positive is on his side of the centre (close), negative the far side
const { R } = await page.evaluate(() => import('/src/config/constants.js').then(m => ({ R: m.R })));
const CLOSE = [R - 4.2, 1.6, 1.1, 0.0], HIGH = [R - 4.6, 2.6, 1.3, 0.1];
const PLAY = await page.evaluate(() => { const c = window.__climb.TUNE.camera.climb; return [c.back, c.up, c.look, c.lead]; });

await page.evaluate(() => window.__go(2.3));
await cam(...CLOSE);
await page.waitForTimeout(1200);
await shot('idle-r', 'idle, facing up-stair');
await I('left', true); await until(() => window.__climb.ST.G.face < 0); await I('left', false); await page.waitForTimeout(900);
await shot('idle-l', 'idle, facing down-stair');
await I('right', true); await until(() => window.__climb.ST.G.face > 0); await I('right', false); await page.waitForTimeout(400);
await cam(...HIGH); await page.waitForTimeout(700); await shot('idle-high', 'idle, from above');
await cam(...CLOSE); await page.waitForTimeout(500);

// moves
await speed(0.25);
await I('right', true); await page.waitForTimeout(500); await frozen('run-a', 'run'); await page.waitForTimeout(90); await frozen('run-b', 'run, other foot');
await I('jump', true); await until(() => window.__climb.ST.G.vy > 4); await frozen('jump-up', 'jump, rising'); await I('jump', false);
await until(() => window.__climb.ST.G.vy < -3); await frozen('jump-down', 'jump, falling');
await until(() => window.__climb.ST.G.landT > 0.05); await frozen('land', 'landing');
await I('right', false); await page.waitForTimeout(500);
await T('roll'); await until(() => { const G = window.__climb.ST.G; return G.roll > 0 && G.roll < 0.3; }); await frozen('roll-a', 'roll, going over');
await until(() => { const G = window.__climb.ST.G; return G.roll > 0 && G.roll < 0.17; }); await frozen('roll-b', 'roll, upside down');
await speed(1); await page.waitForTimeout(1200); await speed(0.25);
await I('down', true); await page.waitForTimeout(500); await frozen('crouch', 'crouch');
await I('right', true); await page.waitForTimeout(500); await frozen('crouch-walk', 'crouch walk'); await I('right', false); await I('down', false);
await page.waitForTimeout(500);
await I('block', true); await page.waitForTimeout(500); await frozen('block', 'block'); await I('block', false);
await page.waitForTimeout(400);

// each weapon's combo: the wind-up and the strike of every swing
for (const w of ['sword', 'pick', 'spear']){
  await page.evaluate(w => window.__wep(w), w); await page.waitForTimeout(300);
  const n = w === 'pick' ? 2 : 3;
  for (let i = 0; i < n; i++){
    await T('attack');
    await until(i => { const A = window.__climb.ST.G.atk; return A && A.i === i && A.phase === 'wind' && A.t > 0.02; }, i); await frozen(`${w}-${i + 1}-wind`, `${w} ${i + 1}: wind-up`);
    await until(i => { const A = window.__climb.ST.G.atk; return A && A.i === i && A.phase === 'active' && A.t > 0.03; }, i); await frozen(`${w}-${i + 1}-strike`, `${w} ${i + 1}: strike`);
  }
  await speed(1); await page.waitForTimeout(700); await speed(0.15);
}
await page.evaluate(() => window.__wep('sword'));
await speed(1); await page.waitForTimeout(400);

// hurt, then the fall
await speed(0.25);
await page.evaluate(() => { const G = window.__climb.ST.G; G.inv = 0; window.__climb.hurt(1, '', G.s + 1); });
await until(() => window.__climb.ST.G.hurtT > 0.05); await frozen('hurt', 'hurt flinch');
await speed(1); await page.waitForTimeout(900);
await cam(...PLAY);
await I('right', true); await page.waitForTimeout(900); await shot('play-run', 'gameplay distance, running');
await T('attack'); await until(() => { const A = window.__climb.ST.G.atk; return A && A.phase === 'active'; }); await speed(0); await shot('play-attack', 'gameplay distance, striking'); await speed(1);
await I('right', false); await page.waitForTimeout(600);
await page.evaluate(() => { const G = window.__climb.ST.G; G.inv = 0; G.hp = 1; window.__climb.hurt(5, ''); });
await until(() => window.__climb.ST.mode === 'fall'); await page.waitForTimeout(450); await speed(0); await shot('fall', 'the fall'); await speed(1);

// contact sheets, four across
const per = 12;
for (let p = 0; p * per < shots.length; p++){
  const set = shots.slice(p * per, p * per + per);
  const html = `<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(4,240px);gap:4px;padding:4px;font:12px sans-serif;color:#ddd">${set.map(([f, l]) => `<figure style="margin:0"><img src="data:image/png;base64,${readFileSync(f).toString('base64')}" style="width:240px;display:block"><figcaption>${l}</figcaption></figure>`).join('')}</body>`;
  const sheet = await browser.newPage({ viewport: { width: 4 * 244 + 4, height: 400 }, deviceScaleFactor: 1.5 });
  await sheet.setContent(html); await sheet.waitForTimeout(200);
  await sheet.screenshot({ path: `${outDir}review-${RIG}-sheet-${p + 1}.png`, fullPage: true }); await sheet.close();
}
if (errors.length){ console.error(errors.join('\n')); process.exit(1); }
console.log(`${shots.length} shots, sheets in tools/out/review-${RIG}-sheet-*.png`);
await browser.close(); server.kill(); process.exit(0);
