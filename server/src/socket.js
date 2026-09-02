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
          'http://localhost:8081',
          'http://195.35.21.96',
          'http://195.35.21.96:3000',
          'http://195.35.21.96:3001',
          'https://195.35.21.96',
          'https://tichisuraksha.veaglespace.com'
        ];
        // Allow any subdomain, local dev IPs, and generic React Native null/custom origins
        if (
          allowedOrigins.indexOf(origin) !== -1 || 
          origin.endsWith('.veaglespace.com') ||
          origin.startsWith('exp://') ||
          origin.startsWith('http://192.168.') ||
          origin.startsWith('http://10.') ||
          origin.startsWith('http://172.') ||
          origin === 'null'
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }
  });

  // Track which tokens each socket is sending location for (sender sockets)
  const senderSockets = new Map(); // socketId -> Set<token>

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
          const cached = locationCache[token];
          // Only send if cached data is less than 5 minutes old
          const age = Date.now() - (cached.lastUpdated || 0);
          if (age < 5 * 60 * 1000) {
            socket.emit('location-updated', cached);
          }
        }
      }
    });

    // Leave tracking room
    socket.on('leave-track', ({ token }) => {
      if (token) {
        const roomName = `track:${token}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room: ${roomName}`);

        // Remove from sender tracking
        const tokens = senderSockets.get(socket.id);
        if (tokens) {
          tokens.delete(token);
          if (tokens.size === 0) senderSockets.delete(socket.id);
        }

        // Notify viewers that the tracker has gone offline
        io.to(roomName).emit('tracker-offline', { token, timestamp: Date.now() });
      }
    });

    // Handle real-time location updates
    socket.on('location-updated', (data) => {
      const { token, latitude, longitude, accuracy, speed, heading, timestamp } = data;
      if (token && latitude != null && longitude != null) {
        const locationData = {
          latitude,
          longitude,
          accuracy,
          speed: speed ?? null,
          heading: heading ?? null,
          timestamp,
          lastUpdated: Date.now(),
        };
        
        // Cache the latest location
        locationCache[token] = locationData;

        // Track this socket as a sender for this token
        if (!senderSockets.has(socket.id)) {
          senderSockets.set(socket.id, new Set());
        }
        senderSockets.get(socket.id).add(token);

        // Broadcast location to the specific room, but exclude the sender
        socket.to(`track:${token}`).emit('location-updated', locationData);
      }
    });

    // Handle heartbeat from tracker (keeps viewers aware that tracker is still alive)
    socket.on('tracker-heartbeat', ({ token }) => {
      if (token) {
        socket.to(`track:${token}`).emit('tracker-alive', { token, timestamp: Date.now() });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);

      // Notify all tracking rooms that this sender was broadcasting to
      const tokens = senderSockets.get(socket.id);
      if (tokens) {
        for (const token of tokens) {
          io.to(`track:${token}`).emit('tracker-offline', { token, timestamp: Date.now() });
        }
        senderSockets.delete(socket.id);
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
