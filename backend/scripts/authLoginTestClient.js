/**
 * E:\Codes\LibRepo\Mern\backend\scripts\authLoginTestClient.js
 *
 * Small Node client that POSTs to /api/auth/login and shows the full response,
 * including JSON body and Set-Cookie headers. Useful to check server-side login flow.
 *
 * Usage:
 *   cd E:\Codes\LibRepo\Mern\backend
 *   node scripts\authLoginTestClient.js akash@gmail.com pass123
 *
 * Note: adjust HOST/PORT if your server runs elsewhere.
 */

const axios = require('axios').default;
const qs = require('querystring');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/authLoginTestClient.js <email> <password>');
  process.exit(1);
}

(async () => {
  try {
    const url = (process.env.AUTH_HOST && process.env.AUTH_PORT) ?
      `http://${process.env.AUTH_HOST}:${process.env.AUTH_PORT}/api/auth/login` :
      'http://localhost:4000/api/auth/login';

    console.log('POST', url, 'body =>', { email, password });

    const resp = await axios.post(url, { email, password }, {
      validateStatus: null, // always return response so we can inspect it
    });

    console.log('HTTP status:', resp.status);
    console.log('Response headers (select):', {
      'set-cookie': resp.headers['set-cookie'] || null,
      'content-type': resp.headers['content-type']
    });
    console.log('Response body:', resp.data);

    // If cookie present, print it in full
    if (resp.headers['set-cookie']) {
      console.log('Set-Cookie (full):');
      resp.headers['set-cookie'].forEach((c) => console.log('  ', c));
    }
  } catch (err) {
    if (err.response) {
      console.error('Request failed, status:', err.response.status, 'body:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(2);
  }
})();
