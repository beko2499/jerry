const express = require('express');
const router = express.Router();
const Gateway = require('../models/Gateway');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public: Get enabled gateways (no sensitive fields)
router.get('/public', async (req, res) => {
    try {
        const gateways = await Gateway.find({ isEnabled: true }, '-apiKey -apiSecret')
            .sort({ sortOrder: 1, createdAt: 1 });
        res.json(gateways);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all gateways
router.get('/', requireAdmin, async (req, res) => {
    try {
        const gateways = await Gateway.find().sort({ sortOrder: 1, createdAt: 1 });
        res.json(gateways);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create gateway
router.post('/', requireAdmin, async (req, res) => {
    try {
        const gateway = new Gateway(req.body);
        await gateway.save();
        res.json(gateway);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update gateway
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const gateway = await Gateway.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(gateway);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete gateway
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await Gateway.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
