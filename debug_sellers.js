const mongoose = require('mongoose');
const User = require('./server/models/User');
const Seller = require('./server/models/Seller');
require('dotenv').config({ path: './server/.env' }); // Adjust path if needed

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const debugData = async () => {
    await connectDB();

    console.log('\n--- ALL USERS ---');
    const users = await User.find({});
    users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));

    console.log('\n--- ALL SELLERS ---');
    const sellers = await Seller.find({});
    if (sellers.length === 0) {
        console.log('No sellers found in DB.');
    } else {
        sellers.forEach(s => console.log(`ID: ${s._id}, Business: ${s.businessName}, UserID: ${s.userId}, Status: ${s.verificationStatus}`));
    }

    mongoose.connection.close();
};

debugData();
