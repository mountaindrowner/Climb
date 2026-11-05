# Wardens

Each zone ends with a cinematic Warden fight built on timing, dodging and learning its patterns. Code: `src/wardens/` with one moveset per Warden in `movesets/`.

**Shared rules (built).** Every attack is telegraphed. After each attack the Warden kneels and its core glows; A only damages it during the kneel (1.5 s in phase 1, 1.1 s in phase 2), otherwise it clangs. Phase 2 starts at half health: prompts and timing rings vanish, floor markers flash only in the last 0.42 s, 55% of turns are two-attack combos. Reward: 25 + 10 per zone gold, a permanent lift past it, the darkness above lifts.

**The template moveset (Warden of the Deep).**

| Attack | Tell | Answer | Marker | Damage |
| --- | --- | --- | --- | --- |
| Slam | Both arms rise overhead and the body lifts | ▲ jump as the shockwave reaches you | Red strip on the floor and a rolling shockwave | 2 |
| Sweep | One arm pulls back and the body twists | ▼ duck | Red band at head height | 1 |
| Spit | The mouth glows brighter | B to block; a parry reflects it for 3 | Aim line from mouth to you | 1 |

**Proposed.** A unique moveset per zone (see `docs/design/zones/`); 2 to 3 phases that change the arena; fights that happen while walking; a pursuer that hunts you up the shaft; background-to-foreground moments.

**Foreshadowing (built).** A giant silhouette climbs a parallel cavern behind the wall before you meet the Warden.
