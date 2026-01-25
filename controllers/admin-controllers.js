const HttpError = require("../models/http-error");
const User = require("../models/user");
const Place = require("../models/place");

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, "-password"); // Exclude password
    } catch (err) {
        const error = new HttpError("Fetching users failed, please try again later.", 500);
        return next(error);
    }
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        const placeCount = await Place.countDocuments();
        res.json({
            stats: {
                users: userCount,
                places: placeCount,
            },
        });
    } catch (err) {
        const error = new HttpError("Fetching stats failed, please try again later.", 500);
        return next(error);
    }
};

const deleteUser = async (req, res, next) => {
    const userId = req.params.uid;
    let user;
    try {
        user = await User.findById(userId).populate("places");
    } catch (err) {
        const error = new HttpError("Something went wrong, could not delete user.", 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError("Could not find user for this id.", 404);
        return next(error);
    }

    try {
        // Delete all places created by the user
        // Note: In a real app, you might want a session/transaction here.
        if (user.places && user.places.length > 0) {
            await Place.deleteMany({ creator: userId });
        }

        await user.deleteOne();

        // Also remove the image file if possible using fs.unlink
        // omitting for simplicity as file deletion logic is centralized elsewhere usually
    } catch (err) {
        const error = new HttpError("Something went wrong, could not delete user.", 500);
        return next(error);
    }

    res.status(200).json({ message: "User deleted." });
};

exports.getUsers = getUsers;
exports.getStats = getStats;
exports.deleteUser = deleteUser;
