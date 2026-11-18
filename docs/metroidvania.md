# Making The Climb a Metroidvania

A second pass over the *Metroidvania Design Research Compendium* (player surveys, developer postmortems, map-construction
practice, reachability testing), looking for ways to apply it that only this game could have. The compendium's idea in
one line: **the same world changes meaning as the player changes.** This is how The Climb can do that in its own terms:
through what is already true of it, the water that gives him back, the undertow under every section, the three people,
and the rule that the answer is always something given (`docs/world.md`, *The undertow*).

Nothing here names the undertow in the game (`docs/writing.md`). These are for the builder.

## Where we stand

| The compendium's test | The Climb now |
|---|---|
| Gated progression (fans' most defining trait, 4.61 / 5) | One gate in the whole game: the Ossuary, behind the Warden's weight. The Toll's step and the Wyrm's wind open nothing he has walked past |
| Rewarding backtracking (4.36) | Almost none: the climb goes up and does not come back |
| Interconnection | Five seams join the regions; one shortcut (the deadhouse stair); the Deep is off the Roots |
| Secrets (4.30) | Cracked stone is drawn the same everywhere (a learnable rule); two walled-up nooks in the Roots (the shaft, the gallery) and one in the Cloister; relics in chests |
| A map that holds memory | Rooms visited, flames, the keeper, the people; what is left, with the compass. No unexplored or blocked exits, no completion |
| Checkpoints and runbacks | A flame or three a region; the Roots has one for eighteen rooms. Keeper entrances short and skippable after the first |
| Reachability testing | Ahead of most: a reachability model and the real motor, both ways round a gate |

The work is not more area. It is making what is built **change** as he does.

## Seven ideas only this game could have

### 1. The water is the fast travel, and it is given late

Travel between flames is a later ability (decided). The world already has the reason for it: *the water gives him back*,
and the Flooded Levels' history says the pool's water "had been under the whole mountain all along". So travel is the
water itself. Every flame stands by water (a basin, a font, a cistern). Once the Wyrm's wind carries him under water
(the Flooded Levels), he can go down into any water he has found and **come up in any other**, the way he is given back
after a fall, only now by choice. The compendium's advice (physical loops first, fast travel late, and do not withhold
it if travel becomes a chore) is met by the story's own timing: he cannot use the water until he has gone deepest.

- *Built on:* the pool (`props.js`), shrines, the Wyrm's wind, the Flooded Levels.
- *Until then:* loops and one-way shortcuts carry the load (ideas 3 and 4).

### 2. Corwen keeps the map

The compendium's "player's knowledge map" is a person here. Corwen the Annalist writes the mountain down as he is told it:

- **Rooms seen from a doorway** are pencilled in; **visited**, inked.
- **A way he saw but has not taken** is left open on the page; **a way he could not take** gets Corwen's mark (a small
  glyph for what stopped him: cracked stone, a gap too wide, the dark, rough rock), so after a week away the page still
  says *you could not, then*. When he learns the gift, the marks that gift answers **glow** on the map (the
  compendium's `newly_available`, only shown where the logic proves it: idea 6 computes it).
- **His falls** are on the page too, as Corwen's tally (the Ossuary's count, kept by someone else). The Sexton's Stylus
  strikes them through.
- **A page is sealed** when everything on it is found: Corwen's seal, not a percentage.

This keeps the map in the fiction, gives the three map states the compendium asks for (unknown, seen, visited) and the
memory tools fans ask for most (blocked exits, newly open, complete), and never draws an arrow.

### 3. Shortcuts are given, not won

Every section's answer is something given (`world.md`). The compendium says a shortcut is "geographical progression".
Here, many shortcuts are **found already opened** when he comes back: after a keeper falls, someone has been there.

- After the Warden: a rope lowered down the well (from the grotto's flame to the arena), Ordric's knot on it.
- After the Toll: the Bell Road's gate stands open from above, so the Spires' first flame is a drop from the Cloister.
- After the Wyrm: the Long Stair is swept, one flight at a time, by no one he sees. Each time he comes back, more of it
  is clear.
- In the Deep: the lamps he lit **stay lit** (Hob's lights burn out; the ones he lights do not), and lit lamps are a path
  back up.

These are **event gates** that the compendium recommends mixing in, and they carry the undertow without a word.

### 4. Each keeper's fall re-tunes its own region

The compendium's tall-shaft example: the same room means something new with each ability. Here, the same region changes
when its keeper falls, so going back down through it is new:

| Keeper falls | What changes in its region | What that opens |
|---|---|---|
| The Warden | The weight lifts: low places where he had to crouch or roll stand open to full height | Fast routes through the Roots; the nooks behind them |
| The Toll | The bells stop: the acolytes stand still at their posts; the doors that opened and shut on the beat stay open | The Cloister crossable without its rhythm; the Bell-Foundry door that the ringing kept shut |
| The Rime Wyrm | The wind turns: updrafts rise where gusts pushed down | New ways up the Spires' faces; the Cairns' high ledges |
| The Thunderhead | The storm breaks and the rain stops; the rods go dead | Climbable rods; the Wreck's machines quiet enough to walk through |
| Mother Thorn | What she held, she lets go: the thorn walls wither | Overgrown passages in the Gardens |
| The Fallen | (the ending) | |

### 5. Knowledge gates in the shape of each place

The compendium recommends a minority of gates solved by understanding (*Toki Tori 2*). Here, the thing to understand is
the shape of the place, and the answer is usually **to stop doing something**. Shown, never told.

- **The Cloister (the hours rung for nothing):** a door that opens only when he does *not* strike the bell beside it.
  Every strike resets it; waiting under it opens it.
- **The Scriptorium (copy it again):** a page that will not let him past while he keeps correcting it. When he lets the
  blot stand, the way opens.
- **The Bell-Foundry (the alarm that will not stop):** the cracked bell rings when he comes near, and every door shuts
  while it rings. He learns to stand and guard until it stops. *Built (build 61) as the whole wing's rule: iron rings
  when it is touched, and while it rings the shutters are down; the answer is to touch nothing, and to wait.*
- **The Pilgrims' Cairns (turning back):** a path that is only there when he walks *toward* the dark, not away.
- **The Eye of the Storm (the calm that is worse):** it is safe while he moves; the way on is out into the wall of the
  storm, where the wind carries him.

One or two a region, no more, each with a clue in the room.

### 6. Measure what each gift opens

We already play every region with the real motor and the reachability model. Run them **once per gift set** (none; the
weight; the weight and the step; and so on) and the difference is a report the compendium only describes as a goal:

- **Revisit value:** for each gift, how much of each built region it newly opens, and where. If a gift opens nothing
  behind him, the report says so.
- **A gift needed to reach itself:** fails the build.
- **Runbacks:** steps from each flame to each keeper and to the far end of each wing, from the same graph (the
  compendium's checkpoint audit). Too long fails.
- **Corwen's glowing marks** (idea 2) come from the same report, so the map never says a way is open when it is not.

### 7. Rough rock everywhere, from the first room

The Auger's grip climbs rough rock (never ice, brass or glass). Draw rough rock as its own material, the same in every
region, from the Roots on, long before the grip is found. Players will see it and wonder (the compendium's best-loved
feature: seeing what you cannot yet reach). The scarf gives the other cue: it streams toward a hidden draft from a crack,
so secrets behind thin walls can be read by watching it, not by striking every tile.

## Each gift, read more widely

The compendium asks that a gift change how old rooms are thought of, not open one door bearing its symbol.

| Gift | Its first use | And then |
|---|---|---|
| The Warden's weight | Breaks cracked stone | Plunges through rotten boards (one-way drops become shortcuts); stills a swinging bell; hollow floors sound different under a plunge (a secret's rule) |
| The Toll's step | Crosses wide gaps | Through falling water and curtains of rain; chains along the Long Stair's broken flights; out of a crumbling floor before it goes |
| The Wyrm's wind | Glides; rides rising air | Under water, the thread carries him (the Flooded Levels, then the water travel); his scarf finds hidden drafts |
| The lamp | Lights the guild's lamps, which stay lit | Shows the writing in the Scriptorium; the lit lamps are a way back up; some creatures will not cross its light |
| The Auger's grip | Climbs rough rock | Every rough face he has passed since the Roots; the Shard |

## Each region, a way of playing

Regions should differ in how they play, not only how they look. Most already do; two need it.

| Region | Its grammar |
|---|---|
| The Roots | Water and weight: pools, plunges, crawlways, the dark |
| The Cloister | **Rhythm** (new): the bells keep a beat; star-glass and doors keep it too; acolytes move on it. After the Toll, the beat stops |
| The Spires | Wind and exposure: updrafts, gusts, the drop |
| The Tempest | Charge: the rods, telegraphed strikes, storm cover |
| The Gardens | Growth: blooms that throw him, things that grow back when cut |
| The Firmament | Phase and orbit: star-glass in time, the orrery turning |
| The Deep | The lamp and the water: what he lights stays lit; what floods |

## The Roots as the proof (the compendium's vertical slice)

Before more wings, finish the Roots, the Ossuary and the Workings to the compendium's slice: a hub, two distinct
subregions, one signature gift, **three to five places it opens**, something seen before it can be reached, an optional
route, a shortcut, a landmark, a flame and a fight, and a map that marks something.

- **Have:** the pool, the Ossuary and the Workings, the Warden's weight, the deadhouse stair, the Warden.
- **Missing:**
  1. More places the weight opens, starting from the two walled-up nooks already there.
  2. Something seen before it can be reached: a relic glinting behind the cracked wall at the well's foot, visible from
     the first minute.
  3. The rope down the well, given after the Warden.
  4. Corwen's marks on the map.
  5. A second flame for the Roots' eighteen rooms.

## Build order

1. **What each gift opens:** gift-aware gates and the per-gift report (idea 6). The rest is measured by it. *Done:* `tests/helpers/reach.mjs`, the motor tests per gift set, and `node tools/gifts-report.mjs` writing `docs/gifts-report.md`. It shows, as expected, that the Warden's weight opens the Ossuary and the Toll's step and the Wyrm's wind open next to nothing.
2. **The Roots slice:** finish it to the list above. *Done (build 37):* a thread in a lit chest just inside the Ossuary's door, seen from the well's foot from the first minute; a light in each walled-up nook, showing round the cracked stone; the gallery nook's floor is rotten boards (a plunge with the Warden's weight breaks them) over the well-keepers' old ladder down to the Pithead, a shortcut opened from above that runs both ways after; a second flame, in the Ossuary before the Sexton. The rope after the Warden became this shortcut down instead: the report showed the Roots' flame is already 6 s from the Warden, so a way back *up* saved nothing, and the way *down* (to the Pithead, the pool, the Workings) is the long one. Corwen's marks on the map are step 3.
3. **Corwen's map:** seen, visited, open and stopped ways, newly open, falls, sealed pages (idea 2).
4. **Keepers re-tune their regions** and the given shortcuts (ideas 3, 4), one region at a time, with the next wings.
5. **Knowledge gates** as each wing is built (idea 5); rough rock drawn everywhere (idea 7).
6. **The water travel**, with the Flooded Levels (idea 1).

Each section, before it is built, gets the compendium's region worksheet (identity, grammar, entrances, gate, payoff,
shortcut, landmark, longest wandering, the question at its entrance, the answer before he leaves), filled in under its
entry in `world.md`.

## Testing with people

My test browser cannot judge feel. The compendium's blind-playtest list is the most useful thing to run with a real
player:
- how long until the first discovery;
- whether, when lost, he felt curious or worn down;
- what landmarks he can describe from memory;
- what he did right after a new gift;
- how long a keeper retry took, walk back included.
