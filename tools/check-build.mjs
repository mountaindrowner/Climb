// Open a built copy of the game in a real browser and make sure it starts: the title, then every region by its address.
// Fails (exit 1) on any error in the page or any file it asks for and does not get. This is the check made before a
// build is pushed (tools/push-itch.sh) or restored (tools/restore-build.sh): the automated tests do not load the page,
// so a mistake that stops the game starting is only caught here.
//   node tools/check-build.mjs <folder with index.html | the zip> [--shot out.png]
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chromium = (() => { for (const r of [process.env.PW_FROM, root, ...(process.env.NODE_PATH || '').split(':'), '/home/user/Climb', '/opt/node-tools'].filter(Boolean)){ try { return createRequire(r.endsWith('/') ? r : r + '/')('playwright').chromium; } catch {} } console.error('playwright not found (set PW_FROM to a folder that has it)'); process.exit(2); })();
let dir = process.argv[2]; if (!dir || !existsSync(dir)){ console.error('usage: node tools/check-build.mjs <folder | zip> [--shot out.png]'); process.exit(2); }
if (statSync(dir).isFile()){ const out = mkdtempSync(join(tmpdir(), 'climb-check-')); execFileSync('unzip', ['-q', resolve(dir), '-d', out]); dir = out; }
const shot = process.argv.includes('--shot') ? process.argv[process.argv.indexOf('--shot') + 1] : null;
const PORT = 8200 + Math.floor(Math.random() * 500), srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: dir, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 900));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const OLD = /px_crawler3|crawler3|hero_a|\/hero\/|flitter2|burrower2|\/crawler\/|\/flitter\/|\/burrower\/|px_spitter/;   // older drawings a creature falls back to: asked for only if its newer one is missing
const bad = []; let version = null, regions = 0, lastName = null, again = false;
const open = async (query, name) => {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('response', r => { if (r.status() >= 400 && !OLD.test(r.url())) errs.push(r.status() + ' ' + r.url().replace(/^.*?:\d+\//, '')); });
  await p.route(/^(?!http:\/\/localhost)/, r => r.abort());
  try { await p.goto(`http://localhost:${PORT}/index.html${query}`); await p.waitForFunction(() => window.__side && window.__side.P && window.__side.LEVEL, null, { timeout: 60000 }); await p.waitForTimeout(3500);
    const info = await p.evaluate(() => ({ v: window.__side.VERSION || null, n: (window.__side.LEVEL.rooms || []).length, name: window.__side.LEVEL.name })); if (info.v) version = info.v; if (query){ again = info.name === lastName; lastName = info.name; if (again){ await p.close(); return false; } }
    if (shot && !query) await p.screenshot({ path: shot }); console.log((errs.length ? 'FAIL ' : 'ok   ') + name.padEnd(10) + (query ? ' ' + info.name + ', ' + info.n + ' rooms' : ''));
  } catch (e){ errs.push(String(e.message).split('\n')[0]); console.log('FAIL ' + name); }
  for (const e of errs) bad.push(name + ': ' + e); await p.close(); return !errs.some(e => /Timeout/.test(e));
};
await open('', 'title');
for (let n = 1; n <= 12; n++){ const p0 = bad.length; const ok = await open(`?play&level=${n}`, 'region ' + n); if (again){ bad.length = p0; break; } if (!ok && n > 6){ bad.length = p0; break; } regions++; }   // until an address past the last region opens the last one again
await b.close(); srv.kill();
console.log(version ? `build ${version.build} (${version.date}); phase ${version.phase} of ${version.phases}; last: ${version.last}` : 'no version note in this build (before build 63)');
if (bad.length){ console.log('\nNOT FIT TO PUSH:'); for (const e of bad.slice(0, 20)) console.log('  ' + e); process.exit(1); }
console.log(`fit to push: the title and ${regions} regions opened with no errors`);
