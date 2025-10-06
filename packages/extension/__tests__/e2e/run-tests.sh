#!/bin/bash

# Playwright E2E Test Runner for SimpliPass Chrome Extension
# 
# This script builds the extension and runs Playwright E2E tests

set -e

echo "🎭 Starting Playwright E2E Tests for SimpliPass Chrome Extension"
echo "================================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the extension first
echo "🔨 Building Chrome extension..."
npm run build:extension

if [ $? -ne 0 ]; then
    echo "❌ Error: Extension build failed"
    exit 1
fi

echo "✅ Extension built successfully"

# Check if extension files exist
if [ ! -d "packages/extension/dist" ]; then
    echo "❌ Error: Extension dist directory not found"
    exit 1
fi

if [ ! -f "packages/extension/dist/manifest.json" ]; then
    echo "❌ Error: Extension manifest not found"
    exit 1
fi

echo "✅ Extension files verified"

# Run Playwright tests
echo "🧪 Running Playwright E2E tests..."

# Check if specific test file is provided
if [ $# -eq 1 ]; then
    TEST_FILE=$1
    echo "Running specific test: $TEST_FILE"
    npx playwright test $TEST_FILE
else
    echo "Running all E2E tests..."
    npx playwright test packages/extension/__tests__/e2e/
fi

if [ $? -eq 0 ]; then
    echo "✅ All E2E tests passed!"
else
    echo "❌ Some E2E tests failed"
    exit 1
fi

echo "🎉 E2E testing completed successfully!"
