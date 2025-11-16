const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const { errorHandler } = require('./middleware/auth');
const { requestLogger } = require('./middleware/logger');
const { errorLogger, handleUnhandledRejection, handleUncaughtException } = require('./middleware/errorLogger');
const { performanceMonitor, startMemoryMonitoring } = require('./middleware/performanceMonitor');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Setup global error handlers
handleUnhandledRejection();
handleUncaughtException();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(performanceMonitor);
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MERN Testing API' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error logging middleware (before error handler)
app.use(errorLogger);

// Error handler
app.use(errorHandler);

// Start memory monitoring in production
if (process.env.NODE_ENV === 'production') {
  startMemoryMonitoring(300000); // Every 5 minutes
}

// Connect to database and start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
