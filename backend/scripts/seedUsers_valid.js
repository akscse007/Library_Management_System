// backend/scripts/seedUsers_valid.js
/**
 * Seeder that creates users conforming to the server-side collection validator.
 * DB used: mongodb://localhost:27017/lmsdb  (or set MONGO_URI in backend/.env)
 *
 * - Uses the real Mongoose User model (backend/src/models/User.js)
 * - Does NOT double-hash (lets model pre-save hook hash)
 * - Provides correctly typed fields: dates, ints, enums, strings
 */

require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lmsdb';

const now = () => new Date();

// Users that satisfy validator constraints
const users = [
  {
    name: "Soham Saha",
    email: "soham@gmail.com",
    password: "studentPass1",
    role: "student",               // allowed enum
    account_status: "active",      // allowed enum
    enrollment_date: now(),
    created_date: now(),
    updated_date: now(),
    course: "Computer Science",
    max_books: 2                   // int
  },
  {
    name: "Sounil Mukhopadhyay",
    email: "sounil@gmail.com",
    password: "librarianPass1",
    role: "librarian",
    account_status: "active",
    hire_date: now(),
    created_date: now(),
    updated_date: now()
  },
  {
    name: "Rwita Pan",
    email: "rwita@gmai.com",
    password: "accountantPass1",
    role: "accountant",
    account_status: "active",
    hire_date: now(),
    salary: 45000,
    created_date: now(),
    updated_date: now()
  },
  {
    name: "Akash Roy",
    email: "akash@gmail.com",
    password: "stockPass1",
    role: "stock_manager",
    account_status: "active",
    hire_date: now(),
    created_date: now(),
    updated_date: now()
  },
  {
    name: "Akash Roy",
    email: "akash@admin.com",
    password: "managerPass1",
    role: "manager",              // maps to admin-like responsibilities
    account_status: "active",
    hire_date: now(),
    salary: 60000,
    created_date: now(),
    updated_date: now()
  }
];

async function seed() {
  try {
    console.log('Connecting →', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log('Skipping existing:', u.email);
        continue;
      }

      // Create with Mongoose so pre-save hooks (password hash) run.
      const doc = new User(u);
      await doc.save();
      console.log(`Created user: ${u.email} | role: ${u.role}`);
    }

    console.log('\nSeeding complete ✅');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\nSeed failed ❌');
    console.error(err);
    try { await mongoose.disconnect(); } catch(e){}
    process.exit(1);
  }
}

seed();
