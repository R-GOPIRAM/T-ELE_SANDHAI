const http = require('http');
const app = require('./server');
const logger = require('./utils/logger');
const socket = require('./socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const initShipmentSyncJob = require('./jobs/shipmentSyncJob');

// Initialize Socket.io
socket.init(server);

// Initialize Background Jobs
initShipmentSyncJob();

server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
