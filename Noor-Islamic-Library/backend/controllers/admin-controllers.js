const HttpError = require('../models/http-error');
const User = require('../models/user');
const Quran = require('../models/quran');
const Hadith = require('../models/hadith');
const LibraryItem = require('../models/library-item');
const Book = require('../models/book');
const Category = require('../models/category');

// Get Dashboard Statistics
const getStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: { $in: ['admin', 'content-admin'] } });
        const quranCount = await Quran.countDocuments();
        const hadithCount = await Hadith.countDocuments();
        const libraryItemCount = await LibraryItem.countDocuments();
        const bookCount = await Book.countDocuments();
        const categoryCount = await Category.countDocuments();

        // Get content analytics
        const allBooks = await Book.find({}, 'views downloads');
        const totalViews = allBooks.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalDownloads = allBooks.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

        // Get category breakdown for library items
        const duasCount = await LibraryItem.countDocuments({ category: 'Duas' });
        const seerahCount = await LibraryItem.countDocuments({ category: 'Seerah' });
        const fiqhCount = await LibraryItem.countDocuments({ category: 'Fiqh' });

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get recently added content (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentBooks = await Book.find({ createdAt: { $gte: thirtyDaysAgo } })
            .limit(5)
            .sort({ createdAt: -1 });

        // Create real activity feed from database
        const latestUsers = await User.find().sort({ createdAt: -1 }).limit(3);
        const latestBooks = await Book.find().sort({ createdAt: -1 }).limit(2);

        const activity = [
            ...latestUsers.map(u => ({
                id: `user-${u._id}`,
                type: 'user',
                desc: `New member joined: ${u.name}`,
                time: u.createdAt,
                timestamp: new Date(u.createdAt).getTime()
            })),
            ...latestBooks.map(b => ({
                id: `book-${b._id}`,
                type: 'book',
                desc: `Asset digitized: "${b.title}" by ${b.author}`,
                time: b.createdAt,
                timestamp: new Date(b.createdAt).getTime()
            }))
        ].sort((a, b) => b.timestamp - a.timestamp);

        // Convert timestamps to human readable strings
        const timeAgo = (date) => {
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            if (seconds < 60) return `${seconds}s ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            return new Date(date).toLocaleDateString();
        };

        const formattedActivity = activity.slice(0, 5).map(act => ({
            ...act,
            time: timeAgo(act.time)
        }));

        res.json({
            stats: {
                users: {
                    total: userCount,
                    admins: adminCount,
                    regular: userCount - adminCount,
                    recent: recentUsers
                },
                content: {
                    surahs: quranCount,
                    hadiths: hadithCount,
                    libraryItems: libraryItemCount,
                    books: bookCount,
                    categories: categoryCount
                },
                analytics: {
                    totalViews,
                    totalDownloads
                },
                libraryBreakdown: {
                    duas: duasCount,
                    seerah: seerahCount,
                    fiqh: fiqhCount
                },
                recentBooks: recentBooks.map(b => b.toObject({ getters: true })),
                activity: formattedActivity
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        const error = new HttpError('Fetching stats failed.', 500);
        return next(error);
    }
};

// Get All Users
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password')
            .sort({ createdAt: -1 });

        res.json({
            users: users.map(user => user.toObject({ getters: true }))
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        const error = new HttpError('Fetching users failed.', 500);
        return next(error);
    }
};

// Update User
const updateUser = async (req, res, next) => {
    const userId = req.params.uid;
    const { name, email, role } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        if (userId === req.userData.userId && role !== 'admin') {
            return next(new HttpError('You cannot change your own admin role.', 403));
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        res.json({
            message: 'User updated successfully.',
            user: user.toObject({ getters: true })
        });
    } catch (err) {
        const error = new HttpError('Updating user failed.', 500);
        return next(error);
    }
};

// Toggle User Active Status
const toggleUserStatus = async (req, res, next) => {
    const userId = req.params.uid;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        if (userId === req.userData.userId) {
            return next(new HttpError('You cannot deactivate yourself.', 403));
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
            isActive: user.isActive
        });
    } catch (err) {
        const error = new HttpError('Toggling user status failed.', 500);
        return next(error);
    }
};

// Toggle User Role
const toggleUserRole = async (req, res, next) => {
    const userId = req.params.uid;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        if (userId === req.userData.userId) {
            return next(new HttpError('You cannot change your own role.', 403));
        }

        user.role = user.role === 'admin' ? 'user' : 'admin';
        await user.save();

        res.json({
            message: `User role changed to ${user.role}.`,
            user: user.toObject({ getters: true })
        });
    } catch (err) {
        const error = new HttpError('Changing user role failed.', 500);
        return next(error);
    }
};

// Delete User
const deleteUser = async (req, res, next) => {
    const userId = req.params.uid;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        if (userId === req.userData.userId) {
            return next(new HttpError('You cannot delete your own account.', 403));
        }

        await User.deleteOne({ _id: userId });

        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        const error = new HttpError('Deleting user failed.', 500);
        return next(error);
    }
};

// Get User by ID
const getUserById = async (req, res, next) => {
    const userId = req.params.uid;

    try {
        const user = await User.findById(userId, '-password');
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        res.json({ user: user.toObject({ getters: true }) });
    } catch (err) {
        const error = new HttpError('Fetching user failed.', 500);
        return next(error);
    }
};

exports.getStats = getStats;
exports.getUsers = getUsers;
exports.updateUser = updateUser;
exports.toggleUserRole = toggleUserRole;
exports.toggleUserStatus = toggleUserStatus;
exports.deleteUser = deleteUser;
exports.getUserById = getUserById;


