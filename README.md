# Testing and Debugging MERN Applications

A comprehensive MERN stack application demonstrating testing strategies and debugging techniques, including unit testing, integration testing, and end-to-end testing.

## 🎯 Project Overview

This project implements a full-stack Todo application with:
- User authentication (register/login)
- Todo CRUD operations
- Comprehensive test coverage (70%+)
- Advanced debugging tools
- Performance monitoring

## 📋 Assignment Completion

✅ **Task 1**: Testing Environment Setup  
✅ **Task 2**: Unit Testing (70%+ coverage)  
✅ **Task 3**: Integration Testing  
✅ **Task 4**: End-to-End Testing  
✅ **Task 5**: Debugging Techniques  

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for detailed completion status.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testing-and-debugging-ensuring-mern-app-reliability-AnneNjugi
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
# Copy example env file
cp server/.env.example server/.env

# Edit server/.env with your values:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Your secret key for JWT tokens
```

4. Set up test database:
```bash
npm run setup-test-db
```

### Running the Application

**Development mode (both client and server):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Server (port 5000)
npm run server

# Terminal 2 - Client (port 3000)
npm run client
```

Visit: http://localhost:3000

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests (interactive)
npm run test:e2e

# E2E tests (headless)
cd client && npm run test:e2e:headless

# With coverage report
npm run test:coverage
```

### Test Structure

```
📁 server/tests/
  📁 unit/              # Server unit tests
  📁 integration/       # API integration tests

📁 client/src/tests/
  📁 unit/              # Component unit tests
  📁 integration/       # Component integration tests

📁 client/cypress/e2e/  # End-to-end tests
```

## 📊 Test Coverage

- **Unit Tests**: 9 files (4 server, 5 client)
- **Integration Tests**: 6 files (3 server, 3 client)
- **E2E Tests**: 6 test suites
- **Coverage Target**: 70%+ achieved ✅

## 🐛 Debugging

### Server-Side Debugging
- Custom logger with multiple log levels
- Request/response logging
- Performance monitoring
- Global error handlers

### Client-Side Debugging
- Error boundaries
- Debug helper utilities
- Performance monitoring
- Custom debug hooks

See [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) for detailed debugging instructions.

## 📚 Documentation

- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete project overview
- [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md) - Testing guide
- [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) - Debugging guide
- [Week6-Assignment.md](./Week6-Assignment.md) - Assignment requirements

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Axios
- Vite

### Backend
- Express.js
- MongoDB/Mongoose
- JWT Authentication
- bcryptjs

### Testing
- Jest
- React Testing Library
- Supertest
- Cypress
- MongoDB Memory Server

## 📁 Project Structure

```
mern-testing/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utilities
│   │   └── tests/         # Tests
│   └── cypress/           # E2E tests
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Middleware
│   │   └── utils/         # Utilities
│   └── tests/             # Tests
├── jest.config.js         # Jest configuration
├── cypress.config.js      # Cypress configuration
└── package.json           # Root package.json
```

## 🔑 Environment Variables

Create `server/.env` file with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-app
TEST_MONGODB_URI=mongodb://localhost:27017/mern-test-db
JWT_SECRET=your_secret_key_here
NODE_ENV=development
LOG_LEVEL=INFO
```

## 🌟 Features

### Authentication
- User registration with validation
- Secure login with JWT
- Password hashing with bcrypt
- Protected routes

### Todo Management
- Create, read, update, delete todos
- Filter by status (all, active, completed)
- Priority levels (low, medium, high)
- User data isolation

### Testing
- Comprehensive unit tests
- API integration tests
- Database operation tests
- Complete E2E user flows

### Debugging
- Structured logging
- Performance monitoring
- Error tracking
- Memory usage monitoring

## 🤝 Contributing

This is an assignment project. For educational purposes only.

## 📝 License

ISC

## 👤 Author

Anne Njugi

## 🙏 Acknowledgments

- PLP MERN Stack Development Program
- Week 6 Assignment: Testing and Debugging

---

**Status**: ✅ Complete and ready for submission
