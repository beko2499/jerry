require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./models/Settings');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const s = await Settings.findOne({ key: 'emailVerification' });
    console.log('Raw setting:', s);
    console.log('Value:', s ? s.value : 'NOT FOUND');
    console.log('Type:', s ? typeof s.value : 'N/A');
    process.exit();
});
