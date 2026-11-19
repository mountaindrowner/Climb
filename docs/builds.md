# The build log

Every build of the game, newest first: what changed, what it did to a save, what was checked and what was not, and the
commit it was made from. It is kept so that when something breaks there is a place to look for what changed, and a
build to go back to.

**The rule:** no build is pushed to the itch.io page without its entry here. `tools/push-itch.sh` refuses one that has
no entry, that is not committed, or that does not start in a browser.

## Going back

To put an earlier build back on the page:

```bash
tools/restore-build.sh 61
```

That rebuilds build 61 from its commit in a folder of its own, opens it in a browser (the title and every region), and
leaves the zip at `dist/the-climb-itch-b61.zip`. Nothing is uploaded and the work in progress is not touched.

```bash
tools/restore-build.sh 61 --push
```

The same, and then it replaces the file on the itch.io page with build 61.

**What going back does not do:**
- **It does not change a save.** A save lives in the player's browser. A save made on a later build is read by the
  earlier one as it is. Most builds only add to a save, and an earlier build ignores what it does not know. Two builds
  moved things inside a save (60 and 62, below): going back across either with a save made after it, what he had found
  and broken in that region no longer lines up (chests found may be shut again, walls broken may be whole). Nothing is
  lost for good: going forward again puts it right.
- **It does not undo the work.** The later builds stay in the repository. Going back is a choice of which build is on
  the page, not a deletion.
- **Tried:** builds 61 and 62 were rebuilt and opened this way on 18 Nov 2026, without pushing. No restore has been
  pushed to the page yet.

## How a build is written down

One row in the table, and an entry under it with:
- **What changed for the player**, and **what changed underneath** (the parts of the code touched);
- **Save:** what it adds to a save, and whether anything in a save was moved;
- **Checked:** the automated checks, and what was played in the test browser;
- **Not checked;** **known problems;** and what it **cost** in drawings.

The longer account of a wing is in its sheet (`docs/phase10-sheet.md`, `docs/phase11-sheet.md`), under "As built".
The plain summary for a reader is in `CHANGELOG.md`.

## The builds

| Build | Day | Commit | What it is | Save | On the itch page |
|---|---|---|---|---|---|
| 66 | 19 Nov 2026 | `b3ff915` | The Wreck of the Works (phase 12, first half) | **moved** (the Tempest) | yes (now) |
| 65 | 18 Nov 2026 | `11c8b38` | The Cloister's refectory; the Galleries' back wall closed | adds | was, until 66 |
| 64 | 18 Nov 2026 | `5472b28` | The Glacier Galleries (phase 11, second half) | adds | was, until 65 |
| 63 | 18 Nov 2026 | `a88ef9a` | The version note on the title, the opening and the pause screen | nothing | was, until 64 |
| 62 | 18 Nov 2026 | `b72435a` | The Pilgrims' Cairns (phase 11, first half) | **moved** (the Spires) | was, until 63 |
| 61 | 18 Nov 2026 | `7c2606f` | The Bell-Foundry and the Cracked Bell (phase 10, second half) | adds | no |
| 60 | 18 Nov 2026 | `936da31` | The Scriptorium (phase 10, first half) | **moved** (the Cloister) | no |
| 59 | 18 Nov 2026 | `fa520d3` | Phase 9c: the Tempest and the Gardens held, and let go; map marks | adds | no |
| 58 | 18 Nov 2026 | `9a6170d` | Phase 9b: each keeper holds its region until it falls (Roots, Cloister, Spires) | nothing | no |
| 57 | 18 Nov 2026 | `a170fb6` | Phase 9a: the passages' lower stretches, dressed | nothing | no |
| 56 | 18 Nov 2026 | `9dd66b2` | Phase 9a: he walks from one region into the next | **moved** (every region above the Roots) | no |
| 54 | 17 Nov 2026 | `7d7853e` | The people's places, cut into the rock | not looked up | no |
| 53 | 17 Nov 2026 | `70fe09b` | The people placed by hand; Ordric's lamp-store | not looked up | no |
| 52 | 17 Nov 2026 | `c9121ac` | Phase 8a: the people by kind, the shop, platforms, torches | not looked up | no |
| 51 | 17 Nov 2026 | `23b0f3b` | Phase 7: the keepers | not looked up | no |
| 50 | 17 Nov 2026 | `c7f5b68` | Phase 6: creatures | not looked up | no |
| 49 | 17 Nov 2026 | `e1958e5` | Phase 5: weapons and gifts | not looked up | no |
| 48 | 17 Nov 2026 | `0b34128` | Phase 4: his animation and feel | not looked up | no |
| 47 | 17 Nov 2026 | `1715e03` | Phase 3: teaching and words | not looked up | no |
| 46 | 17 Nov 2026 | `5ccd0f5` | The word on a fall is PERSEVERE | not looked up | no |
| 41 | 15 Nov 2026 | not found | Uploaded to the itch page by hand that day; its commit is not marked in the history | not looked up | was, until 62 |

Builds 55 and 42 to 45 have no commit marked with their number; builds before 46 are in the history but not listed
here. The rows from 54 down were filled in from the commit history when this log was begun (build 63) and were not
gone over again.

## The entries

### Build 66: the Wreck of the Works

- **For the player:** the Tempest's west wing, nine screens, open to anyone. Iron in two halves with the current in
  one of them; levers that send it to the other; coils, Wright's-arms; the Jar; the Wright's Boots. All of it in
  `docs/phase12-sheet.md`.
- **Underneath:** new `src/side/regions/works.js`; two new tiles (the works' iron) in `rooms.js`, `level.js`
  (`RULE.sw`, `RULE.surge`), `props.js`; the lever, the discharge and the Jar's breaking in `main.js`; a wing keeper's
  bar now reads its name from the creature; `SIDE.boots` in `motor.js`; the Tempest is three columns wider on the west;
  doors cut into the landing and the watch.
- **Save: moved.** Everything a save had found or broken in the Tempest is shifted 80 tiles east, once (`winged` 2 to
  3). Adds: which way the lever is, the Jar broken (`still`), the relic.
- **Checked:** 274 automated checks, eight of them the wing's; a play-through in the test browser (the rule, a coil,
  an arm, the Jar dull and live, its discharge, its breaking, both grates); the zip opened, the title and every region.
- **Not checked:** not played by hand; the sounds; the boots in play.
- **During this build the session's worker was restarted** in the middle of a test run. Nothing was lost: the work was
  on disk, and every check was run again from the start afterwards.
- **Cost:** nothing; all of it is drawn in code.

### Build 65: the refectory; the Galleries' wall

- **For the player:** a new room of the Cloister's own, over the head of the stair (rungs up from its top landing):
  **the refectory.** A long table laid for pilgrims, the bread on it turned to stone, two of the house still serving
  it. No one there fights. A chest of shards; the table can be walked along; a line the first time he stands at it.
  This finishes phase 10.
- **Fixed:** the Glacier Galleries' back wall no longer shows the bright sky; it is dim blue throughout.
- **Underneath:** new `src/side/regions/refectory.js`; a harmless `server` in `enemies.js`; rungs and a hole cut in the
  stairwell's upper corner; the Galleries' look in `regions/glacier.js`.
- **Save:** adds that the refectory's line has been said. Nothing moved.
- **Checked:** 266 automated checks (the refectory is reached with what he has on arrival; no traps); both rooms
  looked at in the test browser; the zip opened, the title and every region.
- **Not checked:** not played by hand; the servers were seen standing at the table, not watched walking their beat.
- **Caught by a check:** the refectory's chest first held a red strand, which would have made three in the Cloister's
  own rooms; the rule is two. It holds shards.

### Build 64: the Glacier Galleries

- **For the player:** the Spires' east wing, ten screens. Cold braziers lit by a blow; each fire melts the ice nearest
  it (ways, chests, and whoever sat in it); the Seated, freed a fire at a time; the Climber's Flint. All of it in
  `docs/phase11-sheet.md`.
- **Also changes play elsewhere:** a swing no longer turns round by itself toward a thing that is not a creature (a
  brazier, his own cairn, a bell's tongue in the Foundry). In the Foundry this means a tongue behind him is no longer
  rung by a swing he aimed the other way.
- **Underneath:** new `src/side/regions/glacier.js`; a new tile (ice a fire melts) in `rooms.js`, `level.js`,
  `props.js`; a pane of ice is the vellum tile drawn as ice in the Spires (`props.js`); the fires, the Seated's fall,
  the relic and Mirel's line in `main.js`; the aim assist (`main.js`); the Spires is three columns wider on the east;
  rooms cut into the horn, the spire's tower and the saddle's tower foot.
- **Save:** adds the fires lit (`lit`, by place), the Seated's fall, two lines said, the relic. Nothing moved (the wing
  is to the east).
- **Checked:** 266 automated checks, seven of them the wing's; a play-through in the test browser (the fires, a
  sitter, the Seated at one, two and three fires, his fall, coming back); the zip opened, the title and every region.
- **Not checked:** not played by hand; the Toll's step through a pane and the way out, only by the automated player;
  the sounds.
- **Known problems:** the Galleries' back wall lets the Spires' bright sky show through in patches; it should be dim
  blue throughout.
- **Mistake caught before it went out:** a comment put in the middle of a line cut the rest of the line off, and the
  game would not have started. The syntax check found it at once.
- **Cost:** one drawing (the Seated), $0.06.

### Build 63: the version note

- **For the player:** two small lines saying where the game is (the build and the day; the phase and the last thing
  built): top right of the title and of the opening, and over the word PAUSED.
- **Underneath:** `VERSION` in `src/side/main.js`, set with every build; drawn by `src/side/story.js` (title, opening)
  and `src/side/hud.js` (pause).
- **Save:** nothing.
- **Checked:** 258 automated checks; the three screens looked at in the test browser; the zip opened (the title and
  every region) before it was pushed.
- **Known problems:** at a small window the pause menu's lower buttons overlap the controls' help at the bottom. It was
  so before this build.
- **Also from this build:** builds go to the itch.io page (`tools/push-itch.sh`), not the Claude page, which stays at
  build 62.

### Build 62: the Pilgrims' Cairns

- **For the player:** the Spires' west wing, nine screens. Cairns that move only behind his back; a way of stones that
  is gone if he turns round on it; the Turned; his own cairn; the Pilgrim's Stone. All of it in
  `docs/phase11-sheet.md`.
- **Underneath:** new `src/side/regions/cairns.js`; a new tile (the stones of the way) in `rooms.js`, `level.js`,
  `motor.js`, `props.js`; rising air that is a wing's gate (`level.js`); the reasons' words, his cairn and the relic in
  `main.js`; the Spires is now three columns wider on the west.
- **Save: moved.** Everything a save had found or broken in the Spires is shifted 120 tiles east, once
  (`winged` 1 to 2 in `src/side/state.js`). Adds: his cairn seen and knocked down, the way's first fall, the relic.
- **Checked:** 258 automated checks, ten of them the wing's; a play-through in the test browser (a cairn, the way, the
  Turned, his cairn).
- **Not checked:** not played by hand; the glide across the gap only by the automated player; the sounds.
- **Mistake caught before it went out:** a line in `main.js` used a thing before it was made, and the game did not
  start at all. The automated checks passed; the browser found it. `tools/check-build.mjs` now makes that check every
  time.
- **Cost:** one drawing (the Turned), $0.07.

### Build 61: the Bell-Foundry and the Cracked Bell

- **For the player:** the Cloister's east wing, eleven screens behind cracked stone in the bell tower. Iron rings when
  touched; while it rings the tongues swing, the slag wakes, the shutters come down. The Cracked Bell; the Founder's
  Felt. All of it in `docs/phase10-sheet.md`.
- **Underneath:** new `src/side/regions/foundry.js`; two new tiles (shutter, grate); a region may have wings on both
  sides (`level.js`); creatures that draw themselves, and a hook when one dies (`enemies.js`); the ring, the stillness
  and a wing keeper's bar in `main.js`; the Cloister is four columns wider on the east.
- **Save:** adds the Bell's fall (`still`), Mirel's line said, the relic. Nothing moved (the wing is to the east).
- **Checked:** 247 automated checks, nine the wing's; a play-through in the test browser (the wall, the rule, the hoist
  drop, the Bell's fall, the grate).
- **Not checked:** not played by hand; the sounds; the climb up the rungs in the browser.
- **Cost:** one drawing (the slag), $0.05.

### Build 60: the Scriptorium

- **For the player:** the Cloister's west wing, nine screens. Vellum only the Toll's step tears; the copying hall; the
  Corrector; the blank book; the Copyist's Blank Leaf. All of it in `docs/phase10-sheet.md`.
- **Underneath:** new `src/side/regions/scriptorium.js`; wings set into a region after it is built (`level.js`); a tile
  only the Toll's step opens; a region bringing its own creatures, looks and decorations.
- **Save: moved.** Everything a save had found or broken in the Cloister is shifted 120 tiles east, once (`winged` 0
  to 1). Adds: the lectern seen, Corwen's line said, the relic.
- **Checked:** 237 automated checks, seven the wing's; a play-through in the test browser.
- **Not checked:** not played by hand; the sounds; the copyist's ink landing in the running game.
- **Cost:** three drawings, about $0.30.

### Builds 56 to 59: phase 9, one continuous mountain

- **56:** he walks from one region into the next with no dark and no card. **Save: moved** (each region above the
  Roots gained rows under it; `joined` in `state.js`).
- **57:** the passages' lower stretches, dressed. Was published to the Claude page.
- **58:** the keepers' rules for the Roots, the Cloister and the Spires. Committed; not published on its own.
- **59:** the Tempest's and the Gardens' rules; the quick ways marked on the map.
- The whole of it is in `docs/phase9-sheet.md`.

## Known problems, carried from build to build

- **Nothing built since phase 9 has been played by hand.** Every "checked" above is the automated checks and the test
  browser.
- **The sounds added since phase 9 are unheard.**
- The pause menu's lower buttons overlap the controls' help at a small window (seen in build 63; older).
- The Toll's keeper check has one row that fails (standing still in its second half is not hurt). Older than phase 9;
  not looked into.
