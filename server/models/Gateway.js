const mongoose = require('mongoose');

const gatewaySchema = new mongoose.Schema({
    type: { type: String, enum: ['auto', 'manual'], required: true },
    name: { type: String, required: true },
    nameAr: { type: String, default: '' },
    isEnabled: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: false },
    destination: { type: String, default: '' },
    instructionText: { type: String, default: '' },
    instructionTextAr: { type: String, default: '' },
    image: { type: String, default: '' },
    // Manual gateway fields
    accountNumber: { type: String, default: '' },
    contactType: { type: String, enum: ['whatsapp', 'telegram', ''], default: '' },
    contactValue: { type: String, default: '' },
    // Auto gateway fields
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' },
    mode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Gateway', gatewaySchema);
