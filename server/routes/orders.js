const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get orders (optionally filter by userId)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
        const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('userId', 'username firstName lastName');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create order
router.post('/', async (req, res) => {
    try {
        const count = await Order.countDocuments();
        const orderId = `#${String(count + 10001).padStart(5, '0')}`;
        const order = new Order({ ...req.body, orderId });
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status
router.patch('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete order
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
