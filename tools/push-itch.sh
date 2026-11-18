#!/bin/bash
# Push the itch build to the game's itch.io page with butler (itch's upload tool).
#   tools/push-itch.sh <build number>        e.g. tools/push-itch.sh 62
# Builds dist/the-climb-itch.zip first (tools/build-itch.mjs) and pushes that zip to the page's `html` channel, marked
# with the build number. Every push replaces that channel's one file: old builds do not pile up on the page. It will
# not push a build that has no entry in the build log (docs/builds.md), that is not committed, or that does not start
# (tools/check-build.mjs). To go back to an earlier build: tools/restore-build.sh. The page plays whichever upload is ticked "This file will be played in the browser" in
# its edit screen: the `html` channel's upload, once that is set, is replaced in place by every later push.
# The key is never in this repository or in a variable: in a Claude cloud session it is saved on the environment as a
# network secret for api.itch.io and added to butler's requests by the session's proxy (BUTLER_API_KEY below is a
# placeholder butler needs in order to start). Elsewhere, run `butler login` once, or set BUTLER_API_KEY yourself.
set -euo pipefail
N="${1:?the build number, e.g. 62}"
TARGET="${ITCH_TARGET:-mountaindrowner/the-climb:html}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; WORK="$(mktemp -d)"
BUTLER="$(command -v butler || true)"
if [ -z "$BUTLER" ]; then curl -sS -L -o "$WORK/butler.zip" https://broth.itch.zone/butler/linux-amd64/LATEST/archive/default; unzip -oq "$WORK/butler.zip" -d "$WORK/butler"; chmod +x "$WORK/butler/butler"; BUTLER="$WORK/butler/butler"; fi
# no build goes up without its entry in the build log, its own number written in it, and a look at it starting
grep -qE "^\| *$N *\|" "$ROOT/docs/builds.md" || { echo "build $N has no entry in docs/builds.md: write it first"; exit 1; }
grep -q "build: $N," "$ROOT/src/side/main.js" || { echo "src/side/main.js does not say build $N (VERSION)"; exit 1; }
git -C "$ROOT" diff --quiet && git -C "$ROOT" diff --cached --quiet || { echo "there are changes not committed: a build is pushed from a commit, so that it can be made again"; exit 1; }
(cd "$ROOT" && node tools/build-itch.mjs)
node "$ROOT/tools/check-build.mjs" "$ROOT/dist/the-climb-itch.zip"
BUTLER_API_KEY="${BUTLER_API_KEY:-proxy-injected}" "$BUTLER" push "$ROOT/dist/the-climb-itch.zip" "$TARGET" --userversion "$N"
BUTLER_API_KEY="${BUTLER_API_KEY:-proxy-injected}" "$BUTLER" status "$TARGET"
