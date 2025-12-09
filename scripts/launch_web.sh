#!/usr/bin/env bash

# Purpose: Launch the web development mode with HMR for fast UI iteration.
# Usage: ./scripts/launch_web.sh

set -euo pipefail

# Resolve repository root (works regardless of where the script is called from)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "🌐 Starting Web Dev Mode (HMR) ..."
echo "➡️  Docs: documentation/DEVELOPPEMENT_WEB_MODE.md"

npm run dev:web


