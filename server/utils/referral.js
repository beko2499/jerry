const User = require('../models/User');
const Settings = require('../models/Settings');

/**
 * Credit referral commission to the referrer when a user tops up balance
 * @param {string} userId - The user who topped up
 * @param {number} amount - The top-up amount in USD
 */
async function creditReferralCommission(userId, amount) {
    try {
        const user = await User.findById(userId);
        if (!user || !user.referredBy) return;

        const commSetting = await Settings.findOne({ key: 'referralCommission' });
        const rate = commSetting ? commSetting.value : 5; // default 5%
        const commission = Math.floor(amount * (rate / 100) * 100) / 100;
        if (commission <= 0) return;

        await User.findByIdAndUpdate(user.referredBy, {
            $inc: { balance: commission, referralEarnings: commission }
        });
        console.log(`[Referral] Credited $${commission} to referrer of ${user.username} (${rate}% of $${amount})`);
    } catch (err) {
        console.error('[Referral Commission Error]', err.message);
    }
}

module.exports = { creditReferralCommission };
