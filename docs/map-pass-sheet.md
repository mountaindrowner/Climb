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

1. **Shelves alternate, six rows apart.** From a shelf on one wall to the next on the other is six rows up. Two on
   the same wall are twelve apart. Closer, and his head strikes the one above before his feet reach the one across.
2. **Shelves taper.** Two thick only at the wall half. A shelf two thick to its lip closes the jump under it.
3. **Two clear tiles between the lips** of facing shelves. His body is a tile and a third wide.
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
| The well | 13 | A boulder, then eight shelves, left and right, up both screens |
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
