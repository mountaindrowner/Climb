# The build log

Every build of the game, newest first: what changed, what it did to a save, what was checked and what was not, and the
commit it was made from. It is kept so that when something breaks there is a place to look for what changed, and a
build to go back to.

**The rule:** no build is pushed to the itch.io page without its entry here. `tools/push-itch.sh` refuses one that has
no entry, that is not committed, or that does not start in a browser.

**The map page:** after a build is pushed, the map at https://claude.ai/artifact/XdHbnbJHLPb2SxELnczC3h is redrawn from
it: `tools/map-update.sh <dir>` writes its four files (a few seconds), and they are published to that same address.
Notes and proposed moves left on the page are read back before the next piece of work, and withdrawn or marked done
once the game matches them.

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
| 75 | 19 Nov 2026 | `COMMIT75` | Try a place: any level, or a moment, from the title (for playtesting) | no | yes (now) |
| 74 | 19 Nov 2026 | `ba84266` | The Hollow, the Auger, the grip, the Source (phase 17) | no | yes (now) |
| 73 | 19 Nov 2026 | `18a5cde` | The Flooded Levels, the Great Shaft, travel through the water (phase 16) | no | yes (now) |
| 72 | 19 Nov 2026 | `1a53c35` | The lamp, and the Vein (phase 15): the dark | no | yes (now) |
| 71 | 19 Nov 2026 | `aaae08a` | The Orrery Wing (phase 14); things that move and carry him | no | yes (now) |
| 70 | 19 Nov 2026 | `1a5edcb` | A mend to 69: the moths keep to their own rooms | no | yes (now) |
| 69 | 19 Nov 2026 | `b21499c` | The Keepers' Houses (phase 13, second half) | no | yes (now) |
| 68 | 19 Nov 2026 | `d38c09e` | The Aqueducts (phase 13, first half) | **moved** (the Gardens) | yes (now) |
| 67 | 19 Nov 2026 | `df2ecd3` | The Eye of the Storm (phase 12, second half); four relics that did nothing, fixed | no | yes (now) |
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

### Build 75: try a place

- **For the player:** on the title, **Try a place**. Any of the eleven levels from its start, with what he would
  have by then: on the climb, what the keepers below it leave; in the Deep, everything the climb gives short of its
  last keeper, and below the Flooded Levels the way through the water too. Or one of five moments: **deep water
  before the Wyrm** (he floats), **deep water with the wind** (the sump), **the Pump**, **the Auger**, **the grip**
  (the Auger still, at the foot of its pit). While trying, the corner of the screen says so. "To the title" in the
  pause menu ends it.
- **It is not his save.** When a trial begins his save is put by; what the trial stores is written beside it under
  another name; at the title his own is back. A climb never begun is still never begun.
- **Underneath:** `tryMenu`, `tryStart`, `endTry` in `main.js`; `TRY` and `fresh` in `state.js` (while a trial is
  on, `store` writes to `climb-side-try`). No level, creature or rule is changed.
- **No change to the motor.**
- **Save: not moved, not touched.** One more key in the browser's storage (`climb-side-try`), which nothing reads.
- **Checked:** in the test browser. From a browser with no save: all eleven levels and all five moments started one
  after another, each with the right gifts in hand and no page error, then back to a title that still says "Begin
  the climb" with nothing stored as his. With a save in hand: a trial of the Hollow, a fall in it, back to the title:
  his save the same to the letter, and "Climb on" takes him where he was. The menu fits a phone held sideways. Of
  the automated checks, the ones that touch what changed were run again (107 of them); the whole suite was last
  run for build 74.
- **Not checked:** not played by hand.
- **Cost:** nothing.

### Build 74: the Hollow, the Auger, the grip, and the Source

- **For the player:** the bottom of the Deep. **The Hollow**, fourteen screens under the Great Shaft's floor: the
  guild's last camp, the floor torn in rings, Echoes. **The Auger**, the Deep's keeper, with an entrance like the
  other six: it drives its bit down where he stands; when the bit sticks he gets on its back and strikes the collar;
  twice it bores the floor away and they fall to the next. It leaves **the grip**: he clings to rough rock and
  climbs it. Past it, **the Source**: a spring, a low flame no one keeps, and one draught more in his flask for
  good. Past that, a rough wall up, and out at the Pithead in the Roots. One relic. All of it in
  `docs/phase17-sheet.md`.
- **Underneath:** new `src/side/regions/hollow.js` (the eleventh level) and `src/side/auger.js` (the keeper, drawn in
  code). Three new tiles: rough rock, and the bore's two floors that go (`rooms.js`, `level.js`). The grip in
  `motor.js`. Rough rock's face drawn in `props.js`. The Auger's entrance in `entrance.js`. A thing that moves and is
  stood on can now be placed by its owner (the Auger's back). Water that only falls to be looked at. The Shaft's
  floor has the way down in its pit. Both ways the checks work out where he can get to now climb rough rock, up and
  down. `assets/side/px_auger` is drawn by hand for the Annals.
- **The motor changed.** New: taking hold of rough rock, climbing, coming down, leaping off. Nothing that was there
  is changed, and rough rock is only in the Hollow, so nothing above it can be affected by this.
- **The keepers' gifts are four now, not three.** Anything that lists them (what he carries, the checks that play a
  region "with every gift") has one more.
- **Save: not moved.** Adds: the Auger fallen (`beat` for the Hollow), the Source found (`source`, and one more in
  `flasks`), the relic, and which words were said. The game has eleven levels now.
- **Checked:** 405 automated checks, six of them this phase's, and the slow ones that play every level with the
  real motor pass on the Hollow, its pit with the floors gone included. A play-through in the test browser, in two
  parts. The fight from start to end: the hall shut, the dread, its rise, three tears and a bite, up on its back,
  eight blows at the collar, the first floor bored away, the second, its fall, the grip given and its page. Then,
  with the Auger still: out of the pit by its wall and into the circles; through to the Source and its page, the
  flask one deeper; up the wall beyond it and out at the Pithead. No page errors in any of it.
- **Not checked:** not played by hand, and a keeper most of all needs that. How hard it is. The sounds (its music is
  the keepers' shared piece). Its short rise, the second time it is met. How dark its hall is on a real screen.
- **Cost:** nothing.
- **To try** (the playtest list):
  1. The Auger: is it clear when it can be hurt? Is getting onto its back a good moment or a fiddly one?
  2. The floor going: a thrill or a muddle? Can you tell it is coming?
  3. After it falls: do you find, without being told, that the pit's wall can be climbed now?
  4. Climbing: is going into a wall to go up it natural? Do you ever let go by accident?
  5. The Source: after everything above, does it land? Is one page enough, or too much?
  6. The wall back to the Roots: a good way home, or just a long climb?

### Build 73: the Flooded Levels, the Great Shaft, and travel through the water

- **For the player:** deep water (it bears him up; with the Wyrm's wind it carries him under). The Workings' cistern
  is deep, and the sump in its floor is the way down. **The Flooded Levels**, twelve screens: the Sunk, blind eels,
  rafts, the guild's drowned lamps, and **the Pump**, which moves the water in its hall and is fought by its three
  valves. **Travel through the water**, given at the lamp in the flooded chapel: at any water he has found, go
  under and come up at another. **The Great Shaft**, four screens below the Vein's lip: the long glide, the water at
  its foot, the floor under that water, and the light under the floor. Two relics. All of it in
  `docs/phase16-sheet.md`.
- **Underneath:** new `src/side/regions/flooded.js` and `shaft.js` (the ninth and tenth levels). Bodies of deep
  water, rafts and cold rising air in `level.js`; swimming in `motor.js`; the water, the drowned lamps and the rafts
  drawn in `props.js`; the waters he has found, the menu at the water and going under in `main.js`. A region can say
  it `needs` a gift to be come into, and a room can; a region can be `empty`. The checks' two ways of working out
  where he can get to (`tests/side-level.test.mjs`, `tests/helpers/reach.mjs`) both know water now. New art:
  `assets/side/px_sunk`.
- **The motor changed.** Everything in it about water is new. What was there is touched in four places: a jump
  pressed in water is a leap out of it, not a double jump; he does not catch an edge while under water; the scarf
  does not open in cold air; pulling himself onto an edge is quicker with the Last Rope. Nothing else about how he
  moves on land or in the air should be different, and the checks that play every region with the motor all pass.
- **The Workings changed.** The cistern's floor is under water; the seal room is ten rows higher, on a quay. One
  barnacle is gone from the quay.
- **Save: not moved.** In the Workings, a save that had broken the guild's seal finds it standing and breaks it
  again; the seal room's two lamps and one urn are as new. Adds: the waters found (`wat`), the way through the water
  (`under`), the Pump run free (`still` for the Flooded Levels), two relics, and which words were said. The game has
  ten levels now.
- **Checked:** 378 automated checks, ten of them this phase's, and the two slow ones that play every level with
  the real motor (every room reached with what he has, nowhere to be stuck) pass on both new levels. A play-through
  in the test browser, in four parts: afloat over the sump without the wind, down it with the wind, into the first
  air and back up; the chapel's lamp and its page; the Pump's tide watched for sixteen seconds, its three valves
  broken with the blade, the grate open, down the overflow into the Vein; going under at the Roots and coming up at
  the Firmament's raising water and at one of its leaks; the Shaft fallen without the wind (into the water, out onto
  the camp) and glided with it (through the arch, onto the floor). No page errors in any of it.
- **Not checked:** not played by hand. How swimming feels. The sounds. Whether the Pump is a good fight or only a
  working one. How dark the Shaft is on a real screen. An old save with real progress.
- **Cost:** $0.06 (the Sunk).
- **To try** (the playtest list):
  1. In the Workings' cistern before the Wyrm: wade in. Does floating read as "not yet", or as a bug?
  2. With the wind: go under at the sump. Does it feel like being carried, or like losing control? Are rising and
     sinking the right speed?
  3. Drift past an eel slowly, then rush one. Is it clear why it struck?
  4. The Pump: is the tide readable? Is there always something to do at low water and at high?
  5. The chapel: is it clear what was given, and where to use it?
  6. Go under at one water and come up at another, a few times across the mountain. Is the list quick to use?
  7. The Shaft under the scarf: is the long glide quiet and good, or just long?

### Build 72: the lamp, and the Vein

- **For the player:** a lamp he carries (his from the Warden on; told of at the next water). A new part of the Deep,
  **the Vein**: twelve screens, truly dark, behind the guild's seal in a new room off the foot of the Workings'
  cistern (the Warden's spade breaks it). Guild lamps that he lights by coming to them, and that stay lit.
  Prospectors, glimmers, the Echo (which follows where he went and will not enter a lit lamp's light), the Assayer.
  A relic: Raw Lampstone (his lamp reaches further). All of it in `docs/phase15-sheet.md`.
- **Underneath:** new `src/side/regions/vein.js`, a new level (the eighth; `dark: true`); the Workings gain a room
  (`sealroom`) and a door in the cistern's east wall; the lamp's light, the lighting of lamps, the dark's own lights
  and the Assayer's end in `main.js`; the guild's lamps drawn in `props.js`; a core room can now be marked `after`
  (behind its keeper) in `level.js`; a passage can carry a `gate`. Lit lamps are kept in the save's `lit`, with the
  Glacier's fires. New art: `assets/side/px_prospector`, `px_glimmer`; `px_echo` and `px_assayer` drawn by hand for
  the Annals.
- **A fault of mine from build 69, mended here: Ordric was drawn wrong.** His drawing lives in a folder called
  `px_moth` (he is a moth). In build 69 I named the Keepers' Houses' moth the same, and the new drawing went over his.
  So in builds 69, 70 and 71 Ordric, at every water on the mountain, was the Houses' pale moth, and had lost his idle
  movement. I found it while adding Hob to the Vein. His files are back exactly as they were before build 69 (checked
  against that commit, byte for byte); the Houses' moth has its own folder (`px_housemoth`); no other drawing was
  affected (each of the other new folders was new); and the art tool now refuses to draw onto a folder that exists.
- **No change to the motor** in this build.
- **Save: not moved.** Adds: the lamp (`lamp`), lit lamps (`lit`, per level), the Assayer still (`still` for the
  Vein), the relic, and which words were said. The game now has eight levels, not seven: anything that counts them
  (the level list in the menu, for one) shows one more.
- **Checked:** 338 automated checks, nine of them this phase's; a play-through in the test browser (see the
  sheet); the zip opened, the title and every region, the Vein among them.
- **Not checked:** not played by hand; the sounds; how dark it looks on a real screen.
- **Cost:** $0.12 (the Prospector and the glimmer).

### Build 71: the Orrery Wing

- **For the player:** the Firmament's east wing, nine screens, open to anyone, through a new door off the orrery
  room's shelf. Planets and pallets he stands on and rides; a floor of hours that calls one hour and strikes the
  next; armillaries; the Almanac; the Last Page (once each rest, the blow that would end him leaves him one heart);
  a short way from the winding room into the aphelion. All of it in `docs/phase14-sheet.md`.
- **Underneath:** new `src/side/regions/orrery.js`; **things that move and can be stood on** as a new kind of place
  in `level.js` (`movers`, `moverAt`, `moversNow`) and in the motor (he is carried, lands on one from above, walks
  and drops off; a wall stops him and not it); they are drawn in `props.js`; the hours' sounds and words, the
  Almanac's end and the relic's cue in `main.js`; the relic's rule in the motor's `hurt`; the Firmament is three
  columns wider on the east; doors cut in the orrery room and the aphelion. New art: `assets/side/px_almanac`,
  `px_roller` (the last drawn by hand for the Annals).
- **The motor changed for everyone again, a little:** the new lines do nothing where nothing moves, and every other
  region's checks pass unchanged. As with build 68: if his movement feels different outside this wing, compare with
  the build before.
- **In a check, a mover is everywhere on its way at once** (he is taken to wait for it, as he is for star-glass). So
  the checks say what can be reached by riding, not how hard the timing is.
- **Save: not moved** (the columns are added on the east). Adds: the Almanac shut (`still`), the relic, and which
  words were said.
- **Checked:** 314 automated checks, nine of them the wing's; a play-through in the test browser (a pallet, the
  hours both ways, the ride from the mounting block to the Almanac's door, an armillary, the Almanac's calls and its
  end, the relic, the way out); the zip opened, the title and every region.
- **Not checked:** not played by hand; the sounds.
- **Cost:** $0.07 (the Almanac).

### Build 70: a mend to 69

- **For the player:** in the Keepers' Houses a moth no longer comes through a floor or a ceiling for him. Each keeps
  to its own room, and goes back to its lamp when he leaves it.
- **Why so soon:** I saw it in the picture I took of build 69 for you, after 69 had gone out: a moth from the long
  table was up in the lane, through the floor. It is the same fault the Hush had in the Eye of the Storm, and I
  should have carried that lesson over. Build 69 is otherwise the same as this one.
- **Underneath:** four lines in the moth's turn in `src/side/regions/houses.js`; one more case in its check.
- **Save:** nothing.
- **Checked:** 304 automated checks (the moth's check now also holds it to its room); the zip opened, the title and
  every region.
- **Not checked:** not played by hand; no new play-through in the test browser for this mend.

### Build 69: the Keepers' Houses

- **For the player:** the Gardens' east wing, eight screens, through a shuttered gate in the arbor that the Toll's
  step tears. Kept houses where breaking anything is the mistake: a broken setting brings the Housekeeper by its
  servants' doors, and shuts his own house until it is set right. Moths. The Second Place (one heart more). A back
  way out onto the cascade's high terrace. All of it in `docs/phase13-sheet.md`.
- **Underneath:** new `src/side/regions/houses.js`; a new tile (the door of his house, 19) in `rooms.js`, `level.js`
  (`RULE.upset`), `props.js`; the count of things out of place, the events and the Housekeeper's end in `main.js`;
  `maxHearts` counts the relic in `state.js`; a creature's definition can now say `wakeful` (never asleep) in
  `enemies.js`; a gate cut through the arbor's east pier and a door through the cascade's east wall. New art:
  `assets/side/px_housekeeper`, `px_moth`.
- **Save: not moved** (the rooms are cut into columns the Gardens already had). Adds: the relic, each setting's
  shards paid (in `broke`), the Housekeeper broken (`unkept`), and one word said.
- **Found while writing this entry, and fixed before the build went out:** the Gardens now have two wing keepers,
  the Lock and the Housekeeper, and there was one switch for "this region's wing keeper is down". Breaking the
  Housekeeper would have opened the Lock's gate and stood its sluice-keepers down; opening the Lock would have opened
  his house. The Housekeeper has its own switch now (`unkept`), a check holds the two apart, and a broken Housekeeper
  stays broken when he comes back.
- **A side effect on the Gardens themselves, and an older check changed for it:** the back way is a short way up
  toward the bower for anyone, not only after Mother Thorn falls. An older check said the withered thorn ways make
  the way to her at least a quarter shorter; with the back way there the gain is 23% (152 units against 197). The
  back way is meant to be a shortcut, so I kept it and the check now asks for a fifth. If the Gardens should stay
  the long way round until she falls, the back way's door is the thing to shut.
- **Checked:** 304 automated checks, ten of them the wing's; a play-through in the test browser (the gate, the
  calm Housekeeper, a setting broken and set right two floors up, the Housekeeper wronged and broken, the quiet way,
  the relic, his own table, the back way); the zip opened, the title and every region.
- **Not checked:** not played by hand; the sounds.
- **Cost:** $0.11 (the Housekeeper and the moth).

### Build 68: the Aqueducts

- **For the player:** the Gardens' west wing, nine screens, open to anyone, through a new door in the wellspring's
  west wall. Running water that carries him along a channel and bars a climb where it falls; sluice wheels that stop
  and start it; stone keepers that put the wheels back; water-striders; the Lock; the Carrier's Yoke (one more
  draught in the flask). All of it in `docs/phase13-sheet.md`.
- **Underneath:** new `src/side/regions/aqueducts.js`; running water as a new kind of place in `level.js` (`flows`,
  `RULE.wet`, `flowAt`) and in the motor (`FLOW`: the push along a channel, the bearing-down of a fall, the speed
  kept through a leap, no ledge-grab in falling water); the water drawn in `props.js`; the wheels, the keepers'
  undoing, the flood and the Lock's opening in `main.js`; `maxFlask` counts the yoke in `state.js`; the Gardens are
  three columns wider on the west; two doors cut in the wellspring's west wall. New art: `assets/side/px_sluicer`,
  `px_strider`, `px_lock` (the last drawn by hand for the Annals).
- **The motor changed for everyone, a little:** the two new lines in it do nothing where there is no running water,
  and the checks for every other region pass unchanged. If his movement feels different anywhere outside the
  Aqueducts in this build, that is a fault and this is the build to compare against 67.
- **Save: moved.** Everything a save had found or broken in the Gardens is shifted 120 tiles east, once (`winged`
  3 to 4). Adds: each wheel as he left it (`wet`), the Lock open (`still`), the relic, and which words were said.
- **Checked:** 294 automated checks, eleven of them the wing's; a play-through in the test browser (the water
  with and against him, the wheels, the ride, a fall barring and letting him by, the keepers, the Lock's flood on
  the floor and on a pier, its opening, the relic, the spill); the zip opened, the title and every region.
- **Not checked:** not played by hand; the sounds; a save from before the move, loaded in the real game.
- **Cost:** $0.07 (the sluice-keeper and the water-strider).

### Build 67: the Eye of the Storm

- **For the player:** the Tempest's east wing, seven screens, reached from the masthead and climbed on the Wyrm's
  wind. Nothing moves while he moves: the Hush come only when he stands still, and a door of cloud opens only to one
  who stands and waits. The Thunderhead's empty seat; a new relic, a Breath of the Eye (gliding, he sinks more
  slowly). All of it in `docs/phase12-sheet.md`.
- **A fix he may notice: four relics now do what they say.** Featherfall (no hurt from a long fall), the Seedheart
  (a heart mended for 7 embers, not 10), the Pilgrim's Stone and the Wright's Boots did nothing: the line that
  switches them on was inside a comment, since build 49 for the first two. If something to do with falls, mending or
  live iron seems different from build 66, this is why.
- **Underneath:** new `src/side/regions/eye.js`; a new tile (a door of cloud, 18) in `rooms.js`, `level.js`
  (`RULE.hush`, `RULE.open` and the open door's box), `props.js` (the cloud, thinning); the waiting, the words and the
  floor of cloud in `main.js`; `SIDE.calm` in `motor.js`; the relic in `state.js`, its knot and icon; the Hush in the
  Annals and the voices; the Tempest is three columns wider on the east; a door cut in the masthead's east wall. New
  art: `assets/side/px_hush`.
- **Save: not moved** (the columns are added on the east). Adds: the relic, and that the two sets of words were said
  (`eyeTold`, `eyeSeat`).
- **Checked:** 283 automated checks, eight of them the wing's; a play-through in the test browser (the wind, each kind
  of door, the Hush frozen and coming, a guard, the relic measured in the running game, the floor of cloud); the zip
  opened, the title and every region.
- **Not checked:** not played by hand; the sounds; the four mended relics in play, other than by reading the line.
- **During this build the session's worker was restarted** again: I ran the full checks and the test browser at the
  same time and the machine ran out of memory. Nothing was lost. Every check was run again afterwards, one at a time.
- **Cost:** $0.06 (the Hush, drawn twice; the first is not used).

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
- **Builds 69 to 71 show Ordric as the wrong moth** (mended in 72). If one of those is ever restored, it has this fault.
- **The Thornback (the Gardens' boar) is drawn at an angle,** not side-on (you saw it, 19 Nov 2026). To be redrawn:
  `docs/pixellab-wishlist.md`, "To redo".
- The Toll's keeper check has one row that fails (standing still in its second half is not hurt). Older than phase 9;
  not looked into.
