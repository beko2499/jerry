const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');

const ACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

// Heartbeat: users ping this every 30s — update lastSeen in DB
router.post('/heartbeat', requireAuth, async (req, res) => {
    try {
        await User.updateOne({ _id: req.user._id }, { lastSeen: new Date() });
        res.json({ ok: true });
    } catch { res.json({ ok: false }); }
});

// Admin: get live active count
router.get('/active-now', requireAdmin, async (req, res) => {
    try {
        const count = await User.countDocuments({
            lastSeen: { $gte: new Date(Date.now() - ACTIVE_THRESHOLD) }
        });
        res.json({ activeNow: count });
    } catch { res.json({ activeNow: 0 }); }
});

// Get dashboard stats
router.get('/', requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments();

        // Order revenue by status
        const orderRevenueAgg = await Order.aggregate([
            { $group: { _id: '$status', total: { $sum: '$price' }, count: { $sum: 1 } } }
        ]);
        const orderRevByStatus = {};
        for (const r of orderRevenueAgg) {
            orderRevByStatus[r._id] = { total: r.total, count: r.count };
        }
        const completedRevenue = orderRevByStatus['completed']?.total || 0;
        const pendingRevenue = orderRevByStatus['pending']?.total || 0;
        const processingRevenue = orderRevByStatus['processing']?.total || 0;
        const cancelledRevenue = orderRevByStatus['cancelled']?.total || 0;

        // Profits = order revenue - provider charges
        const providerChargesAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$providerCharge' } } }
        ]);
        const totalProviderCharges = providerChargesAgg.length > 0 ? providerChargesAgg[0].total : 0;
        const profits = completedRevenue - totalProviderCharges;

        // Recharge revenue (from transactions)
        const rechargeAgg = await Transaction.aggregate([
            { $match: { type: 'recharge', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const rechargeRevenue = rechargeAgg.length > 0 ? rechargeAgg[0].total : 0;
        const rechargeCount = rechargeAgg.length > 0 ? rechargeAgg[0].count : 0;

        const totalRevenue = completedRevenue + pendingRevenue + processingRevenue;
        const activeNow = await User.countDocuments({
            lastSeen: { $gte: new Date(Date.now() - ACTIVE_THRESHOLD) }
        });

        // Recent activity
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'username firstName');

        // Check for stat overrides
        const Settings = require('../models/Settings');
        const overrideKeys = ['totalUsers', 'totalOrders', 'totalRevenue', 'rechargeRevenue'];
        const overrides = await Settings.find({ key: { $in: overrideKeys.map(k => `stat_override_${k}`) } });
        const overrideMap = {};
        for (const o of overrides) {
            overrideMap[o.key.replace('stat_override_', '')] = o.value;
        }

        res.json({
            totalUsers: overrideMap.totalUsers ?? totalUsers,
            totalOrders: overrideMap.totalOrders ?? totalOrders,
            totalRevenue: overrideMap.totalRevenue != null ? `$${Number(overrideMap.totalRevenue).toFixed(2)}` : `$${totalRevenue.toFixed(2)}`,
            activeNow: activeNow,
            // Order revenue breakdown
            completedRevenue: completedRevenue.toFixed(2),
            pendingRevenue: (pendingRevenue + processingRevenue).toFixed(2),
            cancelledRevenue: cancelledRevenue.toFixed(2),
            profits: profits.toFixed(2),
            // Recharge revenue
            rechargeRevenue: overrideMap.rechargeRevenue != null ? Number(overrideMap.rechargeRevenue).toFixed(2) : rechargeRevenue.toFixed(2),
            rechargeCount,
            recentActivity: recentOrders.map(o => ({
                user: o.userId?.firstName || 'Unknown',
                action: `placed order ${o.orderId}`,
                time: o.createdAt
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update stat counter override
router.patch('/override', requireAdmin, async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
        
        const Settings = require('../models/Settings');
        await Settings.findOneAndUpdate(
            { key: `stat_override_${key}` },
            { value: Number(value) },
            { upsert: true, new: true }
        );
        res.json({ success: true, key, value: Number(value) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
