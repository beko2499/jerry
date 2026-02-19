const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications (admin)
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sent notifications (user-facing)
router.get('/user', async (req, res) => {
    try {
        const notifications = await Notification.find({ status: 'sent' }).sort({ sentAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create notification (admin)
router.post('/', async (req, res) => {
    try {
        const { title, body, type, scheduledAt } = req.body;
        const notif = new Notification({
            title,
            body,
            type: type || 'instant',
            scheduledAt: type === 'scheduled' ? scheduledAt : null,
            status: type === 'scheduled' ? 'pending' : 'sent',
            sentAt: type === 'scheduled' ? null : new Date(),
        });
        await notif.save();
        res.json(notif);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete notification (admin)
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
