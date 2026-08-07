const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins dynamically (Expo Web, mobile LAN IP, localhost, production)
  credentials: true,
}));
app.use(express.json({ limit: 52428800 }));
app.use(express.urlencoded({ limit: 52428800, extended: true }));
app.use(cookieParser());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Organization Safety API' });
});

// Routes
const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/org');
const sosRoutes = require('./routes/sos');
const superAdminRoutes = require('./routes/super_admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/super-admin', superAdminRoutes);

module.exports = app;
