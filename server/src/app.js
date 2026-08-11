const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Dynamic CORS origin configuration
const staticAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:8081',
  'http://195.35.21.96',
  'http://195.35.21.96:3000',
  'http://195.35.21.96:3001',
  'https://195.35.21.96',
  'https://tichisuraksha.veaglespace.com',
  'http://tichisuraksha.veaglespace.com',
  'https://atty.veaglespace.com',
  'http://atty.veaglespace.com',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Curl, Postman)
    if (!origin) return callback(null, true);

    // Allow exact matches in static whitelist
    if (staticAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any localhost / 127.0.0.1 origin with any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow local network IP origins (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
    if (/^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any subdomain of veaglespace.com
    if (/^https?:\/\/([a-zA-Z0-9-]+\.)*veaglespace\.com$/.test(origin)) {
      return callback(null, true);
    }

    // In development mode, accept all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error(`CORS policy error: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));
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

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/emergency-emails', emergencyEmailsRoutes);

module.exports = app;
