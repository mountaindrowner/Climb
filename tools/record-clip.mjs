// node tools/record-clip.mjs: records a clip of the side view's play: the game stepped a frame at a time (window.__side.capture), inputs at given frames, each frame
// screenshotted, written as a GIF. node record.mjs <out.gif> '<json clip>'   clip: { setup, frames, at: { "12": {tap,hold,js} }, crop: [x,y,w,h] }
import { createRequire } from 'node:module'; import { spawn, execFileSync } from 'node:child_process'; import { mkdirSync, rmSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname, out = process.argv[2], clip = JSON.parse(process.argv[3]);
const { chromium } = createRequire(root)('playwright');
const server = spawn(process.execPath, [root + 'tools/serve.mjs'], { cwd: root, env: { ...process.env, PORT: 8151 }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
page.on('pageerror', e => errs.push(e.message)); await page.route(/^(?!http:\/\/localhost)/, r => r.abort());
await page.goto('http://localhost:8151/side.html' + (clip.q || ''), { waitUntil: 'load' });
await page.waitForFunction(() => window.__side && window.__side.P && window.__side.input, null, { timeout: 30000 });
await page.waitForTimeout(3500);
await page.evaluate(s => { if (s) (0, eval)(s); }, clip.setup || '');
await page.waitForTimeout(800);
await page.evaluate(() => { window.__side.capture.on = true; });
const dir = out + '.frames'; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
const step = () => page.evaluate(() => new Promise(r => { const C = window.__side.capture; C.left = 1; const f = () => C.left > 0 ? requestAnimationFrame(f) : requestAnimationFrame(() => r()); f(); }));
for (let i = 0; i < 6; i++) await step();   // settle
for (let f = 0; f < clip.frames; f++){
  const a = (clip.at || {})[f];
  if (a) await page.evaluate(a => { const I = window.__side.input; if (a.hold) for (const [k, v] of Object.entries(a.hold)) I.hold(k, v); if (a.tap) for (const t of [].concat(a.tap)) I.tap(t); if (a.js) (0, eval)(a.js); }, a);
  await step();
  // frame him: a box round where he is on screen, kept inside the screen
  const [w, h] = clip.size || [760, 440];
  const c = await page.evaluate(() => { const P = window.__side.P, v = new window.THREE.Vector3(P.x, P.y + 1.4, 0).project(window.__side.R.camera); return [(v.x + 1) / 2 * 1280, (1 - v.y) / 2 * 720]; });
  const x = Math.max(0, Math.min(1280 - w, Math.round(c[0] - w / 2))), y = Math.max(0, Math.min(720 - h, Math.round(c[1] - h / 2)));
  await page.screenshot({ path: `${dir}/${String(f).padStart(4, '0')}.png`, clip: { x, y, width: w, height: h } });
}
await browser.close(); server.kill();
execFileSync('python3', ['-c', `
import glob,sys
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+'/*.png')); ims=[Image.open(f).convert('RGB').quantize(colors=64, method=Image.MEDIANCUT) for f in fs]
ims[0].save(sys.argv[2], save_all=True, append_images=ims[1:], duration=int(sys.argv[3]), loop=0)
print(sys.argv[2], len(ims), 'frames')`, dir, out, String(Math.round(1000 / 24))], { stdio: 'inherit' });
if (errs.length) console.log('errors', errs.slice(0, 4));
