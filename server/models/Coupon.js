const mongoose = require('mongoose');

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, default: generateCode },
    amount: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    usedAt: { type: Date, default: null },
    note: { type: String, default: '' },
}, { timestamps: true });

couponSchema.statics.generateCode = generateCode;

module.exports = mongoose.model('Coupon', couponSchema);
