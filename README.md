# The Climb

A portrait mobile roguelike in chunky 3D. You fight your way up a spiral stair from the bottom of an impossibly deep mine to open sky at the peak, and every death drops you all the way back down. **Height is the score.**

Play it: serve the repository root and open `index.html` (there is no build step).

```bash
npm run dev        # http://localhost:8080, also reachable from a phone on the same network
```

Controls: `▲` jump / use, `▼` duck, `A` attack, `B` block (tap just before a hit lands to parry), flask to heal. Keyboard: W/↑/Space, S/↓, J or Z, K or X, F or Q.

## Repository layout

```
index.html            the page shell: canvases, the four-button pad, the menu overlay
src/
  main.js             boot and the main loop (step, visuals, render, HUD)
  config/             geometry (constants), every feel number (tuning), weapons, economy
  zones/              one module per zone: palette, threat pool, Warden; plus the tutorial table
  core/               math, shared runtime state, input
  save/               the save store and versioned migrations (prototype saves carry over)
  audio/              synthesised placeholder sounds (real samples go in assets/audio)
  render/             renderer, camera, generated textures, primitives, particles
  world/              the spiral path, the shaft, the instanced stair, pure seeded layout, meshes
  entities/
    player/           the warrior: model, run state and actions, animation
    hazards/          broken step, fallen beam
    enemies/          crawler, spitter
    registry.js       where new threats are registered
  wardens/            the Warden fight, its model and visuals, one moveset per Warden
  modes/              title, climb, boss, fall, pool, through a registry (minecart, arena, pursuit go here)
  ui/                 the overlay, one screen per file (title, Pool, rest stop, victory), the 2D HUD, styles
  fx/                 freeze-frames, shake, flashes, toasts, floating text
vendor/three/         three.js r128, vendored so the game runs offline
assets/               textures (per zone), models (warrior, enemies, wardens, props), audio (sfx, music, ambience), fonts, ui
docs/
  design/             direction, zones (one note each), wardens, enemies, economy, controls, story
  architecture.md     how the systems fit and how to add a zone, threat, Warden or mode
  tuning.md           every feel number explained
  process/            conventions, phone playtest checklist, release checklist
  decisions/          short records of choices that shape the project
prototypes/           earlier single-file builds kept for reference
tools/                dev server, headless smoke playthrough, pacing calculator
tests/                node --test suites for the pure modules (path, layout, economy, save)
.github/              CI workflow, issue templates (bug, playtest notes, feature), PR template
```

See `docs/architecture.md` for how the systems fit together and how to add a zone, enemy, Warden or mode, and `CONTRIBUTING.md` for the working rules.

## Checks

```bash
npm test           # node --test: path geometry, seeded layout, economy, save migrations
npm run smoke      # Playwright: a bot migrates a prototype save, climbs the tutorial, beats the first Warden, falls, catches a root, splashes into the Pool
npm run pacing     # how long each zone takes at the current tuning, against the 30-minute target
```

The smoke test needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`). It writes screenshots to `tools/out/`.

## Design

The full direction lives in `docs/design/direction.md`: pillars, core loop, zones, Wardens, economy, the idea ledger and the roadmap. Short version: seven zones stacked in one round shaft, a Warden at the top of each, lifts you repair and Wardens you beat stay beaten, falling is a fight for roots, and the Pool at the bottom never lets you die.
