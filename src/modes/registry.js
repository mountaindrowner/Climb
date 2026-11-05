// Game modes, keyed by ST.mode. Each exports update(dt). `gameplay` marks modes where the warrior's timers run.
// `menu` has no update: an overlay owns the screen. Add minecart rails, arena holds or pursuit here.
import * as climb from './climb.js';
import * as fall from './fall.js';
import * as pool from './pool.js';
import * as title from './title.js';

export const MODES = {
  title: { update: title.update },
  menu:  { update: () => {} },
  climb: { update: climb.updClimb, gameplay: true },
  fall:  { update: fall.updFall },
  pool:  { update: pool.update },
};
