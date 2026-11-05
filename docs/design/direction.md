# The Climb — Full Project Direction

Nov 4, 2026 · Mark

## The core idea

Climb from the lowest depth of a forgotten mine shaft to the highest point of the highest mountain peak. That journey, and the wonder of how far it is, is the whole game.

- **The scale is the point.** You start somewhere so deep no one remembers it, and you end in open sky at the summit. Every meter between is earned.
- **Simple to play, deep to express.** The controls stay simple enough to learn in a minute: climb, jump, duck, strike, block. The variation is what grows: new zones, enemies, hazards, modes, Wardens and combinations that keep reshaping those same few actions over a long journey.
- **An extensive journey.** The climb should feel long and epic, with each zone a distinct part of the mountain's insides, from flooded halls to forges to the final stair into daylight.

## Pitch

The Climb is a portrait mobile roguelike in chunky 3D. You fight your way up a spiral stair from the bottom of an impossibly deep mine, and every death drops you all the way back down.

**The hook:** how high can you get? Height is the score, not kills.

**Origin:** a conversation about Gandalf's fall in Moria. He fell for days, by one estimate about 5 to 6 km, then fought from the lowest depths to the mountain's peak over roughly 8 to 10 days. Down there are nameless deep things even Sauron would not touch. The idea: a game that is nothing but that climb, one layered tunnel fight from the bottom to the top.

**IP line:** the setting, names and creatures must be original. No Moria, Balrog, Gandalf or Durin. The prototype's zone name "The Endless Stair" is also Tolkien's term; the build now uses the placeholder "The Long Stair" until a real name is chosen. The concept itself, climbing up from the deepest point, is fully ours.

**Working title:** The Climb.

**Touchstone:** Dead Cells, especially its roguelike structure, its four-button clarity and the weight of its weapon animations.

## Design pillars

Seven rules every feature should serve.

1. **The climb is the score.** Best height is the number that matters, shown on a meter down the side of the screen.
2. **Falling is gameplay.** Death is a plunge you can still fight, not a reset screen.
3. **The mine remembers.** Repairs, beaten Wardens and gold you threw down stay with you across falls.
4. **Heavy, emotive steps.** Every step lands like a beat, with weight, dust and sound. You should see the warrior take every single step.
5. **Read the tell, punish the opening.** Every attack is telegraphed clearly enough to read on a phone.
6. **A living shaft.** Layers in front of and behind the stair, with things happening in the background.
7. **One thumb each side.** Four core buttons, portrait-first, built for mobile.

## Core loop

Climb, fall, wake in the Pool, climb again. Each climb starts a little easier than the last.

1. **Wake in the Pool** at the bottom of the shaft. Your flask is full. Pick a weapon off the floor, then start from the bottom or ride a lift you repaired.
2. **Climb.** The warrior climbs on his own. You jump, duck, attack, block and drink.
3. **Make progress.** Collect gold, repair lifts, stop at rest stops, and fight the zone's Warden.
4. **Fall.** At zero health you plunge down the open center of the shaft. Grab a root to save some of the height.
5. **Land in the Pool.** Half your carried gold scatters on the way down. Loop back to step 1.

### What carries over a fall

| Thing | Carries over? | Notes |
| --- | --- | --- |
| Repaired lifts | Yes | Each becomes a start point from the Pool |
| Beaten Wardens | Yes | A lift runs past them, and the stair above stays open |
| Gold thrown down the shaft | Yes, if the pouch survives | The burst chance rises with height |
| Carried gold | Half | The rest scatters during the fall |
| Weapon choice | Yes | Your last pick is remembered |
| Best height and fall count | Yes | Saved on the device |
| Rest stop upgrades | No | They last for this climb only |
| Height-based unlocks | Proposed | Starting gear, abilities, perks |

### The Pool

The Pool sits at the very bottom of the shaft and is visible down the center from anywhere on the climb. It revives you and refills your flask, which is why you can fall but never die. Nothing else refills the flask fully; rest stops sell single charges.

**Proposed lore hook:** the Pool is why the deep things live at the bottom. They are drawn to it, guard it, or are kept alive by it too. That can pay off late in the game.

### The fall

Failing should still feel like a fight. You fall down the open center of the shaft. Each time the spiral passes beneath you, a root sticks out from the stair's edge. Time slows near each root. Tap ▲ as it passes your hands to catch it and resume climbing from there at a third of your health. Miss every root and you splash into the Pool. Spamming ▲ is limited by a short cooldown after each grab attempt.

## Controls and mobile

The controls are Dead Cells-simple: ▲ and ▼ for movement and interaction, A and B for combat, with cooldown abilities added later.

| Input | Action | Status |
| --- | --- | --- |
| ▲ | Jump; repair a lift on its landing; grab a root while falling | Built |
| ▼ | Duck under beams and sweeps | Built |
| A | Attack; only damages a Warden while it kneels | Built |
| B | Block; tapping it in the last 0.2 s before a hit lands is a parry | Built |
| Flask | Heal 2 health | Built |
| Ability slots | Cooldown abilities that unlock later, stacked above A and B | Proposed |

**Layout:** the left thumb has ▲ over ▼, the right thumb has B and A set like a controller, and the flask sits between them. Portrait-first, tested on a phone. A keyboard map exists for desktop testing: W or ↑ or Space, S or ↓, J or Z, K or X, F or Q.

**Movement:** the warrior auto-climbs, runner-style, and stops in boss arenas. Free left-right movement like Dead Cells was raised and set aside, then raised again (see Open questions): the current thinking is that the stair could branch, with the player choosing left or right and jumping between platforms, and that Warden fights might happen while walking rather than standing still.

**Dodge is unsolved.** Jump and duck currently act as the dodges. Three options were proposed:

- Down plus B to roll.
- Double-tap a direction to dash.
- A B hybrid: a well-timed press parries and a late press rolls. This one keeps it to four buttons, which matters most on mobile.

## Combat, enemies and hazards

Every threat has one clear answer and a visible tell that comes before it.

| Threat | Answer | Tell | Damage | Status |
| --- | --- | --- | --- | --- |
| Broken step | ▲ jump | Glowing cracks in the slab; it crumbles into the shaft as you reach it | 1, plus a stumble | Built |
| Fallen beam | ▼ duck | A splintered timber wedged diagonally across the stair; it creaks and sheds dust | 1 | Built |
| Rockfall | B, shield overhead | Grit falls, a shadow ringed in amber grows on the step, the boulder drops | 1; a parry shatters it for gold | Built |
| Swinging weight | ▼ duck | A chained boulder cocked up the stair; the rope snaps and it swings down at head height | 1 | Built |
| Crawler | A before it lunges, or B to block and then A | Wall crack glows, it skitters out on six legs, rears with red eyes, lunges after 0.5 s | 1 | Built |
| Spitter | B to block; a parry reflects the glob and kills it | Its sac swells and glows, an aim line finds you, it recoils as it spits | 1 | Built |
| Burrower | ▲ jump | A ring of glowing cracks marks a step; a bone fin ploughs toward it; jaws burst up as you cross | 1 | Built |
| Flitter | A to swat, or B to block | Shrieks, drops from the wall, loops out over the shaft and dives at your head | 1 | Built |

The full catalog, with the fairness rules and how to add a threat, is in `docs/design/enemies.md`. The title screen's **Practice a threat** runs any one of them on its own.

**Readability rules in the build:** a hazard icon appears about 4 steps ahead. The climb slows to a quarter speed while a crawler is dueling you. Every hit, parry and hurt has a short freeze-frame and screen shake, and your swings leave a visible arc. The first five flights are a tutorial, one threat each, with a hint bar.

**Crawlers get tougher:** 1 hit to kill in zones 1 and 2, 2 hits from zone 3 on.

**Weapon animations** are a priority for the feel pass: each weapon should have its own swing with real weight, in the Dead Cells spirit. Today all three share one arc.

### Environmental spawns

Enemies come out of the environment in a way that fits the place, which doubles as a warning.

| Zone | Spawn | Status |
| --- | --- | --- |
| The Deep | Things crawl out of cracks in the wall | Built |
| Flooded Halls | Shapes rise from the water | Proposed |
| Forge Galleries | Constructs step out of casting molds | Proposed |
| Fungal Caverns | Creatures burst from spore pods | Proposed |

### Gameplay modes to rotate through the climb

| Mode | What it is | Status |
| --- | --- | --- |
| Auto-climb runner | The backbone: timed jump, duck, slash, block | Built |
| Running Warden fight | The Warden attacks from behind the wall while you keep climbing | Built |
| Branching stair | The stair forks; choose left or right, jump to other platforms, find side routes | Proposed |
| Minecart rails | Fast, rhythm-heavy rides that fit a mine | Proposed |
| Arena holds | The climb stops; survive waves until a door or lift opens | Proposed |
| Pursuit | Something hunting you closes in and the timing tightens | Proposed |
| Repair moments | A quick-time interaction under pressure that earns a permanent shortcut | Built as a single ▲ tap |

## Bosses

**Parked (decision 0006).** The Warden fight is behind a feature switch while the threat catalog is built out; with it off the whole shaft is open. What follows describes the fight as built, for when it returns.

Each zone ends with its Warden, and the fight is a running fight. The climb never stops. Along the last five flights the shaft wall has collapsed: rubble slopes away behind the stair into the open cavern, and the Warden, which has been climbing behind the wall all zone, is out in the open beside you, keeping pace on the rubble and reaching across to get at you. That makes seven Wardens in all. One is built; the other six reuse its moveset with new names and faster timing.

| Attack | Tell | Answer | Marker | Damage |
| --- | --- | --- | --- | --- |
| Swipe | It draws an arm back and up, twisting away, then sweeps it across the stair at head height a few steps ahead | ▼ duck | Red band at head height | 1 |
| Slam | Both fists rise and it rears back, then a fist hammers the step ahead; a shockwave rolls down the steps at you | ▲ jump as the shockwave reaches you | Red strip down the steps and the rolling shockwave | 2 |
| Spit | It leans in, braces on the rubble and its mouth glows | B to block; a parry reflects it for 3 damage | Aim line from its mouth to you | 1 |

**The opening:** after each attack its fist rests on the stair (or hangs across it) for a moment, in your lane, and after a spit its head stays leaned in. That is when A does damage, and only while you are close enough to it, so you hit it as you pass. The opening lasts 1.5 s in phase 1 and 1.1 s in phase 2. A swing at it any other time just clangs.

**The race:** reach the top of its stretch with it still alive and it tears the stair out from under you. You fall, and the roots and the Pool apply as always. Catch a root one turn down and you land near the start of its stretch to try again.

**Phase 2 starts at half health.** The button prompts and timing rings disappear, the floor and head-height markers only show in the last 0.42 s, and 55% of its turns are two-attack combos.

**Rewards:** 25 gold plus 10 per zone, a permanent lift past it, and the darkness above lifts to open the stair. It sinks into the rubble while you keep running; nothing interrupts the climb. Its health is 12 plus 5 per zone.

**Foreshadowing (built):** the silhouette climbing the cavern behind the wall is the same creature; when the wall falls away at its stretch, there it is.

### Proposed for bosses

- A unique Warden per zone, each with its own moveset. The code reads movesets from `src/wardens/movesets/`, so this is a content job.
- Attacks that change the stair itself: a slam that breaks steps you then have to jump, a swipe that sends rubble onto the stair.
- A pursuer that hunts you up the shaft and closes in during chase sections.
- Background-to-foreground moments beyond the Wardens: smaller things in the back layer that later jump into your lane.

## World

One round shaft, seven zones stacked bottom to top. The difficulty curve is flipped in one way: the oldest, scariest things live at the very bottom, where you start.

| # | Zone | Flavor | Zone hazard idea | Warden |
| --- | --- | --- | --- | --- |
| 1 | The Deep | Ancient nameless things, darkness | Wall-crack spawns | Warden of the Deep |
| 2 | The Flooded Halls | Water rising behind you forces you on | Shapes rise from the water | The Drowned Warden |
| 3 | The Forge Galleries | Fire, heat vents, old machinery | Constructs from casting molds | The Forge Warden |
| 4 | The Fungal Caverns | Glowing, strange, full of ambushes | Spore pods burst | The Spore Warden |
| 5 | The Collapsed Workings | Unstable floors and cave-ins | Crumbling steps | The Broken Warden |
| 6 | The Long Stair (placeholder name) | The long final climb | Not yet defined | The Stair Warden |
| 7 | The Peak | The final fight in the open air | Not yet defined | The Last Warden |

### The spiral

The stair hugs the inside wall of a round shaft. The camera sits near the center and circles with the warrior as he climbs, so the wall keeps sweeping past behind him. Looking down the open center, you can see the glowing Pool at the bottom.

- The path radius is 7 units, with steps 2.6 units wide.
- Each step rises 0.55 units (lowered from 0.75 for a shallower ramp), with 8 steps per flight plus a landing.
- About 4.5 flights make one full turn.
- One zone is 15 flights and always measures 135 in-game metres; the metre scale is derived from the geometry so tuning the ramp never changes the height numbers.
- The climb camera now sits further back so more of the shaft and the scenery is in view.

**Fixed spots in every zone:** a broken lift on flight 5 (54 m in zone 1), a rest stop on flight 8 (81 m), and the Warden's stretch over flights 10 to 14 (99 m to 135 m). There is no arena platform: the fight happens on the stair.

### Scene layers

The scene runs in multiple layers, with things happening behind the stair.

| Layer | What is there | Status |
| --- | --- | --- |
| Foreground | Chains hanging in the open center pass in front as the camera turns; drifting dust; falling grit | Built |
| Midground | The stair, the warrior, enemies, lifts and campfires | Built |
| Wall | Cracked, grimy brick with glints of crystal and openings into deeper caverns | Built |
| Deep background | Darker caverns behind the wall, with the Warden's silhouette climbing | Built |
| Collapsed sections | Along each Warden's stretch the wall is gone: a rubble slope, broken edges, stubs of wall, the cavern floor the Warden walks | Built |
| Above | Darkness hides everything above the next unbeaten Warden | Built |
| Crossing layers | Something seen in the background later drops into your lane | Proposed |

### Hidden areas and secrets

The mine should feel bigger than the stair. Proposed, none built yet:

- Forgotten halls and side passages that branch off the main climb.
- Secrets and hidden loot for players who look for them.
- Glimpses of the deep evils hidden far below, things you only ever see, never fight, that hint at how much is down there.

## Economy, gear and progression

Gold is earned on the climb, spent at rest stops, and half of it is lost on every fall. That makes throwing it down the shaft a real gamble.

**Gold sources:** nuggets on the steps give 1, a crawler 3, a spitter killed by parry 4, and a Warden 25 plus 10 per zone.

### Rest stop

| Option | Cost | Effect |
| --- | --- | --- |
| Refill a flask charge | 12 gold | One more heal of 2 |
| Whetstone | 25 gold | +1 damage this climb, up to 2 |
| Iron heart | 30 gold | +1 max health this climb, up to 2 |
| Throw your gold down the shaft | All carried gold | It waits in the Pool. The pouch bursts 10% of the time, +1% per 4 m of height, capped at 60% |
| Swap weapon | Free | Take either other weapon |

### Weapons on the floor

| Weapon | Damage | Cooldown | Reach |
| --- | --- | --- | --- |
| Short sword | 1 | 0.22 s | 1.7 |
| War pick | 2 | 0.5 s | 1.6 |
| Spear | 1 | 0.32 s | 2.5 |

### Health and healing

You start each climb with 5 health and a 3-charge flask, and each charge heals 2. Catching a root mid-fall leaves you at a third of your health.

### Proposed progression

- Throwing actual gear down the shaft, not just gold, each item with its own break chance.
- Roguelike unlocks earned by how high you have reached: new starting gear, abilities and perks.
- Flask upgrades as meta-progression: more charges and stronger heals.
- Cooldown abilities that show up later in the game.
- A ghost of your best run climbing beside you.

## Run structure and pacing

The target is about 30 minutes for a full climb with no falls. The prototype is far shorter: about 2 minutes of climbing per zone, so roughly 15 minutes before boss fights.

- **Target split:** 7 zones at roughly 3.5 minutes each, plus rest stops and Warden fights.
- **Climb speed in the build:** 2.25 steps per second, plus 0.12 per zone. It slows to 40% on an unrepaired lift landing and to 25% during a crawler duel.
- **Closing the gap:** lengthen zones from 15 flights toward 25, or slow the climb, or add mode sections such as minecarts and arena holds. This needs tuning on a phone.
- **Why shortcuts matter:** a 30-minute climb means early deaths force you to replay the bottom zones a lot. Repaired lifts and beaten Wardens are what keep that from becoming a grind.
- **A fall takes about 3 to 5 seconds,** with slow motion near each root.

### Difficulty layers

Difficulty rises with each zone through faster climbing, more obstacles per flight, tougher crawlers from zone 3, more spitters after zone 1, and shorter Warden wind-ups. Proposed: separate difficulty tiers that remix enemies and hazards per zone.

## Look, feel and audio

The look is a chunky 3D take on Bit.Trip Runner: gritty 3D, deliberately rendered at low resolution for a pixel look, with a sharp HUD over it.

- **Resolution:** the 3D view renders at about 600 pixels tall and is scaled up with hard pixel edges.
- **Heavy steps:** each step lands with a thud, a puff of dust, a squash on the body and a small camera dip. The legs alternate, with the lead foot lifting onto the next step, so each step is visible. Proposed: sync enemy attacks to that step rhythm so it doubles as the game's tempo.
- **Grit:** noisy, cracked, chipped stone on the steps, wall and Wardens. Grime streaks and dark mortar on the wall. Heavy fog, a flickering torch, grit falling from above, film grain and a vignette.
- **The warrior:** mail shirt, steel pauldrons, beard, nose-guard helmet, a cape that sways, a lantern on his hip, a banded shield. He leans into each step.
- **Wardens:** stone golems with glowing cracks and a glowing core that pulses when they kneel. They are turned three-quarters to the camera so their face reads.
- **Light:** a warm torch follows the warrior, the Pool casts teal light up the shaft, and campfires and repaired lift lamps cast their own light. Each zone tints the fog and stone its own color.
- **Audio:** placeholder sounds generated in the browser, covering the step thud, slash, hit, parry ping, block, hurt, roar, slam, splash and repair. Real sound effects and music are still to come.
- **Haptics:** the phone vibrates when you take a hit, on phones that support it.

## Build status

The game lives in this repository as ES modules under `src/` with no build step (see `docs/architecture.md`). The current build is playable at [the hosted page](https://claude.ai/artifact/LXYYXmevA9zBdh1QhMqz9Z); the earlier single-file builds are kept under `prototypes/`, and the [v3 spiral prototype](https://claude.ai/artifact/W6v8bcEv2vdyb6o7u6Ea3V) is still up for comparison.

| Version | What changed |
| --- | --- |
| 5, characters and the running fight | Human warrior rig and a hunched giant Warden; the Warden fight moved into the wall: it hunts you over the last five flights while you climb |
| 4, repository | Split into modules; shallower ramp; camera pulled out; alternating step animation; moveset and entity registries ready for per-zone content; tests and a headless playthrough |
| 3, gritty pass | Warrior 1.5 times larger with a closer camera, detailed models, cracked stone textures, fog, grain, crawler duels, hazard icons, Warden danger markers, freeze-frames on hits |
| 2, spiral | Rebuilt in 3D: a spiral stair, a camera that circles with the warrior, background layers, roots to catch during the fall |
| 1, first try | Flat 2D portrait stair that zigzagged up a shaft, with the same core systems |

### What works in the build

Auto-climb with heavy steps. Gaps, beams, crawlers and spitters, with a five-flight tutorial. Block and parry. Lifts that stay repaired. A rest stop with upgrades, weapon swaps and the gold throw. The running Warden fight with two phases, breaches in the wall and a race to the top of its stretch. Falling with root grabs. The Pool with weapon choice and lift starts. All seven zones are reachable, with the boss reused.

### Tech

- One web page, three.js r128 (vendored), ES modules, no build step.
- A 2D layer on top draws the HUD, icons, timing rings and text.
- The full stair of about 945 steps is drawn as instanced blocks. All textures are generated in code, so the page has no image files yet.
- Progress saves on the device: best height, falls, lifts, beaten Wardens, gold, stashed gold and weapon choice. A reset button sits on the title screen.
- Tested in a headless browser (`npm run smoke`) and on a phone.

Tuning values are listed in `docs/tuning.md` and live in `src/config/tuning.js`.

## Idea ledger

Every idea raised so far, who raised it, and where it stands.

| Idea | From | Status |
| --- | --- | --- |
| Climb from the lowest depth of a forgotten shaft to the highest peak | Mark | Core idea |
| Simple controls, with deep variation over a long journey | Mark | Core idea |
| Inspired by Gandalf's fall and climb, with deep things even Sauron avoids | Mark | Origin |
| Roguelike: one constant layered tunnel fight, how far can you get | Mark | Built |
| Fail and you fall all the way back down | Mark | Built |
| Parts you repaired stay repaired | Mark | Built as lifts |
| Throw gear down to use later, with a chance it breaks | Mark | Built for gold; gear proposed |
| Different parts of the mine along the path | Mark | Built as 7 zones, tinted; unique content proposed |
| Roguelike upgrades that improve the further you have played | Mark | Proposed |
| Layers of difficulty and challenge as you go up | Mark | Built |
| On-rails climbing: jump and slash at set moments | Mark | Built |
| Chunky 3D, in the style of Bit.Trip Runner | Mark | Built |
| Dead Cells-simple controls: up and down to interact, jump, duck; A and B to attack and block | Mark | Built |
| Abilities with cooldowns that show up later | Mark | Proposed |
| Pit stops to spend accumulated gold | Mark | Built |
| Enemy spawns implied by each area's lore | Mark | Built for The Deep; rest proposed |
| Multiple scene layers, with things happening behind the stair | Mark | Built |
| Big emotive chunky steps | Mark | Built |
| Weapon options on the floor or at rest stops | Mark | Built |
| A full run without stops takes about 30 minutes | Mark | Target; build is shorter |
| Big cinematic boss fights: timed attacks, dodges, learning mechanics | Mark | Built, one Warden |
| A healing pool at the bottom that revives you and refills your flask | Mark | Built |
| Portrait phone layout | Mark | Built |
| A spiral climb with the camera circling the warrior and the background passing | Mark | Built |
| A bigger warrior, more grit, realism and detail | Mark | Built |
| Clearer reads on attacks | Mark | Built |
| Hidden things deep in the mine | Mark | Proposed |
| Fight the Wardens while walking, not on a fixed platform | Mark | Built as the running fight |
| The Warden is part of the backdrop, smashing through the layers to swipe at you while you climb | Mark | Built |
| The stair branches: go left or right, jump to other platforms | Mark | Proposed |
| A shallower ramp, less sharp an angle | Mark | Built (step rise 0.75 → 0.55) |
| Camera pulled out a little to see more scenery | Mark | Built |
| See and feel the warrior climb every step, precisely | Mark | Built in part: alternating legs; needs a feel pass on a phone |
| Good weapon animations, Dead Cells weight | Mark | Proposed |
| Height as the score, with a height meter | Claude | Built |
| The fall as gameplay: grab ledges or roots to save height | Claude | Built as roots |
| Seven named zones, The Deep through The Peak | Claude | Built as names and colors |
| Auto-climb, minecart rails, arena holds, pursuit, repair moments | Claude | Auto-climb and a simple repair built; rest proposed |
| A pursuer hunting you up the shaft, from the Gandalf chase | Claude | Proposed |
| The Pool is why the deep things live at the bottom | Claude | Proposed |
| Flask upgrades as meta-progression | Claude | Proposed |
| Ghost of your best run climbing beside you | Claude | Proposed |
| Dodge options: Down plus B, a double-tap dash, or a B hybrid | Claude | Open |
| Warden glimpsed in the background before you meet it | Claude | Built |
| Warden phases that change the arena | Claude | Proposed |
| Something in the background later drops into your lane | Claude | Built for the Wardens; smaller things proposed |
| Sync enemy attacks to the step rhythm | Claude | Proposed |
| Half your carried gold scatters on each fall | Claude | Built |
| Whetstone, iron heart and flask refills at rest stops | Claude | Built |
| Beating a Warden opens a permanent lift past it | Claude | Built |
| Phase 2 drops the button prompts | Claude | Built |
| Crawler duels, hazard icons, aim lines, Warden floor markers | Claude | Built |
| Five tutorial flights, one threat each | Claude | Built |
| Low-resolution pixel render with a sharp HUD | Claude | Built |
| Hidden halls and secrets off the main climb | Claude | Proposed |
| Per-zone Warden movesets and an entity registry in the code | Claude | Built as structure; content to come |
| Skip the boss for now; improve the enemy catalog and the obstacles | Mark | Built: Wardens parked, eight threats, Practice mode |
| Rockfall, swinging weight, burrower and flitter | Claude | Built |
| Practice a single threat from the title screen | Claude | Built |
| First-sight hints for each threat | Claude | Built |

## Open questions and roadmap

The core is proven. What's left is variety, unique Wardens, progression and pacing.

### Open questions

- [ ] Which dodge input: Down plus B, a double-tap dash, or the B parry-and-roll hybrid?
- [ ] Should the stair branch, with left-right choice and jumps between platforms? If so, does the auto-climb stay, or does the player steer?
- [ ] Now that Warden fights happen on the move, should the stair allow free left-right movement at all?
- [ ] Can players throw gear down the shaft, or only gold?
- [ ] What is the final title, and what replaces the placeholder "The Long Stair"?
- [ ] Who is the warrior, why is he at the bottom, and what waits at the Peak?
- [ ] Does a pursuer chase you up the shaft, and is it the same thing as the Wardens?
- [ ] How do zones get to the 30-minute run: longer zones, slower climbing, or more mode sections?
- [ ] Stay on the web for release, or move to an engine like Godot or Unity?

### Roadmap

1. **Feel pass on a phone:** camera speed and distance (now pulled out; confirm on device), ramp angle (now shallower), button sizes, freeze-frame strength, fall length, and the precision of the step animation so every step reads.
2. **Weapon animations:** a distinct swing per weapon with real weight, in the Dead Cells spirit.
3. **Threat catalog:** keep growing it per zone (shapes from the water, constructs from casting molds, spore pods), and tune each in Practice on a phone.
4. **Wardens, revisited:** bring them back from the switch once the catalog is solid, each with its own moveset.
5. **Zone identity:** each zone's spawns and hazards, from rising water to spore pods.
6. **Mode variety:** branching stair sections with left-right choice, minecart rails, arena holds, pursuit sections, real repair interactions.
7. **Progression:** height-based unlocks, flask upgrades, cooldown abilities, a ghost of your best run.
8. **Pacing to the 30-minute run:** zone length, speed, rest stop spacing.
9. **Story, art and audio:** the warrior's reason to climb, the Pool's secret, real sound and music.
