// Headless playthrough. A bot reads the same tells the player sees and answers them, every frame, inside the page.
//  1. a save from the v3 prototype migrates
//  2. a climb from the bottom: the tutorial, the lift, the rest stop, on into the second zone
//  3. a fall caught on a root (the warrior must come back upright and facing up the stair), then a plunge to the Pool
//  4. a Practice run of every threat in the catalog, counting hits the bot takes while answering correctly,
//     then a walk straight into each one, which must hurt
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
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
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

// ---- the bot, run every frame in the page. It plays through the same controls a player has.
await page.addScriptTag({ type: 'module', content: `
  import { content } from '/src/world/generate.js';
  import { posOf, special } from '/src/world/path.js';
  import { TUNE } from '/src/config/tuning.js';
  import { R } from '/src/config/constants.js';
  const { ST, input: I } = window.__climb;
  const bot = window.__bot = { on: true, answer: true, hits: 0, lastHp: null, log: [], grabRoot: 2, hitLog: [], jumpHold: 0 };
  const jump = (frames = 11) => { if (bot.jumpHold <= 0){ I.hold('jump', true); bot.jumpHold = frames; } };   // a thumb tap (about 0.18 s), or held longer
  function tick(){
    const G = ST.G, mode = ST.mode;
    if (!bot.on || !G){ return; }
    const ov = document.getElementById('overlay');
    if (ov.classList.contains('show')){ const b = ov.querySelector('[data-act="resume"]'); if (b){ b.click(); bot.log.push('resume'); } return; }
    if (mode === 'fall'){
      const F = ST.FALL;
      if (bot.grabRoot) for (const L of F.ledges) if (!F.tried.has(L.id) && Math.abs(F.y - L.y) < 0.8 && L.id === bot.grabRoot) I.tap('jump');
      return;
    }
    if (mode !== 'climb') return;
    if (bot.jumpHold > 0 && --bot.jumpHold === 0) I.hold('jump', false);
    if (bot.jumpHold > 0 && G.grounded && G.jumpT > 0.15){ I.hold('jump', false); bot.jumpHold = 0; }   /* landed: let go, so a hole one step on can be jumped at once */
    if (bot.lastHp == null || G.hp > bot.lastHp) bot.lastHp = G.hp;
    if (G.hp < bot.lastHp){ bot.hits += bot.lastHp - G.hp; bot.hitLog.push(ST.floats.length ? ST.floats[ST.floats.length - 1].text : '?'); }
    bot.lastHp = G.hp;
    let move = 1, crouch = false, block = false;
    if (bot.answer){
      if (G.hp <= 2 && G.flask > 0) I.tap('flask');
      for (const c of content.values()) for (const o of c.obs){
        const d = o.s - G.s;
        switch (o.type){
          case 'gap': { const dc = d + 0.25; if (!o.done && dc > 0.55 && dc < 1.15 && G.grounded) jump(26); break; }   // a hole wants a held, full jump
          case 'beam': if (d > -0.6 && d < 1.3) crouch = true; break;
          case 'rockfall': if ((o.st === 'warn' || o.st === 'drop') && d > -0.8 && d < 2.0) block = true; break;
          case 'swing': if (d > -3.2 && d < 2.8) crouch = true; break;   // the whole arc, both sides of the pivot
          case 'burrower': if ((o.st === 'up' || o.st === 'rise' || o.st === 'travel') && d > 0.4 && d < 1.0 && G.grounded) jump(); break;
          case 'crawler':
            if (o.alive && o.st !== 'idle' && o.st !== 'crack' && Math.abs(d) < 2.4){
              move = 0;
              if (Math.sign(d) !== G.face) move = Math.sign(d);                      // turn to face it
              else if (o.st === 'windup' || o.st === 'lunge') block = true;
              else if (Math.abs(d) < 1.6 && !G.atk) I.tap('attack');
            }
            break;
          case 'spitter': if (o.orb && !o.orb.back){ const pw = o.orb.p; const dd = Math.hypot(pw.x - Math.cos(G.s / R) * R, pw.z - Math.sin(G.s / R) * R); /* the shaft real radius */ if (dd < 3.2) block = true; } break;
          case 'flitter': if (o.st === 'dive' && o.tm > TUNE.flitter.dive - 0.22 && !G.atk) I.tap('attack'); break;
        }
      }
      const p = posOf(G.s);
      if (p.land && special(p.k) === 'lift' && !ST.practice && !window.__climb.S.lifts.includes(p.k)){ move = 0; if (Math.abs(G.v) < 0.5 && G.grounded) I.tap('jump'); }   // stop on the landing, then repair
    }
    if (crouch) block = false;
    I.hold('right', move > 0); I.hold('left', move < 0); I.hold('down', crouch); I.hold('block', block);
  }
  // the clipping test: every frame of play, each sole against the step under it, and the blade's tip against the stone
  const rig = await import('/src/entities/player/glbRig.js'), path = await import('/src/world/path.js'), C = await import('/src/config/constants.js');
  const clip = window.__clip = { frames: 0, worstFoot: 0, footBad: 0, footAt: '', swings: 0, worstBlade: 0, bladeBad: 0, bladeAt: '' };
  function sample(){
    const G = ST.G; if (!G || ST.mode !== 'climb' || !rig.usingGlb()) return;
    if (G.grounded && G.roll <= 0 && rig.FOOT.w > 0.98){
      clip.frames++;
      for (const f of rig.footClearance()) if (!f.hole){
        if (f.clear < clip.worstFoot){ clip.worstFoot = f.clear; clip.footAt = 's ' + f.s.toFixed(2) + ' rise ' + path.riseOf(Math.floor(f.s / C.FL)); }
        if (f.clear < -0.1) clip.footBad++;
      }
    }
    const tip = G.atk ? rig.bladeTip() : null;
    if (tip){
      clip.swings++;
      const r = Math.hypot(tip.x, tip.z);
      if (Math.abs(r - C.R) < 1.25){   // over the stair, not out over the shaft
        let da = Math.atan2(tip.z, tip.x) - path.posOf(G.s).a; da = Math.atan2(Math.sin(da), Math.cos(da));
        const ts = G.s + da / C.OMEGA, pen = path.topAt(ts) - tip.y;
        if (pen > clip.worstBlade){ clip.worstBlade = pen; clip.bladeAt = (G.atk.sw ? G.atk.sw.pose : '') + ' s ' + ts.toFixed(2) + ' rise ' + path.riseOf(Math.floor(ts / C.FL)); }
        if (pen > 0.05) clip.bladeBad++;
      }
    }
  }
  const loop = () => { try { tick(); sample(); } catch (e) { console.error('bot: ' + e.message); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  window.__ready = true;` });
await page.waitForFunction(() => window.__ready);

const until = async (pred, timeout, label, arg) => {
  const ok = await page.waitForFunction(pred, arg, { timeout, polling: 100 }).then(() => true, () => false);
  if (errors.length) fail('errors during ' + label);
  if (!ok){ console.log('state at the timeout:', JSON.stringify(await page.evaluate(() => { const { ST } = window.__climb, G = ST.G, ov = document.getElementById('overlay'); return { mode: ST.mode, paused: ST.paused, practice: ST.practice && ST.practice.id, s: G && +G.s.toFixed(2), y: G && +G.y.toFixed(2), grounded: G && G.grounded, hp: G && G.hp, overlay: ov && ov.classList.contains('show') ? ov.textContent.replace(/\s+/g, ' ').slice(0, 160) : '', bot: window.__bot.log.slice(-5) }; }).catch(e => e.message))); fail('timeout waiting for ' + label); }
};
const st = () => page.evaluate(() => { const { ST, S } = window.__climb; return { mode: ST.mode, hp: ST.G.hp, gold: ST.G.gold, s: +ST.G.s.toFixed(1), best: S.best, lifts: S.lifts, falls: S.falls, seen: S.seen, hits: window.__bot.hits }; });
const setSpeed = v => page.evaluate(v => { window.__climb.TUNE.move.run = v; }, v);
const RUN = await page.evaluate(() => window.__climb.TUNE.move.run);   /* the real run speed */

// ---- 2. a climb from the bottom
await page.click('[data-act="pool"]');
await page.click('[data-act="start"][data-k="-1"]');
await until(() => window.__climb.ST.mode === 'climb', 5000, 'the climb to start');
if (fast) await setSpeed(5.5);
await until(() => window.__climb.ST.G.s > 50, 90000, 'the tutorial flights');
await shot('02-climb');
console.log('after tutorial', await st());
await until(() => window.__climb.S.lifts.length > 0, 90000, 'the lift repair');
await until(() => window.__bot.log.includes('resume'), 90000, 'the rest stop');
console.log('rest stop passed', await st());
await until(() => window.__climb.ST.G.s > 15 * 9.8 + 2, 300000, 'reaching the second zone');
console.log('second zone', await st());
if ((await page.evaluate(() => !!window.__climb.ST.B))) fail('a Warden started while the Wardens are parked');

// ---- 3. a fall caught on a root, then a plunge
await page.evaluate(() => { window.__climb.ST.G.inv = 0; window.__climb.hurt(99, 'test'); });
await until(() => window.__climb.ST.mode === 'fall', 3000, 'the fall');
await page.waitForTimeout(300); await shot('03-fall');
await until(() => window.__climb.ST.mode === 'climb', 25000, 'the root grab');
await page.waitForTimeout(1500); await shot('04-recovered');   // after the invulnerability flicker
const pose = await page.evaluate(async () => {
  const { PL } = await import('/src/entities/player/player.js'), { GLB } = await import('/src/entities/player/glbRig.js');
  const r = GLB.root ? GLB.root.rotation : { x: 0, z: 0 };
  return { spin: +(PL.body.rotation.z + r.z).toFixed(3), tip: +(PL.body.rotation.x + r.x).toFixed(3), blender: !!GLB.ready };
});
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
  if (fast) await setSpeed(4.6);
  const t0 = Date.now();
  await until(() => window.__climb.ST.mode === 'menu', 120000, 'practice of ' + id);
  const done = await page.evaluate(() => !!document.querySelector('[data-act="practice-go"]') && /cleared/.test(document.getElementById('overlay').textContent));
  const r = await st();
  const hitLog = await page.evaluate(() => window.__bot.hitLog.join(' '));
  report.push({ id, cleared: done, hitsTaken: r.hits, by: hitLog, seconds: Math.round((Date.now() - t0) / 1000) });
  if (!done) fail(`the bot could not clear practice of ${id}: ${JSON.stringify(r)}`);
}
console.table(report);
// and each one must actually hurt a warrior who walks straight into it, at the real run speed (a sped-up bot reaches
// a broken step before it has opened, which no player can)
await setSpeed(RUN);
const toothless = [];
for (const id of ids){
  await page.evaluate(() => import('/src/ui/screens/practice.js').then(m => m.practiceMenu()));
  await page.click(`[data-act="practice-go"][data-id="${id}"]`);
  await page.evaluate(() => { window.__bot.answer = false; window.__bot.hits = 0; });
  const hp0 = await page.evaluate(() => window.__climb.ST.G.hp);
  // only real damage counts: reaching the end of the practice run unhurt means the threat was toothless
  await page.waitForFunction(h => window.__climb.ST.G.hp < h || window.__climb.ST.mode !== 'climb', hp0, { timeout: 150000, polling: 50 }).catch(() => {});
  const hurtIt = await page.evaluate(h => window.__climb.ST.G.hp < h, hp0);
  if (!hurtIt) toothless.push(id);
  await page.evaluate(() => { window.__bot.answer = true; });
}
if (toothless.length) fail('these threats never hurt a warrior who ignored them: ' + toothless.join(', '));
console.log('every threat hurts when ignored');
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('the-climb')));
if (after.falls !== saved.falls || after.best !== saved.best) fail('practice changed the save');
const unfair = report.filter(r => r.hitsTaken > 0);
if (unfair.length) fail('threats hit the bot while it answered them correctly: ' + unfair.map(r => r.id).join(', '));
// ---- a fork: from the fork landing hop onto the crumbling spur, run up it as it falls away, leap at its end onto the
// high road's foot, then climb the high road to the landing it rejoins. The controls run inside the page, every frame.
const fork = await page.evaluate(async () => {
  const { startClimb } = await import('/src/modes/climb.js'), { hideMenu } = await import('/src/ui/overlay.js'), P = await import('/src/world/path.js');
  window.__bot.on = false; window.__climb.input.release(); hideMenu(); window.__climb.ST.practice = null;   // the bot lets go of everything it held
  window.__P = P;
  const b = P.BRANCHES[0]; startClimb(P.landingS(b.kA) - 0.3); b.open = true;   /* the run draws which forks are open: this one is, for the test */
  const G = window.__climb.ST.G; G.maxHp = G.hp = 99;
  const gen = await import('/src/world/generate.js'); for (const c of gen.content.values()) for (const o of c.obs){ o.done = true; o.alive = false; o.st = 'gone'; }
  return { kA: b.kA, kB: b.kB, sB: P.landingS(b.kB) };
});
await page.waitForTimeout(600);
await page.evaluate(() => {
  const I = window.__climb.input, P = window.__P; window.__fork = { phase: 'hop', log: [], clear: true };
  import('/src/world/generate.js').then(gen => { const clr = () => { for (const c of gen.content.values()) for (const o of c.obs){ o.done = true; o.alive = false; o.st = 'gone'; } if (window.__fork.clear) requestAnimationFrame(clr); }; clr(); });   /* no threats on this test, including on flights that load as he climbs */
  const f = () => { const G = window.__climb.ST.G, sp = P.spurOf(G.s), b = P.branchOf(G.s), F = window.__fork;
    if (F.phase === 'hop' && sp) F.phase = 'run';
    else if (F.phase === 'run' && sp && G.grounded && G.s - sp.s0 >= sp.len - 0.9){ I.hold('jump', true); F.phase = 'up'; F.log.push('jump ' + (G.s - sp.s0).toFixed(2)); }
    else if (F.phase === 'up' && G.vy < 0){ I.hold('jump', false); F.phase = 'fall'; }
    else if (F.phase === 'fall' && b && G.grounded){ I.hold('right', false); I.hold('left', true); F.phase = 'road'; F.log.push('landed ' + (G.s - b.s0).toFixed(2)); }
    else if ((F.phase === 'fall' || F.phase === 'run') && !sp && !b && G.grounded && F.log.length){ F.phase = 'missed'; }
    if (F.phase !== 'road' && F.phase !== 'missed') requestAnimationFrame(f); }; f();
  I.hold('right', true); I.tap('jump');
});
await until(() => window.__fork.phase === 'road' || window.__fork.phase === 'missed', 15000, 'hopping onto the spur, running it and leaping to the high road');
const leap = await page.evaluate(() => window.__fork);
if (leap.phase !== 'road') fail('missed the leap from the spur to the high road: ' + JSON.stringify(leap));
await until(() => !window.__P.branchOf(window.__climb.ST.G.s) && !window.__P.spurOf(window.__climb.ST.G.s) && window.__climb.ST.G.grounded, 90000, 'climbing the high road to its end');   // (synchronous: a promise would count as true at once)
const forkEnd = await page.evaluate(() => { window.__climb.input.hold('left', false); window.__fork.clear = false; const G = window.__climb.ST.G; return { s: G.s, y: G.y, k: Math.floor(G.s / 9.8), hp: G.hp }; });
if (forkEnd.hp !== 99) fail('the fork hurt him on the way: ' + (99 - forkEnd.hp) + ' hits');
if (Math.abs(forkEnd.s - fork.sB) > 1.5) fail('the high road did not bring him out at the landing it rejoins: ' + JSON.stringify({ forkEnd, fork }));
console.log('took the fork from flight ' + fork.kA + ' to ' + fork.kB + ': ' + leap.log.join(', '));
await page.evaluate(() => { window.__bot.on = true; });
const clipR = await page.evaluate(() => window.__clip);
console.log('clipping:', JSON.stringify(clipR));
if (clipR.frames < 500) fail('the clipping test saw too little grounded play: ' + clipR.frames + ' frames');
if (clipR.footBad) fail(`a foot sank into a step on ${clipR.footBad} frames (worst ${clipR.worstFoot.toFixed(2)} at ${clipR.footAt})`);
if (clipR.bladeBad) fail(`the blade cut into stone on ${clipR.bladeBad} frames (worst ${clipR.worstBlade.toFixed(2)} at ${clipR.bladeAt})`);
if (errors.length) fail('errors logged');
console.log('SMOKE OK');
await browser.close(); server.kill(); process.exit(0);
