const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAdmin } = require('../middleware/authMiddleware');

// All models
const User = require('../models/User');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Provider = require('../models/Provider');
const Gateway = require('../models/Gateway');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');

const collections = {
    users: User,
    orders: Order,
    services: Service,
    categories: Category,
    providers: Provider,
    gateways: Gateway,
    settings: Settings,
    coupons: Coupon,
    notifications: Notification,
    tickets: Ticket,
    transactions: Transaction,
};

// Upload config — store in memory
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max

// GET /api/backup/download — Download full database backup as JSON
router.get('/download', requireAdmin, async (req, res) => {
    try {
        const backup = {};
        for (const [name, Model] of Object.entries(collections)) {
            backup[name] = await Model.find({}).lean();
        }
        backup._meta = {
            createdAt: new Date().toISOString(),
            version: '1.0',
            totalCollections: Object.keys(collections).length,
        };

        const json = JSON.stringify(backup, null, 2);
        const date = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="jerry_backup_${date}.json"`);
        res.send(json);
    } catch (err) {
        console.error('[Backup] Download error:', err.message);
        res.status(500).json({ error: 'backup_failed', message: err.message });
    }
});

// POST /api/backup/restore — Restore database from JSON backup
router.post('/restore', requireAdmin, upload.single('backup'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'no_file', message: 'No backup file provided' });

        const data = JSON.parse(req.file.buffer.toString('utf8'));
        const results = {};

        for (const [name, Model] of Object.entries(collections)) {
            if (data[name] && Array.isArray(data[name]) && data[name].length > 0) {
                await Model.deleteMany({});
                await Model.insertMany(data[name], { ordered: false, rawResult: false });
                results[name] = data[name].length;
            } else {
                results[name] = 0;
            }
        }

        console.log('[Backup] Restore completed:', results);
        res.json({ success: true, results, message: 'Database restored successfully' });
    } catch (err) {
        console.error('[Backup] Restore error:', err.message);
        res.status(500).json({ error: 'restore_failed', message: err.message });
    }
});

module.exports = router;
