const express = require('express');
const router = express.Router();
const recaptcha = require('../middleware/recaptcha');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const { OAuth2Client } = require('google-auth-library');

const { sendWelcomeEmail } = require('../services/emailService');
const { sendWelcomeSMS }   = require('../services/smsService'); // optional

// @route   POST /api/auth/register
// @desc    Register new user (with reCAPTCHA)
// @access  Public
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
                return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });

            user = new User({ name, email, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            await ActivityLog.create({
                user: user._id,
                action: 'REGISTER',
                details: { email: user.email }
            });
            sendWelcomeEmail(email, name)
            .catch(err => console.error('Email error', err));

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

// @route   POST /api/auth/login
// @desc    Authenticate user, return token (with reCAPTCHA)
// @access  Public
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
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

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

// @route   POST /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body; // ID token from Google
    try {
        console.log('Received Google ID token:', token);
        console.log('Backend GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('Google token payload:', payload);
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];

        let user = await User.findOne({ googleId });
        let isNewUser = false;
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'Email already in use with different sign-in method' }] });
            }
            user = new User({
                googleId,
                name,
                email,
                picture,
            });
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
            sendWelcomeEmail(email, name).catch(err => console.error('Email error', err));
        }

        res.json({ token: jwtToken });
    } catch (err) {
        console.error('Google auth error:', err.message, err.stack);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user’s basic info
// @access  Private
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

module.exports = router;
