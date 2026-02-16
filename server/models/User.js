const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, required: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
