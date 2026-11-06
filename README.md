# The Climb

A roguelike in chunky 3D, landscape and PC first (phones play on their side). You fight your way up a spiral stair from the bottom of an impossibly deep mine to open sky at the peak, and every death drops you all the way back down. **Height is the score.**

**Play it now:** [the hosted build](https://claude.ai/artifact/LXYYXmevA9zBdh1QhMqz9Z) runs on a phone or desktop (private link; share it from the page's menu). It is republished from this repository with `npm run artifact`.

Or serve the repository root and open `index.html` (there is no build step):

```bash
npm run dev        # http://localhost:8080, also reachable from a phone on the same network
```

Controls: a stick on the left moves him along the stair (right climbs) and crouches; on the right, `▲` jump, `A` attack (press again to combo), `B` hold to block (raise it as a hit lands to parry), `⟳` roll. Keyboard: A/D or arrows, Space jump, S crouch, J attack, K block, L roll, F flask. See `docs/design/controls.md`.

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
    hazards/          broken step, fallen beam, rockfall, swinging weight
    enemies/          crawler, spitter, burrower, flitter
    catalog.js        what each threat is, its tell and its answer
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
npm run smoke      # Playwright: a bot migrates a prototype save, climbs into the second zone, falls and catches a root, then plays a Practice run of every threat
npm run pacing     # how long each zone takes at the current tuning, against the 30-minute target
npm run portraits  # close-up shots of the warrior and the Warden in their key poses, for art review
npm run artifact   # builds dist/artifact.html, the hosted-page version of index.html (published with src/ and vendor/)
```

The smoke test needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`). It writes screenshots to `tools/out/`.

## Design

The current concept lives in `docs/design/concept.md`, the world in `docs/design/lore.md`, and the earlier full direction in `docs/design/direction.md`. Short version: you climb a mountain by hand from the oldest caves to open sky, region by region (the Deep, the Mid Caverns, the Dwarf Mines, the Dwarf Empire and Throne, the Dragon's Roost, the Troll Colony, the Lich Castle and beyond), on a stair that varies in grade and forks. Each region ends at a Warden. Death is a fall back to the Pool, and every run leaves blueprints, routes and shortcuts behind.
