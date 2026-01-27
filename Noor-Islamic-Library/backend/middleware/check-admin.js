const HttpError = require('../models/http-error');
const User = require('../models/user');

module.exports = async (req, res, next) => {
    console.log(`[check-admin] Checking admin for user ${req.userData.userId}, role: ${req.userData.role}`);
    try {
        const userId = req.userData.userId;
        const user = await User.findById(userId);

        if (!user) {
            console.log(`[check-admin] Access denied: User ${userId} not found in database.`);
            const error = new HttpError('Admin verification failed: User not found.', 403);
            return next(error);
        }

        if (user.role !== 'admin' && user.role !== 'content-admin') {
            console.log(`[check-admin] Access denied: User ${userId} has role '${user.role}' which is insufficient.`);
            const error = new HttpError('Admin verification failed: Insufficient permissions.', 403);
            return next(error);
        }


        console.log(`[check-admin] Access granted for user ${userId}`);
        next();
    } catch (err) {
        const error = new HttpError('Admin verification failed.', 500);
        return next(error);
    }
};
