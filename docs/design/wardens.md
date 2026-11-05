# Wardens

Each zone ends with its Warden, fought on the move. The Warden lives behind the wall and hunts you over the last five flights of the zone (flights 10 to 14) while you keep climbing. Code: `src/wardens/warden.js` (the fight), `src/wardens/visuals.js` (body, breaches, arm, head, markers), one moveset per Warden in `movesets/`.

**Shared rules (built).** Each attack is anchored a few steps up the stair from where you are. The wall cracks there, then the arm or head bursts through a breach. After the attack it is stuck for the opening (1.5 s in phase 1, 1.1 s in phase 2); A damages it only then and only while you are within reach of it, so you strike as you pass. Any other swing at it clangs. The climb slows to 55% while it winds up or is exposed so the tells read. Phase 2 at half health: prompts vanish, cracks glow only in the last 0.42 s, 55% of turns are combos. Reach the top of its stretch with it alive and it tears the stair out: you fall. Kill it and it collapses behind the wall; you keep climbing. Reward: 25 + 10 per zone gold, a permanent lift, the darkness above lifts. Breaches stay as scars.

**The template moveset (Warden of the Deep).**

| Attack | Tell | Answer | Marker | Damage |
| --- | --- | --- | --- | --- |
| Swipe | Cracks at head height ahead; the arm bursts through and sweeps the stair | ▼ duck | Red band at head height | 1 |
| Slam | Cracks higher up; the fist smashes down on the stair ahead; a shockwave rolls down at you | ▲ jump | Red strip down the steps and the shockwave | 2 |
| Spit | The head shoves through a breach above; the mouth glows | B to block; a parry reflects it for 3 | Aim line to you | 1 |

**Proposed.** A unique moveset per zone (see `docs/design/zones/`), each with its own way through the wall: the Drowned Warden floods a breach, the Forge Warden pours slag, the Broken Warden drops the ceiling. A pursuer that hunts you up the shaft. Smaller background-to-foreground moments between Wardens.

**Foreshadowing (built).** The silhouette climbing the cavern behind the wall all zone is the same creature. When its stretch begins it is simply closer.
