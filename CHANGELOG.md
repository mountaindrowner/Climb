# Changelog

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
