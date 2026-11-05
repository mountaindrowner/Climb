# Release checklist

The game is a static page, so a release is a tagged commit served from anywhere.

1. `npm run check` passes (unit tests and the headless playthrough).
2. Phone playtest done against `docs/process/playtest-checklist.md`; notes filed.
3. `CHANGELOG.md` has an entry; `package.json` version bumped.
4. Save migrations: if the save shape changed, `SAVE_VERSION` is bumped and a migration added with a test.
5. Tag `vX.Y.Z` and push the tag.
6. Serve the repository root (GitHub Pages, any static host, or a packaged WebView for stores). No build step; `index.html`, `src/`, `vendor/` and `assets/` are the whole game.
7. Update the live link in `README.md` if it moved.
