const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Gateway = require('../models/Gateway');
const Transaction = require('../models/Transaction');

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

// ========== ADMIN STATE ==========
// Stores admin's Asiacell session (access_token for the store's number)
let adminSession = {
    phone: '',
    deviceId: '',
    accessToken: '',
    pid: '',
    authenticated: false,
};

// Processed transfer IDs to avoid double-crediting
const processedTransfers = new Set();

// ========== CUSTOMER SESSIONS ==========
// sessionId -> { phone, deviceId, accessToken, username, amount, step }
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

// ========== ADMIN ENDPOINTS (for store owner) ==========

// Admin: Get admin session status
router.get('/admin/status', (req, res) => {
    res.json({
        authenticated: adminSession.authenticated,
        phone: adminSession.phone,
    });
});

// Admin Step 1: Login with store's phone number
router.post('/admin/login', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone required' });

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!/^07\d{9}$/.test(cleanPhone)) {
            return res.status(400).json({ error: 'Invalid phone number. Must be 07XXXXXXXXX' });
        }

        const deviceId = crypto.randomUUID();

        const r = await fetch(`${AC_API}/api/v1/login?lang=ar`, {
            method: 'POST',
            headers: { ...BASE_HEADERS, 'Deviceid': deviceId },
            body: JSON.stringify({ captchaCode: '', username: cleanPhone }),
        });
        const data = await r.json();

        console.log(`[Asiacell Admin] Login request for ${cleanPhone}:`, JSON.stringify(data));

        // Extract PID from nextUrl
        const pidMatch = (data.nextUrl || '').match(/PID=([^&]+)/);
        const pid = pidMatch ? pidMatch[1] : '';

        adminSession.phone = cleanPhone;
        adminSession.deviceId = deviceId;
        adminSession.pid = pid;
        adminSession.authenticated = false;

        res.json({ success: true, message: data.message || 'OTP sent' });
    } catch (err) {
        console.error('[Asiacell Admin Login Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin Step 2: Verify OTP
router.post('/admin/verify', async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp || !adminSession.phone) {
            return res.status(400).json({ error: 'OTP required, login first' });
        }

        const r = await fetch(`${AC_API}/api/v1/smsvalidation?lang=ar`, {
            method: 'POST',
            headers: { ...BASE_HEADERS, 'Deviceid': adminSession.deviceId },
            body: JSON.stringify({ PID: adminSession.pid, passcode: otp }),
        });
        const data = await r.json();

        console.log(`[Asiacell Admin] OTP verify:`, JSON.stringify(data));

        if (data.access_token) {
            adminSession.accessToken = data.access_token;
            adminSession.authenticated = true;
            console.log(`[Asiacell Admin] Authenticated successfully for ${adminSession.phone}`);

            // Auto-create or enable Asiacell gateway
            try {
                let gw = await Gateway.findOne({ destination: adminSession.phone, type: 'auto' });
                if (!gw) {
                    gw = await Gateway.create({
                        type: 'auto',
                        name: 'Asiacell',
                        nameAr: 'آسياسيل',
                        isEnabled: true,
                        isConnected: true,
                        destination: adminSession.phone,
                        mode: 'auto',
                    });
                    console.log(`[Asiacell Admin] Created gateway for ${adminSession.phone}`);
                } else if (!gw.isEnabled) {
                    gw.isEnabled = true;
                    gw.isConnected = true;
                    await gw.save();
                    console.log(`[Asiacell Admin] Enabled existing gateway for ${adminSession.phone}`);
                }
            } catch (gwErr) {
                console.error('[Asiacell Admin] Gateway auto-create error:', gwErr);
            }

            res.json({ success: true, message: 'Admin authenticated' });
        } else {
            res.json({ success: false, message: data.message || 'Invalid OTP' });
        }
    } catch (err) {
        console.error('[Asiacell Admin Verify Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Logout
router.post('/admin/logout', (req, res) => {
    adminSession = { phone: '', deviceId: '', accessToken: '', pid: '', authenticated: false };
    res.json({ success: true });
});

// Admin: Manually check records now
router.post('/admin/check-records', async (req, res) => {
    if (!adminSession.authenticated) {
        return res.status(400).json({ error: 'Admin not authenticated' });
    }
    const result = await checkRecordsAndCredit();
    res.json(result);
});

// ========== CUSTOMER ENDPOINTS ==========

// Customer Step 1: Login with their phone
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

        // Extract PID from nextUrl
        const pidMatch = (data.nextUrl || '').match(/PID=([^&]+)/);
        const pid = pidMatch ? pidMatch[1] : '';

        sessions.set(sessionId, {
            phone: cleanPhone,
            deviceId,
            userId,
            pid,
            accessToken: null,
            username: '',
            amount: 0,
            step: 'otp_sent',
            createdAt: Date.now(),
        });

        res.json({ success: true, sessionId, message: data.message || 'OTP sent' });
    } catch (err) {
        console.error('[Asiacell Login Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Customer Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { sessionId, otp } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: 'Session expired or invalid' });
        }

        const r = await fetch(`${AC_API}/api/v1/smsvalidation?lang=ar`, {
            method: 'POST',
            headers: { ...BASE_HEADERS, 'Deviceid': session.deviceId },
            body: JSON.stringify({ PID: session.pid, passcode: otp }),
        });
        const data = await r.json();

        console.log(`[Asiacell] OTP verify for ${session.phone}:`, JSON.stringify(data));

        if (data.access_token) {
            session.accessToken = data.access_token;
            session.step = 'authenticated';
            sessions.set(sessionId, session);
            res.json({ success: true, message: 'Authenticated successfully' });
        } else {
            res.json({ success: false, message: data.message || 'Invalid OTP' });
        }
    } catch (err) {
        console.error('[Asiacell OTP Error]', err);
        res.status(500).json({ error: err.message });
    }
});

// Customer Step 3: Initiate balance transfer
router.post('/transfer', async (req, res) => {
    try {
        const { sessionId, amount, username } = req.body;
        const session = sessions.get(sessionId);
        if (!session || !session.accessToken) {
            return res.status(400).json({ error: 'Session expired or not authenticated' });
        }

        const amountIQD = parseInt(amount);
        if (!amountIQD || amountIQD < 250) {
            return res.status(400).json({ error: 'Minimum transfer is 250 IQD' });
        }

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Verify username exists
        const targetUser = await User.findOne({ username: username.trim() });
        if (!targetUser) {
            return res.status(400).json({ error: 'Username not found' });
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
        session.username = username.trim();
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

// Customer Step 4: Confirm transfer with second OTP
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

        // 1000 IQD = $1
        const creditAmount = Math.floor((session.amount / 1000) * 100) / 100;

        // Credit user immediately after transfer confirmation  
        if (creditAmount > 0) {
            const user = await User.findOne({ username: session.username });
            if (user) {
                user.balance = (user.balance || 0) + creditAmount;
                await user.save();
                await Transaction.create({
                    userId: user._id,
                    type: 'recharge',
                    amount: creditAmount,
                    method: 'asiacell',
                    paymentId: `${session.phone}_${Date.now()}`,
                    status: 'completed',
                });
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

// ========== RECORDS POLLING (Verification) ==========
// Check admin's SMS records for incoming balance transfers

async function checkRecordsAndCredit() {
    if (!adminSession.authenticated || !adminSession.accessToken) {
        return { checked: false, reason: 'Admin not authenticated' };
    }

    try {
        const headers = {
            ...BASE_HEADERS,
            'Deviceid': adminSession.deviceId,
            'Authorization': `Bearer ${adminSession.accessToken}`,
            'X-Screen-Type': 'MOBILE',
        };

        const r = await fetch(`${AC_API}/api/v1/cdr/detail?type=sms&page=1&limit=50&lang=ar&theme=avocado`, {
            headers,
        });
        const data = await r.json();

        console.log(`[Asiacell Records] Fetched ${Array.isArray(data?.data) ? data.data.length : 0} records`);

        if (!data?.data || !Array.isArray(data.data)) {
            // Token might have expired
            if (data?.status === 401 || data?.message?.includes('unauthorized')) {
                adminSession.authenticated = false;
                console.log('[Asiacell Records] Token expired, admin needs to re-authenticate');
            }
            return { checked: true, processed: 0, error: 'No records data' };
        }

        let processed = 0;
        for (const record of data.data) {
            // Skip already processed records
            const recordId = record.id || record.transactionId || `${record.date}_${record.otherParty}`;
            if (processedTransfers.has(recordId)) continue;

            // Look for incoming balance transfer messages
            // Parse message content to find transfer amount and sender
            const msg = record.message || record.description || record.text || '';
            const sender = record.otherParty || record.from || record.number || '';

            // Match balance transfer patterns (Arabic SMS from Asiacell)
            // Common patterns: "تم استلام رصيد بقيمة X من الرقم Y" or similar
            const amountMatch = msg.match(/(\d+)/);
            const isTransfer = msg.includes('تحويل') || msg.includes('رصيد') || msg.includes('transfer') || msg.includes('balance');

            if (isTransfer && amountMatch && sender) {
                const amountIQD = parseInt(amountMatch[1]);
                const creditAmount = Math.floor((amountIQD / 1000) * 100) / 100;

                if (creditAmount > 0) {
                    // Try to find user by phone number
                    const cleanSender = sender.replace(/[^0-9]/g, '');
                    const user = await User.findOne({
                        $or: [
                            { phone: cleanSender },
                            { phone: `+964${cleanSender.slice(1)}` },
                            { phone: { $regex: cleanSender.slice(-10) } },
                        ]
                    });

                    if (user) {
                        user.balance = (user.balance || 0) + creditAmount;
                        await user.save();
                        await Transaction.create({
                            userId: user._id,
                            type: 'recharge',
                            amount: creditAmount,
                            method: 'asiacell',
                            paymentId: recordId,
                            status: 'completed',
                        });
                        console.log(`[Asiacell Records] Auto-credited $${creditAmount} to ${user.username} from ${sender}`);
                        processed++;
                    }
                }

                processedTransfers.add(recordId);
            }
        }

        return { checked: true, processed, total: data.data.length };
    } catch (err) {
        console.error('[Asiacell Records] Error:', err.message);
        return { checked: false, error: err.message };
    }
}

// Poll records every 30 seconds (when admin is authenticated)
setInterval(() => {
    if (adminSession.authenticated) {
        checkRecordsAndCredit();
    }
}, 30 * 1000);

// ========== BALANCE CHECK ==========
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
