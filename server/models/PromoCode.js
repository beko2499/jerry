const mongoose = require('mongoose');

function generatePromoCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, default: generatePromoCode },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    // Target specific categories (empty = all categories)
    targetCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    maxUses: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);
