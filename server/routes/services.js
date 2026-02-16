const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get services (by categoryId or search)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.categoryId) filter.categoryId = req.query.categoryId;
        if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
        const services = await Service.find(filter).sort({ createdAt: -1 });
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create service
router.post('/', async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update service
router.patch('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete service
router.delete('/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
