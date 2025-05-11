// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

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
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not using Google auth
        }
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    picture: {
        type: String
    },
    profileImage: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving (only if modified)
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        next();
    } catch (err) {
        next(err);
    }
});

// Instance helper for comparing a candidate password
UserSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
