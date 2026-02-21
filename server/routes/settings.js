const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public settings (non-sensitive keys only)
const PUBLIC_SETTINGS = ['support', 'terms', 'updates', 'referral', 'emailVerification', 'ticketSubjects'];

router.get('/public/:key', async (req, res) => {
    try {
        if (!PUBLIC_SETTINGS.includes(req.params.key)) {
            return res.status(403).json({ error: 'forbidden' });
        }
        const setting = await Settings.findOne({ key: req.params.key });
        if (setting) return res.json(setting.value);
        res.json(null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get setting by key (admin only)
router.get('/:key', requireAdmin, async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (setting) return res.json(setting.value);

        // Fallback for email — show current .env config
        if (req.params.key === 'email') {
            return res.json({
                gmailUser: process.env.EMAIL_USER || '',
                gmailPass: process.env.EMAIL_PASS || '',
                senderName: (process.env.EMAIL_FROM || '').replace(/<.*>/, '').trim() || 'Jerry Store'
            });
        }

        res.json(null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upsert setting
router.put('/:key', requireAdmin, async (req, res) => {
    try {
        const setting = await Settings.findOneAndUpdate(
            { key: req.params.key },
            { key: req.params.key, value: req.body.value },
            { upsert: true, new: true }
        );
        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
