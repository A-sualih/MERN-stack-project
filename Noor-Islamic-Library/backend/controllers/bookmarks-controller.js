const Bookmark = require('../models/bookmark');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');

const getBookmarksByUser = async (req, res, next) => {
    const userId = req.userData.userId;
    try {
        const bookmarks = await Bookmark.find({ creator: userId });
        res.json({ bookmarks });
    } catch (err) {
        return next(new HttpError('Fetching bookmarks failed.', 500));
    }
};

const addBookmark = async (req, res, next) => {
    const { contentType, contentId, title } = req.body;
    const createdBookmark = new Bookmark({
        contentType,
        contentId,
        title,
        creator: req.userData.userId
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdBookmark.save({ session: sess });
        const user = await User.findById(req.userData.userId);
        user.bookmarks.push(createdBookmark);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Adding bookmark failed.', 500));
    }

    res.status(201).json({ bookmark: createdBookmark });
};

const removeBookmark = async (req, res, next) => {
    const bookmarkId = req.params.bid;
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        const bookmark = await Bookmark.findById(bookmarkId).populate('creator');
        if (!bookmark || bookmark.creator.id !== req.userData.userId) {
            return next(new HttpError('Could not find bookmark or unauthorized.', 401));
        }
        await bookmark.deleteOne({ session: sess });
        bookmark.creator.bookmarks.pull(bookmark);
        await bookmark.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Removing bookmark failed.', 500));
    }
    res.status(200).json({ message: 'Removed bookmark.' });
};

exports.getBookmarksByUser = getBookmarksByUser;
exports.addBookmark = addBookmark;
exports.removeBookmark = removeBookmark;
