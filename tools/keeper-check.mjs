// Plays each keeper's thrown attack in the real game (docs/phase7-sheet.md 4), in both phases, twice: he stands still
// (he must be hurt: the attack is real), and he does the way out (he must not be). The keeper's own blows are held off
// while it runs, so only the thrown attack is measured. Prints a table.
//   node tools/keeper-check.mjs [region ...]   (1 the Roots ... 6 the Firmament)        (needs playwright; about a minute a keeper)
import { createRequire } from 'node:module'; import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url'; import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(process.env.PW_FROM || root + '/')('playwright');
const PORT = 8270, srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: root, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
// the way out, by keeper: called every frame in the page with S (window.__side), B (the keeper), T (its things)
const OUT = {
  'The Warden': 'jump the block', 'The Toll': 'stand between the books', 'The Rime Wyrm': 'block the shards', 'The Thunderhead': 'cut the ball',
  'Mother Thorn': 'walk off the marks', 'The Fallen': 'jump the ring',
};
const rows = [];
for (const n of (process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [1, 2, 3, 4, 5, 6])){
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); await p.route(/^(?!http:\/\/localhost)/, r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:${PORT}/side.html?play&level=${n}`); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.__side && window.__side.P && window.__side.input && window.__side.BOSS, null, { timeout: 120000 }); await p.waitForTimeout(5000);
  // onto the stage; through the entrance; the keeper's own blows held off
  await p.evaluate(() => { const S = window.__side, B = S.BOSS; S.G.taught = { move: 1, jump: 1, cut: 1, block: 1, parry: 1, crouch: 1, drop: 1, double: 1 }; S.P.x = B.cx - 7; S.P.y = B.stageY + 0.05; S.P.vx = S.P.vy = 0; S.CAM.x = S.P.x; S.CAM.y = S.P.y + 2; });
  for (let k = 0; k < 90; k++){ await p.waitForTimeout(500); const st = await p.evaluate(() => { const S = window.__side; if (S.BOSS.st === 'rise') S.input.tap('jump'); return S.BOSS.st; }); if (st === 'fight') break; }
  const name = await p.evaluate(() => window.__side.BOSS.name);
  if (process.env.HARMLESS) await p.evaluate(() => { window.__harmless = true; }); if (process.env.DEBUG) await p.evaluate(() => { window.__trace = true; });
  for (const phase of [1, 2]) for (const how of ['still', 'out']){
    const res = await p.evaluate(async ([phase, how, name]) => {
      const S = window.__side, B = S.BOSS, I = S.input, P = () => S.P, T = B.thrown; I.release();
      B.throwHold = true; B.phase = phase; T.clear(); P().hp = P().maxHp = 9; P().inv = 0; P().x = B.cx - 6; P().y = B.stageY + 0.05; P().vx = 0; P().face = 1;
      // the game is stepped a frame at a time (a sixtieth of a second each), so the timing is the game's own
      S.capture.on = true; S.capture.dt = 1 / 60; const frame = async () => { S.capture.left = 1; while (S.capture.left > 0) await new Promise(r => requestAnimationFrame(r)); };
      const hold = () => { B.cd = 99; if (B.rockT != null) B.rockT = 99; if (name === 'The Fallen'){ B.x = B.cx + 9; B.vx = 0; B.mode = 'stalk'; B.mt = 0; B.cut = null; } };
      for (let k = 0; k < 150; k++){ hold(); await frame(); } T.clear(); P().hp = 9; P().inv = 0; I.release();
      if (name === 'The Rime Wyrm') P().face = Math.sign(B.h.x - P().x) || 1;
      B.throwNow(); let warn = 0, moved = false, f = 0;
      if (window.__harmless) for (const o of T.list) o.harmless = true;
      const marked = T.list.some(o => o.wm);
      const ctl = () => { const p = P(), L = T.list.filter(o => !o.dead);
        if (!moved && L.some(o => o.t >= o.warn && !o.markOnly)){ moved = true; warn = f / 60; }
        if (how !== 'out') return;
        if (name === 'The Warden'){ const near = L.find(o => o.t >= o.warn && Math.abs(o.x - p.x) < 3 && Math.sign(o.vx) === Math.sign(p.x - o.x)); I.hold('jump', !!near); }
        if (name === 'The Toll'){ const xs = L.map(o => o.x0).sort((a, b) => a - b); let best = null; for (let k = 0; k + 1 < xs.length; k++){ const m = (xs[k] + xs[k + 1]) / 2; if (best == null || Math.abs(m - p.x) < Math.abs(best - p.x)) best = m; } if (best != null){ I.hold('left', p.x > best + 0.15); I.hold('right', p.x < best - 0.15); } }
        if (name === 'The Rime Wyrm'){ p.face = Math.sign(B.h.x - p.x) || 1; I.hold('block', true); }
        if (name === 'The Thunderhead'){ const o = L.filter(o => o.t >= o.warn).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0]; if (o){ p.face = Math.sign(o.x - p.x) || 1; if (Math.abs(o.x - p.x) < 2.6) I.tap('attack'); } }
        if (name === 'Mother Thorn'){ const xs = L.map(o => o.wm ? o.wm.position.x : o.x); if (xs.length){ const lo = Math.min(...xs), hi = Math.max(...xs), to = Math.abs(p.x - (lo - 3)) < Math.abs(p.x - (hi + 3)) ? lo - 3 : hi + 3; I.hold('left', p.x > to + 0.2); I.hold('right', p.x < to - 0.2); } }
        if (name === 'The Fallen'){ const o = L.find(o => o.t >= o.warn && Math.abs(o.y - (p.y + 1.2)) < 1.8 && Math.abs(o.x - p.x) < 3 && Math.sign(o.vx) === Math.sign(p.x - o.x)); I.hold('jump', !!o); }
      };
      const log = []; let hp0 = 9;
      const tr = [];
      for (f = 0; f < 600; f++){ hold(); ctl(); await frame(); if (window.__trace && T.list[0] && Math.abs(T.list[0].x - P().x) < 6) tr.push([f, +(T.list[0].x - P().x).toFixed(1), +(P().y - B.stageY).toFixed(1), P().grounded ? 1 : 0]); if (P().hp < hp0){ hp0 = P().hp; log.push({ f, by: S.lastHurt, blocking: P().blocking, face: P().face, px: +P().x.toFixed(1), py: +(P().y - B.stageY).toFixed(1), things: T.list.map(o => [o.kind, +o.x.toFixed(1), +(o.y - B.stageY).toFixed(1)]), arms: B.arms && B.arms.map(a => a.st), rocks: B.rocks && B.rocks.length, mode: B.mode }); } if (f > 90 && !T.list.length) break; } I.release(); S.capture.on = false;
      return { hp: P().hp, warn: +warn.toFixed(2), marked, log, tr };
    }, [phase, how, name]);
    if (process.env.DEBUG) console.log(name, phase, how, JSON.stringify(res.log), how === 'out' ? JSON.stringify(res.tr) : '');
    rows.push({ keeper: name, phase, how: how === 'still' ? 'stands still' : OUT[name], hurt: 9 - res.hp, warn: res.warn, marked: res.marked, ok: how === 'still' ? res.hp < 9 : res.hp === 9 });
  }
  if (errs.length) console.log(name, 'errors', errs.slice(0, 3)); await p.close();
}
console.log('| Keeper | Phase | He | Hearts lost | Warning (s) | Marked | As it should be |\n|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.keeper} | ${r.phase} | ${r.how} | ${r.hurt} | ${r.warn} | ${r.marked ? 'yes' : 'no'} | ${r.ok ? 'yes' : '**NO**'} |`);
await b.close(); srv.kill(); process.exit(rows.every(r => r.ok) ? 0 : 1);
