const mongoose = require('mongoose');
require('dotenv').config();
const WishlistService = require('./server/services/wishlistService');
const User = require('./server/models/User');
const Product = require('./server/models/Product');
const Wishlist = require('./server/models/Wishlist');

async function testWishlistFix() {
    console.log('🧪 Starting Wishlist Fix Verification...');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get a test user
        const user = await User.findOne();
        if (!user) {
            console.error('❌ No user found for testing');
            return;
        }
        console.log(`👤 Using test user: ${user.email} (${user._id})`);

        // 2. Test getWishlist (mapping check)
        console.log('\n2️⃣  Testing getWishlist mapping...');
        const wishlist = await WishlistService.getWishlist(user._id);
        console.log(`✅ Wishlist fetched. Items count: ${wishlist.items.length}`);

        if (wishlist.items.length > 0) {
            const firstItem = wishlist.items[0];
            console.log('🔍 Checking first item structure:');
            console.log(`   Product ID: ${firstItem.product._id || firstItem.product.id}`);
            console.log(`   Seller Name: ${firstItem.product.sellerName}`);
            console.log(`   Seller ID: ${firstItem.product.sellerId}`);

            if (firstItem.product.sellerName && firstItem.product.sellerId) {
                console.log('✅ Data mapping verified (sellerName/sellerId present)');
            } else {
                console.warn('⚠️  Mapping partially missing. shopOwnerId might not be populated correctly or product might be missing shopOwnerId.');
            }
        } else {
            console.log('ℹ️  Wishlist is empty, skipping detailed mapping check.');
        }

        // 3. Test null handling (simulation)
        console.log('\n3️⃣  Testing _formatWishlist null handling...');
        const mockWishlist = {
            items: [
                { product: null, addedAt: new Date() },
                {
                    product: {
                        _id: 'test_id',
                        name: 'Test Product',
                        shopOwnerId: { _id: 'seller_id', name: 'Seller Name' }
                    }
                }
            ]
        };

        const formatted = WishlistService._formatWishlist(mockWishlist);
        console.log(`✅ Formatted wishlist items: ${formatted.items.length}`);
        if (formatted.items.length === 1 && formatted.items[0].product._id === 'test_id') {
            console.log('✅ Null products filtered successfully');
        } else {
            console.error('❌ Null filtering failed');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🏁 Connection closed.');
    }
}

testWishlistFix();
