const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');

// Get all providers
router.get('/', async (req, res) => {
    try {
        const providers = await Provider.find().sort({ createdAt: -1 });
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create provider
router.post('/', async (req, res) => {
    try {
        const provider = new Provider(req.body);
        await provider.save();
        res.json(provider);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update provider
router.patch('/:id', async (req, res) => {
    try {
        const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(provider);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete provider
router.delete('/:id', async (req, res) => {
    try {
        await Provider.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
