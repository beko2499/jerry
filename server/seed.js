const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Settings = require('./models/Settings');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jerry';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
        await User.create({
            username: 'admin',
            firstName: 'Admin',
            lastName: 'Jerry',
            phone: '',
            email: 'admin@jerry.com',
            password: 'admin123',
            role: 'admin',
        });
        console.log('👤 Admin user created (admin / admin123)');
    } else {
        console.log('👤 Admin user already exists');
    }

    // Seed default user
    const userExists = await User.findOne({ username: 'jerry' });
    if (!userExists) {
        await User.create({
            username: 'jerry',
            firstName: 'جيري',
            lastName: 'ادمن',
            phone: '07801234567',
            email: 'jerry@jerry.com',
            password: '1234',
            role: 'user',
        });
        console.log('👤 Default user created (jerry / 1234)');
    } else {
        console.log('👤 Default user already exists');
    }

    // Seed root categories
    const catCount = await Category.countDocuments({ parentId: null });
    if (catCount === 0) {
        const rootCategories = [
            { nameKey: 'jerryServicesCard', name: 'Jerry Services', image: '/jerry-services.png', order: 0 },
            { nameKey: 'cardsSection', name: 'Cards', image: '/cards.png', order: 1 },
            { nameKey: 'gamingSection', name: 'Gaming', image: '/games.png', order: 2 },
            { nameKey: 'subscriptionsSection', name: 'Subscriptions', image: '/subscriptions.png', order: 3 },
            { nameKey: 'phoneTopUp', name: 'Phone Top-Up', image: '', order: 4 },
            { nameKey: 'miscServices', name: 'Misc Services', image: '', order: 5 },
        ];
        await Category.insertMany(rootCategories);
        console.log('📁 Root categories seeded');
    } else {
        console.log('📁 Categories already exist');
    }

    // Seed support settings
    const supportExists = await Settings.findOne({ key: 'support' });
    if (!supportExists) {
        await Settings.create({
            key: 'support',
            value: {
                whatsapp: '07800000000',
                telegram: '@jerry_support',
                email: 'support@jerry.com',
                supportMessage: 'Our support team is available 24/7 to assist you.',
                ticketAutoReply: 'Thank you for your message. We will get back to you shortly.'
            }
        });
        console.log('⚙️ Support settings seeded');
    } else {
        console.log('⚙️ Support settings already exist');
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
