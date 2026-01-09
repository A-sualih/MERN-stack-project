const Book = require('../models/book');
const HttpError = require('../models/http-error');
const fs = require('fs');

const getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find({});
        res.json({ books });
    } catch (err) {
        return next(new HttpError('Fetching books failed.', 500));
    }
};

const getBookById = async (req, res, next) => {
    const bookId = req.params.bid;
    try {
        const book = await Book.findById(bookId);
        res.json({ book });
    } catch (err) {
        return next(new HttpError('Fetching book failed.', 500));
    }
};

const addBook = async (req, res, next) => {
    const { title, author, description, category } = req.body;
    const createdBook = new Book({
        title,
        author,
        description,
        category,
        pdfUrl: req.file.path,
        uploader: req.userData.userId
    });

    try {
        await createdBook.save();
    } catch (err) {
        return next(new HttpError('Adding book failed.', 500));
    }

    res.status(201).json({ book: createdBook });
};

const deleteBook = async (req, res, next) => {
    const bookId = req.params.bid;
    let book;
    try {
        book = await Book.findById(bookId);
    } catch (err) {
        return next(new HttpError('Deleting book failed.', 500));
    }

    if (!book) {
        return next(new HttpError('Could not find book.', 404));
    }

    const imagePath = book.pdfUrl;

    try {
        await book.deleteOne();
    } catch (err) {
        return next(new HttpError('Removing book failed.', 500));
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({ message: 'Deleted book.' });
};

exports.getAllBooks = getAllBooks;
exports.getBookById = getBookById;
exports.addBook = addBook;
exports.deleteBook = deleteBook;
