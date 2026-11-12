// Each region's keeper, by the region's theme. main.js makes the one for the region in play.
import { makeWarden } from './boss.js';
import { makeToll } from './toll.js';
import { makeWyrm } from './wyrm.js';
import { makeThunderhead } from './thunderhead.js';
import { makeMother } from './mother.js';
import { makeFallen } from './fallen.js';
export const KEEPERS = { roots: makeWarden, cloister: makeToll, spires: makeWyrm, tempest: makeThunderhead, gardens: makeMother, firmament: makeFallen };
