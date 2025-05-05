require('dotenv').config();

const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const { OAuth2Client } = require('google-auth-library');

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

const app = express();

// instantiate Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// CORS: allow PATCH and preflight OPTIONS
app.use(cors({
    origin:      'http://localhost:3001',
    credentials: true,
    methods:     ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With']
}));

// cross-origin policies for Google Sign-In iframe/popups
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy',        'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy',      'require-corp');
    res.setHeader('Permissions-Policy',                'identity-credentials-get=(self)');
    next();
});

app.use(express.json());

// Google Sign-In endpoint
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing ID token' });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        // TODO: find or create user, then issue your own JWT/session cookie
        return res.json({ profile: payload /*, token: jwt */ });
    } catch (err) {
        console.error('Google token verification error:', err);
        return res.status(401).json({ error: 'Invalid ID token' });
    }
});

// application routes
app.use('/api/auth',     authRoutes);
app.use('/api/prayer',   prayerRoutes);
app.use('/api/salah',    salahRoutes);
app.use('/api/quran',    quranRoutes);
app.use('/api/tasbih',   tasbihRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dua',      duaRoutes);
app.use('/api/azkar',    azkarRoutes);
app.use('/api/library',  libraryRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/events',   eventsRoutes);

// health check
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

// connect to Mongo & start server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection error:', err));
