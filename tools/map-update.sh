#!/bin/bash
# The map page, redrawn from the game as it stands: one command after a build.
#   tools/map-update.sh [out_dir]
# Reads the build's number and day from src/side/main.js, and writes into out_dir (default /tmp/climb-map) the four
# files the page is published from: index.html, map.png, map-data.json and the-climb-map.png (the labelled picture).
# Publishing is then one step: the page at out_dir/index.html with the other three beside it, to the same address.
set -e
cd "$(dirname "$0")/.."
OUT="${1:-/tmp/climb-map}"; mkdir -p "$OUT"
V=$(grep -m1 "^const VERSION" src/side/main.js)
N=$(echo "$V" | sed -E "s/.*build: ([0-9]+).*/\1/"); D=$(echo "$V" | sed -E "s/.*date: '([^']+)'.*/\1/")
node tools/map-dump.mjs "$OUT/dump.json" > /dev/null
python3 tools/map-render.py "$OUT/dump.json" "$OUT/the-climb-map.png" "BUILD $N · $D" "$OUT" > /dev/null
cp tools/map/page.html "$OUT/index.html"; rm "$OUT/dump.json"
echo "map for build $N in $OUT"; ls -la "$OUT" | tail -n +4
