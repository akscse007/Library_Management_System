require('dotenv').config();
const connectDB = require('./config/db');
const authCtrl = require('./src/controllers/authController');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; console.log('RES', this.statusCode, JSON.stringify(payload, null, 2)); return this; }
  };
}

(async () => {
  try {
    await connectDB();
    console.log('DB ready');
    const req = {
      body: {
        name: 'Handler Test User',
        email: 'handler_test_user@example.com',
        password: 'secret123',
        userType: 'student',
      },
    };
    const res = mockRes();

    await authCtrl.register(req, res);
  } catch (err) {
    console.error('handler test failed:', err);
  } finally {
    process.exit(0);
  }
})();
