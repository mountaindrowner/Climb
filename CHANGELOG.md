# Changelog

## 0.18.0 — forks: the high road (2026-11-06)

- Milestone 2 begins. Every zone has a fork: from landing 9 a second stair, the high road, climbs off the other way round the shaft, cut into the wall behind the main stair, and rejoins the main stair at landing 14 (13 where 14 would be too steep). It is shorter and steeper than the main route and skips the zone's lift and rest stop: a shortcut, at a price still to come (milestone 3 puts its own threats and rewards on it).
- Take it by holding left and jumping from the fork landing: he hops across onto its first step. An icon marks the step; a hint explains it the first time. Climb it by holding left (it winds the other way); walk off its top onto the landing it rejoins, or back off its foot onto the fork landing.
- Under the hood, positions on a high road live in their own range of path distance, so anything on one route is simply far from anything on the other; every system that turns a position into the world (the warrior, the camera, foot IK, the blade, dust) asks the path for the route's angle and radius. The shaft wall is carved open along each high road (and drawn finer, so the cut is clean), with a rough face of rock behind it.
- Tests: every high road starts at its fork landing and ends at the landing it rejoins (height and angle), climbs no steeper than the steepest main flight, and the smoke run takes one end to end.
- Crawlers have bodies: standing up, you cannot run through one (roll or jump over instead), so walking into one stops you and it bites. Flitters lead their dive to where your head will be. Before this, a player who simply kept running could not be hurt by either: the smoke test's "every threat hurts when ignored" check had been passing only because it also counted the practice run ending as a hit. It now counts real damage only, which also showed that a sprinting player glided over broken steps (the landing snapped him up onto the next step from well below it); now, sunk more than about half a step into a hole, the riser stops him and he falls.

## 0.17.0 — milestone 1, the foundation (2026-11-06)

- **Variable grade.** Every flight has its own rise per step: mostly gentle ramps (0.3 to 0.45), two steep flights (0.75), two at 0.6 and two flat galleries per zone, the pattern rotated zone to zone so no two climb alike. Every zone is the same height, so the metre count stays 135 per zone. Heights come from a per-flight table (`flightY`, `landingY`, `riseOf`, `kAtY` in `src/world/path.js`) instead of a fixed flight height. Broken steps and swinging weights only go on flights of 0.6 or gentler (a full jump must clear a hole uphill; a swing's uphill arc must pass over a crouch).
- **Feet on the steps.** Foot IK for the knight: each foot is lifted or lowered by how far the step under it sits from the ground the body stands on, the hips ride the lower foot's step, and thigh and shin are re-solved as a two-bone chain in the body's own frame, soles kept flat. A foot rises onto a step at once and eases down, so it never sinks into stone. Measured across a steep step: worst foot −0.64 inside the stone without it, 0.00 with it.
- **Swings respect stone.** A cut that would bury the blade in the steps ahead (forward-down swings on steep flights) lifts the sword arm about the shoulder just enough to keep the tip on the surface, and the blade sparks off it with a clang.
- **The clipping test.** The smoke bot measures each sole against the step under it on every grounded frame of play, and the blade's tip against the stone during swings; a foot more than 0.1 inside a step, or a blade more than 0.05 into stone, fails the build. Its first run found both: feet sinking while walking with the shield up (the IK was building on itself in held poses, because the mixer skips writing values that did not change; the clip's own values are now restored before every update) and blades cutting into steep stairs (now deflected).
- **Camera v2.** Explore framing leads the way he faces, pulls out on gentle grades and galleries, pushes in on steep flights and looks up (or down) the slope; combat framing shifts to take in the awake creatures near him and pulls out as more join; kills and parries punch it in. All blended slowly.

## 0.16.0 — PC controls (2026-11-06)

- Gamepad support (standard mapping; Xbox and PlayStation pads): left stick and d-pad move and crouch, A/✕ jump, X/□ and RT/R2 attack, LB/LT block, B/○ and RB roll, Y/△ flask, Start pauses. Rumble on hits and hit-stop.
- Rebinding: every action's keys and pad buttons, under Controls (from the title or the pause menu); stored apart from the save. Keys are bound by position, so they sit in the same place on any layout.
- Prompts match the device in your hands: text names actions as tokens and renders them as your key, the Xbox or PlayStation button, or the touch glyph; hints, hazard icons, timing rings, the practice list and the title's help all follow it and switch the moment you pick up another device.
- Pause (Esc / Start; also when the window loses focus) with Resume, Settings, Controls and Leave the climb. Settings: pixels (540 / 720 / 1080 lines), volume, screen shake, pad rumble.
- Every menu works without a mouse: ↑ ↓ / d-pad to move, Enter / Ⓐ to pick, Esc / Ⓑ to go back, ← → on sliders.
- Fixed: menus focused the first choice in the page rather than the main one (the Pool focused a weapon, so Enter re-picked it instead of starting the climb); picking a weapon now keeps focus on it.
- Tests: prompts render for every action on every device, every token in the game's text is an action, the default bindings never share an input.

## 0.15.0 — landscape, PC first (2026-11-06)

- Landscape everywhere, PC (1920×1080) the main target (decision 0008). The page fills the window; the HUD sits in the corners; the touch pad shows only on touch screens, over the bottom corners, its buttons sized from the space so all four fit; a phone held upright is asked to turn.
- A bigger world for a camera pulled well back: the shaft grows from radius 7 to 11 (wall and cavern tiling scale with it, so bricks keep their size), one turn of the spiral is about seven flights, and the climb camera sits about 17.5 units from the warrior (was about 10) with a 50° field of view, thinner fog and a 720-line internal render. Small screens bring the camera in.
- Chains in the open centre hide when they would cross between the camera and the warrior; the torch and rim light are stronger so he lifts off the wall at the new distance.
- Tools: the smoke test runs landscape (1280×720) and its bot reads the real shaft radius (its spitter answer had 7 built in); the art review frames by the radius and the game's own climb camera.

## 0.14.0 — cloth (2026-11-06)

- The knight's cape is real cloth: `src/entities/player/cloth.js`, a small Verlet cloth (7 x 9 particles; structural, shear and bend constraints; four solver passes at 90 Hz) simulated in world space, pinned across the shoulders on the chest bone, with gravity, air drag, a little turbulence and a ragged hem. It is kept behind the body's back plane and pushed out of capsules around the torso, thighs and shins, so it trails a run, streams up in a fall, wraps a roll and drapes over a crouched back without passing through him. The rigid cape is measured for size and placement, then hidden.
- Resets itself on teleports (catching a root, the Pool) and when switching warriors.

## 0.13.2 — the knight, leaner and built (2026-11-06)

- A V-taper: the waist pulled in on the body mesh around the belt, a broader and deeper chest, thicker upper arms, longer legs, a smaller head; taller again in game (1.9 units).
- More detail: cloth wraps along the forearms and shins and a scarf wound over the collar (rigid pieces on their bones, sized from the body's typical girth so they hug it without cutting in), a pouch on the far hip. All battered and grimed with the rest.
- A hunched, knees-bent ready stance. The crouch is deeper again to stay under the beams.
- The studio sheets apply the same armour lift as the game.

## 0.13.1 — the knight, worn down (2026-11-06)

- Taller and less toy-like: a smaller head, longer and leaner limbs, a chest that tapers to the waist and narrower hips (about five and a half heads tall), and a head taller in game.
- Beaten up: dented, hammered metal (position-hashed so seams never crack), the helmet's crest knocked off flush with a dent in the brow, the cape torn short with a ragged hem, a chipped shield and blade.
- Grimy: the pack's palette dulled (dark iron for steel, dried oxblood for the reds, old leather for the gold), and grime baked as vertex colour: uneven dirt, mud caked up from the boots, rust patches, darker undersides, a filthy hem.
- A tired guard: sword low, shield hanging, shoulders and head down. The crouch is deeper to stay under the beams at the new height.

## 0.13.0 — the knight (2026-11-06)

- A new default warrior: the CC0 KayKit knight, rebuilt in headless Blender by `tools/blender/knight_kaykit.py`. Re-proportioned from chibi (two heads tall) to heroic (about four): a smaller head, longer legs, arms and trunk, posed and baked into a new rest pose so the pack's clips carry over. The cartoon face became a dark visor with two cold eye-slits. Our three weapons: the pack's sword (scaled to the new frame), its one-handed axe as the war pick, and a spear built in the script.
- `tools/blender/posekit.py`: pose authoring for headless Blender (aim bones at directions, point a held blade, plant feet with two-bone IK, key poses into actions). With it, clips authored for the side-on camera: the four swings as arcs the camera can see (a forward cut, a rising backhand, an overhead chop, a thrust), a guard stance, crouch and crouch walk, the roll's tuck, a high block, and the jump clips with the sword carried upright.
- Facing down the stair, GLB rigs are mirrored like a 2D sprite flip, so the sword arm stays on the camera's side.
- The blade trail is now swept by the real blade (hilt to tip) over the last frames of a strike, for any rig, instead of a fixed arc.
- Title toggle cycles Knight → Blender warrior → hand-built. The hosted build ships both models as embedded-JSON glTF.
- Art review tools: `tools/rig-review.mjs` (every move mid-motion in game, close and at gameplay distance, contact sheets) and `tools/rig-studio.mjs` (turnaround, face close-up and clip filmstrips outside the game).
- Fixed: changing weapon during a combo crashed the frame loop (the swing index ran past the new weapon's combo).

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
