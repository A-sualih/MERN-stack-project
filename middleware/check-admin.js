const HttpError = require("../models/http-error");
const User = require("../models/user");

module.exports = async (req, res, next) => {
    try {
        // req.userData is set by check-auth middleware
        const userId = req.userData.userId;
        const user = await User.findById(userId);

        if (!user || !user.isAdmin) {
            const error = new HttpError("You are not authorized to access this resource.", 403);
            return next(error);
        }

        next();
    } catch (err) {
        const error = new HttpError("Admin verification failed.", 500);
        return next(error);
    }
};
