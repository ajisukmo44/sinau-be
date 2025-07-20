const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const exportDataRoutes = require('./routes/export');
const authCashierRoutes = require('./routes/auth-cashier');
const userProfileRoutes = require('./routes/user-profile');
const settingRoutes = require('./routes/setting');
const catalogRoutes = require('./routes/catalogs');
const statisticsRoutes = require('./routes/statistics');
const transactionRoutes = require('./routes/transactions');
const reportSalesRoutes = require('./routes/report-sales');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors());

// Third-party middleware
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Custom middleware
app.use(requestLogger);

// routes admin
app.use('/api/auth/admin', authRoutes);
app.use('/api/profile/admin', userProfileRoutes);
app.use('/api/admin/statistics-summary', statisticsRoutes);
app.use('/api/admin/sales-report', reportSalesRoutes);
app.use('/api/admin/master-catalogs', catalogRoutes);
app.use('/api/admin/transactions', transactionRoutes);
app.use('/api/admin/master-user', userRoutes);
app.use('/api/admin/setting', settingRoutes);

// routes cashier
app.use('/api/auth/cashier', authCashierRoutes);
app.use('/api/profile/cashier', userProfileRoutes);
app.use('/api/cashier/master-catalogs', catalogRoutes);
app.use('/api/cashier/transactions', transactionRoutes);
app.use('/api/cashier/statistics-summary', statisticsRoutes);
app.use('/api/cashier/sales-report', reportSalesRoutes);

// export data
app.use('/api/export', exportDataRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express API' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;