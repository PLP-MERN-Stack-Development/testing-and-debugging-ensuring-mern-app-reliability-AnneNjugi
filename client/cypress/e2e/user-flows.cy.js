describe('Complete User Flows E2E Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('New User Complete Flow', () => {
    it('should complete full user journey from registration to managing todos', () => {
      // Step 1: Visit the app
      cy.visit('/');
      cy.url().should('include', '/login');

      // Step 2: Navigate to registration
      cy.contains('Register').click();
      cy.url().should('include', '/register');

      // Step 3: Register new account
      cy.get('input[name="name"]').type('Complete Flow User');
      cy.get('input[name="email"]').type('completeflow@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Step 4: Should be redirected to todos page
      cy.url().should('include', '/todos');
      cy.contains('My Todos').should('be.visible');

      // Step 5: Create first todo
      cy.get('input[placeholder*="What needs to be done"]').type('Buy groceries');
      cy.get('input[placeholder*="Description"]').type('Milk, eggs, bread');
      cy.get('select[name="priority"]').select('high');
      cy.get('button').contains('Add Todo').click();
      cy.contains('Buy groceries').should('be.visible');

      // Step 6: Create second todo
      cy.get('input[placeholder*="What needs to be done"]').type('Finish project');
      cy.get('button').contains('Add Todo').click();
      cy.contains('Finish project').should('be.visible');

      // Step 7: Complete first todo
      cy.contains('Buy groceries')
        .parent()
        .find('input[type="checkbox"]')
        .check();

      // Step 8: Filter to see only active todos
      cy.contains('button', 'Active').click();
      cy.contains('Finish project').should('be.visible');
      cy.contains('Buy groceries').should('not.exist');

      // Step 9: Filter to see completed todos
      cy.contains('button', 'Completed').click();
      cy.contains('Buy groceries').should('be.visible');
      cy.contains('Finish project').should('not.exist');

      // Step 10: View all todos
      cy.contains('button', 'All').click();
      cy.contains('Buy groceries').should('be.visible');
      cy.contains('Finish project').should('be.visible');

      // Step 11: Edit a todo
      cy.contains('Finish project')
        .parent()
        .find('button[aria-label="Edit todo"]')
        .click();
      cy.get('input[name="title"]').clear().type('Complete testing assignment');
      cy.contains('button', 'Save').click();
      cy.contains('Complete testing assignment').should('be.visible');

      // Step 12: Delete a todo
      cy.on('window:confirm', () => true);
      cy.contains('Buy groceries')
        .parent()
        .find('button[aria-label="Delete todo"]')
        .click();
      cy.contains('Buy groceries').should('not.exist');

      // Step 13: Logout
      cy.contains('Logout').click();
      cy.url().should('include', '/login');

      // Step 14: Login again
      cy.get('input[name="email"]').type('completeflow@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Step 15: Verify data persisted
      cy.contains('Complete testing assignment').should('be.visible');
      cy.contains('Buy groceries').should('not.exist');
    });
  });

  describe('Returning User Flow', () => {
    it('should handle returning user login and todo management', () => {
      // Setup: Create user with existing todos
      cy.visit('/register');
      cy.get('input[name="name"]').type('Returning User');
      cy.get('input[name="email"]').type('returning@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('input[placeholder*="What needs to be done"]').type('Existing Todo 1');
      cy.get('button').contains('Add Todo').click();
      cy.get('input[placeholder*="What needs to be done"]').type('Existing Todo 2');
      cy.get('button').contains('Add Todo').click();

      cy.contains('Logout').click();

      // Returning user flow
      cy.visit('/login');
      cy.get('input[name="email"]').type('returning@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should see existing todos
      cy.contains('Existing Todo 1').should('be.visible');
      cy.contains('Existing Todo 2').should('be.visible');

      // Add new todo
      cy.get('input[placeholder*="What needs to be done"]').type('New Todo');
      cy.get('button').contains('Add Todo').click();
      cy.contains('New Todo').should('be.visible');
    });
  });

  describe('Multi-User Scenario', () => {
    it('should handle multiple users with isolated data', () => {
      // User 1
      cy.visit('/register');
      cy.get('input[name="name"]').type('User One');
      cy.get('input[name="email"]').type('user1@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('input[placeholder*="What needs to be done"]').type('User 1 Todo');
      cy.get('button').contains('Add Todo').click();
      cy.contains('User 1 Todo').should('be.visible');

      cy.contains('Logout').click();

      // User 2
      cy.visit('/register');
      cy.get('input[name="name"]').type('User Two');
      cy.get('input[name="email"]').type('user2@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should not see User 1's todo
      cy.contains('User 1 Todo').should('not.exist');

      cy.get('input[placeholder*="What needs to be done"]').type('User 2 Todo');
      cy.get('button').contains('Add Todo').click();
      cy.contains('User 2 Todo').should('be.visible');

      cy.contains('Logout').click();

      // User 1 logs back in
      cy.visit('/login');
      cy.get('input[name="email"]').type('user1@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should only see their own todo
      cy.contains('User 1 Todo').should('be.visible');
      cy.contains('User 2 Todo').should('not.exist');
    });
  });
});
