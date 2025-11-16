describe('Performance E2E Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('Page Load Performance', () => {
    it('should load login page quickly', () => {
      const start = Date.now();
      cy.visit('/login');
      cy.contains('Login').should('be.visible');
      const loadTime = Date.now() - start;

      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load todos page quickly after authentication', () => {
      // Register and login
      cy.visit('/register');
      cy.get('input[name="name"]').type('Perf Test');
      cy.get('input[name="email"]').type('perf@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      const start = Date.now();
      cy.reload();
      cy.contains('My Todos').should('be.visible');
      const loadTime = Date.now() - start;

      expect(loadTime).to.be.lessThan(3000);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle many todos efficiently', () => {
      // Register user
      cy.visit('/register');
      cy.get('input[name="name"]').type('Many Todos User');
      cy.get('input[name="email"]').type('manytodos@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Create 20 todos
      for (let i = 1; i <= 20; i++) {
        cy.get('input[placeholder*="What needs to be done"]').type(`Todo ${i}`);
        cy.get('button').contains('Add Todo').click();
      }

      // Should still be responsive
      cy.contains('Todo 1').should('be.visible');
      cy.contains('Todo 20').should('be.visible');

      // Filter should work quickly
      cy.contains('button', 'Active').click();
      cy.contains('Todo 1').should('be.visible');
    });
  });

  describe('Interaction Performance', () => {
    beforeEach(() => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Interaction Test');
      cy.get('input[name="email"]').type('interaction@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
    });

    it('should toggle todos quickly', () => {
      cy.get('input[placeholder*="What needs to be done"]').type('Toggle Test');
      cy.get('button').contains('Add Todo').click();

      const start = Date.now();
      cy.contains('Toggle Test')
        .parent()
        .find('input[type="checkbox"]')
        .check();
      const toggleTime = Date.now() - start;

      expect(toggleTime).to.be.lessThan(1000);
    });

    it('should create todos quickly', () => {
      const start = Date.now();
      cy.get('input[placeholder*="What needs to be done"]').type('Quick Create');
      cy.get('button').contains('Add Todo').click();
      cy.contains('Quick Create').should('be.visible');
      const createTime = Date.now() - start;

      expect(createTime).to.be.lessThan(2000);
    });
  });
});
