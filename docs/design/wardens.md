# Wardens

Each zone ends with its Warden, fought on the move. Along the last five flights of the zone (10 to 14) the wall has collapsed, and the Warden climbs the rubble beside the stair in the open, keeping pace while you climb and reaching across with its own arms. Code: `src/wardens/warden.js` (the fight), `src/wardens/visuals.js` (body, arm aiming, markers), `src/world/cavern.js` (the collapsed sections), one moveset per Warden in `movesets/`.

**Shared rules (built).** Each attack is anchored a few steps up the stair from where you are; the Warden plants itself there. Its arms are aimed at the stair with two-bone inverse kinematics and eased between poses. After the attack its fist rests on the stair for the opening (1.5 s in phase 1, 1.1 s in phase 2); A damages it only then and only while you are within reach of it, so you strike as you pass. Any other swing at it clangs. The climb blends down to 55% while it winds up or is exposed so the tells read. Phase 2 at half health: prompts vanish, markers show only in the last 0.42 s, 55% of turns are combos. Reach the top of its stretch with it alive and it tears the stair out: you fall. Kill it and it sinks into the rubble; you keep climbing. Reward: 25 + 10 per zone gold, a permanent lift, the darkness above lifts.

**The template moveset (Warden of the Deep).**

| Attack | Tell | Answer | Marker | Damage |
| --- | --- | --- | --- | --- |
| Swipe | The arm draws back and up as it twists away, then sweeps across the stair at head height | ▼ duck | Red band at head height | 1 |
| Slam | Both fists rise and it rears back; the near fist hammers the step ahead; a shockwave rolls down at you | ▲ jump | Red strip down the steps and the shockwave | 2 |
| Spit | It leans in and braces; the mouth glows | B to block; a parry reflects it for 3 | Aim line to you | 1 |

**Proposed.** A unique moveset per zone (see `docs/design/zones/`), each with its own use of the open cavern: the Drowned Warden wades through flooded rubble, the Forge Warden hurls slag, the Broken Warden brings the ceiling down. A pursuer that hunts you up the shaft. Smaller background-to-foreground moments between Wardens.

**Foreshadowing (built).** The silhouette climbing the cavern behind the wall all zone is the same creature. When the wall falls away at its stretch, there it is.
