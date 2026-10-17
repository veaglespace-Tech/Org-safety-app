const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://10.0.2.2:8081',
  'http://195.35.21.96',
  'http://195.35.21.96:3000',
  'http://195.35.21.96:3001',
  'https://195.35.21.96',
  'https://tichisuraksha.veaglespace.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Mobile apps (native Android/iOS), Postman, or server-to-server requests don't send an Origin header
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.veaglespace.com') ||
      origin.startsWith('exp://') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://172.') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow to prevent blocking mobile web & dev environments
  },
  credentials: true
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
const emergencyEmailsRoutes = require('./routes/emergencyEmails.routes');
const contactRoutes = require('./routes/contact.routes');

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/emergency-emails', emergencyEmailsRoutes);
app.use('/api/contact', contactRoutes);

module.exports = app;
