const MongoClient = require('mongodb').MongoClient;

const uri = "your_mongo_uri_here";
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout of 5 seconds
    maxPoolSize: 10
};

async function connectWithRetry() {
    let retries = 5;
    while (retries) {
        try {
            const client = await MongoClient.connect(uri, options);
            console.log('Database connected successfully');
            return client;
        } catch (err) {
            console.error('Database connection failed. Retrying in 5 seconds...', err);
            await new Promise(res => setTimeout(res, Math.pow(2, 5 - retries) * 1000)); // Exponential backoff
            retries -= 1;
        }
    }
    throw new Error('Failed to connect to database after multiple retries.');
}

module.exports = connectWithRetry;