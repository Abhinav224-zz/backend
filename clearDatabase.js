const mongoose = require('mongoose');
const User = require('./models/User');
const { MONGODB_URI } = require('./config');

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users from database`);

    await mongoose.connection.close();
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
