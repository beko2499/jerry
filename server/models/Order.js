const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: String, default: '' },
    serviceName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    link: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled', 'partial'], default: 'pending' },
    providerId: { type: String, default: '' },
    externalOrderId: { type: String, default: '' },
    providerCharge: { type: Number, default: 0 },
    providerStatus: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
