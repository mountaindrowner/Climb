// Headless playthrough: loads the game, has a bot climb the tutorial, repair the lift, pass the rest stop,
// beat the first Warden, then fall and catch a root. Fails on any page error. Screenshots land in tools/out/.
// Usage: node tools/smoke.mjs [--fast]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// Playwright is a dev-only dependency: `npm i -D playwright` locally, or a preinstalled copy found through NODE_PATH.
function loadPlaywright(){
  const req = createRequire(import.meta.url);
  const roots = [root, ...(process.env.NODE_PATH || '').split(':').filter(Boolean), '/opt/node-tools'];
  for (const r of roots){ try { return createRequire(r.endsWith('/') ? r : r + '/').call(null, 'playwright'); } catch {} }
  try { return req('playwright'); } catch { console.error('playwright not found: run `npm i -D playwright` (the browser must also be installed)'); process.exit(2); }
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
// no outside network: fonts fall back
await page.route(/^(?!http:\/\/localhost)/, r => r.abort());

const shot = name => page.screenshot({ path: fileURLToPath(new URL(`./${name}.png`, out)) });
const fail = msg => { console.error('SMOKE FAIL:', msg); if (errors.length) console.error(errors.join('\n')); process.exit(1); };

// Storage is prepared before the page's scripts run (the game saves on hide, which would otherwise overwrite a seed during reload).
await page.addInitScript(() => {
  const plan = sessionStorage.getItem('smoke-seed'); sessionStorage.removeItem('smoke-seed');
  if (plan === 'legacy'){ localStorage.clear(); localStorage.setItem('the-climb-spiral-v1', JSON.stringify({ best: 77, lifts: [6], bosses: [], falls: 2, gold: 5, stash: 0, weapon: 'pick' })); }
  if (plan === 'clear') localStorage.clear();
});
const boot = async () => { await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' }); await page.waitForFunction(() => window.__climb && window.__climb.ST.mode === 'title', null, { timeout: 10000 }).catch(() => fail('game did not boot')); };
await boot();
// a save left by the v3 prototype must carry over
await page.evaluate(() => sessionStorage.setItem('smoke-seed', 'legacy')); await boot();
const migrated = await page.evaluate(() => ({ best: window.__climb.S.best, weapon: window.__climb.S.weapon, version: window.__climb.S.version }));
if (migrated.best !== 77 || migrated.weapon !== 'pick' || !migrated.version) fail('prototype save did not migrate: ' + JSON.stringify(migrated));
console.log('migrated prototype save', migrated);
await page.evaluate(() => sessionStorage.setItem('smoke-seed', 'clear')); await boot();
await shot('01-title');
await page.click('[data-act="pool"]');
await page.click('[data-act="start"][data-k="-1"]');
await page.waitForFunction(() => window.__climb.ST.mode === 'climb');
if (fast) await page.evaluate(() => { window.__climb.TUNE.climb.baseSpeed = 6; });

// The bot: reads the same tells the player sees and answers them.
await page.evaluate(() => {
  const { ST, press } = window.__climb;
  window.__bot = { pressed: {}, log: [] };
  const content = () => [...document.querySelectorAll('x')]; // placeholder, real access below
  window.__botTick = () => {
    const G = ST.G, B = ST.B; if (!G) return;
    const mode = ST.mode;
    const ov = document.getElementById('overlay');
    if (ov.classList.contains('show')){ const b = ov.querySelector('[data-act="resume"]'); if (b){ b.click(); window.__bot.log.push('resume'); } return; }
    if (mode === 'climb'){
      for (const c of window.__content.values()) for (const o of c.obs){
        const d = o.s - G.s;
        if (o.type === 'gap' && !o.done && d > 0 && d < 0.5 && G.jump <= 0) press('up');
        if (o.type === 'beam' && !o.done && d > 0 && d < 0.5 && G.duck <= 0) press('down');
        if (o.type === 'crawler' && o.alive && (o.st === 'out' || o.st === 'stunned' || o.st === 'windup') && d < 1.6 && G.atkCd <= 0) press('a');
        if (o.type === 'spitter' && o.orb && !o.orb.back && o.orb.t > o.orb.dur - 0.12 && G.block <= 0) press('b');
      }
      const p = window.__posOf(G.s);
      if (p.land && window.__special(p.k) === 'lift') press('up');
    } else if (mode === 'boss' && B){
      if (B.st === 'tele'){
        if (B.atk === 'slam' && B.tm > B.T - 0.2 && G.jump <= 0) press('up');
        if (B.atk === 'sweep' && B.tm > B.T - 0.25 && G.duck <= 0) press('down');
      }
      if (B.st === 'orb' && B.orb && B.orb.t > B.orb.dur - 0.12 && G.block <= 0) press('b');
      if (B.st === 'stagger' && G.atkCd <= 0) press('a');
    } else if (mode === 'fall'){
      const F = ST.FALL;
      for (const L of F.ledges){ if (!F.tried.has(L.id) && Math.abs(F.y - L.y) < 0.8 && L.id === 2){ press('up'); } }
    }
  };
});
// expose internals the bot needs
await page.addScriptTag({ type: 'module', content: `
  import { content } from '/src/world/generate.js';
  import { posOf, special } from '/src/world/path.js';
  window.__content = content; window.__posOf = posOf; window.__special = special; window.__ready = true;` });
await page.waitForFunction(() => window.__ready);

const until = async (pred, timeout, label) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout){
    const ok = await page.evaluate(pred); if (ok) return true;
    await page.evaluate(() => window.__botTick());
    if (errors.length) fail('errors during ' + label);
    await page.waitForTimeout(25);
  }
  fail('timeout waiting for ' + label);
};
const st = () => page.evaluate(() => { const { ST, S } = window.__climb; return { mode: ST.mode, hp: ST.G.hp, gold: ST.G.gold, s: +ST.G.s.toFixed(1), best: S.best, lifts: S.lifts, bosses: S.bosses, falls: S.falls }; });

await until(() => window.__climb.ST.G.s > 60, 60000, 'tutorial flights');
await shot('02-climb');
console.log('after tutorial', await st());
await until(() => window.__climb.S.lifts.length > 0, 60000, 'lift repair');
console.log('lift repaired', await st());
await until(() => window.__bot.log.includes('resume'), 60000, 'rest stop');
console.log('rest stop passed', await st());
await until(() => window.__climb.ST.mode === 'boss', 60000, 'reaching the Warden');
await page.waitForTimeout(2500); await shot('03-warden');
await until(() => window.__climb.S.bosses.length > 0, 90000, 'beating the Warden');
console.log('Warden beaten', await st());
await until(() => window.__climb.ST.mode === 'climb', 5000, 'resume after Warden');
// now fall and catch a root
await page.evaluate(() => { window.__climb.ST.G.inv = 0; window.__climb.hurt(99, 'test'); });
await until(() => window.__climb.ST.mode === 'fall', 2000, 'fall start');
await page.waitForTimeout(300); await shot('04-fall');
await until(() => window.__climb.ST.mode === 'climb' || window.__climb.ST.mode === 'pool', 20000, 'root grab or splash');
console.log('after fall', await st());
// and a full plunge into the Pool
await page.evaluate(() => { window.__climb.ST.G.inv = 0; window.__climb.hurt(99, 'test'); });
await page.evaluate(() => { window.__botTick = () => {}; });
await until(() => window.__climb.ST.mode === 'menu', 30000, 'splash into the Pool');
await shot('05-pool');
console.log('pool', await st());
const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('the-climb')));
console.log('saved', persisted);
if (!persisted || !persisted.bosses.length || !persisted.lifts.length) fail('progress did not persist');
if (errors.length) fail('errors logged');
console.log('SMOKE OK');
await browser.close(); server.kill(); process.exit(0);
