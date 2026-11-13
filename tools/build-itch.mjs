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
const files = [...new Set(Object.values(JSON.parse(readFileSync(join(root, 'dist/side-files.json'), 'utf8'))))].concat(['src/ui/styles.css']);
rmSync(stage, { recursive: true, force: true });
for (const f of files){ if (!existsSync(join(root, f))) throw new Error('missing ' + f); mkdirSync(dirname(join(stage, f)), { recursive: true }); copyFileSync(join(root, f), join(stage, f)); }
copyFileSync(join(root, 'side.html'), join(stage, 'index.html'));
const zip = join(root, 'dist', 'the-climb-itch.zip'); rmSync(zip, { force: true });
execFileSync('zip', ['-qr', zip, '.'], { cwd: stage });
console.log(zip, files.length + 1, 'files');
