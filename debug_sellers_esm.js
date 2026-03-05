import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// Define simple schemas strictly for validation (avoiding import issues with model files if they have deps)
const userSchema = new mongoose.Schema({ name: String, email: String, role: String });
const sellerSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    businessName: String,
    verificationStatus: String
});

const User = mongoose.model('User', userSchema, 'users');
const Seller = mongoose.model('Seller', sellerSchema, 'sellers');

const debugData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is undefined. Check .env path.');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

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
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
};

debugData();
