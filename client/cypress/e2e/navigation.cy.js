describe('Navigation E2E Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('Unauthenticated Navigation', () => {
    it('should navigate between login and register pages', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');

      cy.contains('Register').click();
      cy.url().should('include', '/register');

      cy.contains('Login').click();
      cy.url().should('include', '/login');
    });

    it('should redirect root path to login when not authenticated', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('should redirect todos path to login when not authenticated', () => {
      cy.visit('/todos');
      cy.url().should('include', '/login');
    });
  });

  describe('Authenticated Navigation', () => {
    beforeEach(() => {
      // Register and login
      cy.visit('/register');
      cy.get('input[name="name"]').type('Nav Test User');
      cy.get('input[name="email"]').type('navtest@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
    });

    it('should redirect root path to todos when authenticated', () => {
      cy.visit('/');
      cy.url().should('include', '/todos');
    });

    it('should redirect login path to todos when authenticated', () => {
      cy.visit('/login');
      cy.url().should('include', '/todos');
    });

    it('should redirect register path to todos when authenticated', () => {
      cy.visit('/register');
      cy.url().should('include', '/todos');
    });

    it('should stay on todos page when directly accessing it', () => {
      cy.visit('/todos');
      cy.url().should('include', '/todos');
      cy.contains('My Todos').should('be.visible');
    });
  });

  describe('Browser Navigation', () => {
    it('should handle browser back button', () => {
      cy.visit('/login');
      cy.contains('Register').click();
      cy.url().should('include', '/register');

      cy.go('back');
      cy.url().should('include', '/login');
    });

    it('should handle browser forward button', () => {
      cy.visit('/login');
      cy.contains('Register').click();
      cy.go('back');
      cy.go('forward');
      cy.url().should('include', '/register');
    });

    it('should maintain state after navigation', () => {
      // Register user
      cy.visit('/register');
      cy.get('input[name="name"]').type('State Test');
      cy.get('input[name="email"]').type('statetest@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Create todo
      cy.get('input[placeholder*="What needs to be done"]').type('Test Todo');
      cy.get('button').contains('Add Todo').click();

      // Logout and login again
      cy.contains('Logout').click();
      cy.get('input[name="email"]').type('statetest@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Todo should still be there
      cy.contains('Test Todo').should('be.visible');
    });
  });
});
