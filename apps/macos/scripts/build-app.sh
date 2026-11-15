#!/bin/bash
# Builds a universal (Apple silicon + Intel) Release Screenmac.app into apps/macos/build/.
#
#   apps/macos/scripts/build-app.sh                       ad-hoc signed (fine for local use and CI)
#   VERSION=0.3.0 apps/macos/scripts/build-app.sh         stamps a version
#   SIGN_IDENTITY="Developer ID Application: Name (TEAMID)" apps/macos/scripts/build-app.sh
#
# With SIGN_IDENTITY the app is signed inside-out with the hardened runtime, a secure timestamp
# and Config/Screenmac.entitlements, ready for notarization. Without it the build is ad-hoc signed.
#
# Ad-hoc builds get a new identity every build, so macOS treats each one as a new app and the
# Screen Recording permission has to be granted again. A Developer ID signature keeps it.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
PROJECT="$ROOT/Screenmac.xcodeproj"
DEFAULT_VERSION="$(grep -m1 'MARKETING_VERSION = ' "$PROJECT/project.pbxproj" | sed -E 's/.*= *"?([^";]+)"?;.*/\1/')"
VERSION="${VERSION:-$DEFAULT_VERSION}"
BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"
DERIVED="$ROOT/build/DerivedData"
APP="$ROOT/build/Screenmac.app"
ENTITLEMENTS="$ROOT/Config/Screenmac.entitlements"

echo "▸ Building Screenmac $VERSION ($BUILD_NUMBER), universal"
xcodebuild \
  -project "$PROJECT" \
  -scheme Screenmac \
  -configuration Release \
  -destination 'generic/platform=macOS' \
  -derivedDataPath "$DERIVED" \
  ARCHS="arm64 x86_64" ONLY_ACTIVE_ARCH=NO \
  MARKETING_VERSION="$VERSION" CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= \
  -quiet \
  build

rm -rf "$APP"
ditto "$DERIVED/Build/Products/Release/Screenmac.app" "$APP"

if [ -n "${SIGN_IDENTITY:-}" ]; then
  echo "▸ Signing with $SIGN_IDENTITY"
  SIGN=(codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY")
  # Inside-out: anything nested (frameworks, dylibs, XPC services, login items, helpers) gets
  # signed before the bundle that contains it. Today the app has nothing nested; this keeps it
  # right if that changes. Deepest paths first.
  while IFS= read -r item; do
    [ -n "$item" ] && "${SIGN[@]}" "$item"
  done < <(find "$APP/Contents" -mindepth 2 \
             \( -name '*.framework' -o -name '*.dylib' -o -name '*.xpc' -o -name '*.app' -o -name '*.appex' \
                -o \( -type f -perm -u+x -path '*/Contents/Helpers/*' \) \) -print \
           | awk '{ print gsub("/", "/"), $0 }' | sort -rn | cut -d' ' -f2-)
  # The app itself last, with the entitlements its features need (microphone under the hardened runtime).
  "${SIGN[@]}" --entitlements "$ENTITLEMENTS" "$APP"
else
  echo "▸ Ad-hoc signing"
  codesign --force --options runtime --sign - --entitlements "$ENTITLEMENTS" "$APP"
fi

codesign --verify --deep --strict --verbose=1 "$APP"
echo "✓ Built $APP"
