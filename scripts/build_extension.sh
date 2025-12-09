#!/usr/bin/env bash

# Purpose: Build the Chrome extension (production-ready).
# Usage: ./scripts/build_extension.sh

set -euo pipefail

# Resolve repository root (works regardless of where the script is called from)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "🔧 Building Chrome Extension ..."
echo "➡️  Output: dist/"

npm run build:extension

echo "✅ Build complete. Load the unpacked extension from the 'dist' folder in chrome://extensions"


