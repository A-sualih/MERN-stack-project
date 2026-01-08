const Note = require('../models/note');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');

const getNotesByUser = async (req, res, next) => {
    const userId = req.userData.userId;
    try {
        const notes = await Note.find({ creator: userId });
        res.json({ notes });
    } catch (err) {
        return next(new HttpError('Fetching notes failed.', 500));
    }
};

const createNote = async (req, res, next) => {
    const { content, contentType, contentId } = req.body;
    const createdNote = new Note({
        content,
        contentType,
        contentId,
        creator: req.userData.userId
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdNote.save({ session: sess });
        const user = await User.findById(req.userData.userId);
        user.notes.push(createdNote);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Creating note failed.', 500));
    }

    res.status(201).json({ note: createdNote });
};

const deleteNote = async (req, res, next) => {
    const noteId = req.params.nid;
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        const note = await Note.findById(noteId).populate('creator');
        if (!note || note.creator.id !== req.userData.userId) {
            return next(new HttpError('Could not find note or unauthorized.', 401));
        }
        await note.deleteOne({ session: sess });
        note.creator.notes.pull(note);
        await note.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Deleting note failed.', 500));
    }
    res.status(200).json({ message: 'Deleted note.' });
};

exports.getNotesByUser = getNotesByUser;
exports.createNote = createNote;
exports.deleteNote = deleteNote;
