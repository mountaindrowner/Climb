# The map pass: height from the shape of the place (the sheet)

*Asked for after build 75, from a study of a Castlevania map. The plan was agreed first; the Roots is the pilot.
"As built" at the end says what came of it.*

## What was wrong

The mountain changed height mostly by one-way platforms hung in the air: planks he can jump up through and drop
down through, reachable from any side. Counted before the pass:

- 700 timber planks across the eleven levels (757 with star-glass and iron), a little over two a screen.
- Two in three touched nothing at all.
- The Roots: 84 planks in 32 screens. 60 touched nothing.

A room built that way has no shape of its own. Every room is a box with rungs in it, and the map of it is a box.

## What the study found

The Castlevania map changes height almost entirely with the building itself:

1. **Stairs** that are part of the wall, so a climb has a direction and a foot and a head.
2. **Stepped floors**: a corridor that rises a body's height, then again. The floor is the way up.
3. **Shelves out of the walls** of a shaft, one side and then the other. You cross the shaft to climb it.
4. **Masses hung from the roof** and **piers up from the floor**, which make one room into several heights.
5. **Narrow flues with rungs** where a real ladder would be, and nowhere else.
6. One-way platforms are rare, and where they are, they are a thing: a ladder, a lift, a bridge.

The rooms read from their outline alone. That is the test this pass sets.

## The rule

**Height is changed by the shape of the place. A plank is a made thing, with a reason and something holding it up.**

- A climb is stone: shelves, piers, hung masses, stairs, stepped floors.
- A plank stays only where it is one of these, and is drawn as it:
  - **a rung**: set from wall to wall in a narrow flue (a ladder);
  - **a step off a wall**: one end let into rock, on a strut;
  - **a staging**: on posts, with ground under each end.
- **Nothing hangs in the air**: not a plank, and not a slab of rock either.
- **What was found stays where it was found.** Every thread, chest, relic, person, shrine and water is on the tile it
  was on, or within a step of it. Rooms, doors and the order of rooms do not change.

## The budget

- Under **one platform a screen**, taken over a level.
- **None bare in the air.** A free end needs ground within eight tiles under it (a post).
- **No rock joined to nothing.**

A check holds each level to its budget (`tests/side-platforms.test.mjs`). A level that has had its pass is held to
what the pass left. A level that has not is held to what it has today, so it cannot get worse before its turn.

## The pieces

Three shapes, in `rooms.js`, do most of it:

- `shelf(room, side, x, y)`: a shelf of rock out of the left or right wall as far as `x`, its top at row `y`. Two
  thick at the wall half, one at the outer half, so it tapers like a corbel.
- `pier(room, x0, x1, y)`: rock up from the floor to row `y`. A boulder, a stack, a pillar.
- `hung(room, x0, x1, y, stepTo)`: rock down from the roof to row `y`, with an optional step out of its foot.

## What the pilot taught (the spacing rules)

Stone is not a plank: he cannot jump up through it. Building the Roots in stone found these, and the checks now hold
them:

1. **Shelves alternate, five or six rows apart.** From a shelf on one wall to the next on the other is five rows up,
   then six, so two on the same wall are eleven apart: a full jump from under one never strikes it. *(Build 76 had
   six and twelve. Played, that was a stretch every time. Five is inside one jump and a reach of the hand.)*
2. **Shelves taper.** Two thick only at the wall half. A shelf two thick to its lip closes the jump under it.
3. **Four clear tiles between the lips** of facing shelves. *(Build 76 had two: his body is a tile and a third wide,
   and it felt like threading a slot.)* Going down, he runs off one lip and lands on the next.
4. **Three clear tiles between a boulder and anything overhead beside it.** Tucked under a shelf, a boulder is a
   wall he cannot get past either way. (Found in the Ossuary, and at the mouth of Ordric's room, where it shut him
   in.)
5. **Five clear rows over anywhere he walks,** under a shelf included.
6. **A flue too narrow for shelves keeps its rungs.** That is a ladder, and it is drawn as one.
7. **The first step is on the side he comes from.**
8. **Air that matters is marked.** The pass that wears the rock smooth fills air nobody stands near. A chasm between
   pillars has to be told to stay a chasm. (It filled the bridge's.)

## The Roots, room by room

| Room | Before | After |
|---|---|---|
| Start | 2 planks: one over the water, one under the thread | The floor rises in two stone steps past the water; rock hangs from the roof with a step in it, and the thread is on that step |
| Corridor | 5: a step to Ordric's roof, three up to the shaft, the lamplighter's step | A boulder three tiles clear of his door, his roof, a shelf out of the east wall, a step in rock hung beside the hole. **1 kept:** the lamplighter's step, on a post |
| Shaft | 4 | A shelf out of the east wall and a lip of the rock it is cut beside |
| Pithead | 7: a ladder and the headframe | The ladder is in a flue, three rungs wall to wall, a boulder under its mouth. The deck is laid on its two legs. **4 kept** |
| Old shaft | 5 and an urn in mid-air | A flue from floor to roof, four rungs. **4 kept** |
| Tunnel | 2 | The low stretch is rock; a stair in the stone up into the chamber |
| Chamber | 6 | Two piers as steps, a shelf from each wall, Corwen's shelf out of the east wall |
| Ascent | 0 | (it was already a ramp) |
| Gallery | 3 | A rib of rock and a pier |
| The well | 13 | A boulder, then seven shelves, right and left, up both screens |
| Roost | 4 | Two piers, a shelf from each wall, a rock hung over the middle |
| Bridge | 3 planks over the chasm | Three pillars of the chasm's own rock |
| Grotto | 2 | Steps cut in the sides of the basin |
| The Warden's hall | 5 | A stone step in the hole up through the stage. **2 kept:** the stagings at either end, out of its sweep, on a strut and posts |
| The well's foot (the quick way) | 9 on a rope | Five shelves either side of the rope, and two rungs in the mouth of the well. **2 kept** |
| Ossuary: the aisle | 3, and 8 slabs of rock in the air | Two ribs of the vault down from the roof, two stacks on the floor, the house's stair in stone at the east end |
| Ossuary: the sorting | 3 | The heaps, and one shelf |
| Ossuary: the niches | 7 | A boulder and four shelves, left and right |
| Ossuary: the Sexton's yard | 4 | His ladder, in a flue in the corner. **4 kept** |
| Ossuary: the count | 2 | Rock |

## After the first playtest (build 77)

Played 20 Nov 2026. The verdict was good; three things came back and are changed.

- **"He grabs edges too perfectly."** With shelves close together there was always an edge in reach. He now takes an
  edge **only on the way up**: rising, or in the first eighth of a second after the top of a jump, and pressing
  toward it. **Coming down he never does.** Stepping off an edge is a fall from the start. (Leaving deep water at its
  top is unchanged.) `GRAB` in `motor.js`.
- **"The zigzags feel too tight."** The three shafts (the well, the well's foot, the Ossuary's niches) are re-laid to
  rules 1 and 3 above: five or six rows, four clear tiles.
- **What the stricter grab broke, and where.** One jump in the Foundry (a dip under a low roof, its far lip a tile
  higher) only worked by catching the lip while falling; the dip is a tile narrower. Two perches in the Firmament
  that nobody can reach were "left" only by a grab on the way down; leaving by a long drop now counts, as it should.
  One check on the Aqueducts' falling water was passing by luck and now states what is true.

## For the player to try (the playtest list)

Use **Try a place** on the title screen, and pick the Roots.

1. Walk from the water to the Warden. Does each room have a shape now, or is it still a box?
2. The well (two screens of shelves, left, right, left). Is that a climb you enjoy, or a chore? Is six rows too far,
   too easy, about right?
3. Anywhere you bump your head on stone when you meant to go up: note the room. That is the cost of this change and
   I want every case.
4. The Pithead's ladder and the Sexton's: do they read as ladders?
5. Ordric's room: is getting onto his roof clear, with the plank gone?
6. Do you miss dropping down through a plank anywhere? Coming down is now a walk off an edge.
7. Then open the Cloister (untouched) and compare. Which would you rather the whole mountain was?

## As built

*Build 76.* The Roots and its wing, the Ossuary, and its quick way.

- **84 planks became 17**, in 32 screens: about one in two screens. Thirteen are rungs of the four ladders (the
  Pithead's, the old shaft's, the Sexton's, the mouth of the well). Two are steps off a wall. Two are stagings
  on posts or legs (the Warden's east one, the headframe's deck). **None is bare in the air**, and no rock is joined to nothing.
- I said "about five" at the start. Seventeen is more, and the difference is the ladders: four flues too narrow for
  shelves, which the rule keeps as rungs. If you would rather have fewer ladders, the flues can be widened into
  shafts with shelves; say so.
- **Everything found is where it was**, except: the corridor's spike pit is two tiles further west and five wide
  (it was six), to leave room for the boulder to stand clear of Ordric's door; an urn and a torch moved a tile or
  two in six rooms; the Ossuary's aisle has four candles where it had more.
- **Planks are now drawn held up**: a strut under an end let into rock, a post under a free end with ground below
  it, a rope up from a free end with rock over it. This is in every timber region, not only the Roots, so the other
  regions' planks look a little more made already.
- **The first room no longer teaches dropping through a plank.** The way up through the Roots has none left to drop
  through. The hint still comes the first time he stands on any plank holding down. The first plank he can meet is
  the lamplighter's step, behind Ordric's room.
- **Three checks pointed at planks that are gone** (a mantle, a drop, and "the first room has planks"). They now point
  at the Pithead's deck and ladder and the corridor's step. Nothing they test was weakened.

**What is weaker than the sheet, and what I could not judge.**

- **Coming down is slower in places.** He used to drop through planks; now he walks off shelves. The well is the
  place to feel this.
- **The shelves are plain rock.** They taper, and the wear rounds them, but they are not yet dressed (no corbels, no
  cut stone in the Ossuary, no roots hanging). That is "the look and style" half of the plan, and it wants your
  opinion of the shapes first.
- **The Warden's fight was not replayed by a person** with the stage's hole changed (a stone step in it, not planks).
  His real jump clears it in the checks.
- Nothing here has been played by a person. This build exists to be compared, by you, with the Cloister.

## The Cloister, room by room (build 101)

*Your word, 24 Nov: "Do the platform replacement idea." The Cloister and its two wings and its passage, as the Roots
was. `docs/cloister-map-pass.png` is the region before and after; `docs/cloister-map-pass-rooms.png`, four rooms in
the game.*

**122 planks became 49**, in 50 screens; nine pieces of rock in the air became two. Of the 49: 21 are rungs (wall to
wall in a flue, or in a hole's mouth), 18 are steps off a wall, 10 are stagings with ground under them. None is bare.

| Room | Before | After |
|---|---|---|
| Scriptorium hall | 26 desks hung in the air, six ways through two pillars | The tiers are the house's stone: corbels out of the walls and pillars, a side and then the other, the desks and copyists on them. The three ways through the pillars no one used are filled, so no piece of a pillar hangs between two. Up through the roof: **2 kept**, a ladder of two rungs in a flue, too near the roof for anything but straight up |
| Belfry | 14 planks up three screens | A boulder at the tower's foot, Mirel's rock (the first turn) wider, then eight shelves out of one wall and the other, the doors' landings among them. **None kept** |
| Founders' passage | 10 | Six shelves out of the walls among the founders' tombs, a crystal on each; a ladder of two rungs in a flue under the hole. **3 kept** (the rungs, and the boards over the way in) |
| Stairwell | 10 | The step in the air went (the step off the wall above reaches back to the stair); the ledge before the walled-up cell is a corbel of the rock over the landing; the rungs up to the refectory have a stone side. **8 kept**, all steps off a wall or rungs |
| Nave | 5 galleries | Two tombs and a plinth up from the floor, a hop each; the chest and a crystal on them. Corwen's stone gallery, which hung in the air over the west door, rests on the wall (the door is a row lower). **1 kept** |
| Cloister walk | 5 | A boulder, a step hung from the vaulting, a step hung from the east wall under the chapel's hole, the floor clear under them for the way to the belfry. **2 kept** (the rungs up through the hole) |
| Library, chapel | 2 galleries each | Shelves out of the walls at the same heights. The chapel's are the Toll's refuges, as before |
| Crypt's foot | 6 | The plank over the water is a step of Ordric's den; a shelf of the wall under the stair's mouth. **4 kept** |
| Lower flights | 7 | The two steps in the air went; a shelf out of the east wall reaches back for them, and the plank over the well rests on it. **5 kept** |
| The pit (the Cracked Bell) | 8 steps up its walls | The lowest two each side are one shelf of the wall's stone, high enough to walk under. **4 kept**. The bell's floor is untouched |
| Bell-rope room | 5 rungs | Two steps of stone, a shelf under the hole, a rung over it. **2 kept** |
| Casting floor | 2 galleries in the air | Shelves out of the walls |
| Slag runs | 6; two runs cut in two by their dips | One rung fewer; each dip's floor a tile wider, so its run stays one piece of stone |

**Kept as they were:** the slype's and the molds' ladders, the undercroft's step between the tombs, the refectory's
table, the boards over each hole.

**The two pieces of rock still in the air** are the pit's two brackets, each a tongue hangs from. A tongue swings from
the first rock over it, so they shape the Bell's fight; a beam up to the roof boxed in the ringers' landing. They are
the budget's two (`tests/side-platforms.test.mjs`).

**What I learned (and the checks now hold):**

- **The wear swells new stone from under** and can leave four rows where there were six. In a room of tiers, the air
  over each tier and out past its lip is marked to keep (rule 8 of the pilot). The Scriptorium hall needed it.
- **A shelf above must not overhang the lip below** where he jumps from. The simpler map check found four of these
  that the motor squeezed past; each is narrowed or widened so the jump has open air.
- **Within five rows of a roof, only straight up works.** Every hole in a roof keeps a ladder in a flue under it.

## The Spires, room by room (build 102)

*Your word, 24 Nov: "Go", after the Cloister. The Spires, its two wings (the Pilgrims' Cairns, the Glacier Galleries)
and its passage. `docs/spires-map-pass.png` is the region before and after; `docs/spires-map-pass-rooms.png`, six
rooms in the game.*

**116 planks became 90, in 56 screens. That is not under one a screen, and I have not bent the count to say it is.**
Four pieces of rock in the air became three. Every one of the 90 has a reason: 32 rungs (wall to wall, in a flue or a
hole's mouth), 30 steps off a wall, 21 stagings with ground under them, 6 boards of the two rope bridges, and the
Wyrm's slab.

**Why it stops at 90.** The Spires is towers in open sky, and its height is climbed in the clefts between them. What
is left is mostly those ladders: in the needle's cleft (13 steps, the saddle and the spire), the Seated's flue (5),
the deep ice (5), the reasons' two ladders (7), the hollow, the bell road. A cleft is eight tiles wide; stone steps in
it would have to be five or six rows apart with four clear tiles between their lips (the spacing rules above), which
does not fit without widening the towers. The rope bridges are the Spires' own and stay. So the check holds the
Spires to "every plank has a reason" and to 90, and says in its note that it is over one a screen. **If you want it
under, the next step is widening the clefts and building stone stairs in them; or we could count a ladder or a bridge
as one made thing. Your call; I have done neither.**

*26 Nov: you left it to my judgment, within the pass's rule. The ladders stay (roadmap 0.31): each is a made thing
between stone sides, which is what the rule asks for.*

| Room | Before | After |
|---|---|---|
| The road (the bell road's climb) | Switchbacks of planks in the air above the second landing | Shelves out of one side of the face and the other, five rows apart; a rung under the hole |
| The gate | Rungs over the lamp-room's roof, the wear's lip over it | The rungs between stone sides, a row up, so the roof has five rows of air over it |
| The gatestair (and the Tempest's swept flight, the same shape) | Steps in the air along the top | A corbel along the west wall, the top's boards on it; the pilgrims, the stele and the urn a row down onto it |
| The chimney | Planks up a bare room | A boulder, a step off the floor's ground, a shelf of the east wall, rungs under the hole |
| The hollow | A step and rungs in the air | The step a block of the shrine's floor; the rungs under the hole against a stone side (the west: he comes onto them from the east) |
| The eyrie | Planks up to the hole | A block of the floor, a staging, rock hung from the roof beside the hole with a step out of its foot (three wide, with four tiles of air beside the leaking rock so he walks off it west) |
| The mouth, the nest, the scree, the ice cave, the reasons | A plank too low to pass under | A block of the floor, or a step of the shelf or bank, in its place (six in all) |
| The teeth | A plank out from the sill; the needle's tip standing on the bridge's gap | The sill runs out as rock; a lip of the tooth; **a ridge from the needle's top to the tooth**, so the needle's tip is held |
| The saddle | A step beside the glacier's way out hung in the air | A row up, against the tower |
| The deep ice, the Seated, the reasons, the Turned | Rungs in the air | Three stones in place of three rungs in the deep ice; the others' rungs between stone sides (a flue) |

**The three pieces of rock still in the air**, each said plainly:

- **The needle's foot in the saddle.** The way into the needle's cleft goes under it, so in a side view it stands
  over a doorway. Joining it to the ground shuts the cleft.
- **The eyrie's roof east of its hole.** It is held by the Wyrm's seal over the quick way (rock until the Wyrm falls);
  the check counts only bare rock.
- **The rock adrift in the saddle**, with a thread caught on it. By design.

The check also looks only at pieces under 400 tiles, so a wall over a door that is a little bigger is not counted (the
eyrie's west wall over the windgap's door is one). I note it rather than hide it.

**What I learned:**

- **Lay every shelf before marking the air over them.** A mark laid before the next shelf ends up inside it.
- **A step of stone at the foot of a ladder between stone sides is a trap.** He stands on it boxed in by the sides
  and cannot walk off. In the Seated's flue it stays a plank.
- **A ladder he comes onto from the side has a stone side only on the far side.** The hollow's had two, and the near
  one shut the way onto it.
- **The wear swells between nearby rock.** The teeth's sill, needle and lip became one mass until the air between them
  was marked to keep.

## The Tempest, room by room (build 103)

*Your word, 24 Nov: "Next", after the Spires. The Tempest, its two wings (the Wreck of the Works, the Eye of the
Storm) and its passage (the Last Hut). `docs/tempest-map-pass.png` is the region before and after;
`docs/tempest-map-pass-rooms.png`, six rooms in the game.*

**72 planks became 50, in 51 screens: under one a screen.** 29 were bare in the air; none is now. Of the 50: 26 rungs
(wall to wall, in a flue or a hole's mouth), 15 steps off a wall (among them the crossing's four planks bolted to its
pillars, and the anchorage's deck), 7 stagings with ground under them, and 2 boards of the gantry's broken bridge.
Nine pieces of rock in the air became seven.

| Room | Before | After |
|---|---|---|
| The Last Hut | A loft of planks in the air, a hatch over the cellar | Shelves out of the hut's walls, one side and the other (the bunk shelf, two more, the top one at the east wall where Corwen's nook is through it); from it a rung, and a ladder between stone sides to the door. The floor is open over the cellar's rung |
| The lee slope | Five steps in the air between the terraces | The terraces reach out to four tiles from each other; one step on the last terrace up to the head |
| The path | Rungs over the lamp-room's roof | Between stone sides, a row up; the step by Ordric's lamp-room a step of the scree, its mouth left open |
| The landing | A plank in the air at the top of the first rising air | A shelf of the east wall |
| The rigging | A scaffold's plank; a plank in the air under the anchorage | A block of the ground; a lip of the cliff under the anchorage, the way down from it |
| The anchorage | A deck of planks hung between two stubs of rock, both in the air, and a plank over it | A stub of the mountain's face and a deck of planks out from it; the thread at the deck's end. Through the planks by the stub, down onto the cliff's lip |
| The watch | As the Spires' hollow was | A block of the floor; the rungs under the hole against a stone side |
| The masthead | Five planks up to the hole | A block of the floor, a shelf of the east wall, and two rungs straight up under the hole (the roof comes down to it: only straight up reaches it) |
| The cranes, the still | Rungs in the air up to the hole | The same rungs between stone sides |

**The seven pieces of rock still in the air**, each said plainly:

- **The crossing's three pillars** stand over the old deck, and he walks under them along it. Down to the deck, they
  would cut it into bays, two of them with no way up.
- **The stacks' first pillar.** He walks under its foot in the rigging.
- **The cranes' floor and its two stone piers,** with the yard's post hanging under them. They are held by the iron
  decks between them (the Wreck's iron, solid while its keeper stands); the check counts only bare rock.

**What I learned:**

- **A box with a plank floor over rising air is a trap.** The roof I first gave the anchorage held its far half, and
  shut him in: the air under the planks only carries him back up.
- **The way down from a deck must be under its planks, not its rock.**
- **A mouth of one tile is no mouth.** A step beside the lamp-room left its mouth a tile wide; it is two.
- **The rock check has a blind side.** It looks only at pieces under 400 tiles, and only at bare rock (not iron or a
  keeper's seal). Both are noted where they matter rather than changed.

## The Gardens, room by room (build 104)

*Your word, 26 Nov: "Let's do the gardens pass. Let's finish the other levels as well." The Gardens, its two wings (the
Aqueducts, the Keepers' Houses) and its passage (the Breach). `docs/gardens-map-pass.png` is the region before and
after; `docs/gardens-map-pass-rooms.png`, six rooms in the game.*

**117 planks became 46, in 47 screens: under one a screen.** 85 were bare in the air; none is now. Of the 46: 32 rungs
(wall to wall: in a flue, a hole's mouth, or over a stair's well in a house), 11 steps off a wall, 3 with ground
under them (the long table among them). Eight pieces of rock in the air became seven.

| Room | Before | After |
|---|---|---|
| The Breach | Ten planks up the broken wall | Six courses of the wall still standing out of either side, one and then the other; the second is the one Corwen's nook is through; a rung under the hole |
| The wall's foot | Rungs over the lamp-room | The heap runs to the east wall; rungs between stone sides; the step by the lamp-room a stone |
| The storm beds | Five planks of trellis | A course of the wall over the door, one of the west wall |
| The storm door, the terraces | A plank; a terrace hung in the air, two planks up from it, a plank for the thread | A block of the floor; the terrace runs out of the far cliff, a block of marble on it under the way up; the thread on a lip of a root of the bed above |
| The wellspring | Six planks to catch the blooms' throws | Shelves of the well's own courses: one of the east wall, the west shelf and the sill of the way out each run toward the middle. One plank stays (he comes up through it, over the second bloom) |
| The orangery, the cascade, the canopy, the arbor | Planks to the vault, across to the walk, for two chests | A course over the door and a lip of the vault; the walk run out to meet the throw; lips of the cliff and of a root of the terrace above |
| The sundial | Five planks | Two steps of stone and two rungs against a stone side |
| **The four quick ways** (open when Mother Thorn falls) | Under each mouth, four or five planks hung in the air: seventeen in all | **A bloom under the mouth throws him into it.** One on the arbor's walk and one on the wellspring's shelf are new; the brambles' middle bloom is two tiles east, under its mouth; the orangery's is climbed from the course over its door. One or two rungs under each mouth, off a rib of stone hung from it: six in all. While she stands, each bloom throws him up to look at a way choked with thorn |
| The arches | Two ladders of three in the air | West: two rungs, the upper between stone sides. East: a block of stone and one rung |
| The sluices, the spill | Two planks in each fall | A block of stone in each fall; two steps of stone in the spill |
| The lane | Planks down from the gate; two ladders of five in the air | A stoop of stone at the gate with a step down to the lane; a mounting block before the second house; one rung over each, between stone sides |
| The long table, the two houses | A ladder of five; seven planks a house | A stair of two steps and a rung; in each house a block on each floor to step from (four planks left: the boards over each stair's well, and the two ways in and out) |

**The seven pieces of rock still in the air**, said plainly: three are the hanging gardens' own terraces (the floors
between the open rooms: this is a garden hung in the sky, and nothing joins them to the map's edge), and four are the
aqueduct's spans, which stand on piers that are painted, not built (a built pier would wall off the beds under them).

**What I learned:**

- **A jump out from under a floor needs the floor's height counted.** The arches' east stair first had its step under
  the deck: the jump up from it met the deck's underside by one row. The block is lower, and a rung finishes it.
- **A shelf over the place he jumps from shuts it.** The Breach's first course overhung the rubble he climbs from.
- **A bloom is the Gardens' ladder.** Where a way goes straight up through open air, a bloom under it does what five
  planks did, and says what the region is about.
- **Things painted on the floor move with the stone:** a pier and a bed of the arches, a chest in the sluices, an urn
  in the spill were inside new stone, and are beside it.

## The Firmament, room by room (build 105)

*Your word, 26 Nov: "Let's finish the other levels as well." The Firmament, its wing (the Orrery Wing) and its passage
(the Long Stair). `docs/firmament-map-pass.png` is the region before and after; `docs/firmament-map-pass-rooms.png`,
six rooms in the game.*

**68 planks became 30, in 40 screens: under one a screen.** 24 were bare in the air; none is now. Of the 30: 20 rungs
(wall to wall), 4 steps off a wall, 6 with ground under them. No rock hangs in the air, before or after. **The
star-glass is not planks** (it is there and not there by turns): it is as it was.

| Room | Before | After |
|---|---|---|
| The Long Stair's flights | Four landings of planks in the air, four rungs | Three flights of the stair's own stone, out of one wall and then the other; two rungs between stone sides to the top step |
| The stair's foot | Four rungs over the pool | Three, the upper two between stone sides |
| The forecourt | Five planks up the tower's face | A block, two corbels of the tower (the upper shorter), and a rung under the way in |
| The meridian | Five planks up into the gnomon; a shelf for a chest over nothing | A block; rock hung from the gnomon's floor beside the hole, a step out of its foot, one rung. The shelf a row lower, within a post's reach of the island |
| The gnomon | A plank; the high door's landing and the thread's shelf planks | A block; the landing the door's own sill; the shelf a lip of the wall. Its floor of planks half way up stays: a made floor, wall to wall |
| The archive, the lens, the aphelion, the vigil | Shelves of plank | A course over each of the archive's doors; a lip of the lens's pier; a lip of the aphelion's wall; two steps of stone in the vigil |
| The transit, the ascension | Five planks up the tower; three up to the summit | A block and two corbels of the tower; a block, the star-glass, and a shelf of the wall under the way up |
| The orrery | A plank up to Corwen's cell; a plank on the cell's roof | The plank a row lower over the floor (a post's reach); the other is the roof's stone |
| The hours | Five rungs in the air | Two steps of stone and a rung between stone sides |
| The arms | Two planks off the top of the turn; two shelves | One rung between stone sides; the shelves are the wall's |

**What I learned:**

- **A way in under a low floor has one column that works.** The orrery's way in comes up under Corwen's cell: only its
  west column has room to stand. The foothold under it must reach that column, so the last step is a rung the hatch's
  whole width, not a short corbel.
- **Under a low shelf there is no room to jump high.** The vigil's step blocked the hall for the simpler check (and
  would have been a fight for a person): it is two steps, the lower on the shelf's side.
- **A porch out from a cell is a low place under it.** I tried one for the orrery and took it out.
