# Phase 20: the phone, the polish, and the release (the sheet)

*Written 28 Nov, from the roadmap's phase 20 and a look through the game as it is at build 124. Two things on it are
built already, on a branch of their own and not yet in a build: the save kept twice, and the phone's buzz. They change
nothing you see and nothing you would decide, and each has a test. Everything else here is a proposal, for your yes,
and nothing of it is built.*

## What this does to the game

- **Today:** on a phone it plays, with the touch pad and the phone mode (one region kept painted, half the motes, three
  lights). The phone does not buzz. On an iPhone it is played in the browser, with the browser's bars. One copy of the
  save. The itch.io page is as it was made at build 80.
- **After:** the phone buzzes on Android. The game knows when the phone is struggling and draws less. The save is kept
  twice. The touch buttons can be moved about and the words made bigger. A check walks the whole game in order. The
  itch.io page shows the game as it is now, with a short clip.

*As built: items 1 and 7 in build 127 (`docs/builds.md`). The rest waits for your yes.*

## The phone

### 1. Vibration on Android (built)

**What was there.** Every hit that lands, every hit taken, a death, a keeper's landing and its fall call one thing,
`buzz()` in `main.js`. It only ever ran a pad's rumble (`core/input.js` `rumble`), which needs a pad plugged in. On a
phone it did nothing. (The old 3D game called the phone's own buzzer; the side view never did.)

**Built.** `src/side/vibrate.js`, called from `buzz()` beside the pad's rumble:

| Asked | It is | Why |
|---|---|---|
| "Vibration on Android" | **Every buzz the game already makes goes to the phone as well,** while the touch pad is what you play with and no pad is plugged in | So nothing new had to be chosen: the same moments as a pad |
| Not said | **A phone's buzzer has one strength, so a lighter hit is a shorter buzz.** A hit that lands: 15 thousandths of a second (a tap). A hit taken: 140. A death: 400, the longest | A pad has a strong motor and a weak one; a phone has neither |
| Not said | **A short buzz never cuts off a longer one still going** | Otherwise a hit straight after a death would stop the death's buzz |
| Not said | **Under the same option as the pad's rumble** (Options, Rumble). Turning it on buzzes once, on a phone too | |
| Not said | **On an iPhone, nothing.** Safari has no way for a page to use the buzzer | Nothing can be done about this in a web page |

**Risk.** With the Thorns (five cuts a combo) that is five taps in about a second. It may be too much. Question 1.

### 2. Opening like an app from the Home Screen, on iPhone

**What is there.** `side.html` already fills the screen round the notch (`viewport-fit=cover`), colours the bar,
stops pinch zoom, and asks for the phone to be turned. It has none of what makes a page open without the browser's
bars from the Home Screen: the `apple-mobile-web-app-capable` tag, a web app manifest, a Home Screen icon.

**The catch.** On itch.io the game is played inside itch's page, in a frame. "Add to Home Screen" in Safari adds
itch's page, not the game, and the game's own tags do nothing from inside a frame. So on itch.io the game cannot do
this by itself. As far as I know an iPhone does not let a page go full screen either (an iPad does); itch's
fullscreen button may only make the frame fill the page. That wants checking on your phone.

**Proposal.**

- Add the tags, a manifest (full screen, held sideways) and an icon to `side.html`. They cost nothing and work
  wherever the game is its own page.
- Give the game an address of its own as well as itch.io (GitHub Pages, from this repository: no build step is
  needed). The itch.io page says: on an iPhone, open this address, then Share, Add to Home Screen.
- The icon is one picture, 180 by 180, made from the cover. Shown to you first.

**Risk.** An iPhone keeps a Home Screen app's storage apart from Safari's. A save made in Safari is not in the app, and
the other way round. Someone moving to the app starts again, unless the save can be carried across (question 3).

### 3. A lower drawing size when the phone struggles

**What is there.** The world is drawn at 248 rows whatever the screen, and stretched. The last pass (the lights, the
glow, the dither) is drawn at the screen's own size, at one dot per browser pixel: on an iPhone that is already a
third of its real pixels each way. Phone mode halves the motes and the lights. Nothing measures how fast the frames
come.

**Proposal.** The game watches how long each frame takes. If it stays slow (under about 45 frames a second) for three
seconds, it steps down once, and again if it is still slow:

1. The last pass drawn at the world's own 248 rows and stretched. The picture is nearly the same; the light's edges
   go blockier.
2. No glow round torches, crystals and flames. This one changes the look.
3. 30 frames a second. The game already runs on the time between frames, so it plays the same, less smoothly.

It never steps back up in the same region, so it does not flicker between the two. In Options: "Drawing: auto, full,
light". Pictures of each step before it goes in.

**Risk.** Step 2 is a change of look you have not seen. The measure can be fooled by a frame that is slow for another
reason (a region being made, the page coming back from the background); those moments are left out of it.

### 4. Smaller paintings

**What is there.** Each region is painted once as three pictures: the back, the rock he stands on, and the map of how
light falls on it. They go to the graphics card in squares of 1024. The biggest, the Tempest, is 3840 by 3128: about
48 MB each, 145 MB for the three. The Cloister and the Firmament are not far under; the regions of the Deep are 12 to 27
MB for all three. Phone mode keeps one region painted, a computer three.

**Proposal.** On a phone, only the squares within about two screens of him are on the graphics card; the others are
let go as he leaves them and sent again as he comes back. That is about six squares of each picture, some 70 MB in
place of 145 for the Tempest. The picture does not change at all.

**Risk.** A square sent while he runs can cost a stutter. The squares are already sent one at a time between frames
when a region is made; the same is done here, a screen ahead of him. It is also the most work of anything on this
sheet, so it waits for the test on your phone (6) to show that memory is the trouble.

### 5. Fewer creatures awake

**What is there.** A creature at rest more than 24 units across from him, or 15 up or down, sleeps: it does not think
and is not drawn (`SLEEP` in `enemies.js`). The screen is 15.5 units tall and 27 to 33 across on a phone, so they sleep
about ten units past its edge. One hunting him, or in the middle of something, never sleeps.

**Proposal.** In phone mode, 18 across and 12 up or down: still past the edge of the screen. Only if the test on your
phone shows the creatures cost anything; I have not been able to measure it here.

**Risk.** One woken closer in is seen starting its walk as it comes into view. Fights are not changed: a creature that
is hunting him stays awake.

### 6. A test on your own phone

**Proposal.**

- **A readout:** the frames a second, beside the place (Options, Place: shown). So what the phone does is a number.
- **The list,** for an Android phone and an iPhone, ten minutes each:
  1. It starts, the title comes up, the pad works.
  2. A hit buzzes (Android), a death buzzes longer. Options, Rumble off: nothing.
  3. Ten minutes in the Tempest, the biggest painting. Does it stutter? Does the phone get hot? Does the page reload
     by itself? (That is what Safari does when a page runs out of memory.) Note the frames a second.
  4. Lock the phone in the middle of a climb, wait a minute, unlock. Still there, the shards still counted.
  5. Close the tab and open the game again: "Continue" takes you to where you were.
- What it shows decides 3, 4 and 5.

### As built: build 128

| The sheet said | It is | Why |
|---|---|---|
| "A readout: the frames a second, beside the place (Options, Place: shown)" | **So,** at the foot of the screen in the middle | Beside the place, at the right, it was under the touch rings |
| "Add the tags, a manifest (full screen, held sideways) and an icon to `side.html`" | **So.** The icon is cut from the cover round him, not the cover whole | The cover's title does not fit a square |
| "Give the game an address of its own as well as itch.io" | **Not done** | Decided against for now (0.37): it is switched on in the repository's settings, and it puts the game somewhere new |
| "Copy save and Paste save in Options, as a line of text" | **So.** The line starts `CLIMB-SAVE-1:`; a paste is asked about once more before it replaces a save | |
| "Text size: normal, large. Large draws that picture 144 rows tall... and the menus' letters a quarter bigger with it" | **So,** over the play. The pages over a pause stay at 180 | They are laid out to fill the picture; at 144 they would not fit |
| "Rumble" renamed (question 1) | **"Rumble and vibration"** | |
| Not said | **The phone's flask, embers and swap buttons set by the picture's rows,** under the weapon's box | On a short phone they lay over it |
| Not said | **A menu too tall for the screen is moved up to fit** | Options ran off the foot of a phone held sideways |

## The polish

### 7. The save made robust (built)

**What was there.** One copy of the save in the browser's storage, written whole at every change, read once at the
start. A browser writes it all or none of it, so a half-written save is not the danger it would be on a disk. The
dangers are the copy cleared or spoiled with nothing behind it; a write the browser refuses when its storage is full
(it was ignored, which is right: the last one stays); the writes the game holds back for two seconds (shards picked up,
rooms seen, creatures met) lost when the page is shut; and one fault, found here, below.

**Built.** In `src/side/state.js` and `main.js`:

| Asked | It is | Why |
|---|---|---|
| "The save written twice" | **The same save under a second name, `climb-side-backup`, written only after the first has gone in and been read back whole** | So at every moment at least one whole copy is there |
| "Read the backup if the main copy is missing or does not parse" | **So.** Also when it is not a save at all (empty, a number) | |
| "Never lose a save to a half-written write" | **A write the browser refuses leaves what was there, in both.** If the storage is too full for the save beside its copy, the copy is let go and the save goes in: never the progress for the copy | The copy is there to keep progress, so it must never cost any |
| Not said | **Beginning again clears both** | Or the old save would come back from its copy |
| Not said | **Trying a place from the title touches neither** | As before: it is written beside the save |
| Not said | **A write still waiting when the page is put away is made then:** the phone locked, another app, the tab shut | Up to two seconds of shards could be lost |
| Not said | **Watching the keepers from the title writes nothing while it plays** | The fault: it wrote over the save as it went (no keepers faced, and the watched region to continue from), and put the save back only at the end. Shut in the middle, the save stayed as the watching had left it |

**Saves.** A save from build 124 loads exactly as it did: checked against build 124's own loader on seven saves (none,
an empty one, a list, a null, a spoiled one, an old one from before the wings, one from build 124), and in the test. The moves of old saves
(`ORG115`, `rebase` and the rest) are not touched. Its first write after that makes the copy.

**Not done.** A copy of the save the player holds (question 3). The browser's storage belongs to the page's address
on that device and that browser: clearing the site's data, or a private window, loses both copies together.

### 8. Moving the touch buttons

**What is there.** The left of the screen is the stick wherever the thumb lands. Four rings on the right, two by two:
block and roll above, attack and jump below. Flask, embers and swap at the top left, under the hearts. Nothing can be
moved or made bigger. The keyboard's keys and a pad's buttons cannot be changed in the side view either (the old 3D
game's settings had that; `core/settings.js` still can).

**Proposal,** one of:

- (a) Each of the four rings can be given any of the four actions (in Options: touch a ring, then the action).
- (b) Two layouts (jump bottom right, as now; or attack bottom right) and three sizes of ring.
- (c) Every button dragged where you want it, and its size set.

I would do (b): the least to go wrong on a small screen, and it answers "my thumb does not reach". (c) is the most
work and the most to break. With any of them the hints still name the action's own mark (▲ for jump), which moves
with it, so the words stay right. The keys and the pad could get their own screen at the same time (question 6).

**Risk.** A layout that puts a ring under the hearts or the map. (b) has only layouts that have been looked at.

### 9. Text size

**What is there.** Options, "Text" is how fast the words come, not how big they are. Everything over the play (the
people's words, the banners, the cards, the map, the hearts) is drawn as a small picture 180 rows tall and stretched
to the screen, so the letters are always one 26th of the screen's height: about 15 browser pixels on a phone held
sideways. The menus are ordinary page text.

**Proposal.** "Text size: normal, large". Large draws that picture 144 rows tall in place of 180, so everything on it
is a quarter bigger, and the menus' letters a quarter bigger with it. One number, so nothing is laid out again.

**Risk.** A quarter more of the play is covered by a talk box or the map. The other way (only the words bigger) means
laying out every box of words again, and is much more work.

### 10. A full playthrough check

**What is there.** Each region on its own: every place reached with the abilities he has there, nothing behind a gate
without its ability (`tests/helpers/reach.mjs`), nowhere to be stuck (`side-stuck`), no low lip on a path
(`side-walk`), and the joins up out of the Deep (`side-throw`).

**What is missing.** One check that goes through the whole game in order, from a new save: each region from where he
comes in to where he leaves it, with only what he has by then; each ability where it is got; the throw; the Deep
climbed; the Shard; the end. And each gate checked from the side he first comes at it.

**Proposal.** That check, as a test (`tests/side-playthrough.test.mjs`), built on the region checks there are. And one
playthrough by a person (you, or your brother) with the place shown (Options, Place), noting anywhere he could not get
on.

**Risk.** It is slow: the throw's test, which checks four joins this way, takes about a minute and a half. It would be run with the full
tests, not on every change.

## The release

### 11. The itch.io page

**What is there.** `itch-page/`, made at build 80: the cover, the banner, five pictures (the Gardens, the Warden, a
fight in the Cloister, the Spires, Ordric), the description, the form's fields, a shot list for a 40-second clip. No
clip. It says "in development, phase 17 of 22". `tools/record-clip.mjs` can record the game a frame at a time.

**Proposal.**

- New pictures from the game as it is: a keeper's fight, the Deep, the Shard from below, one at a phone's shape.
- The text brought up to the end of the story, without giving away the throw (question 10).
- A clip of about 30 seconds, from the shot list, recorded in the headless browser. Shown to you before it goes up.
- "Mobile Friendly" ticked only after the test on your phone.
- Nothing is uploaded by me: it goes up when you say.

### 12. The zip inspected

**What is there.** `tools/build-itch.mjs` makes it; `tools/check-build.mjs` opens it in a headless browser, the title
and every region; `tools/push-itch.sh` will not push a build without its entry in the build log. At build 80: 591
files, 22.8 MB.

**Proposal.** The same again on the release build, and: the ten largest files listed (anything not needed comes out),
every path inside itch's limits, the save's name unchanged (so every save carries over), and the game opened from the
itch.io page on your phone.

## Found while looking

- **Watching the keepers wrote over the save** (7, above). Mended on the branch.
- **Putting the page away writes the old 3D game's save,** an empty one under `the-climb`, each time (`core/input.js`
  calls the old game's `save()`). It does no harm to the side view's save. It can go when the old game's code does.
- **`docs/process/release.md` is the old 3D game's** (`npm run check`, its playthrough bot, `SAVE_VERSION`). The side
  view's release is `tools/push-itch.sh`. It wants writing again in this phase.

## The order

1. **The save kept twice, and the phone's buzz.** Built; they go in with the next build.
2. **The frames-a-second readout and the list,** then you play on your phone. What it shows decides the next.
3. **Whichever of the drawing steps, the paintings by squares, and fewer creatures awake** the phone asks for.
4. **The Home Screen:** the tags, the manifest, the icon (after question 2).
5. **The touch buttons and the text size.**
6. **The playthrough check.**
7. **The itch.io page, the clip, the zip.** Then the release (question 9).

**Drawings wanted:** the Home Screen icon, made from the cover in code. No paid drawing.

## What I am not sure of

- **What costs on your phone.** I cannot hold a phone here. 3, 4 and 5 are what usually costs on a phone; which of
  them this game needs is for your test to show.
- **How long Safari keeps a page's storage.** Safari can clear what a site has stored if the site is not visited for a
  while. Whether that reaches a game played in itch.io's frame I do not know. A copy of the save the player holds
  (question 3) would answer it either way.
- **itch.io's fullscreen button on an iPhone.** What it does there wants seeing.

## To decide

1. **The phone's buzz: as built?** A tap on every hit, longer on a hit taken, longest on a death. And the option's name:
   "Rumble", or "Rumble and vibration"? I would keep the buzz as it is until you have felt it, and rename the option.
2. **Where iPhone players play:** only on itch.io (no Home Screen app), or also at the game's own address, which can
   be put on the Home Screen? I would do both, with the itch.io page saying how.
3. **A copy of the save the player holds:** "Copy save" and "Paste save" in Options, as a line of text. It carries a
   save from Safari to the Home Screen app, or to another phone. I would do it.
4. **When the phone struggles:** the three steps, by themselves, never back up within a region, with "Drawing: auto,
   full, light" in Options? I would do it, with pictures of each step first.
5. **Fewer creatures awake on a phone:** only if the test shows they cost? I would wait for the test.
6. **The touch buttons:** (a) any action on any ring, (b) two layouts and three sizes, or (c) drag them anywhere? I
   would do (b). And should the keys and the pad be changeable in the side view at the same time? I would do it after.
7. **Text size: normal and large,** large a quarter bigger, everything over the play with it? I would do it.
8. **The playthrough check, as a test and by a person:** yes?
9. **Does the release wait for phases 21 and 22?** The roadmap says it waits for 21 if the minibosses are to be in
   it. I would bring the itch.io page up to date now (it is public already) and leave "Released" until they are done.
10. **The page's text: does it give away the throw and the Deep?** I would show the Deep's look and not say how he
   comes to be there.

### Decided (28 Nov)

*Left to my judgment (decision 0.37): "decide on your own based on your own understanding and your estimation of what I would want." Any of these can still be changed.*

1. **The buzz as built.** The option is renamed "Rumble and vibration".
2. **On itch.io only, for now.** The Home Screen tags, the manifest and the icon go into `side.html`, since they cost nothing. An address of its own (GitHub Pages) waits: switching it on is in the repository's settings, and it puts the game somewhere new.
3. **Yes:** "Copy save" and "Paste save" in Options.
4. **Yes:** the three steps by themselves, with "Drawing: auto, full, light" in Options. The pictures of each step go in the build's pictures.
5. **Wait for your phone's numbers.**
6. **(b): two layouts and three sizes.** The keys and the pad are changeable after.
7. **Yes:** normal and large.
8. **Yes:** the playthrough check as a test. The person's part is your brother's playtest.
9. **The itch.io page is brought up to date now;** "Released" waits for phases 21 and 22.
10. **The Deep's look is shown, and how he comes there is not told.**
