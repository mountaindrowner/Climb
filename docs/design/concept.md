# The Climb — Concept v2

Nov 6, 2026 · supersedes the shape of `direction.md` (kept for history). World and story: `lore.md`.

## The game in one breath

A warrior wakes in a healing Pool at the bottom of a mountain and climbs, by hand, from the oldest caves to open sky. Every region is an older age of a fallen world stacked on the next. Death is a long fall back to the Pool. Each run you climb a little higher and a little stronger, and the mountain opens new routes as you learn it. Dead Cells in feel and structure, vertical in shape, Souls-light in story.

**Pillars**
1. **The climb is the score.** Height is the number that matters.
2. **Tight, never the challenge.** Movement and combat are instant and forgiving; difficulty lives in the threats.
3. **The mountain is a place, not a corridor.** The stair varies in grade, forks, crumbles and doubles back. Routes are choices.
4. **Every run leaves something.** Blueprints, routes and shortcuts stay with you.
5. **Read the tell, punish the opening.** Every attack is telegraphed clearly enough to read on a phone.
6. **Weight you can feel.** Heavy steps, bulky deaths, punchy hits, a camera that moves with intent.
7. **Nothing clips.** Feet meet steps, blades meet bodies, nothing walks through stone.

## The mountain

The mountain is **Orrow** and its stair is **the Wending**. The climb is a trunk of regions with side branches. You always move up in time: the bottom is the oldest catastrophe, the summit the most recent. Each region is several tiers of stair, ends at a Warden, and has two exits, one of which may need a route-opener (see The run). The Pool keeps what stops moving: *keep climbing, or become a Warden.* History, Wardens and item fragments for every region are in `lore.md`.

| Tier | Region | Name | What it is | Character of the stair |
| --- | --- | --- | --- | --- |
| 1 | The Deep | the Lowmost | Caves and caverns, nameless things, where you wake | Rough-cut rock, steep and narrow |
| 2 | The Mid Caverns | Gutterlight | Wider caves, fungus, rising water, first signs of builders | Gentle ramps, wide ledges, first forks |
| 3 | The Dwarf Mines | the Wellseams | Workings, rails, lifts, collapse | Steep timber stairs, mine-cart lines, crumbling sections |
| 4 | The Dwarf Empire | Haldmarrow | Halls, forges, aqueducts, a civilisation at its height | Grand shallow stairs, double spirals, galleries |
| 5 | The Dwarf Throne | the Abiding Seat | The seat of the empire and how it fell | A processional stair to a ring arena |
| 6 | The Dragon's Roost | Hearthroost | Burned halls the dragons took | Broken stair over open shafts, heat updrafts |
| 7 | The Troll Colony | Crookwarren | Squatters in the ruins, crude and dangerous | Rubble ramps, scaffolds, traps |
| 8 | The Lich Castle | Morrowkeep | A tower the dead built to sell years | Spiral towers, switchbacks, cold |
| 9 | The Bell Tower | Knellspire | Where the Lantern Watch kept its vigil | Bell ropes, ladders, the tallest climb indoors |
| 10 | The Outer Face | Whitherwind | Out onto the mountain's face, wind and first sky | Ledges and handholds on open rock |
| 11 | The Peak | Skysill | The held moment at the summit | A last short stair into dawn |

Side branches hang off the trunk (flooded galleries, a forgotten chapel, a dragon's hoard): optional, richer loot, harder, and they rejoin above.

## The stair

The stair stops being one uniform spiral. It becomes a **path graph**: segments of stair joined at landings, each with its own settings.

- **Variable grade.** Each segment has its own rise per step, from gentle ramps (about 0.3) to steep flights (about 0.75), with flat galleries between. Most of the climb is gentler than now. The camera pulls further out on gentle stretches to show the space and options ahead.
- **Fewer, more varied steps (designer's note, Nov 7).** A long run of short, identical steps reads as constant bumping. Mix the surfaces instead: sloped ramps of worn rock with the occasional step, runs of broad steps, now and then one tall step to climb. Steps should feel placed, not tiled. To be tested: it may not suit every region (dwarf halls want real stairs; the Deep wants rough slopes).
- **Two directions.** Some segments spiral the other way. An inner and an outer spiral run counter to each other and meet at landings, so at a fork you choose by pressing ◀ or ▶: one route climbs to the left, one to the right. The routes differ from run to run (procedurally placed), so which way you go, and when you are forced across, changes every climb.
- **Platforming on the stair's own lane (designer's notes, Nov 7 evening; built in 0.26).** The climb is a side-scroller wrapped round a cylinder, so it should platform, not only climb a revolving stair. Ledges stand on the stair's own lane, one-way as in any side-scroller; he catches an edge in a jump and hauls himself up (Dead Cells' ledge grab: hands reach 2 above his feet), which is what lets a ledge hang high enough to walk under and still be reached. A flight or two a region (drawn per climb) has no steps: you cross on ledges, some crumbling. Forks are **switchbacks**: a ledge hangs over the fork landing; catch it, climb a run of ledges back the other way over the stair you came up, and come up through a broken gap in the stair a turn above. No hold-and-jump gesture, and no route behind the wall.
- **Falls cost (0.26).** Miss a jump or drop through a hole and you fall to whatever is below, often the stair a whole turn down, and the landing hurts by the height (1 for a drop past 3.6, 1 more per 12 beyond: 2 for a full turn). Death is still the fall to the Pool. Practice runs keep the old step back, to drill a threat.
- **Stairs in proportion (0.26).** Each unit of stair is two steps, so a riser is about a tenth of his height, as real stairs are; the body rides a ramp through them and foot IK plants each foot (the usual fix in games for stairs that jerk).
- **The crumbling handoff (corrected, Nov 7; replaced in 0.26 by the switchbacks).** Not a rising platform. You are running one way (say right) and the stair runs out or starts to crumble under you. The other stair, running the other way, is higher, too high to reach from a standing jump. The only way across is to keep running along the failing stair and leap at its last moment, before it falls away. Speed and nerve. Built in 0.22 as the spur at each fork; the rising slab of 0.19 is gone.
- **Ledges and drops.** Short side ledges, gaps you can only cross with a route-opener, and drops that send you down a tier on purpose to reach a branch. Built in 0.23 as each hidden hall's end: it breaks out onto a ledge above the next landing and you drop back to the stair. Route-openers wait for the run (milestone 5).
- **Hidden halls.** Cracked walls and side passages off landings, leading to secrets, blueprints and lore. Built in 0.23: one walled-up arch per zone, at a landing drawn per run; three blows break it; inside, a carving (lore) and a chest (gold, the flask filled). Blueprints join the chests with the run (milestone 5).

## Movement and feel (built, keep)

Free movement with a stick and four buttons: jump (variable height, coyote time, buffer, minimum hop), crouch-walk, an invulnerable roll, a held shield with parry, combos with wind-up, strike and recovery, knockback and hit-stop. Values in `controls.md`. The jump animation is the reference for the quality bar everywhere else.

The designer's notes after playing the skeleton (Nov 7): the concept, the climbing and the rooms are right; what is left is mastering the effect and feel. Specifically:

- **Climbing steps.** Today his whole body pops up a step the moment a foot touches it. The body should rise with the stride: the leading foot steps up, the hips follow through the step, so a flight is climbed, not teleported up.
- **Crouch with nuance.** Not flattened or shrunk: a low, coiled crouch, weight forward, maybe a hand down; a crouch-walk that looks like creeping. The crouch-walk's footsteps currently come too fast and their sound is too obvious.
- **Idle that lives.** Looking around, glancing up the shaft, shifting weight, now and then.
- **The sword.** Longer, held two-handed (a hand-and-a-half sword), which also gives the swings more weight.
- **Size.** He is 10% taller.
- **Hit juice.** A landed hit should feel special: a flash on the enemy, a swipe trail, sparks, a short freeze, a kick of the camera, a meaty sound.

## No clipping (the rules)

1. **Feet on steps.** Replace the smoothed ramp with true step surfaces: the body rides the step it stands on, and the legs reach the next step with foot IK, so every step is visibly taken and no foot sinks into stone.
2. **A body, not a point.** The warrior and every creature get a radius and a height. Nothing overlaps the wall, the stair edge or each other. Creatures conform to steps the same way.
3. **Swings respect stone.** Weapon arcs are traced against the wall; a swing that would pass through stone sparks off it instead.
4. **Props sit on surfaces.** Rubble, gold, weights and chains are placed and checked against step tops and the wall, never by eye.
5. **The camera never looks through things.** Chains and pillars between the camera and the warrior fade out.
6. **A test for it.** The headless bot measures foot-to-step and body-to-wall distances every frame and fails the build on any penetration.

## The run (roguelike structure, from Dead Cells)

What Dead Cells does, and our version of it:

| Dead Cells | What it does | Ours |
| --- | --- | --- |
| Cells | Currency dropped in a run, spent between biomes, lost if you die holding it | **Wellstone** (built in 0.25): the teal light the blade frees from a thing that drank the Pool. Kills and hidden halls drop it. Fetch sends it down to the Pool from any rest stop; what you carry is lost on a fall |
| Blueprints and the Collector | Found blueprints are unlocked with cells, adding new gear to the drop pool | **Blueprints** (0.25): found in hidden halls and now and then where something dies, kept for good once found, bought with wellstone from Fetch at the Pool. Each adds a mark to what Fetch offers; weapons and tools join them with weapons v2 |
| Runes | Permanent abilities that open new routes and areas | **Route-openers**. The first, **the Hald ram** (0.25), turns up in the first hidden hall you open above the Deep and breaks the rubble over a closed fork. Still to come: a root grapple, a wall-cling, a glide down the shaft |
| Scrolls of Power | In-run stat boosts in three colours; each weapon scales with a colour | **Three oaths** (0.25), the Lanternbearer's oath in three parts: the **Edge** ("What I find, I end": harder blows), the **Lantern** ("I go down with the light": more health), the **Knell** ("What ends, I name": quicker swings, a wider parry). Three oath stones a region, each offering two; what you swear grows for the climb and a fall undoes it. Weapons scale with an oath from weapons v2 (the sword with the Edge) |
| Mutations | Perks picked between biomes | **Marks** (0.25), from Fetch at rest stops: one a stop, three a climb. Root, Tithe and Ward are known from the start; Vigil, Finisher, Fleet, Seam, Second Breath and Bearer come from blueprints |
| Forge | Raises the quality of all future gear | **The Pool's upgrades** (0.25), from Fetch for wellstone: a deeper flask, Hald mail, Fetch's credit. The anvil (the quality of found gear) waits for weapons v2 |
| Boss Stem Cells | Difficulty tiers earned by finishing | **Deeper falls**: finish the climb to unlock a harder mountain with more threats and fewer heals |
| Biome branching | Each biome has more than one exit | Two ways up through every region: each climb opens one fork or both, and the ram breaks open a closed one |

**Gold stays** for in-run shops and rest stops, half lost on a fall (a quarter with the Mark of the Tithe). **Lifts stay**, with a cost: riding one skips the oath stones, the wellstone and the finds below it, so climbing from the bottom makes you stronger. This keeps shortcuts without killing the roguelike. **The Pool sums up each climb**: how high you got, what you ended, what you swore, what you found, what the fall cost.

## Combat and weapons

Every weapon family has a verb and a reason to pick it. Each weapon scales with one oath and has one crit condition, so choices interact.

| Family | Verb | Why choose it | Crit when |
| --- | --- | --- | --- |
| Swords | Fast three-hit combos | Safe, flexible | the third hit lands |
| Hammers and picks | Slow, heavy, staggers | Breaks guards and shields; knocks enemies off the stair into the shaft | the target is stunned |
| Spears | Long reach, pierce | Holds a stair against things coming down it | the target is approaching |
| Daggers | Very fast, short | Burst and mobility | from behind |
| Shields | Block and counter | Parry builds turn defence into damage | right after a parry |
| Bows and throwing axes | Ranged, aimable up and down the shaft | Kills spitters and fliers before they act | at long range |

**Tools (two cooldown slots):** bombs, a root snare, a lantern flare for dark regions, a grapple hook, a turret. **Climbing-specific effects:** knocking a creature into the shaft is an instant kill; a downward plunge attack from a jump; crits against targets above you.

## Wardens (two arena types)

- **The Floor (built in 0.27).** The stair ends at the top of each region in a flat floor with a sheer edge where the steps above have fallen away. A stone golem waits there; step on and the stair behind you comes down in rubble. A face-to-face fight on the lane: the slam (get out of reach; then his fists rest on the floor, the opening), the sweep (crouch, roll or block; a parry floors him), the stomp's shockwave (jump it), the leap (move). Enough damage in a row knocks him onto one knee. At half strength he stops warning you and the roof comes down. Beaten, the first flight above rises into place, and the win is kept. Decision 0009.
- **The Ring.** You reach a wide circular platform that rings the open shaft. The stair behind you crumbles away. The ring is continuous, so you can run in a full circle while the Warden stalks it, leaps across the shaft, or circles in the middle. The camera pulls wide and orbits.
- **The Colossus.** The body stays in the background layer, mostly ornamental, filling the view behind the stair. It attacks with what reaches forward: hands that stomp the stair with a shadow tell and a shockwave, then rest there, where you hit them. After enough hits it reels and brings its head or core forward into the lane for the punish phase. Classic Mega Man boss rhythm. This reuses the parked Warden work.

Every region alternates between the two types, and each Warden has its own moveset (`lore.md` gives who they were).

## Presentation

- **Intro cinematic.** A fall from the summit to the Pool: the whole mountain in a few seconds, every region flashing past (the castle, the roost, the throne), then the splash, the dark, and the warrior heaving out of the water. It shows the scale before the first step.
- **The intro story sequence.** Before the first climb: who he is and why he climbs, told briefly (see `lore.md`), ending in the fall and the wake in the Pool.
- **The death crash.** Bulky and a little comic, as in Dead Cells. Slow motion on the killing blow, the camera snaps out, the body tumbles past the stair layers, bounces off a beam, and hits the Pool hard. A beat, then the warrior drags themselves out. The root-catch stays in the fall as a last chance. Skippable after the first time.
- **The climb back out.** After every fall you see him haul himself out of the Pool and walk back to the start of the stair, so the loop is shown, not cut.
- **Simple storytelling.** Item descriptions, inscriptions, the keeper's few lines, environmental scenes. No cutscene dumps.
- **The camera system.** States with framing rules, blended smoothly:

| State | Framing |
| --- | --- |
| Explore | Leads the way you face; wider on gentle grades, tighter on steep ones |
| Combat | Frames you and the nearest threat; pulls out as more join |
| Fork | Pans briefly to show both routes |
| Arena | Wide orbit around the ring or the colossus |
| Cinematic | Scripted dolly, zoom and pan for intros, deaths and region arrivals |
| Punches | A short zoom on kills and parries, a kick on heavy hits |

## Art and animation pipeline

The bar is the current jump animation. What exists for Claude to make models and animation:

| Option | What it is | Fit |
| --- | --- | --- |
| **Headless Blender via `bpy`** | The official Blender-as-a-Python-package (version 5.2.3 installs in this container). Claude writes Python that builds low-poly meshes, rigs and keyframed actions, and exports glTF, which three.js loads | Best first bet: runs here, no outside service, scripts live in the repo, suits the chunky style |
| **Blender MCP servers** | Community add-ons that let Claude drive Blender on your computer | Interactive, but third-party and needs a desktop; review before installing |
| **Generative 3D services** | Meshy (official MCP, with rigging, preset animations and text-to-motion), Tripo, Rodin, Ludo | Fast and detailed, but paid, needs an API key and network access, and style consistency is a risk |
| **three.js animation skills** | Community skill files on animation mixers and procedural motion | Knowledge only; read before installing, as with the last repo we reviewed |

**Proof of concept, in order:**
1. **Done (Nov 6).** The warrior rebuilt in headless Blender (`tools/blender/warrior.py` → `assets/models/warrior/warrior.glb`): shaped low-poly parts in the same proportions, a joint rig, and 14 keyframed clips (idle, run, crouch-walk, rise, fall, roll, four swings, block, block high, hurt, flail). The game plays them frame-locked to gameplay state, with the cape and squash-and-stretch layered on in code. The title screen toggles between this warrior and the hand-built one for comparison on the phone. Verdict pending your playtest.
2. One enemy from a generative service (the crawler), rigged and animated, to compare quality, style and cost. Needs a key and the service's host allowed.
3. Pick the pipeline per asset type: likely Blender scripts for characters and props, procedural code for small effects.

## Build order

Built so far: the foundation (0.17), forks as the high road (0.18), a first crumbling handoff (0.19, to be replaced), and the skeleton as the player with measured strides, sprint, the smooth camera, mouse controls and the bat (0.20). The designer's notes of Nov 7 are folded in below; most are feel, so feel came next (0.21), then stair and routes v2 (0.22): the handoff as designed, varied surfaces, forks that change per run, and the hidden halls with their ledges (0.23), then threats and places v2 (0.24), then the run (0.25), then a round on the designer's playtest (0.26): platforming on the stair's own lane, switchback forks, falls that land below, stairs in proportion, the sword combo in front. Weapons v2 is next.

| # | Milestone | Delivers |
| --- | --- | --- |
| 0 | Pipeline (runs in parallel) | Settled: the designer's own models from Tripo, made ready by Blender scripts (the skeleton), and creatures built in Blender scripts (the bat). Next creatures and props come through the same two paths |
| 1 | Foundation | Built in 0.17: variable grade, foot IK, the clipping test, camera explore and combat framing |
| 2 | **Feel and juice (built in 0.21)** | Climbing that rises with the stride instead of popping up each step; a nuanced crouch and a creeping crouch-walk (its footsteps and their sound fixed); idle variations (looking around, up the shaft); a longer, two-handed sword; the warrior 10% taller; hit juice (flash, swipe, sparks, freeze, camera kick, sound); wider, more daunting broken-step gaps; prompts fixed (the ring and its arrow centred); beams pointing out toward the shaft's centre instead of at an odd angle |
| 3 | **Stair and routes v2 (built in 0.22 and 0.23)** | Fewer, more varied steps: slopes with the occasional step, broad runs, tall steps (tested region by region); routes that differ per run; the crumbling handoff redone as designed (keep running on the failing stair and leap to the higher one before it goes); side halls and ledges |
| 4 | **Threats and places v2 (built in 0.24)** | Every threat rebuilt to the bat's standard, starting with the burrower (the stair trap with the spiked jaws), then crawler, spitter, rockfall, swing; the rest stop's campfire rebuilt; more kinds of crouch obstacle than the beam (a low arch, a hanging chain curtain, a collapsed lintel, roots) |
| 5 | **The run (built in 0.25)** | The Dead Cells layer: Echoes, blueprints at the Pool, oaths, marks, two exits per region; regions 1 to 4 |
| 6 | Weapons v2 | Six families, crit conditions, two tool slots, shaft kills (the pick and spear come back here) |
| 7 | Wardens | **The Floor built in 0.27** (the designer's golem, at the top of every region); then the Ring and the Colossus, and a moveset per region |
| 8 | Presentation | The intro story sequence, the death crash, the climb back out of the Pool to the start every time |
| 9 | The upper mountain | Regions 5 to 9, deeper falls |
| S | Sound (runs in parallel) | Better effects: find and vet sources (licences that allow a commercial game, for example CC0 libraries, Sonniss's free GDC bundles, Kenney), keep the procedural sounds as a base, and replace the most-heard ones first (footsteps, swings, hits, the flitter) |

## Open questions

- Settled in 0.25: wellstone (for Echoes), the Edge, the Lantern and the Knell (the oaths), the Hald ram (the first route-opener). Still open: the other route-openers' names.
- The lore's own open questions, chiefly the ending: let go, drink again, or give the flask to the one at the top (`lore.md`, last section).
- How long a full climb should take now that the pace is the player's: 30 minutes still?
- Do lifts survive, or does the climb always start from the bottom as in Dead Cells? (The concept keeps them, with the loot trade-off.)
- On the phone, is ◀ / ▶ enough to choose at forks, or does it need a dedicated prompt?
- Art direction: keep the low-resolution pixel look, or render cleaner once real models arrive?
- Settled in 0.27: the first Warden is the Floor (the designer's golem). Next: a moveset and a look for each region's Warden.
- Slopes with the occasional step, or stairs throughout? The designer is unsure it suits the larger game; milestone 3 tests a mix region by region.
- Two-handed sword: does the off hand leave the blade for the block, or does he block with the blade itself?
