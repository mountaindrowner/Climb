// Headless playthrough. A bot reads the same tells the player sees and answers them, every frame, inside the page.
//  1. a save from the v3 prototype migrates
//  2. a climb from the bottom: the tutorial, the lift, the rest stop, on into the second zone
//  3. a fall caught on a root (the warrior must come back upright and facing up the stair), then a plunge to the Pool
//  4. a Practice run of every threat in the catalog, counting hits the bot takes while answering correctly
// Fails on any page error. Screenshots land in tools/out/. Usage: node tools/smoke.mjs [--fast]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
function loadPlaywright(){
  for (const r of [root, ...(process.env.NODE_PATH || '').split(':').filter(Boolean), '/opt/node-tools']){ try { return createRequire(r.endsWith('/') ? r : r + '/')('playwright'); } catch {} }
  console.error('playwright not found: run `npm i -D playwright` (the browser must also be installed)'); process.exit(2);
}
const { chromium } = loadPlaywright();
const out = new URL('./out/', import.meta.url); mkdirSync(out, { recursive: true });
const PORT = 8123, fast = process.argv.includes('--fast');

const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
await page.route(/^(?!http:\/\/localhost)/, r => r.abort());   // no outside network: fonts fall back
const shot = name => page.screenshot({ path: fileURLToPath(new URL(`./${name}.png`, out)) });
const fail = msg => { console.error('SMOKE FAIL:', msg); if (errors.length) console.error(errors.join('\n')); browser.close(); server.kill(); process.exit(1); };

// Storage is prepared before the page's scripts run (the game saves on hide, which would overwrite a seed during reload).
await page.addInitScript(() => {
  const plan = sessionStorage.getItem('smoke-seed'); sessionStorage.removeItem('smoke-seed');
  if (plan === 'legacy'){ localStorage.clear(); localStorage.setItem('the-climb-spiral-v1', JSON.stringify({ best: 77, lifts: [6], bosses: [], falls: 2, gold: 5, stash: 0, weapon: 'pick' })); }
  if (plan === 'clear') localStorage.clear();
});
const boot = async () => {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__climb && window.__climb.ST.mode === 'title', null, { timeout: 10000 }).catch(() => fail('game did not boot'));
};
await boot();
await page.evaluate(() => sessionStorage.setItem('smoke-seed', 'legacy')); await boot();
const migrated = await page.evaluate(() => ({ best: window.__climb.S.best, weapon: window.__climb.S.weapon, version: window.__climb.S.version }));
if (migrated.best !== 77 || migrated.weapon !== 'pick' || !migrated.version) fail('prototype save did not migrate: ' + JSON.stringify(migrated));
console.log('migrated prototype save', migrated);
await page.evaluate(() => sessionStorage.setItem('smoke-seed', 'clear')); await boot();
await shot('01-title');

// ---- the bot, run every frame in the page
await page.addScriptTag({ type: 'module', content: `
  import { content } from '/src/world/generate.js';
  import { posOf, special } from '/src/world/path.js';
  import { TUNE } from '/src/config/tuning.js';
  const { ST, press } = window.__climb;
  const bot = window.__bot = { on: true, hits: 0, lastHp: null, log: [], grabRoot: 2, hitLog: [] };
  function tick(){
    const G = ST.G, mode = ST.mode;
    if (!bot.on || !G) return;
    const ov = document.getElementById('overlay');
    if (ov.classList.contains('show')){ const b = ov.querySelector('[data-act="resume"]'); if (b){ b.click(); bot.log.push('resume'); } return; }
    if (mode === 'climb'){
      if (bot.lastHp == null || G.hp > bot.lastHp) bot.lastHp = G.hp;
      if (G.hp < bot.lastHp){ bot.hits += bot.lastHp - G.hp; bot.hitLog.push(ST.floats.length ? ST.floats[ST.floats.length - 1].text : '?'); }
      bot.lastHp = G.hp;
      if (G.hp <= 2 && G.flask > 0) press('flask');
      for (const c of content.values()) for (const o of c.obs){
        const d = o.s - G.s;
        switch (o.type){
          case 'gap': if (!o.done && d > 0 && d < 0.5 && G.jump <= 0) press('up'); break;
          case 'beam': if (!o.done && d > 0 && d < 0.5 && G.duck < 0.15) press('down'); break;   // re-duck if the last one is running out
          case 'crawler': if (o.alive && (o.st === 'out' || o.st === 'stunned' || o.st === 'windup') && d < 1.6 && G.atkCd <= 0) press('a'); break;
          case 'spitter': if (o.orb && !o.orb.back && o.orb.t > o.orb.dur - 0.12 && G.block <= 0) press('b'); break;
          case 'rockfall': if (o.st === 'drop' && o.tm > TUNE.rockfall.fall - 0.15 && Math.abs(d) < 1.5 && G.block <= 0) press('b'); break;
          case 'swing': if (o.st === 'swing' && !o.done && o.tm > TUNE.swing.period / 4 - 0.3 && G.duck <= 0) press('down'); break;
          case 'burrower': if (!o.done && (o.st === 'travel' || o.st === 'rise') && d > 0 && d < 0.5 && G.jump <= 0) press('up'); break;
          case 'flitter': if (o.st === 'dive' && o.tm > TUNE.flitter.dive - 0.2 && G.atkCd <= 0) press('a'); break;
        }
      }
      const p = posOf(G.s);
      if (p.land && special(p.k) === 'lift') press('up');
    } else if (mode === 'fall' && bot.grabRoot){
      const F = ST.FALL;
      for (const L of F.ledges) if (!F.tried.has(L.id) && Math.abs(F.y - L.y) < 0.8 && L.id === bot.grabRoot) press('up');
    }
  }
  const loop = () => { try { tick(); } catch (e) { console.error('bot: ' + e.message); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  window.__ready = true;` });
await page.waitForFunction(() => window.__ready);

const until = async (pred, timeout, label, arg) => {
  const ok = await page.waitForFunction(pred, arg, { timeout, polling: 100 }).then(() => true, () => false);
  if (errors.length) fail('errors during ' + label);
  if (!ok) fail('timeout waiting for ' + label);
};
const st = () => page.evaluate(() => { const { ST, S } = window.__climb; return { mode: ST.mode, hp: ST.G.hp, gold: ST.G.gold, s: +ST.G.s.toFixed(1), best: S.best, lifts: S.lifts, falls: S.falls, seen: S.seen, hits: window.__bot.hits }; });
const setSpeed = v => page.evaluate(v => { window.__climb.TUNE.climb.baseSpeed = v; }, v);

// ---- 2. a climb from the bottom
await page.click('[data-act="pool"]');
await page.click('[data-act="start"][data-k="-1"]');
await until(() => window.__climb.ST.mode === 'climb', 5000, 'the climb to start');
if (fast) await setSpeed(6);
await until(() => window.__climb.ST.G.s > 50, 90000, 'the tutorial flights');
await shot('02-climb');
console.log('after tutorial', await st());
await until(() => window.__climb.S.lifts.length > 0, 90000, 'the lift repair');
await until(() => window.__bot.log.includes('resume'), 90000, 'the rest stop');
console.log('rest stop passed', await st());
await until(() => window.__climb.ST.G.s > 15 * 9.8 + 2, 180000, 'reaching the second zone');
console.log('second zone', await st());
if ((await page.evaluate(() => !!window.__climb.ST.B))) fail('a Warden started while the Wardens are parked');

// ---- 3. a fall caught on a root, then a plunge
await page.evaluate(() => { window.__climb.ST.G.inv = 0; window.__climb.hurt(99, 'test'); });
await until(() => window.__climb.ST.mode === 'fall', 3000, 'the fall');
await page.waitForTimeout(300); await shot('03-fall');
await until(() => window.__climb.ST.mode === 'climb', 25000, 'the root grab');
await page.waitForTimeout(1500); await shot('04-recovered');   // after the invulnerability flicker
const pose = await page.evaluate(() => import('/src/entities/player/player.js').then(m => ({ spin: +m.PL.body.rotation.z.toFixed(3), tip: +m.PL.body.rotation.x.toFixed(3) })));
if (Math.abs(pose.spin) > 0.01 || Math.abs(pose.tip) > 0.01) fail('the warrior came back from the fall tumbled: ' + JSON.stringify(pose));
console.log('caught a root, upright', await st());
await page.evaluate(() => { window.__bot.grabRoot = 0; window.__climb.ST.G.inv = 0; window.__climb.hurt(99, 'test'); });
await until(() => window.__climb.ST.mode === 'menu', 40000, 'the splash into the Pool');
await shot('05-pool');
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('the-climb')));
console.log('saved', saved);
if (!saved || !saved.lifts.length || !saved.seen.length) fail('progress did not persist');

// ---- 4. practice every threat
const report = [];
const ids = await page.evaluate(() => import('/src/entities/catalog.js').then(m => m.CATALOG.map(t => t.id)));
for (const id of ids){
  await page.evaluate(() => import('/src/ui/screens/practice.js').then(m => m.practiceMenu()));
  await page.click(`[data-act="practice-go"][data-id="${id}"]`);
  await page.evaluate(() => { window.__bot.hits = 0; window.__bot.lastHp = null; window.__bot.hitLog = []; window.__bot.grabRoot = 2; });
  if (fast) await setSpeed(4);
  const t0 = Date.now();
  await until(() => window.__climb.ST.mode === 'menu', 120000, 'practice of ' + id);
  const done = await page.evaluate(() => !!document.querySelector('[data-act="practice-go"]') && /cleared/.test(document.getElementById('overlay').textContent));
  const r = await st();
  const hitLog = await page.evaluate(() => window.__bot.hitLog.join(' '));
  report.push({ id, cleared: done, hitsTaken: r.hits, by: hitLog, seconds: Math.round((Date.now() - t0) / 1000) });
  if (!done) fail(`the bot could not clear practice of ${id}: ${JSON.stringify(r)}`);
}
console.table(report);
// and each one must actually hurt when it is ignored
const toothless = [];
for (const id of ids){
  await page.evaluate(() => import('/src/ui/screens/practice.js').then(m => m.practiceMenu()));
  await page.click(`[data-act="practice-go"][data-id="${id}"]`);
  await page.evaluate(() => { window.__bot.on = false; window.__bot.hits = 0; });
  const hp0 = await page.evaluate(() => window.__climb.ST.G.hp);
  const hurtIt = await page.waitForFunction(h => window.__climb.ST.G.hp < h || window.__climb.ST.mode !== 'climb', hp0, { timeout: 60000, polling: 50 }).then(() => true, () => false);
  if (!hurtIt) toothless.push(id);
  await page.evaluate(() => { window.__bot.on = true; });
}
if (toothless.length) fail('these threats never hurt an idle warrior: ' + toothless.join(', '));
console.log('every threat hurts when ignored');
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('the-climb')));
if (after.falls !== saved.falls || after.best !== saved.best) fail('practice changed the save');
const unfair = report.filter(r => r.hitsTaken > 0);
if (unfair.length) fail('threats hit the bot while it answered them correctly: ' + unfair.map(r => r.id).join(', '));
if (errors.length) fail('errors logged');
console.log('SMOKE OK');
await browser.close(); server.kill(); process.exit(0);
