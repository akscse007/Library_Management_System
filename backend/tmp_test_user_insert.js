require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const email = 'tmp_test_user@example.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists with email', email, 'id=', existing._id.toString());
      process.exit(0);
    }

    const user = new User({
      name: 'Tmp Test User',
      email,
      password: 'secret123',
      role: 'student',
    });

    await user.save();
    console.log('User saved with id', user._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('Insert test user failed:', err);
    process.exit(1);
  }
})();
