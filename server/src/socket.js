const { Server } = require('socket.io');

// Cache to store the latest location for each token
const locationCache = {};

const initializeSocket = (server) => {
  const io = new Server(server, {
    path: '/api/socket.io', // Prefix with /api so Nginx proxies it to the backend!
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://195.35.21.96',
          'http://195.35.21.96:3000',
          'http://195.35.21.96:3001',
          'https://195.35.21.96',
          'https://tichisuraksha.veaglespace.com'
        ];
        // Allow any subdomain of veaglespace.com
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.veaglespace.com')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    // Join a specific tracking room
    socket.on('join-track', ({ token }) => {
      if (token) {
        const roomName = `track:${token}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room: ${roomName}`);
        
        // If we have a cached location for this token, send it immediately to the newly joined socket
        if (locationCache[token]) {
          socket.emit('location-updated', locationCache[token]);
        }
      }
    });

    // Leave tracking room
    socket.on('leave-track', ({ token }) => {
      if (token) {
        const roomName = `track:${token}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room: ${roomName}`);
      }
    });

    // Handle real-time location updates
    socket.on('location-updated', (data) => {
      const { token, latitude, longitude, accuracy, timestamp } = data;
      if (token) {
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp
        };
        
        // Cache the latest location
        locationCache[token] = locationData;

        // Broadcast location to the specific room, but exclude the sender
        socket.to(`track:${token}`).emit('location-updated', locationData);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
