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
  import { posOf, special, walkY } from '/src/world/path.js';
  import { decksAt, stairHole } from '/src/world/decks.js';
  import { holeAt } from '/src/world/ground.js';
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
          case 'gap': { const dc = d + 0.25; if (!o.done && dc > 0.3 && dc < 1.15 && G.grounded) jump(26); break; }   // up to the lip: landing a jump just short of the next hole, jump again   // a hole wants a held, full jump
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
          case 'flitter': if (o.st === 'dive' && o.tm > TUNE.flitter.dive - 0.3 && !G.atk) I.tap('attack'); break;   // a wind-up ahead of the bite
        }
      }
      // the Warden: out from under a fist's shadow (rolling through it if the floor runs out), under a sweeping hand, over
      // the shockwaves, away from the rocks; then strike a fist resting on the floor, or his head when it comes down
      const W = ST.W;
      if (W && W.sealed && W.st !== 'risen' && W.st !== 'dying'){
        const GT = TUNE.golem, lo = W.span.s0 + 0.5, hi = W.span.s1 - 0.4;
        move = 0;
        for (const hd of W.hands){
          const A = hd.act; if (!A || A.pt < 0) continue;
          const ph = A.phases[A.pi][0], wind = A.phases[0][1];
          if (A.kind === 'slam' && (ph === 'wind' || ph === 'strike')){
            const d = G.s - A.tgt;
            if (Math.abs(d) < GT.slam.half + 0.5){
              let dir = Math.sign(d) || (G.s < W.mid ? 1 : -1);
              if (G.s + dir * (GT.slam.half + 0.8 - Math.abs(d)) > hi || G.s + dir * (GT.slam.half + 0.8 - Math.abs(d)) < lo) dir = -dir;   /* no room: through it */
              move = dir;
              if ((ph === 'strike' || A.pt > wind - 0.28) && Math.abs(d) < GT.slam.half && G.roll <= 0) I.tap('roll');
            }
          }
          if (A.kind === 'sweep' && (ph === 'cross' || (ph === 'wind' && A.pt > wind - 0.25))) crouch = true;
        }
        if (!move && !crouch){
          const open = W.hands.find(h => h.open);
          if (W.st === 'reel' && W.reelF > 0.5){ const d = W.mid - G.s; if (Math.abs(d) > 2.5) move = Math.sign(d); else if (!G.atk) I.tap('attack'); }
          else if (open){ const d = open.pos.s - G.s; if (Math.abs(d) > 1.5 || (Math.abs(d) > 0.4 && Math.sign(d) !== G.face)) move = Math.sign(d); else if (!G.atk) I.tap('attack'); }
        }
        for (const v of W.waves){ const dv = v.s - G.s; if (Math.sign(dv) === -v.dir && Math.abs(dv) < 1.25 && Math.abs(dv) > 0.3 && G.grounded){ crouch = false; jump(16); } }
        for (const q of W.rocks) if (!q.hit && Math.abs(q.s - G.s) < 0.9){ move = Math.sign(G.s - q.s) || 1; crouch = false; }
      }
      const p = posOf(G.s);
      if (p.land && special(p.k) === 'lift' && !ST.practice && !window.__climb.S.lifts.includes(p.k)){ move = 0; if (Math.abs(G.v) < 0.5 && G.grounded) I.tap('jump'); }   // stop on the landing, then repair
    }
    // platforming: where the ground ahead gives out (a missing flight, a gap), take a full running jump; catching ledges is automatic
    if (bot.answer && move > 0 && G.grounded && !G.mantle){
      const sa = G.s + 0.6, edge = G.on ? !decksAt(sa).includes(G.on) : (stairHole(sa) && !decksAt(sa).some(d => Math.abs(d.top - G.y) < 0.5));
      if (edge) jump(26);   /* the end of the ledge it stands on, or a missing flight ahead (a broken step has its own rule) */
    }
    // the double jump: near the top of a jump over a gap, with nothing to land on close below, jump again
    if (bot.answer && move > 0 && !G.grounded && !G.mantle && G.airJumps > 0 && G.vy < 1.2 && G.vy > -4 && G.jumpT > 0.15){
      const below = decksAt(G.s).filter(d => d.top <= G.y + 0.05).sort((p, q) => q.top - p.top)[0], ground = holeAt(G.s) || stairHole(G.s) ? -Infinity : walkY(G.s);
      const floor = Math.max(ground, below ? below.top : -Infinity), ahead = decksAt(G.s + 1.2).some(d => d.top > G.y - 0.3);
      if (G.y - floor > 1.2 || ahead){ I.tap('jump'); I.hold('jump', true); bot.jumpHold = Math.max(bot.jumpHold, 14); }
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
if (fast) await page.evaluate(() => { window.__climb.TUNE.golem.hp = () => 14; });   /* a shorter Warden (still into his second phase): the headless frame rate runs game time at a fraction of real time */
await until(() => window.__climb.ST.G.s > 50, 90000, 'the tutorial flights');
await shot('02-climb');
console.log('after tutorial', await st());
await until(() => window.__climb.S.lifts.length > 0, 90000, 'the lift repair');
await until(() => window.__climb.ST.G.campDone.size > 0 && window.__climb.ST.mode === 'climb', 120000, 'the rest stop');   // (the bot also walks past oath stones)
console.log('rest stop passed', await st());
await until(() => window.__climb.ST.W && window.__climb.ST.W.sealed, 120000, 'the Warden\'s floor: the rubble falls behind and he wakes');
const hits0 = await page.evaluate(() => window.__bot.hits);
await shot('02b-warden');
await until(() => !window.__climb.ST.W || window.__climb.ST.W.st === 'risen', 600000, 'beating the Warden');
const wR = await page.evaluate(h0 => ({ beaten: window.__climb.S.bosses.slice(), hits: window.__bot.hits - h0, log: window.__bot.hitLog.slice(-8) }), hits0);
if (!wR.beaten.includes(14)) fail('the Warden on the floor was not kept as beaten: ' + JSON.stringify(wR));
console.log('the Warden on the floor: beaten, ' + wR.hits + ' damage taken (' + wR.log.join(', ') + ')');
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
  // by the wall clock, and GitHub's runners draw frames far slower than a desktop (the game's step is capped at 1/20 s, so
  // a slow machine plays in slow motion): the beam's practice takes 1.5 minutes here and over 3 there
  await until(() => window.__climb.ST.mode === 'menu', 420000, 'practice of ' + id);
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
// ---- a fork, a switchback: from the fork landing, a jump catches the overhead ledge and he hauls himself onto it; from its
// last ledge a jump comes up through the gap in the stair a turn above; and a fall through a hole lands a turn below, hurt
const fork = await page.evaluate(async () => {
  const { startClimb } = await import('/src/modes/climb.js'), { hideMenu } = await import('/src/ui/overlay.js'), P = await import('/src/world/path.js'), D = await import('/src/world/decks.js');
  window.__bot.on = false; window.__climb.input.release(); hideMenu(); window.__climb.ST.practice = null;   // the bot lets go of everything it held
  window.__P = P; window.__D = D;
  const b = P.BRANCHES[0]; startClimb(P.landingS(b.kA) - 0.3);
  const gen = await import('/src/world/generate.js');
  if (!b.open){ b.open = true; const L = await import('/src/world/ledges.js'), St = await import('/src/world/stair.js'); L.buildMore(D.openFork(b), gen.dyn); St.setFlight(Math.floor(D.switchbackOf(b.kA).hole.s0 / 9.8)); }   /* the run draws which forks are open: this one is, for the test */
  const G = window.__climb.ST.G; G.maxHp = G.hp = 99; window.__b = b; window.__fork = { clear: true };
  const clr = () => { for (const c of gen.content.values()) for (const o of c.obs){ o.done = true; o.alive = false; o.st = 'gone'; } if (window.__fork.clear) requestAnimationFrame(clr); }; clr();   /* no threats on this test */
  return { kA: b.kA };
});
await page.waitForTimeout(600);
await page.evaluate(() => { window.__climb.input.hold('jump', true); });
await until(() => { const G = window.__climb.ST.G; return !!(G.on && G.on.owner === 'fork'); }, 6000, 'catching the switchback\'s first ledge from the fork landing');
await page.evaluate(() => { window.__climb.input.hold('jump', false); });
await page.evaluate(() => { const d = window.__D.DECKS.find(x => x.fork === window.__b && x.last), G = window.__climb.ST.G; G.s = G.prevS = (d.s0 + d.s1) / 2; G.y = d.top; G.on = d; G.grounded = true; G.vy = 0; });
await page.waitForTimeout(400);
await page.evaluate(() => { window.__climb.input.hold('right', true); window.__climb.input.hold('jump', true); });
await until(() => { const G = window.__climb.ST.G, h = window.__D.switchbackOf(window.__b.kA).hole; return G.grounded && !G.on && G.s > h.s1 - 0.05; }, 6000, 'coming up through the gap onto the stair a turn above');
await page.evaluate(() => { window.__climb.input.hold('right', false); window.__climb.input.hold('jump', false); });
const fall = await page.evaluate(async () => {
  const D = window.__D, G = window.__climb.ST.G, h = D.HOLES.find(x => x.platform && x.s0 > 80) || D.HOLES.find(x => x.s0 > 80);
  let x = h.s0 + 0.3; while (x < h.s1 - 0.3 && D.decksAt(x).length) x += 0.1;   /* a spot with no ledge under it */
  G.s = G.prevS = x; G.on = null; G.grounded = false; G.vy = 0; G.y = window.__P.topAt(G.s) + 0.3; G.airTop = G.y; G.inv = 0;
  window.__f0 = { s: G.s, hp: G.hp }; return true;
});
await until(() => window.__climb.ST.G.grounded, 10000, 'a fall through a hole to land below');
const fallR = await page.evaluate(() => { const G = window.__climb.ST.G; window.__fork.clear = false; return { ds: +(window.__f0.s - G.s).toFixed(2), turn: +window.__D.TURN.toFixed(2), hurt: window.__f0.hp - G.hp }; });
if (Math.abs(fallR.ds - fallR.turn) > 0.5 || fallR.hurt < 1) fail('a fall through a hole did not land a turn below and hurt: ' + JSON.stringify(fallR));
console.log('the switchback from landing ' + fork.kA + ': caught its ledge, came up through the gap; a fall dropped a turn and cost ' + fallR.hurt);
// ---- a platforming flight: the bot runs and jumps it, ledge to ledge, onto the landing above, without falling
const plat = await page.evaluate(() => {
  const D = window.__D, P = window.__P, h = D.HOLES.find(x => x.platform), G = window.__climb.ST.G;
  G.s = G.prevS = P.landingS(h.k - 1); G.y = P.walkY(G.s); G.on = null; G.grounded = true; G.vy = 0; G.v = 0; G.hp = G.maxHp = 99; window.__fork.clear = true;
  import('/src/world/generate.js').then(gen => { const clr = () => { for (const c of gen.content.values()) for (const o of c.obs){ o.done = true; o.alive = false; o.st = 'gone'; } if (window.__fork.clear) requestAnimationFrame(clr); }; clr(); });
  window.__pk = h.k; window.__bot.on = true; window.__bot.answer = true; return { k: h.k, ledges: D.DECKS.filter(d => d.owner === 'flight' && d.k === h.k).length };
});
await until(() => { const G = window.__climb.ST.G; return (G.s > window.__pk * 9.8 + 8.2 && G.grounded && !G.on) || G.s < window.__pk * 9.8 - 20; }, 30000, 'crossing a platforming flight');
const platR = await page.evaluate(() => { window.__bot.on = false; window.__climb.input.release(); window.__fork.clear = false; const G = window.__climb.ST.G; return { made: G.s > window.__pk * 9.8 + 8.2, s: +(G.s - window.__pk * 9.8).toFixed(2) }; });
if (!platR.made) fail('the bot fell crossing platforming flight ' + plat.k + ': ' + JSON.stringify(platR));
console.log('crossed platforming flight ' + plat.k + ' (' + plat.ledges + ' ledges)');
// ---- a hidden hall: break the cracked wall behind its landing with three blows, step in, climb to the chest, and walk
// off the ledge at its end, down onto the next landing
const hallT = await page.evaluate(async () => {
  const { startClimb } = await import('/src/modes/climb.js'), P = window.__P, { GOLD } = await import('/src/config/economy.js');
  const h = P.HALLS.find(x => x.z === 0); startClimb(P.landingS(h.kH) - 0.2); for (const x of P.HALLS) x.open = x === h;
  const G = window.__climb.ST.G; G.maxHp = G.hp = 99; G.flask = 0; window.__H = h; window.__fork.clear = true;
  const gen = await import('/src/world/generate.js'); const clr = () => { for (const c of gen.content.values()) for (const o of c.obs){ o.done = true; o.alive = false; o.st = 'gone'; } if (window.__fork.clear) requestAnimationFrame(clr); }; clr();
  return { kH: h.kH, gold0: G.gold, pay: GOLD.hall(0), out: P.landingS(h.kH + 1) };
});
await page.waitForTimeout(500);
for (let i = 0; i < 3; i++){
  await page.evaluate(() => window.__climb.input.tap('attack'));
  await page.waitForFunction(n => window.__H.hits > n, i, { timeout: 5000, polling: 50 }).catch(() => {});   // the blow lands after the wind-up
  await until(() => !window.__climb.ST.G.atk, 5000, 'a swing at the cracked wall to finish');
}
if (!(await page.evaluate(() => window.__H.broken))) fail('three blows did not break the hidden hall\'s wall: ' + await page.evaluate(() => window.__H.hits) + ' landed');
await page.waitForTimeout(300);
await page.evaluate(() => window.__climb.input.tap('jump'));
await until(() => !!window.__P.hallOf(window.__climb.ST.G.s), 3000, 'stepping into the hall');
await page.evaluate(() => window.__climb.input.hold('right', true));
await until(() => !window.__P.hallOf(window.__climb.ST.G.s) && window.__climb.ST.G.grounded, 20000, 'walking the hall and dropping off its ledge');
const hallEnd = await page.evaluate(() => { window.__climb.input.hold('right', false); window.__fork.clear = false; const G = window.__climb.ST.G; return { s: G.s, hp: G.hp, gold: G.gold, flask: G.flask, flaskMax: G.flaskMax, looted: window.__H.looted }; });
if (!hallEnd.looted || hallEnd.gold !== hallT.gold0 + hallT.pay || hallEnd.flask !== hallEnd.flaskMax) fail('the hall\'s chest did not pay out: ' + JSON.stringify({ hallEnd, hallT }));
if (hallEnd.hp !== 99) fail('the hall hurt him: ' + (99 - hallEnd.hp) + ' hits');
if (Math.abs(hallEnd.s - hallT.out) > 2) fail('the hall\'s ledge did not drop him onto the next landing: ' + JSON.stringify({ hallEnd, hallT }));
console.log('broke into the hidden hall on landing ' + hallT.kH + ', took ' + hallT.pay + ' gold, dropped out at ' + (hallEnd.s - hallT.out).toFixed(2) + ' from landing ' + (hallT.kH + 1));
// ---- the run layer: an oath stone offers its choice and the oath holds; with the ram, three blows on a closed fork's
// rubble open it; a fall loses the wellstone carried and the Pool says so
const runL = await page.evaluate(async () => {
  const { startClimb } = await import('/src/modes/climb.js'), P = window.__P, O = await import('/src/world/oaths.js');
  startClimb(0.5); const st = O.STONES.find(x => x.k > 5) || O.STONES[0], G = window.__climb.ST.G; G.maxHp = G.hp = 99;
  G.s = G.prevS = P.landingS(st.k) - 1.2; G.y = P.walkY(G.s); window.__fork.clear = true;
  const gen = await import('/src/world/generate.js'); const clr = () => { for (const c of gen.content.values()) for (const o of c.obs){ o.done = true; o.alive = false; o.st = 'gone'; } if (window.__fork.clear) requestAnimationFrame(clr); }; clr();
  window.__climb.input.hold('right', true); return { k: st.k };
});
await until(() => window.__climb.ST.mode === 'menu' && !!document.querySelector('[data-act="swear"]'), 8000, 'the oath stone\'s choice');
await page.evaluate(() => window.__climb.input.hold('right', false));
await page.click('[data-act="swear"]');
const sworn = await page.evaluate(() => Object.values(window.__climb.ST.G.oaths).reduce((a, b) => a + b, 0));
if (sworn !== 1) fail('the oath was not sworn: ' + sworn);
await page.evaluate(() => { const P = window.__P, G = window.__climb.ST.G, S = window.__climb.S; if (!S.runes.includes('ram')) S.runes.push('ram'); const b = P.BRANCHES[0]; b.open = false; G.s = G.prevS = P.landingS(b.kA) - 0.2; G.y = P.walkY(G.s); G.v = 0; window.__B0 = b; });
await page.waitForTimeout(400);
for (let i = 0; i < 6 && !(await page.evaluate(() => window.__B0.open)); i++){
  await page.evaluate(() => window.__climb.input.tap('attack'));
  await page.waitForFunction(() => !!window.__climb.ST.G.atk, null, { timeout: 2000, polling: 30 }).catch(() => {});
  await page.waitForFunction(() => !window.__climb.ST.G.atk, null, { timeout: 4000, polling: 30 }).catch(() => {});
}
if (!(await page.evaluate(() => window.__B0.open))) fail('the ram did not break the rubble over the closed fork: ' + JSON.stringify(await page.evaluate(() => { const G = window.__climb.ST.G, P = window.__P; return { hits: window.__B0.spur.rubHits, at: +(G.s - P.landingS(window.__B0.kA)).toFixed(2), grounded: G.grounded, mode: window.__climb.ST.mode, ram: window.__climb.S.runes }; })));
await page.evaluate(async () => { const run = await import('/src/run/run.js'); run.killed('crawler', null); window.__fork.clear = false; const G = window.__climb.ST.G; G.inv = 0; window.__climb.hurt(999, 'test'); });
await until(() => window.__climb.ST.mode === 'menu', 40000, 'the fall to the Pool');
const poolTxt = await page.evaluate(() => document.getElementById('overlay').textContent);
if (!/wellstone you carried is gone/.test(poolTxt)) fail('the Pool did not report the wellstone lost: ' + poolTxt.slice(0, 200));
await page.evaluate(async () => { const { hideMenu } = await import('/src/ui/overlay.js'); hideMenu(); });
console.log('the run layer: swore an oath on landing ' + runL.k + ', the ram broke the rubble, the fall cost the wellstone carried');
await page.evaluate(() => { window.__bot.on = true; });
const clipR = await page.evaluate(() => window.__clip);
console.log('clipping:', JSON.stringify(clipR));
if (clipR.frames < 500) fail('the clipping test saw too little grounded play: ' + clipR.frames + ' frames');
if (clipR.footBad) fail(`a foot sank into a step on ${clipR.footBad} frames (worst ${clipR.worstFoot.toFixed(2)} at ${clipR.footAt})`);
if (clipR.bladeBad) fail(`the blade cut into stone on ${clipR.bladeBad} frames (worst ${clipR.worstBlade.toFixed(2)} at ${clipR.bladeAt})`);
if (errors.length) fail('errors logged');
console.log('SMOKE OK');
await browser.close(); server.kill(); process.exit(0);
