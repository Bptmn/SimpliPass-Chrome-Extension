import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  testDir: '../../packages/extension/__tests__/e2e',
  fullyParallel: false, // Sequential for extension tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // One worker for extension tests
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'chrome-extension://',
  },
  projects: [
    {
      name: 'chromium-extension',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
  ],
});
