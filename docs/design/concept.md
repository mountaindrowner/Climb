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
- **Two directions.** Some segments spiral the other way. An inner and an outer spiral run counter to each other and meet at landings, so at a fork you choose by pressing ◀ or ▶: one route climbs to the left, one to the right.
- **The crumbling handoff.** The designer's example: the right stair has begun to crumble. You stand on its last high step while it shudders and rises on a groaning beam for a beat, then jump across to the left stair before it falls. Timing and nerve, not reflex.
- **Ledges and drops.** Short side ledges, gaps you can only cross with a route-opener, and drops that send you down a tier on purpose to reach a branch.
- **Hidden halls.** Cracked walls and side passages off landings, leading to secrets, blueprints and lore.

## Movement and feel (built, keep)

Free movement with a stick and four buttons: jump (variable height, coyote time, buffer, minimum hop), crouch-walk, an invulnerable roll, a held shield with parry, combos with wind-up, strike and recovery, knockback and hit-stop. Values in `controls.md`. The jump animation is the reference for the quality bar everywhere else.

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
| Cells | Currency dropped in a run, spent between biomes, lost if you die holding it | **Echoes** (placeholder): dropped by enemies, banked at the Pool's keeper at each region's end, lost on a fall if unbanked |
| Blueprints and the Collector | Found blueprints are unlocked with cells, adding new gear to the drop pool | **Blueprints** found on the climb are bought with Echoes at the Pool, adding weapons, tools and perks to future runs |
| Runes | Permanent abilities that open new routes and areas | **Route-openers**: a root grapple, a shoulder-ram for cracked walls, a wall-cling, a glide down the shaft. They open forks, side branches and hidden halls |
| Scrolls of Power | In-run stat boosts in three colours; each weapon scales with a colour | **Three oaths** (placeholder names): each scroll raises one; every weapon scales with one, so a run grows a build |
| Mutations | Perks picked between biomes | **Marks**, picked at rest stops, three slots per run |
| Forge | Raises the quality of all future gear | **The anvil at the Pool**: raises the base level of found gear |
| Boss Stem Cells | Difficulty tiers earned by finishing | **Deeper falls**: finish the climb to unlock a harder mountain with more threats and fewer heals |
| Biome branching | Each biome has more than one exit | Two exits per region, one often gated by a route-opener |

**Gold stays** for in-run shops and rest stops, half lost on a fall. **Lifts stay**, with a cost: riding one skips the loot, scrolls and blueprints below it, so climbing from the bottom makes you stronger. This keeps shortcuts without killing the roguelike.

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

- **The Ring.** You reach a wide circular platform that rings the open shaft. The stair behind you crumbles away. The ring is continuous, so you can run in a full circle while the Warden stalks it, leaps across the shaft, or circles in the middle. The camera pulls wide and orbits.
- **The Colossus.** The body stays in the background layer, mostly ornamental, filling the view behind the stair. It attacks with what reaches forward: hands that stomp the stair with a shadow tell and a shockwave, then rest there, where you hit them. After enough hits it reels and brings its head or core forward into the lane for the punish phase. Classic Mega Man boss rhythm. This reuses the parked Warden work.

Every region alternates between the two types, and each Warden has its own moveset (`lore.md` gives who they were).

## Presentation

- **Intro cinematic.** A fall from the summit to the Pool: the whole mountain in a few seconds, every region flashing past (the castle, the roost, the throne), then the splash, the dark, and the warrior heaving out of the water. It shows the scale before the first step.
- **The death crash.** Bulky and a little comic, as in Dead Cells. Slow motion on the killing blow, the camera snaps out, the body tumbles past the stair layers, bounces off a beam, and hits the Pool hard. A beat, then the warrior drags themselves out. The root-catch stays in the fall as a last chance. Skippable after the first time.
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

| # | Milestone | Delivers |
| --- | --- | --- |
| 0 | Pipeline proof of concept | Answers how models and animation get made (runs in parallel) |
| 1 | Foundation | Path graph with variable grade, true step collision and foot IK, the clipping test, camera system v2 (built in 0.17: variable grade, foot IK, the clipping test, camera explore and combat framing; forks wait for milestone 2) |
| 2 | Routes | Forks, counter-spirals, the crumbling handoff, side halls |
| 3 | The run | Echoes, blueprints at the Pool, oaths, marks, two exits per region; regions 1 to 4 |
| 4 | Weapons v2 | Six families, crit conditions, two tool slots, shaft kills |
| 5 | Wardens | The Ring and the Colossus, one of each |
| 6 | Presentation | Intro cinematic, death crash |
| 7 | The upper mountain | Regions 5 to 9, deeper falls |

## Open questions

- The names for Echoes, the three oaths and the route-openers; `lore.md` has the vocabulary to draw them from (the Welling, the casting of the tithe, the Lantern Watch).
- The lore's own open questions, chiefly the ending: let go, drink again, or give the flask to the one at the top (`lore.md`, last section).
- How long a full climb should take now that the pace is the player's: 30 minutes still?
- Do lifts survive, or does the climb always start from the bottom as in Dead Cells? (The concept keeps them, with the loot trade-off.)
- On the phone, is ◀ / ▶ enough to choose at forks, or does it need a dedicated prompt?
- Art direction: keep the low-resolution pixel look, or render cleaner once real models arrive?
- Which Warden type comes first: the Ring (new) or the Colossus (reuses the parked work)?
