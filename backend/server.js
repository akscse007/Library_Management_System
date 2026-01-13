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

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Mount routes with audit logging for write operations
app.use('/api/auth', authRoutes);
app.use('/api/books', auditLogger('BOOK_OPERATION', 'BOOK'), bookRoutes);
app.use('/api/borrows', auditLogger('BORROW_OPERATION', 'BORROW'), borrowRoutes);
app.use('/api/orders', auditLogger('ORDER_OPERATION', 'ORDER'), orderRoutes);
app.use('/api/lend-requests', auditLogger('LEND_REQUEST_OPERATION', 'LEND_REQUEST'), lendRequestRoutes);
app.use('/api/fines', auditLogger('FINE_OPERATION', 'FINE'), fineRoutes);
app.use('/api/payments', auditLogger('PAYMENT_OPERATION', 'PAYMENT'), paymentRoutes);
app.use('/api/manager', auditLogger('MANAGER_OPERATION', 'USER'), managerRoutes);
app.use('/api/analytics', analyticsRoutes); // Read-only, no audit needed

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handler LAST
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
