import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for OD Portal E2E Tests
 * 
 * This config:
 * - Starts the Vite dev server automatically before running tests
 * - Runs tests in Chromium, Firefox, and WebKit for cross-browser coverage
 * - Takes screenshots and traces on failure for debugging in CI
 * - Uses environment variables for Supabase credentials
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Maximum time a single test can run */
  timeout: 60_000,
  
  /* Maximum time the entire test suite can run */
  globalTimeout: 600_000,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry failed tests on CI to handle flakiness */
  retries: process.env.CI ? 2 : 0,
  
  /* Run tests in parallel on CI, sequential locally for easier debugging */
  workers: process.env.CI ? 2 : 1,
  
  /* Reporter: rich HTML report locally, GitHub-integrated on CI */
  reporter: process.env.CI 
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation actions like page.goto('/') */
    baseURL: 'http://localhost:5173',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Collect trace on first retry for debugging */
    trace: 'on-first-retry',
    
    /* Record video on failure */
    video: 'on-first-retry',
  },

  /* Configure browser projects for cross-browser testing */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Start the Vite dev server before running tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
      VITE_GROQ_API_KEY: process.env.VITE_GROQ_API_KEY || '',
    },
  },
});
