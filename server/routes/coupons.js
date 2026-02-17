const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Admin: Generate a new coupon
router.post('/generate', async (req, res) => {
    try {
        const { amount, note } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const coupon = new Coupon({ amount, note: note || '' });
        await coupon.save();
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all coupons
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 }).populate('usedBy', 'username email');
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete unused coupon
router.delete('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Not found' });
        if (coupon.isUsed) return res.status(400).json({ error: 'Cannot delete used coupon' });
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User: Redeem a coupon
router.post('/redeem', async (req, res) => {
    try {
        const { code, userId } = req.body;
        if (!code || !userId) {
            return res.status(400).json({ error: 'Code and userId required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (!coupon) {
            return res.status(404).json({ error: 'invalid_code' });
        }
        if (coupon.isUsed) {
            return res.status(400).json({ error: 'already_used' });
        }

        // Mark coupon as used
        coupon.isUsed = true;
        coupon.usedBy = userId;
        coupon.usedAt = new Date();
        await coupon.save();

        // Add balance to user
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: coupon.amount } },
            { new: true }
        );

        await Transaction.create({ userId, type: 'recharge', amount: coupon.amount, method: 'coupon', paymentId: coupon.code, status: 'completed' });

        res.json({
            success: true,
            amount: coupon.amount,
            newBalance: user.balance,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
