// Every hazard and enemy type registers here. A type provides:
//   build(o, ctx)   create its meshes into ctx.dyn
//   update(o, dt)   gameplay step while the warrior climbs (o.s is its path distance; ST.G is the warrior)
//   draw(o)         per-frame visual update
//   hud(o, d, api)  optional 2D overlays, given distance d ahead of the warrior and {drawIcon, drawTiming}
// Add a new threat by writing a module like crawler.js and listing it here.
import * as gap from './hazards/gap.js';
import * as beam from './hazards/beam.js';
import * as crawler from './enemies/crawler.js';
import * as spitter from './enemies/spitter.js';

export const ENTITIES = { gap, beam, crawler, spitter };
