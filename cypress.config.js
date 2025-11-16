const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'client/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'client/cypress/support/e2e.js',
    videosFolder: 'client/cypress/videos',
    screenshotsFolder: 'client/cypress/screenshots',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
