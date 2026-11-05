# 0006 — Park the Wardens; build out the threat catalog

**Context.** Two rounds of Warden fights (through the wall, then in the open cavern) still felt janky on a phone. The rest of the climb had only four threats, and those were boxes with simple tells.

**Decision.** The Warden fight goes behind a feature switch (`src/config/features.js`, off by default; `?wardens=1` locally or `#wardens` on the hosted page turns it on). With it off the whole shaft is open and the Warden's stretch is ordinary climbing. The effort goes into the threat catalog: the four existing threats rebuilt as real models with clearer tells, four new ones, a Practice mode for each, and tests that every threat is harmless when answered and harmful when ignored.

**Consequences.** All the Warden code, models and docs stay and keep compiling. When the Wardens return they can draw on the creature kit and the fairness rules built here. The zone pools now carry most of each zone's identity.
