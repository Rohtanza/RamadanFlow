const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new user
router.post(
    '/register',
    [
        check('name', 'Name is required').notEmpty(),
            check('email', 'Valid email required').isEmail(),
            check('password', 'Password ≥6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user)
                return res.status(400).json({ errors: [{ msg: 'Email in use' }] });

            user = new User({ name, email, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const payload = { userId: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            res.json({ token });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
);

// @route   POST /api/auth/login
// @desc    Authenticate user, return token
router.post(
    '/login',
    [
        check('email', 'Valid email required').isEmail(),
            check('password', 'Password required').exists()
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

            res.json({ token });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user’s basic info
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
