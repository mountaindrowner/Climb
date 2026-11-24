# The Climb: the phase plan

Everything still to do, in the order that avoids building anything twice. Gathered from:
- the two playtests (2026-11-16);
- the world plan (`docs/world.md`): the wings, the passages between regions, the Deep, the Shard;
- the Metroidvania plan (`docs/metroidvania.md`) and the Ember plan (`docs/side.md`);
- the water rest points, and the story (`docs/story.md`).

**The aim is each phase right the first time.** Three things make that likely:
1. Decide before building. Phase 0 settles every open design question at once, so nothing built later has to be undone.
2. Foundations before content. The phases that change how things work (moving, dying, resting, weapons, creatures,
   teaching) come before the phases that add more places. New rooms are then built on the final rules.
3. The same finish line for every phase (below).

## The finish line, for every phase

A phase is done when all of these hold:
- **A written sheet first,** for anything new (a room, a creature, a keeper, a screen): what it is for and how it
  plays. You approve it before anything is built.
- **Automated checks pass:**
  - every place can be reached with the gifts he has, and nothing behind a gate can be reached without its gift;
  - runbacks from flames are short;
  - nowhere can he get stuck (a new check, phase 1);
  - every creature stands on or clings to something real, every torch is mounted;
  - the text follows the writing rules.
- **A screenshot of every changed room and screen,** at desktop size and phone size, looked at by me before you see it.
- **A short playtest list for you** (and your brother): the five or six things to try, what should happen, and
  what to look for.
- **Published:** its entry written in the build log (`docs/builds.md`: what changed, what it did to a save, what was
  checked, its commit), the zip opened in a browser (`tools/check-build.mjs`), and pushed to the itch.io page
  (`tools/push-itch.sh`, which refuses a build without those). An earlier build can be put back with
  `tools/restore-build.sh`.
- **The docs updated,** so the next phase starts from what is true.

What I cannot judge: feel, sound, and how hard something is for a person. Each phase's playtest list is aimed at
exactly those.

## Phase 0: decisions (settled 2026-11-16)

The guide for everything below: **Hollow Knight and Dead Cells first, then Castlevania**: hard but fair, a few tries
per keeper, and **everything explained** to the player, plainly, the first time it matters.

| # | Question | Decided |
|---|---|---|
| 0.1 | Rest points | **One raising pool per region, near its start**, each its own shape (not a copy of the first pool). He is raised there after a fall, so a keeper means a real walk back. **Small leaks** of the same water elsewhere heal and refill the flask but do not raise him. Ordric's lamp hangs over the raising pools |
| 0.2 | A fall | **He comes apart into water;** the drops sink into the ground, the screen fades, and he rises out of the region's raising pool, with one word over it: **PERSEVERE** (your choice; the end count still reads "raised N times") |
| 0.3 | What breaks stone | **Only the heavy weapon** (the spade, or whatever it becomes). Not the blade, not the plunge |
| 0.4 | The spade | **A complete weapon:** a full moveset with its own pros and cons. A slower combo; its slam sends a shockwave forward along the ground (a little range); strong on the ground, weak in the air; it breaks stone. Every later weapon is equally complete and different |
| 0.5 | What a keeper leaves | **Something coalesces from it as it dies,** floats, falls to him, and he takes it in (his own animation for receiving it). Then a page opens in the middle of the screen: what it is and what it does. Each power has a thing that makes it real (the Toll's air dash could be boots, for example) |
| 0.6 | The people | **Fewer meetings, spread through the whole mountain, harder to find.** Each has **a small place of their own**, a new space built for them, not a corner of an existing room. Not all met in the first region. **Clarified (phase 8): they are there when he needs them.** Story meetings are on the main path and cannot be missed; services (Ordric's shop, Corwen's count) are always close; only the extras (their own places) are hidden |
| 0.7 | Between regions | **One continuous climb.** The passages between regions do the loading (the old lift trick): climbing a passage lets the region below go and makes the one above. The doors are kept for travel through the water later |
| 0.8 | Bigger map | **Bigger, and not rectangles.** Some spaces vast and cavernous, some winding, some taking a path no one expects. The lore of each place decides its shape |
| 0.9 | Voices | **Keep the mumble voices,** and give each person a sharper character. Try giving words a hint of their consonants, so speech has a semblance of the words |
| 0.10 | Art budget | **Spend what there is, keeping $0.20 back.** Anything that has to wait goes on the standing list (`docs/pixellab-wishlist.md`) for when the generations refill |
| 0.11 | Difficulty | **Like Hollow Knight:** a few tries per keeper at Climber |

**Decided 21 Nov 2026, after the second playtest** (`docs/playtest-2026-11-21.md`):

| # | Question | Decided |
|---|---|---|
| 0.12 | The Deep | **Shut, for now.** It is opened later, at a point still to be chosen. (You were there early in both playtests and felt you should not be) |
| 0.13 | What gives what | **Abilities from minibosses, weapons from keepers,** fitted to what is already built |
| 0.14 | The heavy weapon | **A hammer (a sledge),** in place of the spade. **And more weapons** than two |
| 0.15 | A fall | **Fall damage stays; the second jump resets it** (build 81) |
| 0.16 | The map | **Only what he has walked.** No maps sold, and Corwen does not give one. Unknown rooms as cloud |
| 0.17 | How hard | **Three to five deaths a region,** at least. Today it is none |
| 0.18 | What people say | **Hints of what is to come, not how it works.** The windows teach the mechanics; the people point and suggest |
| 0.19 | The size of a region | **Wider.** Each floor a far left, a far right and the main way between, so that he stays in a place for a while and it is a challenge to cross |
| 0.20 | The screens | **The look of the sheet is right** (`docs/screens-sheet.md`), **made more of the game's world:** the ribbon kept, better pixel work, each screen themed to who or what it belongs to. "Annals" is not understood: the menu says something plainer |

| 0.21 | Up | **W and the up arrow are not jump.** Up looks up, and up with attack strikes upward (22 Nov; build 85) |

| 0.22 | Gifts | **The table of who gives what is approved** (`docs/gifts-sheet.md`; 22 Nov): weapons from keepers, abilities from minibosses, the dash from the Cracked Bell and the glide from the Seated. **Weapons, skills and the like are given after challenges: great challenges for great things** |
| 0.23 | Puzzles | **The game is missing puzzles.** They come near the end (phase 22), and a puzzle is one of the challenges a gift can stand behind |

| 0.24 | The weapons | **Made in steps, each with your yes:** which weapons; what each looks like; its drawings; then into the game. **The gamut of kinds.** **The weapon is the same in every frame,** and he holds it in every drawing where it shows (`docs/weapons-sheet.md`). The hammer's two candidate drawings are turned down: they did not match each other |
| 0.25 | What a keeper leaves, besides | **Worth considering, not for now:** something only a keeper gives (a soul, or what fits the story), spent on one great change to him |

(The table above is continued by 0.21 to 0.25: answers given on 22 Nov.)

**Where the gifts sheet stands (22 Nov, build 88):** step 1 built (86, the hammer; its drawings await a yes); step 2
half built (87, the air dash from the Cracked Bell; the glide, the heart and the drink wait on what a keeper leaves
until its weapon is made); step 3 built (88, harder); step 4 has its sheet (`docs/wyrm-sheet.md`). **After build 88 you put the weapons first** (0.24): `docs/weapons-sheet.md`.
Step 1 is settled (the six, a bow in place of the fork, the hammer first, the weapon on his back when his hands are busy);
step 2 is settled (hammer B, clapper B, tooth B, bow A, thorns A: `docs/weapon-looks.json`); step 3, the hammer's drawings,
awaits your yes (`docs/hammer-set.gif`). The rest of the gifts sheet waits behind it.

**23 Nov, build 94: the six weapons are done** (builds 89 to 94: the hammer drawn, the tooth, the clapper, the bow, the
thorns). Every keeper of the climb leaves a weapon; the air dash is the Cracked Bell's and the glide the Seated's.
Still open from the gifts sheet: a heart and a drink behind minibosses (the Tempest, the Gardens), the Wyrm rebuilt
(`docs/wyrm-sheet.md`), and the other keepers after it. Then the map pass.

**One question left, before phase 5:** if only the spade breaks stone, he must have it before the Ossuary's cracked
wall, but the Sexton and his spade are inside the Ossuary. The Warden's gift today ("the Warden's weight") is exactly
that his plunge breaks stone. The natural answer is that **what coalesces from the Warden is the heavy weapon**, and
the Sexton becomes the Ossuary's elite with something else to give. To settle when phase 5 begins.

## Phase 1: fix what is broken

*Done (build 43).* One thing moved to phase 2: Ordric washed out by the flame beside him (the flames become water, with their own light).

**Moving:**
- He got stuck on a bump by Corwen. Fix that spot, then **add a stuck-finder**: the real motor walks and jumps from
  every floor tile in every region, and any place he cannot leave fails the build.
- Platforms: he lands on any part of a platform when coming down onto it, not only its edge.
- Dropping down through a platform no longer catches the next ledge for a moment.

**Drawing:**
- The scarf knots sit behind him, not through him.
- The light at the people's spots stays off their faces.
- Creatures that cling to walls are attached to a wall, with a check that they are.
- Gargoyle perches go only where there is stone to perch on, never over a pit or on a person.

**Shots:**
- The barnacle's shot leaves its drawing and is drawn as its own effect, so there is no box edge.
- Every creature's shot flies until it hits rock, and none passes through a wall.

**Sound:**
- The Ossuary's music plays.
- A music watchdog: if a piece fails to load it is asked for again, and the region falls back to the made-as-it-plays
  score rather than silence.

**People:** creatures pass behind the people, never seeming to strike them.

*Art cost:* none.

## Phase 2: the water, and what a fall is

*Done (build 44).*

- **Every flame becomes a pool of the blue water.** One shared look, a rim in each region's stone (rock pool, font,
  basin, meltwater, cistern, fountain, mirror pool, trough). Ordric's lamp hangs over each.
- **One raising pool per region,** near its start, each its own shape. A fall raises him there (decision 0.1), so a keeper
  is a real walk back; the runback check becomes "how far, and is it fair" rather than "is it short".
- **Small leaks** of the water elsewhere: hearts and flask filled, but he is not raised there.
- Down at either: the knots.
- **The intro:** his fall ends in the water, with a splash and the light; then he wakes. The intro gets quiet music.
- **A fall:** no rewind. He comes apart into water, the drops sink into the ground, the screen fades, and he rises out
  of the region's raising pool, with one word over it (decision 0.2).
- **Every word that says "flame"** for a rest point says water. The story's flame (the summit, the ending) stays fire.
  Torches stay as light.
- Update `docs/story.md` and `docs/world.md`: "a flame kept for him" becomes "water gathered for him", which is still
  something given.

*Art cost:* none (drawn in code).

## Phase 3: teaching, and words

*Done (build 47), as `docs/phase3-sheet.md` sets out: the opening rooms teach in place, with hints only when he
struggles (`src/side/teach.js`); cards for every relic, gift and weapon, and once each for the knots, the embers and
the map; the relics' lines in plain words with numbers; keys drawn as keys; the ember meter hidden until it is needed;
the weapon in hand under his life; "What he carries" from the pause; the people say who they are; Hints on or off.*

**The opening as a tutorial.** Before the Roots' first climb, a few rooms after he wakes, each teaching one thing with
almost no words, in this order: move, jump, double jump, crouch and drop, attack, block, roll, the pool. Then the climb
starts.

**First-time explanations, one short card each:**
- the knots (relics only work while tied into the scarf; he has a few knots; choose at the water);
- the embers (what fills them, what they do);
- the weapon swap;
- the map.

**Item cards.** Getting a relic, a weapon or a keeper's gift shows a card:
- a picture of the thing, on a worn tablet or page;
- what it does, in one plain line, large;
- where it came from, in small, quiet, slanted type underneath.

**A plain-words pass over every line the player reads:**
- relics, gifts, prompts, hints, the people;
- what something does always comes first and short (for example "Urns break open with 50% more shards");
- the story stays, smaller.

**Prompts say what they do:** "TALK", "REST", "TIE KNOTS", "OPEN", with the key or button shown as an icon.

**The screen:**
- the ember meter is hidden until he has the first gift that uses it;
- a small panel shows the weapon in hand (and what the swap key changes it to);
- the start's control hints sit away from him and go once the tutorial has taught them.

**"What he carries,"** a new screen from the pause: gifts (as objects), weapons, relics (tied or carried), and the
knots, each with its picture and its one line.

*Art cost:* small pictures for items and relics, about 20 images. Drawn in code from the game's palette, or about
$0.30 to $0.60 with PixelLab.

## Phase 4: his animation and feel

*Done (build 48): an air pose (the top of a jump and the fall), a crouch and a crouching walk, the spade's own run,
air and crouch; the high landing checked; a block or parry is seen to bounce the blow off; each relic's knot its own
colour and shape. Art cost: seven strips with light maps (the balance showed no charge).*

- A **peak-of-the-jump and falling pose**.
- A **crouch, and a crouching walk**.
- His **landing from a high fall**, checked.
- **Each weapon drawn in hand through every move:**
  - while standing, jumping, falling and blocking (the spade showed the sword there);
  - or the weapon carried on his back during moves that do not use it.
- A **visible counter** when a block or parry lands: the blow bounced off, a flash, the attacker knocked back.
- **The knots on the scarf** in each relic's own colour and shape.

*Art cost:* about 8 to 10 animations with light maps, roughly $0.40 to $0.70.

## Phase 5: weapons and gifts

*Done (build 49). Decided with it: **the Warden leaves the spade** (the heavy weapon), so it is in his hands before the
Ossuary's wall; the Sexton no longer gives it. What was built: only the spade breaks stone; the spade is a whole weapon
(three slow blows, the last with a wave along the ground; its own plunge, which breaks floors; weak in the air; no
guard); a keeper's gift gathers out of it, comes to him, and he takes it (his `receive` drawing), then its card; the
Roots' way up is walled with cracked stone, so the spade is used at once. Not done here: graves that give things up
when dug (with the Ossuary's own pass, phase 10), and a thing of its own for each later gift beyond its picture.*

- **The blade:**
  - stops breaking stone;
  - keeps its three cuts, the rising cut, the dash cut, the guard and parry;
  - gets its own plunge.
- **The spade becomes a full weapon:**
  - a slow, heavy three-blow combo;
  - its own plunge;
  - it breaks stone and digs (graves in the Ossuary give things up);
  - no guard.
- **Getting a gift:**
  - the keeper's object (decision 0.5), a short staged moment;
  - then a room straight after that can only be crossed with the new power, so it is felt at once.
- **The ember arts** checked against the new weapons, so each art works with either.

*Art cost:* the spade's combo and plunge, about 4 animations, roughly $0.30.

## Phase 6: creatures

*Done (build 50), as `docs/phase6-sheet.md` sets out, with these differences: the leash is 9 units (18 tiles), since 12
tiles was shorter than their sight; no new art was needed (the worm's ripple and the spitter's warning are drawn in
code); the Firmament's two wraiths and two squalls became motes and sentinels so no creature is in three regions.*

- **Their own sound for every creature:** made in code, or about $0.50 with PixelLab sound.
- **Behaviour, for every creature:**
  - they patrol, notice him (by sight, not through walls), chase within limits, give up and go home;
  - shooters only shoot when they can see him.
- **The worm** that pops up is redone:
  - it surfaces where he will be, rather than where he was;
  - it travels under the floor in a visible ripple, and breaks out with a warning.
- **The green spitters** are brought up to the cistern tentacles' standard: a clearer warning, a better shot, a
  better death.
- **A check of every region's creatures:** each one has a job (block a path, guard a ledge, harry a climb), and no two
  regions use the same mix.

*Art cost:* about $0.50 to $1 (new animations for the worm and spitters).

## Phase 7: the keepers

*Done (build 51), as `docs/phase7-sheet.md` sets out: a thrown attack for each keeper, the keepers' health and heaviest
blows growing up the mountain (your decision), the gifts named as things, and a tool that plays each thrown attack
(`docs/keepers.md` has its table). Not done: the audit of the keepers' own blows against the one warning rule, and the
check of those blows; second phases were not made faster (they already are, by each keeper's own numbers).*

- **Harder and fairer, each keeper:**
  - a second phase with a new attack;
  - clear warnings;
  - a target of a few tries each at Climber.
- **Attacks from their own place**, each drawn in code:
  - the Toll throws hymn-books and bell shards;
  - the Wyrm, ice;
  - the Thunderhead, ball lightning;
  - Mother Thorn, seeds that root;
  - the Fallen, the dark lamp's embers.
- **What each leaves** (phase 5's objects) is placed.
- **A test that plays every fight's patterns** and checks each attack can be avoided.

*Art cost:* none (the keepers are drawn in pieces, in code).

## Phase 8: the look of the world, and the people

*8a done (build 52), by `docs/phase8-sheet.md` and the rule you set: **they are there when he needs them.** Every
meeting is story (on the path), service (Ordric, beside every raising water) or an extra (a place of their own), in
`level.js` `MEETINGS`, with tests (`tests/side-people.test.mjs`). Built: Ordric at the water in all six regions; Corwen
moved onto the path in the Cloister and the Firmament; three nooks for Corwen (the Spires, the Tempest, the Gardens),
each a small room of its own behind a crawl, with a free chart; a line for a story beat he walked past; the shop as a
page with pictures; Hob redrawn side on; platforms in each region's make; every torch on a bracket or a stand, tested.
Differs from the sheet: the Roots' and the Spires' grids had no room for a nook, so Corwen in the Roots and Mirel in the
Spires stay on the path (Mirel's camp is not built); the nooks hold a desk, not yet shelves; Ordric's lamp-stores are
not dressed.*

*8b done (build 55). **Voices:** each speaks in their own way (Ordric slow with long vowels; Mirel quick, clipped,
every phrase rising; Corwen even, with a wait at each comma; Hob a mutter), and each syllable starts in the shape of
its consonant: a hiss, a pop, a hum or a roll (`docs/voices.md`). **Corwen's map:** once he has been met the map is
his: cracked stone he came to without the spade is marked SHUT, and turns gold and OPEN NOW when the spade is his; his
falls are counted on each region's page; a page is sealed when nothing on it is left to find. Differs from the sheet:
only cracked stone is marked, since no gap or height in the six regions yet needs the boots or the scale (that comes
with phase 9).*

**Every torch with a reason to be there:**
- on a wall in a bracket, on a stand, or on a pillar;
- a check fails any torch hanging in the air.

**Platforms in each region's own make:**
- Roots: timber and roots;
- Cloister: cut stone;
- Spires: ice and rock;
- Tempest: iron;
- Gardens: wood and vine;
- Firmament: brass.

**The people:**
- placed by decision 0.6: spread through the whole mountain, harder to find, each in **a small place of their own**
  built for them;
- **Hob redrawn** (he is drawn at an angle, not side on): on the PixelLab list;
- **their voices sharpened:** each a clearer character, and a hint of the words' consonants;
- each with a first-meeting line saying who they are;
- Ordric's shop as a real shop screen, with pictures and prices.

**Corwen's map** (Metroidvania step 3):
- rooms seen and visited;
- ways he could not take, marked with what stopped him;
- marks that glow when a new gift opens them;
- his falls tallied;
- a page sealed when everything on it is found.

*Art cost:* small (shop and map pictures, drawn in code).

## Phase 9: one continuous mountain

*Done (builds 56 to 59), by `docs/phase9-sheet.md`, its three decisions taken as recommended. **The join (56):** he
walks from each region into the next, and back down, with no dark and no card, through a sill that is the same in both;
fallen keepers stay fallen. **The passages (57):** each has its lower stretch under the raising water, dressed as the
sheet says. **Each keeper holds its region until it falls (58, 59):** slabs in the Roots' doorways, doors on the bell's
beat in the Cloister, wind on the Spires' faces, struck rods in the Tempest, thorn in the Gardens; and each leaves a
quick way from the water to its hall. Differs from the sheet: see its "As built" notes (the Bell Road is not in the open;
the Roots' quick way is not shorter than the old ladder; no nooks in the Roots; signs at two quick ways not made).*

- **No fades or cards between regions** (decision 0.7):
  - the next region is made while he climbs the passage;
  - he walks straight into it;
  - the view never goes dark.
- **The five passages lengthened** to the world plan's 6 to 10 screens each:
  - the Crypt Stair;
  - the Bell Road;
  - the Last Hut;
  - the Breach;
  - the Long Stair.
- **Keepers change their regions when they fall** (Metroidvania step 4):
  - the Roots' low places open;
  - the Cloister's bells stop;
  - the Spires' winds turn;
  - the storm breaks;
  - the thorn walls wither.
- **The given shortcuts**, found already opened when he comes back.

*Art cost:* none.

## Phases 10 to 14: the wings

*Phase 10, first half, done (build 60): **the Scriptorium**, by `docs/phase10-sheet.md`. Nine screens west of the
Cloister's stair, behind a sheet of vellum that only the Toll's step tears. The copying hall (desks in tiers, climbed
across), the furnace, the red room and the Corrector, the lectern with its blank book and a relic (the Copyist's Blank
Leaf), a chute back to the door. Copyists, blots and the Corrector are new drawings (about $0.30).*

*Phase 10, second half, done (build 61): **the Bell-Foundry**, by the same sheet. Eleven screens east of the bell tower,
behind cracked stone the spade breaks. Its rule is the Cloister's knowledge gate: iron rings when it is touched, and
while it rings the tongues swing, the slag wakes and the shutters come down; silence ends it. The Cracked Bell hangs in
the pit and never strikes first; when it falls the wing is still, and the bell-rope is the way back (the Founder's Felt
at its foot). The slype is built as the wing's first room. Still to do in phase 10: the refectory.*

*Phase 11, first half, done (build 62): **the Pilgrims' Cairns**, by `docs/phase11-sheet.md`. Nine screens west of the
Spires' caves, across a gap only the Wyrm's wind crosses. Cairns that are only stones while he looks at them; a way of
flat stones that holds only while he does not turn round; the Turned, who can be got behind; his own cairn; the
Pilgrim's Stone; the scree run out into Ordric's hollow.*

*Phase 11, second half, done (build 64): **the Glacier Galleries**, by the same sheet. Ten screens east of the horn,
behind a pane of ice the Toll's step breaks. Cold braziers lit by a blow; each fire melts the ice nearest it, which
opens ways and chests and wakes whoever sat in it; the Seated, freed a fire at a time; the Climber's Flint; the
meltwater out through the tower's foot. Phase 11 is done.*

*Build 65: **the refectory** (the Cloister's own room, over the stair). Phase 10 is done.*

*Phase 12, first half, done (build 66): **the Wreck of the Works**, by `docs/phase12-sheet.md`. Nine screens west of the
Tempest's landing, open to anyone. Iron in two halves with the current in one; levers that send it across; coils and
Wright's-arms; the Jar, dull until he makes it live; the Wright's Boots; out by a grate into the watch. Still to do in
phase 12: the Eye of the Storm.*

*Phase 12, second half, done (build 67): **the Eye of the Storm**. Seven screens east of the masthead and above it,
climbed on the Wyrm's wind. Nothing moves while he moves: the Hush come when he stands still, and a door of cloud opens
only to one who stands and waits. The Thunderhead's empty seat; a Breath of the Eye. Phase 12 is done. In the same
build, four relics that had never been switched on were mended (the build log has it).*

*Phase 13, first half, done (build 68): **the Aqueducts**, by `docs/phase13-sheet.md`. Nine screens west of the
wellspring, open to anyone. Running water that carries him and bars a climb where it falls; sluice wheels; the stone
keepers that put them back; the Lock; the Carrier's Yoke; out by the spill. Still to do in phase 13: the Keepers'
Houses.*

*Phase 13, second half, done (build 69): **the Keepers' Houses**. Eight screens east of the arbor. Disturb nothing: a
broken setting brings the Housekeeper by its servants' doors and shuts his own house until it is set right. The
Second Place. Phase 13 is done.*

*Phase 14 done (build 71): **the Orrery Wing**, by `docs/phase14-sheet.md`. Nine screens east of the orrery room. Things
that move and carry him (new); hours called and struck an hour late; the Almanac; the Last Page. With it, phases 10
to 14 are done.*

Built two regions at a time. **Spaces, not rectangles** (decision 0.8): each wing has at least one vast space, one
winding way, and one path no one expects, each shaped by what the place was. Each wing gets its sheet first: its rooms, what each room is for, its gate and shortcut,
its creatures, its elite, its one moment, its relic, and a weapon (the Ember plan's step 4) where one fits. Each
region also gains one or two knowledge gates, puzzles solved by understanding the place rather than by a gift
(Metroidvania idea 5), and rough rock drawn everywhere ahead of the grip (idea 7).

| Phase | Region | Wings and passages | Elite or mini-keeper |
|---|---|---|---|
| 10 | Cloister | The Scriptorium (opened by the Toll's step); the Bell-Foundry (the Warden's weight) | The Corrector; the Cracked Bell (a mini-keeper) |
| 11 | Spires | The Pilgrims' Cairns (the Wyrm's wind); the Glacier Galleries (the Toll's step) | The Turned; the Seated |
| 12 | Tempest | The Wreck of the Works; the Eye of the Storm | The Jar; the Eye's own |
| 13 | Gardens | The Aqueducts; the Keepers' Houses (the Toll's step) | The Lock |
| 14 | Firmament | The Orrery Wing (he rides the turning arms) | The orrery's own |

*Art cost:* about 2 to 4 new creatures and 1 elite per wing, so roughly $1.50 to $3 per phase. This is where
decision 0.10 matters.

## Phases 15 to 17: the Deep

| Phase | What |
|---|---|
| 15 | **The lamp** (Ordric gives it after the Warden), the guild's lamps that stay lit, and **the Vein** (after the Warden; the Assayer) |
| 16 | **The Flooded Levels** (the Wyrm's wind carries him under water; the Pump), **the Great Shaft**, and **travel through the water**: down into one pool, up out of another (Metroidvania step 6). It only makes sense once every rest point is water, which is why phase 2 comes first |
| 17 | **The Hollow** and its keeper, **the Auger** (a new keeper, with an entrance to match the others); its gift, **the grip** (climbing rough rock); and **the Source**, the light at the bottom |

*Art cost:* the Deep's creatures and elites, about $3 to $6. The Auger is drawn in pieces, in code.

*Phase 15 done (build 72): **the lamp, and the Vein**, by `docs/phase15-sheet.md`. A light he carries; twelve dark
screens behind the guild's seal; lamps he lights that stay lit; the Echo; the Assayer; Raw Lampstone.*

*Phase 16 done (build 73): **the Flooded Levels, the Great Shaft, and travel through the water**, by
`docs/phase16-sheet.md`. Deep water (it bears him up; with the wind it carries him under); twelve screens under the
Workings' cistern; the Sunk, blind eels, the Pump and its tide; the way through the water, given at the flooded
chapel; four screens of Shaft below the Vein's lip, and the light under its floor.*

*Phase 17 done (build 74): **the Hollow, the Auger, the grip, and the Source**, by `docs/phase17-sheet.md`. Fourteen
screens at the bottom; the Deep's keeper, with an entrance to match the six; rough rock and the grip; the Source;
the wall home to the Roots. **Carried to phase 18: rough rock in the regions already built** (the plan's faces from
the Roots on; in this build it is only in the Hollow). Next: phase 18.*

## The map pass (between phases 17 and 18)

*Asked for after build 75. `docs/map-pass-sheet.md`.* The mountain changed height mostly by planks hung in the air.
The pass rebuilds each level so that height comes from the shape of the place (shelves, piers, hung rock, stairs,
stepped floors), keeps a plank only where it is a made thing (a rung, a step off a wall, a staging on posts), and
then dresses the new shapes. One level a build, each held to a budget by a check.

- **Pilot: the Roots (build 76).** Done: 84 planks to 17, none bare in the air. **Played 20 Nov 2026 and judged
  good: the pass goes on.** What that playtest found is sorted in `docs/playtest-2026-11-20.md`: what bears on the
  pass (the edge grab, faults in the Cloister's rooms), what is broken, and what is set aside by subject.
- **After the playtest (build 77).** The edge grab is for the way up only; the Roots' shafts are five or six rows and
  four clear tiles; the words speak to the player and the goal is said (`docs/words-sheet.md`). The spacing rules in
  the map-pass sheet are the ones every later level is built to. **The Cloister's pass waits on the player's word.**
- **Played again, 21 Nov 2026 (build 80), further: to the Tempest.** The grab and the spacing are judged good, so the
  pass may go on. That playthrough reopened phases 3 to 8 (the screens and teaching, his feel, gifts and cost,
  creatures, keepers, the people's places) and asked for decisions first. All of it is sorted, with the whole list of
  what is open and a proposed order, in `docs/playtest-2026-11-21.md`.
- **The Cloister (build 101).** Done: 122 planks to 49, nine pieces of rock in the air to two (`docs/map-pass-sheet.md`,
  the Cloister room by room).
- **Then, in order:** the Spires, the Tempest, the Gardens, the Firmament, the Workings, the Vein, the Flooded Levels,
  the Great Shaft, the Hollow.
- **Phase 18's rough rock** (faces in every region) is cut into the same walls, so it is laid out with each level's
  pass and switched on in phase 18.

## Phase 18: the Shard, and the end of the story

- **The Shard,** reached with the grip, last.
- **The ending, in both orders:** the Source found before the Fallen or after reads differently, and never needs it.
- **The three people's last pages:**
  - Mirel waiting at the top, unhurried;
  - Corwen's open page;
  - Ordric's last lamp.
- **After the end:** the light comes down the scar on the title.
- **Optionally, a second climb** with something changed (the Circle of the Moon notes, `docs/circle.md`, kept as an
  option).

## Phase 19: sound and music, complete

- A piece for every section (the wings, the passages, the Deep), the intro's music, an ambience for each.
- Every creature's sound (from phase 6) mixed.
- The voices tuned from your listening notes.
- Real voices only if decision 0.9 changes.

## Phase 20: phone, polish and release

**Phone:**
- vibration on Android;
- opens like an app from the Home Screen on iPhone (no browser bars);
- lower drawing resolution when the phone struggles;
- smaller paintings;
- fewer creatures awake;
- a test on your own phone.

**Polish:**
- the save made robust, with a backup copy;
- an option to remap touch buttons;
- text size;
- a full playthrough check for stuck spots and gates.

**Release:**
- the itch.io page (text, screenshots, a short clip);
- the zip inspected, as before.

## Phase 21: a miniboss in every level

*Added 2026-11-18, on your word: "interesting minibosses to every level, each unique and contextually designed".*

Every level gets one fight of its own in the middle of it, between its creatures and its keeper: one figure, with a name,
made out of what that place was and what it is the shape of. None reuses another's way of fighting. These are apart from
the wings' own (the Sexton, the Corrector, the Cracked Bell, and those still to come in phases 11 to 13), which stay.

**What makes one of these, and not a big creature:**
- **It could only be here.** It is someone or something the place's history left behind, doing what it did.
- **One idea of its own** to read and answer, shown before it is used.
- **It changes something when it falls:** a way opens, or the room is different after.
- **Its own room,** on the level's main way or just off it, and its line in the Annals.

**The proposals** (each gets its sheet first; these are starting points, to be changed on your word):

| Level | Miniboss | Where | What it is | Its one idea |
|---|---|---|---|---|
| The Roots | **The Hauler** | The well | The last of the Well's keepers, still yoked to two full buckets he cannot put down | The buckets swing wide on the yoke and carry him round after them: strike him as their weight drags him past. (The Roots hold him down; this one is held down by what he carries) |
| The Cloister | **The Precentor** | The nave | The monk who led the hours, with four acolytes who do nothing unless he gives the beat | He raises his staff and they strike as one, on the beat. Reach him through them; when he falls they stand where they are |
| The Spires | **The Rope-team** | The ropeway | Three stopped climbers, still roped together, who never untied | They move as one line and pull each other back from the edge. Put one over it and the rope takes the others |
| The Tempest | **The Weathercock** | The masthead | The works' great iron vane, which turns to point at whatever moves | Where it points, the bolt comes. Keep it pointing somewhere else; strike it while it turns |
| The Gardens | **The Topiary** | The sundial | A hedge clipped into the shape of a hound, which has kept its shape by clipping everything else | It is only as large as it has grown: cut it back and it is small and quick, leave it and it fills the room |
| The Firmament | **The Orrery** | Under the dome | The astronomers' model of the heavens, still turning, one arm empty where the star was | Fought inside its turning rings: the safe place is the empty arm's shadow, and it moves |
| The Deep (each of its levels) | With phases 15 to 17 | | One for each level of the Deep, on its own sheet when that level is built | |

**Order within the phase:** one level at a time, from the bottom, each published before the next is begun.

*Art cost:* about $0.10 to $0.15 each where a drawing is wanted; the Weathercock and the Orrery are drawn in code.
**About $0.60.**

**If these are to be in the release,** the release step at the end of phase 20 waits until this phase is done. The rest
of phase 20 (the phone, the polish passes) does not depend on it.

## Phase 22: a puzzle in every section, and one great one

*Added 2026-11-19, on your word: "I'd like to have some puzzles... every section to have a puzzle", and "some big
puzzles that unlock really cool stuff... a more cryptic, hinted-at puzzle that has to be pieced together".*

Not designed yet. This is what was asked for, written down so it is built to, with nothing decided that you have not
decided.

**Two kinds.**

- **One puzzle in every section.** Each level, and each wing, gets a puzzle of its own: something worked out, not
  fought and not jumped. Small enough to solve in the room it is in, and made of that place, the same way the
  minibosses are. Its prize is ordinary (a thread, a chest, a short way round).
- **One great puzzle, across the whole mountain.** Cryptic, but hinted: its pieces are in plain sight in several
  sections, and nobody is told they belong together. It has to be pieced together. Its prize is something he can get
  no other way and would not want to be without: you named the summoning item (below, under ideas) or a weapon.

**What is already there to build on.** Several wings' rules are close to puzzles already: the doors of cloud that open
only to one who waits, the house that is open only to one who has broken nothing, the fires and the ice, the sluice
wheels. The roadmap's own "knowledge gates" (phases 10 to 14) are the same idea. This phase would give every section
one on purpose, and tie some of them into the great one.

**To settle with you before any of it is built:**
- What the great puzzle's prize is: the summoning item, a weapon, or both in turn.
- How cryptic. "Hinted at, not super hidden" is the instruction: so every piece is somewhere he will walk past, and
  at least one person on the mountain says something that points at it.
- Whether the Deep's sections get theirs here or with phases 15 to 17.
- Whether it has to be in the release (if so, the release step waits for it, as it does for the minibosses).

## Ideas kept for later

Not planned, not designed: written down so they are not lost. Each needs its own talk before it becomes a phase.

- **An item that takes what he kills and calls it back on his side** (yours, 18 Nov 2026). He kills a creature, the
  item keeps it, and he can summon it to fight for him. Open questions for when it is fleshed out: how many he can
  hold, whether a summoned one is spent or returns, what it costs (embers are the natural price), whether elites and
  wing keepers can be taken, and where on the mountain he finds it. *19 Nov 2026: you named this as a likely prize
  for the great puzzle of phase 22.*

## The order, and why

1. Phases **0 to 2** settle the rules of the world: moving, falling, resting.
2. Phases **3 to 7** settle how the game teaches, feels and fights.
3. Phases **8 and 9** finish the look and make the mountain one place.
4. Phases **10 to 18** are the content. Because they come last, every new room, creature and keeper is built once, on
   the final rules.
5. Phases **19 and 20** finish and ship it.
6. Phase **21** adds a miniboss to every level. It is last because each one is cut into a level that is otherwise
   finished, and is fought with everything he has by then.
7. Phase **22** adds a puzzle to every section, and one great puzzle across all of them. It is after everything
   else for the same reason: its pieces are set into sections that are otherwise finished.

Content waits on the rules because otherwise each rule change would mean revisiting every room built before it. That
is the rework this order avoids.

## Old lists this replaces

| Old list | Where it now lives |
|---|---|
| The Metroidvania plan, steps 3 to 6 | Phases 8, 9, 10 to 14, 16 |
| The Ember plan, step 4 | Phases 10 to 14 |
| The water plan | Phase 2 |
| The phone gaps | Phase 20 |
| The two playtests | Phases 1 to 8 |

Each item from the playtests is in exactly one phase.
