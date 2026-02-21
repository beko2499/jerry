const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Create ticket (user)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { userId, topic, message } = req.body;
        if (!userId || !topic || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const ticket = await Ticket.create({ userId, topic, message });
        // Notify admin
        await Notification.create({ title: '🎫 تذكرة جديدة', body: `موضوع: ${topic}\n${message.substring(0, 100)}`, audience: 'admin', type: 'instant', status: 'sent', sentAt: new Date() });
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get tickets by user
router.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tickets (admin)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
        const tickets = await Ticket.find(filter)
            .populate('userId', 'username firstName lastName email phone')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin reply to ticket
router.put('/:id/reply', requireAdmin, async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { adminReply: reply, repliedAt: new Date(), status: 'closed' },
            { new: true }
        ).populate('userId', 'username firstName lastName email phone');
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        // Notify user
        if (ticket.userId?._id) {
            await Notification.create({ title: '✉️ رد على تذكرتك', body: `تم الرد على تذكرة: ${ticket.topic}`, audience: 'users', userId: ticket.userId._id, type: 'instant', status: 'sent', sentAt: new Date() });
        }
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete ticket (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
