require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const prayerRoutes = require('./routes/prayer');
const salahRoutes = require('./routes/salah');
const quranRoutes = require('./routes/quran');
const tasbihRoutes = require('./routes/tasbih');
const calendarRoutes = require('./routes/calendar');
const azkarRoutes = require('./routes/azkar');
const duaRoutes = require('./routes/dua');
const libraryRoutes = require('./routes/library');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/prayer', prayerRoutes);
app.use('/api/salah', salahRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/tasbih', tasbihRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dua',      duaRoutes);
app.use('/api/azkar', azkarRoutes);
app.use('/api/library', libraryRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

