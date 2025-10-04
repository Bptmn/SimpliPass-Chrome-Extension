# Playwright E2E Testing Commands

## Quick Reference

### Standard Test Runs

```bash
# Run tests with visible browser (DEFAULT - headed mode with 100ms slowMo)
npm run test:e2e

# Run tests in headless mode (fast, no browser window - for CI)
npm run test:e2e:headless

# Run tests with extra slow actions (500ms delay - great for demos/debugging)
npm run test:e2e:slow
```

### Interactive/Debugging Modes

```bash
# Open Playwright UI (interactive test runner)
npm run test:e2e:ui

# Debug mode (step through tests with Playwright Inspector)
npm run test:e2e:debug

# View last test report (HTML with screenshots/videos)
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test packages/extension/__tests__/e2e/01-initialization.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should login"

# Run only failed tests from last run
npx playwright test --last-failed
```

### Custom Configurations

You can customize behavior with environment variables:

```bash
# Run headless
HEADLESS=true npm run test:e2e

# Custom slow motion delay (in milliseconds)
SLOWMO=1000 npm run test:e2e

# Combine options
SLOWMO=200 npm run test:e2e
```

## What You See During Tests

### Headed Mode (Default)
- ✅ Chrome browser window opens
- ✅ You see the extension popup
- ✅ Actions happen with 100ms delay between them
- ✅ Browser closes automatically when test completes
- ✅ Console logs printed in terminal

### Slow Mode (`npm run test:e2e:slow`)
- ✅ Same as headed mode but with 500ms delays
- ✅ Perfect for watching what the test is doing
- ✅ Great for demos or presentations

### UI Mode (`npm run test:e2e:ui`)
- ✅ Interactive Playwright interface
- ✅ See all tests in a list
- ✅ Run tests one at a time
- ✅ Watch browser actions
- ✅ Inspect DOM and console
- ✅ Time travel through test steps

### Debug Mode (`npm run test:e2e:debug`)
- ✅ Playwright Inspector opens
- ✅ Step through each action
- ✅ Pause execution
- ✅ Inspect selectors
- ✅ See what elements are being interacted with

### Headless Mode (`npm run test:e2e:headless`)
- ⚡ Fastest execution
- 🤖 No browser window (runs in background)
- 📊 Best for CI/CD pipelines
- 📸 Still captures screenshots on failure

## Test Output

### Terminal Output
```
Running 3 tests using 1 worker

Extension ID: ldobcfgjehkmddppfmmkbemehoppoeio
  ✓  Extension Initialization › should load extension successfully (1.4s)
  ✓  Extension Initialization › should open popup without errors (1.7s)
  ✓  Extension Initialization › should have correct manifest configuration (1.2s)

3 passed (4.8s)
```

### Console Logs
All console output from the extension is captured:
```
[log] [InitializationService] Starting application initialization
[log] [Firebase] Initializing Firebase...
[log] [InitializationService] Application fully initialized
```

### Artifacts on Failure
When tests fail, Playwright automatically creates:
- 📸 Screenshots (`test-results/`)
- 🎥 Videos (`test-results/`)
- 📊 Trace files (`test-results/`)
- 📄 HTML report (`playwright-report/`)

## Tips

### For Development
Use the default command to see what's happening:
```bash
npm run test:e2e
```

### For Debugging Failures
Use UI mode to inspect interactively:
```bash
npm run test:e2e:ui
```

### For Understanding Test Flow
Use slow mode to watch each step:
```bash
npm run test:e2e:slow
```

### For CI/CD
Use headless mode for speed:
```bash
npm run test:e2e:headless
```

### For Demos
Use extra slow mode:
```bash
SLOWMO=1000 npm run test:e2e
```

## Troubleshooting

### Browser Opens Too Quickly
Increase the slow motion delay:
```bash
SLOWMO=800 npm run test:e2e
```

### Need to See Browser in CI
Remove the `HEADLESS=true` from CI config (not recommended for performance)

### Tests Too Slow Locally
Use headless mode for faster feedback:
```bash
npm run test:e2e:headless
```

### Want to Debug Specific Test
Use the Playwright Inspector:
```bash
npx playwright test path/to/test.spec.ts --debug
```

## Best Practices

1. **Development**: Run `npm run test:e2e` to see browser actions
2. **Debugging**: Use `npm run test:e2e:ui` for interactive inspection
3. **CI/CD**: Use `npm run test:e2e:headless` for fast execution
4. **Demos**: Use `npm run test:e2e:slow` to showcase test behavior
5. **Always**: Build first with `npm run build:extension`

---

**Note**: All headed modes require the browser window to be visible. Tests will still run if you minimize the window, but you won't see the actions.

