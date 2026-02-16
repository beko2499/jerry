const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories (optionally by parentId)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.parentId) {
            filter.parentId = req.query.parentId;
        } else if (req.query.root === 'true') {
            filter.parentId = null;
        }
        const categories = await Category.find(filter).sort({ order: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create category
router.post('/', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update category
router.patch('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete category and all sub-categories
router.delete('/:id', async (req, res) => {
    try {
        // Delete all children recursively
        const deleteRecursive = async (parentId) => {
            const children = await Category.find({ parentId });
            for (const child of children) {
                await deleteRecursive(child._id);
            }
            await Category.deleteMany({ parentId });
        };
        await deleteRecursive(req.params.id);
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
