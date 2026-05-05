const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const logger = require('./utils/logger');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    // JWT Authentication Middleware for Socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            logger.error('Socket Authentication Error:', err);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    const bargainSocket = require('./sockets/bargainSocket');

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.name} (${socket.id})`);

        // Initialize bargain socket logic
        bargainSocket(io, socket);

        // Join seller room if user is a seller
        if (socket.user.role === 'seller') {
            const sellerRoom = `seller_${socket.user._id}`;
            socket.join(sellerRoom);
            logger.info(`Seller joined room: ${sellerRoom}`);
        }

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { init, getIo };
