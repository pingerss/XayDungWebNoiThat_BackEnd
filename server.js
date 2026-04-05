require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const { testConnection } = require('./src/config/database');
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middleware/errorHandler');
const { setupSocket } = require('./src/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup Socket events
setupSocket(io);

// Make io accessible in controllers via req.app
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'BFF Server is running', timestamp: new Date().toISOString() });
});

// Setup Routes
app.use('/api', require('./src/routes/index'));

// Global Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await testConnection();
    // Sync models (don't alter tables since they already exist on cloud)
    await sequelize.sync({ alter: false });
    console.log('✅ Models synced with database.');

    server.listen(PORT, () => {
      console.log(`🚀 BFF Server is running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`📋 API docs: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
