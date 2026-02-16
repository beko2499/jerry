const mongoose = require('mongoose');

const gatewaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    isEnabled: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: false },
    destination: { type: String, default: '' },
    instructionText: { type: String, default: '' },
    image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Gateway', gatewaySchema);
