require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auction', auctionRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_auction', (room) => socket.join(room));
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.set('socketio', io);

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
