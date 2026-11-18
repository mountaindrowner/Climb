# Phase 9: one continuous mountain (the sheet)

For approval before building (`docs/roadmap.md`, the finish line). Decision 0.7 is the rule: **one continuous climb;
the passages between regions do the loading.**

## What is there now

- **Going up is a cut.** After a keeper he touches a beacon in its hall. The picture goes dark, a card shows the
  mountain, the next region is made, the picture comes back. He is at the foot of the next passage.
- **He cannot walk back down.** A region below is reached only from the menu.
- **The five passages are three screens each** (a foot with the raising water and Ordric's lamp-room, then two
  screens up). The world plan (`docs/world.md`) gives them six to eight.
- **A keeper's fall changes nothing in its region.** The regions also have nothing of their keeper's in them to
  change: no doors on the bells' beat, no wind on the Spires' faces, no storm on the Tempest's rods, no thorn walls.
- **One shortcut exists** (the Roots' old ladder).
- **Measured, going into a region:** making its rock about 50 ms; setting up its scene 20 to 40 ms; setting up its
  creatures and keeper 40 ms in most regions, but **1.2 to 1.7 s in the Cloister and the Gardens**. Its paintings are
  already made in the background.

## 1. The join: he walks from one region into the next

- **The beacon goes.** When a keeper falls, a way out of its hall opens: a real opening in the rock, where the beacon
  stood.
- **A landing, shared by both regions.** Through the opening is one plain room, the landing: no creatures, no water,
  nothing that moves. The same room, tile for tile and painted the same, is the top of the region below and the bottom
  of the passage above.
- **The change happens as he crosses the middle of it.** The region below is let go and the one above is put in its
  place around him. He, the view and the room do not move. Nothing goes dark and no card is shown.
- **The region above is made ahead,** in small pieces, from the moment its keeper falls and while he walks to the
  landing: its rock, its paintings (as now), its creatures and keeper. The 1.2 to 1.7 s is found and broken up. The
  aim: **no frame longer than 50 ms at the join**; a test measures every join, in both directions.
- **It works downward too.** He can walk back down any passage, through the landing, into the keeper's empty hall
  and the region below it.
- **The region's name** comes up as he steps into its first room, as now. The mountain card on the way up goes (see
  decision 2).
- **A fall** still raises him at the raising water of the region he is in. The landing counts as the region above.

### As built (build 56): the join

- **The sill.** Beyond each keeper's hall is a tunnel through a mass of rock, two and a half screens wide. It is the
  same, tile for tile and pixel for pixel, in the region below (beside the hall) and in the region above (at its very
  foot). It is painted once, on its own, and laid into both. From its middle nothing else is in view.
- **The change** happens one step past the sill's middle. He, his scarf, the view, the dust in the air, the mist and
  the light are carried over. **Measured on all five joins, up and down: the frame where the region changes differs
  from the frame before by no more than any two frames of walking do.** The height on the mountain reads the same on
  both sides.
- **What it costs:** 45 to 70 ms in the slow test browser (a real machine is several times faster). The region above
  is made ahead: its rock while the screen is dark on the way into the region below, its paintings from the moment its
  keeper falls.
- **The way out of each hall:**

| Hall | Way out | Then |
|---|---|---|
| The Warden's | The niche behind the cracked wall (the spade opens it, as before), now open at its back | West, up a short stair, into the sill |
| The Toll's | Through the east wall at the floor, sealed with stone until the Toll falls | Straight into the sill |
| The Wyrm's | Through the east wall, sealed | Over an arch of rock across the open air to a cliff, and into it |
| The Thunderhead's | Through the west wall, sealed | Into the garden wall's own stone |
| Mother Thorn's | Through the east wall, sealed | Over an arch of rock to a cliff, and into it |

- **The seal** is stone drawn like cracked stone, but the spade does not break it. It comes down, with dust, when the
  keeper falls. Tests hold that no gift gets past it.
- **A keeper that has fallen stays fallen.** Walking back down, its hall is empty. (Before, going back into a region
  from the menu raised its keeper again.)
- **Walking down** works at every join. Creatures are raised again when a region is come into, as after a fall.
- **The beacon and the mountain card are gone** from the five joins (decision 2 as recommended). The summit keeps its
  beacon: it is the end.
- **Also changed:** the light on rock and on him now follows the look of the room he stands in (it was always the
  region's own, even in a room that wore the look of the region below); the rooms he has seen stay on the map when he
  leaves a region; the corner map and the place line change at the join, since they show the region.
- **Phone mode, or a machine too slow to have the next region ready:** the old way, through a short dark, coming out
  at the same place in the sill.
- **Not done:** the time is not yet measured on a real machine or a phone; the corner map changes abruptly at the
  join; in the Spires and the Gardens the cliff the sill is in is plain rock, not yet dressed.

## 2. The passages, lengthened

*Built (builds 56 and 57), with decision 1 as recommended: the new screens are below the raising water. Each region
above has two or three rows added under it: the sill, then the passage's lower stretch, which comes up through the
floor of the raising water's room. Screens now: the Crypt Stair 6, the Bell Road 9, the Last Hut 9, the Breach 6, the
Long Stair 9.*

| Passage | As built (build 57) | Differs from the table below |
|---|---|---|
| The Crypt Stair | **The lower flights:** a stair up to the west wall with water running down it, ledges back over it, a long plank across the top of the well. Four founders' tombs, lids pushed aside, a name over each, the oldest lowest. Dark: crystals, one torch at the top. Nothing alive | |
| The Bell Road | **The gate stair and the road:** a stair, ledges back over it, a long terrace; then the road over the sill's crown. Six shrines of carved names with candles. Seven grey pilgrims walk their stretch or stand at a shrine; they take no notice of him and cannot be hurt | It is inside the mountain, not in the open: the rows under a region are rock, and the cliff the Spires' own sill stands on is to the east |
| The Last Hut | **The lee slope:** terraces east and west by turns, in the last of the ice. Cairns, packs put down, ropes left fixed. Two wraiths | The wind does not yet drop as he climbs (there is no wind in the Spires until phase 9b) |
| The Breach | **The storm side:** two banked beds with a lasher on each, a nimbus over them, torn trellis to climb, a gate hanging by one hinge | Six screens, not eight. No standing water on the beds |
| The Long Stair | **The swept flights:** a stair, ledges and a terrace; then twelve long steps in one straight line. The Sweeper is on each flight, a few steps ahead, seen from behind; it keeps ahead of him and where the flight ends it is gone, leaving the dust it raised. Nothing hostile | The Sweeper and the pilgrims are the acolyte's drawing, tinted (decision 3 as recommended); new drawings are on the wishlist |

| Passage | Screens (now 3) | The new stretch, below the water | Then, as now |
|---|---|---|---|
| **The Crypt Stair** (Roots to Cloister) | 6 | **The lower flights:** dark, water running down the steps toward him; the founders' tombs open and empty, the oldest lowest, a name over each. Nothing alive. A winding stair, with one long drop beside it | the water on the stair's landing and Ordric; the upper flights, lit from above |
| **The Bell Road** (Cloister to Spires) | 8 | **Out of the house's gate into the open:** switchbacks up a bare slope, a shrine at each turn covered in carved names. **Grey-threaded pilgrims** walk it: some going up, some sitting, a few coming down. They do not fight and do not answer | the gate, its meltwater and Ordric; the road up |
| **The Last Hut** (Spires to Tempest) | 6 | **The lee slope:** the last of the ice, climbers' cairns, ropes left fixed, packs put down by those who turned back. The wind drops as he climbs. A wraith or two in the open | the path, the water and Ordric under the hut; the hut |
| **The Breach** (Tempest to Gardens) | 8 | **Storm and garden both:** torn trellis, drowned beds, rain on flowers, a gate hanging by one hinge. A nimbus over the rose beds, lashers in the rain. The only passage with a fight in it | the wall's foot, the water and Ordric in the wall's cellar; the breach, and sun above it |
| **The Long Stair** (Gardens to Firmament) | 8 | **The swept flights:** a step for every day of the year, clean. **The Sweeper** is always a few steps ahead: seen from behind, never caught up with, never turns round. Nothing hostile | the stair's one landing, the water and Ordric: here the sweeping stops, and he has never gone above it; the unswept flights |

- **Shapes** (decision 0.8): none is a straight shaft. The Crypt Stair winds round a drop; the Bell Road is
  switchbacks in the open; the lee slope is one broad climb; the Breach goes through the wall's rooms; the Long Stair
  is the one long straight thing on the mountain, on purpose.
- **Each still starts in the look of the region below and ends in the look of the one above,** as the three screens
  do now, over more room.
- **The pilgrims and the Sweeper** are drawn from what there is (decision 3).

## 3. Each region has its keeper's rule in it, and the rule ends when the keeper falls

To have something to change, each region first gets one thing that is its keeper's. It makes the region harder or
slower while the keeper stands, never impassable: a test climbs every region to its keeper with the rule on, and again
with it off.

| Region | While its keeper stands | When it falls | What that opens |
|---|---|---|---|
| **The Roots** (the Warden's weight) | Low places: stretches of roof pressed down to crouching height, on the quick ways through | The weight lifts: those roofs stand at full height | The quick ways; two nooks behind them |
| **The Cloister** (the Toll's bells) | A bell tolls every few seconds. Four doors open and shut on it; the acolytes walk on it | The bells stop. The doors stay open. The acolytes stand at their posts, heads down, and fight only if struck | The Cloister crossed without waiting |
| **The Spires** (the Wyrm's wind) | Gusts on three open faces push him down and away from the rock, in beats he can read | The wind turns: where it pushed down, it now lifts | Three ways up that were not there; a high ledge on each |
| **The Tempest** (the Thunderhead's storm) | Rain. The iron rods are struck in turn, each with a warning; near a rod as it is struck, he is hurt | The storm breaks: the rain stops, the sky clears, the rods are dead iron | The gantries beside the rods; the sky seen for the first time |
| **The Gardens** (Mother Thorn's hold) | Thorn walls close four passages: they hurt to touch and the blade does not cut them | What she held she lets go: the walls wither to grey husks he walks through | The overgrown passages |

The Firmament has no such change: the Fallen's fall is the ending.

## 4. The given shortcuts

- **One per region, from its raising water to its keeper's hall,** so a finished region is crossed in about a minute.
  That is what makes walking down the mountain worth doing.
- **Each is the keeper's change itself, or stands beside it,** and each is found already open, with a sign that
  someone was there first:

| Region | The quick way | The sign |
|---|---|---|
| The Roots | Planks and a knotted rope down the well, from the water to the Warden's hall | Ordric's knot on the rope |
| The Cloister | The bell-stair's doors, all open, straight up the tower | A lamp left burning at each door |
| The Spires | The turned wind: three lifts, one above another | A red strand tied where each begins |
| The Tempest | The dead rods' gantries, end to end | Rain-water swept from them |
| The Gardens | The withered passages, straight through | Husks cut back from the path |

- Corwen's map marks each quick way once he has been through it.

## Decisions for you

1. **Where the new screens go.** *Recommended: below the raising water,* as above. The other way (water first, then
   the whole passage) would add five screens to every walk back after a fall.
2. **The mountain card.** *Recommended: it goes.* Nothing interrupts the walk. The picture of the mountain could come
   back later as a page of the map.
3. **The pilgrims and the Sweeper.** *Recommended: no new art now.* The pilgrims are the acolyte's drawing in grey;
   the Sweeper is a small figure drawn in code. New drawings for both go on the standing list
   (`docs/pixellab-wishlist.md`); the balance is $3.33.

## Cost

- **Art:** none, with decision 3 as recommended.
- **Size:** three builds.
  - **9a:** the join, both ways, measured; the five passages lengthened.
  - **9b:** the keeper's rule and its ending in the Roots, the Cloister and the Spires, with their quick ways.
  - **9c:** the same in the Tempest and the Gardens; the map's marks for the quick ways.

## Left for later

- The wings and their gates (phases 10 to 14).
- The way down to the Workings keeps its short fade until the Deep is built (phases 15 to 17), unless the join turns
  out to cost nothing extra there.
- Travel through the water (phase 16).
