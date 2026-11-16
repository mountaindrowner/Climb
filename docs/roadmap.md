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
- **Published,** and the itch.io zip rebuilt and inspected.
- **The docs updated,** so the next phase starts from what is true.

What I cannot judge: feel, sound, and how hard something is for a person. Each phase's playtest list is aimed at
exactly those.

## Phase 0: decisions (one conversation, before any building)

Each comes with my recommendation, so you can mostly say yes or no.

| # | Question | My recommendation |
|---|---|---|
| 0.1 | The rest points | **Pools of the blue water, as agreed.** Ordric hangs a lamp over each. He is raised out of the last pool he touched |
| 0.2 | What a fall looks like, now the rewind is going | **He comes apart into water.** The screen goes to the pool's moment ("raised N times"), and he rises from the last pool. No rewind. Keep rewinding in reserve as a possible later power |
| 0.3 | What breaks cracked stone | **Not the blade any more.** The Warden's weight (the plunge) breaks it, and so does the spade on every blow. One clear rule: the blade cuts, the heavy things break |
| 0.4 | The spade | **A real second weapon:** a slow three-blow combo of its own, its own plunge, and it digs (breaks stone and turns up buried things). Every later weapon gets its own combo and one thing only it does |
| 0.5 | What a keeper leaves | **Something you can hold:** the Warden leaves its core, the Toll its clapper, and so on. It goes into a new **"what he carries" screen** and gives the power. Getting it is a short staged moment, then a room right after where he must use the new power |
| 0.6 | The three people | **Fewer meetings, each in a memorable spot, harder to find,** and they stay where they were met so you can go back. Each says who they are in one line the first time. Ordric's help becomes a real shop screen. Mirel and Corwen each give something too (Corwen: his map marks; Mirel: one thing at the end of her story) |
| 0.7 | Between regions | **One continuous climb.** The passages between regions become the loading: the next region is made while he climbs the passage, and he walks straight into it, with no fade or card. The cards stay for the start and the very end |
| 0.8 | Bigger map | **The world plan already triples the mountain**: 11 wings, longer passages, the Deep. Each region also gains 3 to 6 rooms when its wings are built |
| 0.9 | Voices | **Keep the made-on-the-spot mumble voices.** Real recorded voices (ElevenLabs) would need an account, a key and a few dollars, and clash with "short and plain". Revisit only if the mumble still feels thin after tuning |
| 0.10 | The art budget | PixelLab has **$3.43** left. Phases 1 to 9 need about $1. The new creatures, wing elites and the Deep need roughly **$10 to $20** more (estimate). **Either add credit before phase 10, or draw more creatures in code**, as the keepers are drawn |
| 0.11 | Difficulty | **Climber** (the middle setting) should feel like Hollow Knight's early game: each keeper takes a few tries. Story gets two more hearts, Summit two fewer, as now |

## Phase 1: fix what is broken

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

- **Every flame becomes a pool of the blue water.** One shared look, a rim in each region's stone (rock pool, font,
  basin, meltwater, cistern, fountain, mirror pool, trough). Ordric's lamp hangs over each.
- Touching one: hearts and flask filled. Down: the knots. A fall raises him there.
- **The intro:** his fall ends in the water, with a splash and the light; then he wakes. The intro gets quiet music.
- **A fall:** no rewind. He comes apart into water, then the pool's moment, then he rises out of the last pool he
  touched.
- **Every word that says "flame"** for a rest point says water. The story's flame (the summit, the ending) stays fire.
  Torches stay as light.
- Update `docs/story.md` and `docs/world.md`: "a flame kept for him" becomes "water gathered for him", which is still
  something given.

*Art cost:* none (drawn in code).

## Phase 3: teaching, and words

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
- placed by decision 0.6, spread out and harder to find;
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

Built two regions at a time. Each wing gets its sheet first: its rooms, what each room is for, its gate and shortcut,
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

## The order, and why

1. Phases **0 to 2** settle the rules of the world: moving, falling, resting.
2. Phases **3 to 7** settle how the game teaches, feels and fights.
3. Phases **8 and 9** finish the look and make the mountain one place.
4. Phases **10 to 18** are the content. Because they come last, every new room, creature and keeper is built once, on
   the final rules.
5. Phases **19 and 20** finish and ship it.

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
