// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: {
        type: String
    },
    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const hash = await bcrypt.hash(this.password, 12);
        this.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

// Instance method to compare a provided password with the stored hash
UserSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
