const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedImg = /jpeg|jpg|png|gif|webp|svg/;
        const allowedVid = /mp4|webm|mov/;
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        const isImage = allowedImg.test(ext) && allowedImg.test(file.mimetype);
        const isVideo = allowedVid.test(ext) || file.mimetype.startsWith('video/');
        if (isImage || isVideo) return cb(null, true);
        cb(new Error('Only image and video files are allowed'));
    }
});

// POST /api/upload — upload single image
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

module.exports = router;
