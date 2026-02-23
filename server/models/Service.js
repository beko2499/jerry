const mongoose = require('mongoose');

// Counter schema for auto-increment
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const serviceSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    min: { type: Number, default: 100 },
    max: { type: Number, default: 10000 },
    description: { type: String, default: '' },
    providerId: { type: String, default: '' },
    providerServiceId: { type: String, default: '' },  // Provider's service ID (sent to provider when ordering)
    serviceNumber: { type: Number, unique: true, sparse: true },  // Our sequential ID (shown to users)
    // Legacy field — kept for backward compatibility during migration
    autoId: { type: String, default: '' },
    speed: { type: String, default: '' },
    dropRate: { type: String, default: '' },
    guarantee: { type: String, default: '' },
    startTime: { type: String, default: '' },
}, { timestamps: true });

// Auto-assign serviceNumber before saving
serviceSchema.pre('save', async function (next) {
    if (!this.serviceNumber) {
        const counter = await Counter.findByIdAndUpdate(
            'serviceNumber',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.serviceNumber = counter.seq;
    }
    // Migrate: if autoId exists but providerServiceId is empty, copy it
    if (this.autoId && !this.providerServiceId) {
        this.providerServiceId = this.autoId;
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);
