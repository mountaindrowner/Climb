// The seven zones of the shaft, bottom to top. Order here is the order of the climb.
// Each zone is its own module so its threats, palette, Warden and (later) its own hazards and spawns live together.
import deep from './deep.js';
import flooded from './flooded.js';
import forge from './forge.js';
import fungal from './fungal.js';
import collapsed from './collapsed.js';
import stair from './stair.js';
import peak from './peak.js';

export const ZONES = [deep, flooded, forge, fungal, collapsed, stair, peak];
export const zoneById = id => ZONES.find(z => z.id === id);
