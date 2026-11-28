// The people on the mountain, and what they say. Three of them go up it as he does: Ordric of the Vigil, who keeps the
// flames and does what he can for shards; Mirel the Penitent, a pilgrim; and Corwen the Annalist, who records it. Each has something to say in each
// region (SCRIPT[who][region], a list of lines; said once in full, then its last line again).
//   makeTalk(hud) -> { on, start(who, lines, after), press(), draw(H, dt) }: a box at the top of the picture, the words
//   typed out; a press finishes the line, the next press goes on. Each character waits by what it is (a comma longer,
//   a full stop longer still: voice.js pauseAfter), at the speaker's own rate, and each letter that starts a syllable
//   is spoken in the speaker's voice (voice.js), so a line cut short by a press simply stops.
import { say } from '../audio/sfx.js';
import { planLine, pauseAfter, voiceOf, BASE } from '../audio/voice.js';
import { OPT } from './state.js';
import { INTRO } from './teach.js';
// the text speed (Options): how long each wait is, or the whole line at once (and then no voice)
export const TEXT_SPEED = { slow: 1.6, normal: 1, fast: 0.5, now: 0 };
import { text, width, fine } from './pixelfont.js';
// (build 126) the three, once more each, at the summit after the Fallen (docs/phase18-sheet.md 5). These words are for
// the designer's yes. Corwen's last page has one line on it if he has stood at the Source, and nothing if not
export const SUMMIT = {
  wren: () => ['I came up behind you. I did not count the falls.', 'This is where it stood. I thought I would feel something, being here.', 'I will sit a while.'],
  scribe: src => src ? ['The last page.', 'One line on it. How far down the water goes, under the mountain.', 'Nothing else.'] : ['The last page.', 'I have nothing to put on it.'],
  lamplighter: () => ['I brought a lamp up.', 'I have not lit it. It was never mine to light.'],
};
export const PEOPLE = { lamplighter: { name: 'ORDRIC OF THE VIGIL', art: 'px_moth', col: '#feae34' }, wren: { name: 'MIREL THE PENITENT', art: 'px_hermit', col: '#63c74d', late: { from: 4, art: 'px_hermit_free' } }, scribe: { name: 'CORWEN THE ANNALIST', art: 'px_rook', col: '#2ce8f5' }, hob: { name: 'HOB OF THE GUILD', art: 'px_mole2', col: '#feae34' } };
// `late`: from that region up, another drawing (Mirel has put her shell down by the Gardens).
// They are the mountain's own folk, not people: Ordric an old moth, Mirel a hermit crab, Corwen a rook (docs/cast.md). The
// only human shapes on the mountain are he and the Fallen, and what is left of the peoples who tried to carry the light.
// Their keys are what the level's markers call them (lamplighter, wren, scribe); their names are above. See docs/story.md:
//   Ordric keeps the lamps by the water because he was asked to and no one has told him to stop: faithful, and past understanding why.
//   Mirel climbs to arrive deserving it. She carries a great borrowed shell and counts her falls so they can be held
//         against her; the water keeps giving her back anyway, and somewhere above the storm she puts the shell down.
//   Corwen records the mountain exactly and cannot account for it.
// where each one's face is in their standing drawing (its top-left, and how many pixels square: 32 is shown 1:1): the box shows the head, not the
// middle of the figure (Mirel's middle is her shell)
const FACES = { px_mole: [14, 8, 32], px_mole2: [12, 0, 32], px_moth: [18, 7, 32], px_hermit: [22, 10, 32], px_hermit_free: [22, 10, 32], px_rook: [20, 8, 32] };
// Hob is met only in the Deep, so his lines are by region index from the Workings (6) down
const HOB = []; HOB[7] = ['The dark down here is not empty. I have never worked out what is in it.', 'It keeps to where you have already been. Watch the lamps. They seem to matter to it.', 'I do not turn back in the Vein. I could not tell you why.'];   // (26 Nov, decision 0.27: he hints, he does not say what to do)
HOB[8] = ['The pump was my grandfather\'s. It has never stopped.', 'There are holes in the walls along here, and something in them. I have not seen what sets it off. Watch how you pass.', 'There is a lamp on the chapel altar that I never filled. It may be worth a look.'];
// (build 122) met by one who was thrown down and is climbing out: he comes on Hob from below, the Vein first. His own
// lines for that, by region as HOB's are (the words are for the designer's yes: decision 0.27 holds)
export const HOB_UP = []; HOB_UP[7] = ['You came up out of the dark. I have not seen anyone do that.', 'I am Hob. I fill the guild\'s lamps. There is no guild.', 'Whatever is behind you keeps to where you have been. I would not go back for anything.'];
HOB_UP[6] = ['You again. Going up. Nobody goes up.', 'The cage has not run in my time. There is an engine for it somewhere over the shaft. I never went to look.', 'I will be further down. I always am.'];
HOB[6] = ['I am Hob. This is the Deep: the guild\'s mines, under the mountain.', 'It is not the way up. Come down here for what is hidden, when you are ready.', 'I will be further down. I always am.'];
// (build 77, from a playtest: the lines were too vague. Each meeting now says, in order: who or where; what to do next
// or how; and one line of their own. docs/writing.md, "Two voices")
export const SCRIPT = {
  hob: HOB,
  lamplighter: [
    ['You fell from the top. The water brought you back. It always will.', 'The way up is through these caves. The Warden guards the top of them.', INTRO.lamplighter],   // who he is (teach.js): said the first time he is met, wherever that is
    ['This house rang its bell for the flame. The bell still rings.', 'The doors in this house keep to the bell. I never learned its count. Listen to it.', 'The Toll hangs in the chapel at the top. Shards, if you have them.'],
    ['The pass is above us. The Wyrm coils on it.', 'The wind on the open faces is not steady. Something in it comes and goes. Watch it a while.', 'Shards, if you have them.'],
    ['The storm is above us. The Thunderhead turns in the middle of it.', 'The air goes up in places here. I never could ride it. I always wanted to do the carrying.', 'Shards, if you have them.'],
    ['Sun. I had forgotten it has a smell.', 'Mother Thorn grows at the top of this garden. The summit is past her.', 'Shards, if you have them.'],
    ['This is my last lamp. The summit is just above us.', 'What waits there looks like you. It holds a lamp, and will not put it down.', 'Go up. You are expected.'],
  ],
  wren: [
    [INTRO.wren, 'I count every fall. I mean to arrive deserving it.', 'Break the urns you find. There are shards inside.'],
    ['Forty falls. I keep the count so it can be held against me at the top.', 'Look in the high places. Red threads are caught there. Three make a new heart.', 'Mine is grey. I do not know why you were given red.'],
    ['My hands have stopped working. I will not rest. Resting is how the count goes up.', 'There is a crack in the rock near here, with a draught through it. Something is behind it.'],
    ['I cannot carry my shell through this storm. I have tried.', 'Each time I fall, the water brings me back, and the shell is waiting on the bank.', 'I have not earned that. It keeps happening.'],
    ['I put the shell down. Over there, in the flowers.', 'I went back for it twice. It was never mine. I found it on a shore.', 'I have stopped counting. I do not know what to do with my hands.'],
    ['This is as far as I go, for now. I can see the top from here.', 'What is up there is yours to face.', 'Go on. I will follow. There is no hurry any more.'],
  ],
  scribe: [
    [INTRO.scribe, 'These caves are the Roots. The whole mountain stands on them.', 'Open your map to see where you have been.'],
    ['This house kept the flame\'s hours. Every mark on these walls is a night they rang.', 'The last mark is a night with no bell.'],
    ['The Spires. Nothing was built here. The pass at the top is the only way on.'],
    ['The Tempest is new. My oldest pages show clear sky here.', 'The storm came when the flame went out.'],
    ['The Gardens fed the keepers of the flame. They grow well with no one tending them.', 'I have no entry that explains that.'],
    ['The Firmament. I have charted every star from here but one.', 'That one is on the ground, up ahead, and dark. I have left the page open.'],
  ],
};
const wrap = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(' ')){ const t = line ? line + ' ' + word : word; if (width(t) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
export function makeTalk(){
  const S = { on: false, who: '', lines: [], i: 0, n: 0, after: null, held: 0 }, faces = {};
  // a face for the box: the head and shoulders of their standing drawing, at a whole number of pixels to one
  const face = (who, art) => { const key = who + (art || ''); if (faces[key] !== undefined) return faces[key]; faces[key] = null; const P = PEOPLE[who]; if (!P) return null; const im = new Image(); who = key; im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const at = FACES[art || P.art], s = at ? (at[2] || 16) : y1 - y0 > 50 ? 32 : 16; faces[who] = at ? { im: c, x: at[0], y: at[1], s } : { im: c, x: Math.max(0, Math.min(c.width - s, Math.round((x0 + x1) / 2 - s / 2))), y: Math.max(0, y0 - 1), s }; }; im.src = `assets/side/${art || P.art}/stand.png`; return null; };
  // whose voice: Mirel's opens out once she has put the shell down (her late drawing)
  const voiceKey = (who, art) => who === 'wren' && art && PEOPLE.wren.late && art === PEOPLE.wren.late.art ? 'wren_free' : who;
  const line = () => { const L = S.lines[S.i] || ''; if (S.planned !== L){ S.planned = L; S.plan = planLine(L); } S.due = 0; };
  S.start = (who, lines, after = null, art = null) => { S.on = true; S.who = who; S.art = art; S.voice = voiceOf(voiceKey(who, art)); S.lines = lines.slice(); S.i = 0; S.n = 0; S.after = after; S.held = 0; face(who, art); line(); };
  S.press = () => { if (!S.on || S.held < 0.15) return; const L = S.lines[S.i] || ''; if (S.n < L.length){ S.n = L.length; return; } S.i++; S.n = 0; S.held = 0; line(); if (S.i >= S.lines.length){ S.on = false; const a = S.after; S.after = null; if (a) a(); } };
  S.draw = (H, dt, t) => {
    if (!S.on) return; S.held += dt; const g = H.g, W = H.W, C = H.C, P = PEOPLE[S.who] || { name: S.who.toUpperCase(), col: C.cream }, L = S.lines[S.i] || '';
    const mul = TEXT_SPEED[OPT.text] ?? 1;
    if (!mul) S.n = L.length;
    else { S.due -= dt; let k = 0; while (S.due <= 0 && S.n < L.length){ const i = S.n++, syl = S.plan.get(i); if (syl && k++ < 2) say(S.voice, syl); S.due += pauseAfter(L, i, S.voice) * BASE / (S.voice.rate || 1) * mul; } }   // (a slow frame says at most two at once)
    const bw = Math.min(300, W - 16), x = Math.round((W - bw) / 2), y = 8, bh = 46;   // at the top: he and whoever speaks stand at the foot of the picture
    H.px(C.ink, x - 1, y - 1, bw + 2, bh + 2); H.px('#262b44', x, y, bw, bh); H.px(C.ink, x + 1, y + 1, bw - 2, bh - 2); H.px(P.col, x + 1, y + 1, bw - 2, 1);
    const f = face(S.who, S.art); H.px('#262b44', x + 4, y + 5, 36, 36); H.px(C.ink, x + 5, y + 6, 34, 34);
    if (f){ g.imageSmoothingEnabled = false; g.drawImage(f.im, f.x, f.y, f.s, f.s, x + 6, y + 7, 32, 32); }
    text(g, P.name, x + 46, y + 5, P.col, 1, 'left');
    wrap(L.slice(0, Math.floor(S.n)), bw - 54).slice(0, 4).forEach((ln, k) => text(g, ln, x + 46, y + 15 + k * 8, C.cream, 1, 'left', null));
    if (S.n >= L.length && Math.floor(t * 3) % 2) for (let k = 0; k < 3; k++) H.px(C.cream, x + bw - 10 + k, y + bh - 8 + k, 5 - k * 2, 1);   // more: a mark that blinks
  };
  S.face = face;   // (the shop's page shows whose shop it is)
  return S;
}
