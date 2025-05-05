// routes/auth.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const recaptcha = require('../middleware/recaptcha');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const { OAuth2Client } = require('google-auth-library');
const { sendWelcomeEmail, sendResetEmail } = require('../services/emailService')

// const { sendWhatsAppOTP } = require('../services/whatsAppService'); // optional

// ───────────────────────────────────────────────────────────
// Register
// ───────────────────────────────────────────────────────────
router.post(
    '/register',
    recaptcha,
    [
        check('name', 'Name is required').notEmpty(),
            check('email', 'Valid email required').isEmail(),
            check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user)
                return res
                .status(400)
                .json({ errors: [{ msg: 'Email already in use' }] });

            user = new User({ name, email, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            await ActivityLog.create({
                user: user._id,
                action: 'REGISTER',
                details: { email: user.email }
            });

            // send welcome email (async)
            sendWelcomeEmail(email, name).catch(err =>
            console.error('Email error', err)
            );

            const payload = { userId: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            res.json({ token });
        } catch (err) {
            console.error('Register error:', err);
            res.status(500).send('Server error');
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
        check('email', 'Valid email required').isEmail(),
            check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user)
                return res
                .status(400)
                .json({ errors: [{ msg: 'Invalid credentials' }] });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res
                .status(400)
                .json({ errors: [{ msg: 'Invalid credentials' }] });

            const payload = { userId: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            await ActivityLog.create({
                user: user._id,
                action: 'LOGIN',
                details: { email }
            });

            res.json({ token });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).send('Server error');
        }
    }
);

// ───────────────────────────────────────────────────────────
// Google OAuth
// ───────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        let user = await User.findOne({ googleId });
        let isNewUser = false;

        if (!user) {
            // if email used with other method, forbid
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({
                    errors: [{ msg: 'Email already in use with different sign-in method' }]
                });
            }
            user = new User({ googleId, name, email, picture });
            await user.save();
            isNewUser = true;
        }

        const jwtPayload = { userId: user.id };
        const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        await ActivityLog.create({
            user: user._id,
            action: isNewUser ? 'REGISTER_GOOGLE' : 'LOGIN_GOOGLE',
            details: { email }
        });

        if (isNewUser) {
            sendWelcomeEmail(email, name).catch(err =>
            console.error('Email error', err)
            );
        }

        res.json({ token: jwtToken });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// ───────────────────────────────────────────────────────────
// Get Current User
// ───────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).send('Server error');
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email, phone } = req.body;
    try {
        const user = await User.findOne(email ? { email } : { phone });
        if (!user) return res.status(404).json({ msg: 'No account found.' });

        // generate token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        // send via email (we reuse emailService)
        await sendResetEmail(user.email, resetUrl);
        // await sendWhatsAppOTP(user.phone, token);

        res.json({ msg: 'Reset link sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).send('Server error');
    }
});

// Verify Reset Token
router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token.' });
        res.json({ msg: 'Token valid.' });
    } catch (err) {
        console.error('Verify token error:', err);
        res.status(500).send('Server error');
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token.' });

        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ msg: 'Password updated.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
