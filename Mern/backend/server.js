// server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db'); // shim we added earlier
const errorHandler = require('./middlewares/errorHandler'); // we'll overwrite this too

// route shims in backend/routes should forward to src/routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const orderRoutes = require('./routes/orderRoutes');
const fineRoutes = require('./routes/fineRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const managerRoutes = require('./routes/managerRoutes');

const app = express();
connectDB();

// === IMPORTANT: capture raw body for debugging malformed JSON ===
// the `verify` option stores the raw incoming buffer on req.rawBody
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      req.rawBody = buf && buf.toString(encoding || 'utf8');
    } catch (e) {
      req.rawBody = undefined;
    }
  }
}));

// also accept urlencoded if needed (with same verify)
app.use(express.urlencoded({
  extended: true,
  verify: (req, res, buf, encoding) => {
    try { req.rawBody = buf && buf.toString(encoding || 'utf8'); } catch (e) { req.rawBody = undefined; }
  }
}));

app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// small diagnostic middleware: logs incoming requests (method+path) and raw body size
app.use((req, res, next) => {
  // Avoid flooding logs for static assets; keep concise
  if (req.path.startsWith('/api')) {
    console.debug(`[REQ] ${req.method} ${req.path} headers:`, {
      'content-type': req.headers['content-type'],
      referer: req.headers.referer,
      origin: req.headers.origin,
      host: req.headers.host
    });
    if (req.rawBody) {
      // show only first 800 chars to avoid huge logs
      const preview = req.rawBody.length > 800 ? req.rawBody.slice(0, 800) + '...(truncated)' : req.rawBody;
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
app.use('/api/orders', orderRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/manager', managerRoutes);

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Place our error handler last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
