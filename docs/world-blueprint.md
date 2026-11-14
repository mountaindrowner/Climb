# The World Blueprint: doubling or tripling the mountain

A plan, not a commitment. The world to triple it is now set out section by section in `docs/world.md` (with
`docs/world-section.png`), which replaces the list of wings and seams below; the measurements and engine work here still
stand. The picture is `docs/world-blueprint.png`: the six regions as they are (solid, drawn from the
real tile maps, with the spawn, flames, people, keeper and way on marked), and what this plan would add (dashed).

## Where the world is now (build 21)

A room is 40 x 23 tiles; a "screen" is one room's worth of area.

| Region | Grid | Rooms | Screens | Open | Creatures | Urns | Chests | Load (ms) |
|---|---|---|---|---|---|---|---|---|
| Roots | 4 x 6 | 12 | 16 | 40% | 14 | 13 | 5 | 2659 |
| Cloister | 4 x 4 | 8 | 16 | 65% | 21 | 10 | 4 | 1385 |
| Spires | 3 x 8 | 12 | 20 | 72% | 24 | 10 | 4 | 1571 |
| Tempest | 3 x 9 | 10 | 19 | 72% | 27 | 14 | 5 | 1368 |
| Gardens | 3 x 6 | 10 | 16 | 84% | 24 | 10 | 5 | 1126 |
| Firmament | 3 x 7 | 12 | 19 | 76% | 26 | 10 | 5 | 1821 |
| **All** | | **64** | **106** | | **136** | **67** | **28** | |

Load is the time to enter a region in a headless browser; almost all of it is painting the region's layers, and it grows
with area. So doubling the world doubles the wait at every region's door unless painting changes first (see Engine).

What these numbers say:
- **Every region is a single climb.** There is one way up and nowhere else to go; the abilities (the Warden's weight,
  the Toll's step, the Wyrm's wind) open almost nothing behind you. That is the biggest thing missing for a
  metroidvania, and more area fixes it only if the new area is *off* the climb.
- **The upper regions are mostly air** (72 to 84% open). They already read big; what they lack is places to be.
- **The Roots are cramped** (40% open), which is right for the dark, but it is the first region and it is the smallest
  in feel.

## The principles

1. **Keep the climb about the length it is.** At most a third longer. The way up is the story; it should stay brisk.
2. **Grow sideways, not upward.** Each region gets two **wings** off the climb, west and east. A wing is optional, has
   its own look within the region, and is closed at first by something he cannot yet do, so the mountain asks him to come
   back. That is where the metroidvania lives.
3. **Every wing earns its space.** Each has: a **landmark** (a thing you would describe to a friend), a **hard fight**
   (an elite, or a lesser keeper), a **reward** (a relic, threads, a flask draught), one of the three people somewhere
   in it or on its way, and a **shortcut** back to the climb, opened from the far side.
4. **Sell the scale with sight-lines.** At least one place per wing where the camera pulls back and the mountain shows
   how big it is: the climb you came up, seen across the gulf; the next region's light, above.
5. **One mountain.** A wing is of its region, and its far end may glimpse the region above or below (the regions already
   cross-fade at their doors; wings can use the same `look` blend).
6. **Allude, never explain.** Each wing's landmark is a piece of the story told by a place (see each wing below).

## The wings

| Region | West | East |
|---|---|---|
| Roots | **The Drowned Galleries**: halls the water took. The pool is their last room. Open from the first. | **The Ossuary**: where the fallen are laid. Behind cracked stone: the Warden's weight. |
| Cloister | **The Scriptorium**: the house's books, copied for a flame no one read by. The Toll's step. | **The Bell-Foundry**: where the Toll was cast; a second, cracked bell. The Warden's weight. |
| Spires | **The Pilgrims' Cairns**: stones left by those who turned back. The Wyrm's wind. | **The Glacier Galleries**: climbers frozen where they sat (the Stopped come from here). The Toll's step. |
| Tempest | **The Wreck of the Works**: the machines that tried to catch the lightning. Open. | **The Eye of the Storm**: still air, and the Thunderhead's empty seat. The Wyrm's wind. |
| Gardens | **The Aqueducts**: what carried the water up to the keepers. Open. | **The Keepers' Houses**: their rooms as they left them. The Toll's step. |
| Firmament | **The Orrery Wing**: the brass sky, still turning. Open. | **The Shard**: the sliver that broke from the top the night he fell. Everything he has learned. Secret. |

Two rules for the gates: every region has at least one wing he can enter on the way up (so the world feels wider at
once), and every ability opens at least one wing he has already walked past (so going back is rewarded). The table above does both: the Warden's weight opens the Ossuary and the Bell-Foundry; the Toll's step opens
the Scriptorium, the Glacier Galleries and the Keepers' Houses; the Wyrm's wind opens the Cairns and the Eye.

**Size:** two wings of about 9 screens per region, 12 in a few, is **+111 screens: 106 now, about 217 doubled.**

## The third layer (to triple)

Between each pair of regions, a **seam**: a short zone of its own, 6 to 10 screens, that is neither region and both. It
is where "how can this fit here?" is answered by walking it.

| Between | Seam |
|---|---|
| Roots and Cloister | **The Crypt Stair**: the house's dead, buried as near the water as they could be |
| Cloister and Spires | **The Bell Road**: the pilgrims' road up from the house, with its shrines |
| Spires and Tempest | **The Last Hut**: the climbers' last shelter, where the weather turns |
| Tempest and Gardens | **The Breach**: where the storm tore through the garden wall |
| Gardens and Firmament | **The Long Stair**: the keepers' stair to the summit, swept until it wasn't |

Five seams at about 8 screens, plus a third, smaller wing in the three tallest regions, is about **+100: about 320 in
all, three times now.** A seam can be built as the last room set of the region below, so the region count stays at six.

## How to build that much

Hand-building 200 more screens room by room is months. The rooms we have are already part-built by rule
(`organic()` carves them; marks are placed by rule; reachability and physics are tested). So:

- **Anchor rooms by hand**: each wing's landmark room, its fight, its gate and its shortcut. About 4 per wing.
- **Fill rooms from a chunk library**: hand-drawn chunks (a shaft, a ledge run, a bridge, a crawlspace, a ruin) that
  the existing carver joins and roughens, per region theme, from a fixed seed. A seed means the world is the same every
  time, which the save needs (what he broke, found and opened is saved by place).
- **The tests already gate it**: `side-level` checks every room is reachable with the moves he has when he gets there;
  extend it so a wing is *not* reachable before its gate, and *is* after.

## Engine work first

None of this is safe until these are done. **Done (build 26):** painting off the page and ahead of him (a worker paints each region and keeps it; the next is painted while he climbs; the longest stop going into a region fell from 3.2 to 3.7 s to 0.4 to 0.5 s on a software-drawn browser), sleeping creatures, and the scrolling map with the whole map in the pause. Travel between flames and memory on phones wait on two decisions (below).

1. **Paint by room, not by region.** Paint the rooms near him and paint the rest as he nears them (or in idle time).
   Region load drops from 1.1 to 2.7 s to a fraction of a second whatever the size. This is the must-have.
2. **Sleep distant creatures.** 136 now; 270 to 400 after. Only rooms near him think.
3. **A real map.** The corner map shrinks a whole region to fit; at double it is unreadable. A scrolling corner map
   centred on him, and a full map in the pause, with wings shown greyed until found.
4. **Travel between flames.** With wings to come back to, walking back down through cleared regions gets old. Ordric
   keeps the flames; he can carry him between the ones that are lit. (Cost and gate are a design call; see below.)
5. **Memory on phones.** Painted layers are big textures; painting by room also lets far rooms be freed.
6. **Save by place.** Already true for most of it; check every new mark keeps a stable id.

## Phases

| Phase | What | Proves |
|---|---|---|
| 0 | Paint by room, sleep far creatures, scrolling map | The engine can carry double without a longer wait |
| 1 | One wing, by hand: the Drowned Galleries (Roots, west) | What a wing should feel like; how long one takes |
| 2 | The chunk library and the seeded filler; then the other eleven wings | **Doubled** |
| 3 | Travel between flames; the five seams; the third wings | **Tripled** |

Phase 1 is the honest test. If one wing by hand is good, the library is drawn from it.

## Decisions for you

1. **Double or triple?** The plan reaches double first either way; triple is phase 3.
2. **Wings off the climb, or a longer climb?** The plan says wings. A longer climb is simpler but leaves the abilities
   with little to open.
3. **Hand-built or generated?** The plan says landmarks by hand, the rest from chunks with a fixed seed. Fully by hand
   is better and much slower; fully generated is fast and forgettable.
4. **Travel between flames?** Free, for shards, or not at all?
5. **Are phones a target?** It changes how hard phase 0 has to work on memory.
