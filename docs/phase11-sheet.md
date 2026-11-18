# Phase 11: the Spires' wings (the sheet)

Two wings (`docs/roadmap.md`): **the Pilgrims' Cairns** (west, behind the Wyrm's wind) and **the Glacier Galleries**
(east, behind the Toll's step). This sheet is the Cairns, built in build 62 on your word to go on to the next phase. The
Glacier Galleries are the next sheet.

## The Pilgrims' Cairns

*Spires, west · 9 screens · behind the Wyrm's wind*

**What it was.** Where pilgrims who turned back built a cairn before they went down, each stone a reason.

**The question at its door, and the answer before he leaves:** *why did they stop here?* Every stone says why, and each
reason is a good one. One of the cairns is his.

### Its two rules

The Scriptorium was about what is in front of someone; the Bell-Foundry was about noise. This is about which way he is
facing.

- **A cairn is only stones while he looks at it.** With his back to it, it comes apart and comes after him, tumbling,
  and strikes what it reaches. Looked at again, it is a cairn where it stands, and can be knocked down.
- **The stones of the way hold while he does not turn round.** A line of flat stones over a drop: the way he faced when
  he stepped onto them is the way he must keep facing. Turn round and every one of them is gone from under him, until he
  stands on the ground again.

So: on the ground, turn and face what follows. On the way, do not turn, though what follows is behind him. This is the
wing's knowledge gate (Metroidvania idea 5). The first stone of the way lies against the ledge over a step: there,
turning round costs a short drop and shows what it does.

### How it is entered, and left

- **Out of the eyrie's west wall** onto the mountain's shoulder. Anyone may walk out and look across **the wind gap**:
  the far cliff is too high and too far to leap to. The wind rises in the gap: **the Wyrm's wind carries a glider up and
  over.**
- **The way out is always open:** a hole at the foot of the Turned's slope, down the scree, out into Ordric's hollow. It
  cannot be climbed from below. He can leave without ever facing the Turned, or seeing what is behind him.

### The rooms

| Room | Screens | What it is | What he does there |
|---|---|---|---|
| **The wind gap** | 1 | A ledge outside the eyrie, a gap, the wind rising in it, a cliff beyond | Looks across. Comes back with the Wyrm's wind |
| **The cairn-field** (vast, under the sky) | 2 | Terraces going down westward, cairns on every one, words on the stones | Learns the cairns: he is always between two of them. A needle of rock with a red strand on it, for one who rides the wind beside it |
| **The reasons** (the way no one expects) | 2 | Under the field: a drop, and the way across it in flat stones | Crosses without turning round: first stone to stone, then a long stretch with a cairn coming after him |
| **The Turned's slope** | 2 | A long slope, the Turned standing on it facing downhill | The elite. Or not: the hole to the scree is downhill of where he comes in |
| **His cairn** | 1 | Uphill, past the Turned: a cairn with his name on it, from before he fell | Knocks it down, or leaves it. The relic |
| **The scree run** | 1 | Down from the slope's foot to Ordric's hollow | The way out |

### Who is in it

| Who | What it does | How it is read, and answered |
|---|---|---|
| **Cairn** (7) | Still while he faces it. Behind his back it comes apart and rolls after him, slower than he runs, and strikes | It is heard to come apart. Turn and face it; then knock it down (three cuts). It cannot be cut while it rolls |
| **The Turned** (the elite) | A climber who turned back, and stayed. He stands in the way of whatever comes up at him: **a shove** that throws it back down the slope, and **his staff brought down**, which sends a rush of stones down the slope. He does not turn round, ever | The shove: half a second of his arm drawn back; it moves him even through a guard. The stones: jump them. **A roll goes through him, and so does a leap over his head: behind him he does nothing,** and a blow from behind counts for more. Walk away from him and he lets it go. Twenty-four cuts, or twelve from behind |

### His cairn, and the relic: the Pilgrim's Stone

At the top of the slope, past the Turned: a cairn with a strip of red tied to its top stone. The first time he comes to
it: **"His own cairn: his name is on the top stone, from before he fell. Under it: NOT YET."** He can knock it down:
**"It is down: the stone with his name on it lies with the others."** It stays down.

The relic beside it, **the Pilgrim's Stone**: *after a blow, nothing can hurt him for a breath longer.*

### What is said

- The stones' words, as he stands by one: TOO COLD. NOT YET. MY KNEE. NOT ME. THE WIND. NEXT YEAR. THE CHILDREN. IT IS
  ENOUGH TO HAVE SEEN IT. And on the Turned's slope: GO DOWN.
- The first time the way goes from under him: "he turned round, and the way was gone".
- The Annals: the Cairn, "A reason to turn back, in stones. It follows whoever will not look at it." The Turned, "He
  turned back, and stayed. He lets no one up past him."

### Its look

The Spires' own: open sky over the field and the gap, the mountain's rock under them. Painted in: cairns everywhere, and
the stones with words on them.

## Art

One new drawing with two animations (the Turned: his shove, his staff). The cairns are drawn in code, stone by stone.
**Cost: $0.07; the balance is $2.90.**

## As built (build 62), and what was checked

- **258 automated checks pass**, ten of them the wing's own: its screens and gate; the scree not being a way in; the
  stones of the way under the real motor (turned round on, crossed without turning, a foot on the rock); a cairn looked
  at and not; the Turned (in the way, behind him, walked away from, rolled through, his stones); his cairn and the relic.
- **Played through by the test browser:** a cairn coming apart behind him and striking him, and stopping when he
  turns; the long stretch of the way crossed with a cairn following; the Turned holding the slope against him and
  throwing him back three times; two blows from behind taking four of his strength; his own cairn's words, and its fall.
- **Changed while building:** the far cliff was raised and given a lip (he could leap to it with the Toll's step);
  the Turned could be run straight through, so he now stands in the way of anything on its feet; the scree's bank was
  raised (the drop onto it hurt) and its door moved up clear of Ordric's lamp; the way falls only when he stands on
  its stones alone.
- **Not checked:** nothing here was played by hand. The glide across the gap was flown only by the automated player,
  not in the browser. The sounds were not heard. The first stone's lesson (turn round on it, drop one step) was not
  watched happening. The relic was checked by its number, not in a fight.
- **The published page is at its limit of files** (509 of 511). The old spitter's drawing, a fallback no longer
  reached, was taken out of the page to make room; the game and the itch zip are unchanged by that. The next wing needs
  the page's code packed into fewer files first.

## Differs from the world plan (`docs/world.md`)

- **The scree comes out in Ordric's hollow,** not the mouth: the hollow is where the wing's foot is, and it has a flame.
- **The cairns do not become other creatures:** the cairn itself is the creature, and what wakes it is his back.
- **The Turned can be passed without being killed,** and left without being fought.
- The plan's knowledge gate here was "a path that is only there when he walks toward the dark". Built as: a way that is
  only there while he does not turn round.

# The Glacier Galleries (the second half of phase 11)

*Spires, east · 10 screens · behind the Toll's step*

Built in build 64.

**What it was.** Caves in the glacier where climbers sheltered from the wind and sat down to rest. The ice took them
slowly. The Stopped are from here.

**The question at its door, and the answer before he leaves:** *why did they not get up?* Nothing here hurts him until
he lights a fire. It was warm enough to sit, and never warm enough to wake.

## Its rule: warmth opens, and it wakes

The Cairns were about which way he faces. This is about what he chooses to light.

- **A cold brazier is lit by a blow,** for good.
- **Its fire melts the ice nearest it in its room:** the way that ice closed, the chest that was kept in it, and
  whoever sat down in it. The ice is clear: he can see what is in it before he strikes.
- **A sitter in the ice is only a shape.** When his fire is lit he shakes it off and is one of the Stopped.
- So every fire is a choice, and most of them are not needed. Three are: two in the shelter and gallery that melt the
  way on. The rest give a chest and wake someone, or free more of the Seated.
- A swing no longer turns round by itself to strike a brazier behind him (or a bell's tongue, in the Foundry).

## How it is entered, and left

- **Through the horn,** off the last ledge up it: a pane of thin ice in its outer face. The Toll's step breaks it.
- **The way out is the meltwater:** out through the tower, down a shaft inside its foot, and out of the foot's west
  face over the saddle. From below the shaft is not climbed.

## The rooms

| Room | Screens | What it is | What he does there |
|---|---|---|---|
| **The shelter** | 1 | Where they came in out of the wind: two cold braziers | **Is shown the rule.** The first fire melts a chest out of the ice, and a sitter with it. The second melts the way on |
| **The sitters** (the gallery) | 2 | Climbers in blocks of ice along it, and what they carried | Three fires: a sitter and a chest of shards; a sitter and a red strand; a sitter, and the way down |
| **The deep ice** (vast) | 4 (two by two) | Three floors of ice, one under another, a pane of thin ice across each; the loose ones adrift | Down through it by the Toll's step. One fire, not needed: a strand, and a sitter |
| **The Seated** | 2 | A giant of a climber against the far wall, wholly in the ice; three braziers; a relic in the ice behind him | The elite, if he chooses. The way out is at the near end: he can walk past |
| **The meltwater** | 1 | Where the ice lets go | The way out |

## Who is in it

| Who | What it does | How it is read, and answered |
|---|---|---|
| **Brazier** (10) | Cold until struck. Not a creature | Look at what its ice holds first |
| **Sitter** (6) | In the ice: nothing, and a blow does nothing. Its fire lit: it shakes for most of a second, then drifts, rears and rushes as the Stopped do | Do not stand beside the ice when the fire takes. Three cuts, as it recovers |
| **The Stopped** (3, loose in the deep ice) | As in the Spires | As in the Spires |
| **The Seated** (the elite) | **No fire lit: he is in the ice, and the blade rings off it.** One fire: an arm is free, **a long low sweep** along the floor (two hearts, and it throws him). Two: **he calls ice down from the roof** where the floor is marked. Three: **he gets up and comes** | The sweep: 0.7 s of his arm drawn back; be over it. The falling ice: 0.8 s of mark; move. **The more of him is free, the more a blow counts: half, whole, half as much again.** Thirty cuts' worth |

The relic is in the ice behind him and answers to the fire nearest him. To take it without killing him is to light one
fire and reach under his arm.

## The relic: the Climber's Flint

*A blow that lands gives two embers, not one.* It lit the shelter's fire every night of the climb. On the last night no
one struck it.

## What is said

- The first time a fire is lit: "the fire takes; the ice near it lets go".
- When the Seated falls: **"The Seated lies down: what the ice kept, the fire let go."**
- Mirel, in the nest, once a fire has been lit: **"I sat down in the galleries once, to rest. I got up. I do not know
  yet which was harder."**
- The Annals: the Seated, "He sat down to rest. The ice took him slowly. A fire brings him back, and not kindly."

## Its look

The glacier's inside: blue and dim. Blocks and panes of clear ice, drawn over what is in them. **Not as planned:** the
Spires' bright sky still shows through gaps in the back wall, so it is lighter and busier than "blue through ice, very
dim". To be closed in the next build. Painted in: bedrolls, packs, meltwater on the floor.

## Art

One new drawing with one animation (the Seated: his sweep). The braziers, their fire and the ice are drawn in code; the
sitters are the Stopped's own drawing. **Cost: $0.06; the balance is $2.85.**

## As built (build 64), and what was checked

- **266 automated checks pass**, seven of them the wing's own: its screens and gate; the ice answering to its own fire
  and no other; the way on shut with no fire lit, and the way out not a way in; the brazier; the sitter; the Seated at
  no, one, two and three fires and what a blow takes at each; the relic.
- **Played through by the test browser:** the first fire lit (two patches of ice gone, the sitter waking and turning
  into one of the Stopped); the second fire and the walk through the melted door; a fire in the gallery; the Seated
  ignoring blows in the ice, sweeping with one fire, calling ice down with two, getting up with three; a blow taking
  0.5, then 1; his fall; the fires still burning on coming back.
- **Found and fixed while building:**
  - a swing turned round by itself to strike a brazier behind him, and lit it. It no longer turns to things that are not
    creatures;
  - the wear banked the floor up against each pane of ice and left no way through; kept clear now;
  - he could drop from the Last Hut's sill onto the gallery's roof and be stranded; that is rock now;
  - each blow shoved the Seated back toward the wall; seated, he no longer shifts.
- **Not checked:** nothing here was played by hand. The Toll's step through a pane was done only by the automated
  player. The way out (the shaft in the tower's foot) likewise. The sounds. Taking the relic from under his arm.
- **Ten screens, not twelve:** the plan's twelve would have needed a room with nothing in it.

## Differs from the world plan

- **Mirel does not sit here.** She says that she did, in the nest. A second place for her in one region is not built.
- **The Seated does not start half-freed.** He starts wholly in the ice, and how much of him is freed is the player's
  doing.
- The plan had no rule for the wing; the fires are new.

## Left for later

- The Cloister's refectory (left from phase 10).
- Phase 12: the Tempest's wings.
