const HttpError = require('../models/http-error');
const User = require('../models/user');
const Book = require('../models/book'); // Assuming Book model exists
const Hadith = require('../models/hadith'); // Assuming Hadith model exists

const getStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        // You can add more stats here as needed
        // const bookCount = await Book.countDocuments();
        // const hadithCount = await Hadith.countDocuments();

        res.json({
            stats: {
                users: userCount,
                // books: bookCount,
                // hadiths: hadithCount
            }
        });
    } catch (err) {
        const error = new HttpError('Fetching stats failed.', 500);
        return next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password').sort({ _id: -1 }); // Newest first
        res.json({ users: users.map(user => user.toObject({ getters: true })) });
    } catch (err) {
        const error = new HttpError('Fetching users failed.', 500);
        return next(error);
    }
};

const deleteUser = async (req, res, next) => {
    const userId = req.params.uid;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }
        await User.deleteOne({ _id: userId });
        res.json({ message: 'User deleted.' });
    } catch (err) {
        const error = new HttpError('Deleting user failed.', 500);
        return next(error);
    }
};

exports.getStats = getStats;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
