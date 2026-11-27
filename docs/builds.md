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
| 123 | 27 Nov 2026 | `COMMIT123` | Phase 18, part 3: a rough face in each of the five passages between regions. A chimney in the passage's roof, a nook at its head; climbed with the grip and by nothing else | no | yes (now) |
| 122 | 27 Nov 2026 | `1ed6379` | Phase 18, part 2: the Deep climbed from the bottom. A ring under the Assayer's grate unbars it from below; Hob's lines for one climbing out | no | replaced by 123 |
| 121 | 27 Nov 2026 | `42b234c` | Phase 18 begun: the throw. At the door of the last region he is thrown down to the Hollow, at the bottom of the Deep, and climbs out; the Deep's doors open when he does. A new game clears everything | no | replaced by 122 |
| 120 | 27 Nov 2026 | `b5d7543` | The Deep's far ends, seventeen screens: the Winding-House (the Workings: a cage that runs once its engine is started), the False Lode (the Vein: a ring with the guild's air-door across it), the Drowned Stope (the Flooded Levels: a windlass in the air, a grate under two screens of water), the Adit (the Great Shaft: a wall against the cold, and the cold up a raise), the Far Wall (the Hollow: a rough face four screens tall). Every level has its far ends | no (a save follows the level) | replaced by 121 |
| 119 | 27 Nov 2026 | `6170aab` | The Firmament's far end, six screens: the Outer Ring past the arms (a ring of two planets that turns from the first; a second arm, the outermost, that stands until it is wound from the winding room, and then carries him to the head of a tower) | no | replaced by 120 |
| 118 | 27 Nov 2026 | `152e4f7` | The far ends of the Tempest and of the Gardens, ten screens: the Great Rod off the coils (plates of iron live in one half or the other, and a crane's hook on a rail) and the Blue past the stills (floors of cloud that let him down when he stands still); the Rising Main past the lock (four falls and their wheels) and the Last House past his own (a kept door, an attic) | no (a save follows the level) | replaced by 119 |
| 117 | 27 Nov 2026 | `bdff3d0` | The Spires' far ends, eight screens: the Way Down past his cairn (a cleft he drops down and cannot climb; the wall at its foot keeps off the wind that carries him back) and the Crevasse past the Seated (a crack in the glacier; one fire at its head melts the plug in its floor, forty rows below) | no (a save follows the level) | replaced by 118 |
| 116 | 27 Nov 2026 | `220224b` | The far ends of the Roots and of the Cloister, twenty-one screens. The Roots: the Drawing-Place past the weir (a bucket-chain he sets going and rides; the Well sounded three screens down) and the Unsorted (a pit, one scale with its stack in three, the first tomb under it). The Cloister: the Empty Shelves past the copying hall (two ladders that roll on rails when struck; the binders' loft) and the Cull past the slag runs (a casting crane sent from a winch on the pit's floor). The keepers' words in the Drowned Galleries are said at last | no (a save follows the level, build 115) | replaced by 117 |
| 115 | 27 Nov 2026 | `a7a3e87` | Every level lifted: two rooms of rock under each (and a room more over those with a roof of rock), so there is somewhere to build down and up. A save now follows its level when it grows. Nothing he can reach is changed | **moved** (every place 46 tiles up; done as the save is read) | replaced by 116 |
| 114 | 27 Nov 2026 | `a9c2759` | The Pilgrims' Cairns' wind-breaks: two walls of slate; knocked down, the wind rises somewhere else. A thread on a horn too tall to climb; the scree climbed from below | no | replaced by 115 |
| 113 | 27 Nov 2026 | `8d3a3b2` | The Ossuary's scales: two grave-slabs, each lifted by weight in a pan that is in another room. His own weight, a stack of bones knocked in, and a Tallyman who takes them out again | no | replaced by 114 |
| 112 | 27 Nov 2026 | `5bbbfb2` | The Drowned Galleries, the undercroft: the keepers' store under the hall, for one with the Seated's Wind; a hatch lifted from below. The wing's sheet is built | no | replaced by 113 |
| 111 | 27 Nov 2026 | `23ee1e0` | The weir's fight is a squid, not a pike: long, violet, blind. It fights as the pike did | no | replaced by 112 |
| 110 | 27 Nov 2026 | `6a68cde` | The Drowned Galleries, fourth build: the Pike, the wing's fight. Afloat it bites and cannot be hurt; left on the bed at low water it can | no | replaced by 111 |
| 109 | 27 Nov 2026 | `bb2f832` | The Drowned Galleries, third build: the skimmer (a new creature, the first drawn by the new way), two of them over the hall's pools; two leeches in the cells' flue | no | replaced by 110 |
| 108 | 27 Nov 2026 | `504ced0` | The Drowned Galleries, second build: three gates of stone, each raised by a windlass somewhere else. The cells' gate holds their water | no | replaced by 109 |
| 107 | 26 Nov 2026 | `c17d1fd` | The Drowned Galleries, first build: the Roots' west wing, twelve screens, and water that rises and falls. The Roots moved to make room | **yes** (once) | replaced by 108 |
| 106 | 26 Nov 2026 | `4ac1531` | The Deep's map pass, its five levels: 122 planks to 39, none bare in the air. The map pass is done | no | replaced by 107 |
| 105 | 26 Nov 2026 | `24171a1` | The Firmament's map pass: 68 planks to 30 in 40 screens, none bare in the air; people hint and do not instruct | no | replaced by 106 |
| 104 | 26 Nov 2026 | `d936c12` | The Gardens' map pass: 117 planks to 46 in 47 screens, none bare in the air; a bloom under each quick way | no | replaced by 105 |
| 103 | 24 Nov 2026 | `1265ed4` | The Tempest's map pass: 72 planks to 50 in 51 screens, none bare in the air | no | replaced by 104 |
| 102 | 24 Nov 2026 | `e0d0745` | The Spires' map pass: 116 planks to 90, each with a reason; not under one a screen (ladders in the clefts, the rope bridges) | no | replaced by 103 |
| 101 | 24 Nov 2026 | `125baa0` | The Cloister's map pass: its height from its own stone, 122 planks to 49, none in the air | no | replaced by 102 |
| 100 | 24 Nov 2026 | `e96cf7f` | The Wyrm's faces: its mouth shuts, it winces when hit, is dazed when stuck, angry from half health, and glows as it draws breath | no | replaced by 101 |
| 99 | 24 Nov 2026 | `3a809c1` | The Wyrm's new look (head drawn by PixelLab), seen on its far peak before the summit, and a sound for every piece of its ice | no | replaced by 100 |
| 98 | 24 Nov 2026 | `0484c9a` | A dev tool: try any place with all six weapons | no | replaced by 99 |
| 97 | 24 Nov 2026 | `314972f` | The Rime Wyrm rebuilt: the broken pass (three levels, the gap of cloud) and five attacks, each taking one level from him | no | replaced by 98 |
| 96 | 24 Nov 2026 | `a21b0de` | The weapon on his back: when he climbs onto an edge, gets up or takes a gift, whatever he carries is slung behind him | no | replaced by 97 |
| 95 | 23 Nov 2026 | `d659a60` | A heart behind the Tempest's Jar, a drink behind the Gardens' Lock, each in a prize chest | no | replaced by 96 |
| 94 | 23 Nov 2026 | `1e890d4` | Mother Thorn's thorns: five fast cuts and a burst. The six weapons are done | no | replaced by 95 |
| 93 | 23 Nov 2026 | `6484af5` | The Thunderhead's storm bow: free arrows across the room; the third goes through; shots up, and down from the air | no | replaced by 94 |
| 92 | 23 Nov 2026 | `9e3a209` | The Toll's clapper, a flail: the longest reach, a blow that rings creatures to a stop; the Toll leaves it, not a heart | no | replaced by 93 |
| 91 | 23 Nov 2026 | `3ff8816` | The Wyrm's tooth, a spear; the Wyrm leaves it; the glide is the Seated's, in a prize chest; weapons go round on the swap key | **save** (kept) | replaced by 92 |
| 90 | 23 Nov 2026 | `bd14458` | The hammer's plunge: a drawing of its own, he rides it down | no | replaced by 91 |
| 89 | 23 Nov 2026 | `6ff3654` | The hammer drawn: a whole set of his drawings holding it, made from the one picture picked | no | replaced by 90 |
| 88 | 22 Nov 2026 | `0514ae3` | Harder: one spring a region, prices up two thirds, urns pay less, the larger creatures' and the keepers' great blows cost two hearts | no | replaced by 89 |
| 87 | 22 Nov 2026 | `aaa2472` | The Cracked Bell rolls; the air dash is its prize, in a chest of its own; thin ice across the way into the Spires | **save** (kept) | replaced by 88 |
| 86 | 22 Nov 2026 | `de8d329` | The hammer in place of the spade: three times the sword's damage, a wide arc, it knocks creatures back | no | replaced by 87 |
| 85 | 22 Nov 2026 | `39c2bf3` | Up: W and the up arrow look up and strike upward; Space alone jumps | **keys** | replaced by 86 |
| 84 | 22 Nov 2026 | `f3778c9` | Ordric's shop as his own sheet of paper; unknown rooms as cloud on the map; every mark on the map named | no | replaced by 85 |
| 83 | 22 Nov 2026 | `53c787a` | The HUD (the ember bar, each part named once), the menu in tabs, the inventory as pictures | no | replaced by 84 |
| 82 | 21 Nov 2026 | `bc8512a` | The Deep shut; no maps sold or given; the window for everything gained, and keys drawn as keys | no | replaced by 83 |
| 81 | 21 Nov 2026 | `bbde82a` | The second playtest's broken things: the copy of him, the menu key, falls, the Great Shaft's water, and small numbers | no | replaced by 82 |
| 80 | 21 Nov 2026 | `526af11` | The Glimmer redrawn side-on (the "crabs at an angle") | no | replaced by 81 |
| 79 | 21 Nov 2026 | `6e00f76` | The slam that got him under deep water; things standing in walls and spikes | **yes** | yes (now) |
| 78 | 21 Nov 2026 | `522a77c` | The broken list from the playtest; four old faults found on the way | no | yes (now) |
| 77 | 20 Nov 2026 | `a2cae7a` | From the playtest: the edge grab, roomier shafts, plain words, the goal said | **yes** | yes (now) |
| 76 | 19 Nov 2026 | `a77ee13` | The map pass, pilot: the Roots in stone (84 planks to 17) | no | yes (now) |
| 75 | 19 Nov 2026 | `3a4aa64` | Try a place: any level, or a moment, from the title (for playtesting) | no | yes (now) |
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

### Build 123: rough faces in the passages

*Phase 18, part 3 (`docs/phase18-sheet.md`, and "As built: build 123" in it). Carried from phase 17: "rough faces in
every region from the Roots on, seen long before they can be climbed." Pictures: `docs/rough-faces-build123.png`. No
new drawings: rough rock is drawn as it is in the Hollow.*

**For the player**

- **In each of the five passages between regions** (the Crypt Stair, the Bell Road, the Last Hut, the Breach, the
  Long Stair), past its middle on the way up, there is a chimney in the roof. Six tiles wide. Its far wall is pale,
  chisel-bitten rock.
- **Without the grip it is nothing:** he can jump up into its mouth and come down again.
- **With the grip:** a jump at the wall and he takes hold. He climbs it. At the top he lets go toward the near
  side and comes down on a lip of stone, and past the lip is a nook: a torch, a chest of shards.
- **It is sixteen rows from the passage's floor to the nook.** Coming down is a drop he takes unhurt.
- **To try:**
  1. On any way up between regions, look at the roof a little past the passage's middle.
  2. With the grip (from the Auger), jump at the pale wall holding toward it. Keep holding.
  3. At the top, press the other way.

**What is weaker than it should be**

- **It is the same thing five times,** with the same chest in it.
- **The face begins at the roof, six rows over his head.** In the Hollow every face begins at the floor, and walking
  into it is enough. Nothing teaches that these want a jump first.
- **Letting go at the top is the only way on to the lip,** and it wants the other direction pressed. A player who
  only holds on will hang there.
- **The torch and the chest are the upper region's.** Seen from the lower end of the passage, before the regions
  change, the nook is there and dark and empty.
- **None is inside a region.** The sheet said one or two in each.
- **Not played by a person.**

- **Save: not moved.** Adds nothing new.
- **Checked:** 587 automated checks (the full run found one fault, five times over: the nook's torch had no bracket
  or stand, having been set after torches are given theirs; mended, and the files it touches run again), six new
  (`tests/side-faces.test.mjs`): the chimney, its rough wall, the
  nook and its lip in every passage, the same stone in both of the regions that hold it, on the upper region's
  side of the middle, roofed inside the passage's own stone; one chest of shards in each and no thread; and each
  passage played with the real motor: the nook with the grip, nothing above the passage's floor with everything
  else he could have, and from the nook a way back down. The tests' player learned one move for this: a jump at
  a face that begins over his head. It now tries a face only from where one is near, since every region has one.
  In the test browser: the Bell Road and the Crypt Stair (the two ways a passage runs), each seen from under,
  jumped at without the grip, and climbed to the nook with the real keys.
- **Not checked:** not played by hand; the other three passages in the browser (they are the same stone).
- **Mistakes caught before it went out:**
  - **The chimney was first cut in one region's copy of the passage only.** A passage is held by both the region
    under it and the one over it, and the two must be the same, tile for tile. It is cut in the passage's own stone
    now.
  - **It was first at the passage's middle,** which is where the regions change: he would have changed region
    while climbing. It is past the middle.
  - **It was first open at its top.** Over a region's copy of the passage above it there is sometimes only sky,
    and he climbed out into it. It is roofed in the passage's own last row.
  - **The nook was first six tiles from the face,** and letting go he fell past it. The lip, and a chimney that
    goes on two rows over it.
  - **A thread in two of the nooks** broke the rule of two a region. Shards.

### Build 122: the Deep climbed from the bottom

*Phase 18, part 2 (`docs/phase18-sheet.md`, and "As built: build 122" in it). Pictures:
`docs/deep-upward-build122.png`. No new drawings (the ring is the Drowned Galleries').*

**For the player**

- **The long way out of the Deep now goes all the way:** the Hollow's roof, the Great Shaft, the Vein, the Workings,
  the Pithead. Without the grip, and with no keeper down.
- **In the Vein, coming up from the Shaft:** the lip, the cradle, and the flue up out of the cradle. Over the flue
  is the grate in the floor of the Assayer's hall. It is barred.
  - **A ring hangs beside the flue's upper step.** Struck, he is told "The grate over you is unbarred", and it is
    open. It stays open.
  - **Up the rung and through the hatch,** he is in the Assayer's hall, at its west end. The Assayer wakes.
  - **The stair out of the hall is near the hatch.** He can fight the Assayer or leave it.
- **From above nothing is changed:** the ring is under the grate. One who comes down the Vein still has to still
  the Assayer to go on.
- **Hob, met on the way up,** has his own lines in the Vein and in the Workings (they are in the sheet, for your
  yes). Once he is out of the Deep, Hob says what he always said.
- **To try:**
  1. After the throw, go back up the Hollow's roof, through the Shaft's floor and up the camp's stages.
  2. In the Vein, cross the lip and the cradle and climb the flue. Find the ring. Strike it.
  3. Come up into the Assayer's hall. Fight it, or go round it to the stair.
  4. Talk to Hob at the head of the Vein, and again in the Workings' bunkhouse.

**What is weaker than it should be**

- **The Assayer can be walked past.** Coming up, he is at the stair before it reaches him.
- **The ring is small and the Vein is dark.** It hangs a tile from the step, in the light of his own lamp, and
  nothing points at it. A player who misses it is under a grate with no way on.
- **The long way out has no keeper on it and no gift at the end of it.** It is long and dark, and that is all that
  makes it the hard way.
- **Hob in the Workings is in the bunkhouse,** which is off the way out. A player climbing straight up the shaft
  does not meet him there.
- **The Echo in the cradle comes at him from the way he came.** That is its rule. On a way that only goes on, it
  is no more than a push.
- **Not played by a person.**

- **Save: not moved.** Adds nothing new (the grate unbarred is kept with the gates he has raised).
- **Checked:** 581 automated checks, three new (`tests/side-throw.test.mjs`): the ring is under the grate,
  beside the step and within his blow; the grate is stone until the Assayer is stilled or the bar is off, and his
  save keeps it off; no other level has such a ring; played with the real motor from where the Shaft comes in,
  with the Assayer standing: he comes to the ring and not out, and with the bar off through the hall to the
  Vein's stair; from above, the lip is behind the Assayer as before; Hob's lines for one climbing out are used
  only then, and none of them says what to do.
  In the test browser: up from the Shaft at the lip, the ring, the grate unbarred, the rung, and through the
  hatch into the hall with the real keys.
- **Not checked:** not played by hand; the whole way out in one go; Hob's lines heard in the game.
- **Mistakes caught before it went out:**
  - **I had written in the sheet that no keeper had to fall on the long way.** That was not known: the Vein's
    grate shut it. The sheet was corrected before this build, and this build is what makes it so.

### Build 121: the throw

*Phase 18, part 1 (`docs/phase18-sheet.md`, and "As built: build 121" in it). Your decision of 26 Nov (roadmap, 0.26):
"the last keeper taunts him and throws him down to the very lowest part of the Deep. He climbs back up through it.
Until then it stays shut." Pictures: `docs/throw-build121.png`. No new drawings.*

**For the player**

- **When he first comes up into the Firmament,** after Mother Thorn, he has a second and a half there. Then a screen
  comes up, as the opening's does.
  - **Two figures on a ledge under the stars:** him, and his own shape, dark, a pale thread at its neck. "It had
    your walk."
  - **It says:** "You are the one that fell. Go back down. I will carry it." It walks up to him and throws him off.
  - **The fall again, quicker:** past the gardens, through the storm, past the spires of ice, past the halls of
    stone, into the water at the bottom of the mountain. "And through it. Down the Well, which has no floor. Under
    the mountain there was a light."
  - A press hurries it on, as with the opening.
- **He gets up beside the Hollow's water,** whole, with everything he has. He is told: "The bottom of the mountain.
  You were thrown down. The way out is up." The goal in the pause menu says the same.
- **Until he has climbed out:**
  - the Pithead's hatch in the Roots is nailed down, as it has been;
  - travel through the water offers only the Deep's own waters.
- **The first time he comes up into the climb,** he is told: "Out of the Deep. Its doors are open now, both ways."
  The hatch is open from then on.
- **A save that is already in the Firmament, or has seen the end, is not thrown.** The Deep is open to it at once.
- **Mended: a new game starts clean.** Before, anything the save kept that a blank save does not name came into the
  new game: gates raised, walls knocked down, fires lit, the cage sent down, that he had won.
- **To try:**
  1. Beat Mother Thorn and take the way up. Watch what happens at the Firmament's door.
  2. In the Hollow, open the pause menu and read the goal. Try the water: see where it offers to take you.
  3. Climb out, by either way. See what is said at the Pithead, and that the hatch is open.
  4. Start a new game after that. The hatch should be nailed down again.

**What is weaker than it should be**

- **It is a screen, not a scene.** The Fallen is not in the room with him; he is standing in the Firmament, and the
  picture changes.
- **The Fallen on the screen is his own drawing made dark.** It does not take hold of him: it walks up, there is a
  flash, and he is in the air.
- **It happens wherever he comes in.** By the sill he walks through, or by the way up from Mother Thorn's hall. Not
  at a place made for it.
- **Its lines are mine,** three of them new ("It had your walk"; what it says; "Under the mountain there was a
  light"). They want your yes.
- **The Deep was built to be gone down.** This build only checks that he is not shut in: the Hollow, the Great
  Shaft and the Workings go upward as they are, and the Vein does with the Assayer down. What it is like to climb,
  and Hob met in the wrong order, is the next build.
- **The banner in the Deep still says it is optional once he has climbed out.** It is, then.
- **Not played by a person.**

- **Save: not moved.** Adds three small things it remembers: that the throw is due, that it has happened, that he
  has climbed out.
- **Checked:** 578 automated checks, six new (`tests/side-throw.test.mjs`): a new game clears everything; the
  Deep's doors shut and open with their switch, and its ways up are never shut; the throw is set off only by
  coming up into the last region from the one under it; out of the Deep opens its doors, and no water of the climb
  is offered before; the screen is its own kind, plays the opening's fall, and ends; he lands on his feet beside
  the Hollow's water, and from there, with what he has by then and no keeper down, the way out above is come to
  (and through the Shaft and the Workings; the Vein with the Assayer down). One older check changed (where levels
  are loaded, now four places).
  In the test browser: from the Gardens up into the Firmament, the screen at nine moments, the landing, what he
  is told, the waters offered, out at the Pithead, the hatch open.
- **Not checked:** not played by hand; the walk through the sill into the Firmament by hand (the browser run went up
  by the other way); the sounds on the screen.
- **Mistakes caught before it went out:**
  - **A new game did not clear the save** (above). Found because the throw would have followed him into one.
  - **The last line was set over the light** and could not be read. It is set high now.

### Build 120: the Deep's far ends

*The last of the levels' edges (`docs/edges-sheet.md`, sections 7 to 11, and "As built: build 120"). Pictures:
`docs/workings-far-build120.png`, `docs/vein-far-build120.png`, `docs/flooded-far-build120.png`,
`docs/shaft-far-build120.png`, `docs/hollow-far-build120.png`. One thing new in the engine: a thing on a rail may need
an engine going before anything sends it.*

**For the player**

- **The Workings, west: the Winding-House.** Four screens.
  - **A doorway off the shaft's west stage,** just under where he comes down. Beyond it a landing, and a cage
    hanging level with it in a second compartment of the shaft. Its way down is sheer, fifty rows.
  - **A lever in the cage, and a winch on the landing.** Struck, they do nothing: "It does not move. Nothing is
    turning its drum."
  - **A doorway at the west end of the long level** comes to the foot of the same compartment: a second winch, and
    beside the cage's way, behind a wall of rock, the pumpmen's ladder-way. Eleven sills, one side and the other,
    three screens up. A chest and a board on the way.
  - **At its head, the winding-house,** in the row over the level: the engine, the banksman's board, a chest, a
    thread. Its windlass starts the engine.
  - **With the engine going,** a hatch in the winding-house floor is open: it drops him on to the landing by the
    cage. The lever sends the cage down, and back. Either winch calls it.
- **The Vein, east: the False Lode.** Four screens. Dark, as the Vein is.
  - **A doorway at the east end of the glitter.** A drift along the foot of a ring, a riser up its east side by
    five sills, back along the top, and down its west side by two long drops.
  - **At the foot of the west side, the guild's air-door,** lying shut across the riser. He is standing on it, a
    few rows over where he came in. Its windlass is on the sill over it.
  - **An Echo is in the ring.** Until the door is up, the only way out is back over his own way.
  - **A thread at the head of the east riser,** half-way round. A chest. Four of the guild's lamps. Two boards.
- **The Flooded Levels, west: the Drowned Stope.** Three screens, under water.
  - **A doorway in the chapel's west wall, at its floor.** Beyond it a chamber worked out and left: one screen up
    to its roof, two down to its foot, into the rock under the level.
  - **In its roof, a dome of air.** A dry ledge, the guild's lamp, a board, a windlass.
  - **At its foot, a grate across a strong-room** cut under a bench of stone. The windlass in the air raises it.
    The thread is inside.
- **The Great Shaft, west: the Adit.** Two screens. No lamp in it but his.
  - **A tunnel in the shaft's west wall,** level with the camp's stage half-way down. A wall of stacked stone
    stands in its mouth. Past it, the camp of the ones who stopped: cots, a kettle, a chest, a board.
  - **At the tunnel's far end, a raise:** a chimney up through the rock, twenty-eight rows, with one sill in it
    twelve rows up. From the sill the rest is more than he climbs.
  - **Knock the wall down** (three blows) and the shaft's cold comes through the tunnel and rises up the raise. He
    rides it to the room over: where they slept. A thread, and the last thing they chalked.
- **The Hollow, east: the Far Wall.** Four screens. The face is for one who has the grip.
  - **A doorway at the east end of the Hollow's floor,** past the last of the engine's rings. A chamber: a board,
    a chest, an Echo.
  - **Its east wall is rough rock,** from the floor up out of the lamp's reach. Three sills on the other side of
    the shaft to let go to, a lamp over each.
  - **At its head, in the row over the level:** a board, and a thread.
- **Mended:**
  - **The Lip's words** ("The Great Shaft. It goes down further than your lamp reaches") were said in the glitter,
    four screens over the Lip, to anyone who walked its east half. They are said on the lip now.
  - **A gate's windlass that has its own line says it.** It said the general one.
- **To try:**
  1. In the Workings, go west off the shaft's first stage. Stand in the cage and strike its lever.
  2. Go down to the long level, west to its end, and up the ladder-way. Start the engine. Drop through the hatch.
  3. Ride the cage down and up. Call it from the other end with a winch.
  4. In the Vein, go east from the glitter and round the ring. At the air-door, look for what raises it.
  5. In the Flooded Levels, go west from the chapel. Find the air; then find what the windlass did.
  6. In the Great Shaft, go in at the west stage half-way down. Try the raise. Then knock the wall down.
  7. In the Hollow, look at the Far Wall on the way to the Auger. Come back with the grip.

**What is weaker than it should be**

- **The cage is a quicker way, not a way to anything.** The shaft's stages still go from the pithead to the long
  level. What the engine opens is the winding-house's own way out.
- **The ladder-way is the same hop eleven times.**
- **With the cage at the foot, the landing is beside a drop of fifty rows.** A winch is there to call it. Nothing
  stops him walking off.
- **The air-door's windlass is beside the door.** It is on the inside, so the door cannot be raised from where he
  came in; but once he is there it is in front of him.
- **The Stope's working is the False Lode's the other way up:** a windlass in one place and a gate in another.
  Two in one build.
- **The Adit is not "glided into".** It is walked into from a stage.
- **The Adit's wall is the Cairns' wall,** drawn as the pilgrims' slates. It is not drawn as miners' stone.
- **The Far Wall is fifty-six rows of climbing and three places to rest.** The Echo at its foot follows him up
  it. How hard that is on a rough face has not been felt by a person.
- **The cage, the engine and the boards are painted by code,** as the rest of the far ends' things are.
- **Not played by a person.**

- **Save: not moved by hand.** The Workings, the Flooded Levels and the Great Shaft are each a column wider to the
  west; a save from before is moved by that as he comes into the level. Adds: the engine and the cage (kept with
  the gates he has raised and the rails he has sent).
- **Checked:** 572 automated checks, thirteen more than before: eleven new (in `tests/side-edges.test.mjs`),
  and two of the older per-level checks ("no traps, its gates open") that are now made for levels which have a room
  behind a gift for the first time. For each level: where its
  rooms are and how he comes into them, what each working is made of, and a play with the real motor. The Workings:
  the cage hangs at the head of a sheer way; nothing sends it until the engine is going, then fifty rows in its
  time and back; the hatch one way; the winding-house only by the ladder-way. The Vein: all the way round to the
  air-door with nothing turned and no way through it; with it up, out where he came in. The Flooded Levels: the air
  and its ledge; the strong-room only with the grate up. The Great Shaft: the raise's air is not there until the
  wall is down; the room over only then, and only with a wind to ride. The Hollow: the foot as he comes; the face
  only with the grip, sill by sill to the head. And for every one: from each place in it a way back. Older checks
  changed: the lists of things that are not creatures (the cage).
  In the test browser: every new room seen; the cage's lever struck with the engine stopped and going, and the
  cage ridden down, and called from the foot with him standing there (it comes whole); the air-door, the grate and
  the wall each seen before and after.
- **Not checked:** not played by hand; the cage called from the far end by hand; the swim down the Stope by hand;
  the ride up the raise by hand; the Far Wall climbed by hand; the sounds.
- **Mistakes caught before it went out:**
  - **The wall between the ladder-way and the cage hung in the air,** with a way round it at the top and at the
    bottom. The top is a hatch now, which is why the engine opens it.
  - **A wick-fly put in the cage's way rode down in the cage with him.** Taken out.
  - **Called from the far end, the cage would have come as a floor with nothing on it.** Its frame and its lever
    are a thing of their own, and things at rest far from him sleep where they are. The cage never sleeps now.
  - **The False Lode's thread hung in the air over the riser.** On the rock beside it now.
  - **The Far Wall was first set off the Source's east end.** That end is sealed behind the Source's own rough
    face: nothing comes to it. Off the circles now.
  - **Its face began six rows over the floor,** and he could not take hold of it. It is the chamber's east wall,
    from the floor.
  - **Its head could not be stood on:** he let go of the face and fell past the lip. The lip is a tile wider, and
    the face goes a little over it.
  - **From the Adit's upper room the only way down was a fall of twenty-eight rows.** One sill in the raise now.
  - **Three markers that keep the rock from growing were set inside new stone** (the Stope's ledge, the raise's
    sill).

### Build 119: the Firmament's far end

*The sixth of the levels' edges (`docs/edges-sheet.md`, section 6 and "As built: build 119"). Pictures:
`docs/firmament-far-build119.png`. Nothing new in the engine: the outermost is a thing that moves only once it is
wound, as the Roots' bucket-chain is (build 116).*

**For the player**

- **East, past the arms of the Orrery Wing: the Outer Ring.** Six screens, in one room. Open to anyone, as the wing
  is.
  - **A doorway at the east end of the arms' floor.** Beyond it a room three screens tall.
  - **A ring of two planets, turning.** A block of brass under its hub: from the block's top a planet at the foot
    of its turn is a short leap up.
  - **The ring passes two shelves:** one on the west wall, with a chest; one across the room, at the foot of a
    tower of brass thirty rows tall.
  - **Over that shelf, a second arm: the outermost.** Its planet stands at the foot of its turn. He can leap up on
    to it from the shelf. It does not move. A line is cut in the brass under it.
  - **Its key is in the winding room,** beside the drum: behind the Almanac, at the far end of the wing.
  - **Wound, the outermost goes round:** up the west side of its turn, over the top, and down past the tower's
    head. A thread, a chest, a window east, and a second line cut in brass.
- **To try:**
  1. In the Orrery Wing, ride the arms as before, and go on east along their floor.
  2. Get up on to the ring from the block. Ride it to each shelf.
  3. From the shelf across the room, get up on to the outermost. See that it stands.
  4. Still the Almanac, go into the winding room, and strike the key beside the drum.
  5. Go back to the ring. Ride the outermost to the tower's head.

**What is weaker than it should be**

- **The key is on the wing's own way.** He has to still the Almanac to finish the wing anyway, and the key is in
  the room behind it. A player who clears the wing first and finds the ring after has nothing to work out.
- **The room is the arms again, taller.** A hub, planets, a mounting block, one creature on the floor.
- **A fall costs only the climb.** The floor is twenty-nine rows under the ring. One brass ring rolls on it.
- **The outermost goes round for good once wound,** and at the top of its turn it is a level leap from the
  tower. There is nothing to time but the leap.
- **The key can be struck again, and stops it.** Nothing tells him why it has stopped but the words on the screen.
- **Not played by a person.**

- **Save: not moved.** The Firmament is two columns wider to the east, and nothing in it is anywhere else. Adds
  nothing new (the outermost's key is kept with the gates he has raised).
- **Checked:** 559 automated checks, three new (in `tests/side-edges.test.mjs`): where the room is and how he
  comes into it; the ring and the outermost (two planets opposite each other that go by the world's clock; a third
  that stands at the foot of its turn whatever the clock says, goes on from there when wound, up the west side
  first, never into the tower, and comes within a leap of the tower's head; the tower sheer for thirty rows; the
  key in the winding room, behind the Almanac; what is at each place); and played with the real motor: the ring
  and both shelves with nothing wound, the tower's head not with every gift he has, the tower's head wound, and
  from every place in the room a way back. One older check changed: the Orrery Wing's count of what moves in it.
  In the test browser: the room seen from the door, the block, both shelves and the tower's head; he stood on the
  outermost while it stood; the key struck and the outermost seen going; both lines said.
- **Not checked:** not played by hand; the ride on the outermost by hand; the sounds.
- **Mistakes caught before it went out:**
  - **The way in was first off the arms' high shelf,** which the map check cannot reach (it does not glide). In at
    the floor now.
  - **The outermost stood at the top of its turn, not the foot:** level with the tower's head and a leap from
    it. The check that plays it did not catch this (nothing reaches the planet up there). The check that says
    where it stands did.
  - **The windlass's own words were not said:** the line a windlass is given was never passed on to the game. It
    is now (this also gives the Roots' chain its own line, if it is ever given one).

### Build 118: the far ends of the Tempest and of the Gardens

*The fourth and fifth of the levels' edges (`docs/edges-sheet.md`, sections 4 and 5, and "As built: build 118" under
each). Pictures: `docs/tempest-far-build118.png`, `docs/gardens-far-build118.png`. Nothing new in the engine: the
rod's hook runs on the rail made for the Cloister's ladders, and the rest is each wing's own working.*

**For the player**

- **The Tempest, west, off the coils: the Great Rod.** Three screens.
  - **A doorway in the west wall of the coils, at their upper landing.** Beyond it a shaft with the Wrights' tallest
    rod up the back of it, and four landings of stone, one side and the other, fifteen rows apart.
  - **Between the landings, plates of iron.** The first flight is on one half of the iron and the second on the
    other. The current is in one half. A lever on each of the two lower landings sends it to the other.
  - **The last flight has no plates:** a crane's hook on a rail, left at the top. Its winch is on the landing below.
  - **At the head:** a window out of the cliff, a thread, a chest.
  - **The chest of thread at the coils' upper landing can be had now.** The landing was too close under the roof to
    stand on, since the wing was built.
- **The Tempest, east, past the stills: the Blue.** Two screens. For one who has the Seated's Wind, as the Eye is.
  - **A doorway in the east wall of the upper still,** a flue up, and a deck in clear sky.
  - **Four floors of cloud in the deck.** Each lets him down only when he stands still on it, into a cell he could
    not see from above. A door of cloud between each cell and the next; the last leads back to the flue.
  - **Two threads and a chest,** each in a cell. Five of the Hush, which move while he waits.
- **The Gardens, west, past the lock: the Rising Main.** Three screens.
  - **A doorway in the lock's west wall,** on to the top landing of a shaft. Three landings and a bed, a fall of
    water between each and the next, a stair of stone inside each fall.
  - **Running, a fall carries him down and cannot be climbed. Shut, its stair can.** Each fall's wheel is at its
    foot: he comes down with the water and opens his own way back.
  - **A fourth fall, at the bed, runs over the stair to a thread.** Its wheel is on the top landing, three falls up.
    A keeper of the sluices stands by it and turns it back.
  - **At the bed:** the mark cut over the channel where the water comes in, and a chest.
- **The Gardens, east, past his house: the Last House.** Two screens.
  - **A door in the east wall of his own house.** It is a kept door: shut while anything in the row of houses is
    out of its place.
  - **A house like the others,** and up a stair of three steps, its attic: a thread, a chest, the plate for a
    keeper's name, with no name cut in it.
- **To try:**
  1. In the Wreck of the Works, climb the coils past the cranes' door to the top, take the chest, and go on west.
  2. Climb the rod. Find which lever makes each flight safe, then the winch for the hook.
  3. In the Eye of the Storm, go east from the upper still, up on to the deck, and stand still on each floor of cloud.
  4. In the Aqueducts, open the lock, go west from its floor, and ride the falls down. Come back up.
  5. At the bottom, find what shuts the fall over the thread.
  6. In the Keepers' Houses, reach his house with nothing knocked over, and go on east.

**What is weaker than it should be**

- **The rod's two levers are each on the landing at the foot of the flight they make safe.** He passes both on the
  way up. Neither is somewhere he has to go and find.
- **The Blue's cells are a row.** Four floors, four cells, all the same size. What is in each is different; the
  cells are not.
- **The Rising Main's first three falls are the sluices again,** in a shaft. Only the fourth asks anything new.
- **The keeper at the top wheel undoes it while he is three falls below.** He has to strike it down first or be
  quick. Nothing tells him it has been turned back but the fall running again.
- **The Last House has no working of its own.** Its door is the houses' rule, and behind it is a room and an attic.
- **None of the four goes into the two rows of rock under the level,** and the Tempest and the Gardens have no row
  over them to go up into.
- **Not played by a person.**

- **Save: not moved by hand.** The Tempest and the Gardens are each a column wider to the west; a save from before
  is moved by that as he comes into the level. Adds nothing new (the hook is kept with the rails, the wheels with
  the Aqueducts' wheels).
- **Checked:** 556 automated checks, eight new (in `tests/side-edges.test.mjs`): where the rooms are and
  what the new columns are made of; the rod (the landings more than he climbs apart, the plates of each flight on
  one half, a lever under each, the hook and its winch, the window); the Blue (the floors of cloud and a cell under
  each, the doors between the cells, what is in each); the main (each fall with a stair in it and its wheel at its
  foot, the fourth fall's wheel on the top landing, the keepers); the last house (its kept door, the stair, the
  attic); and played with the real motor: from every place in the new rooms a way back. Older checks changed: the
  walk test's known spots move with a level that has grown; a floor of cloud counts as something a platform may
  hang from; the Aqueducts' and the Houses' counts of their own things.
  In the test browser: every new room seen; the top wheel struck and the fourth fall shut.
- **Not checked:** not played by hand; the hook ridden by hand; the Blue's floors stood on by hand; the sounds.
- **Mistakes caught before it went out:**
  - **The coils' upper landing could not be stood on** (four rows under the roof). Found because the rod's door is
    on it. Two rows lower now.
  - **The Last House was first given a gift as its gate,** and the check that no room opens before its gate failed:
    the houses have none. It has none.
  - **A chimney wall in the Last House cut its floor in two.** A stair of three steps now.
  - **The fourth fall's stair stood under a landing** with no room over it. The stair is three rows and the fall ten.
  - **A sill in the Blue's flue hung over the cut of the door.** It stands against the wall above the door now.

### Build 117: the Spires' far ends

*The third of the levels' edges (`docs/edges-sheet.md`, section 3 and "As built: build 117"). Pictures:
`docs/spires-far-build117.png`. Nothing new in the engine: both are made of what the two wings had.*

**For the player**

- **West, past his cairn: the Way Down.** Four screens. For one who has the Seated's Wind, as the Cairns are.
  - **A doorway in the west wall of his cairn's room.** Beyond it a cleft down the mountain's shoulder: four ledges,
    one side and the other, each seventeen rows under the last. He drops unhurt. He cannot climb back.
  - **Words scratched on stones on the way,** as in the Cairns: the reasons of those going down.
  - **At the bottom, the look-back:** a window in the mountain's west face, a thread, a chest, and a wall of slates.
  - **Knock the wall down** (three blows) and the wind rises the whole height of the cleft, back to his cairn. It is
    the only way back, and it is at the far end.
- **East, past the Seated: the Crevasse.** Four screens. Behind the last fire's ice in the Seated's hall.
  - **A passage to the head of a crack in the glacier,** ten tiles wide, three screens deep, sills of ice down it one
    side and the other.
  - **One fire, at its head.** What it melts is the plug in the crack's floor, forty rows below.
  - **Under the plug, the bottom:** one who sat down there, in the ice of a second fire; a thread in the same ice; a
    chest; a line scratched on a stone.
- **To try:**
  1. In the Cairns, go into his cairn's room as before, and on west through the new doorway.
  2. Drop down the cleft. Try to climb back.
  3. At the bottom, knock the wall down and ride the wind up.
  4. In the Glacier Galleries, free the Seated, melt the ice behind him, and go on east.
  5. Light the fire at the head of the crack, then go down and see what it did.

**What is weaker than it should be**

- **The cleft is the same drop four times.** Ledge, drop, ledge, drop. Two cairns stand on it and come after him
  when his back is turned; nothing else happens on the way.
- **Until the wall is down he is shut in at the bottom.** It cannot be missed (it is in the one room there) and
  takes three blows. But a player who goes down with one heart and meets a cairn has no way out but through.
- **The crevasse's fire is at the door.** He lights it before he knows what it is for. The sheet had a second fire
  at the bottom opening a ledge near the top; that one is not built.
- **Its west side is a ruled line.** The crack runs down inside the glacier's face at the level's east end, and the
  open sky beside it begins at a straight edge.
- **Neither goes into the two rows of rock under the level.** Both stop screens over them.
- **Not played by a person.**

- **Save: not moved by hand.** The Spires are a column wider to the west; a save from before is moved by that as he
  comes into the level. Adds nothing new (the wall is kept with the Cairns' other walls, the fires with the
  Galleries' other fires).
- **Checked:** 548 automated checks, four new (in `tests/side-edges.test.mjs`): where the four rooms are, and
  that the new column west is rock beside the field and the reasons; the cleft (each drop more than he can climb
  and no more than he takes unhurt, the wall, its wind dead and risen, nothing in the wind's way, the window); the
  crevasse (the one fire, the plug its only ice and forty rows from it, the sills a leap apart, the second fire, the
  drop through the plug); played with the real motor: down the cleft with the wall standing and no way back until it
  is down, and from every place in the new rooms a way back. Two older checks changed: the Cairns' count of its
  walls, and the list of platforms allowed to stand on nothing, which is now moved with a level that has grown.
  In the test browser: every new room seen, the wall knocked down, both fires lit, the plug gone.
- **Not checked:** not played by hand; the ride up the cleft by hand; the sounds.
- **Mistakes caught before it went out:**
  - **The coarse map check could not get out of the bottom of the crevasse** (the way back up went under the
    crack's floor). The plug is the west six tiles of the floor now, with a flue under it and two sills in the flue.
  - **A sill set under the plug hung in the air.** It stands against the flue's wall now.

### Build 116: the far ends of the Roots and of the Cloister

*The first two of the levels' edges (`docs/edges-sheet.md`, sections 1 and 2, and "As built: build 116" under each).
Pictures: `docs/roots-far-build116.png`, `docs/cloister-far-build116.png`. Two levels in one build: the Roots' first
full run found faults that changed its rooms, and by the time they were mended the Cloister was built too.*

**For the player**

- **West, past the weir: the Drawing-Place.** Nine screens.
  - **A doorway in the weir's west bank** looks into a well-shaft three screens tall. A chain of buckets hangs in
    it, still. There is no climbing it.
  - **Its windlass is at the foot,** in a sump reached from the floor of the cells' pit. In the sump's floor is the
    mouth of the Well itself.
  - **Turned, the buckets go up.** He rides them to **the loft** over the weir, where the water was tipped: a chest,
    the keepers' words on the wall, and a hole at the far end that drops him back into the weir.
  - **The Sounding:** down through the Well's mouth, three screens of water straight down into the new rock. For one
    who has the Seated's Wind. At the bottom: the lead of the keepers' line, a thread, a chest, a line on the wall.
- **East, past the niches: the Unsorted.** Four screens.
  - **A doorway at the head of the aisle's stair,** two rows up off its last step. Beyond it a pit three screens
    tall, heaped against its walls, and a pile in the middle of its floor with a scale's pan in the dip of it.
  - **The stack is in three:** a piece on the step he comes in by, a piece across the pit, a piece at the head of
    five tiers up the east wall. The slab is in the pit's floor and lifts only for all three.
  - **Two Tallymen** take the bones out of the pan again.
  - **Under the slab: the first tomb.** One tomb, a chest, a line. A ring on the slab's underside: struck from below
    it stays up, so he is not shut in.
  - **A thread** at the head of the tiers.
- **The keepers' words in the Drowned Galleries are said now.** The lines cut in the walls of the cup room and the
  store (builds 107 and 112) have never been shown: the code that says such words ran only in the Spires. It runs
  everywhere now.
- **The Cloister, west, past the copying hall: the Empty Shelves.** Five screens.
  - **A doorway in the hall's west wall at its floor.** Beyond it three screens of shelving with nothing on it, and
    two galleries, each too far over the last to climb to.
  - **Two ladders on rails,** each left at the wrong end. Struck, a ladder rolls to the other end and stays. The
    first is on the floor; the second hangs over the first gallery and cannot be come to until the first is sent.
  - **A cornice over each ladder where it was left,** so that the Seated's wind does not make them nothing.
  - **Up four steps of the wall to the binders' loft:** presses, covers with nothing in them, the ledger, a chest, a
    thread. A chest on a far shelf for one who can glide to it.
- **The Cloister, east, past the slag runs: the Cull.** Three screens.
  - **A doorway at the foot of the runs,** on to a landing two-thirds of the way up a pit of cracked bells. Steps
    of the wall go down to its floor.
  - **A casting crane:** a ladle hung from a rail that climbs across the pit to a landing ten rows higher on the far
    side, where it was left. **Its winch is on the pit's floor.** Struck, the ladle comes over. Standing on it, he
    strikes its chains and it carries him up and across.
  - **Two tongues hang in its way.** He has to crouch on the ladle. Touched, they ring: the far cell's shutter
    drops, the slag on the floor wakes, and the tongues swing and hurt.
  - **In the cell:** a thread.
- **To try:**
  1. From the weir's west bank, go through the new doorway and look at the shaft.
  2. Find the windlass (raise the cells' gate, cross the pit's floor at low water, go west).
  3. Ride a bucket up. Step off at the gallery, then at the loft.
  4. With the Seated's Wind: dive from the sump.
  5. In the Ossuary, climb the aisle's stair and go through the doorway at its head.
  6. Knock all three stacks into the pit. Watch the Tallymen. Go down through the slab.
  7. Stand by the plinth in the cup room. The keepers' line should be said.
  8. In the Scriptorium's copying hall, go west at the floor. Strike the ladder. Find the second.
  9. In the Bell-Foundry, go east at the foot of the slag runs. Go down, strike the winch, come back up, ride.

**What is weaker than it should be**

- **The windlass is on the way.** He has to find the sump, but once he is there the chain starts beside him. The
  sheet's rule is that the lever is not beside what it moves; here it is at the other end of the same thing.
- **The three stacks are nearly on one path.** The sheet had the third come to another way, from the niches' top
  niche. Two ways into one room leave the stone between them hanging in the air, which the map pass forbids. So
  there is one way in, and the third stack is a climb.
- **The ride has nothing in it.** No creature is in the shaft. Leeches on its walls would make it a ride to be
  defended; not built.
- **The loft is a flat room.** Two steps and some racks. The binders' loft is the same.
- **The tiers in the pit are eleven rows apart:** a second jump and his hands on the lip, five times. That is by the
  measure (`docs/map-pass-sheet.md`), but nothing else in the game asks it five times running. Every climb he must
  make to get back out of anywhere is seven rows or less.
- **The ladders are not hidden.** The sheet had each rail go out of sight, so that he had to find where a ladder
  went. Both are in one room and seen end to end. What is left of the working is the order of them.
- **The crane's winch is at the bottom of the same pit.** A way down, a blow, a way back up: it is far, but he
  knows where to go.
- **Riding the ladle upright costs a heart** (the tongues swing). Nothing but the low tips of the tongues tells him
  to crouch.
- **The Cull does not go down into the new rock,** as the sheet said it would. It is three screens beside the
  runs. The Cloister's use of the rows under it is still to come.
- **Stepping off the top bucket** has to be done before it goes over the wheel, or he falls the height of the shaft
  into the water. Not tried by hand: it may be too quick or too easy.
- **Neither far end has a fight,** as the sheet says, and it asks you whether they should.
- **Not played by a person.**

- **Save: not moved by hand.** The Roots are a column wider to the west; a save from before is moved by that as he
  comes into the level (build 115's `rebase`). Adds: the chain, kept with the gates (`G.gates`); which single
  stacks have gone over (`G.pans`, under the scale's name and `#`); where each level stands (`G.org`), now written
  into every save.
- **New in the engine:** a mover with a key, which goes only while its windlass is turned and keeps its own clock; the
  'chain' kind (one way at one pace, and in again at the foot); a scale's stack of one piece, each remembered by
  itself; a thing on a rail, which stands at one end until it is sent and rolls to the other (`G.rails`); words on a
  thing in the world said in every region, by the kind of thing.
- **Checked:** 544 automated checks, ten new (in `tests/side-edges.test.mjs`): for the Roots, where the six rooms are; the
  chain (still, started with no jump, at one pace, stopped and started again, kept in the save, the shaft sheer); the
  scale (one way in, the tiers, the slab only for all three, each stack its own, the ring, the save); played with
  the real motor: the loft only by the chain, the tomb only by all three stacks, and from every place in the new
  rooms a way back; a new game's save says where its level stands; the game moves a save wherever a level is made. For the Cloister: where its three rooms are; a
  thing on a rail (still, sent, one way with no jump, there, sent back, kept in the save; the ladder and the winch
  ask for it); each ladder and the crane left where it is no use and of use where it goes; played with the real
  motor and every gift: the loft only by both ladders, the far cell only by the crane, and a way back from
  everywhere. Seven older checks changed: five to count only their own winches, scales, shutters and relics; the
  coarse map check, which now knows a chain and a rail; the joins' check of how far a level was moved. In the test browser: every new room of both levels seen, the chain seen still and going,
  the slab seen up, each ladder sent, the ladle sent and ridden, the tongues rung and the shutter down, the labels
  and the ledger said; the game started on a save made as build 115 makes them, standing in the Roots: what it had
  found, broken and found for travel came up forty tiles east, where those things now are.
- **Not checked:** not played by hand; the ride by hand; the dive by hand; the sounds; a real save from an earlier
  build (the one tried was made for the test).
- **Mistakes caught before it went out:**
  - **He could drop into the tomb and not climb out** (the last sill was too close under the pit's floor for him to
    stand on). Found by asking, for every place in the new rooms, whether there is a way back. That check is kept.
  - **The pit's floor was a place he could not leave** in the first layout: its ledges overhung each other.
  - **Two doors into the pit left a slab of wall hanging between them.** One way in, now.
  - **Every climb out was too tall for the coarse map check,** which allows seven rows where I had built ten to
    twelve. The Roots' first full run failed on it (the loft "cut off", the pit and the tomb "places he cannot
    get out of"). The steps out of the pit, the tomb, the shelves and the Cull are seven rows or less now, each a
    single course of stone so that there is head-room under the next.
  - **With the Seated's wind the ladders and the crane could be passed by.** A cornice over each ladder's wrong
    end, and the Cull's far landing ten rows higher than its near one.
  - **A new game's save did not say where its level stood,** because the game is emptied after the level is made.
  - **A save standing in the Roots would not have been moved at all.** The level that is there as the game starts
    is made before the rest of the game is, and did not go by the place where a save is moved. Everything found in
    the Roots would have been forty tiles out. Found in the test browser, by starting the game on a save made as
    build 115 makes them; the same is now tried each time, and a check holds that no level is loaded anywhere that
    does not move the save.

### Build 115: every level lifted

*Your word, 27 Nov: "if possible, let's push every level up a bit, creating space for more at the base or above to
expand." (Roadmap, decision 0.36.) This is that, alone. The new rooms at the edges come in the builds after it.*

**For the player**

- **Nothing he can see or reach is changed.** Every level is where it was, with its rooms as they were.
- **Under each level there are now two rooms of solid rock.** They are for what is built next: a far end of a wing
  can go down two rooms without the level being moved again.
- **Over the levels with a roof of rock (the Roots, the Cloister, the five of the Deep) there is a room more of it.**
  The four under the sky have none: see the mistake below. They can grow upward when something is built there, and
  nothing has to move for that.
- **A save now follows its level.** It keeps where each level stood when it was written. If a level has grown west
  or down since, what the save holds there is moved by the difference as he comes into it. Until now each such
  move was written by hand, and one was missed (see "Save").
- **What is built past the wings is cut into the level after it is lifted,** so it can use the new rows. Nothing is
  built there yet.
- **The height readout in the corner** counts from the level's own floor, as before, and not from the new rock.
- **To try:**
  1. Load a save from before this build. Everything found, broken, lit and opened should be as it was left.
  2. Use the water to travel to a place found before this build.

**What is weaker than it should be**

- **It is room, not rooms.** Nothing is in the new space yet.
- **Every level is bigger to hold in memory** by three rooms' height across its whole width. Not measured on a phone.
- **Not played by a person.**

- **Save: moved.** Every level's places are 46 tiles higher. A save from before has what it found, broke, shut, lit
  and the waters it found for travel moved with them, once, as it is read (`winged` 5 to 6). The same change mends a
  fault from build 107: a water found for travel in the Roots before the Drowned Galleries was not moved then.
- **Checked:** 534 automated checks, two new (`tests/side-edges.test.mjs`: every room and mark is inside its
  level; a save's places follow a level by as far as it has grown, once), seven changed for the lift (rows named by
  number; the save). Every level opened in the test browser at its start, its lowest room and its highest: no
  errors (`docs/lift-build115.png`).
- **Mistakes caught before it went out:**
  - **A row of sky over the Spires and the Gardens joined places that are shut off from each other** (the air went
    over the tops of the walls beside the stone arch to the next region). The check for places he cannot leave
    found it on the first full run. The four levels under the sky have no row over them now.
  - **The Cracked Bell's reach was moved with the level,** though it is counted in its own room: it would have
    risen 46 tiles too far. Found by comparing every level before and after.
- **Not checked:** not played by hand; a real save from an earlier build (the check uses a made one).

### Build 114: the Pilgrims' Cairns' wind-breaks

*The second of the three wings' workings (`docs/bare-wings-sheet.md`, section 3 and "As built: build 114").*

**For the player** (he needs the Seated's Wind to come into the Cairns at all)

- **A thread on the head of the horn of rock** at the field's west end, over the way down. The air there is dead,
  and the horn is seventeen tiles sheer (`docs/cairns-windbreaks-build114.png`).
- **A wall of slates at the far end of the reasons,** where the way of stones ends. Three blows and it is down, for
  good. The wind goes through: back along the cave, and up the shaft to the horn's head.
- **A second wall on the scree's bank.** Down, its wind goes up the hole he fell through: the scree can be climbed.
- **To try:**
  1. On the field, look at the horn over the way down. Try to get up it.
  2. Go down, walk the way of stones to its end without turning, and knock the wall down.
  3. Go back and ride the wind up the shaft to the thread.
  4. In the scree, knock the wall on the bank down and glide up the hole.

**What is weaker than it should be**

- **Two walls, not three; no shared wind; no wind over the Turned.** Each for a reason given in the sheet's "as
  built". The sheet promised more than the place can hold: he climbs too well for most of it to need a wind.
- **Neither wall is on the way to the relic.** One is for a thread and one is a short way back. He can finish the
  wing and never touch either.
- **Nothing tells him the horn's wind and the far wall are one thing** but the words when it falls: "Somewhere
  behind it the air is rising."
- **Walking back along the way of stones** to use the wind means not turning round, again. That may be a good second
  use of the wing's rule, or a chore.
- **Not played by a person.**

- **Save: not moved.** Adds: the walls he has knocked down (`G.walls`).
- **Checked:** 532 automated checks, five new (in `tests/side-cairns.test.mjs`): where the walls and their winds
  are, and that the horn is too tall to climb; dead air behind a standing wall, rising air behind a fallen one, and
  the save; three blows; with the real motor and every gift, that the horn's head is not reached with the walls
  standing and is with them down; that the scree is climbed only with its wall down. In the test browser: both
  walls seen standing and fallen, the streaks of the wind seen where each rises.
- **Not checked:** not played by hand; the ride up the shaft by hand; the sounds.
- **Mistake caught before it went out:** the first three walls did nothing at all. The check that would have said
  so did not exist yet; I found it by counting the places he could reach, with walls and without, and getting the
  same number.
- **Underneath:** `src/side/regions/cairns.js` (the walls, the horn, the winds); `src/side/level.js` (`RULE.walls`;
  rising air that answers to a wall); `src/side/props.js` (its streaks shown only when it rises); `src/side/main.js`
  (the `windbreak` event).

### Build 113: the Ossuary's scales

*Your word, 27 Nov, of the three wings' sheets: "They all look great"; and "Next keep going". The first of the three
(`docs/bare-wings-sheet.md`, section 1 and "As built: build 113").*

**For the player** (he needs the Warden's hammer to come into the Ossuary at all)

- **The way to the Sexton's yard is shut by a grave-slab,** and so is the hole from the yard up to the count
  (`docs/ossuary-scales-build113.png`).
- **Each slab hangs on a scale whose pan is in another room.** The yard's pan is in the sorting room; the count's is
  in the niches. A chain goes up the wall beside each pan.
- **Stand in a pan and its slab goes up.** Step off and it comes down. So he can see what it does, and cannot use
  it alone.
- **Over each pan, on a ledge, is a stack of skulls.** Strike it and it goes over into the pan, and the slab stays up.
- **A Tallyman at a full pan takes the bones back,** one every two and a half seconds, and the slab comes down a
  third each time. Kill him, or be quick.
- **To try:**
  1. In the sorting room, stand in the pan on the low heap. Listen for the slab.
  2. Get up onto the shelf over it (from the tall heap) and strike the stack.
  3. Leave the Tallyman by the pan alive and watch what he does.
  4. Go up the niches: the way to the yard should be open. Find the count's pan on the way.

**What is weaker than it should be**

- **Two scales, not the three the sheet had.** The third had nowhere to be.
- **He cannot see the slab from the pan.** He hears it. The chain says there is one; nothing shows him which door.
- **The Tallyman is not seen carrying anything.** The bones are in the pan, then on the ledge.
- **Standing in the pan and running for the door is not possible** (the door is two rooms away), so his own weight
  only ever teaches. That is as the sheet meant, but it may feel like a trick that does nothing.
- **A stack can be knocked down before he has seen the slab it lifts.** Then he never learns what it did.
- **Not played by a person.**

- **Save: not moved.** Adds: what lies in each pan (`G.pans`). A save from before finds both slabs down.
- **Checked:** 527 automated checks, five new (`tests/side-scales.test.mjs`): where the slabs, pans and stacks
  are; that a slab rises by as much as lies in its pan; his own weight, and that it is not kept; the stack; the
  Tallyman; and, with the real motor, that the yard and the count are shut until their stacks are down and that one
  who plays it through opens both. In the test browser: both scales worked, both slabs seen down and up.
- **Not checked:** not played by hand; a Tallyman watched taking bones in the running game; the sounds.
- **The full run had one failure of 527,** and it was a check, not the game: the Drowned Galleries' count of its own
  gates had begun to see the Ossuary's two slabs. I narrowed that check and ran it again alone; I did not run all 527
  a second time.
- **Mistakes caught before it went out:** two more notes of mine in the middle of a line swallowed code (one in the
  drawing code, one in a test helper). The check that looks for that now reads the test helpers too, and found an
  older one there.
- **Underneath:** `src/side/regions/ossuary.js` (the pans, the stacks, the slabs); `src/side/level.js` (`RULE.pan`,
  `RULE.lift`, `setPan`, `liftOf`: a slab that is up by rows); `src/side/props.js`; `src/side/main.js` (the `pan`
  event).

### Build 112: the Drowned Galleries, the undercroft

*Your word, 27 Nov: "Next keep going." The last piece of the wing's sheet (`docs/drowned-sheet.md`, "As built: build
112").*

**For the player** (he needs the Seated's Wind: before that, only the hatch shows)

- **A slab in the hall's floor** with no chain to it. Until he has the wind there is nothing to do with it.
- **With the wind: dive in the hall's west pool.** A shaft in its floor goes down to the keepers' store: two screens
  under the hall, under water always, green lamps still lit, great jars along the floor
  (`docs/drowned-build112.png`).
- **A ring hangs under the hatch.** Strike it from below and the hatch lifts: the hall's floor is the way down
  after that.
- **In the store:** a thread, a chest, a line on the wall.
- **To try** (in Try a place, with the wind):
  1. In the hall, stand on the slab. Nothing.
  2. Dive in the west pool, down the shaft, into the store.
  3. Go under the hung wall and over the standing one, to the far bay.
  4. Swim up under the hatch and strike the ring. Go up through it.

**What is weaker than it should be**

- **Nothing lives in it.** It is rooms, a thread and a hatch. Four of the five drawings from build 111 are unused
  and any of them could go here.
- **It is small:** two screens, three bays. "The second half of the wing" in the sheet was more than this is.
- **He can only see it late:** the wind is the Spires' keeper's. A new player meets a slab he cannot explain for a
  long time. That may be good; I have not played it.
- **Not played by a person.**

- **Save: not moved.** Adds: the hatch, kept with the other gates.
- **Checked:** 522 automated checks, two new (the store is under water at low water and at high, is not come to
  without the wind and is with it, all three bays and its thread; the hatch is not lifted by one without the wind
  and is by one with it). In the test browser: the three bays seen, the hatch seen down and up, no errors.
- **Not checked:** not played by hand; the sounds.
- **Mistakes caught before it went out:** one sheet of water for the whole store lay over the rock of the hall's
  floor and showed through it; the ring hung higher than a swimmer under the hatch could be said to reach.
- **Also in this build:** the checks' player, when a gate goes up, plays again only the places near that gate and
  the water it held, not the whole region. The Roots' checks are about a third quicker for it.
- **Underneath:** `src/side/regions/drowned.js` (`keepstore`, the ring, the hatch); `src/side/props.js`;
  `src/side/main.js`; `tests/helpers/reach.mjs`.

### Build 111: the Drowned Galleries, the Squid in place of the Pike

*Your word, 27 Nov: "Maybe not fish for the water but some kind of water fiend or eldritch squid."*

**For the player**

- **The thing in the weir is the Squid** (`docs/drowned-build111.png`): long, violet, one pale blind eye. The pike is
  gone from the game.
- **The fight is the same.** Afloat at high water it comes at whatever is in its water and cannot be hurt; left on the
  bed at low water it can be struck, lashes at what is before its arms, and turns on what is behind it.
- **In Corwen's Annals:** the Squid, under the Roots, in the Pike's place.
- **To try:** the weir, as for build 110. Look at it on the bed at low water, and under you at high.

**What is weaker than it should be**

- **I chose it from five** (`docs/weir-fiend-candidates.png`) without asking which. The other four are kept as
  drawings: say if one of them should be the weir's instead.
- **It moves like a fish with arms.** It was a pike's fight first. A squid would more rightly reach with one long arm
  and pull; that is a different fight, and I have not built it.
- **Its name is plain** ("The Squid", as "The Pump" and "The Lock" are). If you want a name with more dread in it,
  give me one or ask for some.
- **One drawing bent,** as before: its arms sway, nothing else moves.
- **Not played by a person.**

- **Save: not moved.** A count of pikes killed, if anyone has one from build 110, is not carried to the Squid.
- **Checked:** 519 automated checks (the Pike's two, now the Squid's, and one line more: no fish in the weir).
  In the test browser: seen on the bed, turned, and afloat; a lash and a lunge each taking a heart; its name shown.
- **Not checked:** not played by hand; its death; its sound.
- **Underneath:** `assets/side/px_squid/` (new; `px_pike` removed); `src/side/regions/drowned.js`;
  `src/side/annals.js`; `src/audio/sfx.js`.

### Build 110: the Drowned Galleries, the Pike

*The fourth of the wing's builds (`docs/drowned-sheet.md`, "As built: build 110"). The wing now has its rooms, its
water, its gates, its creatures and its fight. What is left of the sheet is the undercroft.*

**For the player**

- **The Pike is in the weir** (`docs/drowned-build110.png`). At high water it is afloat, and bites whatever is in
  its water; a blow glances off it. As the water falls it is left lying on the bed, and then it can be struck.
- **On the bed it snaps at what is before its head,** after a warning, and turns on what is behind it. Get behind it.
- **Sills on the weir's banks:** two on each, down to the bed and back. Go down as the water falls; be up again
  before it bears the Pike.
- **In Corwen's Annals:** the Pike, under the Roots.
- **To try:**
  1. Come up into the weir. Stand on the bank and watch a whole rise and fall.
  2. Jump in at high water. It should flare and come at you. Get out.
  3. At low water go down the sills. Stand before its head: it snaps. Stand behind it: it turns.
  4. Kill it across two or three falls of the water. Sixteen blows.
  5. With it dead, cross the weir at low water on foot.

**What is weaker than it should be**

- **It has one drawing.** Its tail moves; its jaw does not open, and it does not thrash. The snap is read from the
  flare before it, not from the fish.
- **I do not know if eleven seconds a fall is the right length** for the fight. It is a guess until someone plays.
- **It comes back** each time he returns to the Roots, as the Sexton and the Turned do. A fight that stays won is a
  thing the game does not have yet for wings.
- **The weir can now be climbed out of at low water,** which build 107 said it could not. The sills are for the
  fight; they also make the room less of a wait.
- **Nothing is left when it dies** but shards. The cup room behind it is the prize.
- **Not played by a person.**

- **Save: not moved.**
- **Checked:** 519 automated checks, two new (afloat: a blow is turned, it warns and bites one in its water, it
  leaves one on the bank, it keeps to its pond; on the bed: a blow lands, it snaps before its head and turns on one
  behind, and one up on a sill is out of its reach). The weir's check now holds that each bank is climbed by its
  sills. In the test browser: seen on the bed and afloat, a snap and a bite each taking a heart, its name shown.
- **Not checked:** not played by hand; its death; its sound; the hammer, tooth, bow and thorns against it.
- **Underneath:** `assets/side/px_pike/` (new); `src/side/regions/drowned.js` (the Pike, the weir's sills);
  `src/side/annals.js`; `src/audio/sfx.js`.

### Build 109: the Drowned Galleries, the skimmer and the leeches

*Your word, 27 Nov, of the three skimmer drawings and the three wings' sheets: "They all look great." I took drawing
b. The third of the wing's builds (`docs/drowned-sheet.md`, "As built: build 109").*

**For the player**

- **The skimmer:** a long fly hanging over each of the hall's two pools (`docs/drowned-build109.png`). It warns, then
  spits a bead of water in a flat line at one who is on his feet and level with it. Two blows. It rises and falls
  with the water and never leaves its pool.
- **It leaves a swimmer alone,** and its bead goes over his head. Duck, and it goes over that too.
- **Two leeches** on the walls of the cells' flue.
- **In Corwen's Annals:** the Skimmer, under the Roots.
- **To try:**
  1. In the hall at low water, walk toward a pool. The skimmer should turn, flare, and spit. Duck it.
  2. Strike it: two blows. It is over water, so jump at it from the pool's edge.
  3. Float in the hall at high water under a skimmer. It should not spit at you.
  4. Climb the cells' flue past the two leeches.

**What is weaker than it should be**

- **The skimmers are dark** in the hall, which has no flame below high water. They read as shapes.
- **Reaching one to strike it is awkward:** it hangs over deep water. That may be right (it is a shooter to be got
  past), or it may only annoy. A play will say.
- **The leech is not new.** My sheet was wrong to call it unused: it is the Roots' wall-spitter. The ones here do what
  that creature does; nothing drops on him.
- **The skimmer's four frames are one drawing bent.** Good enough for wings; it will not do for a walker.
- **Not played by a person.**

- **Save: not moved.**
- **Checked:** 517 automated checks, two new (the skimmer keeps over its water at any height and within its
  pool; it warns and spits flat at one on his feet, and not at a swimmer or one far off). In the test browser: both
  skimmers seen at low water and at high, a bead seen passing over a swimmer, a leech seen in the flue, no errors.
- **Not checked:** not played by hand; its sound; a skimmer struck.
- **Mistake caught before it went out:** as first set it hung lower and spat at swimmers: three hits in seven
  seconds on one who could not dodge.
- **Underneath:** `assets/side/px_skimmer/` (new); `src/side/regions/drowned.js` (the skimmer and how it behaves);
  `src/side/annals.js`; `src/audio/sfx.js` (its voice).

### Build 108: the Drowned Galleries, the gates and their windlasses

*Your word, 26 Nov: "we should probably have gates and lever kind of functions that require the players to explore."
The second of the wing's four builds (`docs/drowned-sheet.md`, "As built: build 108").*

**For the player**

- **The hall is shut when he first comes:** a gate of stone stands in the foot of the stair. A chain goes up the wall
  from it to a ledge. On the ledge is a windlass. Strike it and the gate goes up (`docs/drowned-build108.png`).
- **Three gates, three windlasses, none beside its gate.** The hall's: on the ledge over it, which only the top of
  the rise reaches. The cells': on the hall's east gallery, across the hall. The culvert's grate: in the cup room, at
  the far end.
- **The cells' pit is dry until its gate is up,** however long he waits, and a wall hangs in the middle of it. With
  the gate up the water comes in, and carries him up the far side.
- **A gate let down again holds the water behind it.** Let the cells' gate down at high water and the pit stays full.
- **The drain from the pool is a dead end** under a grate in the hall's floor, until he has been all the way round.
- **To try:**
  1. Go down the stair. The way into the hall is shut. Find out why, and open it.
  2. In the hall, get to the west gallery and into the cells. Look down: a dry pit, and a wall across it.
  3. Wait a whole rise. The pit stays dry. Find its windlass.
  4. Drop into the pit, go under the hung wall, and wait for the water.
  5. From the pool, drop through the boards and follow the drain before you have opened its grate: a dead end.
  6. Strike a windlass twice. Its gate should come down again.

**What is weaker than it should be**

- **The chains do not run the whole way** from windlass to gate. A length of chain is painted by each, and a long
  one along the hall's wall. He may not read them as a trail.
- **Letting a gate down to hold water is real but hardly needed.** Only the cells' gate has water to hold, and with
  it up the pit fills every rise anyway. It saves a wait; it opens nothing new.
- **A windlass is struck, not worked:** it uses the Aqueducts' wheel's way of doing things, with its own picture.
- **The crossing of the pit can be beaten later** by the air dash or the glide. That is as meant, but I have not
  measured it.
- **Still no skimmer, leech or Pike,** and no undercroft.
- **Not played by a person.**

- **Save: not moved.** A save from build 107 finds every gate down, as a new game does. Adds: which gates are up,
  and the height each holds (`G.gates`).
- **Checked:** 515 automated checks, six new: the gates and where their windlasses are; what each gate shuts
  when it is down (played with the real motor at every height of the water); that the dry pit is not a trap; that
  the cells' water is held; that one who plays it through opens all three in their order. In the test browser: each
  windlass struck, its gate seen up and down, the pit seen dry, full, and held full at low water.
- **Not checked:** not played by hand; the sounds; a windlass struck with the hammer, the tooth, the bow or thorns.
- **Mistakes caught before it went out:** the windlass ledge was leapt to from the stair at low water; a ladder in
  the rock, and the wall between two doorways, each made a piece of rock that touched nothing; a note of mine in the
  middle of a line swallowed code again (in a test helper this time).
- **Underneath:** `src/side/rooms.js` (tile 23, a gate); `src/side/level.js` (`RULE.gates`, `RULE.held`,
  `setGates`, `LEVEL.gateOf`, water `held` by a gate); `src/side/props.js` (a gate drawn while it is down);
  `src/side/main.js` (the `windlass` event); `src/side/regions/drowned.js`; `tests/helpers/reach.mjs` (the checks'
  player turns windlasses and goes round again); `tests/helpers/platforms.mjs` (a gate is stone).

### Build 107: the Drowned Galleries, the rooms and the water

*Your word, 26 Nov: "Finish the wings", then "Each wing should feel interesting, contextual, complex. Also we should
probably have gates and lever kind of functions that require the players to explore", then "Go". The sheet is
`docs/drowned-sheet.md`. This is the first of its four builds: the rooms, and the water that breathes. The gates and
their windlasses are the next.*

**For the player**

- **A door in the pool room's west wall,** to his left when he wakes. Beyond it, twelve screens: the Drowned
  Galleries (`docs/drowned-build107.png`).
- **The water rises and falls,** slowly, the same every time (39 seconds for the whole of it). At low water the
  floors are dry. At high water it floats him up to what the floor cannot reach.
- **The rooms:** a broad stair down into the water; the keepers' great hall, with a gallery on either wall where high
  water comes to; a pit and a flue of cells; the weir's pond between two banks; a dry room behind it; and a drain
  under all of it that comes up through boards in the floor of the pool he woke in.
- **A relic, the Keepers' Cup:** your flask holds one more drink. A thread, on the hall's east gallery.
- **To try:**
  1. Wake, and go left instead of right. Go down the stair.
  2. In the hall at low water, look for a way up. There is none: wait for the water, and let it carry you to a gallery.
  3. Stand on the hall's floor as the water comes. It should lift you off your feet, and never drown you.
  4. West gallery, the cells: cross the pit on the water, then climb the flue.
  5. The weir: fall in at low water. You cannot climb out. Wait.
  6. In the hall, drop into the drain in the floor near the east end, and follow it. You should come up in the pool.
  7. Stand in the pool, at its west end, and press down and jump. You should drop through the boards.

**What is weaker than it should be**

- **It is bigger and deeper than the sheet said:** twelve screens for nine, and the water rises sixteen tiles for
  twelve. He climbs fourteen and a half with a second jump and his hands, so at twelve the water was not needed.
- **The cells need the water only to cross their pit.** The gate that makes the water matter there is the next build.
- **Nothing in it fights** but one lamprey. The skimmer, the leech and the Pike are not drawn: the way to draw
  creatures flat is still not proved (`docs/creatures-sheet.md`).
- **The Keepers' Cup does what the Carrier's Yoke does.** It wants your word, or an idea of its own.
- **The hall has no pier.** A column he can stand on in the middle of a floor either walls the hall in two or hangs
  in the air. The columns are painted behind him; the thread is on the east gallery.
- **The stair counts as rock in the air.** The drain runs under it from the hall to the pool, so in a side view the
  stair stands on the drain's roof and touches nothing else. It is the Roots' one counted exception to the map pass's
  rule (`tests/side-platforms.test.mjs`). A floor over a culvert is what a culvert is; say if it reads wrong.
- **Not played by a person.** The water's pace, above all, is a guess.

- **Save: moved.** The Roots are now 160 tiles east and 46 up, for the wing's four columns and two rows. Everything a
  save had found or broken in the Roots is moved with them, once (`winged` 4 to 5 in `src/side/state.js`).
- **Checked:** 509 automated checks, seven of them the wing's (`tests/side-drowned.test.mjs`): where it lies,
  the water's clock, that low water reaches the floor and nothing more, the thread, the culvert both ways, the
  relic, the save's move. The region's own checks now play the wing at five heights of the water, with the real
  motor and with the map check, and look for traps at each. A look in the test browser at every room, low and high.
- **Not checked:** not played by hand; the sounds; a phone.
- **Mistakes caught before it went out:** the galleries were climbed without the water (twice: at twelve tiles and
  at fifteen); the ledge over the hall's door was leapt to from the stair; the pier's "arch" did not go through it;
  flames burned under the water; a note of mine in the middle of a line hid the east gallery's crystal from the game;
  a cell's roof hung from nothing; seven older checks named places in the Roots by number and had to follow the move.
- **Underneath:** `src/side/regions/drowned.js` (new); `src/side/level.js` (a wing may add rows under its region;
  water with key `breath`, `BREATH`, `breath()`); `tests/helpers/reach.mjs` and `stuck.mjs` (rooms that breathe are
  played at five heights); `tests/side-level.test.mjs` (the map check: water between a low mark and a high).

### Build 106: the Deep in stone (its map pass). The map pass is done

*Your word, 26 Nov: "Let's finish the other levels as well." The Deep's five levels in one build, since it is shut
for now. Also in this build: the creatures pass's sheet (`docs/creatures-sheet.md`), nothing of it drawn yet.*

**For the player** (the Deep is shut: this is seen with Try a place)

- **The Deep climbs on its own stone** (`docs/deep-map-pass.png`, `docs/deep-map-pass-rooms.png`). The Workings: 47
  planks became 11. The Vein: 43 became 9. The Great Shaft: 9 became 3. The Hollow: 13 became 6. The Flooded Levels:
  one plank mended. Each level is under one plank a screen, and none is bare in the air.
  - **The Workings:** ledges of rock down the cage's shaft; sleeping shelves cut in the bunkhouse's rock; in the
    cistern a pillar hung from the roof, and ledges out of it and out of the wall by turns; the tally-house's
    benches are blocks of the floor.
  - **The Vein:** stone steps under every shaft of the knot, and under the ways out of the seal, the assay and the
    cradle; heaps of spoil in the glitter.
  - **The Great Shaft:** six of its eight stages are ledges of the shaft's own rock.
  - **The Hollow:** the roof's broken ledges come out of its walls.
- **Moved a little:** the cistern's barnacle and two crystals (a row lower, on stagings a row lower), its relic's
  chest (on a shelf of the wall), the bunkhouse's urns, the props' chest, crystals and urns in the glitter, an urn in
  the Hollow.

**What is weaker than it should be**

- **Two pieces of rock still hang in the air** in the Vein: the knot's two floors, cut through by their shafts.
- **Not played by a person,** and the Deep is the part of the game played least.
- **The creatures pass has only its sheet.** A first try at a flat bat came out as a standing figure: PixelLab's
  character tool draws things that stand. The creatures that fly or crawl need its picture tool, with the crawler as
  the style to match. That is the next piece of work.

- **Underneath:** `src/side/regions/workings.js`, `vein.js`, `flooded.js`, `shaft.js`, `hollow.js`.
  `tests/side-platforms.test.mjs` holds every level to its pass now; only the Spires is marked as over one a screen.
  `docs/creatures-sheet.md`, `docs/creatures-now.png`.
- **Save: not moved.**
- **Checked:** 501 checks pass, the whole suite (a first run of it had one failing: with only the wind, he could not
  get down the Great Shaft past stone that stood at the height of his head; three stages moved, one stays a plank,
  and the suite run again whole). Before that each level's own checks found these, each fixed: the knot's steps
  walled its galleries; the cistern's stones cut its water into basins, its pillar shut the way along the water's
  top, and its top ledge could not be left; the cage's stay stood in the way onto it; the Hollow's ledges overhung
  each other. In the test browser: the cage, the cistern, the bunkhouse, the knot, the Great Shaft, the Hollow's roof
  (dark, as the Deep is: the map picture shows the change better).

**To try**

1. Try a place: the Workings. Go down the cage's shaft, along the long level, and down into the cistern.
2. Cross the cistern's water to the quay.
3. Try a place: the Vein. Go down through the knot's three galleries and back up.
4. Read `docs/creatures-sheet.md`: is the order right, and are the seventeen I call "at an angle" the ones you mean?

### Build 105: the Firmament in stone (its map pass); hints, not instructions

*Your word, 26 Nov: "Let's finish the other levels as well"; and on Hob in the Vein: "I don't want any of the text to
be just an obvious giveaway of what the next section requires... I don't want you speaking in poems" (decision 0.27).*

**For the player**

- **The Firmament climbs on its own stone** (`docs/firmament-map-pass.png`, before and after;
  `docs/firmament-map-pass-rooms.png`). 68 planks became 30, in 40 screens, and none is bare in the air. The
  star-glass is untouched.
  - **The Long Stair:** its landings are flights of stone out of one wall and then the other.
  - **The forecourt and the transit:** a block and corbels up the tower's face.
  - **The meridian:** rock hung from the gnomon's floor beside the hole, a step out of its foot.
  - **The archive, the lens, the vigil, the gnomon, the aphelion, the ascension:** courses, lips and blocks of stone.
  - **The Orrery Wing:** two steps of stone and a rung in the hours; one rung off the top of the turn in the arms.
- **Five people's lines hint and no longer instruct** (the rule is: say it is tricky, say what to watch, never say
  what to do, never a poem):
  - Hob in the Vein: "The dark down here is not empty. I have never worked out what is in it." / "It keeps to where
    you have already been. Watch the lamps. They seem to matter to it." / "I do not turn back in the Vein. I could not
    tell you why."
  - Hob in the Flooded Levels: "There are holes in the walls along here, and something in them. I have not seen what
    sets it off. Watch how you pass." / "There is a lamp on the chapel altar that I never filled. It may be worth a
    look."
  - Ordric in the Cloister: "The doors in this house keep to the bell. I never learned its count. Listen to it."
  - Ordric in the Spires: "The wind on the open faces is not steady. Something in it comes and goes. Watch it a
    while."
  - Ordric in the Tempest: "The air goes up in places here."
- **Moved a little:** the Long Stair's chest (on the first flight), a crystal in the forecourt and one in the transit,
  an urn in the vigil, a lamp in the hours, the meridian's chest (a row lower).

**What is weaker than it should be**

- **The orrery's step up to Corwen's cell is still a plank** (over the floor now, not in the air): stone there made a
  low place over the way in.
- **Other people's lines were not all reread against the new rule.** I changed the five that told him what to do.
  Mirel's on urns and threads explain how the game works, which is a different thing; say if you want those gone too.
- **Not played by a person.**

- **Underneath:** `src/side/seams.js` (the stair's foot, the flights), `src/side/regions/firmament.js`,
  `src/side/regions/orrery.js`, `src/side/talk.js` (the lines). `tests/side-platforms.test.mjs` holds the Firmament to
  its pass.
- **Save: not moved.**
- **Checked:** 496 checks. The whole suite once with one failing: a note I wrote in the middle of a line in the vigil
  had swallowed the code that walls up its shelf (the check for exactly that caught it). Mended, and that check, the
  Firmament's own (real motor, map, pockets, low places) and the checks of things standing in rock run again: all
  pass. Before the suite the Firmament's own checks found: the orrery's way in with no foothold under its one clear
  column; the vigil's step blocking its hall; four low places under new stone. In the test browser: the Long Stair,
  the forecourt, the meridian, the transit, the archive, the hours.

**To try**

1. Try a place: the Firmament. Climb the Long Stair, then the tower's face from the forecourt into the orrery.
2. Cross the meridian and go up into the gnomon by the hung rock.
3. Talk to Ordric in the Cloister, the Spires and the Tempest: do his lines point without telling?

### Build 104: the Gardens in stone (its map pass)

*Your word, 26 Nov: "Let's do the gardens pass." Also written down from the same message: when the Deep opens, what a
hint is, the great puzzle, creatures, keepers, the Spires' ladders (roadmap, decisions 0.26 to 0.31).*

**For the player**

- **The Gardens climbs on its own stone** (`docs/gardens-map-pass.png`, before and after;
  `docs/gardens-map-pass-rooms.png`). 117 planks became 46, in 47 screens, and none is bare in the air.
  - **The Breach:** courses of the broken wall stand out of either side, one and then the other, up to the hole.
  - **The wellspring:** the blooms throw him onto shelves of the well's own stone.
  - **The terraces:** the terrace the first bloom throws him to runs out of the cliff; it hung in the air.
  - **The Aqueducts:** a block of stone in each of the sluices' falls; stone at the arches' east end.
  - **The Keepers' Houses:** a stoop of stone at the lane's gate, a mounting block before the second house, a stone
    stair in the long hall, a block on each floor of each house.
- **New: three blooms under ways choked with thorn.** On the arbor's walk and the wellspring's west shelf; the
  brambles' middle bloom is two tiles east. Each throws him up under a hole full of thorn. When Mother Thorn falls
  the thorn withers and the same bloom throws him up into it: these are the quick ways, which were ladders of planks.
- **Moved a little:** the Breach's chest (on a course of the wall), the sluices' chest, the spill's urn, a thornback
  and a toad in the sundial, a lasher, an urn and a crystal in the arbor, two house fronts in the lane.

**What is weaker than it should be**

- **The blooms on the arbor's walk and the wellspring's shelf are on the way he walks:** he is thrown up if he steps
  on one. That is how the brambles already play; say if it is a nuisance here.
- **Seven pieces of rock still hang in the air:** three terraces of the hanging gardens and the aqueduct's four spans
  (on painted piers). See the sheet.
- **Under one a screen by one** (46 in 47).
- **Not played by a person.**

- **Underneath:** `src/side/seams.js` (the wall's foot, the Breach, the storm beds; Mother Thorn's rule, which builds
  the quick ways), `src/side/regions/gardens.js`, `src/side/regions/aqueducts.js`, `src/side/regions/houses.js`.
  `tests/side-platforms.test.mjs` holds the Gardens to its pass; `tests/side-walk.test.mjs`: the door to Corwen's nook
  is a tile wider in its list. `docs/roadmap.md`: decisions 0.26 to 0.31.
- **Save: not moved.**
- **Checked:** 495 checks pass, the whole suite at once. Before it, the Gardens' own checks found these, each fixed:
  a pocket in the Breach under its first course; a pocket in the spill between two steps; the arches' east stair
  one row short under the deck (which left the beds with no way back up for one who cannot cross the spans); eight
  low places under new stone. The quick ways are played with the real motor, fallen and standing. In the test
  browser: the Breach, the wellspring, the arbor, the lane, the sluices, the terraces.

**To try**

1. Try a place: the Gardens. Climb the Breach, then the wellspring.
2. Walk the arbor: step on the new bloom and look up. Is it a hint, or a nuisance?
3. Go through the Aqueducts down to the beds and back up to the channel at its east end.
4. In the Keepers' Houses, go up into each house from the lane.

### Build 103: the Tempest in stone (its map pass)

*Your word, 24 Nov: "Next", after the Spires. The map pass for the Tempest, its two wings and the Last Hut.*

**For the player**

- **The Tempest climbs on its own stone** (`docs/tempest-map-pass.png`, before and after;
  `docs/tempest-map-pass-rooms.png`). 72 planks became 50, in 51 screens, and none is bare in the air.
  - **The Last Hut:** its loft is shelves out of the hut's walls, side by side up to the door; the cellar's hatch is
    an open hole onto its rung.
  - **The lee slope:** the terraces reach each other; no steps between them.
  - **The landing, the masthead, the watch:** a shelf of the wall, blocks of the floor, ladders against stone.
  - **The anchorage:** a stub of the mountain's face with a deck of planks out from it. The way down is through the
    planks by the stub, onto a new lip of the cliff below.
  - **Ladders** in the path, the cranes and the still have stone sides.
- **Everything found is where it was,** or a step from it: the anchorage's thread is at the deck's end; the hut's
  chest and urn are on the bunk shelf; a crystal is on the masthead's block and one on the path's step.

**What is weaker than it should be**

- **Seven pieces of rock still hang in the air:** the crossing's three pillars over the old deck, the stacks' first
  pillar, and the cranes' floor and piers, held by the Wreck's iron (see the sheet).
- **The anchorage's way down is a drop of fourteen tiles** onto the cliff's lip, as it was onto the plank.
- **Not played by a person.** Every place is reached in the checks, by the real motor and by the map check.

- **Underneath:** `src/side/seams.js` (the path, the hut, the lee slope), `src/side/regions/tempest.js` (landing,
  rigging, anchorage, watch, masthead), `src/side/regions/works.js` (the cranes), `src/side/regions/eye.js` (the
  still). `tests/side-platforms.test.mjs` holds the Tempest to its pass (under one a screen, a reason for each); a
  rope bridge may end within three tiles of rock (the gantry's). `tests/side-walk.test.mjs`: the door to Corwen's nook
  is a tile wider in its list.
- **Save: not moved.**
- **Checked:** 494 checks pass, the whole suite at once. Before it, the Tempest's own checks found five faults on the
  way, each fixed: the anchorage first shut him in, then had its way down under rock; the path's step closed the
  lamp-room's mouth; a wear hump cut off the path's ladder; the masthead's last jump crossed the roof. In the test
  browser: the hut, the lee slope, the masthead, the anchorage, the landing, the watch.

**To try**

1. Try a place: the Tempest. Climb the Last Hut's loft, and the lee slope.
2. Ride the rising air up to the anchorage, take the thread, and get back down.
3. Climb the masthead to the Thunderhead's stage.

### Build 102: the Spires in stone (its map pass)

*Your word, 24 Nov: "Go", after the Cloister. The map pass for the Spires, its two wings and its passage.*

**For the player**

- **The Spires climbs more on its own stone** (`docs/spires-map-pass.png`, before and after;
  `docs/spires-map-pass-rooms.png`). 116 planks became 90, and none is bare in the air: a rung, a step off a wall, a
  staging with ground under it, a board of a rope bridge, or the Wyrm's slab.
  - **The road up from the gate:** shelves out of the face, one side then the other, in place of planks in the air.
  - **The chimney, the hollow, the eyrie:** a boulder, blocks of the floor, a shelf of the wall, rock hung from the
    eyrie's roof beside the hole with a step out of its foot.
  - **Eight planks too low to walk under** (the mouth, the nest, the scree, the ice cave, two in the reasons, the hollow, the
    eyrie) are blocks of the ground.
  - **The teeth:** the sill runs out as rock, and a ridge joins the needle's top to the tooth.
  - **Ladders** in the gate, the Seated's room, the deep ice, the reasons and the Turned have stone sides; the deep
    ice's lowest three rungs are stones.
- **Everything found is where it was,** or a row from it: the gatestair's pilgrim, stele and urn (and the Tempest's
  sweeper on the same stair) are a row down onto its new floor; a wraith in the eyrie and one in the chimney moved out
  of stone.

**What is weaker than it should be**

- **It is not under one plank a screen** (90 in 56). What is left is mostly ladders in the clefts between the towers,
  and the two rope bridges. Widening the clefts for stone stairs, or counting a ladder as one thing, is your call.
- **Three pieces of rock still hang in the air:** the needle's foot (the way into its cleft goes under it), the
  eyrie's roof east of its hole (held by the Wyrm's seal until it falls), and the rock adrift that holds a thread.
- **Not played by a person.** Every place is reached in the checks, by the real motor and by the map check.

- **Underneath:** `src/side/level.js` (the saddle, spire, nest, mouth, hollow, chimney, ice cave, teeth, eyrie, crown),
  `src/side/seams.js` (the gate, road, gatestair and the Tempest's swept flight, which share a shape),
  `src/side/regions/glacier.js` (the deep ice, the Seated), `src/side/regions/cairns.js` (the reasons, the Turned,
  the scree), `src/side/rooms.js` (`keepOver`, `flue`, `stone`: a staging made a step of the ground).
  `tests/side-platforms.test.mjs` holds the Spires to 90 and to a reason for each; a rope bridge (boards in a row, no
  gap over three, rock at both ends) and the Wyrm's slab are named in it.
- **Save: not moved.**
- **Checked:** 493 checks pass (the whole suite once with two failing: a wraith began inside the eyrie's roof, and
  the gatestair's urn stood a row over its new floor; moved, and those checks run again, with the map check for the
  Spires and the Tempest). In the test browser: the road, the eyrie, the teeth, the hollow, the nest, the mouth.

**To try**

1. Try a place: the Spires. Climb the road from the gate, and the chimney and hollow up to the ropeway.
2. Climb the eyrie to the crown. Does the hung rock by the hole read as the roof's own?
3. Tell me whether the ladders in the clefts are fine as they are, or should become stone stairs.

### Build 101: the Cloister in stone (its map pass)

*Your word, 24 Nov: "Do the platform replacement idea, remember?" The map pass (`docs/map-pass-sheet.md`), done for
the Roots in build 76 and judged good, now for the Cloister, its two wings and its passage.*

**For the player**

- **The Cloister climbs on its own stone** (`docs/cloister-map-pass.png`, before and after;
  `docs/cloister-map-pass-rooms.png`). 122 planks became 49, and none is in the air: what is left is a rung in a flue,
  a step off a wall, or a staging with ground under it.
  - **The Scriptorium's hall:** the copyists' tiers are corbels out of its walls and pillars, the desks on them; a
    short ladder up through the roof.
  - **The belfry:** a boulder at the foot, Mirel's rock, then shelves out of one wall and the other, three screens up.
  - **The founders' passage, the nave, the cloister walk, the library, the chapel, the bell-rope room, the casting
    floor:** shelves, tombs, a plinth, steps hung from the vaulting, in place of planks.
  - **The pit, where the Cracked Bell rolls:** only the lowest steps up each wall changed; its floor did not.
- **Everything found is where it was,** or a step from it: the belfry's thread is a row lower, the nave's chest and a
  crystal are on the plinth and a tomb, the cloister walk's chest on its step. Some creatures and lamps moved a few
  tiles out of the new stone.
- **The nave's west door is a row lower** (Corwen's gallery over it rests on the wall).

**What is weaker than it should be**

- **Two pieces of rock still hang in the air:** the pit's two brackets the tongues swing from (they shape the Bell's
  fight; see the sheet).
- **Coming down is slower,** as in the Roots: he walks off shelves where he dropped through planks.
- **Not played by a person.** Every place is reached in the checks, both by the real motor and by the map check.

- **Underneath:** `src/side/level.js` (belfry, stairwell, nave, library, cloister walk, chapel), `src/side/seams.js`
  (the crypt's foot, the founders' passage, the lower flights), `src/side/regions/scriptorium.js` (the hall),
  `src/side/regions/foundry.js` (bell-rope room, casting floor, slag runs, pit), `src/side/regions/refectory.js` (the
  ladder's stone side), `src/side/rooms.js` (`corbel`: a shelf out of any upright rock). `tests/side-platforms.test.mjs`
  holds the Cloister to what the pass left.
- **Save: not moved.**
- **Checked:** 492 checks pass (the whole suite once with one failing: an acolyte and a wisp began with their bodies
  in the new stone; moved, and their check run again). In the test browser: the hall, the belfry, the nave, the
  cloister walk.

**To try**

1. Try a place: the Cloister. Climb the belfry and the Scriptorium's hall. Does each room have a shape now?
2. Note anywhere you bump your head on stone, or a jump that feels too far.
3. Compare with the Roots: do the two now feel like one mountain?

### Build 100: the Wyrm's faces

*Your word, 24 Nov: "Solid stuff. Keep the work and apply", to `docs/wyrm-faces.png`: you had asked whether its face
changes (it did not), and that none of the faces opened or shut its mouth.*

**For the player**

- **Its mouth shuts.** While its jaw is closed (flying, circling) its head is a drawing of its own with the mouth shut
  and the fangs locked; as the mouth opens, the jaw swings down from it, as before. Until now, "shut" still showed
  the inside of its mouth.
- **Its face changes** (`docs/wyrm-faces-in-game.png`), shut or open:
  - **a wince**, its eye screwed shut, for a moment each time it is hit (by his blade or by its own shard sent back);
  - **dazed**, its eye half shut, while its head is caught in the ice;
  - **angry**, a narrowed red eye under a spiked brow, from half health.
- **It draws breath with a glow:** the cold rises in its head, brighter and brighter, before the frost breath.
- Far off, on its peak and crossing the sky, its mouth is shut too, opening for its cry.

**What is weaker than it should be**

- **Its snout is a little rounder shut than open**, so it changes a little as the mouth opens.
- **The faces are small in the fight** (the camera follows him, and its head is often at the edge of the view).

- **Underneath:** `assets/side/wyrm/head[_shut][_angry|_wince|_dazed].png` and `head_shut_n.png`, made by
  `tools/wyrm-faces.py` (new) from what PixelLab drew (`docs/wyrm-looks/faces/`); `src/side/wyrm.js` (`faceOf`,
  `showHead`, `B.wince`, `breathe`, `B.face`). A check in `tests/side-wyrm.test.mjs`.
- **Save: not moved.**
- **Checked:** 491 checks pass. In the test browser: drawing breath, dazed and wincing in the slab, angry from half
  health; through a stretch of the fight its head showed its own face, the shut mouth, and dazed, shut and open.

**To try**

1. Watch its head as it circles (mouth shut) and as it rears (mouth open).
2. Hit it while it is stuck, and look for the wince.
3. Past half health, look for the red eye.

### Build 99: the Wyrm from the far peak

*Your word, 24 Nov: "Second is great": look B of the pieces (`docs/wyrm-looks.png`). With it the rest of
`docs/wyrm-sheet.md`: its coming from the far peak, and its sounds. The sheet is done.*

**For the player**

- **Its new look** (`docs/wyrm-new-look.png`): the horned, frilled head PixelLab drew, with a jaw that opens and
  shuts; a body of long scaled rings with a ridge of ice along the back; a tail ending in a scythe of ice. All a quarter
  larger than its pictures, so its head is bigger than he is. Its head is a little larger to hit and to be hit by.
- **It is seen before the fight** (`docs/wyrm-peak.png`). From the eyrie and the span, the last rooms before the
  summit, it lies coiled on a far peak high in the sky, and lifts its head when he comes into view.
- **Its coming starts from that peak:** it cries, leaves the peak with its coil unwinding behind it, and crosses the
  sky toward him, growing, for three seconds (it was a second and a half), then comes in past him as before.
- **Every piece of its ice has a sound:** its in-breath; the breath, a long hiss of wind and grit; a shard leaving its
  jaw, a glassy ring; a shard landing, a crack and splinters; spikes grinding up out of the ground; and its wings, a
  rush of air that goes across the room from the side it comes in by to the side it leaves by.

**What is weaker than it should be**

- **The peak is only where the sky shows:** it is drawn high in the middle of the view, which is open sky in the
  eyrie and the span from where he walks; stand at the far ends of the eyrie and the rock may hide it.
- **The sounds are made by rule** (noise and tones, `tools/ice-sounds.py`), not recorded. Say if any is wrong.
- **Still not fought by hand.**

- **Underneath:** `assets/side/wyrm/` (look B and their normal maps, from `docs/wyrm-looks/b/`),
  `src/side/wyrm.js` (`K`, `jawAt`, `HEAD_C`/`EYE`/`MOUTH`; `PERCH`, the coil and the crag; `RISE` and its tracks a
  second and a half later; the sounds), `src/audio/sfx.js` (six sounds, and a sound that moves across: `pan`),
  `tools/ice-sounds.py` (new), `tools/wyrm-parts.py` (new), `tools/boss-parts.py` (no longer draws the Wyrm),
  `assets/audio/sfx/` and its manifest (six recordings). Three checks in `tests/side-wyrm.test.mjs`.
- **Save: not moved.**
- **Checked:** 490 checks pass. In the test browser: on its peak from the eyrie (it lifted its head) and the span;
  its coming from the summit, from the peak to the roar; the frost, a plunge into the slab and the shards in the new look.

**To try**

1. Climb through the eyrie and the span and look up for it on its peak.
2. Step onto the summit and watch it come.
3. Fight it with the sound on, and say whether each sound is right.

### Build 98: all six weapons, to try

*Your word, 24 Nov: "Can you give me a mode that starts with the 6 weapons? Another part of the dev tools."*

**For the player**

- **Try a place** (on the title) has a switch at its top: **Weapons: what you would have by then / all six.** With
  all six, any region or moment he tries starts with the sword, the hammer, the clapper, the tooth, the bow and the
  thorns; the swap key goes round them in that order (`docs/try-all-weapons.png`). The banner as he starts says so.
- As with every try, nothing is saved and your own save is not touched. The switch stays as you left it until the
  page is closed.

- **Underneath:** `main.js` (`TRYING.all`, `ALL_ARMS`; `tryMenu`, `tryStart`).
- **Save: not moved.**
- **Checked:** 487 checks pass. In the test browser: the switch turned to all six; the Roots tried; he had the
  five besides the sword, and the swap went round all six.

**To try**

1. Title, Try a place, turn the switch to all six, and pick a region. Swap through them on its first creatures.

### Build 97: the Rime Wyrm rebuilt (the stage and the attacks)

*Your word, 24 Nov: "Great instincts, do it", to `docs/wyrm-sheet.md` as written: three levels and a gap, all five
attacks, a fall into the gap costing one heart, new pieces for its puppet. This build is the stage and the attacks,
with the pieces it has now. The far peak, the sounds and the new pieces are build 99.*

**For the player**

- **The summit is the broken pass** (`docs/wyrm-stage.png`): the pass, with the gap he came up by in its middle; a
  shelf at each horn and one each side of the gap; a slab high over the gap. While the Wyrm fights, **the gap is
  cloud.** A fall into it costs a heart and puts him back on the pass beside it.
- **Its five attacks** (`docs/wyrm-attacks.png`), each taking one level from him:
  - **Frost breath.** It hangs at the end of the hall he is at and draws breath, snow streaming into its jaws (0.8 s).
    Then frost along the whole pass for three seconds. Be on a shelf or the slab. **Its head can be cut while it
    breathes,** from the shelves.
  - **The pass.** It flies out of the hall. A line of driven snow shows the level it will come along (one second, less
    from half health), usually his own. Then it comes through the hall along it, the whole width. Be on another level.
  - **Shards.** It rears over him, three motes in its jaws, then spits three shards of ice at him, one after another.
    Each cracks where it lands and leaves a spike there a second. A shelf or the slab over him takes them. **Cut a
    shard, or hold the guard against it, and it goes back at its head,** for two.
  - **The plunge** (kept). Its head goes into the first thing under it: the slab, a shelf or the pass. Stuck there, it
    can be cut, as before. From half health, a plunge onto the pass throws up spikes, as before.
  - **Up through the gap** (from half health). It dives into the cloud; the cloud boils; it comes straight up out of
    the gap, and the blast catches anyone at its edges.
- **From half health** the wind blows along the pass, toward the gap, between its attacks; and a breath is followed at
  once by a pass. Never the same attack twice running.
- **The sweep along the floor and the falling icicles are gone.**
- **The camera sits lower in its hall,** so the keeper's bar is under the pass, not over it.

**What is weaker than it should be**

- **It looks as it did.** The new head, rings and tail are next, for your approval first.
- **Its new attacks make the sounds it had:** the crack, the whoosh, the gust. Sounds of their own are build 99.
- **Not played through by hand.** The fight is run in the checks and each attack was forced and watched in the test
  browser; no one has fought it from the start.

- **Underneath:** `src/side/wyrm.js` (the fight rewritten: `frost`, `pass`, `shard`, `aim`/`dive`/`stuck`, `up`; the
  gap and its cloud, `cleft()` cutting the seal's top row while it fights; `floorUnder`, `clearTo`; a shard sent back
  by a cut, `B.strike`, or by the guard), `level.js` (`crown`: four shelves and the slab), `main.js` (a keeper may
  give the camera its own box, `BOSS.view`). `tests/side-wyrm.test.mjs` (new: the fight run in node, its pictures sent
  to a stand-in for three.js).
- **Save: not moved.**
- **Checked:** 487 checks pass (the whole suite once with one failing: the Spires' budget of platforms in the air, three over from the hall's two new shelves and its slab. They are in the air by design, so the budget is raised by those three, with the reason beside it, and its file run again). In the test browser: each attack forced and photographed; frost on the pass hurt
  him and not on the shelf; a pass along his level; the shards hurt him and left a spike; a plunge stuck in the slab;
  up through the gap hurt him at its edge; a fall cost a heart; the wind carried him two metres in a second.

**To try**

1. Climb to the summit and fight it. Use the shelves and the slab.
2. While it breathes, get onto a shelf near its head and cut it.
3. Cut a shard, or hold the guard with the sword, as it comes.
4. From half health: stand on the pass and feel the wind; stay off the gap's edges when the cloud boils.
5. Say how long it took, and how many times it killed you.

### Build 96: the weapon on his back

*Your word, 24 Nov: "Yes, all of that sounds cool. Do it." The six pictures of him with each weapon slung
(`docs/weapon-on-back.png`), and from each the drawings for where both his hands are busy.*

**For the player**

- **When he climbs onto an edge, gets up after a fall, or takes a gift,** whatever weapon he carries is on his back
  and his hands are empty (`docs/weapon-on-back-in-game.png`). Until now he held his sword through all of those,
  whatever was in his hand.
- **Six climbs,** one for each weapon, each put together from his own reach, his crouch and his standing picture with
  that weapon slung, as the sword's climb was (`docs/weapon-on-back-climbs.png`).

**What is weaker than it should be**

- **The reach in each climb is his arms thrown up and out,** not a hand hooked over the edge: the jumps made for it
  turned him to face us in their later frames, so only their first, side-on reach is used.
- **Getting up begins kneeling,** not lying: none of the six strips would start him flat on the ground.
- **Rough rock has no drawing of its own** (he shows his drawing in the air while he grips it, as before). It is in
  the Deep, which is shut.
- **Swimming is drawn as falling,** as before, with the weapon in his hand.

- **Underneath:** `assets/side/mask_tall_c/bk_<weapon>_climb|getup|receive.png` (18 strips and their normal maps),
  `tools/compose-climb-back.py` (new: each climb and its table of where the ledge's corner is; he only rises),
  `docs/weapons/back/` (the 24 strips as made), `main.js` (`heroPose`: `bk`). A check in `tests/side-tooth.test.mjs`.
- **Save: not moved.**
- **Checked:** 479 checks pass (the whole suite once with one failing: a check for the spade's old drawings matched the new `bk_spade_` ones, the hammer on his back; narrowed, and its file run again). In the test browser: the same ledge climbed with each of the six; a gift taken.

**To try**

1. With each weapon in hand, jump at an edge and watch him haul over it.
2. Take a gift (a keeper's, a prize chest's) with something other than the sword in hand.

### Build 95: a heart and a drink, kept

*Your word, 23 Nov: "Lets do 1 and 2." This is 2: the gifts table you approved on 22 Nov puts a heart behind a
miniboss in the Tempest and a drink behind one in the Gardens, now that the Thunderhead and Mother Thorn leave
weapons instead. (1, the weapon on his back, is at the drawings stage: `docs/weapon-on-back.png`.)*

**For the player**

- **A heart behind the Jar,** in the Wreck of the Works: a prize chest at the east end of its hall, past its iron,
  held shut while the Jar holds its lightning (`docs/heart-chest.png`).
- **A drink behind the Lock,** in the Aqueducts: a prize chest by the Lock, between its piers and its gate, held shut
  while the Lock holds.
- Each is given as a keeper's gift is: it gathers over the chest and comes to him, and its window says what it is.
- So a new game ends the climb with one heart and no drink fewer than in build 86, and the two it gets back are
  earned from minibosses.

**What is weaker than it should be**

- **A save that already beat the Jar or the Lock** can open its chest at once: their being down is what opens it.
- **The other wings' prizes** (relics) are still in plain chests in rooms past their keepers; only the abilities and
  these two are in prize chests.

- **Underneath:** `state.js` (`BOON`), `main.js` (the `gift` event gives a heart or a drink), `regions/works.js`,
  `regions/aqueducts.js`. Checks in `tests/side-gifts.test.mjs`.
- **Save: not moved.**
- **Checked:** 478 checks pass. In the test browser: the Jar's chest held shut while the Jar stands, then opened:
  five hearts to six.

**To try**

1. Beat the Jar in the Wreck of the Works, then go east past its iron to the chest.
2. Beat the Lock in the Aqueducts and open the chest beside it.

### Build 94: the thorns, and the six weapons done

*The last weapon a keeper leaves (`docs/weapons-sheet.md`). Your word, 23 Nov: "Yes." With it, every keeper of the
climb leaves a weapon, each drawn from one picture you picked and approved frame by frame.*

**For the player**

- **Mother Thorn leaves the thorns** (`docs/thorns-in-game.png`): a pair of hooked bone blades, one in each hand.
  - **The fastest weapon and the shortest:** a metre and a half.
  - **Five cuts where the sword makes three:** two quick cuts, two more, then a burst (1, 1, 1, 1, 3: seven damage
    against the sword's four). Break off a blow and its second cut does not come.
  - **Up and attack:** a rising double cut. **In the air, down and attack:** he drops with both points down.
  - They cannot block.

**The six, as they stand**

| Weapon | From | What it is for |
|---|---|---|
| Sword | He starts with it | Anything. The only one that blocks and parries |
| Hammer | The Warden | Crowds and armour: three times the damage, knocks back, breaks cracked stone |
| Clapper | The Toll | The longest reach, in arcs; rings small creatures to a stop |
| Tooth | The Wyrm | Reach in a line; straight up; bounces off what is under it |
| Storm bow | The Thunderhead | Across the room, for free; slow to draw |
| Thorns | Mother Thorn | One thing at close quarters, fast |

**What is weaker than it should be**

- **A new game has two hearts and one drink fewer by the top than it had in build 86:** the Toll, the Thunderhead and
  Mother Thorn leave weapons now. That is harder, as decision 0.17 asks. The gifts table puts a heart and a drink
  behind minibosses in the Tempest and the Gardens; that is the next step of the gifts sheet, not done yet.
- **A save that beat Mother Thorn before keeps its extra drink,** and gains the thorns.
- **No weapon yet has drawings for getting up, climbing or hanging:** his sword shows. The weapon on his back for
  those (agreed 22 Nov) is still to be drawn, once.
- **Nobody has played any of the six together.**

- **Underneath:** `motor.js` (`THORNS`: `hits`, `gap`), `main.js` (a blow with two cuts strikes again), `state.js`
  (`TEACH[4]`), `teach.js`, `tools/weapon-strips.py`. Checks in `tests/side-tooth.test.mjs`, including that every
  keeper of the climb leaves a weapon.
- **Save: not moved.**
- **Checked:** 477 checks pass. In the test browser: every move with the thorns; a five-cut combo on a crawler,
  every cut landing.

**To try**

1. Beat Mother Thorn (or try the Firmament from the title): you can carry all six. Press R to go round them.
2. The thorns against one creature, close in. Then against three: they are not for that.
3. Which weapon do you reach for, and which never?

### Build 93: the storm bow

*The fourth weapon a keeper leaves (`docs/weapons-sheet.md`). Your word, 23 Nov: "Yes to bow", and on the arrows,
"Make them free."*

**For the player**

- **The Thunderhead leaves the storm bow** (`docs/bow-in-game.png`), not a heart.
  - **Its arrows are streaks of lightning that cross the room:** thirty metres a second, twenty-four metres at most.
    They cost nothing. Each strikes the first thing it meets, breaks an urn, finds a keeper's parts, and stops at rock.
  - **Three shots:** a quick one, a kneeling one, and a full draw whose arrow goes **through everything** in its way.
  - **Up and attack:** a shot straight up. **In the air, down and attack:** a shot straight down, and its kick holds him
    up a moment. There is no plunge with the bow.
  - **What it pays is time:** each shot is drawn before it goes (the full draw half a second), so with something on
    top of him it is the slowest weapon he has. It cannot block.
  - An arrow flies at knee-to-chest height, low enough for a crawler; crouched, he shoots lower still.

**What is weaker than it should be**

- **A save that beat the Thunderhead before this build keeps the heart it was given,** and gains the bow. A new game
  has two hearts fewer by the Tempest than it did in build 86 (the Toll's and the Thunderhead's), as decision 0.17
  asks; the heart in the gifts table for a Tempest miniboss is not placed yet.
- **The shots are drawn with a flash of their own painted in;** where it was far too big in play (the quick shot and
  the full draw) that frame is left out.
- **Nobody has played it.**

- **Underneath:** `motor.js` (`BOW`: `shoots`; in the air, down and attack is a shot, not a plunge), `main.js`
  (`loose`, `arrowsStep`: the arrows; cleared when a region is entered), `state.js` (`TEACH[3]`), `teach.js` (its
  picture), `tools/weapon-strips.py`. Checks in `tests/side-tooth.test.mjs`.
- **Save: not moved.**
- **Checked:** 476 checks pass. In the test browser: every shot, an arrow in flight, a shot up, a shot down from
  the air; an arrow across eight metres of corridor into a crawler (3 health to 1); an arrow stopped by a stone step.

**To try**

1. Beat the Thunderhead (or try the Gardens from the title), press R until the bow is in hand.
2. Shoot something across a room. Then let something walk up to you and try again.
3. The third shot down a line of creatures.
4. Stand under a flier and shoot up; jump over something and shoot down.

### Build 92: the Toll's clapper

*The third weapon a keeper leaves (`docs/weapons-sheet.md`). Your word, 23 Nov: "Yeah, we're set. Plunge A." And on
what a keeper leaves until its weapon is made: "don't worry about number 3 because we're finishing the weapons." So
the Toll leaves the clapper now, not a heart.*

**For the player**

- **The Toll leaves the clapper:** the bell's tongue on a chain, with a handle (`docs/clapper-in-game.png`).
  - **The longest reach of anything in his hand,** four and a half metres, in arcs: a long swing out and back, a blow
    over his head and down onto the ground in front, and a whirl round him that finds what is behind him too.
  - **A blow rings:** a creature it hits (not a large one) stands stopped for most of a second.
  - **Up and attack:** the chain swung straight up over him.
  - **In the air, down and attack:** he whirls it over his head and casts the chain straight down (plunge A). It lands
    wider than the other weapons' plunges.
  - **Nothing within a metre of him:** a creature at his feet is not struck. It is slow to come back, and it cannot
    block.
- **The swap key goes round** sword, then each weapon in the order he was given it.

**What is weaker than it should be**

- **The bell head is small,** as in the picture picked. It reads, but it is not a big weapon on screen.
- **No arc of light is drawn with a swing,** only a spark where the head is and a ring on what it strikes.
- **A save that beat the Toll in builds 87 to 91 keeps the heart it was given then,** and gains the clapper.
- **Nobody has played it.**

- **Underneath:** `motor.js` (`CLAPPER`, in `ARMS`), `enemies.js` (`near`, `round`, `ring`: a `rang` event),
  `main.js` (its plunge and landing drawings; its ember arts' drawings; a save whose Toll had fallen gains it),
  `state.js` (`TEACH[1]`), `teach.js` (its picture), `tools/weapon-strips.py`. Checks in `tests/side-tooth.test.mjs`.
- **Save: not moved.**
- **Checked:** 475 checks pass. In the test browser: every move with the clapper; an acolyte struck from four
  metres (5 health to 3, stopped 0.7 of a second); the same acolyte at his feet, not struck.

**To try**

1. Beat the Toll (or try the Spires from the title), press R until the clapper is in hand.
2. Strike something from as far as you can. Then walk up to it and strike again: it should miss.
3. The third blow with creatures on both sides of you.
4. Jump twice and plunge onto a group.

### Build 91: the Wyrm's tooth

*The second weapon a keeper leaves (`docs/weapons-sheet.md`). Its drawings were approved on 23 Nov ("Good to go"),
with the four you sent back remade. And the glide moves to the Seated, as in the gifts table you approved on 22 Nov.*

**For the player**

- **The Wyrm leaves the tooth:** a long spear, the great fang bound to its shaft with red cord
  (`docs/tooth-in-game.png`).
  - **Three blows:** a thrust (3.5 metres), a longer thrust (4.3), and a charge that carries him about five metres
    forward and strikes everything it passes through.
  - **Up and attack:** a thrust straight up, as long as the longer thrust.
  - **In the air, down and attack:** he dives head first behind the spear. If it meets a creature or spikes it does
    3 damage and **throws him back up**, with his second jump and his dash to use again. On bare floor he lands as
    from any plunge.
  - **Narrow:** it strikes along a line at his chest. It misses what is low at his feet or over his head, where the
    sword's cut would find it. It cannot block.
- **The swap key goes round the weapons he has:** sword, hammer, tooth, sword. Its name in the keys is "Change
  weapon". The weapon's picture on the HUD is the one in his hand.
- **The glide is the Seated's,** in a prize chest behind him in the Glacier Galleries, held shut while he sits. So
  the Galleries are part of the climb: the Tempest cannot be crossed without the glide.
  - The Lamplighter in the Tempest says where to look, if he comes without it. And no line says "the Wyrm's wind"
    any more.

**What is weaker than it should be**

- **The tooth's charge has no cut of light drawn with it,** and no thrust does: a spark at the point is all. It reads,
  but plainly.
- **The bounce does not yet work on a keeper's parts,** only on creatures and spikes. A keeper under him is struck as
  by any plunge.
- **His sword drawings still show** when he gets up, takes a gift, climbs or hangs, as with the hammer.
- **The Toll still leaves a heart.** That waits on your answer about what a keeper leaves until its weapon is made.
- **Nobody has played it.** The numbers (reach, damage, the charge's five metres, the bounce's height) are first ones.

- **Underneath:** `motor.js` (`TOOTH`, `ARMS`: every weapon he can carry with its drawings' prefix, picture and name;
  `pogo`), `main.js` (`toothStep`: the dive's bounce and the charge's strikes; the swap round; the HUD, the inventory
  and the gift read the weapon, not "is it the spade?"), `enemies.js` (`narrow`), `state.js` (`TEACH[2]` the tooth,
  `ABILITY.glide`), `teach.js` (the tooth's picture), `regions/glacier.js` (the prize chest), `talk.js`,
  `tools/weapon-strips.py` (the tooth's frames). New check: `tests/side-tooth.test.mjs`.
- **Save: kept.** A save whose Wyrm had fallen keeps its glide and gains the tooth.
- **Checked:** 474 checks pass. In the test browser: every move with the tooth; the three blows chained (the
  charge carried him 5.1 metres); a dive onto an acolyte (5 health to 2, thrown back up, the second jump given back);
  the swap round; the Seated's chest held shut, then giving the glide.

**To try**

1. Beat the Wyrm (or try the Tempest from the title), press R until the tooth is in hand.
2. Hit something three metres off with the first thrust. Then something low at your feet: it should miss.
3. Hold up and attack under a flying creature.
4. Jump over a creature or a row of spikes, then down and attack: does the bounce feel good, and can you chain it?
5. In the Glacier Galleries, beat the Seated and open the chest behind him.

### Build 90: the hammer's plunge

*Your word, 23 Nov: "Sure about number 2, the plunge for hammer." In build 89 the plunge borrowed two frames of the
overhead blow, because no drawing of it would leave the ground.*

**For the player**

- **The hammer's plunge is its own drawing** (`docs/hammer-plunge.png`): in the air, down and attack, and he rides
  the hammer down, its stone head under his boots. It still lands with the end of the overhead blow.

**What is weaker than it should be**

- **The stone head is drawn wider and flatter** in the plunge than when he stands: it is seen end-on.
- **He is drawn a little above where he is, and the head a little below,** so close over a floor the head dips into
  it for an instant before the landing. The sword's plunge does the same with its blade.

- **Underneath:** `assets/side/mask_tall_c/hm_plunge.png` and its normal map; `tools/weapon-strips.py` (a strip on a
  canvas of its own, placed by hand); `tools/pixellab.py` (`START=`: a strip begun from a picture of my choosing,
  which is what got him off the ground); `main.js` (`heroPose`).
- **Save: not moved.**
- **Checked:** 469 checks pass. In the test browser: a second jump, the plunge, and the landing, photographed.

**To try**

1. With the hammer, jump twice and press down and attack. Does it read as one move, fall and blow?

### Build 89: the hammer, drawn

*Step 4 of `docs/weapons-sheet.md` for the first weapon. Your words: the look, "B, pale stone. I think that's cooler
for the hammer"; the set, "Good to go"; blow 1, "Second blow"; anything to send back, "Nope all good".*

**For the player**

- **He holds the hammer.** Until now, with the Warden's weapon in hand, he was drawn with a spade. Now it is the pale
  stone hammer you picked, and it is the same hammer in every frame (`docs/hammer-in-game.png`).
- **He holds it in every move where a weapon shows:** standing, running, in the air, landing, crouched, crouch-walking,
  rolling, being hurt, and its three blows. With the spade he had nine drawings; in the roll, the landing and when
  hurt he was drawn with the sword.
- **Its three blows are new drawings:** a sideways blow (the second of the two tries), a rising blow out of a crouch,
  and the overhead blow that ends on the ground.
- **The plunge is borrowed,** as agreed: he falls with the hammer raised over his shoulder (two frames of the overhead
  blow) and lands with that blow's end.

**What is weaker than it should be**

- **Getting up after a fall, taking a gift, climbing and hanging** still show his sword drawings. Getting up could
  not be made (the stock pose is refused for a changed hero); the others are to be the weapon on his back, drawn once
  for every weapon, and are not made yet.
- **The sideways blow turns him right round.** In the game its last frames are cut, so he does not end with his back
  to what he hit, but he recovers quickly out of a half turn.
- **Nobody has played it.** The blows land on new frames; a blow may look early or late against its hit.

- **Underneath:** `assets/side/mask_tall_c/hm_*.png` (11 strips and their normal maps; the nine `spade_` strips are
  gone), `tools/weapon-strips.py` (new: picks the frames of each approved strip and stands him in the same place in
  all of them), `tools/pixellab-state.py` and `tools/pixellab-strips.py` (a state of the hero; its strips),
  `main.js` (`heroPose`: `held`), `motor.js` (the blows' drawings and the frame each lands on).
- **Save: not moved.**
- **Checked:** 469 checks pass. In the test browser: every move photographed with the hammer in hand.

**To try**

1. With the hammer in hand (R), stand, run, jump, crouch, roll. Is it the same hammer throughout?
2. The three blows on a creature: does each look as if it lands when the creature is hit?
3. Jump twice and plunge (down and attack in the air): does the borrowed fall read?

### Build 88: harder

*Step 3 of the order in `docs/gifts-sheet.md` (done before the second half of step 2, which waits on a question in
build 87's entry). Decision 0.17: "So far I haven't died at all... I need to be able to die. I need to feel the risk.
At least 3 to 5." And: "I feel like I have so much cash. It's just kind of being handed to me." Three cheap changes,
to be steered by your death counts (the game counts deaths by region).*

**For the player**

- **One spring a region.** There were two or three. The one in the middle of each region is kept; the checkpoint
  pool at the foot of each region is as it was. No wing has a spring now.

  | Region | The spring kept | Taken away |
  |---|---|---|
  | The Roots | the grotto | the Ossuary's |
  | The Cloister | the library | the cloister's |
  | The Spires | the hollow | the Bell Road's; the eyrie's, just under the Wyrm |
  | The Tempest | the watch | the last hut's; the masthead's |
  | The Gardens | the orangery | the sundial's |
  | The Firmament | the archive | the vigil's |

- **Ordric's prices are up by about two thirds, and an urn pays two to four shards** (it was three to six).

  | Ordric sells | Was | Now |
  |---|---|---|
  | A bigger flask (first, second) | 120, 260 | 200, 430 |
  | Sharpen the sword (first, second) | 180, 380 | 300, 630 |
  | A red strand | 150 | 250 |
  | A relic slot (first to third) | 120, 240, 400 | 200, 400, 660 |
  | Everything he has | 1,850 | 3,070 |

- **Blows that cost two hearts.** The larger creatures: the yeti's swat, the squall, the sluicer, the sentinel; the
  Turned's bar. Each keeper's great blow: the Warden's crush, the Toll's drop, the Fallen's throw (the Wyrm's, the
  Thunderhead's and Mother Thorn's already did). What is thrown or spat still costs one.

**The money, measured** (as promised on the sheet: the numbers before the change)

What a region pays to one who finds every urn and chest and kills everything once, with the urns as they were. A
creature pays one shard and one for each point of its health, to five; a keeper 60; a wing's keeper 30.

| Region | Its main way | Its wings | The region | Running total |
|---|---|---|---|---|
| The Roots | 323 | 147 | 470 | 470 |
| The Cloister | 381 | 321 | 702 | 1,172 |
| The Spires | 347 | 221 | 568 | 1,740 |
| The Tempest | 415 | 205 | 620 | 2,360 |
| The Gardens | 408 | 347 | 755 | 3,115 |
| The Firmament | 384 | 118 | 502 | 3,617 |

- **Why you owned everything by the Tempest:** at the top of the Spires the running total was 1,740, and everything
  Ordric sells came to 1,850. Creatures come back when he rests, so there was more than that.
- **After this build:** the urns pay about 40 less a region, so the whole climb pays about 3,400, against 3,070 for
  everything. The first of each thing costs 200 to 300: a region buys one or two. The last of each costs 430 to 660:
  a region buys one.
- **Not changed:** what chests, creatures and keepers pay. Creatures still come back at a rest, so shards can still
  be farmed. Say if that should stop.

**What is weaker than it should be**

- **None of this has been played.** These are first numbers. Tell me your deaths in each region after a run and I
  will move them.
- **The places where a spring was** are not redressed. Nothing is left standing there, but a room built round a
  spring (the eyrie, the vigil) has lost its reason.
- **The Wyrm has no spring under it now.** With the long climb back from the pool, that fight may be the one that
  is too hard. It is also the keeper to be rebuilt first (step 4).
- **The hearts given away are not cut.** The Toll leaves one (build 87), and the Thunderhead still does.

- **Underneath:** `level.js` (`SPRING`, in `finish`), `main.js` and `state.js` (the prices), `items.js` (the urn),
  `enemies.js` (`dmg` on the yeti; `heavy`, read where a creature with a turn of its own hurts him),
  `regions/tempest.js`, `aqueducts.js`, `firmament.js`, `cairns.js`, `boss.js`, `toll.js`, `fallen.js`. New check:
  `tests/side-hard.test.mjs`.
- **Save: not moved.** A spring he had found that is gone is simply not there.
- **Checked:** 469 checks pass. In the test browser: the Spires with one spring; a yeti's swat taking two hearts
  of six; Ordric's sheet with the new prices.

**To try**

1. Play a region you know and count your deaths. That number is what this build is for.
2. Is one spring enough? Did you run out of flask?
3. At Ordric: can you afford one thing a region, and do you have to choose?
4. A yeti in the Spires, a squall in the Tempest: do two hearts feel like a real blow, or unfair?

### Build 87: the Cracked Bell rolls, and the air dash is its prize

*Step 2 of the order in `docs/gifts-sheet.md`, the first half: "abilities from minibosses". From the playtest, on the
Cracked Bell: "I don't know what he's supposed to do... he's just there taking hits", and your idea, "a broken,
rejected bell that rolls". And: "Whenever I get an item, I should feel like I deserved it. Should come out of a special
chest."*

**For the player**

- **The Cracked Bell is a fight now** (`docs/cracked-bell-fight.png`). It no longer hangs and waits to be struck. It
  was cast wrong and thrown down in the founders' pit, and it lies there until he comes near. Then:
  1. **It warns:** it rocks back and its crack burns (three quarters of a second).
  2. **It rolls at him,** the width of the pit. A second jump clears it; so does a roll through it; so does a gallery.
     A blow glances off it while it rolls.
  3. **It strikes the wall and rings.** As before, what hears a ring wakes: the slag on the floor comes for him.
  4. **It lies spent** for about two seconds. That is when to hit it. Then it comes again.
  - From half its health it is faster and **comes back off the wall once** before it lies still.
  - Its health is 16 (it was 20): four openings with the sword, two with the hammer.
- **It guards the air dash.** Past the grate that lifts when it falls is **a prize chest**: larger than any other,
  banded in gold, tied shut with a ribbon of his red. Opening it, the air dash gathers over it and comes to him, as a
  keeper's gift does. The chest cannot be opened while the Bell stands ("Held shut. Its guardian still stands.").
- **The air dash is "The Bell's Step"** (it was "The Toll's Step").
- **The Toll no longer gives the air dash. It leaves a heart,** until its weapon is made (see below).
- **Thin ice has grown across the way up into the Spires,** at the top of the Bell Road. The air dash breaks it. So
  the Bell-Foundry is part of the climb: hammer, then the Foundry, then the Spires.
  - Coming to it without the dash: "Thin ice. It wants speed, not weight." The Lamplighter, at the gate just below,
    says where to look: "The founders, east of the bell tower below, cast a thing that could. They threw it down in
    their pit."
- **A keeper's name and health bar are at the foot of the screen.** At the top the name lay over his shards and the
  bar ran under the map.

**For you to settle**

1. **What should the Toll leave until the clapper is made?** I chose a heart, so that a keeper never leaves nothing.
   It makes the game a little easier, which is against what you asked; it could be a red strand, a relic slot, or
   nothing but the way on.
2. **Is the Bell fair?** One jump does not clear it: it takes the second jump or a roll. Say if that is too much to
   ask of someone who has only just reached the Cloister.

**What is weaker than it should be**

- **The Bell is drawn with the Toll's own pieces,** tumbling. It has no drawing of its own for rolling.
- **The slag is not rethought.** Three lumps wake at every wall strike. That may be too much with the Bell coming
  again two seconds later, or it may be the fight. Nobody has played it.
- **The glide, the heart and the drink have not moved yet.** The Wyrm still gives the glide. That is the next build.
- **The way back down** from the ice to the Foundry is the way he came up: the Bell Road, the Cloister, east of the
  tower. There is no shortcut.

- **Underneath:** `regions/foundry.js` (`BELL`, `bellMid`, the Bell's turn, `setDown`), `state.js` (`ABILITY`,
  `ARRIVES`, `G.can`, `gifted`), `items.js` (`prizeTex`; `holds: 'gift:dash'`, `prize`), `main.js` (`learn`; the
  `gift` and `held` events; `giftStart` out of a chest), `level.js` (the mouth `asks` for the dash), `hud.js` (the
  keeper's bar), `talk` lines in `main.js`. Checks: `tests/side-gifts.test.mjs` (new), the Bell's in
  `tests/side-foundry.test.mjs` (rewritten), `tests/helpers/reach.mjs`.
- **Save: kept, and changed.** What he can do is now held in the save by itself (`can`). A save from before keeps
  the dash if its Toll had fallen, and the glide if its Wyrm had.
- **Checked:** 466 checks pass. In the test browser: the Bell fought by a script that jumps its roll and strikes
  it while it lies spent (no heart lost to the roll; a sword combo takes a quarter of its health); the prize chest
  shut, then open, and the window; the ice at the Spires' mouth stopping him without the dash and broken with it.

**To try**

1. A new game, or a save that has not beaten the Toll. Beat the Warden, take the hammer east of the bell tower into
   the Foundry, and go down to the pit.
2. Fight the Bell. Can you read what it is about to do? Is the two seconds enough?
3. Go through the lifted grate and open the big chest.
4. Beat the Toll, climb the Bell Road, and dash through the ice.
5. Try it the other way: beat the Toll first and climb to the ice without the dash. Do the line there and the
   Lamplighter send you to the Foundry?

### Build 86: the hammer

*Step 1 of the order in `docs/gifts-sheet.md`, which you approved on 22 Nov ("I think so... So keep going"). From the
playtest: "I don't really have a reason to use the hammer. The sword is faster." and "more damage, an arc, a
knockback".*

**For the player**

- **The Warden leaves a hammer, not a spade.** It is the same thing in his hands, with a new name and new numbers.
  Anyone who had the spade has the hammer.
- **It hits three times as hard as the sword.** Its three blows do 3, 3 and 6 (they did 2, 2 and 4; the sword's do
  1, 1 and 2). A crawler falls to one blow; a red-robed acolyte to two.
- **It knocks creatures back** about a metre and a half and stops them for a moment (0.4 of a second), so the next
  blow lands before they can answer. A creature is stopped by a wall and is not pushed off a ledge. The large ones
  (12 health and over), the ones that cling or perch, and keepers are not thrown.
- **Its arc is wide:** a blow also finds what is just behind him (a little over a metre) and what is over his head.
- **It is slower than it was,** by about a tenth: that is its cost, with not being able to block.
- **The words:** "The Warden's Hammer" in its window, in the inventory and on the HUD (a hammer for its picture);
  "sword or hammer" for the swap key; a cracked wall says "Hit it with the hammer."

**For you to look at: the hammer's drawings** (`docs/hammer-candidates.png`)

- **(22 Nov: turned down. The two did not match each other. The hammer's look is settled first, as one picture, in
  step 2 of `docs/weapons-sheet.md`.)**
- **In this build he still holds what looks like the spade.** I had two drawings made as candidates, him standing with
  the hammer and its great blow, and they are not in the game. If you like them I will have the other seven made
  (running, in the air, crouching, the two lighter blows, the plunge) and put them in. If not, say what the hammer
  should look like. The candidates have a head of grey stone banded in iron with a blue glow in it, after the Warden.

**What is weaker than it should be**

- **It looks like the spade** until the drawings are approved.
- **The knockback is a jump, not a slide:** the creature is in its new place at once. It reads as a blow, but a short
  slide would read better.
- **Nobody has played it.** Three times the damage may be too much against the Roots' creatures; the numbers are in
  one line (`SPADE` in `motor.js`).

- **Underneath:** `motor.js` (`SPADE`: the name, the damage, `wide`, `knock`, `stagger`; its key in the code and its
  drawings' names are still `spade`), `enemies.js` (`strikeEnemies` takes the heavy weapon: the arc and the throw),
  `main.js`, `state.js`, `teach.js` (the hammer's picture), `ui/screens/settings.js`. New check:
  `tests/side-hammer.test.mjs`.
- **Save: not moved.**
- **Checked:** 462 checks pass. In the test browser: the hammer's window, its picture on the HUD, and a blow on an
  acolyte in the Ossuary (5 health to 2, thrown back against the step behind it, stopped for 0.4 of a second).

**To try**

1. Beat the Warden (or load a save that has): the window says "The Warden's Hammer".
2. Press R to change to it. Hit a crawler: one blow. Hit an acolyte in the Ossuary: it is thrown back and stands
   stunned.
3. Stand between two creatures and swing: the one behind him is struck too.
4. Is it now worth choosing over the sword, or is it too strong?
5. Look at `docs/hammer-candidates.png` and say yes, no, or what to change.

### Build 85: up

*Your answer of 22 Nov to the one decision left open: "Yes about the W on keyboard." (The playtest: "If I press up,
I'd like him to look up. And then if I swipe, he swipes up.")*

**For the player (a change to the keys)**

- **W and the up arrow no longer jump. Space jumps.** They were a second and third jump key.
- **Up looks up.** Hold it standing still and, after a third of a second, the view goes up three and a half
  metres. Let go and it comes back. It does nothing while he is moving, striking or talking.
- **Up and attack strikes upward.** On the ground or in the air, it is the rising cut, and it finds what is over
  him and not what is in front: a metre either side of him, from his chest up to the weapon's reach over his head.
  The cut's flash is drawn over him. With the heavy weapon, which has no rising cut, it is its ordinary swing, struck
  upward.
- **Up also swims up** (as jump does) once he can dive, **and climbs** rough rock with the grip.
- **On a controller,** up is the stick or the d-pad pushed up. **On a touch screen,** a drag upward.
- The keys' tab says: W look up; W and attack, strike upward. Down and attack is still the rising attack.

**What is weaker than it should be**

- **He has no drawing for looking up.** The view moves; he stands as he was. That wants art.
- **Keepers are still struck as before,** by what is in front of him. An upward strike finds creatures and nothing
  else yet: not a keeper's parts overhead, not a chest or an urn over him.
- **The rising cut is slow to come** (over a quarter of a second). In the air that may feel late. It is one number.

- **Underneath:** `core/settings.js` (`up`; `jump` is Space), `core/input.js` (the action, the stick, the touch
  drag), `motor.js` (`P.atk.up`; up swims and climbs), `enemies.js` (`strikeEnemies` with `up`), `main.js` (the
  look; the hints), `teach.js`. New check: `tests/side-up.test.mjs`.
- **Save: not moved. Keys:** anyone who had changed their keys keeps them, except that W and the up arrow are taken
  from whatever had them and given to up.
- **Checked:** 460 checks pass (the whole suite once with one failing: the old prompt table had no entry for up; that added and its file run again). In the test browser, on this build and on build 84 side by side: Space jumps on
  both; W jumped on 84 and does not now. W held lifts the view and letting go returns it. W and J starts the rising
  cut, marked as struck upward.
- **Not checked:** not played by a person, and this is all feel: how far the view goes, how long before it goes,
  how wide the upward strike is. A controller and a touch screen were not tried.

**To try**

1. Stand still and hold W. Is three and a half metres the right amount, and a third of a second the right wait?
2. Jump under something that flies and strike with W held. Does it hit what you meant?
3. Does anything now feel missing with W not jumping? (Climbing a ladder of planks, say.)

### Build 84: the shop, and the map in cloud

*The last of the three builds of the screens sheet (`docs/screens-sheet.md`).*

**For the player**

- **Ordric's shop is his own sheet of paper, pinned up.** His name at its head in ink. Each thing he sells is a line
  on it: its picture, its name, what you have of it now, its price. The chosen line is lit, with a piece of the
  ribbon at its edge. What you cannot pay for is pale, and the sheet says so. This was "it should feel like a shop",
  and your own idea for him: "a leaf or a sheet of paper".
- **Your shards stand apart, large,** on a slab of their own.
- **Ordric is there:** his portrait, the name of the thing chosen, the key that buys it, what it does, and a word
  from him about it in italics. ("One more mouthful, for a longer road.") His words are flavour; what the thing does
  is said plainly above them.
- **The map shows where you have not been.** A room you have not entered, but that has a way into it from a room you
  have, is drawn as cloud: on the full map and on the corner map. Cracked stone is not a way until it is broken, so
  a hidden room stays hidden. This is the fog you asked for, on the map.
- **Every mark on the map is named in its key,** in plain words, on two rows where one will not hold it. The cloud is
  "not been there yet". The grey mark is "a way still shut". The gold mark that beats is "a way you can open now":
  that was the flashing you asked about. "No deaths here" is "You have not died here".
- **The map is on a slab** like the other screens, the region's name on the ribbon.

**Not done**

- **Corwen's and Hob's own menus** (an open book, a tally board). Neither sells anything today, so there is nothing
  to put on them yet. They come when those two have something to offer.
- **Cloud over hidden rooms in the world itself.** You said that by the Roots' well you could see a hidden room to
  your right and wanted it clouded. That is the game's own picture, not the map, and is not in this build.
- **The Lore book and Options** still have their old look.

- **Underneath:** `main.js` (`SHEET`, `shop` and `drawShop` rebuilt, each ware's `say`; `clouds`; `drawMap` on a
  slab), `hud.js` (`cloudFill`; cloud in `map` and `fullmap`; the key in rows), `talk.js` (`face` shared).
- **Save: not moved.**
- **Checked:** 458 checks pass. In the test browser: the shop at 960 by 540 and 640 by 360; a thing bought with
  a key and another with a click; a thing he cannot pay for refused; Tab leaves. The map after walking three rooms:
  those rooms, two rooms in cloud, the key.
- **Not checked:** not played by a person. The shop on a touch screen. The map's key with every kind of mark on it at
  once (it needs Corwen met, a way shut and a way open in the same region).

**To try**

1. Go to Ordric. Does it feel like a shop now? Is the sheet his?
2. Buy something. Try to buy what you cannot pay for.
3. Walk a few rooms and press M. Is the cloud clear: somewhere you know of and have not been?
4. Read the map's key. Is any mark still unexplained?

### Build 83: the HUD, the menu, the inventory

*The second of the three builds of the screens sheet (`docs/screens-sheet.md`), in the style build 82 began: the
mountain's stone, and his red ribbon tied across the head of every panel.*

**For the player**

- **The ember bar.** A flame at the head of a bar in three parts, a part to a power. A part that is filling is
  orange. A full part is bright, with a light running along it, and **the key that spends it stands beside the bar
  for as long as there is a part to spend.** It was three thin yellow lines ("three yellow bars, I don't know what
  those are for").
- **The flask's key stands by the flask while a drink would help:** when he is hurt and has one.
- **Red strands are pieces of his ribbon,** after the ember bar, and are not drawn until he has found one. They were
  three empty squares from the start ("I don't know what that's worth").
- **Each part of the HUD is named once,** the first time it is there to see: a gold frame round the part, blinking,
  and its name on a plate under the HUD. Hearts, the flask, embers, shards, red strands. One at a time, six seconds,
  never over a window, a talk or a keeper. Turning hints off turns these off.
- **The pause screen is tabs.** Down the left: Resume, Map, Inventory, Lore book, Keys, Options, Quit. Across the
  top, his goal and the next step, on a slab. On the right, what he has, each with its picture and a number: hearts,
  drinks, shards, strands, ember powers ready, relic slots, deaths. No sentence anywhere on it.
- **The keys have a tab of their own.** They were five lines across the foot of the pause screen.
- **The chosen button wears a piece of his ribbon** down its left edge. It was a yellow outline. This is every menu,
  the title's too.
- **The inventory is pictures.** On the left, his abilities, weapons and relics as pictures in a grid under those
  three headings; a relic he owns but has not equipped is dim. On the right, the chosen one in the same window as
  when he got it, flavour and all. Along the foot, the knots of his ribbon: one for each relic slot, tied where a
  relic is equipped.

**Not in this build**

- The shop as Ordric's sheet of paper, and the map that shows unknown rooms as cloud (the sheet's build C).
- The Lore book and Options are as they were, reached from their tabs.
- A picture for every relic is already there (each has its 16-pixel icon). **Better pixel work on them** is art, and
  wants its own pass with the generations you have.

- **Underneath:** `hud.js` (`status` and `purse` redrawn; `point`), `main.js` (`slab`, `drawWindow` in a pane,
  `hudTips`, `keysScreen`, `carryScreen` and `drawCarry` rebuilt, the pause's tabs and its drawing, `menuMark`).
- **Save: not moved.** Which HUD parts have been named is kept in the save (`taught.hud_*`).
- **Checked:** 458 checks pass. (One line of the pause screen's drawing was trimmed after that run: a row that ran
  off the foot. No check covers that drawing; it was looked at again.) In the test browser, at 960 by 540 and at the
  itch page's own 640 by 360: the HUD with a full ember part, the flask's key, a strand, and the pointers; the pause;
  the inventory with an ability, two weapons and two relics. The keys tab at 960 by 540 only.
- **Not checked:** not played by a person. Not looked at on a phone, where the tab column is tightest. In the
  inventory's small cells the ribbon on the chosen one covers the left of its picture. A controller's stick moves through the inventory's grid in one line, not by
  rows.

**To try**

1. Start a new climb. Watch the top left for the first minute: do the gold frames explain the HUD, or get in the way?
2. Take hits until the ember bar fills a part. Is it clear that a part is ready, and which key spends it?
3. Press Tab. Is this the "very nice UI"? What is still wrong with it?
4. Open the Inventory and move through it. Then the Keys tab.
5. Is the ribbon on the chosen button enough to see which one is chosen?

### Build 82: the Deep shut, and the window

*Your decisions of 21 Nov (roadmap, phase 0, 0.12 to 0.20), and the first of the three builds of the screens sheet
(`docs/screens-sheet.md`): the window and the keys. You said the sheet's look was right and asked for it to be more
of the game's own world, with the ribbon kept.*

**For the player**

- **The Deep is shut (0.12).** The hatch at the Roots' pithead is nailed down: boards, two iron straps, the guild's
  seal. Stand on it and the game says so. It is one switch (`DEEP.shut` in `level.js`); opening it later is that
  switch, or something he does. A save that is already down there can still walk up and out. Try a place still
  goes anywhere.
- **No map is sold, and Corwen gives none (0.16).** The map is only what he has walked. Ordric's shop has no map
  in it. A chart bought or given before this build no longer shows rooms he has not been in, or what is left to
  find. (The Star Compass relic still shows what is left to find: that is what the relic is.) Unknown rooms as
  cloud come with the map's own build.
- **One window for everything gained.** A slab of the mountain's stone, his red ribbon tied across its head with
  the knot and its two tails, the thing's picture in a niche, its name, what it does, how to use it, and the key
  that closes it. It is the same window for an ability, a weapon, a relic, and the "how it works" cards.
- **Keys are drawn as keys.** A pale cap with its letter in ink and a darker foot; the mouse as a mouse with the
  button lit. In the window's lines, in the prompts over things, in the hints of the opening, beside the weapon,
  and in the list of keys on the pause screen. A key is not written as a word in a sentence in any of those now.
- **Flavour is in italics,** dimmer, in a second typeface, last in the window. A relic's window now shows its lore
  that way. (A plain serif stands in until you choose a face.)
- **The flask is explained,** the first time he is hurt with a drink left and nothing near: what a drink heals,
  its key, and what fills it.
- **"The Annals" on the pause screen is "Lore book".** The word was not understood.

**Not in this build**

- The HUD and its ember meter, the menu and the inventory (the sheet's build B); the shop as Ordric's sheet of
  paper, and the map that uncovers (build C). The shop and the inventory still use the old card, with the new keys.
- **Decided but not built:** abilities from minibosses and weapons from keepers (0.13), the hammer and more weapons
  (0.14), three to five deaths a region (0.17), people who hint (0.18), wider regions (0.19). Each wants its sheet.

- **Underneath:** `level.js` (`DEEP`, the pass marked `shut` and its hole filled), `main.js` (the hatch and its
  line; `drawWindow`, `flavour`, `wrapRich`; keys in brackets from `keyed`; the flask's card; no chart in the shop or
  from Corwen, and none read by the map), `hud.js` (`cap`, `capW`, `rich`, `richW`; the hints' band), `teach.js`
  (`CARDS.flask`).
- **Save: not moved.** `G.charts` is kept in the save and no longer read.
- **Checked:** 458 checks pass (the whole suite once, with one failing: the shut hatch's marker was left inside rock; that mended and its file run again). In the test browser: the window for an ability, a relic and a card; the pause
  screen's keys; the hatch and its line.
- **Not checked:** not played by a person. Whether the window reads as "of the game" is yours to say: it is the
  thing I can least judge. The flask's window opens in play at a moment I chose (hurt, a drink left, nothing within
  nine metres); it may still feel like an interruption.

**To try**

1. Take the Warden's gift, or find a relic. Is the window the right look now? What would make it more the game's?
2. Do the keys read as keys? Look at the pause screen's list, and at the prompt over Ordric.
3. Read a relic's italic line. Is that the face, or do you want something older-looking?
4. Walk onto the hatch at the pithead.
5. Open the map after walking a few rooms: only those rooms should be there.

### Build 81: the second playtest's broken things

*The first step of the order agreed after the playtest of 21 Nov (`docs/playtest-2026-11-21.md`): the bugs and the
small numbers, before any design. Each line names the note it answers.*

**For the player**

- **The copy of him standing in the floor is gone (B1).** It was real, and it was his own picture. Walking across a
  join between two regions (the crypt stair, say) marks his picture to be kept while the new region is put round him.
  The mark was never taken off. The next time he went through the dark into the Deep or out of it, he was made
  again, and the old picture was kept as well: left standing at the last place he had been, which is the hole he
  dropped into. That is why you saw it at the Workings' seal, the Vein's lip and the Roots' pithead, and only after
  you had been up the crypt stair. Confirmed before and after: two of him drawn, then one.
- **The menu key is Tab (B2).** P and Escape still work. Tab is there because a browser keeps Escape for leaving
  full screen, which is how the game is played on its page: that is the most likely reason Escape "was a problem".
  And in a screen that came from another (the map, the inventory, the Annals, options), the key now goes **back one
  screen**; it used to drop you straight out into play. Where the browser allows it, Escape is also kept for the
  game while in full screen. The hint on screen says TAB MENU.
- **The second jump breaks a fall (B3, F1).** Whatever he fell before it does not count. Two things were wrong:
  the fall was still measured from the top, and near the ground a jump press was being saved for the ground and
  never became the second jump at all, so he landed, was hurt, and then jumped. At the end of a fall long enough to
  hurt, the press is now the second jump. (A fall hurts from 9 metres; that number is not shown anywhere yet.)
- **The Great Shaft's water cannot be cheated with the slam (B4).** You were right that build 79 had not closed it.
  Build 79 ended a slam begun while floating. This one: leap out of the water and slam within a sixth of a second.
  The slam was ended, but its speed was not, and in the moment after a leap the water does not hold him: he went to
  the floor and swam under the arch. Now a slam in water loses its speed with it, and without the wind the water
  turns him back up in every state. The check drops him in this way too, into every deep water of every level.
- **Nothing from outside comes into a keeper's fight (B5).** While a keeper stands, a creature that lives outside
  its hall and has come in is put back where it lives.
- **Shop prices can be read (B6).** The menus' typeface has a 2, a 5 and an 8 that look alike: 120 read as 180.
  Prices are drawn in the game's own pixel digits, in gold.
- **Embers no longer heal (F5).** The flask is the only way. The hints and the embers' card say so no longer.
  **The Gardener's Seed** made that healing cheaper, so it needed something else to do: each drink from the flask
  now heals one more heart. That is my choice of stand-in, and yours to change.
- **The ink creature in the Scriptorium's first room (B7)** lay in a slot two tiles deep between two heaps and could
  not leave it. The lowest heap is made a step, and it lies on that.
- **Mirel's bedroll (B10)** was a green bar with a red end in a black frame: a health bar. It is a grey folded
  blanket with a rolled head end.
- **The Cairns' stones (B9)** drop, tilt and fade when the way falls. They used to blink out.
- **The top of the Bell Road (B11).** Coming up into the Spires, the rock-smoothing had rounded the corner into a
  lip over half the hatch. The air over it is marked to stay open.
- **The Great Shaft's west bank (F6)** was level with the water's top, so it did not look like a way out. It is a
  row higher.
- **Small numbers:** the air dash goes 10% further (A6). The sword reaches 2.1 (was 1.9) and the heavy weapon 2.85
  (was 2.6) (A2). The barnacles are drawn two pixels into the ground (C6).

**For giving notes**

- **A place readout (U7).** Press **F2** (or Options, Place). In the bottom right it shows the region's number, the
  room's name and his tile in that room: `1 BRIDGE 9,14`. Read it out with a note and I can go straight there.

**A walk test (B11)**

- You asked for one. A low spot is floor he can walk onto from where he stands, where he fits only crouched or
  rolling: a lip overhead. The check lists every one in every level (41 today) and fails on a new one, with its room
  and tiles. Some of the 41 are meant (the Roots' crawl, the Cloister's cells); the rest are for each region's map
  pass to look at.

**Found on the way**

- **A slam could be left on him** if the ember slam was used while he was hauling himself onto an edge: he stood up
  with the slam still armed. It cannot begin there now.

**Not done, and why**

- **The lip at the far right of the Ossuary (B11).** I could not tell which it is from the map: nothing there is
  low enough to catch his head while walking, and the jumps clear. With F2 on, the next time you pass it, the
  readout will name it.
- **Ordric moved off the pools (P2).** I had listed this as small. It is not: at the crypt stair, the Spires' gate
  and the last hut, his room starts at the water's edge and the way up goes over its roof. Moving him means recutting
  each of those rooms, so it goes with each region's pass and the people's places.
- **Frogs that only face you, and the slam that hurts them without killing (B8).** That is how they are made to
  behave, so it belongs to the creature pass, not here.
- **The stutter (B12).** Still not found.

- **Underneath:** `render.js` (the kept mark taken off after one use), `main.js` (the menu key; `keepOut`; `pixNum`;
  the readout; the stones; no ember heal), `motor.js` (the second jump; slams in water and on a mantle; `AIRDASH`,
  `BLADE`, `SPADE`), `enemies.js` (`keepOut`, `sink`), `items.js`, `state.js`, `teach.js`, `seams.js`,
  `regions/scriptorium.js`, `regions/shaft.js`. New checks: `tests/side-walk.test.mjs`, `tests/side-hall.test.mjs`;
  `tests/side-under.test.mjs` has the leap-then-slam.
- **Save: not moved.** A save that wears the Gardener's Seed gets its new effect.
- **Checked:** 458 checks pass. In the test browser: the copy of him, before and after; Tab into the menu, into
  the inventory, back one, and out; the shop's prices; the readout; Mirel's rest.
- **Not checked:** nothing here was played by a person. The second jump at the end of a fall, the further dash and
  the longer reach are changes to how he feels, which I cannot judge. The keeper's hall rule was checked on its own
  and not in a real fight. Whether Escape is kept in full screen depends on the browser and on itch's page; Tab does
  not.

**To try**

1. Go up the crypt stair into the Cloister, come back down, and drop into the Deep at the pithead. Come back up.
   There should be one of you.
2. In full screen, press **Tab**. Open the map from the menu and press Tab again: you should be back at the menu,
   not in play. Then try Escape for the same, and tell me what the browser does.
3. Fall a long way and jump again just before the ground. No damage. Then fall the same way without it.
4. The Great Shaft: float, leap, slam at once. You should not get under.
5. Ordric's shop: read the prices aloud.
6. Press **F2**, walk about, and read me the place from the far right of the Ossuary where your head caught.
7. Does the sword's reach feel right now, or too long? The dash?

### Build 80: the Glimmer, side-on

- **For the player:** the Glimmer (the crab-like ore creature in the Vein) is redrawn. The old one was drawn in a
  three-quarter view, as if seen from above and to one side; everything else in the game is seen from the side. The
  new one is side-on: a flat shell, its legs in a row under it, pincers in front, crystals standing straight up.
  This was "the crabs are at an angle" in the playtest of 20 Nov.
- **Its crystals are blue at rest as well as when it runs,** like the crystals of the Vein it hides among. (The old
  one's were grey-white at rest.)
- **It is the size the old one was.** The new drawing is larger, so it is drawn at three quarters.
- **How it was made:** four drawings were tried. Two were still at an angle or muddy, one was a smaller version that
  did not read, and the third is the one used. A seven-frame walk and its lighting maps.
- **Underneath:** `assets/side/px_glimmer_c` (new), `px_glimmer` removed; `regions/vein.js`, `annals.js`.
- **No change to how it behaves, to the motor, or to any room. Save: not moved.**
- **Checked:** the checks that touch it (the Vein's, the creatures', the misplaced-things check), and a look at it
  in the Vein in the test browser. The whole suite was last run for build 79; nothing it covers changed.
- **Not checked:** not played by hand. In the Vein's dark it is only seen by his lamp, so judge it there.
- **Cost:** about 5 of the account's 9,100 generations. No money.

### Build 79: under the water, and out of the walls

*Two things left from the playtest of 20 Nov: the slam that got under a barrier in the Deep, and the three faults in
the Cloister's rooms.*

- **The slam under the water: found and mended (a change to how he moves).** You placed it: deep water in the Deep,
  before he can swim. Deep water bears him up until he has the Wyrm's wind; a slam from the air into it was already
  ended at the surface. But a slam begun **while he floated** was never ended. Two things followed. He was held:
  no moving, no rolling, no striking, for as long as he stayed in the water. And a leap out of the water (jump, at
  its top) took him out of the water's hold for a third of a second, in which the slam carried on: seven metres
  straight down, to the floor of the water. From there he could swim under the drowned arch at the foot of the
  Great Shaft, or down the Workings' sump, both of which the water is there to bar.
  Now: no slam begins in deep water, deep water ends one however it began, and the ember slam is refused there
  before it spends anything.
- **The Cloister's three faults:**
  - **Two gargoyle pedestals stood in the nave's spike pits.** A pedestal is no longer set in or beside spikes.
  - **One gargoyle sat with its head in an overhang** (the stair). A corbel now needs room for the creature on it.
  - **The plank beside Mirel** (the belfry's first) ran to a tile and a half from her. It stops three tiles short.
- **The same faults elsewhere, found by the new check:** four house-moths in the Gardens began inside the floor above
  them; a flitter and two wisps in the Roots began in rock I put there in build 76; one of the Pump's Sunk lay half
  in a wall. All moved.
- **A check for all of it,** in every level: no creature begins with its body in rock, no pedestal or corbel is in
  spikes, no gargoyle sits in rock, and no plank, rock or spikes is where a person stands.
- **To try:**
  1. In the Workings' cistern, before the Wyrm: slam, jump, slam again. Can you get under by any means?
  2. Float and press slam. Can you still move afterwards?
  3. The Cloister's nave: are the gargoyles on the walls, and nothing in the spike pits?
  4. Mirel in the bell tower: is her space clear?
- **Underneath:** `motor.js` (three lines at the dive and the swim); `level.js` (the gargoyles' perches);
  `tests/side-under.test.mjs` (eleven ways of coming at every deep water, without the wind);
  `tests/side-faults.test.mjs`.
- **Save: not moved.**
- **Checked:** 446 automated checks. The check for the slam fails on build 78's code and passes on this.
- **Not checked:** not played by hand. I did not swim under the arch myself in a browser; the proof is his real
  movement run in the checks, reaching the floor of the water before the fix and never under it after.
- **Not found:** nothing else from the playtest's "tricky platform" remark, which you have since said was the
  spacing in general.
- **Cost:** nothing.

### Build 78: the broken list

*The eight things the playtest of 20 Nov found broken (`docs/playtest-2026-11-20.md`, section 2). Each was looked
for; what was found is below. Looking turned up four older faults nobody had reported.*

**From the playtest**

- **The Warden's barrier vanished mid-fight: mended.** Build 76 put a stone step in the hole up through its stage.
  The code that places the seal took the step for the top of the shaft, and shut the hole at its bottom, out of
  sight, with the hole open to fall into. The seal is at the stage again. A check now holds every keeper's hall to
  this.
- **The music stopped after a keeper fell and never came back: mended.** It was held silent from the keeper's death
  until he walked out of the region's exit, however long he stayed. Now only the keeper's own hall is silent.
- **The Cloister's music far too loud: it was the bell, not the music.** The recorded pieces measure within a decibel
  and a half of each other. The Cloister's bell rang on every beat at nearly full volume wherever he was within
  thirteen metres of one of its doors, about five decibels over the music, without end. It is now as loud as the
  door is near: about half what it was at the door, a sixth at the edge of hearing.
- **A keeper had to be fought again: two found and mended, yours not certain.** A beaten Housekeeper (the Gardens)
  and a beaten Almanac (the Firmament) stood again on every visit, and so did the Seated (the Spires). All three now
  stay beaten. I could not make the Warden or the Auger come back: through the Deep, home by the wall, a death, a
  reload. If yours was after a death in the Auger's pit, that is as built: it and its floors are back until it is
  beaten.
- **The Cracked Bell "just sitting there": as built, and changed.** It only moved when struck, and only rang by
  itself from half its strength. Woken and then left alone for five seconds with him in its hall, it now swings
  toward him and rings.
- **Portraits squished: it was the whole HUD.** Its picture kept a height of 180 while its width grew each time the
  view was drawn back, to 440 by 180 on a 16:9 screen. Every letter, portrait, icon and the map was drawn 37% taller
  than wide. It is 320 by 180 now: square. The letters are wider, so five places were refitted: the keys at the foot
  of the pause screen (five shorter lines, and they wrap), the pause menu (one large button and a row of small ones;
  six in a column ran over the keys), the count on the pause screen and the inventory's header (the small print),
  and a card's "how" lines (the small print, in their own colour).
- **His crouch with the spade: mended.** With the spade he only half crouched, six to eight pixels taller than with
  the sword, which read as a different move and put his head through low roofs. The nine frames are remade from the
  sword's crouch with the spade put in his hands. No art was bought.
- **The crabs drawn at an angle: not done.** No creature is a crab. It is one of five drawn in a three-quarter
  view; I need to know which before spending on a redraw.
- **"A little jaggy": not found.** Nothing in the game's own timing changed or looked wrong. In the test browser
  (no graphics card) the intro stalls for seconds at a time while the first region is built behind it; on a real
  machine that may be a hitch. Noted, not mended.

**Found on the way** (a note put in the middle of a line had made the code after it part of the note)

- **A fallen keeper's banner and its shards never came,** from build 56 to 77. "The Warden is beaten. The way up is
  open." and what it spills are back.
- **The Gardener's Seed did nothing** (healing for 7 embers and not 10), from build 69 to 77. It did nothing from 49
  to 66 for the same reason.
- **The Toll began a second rise with the first's leftovers** (where it had rung, whether it had slammed).
- **The place's name in the corner never brightened** when he came into a new room.
- A check now reads every line of the game for a statement inside a comment.

- **To try:**
  1. The Warden: is the hole in its stage shut while you fight? When it falls, is there a banner, and shards?
  2. After it falls, walk about the Roots. Does the music come back once you leave its hall?
  3. The Cloister: is the bell bearable now? Too quiet?
  4. Any text box: does the portrait look right? Do the wider letters read better or worse than the narrow ones?
  5. The pause screen and the Inventory: does everything fit on your screen?
  6. Crouch with the spade, and crouch-walk.
  7. The Cracked Bell: hit it once and stand back.
- **Underneath:** `seal.js` (new: where a hall shuts, apart from the drawing of it). `HUD.begin` takes the window's
  shape. `sfx.bell(volume)`. A creature's `spawn` hook is called whether or not it draws itself. `RULE.sat`.
- **No change to the motor. Save: not moved.**
- **Checked:** 431 automated checks. In the test browser: every HUD screen at 16:9, 16:10, 4:3 and a phone's
  shape, with a count of any text running off the picture (none); a save taken through the Deep and home; each
  wing's keeper beaten and the level entered again.
- **Not checked:** not played by hand. The bell's new loudness and the letters' new width are judged by eye and by
  measurement, not by ear or by a player.
- **Cost:** nothing.

### Build 77: from the playtest: the edge grab, roomier shafts, plain words, the goal

*Build 76 was played by two people on 20 Nov 2026 (`docs/playtest-2026-11-20.md`). This build is the part of what
they said that needs no change to the world beyond the Roots.*

- **The edge grab (a change to how he moves).** He takes an edge only on the way up: rising, or just past the top of
  a jump, and pressing toward it. Coming down he never does. Before, he took any edge in reach while pressing toward
  it, rising or falling, and among close shelves that was constant.
- **Roomier shafts in the Roots.** The well, the well's foot and the Ossuary's niches: shelves five or six rows apart
  (were six) with four clear tiles between their lips (were two). The well's chest and two crystals moved with their
  shelves, one row.
- **Plain words.** About two hundred lines rewritten to speak to the player: every hint, card, ability, relic, shop
  line, menu, map label, banner and keeper's line, the intro and the ending, and what the four people say.
  `docs/words-sheet.md` has the rule and every line before and after. "He" is "you". A measure is 10 embers. A knot
  is a relic slot. The water that raises him is a checkpoint pool.
- **The goal is said.** The intro says who you are and what to do. The pause screen opens with the goal and the next
  step. Each person's first two lines in a region say where you are and what to do. A way down into the Deep says it
  is optional and that the climb is up. A blocked way says what opens it.
- **Less text when something is given.** An ability's card has two lines of how; the rest is in the Inventory. A
  relic's card leaves its history to the Inventory. Banners wrap (long ones ran off the screen).
- **To try:**
  1. Go down the well by running off each shelf. Do you ever catch an edge you did not mean to?
  2. Go up it. Jump at a lip, pressing toward it: does he take it every time you mean him to?
  3. Jump a gap and arrive a little low. He no longer saves himself on the way down. Is that fair, or do you miss it?
  4. The intro: after it, can you say who you are and what you are doing?
  5. Pause in the first room. Is "GOAL / NEXT" the right amount, or noise?
  6. Talk to Ordric. Is that the right amount of direction?
  7. Pick up a relic and read its card. Do you know what it does?
  8. Go to the Pithead's hole. Does the warning stop you going down by accident, without nagging?
  9. Anything that still reads as vague: tell me the line.
- **Underneath:** `GRAB` and `topT` in `motor.js`. `goalLines` in `main.js`; the Deep's two notices in `wingStep`.
  The banner wraps in `hud.js`. Abilities have `more` lines (shown in the Inventory only). `docs/writing.md` has a
  new first section, "Two voices".
- **Changed outside the Roots, and why:** the middle dip of the Foundry's slag runs is two tiles wide (was three):
  its crossing needed a grab on the way down. Nothing else in any other level is moved.
- **Checks changed, and why:** the stuck-finder counts a perch left by a long, sore drop as left (it was only passing
  because he caught edges falling). The first-pass reach check lets a jump begin from the lip of a shelf with
  another over it; his real jump is still the judge. The Aqueducts' "nothing rises through falling water" allows
  the first plank, which can be flown onto from outside the water and leads nowhere. Three new checks hold the grab
  rule.
- **Save: not moved.** Two new marks in it (the Deep's notices having been shown).
- **Checked:** 420 automated checks pass (418 in the full run; the other two were checks pointing at moved things, mended and run again alone), his real jump through every room of all eleven levels with the
  new grab. In the test browser: a fresh start through the title, the intro and the first room; Ordric and his shop;
  the pause screen; the Inventory; the Pithead's warning.
- **Not checked:** not played by hand. I cannot judge whether the grab now feels right; that is the first thing to
  try. The words were read by me, not by a player.
- **Not done from the playtest, on purpose:** everything under "Broken" and "Set aside" in the playtest's list,
  except the words and the goal. The Cloister's pass waits, as you said.
- **Cost:** nothing.

### Build 76: the map pass, pilot: the Roots in stone

- **For the player:** the Roots, its wing (the Ossuary) and its quick way (the well's foot) no longer change height
  by planks hung in the air. Climbs are stone: shelves out of one wall and then the other, boulders and pillars up
  from the floor, rock hung from the roof, stairs and stepped floors. **84 planks became 17.** The 17 are the rungs
  of four ladders (each in a narrow flue, wall to wall), two steps off a wall, and two stagings on posts or legs.
  None is bare in the air, and no rock is joined to nothing. `docs/map-pass-sheet.md` has the rule, the budget, what
  the pilot taught, and every room before and after.
- **Nothing found has moved** beyond a tile or two: every thread, chest, relic, person, shrine and water is where it
  was. Rooms, doors and their order are the same. The corridor's spike pit is two tiles further west and five wide
  (it was six), so that the boulder by Ordric's door stands clear of it.
- **Planks are drawn held up**, in every timber region: a strut under an end let into rock, a post under a free end
  with ground below it, a rope up from a free end with rock over it.
- **Other ten levels: untouched,** to be compared with. A new check holds each to the planks it has today, so none
  gets worse before its turn.
- **To try** (Try a place, the Roots):
  1. Water to Warden: does each room have a shape now?
  2. The well, two screens of shelves: a climb you enjoy, or a chore? Is six rows right?
  3. Anywhere your head strikes stone when you meant to go up: which room?
  4. The Pithead's ladder and the Sexton's: do they read as ladders?
  5. Ordric's roof without the plank: clear?
  6. Do you miss dropping through a plank anywhere?
  7. Then the Cloister, untouched. Which would you rather the whole mountain was?
- **Underneath:** `shelf`, `pier`, `hung` in `rooms.js`; the Roots' rooms in `level.js`, the Ossuary's in
  `regions/ossuary.js`, the well's foot in `seams.js`; the supports in `paint.js`. New: `tests/helpers/platforms.mjs`
  (counts planks by what they touch, and rock joined to nothing) and `tests/side-platforms.test.mjs` (the budget).
- **Checks changed, and why:** three pointed at planks that are gone (a mantle and a drop, in the chamber; "the first
  room has planks"). They point at the Pithead's deck and ladder and the corridor's step now. The first room no
  longer teaches dropping through a plank, because the way up through the Roots has none; the hint still comes the
  first time he stands on one holding down.
- **Found by the checks while building, and mended:** a boulder tucked under a shelf in the Ossuary that he could
  not pass either way; a boulder that shut Ordric into his room; a slot behind a heap he could drop into and not
  leave; stacked shelves that struck his head. **Found by eye:** the pass that wears the rock smooth had filled the
  bridge's chasm between the new pillars; it is marked to stay open.
- **No change to the motor.** **Save: not moved.**
- **Checked:** 417 automated checks, all passing, his real jump through every room of the Roots with what he has
  on arrival and with everything; nowhere he can stand that he cannot leave. Fifteen rooms looked at in the test
  browser, desktop and phone.
- **Not checked:** not played by hand. The Warden's fight was not fought again with the stone step in its stage.
- **Cost:** nothing.

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
