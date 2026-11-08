// Mutable runtime state shared by every system. Modules import ST and read or assign its fields.
// G: the current climb (player). B: the active Warden fight. FALL: the active fall.
export const ST = {
  mode: 'title',      // title | menu | climb | boss | fall | pool
  time: 0,
  slowmo: 1,
  timeScale: 1,       // debug only: tools slow the whole game to catch a pose
  paused: false,      // the pause menu is up (Esc / Start); the world holds still
  hitstop: 0,
  G: null,
  B: null,
  W: null,       // the Warden on the floor at the top of the region (src/boss/golem.js)
  FALL: null,
  poolT: 0,
  practice: null,     // a threat id while a Practice run is on
  lastFall: null,
  // feedback
  shake: 0, dip: 0, flash: 0, punch: 0,
  toast: null, hint: null, floats: [],
  // camera
  cam: { ang: 0, y: 1.5, r: -3.2 },
};
