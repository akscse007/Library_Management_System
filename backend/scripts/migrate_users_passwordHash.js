// backend/scripts/migrate_users_passwordHash.js
// One-off script to fix legacy users so they can log in with the new User model.
// - For any user without passwordHash but with a `password` field:
//   * If password looks like a bcrypt hash (starts with "$2"), copy it to passwordHash.
//   * Otherwise, hash it with bcrypt and store to passwordHash.
// - Optionally unsets the old `password` field (commented out if validator might reject).

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lmsdb';

async function run() {
  try {
    console.log('Connecting to', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected');

    const users = await User.collection.find({ $or: [
      { passwordHash: { $exists: false } },
      { passwordHash: null },
    ] }).toArray();

    console.log('Users needing migration:', users.length);

    for (const doc of users) {
      const id = doc._id;
      const pwd = doc.password;
      if (!pwd || typeof pwd !== 'string') {
        console.log('Skipping user without usable password field:', doc.email);
        continue;
      }

      let newHash = pwd;
      if (!pwd.startsWith('$2')) {
        // not a bcrypt hash; hash it now
        console.log('Hashing plain password for', doc.email);
        const salt = await bcrypt.genSalt(10);
        newHash = await bcrypt.hash(pwd, salt);
      } else {
        console.log('Copying existing bcrypt hash for', doc.email);
      }

      const update = {
        $set: { passwordHash: newHash },
        // If your validator allows extra fields, you can also remove old `password`:
        // $unset: { password: "" },
      };

      await User.collection.updateOne({ _id: id }, update);
    }

    console.log('Migration complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
