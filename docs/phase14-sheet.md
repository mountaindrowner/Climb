# Phase 14: the Firmament's wing (the sheet)

One wing: the Orrery Wing, east of the orrery room, open to anyone. (The world plan says "west"; the orrery room it
opens off is on the Firmament's east side, so the wing is east.)

## The Orrery Wing

The astronomers' great work: a brass sky, every star on an arm, wound to run forward, to tell the hour the flame would
come back. It has told it many times. Every hour it gave is cut in the wall, and every one is past. Nine screens.

### Its rule: it all turns, and it is an hour out

Two halves, and they are the same thought: a machine that says what will happen.

- **What turns can be stood on, and carries him.** This is new to the game: planets on arms, pallets on rails. He
  lands on one from above, as on a plank; it takes him with it; he walks or drops off. A wall in its way stops him
  and it goes on without him. Where each one is depends on the world's clock and nothing else, so it is in the same
  place at the same moment every time.
- **The hours.** A floor of numbered plates, a hammer over each. It **calls** an hour: that plate lights, for a second
  and a third. Then it strikes: not that plate, but **the one after it. Always.** In the last moments before the blow
  the hammer that is really coming shakes, so the truth is there to be seen. Whoever trusts the light and steps off
  the lit plate onto its neighbour is the one who is hit.

So the wing's knowledge is one sentence, and the game says it the first time a hammer lands on him: *it struck the
hour after the one it called. It always has.* After that the safest place on the floor is the lit plate.

### How it is entered, and left

- **In:** a door cut in the orrery room's east wall, at its lower shelf.
- **Out:** the same way; or, once the Almanac is shut, by the winding room, whose west door opens into the aphelion,
  three rooms higher. Both of the winding room's doors are grated until then.

### The rooms

1. **The escapement** (one screen). Two pallets rising and falling in turn, up to the way on. The first thing he
   stands on that moves.
2. **The hours** (two screens). He comes in at the head of a stair, where the dates are cut and the whole floor can
   be watched: nine plates, nine hammers, one call at a time. Nothing else is in the room.
3. **The arms** (four screens: the vast space). The orrery. Two planets opposite each other on the long arm, one on a
   short arm turning the other way. A mounting block under the hub; from it a planet at the foot of its turn is a
   short hop. Round with it to the top, off to a ledge, and up. A thread at nine o'clock, a chest at two. Two
   armillaries on the floor.
4. **The Almanac** (one screen). The wing's keeper.
5. **The winding room** (one screen). The relic. The door into the aphelion.

### What is in it

- **Armillary** (drawn in code). A brass ring off the orrery, rolling its length of floor and back; at him, faster.
  Three blows. It runs down whoever stands in its way and rolls off for a moment after; jumped, it passes under; a
  guard turned to it throws it back.
- **The Almanac** (the wing's keeper; 24 blows). It stands at its book on the middle of five plates and does not move
  or strike with its hands. It reads an hour and the hammers do the rest, an hour late, as everywhere here. As it is
  hurt it reads two hours at once, then three, and faster. To strike it he must stand on the plates beside it.

### The relic: the Last Page

*The almanac's last page. Every other has an hour on it. This one is blank.* **Once each rest, a blow that would end
him leaves him one heart.** It is armed when he rests, so it first counts from the rest after he takes it.

### What is said

- By the dates, once: *The hours. Every hour it gave for the flame to come back. All of them are past.*
- The first time a hammer lands on him: *An hour late. It struck the hour after the one it called. It always has.*
- When the Almanac falls: *The Almanac is shut. It was an hour out about this, too.*
- When the relic saves him: *the last page: not this hour.*

### Art

The Almanac is PixelLab's (reading, and striking). The planets, arms, pallets, hammers, plates and the armillary are
drawn in code. **Cost: $0.07; the balance is $2.54.**

### As built (build 71), and what was checked

- **314 automated checks pass**, nine of them the wing's own: its screens and its movers; a planet carrying him all
  the way round and a pallet up and down; walking off, dropping off, and not being caught from below; all of it
  reached by riding, and the winding room only after the Almanac; the hours striking the hour after the one called,
  every time; safe on the called hour and struck on the next; the armillary; the Almanac; the relic.
- **Played through by the test browser:** in from the orrery room's shelf; on a pallet, rising and falling; four
  calls stood on the lit plate with no blow, four on the plate after with three blows; off the mounting block onto
  a planet, round to the top of its turn, across to the ledge and up into the Almanac's room; an armillary running
  him down; five of the Almanac's calls stood on the lit plate with no blow; the Almanac broken, the grate open, the
  relic taken, and the winding room's west door open onto the aphelion.
- **Found and fixed while building:**
  - A planet at the foot of its turn was a full jump above the floor and moving: hard to catch. A mounting block
    under the hub makes it a short hop.
  - The room's roof had sagged in the wear, and a planet near the top of its turn put his head into it and dropped
    him. The roof is held where it was cut.
  - The hours came round in a pattern of three. They have a better order now, still the same every visit.
  - Twice more I broke a line by putting a note after code on it. The syntax check caught both before anything ran.
  - The older checks did not know that anything moves, and called the hours cut off. They are taught: what moves
    is waited for, so for them it is a plank everywhere it goes.
  - Two torches were set beside doorways, with no wall to hang on. Moved.
- **Not as the plan had it:** the wing is east, not west. The Almanac does not walk to the hour and strike it; the
  hammers do. The armillary is the only creature.
- **Not checked:** nothing here was played by hand. The sounds. Whether the lie in the hours is a pleasure to find
  out or only a cheap hit; whether a second and a third is long enough to read a call; whether three hours at once
  leaves anywhere to stand beside the Almanac (the checks say a called plate is always safe, not that one is always
  in reach of it).
- **A save is not moved:** the wing is added on the east.

## Left for later

- Phase 14 is done, and with it phases 10 to 14, the wings. Next is phase 15: the lamp, and the Vein.
