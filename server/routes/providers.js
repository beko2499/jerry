const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const SmmApi = require('../utils/smmApi');

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

// ========== SMM API Integration ==========

// Get provider balance from API
router.get('/:id/balance', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        const api = new SmmApi(provider.url, provider.apiKey);
        const data = await api.getBalance();

        // Update stored balance
        provider.balance = `$${parseFloat(data.balance).toFixed(2)}`;
        await provider.save();

        res.json({ balance: data.balance, currency: data.currency || 'USD' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get services list from provider API
router.get('/:id/services', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        const api = new SmmApi(provider.url, provider.apiKey);
        const services = await api.getServices();

        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Import selected services from provider into our DB
router.post('/:id/import-services', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        const { services, categoryId, priceMultiplier = 1.5 } = req.body;
        // services = array of { service, name, rate, min, max, category }

        if (!services || !services.length || !categoryId) {
            return res.status(400).json({ error: 'services and categoryId are required' });
        }

        const imported = [];
        for (const svc of services) {
            // Check if already imported (same provider + autoId)
            const exists = await Service.findOne({
                providerId: provider._id.toString(),
                autoId: String(svc.service),
            });
            if (exists) continue;

            const newService = new Service({
                categoryId,
                name: svc.name,
                price: parseFloat(svc.rate) * priceMultiplier,
                min: parseInt(svc.min) || 100,
                max: parseInt(svc.max) || 10000,
                description: svc.category || '',
                providerId: provider._id.toString(),
                autoId: String(svc.service),
            });
            await newService.save();
            imported.push(newService);
        }

        res.json({ imported: imported.length, services: imported });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
