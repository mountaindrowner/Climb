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
| 90 | 23 Nov 2026 | `bd14458` | The hammer's plunge: a drawing of its own, he rides it down | no | yes (now) |
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
