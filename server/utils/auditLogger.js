/**
 * Simple Audit Logger to track important security events.
 * In production this would write to a formal log aggregator (ELK, Datadog) or DB schema.
 */
class AuditLogger {
    static logEvent(eventType, userId, metadata = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            eventType,
            userId: userId || 'system',
            ...metadata
        };

        // For current scope, we log securely to stdout where Cloudwatch/etc will catch it
        console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
    }

    static logLoginSuccess(userId, role, ip) {
        this.logEvent('LOGIN_SUCCESS', userId, { role, ip });
    }

    static logLoginFailed(email, ip, reason) {
        this.logEvent('LOGIN_FAILED', null, { email, ip, reason });
    }

    static logSellerApproval(sellerId, adminId, status) {
        this.logEvent('SELLER_APPROVAL_UPDATE', adminId, { sellerId, status });
    }

    static logAdminAction(adminId, actionStr, targetId) {
        this.logEvent('ADMIN_ACTION', adminId, { action: actionStr, target: targetId });
    }
}

module.exports = AuditLogger;
