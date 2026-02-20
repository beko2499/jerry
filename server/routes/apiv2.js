const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Provider = require('../models/Provider');
const SmmApi = require('../utils/smmApi');

// Authenticate user by API key
async function authByKey(key) {
    if (!key) return null;
    return User.findOne({ apiKey: key });
}

// Generate or get API key for a user
router.post('/generate-key', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.apiKey = crypto.randomBytes(32).toString('hex');
        await user.save();
        res.json({ apiKey: user.apiKey });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get API key for a user
router.get('/key/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.apiKey) {
            user.apiKey = crypto.randomBytes(32).toString('hex');
            await user.save();
        }
        res.json({ apiKey: user.apiKey });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Main API v2 endpoint — handles all actions
router.all('/', async (req, res) => {
    try {
        const params = { ...req.query, ...req.body };
        const { action, key } = params;

        if (!action) return res.json({ error: 'Action is required' });
        if (!key && action !== 'services') return res.json({ error: 'API key is required' });

        // Authenticate
        let user = null;
        if (key) {
            user = await authByKey(key);
            if (!user) return res.json({ error: 'Invalid API key' });
        }

        // ========== SERVICES ==========
        if (action === 'services') {
            const services = await Service.find().populate('categoryId', 'name');
            const result = services.map((s, i) => ({
                service: i + 1,
                serviceId: s._id.toString(),
                name: s.name,
                type: 'default',
                category: s.categoryId?.name || '',
                rate: (s.price * 1000).toFixed(2),
                min: s.min || 10,
                max: s.max || 10000,
                refill: false,
                cancel: false,
            }));
            return res.json(result);
        }

        // ========== BALANCE ==========
        if (action === 'balance') {
            return res.json({
                balance: (user.balance || 0).toFixed(2),
                currency: 'USD',
            });
        }

        // ========== ADD ORDER ==========
        if (action === 'add') {
            const { service: serviceParam, link, quantity: qtyParam } = params;
            if (!serviceParam || !link || !qtyParam) return res.json({ error: 'Missing required parameters: service, link, quantity' });

            const quantity = parseInt(qtyParam);
            if (isNaN(quantity) || quantity < 1) return res.json({ error: 'Invalid quantity' });

            // Find service by index or ID
            let svc = null;
            const allServices = await Service.find();
            const serviceIndex = parseInt(serviceParam);
            if (!isNaN(serviceIndex) && serviceIndex >= 1 && serviceIndex <= allServices.length) {
                svc = allServices[serviceIndex - 1];
            } else {
                svc = allServices.find(s => s._id.toString() === serviceParam);
            }

            if (!svc) return res.json({ error: 'Invalid service ID' });
            if (quantity < (svc.min || 1)) return res.json({ error: `Minimum quantity is ${svc.min}` });
            if (quantity > (svc.max || 100000)) return res.json({ error: `Maximum quantity is ${svc.max}` });

            // Calculate price (price is per unit, total = price * quantity)
            const totalPrice = Math.round(svc.price * quantity * 100) / 100;

            // Check balance
            if ((user.balance || 0) < totalPrice) return res.json({ error: 'Insufficient balance' });

            // Deduct balance
            user.balance = (user.balance || 0) - totalPrice;
            await user.save();

            // Create order
            const count = await Order.countDocuments();
            const orderId = `#${String(count + 10001).padStart(5, '0')}`;

            const order = new Order({
                orderId,
                userId: user._id,
                serviceId: svc._id.toString(),
                serviceName: svc.name,
                quantity,
                price: totalPrice,
                link,
                status: 'pending',
            });

            // Auto-send to provider
            if (svc.providerId && svc.autoId) {
                const provider = await Provider.findById(svc.providerId);
                if (provider && provider.status === 'active') {
                    try {
                        const api = new SmmApi(provider.url, provider.apiKey);
                        const result = await api.addOrder(svc.autoId, link, quantity);
                        order.providerId = provider._id.toString();
                        order.externalOrderId = String(result.order);
                        order.status = 'processing';
                        order.providerStatus = 'Processing';
                    } catch (apiErr) {
                        order.status = 'cancelled';
                        order.providerStatus = `Error: ${apiErr.message}`;
                        user.balance = (user.balance || 0) + totalPrice;
                        await user.save();
                    }
                }
            }

            await order.save();

            // Return numeric order count as ID (for API compatibility)
            return res.json({ order: count + 10001 });
        }

        // ========== STATUS (single) ==========
        if (action === 'status' && params.order && !params.orders) {
            const orderNum = parseInt(params.order);
            const order = await Order.findOne({ orderId: `#${String(orderNum).padStart(5, '0')}`, userId: user._id });
            if (!order) return res.json({ error: 'Incorrect order ID' });

            // Map internal status to API status
            const statusMap = { pending: 'Awaiting', processing: 'In progress', completed: 'Completed', cancelled: 'Canceled', partial: 'Partial' };

            return res.json({
                charge: order.price.toFixed(5),
                start_count: '0',
                status: statusMap[order.status] || order.status,
                remains: '0',
                currency: 'USD',
            });
        }

        // ========== STATUS (multiple) ==========
        if (action === 'status' && params.orders) {
            const orderNums = params.orders.split(',').map(s => parseInt(s.trim()));
            const result = {};
            const statusMap = { pending: 'Awaiting', processing: 'In progress', completed: 'Completed', cancelled: 'Canceled', partial: 'Partial' };

            for (const num of orderNums) {
                const order = await Order.findOne({ orderId: `#${String(num).padStart(5, '0')}`, userId: user._id });
                if (!order) {
                    result[num] = 'Incorrect order ID';
                } else {
                    result[num] = {
                        charge: order.price.toFixed(5),
                        start_count: '0',
                        status: statusMap[order.status] || order.status,
                        remains: '0',
                        currency: 'USD',
                    };
                }
            }
            return res.json(result);
        }

        // ========== CANCEL ==========
        if (action === 'cancel') {
            const orderNum = parseInt(params.order);
            const order = await Order.findOne({ orderId: `#${String(orderNum).padStart(5, '0')}`, userId: user._id });
            if (!order) return res.json({ error: 'Incorrect order ID' });
            if (order.status === 'completed' || order.status === 'cancelled') return res.json({ error: 'Order cannot be cancelled' });

            // Refund
            order.status = 'cancelled';
            await order.save();
            user.balance = (user.balance || 0) + order.price;
            await user.save();

            return res.json({ ok: true });
        }

        // ========== REFILL ==========
        if (action === 'refill') {
            const orderNum = parseInt(params.order);
            const order = await Order.findOne({ orderId: `#${String(orderNum).padStart(5, '0')}`, userId: user._id });
            if (!order) return res.json({ error: 'Incorrect order ID' });
            if (order.status !== 'completed') return res.json({ error: 'Order must be completed to refill' });

            // Try refilling via provider
            if (order.externalOrderId && order.providerId) {
                const provider = await Provider.findById(order.providerId);
                if (provider) {
                    try {
                        const api = new SmmApi(provider.url, provider.apiKey);
                        await api.createRefill(order.externalOrderId);
                        return res.json({ refill: 1 });
                    } catch (e) {
                        return res.json({ error: e.message });
                    }
                }
            }
            return res.json({ error: 'Refill not available for this order' });
        }

        return res.json({ error: `Unknown action: ${action}` });
    } catch (err) {
        console.error('[API v2 Error]', err);
        res.json({ error: err.message });
    }
});

module.exports = router;
