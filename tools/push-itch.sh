#!/bin/bash
# Push the itch build to the game's itch.io page with butler (itch's upload tool).
#   tools/push-itch.sh <build number>        e.g. tools/push-itch.sh 62
# Builds dist/the-climb-itch.zip first (tools/build-itch.mjs), unpacks it, and pushes it to the page's `html` channel,
# marked with the build number. The page plays whichever upload is ticked "This file will be played in the browser" in
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
(cd "$ROOT" && node tools/build-itch.mjs)
mkdir "$WORK/game" && unzip -q "$ROOT/dist/the-climb-itch.zip" -d "$WORK/game"
BUTLER_API_KEY="${BUTLER_API_KEY:-proxy-injected}" "$BUTLER" push "$WORK/game" "$TARGET" --userversion "$N"
BUTLER_API_KEY="${BUTLER_API_KEY:-proxy-injected}" "$BUTLER" status "$TARGET"
