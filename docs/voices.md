# How the folk's voices are made

The mountain's folk "talk" in mumble speech: short vowel sounds, made on the spot in the browser (Web Audio) as each
line types out. Nothing is recorded and nothing is added to the download. The method is the one in the owner's notes
on mumble speech (shared 2026-11-16): **one formant-filtered vowel a syllable, pitched by the punctuation.**

## Where it lives

| File | What it does |
|---|---|
| `src/audio/voice.js` | The profiles (`VOICES`, `voiceOf`), the line planner (`planLine`), the typing rhythm (`pauseAfter`), the synthesizer (`utter`) |
| `src/side/talk.js` | The dialogue box's typewriter: each character, then a wait; a letter that starts a syllable is spoken |
| `src/audio/sfx.js` | `say(profile, syllable)`, and the voices' own volume bus (`MIX.voice`) |
| `src/side/main.js` | Options: **Voices** (off, low, mid, full) and **Text** (slow, normal, fast, at once) |

Each sound is set off by its own letter appearing, so the voice cannot drift from the text; a press that finishes a
line early simply stops it. **At once** shows the whole line straight away, with no voice.

## The steps

1. **The typing rhythm.** After each character the typewriter waits a base 30 ms (divided by the speaker's `rate`,
   times the Text speed) times: 1 after a letter or space; 3 after a comma, semicolon, colon or spaced dash; 6 after
   a full stop, question or exclamation mark ending a sentence; 4 after the last dot of "..."; 9 after "…".
2. **Reading the line.** The line is split into phrases at punctuation. A sound starts only where a group of vowels
   starts (one sound a syllable, about ten a second). A "y" starting a word is a consonant; a lone final "e" in a
   word of more than three letters is silent once the word has had a syllable. The group's first letters pick one
   of five vowels (a, e, i, o, u; "oo"/"ou" u, "ee"/"ea"/"ie" i, "ai"/"ay"/"ei" e, "oa" o).
3. **The tune.** Through a phrase the pitch falls from 1.05 to 0.94 (a multiplier on the speaker's own pitch). A
   question's last word rises (+0.12 to +0.24); an exclamation starts higher and falls further; trailing dots fade
   to about half and sink; a word in capitals is a shout (×1.22, ×1.55 louder).
4. **One sound.** A buzz (sawtooth; a second an octave down for gravel; breath noise under it) through three
   band-pass filters at the vowel's formants (Peterson and Barney's averages, moved together by the `tract`), a
   low-pass for the top, and an envelope that swells over 30 ms, holds and lets go. About 130 ms long; each overlaps
   the next a little, so the syllables run together. The pitch sags 3% over the sound, wobbles with age, jitters
   with rasp, and every syllable is nudged at random by up to 2.5%.
5. **A hint of the words (build 55).** The letters just before a syllable's vowel shape how it starts (`onsetOf`):
   **s, f, sh, h, z, c** a hiss (a short burst of high noise, the voice coming in softly after it); **p, b, t, d, k,
   g** a pop (a click of noise and a hard, fast start); **m, n** a hum (a low closed sound first, then the vowel
   opening); **r, l, w, y** a roll (the second formant glides up into the vowel). A vowel with nothing before it
   starts plainly. It is not speech: only the shape of speech. A voice's `artic` (0 to 1) sets how strongly.
6. **Each their own way of talking.** `hold` stretches or clips every sound; `rise` lifts the end of every phrase, not
   only questions; `comma` lengthens the wait at a comma.

## The folk's voices

| Who | Voice | Why |
|---|---|---|
| Ordric of the Vigil (`lamplighter`) | 138 Hz, the slowest, long held vowels, breathy, part whisper, a slow wobble, soft starts | An old moth: papery, patient, warm, faithful past understanding why |
| Mirel the Penitent (`wren`) | 212 Hz, a woman's tube, mouth half shut, the quickest, each sound clipped short, every phrase rising at its end | Under a borrowed shell, keeping her count: breathless, never sure she has done enough |
| Mirel, the shell put down (`wren_free`, from the Gardens) | The same pitch, slower, the mouth open, sounds held, a wide tune, no rise | The same woman, at rest |
| Corwen the Annalist (`scribe`) | 122 Hz, even and nearly flat, a rook's gravel, through the nose, the sharpest consonants, a longer wait at every comma | He writes the mountain down exactly, clause by clause |
| Hob of the Guild (`hob`) | 92 Hz, a big low tube, mouth half shut, heavy gravel, dark, consonants nearly swallowed | A mole in the Deep: a mutter |

Anyone not in the table gets a fixed voice from a hash of their name (a grown man or woman), so a new speaker never
sounds like a default and always sounds the same.

## Adding or tuning a voice

Add a line to `VOICES` in `src/audio/voice.js`, keyed by the name the level's marker uses. Fields: `f0` (Hz),
`tract` (1 a grown man, ~1.15 a woman, ~1.3 a child), `breath`, `rasp`, `nasal`, `whisper` (0-1), `wobble` and
`wobbleHz`, `rate`, `range` (how far the tune moves), `lilt`, `bright`, `closed` (a mouth half shut), `wave`, `vol`, and the
four above: `artic`, `hold`, `rise`, `comma`.
`tests/voice.test.mjs` checks the planner against the method's own examples.

## What it costs

No download. About 6 to 10 short-lived audio nodes a syllable, about ten syllables a second, each gone after 200 ms:
light, phones included. A slow frame says at most two syllables at once, so a stutter cannot pile sounds up.
