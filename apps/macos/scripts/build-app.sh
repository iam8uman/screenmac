#!/bin/bash
# Builds a universal (Apple silicon + Intel) Release Screenmac.app into apps/macos/build/.
#
#   apps/macos/scripts/build-app.sh                       ad-hoc signed (fine for local use and CI)
#   VERSION=0.3.0 apps/macos/scripts/build-app.sh         stamps a version
#   SIGN_IDENTITY="Developer ID Application: Name (TEAMID)" TEAM=TEAMID apps/macos/scripts/build-app.sh
#
# Ad-hoc builds get a new identity every build, so macOS treats each one as a new app and the
# Screen Recording permission has to be granted again. A fixed identity keeps it.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
PROJECT="$ROOT/Screenmac.xcodeproj"
DEFAULT_VERSION="$(grep -m1 'MARKETING_VERSION = ' "$PROJECT/project.pbxproj" | sed -E 's/.*= *"?([^";]+)"?;.*/\1/')"
VERSION="${VERSION:-$DEFAULT_VERSION}"
BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"
DERIVED="$ROOT/build/DerivedData"
APP="$ROOT/build/Screenmac.app"

SIGN_ARGS=(CODE_SIGN_IDENTITY="${SIGN_IDENTITY:--}" CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM="${TEAM:-}")
if [ -n "${SIGN_IDENTITY:-}" ]; then
  SIGN_ARGS+=(OTHER_CODE_SIGN_FLAGS="--timestamp")
fi

echo "▸ Building Screenmac $VERSION ($BUILD_NUMBER), universal"
xcodebuild \
  -project "$PROJECT" \
  -scheme Screenmac \
  -configuration Release \
  -destination 'generic/platform=macOS' \
  -derivedDataPath "$DERIVED" \
  ARCHS="arm64 x86_64" ONLY_ACTIVE_ARCH=NO \
  MARKETING_VERSION="$VERSION" CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  "${SIGN_ARGS[@]}" \
  -quiet \
  build

rm -rf "$APP"
ditto "$DERIVED/Build/Products/Release/Screenmac.app" "$APP"
codesign --verify --deep --strict --verbose=1 "$APP"
echo "✓ Built $APP"
