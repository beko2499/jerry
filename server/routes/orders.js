const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const User = require('../models/User');
const SmmApi = require('../utils/smmApi');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Get orders (optionally filter by userId)
router.get('/', requireAuth, async (req, res) => {
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

// Create order — with auto-fulfillment to provider
router.post('/', requireAuth, async (req, res) => {
    try {
        const { userId, serviceId, serviceName, quantity, price, link } = req.body;

        // Deduct user balance
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if ((user.balance || 0) < price) return res.status(400).json({ error: 'Insufficient balance' });

        user.balance = (user.balance || 0) - price;
        await user.save();

        // Create local order
        const count = await Order.countDocuments();
        const orderId = `#${String(count + 10001).padStart(5, '0')}`;

        const order = new Order({
            orderId,
            userId,
            serviceId: serviceId || '',
            serviceName,
            quantity,
            price,
            link: link || '',
            status: 'pending',
        });

        // Auto-send to provider if service has provider mapping
        const service = serviceId ? await Service.findById(serviceId) : null;
        if (service && service.providerId && service.providerServiceId) {
            const provider = await Provider.findById(service.providerId);
            if (provider && provider.status === 'active') {
                try {
                    const api = new SmmApi(provider.url, provider.apiKey);
                    const result = await api.addOrder(service.providerServiceId, link, quantity);

                    order.providerId = provider._id.toString();
                    order.externalOrderId = String(result.order);
                    order.status = 'processing';
                    order.providerStatus = 'Processing';
                } catch (apiErr) {
                    console.error('Provider API error:', apiErr.message);
                    // Refund customer and cancel order immediately
                    order.status = 'cancelled';
                    order.providerStatus = `Error: ${apiErr.message}`;
                    user.balance = (user.balance || 0) + price;
                    await user.save();
                    await order.save();

                    // Create admin notification for provider error
                    try {
                        const Notification = require('../models/Notification');
                        const errMsg = (apiErr.message || '').toLowerCase();
                        const isBalanceError = errMsg.includes('balance') || errMsg.includes('fund') || errMsg.includes('enough');
                        await Notification.create({
                            title: isBalanceError ? '⚠️ رصيد غير كافي عند المزود' : '❌ خطأ من المزود',
                            body: isBalanceError
                                ? `رصيدك عند المزود "${provider.name}" غير كافي. يرجى شحن الرصيد لإتمام الطلبات.\n\nالخطأ: ${apiErr.message}`
                                : `فشل إرسال طلب للمزود "${provider.name}".\n\nالخطأ: ${apiErr.message}`,
                            type: 'instant',
                            audience: 'admin',
                            status: 'sent',
                            sentAt: new Date(),
                        });
                    } catch (notifErr) {
                        console.error('Failed to create admin notification:', notifErr.message);
                    }

                    return res.status(400).json({ error: apiErr.message, refunded: true });
                }
            }
        }

        await order.save();
        res.json(order);
    } catch (err) {
        // Refund on error
        if (req.body.userId && req.body.price) {
            try {
                await User.findByIdAndUpdate(req.body.userId, { $inc: { balance: req.body.price } });
            } catch (refundErr) {
                console.error('Refund error:', refundErr.message);
            }
        }
        res.status(500).json({ error: err.message });
    }
});

// Check order status from provider
router.get('/:id/check-status', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (!order.externalOrderId || !order.providerId) {
            return res.json({ status: order.status, message: 'No provider linked' });
        }

        const provider = await Provider.findById(order.providerId);
        if (!provider) return res.json({ status: order.status, message: 'Provider not found' });

        const api = new SmmApi(provider.url, provider.apiKey);
        const result = await api.getOrderStatus(order.externalOrderId);

        // Map provider status to our status
        const statusMap = {
            'Completed': 'completed',
            'In progress': 'inprogress',
            'Processing': 'processing',
            'Pending': 'pending',
            'Partial': 'partial',
            'Canceled': 'cancelled',
            'Cancelled': 'cancelled',
            'Refunded': 'refunded',
            'Error': 'error',
        };

        order.providerStatus = result.status || '';
        order.providerCharge = parseFloat(result.charge) || 0;
        if (statusMap[result.status]) {
            order.status = statusMap[result.status];
        }
        await order.save();

        res.json({
            status: order.status,
            providerStatus: result.status,
            charge: result.charge,
            startCount: result.start_count,
            remains: result.remains,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk check status for all processing orders
router.post('/bulk-check-status', async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ['pending', 'processing', 'inprogress'] },
            externalOrderId: { $ne: '' },
            providerId: { $ne: '' },
        });

        if (!orders.length) return res.json({ updated: 0 });

        // Group by provider
        const grouped = {};
        for (const o of orders) {
            if (!grouped[o.providerId]) grouped[o.providerId] = [];
            grouped[o.providerId].push(o);
        }

        let updated = 0;
        const statusMap = {
            'Completed': 'completed',
            'In progress': 'inprogress',
            'Processing': 'processing',
            'Pending': 'pending',
            'Partial': 'partial',
            'Canceled': 'cancelled',
            'Cancelled': 'cancelled',
            'Refunded': 'refunded',
            'Error': 'error',
        };

        for (const [providerId, provOrders] of Object.entries(grouped)) {
            const provider = await Provider.findById(providerId);
            if (!provider) continue;

            const api = new SmmApi(provider.url, provider.apiKey);
            const ids = provOrders.map(o => o.externalOrderId);

            // Check in batches of 100
            for (let i = 0; i < ids.length; i += 100) {
                const batch = ids.slice(i, i + 100);
                try {
                    const results = await api.getMultipleOrderStatus(batch);

                    for (const o of provOrders) {
                        const r = results[o.externalOrderId];
                        if (r && !r.error) {
                            o.providerStatus = r.status || '';
                            o.providerCharge = parseFloat(r.charge) || 0;
                            if (statusMap[r.status]) o.status = statusMap[r.status];
                            await o.save();
                            updated++;
                        }
                    }
                } catch (e) {
                    console.error(`Batch check error for provider ${providerId}:`, e.message);
                }
            }
        }

        res.json({ updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete order
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
