// A keeper's entrance. Before a keeper rises, its hall shuts behind him: slabs of stone come down in every doorway with
// the keeper's mark burning on them, and the camera goes to look. Then it goes quiet (the music stops), the lights cower,
// the ground begins to shake and the roof to come down in grit, harder and harder, while he stands and looks for where
// it is coming from. Then the keeper's own rise (each keeper's file), and when its name comes up the whole hall quakes.
// When it falls the slabs crack and come apart; if he falls, they are gone when he is raised.
// The first time is the whole of it; after that (G.keepers), a short one: he knows what is in there.
//   makeEntrance(scene, R, H) -> { start(B, first, P), step(dt, P), open(), reset(), lead, cam, face, brace, vig, st }
//   H: { fx(), sfx, shake(v), flash(v), buzz(strong, weak, ms) } from main.js
// main.js holds the keeper (steps it with no time) and him (no input) while `lead` is on, takes the camera to `cam`,
// turns him to `face`, keeps the music out, and lets the rest run.
import { T, LEVEL, ROCK, EMPTY, LEDGE } from './level.js';
import { lit, MOOD } from './render.js';
const THREE = window.THREE;
const LONG = { seal: 1.0, gap: 0.22, dread: 2.6 }, SHORT = { seal: 0.5, gap: 0.08, dread: 0.9 };
const DROP = 0.24;   // how long a slab takes to come down

// the openings in a room's walls he could leave by: runs of open tiles through the wall band (two tiles), on the sides
// and the floor (not the roof, which may be the sky), no wider than a doorway
function openings(rm){
  const L = LEVEL, at = (i, j) => i < 0 || j < 0 || i >= L.W || j >= L.H ? ROCK : L.tiles[j * L.W + i], open = t => t === EMPTY || t === LEDGE;
  const tx0 = rm.tx0 != null ? rm.tx0 : Math.round(rm.x0 / T), tx1 = rm.tx1 != null ? rm.tx1 : Math.round(rm.x1 / T), ty0 = rm.ty0 != null ? rm.ty0 : Math.round(rm.y0 / T), ty1 = rm.ty1 != null ? rm.ty1 : Math.round(rm.y1 / T);
  const out = [], run = (side, cells) => { if (cells.length && cells.length <= 2 * 9) out.push({ side, cells }); };   // a doorway: up to nine tiles across (the band is two deep)
  for (const [side, band, out1] of [['l', [tx0, tx0 + 1], tx0 - 1], ['r', [tx1 - 1, tx1 - 2], tx1]]){
    let cur = [];
    for (let j = ty0; j <= ty1; j++){ const ok = j < ty1 && band.every(i => open(at(i, j))) && open(at(out1, j)); if (ok) cur.push(j); else { run(side, cur.flatMap(j => band.map(i => [i, j]))); cur = []; } }
  }
  let cur = [];
  // a way up through the floor is shut at its mouth, where he came out of it (in sight), not at the bottom of the room
  const mouth = cols => { const a = cols[0] - 1, b = cols[cols.length - 1] + 1; let j = ty0; while (j + 1 < ty1 && cols.every(i => open(at(i, j + 1))) && at(a, j + 1) === ROCK && at(b, j + 1) === ROCK) j++; return Math.max(ty0 + 1, j); };
  for (let i = tx0; i <= tx1; i++){ const ok = i < tx1 && open(at(i, ty0)) && open(at(i, ty0 + 1)) && open(at(i, ty0 - 1)); if (ok) cur.push(i); else { if (cur.length){ const top = mouth(cur); run('b', cur.flatMap(i => [[i, top - 1], [i, top]])); } cur = []; } }
  return out;
}

// a slab of dark dressed stone, the keeper's mark cut into it and burning
function slabTex(wt, ht, side){
  const px = 8, c = document.createElement('canvas'); c.width = wt * px; c.height = ht * px; const g = c.getContext('2d');
  g.fillStyle = '#181425'; g.fillRect(0, 0, c.width, c.height);
  const bw = side === 'b' ? 16 : c.width, bh = 8;
  for (let y = 0; y < c.height; y += bh) for (let x = -((y / bh) % 2) * bw / 2; x < c.width; x += bw){
    g.fillStyle = (x + y) % 3 ? '#3a4466' : '#262b44'; g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
    g.fillStyle = '#5a6988'; g.fillRect(x + 1, y + 1, bw - 2, 1);
  }
  // the mark: a ring and a bar, cut through the courses, lit from inside
  const cx = c.width / 2, cy = c.height / 2, r = Math.min(c.width, c.height) * 0.32;
  g.fillStyle = '#e43b44';
  for (let a = 0; a < Math.PI * 2; a += 0.08){ g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); }
  g.fillRect(Math.round(cx), Math.round(cy - r * 1.4), 1, Math.round(r * 2.8));
  g.fillStyle = '#feae34'; g.fillRect(Math.round(cx), Math.round(cy - 1), 1, 3);
  g.strokeStyle = '#000'; g.lineWidth = 1; g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}

export function makeEntrance(scene, R, H){
  const E = { st: '', t: 0, lead: false, cam: null, face: 0, brace: false, vig: 0, B: null, L: LONG, seals: [], quaked: false, rumbleT: 0, stones: [] };
  const ease = t => t * t;
  function seal(){
    const rm = E.B.room; if (!rm) return;
    openings(rm).forEach((o, k) => {
      const xs = o.cells.map(c => c[0]), ys = o.cells.map(c => c[1]), i0 = Math.min(...xs), i1 = Math.max(...xs), j0 = Math.min(...ys), j1 = Math.max(...ys);
      const w = (i1 - i0 + 1) * T, h = (j1 - j0 + 1) * T, x = (i0 * T) + w / 2, y = (j0 * T) + h / 2;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit({ map: slabTex(i1 - i0 + 1, j1 - j0 + 1, o.side), transparent: false }));
      m.position.set(x, y + 30, 0.05); m.visible = false; scene.add(m);
      const was = o.cells.map(([i, j]) => LEVEL.tiles[j * LEVEL.W + i]);
      E.seals.push({ o, m, x, y, w, h, was, at: 0, down: false, from: o.side === 'b' ? x - w - 1 : y + h + 2 });
    });
    // the one he came in by first (the nearest), then the rest
    const P = E.hero; if (P) E.seals.sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
    E.seals.forEach((S, k) => { S.at = 0.2 + k * E.L.gap; });
  }
  function shut(S, P){
    // he is never shut into the stone: if he stands in the doorway, the slab puts him into the hall
    const xs = S.o.cells.map(c => c[0]), lo = Math.min(...xs) * T, hi = (Math.max(...xs) + 1) * T;
    if (P && S.o.side !== 'b' && P.x > lo - 0.45 && P.x < hi + 0.45 && P.y < S.y + S.h / 2 && P.y + 2.4 > S.y - S.h / 2) P.x = S.o.side === 'l' ? hi + 0.5 : lo - 0.5;
    S.o.cells.forEach(([i, j]) => { LEVEL.tiles[j * LEVEL.W + i] = ROCK; });
    const fx = H.fx(), foot = S.o.side === 'b' ? S.y + S.h / 2 : S.y - S.h / 2;
    fx.dust({ x: S.x, y: foot }, 22, 4); fx.burst({ x: S.x, y: S.y }, 10, 0xc0cbdc); fx.debris(S.x - S.w, S.x + S.w, S.y + S.h / 2 + 3, foot, 10);
    H.sfx.slam(); H.sfx.impact(true); H.shake(0.42); H.buzz(0.7, 0.5, 220); R.shock(S.x, S.y, true); R.glint(S.x, S.y, 0xe43b44, 1.4, 7, 2.2);   // its mark burns
  }
  function unshut(S, crumble){
    S.o.cells.forEach(([i, j], k) => { LEVEL.tiles[j * LEVEL.W + i] = S.was[k]; });
    if (crumble){ const fx = H.fx(); fx.burst({ x: S.x, y: S.y }, 30, 0x8b9bb4); fx.dust({ x: S.x, y: S.y - S.h / 2 }, 26, 4); fx.burst({ x: S.x, y: S.y }, 8, 0xe43b44); }
    scene.remove(S.m); S.m.geometry.dispose();
  }
  E.start = (B, first, P) => {
    if (E.st) return; E.hero = P;
    E.B = B; E.L = first ? LONG : SHORT; E.st = 'seal'; E.t = 0; E.lead = true; E.quaked = false; E.rumbleT = 0; E.seals = [];
    seal(); E.cam = E.seals.length ? { x: E.seals[0].x, y: E.seals[0].y + 2 } : null;
  };
  E.step = (dt, P) => {
    if (!E.st) return;
    E.t += dt; const B = E.B, rm = B.room, fx = H.fx();
    for (let i = E.stones.length - 1; i >= 0; i--){ const S = E.stones[i]; if ((S.t -= dt) <= 0){ fx.dust({ x: S.x, y: B.stageY }, 5, 1.6); E.stones.splice(i, 1); } }
    // the slabs come down, one after another
    for (const S of E.seals){
      if (E.t < S.at) continue; S.m.visible = true;
      const k = Math.min(1, (E.t - S.at) / DROP);
      if (S.o.side === 'b') S.m.position.set(S.from + (S.x - S.from) * ease(k), S.y, 0.05); else S.m.position.set(S.x, S.from + (S.y - S.from) * ease(k), 0.05);
      if (k >= 1 && !S.down){ S.down = true; shut(S, P); E.face = Math.sign(S.x - P.x) || E.face; }
    }
    if (E.st === 'seal'){
      const last = E.seals.length ? E.seals[E.seals.length - 1].at + DROP + 0.35 : 0;
      if (E.t >= Math.max(E.L.seal, last)){ E.st = 'dread'; E.t = 0; }
    }
    else if (E.st === 'dread'){
      const k = Math.min(1, E.t / E.L.dread);
      // quiet, then dark, then the ground; he turns to where it will come from
      MOOD.dark = 0.2 + 0.65 * k; MOOD.flicker = k; E.vig = k; E.brace = k > 0.6;   // near the end he raises his guard
      // stones from the roof, here and there, landing in a puff
      if (rm && Math.random() < dt * (1 + 5 * k)){ const x = rm.x0 + 2 + Math.random() * (rm.x1 - rm.x0 - 4); fx.debris(x - 0.2, x + 0.2, rm.y1 - 1.2, B.stageY, 3); E.stones.push({ x, t: Math.sqrt(2 * (rm.y1 - 1.2 - B.stageY) / 9) }); }
      E.cam = { x: B.cx, y: B.stageY + 4.6 }; E.face = Math.sign(B.cx - P.x) || E.face;
      H.shake(0.04 + 0.4 * k * k);
      if ((E.rumbleT -= dt) <= 0){ E.rumbleT = 0.75 - 0.35 * k; H.sfx.rumble(); H.buzz(0.2 + 0.5 * k, 0.3 + 0.4 * k, 300); }
      if (rm && Math.random() < 0.25 + k * 0.6) fx.debris(rm.x0 + 1, rm.x1 - 1, rm.y1 - 1.2, B.stageY, 1 + Math.floor(k * 4));
      if (E.t >= E.L.dread){ E.st = 'rise'; E.t = 0; E.lead = false; E.cam = null; E.brace = false; }
    }
    else if (E.st === 'rise'){
      // its own rise; when its name comes up, the hall quakes
      MOOD.dark += (0.3 - MOOD.dark) * Math.min(1, dt * 2); MOOD.flicker = Math.max(0, MOOD.flicker - dt); E.vig = Math.max(0.35, E.vig - dt * 0.4);
      if (rm && Math.random() < 0.4) fx.debris(rm.x0 + 1, rm.x1 - 1, rm.y1 - 1.2, B.stageY, 2);
      if (!E.quaked && B.tm > 0.5){ E.quaked = true; H.shake(0.95); H.flash(0.35); H.buzz(1, 0.9, 600); H.sfx.roar(); H.sfx.impact(true);
        fx.ring({ x: B.cx, y: B.stageY }, 0xffd27a); fx.dust({ x: B.cx, y: B.stageY }, 40, 6); R.shock(B.cx, B.stageY + 2, true);
        if (rm) fx.debris(rm.x0 + 1, rm.x1 - 1, rm.y1 - 1.2, B.stageY, 40); }
      if (B.st !== 'rise'){ E.st = 'after'; E.t = 0; }
    }
    else if (E.st === 'after'){ MOOD.dark = Math.max(0, MOOD.dark - dt * 0.4); MOOD.flicker = 0; E.vig = Math.max(0, E.vig - dt * 0.5); if (MOOD.dark <= 0 && E.vig <= 0) E.st = 'held'; }
  };
  // the keeper falls: the slabs crack and come apart, the way out is open
  E.open = () => { E.seals.forEach(S => unshut(S, true)); E.seals = []; E.st = ''; E.lead = false; E.cam = null; E.brace = false; E.vig = 0; E.stones = []; MOOD.dark = 0; MOOD.flicker = 0; if (E.B) H.sfx.crack(); };
  // he fell, or left: gone as if they were never there
  E.reset = () => { E.seals.forEach(S => unshut(S, false)); E.seals = []; E.st = ''; E.lead = false; E.cam = null; E.brace = false; E.vig = 0; E.stones = []; MOOD.dark = 0; MOOD.flicker = 0; };
  return E;
}
