# 0005 — The Warden fights in the open, not through the wall

**Context.** The first running fight (0004) had the Warden punching through a solid wall, with its arm and head appearing from breaches. Played on a phone it was janky: limbs popped in and out of holes, the camera spun after a root grab, and the climb speed snapped. The direction from playtest: remove the wall, make the section crumbled, keep ascending.

**Decision.** Along each Warden's stretch the wall is gone (vertex alpha on the wall cylinder, ragged at the edges) and a rubble cavern is built behind the stair. The Warden is a full body climbing that rubble beside you, and its attacks are its own arms, aimed at the stair with two-bone inverse kinematics and eased between poses. The camera turns the shortest way, and the fight slow-down blends.

**Consequences.** No breach props, no scars; one golem model does everything, so per-zone Wardens are a model and a moveset. The collapsed sections are permanent scenery, visible from below as you approach and after the Warden is beaten. The cavern floor is where later zone features (water, slag, spores) can live.
