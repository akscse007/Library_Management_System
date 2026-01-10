// server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Existing routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const lendRequestRoutes = require('./routes/lendRequestRoutes');
const orderRoutes = require('./routes/orderRoutes');
const fineRoutes = require('./routes/fineRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const managerRoutes = require('./routes/managerRoutes');

// ✅ NEW: Analytics routes
const analyticsRoutes = require('./src/routes/analyticsRoutes');


const app = express();
connectDB();

// === IMPORTANT: capture raw body for debugging malformed JSON ===
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      req.rawBody = buf && buf.toString(encoding || 'utf8');
    } catch (e) {
      req.rawBody = undefined;
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  verify: (req, res, buf, encoding) => {
    try {
      req.rawBody = buf && buf.toString(encoding || 'utf8');
    } catch (e) {
      req.rawBody = undefined;
    }
  }
}));

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Diagnostic middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.debug(`[REQ] ${req.method} ${req.path}`, {
      'content-type': req.headers['content-type'],
      referer: req.headers.referer,
      origin: req.headers.origin,
      host: req.headers.host
    });

    if (req.rawBody) {
      const preview =
        req.rawBody.length > 800
          ? req.rawBody.slice(0, 800) + '...(truncated)'
          : req.rawBody;

      console.debug(`[REQ] rawBody preview (${req.rawBody.length} bytes):`, preview);
    } else {
      console.debug('[REQ] rawBody: <empty or not set>');
    }
  }
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/lend-requests', lendRequestRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/manager', managerRoutes);

// ✅ NEW: Analytics endpoint
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handler last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
