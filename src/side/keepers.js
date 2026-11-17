// Each region's keeper, by the region's theme. main.js makes the one for the region in play.
import { makeWarden } from './boss.js';
import { makeToll } from './toll.js';
import { makeWyrm } from './wyrm.js';
import { makeThunderhead } from './thunderhead.js';
import { makeMother } from './mother.js';
import { makeFallen } from './fallen.js';
import { withThrows } from './throws.js';
// each with what it throws laid over it (throws.js)
const thrown = make => (scene, R) => withThrows(make(scene, R), scene);
export const KEEPERS = { roots: thrown(makeWarden), cloister: thrown(makeToll), spires: thrown(makeWyrm), tempest: thrown(makeThunderhead), gardens: thrown(makeMother), firmament: thrown(makeFallen) };
