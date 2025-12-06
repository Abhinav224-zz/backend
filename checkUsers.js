const mongoose = require('mongoose');
const User = require('./models/User');
const { MONGODB_URI } = require('./config');

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB successfully');

    // Check how many users exist
    const userCount = await User.countDocuments();
    console.log(`\n✓ Total users in database: ${userCount}`);

    if (userCount > 0) {
      // Get all users (without password)
      const users = await User.find({}).select('-password');
      console.log('\n✓ Users found:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. Name: ${user.name}, Email: ${user.email}, Created: ${user.createdAt}`);
      });
    } else {
      console.log('\n✗ No users found in database');
    }

    await mongoose.connection.close();
    console.log('\n✓ Connection closed');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
