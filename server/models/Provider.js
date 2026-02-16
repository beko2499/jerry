const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    balance: { type: String, default: '$0.00' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
