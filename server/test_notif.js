require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    // Create a test notification
    const n = new Notification({
        title: 'اختبار',
        body: 'هذا اشعار تجريبي',
        type: 'instant',
        status: 'sent',
        sentAt: new Date(),
    });
    await n.save();
    console.log('Created:', n);

    // Read back
    const all = await Notification.find();
    console.log('Total notifications:', all.length);
    process.exit();
});
