const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// Get dashboard stats
router.get('/', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments();
        const revenueResult = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
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
