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

        // Check if email verification is enabled
        const Settings = require('../models/Settings');
        const emailVerifSetting = await Settings.findOne({ key: 'emailVerification' });
        const isVerificationEnabled = emailVerifSetting ? emailVerifSetting.value : true;

        if (!isVerificationEnabled) {
            // Skip verification — create as verified
            const user = new User({
                username: username.trim().toLowerCase(),
                firstName, lastName, phone,
                email: email.trim().toLowerCase(),
                password,
                isVerified: true,
            });
            await user.save();
            return res.json({
                message: 'registered',
                userId: user._id,
                email: user.email,
                skip_verification: true,
            });
        }

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

        if (user.banned) return res.status(403).json({ error: 'banned' });

        if (!user.isVerified) {
            // Check if verification is disabled — auto-verify
            const Settings = require('../models/Settings');
            const emailVerifSetting = await Settings.findOne({ key: 'emailVerification' });
            const isVerificationEnabled = emailVerifSetting ? emailVerifSetting.value : true;
            if (!isVerificationEnabled) {
                user.isVerified = true;
                user.verificationCode = null;
                user.verificationCodeExpires = null;
                await user.save();
            } else {
                return res.status(403).json({ error: 'not_verified', userId: user._id, email: user.email });
            }
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

// Get current user data (for refresh)
router.get('/me/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -verificationCode -verificationCodeExpires');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update own profile (user)
router.put('/profile/:id', async (req, res) => {
    try {
        const { email, currentPassword, newPassword, firstName, lastName, username } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Verify current password
        if (currentPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) return res.status(400).json({ error: 'wrong_password' });
        }

        if (email && email !== user.email) {
            const exists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
            if (exists) return res.status(400).json({ error: 'email_exists' });
            user.email = email.toLowerCase().trim();
        }

        if (username && username !== user.username) {
            const exists = await User.findOne({ username: username.toLowerCase().trim(), _id: { $ne: user._id } });
            if (exists) return res.status(400).json({ error: 'username_exists' });
            user.username = username.toLowerCase().trim();
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ error: 'current_password_required' });
            user.password = newPassword; // Will be hashed by pre-save hook
        }

        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.verificationCode;
        res.json(userObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user (admin)
router.put('/users/:id', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, balance } = req.body;
        const updates = {};
        if (firstName !== undefined) updates.firstName = firstName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (phone !== undefined) updates.phone = phone;
        if (email !== undefined) updates.email = email;
        if (balance !== undefined) updates.balance = parseFloat(balance);

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -verificationCode');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user (admin)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ban/Unban user (admin)
router.patch('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.banned = !user.banned;
        await user.save();
        res.json({ banned: user.banned });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

