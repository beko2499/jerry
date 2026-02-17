const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Gateway = require('../models/Gateway');

const AC_API = 'https://odpapp.asiacell.com';
const AC_API_KEY = '1ccbc4c913bc4ce785a0a2de444aa0d6';

const BASE_HEADERS = {
    'Host': 'odpapp.asiacell.com',
    'X-Odp-Api-Key': AC_API_KEY,
    'Cache-Control': 'no-cache',
    'X-Os-Version': '9',
    'X-Device-Type': '[Android][google][G011A 9][P][HMS][4.2.1:90000263]',
    'X-Odp-App-Version': '4.2.1',
    'X-From-App': 'odp',
    'X-Odp-Channel': 'mobile',
    'X-Screen-Type': 'false',
    'Content-Type': 'application/json; charset=UTF-8',
    'User-Agent': 'okhttp/5.0.0-alpha.2',
    'Connection': 'keep-alive',
};

// In-memory session store: sessionId -> { phone, deviceId, accessToken, userId, amount, step }
const sessions = new Map();

// Clean old sessions every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, s] of sessions) {
        if (now - s.createdAt > 15 * 60 * 1000) sessions.delete(id);
    }
}, 10 * 60 * 1000);

// Get the store's Asiacell phone number from Gateway settings
async function getStorePhone() {
    try {
        const gw = await Gateway.findOne({
            type: 'auto',
            $or: [
                { name: { $regex: /asiacell|آسياسيل|اسياسيل/i } },
                { destination: { $regex: /^07/i } }
            ]
        });
        if (gw?.destination) return gw.destination;
    } catch (e) { /* fallback */ }
    return process.env.ASIACELL_STORE_PHONE || '';
}

// Step 1: Login — Send OTP to customer's phone
router.post('/login', async (req, res) => {
    try {
        const { phone, userId } = req.body;
        if (!phone || !userId) {
            return res.status(400).json({ error: 'Phone and userId are required' });
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!/^07\d{9}$/.test(cleanPhone)) {
            return res.status(400).json({ error: 'Invalid phone number. Must be 07XXXXXXXXX' });
        }

        const deviceId = crypto.randomUUID();
        const sessionId = crypto.randomUUID();

        const r = await fetch(`${AC_API}/api/v1/login?lang=ar`, {
            method: 'POST',
            headers: { ...BASE_HEADERS, 'Deviceid': deviceId },
            body: JSON.stringify({ captchaCode: '', username: cleanPhone }),
        });
        const data = await r.json();

        console.log(`[Asiacell] Login request for ${cleanPhone}:`, JSON.stringify(data));

        // Store session
        sessions.set(sessionId, {
            phone: cleanPhone,
            deviceId,
            userId,
            accessToken: null,
            amount: 0,
            step: 'otp_sent',
            createdAt: Date.now(),
        });

        res.json({
            success: true,
            sessionId,
            message: data.message || 'OTP sent',
            response: data,
        });
    } catch (err) {
        console.error('[Asiacell Login Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Step 2: Verify OTP — Get access token
router.post('/verify-otp', async (req, res) => {
    try {
        const { sessionId, otp } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: 'Session expired or invalid' });
        }

        const pid = crypto.randomUUID();
        const r = await fetch(`${AC_API}/api/v1/smsvalidation?lang=ar`, {
            method: 'POST',
            headers: { ...BASE_HEADERS, 'Deviceid': session.deviceId },
            body: JSON.stringify({ PID: pid, passcode: otp }),
        });
        const data = await r.json();

        console.log(`[Asiacell] OTP verify for ${session.phone}:`, JSON.stringify(data));

        if (data.access_token) {
            session.accessToken = data.access_token;
            session.step = 'authenticated';
            sessions.set(sessionId, session);

            res.json({
                success: true,
                message: 'Authenticated successfully',
            });
        } else {
            res.json({
                success: false,
                message: data.message || 'Invalid OTP',
                response: data,
            });
        }
    } catch (err) {
        console.error('[Asiacell OTP Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Step 3: Initiate balance transfer
router.post('/transfer', async (req, res) => {
    try {
        const { sessionId, amount } = req.body;
        const session = sessions.get(sessionId);
        if (!session || !session.accessToken) {
            return res.status(400).json({ error: 'Session expired or not authenticated' });
        }

        const amountIQD = parseInt(amount);
        if (!amountIQD || amountIQD < 250) {
            return res.status(400).json({ error: 'Minimum transfer is 250 IQD' });
        }

        const storePhone = await getStorePhone();
        if (!storePhone) {
            return res.status(500).json({ error: 'Store phone number not configured' });
        }

        const authHeaders = {
            ...BASE_HEADERS,
            'Deviceid': session.deviceId,
            'Authorization': `Bearer ${session.accessToken}`,
            'X-Screen-Type': 'MOBILE',
        };

        // Initiate balance transfer to store's number
        const r = await fetch(`${AC_API}/api/v1/btransfer?lang=ar&theme=avocado`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                msisdn: storePhone,
                amount: amountIQD,
            }),
        });
        const data = await r.json();

        console.log(`[Asiacell] Transfer ${amountIQD} IQD from ${session.phone} to ${storePhone}:`, JSON.stringify(data));

        session.amount = amountIQD;
        session.step = 'transfer_initiated';
        sessions.set(sessionId, session);

        res.json({
            success: true,
            message: data.message || 'Confirmation OTP sent',
            response: data,
        });
    } catch (err) {
        console.error('[Asiacell Transfer Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Step 4: Confirm transfer with second OTP
router.post('/confirm', async (req, res) => {
    try {
        const { sessionId, otp } = req.body;
        const session = sessions.get(sessionId);
        if (!session || session.step !== 'transfer_initiated') {
            return res.status(400).json({ error: 'Session expired or invalid step' });
        }

        const authHeaders = {
            ...BASE_HEADERS,
            'Deviceid': session.deviceId,
            'Authorization': `Bearer ${session.accessToken}`,
            'X-Screen-Type': 'MOBILE',
        };

        // Confirm the transfer
        const r = await fetch(`${AC_API}/api/v1/btransfer/confirm?lang=ar&theme=avocado`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ passcode: otp }),
        });
        const data = await r.json();

        console.log(`[Asiacell] Confirm transfer for ${session.phone}:`, JSON.stringify(data));

        // If transfer confirmed, credit user balance
        // 1000 IQD = $1
        const creditAmount = Math.floor((session.amount / 1000) * 100) / 100;

        if (creditAmount > 0) {
            const user = await User.findById(session.userId);
            if (user) {
                user.balance = (user.balance || 0) + creditAmount;
                await user.save();
                console.log(`[Asiacell] Credited $${creditAmount} (${session.amount} IQD) to ${user.username}`);
            }
        }

        // Clean up session
        sessions.delete(sessionId);

        res.json({
            success: true,
            credited: creditAmount,
            amountIQD: session.amount,
            message: `تم إضافة $${creditAmount} لرصيدك`,
            response: data,
        });
    } catch (err) {
        console.error('[Asiacell Confirm Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Get balance info (check customer's Asiacell balance)
router.post('/balance', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session || !session.accessToken) {
            return res.status(400).json({ error: 'Session expired or not authenticated' });
        }

        const r = await fetch(`${AC_API}/api/v5/avocado/home?lang=ar&theme=avocado`, {
            headers: {
                ...BASE_HEADERS,
                'Deviceid': session.deviceId,
                'Authorization': `Bearer ${session.accessToken}`,
                'X-Screen-Type': 'MOBILE',
            },
        });
        const data = await r.json();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
