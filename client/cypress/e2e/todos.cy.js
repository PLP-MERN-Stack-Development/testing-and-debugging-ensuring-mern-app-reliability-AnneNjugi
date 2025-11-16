describe('Todo Management E2E Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
    
    // Register and login
    cy.visit('/register');
    cy.get('input[name="name"]').type('Todo Test User');
    cy.get('input[name="email"]').type('todouser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/todos');
  });

  describe('Creating Todos', () => {
    it('should create a new todo', () => {
      cy.get('input[placeholder*="What needs to be done"]').type('Buy groceries');
      cy.get('button').contains('Add Todo').click();

      cy.contains('Buy groceries').should('be.visible');
    });

    it('should create todo with description and priority', () => {
      cy.get('input[placeholder*="What needs to be done"]').type('Important task');
      cy.get('input[placeholder*="Description"]').type('This is very important');
      cy.get('select[name="priority"]').select('high');
      cy.get('button').contains('Add Todo').click();

      cy.contains('Important task').should('be.visible');
      cy.contains('This is very important').should('be.visible');
      cy.contains('high').should('be.visible');
    });

    it('should clear form after creating todo', () => {
      cy.get('input[placeholder*="What needs to be done"]').type('Test Todo');
      cy.get('button').contains('Add Todo').click();

      cy.get('input[placeholder*="What needs to be done"]').should('have.value', '');
    });

    it('should not create todo with empty title', () => {
      cy.get('button').contains('Add Todo').click();

      // Form validation should prevent submission
      cy.get('input[placeholder*="What needs to be done"]').should('be.invalid');
    });

    it('should create multiple todos', () => {
      const todos = ['Todo 1', 'Todo 2', 'Todo 3'];

      todos.forEach(todo => {
        cy.get('input[placeholder*="What needs to be done"]').type(todo);
        cy.get('button').contains('Add Todo').click();
      });

      todos.forEach(todo => {
        cy.contains(todo).should('be.visible');
      });
    });
  });

  describe('Viewing Todos', () => {
    beforeEach(() => {
      // Create some test todos
      cy.get('input[placeholder*="What needs to be done"]').type('Active Todo 1');
      cy.get('button').contains('Add Todo').click();

      cy.get('input[placeholder*="What needs to be done"]').type('Active Todo 2');
      cy.get('button').contains('Add Todo').click();

      cy.get('input[placeholder*="What needs to be done"]').type('Completed Todo');
      cy.get('button').contains('Add Todo').click();

      // Mark one as completed
      cy.contains('Completed Todo').parent().find('input[type="checkbox"]').check();
    });

    it('should display all todos by default', () => {
      cy.contains('Active Todo 1').should('be.visible');
      cy.contains('Active Todo 2').should('be.visible');
      cy.contains('Completed Todo').should('be.visible');
    });

    it('should filter active todos', () => {
      cy.contains('button', 'Active').click();

      cy.contains('Active Todo 1').should('be.visible');
      cy.contains('Active Todo 2').should('be.visible');
      cy.contains('Completed Todo').should('not.exist');
    });

    it('should filter completed todos', () => {
      cy.contains('button', 'Completed').click();

      cy.contains('Completed Todo').should('be.visible');
      cy.contains('Active Todo 1').should('not.exist');
      cy.contains('Active Todo 2').should('not.exist');
    });

    it('should show all todos when clicking All filter', () => {
      cy.contains('button', 'Active').click();
      cy.contains('button', 'All').click();

      cy.contains('Active Todo 1').should('be.visible');
      cy.contains('Active Todo 2').should('be.visible');
      cy.contains('Completed Todo').should('be.visible');
    });

    it('should show message when no todos exist', () => {
      // Delete all todos
      cy.get('button[aria-label="Delete todo"]').each(($btn) => {
        cy.wrap($btn).click();
      });

      cy.contains('No todos found').should('be.visible');
    });
  });

  describe('Updating Todos', () => {
    beforeEach(() => {
      cy.get('input[placeholder*="What needs to be done"]').type('Update Test Todo');
      cy.get('button').contains('Add Todo').click();
    });

    it('should toggle todo completion', () => {
      cy.contains('Update Test Todo')
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.contains('Update Test Todo')
        .parent()
        .should('have.class', 'completed');

      // Uncheck
      cy.contains('Update Test Todo')
        .parent()
        .find('input[type="checkbox"]')
        .uncheck();

      cy.contains('Update Test Todo')
        .parent()
        .should('not.have.class', 'completed');
    });

    it('should edit todo title', () => {
      cy.contains('Update Test Todo')
        .parent()
        .find('button[aria-label="Edit todo"]')
        .click();

      cy.get('input[name="title"]').clear().type('Updated Title');
      cy.contains('button', 'Save').click();

      cy.contains('Updated Title').should('be.visible');
      cy.contains('Update Test Todo').should('not.exist');
    });

    it('should edit todo description', () => {
      cy.contains('Update Test Todo')
        .parent()
        .find('button[aria-label="Edit todo"]')
        .click();

      cy.get('input[name="description"]').type('New description');
      cy.contains('button', 'Save').click();

      cy.contains('New description').should('be.visible');
    });

    it('should cancel editing', () => {
      cy.contains('Update Test Todo')
        .parent()
        .find('button[aria-label="Edit todo"]')
        .click();

      cy.get('input[name="title"]').clear().type('Changed Title');
      cy.contains('button', 'Cancel').click();

      cy.contains('Update Test Todo').should('be.visible');
      cy.contains('Changed Title').should('not.exist');
    });
  });

  describe('Deleting Todos', () => {
    beforeEach(() => {
      cy.get('input[placeholder*="What needs to be done"]').type('Delete Test Todo');
      cy.get('button').contains('Add Todo').click();
    });

    it('should delete todo with confirmation', () => {
      cy.on('window:confirm', () => true);

      cy.contains('Delete Test Todo')
        .parent()
        .find('button[aria-label="Delete todo"]')
        .click();

      cy.contains('Delete Test Todo').should('not.exist');
    });

    it('should not delete todo when confirmation is cancelled', () => {
      cy.on('window:confirm', () => false);

      cy.contains('Delete Test Todo')
        .parent()
        .find('button[aria-label="Delete todo"]')
        .click();

      cy.contains('Delete Test Todo').should('be.visible');
    });
  });

  describe('Todo Persistence', () => {
    it('should persist todos after page reload', () => {
      cy.get('input[placeholder*="What needs to be done"]').type('Persistent Todo');
      cy.get('button').contains('Add Todo').click();

      cy.reload();

      cy.contains('Persistent Todo').should('be.visible');
    });

    it('should persist todo completion status', () => {
      cy.get('input[placeholder*="What needs to be done"]').type('Status Test');
      cy.get('button').contains('Add Todo').click();

      cy.contains('Status Test')
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.reload();

      cy.contains('Status Test')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');
    });
  });

  describe('User Isolation', () => {
    it('should not show todos from other users', () => {
      // Create todo for first user
      cy.get('input[placeholder*="What needs to be done"]').type('User 1 Todo');
      cy.get('button').contains('Add Todo').click();

      // Logout
      cy.contains('Logout').click();

      // Register second user
      cy.visit('/register');
      cy.get('input[name="name"]').type('Second User');
      cy.get('input[name="email"]').type('seconduser@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should not see first user's todo
      cy.contains('User 1 Todo').should('not.exist');

      // Create todo for second user
      cy.get('input[placeholder*="What needs to be done"]').type('User 2 Todo');
      cy.get('button').contains('Add Todo').click();

      cy.contains('User 2 Todo').should('be.visible');
    });
  });
});
