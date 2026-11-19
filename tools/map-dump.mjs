import { writeFileSync } from 'node:fs';
const R = await import('../tests/helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const out = [];
for (let n = 0; n < LV.LEVELS.length; n++){ const L = { ...R.loadLevel(n) };
  out.push({ n, name: LV.LEVELS[n].name, theme: LV.LEVELS[n].theme, deep: !!(LV.REGION_DATA[n] && LV.REGION_DATA[n].deep), W: L.W, H: L.H, X0: L.X0, Y0: L.Y0, joins: L.joins, tiles: Array.from(L.tiles),
    rooms: L.rooms.map(r => ({ name: r.name, title: r.title || '', tx0: r.tx0, ty0: r.ty0, tx1: r.tx1, ty1: r.ty1, wing: !!r.wing, gate: r.gate || '', after: !!r.after, ghost: !!r.ghost, look: r.look || '', nook: r.nook || '' })),
    marks: L.marks.filter(m => ['boss', 'spawn', 'shrine', 'pool', 'chest', 'npc', 'exit', 'pass', 'thread'].includes(m.type) || LV.REGION_DATA[n].enemies && LV.REGION_DATA[n].enemies[m.type] && LV.REGION_DATA[n].enemies[m.type].name).map(m => ({ type: m.type, x: m.x, y: m.y, holds: m.holds || '', who: m.who || m.name || '' })) }); }
writeFileSync(process.argv[2], JSON.stringify(out)); console.log(out.map(o => `${o.n} ${o.name} ${o.W}x${o.H} X0 ${o.X0} Y0 ${o.Y0} deep ${o.deep} ${JSON.stringify(o.joins)}`).join('\n'));
