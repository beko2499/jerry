const express = require('express');
const router = express.Router();
const User = require('../models/User');

const NP_API = 'https://api.nowpayments.io/v1';
const NP_KEY = process.env.NOWPAYMENTS_API_KEY || '';

const headers = {
    'x-api-key': NP_KEY,
    'Content-Type': 'application/json',
};

// Get minimum payment amount for a currency pair
router.get('/min-amount/:currency', async (req, res) => {
    try {
        const r = await fetch(`${NP_API}/min-amount?currency_from=${req.params.currency}&currency_to=usd`, { headers });
        const data = await r.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get estimated price (how much crypto for X USD)
router.get('/estimate', async (req, res) => {
    try {
        const { amount, currency } = req.query;
        const r = await fetch(`${NP_API}/estimate?amount=${amount}&currency_from=usd&currency_to=${currency}`, { headers });
        const data = await r.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a payment
router.post('/create-payment', async (req, res) => {
    try {
        const { amount, currency, userId, orderId } = req.body;
        if (!amount || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Sanitize currency: only alphanumeric, default to usdtarb
        const cleanCurrency = (currency || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'usdtarb';

        const payload = {
            price_amount: parseFloat(amount),
            price_currency: 'usd',
            pay_currency: cleanCurrency,
            order_id: orderId || `jerry_${userId}_${Date.now()}`,
            order_description: `Add $${amount} to Jerry Store balance`,
            ipn_callback_url: `${process.env.APP_URL || 'https://jerrystore.online'}/api/nowpayments/ipn`,
        };

        const r = await fetch(`${NP_API}/payment`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        const data = await r.json();

        if (data.payment_id) {
            // Store the mapping: payment_id -> userId
            // We'll use a simple in-memory map + the order_id contains the userId
            res.json({
                success: true,
                paymentId: data.payment_id,
                payAddress: data.pay_address,
                payAmount: data.pay_amount,
                payCurrency: data.pay_currency,
                priceAmount: data.price_amount,
                expirationDate: data.expiration_estimate_date,
                status: data.payment_status,
            });
        } else {
            res.status(400).json({ error: data.message || 'Payment creation failed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check payment status
router.get('/status/:paymentId', async (req, res) => {
    try {
        const r = await fetch(`${NP_API}/payment/${req.params.paymentId}`, { headers });
        const data = await r.json();
        res.json({
            paymentId: data.payment_id,
            status: data.payment_status,
            payAmount: data.pay_amount,
            actuallyPaid: data.actually_paid,
            priceAmount: data.price_amount,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// IPN Callback — NOWPayments notifies us when payment status changes
router.post('/ipn', async (req, res) => {
    try {
        const { payment_id, payment_status, order_id, price_amount, actually_paid } = req.body;

        console.log(`[NOWPayments IPN] Payment ${payment_id}: ${payment_status}, order: ${order_id}`);

        // Only process confirmed/finished payments
        if (payment_status === 'finished' || payment_status === 'confirmed') {
            // Extract userId from order_id (format: jerry_USERID_TIMESTAMP)
            const parts = (order_id || '').split('_');
            const userId = parts.length >= 2 ? parts[1] : null;

            if (userId) {
                const user = await User.findById(userId);
                if (user) {
                    user.balance = (user.balance || 0) + parseFloat(price_amount);
                    await user.save();
                    console.log(`[NOWPayments] Added $${price_amount} to user ${user.username} (${userId})`);
                }
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('[NOWPayments IPN Error]', err);
        res.json({ success: false });
    }
});

// Get available currencies
router.get('/currencies', async (req, res) => {
    try {
        const r = await fetch(`${NP_API}/currencies?fixed_rate=true`, { headers });
        const data = await r.json();
        // Filter to popular ones
        const popular = ['usdtarb', 'usdttrc20', 'usdterc20', 'usdtbsc', 'btc', 'eth', 'ltc', 'trx'];
        const filtered = (data.currencies || []).filter(c => popular.includes(c));
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
