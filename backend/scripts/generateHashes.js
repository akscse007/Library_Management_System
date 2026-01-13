/**
 * Simple password fixer - directly hash and update
 */
const bcrypt = require('bcryptjs');

// Passwords for each user
const passwordUpdates = [
  { email: 'akash@gmail.com', password: 'akash@123456' },
  { email: 'sounil@gmail.com', password: 'sounil@123456' },
];

// Generate hash command for each
(async () => {
  for (const item of passwordUpdates) {
    const hash = await bcrypt.hash(item.password, 10);
    console.log(`${item.email}: ${hash}`);
  }
})();
