/**
 * Alternative: Fix users by calling the API endpoint
 * This script calls the /auth/set-password endpoint for each user
 */
const http = require('http');
require('dotenv').config();

const users = [
  'barman@gmail.com',
  'rwita@gmail.com',
  'soham@gmail.com',
  'deep@gmail.com',
  'akash@gmail.com',
  'sounil@gmail.com',
  'sm@gmail.com',
  'sp@gmail.com',
  'lib@gmail.com',
  'muk@gmail.com'
];

function makeRequest(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/set-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setPasswordsViaAPI() {
  console.log('Starting to set passwords via API...\n');

  let success = 0;
  let failed = 0;

  for (const email of users) {
    try {
      const emailPrefix = email.split('@')[0];
      const password = `${emailPrefix}@123456`;

      const response = await makeRequest(email, password);

      if (response.status === 200) {
        console.log(`✓ ${email} → ${password}`);
        success++;
      } else {
        console.error(`✗ ${email}: ${response.data.message || response.data}`);
        failed++;
      }
    } catch (err) {
      console.error(`✗ ${email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('\nNow you can login with:');
  console.log('Email: akash@gmail.com');
  console.log('Password: akash@123456');
  
  process.exit(0);
}

// Wait for server to be running
setTimeout(setPasswordsViaAPI, 1000);
