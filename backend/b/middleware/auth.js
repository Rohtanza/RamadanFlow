const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getOrCreateDevUser = async () => {
    try {
        let devUser = await User.findOne({ email: 'dev@example.com' });
        if (!devUser) {
            devUser = await User.create({
                name: 'Development User',
                email: 'dev@example.com',
                password: 'dev123', // This will be hashed by the pre-save hook
                isVerified: true
            });
        }
        return devUser;
    } catch (error) {
        console.error('Error creating dev user:', error);
        throw error;
    }
};

const auth = async (req, res, next) => {
    try {
        // Skip auth in development mode if SKIP_AUTH env var is set
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
            console.log('Using development user');
            const devUser = await getOrCreateDevUser();
            req.user = devUser;
            console.log('Development user:', devUser._id);
            return next();
        }

        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);
        
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('Token:', token);
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            
            if (!decoded.userId) {
                return res.status(401).json({ error: 'Invalid token format' });
            }

            const user = await User.findById(decoded.userId);
            console.log('Found user:', user ? user._id : 'null');
            
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Store full user object
            req.user = user;
            console.log('Set user in request:', req.user._id);
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Invalid token' });
            }
            return res.status(401).json({ error: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = auth;
