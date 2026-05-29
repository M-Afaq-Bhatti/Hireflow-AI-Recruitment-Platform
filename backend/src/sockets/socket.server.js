const { Server } = require('socket.io');
const { verifyToken } = require('../services/token.service');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Auth middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      // Allow unauthenticated for interview room (uses interview token)
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const tenantId = socket.user?.tenantId;

    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
      console.log(`🔌 HR dashboard connected: tenant ${tenantId}`);
    }

    // WebRTC signaling for interview rooms
    socket.on('join-interview', (token) => {
      socket.join(`interview:${token}`);
      socket.to(`interview:${token}`).emit('peer-joined');
    });

    socket.on('webrtc-offer', ({ token, offer }) => {
      socket.to(`interview:${token}`).emit('webrtc-offer', offer);
    });

    socket.on('webrtc-answer', ({ token, answer }) => {
      socket.to(`interview:${token}`).emit('webrtc-answer', answer);
    });

    socket.on('webrtc-ice', ({ token, candidate }) => {
      socket.to(`interview:${token}`).emit('webrtc-ice', candidate);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
