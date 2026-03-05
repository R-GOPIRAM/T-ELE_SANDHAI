const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
    // Prevent MongooseError: Cannot overwrite `X` model once compiled.
    mongoose.models = {};
    mongoose.modelSchemas = {};

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongodb.
 */
module.exports.closeDatabase = async () => {
    if (mongoServer) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    }
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
    if (mongoServer) {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
};
