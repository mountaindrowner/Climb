// The walk test (build 81). Asked for in the second playtest: "let's be careful with little corners... where if you're
// walking there's a little lip that unintentionally gets you stuck. Maybe we have to make a walk test." A low spot is
// floor he can walk onto from where he stands, where he fits only crouched or rolling (helpers/walk.mjs). Each level is
// held to the low spots it had when this was written: the crawls and cells that are meant, and some that each
// region's map pass has still to look at. A new one fails here, with its room and tiles, so the rock-smoothing (or a
// room rebuilt) cannot leave a lip over a path without someone deciding it should be there.
// When a region's pass removes one, take it off its list; when one is meant, leave it on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const { LEVELS } = await import('./helpers/reach.mjs'); const { lowSpots } = await import('./helpers/walk.mjs');
// room, tiles from-to, row (in the room's own tiles, as the place readout shows them: Options, Place)
const KNOWN = {
  "The Roots": ["tunnel 19-21,14", "tunnel 28-30,14", "chamber 38-41,2", "gallery 38-41,2", "chamber 30-32,16", "ascent 38-41,16", "well 34-36,39"],
  "The Cloister": ["nave 2-4,2", "nave 8-10,2", "molds 5-7,2", "molds 13-15,2", "molds 21-23,2", "molds 29-29,2", "cells 9-13,2", "cells 19-23,2", "cells 29-33,2"],
  "The Spires": ["road 38-41,2", "deepice 28-30,30", "deepice 32-32,30", "icecave 47-49,2", "icecave 53-55,2"],
  "The Tempest": ["leeslope 29-31,27", "hut 38-41,27", "coils 12-14,2", "coils 18-20,2", "yard 6-8,2", "yard 11-13,2", "yard 9-11,6", "? 210-212,254"],   /* (the last is in no room, so it is named by the level's own rows: 208 before every level was lifted, build 115) */
  "The Gardens": ["breach 38-41,17"],
  "The Firmament": ["flights 37-37,40", "threshold 21-23,2", "threshold 26-28,2", "orrery 8-11,1", "orrery 20-23,1", "meridian 44-47,3", "lens 8-12,2", "zenith 20-22,2", "zenith 24-26,2", "zenith 53-55,2", "zenith 57-59,2"],
  "The Workings": [],
  "The Vein": [],
  "The Flooded Levels": [],
  "The Great Shaft": [],
  "The Hollow": [],
};
for (let N = 0; N < LEVELS.length; N++) test(`${LEVELS[N].name}: no new place where he must duck under a lip to walk on`, () => {
  const now = lowSpots(N), known = new Set(KNOWN[LEVELS[N].name] || []);
  const fresh = now.filter(s => !known.has(s));
  assert.deepEqual(fresh, [], `new low spots (room, tiles, row): ${fresh.join('; ')}. Open the rock over them, or add them to KNOWN if they are meant`);
});
