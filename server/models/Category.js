const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    nameKey: { type: String, default: '' },
    name: { type: String, default: '' },
    image: { type: String, default: '' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
