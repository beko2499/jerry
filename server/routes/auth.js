const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');

// Generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register — creates unverified account and sends code
router.post('/register', async (req, res) => {
    try {
        const { username, firstName, lastName, phone, email, password } = req.body;

        const existsUsername = await User.findOne({ username: username.toLowerCase().trim() });
        if (existsUsername) return res.status(400).json({ error: 'username_exists' });

        const existsEmail = await User.findOne({ email: email.toLowerCase().trim() });
        if (existsEmail) return res.status(400).json({ error: 'email_exists' });

        const code = generateCode();
        const user = new User({
            username: username.trim().toLowerCase(),
            firstName, lastName, phone,
            email: email.trim().toLowerCase(),
            password,
            isVerified: false,
            verificationCode: code,
            verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        });
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, code);
        } catch (emailErr) {
            console.error('❌ Email send failed:', emailErr.message);
            // Still allow registration, user can resend
        }

        res.json({
            message: 'verification_sent',
            userId: user._id,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'user_not_found' });

        if (user.isVerified) return res.json({ message: 'already_verified' });

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'invalid_code' });
        }

        if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
            return res.status(400).json({ error: 'code_expired' });
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        res.json({ message: 'verified' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Resend Verification Code
router.post('/resend-code', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'user_not_found' });
        if (user.isVerified) return res.json({ message: 'already_verified' });

        const code = generateCode();
        user.verificationCode = code;
        user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(user.email, code);
        res.json({ message: 'code_resent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login — checks isVerified
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.trim().toLowerCase() });
        if (!user) return res.status(401).json({ error: 'invalid_credentials' });

        const isMatch = await user.comparePassword(password.trim());
        if (!isMatch) return res.status(401).json({ error: 'invalid_credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ error: 'not_verified', userId: user._id, email: user.email });
        }

        res.json({ user: { _id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email, balance: user.balance, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.trim().toLowerCase(), role: 'admin' });
        if (!user) return res.status(401).json({ error: 'invalid_credentials' });

        const isMatch = await user.comparePassword(password.trim());
        if (!isMatch) return res.status(401).json({ error: 'invalid_credentials' });

        res.json({ user: { _id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password -verificationCode').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
