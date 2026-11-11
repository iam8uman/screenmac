#!/bin/bash
# Screenmac installer: downloads the latest release from GitHub and puts it in Applications.
#   curl -fsSL https://screenmac.vercel.app/install.sh | bash
# Source: https://github.com/iam8uman/screenmac
set -euo pipefail

REPO="iam8uman/screenmac"
URL="https://github.com/$REPO/releases/latest/download/Screenmac.zip"
BUNDLE_ID="app.screenmac.Screenmac"

# Colors only when writing to a terminal that supports them.
if [[ -t 1 && -z "${NO_COLOR:-}" && "${TERM:-dumb}" != "dumb" ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
  GREEN=$'\033[38;5;42m'; RED=$'\033[38;5;203m'; ACCENT=$'\033[38;5;99m'
  GRADIENT=($'\033[38;5;63m' $'\033[38;5;69m' $'\033[38;5;105m' $'\033[38;5;141m' $'\033[38;5;177m' $'\033[38;5;213m')
  FANCY=1
else
  BOLD=""; DIM=""; RESET=""; GREEN=""; RED=""; ACCENT=""; GRADIENT=("" "" "" "" "" ""); FANCY=0
fi

banner() {
  local lines=(
    "  ███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗███╗   ███╗ █████╗  ██████╗"
    "  ██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║████╗ ████║██╔══██╗██╔════╝"
    "  ███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║██╔████╔██║███████║██║     "
    "  ╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║██║╚██╔╝██║██╔══██║██║     "
    "  ███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║██║ ╚═╝ ██║██║  ██║╚██████╗"
    "  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝"
  )
  local small=(
    "  █▀▀ █▀▀ █▀█ █▀▀ █▀▀ █▄ █ █▀▄▀█ ▄▀█ █▀▀"
    "  ▄▄█ █▄▄ █▀▄ ██▄ ██▄ █ ▀█ █ ▀ █ █▀█ █▄▄"
  )
  # Under `curl | bash` tput can't see the terminal and always says 80, so ask the terminal itself.
  local cols
  cols="$(stty size </dev/tty 2>/dev/null | awk '{print $2}')"
  [[ "$cols" =~ ^[0-9]+$ && "$cols" -gt 0 ]] || cols="${COLUMNS:-80}"
  echo
  local i
  if (( FANCY == 1 && cols >= 80 )); then
    for i in "${!lines[@]}"; do
      printf '%s%s%s\n' "${GRADIENT[$i]}" "${lines[$i]}" "$RESET"
    done
  elif (( FANCY == 1 && cols >= 42 )); then
    for i in "${!small[@]}"; do
      printf '%s%s%s\n' "${GRADIENT[$((i * 4))]}" "${small[$i]}" "$RESET"
    done
  else
    printf '  %sS C R E E N M A C%s\n' "$BOLD$ACCENT" "$RESET"
  fi
  printf '\n  %sScreenshots and screen recordings for your Mac%s\n\n' "$DIM" "$RESET"
}

step() { printf '  %s→%s %s\n' "$ACCENT" "$RESET" "$1"; }
ok()   { printf '  %s✓%s %s\n' "$GREEN" "$RESET" "$1"; }
fail() { printf '\n  %s✗ %s%s\n' "$RED" "$1" "$RESET" >&2; exit 1; }

# GitHub serves downloads from several servers. If one is unreachable from this network,
# curl would otherwise wait over a minute on it; a short connect timeout moves on to the next.
CURL_OPTS=(-fL --connect-timeout 6 --retry 4 --retry-delay 1 --retry-connrefused)

banner

if [[ "$(uname -s)" != "Darwin" ]]; then
  fail "Screenmac is a Mac app. Run this on macOS 14 or later."
fi
MAJOR="$(sw_vers -productVersion | cut -d. -f1)"
if (( MAJOR < 14 )); then
  fail "Screenmac needs macOS 14 or later. This Mac has $(sw_vers -productVersion)."
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

step "Downloading the latest Screenmac (about 2 MB)…"
if [[ -t 2 ]]; then
  curl "${CURL_OPTS[@]}" --progress-bar "$URL" -o "$TMP/Screenmac.zip" || fail "The download failed. Check your connection and run the command again."
else
  curl "${CURL_OPTS[@]}" -sS "$URL" -o "$TMP/Screenmac.zip" || fail "The download failed. Check your connection and run the command again."
fi
ok "Downloaded"

if curl "${CURL_OPTS[@]}" -sS "$URL.sha256" -o "$TMP/Screenmac.zip.sha256" 2>/dev/null; then
  EXPECTED="$(awk '{print $1}' "$TMP/Screenmac.zip.sha256")"
  ACTUAL="$(shasum -a 256 "$TMP/Screenmac.zip" | awk '{print $1}')"
  if [[ "$EXPECTED" != "$ACTUAL" ]]; then
    fail "The download doesn't match its checksum. Nothing was installed; please try again."
  fi
  ok "Checksum verified"
fi

step "Installing…"
ditto -x -k "$TMP/Screenmac.zip" "$TMP"
VERSION="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$TMP/Screenmac.app/Contents/Info.plist" 2>/dev/null || true)"

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

ok "Installed Screenmac${VERSION:+ $VERSION} to $DEST/Screenmac.app"
echo
printf '  %sLast step:%s when macOS asks, turn Screenmac on in\n' "$BOLD" "$RESET"
printf '  System Settings → Privacy & Security → Screen & System Audio Recording,\n'
printf '  then reopen Screenmac from its menu bar icon.\n'
echo
printf '  Press %s⌥⇧⌘4%s to capture an area. Enjoy!\n\n' "$BOLD$ACCENT" "$RESET"

open "$DEST/Screenmac.app"
