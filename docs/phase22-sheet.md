# Phase 22: a puzzle in every section, and one great one (the sheet)

*Written 28 Nov, for your yes before anything is built (`docs/roadmap.md`, "The finish line"). Nothing here is built.
It puts together the roadmap's phase 22 ("a puzzle in every section... and one great puzzle, across the whole
mountain"), the summoning item from "Ideas kept for later", and your three rulings on it: decision 0.23 (a puzzle is
one of the challenges a gift can stand behind), 0.27 (a hint is never a giveaway and never a poem) and 0.28 (the great
puzzle is six out of ten cryptic, and phase 22 stays apart from everything else). The lines anyone speaks are mine,
and are for your yes.*

*Where `docs/design/lore.md` and `docs/story.md` differ (the older plan of Orrow, the Wending and the Pool), I have
followed `docs/story.md` and `docs/world.md`, which are what the game is built to.*

## What this adds, in short

- **Twenty-three sections,** as the code has them: the six regions of the climb, their eleven wings, the five levels
  of the Deep, and the Shard. **Twenty-two puzzles:** one in each, and none in the Shard (question 6).
- **The sixteen far ends** (build 116 to 120) each have a working already, by decisions 0.32 and 0.33. They get
  nothing new. They are listed at the foot of the tables so that no new puzzle repeats one.
- **One great puzzle:** five old stones, each with a dry hollow, in five sections of the climb, and one with five
  hollows by the pool he wakes in. Water given to each of the five comes back at the pool. When all five have been
  given water, the pool gives something back: the summoning item.

## What makes a section's puzzle (the roadmap's words, and how I have held to them)

- **Worked out, not fought and not jumped.** Each has one thing to understand. Where a creature is in it, the answer
  is to use what it does, not to beat it. Where there is a jump, it is one he can already make anywhere.
- **Small enough to solve in its room.** One room, or a room and the one beside it. The rule is shown in the same room
  or was learned in the section already.
- **Made of that place.** Each is the place's own working (its fire, its water, its bell, its lens) used in a way the
  place has not used it yet: "deepen before adding" (`docs/writing.md`, what he learns).
- **Learned without being told.** No words say how. Each row says what in the room shows it.
- **An ordinary prize:** a chest, or a short way round. A thread only where a section's count has room (question 8).
- **Nothing lost for good** (`docs/writing.md`, rule 12). A puzzle done wrong can be done again, at worst after a rest.
- **The lever is not beside what it moves** (decision 0.33), where the puzzle has a lever at all.

## How every puzzle is checked

Every puzzle gets three checks, in a test file of its own (`tests/side-puzzles.test.mjs`), and each row below says
what else:

1. **Reach.** The prize cannot be reached without the solve, and can with it: the reach model and the real motor,
   both ways round, as the gates are checked now (`tests/helpers/reach.mjs`).
2. **Played.** The tests' player solves it from the room's door by the room's own rule. No free pass (the tests'
   `calmFree`, `swFree` and `litAll` are off for these rooms).
3. **Nothing lost, nothing stuck.** Half done, it can be done again after a rest; the stuck-finder passes in the room;
   the region's thread count holds; the save keeps a solve across a death, a rest and a reload.

## The six regions of the climb

The regions have no worked-out puzzle yet: their gates are gifts (cracked stone, thin ice) and their timing is
jumping (star-glass, the bell's beat). So these six are the first of their kind in each region, and the first two are
meant to be easy.

| Section | What it has now | Its puzzle | How the rule is learned | What solving does, and the prize | Checked by (besides the three) |
|---|---|---|---|---|---|
| **The Roots** | Cracked stone in three walls (the hammer); the gallery nook's rotten boards (the slam); the pool; the delver in the tunnel | **The delver's crust** (the tunnel). A stretch of the tunnel's floor is a crust of dried silt over a hollow in the rock. It bears him, and nothing of his breaks it: it is not stone, so not the hammer's (decision 0.3). The delver runs under the floor and bursts up where he stands: under the crust, it bursts through | A second patch of crust in the same tunnel already has a hole burst through it, and the delver's way shows in the rock under it. And the delver is met first on rock, where he sees how it comes | He stands on the crust and lets it come, and steps off as it rears. The crust is gone. In the hollow under it: a chest | The crust breaks to a delver's burst and to nothing else (sword, hammer, slam); a delver under him finds him on the crust every time |
| **The Cloister** | Doors in the belfry that keep the bell's beat (open for good once the Toll falls); a walled-up cell in the stairwell (the hammer); the refectory | **The ringers' rope** (the belfry). High in the tower, a door into the ringers' loft. Unlike the others it never opens on the bell's own beat: its catch was set for the ringers' strokes. The bell's rope hangs beside its sill. Struck, the rope rings the bell at once; the loft door opens on that stroke, and every door in the house starts its beat again from it | The rope is in plain sight. A blow to it rings the bell, which is heard everywhere in the Cloister, and the doors below are seen to swing on it | He strikes the rope and goes in. The loft: a chest. After the Toll falls the door stands open like every other (Metroidvania idea 4), so the loft is a walk then | Waiting at the sill, the tests' player never finds it open; after a blow on the rope, he does |
| **The Spires** | Thin ice across the way up (the dash); a thin wall in the chimney (the hammer); the gusts while the Wyrm holds the wind | **Blocks on the ice** (the ice cave). Two blocks of ice stand on the bank at the cave's back. Struck, a block slides along the ice until something stops it, and drops into the first pit it reaches, flush: a step. The chest is on a shelf over the far pit, too high from the floor. The first block sent fills the near pit; the second slides over it to the far one | By the cave's mouth a small pit already has a block in it, sent there long ago, and he walks over it. The first blow shows how they slide | One block, then the other. The chest. A block sent wrong is struck back; both are on the bank again after a rest | Where a block stops is worked out on the tiles, and both orders are played |
| **The Tempest** | Rising air; the lightning rods (the Thunderhead's fight); rain and bolts | **The tallest rod** (the anchorage). Three of the Wrights' rods stand on the hung deck, and lightning in this room always strikes the tallest. A wire runs from the shortest along the deck to a Wrights' locker with a coil for its latch. Three blows of anything bend a rod over | From the deck the bolts are seen to come down on the same rod every time, and the wire is drawn plainly along the boards | He bends the two taller. The next bolt finds the short one, runs down the wire, and the locker opens: a chest. The rods stand again after a rest; the locker stays open | The bolt always picks the tallest rod standing; the locker opens only to a bolt down its own rod |
| **The Gardens** | The blooms that throw him; a sealed niche at the wellspring's top and a walled vault in the orangery's roof (the hammer) | **The bud in the shade** (the canopy). Blooms open only in the sun. Under the canopy's roof light a bud is shut: a vine has grown over the light. Cut, the vine grows back before the bud can open. Its root is across the bed of thorns, reached by the canopy's own bloom. Cut there, it does not grow back | In the same room the blooms in the sun are open and the one in the shade is shut. Cutting the vine shows the bud begin to open, and then the vine grow back over it | He cuts the root. The light comes in, the bud opens, and it throws him to a terrace over the garden wall: a chest, and a short way back to the sundial | The vine grows back unless its root is cut; the bud opens only in the sun, and throws him to the terrace |
| **The Firmament** | Star-glass that is there for half of each beat; a sentinel; cracked stone in the lens room | **The lens** (the lens room). The great telescope throws a beam of starlight down the room, and star-glass in the beam is there on both halves of the beat. Its wheel turns it a notch at each blow, and the beam falls on the next plank. A shelf high on the wall is reached over a run of planks that are never all there at once | On coming in, the beam lies on one plank, which stays while its neighbours come and go | He turns the telescope until the beam holds the plank that breaks the run, and crosses. The shelf: a chest | A plank in the beam is solid on both halves of the beat, with the tests' `PHASE.all` off |

## The eleven wings

Every wing has a rule of its own already, and most have a working in their far end too. Each puzzle here uses the
wing's rule in the one way neither the wing nor its far end has used it.

| Section | What it has now | Its puzzle | How the rule is learned | What solving does, and the prize | Checked by (besides the three) |
|---|---|---|---|---|---|
| **The Drowned Galleries** (Roots, west) | The water breathes (it rises sixteen tiles and falls, always the same); three gates, each with its windlass somewhere else; a hatch struck from below; the undercroft, under water | **The float** (the drowned hall). The keepers measured the water with a float on a chain. As it rises on high water, a small gate over a dry niche at the hall's foot goes up with it; at low water it is down, and the niche is dry only at low water. Beside the float's high place, a catch on the wall that holds its chain when struck | The float and the gate are seen to move together on every breath, the chain running between them up the wall | At high water he floats up to the float and strikes the catch. At low water the gate stays up and he walks in: a chest. The catch stays held | The gate follows the float; the catch holds it; the niche is reached only at low water with the catch held |
| **The Ossuary** (Roots, east) | Two scales (weight in a pan lifts a slab somewhere else); Tallymen who carry back what is in a pan; the Unsorted's three stacks (far end) | **Counted** (the sorting). The Tallymen carry what lies still in the low heap up the wall to the shelf where the counted go, a climb he cannot make. They take whatever lies still there. Crouched in the heap and not moving, he is taken up with the rest and set down on the shelf | A bone knocked into the heap is seen carried up the wall to the shelf. A Tallyman passes him by while he keeps still | He crouches in the heap and waits. On the shelf: a chest, and a drop back down | A still, crouched him in the heap is carried; if he moves, he is let fall and struck |
| **The Scriptorium** (Cloister, west) | Vellum only the dash tears; the furnace's rising air; the chute back; copyists and blots; the far end's rolling ladders | **Let it stand** (the copying hall). A copyist's frame stands across a carrel with a page on it, and nothing passes a page. A blow to the page is a correction: the copyist scrapes it and begins it again, and it is still there. A blot that reaches it and is left alone spoils it: the copyist takes it down to the furnace, and the frame is empty for a while | Across the hall a copyist is seen carrying a blotted leaf to the furnace. Blots already follow where he steps in the ink | He leads a blot through the ink onto the page, and then does nothing. The carrel: a chest | A blot on the page and no blow for a few seconds empties the frame; a blow puts a new page up |
| **The Bell-Foundry** (Cloister, east) | Iron rings when touched; while it rings the tongues swing, the slag wakes and the shutters come down; silence ends it; the Cull's crane (far end) | **The alarm, used** (the casting floor). One shutter here closes no door: it comes down across a slot in the pit's side, and is a shelf, the only way up to the founders' gallery. It is only down while something rings. A tongue on a long chain, once set swinging, strikes the mold beside it at every swing, and rings for as long as it swings | The slype has shown the rule at the wing's door. From below, the slot and the shelf it would make are plain | He touches the long tongue and climbs by the shelf while everything is awake. The gallery: a chest | The shelf is there only while something rings; the long tongue rings long enough for the climb, and no longer |
| **The Pilgrims' Cairns** (Spires, west) | Cairns that are stones while he looks at them; the way of flat stones that holds while he does not turn round; the Turned; his cairn; two wind-breaks | **A cairn for a step** (the cairn-field). A ledge with a chest is a row too high for him. A cairn comes after him while his back is to it, and falls to a heap of stones where it is when he turns and looks: a heap he can stand on. He walks past the ledge's foot, so that it is under the ledge when he turns | The first cairn met falls to a heap when he faces it, and stays a heap until he turns away | He leads it, then faces it, and climbs it to the ledge facing the same way. The chest | A heap is solid while he faces it; the order (past the ledge, then turn) is the only one that works |
| **The Glacier Galleries** (Spires, east) | Braziers lit by a blow; each melts, for good, the ice nearest it in its room, and what sat in it wakes; the Crevasse's fire far from its ice (far end) | **A fire in the ice** (the deep ice). The chest's block answers to a brazier that is itself shut in a block of ice, so it cannot be struck. Its block answers to a second fire, across the room | A cold fire is seen inside its block, drawn as the others are. Fires are already known to melt what is nearest | He lights the open fire, which melts the shut one free; he lights that, and the chest's block melts. The chest | Each block answers to the fire the sheet says (the nearest in its room, as now); the chest is not reached any other way |
| **The Wreck of the Works** (Tempest, west) | The current is in one half of the iron; a lever sends it to the other; the Jar kills it all; the Great Rod's two flights (far end) | **Stopping an arm** (the cranes). A Wright's-arm swings only while its iron is live, and stops where it is when the current leaves it. One swings out over the drop toward a pier with a chest and back. Its lever is on the next pier along | The first lever he throws in the wing stops the arms on one half where they are | He throws the lever as the arm reaches the far pier, and crosses on it. The chest. After the Jar falls, the arm is left over the far pier (where the Wrights rested it), so nothing is lost | The arm stops where it is at the throw; from that stop, the far pier is reached |
| **The Eye of the Storm** (Tempest, east) | Nothing moves while he moves; the Hush move only while he stands still; doors of cloud open to one who waits; a floor of cloud that lets him down if he stands on it; the Blue (far end) | **The weight that falls while he waits** (the upper still). A weight hangs on a chain over a pulley and holds a gate shut. Like everything here it moves only while he is still: while he waits, it sinks and the gate rises. When he moves, it stops. Unlike a door of cloud, it does not close again by itself | The wing's first room shows that nothing moves while he does | He waits, with the Hush coming, until the gate is high enough; then he goes, and the gate stays up because he is moving. The cell: a chest | The gate rises only while he is still and holds while he moves |
| **The Aqueducts** (Gardens, west) | Running water carries him; a fall bars a climb; sluice wheels stop or start it; the stone keepers put each wheel back; the Rising Main (far end) | **Carried off** (the sluices). A wheel on the top landing shuts the fall under a ledge with a chest, but its keeper stands beside it in a dry channel and turns it back at once. Running water carries whatever stands in it. Started, the channel carries the keeper away to the foot of the sluices | He has been carried by the channels himself, all through the arches. The keeper stands plainly in the dry channel's way | He starts the channel; the keeper is carried off; he shuts the fall and climbs. The chest. The keeper is back at its wheel after a rest | Running water carries the keeper; its walk back is longer than his climb |
| **The Keepers' Houses** (Gardens, east) | Disturb nothing: a setting broken brings the Housekeeper by the servants' doors, and his house is shut while anything is out of its place; the Last House's kept door (far end) | **Let it in** (the long table). A cupboard at the hall's end is a kept door: shut while anything in this hall is out of its place, and a cup is, from the first. The servants' door nearest it is barred on the far side, so the Housekeeper has never come to set the cup right. He cannot set it right himself: only the Housekeeper can. The cup counts for the cupboard only, not for his house | By the long table he knows what the Housekeeper does. The bar across the servants' door is plain, and the passage behind it is on his way round from the lane | He draws the bar from the passage, and keeps out of reach while the Housekeeper comes through and sets the cup. The cupboard: a chest | The cupboard opens only when the cup is set; only the Housekeeper sets it; the bar is drawn only from behind |
| **The Orrery Wing** (Firmament, east) | Things that move carry him; it calls an hour and strikes the one after; the Almanac; the Outer Ring's stopped planet (far end) | **The hour after** (the arms). An arm carries him past a hatch in the wall once a turn. The hour it opens is cut over it. Like everything here, it keeps the hour after the one it says. A dial on the wall shows the hour called | The floor of hours has taught it: what is called is not what is struck, always one late | He rides at the hour after the one cut over the hatch, and it is open as he passes. The chest behind it. The wrong hour costs a turn | The hatch is open only at the hour after its own; the arm passes it once a turn |

## The five levels of the Deep

The Deep was built in phases 15 to 17, so its puzzles are here (question 3). Since the throw (build 121) it is on the
way, so everyone sees them, climbing out.

| Section | What it has now | Its puzzle | How the rule is learned | What solving does, and the prize | Checked by (besides the three) |
|---|---|---|---|---|---|
| **The Workings** | The cage's frame; props that fall behind him; a rail line with carts; the cistern; the Winding-House (far end) | **Which prop** (the props). A slab of the roof hangs on two props beside a stope cut up into the roof, too high to reach. Knock out one prop and the slab comes down at that end and leans: from its high end, the stope is reached. The other prop leans it the wrong way | Further along, a slab has already come down and lies as a ramp where its prop gave | He knocks out the prop under the end away from the stope. The stope: a chest, and a short way on up to the long level. The slab is propped again after a rest | The slab leans to the end whose prop went; only one way reaches the stope |
| **The Vein** | The Echo goes where he went a few seconds ago and strikes where he was, and keeps out of the light of a lamp he lit; the seal; the grate's ring; the False Lode (far end) | **Two plates** (the knot). The guild's ore-door is open while both of its plates are pressed. They are too far apart for one body. His Echo steps where he stepped. He steps on the first, walks on to the second, and as he stands there the Echo comes on to the first | A plate is heard to click behind him, after he has left it | One plate, then the other, then through. The ore-room: a chest. No guild lamp hangs near the first plate, so lighting lamps can never spoil it | The Echo replays his way onto the plate; both pressed opens the door |
| **The Flooded Levels** | Deep water; the Wyrm's wind takes him under; the Pump's tide; rafts that sink when stood on; drowned lamps still lit; the Drowned Stope (far end) | **The flap** (the pockets). Under the wall between two pockets of air, a flap hung from its top closes the drowned arch. Whichever side's water stands higher holds it shut. The Pump's tide raises one pocket as it lowers the other: once in each stroke, the two are level, and then the flap swings when struck | A tide-mark is cut on each wall. At the moment they are level, the flap is seen to stir | He waits for the level, strikes, and goes through. The pocket beyond: a chest | The flap moves only at the level; the level comes once a stroke |
| **The Great Shaft** | Cold air up the drop, holding him back; the camp's stages on ropes; the floor under water; the guild's depth marks; the Adit's wall (far end) | **The missing mark** (the drop). The guild cut a depth mark at every stage, one under another down the shaft's wall, evenly spaced. One is not there. In its place, a plate of the guild's hangs on a peg | The marks are passed, one under another, on the way down or up. The gap in the row is plain once the row has been seen | Struck, the plate swings aside: a niche with the camp's stores, a chest | The niche is reached only through the plate |
| **The Hollow** | The Auger's hall of three floors; the rough wall home (the grip); the Source; Echoes, many; the guild's last camp; the Far Wall (far end) | **The camp's lamp** (the camp). The guild's last lamp hangs high on a pole over the tents, on a rope through a pulley to a cleat, and it is out. While it is out, Echoes crowd the ledge under the roof that is the only way to a cleft. He cannot reach the lamp. He can let it down by striking the cleat, light it, and send it up again | On the roof's ledges, where he lands, the Echoes are seen to stop at the edge of the light of the guild's lamps that are lit | He lets it down, lights it, sends it up, and the ledge is lit. The cleft: a chest | The lamp lit and raised lights the ledge; the Echoes keep out of it |

## The Shard

| Section | What it has now | Its puzzle |
|---|---|---|
| **The Shard** | Four rough faces, a pane (the dash), sixty-four tiles of air, a crust (the hammer); the light; no one; nothing written | **None proposed.** "Left alone on purpose" (`docs/world.md`). Getting there already asks for every gift he has. Question 6 |

## The far ends, kept as they are

Each already has its working, and the twenty-two above were chosen so that none repeats one.

| Far end | Its working now | The nearest new puzzle, and how it differs |
|---|---|---|
| The Drawing-Place (Roots, west) | A bucket-chain that moves once its windlass is turned; the Sounding, for one who can dive | The Drowned's float: a thing the water moves, held, not a thing wound |
| The Unsorted (Roots, east) | A scale in three stacks, kept by two Tallymen | The Ossuary's "Counted": the Tallymen carry him, not the bones |
| The Empty Shelves (Cloister, west) | Two rolling ladders, each left at the wrong end | None near |
| The Cull (Cloister, east) | A crane, wound from the pit's floor; tongues that drop a shutter | The Foundry's shelf: the shutter wanted down, not kept up |
| The Way Down (Spires, west) | A wind-break at the bottom that lets the wind back up the cleft | None near |
| The Crevasse (Spires, east) | One fire far from its ice, and a second at the bottom | The Glacier's fire in the ice: a fire freed by a fire |
| The Great Rod (Tempest, west) | Two levers on two flights of iron; a crane's hook on a rail | The Works' arm: stopped, not sent |
| The Blue (Tempest, east) | Floors of cloud that let him down when he stands still | The Eye's weight: it rises while he waits and holds while he moves |
| The Rising Main (Gardens, west) | Four falls, three wheels at their feet and one far above, a keeper at it | The Aqueducts' "Carried off": the keeper moved by the water |
| The Last House (Gardens, east) | A kept door shut while anything in the row is out of place | The Houses' cupboard: he lets the Housekeeper set it right |
| The Outer Ring (Firmament, east) | A stopped planet, wound by a key at the far end of the wing | The Orrery's hatch: the hour, not the winding |
| The Winding-House (Workings) | The cage, which runs once its engine is going | None near |
| The False Lode (Vein) | A ring with its air-door shut from within, and an Echo | The Vein's plates: the Echo used, not escaped |
| The Drowned Stope (Flooded Levels) | A windlass in the air that raises a grate under the water | The flap: the tide, not a windlass |
| The Adit (Great Shaft) | A wall against the cold; knocked down, the cold carries him up | None near |
| The Far Wall (Hollow) | Rough rock, climbed with the grip | None near |

The five passages between the regions (the Crypt Stair, the Bell Road, the Last Hut, the Breach, the Long Stair) are
not in the roadmap's list of sections. They are the climb's pauses (`docs/writing.md`, rule 10), and each has its nook
from build 123. I would give them nothing (question 7).

---

## The great puzzle: the keepers' stones

### What is true (never said)

*For `docs/world.md`, when it is built.* The Well's keepers, the first people on the mountain, kept the water at its
foot and believed that what is given to the water comes back. When those who came down for the water carried it up
the mountain, the keepers set a stone wherever it was carried to: a block of their pale stone, knee high, with a
round hollow in its top and a hole through the hollow's floor, down into the rock, so that a little could be poured
back. At the first water, the pool he wakes in, they set one stone with a hollow for each of the others. Nobody has
poured any back since the dark. The floor of their drowned hall shows it: people carrying water up a mountain on
their shoulders (it is in the game already, build 107).

### The pieces

All six stones are drawn alike, in the pale stone of the Drowned Galleries, and nothing else on the mountain is drawn
like them. Each of the five is dry, in a place where it should not be: a basin standing dry beside running water, in
a glacier, in a storm.

| Piece | Where | What it looks like | Why he would notice it | How it is given water |
|---|---|---|---|---|
| **The stone at the pool** | The Roots' first room, on the lip of the pool he wakes in, between the water and the first step | The keepers' stone, long, with five round hollows in a row, all dry | It is beside the place he wakes, and is raised to after every death in the Roots. It is the most seen thing in the game | It is not given water: it shows what has been. Each time one of the five is given water, one hollow here fills, west to east, and stays full |
| **The floor's picture** | The Drowned Galleries' great hall, the floor seen at low water (built, build 107) | Changed: the same people carrying water up a mountain, and now, on the mountain's side, five small stones, one of them being poured into; at its foot, a long one | He walks over it to cross the hall | It is not given water. It is the only place that shows what is done with the stones. It does not show where they are |
| **1. The weir** | The Drowned Galleries, on the weir's east bank, on the way to the cup room. Open from the first | A stone at the mouth of an old cut through the bank, which once took water from the pond. A small sluice shuts the cut; its windlass is on the west bank | A dry basin a step from a pond | He raises the sluice (the wing's own gates: the windlass is across the pond), and the next high water spills down the cut into the hollow |
| **2. The refectory** | The Cloister's refectory, at the foot of the long table, where a place would be. Open from the first | The stone where a bowl and cup should be | Every other place at the table is set; this one has a stone in it | The servers go round filling each cup. A server stops for whoever waits at a place, and fills what is there. He stands still at the table's foot, and the server pours into the stone. (At a set place, the same wait makes the server fill its cup again until it spills: that is how it is found) |
| **3. The shelter** | The Glacier Galleries' first room, under the sill, beside the first fire. Needs the dash | The stone, its hollow full of ice | A stone of the lower world in the glacier, with ice where water should be | The ice in its hollow answers to a third brazier, off the way on a ledge of the shelter: struck, like every brazier, it melts the plug. Nothing on the way on needs that brazier |
| **4. The still** | The Eye of the Storm's first still. Needs the Wyrm's wind | The stone, bone dry, under a small cloud that hangs lower than the rest | The only dry thing he has met since the storm began | The cloud is of the doors' kind: to one who has stood still under it long enough, it lets go its rain. The Hush come while he waits |
| **5. The head** | The Aqueducts' head, where the water comes out of the rock. Open from the first | The stone under a dry spout cut in the rock higher than the channel's mouth: the way the water came out before the channel was cut | A dry basin beside the place the water of the whole garden comes from | A wheel shuts the channel's mouth. No keeper tends it (no one meant it to be shut). Shut, the water backs up and comes out of the old spout, into the hollow. The channel downstream runs dry until it is opened again |

**When a stone is given water,** it fills, stands a moment, and goes down the hole in its floor with the sound of the
pool he is raised from. The stone stays dark with wet, so that he can tell it is done. A stone given water twice counts
once. They can be done in any order.

### The person's line, written to decision 0.27

Ordric hangs his lamp over each raising pool. He has stood by that stone longer than anyone. Two lines, each said
once, in place of his third line at the first meeting where it applies, from the Cloister up:

- **Before any stone has been given water:** "Keep an eye on the old stone by the water you woke in. I never knew
  what it was for." (84 characters)
- **Once one has:** "One of the hollows in that old stone is wet. In all my years it has been dry." (77)

He says what to keep an eye on, and that something is going on he does not understand. He does not say there are
others, where, or what to do. No one else says anything about the stones. Nothing is written on them.

### How the pieces fit

- The stone at the pool has five hollows, so there are five to find. It does not say where.
- The floor's picture shows water poured into stones on the mountain. It does not say which.
- Each of the five is in plain sight on a way he walks, looks like the one at the pool, and is dry where nothing else
  is.
- Each is given water by its own place's working (a gate, a server, a fire, a cloud, a wheel), used a little
  differently from how the place has used it.
- What he does at one stone is seen at another, far off: a hollow at the pool is full the next time he is there.
  That is the moment the puzzle is found.
- **When all five have been given water,** the next time he comes to the pool (or is raised from it), the water in the
  long stone runs over its lip into the pool. The pool's light rises, and something comes up out of the water, as he
  did: it coalesces, falls to him, and he takes it in (decision 0.5), and its page opens.

### How cryptic it is, and why that is about six

| Score | What it would take |
|---|---|
| 3 | A person says where the pieces are |
| 5 | The pieces are marked on the map once seen, or a person says there are others |
| **6** | **This.** Every piece is on a way he walks. They look alike and nothing else does. The picture shows what is done with them. One person says to keep an eye on the stone at the pool, and says when it changes. Nothing is written, nothing is on the map, no one says where |
| 8 | The pieces are off the way, or do not look alike, or the link is in words or numbers |
| 10 | Needs a wiki |

**Why not less:** no one says there are five, or where; three of the five ask for the place's working used in a way
he has not used it there; the link is a look and a change seen in a room far away. **Why not more:** all five are on
ways he walks; the stone at the pool is the most seen thing in the game and counts what is left; the picture shows the
act; Ordric points at the one place that changes. The likeliest first is the weir, in the first wing, by a player who
tries the windlass across the pond; and the refectory, by one who waits at the table. Question 2 says how to turn it
up or down.

### What it unlocks: the summoning item

I would make it the summoning item (question 1). As a first proposal, for its own short sheet before it is built:

- **The Keepers' Bowl** (the name is yours to change). A small bowl of the keepers' pale stone, at his hip.
- **What it does** (player text, two lines when given): "Creatures you kill go into the bowl." / "With 10 embers,
  {art}: the last one fights for you."
- **Its note** (world text): "Cut by the Well's keepers. What they poured into it went back to the water, and came up
  again."
- **How it plays:** it keeps the last ordinary creature he killed. Called, it comes up out of water at his side with a
  grey thread at its neck (painted in code, on its own drawing), fights beside him for thirty seconds or until it is
  hit three times, and goes back to water; it can be called again. Never an elite, a wing's keeper or a keeper.
- **Why it, and why here:** the water gives back whatever falls into it, him first. Here it gives back what he has
  killed, on his side. And it comes up out of the pool he comes up out of.

**The other prize, if you would rather a weapon:** the Well-keepers' Hook, the long hook they drew water with (the
Whetstone's note names it). A reach weapon that draws what it catches toward him, and in the world draws a far ring
or bucket. It would be the seventh weapon and the only one not from a keeper.

### Where

The prize rises at the pool in the Roots' first room. Nothing is added there but the long stone.

### How it is checked

A test of its own (`tests/side-stones.test.mjs`):

1. **Each stone is given water by the tests' player, by its place's rule,** with only the gifts its wing needs (none,
   none, the dash, the wind, none), and with the free passes off.
2. **Each is on the way:** within a few tiles of a way the reach model walks from the wing's door to the wing's prize,
   so "in plain sight" is held by a check.
3. **The count:** a stone given water twice counts once; any order fills the hollows west to east; the save keeps it
   across a death, a rest, a reload, and a level that has grown (`rebase`).
4. **Only this gives it:** no chest holds the bowl, and the reach model finds it nowhere else. It rises only after
   five, only at the pool, and only once: a save that has it is never given a second.
5. **The stuck-finder** in every room changed, and the thread count unchanged (the stones hold no threads).
6. **The words:** Ordric's two lines and the bowl's lines pass the writing checks (under ninety characters, none of
   the forbidden words: `tests/side-teach.test.mjs`), and each of Ordric's is said only on its condition and only once
   (`tests/side-people.test.mjs`).

---

## The order of builds

One build each, published as it is done, with its pictures, its playtest list and its entry in the build log. The
numbers are given when they are built. **When:** after phase 21, as the roadmap orders it, since the minibosses are
cut into the same levels (question 5).

1. **The Roots, the Drowned Galleries, the Ossuary:** the delver's crust, the float, "Counted".
2. **The Cloister, the Scriptorium, the Bell-Foundry:** the ringers' rope, "Let it stand", the alarm, used.
3. **The Spires, the Cairns, the Glacier:** blocks on the ice, a cairn for a step, a fire in the ice.
4. **The Tempest, the Works, the Eye:** the tallest rod, stopping an arm, the weight that falls while he waits.
5. **The Gardens, the Aqueducts, the Houses:** the bud in the shade, "Carried off", "Let it in".
6. **The Firmament and the Orrery Wing:** the lens, the hour after.
7. **The Deep, its upper three:** which prop, two plates, the flap.
8. **The Deep, its lower two:** the missing mark, the camp's lamp.
9. **The great puzzle's pieces:** the six stones, the floor's picture changed, the pool's hollows filling. Nothing is
   given yet; a save that fills all five is given the prize the first time it is at the pool after build 10.
10. **The great puzzle's prize:** the bowl, after its own short sheet has your yes; and Ordric's two lines.

**Drawings wanted:** none. The stones, the bowl and the grey thread are painted in code; every creature called uses
its own drawing. About $0.

## What I am not sure of

- **Seven puzzles lean on a creature doing what it does:** the delver, the Tallymen, the blots and the copyist, the
  cairns, the sluice-keeper, the Housekeeper, the Echo. Each is only as good as that creature is steady, and its test
  needs it to act the same way every time. Where one is not steady, I would change the puzzle, not the creature.
- **About fourteen of the twenty-two need something new in the engine:** sliding blocks, a bolt that picks the tallest
  rod, a beam that holds star-glass, a float with a catch, a creature that carries him, a page on a frame, a tongue
  that keeps swinging, a weight that moves only while he is still, a bar, an hour on a hatch, a leaning slab, plates,
  a flap on the tide, a lamp on a rope. The rest use what is there. That is why there are eight builds of them.
- **The first stone has no hint but Ordric's first line.** Whether people find the puzzle at all is for a playtest,
  and I cannot judge it. If no one does, the first thing I would change is to have the refectory's server pour into
  the stone once by itself, the first time he is in the room.
- **"Six of ten" is my reading of your scale.** The playtest list will ask your brother whether he found it, and when.
- **The bowl changes fights.** The keepers were tuned without help. It cannot take them, but what it calls can strike
  them. Its own sheet would say how much.
- **Two puzzles go when a keeper falls:** the ringers' loft opens with every door when the Toll falls, and the Works'
  arm is left at the far pier when the Jar breaks. Both are walks then, which is what Metroidvania idea 4 asks of a
  fallen keeper's place.
- **Twenty-two chests of shards may be too many shards.** The thread count (two to a region's climb) keeps threads out
  of most of them. Question 8.
- **The writing rule that a blocked way says what opens it.** None of these is on the way up, and the stones say
  nothing at all. If that rule should reach optional things too, the great puzzle cannot keep to it.

## To decide

1. **The great puzzle's prize:** the summoning item (the Keepers' Bowl), a weapon (the Well-keepers' Hook), or both in
   turn? *I would make it the bowl.* It is the one you named first, it is a thing he can get no other way, and the
   story is already about water that gives back.
2. **How cryptic:** about six, as above? *I would keep it as written.* To turn it down to five: the map marks a stone
   once seen. Down to four: the refectory's server pours into its stone once by itself. Up to seven: leave the floor's
   picture as it is, without the stones.
3. **The Deep's sections:** here, not with phases 15 to 17? *Here:* those phases are built, and since the throw the
   Deep is on the way.
4. **In the release:** must phase 22 be in it? *Yes, both kinds.* The release step waits for it, as it does for phase
   21; the rest of phase 20 (the phone, the polish) does not.
5. **When:** after phase 21, as the roadmap has it, or sooner? *After phase 21:* the minibosses are cut into the same
   levels, and a puzzle built first might have to move.
6. **The Shard:** no puzzle? *None.* It is left alone on purpose, and getting there is already the hardest thing in
   the game.
7. **The far ends and the passages:** nothing new in them? *Nothing:* each far end has its working, and the passages
   are the pauses.
8. **The prizes:** chests of shards, and a short way where one falls out of the room, with a thread only where a
   section's count has room? *Yes.* Or say if the two-a-region rule should bend for puzzles (as question 7 of the
   phase 18 sheet asks for the rough faces' nooks).
9. **The bowl's rules:** it keeps the last ordinary creature he killed, costs 10 embers to call, stays thirty seconds
   or three hits, can be called again, and never takes an elite or a keeper? *As written,* for its own sheet. And its
   name.
10. **Ordric's two lines:** said in place of his third line, once each, from the Cloister up? *Yes,* and the words are
    for your yes.
11. **The floor's picture:** changed to show the five stones and the long one? *Yes:* it is the only place that shows
    what is done with them.
12. **The two puzzles that go when their keeper falls:** allowed? *Yes:* a fallen keeper's place is meant to be easier.
