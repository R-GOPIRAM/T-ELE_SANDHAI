import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const userSchema = new mongoose.Schema({ name: String, email: String, role: String });
const sellerSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId });

const User = mongoose.model('User', userSchema, 'users');
const Seller = mongoose.model('Seller', sellerSchema, 'sellers');

const fixStuckSellers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find all users with role 'seller'
        const sellerUsers = await User.find({ role: 'seller' });
        console.log(`Found ${sellerUsers.length} users with role 'seller'.`);

        let fixedCount = 0;
        for (const user of sellerUsers) {
            // Check if they have a profile
            const profile = await Seller.findOne({ userId: user._id });
            if (!profile) {
                console.log(`User ${user.email} (${user.name}) is 'seller' but has NO profile. Resetting to 'customer'.`);
                user.role = 'customer';
                await user.save();
                fixedCount++;
            } else {
                console.log(`User ${user.email} is valid seller.`);
            }
        }

        console.log(`\nFixed ${fixedCount} stuck users.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
};

fixStuckSellers();
