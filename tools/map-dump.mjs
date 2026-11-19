// Everything the whole-mountain map shows, as the game has it: every region's tiles, rooms and joins, and every mark
// that is someone or something (people, keepers, relics, threads, water, ways, creatures, mechanisms), with its name.
//   node tools/map-dump.mjs out.json
import { writeFileSync } from 'node:fs';
const R = await import('../tests/helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const { RELICS } = await import('../src/side/state.js');
const { ANNALS } = await import('../src/side/annals.js');
const { PEOPLE, SCRIPT } = await import('../src/side/talk.js');
const NAMES = {}; for (const a of ANNALS) for (const c of a.creatures) NAMES[c.type] = { name: c.name, line: c.line };
const THING = { glamp: 'Guild lamp', wheel: 'Sluice wheel', lever: 'Lever', brazier: 'Brazier', setting: 'Setting', bloom: 'Bloom (throws him high)', updraft: 'Rising air', mover: 'Moving platform', hours: 'Floor of hours', bell: 'Bell', rod: 'Lightning rod', gust: 'The Wyrm\'s wind (bears down)', flow: 'Running water', coil: 'Coil', crane: 'Wright\'s-arm', clapper: 'Bell tongue', hiscairn: 'His own cairn', sitter: 'Sitter', server: 'Server', pilgrim: 'Pilgrim', sweeper: 'The Sweeper' };
const ELITE = new Set(['sexton', 'corrector', 'turned', 'seated']);   // the wings' own keepers that have no bar of their own
const SKIP = new Set(['torch', 'crystal', 'keep', 'deco', 'runnel', 'urn']);
const out = [];
for (let n = 0; n < LV.LEVELS.length; n++){ const L = { ...R.loadLevel(n) }, RD = LV.REGION_DATA[n], EN = RD.enemies || {}, keeper = ANNALS[n] && ANNALS[n].keeper;
  const marks = [];
  for (const m of L.marks){ if (SKIP.has(m.type)) continue; const o = { type: m.type, x: m.x, y: m.y };
    if (m.type === 'npc'){ o.kind = 'person'; o.name = (PEOPLE[m.who] || {}).name || m.who; o.who = m.who; o.sub = ((SCRIPT[m.who] || [])[n] || [])[0] || ''; }
    else if (m.type === 'boss'){ o.kind = 'keeper'; o.name = keeper ? keeper.name : 'Keeper'; o.sub = keeper ? keeper.line : ''; }
    else if (m.type === 'shrine' || m.type === 'pool'){ o.kind = 'water'; o.name = m.type === 'pool' ? 'Raising water' : 'A leak (rest)'; }
    else if (m.type === 'chest' && /^relic:/.test(m.holds || '')){ const id = m.holds.slice(6), r = RELICS[id] || {}; o.kind = 'relic'; o.name = r.name || id; o.sub = r.line || ''; o.rid = id; }
    else if ((m.type === 'chest' && m.holds === 'thread') || m.type === 'thread'){ o.kind = 'thread'; o.name = 'A thread'; }
    else if (m.type === 'chest'){ o.kind = 'shards'; o.name = 'Chest of shards'; }
    else if (m.type === 'spawn'){ o.kind = 'way'; o.name = 'Where he comes in'; }
    else if (m.type === 'exit'){ o.kind = 'way'; o.name = 'The way on, past the keeper'; }
    else if (m.type === 'pass'){ o.kind = 'way'; o.name = 'Passage to ' + LV.LEVELS[m.to].name + (m.gate ? ' (behind a gate)' : ''); o.w = m.w || 2; o.h = m.h || 2; }
    else if (m.type === 'arrive') continue;
    else if ((EN[m.type] && EN[m.type].name) || ELITE.has(m.type)){ o.kind = 'elite'; o.name = (EN[m.type] && EN[m.type].name) || (NAMES[m.type] || {}).name || m.type; o.sub = (NAMES[m.type] || {}).line || ''; }
    else if (THING[m.type]){ o.kind = 'thing'; o.name = THING[m.type]; if (m.w) o.w = m.w; if (m.h) o.h = m.h; }
    else { o.kind = 'creature'; o.name = (NAMES[m.type] || {}).name || m.type; o.sub = (NAMES[m.type] || {}).line || ''; }
    marks.push(o); }
  out.push({ n, name: LV.LEVELS[n].name, theme: LV.LEVELS[n].theme, sub: LV.LEVELS[n].sub || '', deep: !!RD.deep, dark: !!RD.dark, W: L.W, H: L.H, X0: L.X0, Y0: L.Y0, joins: L.joins, tiles: Array.from(L.tiles),
    rooms: L.rooms.map(r => ({ name: r.name, title: r.title || '', tx0: r.tx0, ty0: r.ty0, tx1: r.tx1, ty1: r.ty1, wing: !!r.wing, gate: r.gate || '', after: !!r.after, ghost: !!r.ghost, look: r.look || '', nook: r.nook || '' })), marks }); }
writeFileSync(process.argv[2], JSON.stringify(out)); console.log(out.map(o => `${o.n} ${o.name} ${o.W}x${o.H} rooms ${o.rooms.length} marks ${o.marks.length}`).join('\n'));
