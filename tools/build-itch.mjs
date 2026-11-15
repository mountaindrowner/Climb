// The game as an itch.io HTML5 upload: dist/the-climb-itch.zip, index.html at its root (side.html) with every file the
// page needs beside it at its own path (the same list the artifact build makes: the modules reached from main.js, three.js,
// the art and the sound). On itch.io: Kind of project HTML, upload the zip, tick "This file will be played in the browser".
//   node tools/build-itch.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url)), stage = join(root, 'dist', 'itch');
execFileSync(process.execPath, [join(root, 'tools/build-side-artifact.mjs')], { cwd: root, env: { ...process.env, BUILD: 'itch' }, stdio: 'ignore' });
// each file at the path the page asks for (the map's key, less the build folder), from its source (the value: not always the
// same file, e.g. his sprite.json is the trimmed copy the build writes to dist/)
const map = Object.entries(JSON.parse(readFileSync(join(root, 'dist/side-files.json'), 'utf8'))).map(([to, from]) => [to.replace(/^[^/]+\//, ''), from]);
const files = [...new Map([...map, ['src/ui/styles.css', 'src/ui/styles.css']])];
rmSync(stage, { recursive: true, force: true });
for (const [to, from] of files){ if (!existsSync(join(root, from))) throw new Error('missing ' + from); mkdirSync(dirname(join(stage, to)), { recursive: true }); copyFileSync(join(root, from), join(stage, to)); }
copyFileSync(join(root, 'side.html'), join(stage, 'index.html'));
const zip = join(root, 'dist', 'the-climb-itch.zip'); rmSync(zip, { force: true });
execFileSync('zip', ['-qr', zip, '.'], { cwd: stage });
console.log(zip, files.length + 1, 'files');
