/**
 * Migration script: assign serviceNumber to existing services
 * and copy autoId → providerServiceId
 * 
 * Run once on the server: node server/migrate-services.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jerry';

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const services = db.collection('services');
    const counters = db.collection('counters');

    // Get all services sorted by creation date
    const allServices = await services.find().sort({ createdAt: 1 }).toArray();
    console.log(`Found ${allServices.length} services to migrate`);

    let seq = 0;
    for (const svc of allServices) {
        seq++;
        const update = {
            serviceNumber: seq,
        };
        // Copy autoId to providerServiceId if not already set
        if (svc.autoId && !svc.providerServiceId) {
            update.providerServiceId = svc.autoId;
        }
        await services.updateOne({ _id: svc._id }, { $set: update });
        console.log(`  #${seq} → ${svc.name} (providerServiceId: ${update.providerServiceId || svc.providerServiceId || 'none'})`);
    }

    // Set counter to current max
    await counters.updateOne(
        { _id: 'serviceNumber' },
        { $set: { seq } },
        { upsert: true }
    );

    console.log(`\nDone! Migrated ${seq} services. Counter set to ${seq}.`);
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
