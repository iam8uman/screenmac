#!/bin/bash
# Screenmac installer: downloads the latest release from GitHub and puts it in Applications.
#   curl -fsSL https://screenmac.vercel.app/install.sh | bash
# Source: https://github.com/iam8uman/screenmac
set -euo pipefail

REPO="iam8uman/screenmac"
URL="https://github.com/$REPO/releases/latest/download/Screenmac.zip"
BUNDLE_ID="app.screenmac.Screenmac"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Screenmac is a Mac app. Run this on macOS 14 or later." >&2
  exit 1
fi
MAJOR="$(sw_vers -productVersion | cut -d. -f1)"
if (( MAJOR < 14 )); then
  echo "Screenmac needs macOS 14 or later. This Mac has $(sw_vers -productVersion)." >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Downloading the latest Screenmac…"
curl -fsSL "$URL" -o "$TMP/Screenmac.zip"
if curl -fsSL "$URL.sha256" -o "$TMP/Screenmac.zip.sha256" 2>/dev/null; then
  EXPECTED="$(awk '{print $1}' "$TMP/Screenmac.zip.sha256")"
  ACTUAL="$(shasum -a 256 "$TMP/Screenmac.zip" | awk '{print $1}')"
  if [[ "$EXPECTED" != "$ACTUAL" ]]; then
    echo "The download doesn't match its checksum. Nothing was installed; please try again." >&2
    exit 1
  fi
  echo "✓ Checksum verified"
fi
ditto -x -k "$TMP/Screenmac.zip" "$TMP"

DEST="/Applications"
if [[ ! -w "$DEST" ]]; then
  DEST="$HOME/Applications"
  mkdir -p "$DEST"
fi

# Quit a running copy before replacing it.
pkill -x Screenmac 2>/dev/null || true
sleep 0.5

rm -rf "$DEST/Screenmac.app"
ditto "$TMP/Screenmac.app" "$DEST/Screenmac.app"

# The file came straight from GitHub, so clear the "downloaded from the internet" flag.
# This is what skips the "Apple could not verify" popup.
xattr -dr com.apple.quarantine "$DEST/Screenmac.app" 2>/dev/null || true

# Each build is a new app to macOS, so an older Screen Recording entry silently stops working.
# Clear Screenmac's own entry so macOS asks again.
tccutil reset ScreenCapture "$BUNDLE_ID" >/dev/null 2>&1 || true

echo "✓ Installed to $DEST/Screenmac.app"
echo
echo "Last step: when macOS asks, turn Screenmac on in"
echo "  System Settings → Privacy & Security → Screen & System Audio Recording"
echo "then reopen Screenmac from its menu bar icon."
echo
echo "Press ⌥⇧⌘4 to capture an area. Enjoy!"

open "$DEST/Screenmac.app"
