# Phase 21: a miniboss in every level (the sheet)

*Written 28 Nov 2026, for your yes before anything is built. Nothing here is built, drawn or tried. It takes the
roadmap's phase 21 (your words of 18 Nov: "interesting minibosses to every level, each unique and contextually
designed") and its six proposals, and adds the five levels of the Deep, which the roadmap left for later. Where I have
changed one of the six, it says so and why. The names are checked against `docs/writing.md` (names, rule 4). The
Annals lines, the hints and the relics are mine, for your yes.*

## What the roadmap asks of each

From the roadmap, phase 21:

- **It could only be here.** Someone or something the place's history left behind, doing what it did.
- **One idea of its own** to read and answer, shown before it is used.
- **It changes something when it falls:** a way opens, or the room is different after.
- **Its own room,** on the level's main way or just off it, and its line in the Annals.
- **None reuses another's way of fighting,** and these are apart from the wings' own, which stay.

So each one below has: where it is; what it is; its one idea and how that is shown first; how the fight goes; what
changes when it falls; what it leaves; its Annals line; a hint; its art; and how it is checked.

## The eleven at a glance

| Level | Miniboss | Where (the room in the code) | Its one idea | Drawn |
|---|---|---|---|---|
| The Roots | **The Hauler** | the well's floor (`well`) | His buckets swing, and their weight carries him on past where he turned | A drawing; yoke and buckets in code |
| The Cloister | **The Precentor** | the cloister walk (`cloister`) | Four strike as one, on his beat, and only on it | A drawing |
| The Spires | **The Roped** (was the Rope-team) | the broken rope bridge (`ropeway`) | Three on one rope: one over the edge is hauled back; two at once take the third | A drawing |
| The Tempest | **The Weathercock** | the crossing, on its last pillar (`crossing`) | It points at whatever moves fastest, and the bolt comes where it points | Code |
| The Gardens | **The Topiary** | the canopy (`canopy`) | Cut back, it is small and quick; left alone, it grows to fill the room | Code |
| The Firmament | **The Night-Lantern** (was the Orrery) | a new room, the dark room (`darkroom`), off the gnomon | Every star on it burns; the one stopped with lead is the only dark, and it moves | Code |
| The Workings | **The Shift-boss** | the long level (`long`) | He rides the last cart, and the cart goes where the points send it | A drawing; the cart in code |
| The Vein | **The Geode** | the knot (`knot`) | It runs from him, and will not pass a lamp he has lit | Code |
| The Flooded Levels | **The Lid** | the pockets (`pockets`) | It takes whatever comes up through the water it lies on | A drawing |
| The Great Shaft | **The Hoistman** | the drop, half-way (`drop`) | The only way to him is in the kibble he hauls, and he lets it fall | A drawing; the kibble in code |
| The Hollow | **The Shot-firer** | the circles (`circles`) | His charges go off at the end of a burning fuse: cut it, or be down in a rut | A drawing |

Ten of the eleven are in rooms that are there now. Only the Night-Lantern needs a room cut for it.

## What all eleven share

- **Flat:** drawn from the side, in two dimensions, never at an angle (0.29). **Not plain humans** (`docs/cast.md`,
  rule 4): the six that were people are drawn as what the place made of them, and each drawing is shown to you
  before it goes in.
- **No seal.** The room's ways stay open. He can leave; if he does, it is whole again when he comes back. It does not
  follow him out.
- **A short coming.** When it wakes, the music drops for a beat and its name comes up over its bar, as the wings'
  keepers' do. Much shorter than a keeper's entrance (`docs/keepers.md`: the length matches the weight). On a retry,
  nothing: straight to the fight.
- **Fought with what he has by then:**

  | Level | He has |
  |---|---|
  | The Roots | The sword only (the Warden is above it) |
  | The Cloister | And the hammer |
  | The Spires | And the clapper and the air dash |
  | The Tempest | And the tooth and the glide |
  | The Gardens | And the bow |
  | The Deep (after the throw) | And the thorns. Not the grip, unless the Auger has fallen |
  | The Firmament | Everything |

- **How strong:** from about 14 blows of the sword in the Roots to about 30 in the Firmament. (The wings' are 16 to
  30, the keepers' 28 to 44.) The larger ones' heaviest blow costs two hearts, as decided in 0.17; everything else
  one.
- **Every blow warned first,** 0.6 to 0.9 seconds, as the keepers' are.
- **While it stands, creatures that wander in from outside its room are sent home** (the keepers' hall rule, build
  81).
- **It stays fallen.** What it leaves is in a prize chest beside it, shut while it stands (build 87's chest).
- **What it changes is found so** whenever he comes back.

## Why the Firmament's is not the Orrery any more

Since the roadmap was written the Firmament has gained, all with the same name or the same idea:

- a room called `orrery`, the hall of the great orrery, where Corwen's desk is and the wing's door opens;
- the Orrery Wing (build 71): planets on arms that he rides, and an hour that is struck late;
- the Armillary, a ring off the orrery that rolls; and the Almanac;
- the Outer Ring (build 119): a stopped planet on an arm, wound to go again.

"The Orrery" would be a fifth thing called that, and "fought inside its turning rings" is the wing's ride. So it
clashes, in its name and in its fight. **I propose the Night-Lantern** (below). It keeps the best of the roadmap's
proposal: the safe place is where the missing star should be, and it moves. It puts that on a body the Firmament does
not have yet.

## The other changes to the roadmap's six

- **The Precentor: the nave to the cloister walk.** The nave is the second room of the Cloister, and Corwen's carrel
  is in it. The cloister walk is where both ways up through the house meet, under the chapel's stair, and it is where
  the house walked its hours in procession.
- **The Rope-team is renamed the Roped.** "Rope-team" and "Rimeback" share a first sound and a length, on the same
  map (`docs/writing.md`, names, rule 4). The Spires' own already have names of this shape: the Stopped, the Turned,
  the Seated.
- **The Weathercock: the masthead to the crossing.** The masthead is one screen of cave with the last shrine in it.
  The Weathercock stands on the crossing's last pillar, which is the mast that room is named for, over the room it
  looks across.
- **The Topiary: the sundial to the canopy.** The sundial is a hall with the last shrine. The canopy is the garden
  itself, the room before it, with the garden wall across it.

The Hauler stays at the well, as proposed.

---

## 1. The Roots: the Hauler

- **Where.** The floor of the well (`well`): the foot of its two-screen shaft, between the gallery's door and the
  Ossuary's cracked door. On one of the Roots' two ways up (the gallery's); the other (the bridge, the grotto) comes
  in at the well's door half-way up and looks down on him.
- **What he is.** Before the dark nobody came here but the Well's keepers, who drew water and carried it up
  (`docs/world.md`, the Roots). He is the last of them, yoked to two full buckets. He walks his round of the well's
  floor and turns at the foot of the keepers' stair: he lifts its bar, goes up three steps, comes back down, drops
  the bar. Nobody told him he could put the water down. (The Carrier's Yoke, in the Aqueducts, is one that was put
  down.) Drawn as what is left of a man under a yoke: grey as the well's stone, hooded, no face, the yoke grown into
  his shoulders.
- **His one idea.** The buckets are heavier than he is. When he swings them, their weight carries him on, three or
  four steps past where he turned, and while it carries him his back is open. Where the buckets go, he goes.
- **Shown first.** From the well's door half-way up, before he can be reached: he turns at the end of his round, the
  buckets swing, and they carry him on along the floor. A bat that flies into a bucket's path is knocked into the
  wall.
- **The fight.**
  1. Full buckets. He turns to him and swings (the warning: he plants his feet and leans back). The buckets sweep a
     wide arc at the height of a man and carry him on past. Strike his back while he is carried; do not be where the
     arc ends.
  2. From half, water has slopped out. The buckets are lighter: they swing faster and carry him less, so his back is
     open for less time. When they are empty he goes to the hatch in the floor to draw, and while he draws he cannot
     turn. That is the long opening.
- **How strong.** About 14 blows. It is the first fight of the game after the Roots' creatures, with the sword alone.
- **When he falls.** He sets the buckets down, side by side, and they stay. The bar at the foot of the keepers' stair
  is left up. The stair (in `docs/world.md`'s list for this room since the first plan, "carved steps worn to a
  curve", and never built) goes up the well's west side to the door half-way up: from then on the well's floor is a
  stair from the grotto's spring, not a climb of shelves.
- **What he leaves.** *The Hauler's Pad* (the pad under the yoke). **Hits do not knock you back.**
- **Annals.** *The last of the Well's keepers. Nobody told him he could put the water down.*
- **The hint.** Corwen, in the chamber: *Someone still carries water at the well's foot. Watch the buckets, not the
  man.*
- **Art.** One drawing, standing and walking, about $0.07; his swing and his drawing at the hatch made from it. The
  yoke, the buckets and the water in code, so they can swing.
- **Checked.** In the real game: standing in the middle of the arc costs a heart, standing past its end costs none;
  a blow on his back while he is carried lands; while he draws he does not turn. The stair is a way from the floor to
  the door half-way up once he has fallen, and not before.

## 2. The Cloister: the Precentor

- **Where.** The cloister walk (`cloister`): two screens, where both ways up through the house (the bell tower; the
  stairwell) meet under the hole up to the chapel. Everyone passes through it.
- **What he is.** He gave the beat for the hours: the house came in on his staff. When the flame went dark the house
  kept its hours harder, and he kept the time. He walks the cloister at the head of four acolytes, facing them,
  beating time, and the bell gives him his: his staff comes down on the Toll's stroke.
- **His one idea.** His four do nothing on their own. He lifts the staff and they lift their maces; it comes down and
  all four strike at once, each where it stands. Between beats they only walk.
- **Shown first.** The whole house has taught the beat already: its doors open and shut on the Toll's stroke (since
  build 58). From the bell tower's door, before he is near, he sees the procession go by: staff up, maces up, staff
  down, four blows on nothing.
- **The fight.**
  1. On the bell. Between beats, get among them; on the downbeat, be where no mace reaches (between two of them, or
     over them). He is at the head, and can be struck between beats. One of the four struck down gets up on the next
     downbeat: only he matters.
  2. From half, he stops taking his time from the bell. He lifts the staff and holds it (short, then long, then short)
     and they strike only when it comes down. Whoever moves on the bell is caught.
  If the Toll has already fallen, he keeps the time himself, knocking it on the floor with the staff.
- **How strong.** About 18 blows.
- **When he falls.** His four stand where the last beat left them, maces up, and do not move again. They are stone
  now, and solid: steps up to the chest high on the vault, which until then only the hung step reaches.
- **What he leaves.** *The Precentor's Pipe.* **Ember powers cost 8 embers, not 10.**
- **Annals.** *He gave the beat for the hours. Four of them still come in on it.*
- **The hint.** Corwen, in the nave: *They still walk the hours in the cloister. Someone at their head keeps the
  time.*
- **Art.** One drawing: a tall monk with a staff, about $0.07. The acolytes are drawn already.
- **Checked.** The four blows land on the frame the staff comes down; moving between beats is never struck; the hold
  lasts 0.6 to 1.5 seconds, and nothing strikes during it; a struck acolyte rises on the next downbeat; after he falls
  the four are solid and the vault's chest is reached from them.

## 3. The Spires: the Roped

- **Where.** The broken rope bridge (`ropeway`), between the spire and the shrine's cave (`hollow`): one screen of
  planks over the drop, on the way up. A fall from it lands on the shelf under it (`nest`), and the way back is the
  climb he came by.
- **What they are.** Three climbers who roped up together for the pass the night the Wyrm came. They stopped on the
  bridge to wait for it to go. They never untied. The cold kept them: rimed over, hooded, faces gone under the ice,
  the rope between them stiff with it.
- **Their one idea.** They are one line. Whoever goes over the edge is held by the other two, who dig in and haul him
  back. Two over at once, and the last cannot hold them: the rope takes all three.
- **Shown first.** As he comes out of the spire's gap onto the bridge, a High Hawk strikes the last of them. He goes
  over; the other two set their feet and haul him back up.
- **The fight.**
  1. They come along the bridge in a line, the first with an axe: a cut, and a shove that can put him off the
     bridge. Knock one over the edge (the hammer knocks back; any blow at a gap will do). The other two stop to haul:
     they do not fight while they haul, and the one hanging can be struck.
  2. While one hangs, put a second over. The last digs in, is dragged to the edge, and goes.
  From the second time one is hauled back, they spread out along the bridge and the rope is drawn taut between them
  at the height of his knees: jumped, or it trips him toward the edge.
- **How strong.** They cannot be cut down, only put off: each is about 6 blows to stagger at an edge.
- **When they fall.** The rope catches on the bridge's last stake and hangs down to the shelf below. From then on a
  fall from the bridge is a climb of the rope, not the long way round.
- **What they leave.** *The Climbers' Stake.* **Once per rest, a fall onto spikes puts you back where you stood,
  unhurt.**
- **Annals.** *Three who roped up for the pass, and stopped on the bridge to wait. They never untied.*
- **The hint.** Ordric, at the Bell Road's gate: *Three went up past my lamp, roped together. I saw them on the
  bridge after. They had not moved on.*
- **Art.** One drawing, used for all three, with what each carries drawn in code (an axe, a coil, a pack): about
  $0.07, or $0.15 if they want a drawing each. The rope in code.
- **Checked.** With two standing, one over the edge is hauled back, every time; two over takes the third; he can be
  shoved off and climbs back from the shelf; the rope is a way between the shelf and the bridge only after they fall.

## 4. The Tempest: the Weathercock

- **Where.** The crossing (`crossing`), two screens by two: pillar to pillar over the old deck. It stands on the head
  of the last pillar, under the masthead's door.
- **What it is.** The Wrights' great iron vane, set on the works' tallest mast to tell them where the storm would come
  from. The storm took the works apart and left the vane. It turns to whatever moves, and the lightning follows it.
- **Its one idea.** It points at whatever is moving fastest in its sight. When it settles, a bolt comes down where it
  points. So give it something faster than him to point at.
- **Shown first.** From the sill of the flue's door, before he is on the pillars: the vane swings to a ball of
  lightning bouncing on the deck, settles, and a bolt comes down on it. Then to a Nimbus. Then to him.
- **The fight.** Chains hang from the pillars' heads; struck, a chain swings for a few seconds, faster than he moves.
  1. It settles (the warning: it stops and its tail shudders, 0.8 seconds) and the bolt comes where it points. Strike
     a chain and it turns to the chain; ride the air up the last pillar while the bolts fall there. It can be hurt
     only while it turns: settled, a blow rings off it. So he strikes it as it swings from one thing to the next.
  2. From half, a second bolt comes down behind it, where its tail points. Behind it is not safe any more.
- **How strong.** About 20 blows.
- **When it falls.** It comes off its spindle and lies across the last gap, from the third pillar to the last: a walk
  to the masthead's door. The top of the crossing can be crossed without the air.
- **What it leaves.** *The Wrights' Vane-pin.* **Rising air lifts you faster.**
- **Annals.** *The Wrights' vane. It turns to whatever moves, and the storm comes where it points.*
- **The hint.** Mirel, on the gantry: *There is a vane on the last pillar. It never points into the wind. It points
  at me.*
- **Art.** In code: the vane, its spindle, the chains, the bolts. $0.
- **Checked.** It always points at the fastest thing in sight; the bolt lands where it settled, after its warning; a
  swinging chain draws it off him; a blow while it is settled does nothing, a blow while it turns counts; once it has
  fallen the masthead's door is reached by walking from the third pillar.

## 5. The Gardens: the Topiary

- **Where.** The canopy (`canopy`): one screen of open garden between the cascade and the last shrine's hall, with
  the garden wall across it that only the bloom clears. On the way up.
- **What it is.** The gardeners clipped a hedge into a hound, to sit by the wall. When they left, nobody clipped it.
  It kept its shape the only way it could: by clipping everything round it. The canopy is bare wherever it goes.
- **Its one idea.** It is only as large as it has grown. Cut back, it is small and quick. Left alone, it grows, slow
  and heavy, until it fills the room. Inside it is the gardeners' frame of iron wire: the frame shows only when it is
  cut small, and the frame is the only thing that hurts it.
- **Shown first.** From the cascade's upper walk, across the wall: the hound lies against the garden wall, and as he
  comes nearer it grows a size, with a rustle, while he watches. A Rot-pod drifts into it and is clipped out of the
  air.
- **The fight.**
  1. Large, it paws and bites with a long reach, and fills half the floor. Each cut takes it down a size, and each
     size is quicker. The bloom throws him clear when it is too big.
  2. Small, it darts, and its frame shows: strike the frame. Leave it too long and it grows again (the warning: it
     swells with a rustle before each size).
  From half (the frame bent) it grows twice as fast.
- **How strong.** About 10 blows to the frame; cutting it down to the frame takes four sizes.
- **When it falls.** Nothing clips the canopy any more. The hedge it kept down grows up the garden wall at once,
  thick enough to climb: a way over the wall, both ways, without the bloom.
- **What it leaves.** *The Topiarist's Shears.* **The first hit you land on any creature does double damage.**
- **Annals.** *The gardeners clipped it into a hound. It has kept its shape by clipping everything else.*
- **The hint.** Mirel, at the cascade: *The gardeners' hound is on the far walk. It was smaller this morning.*
- **Art.** In code, in pieces of leaf on its frame. It grows and shrinks, and a drawing may not be scaled
  (`docs/cast.md`, rule 2). $0.
- **Checked.** Each size's speed and reach; it grows on its own clock when it is not cut, each time after its warning;
  only the frame takes damage, and only when it is small; the hedge on the wall is a way after it falls, and not
  before.

## 6. The Firmament: the Night-Lantern

- **Where.** A new room, **the dark room** (`darkroom`): one column west of the gnomon, two screens tall, under the
  foot of the Shard's underside. That column is open sky now. He comes into it through the gnomon's west wall, at the
  gnomon's half-way floor: just off the main way. It is the only new room in the phase.
- **What it is.** On clouded nights the astronomers lit their sky indoors: a brass globe on a chain under a dark dome,
  pierced with a hole for every star they had counted, and a lamp inside it. The night the star fell they stopped its
  hole with lead. (The Astronomer's Compass "points at the star that is missing".) The lamp has been kept lit ever
  since, by no one.
- **Its one idea.** Every hole throws a point of light, and the points burn. The globe turns, so the points cross the
  room: the floor, the ledges, the walls. The one dark place is the stopped hole's, and it moves with the turn. Beside
  the stopped hole is the lamp's little door, for trimming it: from the dark place, the door is always turned to him.
- **Shown first.** He comes in on a gallery under the rim of the dome, where the points do not reach. From there: the
  points crawl round the room, a star-cinder drifts into one and burns out, and the dark place goes round among them.
- **The fight.**
  1. It turns slowly, one way. Stay in the dark place as it goes across the floor and up the ledges, and strike the
     lamp through its door from there.
  2. From half, the chain is let out: the globe hangs lower, the points are closer together and the dark place is
     smaller. It turns back the other way (the warning: the lamp flares, 0.7 seconds).
- **How strong.** About 30 blows. It is the last of the eleven he meets.
- **When it falls.** The lamp goes out. The dome's shutter, wound shut since the night of the fall, opens, and the real
  sky is over the room. Up through the shutter is a way out onto the roof by the gnomon's high door, past the
  gnomon's star-glass.
- **What it leaves.** *The Stopped Star* (the lead from the hole). **Things that aim at you take half again as long
  to aim.**
- **Annals.** *The astronomers' sky, for nights with none. One star in it is stopped with lead.*
- **The hint.** Corwen, by the orrery: *They kept a second sky for clouded nights. One star in it was put out on
  purpose.*
- **Art.** In code: the globe, its chain, the lamp, the points of light, the dome. $0.
- **Checked.** The dark place is always somewhere he can stand; a point hurts and the dark does not; the door faces
  the dark place all the way round; the turn's warning; the new room is added after every room there is now, so a
  save's rooms keep their order.

## 7. The Workings: the Shift-boss

- **Where.** The long level (`long`): three screens, the rail line the whole width of the Workings, its carts, and the
  gap where the floor went. On the way between the cage and the cistern, going down or coming up.
- **What he is.** The Workings' elite in the world plan, never built: "the Shift-boss, who still calls the shifts". He
  sent each shift down and called it up, and the chalk in the tally-house is his hand. The night shift went down and
  did not come up ("CAGE UP, NOT YET", on the winding-house wall since build 120). He rides the last cart along the
  long level, calling the shift on a level that has been empty for two hundred years.
- **His one idea.** The cart runs on the rail, and it goes where the points send it. There are two sets of points on
  the line, each thrown by its own lever, struck. One sends the cart into a spur that ends at buffers; the other into
  the gap.
- **Shown first.** As he comes onto the long level an empty cart is already running. It takes the first points into
  the spur, hits the buffers and goes over.
- **The fight.**
  1. He rides at him along the rail, calling. The cart runs down whatever is on the rail (it is low: jump it), and he
     swings his shovel off it as he passes (crouch, or block). Throw the points behind him: coming back, he goes into
     the spur, hits the buffers and is thrown off. While he puts the cart back on the line, strike him.
  2. From half, he throws the points himself as he passes them. The lever moves before the points do: watch the
     levers.
  3. Send him into the gap. The cart goes in and sticks; he climbs out and finishes on foot, slow, with the shovel.
- **How strong.** About 24 blows.
- **When he falls.** The cart stays in the gap, level with the floor. The long level is walked from end to end.
- **What he leaves.** *The Shift-boss's Lamp.* **Guild lamps light themselves as you pass.**
- **Annals.** *He called the shift down every night for two hundred years. Nobody has come up yet.*
- **The hint.** Hob, in the bunkhouse: *The shift-boss is still on the long level. Mind the points. He never did.*
- **Art.** One drawing, riding and on foot: a stooped figure in the guild's coat, his lamp grown into his cap, not a
  plain man. About $0.07 to $0.12. The cart, the rail, the points and the levers in code (the Orrery Wing's pallets
  already run on rails).
- **Checked.** The cart follows the points every time; the buffers throw him off; each lever warns before it moves;
  the cart in the gap is a floor he can walk; the run back from the tally-house's water is short.

## 8. The Vein: the Geode

- **Where.** The knot (`knot`): four screens, three galleries one over another, joined by shafts, a lamp at every
  joining, an Echo. In the middle of the Vein, before the Assayer.
- **What it is.** A stone with the vein inside it: lampstone grown into a ball of crystal, in a rind of rock. It came
  loose when the guild opened these levels again, and it has kept ahead of everyone since, as the glitter does. It
  does not fight unless it is caught.
- **Its one idea.** It runs from him, always by the way that keeps it furthest off, and it will not pass a lamp he has
  lit. Every lamp he lights shuts one of its ways, and in the Vein a lamp he lights stays lit.
- **Shown first.** In the glitter, the gallery before the knot: it is seen ahead, rolling, and when he lights the lamp
  it is making for, it stops short of the light and goes back.
- **The fight.**
  1. The chase. It takes the long way round the galleries; he can take the shafts. Each lamp he lights closes a way,
     until it is in a gallery with a lit lamp at each end. The knot's Echo still goes where he went: a wrong guess
     that sends him back over his own way costs him.
  2. Caught, it splits its rind and fights where it is: each blow knocks a glimmer off it, which comes after him.
     Struck enough, it breaks loose past him and runs again, up the shafts as well this time, and the next corner is
     harder to make.
- **How strong.** About 20 blows, in two or three catches.
- **When it falls.** It breaks open, and its light runs along the vein: every lamp in the knot is lit at once, and the
  knot's Echo is gone. The knot is the first bright place in the Vein.
- **What it leaves.** *The Split Geode.* **Breaking an urn or a crystal gives you 3 embers.**
- **Annals.** *A stone with the vein inside it. It keeps a little further on.*
- **The hint.** Hob, at the seal: *Something bright runs in the knot. I have never seen it stop.*
- **Art.** In code: rock outside, crystal in. It is round, and a round thing has no side to draw. $0.
- **Checked.** It always takes the furthest way; it never passes a lit lamp; with the knot's lamps lit, it is always
  caught somewhere (no loop is left that it can run round for ever); the knot lit and its Echo gone after.

## 9. The Flooded Levels: the Lid

- **Where.** The pockets (`pockets`): two screens of domes of trapped air, the water in the floor of each, joined
  under their walls. The first rooms past the sump, before the drowned level and the Pump.
- **What it is.** Not a fish (your word, 27 Nov): a thing of the deep water, older than the guild. The night the guild
  cut into the water it came up with it and lay out over the water in the pockets, flat as a skin, its arms hanging
  down into the dark. The shift that went under there did not come up.
- **Its one idea.** It takes whatever comes up through the water it lies on. Under the water, with the wind, he is
  held, as everywhere in these levels. It is the surface that is shut.
- **Shown first.** In the first dome, a Sunk rises at him from the bottom, breaks the surface under the Lid, and the
  arms take it. It does not come back up.
- **The fight.**
  1. It lies over one dome's water. Seen from under the water its body is pale, ringed with arms, lit by the drowned
     lamps. From under the water, strike its middle. It drops an arm down at him (the warning: the arm's shadow on
     the water, 0.8 seconds). He can come up for the dome's ledges in the other dome, where it is not.
  2. From half, it lets go of the surface and sinks onto him. Now the water is its, and the air is the safe side: up
     out of the water onto the ledges in the dark, and strike its arms as they come up after him. When it rises to
     lie over the water again, its middle is open from under.
- **How strong.** About 24 blows.
- **When it falls.** It sinks to the bottom and stays there. The drowned lamps' light comes up through the open water
  into the domes: the pockets are lit, the first lit air in the Flooded Levels.
- **What it leaves.** *The Drowned Shift's Lamp.* **Under water your lamp lights as far as it does in air.**
- **Annals.** *It lay over the water the night the levels went under. Nothing came up through it.*
- **The hint.** Hob, at the stand-pipe: *Something lies on the water in the pockets. Nothing that went under there
  came up.*
- **Art.** One drawing, side on: a skin on the water with arms hanging from it, made the way the Squid was (one
  picture, its arms bent from it). About $0.06.
- **Checked.** Coming up through the surface under it is struck, after its warning; under the water he is struck only
  by a warned arm; its sinking and rising each warn; the domes are lit after it falls.

## 10. The Great Shaft: the Hoistman

- **Where.** The drop (`drop`), half-way up: the camp's widest stage, beside the mouth of the Adit, where the camp's
  windlass is. The kibble's rope runs down the middle of the shaft, from the wheel under the head to the water at the
  foot. On the way up out of the Deep.
- **What he is.** The guild let its last camp down the shaft a load at a time, in a kibble: an iron bucket on the
  hoist rope. He stayed at the windlass to haul them back up. Nobody rang for it. He lets the kibble down and hauls
  it up empty, and lets it down again.
- **His one idea.** The stages under his stage stop short of it: the only way to him is in the kibble. He hauls up
  whatever is in it, and at the top he looks in and lets go what he does not want.
- **Shown first.** Coming up out of the water at the foot: the kibble comes down out of the dark and stops at the
  water; it goes up, slowly, empty; and a while after it is let go above, and comes down past him the whole height
  of the shaft into the water.
- **The fight.**
  1. Get in at the foot, or step in from a stage as it passes up, and it carries him up. At the top the Hoistman
     leans out to look (the warning: his hand on the brake, the wheel ticking, 0.8 seconds): leap out onto his stage
     before he lets go. On the stage, strike him. He fights with the windlass's crank (two short blows), and after a
     few blows he gets back to the windlass and lets the kibble fall. Then he has to be ridden to again.
  2. From half, he swings the kibble on its rope as it comes up, from wall to wall: the leap out has to be made at
     the top of its swing.
  Falling with the kibble is not a death: the shaft's foot is deep water, as it always was.
- **How strong.** About 20 blows.
- **When he falls.** The kibble stays at his stage with the brake off. From then on it is a lift: get in at the foot
  and it rises to the head. The drop is one ride.
- **What he leaves.** *The Hoistman's Hook.* **Cold air lifts you, as rising air does.**
- **Annals.** *He let the camp down the shaft. He is still at the windlass, to haul it up.*
- **The hint.** None. The Shaft has nobody in it to say one.
- **Art.** One drawing, at the windlass and with the crank: about $0.07. The kibble, the rope, the wheel and the
  windlass in code.
- **Checked.** He hauls whatever is in the kibble; the let-go warns; his stage is reached only in the kibble; a fall
  with it lands in the water unhurt; the lift runs foot to head after he falls.

## 11. The Hollow: the Shot-firer

- **Where.** The circles (`circles`): three screens of the Hollow's floor, torn into ruts and ridges by the Auger
  going round, between the guild's last camp and the Auger's pit.
- **What he is.** At every level the guild went down, he blew the way open ahead of them. In the Hollow there was
  nothing left to blow: the Auger had gone through the floor. He goes on setting charges in the Hollow's floor,
  deeper, because that was the order.
- **His one idea.** His charges go off at the end of a burning fuse. The fuse is the warning, and its length is the
  time. Cut it (a blow, or an arrow from across the floor) and the charge does not go off; or be down in a rut when it
  does, under the blast, which goes out level across the floor.
- **Shown first.** As he comes down into the circles from the camp, a fuse is already burning along the floor to a
  ridge. The ridge goes up, and the rock flies level over the ruts.
- **The fight.**
  1. He sets a charge in a ridge (kneeling: strike him then), lights it and backs off. Cut the fuse, or get down into
     a rut. Every charge that goes off takes a ridge away.
  2. From half, he lights two at once, a fuse running each way from him.
  If he fires all of them, the ridges are gone and the floor is flat: only the ruts are left to get down into.
- **How strong.** About 26 blows.
- **When he falls.** His last charge goes off where he set it, at the circles' west end, and blows a way through the
  rock up into the foot of the roof, where the Hollow's water is. The walk from that water to the Auger is a third of
  what it was.
- **What he leaves.** *The Shot-firer's Tin.* **Cracked stone you break bursts outward and strikes what is near.**
- **Annals.** *He blew the way open ahead of the guild. At the bottom, he has not stopped.*
- **The hint.** On the last page of the tally, in the camp: *CHARGES SET 6. FIRED 5.*
- **Art.** One drawing, kneeling to set a charge and standing: about $0.07. The fuses, the charges and the blasts in
  code.
- **Checked.** A cut fuse stops its charge; the blast hits whatever stands and passes over a rut; no fuse is shorter
  than a second; the way from the roof's foot to the circles is there after he falls, and not before.

---

## Not the same twice

None of the eleven shares a way of fighting with another, or with a keeper or a wing's own. The nearest of each:

| New | Nearest already in the game | How it differs |
|---|---|---|
| The Hauler | The Toll (a swing) | The Toll is struck lying on the stage. The Hauler is struck while his own swing carries him |
| The Precentor | The Almanac (an hour struck late); the house's doors on the bell | The beat is honest. The trap is the hold |
| The Roped | The Turned (lets no one up past him) | Not a guard to get round: three to put off an edge, two at once |
| The Weathercock | The Thunderhead's rods; the Oculus's line | He chooses where the bolt comes, by what he sets moving |
| The Topiary | The Seated (the more he is freed, the more a blow counts) | Its size is his to choose by cutting, and it trades reach for speed |
| The Night-Lantern | The Corrector's line across the room; Mother Thorn's marks | The safe place moves, and he has to go with it |
| The Shift-boss | The Cracked Bell (rolls to the wall, lies spent) | He chooses where it runs: the points |
| The Geode | The Echo; the Assayer | It runs away. It is caught by shutting ways, not by striking |
| The Lid | The Squid (the water falls away); the Pump (its tide) | The water stays where it is. The surface is the danger, and then the depths |
| The Hoistman | The Orrery Wing's planets that carry him | The ride is his enemy's, and he has to get off before it is let go |
| The Shot-firer | Mother Thorn's seeds; the Warden's block | The warning is a fuse he can cut, and the floor's ruts are cover |

## The order

The roadmap: one level at a time, from the bottom, each published before the next is begun. **From the bottom** was
written on 18 Nov, when the Roots were where he began and the Deep was a side way. Since the throw (build 121) he meets
the levels in this order: five regions up, the Deep from the bottom up, then the Firmament. I would build them in that
order:

| Build | Level | Miniboss | Waits for |
|---|---|---|---|
| 1 | The Roots | The Hauler | his drawing |
| 2 | The Cloister | The Precentor | his drawing |
| 3 | The Spires | The Roped | their drawing |
| 4 | The Tempest | The Weathercock | nothing |
| 5 | The Gardens | The Topiary | nothing |
| 6 | The Hollow | The Shot-firer | his drawing |
| 7 | The Great Shaft | The Hoistman | his drawing |
| 8 | The Vein | The Geode | nothing |
| 9 | The Flooded Levels | The Lid | its drawing |
| 10 | The Workings | The Shift-boss | his drawing |
| 11 | The Firmament | The Night-Lantern | nothing |

- **The first build also makes what all of them share:** the short coming, the bar, the prize chest's rule for them,
  the check tool (below).
- **The seven drawings, made first, in one batch,** and shown to you side by side with the creatures of their levels.
  Then no build waits on its drawing. Any you turn down is drawn again before its build.
- Each build: its pictures at desktop and phone size, its playtest list, its entry in the build log, pushed.

## The art

| | |
|---|---|
| Drawings (seven) | The Hauler, the Precentor, the Roped, the Shift-boss, the Lid, the Hoistman, the Shot-firer. Each one drawing, flat, at its size in the game, with its moves made from it. About $0.06 to $0.12 each: **about $0.60 in all**, as the roadmap guessed |
| In code (four, and the parts) | The Weathercock, the Topiary, the Night-Lantern, the Geode; and the yoke and buckets, the rope, the cart and points, the kibble, the fuses |

Each drawing is shown to you before it goes in.

## How each is checked

Besides each one's own checks above, every one of them:

- **Reached:** its room is reached with what he has when he gets there, and what it opens is shut before it falls and
  open after (the region graph, `tests/helpers/reach.mjs`, with its fall as a flag, as the wings' keepers have).
- **Warned and fair:** a tool made from `tools/keeper-check.mjs` plays each in the real game, each beat: standing
  still costs a heart, and the answer costs none. Every blow's warning is at least 0.6 seconds (read from its numbers
  by a test).
- **Nowhere to get stuck:** the stuck-finder runs over every room changed; everything stands on something real.
- **Stays fallen:** a save that has beaten it does not see it again, and its prize opens only after.
- **The words:** its Annals line and its hint pass the writing rules' check.
- **Short runbacks:** from the nearest water to it.
- **Not run:** the full test suite takes about fifty minutes on a shared machine. Each build runs its region's tests
  and the fast checks; the whole suite runs once before each push.

## What I am not sure of

1. **Eleven more fights.** With the wings' own and the keepers, the game would have about thirty. Each level gets
   longer by one fight. You asked for three to five deaths a region (0.17); these will add to that.
2. **Six of the eleven were people** (the Hauler, the Precentor, the Roped, the Shift-boss, the Hoistman, the
   Shot-firer). Each drawing has to read as what the place made of them. If one comes out a plain man, as the Turned
   and the Seated did (your note C15), it is drawn again.
3. **Three of the Deep's five are guild men.** It is the guild's place; but three fights in the guild's coat is a lot.
4. **The Great Shaft was meant to have nobody in it.** "The quietest place" (`docs/world.md`), and the framed pause of
   the writing rules (rule 10). A fight there spends that. Question 4.
5. **The Hauler is the first fight of the game,** with the sword alone, before the Warden. It has to be the gentlest
   of the eleven.
6. **Two beats in the cloister walk:** the bell's doors and the Precentor's procession. I made his beat the bell's, so
   that there is one. If it still reads as two, he keeps his own time from the start.
7. **The Roped on a bridge one screen long** may be more falling than fighting. The rope left after is meant to make
   that cheap once they are gone; before, a fall is the climb from the shelf.
8. **The Topiary in code** may look poorer than the drawn creatures round it. A drawing at each of four sizes would be
   the other way, at about $0.25.
9. **The ruts in the circles are two rows deep;** he is nearly five tall. Crouched in a rut he is still above the
   floor. Either the ruts are cut deeper, or the blast goes over a crouch.
10. **The dark room's place:** the column west of the gnomon is open sky, under the foot of the Shard's underside.
    Whether a dome two screens tall fits there without touching the underside is for its build.
11. **Eleven new relics,** where there are twenty-three. Some are near others (the Vane-pin and A Breath of the Eye
    are both about air). They are the first thing to change.
12. **The Hoistman's runback.** On the way up after the throw, the nearest water behind him is the Hollow's, under the
    Shaft's floor. If that is too far, a leak at the drop's foot.
13. **The Geode must always be catchable.** The knot's three galleries and their shafts may leave a loop it can run
    round for ever. Its build has to show it cannot.

## To decide

1. **The Firmament's: the Night-Lantern, in place of the Orrery?** *Yes, I would.* "The Orrery" clashes with the
   room, the wing and the ride (above).
2. **The order:** the order he meets them (the Roots to the Gardens, the Deep from the Hollow up, the Firmament last),
   or the bottom of the mountain first (the Hollow)? *The order he meets them.*
3. **The Vein and the Flooded Levels already have the Assayer and the Pump,** which the code calls each level's
   keeper. Are the Geode and the Lid a fight of their own there, between those levels' creatures and those keepers?
   *Yes: that is the roadmap's rule, a fight between the creatures and the keeper.*
4. **The Great Shaft: the Hoistman, or leave it the one place in the Deep with nobody in it?** *The Hoistman.* Since
   the throw the Shaft is climbed on the way out, not glided down in quiet. The drop's head and the Adit stay empty.
5. **What each leaves:** a relic in a prize chest, as the wings' do (eleven new relics); or a chest of shards and the
   change alone? *A relic each.*
6. **The changes to the roadmap's six:** the Precentor to the cloister walk, the Weathercock to the crossing's last
   pillar, the Topiary to the canopy, the Rope-team named the Roped. *As proposed.*
7. **How each comes in:** its name and a beat of quiet when it wakes, no seal; or a keeper's entrance, shorter? *The
   name and a beat of quiet.*
8. **The seven drawings in one batch, first,** shown to you together? *Yes.*

### Decided (28 Nov)

*Left to my judgment (decision 0.37): "decide on your own based on your own understanding and your estimation of what I would want." Any of these can still be changed.*

1. **The Night-Lantern,** in place of the Orrery.
2. **The order he meets them.**
3. **Yes:** the Geode and the Lid are fights of their own, between those levels' creatures and their keepers.
4. **The Hoistman.** The drop's head and the Adit stay empty.
5. **A relic each,** in a prize chest. The near ones (the Vane-pin and A Breath of the Eye) are made unlike each other before they go in.
6. **As proposed.**
7. **The name and a beat of quiet.**
8. **Yes, the drawings in one batch, first;** with the Topiary drawn too, at its four sizes (about $0.25), not made in code.
- **Not sure 9:** the ruts are cut deeper, so a crouch is under the blast.
- **Not sure 12:** if the Hollow's water is too far behind the Hoistman, a leak at the drop's foot.
