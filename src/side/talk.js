// The people on the mountain, and what they say. Three of them go up it as he does: Ordric of the Vigil, who keeps the
// flames and does what he can for shards; Mirel the Penitent, a pilgrim; and Corwen the Annalist, who records it. Each has something to say in each
// region (SCRIPT[who][region], a list of lines; said once in full, then its last line again).
//   makeTalk(hud) -> { on, start(who, lines, after), press(), draw(H, dt) }: a box at the foot of the picture, the words
//   typed out; a press finishes the line, the next press goes on.
import { sfx } from '../audio/sfx.js';
import { text, width, fine } from './pixelfont.js';
export const PEOPLE = { lamplighter: { name: 'ORDRIC OF THE VIGIL', art: 'px_moth', col: '#feae34' }, wren: { name: 'MIREL THE PENITENT', art: 'px_hermit', col: '#63c74d', late: { from: 4, art: 'px_hermit_free' } }, scribe: { name: 'CORWEN THE ANNALIST', art: 'px_rook', col: '#2ce8f5' } };
// `late`: from that region up, another drawing (Mirel has put her shell down by the Gardens).
// They are the mountain's own folk, not people: Ordric an old moth, Mirel a hermit crab, Corwen a rook (docs/cast.md). The
// only human shapes on the mountain are he and the Fallen, and what is left of the peoples who tried to carry the light.
// Their keys are what the level's markers call them (lamplighter, wren, scribe); their names are above. See docs/story.md:
//   Ordric keeps the flames because he was asked to and no one has told him to stop: faithful, and past understanding why.
//   Mirel climbs to arrive deserving it. She carries a great borrowed shell and counts her falls so they can be held
//         against her; the water keeps giving her back anyway, and somewhere above the storm she puts the shell down.
//   Corwen records the mountain exactly and cannot account for it.
// where each one's face is in their standing drawing (its top-left, 16 pixels square): the box shows the head, not the
// middle of the figure (Mirel's middle is her shell)
const FACES = { px_moth: [20, 4], px_hermit: [21, 6], px_hermit_free: [21, 6], px_rook: [22, 3] };
export const SCRIPT = {   // at most three lines a meeting, each short and new; the theme is never said (docs/writing.md)
  lamplighter: [
    ['You came up out of the water. They all do, the ones it gives back.', 'That red thread was tied on you. It burns when you are hurt. A flame mends it.', 'Bring me shards of the old lamps. I can do a little. The rest was never mine.'],
    ['They rang the hours for the flame. When it went dark, they rang louder.', 'Come down hard on cracked stone now, and it gives.', 'Shards, if you have them.'],
    ['The pass is above us, and what coils on it.', 'You will fall here. Everyone does. The water does not seem to mind.', 'Shards, if you have them.'],
    ['Open the thread in the rising air, and let it take you up.', 'I never could. I always wanted to do the carrying.', 'Shards, if you have them.'],
    ['Sun. I had forgotten it has a smell.', 'Planted for the keepers of the flame. No one told the garden they had gone.', 'Shards, if you have them.'],
    ['My last flame. The one above, I have never flown at. It was never mine.', 'What waits by it has your walk. It holds a lamp, and will not set it down.', 'Go up. You are expected.'],
  ],
  wren: [
    ['You fell past me. I counted it as one of mine, out of habit.', 'I am Mirel. I mean to reach the flame deserving it. You see what I carry.', 'Break the urns. Those before us hid what they could not carry up.'],
    ['Forty falls. I keep the count, so it can be held against me at the top.', 'Threads are caught in the high places. Red, like yours. Mine is grey.', 'I do not know why you were given red.'],
    ['My hands have stopped working. I will not rest. Resting is how the count goes up.', 'There is a crack in the rock with a draught through it. Something was walled in.'],
    ['I cannot carry it through the storm. I have tried.', 'Each time the water gives me back, and the shell is waiting on the bank.', 'It keeps giving me back. I have not earned one of those.'],
    ['I put it down. The shell. Over there somewhere, in the flowers.', 'I went back for it twice. It was never mine. I found it on a shore somewhere.', 'I have stopped counting. I do not know what to do with my hands.'],
    ['This is as far as I go, for now. I can see it from here.', 'What is up there is yours to face.', 'Go on. I will be along. There is no hurry any more.'],
  ],
  scribe: [
    ['Another from the water. I write the mountain down. Someone must; no one looks up now.', 'These are the Roots. Everything above stands on what is down here, and forgets it.'],
    ['The house kept the flame\'s hours. Every mark on these walls is a night rung.', 'The last mark is a night with no bell.'],
    ['The Spires are the mountain\'s own bones. Nothing was built here. Things only cling.'],
    ['The Tempest is new. My oldest pages have clear sky on them.'],
    ['The Gardens fed the keepers of the flame. See how well it does untended.', 'I have no entry that explains that.'],
    ['The Firmament. I have charted every star from here but one.', 'That one is on the ground, up ahead, and dark. I have left the page open.'],
  ],
};
const wrap = (str, w) => { const out = []; let line = ''; for (const word of String(str).split(' ')){ const t = line ? line + ' ' + word : word; if (width(t) > w && line){ out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
export function makeTalk(){
  const S = { on: false, who: '', lines: [], i: 0, n: 0, after: null, held: 0 }, faces = {};
  // a face for the box: the head and shoulders of their standing drawing, at a whole number of pixels to one
  const face = (who, art) => { const key = who + (art || ''); if (faces[key] !== undefined) return faces[key]; faces[key] = null; const P = PEOPLE[who]; if (!P) return null; const im = new Image(); who = key; im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const s = y1 - y0 > 50 ? 32 : 16, at = FACES[art || P.art]; faces[who] = at ? { im: c, x: at[0], y: at[1], s } : { im: c, x: Math.max(0, Math.min(c.width - s, Math.round((x0 + x1) / 2 - s / 2))), y: Math.max(0, y0 - 1), s }; }; im.src = `assets/side/${art || P.art}/stand.png`; return null; };
  S.start = (who, lines, after = null, art = null) => { S.on = true; S.who = who; S.art = art; S.lines = lines.slice(); S.i = 0; S.n = 0; S.after = after; S.held = 0; face(who, art); };
  S.press = () => { if (!S.on || S.held < 0.15) return; const L = S.lines[S.i] || ''; if (S.n < L.length){ S.n = L.length; return; } S.i++; S.n = 0; S.held = 0; if (S.i >= S.lines.length){ S.on = false; const a = S.after; S.after = null; if (a) a(); } };
  S.draw = (H, dt, t) => {
    if (!S.on) return; S.held += dt; const g = H.g, W = H.W, C = H.C, P = PEOPLE[S.who] || { name: S.who.toUpperCase(), col: C.cream }, L = S.lines[S.i] || '';
    const n0 = Math.floor(S.n); S.n = Math.min(L.length, S.n + dt * 42); if (Math.floor(S.n) > n0 && Math.floor(S.n) % 3 === 0 && L[Math.floor(S.n) - 1] !== ' ') sfx.talk();
    const bw = Math.min(300, W - 16), x = Math.round((W - bw) / 2), y = 8, bh = 46;   // at the top: he and whoever speaks stand at the foot of the picture
    H.px(C.ink, x - 1, y - 1, bw + 2, bh + 2); H.px('#262b44', x, y, bw, bh); H.px(C.ink, x + 1, y + 1, bw - 2, bh - 2); H.px(P.col, x + 1, y + 1, bw - 2, 1);
    const f = face(S.who, S.art); H.px('#262b44', x + 4, y + 5, 36, 36); H.px(C.ink, x + 5, y + 6, 34, 34);
    if (f){ g.imageSmoothingEnabled = false; g.drawImage(f.im, f.x, f.y, f.s, f.s, x + 6, y + 7, 32, 32); }
    text(g, P.name, x + 46, y + 5, P.col, 1, 'left');
    wrap(L.slice(0, Math.floor(S.n)), bw - 54).slice(0, 4).forEach((ln, k) => text(g, ln, x + 46, y + 15 + k * 8, C.cream, 1, 'left', null));
    if (S.n >= L.length && Math.floor(t * 3) % 2) for (let k = 0; k < 3; k++) H.px(C.cream, x + bw - 10 + k, y + bh - 8 + k, 5 - k * 2, 1);   // more: a mark that blinks
  };
  return S;
}
