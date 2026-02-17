const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['recharge', 'order', 'refund'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: '' }, // crypto, asiacell, manual
    paymentId: { type: String, default: '' },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
