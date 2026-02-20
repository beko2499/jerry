const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jerry';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/services', require('./routes/services'));
app.use('/api/gateways', require('./routes/gateways'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/nowpayments', require('./routes/nowpayments'));
app.use('/api/asiacell', require('./routes/asiacell'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tickets', require('./routes/tickets'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

        // Auto-sync order statuses every 2 minutes
        const Order = require('./models/Order');
        const Provider = require('./models/Provider');
        const SmmApi = require('./utils/smmApi');

        const statusMap = {
            'Completed': 'completed',
            'In progress': 'processing',
            'Processing': 'processing',
            'Pending': 'pending',
            'Partial': 'partial',
            'Canceled': 'cancelled',
            'Cancelled': 'cancelled',
        };

        setInterval(async () => {
            try {
                const orders = await Order.find({
                    status: { $in: ['pending', 'processing'] },
                    externalOrderId: { $ne: '' },
                    providerId: { $ne: '' },
                });
                if (!orders.length) return;

                // Group by provider
                const grouped = {};
                for (const o of orders) {
                    if (!grouped[o.providerId]) grouped[o.providerId] = [];
                    grouped[o.providerId].push(o);
                }

                let updated = 0;
                for (const [providerId, provOrders] of Object.entries(grouped)) {
                    const provider = await Provider.findById(providerId);
                    if (!provider) continue;
                    const api = new SmmApi(provider.url, provider.apiKey);

                    for (const o of provOrders) {
                        try {
                            const r = await api.getOrderStatus(o.externalOrderId);
                            if (r && r.status) {
                                o.providerStatus = r.status;
                                o.providerCharge = parseFloat(r.charge) || 0;
                                if (statusMap[r.status]) o.status = statusMap[r.status];
                                await o.save();
                                updated++;
                            }
                        } catch (e) { /* skip failed checks */ }
                    }
                }
                if (updated > 0) console.log(`[Auto-Sync] Updated ${updated} order(s)`);
            } catch (err) {
                console.error('[Auto-Sync] Error:', err.message);
            }
        }, 2 * 60 * 1000); // Every 2 minutes

        // Scheduled notifications sender — every 60 seconds
        const Notification = require('./models/Notification');
        setInterval(async () => {
            try {
                const due = await Notification.find({ status: 'pending', type: 'scheduled', scheduledAt: { $lte: new Date() } });
                for (const n of due) {
                    n.status = 'sent';
                    n.sentAt = new Date();
                    await n.save();
                }
                if (due.length > 0) console.log(`[Notifications] Sent ${due.length} scheduled notification(s)`);
            } catch (err) {
                console.error('[Notifications] Error:', err.message);
            }
        }, 60 * 1000); // Every 1 minute
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
