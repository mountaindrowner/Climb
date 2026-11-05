# Changelog

## 0.12.0 — the Blender warrior (2026-11-06)

- Proof of concept for Claude-made models and animation: the warrior is built and animated in headless Blender (the official `bpy` package) by `tools/blender/warrior.py` and exported to glTF. Shaped low-poly parts in the same proportions (lathed helmet with nose guard and cheek guards, beard, layered pauldrons, curved banded shield, three-part cape, hip lantern, three weapons), baked vertex colour with cheap occlusion, and 14 keyframed clips.
- The game loads it with the vendored r128 glTF loader and plays the clips frame-locked to gameplay (swing phase, stride, roll progress), cross-fading quickly; cape and squash-and-stretch layer on in code.
- Title screen toggle between the Blender warrior and the hand-built one.
- Fixed: the hidden rig kept a fall's spin under the other rig; the smoke test checks whichever rig is drawn.
- Concept v2 and the lore landed earlier today (see 0.11.x notes in git).

## 0.11.0 — you move him (2026-11-06)

- Free movement along the stair, Dead Cells-tight: instant acceleration and turning, full air control, variable jump height with heavier fall gravity and a minimum hop, coyote time, a jump buffer, a step-up assist, crouch-walking.
- New verbs: an invulnerable Roll (0.4 s, 0.37 s cooldown) that cancels attacks; a held shield with a parry window; weapon combos with wind-up, active frames and recovery, lunges, buffering and recovery cancels; knockback and a flinch when hit.
- A stick and four buttons on the phone (Block and Roll over Attack and Jump); keyboard A/D, Space, S, J, K, L, F.
- New animation: a running stride, tucked jump and fall, crouch-walk, a full roll, three swing poses per weapon with an overshooting strike and a smear arc, a flinch, landing squash, cape trailing the motion.
- Camera leads the way he faces and follows the stair rather than every hop.
- Threats reworked for a player who can stop: broken steps leave real holes; beams are low ceilings; rockfall and the swinging weight trigger as you would arrive; the swinging weight keeps swinging; crawlers chase, commit and recover; spitters fire straight and keep firing; burrowers wait with open jaws and can be killed; flitters commit, circle and dive again.
- The test bot plays through the real controls. Tests for the movement tuning.

## 0.10.0 — the threat catalog (2026-11-06)

- Fixed: after catching a root (or waking in the Pool) the warrior kept the fall's spin and came back tumbled or upside down.
- The Warden fight is parked behind a feature switch; the whole shaft is open climbing. `?wardens=1` or `#wardens` brings it back.
- Rebuilt the four threats as real models with clearer tells: the broken step crumbles into the shaft, the beam is a splintered timber wedged diagonally across the stair, the crawler skitters on six jointed legs with mandibles, the spitter is a swelling sac on spindly legs.
- Four new threats: rockfall (shield overhead), swinging weight (duck), burrower (jump) and flitter (swat or block), each timed to the warrior's arrival.
- Creatures carry a faint outline in the zone's glow so they read on dark stone.
- Practice mode on the title screen: nine flights of any single threat, nothing saved.
- First-sight hints the first time you meet each threat; seen threats are saved.
- Every zone draws from the catalog with its own weights.
- The smoke test's bot now runs every frame in the page and plays a Practice run of every threat: no hits when answering correctly, and each must hurt when ignored. Tests check the catalog matches the code.

## 0.9.0 — the open cavern (2026-11-05)

- From the first phone playtest: the Warden no longer punches through the wall. Along its stretch the wall has collapsed (ragged vertex-alpha cut) and a rubble cavern is built behind the stair; the golem climbs it in the open beside you.
- Its attacks are its own arms, aimed at the stair with two-bone inverse kinematics and eased between poses; the swipe draws back and sweeps, the slam rears both fists up and hammers the step, the spit leans in. The opening is its fist resting on the stair.
- Camera turns the shortest way round, so catching a root one turn down no longer spins it.
- The Warden's slow-down blends instead of snapping.
- Rubble is darker than the Warden's stone so the golem reads; the body climbs closer to the stair.

## 0.8.0 — the golem (2026-11-05)

- The Warden is a golem of broken stone. New rock kit (`src/render/rocks.js`): displaced low-poly boulders with flat shading and per-face brightness, seeded so every Warden's rocks fall differently. Every body part is a cluster of boulders: layered plates down the back, knuckle clusters for fists, a brow slab and jutting jaw, lichen, crystal shards along the spine and crown, glowing cracks between the rocks, and eyes that are hot crystals set in near-black sockets under the brow. The arm and head that come through the wall are built from the same kit; breach rubble too.
- Camera pulled out again (climb back −2.3 → −3.4, fight −3.6 → −4.6), slightly wider field of view, stage up to 600 px wide.
- Studio shots in `tools/portrait.mjs`: the Warden on its own for two zones, plus the arm and head props.

## 0.7.0 — the running Warden fight (2026-11-05)

- The Warden fight is no longer a stop on a platform. The Warden hunts from behind the wall over the last five flights of its zone while you keep climbing, breaking through to swipe (duck), slam (jump the shockwave rolling down the steps) and spit (block or parry). The stuck arm or head in the breach is the opening; you hit it as you pass.
- Reach the top of its stretch with it alive and it tears the stair out from under you. Kill it and it collapses behind the wall with no menu; the lift and the open stair follow.
- Breaches stay as scars on the wall. The silhouette behind the wall is hidden while the real body looms there.
- Landmarks per zone: lift on flight 5, rest stop on flight 8, the Warden's stretch over flights 10 to 14. The arena platforms are gone.
- Fight camera: the climb camera pulls out and up so the wall and the breach are in frame.
- Smoke bot and portrait tool updated for the new fight; layout and path tests cover the stretch.

## 0.6.0 — character pass (2026-11-05)

- The warrior is a jointed human rig: hips, knees, shoulders, elbows, neck, about 7.5 heads tall with long limbs, a beard, nose-guard helmet, three-segment cape, shield on the forearm, weapon in the hand. The climb is a real step cycle (high knee, plant on the thud, push-off, counter-swinging arms, a lean into the stair), with an overhead chop, a raised-shield block, a crouch and a flailing fall.
- The Warden is a hunched stone giant on bent legs with long arms down to its knuckles, a forward-thrust head under a heavy brow, plates down a bent spine with the core burning in the chest gap, crystal shards along its back, and its own eye light. Poses for slam, sweep, spit and the kneel are rebuilt on the new joints.
- Standard materials with modest metalness on mail and steel; a rim light in the zone's glow behind the warrior; the Warden lights its own face.
- The fight camera sits further back. The beam hazard is raised to the taller warrior's head height.
- `tools/portrait.mjs` writes close-up review shots of both characters in their key poses.

## 0.5.0 — structure for a big game (2026-11-05)

- One module per zone in `src/zones/` (palette, threat pool, Warden), plus the tutorial table; `config/zones.js` re-exports.
- Pure seeded flight layout in `src/world/layout.js`, separated from mesh building and covered by tests.
- Modes registry (`src/modes/registry.js`); title and pool are modes like the rest.
- Overlay split into `src/ui/overlay.js` and one screen per file under `src/ui/screens/`.
- Versioned save in `src/save/` with migrations; saves from the v3 prototype and 0.4.0 carry over.
- `tools/pacing.mjs` pacing calculator; `npm run pacing`.
- Tests for layout determinism, economy and migrations (19 total); the smoke test also checks save migration.
- Docs: per-topic design docs, one note per zone, process (conventions, playtest, release), decision records, issue and PR templates, CONTRIBUTING.
- Asset folders laid out per zone and per model family.

## 0.4.0 — repository structure (2026-11-04)

- Split the single-file spiral prototype into ES modules under `src/` (no build step; three.js is vendored).
- Shallower ramp: step rise 0.75 → 0.55 world units. In-game metres per zone stay at 135 (MPU is now derived).
- Camera pulled out on the climb (`TUNE.camera.climb.back` −0.9 → −2.3, slightly higher) to show more of the shaft.
- Legs now alternate per step, with the lead foot lifting onto the next step, so every step reads.
- Zone 6 placeholder name "The Endless Stair" replaced with "The Long Stair" pending a final name.
- Wardens read their attack set from a moveset module (`src/wardens/movesets/`), ready for a unique Warden per zone.
- Enemies and hazards register in `src/entities/registry.js` with build / update / draw / hud hooks.
- Added: dev server, headless smoke playthrough, path unit tests, CI workflow, design docs.

## 0.3.0 — gritty pass (prototype v3)

Warrior 1.5× larger with a closer camera, detailed models, cracked stone textures, fog, grain, crawler duels, hazard icons, Warden danger markers, freeze-frames on hits.

## 0.2.0 — spiral

Rebuilt in 3D: a spiral stair, a camera that circles with the warrior, background layers, roots to catch during the fall.

## 0.1.0 — first try

Flat 2D portrait stair that zigzagged up a shaft, with the same core systems.
