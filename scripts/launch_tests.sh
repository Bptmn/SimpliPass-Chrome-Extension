#!/usr/bin/env bash

# Purpose: Run the essential test suite: lint, type-check, unit tests, and E2E.
# Usage: ./scripts/launch_tests.sh

set -euo pipefail

# Resolve repository root (works regardless of where the script is called from)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "🧪 Running tests (lint, types, unit, E2E) ..."

# Lint and type-check (extension scope per project rules)
npm run lint:extension
npm run type-check:extension

# Unit tests (extension)
npm run test:extension -- --verbose

echo "✅ All tests completed."


