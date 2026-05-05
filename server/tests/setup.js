const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
    // Prevent MongooseError: Cannot overwrite `X` model once compiled.
    mongoose.models = {};
    mongoose.modelSchemas = {};

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
};

const clearDatabase = async () => {
    if (mongoServer) {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
};

const closeDatabase = async () => {
    if (!mongoServer) return;
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    mongoServer = undefined;
};

module.exports = { connect, clearDatabase, closeDatabase };
