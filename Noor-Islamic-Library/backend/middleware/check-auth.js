const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    console.log(`[check-auth] Checking auth for ${req.method} ${req.originalUrl}`);
    try {
        if (!req.headers.authorization) {
            console.log(`[check-auth] No Authorization header for ${req.method} ${req.url}`);
            const error = new HttpError('Authentication failed: No token provided!', 401);
            return next(error);
        }
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'

        if (!token || token === 'null' || token === 'undefined') {
            console.log(`[check-auth] Missing or invalid token string ('${token}') for ${req.method} ${req.url}`);
            const error = new HttpError('Authentication failed: Invalid token!', 401);
            return next(error);
        }

        if (!process.env.JWT_KEY) {
            console.error('[check-auth] ERROR: JWT_KEY is not defined in environment variables!');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodedToken.userId, role: decodedToken.role };
        console.log(`[check-auth] Auth successful for user ${decodedToken.userId} (${decodedToken.role})`);
        next();
    } catch (err) {
        console.log(`[check-auth] JWT Verification failed: ${err.message}`);
        const error = new HttpError('Authentication failed: ' + err.message, 403);
        return next(error);
    }
};
