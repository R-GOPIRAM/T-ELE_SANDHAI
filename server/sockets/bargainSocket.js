const bargainService = require('../services/bargainService');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
    // Join a specific bargain room
    socket.on('join_bargain', (bargainId) => {
        socket.join(`bargain_${bargainId}`);
        logger.info(`Socket ${socket.id} joined bargain room: bargain_${bargainId}`);
    });

    // Handle sending a new offer/message
    socket.on('send_offer', async (data) => {
        try {
            const { bargainId, message, offeredPrice } = data;
            
            // Add message using existing service logic
            const updatedBargain = await bargainService.addMessage(
                socket.user.id,
                socket.user.role,
                { bargainId, message, offeredPrice }
            );

            // Broadcast the update to the room
            io.to(`bargain_${bargainId}`).emit('offer_updated', updatedBargain);
            
            logger.info(`Offer updated for bargain ${bargainId} by ${socket.user.name}`);
        } catch (err) {
            logger.error('Socket send_offer error:', err);
            socket.emit('error', { message: err.message || 'Failed to send offer' });
        }
    });

    // Handle status updates (accept/reject)
    socket.on('update_bargain_status', async (data) => {
        try {
            const { bargainId, status } = data;
            
            // Update status using existing service logic
            const updatedBargain = await bargainService.updateStatus(
                socket.user.id,
                socket.user.role,
                { bargainId, status }
            );

            // Broadcast the update to the room
            io.to(`bargain_${bargainId}`).emit('status_updated', updatedBargain);
            
            logger.info(`Status updated for bargain ${bargainId} to ${status} by ${socket.user.name}`);
        } catch (err) {
            logger.error('Socket update_bargain_status error:', err);
            socket.emit('error', { message: err.message || 'Failed to update status' });
        }
    });

    // Handle leaving a room
    socket.on('leave_bargain', (bargainId) => {
        socket.leave(`bargain_${bargainId}`);
        logger.info(`Socket ${socket.id} left bargain room: bargain_${bargainId}`);
    });
};
