const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'jerry_default_secret_change_me';

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Middleware: require authenticated user
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -verificationCode');
        if (!user) return res.status(401).json({ error: 'unauthorized' });
        if (user.banned) return res.status(403).json({ error: 'banned' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'invalid_token' });
    }
}

// Middleware: require admin role
async function requireAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
        const user = await User.findById(decoded.id).select('-password -verificationCode');
        if (!user || user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'invalid_token' });
    }
}

module.exports = { generateToken, requireAuth, requireAdmin, JWT_SECRET };
