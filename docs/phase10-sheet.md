# Phase 10: the Cloister's wings (the sheet)

Two wings (`docs/roadmap.md`): **the Scriptorium** (west, behind the Toll's step) and **the Bell-Foundry** (east, behind
the Warden's spade). This sheet is the Scriptorium, built in build 60 on your word to make the next wing "with lots of
character and variance". The Bell-Foundry is the next sheet.

## The Scriptorium

*Cloister, west · 9 screens · behind the Toll's step*

**What it was.** Where the house's books were copied. After the dark the rule became: no page may have a single fault,
or it is burned and begun again. The copyists have been copying the same book ever since. They have never finished the
first page.

**The question at its door, and the answer before he leaves** (`docs/metroidvania.md`): *why is nothing here
finished?* The book on the lectern is open at its first page, and the page is blank.

### How it is entered, and left

- **A door off the stair's landing** (the Cloister's stairwell, west wall), open from the first time he climbs the
  stair. Through it are **the stacks of spoils**: anyone may walk in.
- **The way on is a sheet of vellum** stretched over the copying hall's door, the hall's candles behind it. Rock to a
  blade and a spade. **The Toll's step goes through it:** a dash in the air tears it, and it stays torn.
- **The way back is the chute:** in the lectern's floor, for spoiled leaves. It goes down past the furnace, behind its
  own wall, and drops him on the landing inside the first door. It cannot be climbed.

### The rooms: one vast, one winding, one no one expects (decision 0.8)

| Room | Screens | What it is | What he does there |
|---|---|---|---|
| **The stacks of spoils** | 1 | Heaps of spoiled pages under the door, each struck through in red; pages pegged out to dry; a blot lying in the ink at the bottom | Sees the vellum, lit from behind. Comes back with the Toll's step |
| **The copying hall** (the vast one) | 4 (two by two) | Desks in tiers over a floor of ink, between two pillars of shelves that reach the roof. Copyists at five of the desks; three blots in the ink | **Climbs across the desks.** Three ways through the pillars, at three heights: up the east bay, across, up the middle, across, up the west. Off the route: the furnace's door, and a third sheet of vellum with a red strand behind it |
| **The furnace** | 1 | Red. The hearth where spoiled leaves are burned, sparks rising; a copyist beside it, still feeding it | A chest on a shelf only the hearth's rising heat reaches: **for the Wyrm's wind, later** |
| **The rubrication** (the red room) | 2 | Where faults are struck out. Vats of red ink, pages on lines. Flat, wide | **The Corrector** |
| **The lectern** | 1 | The book they copy, on its lectern, lit. **Its first page is blank** | The relic. Then the chute (the one no one expects): down past the furnace, out over the first door |

### Who is in it

| Who | What it does | How it is read, and answered |
|---|---|---|
| **Copyist** (6) | Bound to his desk, writing. Flings ink in an arc at what comes **in front of** him | He stops writing and draws his arm back for 0.7 s. **From behind he does not look up:** come at him from the side he is not facing. Three cuts |
| **Blot** (5) | The shape of a copyist, in the ink he spilled. Lies as a spill until he is near, stands up out of it, comes for him, throws itself down where he stands. Then it lies where it fell | It stands up for half a second, and gathers for half a second before it dives. Step back, or cut it while it stands. Two cuts |
| **The Corrector** (the elite) | A long knife. **A level slash** at arm's length: two hearts. Every third time, or from far off: he raises the knife, **a red line shows across the whole room at chest height, and he strikes it out** | The slash: 0.5 s of drawing back; block it, or be out of reach. The line: 0.9 s of red first. **Crouch under it, or be over it.** Twenty-two cuts |

### The relic: the Copyist's Blank Leaf

*After he rests at water, the first blow that lands does no harm.* The one page in the house that was never spoiled:
nothing was ever written on it. It is whole again at any water, and when he is raised.

### What is said

- At the lectern, once: **"The book they copy: it is open at its first page. The page is blank."**
- Corwen, the next time he is spoken to: **"You found the book they copy. No one has dared its first page. Nor have I."**
- The Annals: the Copyist, "He copies the first page. One blot, and he begins it again." The Blot, "Ink that was spilled,
  and thrown out, and came back." The Corrector, "He strikes out what is wrong. He has not found a page that is not."

### Its look

- **Two looks of its own**, worn by its rooms inside the Cloister: the house's brick gone ink-dark and blue, bookcases on
  every wall, pages and their ash drifting down; and for the furnace and the red room, red brick, red light, sparks
  rising.
- Painted by hand into the rooms: heaps of spoils, ink pots with quills, pages on lines, hanging lamps, bookcases, vats,
  the furnace's mouth, the lectern and its book.

## Art

Three new drawings with their animations and light maps: the copyist (writing, flinging), the blot (walking, diving),
the Corrector (walking, slashing, striking). The copyist and the blot were drawn twice (the first were as tall as the
Sexton). **Cost: about $0.30; the balance is about $3.00.**

## Differs from the world plan (`docs/world.md`)

- It opens **off the stair**, not off the library: the wing is west of the house and the library is east of the nave.
- **The chute** comes out in the wing's own first room, not the undercroft: a loop back to the door.
- **Blots do not spread where he steps.** They are figures that lie as spills and get up.
- **No ink to wade in:** the floor's ink is painted, with blots in it.

## As built (build 60), and what was checked

- **237 automated checks pass**, seven of them the wing's own: its nine screens and their gates, the vellum (rock to a
  blade and a spade, open to the step), the chute not being a way in, the three creatures' behaviour, the Blank Leaf.
- **Played through by the test browser:** the vellum torn by the step and still torn after; a blot's dive landing
  ("Blotted"); the Corrector going through his stalk, slash and red line and landing one ("Struck out"); the lectern's
  words; the chute, from the lectern to the first room.
- **The chute has two shelves in it**, so that no drop in it is long enough to hurt. He steers down it: right, left,
  right. Run in holding right and never steer, and he stands on the second shelf until he walks off it.
- **Not checked:** nothing here was played by hand. The sounds were not heard. The copyist's ink was not seen landing in
  the running game (its aim is covered by an automated check). The red light of the furnace on a phone.
- **The copyist is drawn from behind,** bent over his desk: the second drawing came out that way and was kept.

## Left for later

- The Bell-Foundry, and the Cracked Bell (the next sheet).
- The Cloister's two new rooms in the plan: the refectory, and the slype to the Foundry.
- A knowledge gate in the Cloister (Metroidvania idea 5).
