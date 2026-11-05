# Code conventions

- **ES modules, no build step.** The page must run from a static file server. `vendor/three/three.min.js` is the only script loaded before `src/main.js`, and it exposes `window.THREE`; modules read `const THREE = window.THREE;`.
- **Shared state is explicit.** Runtime state is `ST` (`src/core/state.js`); persistent state is `S` (`src/save/store.js`). Functions read them; they do not keep private copies of `G`, `B` or `FALL` across frames.
- **The path distance `s` is the coordinate.** Anything on the stair is placed by `s` through `src/world/path.js`. Do not compute positions by hand.
- **Numbers live in config.** Geometry in `constants.js`, feel in `tuning.js`, prices in `economy.js`. Gameplay modules import them by name.
- **Registries, not switch statements.** Threats register in `entities/registry.js`, modes in `modes/registry.js`, Wardens in `wardens/warden.js`'s `MOVESETS`, zones in `zones/index.js`. Add an entry; do not add a branch somewhere else.
- **Pure where possible.** Layout (`world/layout.js`), path math, economy and migrations have no DOM or THREE dependency so `node --test` can cover them. Keep new logic in that shape when you can.
- **Feel hooks go through `fx/feedback.js`.** Freeze-frames, shake, flashes, toasts and floating text have one API so they stay consistent across threats.
- **Strings the player reads** stay in the screen or entity that shows them for now. If localisation starts, they move to `src/ui/strings.js`.
- **Naming.** Modules are lower-case nouns (`crawler.js`, `camp.js`). Exports are verbs for actions (`startFall`, `hurt`) and nouns for data (`ZONES`, `TUNE`).
- **Formatting.** 2 spaces, single quotes, semicolons, trailing commas in multi-line literals. Short helper lines are fine; a function longer than a screen should be split.
