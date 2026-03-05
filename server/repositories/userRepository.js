const User = require('../models/User');

class UserRepository {
    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({ email }).select('+password');
    }

    async findById(id) {
        return await User.findById(id);
    }

    async findByIdAndSelectPassword(id) {
        return await User.findById(id).select('+password +refreshToken');
    }

    async updateRefreshToken(userId, refreshToken) {
        return await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
    }

    async clearRefreshToken(userId) {
        return await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
    }

    async updateUser(userId, updateData) {
        return await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        });
    }
}

module.exports = new UserRepository();
