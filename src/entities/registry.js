// Every hazard and enemy type registers here. A type provides:
//   build(o, ctx)    create its meshes into ctx.dyn
//   update(o, dt)    gameplay step while the warrior climbs (o.s is its path distance; ST.G is the warrior)
//   draw(o, dt)      per-frame visual update
//   hud(o, d, api)   optional 2D overlays, given distance d ahead of the warrior and {drawIcon, drawTiming}
//   hint             the first-sight hint, shown the first time a player meets it
//   hittable(o), hit(o, dmg), inReach(o, reach)   if A can strike it
// Add a threat by writing a module, listing it here and adding it to src/entities/catalog.js.
import * as gap from './hazards/gap.js';
import * as beam from './hazards/beam.js';
import * as rockfall from './hazards/rockfall.js';
import * as swing from './hazards/swing.js';
import * as crawler from './enemies/crawler.js';
import * as spitter from './enemies/spitter.js';
import * as burrower from './enemies/burrower.js';
import * as flitter from './enemies/flitter.js';

export const ENTITIES = { gap, beam, rockfall, swing, crawler, spitter, burrower, flitter };
