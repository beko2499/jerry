const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    adminReply: { type: String, default: '' },
    repliedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
