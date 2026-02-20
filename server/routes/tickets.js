const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Create ticket (user)
router.post('/', async (req, res) => {
    try {
        const { userId, topic, message } = req.body;
        if (!userId || !topic || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const ticket = await Ticket.create({ userId, topic, message });
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get tickets by user
router.get('/user/:userId', async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tickets (admin)
router.get('/', async (req, res) => {
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
router.put('/:id/reply', async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { adminReply: reply, repliedAt: new Date(), status: 'closed' },
            { new: true }
        ).populate('userId', 'username firstName lastName email phone');
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete ticket (admin)
router.delete('/:id', async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
