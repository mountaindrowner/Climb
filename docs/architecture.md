# Architecture

One web page, ES modules, no build step. three.js r128 is vendored and exposed as `window.THREE`; every module that draws reads it from there.

## The frame

`src/main.js` runs one `requestAnimationFrame` loop:

1. **step(dt)** — feedback timers, player timers, then the active mode's `update` from `src/modes/registry.js` (`title`, `menu`, `climb`, `fall`, `pool`). The Warden fight is not a mode: it runs inside `climb` while the warrior is on the Warden's stretch. A freeze-frame (`ST.hitstop`) scales `dt` down to 6% for a few frames.
2. **visuals(dt)** — warrior pose, grit, camera, shaft tint and dust, arena visibility, props and entity draws, the Warden pose, particles.
3. **render** the 3D scene at low resolution, then **drawHUD** on the sharp 2D canvas.

## Shared state

Two objects are imported everywhere instead of passed around:

- `ST` (`src/core/state.js`) — runtime state. `ST.mode` is the state machine. `ST.G` is the current climb (health, flask, gold, timers, path distance `s`). `ST.B` is the active Warden. `ST.FALL` is the active fall. Camera and feedback values live here too.
- `S` (`src/save/store.js`) — what persists on the device: best height, falls, repaired lifts, beaten Wardens, gold, stashed gold, weapon. Saves carry a version; `src/save/migrations.js` upgrades older shapes, including the prototypes' keys.

The path distance `s` (in step units) is the one coordinate. `src/world/path.js` turns it into a world position, a flight, a step and a height. Everything on the stair is placed by `s`.

## Where things live

| Concern | Module |
| --- | --- |
| Shaft geometry (steps, rise, radius) | `config/constants.js` |
| Every timing and feel number | `config/tuning.js` |
| Zones: palette, threat pool, Warden moveset | `zones/<zone>.js`, listed in `zones/index.js`; the tutorial in `zones/tutorial.js` |
| Weapons, gold values, rest stop prices | `config/weapons.js`, `config/economy.js` |
| Procedural content per flight | `world/layout.js` (pure, seeded, tested) laid out on demand by `world/generate.js`, which also builds the meshes |
| The instanced stair, arenas, the gate darkness | `world/stair.js`, `world/shaft.js` |
| Hazards and enemies | `entities/hazards/*`, `entities/enemies/*`, registered in `entities/registry.js`, described in `entities/catalog.js` (pure data for the Practice screen, the layout's spacing and the tests) |
| Creature parts | `render/creature.js`: flat-shaded limb segments, spikes, blobs, wing membranes, glowing outlines |
| The warrior's movement and actions | `entities/player/motor.js` (physics, jump, roll, block, combos), `entities/player/animate.js` (pose), `core/input.js` (held and pressed), `world/ground.js` (holes and low ceilings the motor asks about) |
| Feature switches | `config/features.js` (the Wardens are parked; `?wardens=1` or `#wardens` turns them on) |
| Practice runs | `ui/screens/practice.js`; `ST.practice` makes the layout place only that threat and stops anything being saved |
| Craggy rocks (the Wardens, rubble) | `render/rocks.js`: displaced low-poly boulders with flat shading and per-face brightness, seeded; `shard()` for crystals |
| The warrior | `entities/player/` (model, actions, animation) |
| Warden fight | `wardens/warden.js` (state machine, driven from `modes/climb.js` while `arenaOf(k)` is the zone's Warden), `wardens/visuals.js` (body behind the wall, breaches, arm, head, markers), `wardens/model.js` (the golem rig and the arm and head props, built from the rock kit with the zone's palette), `wardens/movesets/*` |
| Falling and root grabs | `modes/fall.js` |
| Auto-climb, landmarks, the heavy step | `modes/climb.js` |
| Menus and HUD | `ui/overlay.js` plus one screen per file in `ui/screens/`; `ui/hud.js` |

## Adding things

**A new enemy or hazard.** Create `src/entities/enemies/<name>.js` exporting `build(o, ctx)`, `update(o, dt)`, `draw(o, dt)`, a `hint` string, and optionally `hud(o, d, api)`, `hittable(o)`, `hit(o, dmg)` and `inReach(o, reach)` (for things A reaches that are not on the stair, like a flier). Register it in `entities/registry.js`, describe it in `entities/catalog.js`, add it to zone pools in `src/zones/*.js`, and teach the bot in `tools/smoke.mjs` to answer it. The object `o` carries `s` (path distance), `st` (its state), `tm` (time in state), `hp`, `alive`, `done`. `ST.G.spd` is the warrior's current speed, for threats that time their motion to his arrival.

**A unique Warden.** Write `src/wardens/movesets/<zone>.js` exporting `attacks` (each with `answer` of `jump`, `duck` or `block`, a `prompt`, `damage` and `hitText`) and `pick()`. Point `ZONES[z].warden` at it. A new attack shape (a new thing coming through the wall) needs a prop and a pose in `wardens/visuals.js`.

**A zone's own spawn.** The spawn is just an enemy whose `build` and `draw` make it come out of the zone's feature (water, a casting mold, a spore pod). Add its type to that zone's `threats` in `src/zones/<zone>.js`; the zone's colours are on the same object.

**A new mode** (minecart rails, arena holds, pursuit). Add `src/modes/<mode>.js` with an `update(dt)` and register it in `modes/registry.js` (set `gameplay: true` if the warrior's timers should run). The camera gets a case in `render/camera.js`.

**A new screen.** Add `src/ui/screens/<screen>.js` that renders with `showMenu` and registers its button actions with `registerActions`.

## Testing

- `tests/` are plain `node --test` files for pure modules (path math, seeded layout, economy, save migrations). They must not import anything that touches `window` or `THREE`; `tests/helpers.mjs` reads the entity registry's source to list types without loading it.
- `tools/pacing.mjs` prints the climb time per zone from the current tuning.
- `tools/smoke.mjs` plays the game in headless Chromium with a bot that reads the same tells the player sees. It is the regression test for the whole loop. `window.__climb` exposes `ST`, `S`, `TUNE`, `press` and `hurt` for it and for the console.
