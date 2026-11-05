# Architecture

One web page, ES modules, no build step. three.js r128 is vendored and exposed as `window.THREE`; every module that draws reads it from there.

## The frame

`src/main.js` runs one `requestAnimationFrame` loop:

1. **step(dt)** — feedback timers, player timers, then the active mode: `climb`, `boss`, `fall`, `pool` or `title`. A freeze-frame (`ST.hitstop`) scales `dt` down to 6% for a few frames.
2. **visuals(dt)** — warrior pose, grit, camera, shaft tint and dust, arena visibility, props and entity draws, the Warden pose, particles.
3. **render** the 3D scene at low resolution, then **drawHUD** on the sharp 2D canvas.

## Shared state

Two objects are imported everywhere instead of passed around:

- `ST` (`src/core/state.js`) — runtime state. `ST.mode` is the state machine. `ST.G` is the current climb (health, flask, gold, timers, path distance `s`). `ST.B` is the active Warden. `ST.FALL` is the active fall. Camera and feedback values live here too.
- `S` (`src/core/save.js`) — what persists on the device: best height, falls, repaired lifts, beaten Wardens, gold, stashed gold, weapon.

The path distance `s` (in step units) is the one coordinate. `src/world/path.js` turns it into a world position, a flight, a step and a height. Everything on the stair is placed by `s`.

## Where things live

| Concern | Module |
| --- | --- |
| Shaft geometry (steps, rise, radius) | `config/constants.js` |
| Every timing and feel number | `config/tuning.js` |
| Zones, their colours and Warden moveset | `config/zones.js` |
| Weapons, gold values, rest stop prices | `config/weapons.js`, `config/economy.js` |
| Procedural content per flight | `world/generate.js` (seeded per climb; the first five flights are the tutorial) |
| The instanced stair, arenas, the gate darkness | `world/stair.js`, `world/shaft.js` |
| Hazards and enemies | `entities/hazards/*`, `entities/enemies/*`, registered in `entities/registry.js` |
| The warrior | `entities/player/` (model, actions, animation) |
| Warden fight | `wardens/warden.js` (state machine), `wardens/visuals.js`, `wardens/movesets/*` |
| Falling and root grabs | `modes/fall.js` |
| Auto-climb, landmarks, the heavy step | `modes/climb.js` |
| Menus and HUD | `ui/menus.js`, `ui/hud.js` |

## Adding things

**A new enemy or hazard.** Create `src/entities/enemies/<name>.js` exporting `build(o, ctx)`, `update(o, dt)`, `draw(o)` and optionally `hud(o, d, api)`, `hittable(o)` and `hit(o, dmg)`. Register it in `entities/registry.js`, then add its type to the zone pools in `world/generate.js`. The object `o` carries `s` (path distance), `st` (its state), `tm` (time in state), `hp`, `alive`, `done`.

**A unique Warden.** Write `src/wardens/movesets/<zone>.js` exporting `attacks` (each with `answer` of `jump`, `duck` or `block`, a `prompt`, `damage` and `hitText`) and `pick()`. Point `ZONES[z].warden` at it. New attack shapes that need new animation go in `wardens/visuals.js`.

**A zone's own spawn.** The spawn is just an enemy whose `build` and `draw` make it come out of the zone's feature (water, a casting mold, a spore pod). Zone colours come from `ZONES[z]`.

**A new mode** (minecart rails, arena holds, pursuit). Add `src/modes/<mode>.js` with an `update(dt)`, a new `ST.mode` value, and a branch in `main.js`'s `step`. The camera gets a case in `render/camera.js`.

## Testing

- `tests/` are plain `node --test` files for pure modules (path math, config invariants). They must not import anything that touches `window` or `THREE`.
- `tools/smoke.mjs` plays the game in headless Chromium with a bot that reads the same tells the player sees. It is the regression test for the whole loop. `window.__climb` exposes `ST`, `S`, `TUNE`, `press` and `hurt` for it and for the console.
