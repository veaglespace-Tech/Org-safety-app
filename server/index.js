require('dotenv').config();
const db = require('./src/config/db');
const app = require('./src/app');

const http = require('http');
const initializeSocket = require('./src/socket');

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
