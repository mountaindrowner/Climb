# The Cast

Every keeper, creature and person on the mountain: what it is, why it is where it is, and how it is drawn. The story
direction is `docs/story.md`; this is the same for the cast. In the game, Corwen's Annals (`src/side/annals.js`, from the
pause) hold the same entries in the game's own voice.

## The rules every member keeps

1. **It belongs where it is.** A keeper is something that went on doing its duty after the flame went dark and forgot what
   the duty was for. A creature is what that region would breed or keep if no one tended it.
2. **Drawn the way he is.** 16 pixels to a world unit (every sprite's `sprite.json` says `ppu: 16`, and every keeper's
   pieces are sized `/ 16`), PixelLab's chunky style in Endesga 32, a single ink outline, a normal map. Nothing scaled.
3. **No faces on the faceless.** Grim, not cute. A creature has eyes only if it is a thing with eyes, and never a cartoon
   mouth or a scowl. The one face among the keepers is a mask (the Thunderhead's), and it is meant to be one.
4. **The people are the mountain's own folk, not humans**: creatures standing upright, tall, lean and long-legged in his
   proportions, worn and weathered, never cute. He and the Fallen are the only human shapes alive on the mountain; the
   humans who were here (the house, the guild, the Wrights, the astronomers, the pilgrims) are gone, and what is left of
   them is ruins, statues, and the creatures they became (the Acolytes, the Squall Knight, the Stopped).
5. **Each fight asks something different of him**, and the keeper's mechanic is its region's: no two keepers are beaten
   the same way.

## The keepers

| Region | Keeper | What it is | How it is beaten | The region's thing |
|---|---|---|---|---|
| Roots | The Warden | A titan of stone set to keep the fallen down. No one told it otherwise. | Cut its fists when they rest on the stage | The weight of the dark. It leaves him the Warden's weight: he breaks stone |
| Cloister | The Toll | The great bell of the house, ringing for a light it cannot see | Be out of its swing; cut it as it lies on the stage | Hours kept for nothing. It leaves him its step: a dash in the air |
| Spires | The Rime Wyrm | A serpent of ice coiled on the high pass; it lets none by | Cut its head when it is caught in the ice | The cold. It leaves him its wind: the glide |
| Tempest | The Thunderhead | The storm that came when the flame went dark, with a pale mask in it | Cut a lightning rod while it burns: the charge brings the storm down to him | Rising air, lightning. It leaves a heart |
| Gardens | Mother Thorn | What the garden grew, untended | When she opens: a bloom up, and down onto her heart | Blooms. She leaves a draught for the flask |
| Firmament | The Fallen | What he left at the top: him, dark, with a pale thread | Turn its blade, and cut when it is spent: his own whole kit | Star-glass. When it falls the thread goes to him |

**Audit (The Cast pass):** all six are unique in shape, motion and in what beats them, and each is made of its region:
stone, bell, ice, storm, garden, himself. All are drawn at 16 pixels a unit with normal maps. Two of their lines were
out of date and are fixed: the Warden's (now *it will not let you rise* / *what held you down is broken*) and the Wyrm's
(*the pass is open*, since the Spires are no longer the summit).

## The creatures

| Region | Creature | What it is | Fights by |
|---|---|---|---|
| Roots | Crawler | It eats what falls this far | Chases, rears (the tell), lunges |
| | Pale Bat | Born in the dark; never seen light | Circles, dives where he was |
| | Bile-sac | Clings to the wet rock, drinks what drips | Swells, spits a glob that leads him; parry it back |
| | Delver | A blind worm of the deep, all mouth | Runs under the floor, bursts up snapping |
| Cloister | Acolyte | A monk still keeping the hours | Slow, tough, a long overhead mace |
| | Gargoyle | Set on the eaves to watch the flame | Sits as stone until near, then dives |
| | House-lamp | A lamp of the house with no hand to carry it | Two bolts of fire |
| Spires | Rimeback | Patient as the ice | Keeps its distance, lobs ice; swats up close |
| | High Hawk | A hawk of the high air | Dives twice, wheels away |
| | The Stopped | A climber who sat down to rest | Drifts through anything, rears, rushes, hangs spent |
| Tempest | Squall Knight | The storm took his name and left him his shield | His front turns cuts; get behind or cut his recovery |
| | Nimbus | A piece of the storm, wearing its mask | Hangs over him, darkens, drops a bolt |
| | Ball Lightning | Lightning that will not finish falling | Runs and bounces |
| Gardens | Thornback | Kept once for the keepers' table | Paws, charges to the wall, stuns itself |
| | Lasher | A flower no one told to stop | A long low whip |
| | Rot-pod | The garden's seed gone bad | Drifts, swells red, bursts |
| Firmament | Sentinel | Brass, faithful to a door no one comes to | A heavy sweep; only a finisher or plunge staggers it |
| | Oculus | The great lens, still looking | Aims a line, fires along it |
| | Star-cinder | A cinder of the star that fell | Homes in, bursts on touch |

**Audit:** each region's creatures are of that region, and every way of fighting is distinct within a region. Drawn,
eight of them broke the rules above and are redrawn: the Pale Bat (a featureless smudge), the Bile-sac and the Delver
(cartoon faces, cute), the Nimbus (a scowling cartoon cloud; now a knot of storm wearing the Thunderhead's mask, its
child), Ball Lightning (an eye), the Rot-pod (a sleepy face), the Star-cinder (a face) and the Oculus (it came out as a
little robot on legs; it is a floating brass sphere with an eye). Ball Lightning and the Star-cinder are drawn by rule (`tools/energy-parts.py`), since PixelLab's character drawings give energy a body and a face. The old drawings are not in the repository's assets any more; git has them.

## Him, later

His look is to be revisited (not yet): taller and slimmer, more defined; his sword loses its edge against some
backgrounds and some frames look odd. His character (the mask, the red scarf, the cape) stays. Nothing is to change
until it is taken up.

## The people and their stations

How they are written (their sliders, their work, their arcs, and the help each gives him later) is in `docs/writing.md`.

The three who climb are met once in each region, each at a station of their own in a room of their own, never the first
room, as far apart as the region allows, clear of creatures, on rock rather than a plank where there is any, and Ordric beside his flame, not on it (`STATIONS` in `level.js`; a station names a room, or rooms in the order
wanted). Each station is drawn and lit (`items.js` `STATION`), its name shows beside the place's name when he is near,
and it is marked on the map once found.

| Person | Station | Where (Roots, Cloister, Spires, Tempest, Gardens, Firmament) |
|---|---|---|
| Ordric of the Vigil, an old moth | **Ordric's Vigil**: an iron lamp-post he tends, by a flame | grotto, cloister, hollow, masthead, orangery, vigil |
| Mirel the Penitent, a hermit crab | **Mirel's Rest**: a small fire in a ring of stones, her bedroll | bridge, belfry, eyrie, gantry, cascade, transit |
| Corwen the Annalist, a rook | **Corwen's Desk**: a folding desk, an open book, a candle | chamber, library, saddle, stacks, terraces, archive |

**Audit:** they were drawn big-headed and cute beside him, and Mirel without her pack did not match Mirel with it. All
three were redrawn in his proportions, and both drawings of Mirel are made from one description.

**The folk (build 23).** Too many people looked like him. They are now the mountain's own creatures, each one's shape
its story, so that no line has to say it:

| Person | Is | Why |
|---|---|---|
| Ordric of the Vigil | An old moth, wings folded like a cloak, a lantern on a pole | A moth flies at a flame; he is the one who learned to keep them instead. *The one above, I have never flown at.* |
| Mirel the Penitent | A hermit crab under a great borrowed shell | The shell is her pack: everything she thinks she owes, and not even hers. In the Gardens she has set it down, and is soft and bare for the first time |
| Corwen the Annalist | A rook in a robe of stars, spectacles, a satchel of scrolls | Rooks watch, keep and remember; his name already sounds like one. Not an owl: the wise owl is worn out |
| Hob of the guild (to come, in the Deep) | An old blind mole, a lamp on his cap, a pick | A miner who cannot see, always digging deeper, by his own little light |

They are drawn as creatures standing upright with his long legs and his weight, grim and worn, never as mascots; and as a
mixed folk (moth, crab, rook, mole), not one kind of animal, so that the mountain does not read as a kingdom of bugs or
birds.
