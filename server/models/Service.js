const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    min: { type: Number, default: 100 },
    max: { type: Number, default: 10000 },
    description: { type: String, default: '' },
    providerId: { type: String, default: '' },
    autoId: { type: String, default: '' },
    speed: { type: String, default: '' },
    dropRate: { type: String, default: '' },
    guarantee: { type: String, default: '' },
    startTime: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
