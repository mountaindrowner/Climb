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
