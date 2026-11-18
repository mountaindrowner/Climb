#!/bin/bash
# Go back to an earlier build: rebuild it exactly as it was, check that it starts, and (only with --push) put it back on
# the game's itch.io page.
#   tools/restore-build.sh <build number>            rebuild and check it; nothing is uploaded
#   tools/restore-build.sh <build number> --push     the same, then push it to the page
# The build's commit is read from docs/builds.md (the build log). The old build is made in a folder of its own, from
# that commit: the working copy, the branch and the history are not touched, and work goes on from where it was.
# What this does not do: it does not change a save. A save made on a later build may not fit an earlier one (the build
# log says which builds moved things in a save): see "Going back" in docs/builds.md.
set -euo pipefail
N="${1:?the build number, e.g. 61}"; PUSH="${2:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TARGET="${ITCH_TARGET:-mountaindrowner/the-climb:html}"
ROW="$(grep -E "^\| *$N *\|" "$ROOT/docs/builds.md" | head -1 || true)"; [ -n "$ROW" ] || { echo "build $N is not in docs/builds.md"; exit 1; }
SHA="$(echo "$ROW" | grep -oE '`[0-9a-f]{7,40}`' | head -1 | tr -d '`')"; [ -n "$SHA" ] || { echo "no commit written for build $N in docs/builds.md"; exit 1; }
WORK="$(mktemp -d)"; echo "build $N is commit $SHA; rebuilding it in $WORK/src"
git -C "$ROOT" worktree add --detach "$WORK/src" "$SHA" >/dev/null 2>&1
trap 'git -C "$ROOT" worktree remove --force "$WORK/src" >/dev/null 2>&1 || true' EXIT
(cd "$WORK/src" && node tools/build-itch.mjs)
cp "$WORK/src/dist/the-climb-itch.zip" "$WORK/the-climb-itch-b$N.zip"
node "$ROOT/tools/check-build.mjs" "$WORK/the-climb-itch-b$N.zip"
mkdir -p "$ROOT/dist" && cp "$WORK/the-climb-itch-b$N.zip" "$ROOT/dist/the-climb-itch-b$N.zip"; echo "the rebuilt zip: dist/the-climb-itch-b$N.zip"
if [ "$PUSH" != "--push" ]; then echo "not pushed (add --push to put build $N back on the page)"; exit 0; fi
BUTLER="$(command -v butler || true)"
if [ -z "$BUTLER" ]; then curl -sS -L -o "$WORK/butler.zip" https://broth.itch.zone/butler/linux-amd64/LATEST/archive/default; unzip -oq "$WORK/butler.zip" -d "$WORK/butler"; chmod +x "$WORK/butler/butler"; BUTLER="$WORK/butler/butler"; fi
BUTLER_API_KEY="${BUTLER_API_KEY:-proxy-injected}" "$BUTLER" push "$ROOT/dist/the-climb-itch-b$N.zip" "$TARGET" --userversion "$N-restored"
echo "build $N is back on the page. Write it in docs/builds.md: when, and why."
