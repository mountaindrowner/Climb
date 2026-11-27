// The throw (build 121; docs/phase18-sheet.md 1; decision 0.26): at the door of the last region he is thrown down to
// the bottom of the Deep. Until he has climbed out, the Deep's doors in the climb are shut; after, they are open.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), ST = await import('../src/side/state.js'), R = await import('./helpers/reach.mjs');
const main = readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8'), story = readFileSync(new URL('../src/side/story.js', import.meta.url), 'utf8');
const HOLLOW = LV.REGION_DATA.findIndex(r => r.name === 'The Hollow'), TOP = LV.CLIMB_TOP;

test('a new game clears everything the save remembered, whatever it was kept under', () => {
  ST.fresh(); Object.assign(ST.G, { gates: { 0: { hall: 1 } }, walls: { 2: ['horn'] }, rails: { 1: { floor: 1 } }, lit: { 2: ['3,4'] }, done: true, deepTold: 1, thrown: 1, out: 1, due: 1, taught: { card_flask: 1 }, shards: 99 });
  ST.wipe();
  for (const k of ['gates', 'walls', 'rails', 'lit', 'done', 'deepTold', 'thrown', 'out', 'due', 'taught']) assert.equal(ST.G[k], undefined, k + ' is gone');
  assert.equal(ST.G.shards, 0); assert.equal(ST.G.began, false); assert.deepEqual(ST.G.got, {});
  ST.fresh();
});

test('the Deep\'s doors: shut as the game is made; open when its switch is thrown and the levels are made again', () => {
  assert.equal(LV.DEEP.shut, true, 'shut, until the game says he is out');
  const down = L => L.marks.filter(m => m.type === 'pass' && LV.REGION_DATA[m.to] && LV.REGION_DATA[m.to].deep);
  LV.resetLevels(); const shut = down({ ...LV.loadLevel(0), marks: LV.loadLevel(0).marks.map(m => ({ ...m })) }); assert.equal(shut.length, 1, 'one way down from the climb: the Pithead'); assert.ok(shut[0].shut, 'nailed down');
  LV.DEEP.shut = false; LV.resetLevels(); const L = LV.loadLevel(0), open = down(L); assert.equal(open.length, 1); assert.ok(!open[0].shut, 'open');
  for (let y = open[0].y; y < open[0].y + 2; y++) for (let x = open[0].x; x < open[0].x + (open[0].w || 2); x++) assert.notEqual(L.tiles[y * L.W + x], LV.ROCK, 'and no rock in its mouth');
  LV.DEEP.shut = true; LV.resetLevels(); assert.ok(down(LV.loadLevel(0))[0].shut, 'and shut again, as for a new game');
  // the ways up out of the Deep are never shut
  for (let n = 0; n < LV.LEVELS.length; n++) if (LV.REGION_DATA[n].deep) for (const m of LV.loadLevel(n).marks) if (m.type === 'pass') assert.ok(!m.shut, LV.LEVELS[n].name + ': its ways are open');
});

test('where the throw happens, and only there: coming up into the last region from the one under it, once', () => {
  assert.equal(LV.LEVELS[TOP].name, 'The Firmament'); assert.equal(LV.LEVELS[HOLLOW].name, 'The Hollow');
  // marked as due in both ways he can come up (through the sill, and by the dark between regions), not when trying a place from the title
  assert.ok(/if \(n === CLIMB_TOP && from0 === CLIMB_TOP - 1 && !G\.thrown && !TRY\.on\) G\.due = 1;/.test(main), 'in enter()');
  assert.ok(/if \(LEVEL\.index === CLIMB_TOP && from === CLIMB_TOP - 1 && !G\.thrown && !TRY\.on\) G\.due = 1;/.test(main), 'in cross()');
  assert.equal((main.match(/G\.due = 1/g) || []).length, 2, 'and nowhere else');
  // due, standing in the last region with nothing else going on: a moment, and then the screen
  assert.ok(/if \(G\.due && !G\.thrown && LEVEL\.index === CLIMB_TOP && !GO\.st && !STORY\.active\(\) && !PAUSE && !SCREEN && P\.hp > 0 && !DISS && !UNDER && !TRY\.on\)\{ THROWT \+= dt; if \(THROWT > 1\.6 && P\.grounded\) throwDown\(\); \} else THROWT = 0;/.test(main));
  // the screen, and after it: thrown, no longer due, in the Hollow, whole
  assert.ok(/STORY\.start\('thrown', \{\}, \(\) => \{ G\.thrown = 1; G\.due = 0; enter\(HOLLOW\); P\.hp = P\.maxHp; P\.flask = P\.flaskMax;/.test(main));
  assert.ok(/const HOLLOW = REGION_DATA\.findIndex\(r => r\.name === 'The Hollow'\);/.test(main));
  // a save that was already in the last region, or past the end, is not thrown, and the Deep is open to it
  assert.ok(/if \(G\.thrown == null && !G\.due && \(\(G\.top \|\| 0\) >= CLIMB_TOP \|\| G\.done\)\)\{ G\.thrown = 1; G\.out = 1; \}/.test(main));
});

test('out of the Deep: the first time he comes up into the climb after the throw, its doors open; until then no water takes him up', () => {
  assert.ok(/if \(G\.thrown && !G\.out && !REGION_DATA\[n\]\.deep && REGION_DATA\[from0\]\.deep\)\{ G\.out = 1; OUTNOW = true; \}/.test(main), 'in enter(), before the region is made');
  assert.ok(/const deepDoors = \(\) => \{ const shut = !G\.out; if \(DEEP\.shut === shut\) return false; DEEP\.shut = shut; resetLevels\(\); return true; \};/.test(main), 'the doors follow the save');
  assert.ok(main.indexOf('deepDoors();\n  ARROWS.length = 0;') > 0, 'set before enter() makes the region'); assert.ok(/ENT\.reset\(\); deepDoors\(\); loadLevel\(J\.to\); rebased\(\);/.test(main), 'and before cross() does');
  assert.ok(/menuHide\(\); wipe\(\); deepDoors\(\);/.test(main), 'and shut again for a new game');
  assert.ok(/if \(G\.thrown && !G\.out && !REGION_DATA\[n\]\.deep\) continue;/.test(main), 'the waters of the climb are not offered to one who has not climbed out');
  // what he is told, down there
  assert.ok(/if \(G\.thrown && !G\.out\) banner\('The bottom of the mountain', 'You were thrown down\. The way out is up\.', 8\);/.test(main));
  assert.ok(/G\.thrown && !G\.out \? 'YOU WERE THROWN DOWN TO THE BOTTOM OF THE MOUNTAIN\. CLIMB OUT: THE WAY IS UP\.'/.test(main));
});

test('the throw\'s screen: its own kind, the opening\'s fall inside it, and it ends', () => {
  assert.ok(/\(\{ title, intro, card, ending, pool: poolScreen, thrown \}\)\[S\.kind\]\(dt\);/.test(story)); assert.ok(/function thrown\(dt\)\{/.test(story));
  assert.ok(/function fallPart\(t, dt\)\{/.test(story)); assert.equal((story.match(/fallPart\(/g) || []).length, 3, 'made once, played by the opening and by the throw');
  assert.ok(/if \(t >= LEN\.thrown\) end\(\);/.test(story));
  const L = /thrown: 7\.2 \+ \(21\.4 - 5\) \/ 1\.6 \+ 9\.2/.test(story); assert.ok(L, 'the stand-off, the fall at 1.6 times the opening\'s pace, and what is under the water'); assert.ok(7.2 + (21.4 - 5) / 1.6 + 9.2 < 30, 'shorter than the opening');
  assert.ok(/const THROW0 = 7\.2, THROW_K = 1\.6, THROW1 = THROW0 \+ \(FALL1 - FALL0\) \/ THROW_K;/.test(story));
  // it can be hurried on, as the opening can (anything but the title, a card or the pool ends at a press)
  assert.ok(/else end\(\); \} \};/.test(story));
});

test('where he lands: in the Hollow, on his feet beside its water; and he is not shut in', () => {
  LV.loadLevel(HOLLOW); const L = { ...LV.LEVEL }, sp = L.marks.find(m => m.type === 'spawn'), pool = L.marks.find(m => m.type === 'pool'), room = L.rooms.find(r => sp.x >= r.tx0 && sp.x < r.tx1 && sp.y >= r.ty0 && sp.y < r.ty1);
  assert.equal(room.name, 'roof', 'at the foot of the roof, where the falling water gathers'); assert.ok(pool && Math.abs(pool.x - sp.x) <= 14 && Math.abs(pool.y - sp.y) <= 2, 'beside the Hollow\'s water');
  assert.equal(L.tiles[(sp.y - 1) * L.W + sp.x], LV.ROCK, 'on rock'); for (let d = 0; d < 5; d++) assert.equal(L.tiles[(sp.y + d) * L.W + sp.x], LV.EMPTY, 'with room to stand');
  // the way out above, without the grip and with no keeper down: from where he lands, to where the Shaft comes in
  const onward = (G, from) => { const seen = new Set(from), q = [...from]; while (q.length){ const k = q.pop(); for (const c of (G.edges.get(k) || new Map()).keys()) if (!seen.has(c)){ seen.add(c); q.push(c); } } return seen; };
  const up = (N, type, name, to, gifts) => { const G = R.graph(N, gifts), W = G.W, from = G.marks.find(m => m.type === type && (!name || m.name === name)), out = G.marks.find(m => m.type === 'arrive' && m.name === to);
    const near = [...G.seen].filter(k => Math.abs(k % W - from.x) <= 3 && Math.abs(Math.floor(k / W) - from.y) <= 2); assert.ok(near.length > 0, LV.LEVELS[N].name + ': he can stand where he comes in');
    return [...onward(G, near)].some(k => Math.abs(k % W - out.x) <= 3 && Math.abs(Math.floor(k / W) - out.y) <= 2); };
  const HAS = ['breaker', 'dash', 'glide'];   // what he has by the door of the last region
  assert.ok(up(HOLLOW, 'spawn', null, 'top', HAS), 'the Hollow: up its roof to the Shaft\'s floor');
  assert.ok(up(HOLLOW - 1, 'arrive', 'floor', 'top', HAS), 'the Great Shaft: from its floor to its head');
  assert.ok(up(6, 'arrive', 'seal', 'down', HAS), 'the Workings: from the seal to the Pithead');
  assert.ok(up(7, 'arrive', 'lip', 'top', [...HAS, 'still']), 'the Vein: from its lip to its stair, the Assayer down');
});

// ---- the Deep upward (build 122; docs/phase18-sheet.md 2)
test('the Assayer\'s grate, from under it: a ring on its bar, in the flue below; struck, the grate is open whether the Assayer stands or not', () => {
  LV.loadLevel(7); LV.setGates(); const L = { ...LV.LEVEL }, room = n => L.rooms.find(r => r.name === n), cr = room('cradle'), as = room('assay'), inR = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;
  const grate = []; for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (L.tiles[j * L.W + i] === LV.STILLED) grate.push([i, j]);
  assert.equal(grate.length, 12, 'one grate in the Vein: the hatch in the floor of the Assayer\'s hall'); assert.ok(grate.every(([i, j]) => i >= as.tx0 + 4 && i <= as.tx0 + 9 && j >= as.ty0 && j <= as.ty0 + 1));
  const ring = L.marks.filter(m => m.type === 'ring'); assert.equal(ring.length, 1); assert.equal(ring[0].key, 'unbar'); assert.ok(ring[0].bars && ring[0].says); assert.ok(inR(ring[0], cr), 'in the cradle, under the hall');
  assert.ok(ring[0].x >= as.tx0 + 4 && ring[0].x <= as.tx0 + 9, 'under the grate'); assert.equal(L.tiles[ring[0].y * L.W + ring[0].x], LV.EMPTY);
  // beside the upper step of the flue, within his reach from it; and the rung over that step is a leap up, the hall's floor a leap over the rung
  const step = cr.ty0 + 13; assert.equal(L.tiles[(step - 1) * L.W + cr.tx0 + 46], LV.ROCK, 'the upper step'); assert.ok(Math.abs(ring[0].x - (cr.tx0 + 47)) <= 2 && ring[0].y - step >= 0 && ring[0].y - step <= 3, 'the ring hangs where his blow is');
  assert.equal(L.tiles[(cr.ty0 + 18) * L.W + cr.tx0 + 46], LV.LEDGE, 'the rung'); assert.ok(19 - 13 <= 7 && (as.ty0 + 2) - (cr.ty0 + 19) <= 7);
  // the grate: stone until the Assayer is stilled or the bar is off
  const [gx, gy] = grate[0]; LV.RULE.still = false; assert.equal(LV.tileAt(gx, gy), LV.ROCK); LV.RULE.gates.add('unbar'); assert.equal(LV.tileAt(gx, gy), LV.EMPTY, 'unbarred'); LV.RULE.gates.delete('unbar'); assert.equal(LV.tileAt(gx, gy), LV.ROCK);
  LV.RULE.still = true; assert.equal(LV.tileAt(gx, gy), LV.EMPTY, 'or the Assayer down'); LV.RULE.still = false;
  LV.setGates({ unbar: 1 }); assert.ok(LV.RULE.gates.has('unbar'), 'his save keeps it unbarred'); LV.setGates(); assert.ok(!LV.RULE.gates.has('unbar'));
  const props = readFileSync(new URL('../src/side/props.js', import.meta.url), 'utf8'); assert.ok(/for \(const B of grates\) B\.m\.visible = !\(RULE\.still \|\| RULE\.gates\.has\('unbar'\)\);/.test(props), 'and it is not drawn when it is open');
  // no other level has such a ring: a grate anywhere else opens only when its keeper falls
  for (let n = 0; n < LV.LEVELS.length; n++) if (n !== 7) assert.equal(LV.loadLevel(n).marks.filter(m => m.bars).length, 0, LV.LEVELS[n].name);
});

test('the long way out, played without the grip and with no keeper down: the Hollow, the Shaft, the Vein, the Workings', () => {
  const onward = (G, from) => { const seen = new Set(from), q = [...from]; while (q.length){ const k = q.pop(); for (const c of (G.edges.get(k) || new Map()).keys()) if (!seen.has(c)){ seen.add(c); q.push(c); } } return seen; };
  const HAS = ['breaker', 'dash', 'glide'];
  // the Vein is not walked from its spawn here (that is at its top): he is set down where the Shaft comes in, and played from there
  const G = R.graph(7, HAS), W = G.W, lip = G.marks.find(m => m.type === 'arrive' && m.name === 'lip'), top = G.marks.find(m => m.type === 'arrive' && m.name === 'top');
  assert.ok(![...G.seen].some(k => Math.abs(k % W - lip.x) <= 3 && Math.abs(Math.floor(k / W) - lip.y) <= 2), 'from above the lip is behind the Assayer, as it was: the ring is under the grate, not over it'); assert.ok(!G.gates.includes('unbar'));
  // from below: every place he can come to from the lip, the ring among them; then, the bar off, the hall and the stair
  LV.loadLevel(7); LV.setGates(); LV.RULE.still = false; const T = LV.T, seen = new Set(), q = [[(lip.x + 0.5) * T, lip.y * T]], cell = (x, y) => Math.round(y / T) * W + Math.floor(x / T); seen.add(cell(...q[0]));
  const walk = () => { while (q.length){ const [x, y] = q.pop(); for (const p of R.PROGS.concat(R.DASH)) for (const [c, at] of R.run(x, y, p)) if (!seen.has(c)){ seen.add(c); q.push(at); } } };
  walk(); const ring = G.marks.find(m => m.type === 'ring'), near = (m, dx = 3, dy = 2) => [...seen].some(k => Math.abs(k % W - m.x) <= dx && Math.abs(Math.floor(k / W) - m.y) <= dy);
  assert.ok(near(ring), 'he comes to the ring'); assert.ok(!near(top), 'and not out: the grate is barred');
  LV.RULE.gates.add('unbar'); for (const k of seen) q.push([(k % W + 0.5) * T, Math.floor(k / W) * T]); walk(); assert.ok(near(top), 'the bar off: up through the hall and the knot to the Vein\'s stair');
  const as = G.rooms.find(r => r.name === 'assay'); assert.ok([...seen].some(k => { const i = k % W, j = Math.floor(k / W); return i >= as.tx0 && i < as.tx1 && j >= as.ty0 && j < as.ty1; }), 'through the Assayer\'s hall');
  LV.setGates();
});

test('Hob, met by one climbing out: his own lines in the Vein and the Workings, used only then', () => {
  const talk = readFileSync(new URL('../src/side/talk.js', import.meta.url), 'utf8');
  return import('../src/side/talk.js').then(TK => {
    assert.ok(Array.isArray(TK.HOB_UP[7]) && TK.HOB_UP[7].length === 3 && Array.isArray(TK.HOB_UP[6]) && TK.HOB_UP[6].length === 3); assert.equal(TK.HOB_UP[8], undefined, 'in the Flooded Levels he says what he always says: they are off the way');
    assert.ok(/const climbing = N\.who === 'hob' && G\.thrown && !G\.out && HOB_UP\[LEVEL\.index\];/.test(main)); assert.ok(/S0 = climbing \|\| \(SCRIPT\[N\.who\] \|\| \[\]\)\[LEVEL\.index\]/.test(main));
    // decision 0.27: never what to do
    for (const n of [6, 7]) for (const line of TK.HOB_UP[n]){ assert.ok(!/\b(you must|you need|you should|go to|strike|turn the|start the|climb)\b/i.test(line), 'no instruction: ' + line); assert.ok(line.length < 120); }
    assert.equal(TK.HOB_UP[6][2], TK.SCRIPT.hob[6][2], 'and in the Workings he ends as he always does'); assert.ok(talk.includes('HOB_UP[7]'));
  });
});
