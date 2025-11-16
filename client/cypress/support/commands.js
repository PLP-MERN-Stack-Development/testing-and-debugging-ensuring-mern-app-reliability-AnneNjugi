// Custom Cypress commands

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Clear database command (for testing)
Cypress.Commands.add('clearDatabase', () => {
  cy.request('POST', 'http://localhost:5000/api/test/clear-db');
});

// Seed database command (for testing)
Cypress.Commands.add('seedDatabase', (data) => {
  cy.request('POST', 'http://localhost:5000/api/test/seed-db', data);
});
