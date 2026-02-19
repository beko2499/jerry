const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get setting by key
router.get('/:key', async (req, res) => {
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
router.put('/:key', async (req, res) => {
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
