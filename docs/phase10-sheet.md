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

# The Bell-Foundry (the second half of phase 10)

*Cloister, east · 10 screens and the slype · behind the Warden's spade*

Built in build 61, on your word to go on to the next wing when the Scriptorium was done.

**What it was.** Where the house cast its bells, in a pit cut into the mountain. They cast the Toll here. When the dark
came they cast more and larger and rang them harder, until one cracked: a sister to the Toll. They left it hanging in
the pit and went on casting.

**The question at its door, and the answer before he leaves:** *why is it still ringing?* No one is ringing it. It rings
when it is struck, and he is the only one here who strikes anything.

## Its rule: iron rings, and what hears it wakes

One cause, three things that follow, and one end. The Scriptorium was about what is in front of someone; this is about
noise.

- **Iron rings when it is touched**: by his blade, or by his body walking into it. A ring lasts about four seconds from
  the last touch.
- **While anything rings:** the hanging tongues swing (and a swinging tongue hurts); the slag wakes and comes for him;
  the iron shutters in the doorways come down.
- **In silence:** the tongues hang still and do no harm, the slag is cold and asleep, every shutter is up.
- So the whole wing can be walked without a fight, by going under what hangs and round what sleeps. Every blow struck in
  anger at something asleep or at iron makes it worse. Standing still ends it.

This is the wing's knowledge gate (Metroidvania idea 5): nothing says it; the first room shows it.

## How it is entered, and left

- **Cracked stone in the belfry's east wall**, at the first turn of the bell stair. The spade breaks it. He has the
  spade when he first comes to the Cloister, so this wing is open on his first way up; the Scriptorium is the one he
  comes back for.
- **The way back is the bell-rope:** a shaft of rungs from the pit up to a grate in the slype's floor. The grates are
  down until the Cracked Bell is still.

## The rooms

| Room | Screens | What it is | What he does there |
|---|---|---|---|
| **The slype** | 1 | The covered passage the bells were carried out by: a stair down, eastward | **Is shown the rule.** One tongue hangs in the way at the height of his head, one lump of slag lies beyond it, one shutter stands open beyond that. Walk into the tongue and all three answer. Crouch under it and nothing does |
| **The casting floor** (wide) | 2 | Two great bell molds, the hoist over the hole the bells went down by, the cold furnace | Climbs over the molds, under the tongues hung over them. Looks down the hole: the chain goes down into the dark. **He can drop down it** (the path no one expects: onto the Bell) |
| **The molds** (winding) | 1 | Three molds on their sides, hollow, a tongue hanging in each | Goes through them bent double, under each tongue. The hole in the floor at the end has a shutter for a lid |
| **The slag runs** | 2, one over the other | The channels the slag ran down, still hot in the dips | Down the runs, over the slag, past tongues hung over the jumps |
| **The pit** (vast) | 4 (two by two) | The pit. **The Cracked Bell**, hanging in the middle of it, silent | The mini-keeper |
| **The bell-rope** | 1 | The ringers' way up; the relic at its foot | Up the rungs to the slype, once the grates are up |

## Who is in it

| Who | What it does | How it is read, and answered |
|---|---|---|
| **Tongue** (the clapper of a broken bell, hung by its chain; 11) | Still: touch it and it rings. Ringing: it swings, and hurts | It cannot be broken. Go under it; do not cut it |
| **Slag** (8) | Cold: a lump, asleep; a cut glances off. Woken by a ring: it glows, and comes fast along the floor; it burns to touch | It only wakes to a ring. Cut it while it glows (two cuts), or get above it and wait: it goes cold where it stands |
| **The Cracked Bell** (the mini-keeper) | **It never strikes first.** Every blow it takes, it rings: it swings through the pit on its chain, everything in the pit wakes, the shutters come down. From half its strength the crack opens, and while it swings widely it tolls again by itself | Strike it, then stand off: get through the swing (roll through it, or be up on a gallery away from the tongues) and deal with what woke. Or keep striking, and have everything awake at once. Twenty cuts |

When the Cracked Bell falls the wing is **still**, for good: the tongues no longer ring, the slag does not wake, the
shutters stay up, the grates lift. (A small copy of what a keeper's fall does to its region, phase 9.)

## The relic: the Founder's Felt

*A parry rings: everything near him is stilled for a breath.* The felt the founders wrapped a tongue in when a bell was
to be struck and not heard.

## What is said

- When it falls: **"The Cracked Bell is still. So is everything that answered it."**
- Mirel, under the stair below the door, the next time she is spoken to: **"The cracked one has stopped. I kept my count by it. Now I must keep it myself."**
- The Annals: the Slag, "What was skimmed off the bells. It wakes when iron rings." The Cracked Bell, "The Toll's sister. Rung until it broke. It rings only when it is struck." (The tongues are ironwork, not creatures: they are not entered.)

## Its look

Black iron and soot-dark brick, orange from the slag; sparks. Painted by hand into the rooms: bell molds, the cold
furnace, crucibles on chains, ingots, a rack of tongues, the hoist.

## Art

One new drawing (the slag, crawling). The tongues and the Cracked Bell are drawn in code, the Bell from the Toll's own
pieces, cracked. **Cost: $0.05; the balance is $2.97.**

## As built (build 61), and what was checked

- **247 automated checks pass**, nine of them the wing's own: its screens and gates; the shutter and the grate; the
  bell-rope shut before the Bell falls and open after; a tongue rung by a standing man and passed under bent double; a
  tongue rung by his blade, unbroken, and striking as it swings; the slag asleep, woken, burning, cold again; the Bell
  never striking first; its second half tolling by itself and then stopping; the relic.
- **Played through by the test browser:**
  - the tower's wall broken with the spade, and walked through into the slype;
  - the first tongue walked into: it rings, the shutters come down, the slag wakes and comes; four seconds of silence
    and all three are as they were;
  - the same tongue passed under bent double, and a mold's crown crossed bent double: nothing rings;
  - the drop down the hoist hole: he lands in the pit beside the Bell, a heart the worse, and it rings;
  - the Bell struck, swinging, and its fall: the words, the grates up, the way through to the bell-rope;
  - coming back in afterwards: it lies where it fell.
- **Changed while building:** each slag that burns him is spent for a second (three at once took three hearts in a
  second and a half). A blow sends the Bell the way it is already going, so blows build its swing; from half its
  strength any blow sets it swinging widely.
- **The wear banked the pit's gallery up against the grate** and closed the door behind it; it is kept clear now.
- **Not checked:** nothing here was played by hand. The sounds were not heard (the ring is the house's bell played off
  its note). The climb up the rungs was not walked in the browser (the automated player does it). The relic was not
  tried in a real fight: only that a parry stills what is near. The Annals page for the Cloister now has eight
  creatures, set a little closer; it was not looked at.
- **The Bell-Foundry is eleven screens, not nine:** the slype is counted in it, and the slag runs are two screens.

## Left for later

- The Bell-Foundry, and the Cracked Bell (the next sheet).
- The Cloister's two new rooms in the plan: the refectory, and the slype to the Foundry.
- A knowledge gate in the Cloister (Metroidvania idea 5).
