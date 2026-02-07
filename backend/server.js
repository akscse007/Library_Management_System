require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const auditLogger = require('./middleware/audit');

// Initialize scheduler for automated tasks
require('./scheduler');

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const orderRoutes = require('./routes/orderRoutes');
const fineRoutes = require('./routes/fineRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const lendRequestRoutes = require('./routes/lendRequestRoutes');
const managerRoutes = require('./routes/managerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
connectDB();

// =========================
// Body & Cookie Parsers
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// CORS CONFIG (FIXED)
// =========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL, // deployed frontend
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow server-to-server & tools like Postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('[CORS BLOCKED]', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// =========================
// Routes
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/books', auditLogger('BOOK_OPERATION', 'BOOK'), bookRoutes);
app.use('/api/borrows', auditLogger('BORROW_OPERATION', 'BORROW'), borrowRoutes);
app.use('/api/orders', auditLogger('ORDER_OPERATION', 'ORDER'), orderRoutes);
app.use('/api/lend-requests', auditLogger('LEND_REQUEST_OPERATION', 'LEND_REQUEST'), lendRequestRoutes);
app.use('/api/fines', auditLogger('FINE_OPERATION', 'FINE'), fineRoutes);
app.use('/api/payments', auditLogger('PAYMENT_OPERATION', 'PAYMENT'), paymentRoutes);
app.use('/api/manager', auditLogger('MANAGER_OPERATION', 'USER'), managerRoutes);
app.use('/api/analytics', analyticsRoutes);

// =========================
// Health Check
// =========================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// =========================
// Error Handler (LAST)
// =========================
app.use(errorHandler);

// =========================
// Server Start
// =========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
