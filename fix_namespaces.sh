#!/bin/bash
set -e

MODULES=(
  "node_modules/react-native-ping/android/build.gradle"
  "node_modules/react-native-maps/android/build.gradle"
  "node_modules/react-native-reanimated/android/build.gradle"
  "node_modules/react-native-splash-screen/android/build.gradle"
  "node_modules/react-native-webview/android/build.gradle"
  "node_modules/@react-native-picker/picker/android/build.gradle"
  "node_modules/@react-native-firebase/crashlytics/android/build.gradle"
  "node_modules/@react-native-firebase/app/android/build.gradle"
  "node_modules/@react-native-firebase/firestore/android/build.gradle"
  "node_modules/@react-native-firebase/auth/android/build.gradle"
  "node_modules/@react-native-firebase/remote-config/android/build.gradle"
  "node_modules/@react-native-firebase/storage/android/build.gradle"
  "node_modules/@react-native-firebase/functions/android/build.gradle"
  "node_modules/@react-native-firebase/messaging/android/build.gradle"
  "node_modules/react-native-safe-area-context/android/build.gradle"
  "node_modules/react-native-geolocation-service/android/build.gradle"
  "node_modules/@react-native-community/datetimepicker/android/build.gradle"
  "node_modules/@react-native-community/masked-view/android/build.gradle"
  "node_modules/react-native-share/android/build.gradle"
  "node_modules/react-native-sound/android/build.gradle"
  "node_modules/@react-native-google-signin/google-signin/android/build.gradle"
  "node_modules/react-native-device-country/android/build.gradle"
  "node_modules/react-native-html-to-pdf/android/build.gradle"
  "node_modules/react-native-thermal-receipt-printer-image-qr/android/build.gradle"
  "node_modules/react-native-screens/android/build.gradle"
  "node_modules/react-native-gesture-handler/android/build.gradle"
  "node_modules/react-native-localize/android/build.gradle"
)

FAILED=()

for f in "${MODULES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "SKIP (not found): $f"
    continue
  fi

  dir=$(dirname "$(dirname "$f")")
  manifest=$(find "$dir/android" -name "AndroidManifest.xml" | head -1)

  if [ -z "$manifest" ]; then
    echo "NO MANIFEST FOUND: $f"
    FAILED+=("$f")
    continue
  fi

  pkg=$(grep -o 'package="[^"]*"' "$manifest" | head -1 | sed 's/package="//;s/"//')

  if [ -z "$pkg" ]; then
    echo "NO PACKAGE ATTR IN MANIFEST: $manifest (for $f)"
    FAILED+=("$f")
    continue
  fi

  if grep -q "namespace" "$f"; then
    echo "ALREADY HAS NAMESPACE, SKIPPING: $f"
    continue
  fi

  awk -v pkg="$pkg" '
    { print }
    /^[[:space:]]*android[[:space:]]*\{/ && !done {
      print "    namespace \"" pkg "\""
      done=1
    }
  ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"

  echo "FIXED: $f -> namespace \"$pkg\""
done

echo ""
echo "=== Files that need MANUAL fixing (no manifest or no package attr found) ==="
for f in "${FAILED[@]}"; do
  echo "$f"
done