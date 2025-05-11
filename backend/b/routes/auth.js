// backend/routes/auth.js
const express           = require('express');
const router            = express.Router();
const crypto            = require('crypto');
const recaptcha         = require('../middleware/recaptcha');
const { check, validationResult } = require('express-validator');
const jwt               = require('jsonwebtoken');
const User              = require('../models/User');
const auth              = require('../middleware/auth');
const ActivityLog       = require('../models/ActivityLog');
const { OAuth2Client }  = require('google-auth-library');
const { sendWelcomeEmail, sendResetEmail } = require('../services/emailService');

// ───────────────────────────────────────────────────────────
// Register
// ───────────────────────────────────────────────────────────
router.post(
    '/register',
    recaptcha,
    [
        check('name',     'Name is required').notEmpty(),
            check('email',    'Valid email required').isEmail(),
            check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const name     = req.body.name.trim();
        const email    = req.body.email.toLowerCase().trim();
        const password = req.body.password;

        try {
            // prevent duplicate
            if (await User.findOne({ email })) {
                return res.status(400).json({ errors:[{ msg:'Email already in use' }] });
            }

            // create user with raw password → pre-save hook will hash it
            const user = new User({ name, email, password });
            await user.save();

            // log & notify
            await ActivityLog.create({ user: user._id, action: 'REGISTER', details: { email } });
            sendWelcomeEmail(email, name).catch(err => console.error('Email error:', err));

            // issue token
            const payload = { userId: user._id };
            const token   = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            console.log('Registered:', { email, storedHash: user.password });
            return res.json({ token });

        } catch (err) {
            console.error('Register error:', err);
            return res.status(500).send('Server error');
        }
    }
);

// ───────────────────────────────────────────────────────────
// Login
// ───────────────────────────────────────────────────────────
router.post(
    '/login',
    recaptcha,
    [
        check('email',    'Valid email required').isEmail(),
            check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const email    = req.body.email.toLowerCase().trim();
        const password = req.body.password;

        try {
            const user = await User.findOne({ email });
            console.log('Login attempt:', { email, rawPassword: password, storedHash: user?.password });

            if (!user) {
                return res.status(400).json({ errors:[{ msg:'Invalid credentials' }] });
            }

            // use schema helper
            const isMatch = await user.comparePassword(password);
            console.log('Password match:', isMatch);

            if (!isMatch) {
                return res.status(400).json({ errors:[{ msg:'Invalid credentials' }] });
            }

            // issue token & log
            const payload = { userId: user._id };
            const token   = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            await ActivityLog.create({ user: user._id, action: 'LOGIN', details: { email } });
            return res.json({ token });

        } catch (err) {
            console.error('Login error:', err);
            return res.status(500).send('Server error');
        }
    }
);


// ───────────────────────────────────────────────────────────
// Google OAuth
// ───────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            console.error('Missing ID token in request');
            return res.status(400).json({ error: 'Missing ID token' });
        }

        console.log('Attempting Google authentication...');

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            return res.status(401).json({
                error: 'Invalid Google token',
                details: verifyError.message
            });
        }

        const payload = ticket.getPayload();
        console.log('Google payload received for:', payload.email);

        let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });
        let isNewUser = false;

        if (!user) {
            console.log('Creating new user with Google credentials');
            user = new User({
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                isVerified: true
            });
            await user.save();
            isNewUser = true;
        } else if (!user.googleId) {
            console.log('Linking existing user with Google account');
            user.googleId = payload.sub;
            user.picture = payload.picture;
            user.isVerified = true;
            await user.save();
        }

        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        await ActivityLog.create({
            user: user._id,
            action: isNewUser ? 'REGISTER_GOOGLE' : 'LOGIN_GOOGLE',
            details: { email: user.email }
        });

        if (isNewUser) {
            sendWelcomeEmail(user.email, user.name).catch(err => 
                console.error('Welcome email error:', err)
            );
        }

        console.log('Google authentication successful for:', user.email);
        
        return res.json({
            token: jwtToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (err) {
        console.error('Google auth error:', err);
        
        if (err.message.includes('audience mismatch')) {
            return res.status(401).json({
                error: 'Invalid client ID configuration',
                details: err.message
            });
        }
        
        return res.status(500).json({
            error: 'Google authentication failed',
            details: err.message
        });
    }
});

// ───────────────────────────────────────────────────────────
// Get Current User
// ───────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
    try {
        // User is already attached by auth middleware
        const user = req.user;
        
        // Return user data without sensitive information
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// ───────────────────────────────────────────────────────────
// Forgot / Reset Password
// ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ msg: 'No account found.' });

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken       = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await sendResetEmail(user.email, resetUrl);

        return res.json({ msg: 'Reset link sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).send('Server error');
    }
});

router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token.' });
        return res.json({ msg: 'Token valid.' });
    } catch (err) {
        console.error('Verify token error:', err);
        return res.status(500).send('Server error');
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token.' });

        // Hash the new password via the schema pre-save hook
        user.password         = password;
        user.resetToken       = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return res.json({ msg: 'Password updated.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).send('Server error');
    }
});

// ───────────────────────────────────────────────────────────
// Update Profile
// ───────────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, profileImage } = req.body;
        const user = req.user;

        // Update fields if provided
        if (name) user.name = name.trim();
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        // Log the profile update
        await ActivityLog.create({
            user: user._id,
            action: 'UPDATE_PROFILE',
            details: {
                updatedFields: Object.keys(req.body)
            }
        });

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (err) {
        console.error('Profile update error:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ───────────────────────────────────────────────────────────
// Get User Activity
// ───────────────────────────────────────────────────────────
router.get('/activity', auth, async (req, res) => {
    try {
        const activities = await ActivityLog.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100);

        return res.json(activities);
    } catch (err) {
        console.error('Activity fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch activity data' });
    }
});

module.exports = router;
