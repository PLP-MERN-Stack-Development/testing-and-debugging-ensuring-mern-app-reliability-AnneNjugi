# Testing Documentation

## Overview
This document provides comprehensive information about the testing strategy and implementation for the MERN Testing Application.

## Test Coverage Summary

### Unit Tests
- **Server**: 4 test files covering utilities, middleware, and controllers
- **Client**: 5 test files covering components and hooks
- **Target Coverage**: 70%+ for all code

### Integration Tests
- **Server**: 3 test files for API endpoints and database operations
- **Client**: 3 test files for component interactions with APIs

### End-to-End Tests
- **Cypress**: 6 test suites covering complete user flows

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests
```bash
# Interactive mode
npm run test:e2e

# Headless mode
cd client && npm run test:e2e:headless
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

### Server Tests
```
server/tests/
├── unit/
│   ├── authMiddleware.test.js
│   ├── validators.test.js
│   ├── loggerMiddleware.test.js
│   └── authController.test.js
└── integration/
    ├── auth.test.js
    ├── todos.test.js
    └── database.test.js
```

### Client Tests
```
client/src/tests/
├── unit/
│   ├── TodoItem.test.jsx
│   ├── TodoForm.test.jsx
│   ├── Login.test.jsx
│   ├── useTodos.test.js
│   └── ErrorBoundary.test.jsx
└── integration/
    ├── TodoList.test.jsx
    ├── Register.test.jsx
    └── AuthFlow.test.jsx
```

### E2E Tests
```
client/cypress/e2e/
├── auth.cy.js
├── todos.cy.js
├── error-handling.cy.js
├── navigation.cy.js
├── user-flows.cy.js
└── performance.cy.js
```

## Testing Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"
- Group related tests with describe blocks

### 2. Test Independence
- Each test should be independent
- Use beforeEach/afterEach for setup/cleanup
- Don't rely on test execution order

### 3. Mocking
- Mock external dependencies
- Use jest.mock() for modules
- Clear mocks between tests

### 4. Assertions
- Use specific matchers
- Test one thing per test
- Include both positive and negative cases

### 5. Coverage
- Aim for 70%+ coverage
- Focus on critical paths
- Don't test implementation details

## Test Examples

### Unit Test Example
```javascript
test('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
  expect(isValidEmail('invalid')).toBe(false);
});
```

### Integration Test Example
```javascript
test('should create todo with authentication', async () => {
  const response = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Todo' })
    .expect(201);
    
  expect(response.body.data.title).toBe('Test Todo');
});
```

### E2E Test Example
```javascript
it('should complete full user journey', () => {
  cy.visit('/register');
  cy.get('input[name="email"]').type('test@example.com');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/todos');
});
```

## Continuous Integration

### GitHub Actions (Example)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm run install-all
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Troubleshooting

### Tests Failing
1. Check test output for error messages
2. Verify database connection
3. Ensure all dependencies installed
4. Clear test database

### Coverage Not Meeting Threshold
1. Identify uncovered code
2. Add missing test cases
3. Remove dead code
4. Update coverage thresholds

### E2E Tests Timing Out
1. Increase timeout in cypress.config.js
2. Check if server is running
3. Verify API endpoints
4. Check network conditions

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [Cypress](https://docs.cypress.io/)
