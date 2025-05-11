require('dotenv').config();

const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const cookieParser  = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/Chat');

const authRoutes     = require('./routes/auth');
const prayerRoutes   = require('./routes/prayer');
const salahRoutes    = require('./routes/salah');
const quranRoutes    = require('./routes/quran');
const tasbihRoutes   = require('./routes/tasbih');
const calendarRoutes = require('./routes/calendar');
const azkarRoutes    = require('./routes/azkar');
const duaRoutes      = require('./routes/dua');
const libraryRoutes  = require('./routes/library');
const activityRoutes = require('./routes/activity');
const eventsRoutes   = require('./routes/events');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const searchRoutes   = require('./routes/searchRoutes');
const ramadanGoalsRoutes = require('./routes/ramadanGoals.js');
const reflectionsRoutes = require('./routes/reflections.js');
const chatRoutes = require('./routes/chat');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://localhost:3001', // Additional React dev server
  'http://localhost:5000', // Backend server
  'https://your-production-domain.com' // Add your production domain
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    transports: ['websocket', 'polling']
  }
});

// Request logging middleware with more detail
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Debug middleware to log request body
app.use((req, res, next) => {
  if (req.body) {
    console.log('Request body:', req.body);
  }
  next();
});

// Initialize Google OAuth client
const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

// Google Sign-In endpoint
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Missing ID token' });
        }

        // Verify the token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('Google payload:', payload);

        // Find or create user
        let user = await User.findOne({ email: payload.email });
        
        if (!user) {
            // Create new user
            user = await User.create({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                googleId: payload.sub,
                isVerified: true
            });
        } else if (!user.googleId) {
            // Update existing user with Google info
            user.googleId = payload.sub;
            user.picture = payload.picture;
            user.isVerified = true;
            await user.save();
        }

        // Generate JWT token
        const authToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Send response
        res.json({
            token: authToken,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({
            error: 'Invalid ID token',
            details: error.message
        });
    }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/prayer', prayerRoutes);
app.use('/api/salah', salahRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/tasbih', tasbihRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dua', duaRoutes);
app.use('/api/azkar', azkarRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ramadan-goals', ramadanGoalsRoutes);
app.use('/api/reflections', reflectionsRoutes);
app.use('/api/chat', chatRoutes);

// Debug route to check mounted paths
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle specific errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      msg: 'Validation error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      msg: 'Duplicate entry error',
      details: err.message
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    msg: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ msg: `Cannot ${req.method} ${req.url}` });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        // Leave any existing rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });
        
        // Join the community room
        socket.join('community');
        socket.userId = userId;
        console.log(`User ${user.name} joined the community`);

        // Send existing messages to the user
        const chat = await Chat.findOne({ isActive: true });
        if (chat) {
          socket.emit('loadMessages', chat.messages);
        } else {
          // Create a new chat if none exists
          const newChat = await Chat.create({
            name: 'Community Chat',
            isActive: true
          });
          socket.emit('loadMessages', []);
        }
      } else {
        socket.emit('error', { message: 'User not found' });
      }
    } catch (error) {
      console.error('Error in join event:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  socket.on('sendMessage', async ({ userId, userName, message }) => {
    try {
      console.log('Received message:', { userId, userName, message });
      
      if (!userId || !userName || !message) {
        throw new Error('Missing required fields: userId, userName, or message');
      }

      let chat = await Chat.findOne({ isActive: true });
      
      if (!chat) {
        chat = await Chat.create({
          name: 'Community Chat',
          isActive: true,
          participants: [userId]
        });
      }

      // Create message object according to schema requirements
      const newMessage = {
        sender: userId,
        senderName: userName,
        content: message,
        timestamp: new Date(),
        likes: [],
        dislikes: [],
        comments: [],
        readBy: [userId]
      };

      // Add message to chat
      chat.messages.push(newMessage);
      
      // Add user to participants if not already included
      if (!chat.participants.includes(userId)) {
        chat.participants.push(userId);
      }

      // Save the chat with the new message
      const savedChat = await chat.save();
      
      // Get the saved message with its _id
      const savedMessage = savedChat.messages[savedChat.messages.length - 1];

      console.log('Emitting newMessage event:', savedMessage);

      // Emit the new message to all users in the community
      io.to('community').emit('newMessage', savedMessage);
    } catch (error) {
      console.error('Error in sendMessage event:', error);
      socket.emit('error', { 
        message: 'Failed to send message',
        details: error.message 
      });
    }
  });

  socket.on('likeMessage', async ({ messageId, userId, userName }) => {
    try {
      console.log('Received like message event:', { messageId, userId, userName });
      const chat = await Chat.findOne({ isActive: true });
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      // Remove from dislikes if exists
      message.dislikes = message.dislikes.filter(id => id.toString() !== userId);
      
      // Add to likes if not already liked
      if (!message.likes.includes(userId)) {
        message.likes.push(userId);
        await chat.save();
        console.log('Emitting messageLiked event:', { messageId, userId, userName });
        io.to('community').emit('messageLiked', { messageId, userId, userName });
      }
    } catch (error) {
      console.error('Error in likeMessage event:', error);
    }
  });

  socket.on('dislikeMessage', async ({ messageId, userId, userName }) => {
    try {
      console.log('Received dislike message event:', { messageId, userId, userName });
      const chat = await Chat.findOne({ isActive: true });
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      // Remove from likes if exists
      message.likes = message.likes.filter(id => id.toString() !== userId);
      
      // Add to dislikes if not already disliked
      if (!message.dislikes.includes(userId)) {
        message.dislikes.push(userId);
        await chat.save();
        console.log('Emitting messageDisliked event:', { messageId, userId, userName });
        io.to('community').emit('messageDisliked', { messageId, userId, userName });
      }
    } catch (error) {
      console.error('Error in dislikeMessage event:', error);
    }
  });

  socket.on('addComment', async ({ messageId, comment }) => {
    try {
      console.log('Received add comment event:', { messageId, comment });
      const chat = await Chat.findOne({ isActive: true });
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      message.comments.push(comment);
      await chat.save();
      
      console.log('Emitting newComment event:', { messageId, comment });
      io.to('community').emit('newComment', { messageId, comment });
    } catch (error) {
      console.error('Error in addComment event:', error);
    }
  });

  // Handle adding a reply to a comment
  socket.on('addReply', async (data) => {
    try {
      const { messageId, commentId, content, sender, senderName, senderPicture } = data;
      
      if (!messageId || !commentId || !content || !sender || !senderName) {
        throw new Error('Missing required fields for reply');
      }

      const message = await Chat.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const comment = message.comments.id(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      const reply = {
        _id: new mongoose.Types.ObjectId(),
        content,
        sender,
        senderName,
        senderPicture,
        timestamp: new Date()
      };

      comment.replies = comment.replies || [];
      comment.replies.push(reply);
      await message.save();

      // Broadcast the reply to all connected clients
      io.emit('replyAdded', {
        messageId,
        commentId,
        reply
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      socket.emit('replyError', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// connect to Mongo & start server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB connected');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});