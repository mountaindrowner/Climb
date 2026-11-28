// The save kept twice (phase 20; docs/phase20-sheet.md): under 'climb-side', and the same again under
// 'climb-side-backup', written only once the first has gone in whole. A save that is missing or does not parse is read
// from its copy. A save from before (build 124 and earlier: no copy) is read as it always was.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

await import('./helpers/browser.mjs');
const ST = await import('../src/side/state.js');
const main = readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8');
const KEY = 'climb-side', BACKUP = 'climb-side-backup';
// a browser's storage: `refuse(k)` says whether a write to k is refused, as a full storage refuses one (it throws, and
// what was there stays)
function storage(refuse = () => false){
  const box = {}, writes = [];
  globalThis.localStorage = { getItem: k => (k in box ? box[k] : null), setItem: (k, v) => { if (refuse(k, v)) { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; } box[k] = String(v); writes.push(k); }, removeItem: k => { delete box[k]; } };
  return { box, writes };
}
const old124 = { seamed: 1, joined: 1, winged: 6, can: { dash: 1 }, level: 3, top: 3, beat: [1, 1, 1], shards: 412, threads: 4, relics: ['whetstone'], worn: ['whetstone'], got: { 3: ['t10,20'] }, broke: {}, org: { 3: [120, 115] }, began: true, thrown: 0 };

test('a save from build 124, with no copy: read exactly as before, and nothing written by reading it', () => {
  const { box, writes } = storage(); box[KEY] = JSON.stringify(old124);
  const G = ST.loadSave(); assert.equal(writes.length, 0, 'loading writes nothing');
  for (const k of Object.keys(old124)) assert.deepEqual(G[k], old124[k], k);
  assert.equal(G.began, true);
  // its first write makes the copy: the same text in both
  ST.store(); assert.equal(box[KEY], box[BACKUP]); assert.deepEqual(JSON.parse(box[KEY]).shards, 412);
  assert.deepEqual(writes, [KEY, BACKUP], 'the save first, its copy after');
});

test('when both copies are whole, the save itself is read, not the copy', () => {
  const { box } = storage(); box[KEY] = JSON.stringify({ ...old124, shards: 500 }); box[BACKUP] = JSON.stringify({ ...old124, shards: 1 });
  assert.equal(ST.loadSave().shards, 500);
});

test('a save missing, half written, or not a save: its copy is read', () => {
  for (const bad of [undefined, '{"seamed":1,"level":3,"shar', 'null', '[]', '7', '"text"']){
    const { box } = storage(); if (bad !== undefined) box[KEY] = bad; box[BACKUP] = JSON.stringify(old124);
    const G = ST.loadSave(); assert.equal(G.shards, 412, String(bad)); assert.equal(G.level, 3); assert.equal(G.began, true);
  }
  // both gone or spoiled: a new game, as with no save at all
  const { box } = storage(); box[KEY] = '{"le'; box[BACKUP] = '{"sh';
  const G = ST.loadSave(); assert.equal(G.began, false); assert.equal(G.shards, 0);
  // and with neither there at all
  storage(); assert.equal(ST.loadSave().began, false);
});

test('a write the browser refuses: never the progress lost for the copy, and nothing spoiled', () => {
  // the copy refused: the save itself is written, and read
  let s = storage(k => k === BACKUP); ST.loadSave(); ST.G.shards = 77; ST.store();
  assert.equal(JSON.parse(s.box[KEY]).shards, 77); assert.equal(s.box[BACKUP], undefined);
  // too full for the save beside its copy: the copy is let go, and the save goes in
  s = storage(k => k === KEY && Object.keys(s.box).length >= 2);
  s.box[KEY] = JSON.stringify(old124); s.box[BACKUP] = JSON.stringify(old124); ST.loadSave(); ST.G.shards = 88; ST.store();
  assert.equal(JSON.parse(s.box[KEY]).shards, 88, 'the progress is kept'); assert.equal(s.box[BACKUP], undefined, 'its copy went to make room');
  ST.store(); assert.equal(s.box[BACKUP], s.box[KEY], 'and the next write makes the copy again, where there is room for it');
  // refused even then: both stay as they were, the last good save in each
  s = storage(k => k === KEY); s.box[KEY] = JSON.stringify(old124); s.box[BACKUP] = JSON.stringify(old124);
  ST.loadSave(); ST.G.shards = 99; ST.store();
  assert.deepEqual(JSON.parse(s.box[KEY]), old124); assert.deepEqual(JSON.parse(s.box[BACKUP]), old124);
  // a save that cannot be turned into text is not written at all
  s = storage(); s.box[KEY] = JSON.stringify(old124); ST.loadSave(); ST.G.loop = ST.G; ST.store(); delete ST.G.loop;
  assert.deepEqual(JSON.parse(s.box[KEY]), old124); assert.equal(s.box[BACKUP], undefined);
});

test('beginning again clears both copies, or the old save would come back from its copy', () => {
  const { box } = storage(); box[KEY] = JSON.stringify(old124); box[BACKUP] = JSON.stringify(old124);
  ST.loadSave(); ST.wipe(); assert.equal(box[KEY], undefined); assert.equal(box[BACKUP], undefined);
  assert.equal(ST.loadSave().began, false);
});

test('trying a place from the title writes beside the save, and touches neither copy', () => {
  const { box } = storage(); box[KEY] = JSON.stringify(old124); box[BACKUP] = JSON.stringify(old124);
  ST.loadSave(); ST.TRY.on = true; ST.G.shards = 5; ST.store(); ST.TRY.on = false;
  assert.equal(JSON.parse(box[KEY + '-try']).shards, 5); assert.deepEqual(JSON.parse(box[KEY]), old124); assert.deepEqual(JSON.parse(box[BACKUP]), old124);
});

test('watching the keepers from the title writes nothing; his save is written when the watching ends', () => {
  const { box } = storage(); box[KEY] = JSON.stringify({ ...old124, keepers: { 1: 1 } }); const was = box[KEY];
  ST.loadSave(); ST.WATCHING.on = true; ST.G.keepers = {}; ST.G.level = 4; ST.store();
  assert.equal(box[KEY], was, 'shut in the middle: his own save is there'); assert.equal(box[BACKUP], undefined);
  ST.WATCHING.on = false; ST.store(); assert.equal(box[BACKUP], box[KEY], 'and writing goes on after');
  assert.ok(main.includes('VIEW.on = true; WATCHING.on = true; }'), 'main.js watch() holds the writes'); assert.ok(main.includes('function endView(){ VIEW.on = false; WATCHING.on = false;'), 'endView() lets them go, before it writes his save back');
});

test('a write still waiting when the page is put away is made then (not while watching a place from the title)', () => {
  assert.ok(main.includes("const flush = () => { if (DIRTY > 0 && !VIEW.on){ DIRTY = 0; store(); } };"));
  assert.ok(main.includes("addEventListener('pagehide', flush); document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });"));
});

test.after(() => { storage(); ST.fresh(); });
