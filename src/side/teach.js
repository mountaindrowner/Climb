// What the game tells the player, and when (docs/phase3-sheet.md). Nothing is said up front: the opening rooms ask for
// each move, and a hint comes up under him only when he struggles there (pushes into a step he must jump, stands on a
// plank holding down, is bitten and has never blocked). It shows the real key for what he is playing with, goes the
// moment he does it, and is given once (G.taught, in the save). Words are kept for the systems a picture can't show
// (the knots, the embers, the map, a second weapon): one card each, when it first matters, with a picture.
//   keyName(action, kind, set)  the key, button or touch for an action ('move', 'down', 'jump', ...), as shown
//   fill(str, k)                a line with {action} in it, filled with the keys (k: action -> name)
//   makeTeach(G, OPT, store)    the hints: .step(dt, ctx), .event(e, ctx), .shown() -> { id, show, a } or null
//   ICONS, drawIcon(px, name, x, y, scale)   the pictures, 16 pixels square, from the palette
//   INTRO, CARDS                the people's first words; the systems' cards
// This file touches no page and no game state of its own, so the tests read it as it is.

// ---- the keys, by device: the first binding of each action is the one shown (settings.js)
const KEYN = { Space: 'SPACE', Mouse0: 'CLICK', Mouse1: 'WHEEL', Mouse2: 'RIGHT CLICK', ShiftLeft: 'SHIFT', ShiftRight: 'SHIFT', ControlLeft: 'CTRL', ControlRight: 'CTRL',
  ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', ArrowUp: 'UP', ArrowDown: 'DOWN', Enter: 'ENTER', Tab: 'TAB', Escape: 'ESC', Backspace: 'BACK' };
export const codeName = c => KEYN[c] || String(c).replace(/^Key|^Digit|^Numpad/, '').toUpperCase();
export const PADN = { xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT'], ps: ['CROSS', 'CIRCLE', 'SQUARE', 'TRIANGLE', 'L1', 'R1', 'L2', 'R2'] };
const TOUCH = { move: 'DRAG', left: 'DRAG', right: 'DRAG', down: 'DRAG DOWN', jump: 'JUMP', attack: 'A', block: 'B', roll: 'ROLL', flask: 'FLASK', art: 'EMBERS', swap: 'SWAP' };
export function keyName(action, kind, set){
  if (kind === 'touch') return TOUCH[action] || action.toUpperCase();
  if (kind === 'keys'){ const first = a => codeName(((set && set.keys && set.keys[a]) || [])[0] || '-');
    return action === 'move' ? first('left') + ' ' + first('right') : first(action); }
  if (action === 'move') return 'STICK'; if (action === 'down') return 'DOWN';   // a controller: the stick, as for menus
  const i = ((set && set.pad && set.pad[action]) || [])[0], N = PADN[kind === 'ps' ? 'ps' : 'xbox'];
  return i == null ? '-' : N[i] || 'B' + i;
}
export const fill = (str, k) => String(str).replace(/\{(\w+)\}/g, (_, a) => k(a));

// ---- the lessons of the opening, in the order the rooms ask for them. `show`: what the hint says, a key and a word
// for each part. Each is given until he does it, for a few seconds at a time, at most three times
export const LESSONS = {
  move:   [['move', 'MOVE']],
  jump:   [['jump', 'JUMP']],
  double: [['jump', 'JUMP AGAIN IN THE AIR']],
  cut:    [['attack', 'ATTACK']],
  block:  [['block', 'BLOCK']],
  parry:  [['block', 'BLOCK JUST BEFORE A HIT LANDS TO STUN IT']],
  crouch: [['down', 'CROUCH'], ['roll', 'ROLL']],
  drop:   [['down', '+'], ['jump', 'DROP THROUGH THE PLANK']],
};
const SHOW_FOR = 8, TIMES = 3;
export function makeTeach(G, OPT, store){
  const S = { cur: null, x0: null, still: 0, push: 0, low: 0, near: 0, onPlank: 0, crawl: 0, peak: -1e9, jumped: false, double: false, short: 0, guardSeen: false };
  const taught = () => (G.taught = G.taught || {});
  const shows = () => (G.taughtShown = G.taughtShown || {});
  const off = () => OPT.hints === false;
  const T = {};
  T.known = id => !!taught()[id];
  // he has struggled at it: show it, unless it is known or another is up
  T.want = id => { if (off() || T.known(id) || (S.cur && !S.cur.out)) return false; const n = shows(); n[id] = (n[id] || 0) + 1; S.cur = { id, t: 0, out: 0 }; return true; };
  // he has done it: known from now on (whether or not it was shown); the hint goes
  T.done = id => { if (T.known(id)) return; taught()[id] = 1; store(); if (S.cur && S.cur.id === id && !S.cur.out) S.cur.out = 0.001; };
  T.reset = () => { S.cur = null; S.x0 = null; S.still = S.push = S.low = S.near = S.onPlank = S.crawl = 0; S.jumped = S.double = false; S.short = 0; };
  T.state = S;
  // ctx: { P, held (IN.held), solidAt(x, y), onPlank(P), foes (alive creatures near: [{ x, y }]), busy }
  T.step = (dt, c) => {
    const P = c.P, H = c.held || {};
    if (S.cur){ S.cur.t += dt; if (S.cur.out) S.cur.out += dt;
      if (S.cur.out > 0.35 || (!S.cur.out && S.cur.t > SHOW_FOR)){ const id = S.cur.id; S.cur = null; if ((shows()[id] || 0) >= TIMES && !T.known(id)){ taught()[id] = 1; store(); } } }
    if (c.busy || !P || P.hp <= 0) return;
    const dir = H.right && !H.left ? 1 : H.left && !H.right ? -1 : 0, ahead = dir * 0.62;
    // 1 move: he has stood still a while at the start
    if (S.x0 == null) S.x0 = P.x;
    if (Math.abs(P.x - S.x0) > 1.5) T.done('move'); else if (!T.known('move') && (S.still += dt) > 4) T.want('move');
    if (!P.grounded) S.peak = Math.max(S.peak, P.y);
    // 2 jump: he pushes into a step too high to walk up, and stays
    const stuck = P.grounded && dir && Math.abs(P.vx) < 0.4 && !P.atk && P.roll <= 0;
    if (stuck && c.solidAt(P.x + ahead, P.y + 0.3) && !c.solidAt(P.x + ahead, P.y + 3.2)){ if ((S.push += dt) > 0.5) T.want('jump'); } else S.push = 0;
    // 7 crouch: he pushes into a gap too low to walk into upright
    const lowGap = c.solidAt(P.x + ahead, P.y + 1.8) && !c.solidAt(P.x + ahead, P.y + 0.3) && !c.solidAt(P.x + ahead, P.y + 1.1);
    if (stuck && !P.crouch && lowGap){ if ((S.low += dt) > 0.3) T.want('crouch'); } else S.low = 0;
    if (P.crouch && dir && Math.abs(P.vx) > 0.5){ if ((S.crawl += dt) > 0.3) T.done('crouch'); } else S.crawl = 0;
    // 8 drop: he stands on a plank holding down, as if to go through it
    if (P.grounded && H.down && !dir && c.onPlank(P)){ if ((S.onPlank += dt) > 0.8) T.want('drop'); } else S.onPlank = 0;
    // 5 cut: a creature is close, and he has never swung
    if (!T.known('cut') && (c.foes || []).some(f => Math.abs(f.x - P.x) < 5 && Math.abs(f.y - P.y) < 2.5)){ if ((S.near += dt) > 0.8) T.want('cut'); } else S.near = 0;
  };
  // what happens to him: what he did (known from now on), and what went wrong (a hint)
  T.event = (e, c) => {
    const P = c && c.P;
    switch (e.type){
      case 'jump': S.jumped = true; S.double = false; S.peak = P ? P.y : S.peak; T.done('jump'); break;
      case 'doubleJump': S.double = true; T.done('double'); break;
      case 'land':   // 3 a second jump: he has twice come down short of a ledge just over his reach
        if (S.jumped && !S.double && P && !T.known('double') && c.solidAt){
          let over = false; for (let dy = 2.6; dy <= 5 && !over; dy += 0.5) for (const dx of [-1.2, -0.6, 0, 0.6, 1.2]){ const x = P.x + dx, y = S.peak + dy; if (c.solidAt(x, y) && !c.solidAt(x, y + 0.5)){ over = true; break; } }
          if (over && ++S.short >= 2){ S.short = 0; T.want('double'); } }
        S.jumped = false; S.double = false; S.peak = -1e9; break;
      case 'strike': T.done('cut'); break;
      case 'roll': if (S.cur && S.cur.id === 'crouch') T.done('crouch'); break;
      case 'dropThrough': T.done('drop'); break;
      case 'hurt': if (e.msg === 'Spikes') T.want('jump'); else if (!(P && P.weapon === 'spade')) T.want('block'); break;
      case 'block': if (e.mine){ T.done('block'); S.guardSeen = true; } break;   // his guard (not a creature turning his blow)
      case 'parry': T.done('block'); T.done('parry'); break;
      case 'tell': if (S.guardSeen && !T.known('parry') && !(P && P.weapon === 'spade')) T.want('parry'); break;
    }
  };
  // what is up now, and how much of it: { id, show, a }
  T.shown = () => { if (!S.cur) return null; const t = S.cur.t, a = S.cur.out ? Math.max(0, 1 - S.cur.out / 0.35) : Math.min(1, t / 0.25, (SHOW_FOR - t) / 0.5); return { id: S.cur.id, show: LESSONS[S.cur.id], a }; };
  return T;
}

// ---- the people's first words: the first time each is met, anywhere, they say who they are and what they do
export const INTRO = {
  lamplighter: 'I am Ordric. I keep the lamps. Bring me shards and I will make you stronger.',
  scribe: 'I am Corwen. I map the mountain. Ask me what is left to find here.',
  wren: 'I am Mirel. I am climbing to the flame, like you.',
};

// ---- the cards for the systems: when each first matters. `how` lines have the keys filled in ({action})
export const CARDS = {
  knots: { head: 'HOW IT WORKS', title: 'Relics', icon: 'knot', does: 'A relic only works while it is equipped.', how: ['You have a few relic slots: the knots in your scarf.', 'Rest at a pool to choose which relics you equip.'] },
  embers: { head: 'HOW IT WORKS', title: 'Embers', icon: 'embers', does: 'Every hit you land gives you one ember.', how: ['With 10 embers, {art} uses a power.', 'With your flask empty, {flask} spends 10 embers to heal one heart.'] },
  map: { head: 'HOW IT WORKS', title: 'The map', icon: 'map', does: 'The map shows every room you have entered.', how: ['Large blue mark: a checkpoint pool. Small blue mark: a spring that heals you.'] },
};

// ---- the pictures: 16 pixels square, a letter a colour (the palette, assets/side/palette.json)
const PAL = { k: '#181425', d: '#262b44', D: '#3a4466', m: '#5a6988', l: '#8b9bb4', p: '#c0cbdc', w: '#ffffff', b: '#ead4aa', c: '#fff2d0', r: '#e43b44', R: '#a22633', s: '#f6757a',
  o: '#f77622', y: '#feae34', Y: '#fee761', C: '#2ce8f5', B: '#0099db', n: '#124e89', u: '#d77643', W: '#733e39', g: '#63c74d', G: '#3e8948' };
export const ICONS = {
  whetstone: ['', '', '..........kkk', '........kkpplk', '......kkpppllk', '....kkpplllmmk', '...kpplllmmmk', '..kpllmmmmmk', '..klmmmmmkk', '..kmmmmkk', '...kkkk'],
  lodestone: ['.....C.....C', '', '...C..kkkkk', '.....kDDmmDk', '....kDmmllmDk..C', '....kDmlpplmk', '.C..kDmmllmDk', '....kDDmmmDDk', '.....kDDDDDk', '......kkkkk...C', '..C', '........C'],
  featherfall: ['', '......kkk', '.....kbbbk', '....kbkkkbk', '....kbk.kbk', '.....kbkbk', '......kbbk', '.....kbkkbk', '....kbk..kbk', '...kbk....kbk', '...kk......kk'],
  stormglass: ['.....kkkkkk', '.....kWWWWk', '....kkkkkkkk', '...kpCCCCCCpk', '...kCnnYnnnCk', '...kCnYYnnnCk', '...kCnnYYnnCk', '...kCnnnYnnCk', '...kCnnYnnnCk', '...kpCCCCCCpk', '....kkkkkkkk'],
  seedheart: ['.......gg', '......gGgg', '.......G', '......kkk', '.....kuuuk', '....kuyuuuk', '....kuuuuWk', '....kuuuWWk', '.....kWWWk', '......kkk'],
  tally: ['', '.kkkkkkkkkkkkk', '.kWWWWWWWWWWWk', '.kWcWcWcWcWWWk', '.kWcWcWcWcWWWk', '.kWcWcWcWcWWWk', '.kuuuuuuuuuuuk', '.kkkkkkkkkkkkk'],
  felt: ['', '.....kkkkkk', '....kllllllk', '...klpllllllk', '...kllllllllk', '...kkkkkkkkkk', '...kWuWuWuWuk', '...kllllllllk', '...kllllllmmk', '....kllllmmk', '.....kkkkkk'],
  turnstone: ['', '', '....kkkkkkkk', '...kpppppllk', '..kpplllllmmk', '..kplkklkklmk', '..klllllllmmk', '...kmmmmmmmk', '....kkkkkkk'],
  flint: ['', '', '......kkkk', '....kkllllk', '...kllpllmk', '..kllllmmmk..Y', '..klmmmmmk..yY', '...kkmmkk..oy', '.....kk...o'],
  stillair: ['', '', '.....kkkkkk', '...kkWWWWWWkk', '..kWWWppppWWWk', '..kWWp....pWWk', '..kWWp....pWWk', '..kWWWppppWWWk', '...kkWWWWWWkk', '.....kkkkkk'],
  yoke: ['', '', '.kkkkkkkkkkkkkk', '.kuuuuWWWWuuuuk', '.kkkkkkkkkkkkkk', '..k..........k', '..k..........k', '.kkk........kkk', '.kck........kck', '.kck........kck', '.kkk........kkk'],
  place: ['', '', '....kkkkkk', '..kkwwwwwwkk', '.kwwwppppwwwk', '.kwwpwwwwpwwk', '.kwwpwwwwpwwk', '.kwwwppppwwwk', '..kkwwwwwwkk', '....kkkkkk'],
  lastpage: ['', '...kkkkkkkk', '..kppppppppk', '..kppppppppk', '..kppppppppk', '..kppppppppk', '..kppppppppk', '..kppppppppk', '..kppppppkkk', '..kpppppkpk', '..kkkkkkkk'],
  shiftbell: ['', '......kk', '.....kWWk', '....kkWWkk', '...kWWWWWWk', '...kWuuuuWk', '..kWWuuuuWWk', '..kWWuuuuWWk', '.kkkkkkkkkkkk', '......kck', '......kkk'],
  lastrope: ['', '', '....kkkkkk', '..kkuuuuuukk', '.kuukkkkkkuuk', '.kuk......kuk', '.kuukkkkkkuuk', '..kkuuuuuukk', '....kkkkuk', '.......kuk', '.......kkk'],
  lampstone: ['', '', '......kk', '.....kwwk', '....kwppwk', '...kwwppwwk', '...kwppppwk', '....kwppwk', '....kwppwk', '.....kwwk', '......kk'],
  boots: ['', '', '....kkkk', '....kWWk', '....kWWk', '....kWWk', '....kWWkkkk', '....kWWWWWWk', '....kuuuuuuk', '....kkkkkkkk'],
  blankleaf: ['', '...kkkkkkkk', '..kppppppppk', '..kppppppppk', '..kpllllllpk', '..kppppppppk', '..kpllllllpk', '..kppppppppk', '..kpllllllpk', '..kppppppppk', '..kppppppkk', '...kkkkkkk'],
  stylus: ['............kk', '...........kpk', '..........kplk', '.........kplk', '........kplk', '.......kplk', '......kplk', '.....kyyk', '....kyyk', '...klk', '..kk'],
  starcompass: ['.....kkkkkk', '...kkyyyyyykk', '..kyykkkkkkyyk', '..kykdnnYndkyk', '.kykdnnYwYnnkyk', '.kyknnYwwwYnkyk', '.kykdnnYwYnnkyk', '..kykdnnYndkyk', '..kyykkkkkkyyk', '...kkyyyyyykk', '.....kkkkkk'],
  breaker: ['......kkkk', '......kYYk', '......kYYk', '......kYYk', '....kkkYYkkk', '....kYYYYYYk', '.....kYYYYk', '......kYYk', '.......kk', '..k.k......k.k', '.kmmkmmmmmmkmmk', '.kmkmmmkmmmmkmk', '.kkkkkkkkkkkkkk'],
  dash: ['.......kkkkk', '.......kWWWk', '.......kWWWk', '.......kWWWk', '.......kWWWk', '.......kWWWkkk', 'pp..kkkkWWWWWWk', '....kWWWWWWWWWk', '.pp.kWWWWWWWWWk', '....kkkkkkkkkkk'],
  grip: ['', '..kk..kk..kk', '.kWWkkWWkkWWk', '.kWWkkWWkkWWk', '.kuukkuukkuuk', '..kuuuuuuuuk', '..kuuuuuuuuk', '...kuuuuuuk', '....kuuuuk', '....kuuuuk', '.....kkkk'],
  tallysend: ['', '...kkkkkkkk', '..kppppppppk', '..kpllllllpk', '..kppppppppk', '..kpllllppk', '..kppppppppk', '..kppppppppk', '..kpppllppk', '..kppppppkk', '...kkkkkkk'],
  glide: ['', '....kkkkkk', '...kCCCCCCk', '..kCkkkkkkCk', '..kCk.kkk.kCk', '..kCk.kCk..kCk', '..kCk..kCCCCk', '...kCk..kkkk', '....kCCk', '.....kk'],
  heart: ['..kkk...kkk', '.kssrk.kssrk', 'kssrrrkrrrrrk', 'ksrrrrrrrrrrk', 'krrrrrrrrrrRk', '.krrrrrrrrRk', '..krrrrrrRk', '...krrrrRk', '....krrRk', '.....kRk', '......k'],
  flask: ['.....kkk', '.....kpk', '.....kpk', '....kkpkk', '...kCCCCCk', '..kCwCCCCCk', '..kCCCCCCCk', '..kBBBBBBBk', '..kBBBBBBBk', '...kkkkkkk'],
  blade: ['..............kk', '.............kwk', '............kwpk', '...........kwpk', '..........kwpk', '.........kwpk', '........kwpk', '.......kwpk', '..kk..kwpk', '...kkkwpk', '....kykk', '...kWkk', '..kWk.kk', '.kWk', '.kk'],
  spade: ['...........kkkk', '...........kbbk', '............kk', '...........kWk', '..........kWk', '.........kWk', '........kWk', '...kkk.kWk', '..kpppkWk', '.kpllppk', '.kplmlpk', '.kpmllk', '..kkkk'],
  knot: ['', '', 'rrrrrrkkkrrrrrrr', 'RRRRRkYYYkRRRRRR', '.....kYcYk', '.....kYYYk', '......kkk', '.......rr', '......rR.r', '.....rR...r'],
  embers: ['.......k', '......kyk', '.....kyYyk', '....kyYcYyk', '...koyYcYyok', '...koyYYYyok', '....kooyook', '.....kkkkk', '', '.kkkk.kkkk.kkkk', '.kYYk.kYYk.kyok', '.kkkk.kkkk.kkkk'],
  map: ['', '', '', '.kkkkkkkkkkkkk', '.kbbbbkbbbbbbk', '.kbBBbkbbbbbbk', '.kbBbbkbbbybbk', '.kbbbbkbbbbbbk', '.kbbbbkbbbbbbk', '.kkkkkkkkkkkkk'],
};
// draw one: px(colour, x, y, w, h) is the HUD's; the picture is set in the middle of its 16 x 16
export function drawIcon(px, name, x, y, scale = 1){
  const rows = ICONS[name]; if (!rows) return; const top = Math.floor((16 - rows.length) / 2);
  rows.forEach((row, j) => { for (let i = 0; i < row.length && i < 16; i++){ const c = PAL[row[i]]; if (c) px(c, x + i * scale, y + (top + j) * scale, scale, scale); } });
}
