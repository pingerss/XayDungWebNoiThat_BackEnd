const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Middleware: authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication failed'));
      }
    } else {
      next(new Error('No token provided'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.sub} (Socket: ${socket.id})`);

    // Join user's personal room
    socket.join(`user_${socket.user.maKH}`);

    // Track order
    socket.on('track-order', ({ orderId }) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 User ${socket.user.sub} tracking order ${orderId}`);
    });

    // Stop tracking order
    socket.on('stop-tracking', ({ orderId }) => {
      socket.leave(`order_${orderId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.sub}`);
    });
  });

  return io;
};

// Helper functions to emit events
const emitCartUpdated = (io, customerId, data) => {
  io.to(`user_${customerId}`).emit('cart-updated', data);
};

const emitOrderCreated = (io, customerId, data) => {
  io.to(`user_${customerId}`).emit('order-created', data);
};

const emitOrderStatus = (io, orderId, data) => {
  io.to(`order_${orderId}`).emit('order-status', data);
};

const emitPaymentSuccess = (io, customerId, data) => {
  io.to(`user_${customerId}`).emit('payment-success', data);
};

const emitPaymentFailed = (io, customerId, data) => {
  io.to(`user_${customerId}`).emit('payment-failed', data);
};

const emitPromotionApplied = (io, customerId, data) => {
  io.to(`user_${customerId}`).emit('promotion-applied', data);
};

const emitStockAlert = (io, data) => {
  io.emit('stock-alert', data);
};

module.exports = {
  setupSocket,
  emitCartUpdated,
  emitOrderCreated,
  emitOrderStatus,
  emitPaymentSuccess,
  emitPaymentFailed,
  emitPromotionApplied,
  emitStockAlert
};
