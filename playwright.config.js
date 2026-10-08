const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  timeout: 30 * 1000,

  expect: {
    timeout: 10 * 1000,
  },

  fullyParallel: false,

  retries: process.env.CI ? 1 : 0,

  workers: 1,

  reporter: [
    ['list'],
    ['./reporter/CustomReporter.js']
  ],

  use: {
    baseURL: 'https://parabank.parasoft.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 10 * 1000,

    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});