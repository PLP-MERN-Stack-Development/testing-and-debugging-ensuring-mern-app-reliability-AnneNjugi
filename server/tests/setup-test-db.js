// Script to set up test database
const mongoose = require('mongoose');
require('dotenv').config();

const setupTestDatabase = async () => {
  try {
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/mern-test-db';
    
    console.log('Connecting to test database...');
    await mongoose.connect(testDbUri);
    
    console.log('Connected successfully!');
    console.log('Clearing existing test data...');
    
    // Drop all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }
    
    console.log('Test database setup complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
};

setupTestDatabase();
