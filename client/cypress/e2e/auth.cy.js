describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');

      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      
      cy.get('button[type="submit"]').click();

      // Should redirect to todos page
      cy.url().should('include', '/todos');
      cy.contains('My Todos').should('be.visible');
    });

    it('should show error when passwords do not match', () => {
      cy.visit('/register');

      cy.get('input[name="name"]').type('Jane Doe');
      cy.get('input[name="email"]').type('jane@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('different');
      
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('contain', 'Passwords do not match');
      cy.url().should('include', '/register');
    });

    it('should show error for invalid email', () => {
      cy.visit('/register');

      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('be.visible');
    });

    it('should show error for duplicate email', () => {
      // Register first user
      cy.visit('/register');
      cy.get('input[name="name"]').type('First User');
      cy.get('input[name="email"]').type('duplicate@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Logout
      cy.contains('Logout').click();

      // Try to register with same email
      cy.visit('/register');
      cy.get('input[name="name"]').type('Second User');
      cy.get('input[name="email"]').type('duplicate@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('contain', 'already exists');
    });

    it('should navigate to login page from register', () => {
      cy.visit('/register');
      cy.contains('Login').click();
      cy.url().should('include', '/login');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user
      cy.visit('/register');
      cy.get('input[name="name"]').type('Login Test User');
      cy.get('input[name="email"]').type('logintest@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Logout').click();
    });

    it('should login with valid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('logintest@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/todos');
      cy.contains('My Todos').should('be.visible');
    });

    it('should show error with invalid email', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('contain', 'Invalid credentials');
      cy.url().should('include', '/login');
    });

    it('should show error with invalid password', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('logintest@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.get('[role="alert"]').should('contain', 'Invalid credentials');
    });

    it('should navigate to register page from login', () => {
      cy.visit('/login');
      cy.contains('Register').click();
      cy.url().should('include', '/register');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Register and login
      cy.visit('/register');
      cy.get('input[name="name"]').type('Logout Test');
      cy.get('input[name="email"]').type('logouttest@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
    });

    it('should logout and redirect to login page', () => {
      cy.contains('Logout').click();

      cy.url().should('include', '/login');
      cy.contains('Login').should('be.visible');
    });

    it('should clear authentication token on logout', () => {
      cy.contains('Logout').click();

      cy.window().then((window) => {
        expect(window.localStorage.getItem('token')).to.be.null;
      });
    });

    it('should not access todos page after logout', () => {
      cy.contains('Logout').click();
      cy.visit('/todos');

      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing todos without auth', () => {
      cy.visit('/todos');
      cy.url().should('include', '/login');
    });

    it('should redirect to todos when accessing login while authenticated', () => {
      // Register user
      cy.visit('/register');
      cy.get('input[name="name"]').type('Protected Test');
      cy.get('input[name="email"]').type('protected@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Try to visit login
      cy.visit('/login');
      cy.url().should('include', '/todos');
    });
  });
});
