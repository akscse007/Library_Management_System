// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student','teacher','admin','librarian','manager','accountant','stock_manager','supplier_contact'],
    default: 'student',
    required: true
  },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  hireDate: { type: Date, default: null },
  salary: { type: Number, default: null },
  course: { type: String, default: null },
  enrollmentDate: { type: Date, default: null },
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  maxBooks: { type: Number, default: null },
  authProviders: { type: Object, default: null },
  notes: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  strict: true,
  collection: 'users'
});

// Hash passwordHash before save (only if modified and not already hashed)
userSchema.pre('save', async function(next) {
  try {
    console.log(`[PRE-SAVE] Starting save for user: ${this.email}`);
    console.log(`[PRE-SAVE] isModified('passwordHash'): ${this.isModified('passwordHash')}, value: ${this.passwordHash?.substring(0, 20)}...`);

    // Check if passwordHash is already hashed (bcrypt hash starts with $2a$, $2b$, or $2y$)
    const isAlreadyHashed = (str) => str && /^\$2[aby]\$/.test(str);

    if (this.isModified('passwordHash') && this.passwordHash && !isAlreadyHashed(this.passwordHash)) {
      console.log(`[PRE-SAVE] Will hash 'passwordHash' field (not already hashed)`);
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(this.passwordHash, salt);
      this.passwordHash = hashed;
      console.log(`[PRE-SAVE] PasswordHash hashed successfully, hash length: ${hashed.length}`);
    } else {
      console.log(`[PRE-SAVE] No hashing necessary for passwordHash`);
    }
    next();
  } catch (err) {
    console.error('[PRE-SAVE] Error in pre-save hook:', err.message);
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const storedHash = this.passwordHash;

    if (!storedHash) {
      console.error('[COMPARE] No passwordHash found for user');
      return false;
    }

    if (!candidatePassword) {
      console.error('[COMPARE] No candidate password provided');
      return false;
    }

    console.log('[COMPARE] Comparing passwords for user:', this.email);
    const result = await bcrypt.compare(candidatePassword, storedHash);
    console.log('[COMPARE] Password match result:', result);
    return result;
  } catch (err) {
    console.error('[COMPARE] Error comparing passwords:', err.message);
    return false;
  }
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
