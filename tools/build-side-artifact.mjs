// Produces dist/side-artifact.html (the side view as hosted-artifact content) and dist/side-files.json: every file the
// page needs (the modules side.html reaches by import, the vendored three.js, and the art it loads), keyed by its
// published path under a per-build folder, for the publish's `files` map.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, relative } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(root + 'side.html', 'utf8'), css = readFileSync(root + 'src/ui/styles.css', 'utf8');
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const fonts = html.match(/<link[^>]+fonts\.googleapis\.com\/css2[^>]+>/)[0];
// every module reached from src/side/main.js
const seen = new Set();
function walk(file){
  if (seen.has(file)) return; seen.add(file);
  const src = readFileSync(join(root, file), 'utf8');
  for (const m of src.matchAll(/(?:import|export)[^'"`]*?from\s*['"](\.[^'"]+)['"]|import\s*\(\s*['"](\.[^'"]+)['"]\s*\)|^import\s+['"](\.[^'"]+)['"]/gm)){
    const spec = m[1] || m[2] || m[3]; const next = normalize(join(dirname(file), spec));
    if (existsSync(join(root, next))) walk(next);
  }
}
walk('src/side/main.js');
walk('src/side/paintworker.js');   // the painter's worker (started by URL, not by import)
const files = [...seen, 'vendor/three/three.min.js', 'vendor/three/GLTFLoader.js'];
// the art the game loads now: the 16-pixel cast (with the normal maps that light it by its shape), the warrior's strips
// that are drawn (not every one he has), the bosses in pieces, the combo's effects, the far paintings, the palette
const HERO = ['stand', 'idle', 'run', 'jump', 'fall', 'hurt', 'plunge', 'plunge_fall', 'plunge_land', 'fall_back', 'fall_dive', 'block', 'roll2_px', 'flip_px', 'land_px', 'climb_own', 'climb_hang2', 'climb_px', 'atk_slam_v3', 'atk_slam_px', 'atk_spin_px', 'atk_rise_px', 'atk_dash_px', 'getup'];
const SIDE = new RegExp('^assets/side/(px_(?!hat/|hood/|knight/|mask/)[a-z_]+/.*\\.(png|json)|mask_tall_c/(sprite\\.json|(' + HERO.join('|') + ')(_n)?\\.png)|colossus/(fist|forearm|upperarm)16(_n)?\\.png|warden/\\w+16(_n)?\\.png|(toll|wyrm|thunderhead|mother|fallen)/\\w+\\.(png|json)|vfx/cut\\d/(fx\\.json|pack/(front|behind)\\.png)|bg/(far|cloister|spires|tempest|gardens|firmament)\\.png|palette\\.json)$');
const AUDIO = /^assets\/audio\/(manifest\.json|music\/\w+\.mp3|sfx\/\w+\.wav)$/;   // the recorded score and sounds
(function add(dir){ if (!existsSync(join(root, dir))) return; for (const n of readdirSync(join(root, dir))){ const p = join(dir, n); if (statSync(join(root, p)).isDirectory()) add(p); else if (SIDE.test(p) || AUDIO.test(p)) files.push(p); } })('assets');
// every file goes under a folder named for this build, and the page's <base> points there: a new build never
// picks up an old build's cached scripts or pictures (the viewer caches files by name)
const BUILD = process.env.BUILD || ('b' + Date.now().toString(36));
// ASSETS: the folder the art and sound are already in, when only the code has changed (they are large, and the same):
// the page's <base> points there and its script is taken from this build's folder
const ASSETS = process.env.ASSETS || BUILD, isCode = f => f.startsWith('src/');
const page = `<base href="${ASSETS}/">
<title>The Climb: Side View</title>
<meta name="theme-color" content="#0b1024">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>
${css}
html,body{height:100%}
</style>
${ASSETS === BUILD ? body : body.replace('src="src/side/main.js"', `src="../${BUILD}/src/side/main.js"`)}`;
mkdirSync(root + 'dist', { recursive: true });
writeFileSync(root + 'dist/side-artifact.html', page);
// his sprite.json lists every strip he has; the one shipped lists only those shipped, so nothing asks for one that is not there
const heroMeta = JSON.parse(readFileSync(join(root, 'assets/side/mask_tall_c/sprite.json'), 'utf8'));
heroMeta.anims = Object.fromEntries(Object.entries(heroMeta.anims).filter(([k]) => HERO.includes(k)));
writeFileSync(root + 'dist/hero-sprite.json', JSON.stringify(heroMeta, null, 1));
const srcOf = f => f === 'assets/side/mask_tall_c/sprite.json' ? 'dist/hero-sprite.json' : f;
writeFileSync(root + 'dist/side-files.json', JSON.stringify(Object.fromEntries(files.map(f => [(isCode(f) ? BUILD : ASSETS) + '/' + f, srcOf(f)])), null, 1));
console.log('dist/side-artifact.html', page.length, 'bytes;', files.length, 'files under', BUILD + '/');
