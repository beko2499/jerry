const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['instant', 'scheduled'], default: 'instant' },
    audience: { type: String, enum: ['users', 'admin'], default: 'users' },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    status: { type: String, enum: ['pending', 'sent'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
