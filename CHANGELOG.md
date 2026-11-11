# Changelog

## Side view (branch `claude/climb-2d`, unreleased)

**The ledge climb, set on the ledge (latest).** The climb's drawing was placed by where it ends, so he stood in the air beside a ledge and then crouched onto it. Now each frame is pinned to the ledge's corner (`CLIMB` in `main.js`): his hands hold the lip while he hangs, his arm comes over it as he hauls, his feet land on it. He comes into the climb at the frame that fits how far under the ledge he caught it: a full hang from far below, a quick scramble from just under; the climb lasts 0.18 to 0.45 s to match. He is drawn two pixels lower, so his boots stand in the floor's lit lip rather than on its outline.

**The Warden whole, the Cloister, the Spires.** The Warden is a full character now, built the way its arms were: a chest with a crystal core, neck, waist, a helmed head with a jaw that drops when it roars, boulder shoulders and crystals on its back, each a flat piece moved in code (it breathes, watches him, lifts a shoulder with its arm, reels when cut, falls apart when it dies). The slabs are painted by `tools/warden-parts.py` to match the arms; the old single torso picture is gone. Two regions above the Roots: the Cloister (a ruined monastery, eight rooms, a three-screen bell tower, two routes) and the Spires (open sky, snow, a rope bridge, the summit). Each has its own stone, decoration, back wall, far painting and weather. The way out of a region leads into the next; buttons under the room's name jump to any region; `?level=2|3` starts there. The reach test and the real-motor test run on all three.

**Dash, dust and weight.** Attack during a roll: the dash cut, driven forward with afterimages and streaks, striking all along the dash. Every cut flashes a swoosh, bends the screen round the blow, kicks dust and thumps (a new layered swing sound); finishers more so, with a nudge of the view. Pixel dust on runs, jumps, landings, rolls and skids. A forward roll (the last one rolled backwards), a drawn somersault for the double jump, a landing, and a ledge climb placed to match the climb's motion. `tools/record-clip.mjs` records play frame by frame as GIFs.

**The heavy blade (latest).** The masked warrior's combo is three full-body cuts (an overhead chop, an overhead slam, a spinning cut) and crouch + attack is a rising cut; each cut lands on its drawing's impact frame. A full-body combat roll. The recipe for animations that move the whole body is in docs/side.md.

**The masked warrior (latest).** The hero is option C, redrawn tall and lean with gothic-action proportions (~2.6 units drawn, a 2.4 body) and the full moveset; jumps and run scale with him; the level keeps more head room and the opening over the tunnel stair is wider. A new test plays the whole region with the real motor in node and finds no unreachable room and no trap.

**Stylized flat pixels (latest).** Half the pixels again (180 tall, the warrior ~28), one 32-colour palette for everything, the level painted by rules instead of textures, a new 32-pixel hero (four options, `?hero=a..d`) and creatures, animated from skeleton templates so they keep their look. Three traps fixed that you could fall into and not climb out of (beside the tunnel stair, beside the ascent's stair, the grotto basin); the level test now also checks there are none.

The Climb as a 2.5D side-scrolling metroidvania (`side.html`, docs/side.md): a flat plane that climbs up through shafts and tunnels, with HD pixel art from PixelLab and a bright, glowing look.

- **Movement v2 on tiles**: the same tuning, input queue and feel panel as the climb, plus walls, ceilings, one-way ledges (down + jump drops through), steps taken in stride, low tunnels, spikes and the ledge grab.
- **The warrior**, drawn by PixelLab: stand, idle, run, jump, fall, roll, three cuts, the plunge, hurt.
- **The first region**: twelve rooms with two routes up, from the start through the corridor, shaft and tunnel, by the gallery or across the bridge, up the two-screen well to the arena. A **shrine** in the grotto fills the flask and is where he wakes. A **map** in the corner fills in room by room.
- **Creatures**: crawler, flitter, spitter and burrower, each with a tell (a red ! over it).
- **The Warden**: a stone titan at the back of the arena whose arms reach out of the depth onto the stage. It slams, sweeps, ripples the stage and brings the roof down; cut its fists while they rest. The way up opens when it falls.
- **The look**: rendered pixel-exact and scaled up whole; a narrow perspective camera so the rock has depth and the painted cavern slides past slower; cave tiles on the dual grid, darkening into the rock; torches, crystals and light shafts, drifting motes, bloom.

## 0.28.0 — Movement v2: Dead Cells' controls (2026-11-09)

From the designer's research on Dead Cells' movement, checked against its developer's own sources: his GDC 2019 talk, and his MIT-licensed game-feel demo (`deepnight/gamefeel`), read line by line. Their exact numbers are not public; ours are tuned to the warrior's size. Decision 0010.

- **Fast from the first step.** Full speed (5.5, up from 3.8) in under a tenth of a second, stopping on a coin with a hair of skid. **No sprint**: he always runs fast, as in Dead Cells. Shift rolls now.
- **The double jump**, from the start, with a quick somersault. Pressed just before landing it is the next ground jump instead, not a wasted double jump.
- **The jump pops, then floats.** Gravity is light at take-off and eases back in over a tenth of a second (longer for the double jump), the way the developer's demo does it. A held jump still rises 1.55; let go early to cut it short.
- **Air control** is a touch stronger than on the ground at first, and fades over a long fall.
- **No press is lost.** Every press waits a moment until it can happen: an attack pressed in the last of a roll comes out of it, a roll pressed as a stun wears off happens.
- **The roll cancels anything**, a swing's strike included. In its last 45% an attack or a jump comes straight out of it. It is a little faster (7.0) to stay ahead of the run.
- **Free turning and a little aim in a fight.** Turn early in a swing's wind-up, or any time in its recovery; with no direction held, a swing turns to a foe just behind you.
- **The plunge.** In the air, hold crouch and attack: straight down, a slam that hits both sides on landing, and a beat planted. It soaks a little of a fall.
- **Heavy landings only from real drops** (dust, a jolt, half your speed); short ones cost nothing.
- **Platforming re-tuned for the double jump:** wider gaps and higher ledges across the broken-off flights, bigger steps in the switchbacks. First-time hints teach the double jump (before the first broken-off flight) and the plunge.
- **The feel panel:** F9 (or `#feel` on the page) switches each assist on and off while you play (the input queue, buffer, coyote time, double jump, launch float, air-control fade, ledge grab, free turn, aim, roll cancels, plunge), to feel what each one does.
- The Mark of the Fleet now quickens the run (there is no sprint).
- **The roll and the somersault, made properly** (after the designer saw them spin wildly): one turn the way he faces (going left he used to tumble backward), about the middle of his tucked body, measured from his own bones each frame, instead of a wheel about a point off his body; the tuck comes first and the turn waits for it; a roll goes along the floor, the tucked body lowered onto the stone; the blade is put away through the middle of the turn (as in Dead Cells, where a weapon shows only in its swing) and the cape lies down his back instead of whipping round.
- **Threats re-timed for the faster run**, which outran three of them: a broken step starts to fall away from further off (2.0), a burrower wakes sooner and ploughs faster, and a spitter sees him from further off and aims where his head will be as the glob arrives (the lead refined, so it hits a runner at full speed).

## 0.27.0 — the Warden in the cavern (2026-11-08)

- **The stair ends, and the mountain opens.** At the top of every region the last flight is a broad floor of stone, about eleven and a half paces long, ending in a sheer edge where the steps above have fallen away. Behind it the wall of the shaft is gone: a cavern opens, vast and dark, with spires rising out of its depths and hanging from its roof. Every region keeps its height: the floor's rise moved to the region's other flat flight.
- **The colossus.** A golem of stone, the designer's own model from Tripo, stands in the depths of that cavern: forty units tall, twenty times the warrior, his torso rising above the floor and his eyes on it. You see him looming over the last flights of the climb to it. Step onto the floor and the stair behind you comes down in a heap of rubble: there is no way on but through him.
- **His arms reach to the floor.** He never comes onto it: his arms do, reached every frame by inverse kinematics, so each blow lands exactly where it is aimed.
  - **The slam:** a fist rises high over you and its shadow grows on the floor, following you, then holding still. It comes down there: run or roll out from under it. Then the fist rests on the floor a long moment. That is the opening: strike it.
  - **The sweep:** a hand comes in low at one end of the floor and sweeps across it at chest height. Crouch under it, or roll.
  - Strike his fists enough and **he reels**: he catches himself on both hands and his head comes down to rest on the floor's edge. Every blow to it counts double.
  - **At half strength** he roars and beats his chest, and stops warning you: the prompts go, the wind-ups shorten, both fists come down one after the other, each slam sends a shockwave along the floor (jump it), and rocks come down from the roof where dust trickles first.
  - A red **!** marks each fist as it winds up, and in the first phase the answer closes in as a timing ring over you.
- **Beaten**, he topples back into the dark, the rubble behind clears, and the first flight of the region above rises into place from below. He leaves gold and wellstone. The win is kept: he does not stand there again, and a lift from the Pool runs past him. He is stronger, with shorter wind-ups, in each region above.
- The camera holds the floor and him together, its view opened out so his head and the floor are both in frame, and the haze thins so the cavern's far side reads.
- His body clips are authored in Blender (`tools/blender/golem_tripo.py`): looming, leaning in to reach, reeling, a flinch, and the fall; his two Tripo clips are the roar and the chest-beating taunt.
- Nothing else stands on the floor: no threats or gold, ledges, oath stones or halls, and no switchback comes up past it. One region's hidden hall moved to a fallback landing.
- The test bot fights him on every full test climb (a shorter Warden in the fast run) and has to win to reach the second region.
- **Cuts that clear the stone.** The two downward cuts follow through a little higher. The longer lunges of 0.26.2 had the tip touching the steps ahead on a climbing flight.

## 0.26.2 — reaching cuts (2026-11-08)

- **The guard holds the sword out.** At rest the sword arm is out in front of him, the blade angled up ahead and the off fist forward, instead of both hands tucked against his chest. The guard is one-handed now: on a two-handed grip his short arms pulled the sword back in to his body.
- **Cuts that lunge.** At the strike his sword arm goes out nearly straight and his body follows it in a long stride: the front foot well forward, the hips driven after it, the off arm flung back for balance. His back stays fairly upright, so the blade cuts at chest height. The three cuts carry him further (0.65, 0.65 and 0.95, from 0.45, 0.45 and 0.7).
- **No lunge at a wall.** At a cracked wall or a fork's rubble his cuts stay where he stands; the longer lunges carried him off the wall he was breaking.

## 0.26.1 — swings with weight (2026-11-08)

- **The whole body swings.** Each cut winds up with the shoulders turned back, a lean back and the weight sunk onto the back leg; the cut steps through with the front foot, drives the hips forward and twists the torso into it. The finisher coils deep and low, then rises up onto the cut.
- **Slower swings.** The sword's three cuts take about twice as long: wind-ups 0.15, 0.18 and 0.32 s (they were 0.085 to 0.17), strikes 0.11 to 0.14 s, recoveries 0.3 to 0.46 s; the lunges are a little longer to carry the step. The flitter's timing ring now closes at the moment to press, a wind-up ahead of its bite.

## 0.26.0 — platforming, and the playtest notes (2026-11-07)

From the designer's playtest of 0.25.

- **Platforming on the stair's own lane.** Stone ledges stand on the stair's own lane, one-way like any side-scroller's: land on them from above, jump up through them from below. Jump at a ledge and he **catches its edge and hauls himself up** (it reaches 2 above his feet, and works from just under an edge too), so a ledge can hang high enough to walk under and still be reached.
- **Platforming flights.** On a flight or two of every region, drawn fresh each climb, the stair is gone: cross on ledges from one landing to the next, some of them cracked and crumbling a moment after you land.
- **Forks are switchbacks now.** At a fork landing a ledge hangs overhead (a jump prompt marks it). Jump, catch it, and climb a run of ledges back the other way, over the stair you came up, to come up through a broken gap in the stair a turn above, about four flights on. No more hold-right-and-jump, and nothing behind the wall: the spur and the high road are gone. Closed forks still lie in rubble; the ram clears it and the switchback stands again.
- **Falls cost.** Miss a jump or drop through a hole and you fall to whatever is below: the ledges under you, or the stair a whole turn down. The landing hurts by the height: nothing for a short drop, 1 past 3.6, 2 for a full turn. Death is still the fall to the Pool. Practice runs keep the old step back so you can drill a threat.
- **Stairs in proportion.** Each unit of stair is now two half-height steps, a riser about a tenth of his height like real stairs (they were up to a third). On the steepest flight his head bobs half as much around the stair's slope, and its sharpest jolt is a fifth of what it was. Broad steps are the old whole-unit ones, on gentle flights only.
- **The sword combo, in front of him.** A cut down from high on his right; reset high and down again; then the finisher, rising from low on his left to high on his right. All in the plane the camera sees; the hit flash's streaks follow.
- **Less text in the way.** Floating words rise from above the action instead of on it, smaller, and stack when several come at once. Treasure says less: one line in the hall's chest, short toasts for blueprints and the ram.
- **Fewer oath stones**: one a region.
- The camera follows him on ledges and through falls instead of the stair's slope line. Threats on the stair below leave him alone on a ledge above (beams, the burrower).
- Tests: every switchback's ledges can be reached in turn and clear the stair below and above, and its last ledge waits under its gap; every platforming flight can be crossed; the climb's decks keep away from forks and build nothing for practice. The smoke run catches a switchback's ledge, comes up through its gap, falls a turn, and has the bot cross a platforming flight.

## 0.25.0 — the run (2026-11-07)

Milestone 5, the Dead Cells layer, named from the lore: every climb leaves something, and every climb from the bottom grows as it goes.

- **Wellstone.** The teal light the blade frees from a thing that drank the Pool. Kills burst it out in teal motes; a hidden hall's chest holds more. Carry it up, and at a rest stop Fetch sends it down to the Pool in his sack, safe for good. Fall while carrying it and it is gone.
- **Fetch at the Pool.** Spend banked wellstone on blueprints you have found and on the Pool's own upgrades for every climb after: a deeper flask (+1 charge), Hald mail (+1 health), Fetch's credit (start with more gold).
- **Blueprints.** Found in hidden halls and now and then where something dies; kept for good the moment you find one. Bought, each adds a mark to what Fetch can offer.
- **Oaths.** Three oath stones a region, standing at the back of a landing with two lines of the Lanternbearer's oath glowing on them. Reach the landing's middle and choose: the Edge (blows land 30% harder), the Lantern (+1 health, healed 1) or the Knell (swings 8% quicker, a wider parry). Each oath grows every time you swear it, for the rest of the climb; a fall undoes them.
- **Marks.** At each rest stop Fetch offers three marks; take one, three at most a climb. Three are known from the start (Root: your first fall is caught at a root; Tithe: more gold, and more kept when you fall; Ward: a parry heals). Six more come from blueprints (Vigil, Finisher, Fleet, Seam, Second Breath, Bearer).
- **The Hald ram**, the first route-opener: found in the first hidden hall you open above the Deep, kept for good. With it, three blows break the rubble over a closed fork and open the high road for this climb, so every region has two ways up.
- **The Pool sums up the climb**: how high you got, how many things you ended, what you swore, what you found, what the fall cost and what you banked. Riding a lift now says what it skips.
- The HUD shows wellstone carried, the oaths sworn and the marks carried. Saves move to version 3 (the run layer starts empty).
- Tests: the run layer's tables, the save migration, Fetch's offers (three, stable, never what you carry, bought blueprints join them), the oath stones' pairs. The smoke run swears at an oath stone, breaks a closed fork's rubble with the ram, and checks that a fall loses the wellstone carried.

## 0.24.0 — threats and places v2 (2026-11-07)

Milestone 4: every threat rebuilt to the bat's standard, the campfire, and more to crouch under than the beam.

- **The burrower**, built in Blender (`tools/blender/burrower.py`): a blind, armoured grub, ringed segments shingled with chitin, a collar of glowing pits, and a head of five jaw plates that shut into a spiked drill and splay open into a crown of teeth, more teeth down the throat. It ploughs the rubble with only the drill's point showing, bursts up and opens, waits swaying, snaps shut and lunges, recoils when struck and sinks shut. It is cut off at the step's surface, so it comes up out of the stone.
- **The crawler** (`crawler.py`): a cave scuttler on six spined legs, a plated abdomen banded in old-blood red, four glowing eyes, horns and hooked mandibles. It skitters, rears on its hind legs with its front legs high for the wind-up (eyes going red), strikes, reels when stunned, and dies on its back with its legs curling.
- **The spitter** (`spitter.py`): a bloated tick flat to the wall on six hooked legs, a veined sac glowing in the zone's colour, three eyes and a puckered mouth of hooked lips. The sac swells and brightens through the charge, clenches as it spits, and collapses when it is burst.
- **The swinging weight** is an iron-bound, spiked boulder on a chain of links; **rockfall** drops painted boulders.
- **The campfire**: a ring of stones, a teepee of logs charred at the tips, glowing embers, licking flames with sparks, a log seat, the trader's pack with a bedroll and a lantern hung from a staff, a pot on a hook.
- **More to crouch under.** Besides the beam: a broken vault springing from the wall, a curtain of chains, a fallen carved lintel, roots grown across from high in the wall. Each region deals its own mix, tinted to its stone (the Deep: roots, the beam, the vault; the dwarf halls: lintels and chains; and so on). The tutorial keeps the beam. Same rules as the beam: crouch or roll under, running into it hurts.
- Under the hood: `tools/blender/creaturekit.py` (shared modelling, painting and export for creatures and props), `src/render/glbModel.js` (load once, clone per creature with its own bones and materials, pose by clip and fraction, cut off below a surface), `src/render/props.js` (clone a named prop, tinted). Each creature keeps its built-in shapes as a stand-in until its model has loaded.

## 0.23.0 — hidden halls (2026-11-07)

The last of milestone 3: side halls and ledges.

- **Hidden halls.** At one landing in each zone (which one changes from run to run, from two built per zone) the wall behind the landing is a walled-up arch of rubble, cracked, with lamplight leaking through the cracks and grit trickling out of them. Strike it: each blow cracks it further and the light grows; the third breaks it in, the plug bursting out over the landing and the wall along the hall falling away in a wave from the mouth. Stand in the opening and press jump to step through.
- **What is inside.** A short flat, a stair climbing through the rock, a chamber with a carving on its back wall and a chest under a hanging lamp. Stand at the carving to read it: a thing found in that region, from the lore (two per region, one per run). Reach the chest and it opens: gold (10, plus 4 a zone) and the flask filled.
- **Ledges and drops.** A hall is never a dead end. It climbs higher than the stair outside, then breaks out of the rock onto a ledge 1.8 above the next landing: walk off it and you drop back onto the stair, a flight on. Walk left instead and you go back out through the opening.
- Inside a hall nothing on the stair can reach you, and nothing there can be struck.
- Tests: every zone has a hall each run; each opens straight behind its landing, never on a landing that already does something (a fork, the lift, the rest stop), climbs at a grade the stair allows, and comes out on a ledge over the next landing with a drop of 1.2 to 2.5. The smoke run breaks into the first zone's hall, climbs to the chest and drops out onto the next landing.

## 0.22.0 — stair and routes v2 (2026-11-07)

Milestone 3, from the designer's notes.

- **The crumbling handoff, as designed.** No rising platform. On a fork landing a short stair, the spur, climbs off to the right, cut into the wall behind the main stair. Hold right and press jump to hop onto it. Once you are on it its steps fall away behind you, a collapse that chases you up at 3.2 a second (you run 3.8), so you cannot stop; each step shakes before it goes. It ends in a broken edge. Behind it and 1.1 higher, across a gap, is the foot of the high road: jump in the last stretch of the spur and you come down on it, then turn and climb the high road left round the shaft as before. Run off the end or stop, and you fall: one health, back on the fork landing, and the stones grind back up for another try. The high road is now a narrow ledge-stair cut deeper into the wall (it passes behind the spur), with a flat foot to land on; walk off the foot's far end and you drop to the main stair below. Replaces the rising slab of 0.19.
- **Varied stair surfaces.** Every flight keeps its rise (its landings stay put) but not its shape: a run of steps, a slope of worn rock, a slope broken by one tall step, or broad steps twice the length and height. Each region deals them from its own rotation: the Deep is mostly rough slopes, the caverns mix in broad runs, the dwarf halls are built stairs. The tutorial's first flights stay plain steps; tall and broad steps only come on gentle flights (no single step taller than about 0.9); broken steps only on flights of steps. Slopes are drawn as blocks tilted to the grade. His body rides the surface's average as before, and his feet land on it.
- **Routes that change from run to run.** Each zone has two forks built: an early one from landing 3 (it skips the lift and comes out at the rest stop) and the late one from landing 9. Each climb draws which are open in each zone, the late one, the early one or both; every zone keeps at least one. A closed fork's spur is a heap of rubble at the back of its landing.
- Tests: every spur leaves its fork landing and every high road rejoins its landing; the leap can be made with a running jump and the collapse never catches a runner; surfaces meet both landings, stay between them, and are themed by region; broken steps only on steps; every zone keeps an open fork and both forks get their turn across runs. The smoke run hops onto the spur, runs it, leaps, and climbs the high road to its landing.

## 0.21.0 — feel and juice (2026-11-07)

Milestone 2, from the designer's notes after playing the skeleton.

- **Climbing that rises with the stride.** His body no longer pops up a whole step the moment a foot arrives. It rides a smooth line up the stair (the step tops averaged over one step's length around him, worked out exactly), while foot IK puts each foot on its real step and lowers the hips toward the lower foot. Measured on a steep flight: the spread of his rising speed down from 3.2 to 1.7, its peak from 10 to 3.4 (the stair's own slope).
- **A crouch with nuance.** Coiled, not squashed: hips down and forward over bent knees, head up looking ahead, the sword low and ready, the off hand down on the stone. The crouch-walk is a slow creep, a long low step at a time with the off hand padding forward, at ×0.38 of run speed (was ×0.45). Its footfalls were coming five a second with the full step sound; now about two a second, with a soft creep sound.
- **Idles.** Standing a while, he now and then looks up the shaft, or round at the camera and back down the stair behind him.
- **A longer sword, held two-handed.** 30% longer (a hand-and-a-half sword), with both fists on the grip in the guard, every swing and the blocks. His arms are short, so where the off hand cannot reach, both hands bring the sword in toward his body. Jumps, the crouch, the roll and the run stay one-handed, so his arms still swing free.
- **He is 10% taller.**
- **Hit juice.** A landed blow now has a white-gold flash and a shock ring at the point of contact, two slash streaks along the swing's line, sparks, the struck creature flashing white, a freeze, a shake and a push in, and a weighty thump under the hit sound. The combo's finisher hits harder on every count. It runs on real time, so it plays across the freeze it starts.
- **More daunting broken steps.** Where the grade allows a running jump across (0.45 or gentler, with a step beyond), two steps go at once: 1.6 of hole instead of 0.6, a bigger collapse with a rumble. Jump from the edge and you clear it with height to spare; jump early and you hit the far riser.
- Wide holes need room: three whole steps of solid stair before one (a jump over a hole can land two steps on) and two after, or it stays one step wide.
- Fixed: falling through a broken step could drop him back into the same hole, over and over. His last safe spot can be a step that crumbled since he stood on it; the respawn now steps back off any hole and keeps a step's run-up before it. A broken step also counted as passed once he was well away from it in either direction, so after a respawn behind it the step ignored him; it now counts as passed only once he is beyond it.
- **Beams point out toward the shaft's centre**, end-on to the camera, instead of lying diagonally along the stair. They sit a little higher, above his crouch and below a standing head.
- **Fixed: prompt icons were off-centre.** A comment had swallowed the code that centres their text, so every key or glyph sat left and high in its ring.
- Tests: wide broken steps only on gentle flights, with a step beyond, and jumpable from the edge. `tools/model-review.mjs` can hide nodes (`HIDE`), show only some clips (`CLIPS`), and frame clips on one node (`FOCUS`, `FIT`).

## 0.20.0 — the skeleton (2026-11-06)

- The player's warrior is now the skeleton: the designer's own model, made in Tripo. He wears a bucket helm, a ragged red scarf and cape, belt and pouches, and heavy boots. He is the default warrior; the knight, the Blender warrior and the hand-built one are still on the title screen's warrior switch.
- `tools/blender/skeleton_tripo.py` makes him ready for the game from the Tripo export (kept in `assets/source/`). It renames his Mixamo-style bones to the game's names, cuts the cape free of the body, brings the textures from 2K down to 1K (the model goes from 9.2 MB to 4.1 MB), takes the travel out of Tripo's walk and run (the game moves him), and gives him the knight's full clip set by name. Tripo's idle, run and flinch become the guard, run and hurt clips; the jump, block, crouch, roll tuck and every swing are authored for his body from the knight's own pose specs, scaled to his size.
- His hands: both fists closed, the fingers curled toward the palm (measured from his bones, not guessed), the weapon's handle seated in the hole of the fist along the knuckle line, the blade out past the thumb, flat to the side camera. A rigid wrist: the hand bends no more than 15° off the forearm, and the forearm turns to carry the rest of every aim (`max_wrist` in posekit; the knight's clips are unchanged).
- His cape swings rather than simulating: it rides his chest and turns about the shoulder line on one sprung angle. It trails back as he runs, lifts as he falls, dips as he takes off, stirs a little when he stands, and bends most at the hem.
- His walk and run: Tripo's own, arms swinging naturally with the weapon riding in the fist. Feet that match the ground: the build measures how far each loop carries him (four steps a loop) and where the left foot strikes, and the game moves the playhead by distance over that stride instead of on a fixed clock. Idle, walk and run blend by speed, walk and run kept in step; at his size the game's top speed falls between Tripo's walk (1.8 a second) and run (6.5), so at full speed he jogs, a blend of the two at the matching cadence. Footstep sounds follow his real steps. Measured: before, the foot bearing his weight moved 1.5 times as far as he did; now the slide is least at exactly the measured stride.
- Getting going takes a step or two: top speed in 0.2 s instead of 0.06 (one number, `TUNE.move.accel`). Stopping, turning and slowing are still almost instant. On a gamepad the stick is analog: pushed part way, he walks.
- The flitter is a bat now, built in the skeleton's style by `tools/blender/bat.py`: chunky, hand-cut low-poly forms with painted colour, an oversized head with leaf ears (raw inside), a scowling brow, fangs, a fur ruff, leather wings in the skeleton's dried-blood red stretched between finger spars with a torn, scalloped trailing edge, and hooked feet. Rigged and animated for its states: it roosts head-down with its wings wrapped round it like a cloak, unfurls with a shriek, beats its wings as it circles, sweeps them back to dive, and crumples when swatted. Its eyes glow gold while it hunts and red as it dives. The box-built flitter stands in until the model has loaded.
- `tools/model-review.mjs`: an art review of any GLB through the game's own three.js and colour handling (a turnaround, head close-ups, frames from every clip).
- Only the sword, for now: the Pool and the rest stops offer no other weapon (`?weapons=all` or `#weapons` brings the pick and the spear back). A save holding another weapon keeps it, and plays the sword.
- Swings start from where he is: the wind-up blends in from his current pose (mid-stride, mid-swing), which holds still as it fades, instead of snapping to the guard first. All of the wind-up pose is there just before the strike, so hits land exactly as before. Measured at the start of a swing from a run: the sword hand's first-frame speed went from 23.6 to 1.6.
- Classic PC controls: left mouse attacks, right mouse blocks and parries (J and K still work), Shift sprints, C rolls, Q drinks the flask, A/D move, S crouches, Space jumps. Mouse buttons are bindable like keys and show as LMB / RMB / MMB in every prompt; clicks in menus never count as attacks. Saved controls move attack and block onto the mouse once and keep the keys they had.
- Sprint: hold Shift (left-stick click on a pad, the touch stick pushed all the way) to run at 6.0, near his real running pace. The gait goes all the way into the full run at the matching cadence, and the camera leads further ahead. It carries into a jump but not out of one, and is off while crouching or blocking. Shift no longer rolls (L and C still do); saved controls give it up to sprint.
- Slower, weightier swings: every wind-up 1.7 times as long, every recovery 1.35 times, the strike itself only 1.15 times, so hits still land crisply. The sword's quick cuts wind up in 0.085 s (was 0.05); the pick's heavy second swing in 0.31 s and recovers in 0.57.
- A smoother camera on stairs: its height follows the line of the stair's slope rather than each step, through a spring (about 0.35 s to catch up), and the point it looks at does too (that snapped with every step before). Footfalls no longer dip the camera; landings still do. Measured on a steep flight: the view's frame-to-frame tilt shake is down to a quarter.
- Foot IK floor: the ankle never goes below its standing height over the step under it. Blending the guard into the walk could straighten a bent leg and sink a sole 0.22 into a step; worst now 0.001.
- Fixed: `tools/rig-review.mjs` would not run (a comment swallowed the end of a line).

## 0.19.0 — the crumbling handoff (2026-11-06)

- The foot of every high road has crumbled away. Its first steps are gone; one slab is left, on a beam, level with the fork landing. Hop onto it and it shudders, then rises on its groaning beam to just under the first intact step, holds there for about a second, and falls. Jump across (hold left, press jump) while it holds. Miss, and you drop and land back on the fork landing, one health down; a new slab comes up from below a few seconds later for another try. Timing and nerve, not reflex: the gap is a comfortable running jump and the shaking warns you before it goes.
- You cannot walk off the slab while it moves, only jump from it, so holding left as you land does not run you off its edge. While it rests level with the landing you can step back off it onto the fork landing.
- Broken stubs of the fallen steps still stick out of the rock behind the gap. A hint explains the slab the first time you stand on it.
- Falling through a hole on the crumbling foot puts you back on the fork landing, never on the slab (it may be gone). On a high road, ground under a spot now comes from the path, which asks the slab (`src/world/handoff.js`) what is there: its top, or a hole.
- Movement now steps at no more than 1/60 s whatever the frame rate. On a slow machine a long frame could carry him clean over a broken step.
- Fixed: stopped by the riser at the far edge of a hole, he could keep falling forever, never hurt and never put back. The fall-through check now looks again after the riser stops him.
- Tests: the gap is a real gap but jumpable with a running jump from the slab's top, the slab is wide enough to land on from the fork landing, and it tops out just over the lip of the first intact step. The smoke run now rides the slab up and leaps across before taking the high road to its end, and fails if he is hurt on the way. Its "every threat hurts when ignored" check now walks in at the real run speed; the sped-up bot reached a broken step before it had opened, which no player can.

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
