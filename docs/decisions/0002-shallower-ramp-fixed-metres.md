# 0002 — Shallower ramp, metres derived from geometry

**Context.** The v3 prototype's stair rose 0.75 units per step (about 37°), which read as too sharp. The height meter and all the design numbers are in in-game metres (135 m per zone).

**Decision.** Step rise is 0.55 (about 29°), and the metres-per-unit scale is derived from `ZONE_METERS / (ZF * FH)` so a zone is always 135 m whatever the ramp.

**Consequences.** The ramp can be tuned freely without touching the economy, the burst-chance formula or saved best heights. World-unit values (fall speed, camera offsets) are what change feel when the rise changes.
