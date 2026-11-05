# Contributing

The Climb is a small team's game, so the rules are few.

- **Play before you push.** `npm test` and `npm run smoke` must pass. If a change touches feel (camera, timing, animation), play it on a phone and say which one in the PR.
- **Numbers go in config.** No magic timings in gameplay modules: put them in `src/config/tuning.js` (feel) or `src/config/constants.js` (geometry) and describe them in `docs/tuning.md`.
- **Content goes in its home.** Zones in `src/zones/`, threats in `src/entities/`, Wardens in `src/wardens/movesets/`, modes in `src/modes/`. Each has a registry; see `docs/architecture.md`.
- **Keep the pillars.** Every feature should serve one of the seven pillars in `docs/design/direction.md`. If it doesn't, write down why it's still worth it.
- **Decisions get a note.** Anything that would surprise someone in six months goes in `docs/decisions/` as a short record.
- **Original names only.** No borrowed names or creatures (see the IP line in the direction doc). Tests check the zone names.
- **Commit messages** say what and why, in plain words. Reference the roadmap step or issue when there is one.

Style: 2-space indent, ES modules, no build step, no dependencies in the shipped page. See `docs/process/conventions.md`.
