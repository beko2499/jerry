const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Settings = require('../models/Settings');

// Get referral stats for a user
router.get('/stats/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate referral code if missing
        if (!user.referralCode) {
            const genRefCode = () => 'ref' + Math.random().toString(36).substring(2, 10);
            let code = genRefCode();
            while (await User.findOne({ referralCode: code })) { code = genRefCode(); }
            user.referralCode = code;
            await user.save();
        }

        // Count referrals
        const totalReferrals = await User.countDocuments({ referredBy: user._id });

        // Get month referral earnings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get referral commission rate
        const commSetting = await Settings.findOne({ key: 'referralCommission' });
        const commissionRate = commSetting ? commSetting.value : 5;

        res.json({
            referralCode: user.referralCode,
            totalReferrals,
            totalEarnings: user.referralEarnings || 0,
            commissionRate,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: set referral commission rate
router.put('/commission', async (req, res) => {
    try {
        const { rate } = req.body;
        await Settings.findOneAndUpdate(
            { key: 'referralCommission' },
            { key: 'referralCommission', value: parseFloat(rate) },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: get referral commission rate
router.get('/commission', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'referralCommission' });
        res.json({ rate: setting ? setting.value : 5 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
