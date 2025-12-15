require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const priceService = require('./services/priceService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ 
  server,
  verifyClient: (info) => {
    // Allow connections from frontend URL in production
    const origin = info.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);
    
    return allowedOrigins.some(allowed => origin?.includes(allowed));
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stock Broker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    websocketClients: priceService.clients.size
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stock Broker Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      subscriptions: '/api/subscriptions'
    }
  });
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection attempt');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Handle authentication
      if (data.type === 'AUTH') {
        const token = data.token;
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          priceService.addClient(ws, decoded.userId);
          
          ws.send(JSON.stringify({
            type: 'AUTH_SUCCESS',
            message: 'Authenticated successfully'
          }));
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'AUTH_ERROR',
            message: 'Invalid token'
          }));
          ws.close();
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    priceService.removeClient(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start price broadcasting
priceService.startBroadcasting();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log('=================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
