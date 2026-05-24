require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const seedDatabase = require('./config/seeder');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const tableRoutes = require('./routes/table');
const paymentRoutes = require('./routes/payment');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174', // Support secondary local Vite servers
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow any Vercel deployment, localhost, or the explicit FRONTEND_URL
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      origin.startsWith('http://localhost:') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy block: Origin not allowed'), false);
  },
  credentials: true
}));

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Connect to Database & Run Seeder
connectDB().then(() => {
  // DB Connected or fallback triggered, proceed to run seeder
  seedDatabase();
});

// Setup Socket.IO Server
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach Socket.IO to the Express app configuration so controllers can access it
app.set('io', io);

// Socket.IO event handler
io.on('connection', (socket) => {
  console.log(`[Socket] New connection established: ${socket.id}`);

  // Customer table registration
  socket.on('joinTable', ({ tableNumber }) => {
    if (tableNumber) {
      const roomName = `table_${tableNumber}`;
      socket.join(roomName);
      console.log(`[Socket Client ${socket.id}] Registered and joined room: ${roomName}`);
    }
  });

  // Admin/Kitchen dashboard registration
  socket.on('joinAdmin', () => {
    socket.join('admins');
    console.log(`[Socket Client ${socket.id}] Registered as administrator in 'admins' room`);
  });

  // Manual ping/test events
  socket.on('pingServer', (data) => {
    console.log('[Socket Ping Received]:', data);
    socket.emit('pongClient', { success: true, message: 'Realtime socket connection active' });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/payment', paymentRoutes);

// Default base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QR Restaurant Ordering API is active.',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Express Error]:', err.stack || err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  QR ordering system backend active on port ${PORT}`);
  console.log(`  Realtime websockets configured successfully`);
  console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});
