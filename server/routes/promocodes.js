const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Admin: Get all promo codes
router.get('/', requireAdmin, async (req, res) => {
    try {
        const promos = await PromoCode.find().sort({ createdAt: -1 }).populate('targetCategories', 'name nameKey');
        res.json(promos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Create promo code
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { code, discountPercent, targetCategories, maxUses, expiresAt, note } = req.body;
        if (!discountPercent || discountPercent <= 0 || discountPercent > 100) {
            return res.status(400).json({ error: 'Discount must be between 1 and 100' });
        }
        const promo = new PromoCode({
            code: code || undefined,
            discountPercent,
            targetCategories: targetCategories || [],
            maxUses: maxUses || 0,
            expiresAt: expiresAt || null,
            note: note || '',
        });
        await promo.save();
        const populated = await PromoCode.findById(promo._id).populate('targetCategories', 'name nameKey');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update promo code
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('targetCategories', 'name nameKey');
        if (!promo) return res.status(404).json({ error: 'Not found' });
        res.json(promo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete promo code
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User: Validate promo code (check if valid for a category)
router.post('/validate', requireAuth, async (req, res) => {
    try {
        const { code, categoryId, userId } = req.body;
        if (!code) return res.status(400).json({ error: 'Code required' });

        const promo = await PromoCode.findOne({ code: code.toUpperCase().trim(), isActive: true });
        if (!promo) return res.status(404).json({ error: 'invalid_code' });

        // Check expiry
        if (promo.expiresAt && new Date() > promo.expiresAt) {
            return res.status(400).json({ error: 'expired' });
        }

        // Check max uses
        if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ error: 'max_uses_reached' });
        }

        // Check if user already used it
        if (userId && promo.usedBy.includes(userId)) {
            return res.status(400).json({ error: 'already_used' });
        }

        // Check category targeting
        if (promo.targetCategories.length > 0 && categoryId) {
            if (!promo.targetCategories.map(c => c.toString()).includes(categoryId)) {
                return res.status(400).json({ error: 'not_applicable' });
            }
        }

        res.json({
            valid: true,
            discountPercent: promo.discountPercent,
            code: promo.code,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
