import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import donationRoutes from './routes/donations.js';
import receiverVolunteerRoutes from './routes/receiver-volunteer.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with 10MB limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies with 10MB limit

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/admin/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/receiver-volunteer', receiverVolunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FoodBridge API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FoodBridge API',
    version: '1.0.0',
    tagline: 'No Food Should Go to Waste',
    endpoints: {
      health: '/api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        selectRole: 'POST /api/auth/select-role',
        me: 'GET /api/auth/me'
      },
      admin: {
        login: 'POST /api/admin/login',
        users: 'GET /api/admin/users',
        stats: 'GET /api/admin/stats'
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PATCH /api/profile',
        changeRole: 'PATCH /api/profile/role'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Join delivery room
  socket.on('join-delivery', (deliveryId) => {
    socket.join(`delivery-${deliveryId}`);
    console.log(`📦 Socket ${socket.id} joined delivery room: ${deliveryId}`);
  });

  // Leave delivery room
  socket.on('leave-delivery', (deliveryId) => {
    socket.leave(`delivery-${deliveryId}`);
    console.log(`📦 Socket ${socket.id} left delivery room: ${deliveryId}`);
  });

  // Handle volunteer location update
  socket.on('update-location', (data) => {
    const { deliveryId, location, status } = data;
    
    // Broadcast to all clients in the delivery room
    io.to(`delivery-${deliveryId}`).emit('location-updated', {
      deliveryId,
      location,
      status,
      timestamp: Date.now()
    });

    console.log(`📍 Location updated for delivery ${deliveryId}`);
  });

  // Handle status update
  socket.on('update-status', (data) => {
    const { deliveryId, status } = data;
    
    io.to(`delivery-${deliveryId}`).emit('status-updated', {
      deliveryId,
      status,
      timestamp: Date.now()
    });

    console.log(`✅ Status updated for delivery ${deliveryId}: ${status}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌱 FoodBridge - No Food Should Go to Waste 🌱          ║
║                                                           ║
║   Server Status: ✅ RUNNING                              ║
║   Port: ${PORT}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   API URL: http://localhost:${PORT}                       ║
║                                                           ║
║   📚 Documentation: http://localhost:${PORT}/             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
