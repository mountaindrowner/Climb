# Changelog

## 0.8.0 — the golem (2026-11-05)

- The Warden is a golem of broken stone. New rock kit (`src/render/rocks.js`): displaced low-poly boulders with flat shading and per-face brightness, seeded so every Warden's rocks fall differently. Every body part is a cluster of boulders: layered plates down the back, knuckle clusters for fists, a brow slab and jutting jaw, lichen, crystal shards along the spine and crown, glowing cracks between the rocks, and eyes that are hot crystals set in near-black sockets under the brow. The arm and head that come through the wall are built from the same kit; breach rubble too.
- Camera pulled out again (climb back −2.3 → −3.4, fight −3.6 → −4.6), slightly wider field of view, stage up to 600 px wide.
- Studio shots in `tools/portrait.mjs`: the Warden on its own for two zones, plus the arm and head props.

## 0.7.0 — the running Warden fight (2026-11-05)

- The Warden fight is no longer a stop on a platform. The Warden hunts from behind the wall over the last five flights of its zone while you keep climbing, breaking through to swipe (duck), slam (jump the shockwave rolling down the steps) and spit (block or parry). The stuck arm or head in the breach is the opening; you hit it as you pass.
- Reach the top of its stretch with it alive and it tears the stair out from under you. Kill it and it collapses behind the wall with no menu; the lift and the open stair follow.
- Breaches stay as scars on the wall. The silhouette behind the wall is hidden while the real body looms there.
- Landmarks per zone: lift on flight 5, rest stop on flight 8, the Warden's stretch over flights 10 to 14. The arena platforms are gone.
- Fight camera: the climb camera pulls out and up so the wall and the breach are in frame.
- Smoke bot and portrait tool updated for the new fight; layout and path tests cover the stretch.

## 0.6.0 — character pass (2026-11-05)

- The warrior is a jointed human rig: hips, knees, shoulders, elbows, neck, about 7.5 heads tall with long limbs, a beard, nose-guard helmet, three-segment cape, shield on the forearm, weapon in the hand. The climb is a real step cycle (high knee, plant on the thud, push-off, counter-swinging arms, a lean into the stair), with an overhead chop, a raised-shield block, a crouch and a flailing fall.
- The Warden is a hunched stone giant on bent legs with long arms down to its knuckles, a forward-thrust head under a heavy brow, plates down a bent spine with the core burning in the chest gap, crystal shards along its back, and its own eye light. Poses for slam, sweep, spit and the kneel are rebuilt on the new joints.
- Standard materials with modest metalness on mail and steel; a rim light in the zone's glow behind the warrior; the Warden lights its own face.
- The fight camera sits further back. The beam hazard is raised to the taller warrior's head height.
- `tools/portrait.mjs` writes close-up review shots of both characters in their key poses.

## 0.5.0 — structure for a big game (2026-11-05)

- One module per zone in `src/zones/` (palette, threat pool, Warden), plus the tutorial table; `config/zones.js` re-exports.
- Pure seeded flight layout in `src/world/layout.js`, separated from mesh building and covered by tests.
- Modes registry (`src/modes/registry.js`); title and pool are modes like the rest.
- Overlay split into `src/ui/overlay.js` and one screen per file under `src/ui/screens/`.
- Versioned save in `src/save/` with migrations; saves from the v3 prototype and 0.4.0 carry over.
- `tools/pacing.mjs` pacing calculator; `npm run pacing`.
- Tests for layout determinism, economy and migrations (19 total); the smoke test also checks save migration.
- Docs: per-topic design docs, one note per zone, process (conventions, playtest, release), decision records, issue and PR templates, CONTRIBUTING.
- Asset folders laid out per zone and per model family.

## 0.4.0 — repository structure (2026-11-04)

- Split the single-file spiral prototype into ES modules under `src/` (no build step; three.js is vendored).
- Shallower ramp: step rise 0.75 → 0.55 world units. In-game metres per zone stay at 135 (MPU is now derived).
- Camera pulled out on the climb (`TUNE.camera.climb.back` −0.9 → −2.3, slightly higher) to show more of the shaft.
- Legs now alternate per step, with the lead foot lifting onto the next step, so every step reads.
- Zone 6 placeholder name "The Endless Stair" replaced with "The Long Stair" pending a final name.
- Wardens read their attack set from a moveset module (`src/wardens/movesets/`), ready for a unique Warden per zone.
- Enemies and hazards register in `src/entities/registry.js` with build / update / draw / hud hooks.
- Added: dev server, headless smoke playthrough, path unit tests, CI workflow, design docs.

## 0.3.0 — gritty pass (prototype v3)

Warrior 1.5× larger with a closer camera, detailed models, cracked stone textures, fog, grain, crawler duels, hazard icons, Warden danger markers, freeze-frames on hits.

## 0.2.0 — spiral

Rebuilt in 3D: a spiral stair, a camera that circles with the warrior, background layers, roots to catch during the fall.

## 0.1.0 — first try

Flat 2D portrait stair that zigzagged up a shaft, with the same core systems.
