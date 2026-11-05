// Pacing calculator: how long each zone and the whole climb take at the current tuning, with no falls.
// Pure: reads config only. Usage: node tools/pacing.mjs [--flights-per-zone N] [--speed S]
import { FL, ZF, FH, ZONE_METERS } from '../src/config/constants.js';
import { TUNE } from '../src/config/tuning.js';
import { ZONES } from '../src/zones/index.js';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? +process.argv[i + 1] : def; };
const flights = arg('flights-per-zone', ZF), base = arg('speed', TUNE.climb.baseSpeed);
const W = TUNE.warden;
// a rough Warden fight: hp / damage-per-opening attacks, each a wind-up + strike + kneel, plus the intro and death
const wardenSeconds = z => { const turns = Math.ceil(W.hp(z) / 2); return W.intro + turns * (W.windup1(z) + W.strike + W.kneel1 + 0.75) + W.dying; };
let total = 0;
console.log(`flights per zone ${flights} · base speed ${base} steps/s · ${ZONE_METERS} m per zone (${(flights * FH).toFixed(1)} units)`);
console.log('zone                       climb   warden   total');
ZONES.forEach((z, i) => {
  const spd = base + TUNE.climb.speedPerZone * i, climb = flights * FL / spd, boss = wardenSeconds(i), t = climb + boss;
  total += t;
  console.log(`${(i + 1 + ' ' + z.name).padEnd(26)} ${fmt(climb)}  ${fmt(boss)}  ${fmt(t)}`);
});
console.log(`whole climb, no falls:     ${fmt(total)}   (target ~30:00; rest stops and duels add to this)`);
function fmt(s){ return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`.padStart(5); }
