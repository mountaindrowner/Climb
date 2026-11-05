# Enemies and hazards

Every threat has one clear answer and a visible tell that comes before it. Code: `src/entities/`, registered in `registry.js`.

| Threat | Answer | Tell | Damage | Status |
| --- | --- | --- | --- | --- |
| Broken step | ▲ jump | Pulsing ▲ icon and a glowing edge about 4 steps out | 1, plus a stumble | Built |
| Fallen beam | ▼ duck | ▼ icon, the beam flickers as you approach | 1 | Built |
| Crawler | A before it lunges, or B to block and then A | Wall crack glows, it emerges, rears up with red eyes and a red "!", lunges after 0.5 s | 1 | Built |
| Spitter | B to block; a parry reflects the orb and kills it | "!" and an aim line while it charges; orb trail; shrinking timing ring | 1 | Built |

**Readability rules.** A hazard icon appears about 4 steps ahead. The climb slows to a quarter while a crawler duels you. Every hit, parry and hurt has a freeze-frame and shake. The first five flights teach one threat each.

**Scaling.** Crawlers take 2 hits from zone 3. Spitters appear more after zone 1. Zone pools are in each `src/zones/*.js`.

**Designing a new threat.** Name the tell, the answer (one of the four buttons), the damage, the gold, and the zone whose feature it comes out of. Then it is one module with `build / update / draw / hud` and a registry line.
