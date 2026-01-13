/**
 * Fix users without passwords
 * Usage: node scripts/fixUsersWithoutPassword.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function fixUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not set in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the collection directly to bypass mongoose validation
    const userCollection = mongoose.connection.collection('users');

    // Find all users without passwords
    const usersWithoutPassword = await userCollection.find({ 
      $or: [
        { password: null },
        { password: { $exists: false } }
      ]
    }).toArray();

    console.log(`Found ${usersWithoutPassword.length} users without passwords`);

    if (usersWithoutPassword.length === 0) {
      console.log('No users need fixing!');
      process.exit(0);
    }

    // Set default password for each user
    let fixed = 0;
    for (const user of usersWithoutPassword) {
      try {
        // Use email prefix to create a default password
        const emailPrefix = user.email.split('@')[0];
        const defaultPassword = `${emailPrefix}@123456`;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Update directly in MongoDB, bypassing Mongoose validation
        const result = await userCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: hashedPassword,
              name: user.name || emailPrefix,
              role: user.role || 'student',
              isActive: true,
              isVerified: true
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          fixed++;
          console.log(`✓ Set password for: ${user.email}`);
        }
      } catch (err) {
        console.error(`✗ Error fixing user ${user.email}:`, err.message);
      }
    }

    console.log(`\n✅ Fixed ${fixed} users!`);
    console.log('Users can now login with their email and password.');
    console.log('\nDefault passwords set to: email_prefix@123456');
    console.log('Example: akash@gmail.com → akash@123456\n');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixUsers();
