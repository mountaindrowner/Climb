// Nothing stands where it should not (build 79, from a playtest: a creature half in a wall, pedestals in spike pits, a
// plank through where Mirel stands). In every level: no creature's body begins in rock; no gargoyle's plinth or
// corbel is in spikes, and none sits with its body in rock; and where a person stands there is no plank within
// three tiles and no rock or spikes through them.
// (enemies.js needs the renderer, so the creatures' sizes are read from the source as written.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadLevel, LEVELS } from '../src/side/level.js';

const dir = new URL('../src/side/', import.meta.url);
const src = [readFileSync(new URL('enemies.js', dir), 'utf8'), ...readdirSync(new URL('regions/', dir)).map(f => readFileSync(new URL('regions/' + f, dir), 'utf8'))].join('\n');
const DEF = {};
for (const m of src.matchAll(/^\s*(\w+):\s*\{[^\n]*?\bw:\s*([\d.]+|[A-Z_.a-z]+)[^\n]*?\bh:\s*([\d.]+)[^\n]*$/gm)){ const line = m[0];
  DEF[m[1]] = { w: parseFloat(m[2]) || 0.6, h: parseFloat(m[3]), fly: /fly:\s*true/.test(line), own: /own:\s*true/.test(line), cling: /cling:/.test(line), perch: /perch:/.test(line), prop: /prop:\s*true/.test(line) }; }
const T = 0.5, ROCK = 1, PLANK = 2, SPIKES = 3;

test('the creatures\' sizes can be read', () => { for (const k of ['crawler', 'flitter', 'gargoyle', 'wisp', 'acolyte', 'moth', 'sunk']) assert.ok(DEF[k] && DEF[k].h > 0, k); assert.ok(DEF.gargoyle.perch && DEF.flitter.fly); });

for (let N = 0; N < LEVELS.length; N++) test(`${LEVELS[N].name}: nothing stands in rock, in spikes, or with a plank through it`, () => {
  const L = { ...loadLevel(N) }, at = (i, j) => i < 0 || j < 0 || i >= L.W || j >= L.H ? ROCK : L.tiles[j * L.W + i], out = [];
  const where = (x, y) => { const r = L.rooms.find(r => x >= r.tx0 && x < r.tx1 && y >= r.ty0 && y < r.ty1); return r ? `${r.name} ${x - r.tx0},${y - r.ty0}` : `${x},${y}`; };
  const inRock = (x, y0, y1, w) => { let hit = 0, n = 0; for (let yy = y0 + 0.1; yy < y1 - 0.05; yy += 0.25) for (let xx = x - w + 0.05; xx <= x + w - 0.05; xx += 0.25){ n++; if (at(Math.floor(xx / T), Math.floor(yy / T)) === ROCK) hit++; } return hit / Math.max(1, n); };
  for (const m of L.marks){ const d = DEF[m.type];
    // where enemies.js puts it: on its mark; a flyer 1.6 over it; a percher on its perch
    if (d && !d.own && !d.cling && !d.prop && !d.perch){ const y = d.fly ? m.y * T + 1.6 - d.h / 2 : m.y * T; if (inRock((m.x + 0.5) * T, y, y + d.h, Math.min(d.w, 0.9)) > 0.12) out.push(`a ${m.type} at ${where(m.x, m.y)} begins with its body in rock`); }
    if (d && d.perch && m.perch){ const p = m.perch, yc = p.y * T + d.h * 0.7; if (inRock((p.x + 0.5) * T, yc - d.h / 2, yc + d.h / 2, Math.min(d.w, 0.9)) > 0.15) out.push(`a ${m.type} on its perch at ${where(p.x, p.y)} has its body in rock`);
      if (p.side === 0){ for (let j = p.base; j <= p.y; j++) for (const a of [-1, 0, 1]) if (at(p.x + a, j) === SPIKES) out.push(`a ${m.type}'s plinth at ${where(p.x, p.base)} stands in spikes`); }
      else for (const a of [0, -p.side]) for (let j = p.y - 2; j <= p.y; j++) if (at(p.x + a, j) === SPIKES) out.push(`a ${m.type}'s corbel at ${where(p.x, p.y)} is in spikes`); }
    if (m.type === 'npc') for (let j = m.y; j <= m.y + 5; j++) for (let i = m.x - 3; i <= m.x + 3; i++){ const t = at(i, j);
      if (t === PLANK) out.push(`${m.who} at ${where(m.x, m.y)} has a plank within three tiles of where they stand`); else if (t === SPIKES) out.push(`${m.who} at ${where(m.x, m.y)} stands by spikes`); else if (t === ROCK && i === m.x && j <= m.y + 4) out.push(`${m.who} at ${where(m.x, m.y)} has rock through them`); }
  }
  assert.deepEqual([...new Set(out)], []);
});
