# Phase 6: creatures (the sheet)

For approval before building (`docs/roadmap.md`, the finish line). The guide: Hollow Knight and Dead Cells first, then
Castlevania. Hard but fair; every creature can be read before it hurts him.

## What is there now

| Region | Creatures (count) |
|---|---|
| The Roots | flitter 9, acolyte 4, wisp 4, crawler 3, spitter 3, burrower 1, the Sexton |
| The Cloister | acolyte 7, gargoyle 7, wisp 5, flitter 2, crawler 1, burrower 1 |
| The Spires | harpy 12, wraith 7, yeti 5, burrower 1 |
| The Tempest | nimbus 8, spark 7, harpy 5, squall 4, wraith 3, yeti 1 |
| The Gardens | puff 9, lasher 6, thornback 5, harpy 4, toad 3, gargoyle 2, squall 1, nimbus 1 |
| The Firmament | mote 14, sentinel 4, oculus 6, wraith 2, squall 2 |
| The Workings | crawler 4, flitter 4, lamprey 3, barnacle 3, burrower 1 |

What is wrong with it (the playtests, and reading the code):
- Walkers stand still until he is near, then chase. None patrol. They chase to the end of the region's floor.
- The worm comes up at its own fixed spot, every time. It can be ignored by not standing there.
- The Roots' green spitter has a weak warning and no death of its own.
- One hit sound, one kill sound and one spit sound serve every creature.
- The acolyte and wisp are in both the Roots and the Cloister, in numbers; the harpy is in three regions.

## 1. How every creature behaves

One rule set, in one place, for all the walkers (crawler, acolyte, yeti, squall, thornback, sentinel, the Sexton):

- **Patrol.** At rest it walks a beat: from its post to the nearest wall or edge each way, at most 6 tiles, turning at
  the ends, pausing a moment at each. Never off an edge.
- **Notice.** By sight: within its range, on its side of any rock, and in front of it or within 2 tiles behind. It shows
  it has seen him: a start (it stops, a mark over it, its own sound) for a third of a second. Then it comes.
- **Chase, within limits.** No further than 12 tiles from its post, and not off its floor.
- **Give up.** If it has not seen him for 3 seconds, or is at its limit, it stands a moment, turns, and walks home.
- **Fliers** (flitter, gargoyle, harpy, wraith) get the same notice and give-up, and a tether to their roost.
- **Shooters** already fire only with a line of sight (build 43). They get the notice mark and sound too.

A test plays each walker: it patrols, does not leave its floor, does not see through rock, comes home.

## 2. The worm, redone

- **It hunts him under the floor.** Once it has noticed him it travels under the floor toward him as a ripple: a hump of
  broken ground and dust that can be seen and heard, at about his walking speed.
- **It strikes where he will be:** it aims ahead of him by how fast he is moving, under the floor he stands on.
- **A warning:** the ground shakes and cracks for 0.45 s at the spot before it bursts out. Moving off the spot avoids it.
- **Out of the ground** it stands 1.2 s, snapping, and can be cut. Then it goes under and hunts again.
- It can't follow where there is no floor to be under (a plank, air), and keeps to its own stretch of floor.
- **Art:** one new drawing, the ripple (a small strip, or drawn in code), and its bursting out redrawn with more force.

## 3. The Roots' green spitter, to the lampreys' standard

- **Warning:** it swells and brightens through its charge, and a line of light points where the shot will go for the
  last 0.3 s.
- **Shot:** a glob with a trail, which bursts on rock.
- **Death:** it bursts, in its own colour, rather than the common puff.
- **Art:** a new charge and a death, to match the lamprey's.

## 4. A sound for every creature

Made in code (no cost), from each creature's nature, three each where they apply: **notice**, **attack**, **death**.
Families share a voice at different pitches: the crawlers a chitter; the fliers a screech or a wing-beat; the spitters a
wet gulp; the acolytes and the Sexton a low human-like grunt; the storm's creatures a crackle; the Gardens' a rustle or
a pop; the Firmament's a glassy chime. Sounds follow the Sound volume and are quieter with distance.

## 5. Each region's creatures have a job, and its own mix

| Region | Change |
|---|---|
| The Roots | Keep the crawler, flitter, spitter and the worm as its own. **The acolytes leave the Roots proper** (they stay in the Ossuary, with the Sexton) and the wisps become spitters or flitters. |
| The Cloister | The acolyte, gargoyle and wisp are its own. Its stray flitters and crawler become gargoyles and acolytes. |
| The Spires | Fewer harpies (12 to about 7), placed to harry the open climbs; yetis guard the ledges; wraiths in the closed halls. |
| The Tempest | Its harpies become sparks or nimbus; the lone yeti goes. |
| The Gardens | Its harpies and gargoyles go; the lasher, puff, thornback and toad carry it. |
| The Firmament, the Workings | As they are. |

Each creature's job is written beside it in the region's file (block a path, guard a ledge, harry a climb), and a test
checks that no creature is in more than two regions and that every region has at least three kinds.

## Cost

- **Art:** the spitter's charge and death, the worm's burst (and perhaps its ripple): 3 or 4 drawings with light maps.
  The last eleven drawings cost $0.06 together; the balance is $3.37.
- **Size:** one build.

## Left for later

- New creatures for the wings and the Deep (phases 10 to 17).
- The keepers (phase 7).
