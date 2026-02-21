const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { requireAdmin } = require('../middleware/authMiddleware');

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
            updatedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
        });

        // Recent activity
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'username firstName');

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue: `$${totalRevenue.toFixed(2)}`,
            activeNow,
            // Order revenue breakdown
            completedRevenue: completedRevenue.toFixed(2),
            pendingRevenue: (pendingRevenue + processingRevenue).toFixed(2),
            cancelledRevenue: cancelledRevenue.toFixed(2),
            profits: profits.toFixed(2),
            // Recharge revenue
            rechargeRevenue: rechargeRevenue.toFixed(2),
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

module.exports = router;
