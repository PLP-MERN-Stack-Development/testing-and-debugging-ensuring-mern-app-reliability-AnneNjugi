describe('Error Handling E2E Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('Form Validation Errors', () => {
    it('should show validation error for empty registration form', () => {
      cy.visit('/register');
      cy.get('button[type="submit"]').click();

      // HTML5 validation should prevent submission
      cy.get('input[name="name"]').should('be.invalid');
    });

    it('should show validation error for empty login form', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();

      cy.get('input[name="email"]').should('be.invalid');
    });

    it('should show error for short password', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('12345');
      cy.get('input[name="confirmPassword"]').type('12345');
      cy.get('button[type="submit"]').click();

      // HTML5 minlength validation
      cy.get('input[name="password"]').should('be.invalid');
    });

    it('should show error for invalid email format', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('not-an-email');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('input[name="email"]').should('be.invalid');
    });
  });

  describe('API Error Handling', () => {
    it('should display error message for failed login', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').should('contain', 'Invalid credentials');
    });

    it('should display error message for duplicate registration', () => {
      // Register first user
      cy.visit('/register');
      cy.get('input[name="name"]').type('First User');
      cy.get('input[name="email"]').type('duplicate@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Logout
      cy.contains('Logout').click();

      // Try to register again
      cy.visit('/register');
      cy.get('input[name="name"]').type('Second User');
      cy.get('input[name="email"]').type('duplicate@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').should('contain', 'already exists');
    });

    it('should clear error message when user types', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpass');
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('be.visible');

      // Type in email field
      cy.get('input[name="email"]').clear().type('new@example.com');

      cy.get('[role="alert"]').should('not.exist');
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Intercept and fail the request
      cy.intercept('POST', '**/api/auth/login', {
        forceNetworkError: true
      }).as('loginRequest');

      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.get('[role="alert"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', () => {
      // Delay the response
      cy.intercept('POST', '**/api/auth/login', (req) => {
        req.reply((res) => {
          res.delay = 1000;
        });
      }).as('loginRequest');

      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.contains('Logging in...').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should show loading state during registration', () => {
      cy.intercept('POST', '**/api/auth/register', (req) => {
        req.reply((res) => {
          res.delay = 1000;
        });
      }).as('registerRequest');

      cy.visit('/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.contains('Registering...').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should show loading state when fetching todos', () => {
      // Register and login
      cy.visit('/register');
      cy.get('input[name="name"]').type('Loading Test');
      cy.get('input[name="email"]').type('loading@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Intercept todos request with delay
      cy.intercept('GET', '**/api/todos', (req) => {
        req.reply((res) => {
          res.delay = 1000;
        });
      }).as('getTodos');

      cy.reload();

      cy.contains('Loading todos...').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long todo titles', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Edge Case User');
      cy.get('input[name="email"]').type('edge@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      const longTitle = 'A'.repeat(100);
      cy.get('input[placeholder*="What needs to be done"]').type(longTitle);
      cy.get('button').contains('Add Todo').click();

      cy.contains(longTitle).should('be.visible');
    });

    it('should handle special characters in todo title', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Special Char User');
      cy.get('input[name="email"]').type('special@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      const specialTitle = 'Todo with <script>alert("xss")</script> & special chars!';
      cy.get('input[placeholder*="What needs to be done"]').type(specialTitle);
      cy.get('button').contains('Add Todo').click();

      // Should be sanitized
      cy.contains('Todo with').should('be.visible');
    });
  });
});
