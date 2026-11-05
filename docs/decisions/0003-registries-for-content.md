# 0003 — Content goes through registries

**Context.** The direction calls for seven zones with their own spawns, seven Wardens with their own movesets, and several extra modes. Growing that inside switch statements would make every addition a cross-cutting edit.

**Decision.** Zones, threats, Warden movesets and modes are each a registry of modules with a small interface (`build / update / draw / hud` for threats; `attacks / pick` for movesets; `update` for modes).

**Consequences.** A new enemy is one file and one registry line. Tests can list the registered types. The cost is a little indirection when reading the climb loop.
