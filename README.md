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
  config/             the numbers: shaft geometry, zones, weapons, economy, every feel value (tuning.js)
  core/               math, save data, shared runtime state, input
  audio/              synthesised placeholder sounds (real samples go in assets/audio)
  render/             renderer, camera, generated textures, primitives, particles
  world/              the spiral path, the shaft, the instanced stair, per-flight generation, props
  entities/
    player/           the warrior: model, run state and actions, animation
    hazards/          broken step, fallen beam
    enemies/          crawler, spitter
    registry.js       where new threats are registered
  wardens/            the Warden fight, its model, visuals, and per-zone movesets
  modes/              climb (the auto-climb backbone) and fall (root grabs)
  ui/                 menus (title, Pool, rest stop) and the 2D HUD, styles.css
  fx/                 freeze-frames, shake, flashes, toasts, floating text
vendor/three/         three.js r128, vendored so the game runs offline
assets/               art, audio, models and fonts (empty folders ready for real assets)
docs/                 design direction, architecture, tuning reference
prototypes/           earlier single-file builds kept for reference
tools/                dev server and the headless smoke playthrough
tests/                unit tests for the pure path math
```

See `docs/architecture.md` for how the systems fit together and how to add a zone, enemy or Warden.

## Checks

```bash
npm test           # node --test: path geometry and zone invariants
npm run smoke      # Playwright: a bot climbs the tutorial, beats the first Warden, falls, catches a root, splashes into the Pool
```

The smoke test needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`). It writes screenshots to `tools/out/`.

## Design

The full direction lives in `docs/design/direction.md`: pillars, core loop, zones, Wardens, economy, the idea ledger and the roadmap. Short version: seven zones stacked in one round shaft, a Warden at the top of each, lifts you repair and Wardens you beat stay beaten, falling is a fight for roots, and the Pool at the bottom never lets you die.
