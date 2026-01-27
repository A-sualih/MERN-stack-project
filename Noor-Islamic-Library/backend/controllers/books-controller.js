const fs = require('fs');
const HttpError = require('../models/http-error');
const Book = require('../models/book');

const getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find().populate('uploader', 'name');
        res.json({ books: books.map(book => book.toObject({ getters: true })) });
    } catch (err) {
        const error = new HttpError('Fetching books failed.', 500);
        return next(error);
    }
};

const getBookById = async (req, res, next) => {
    const bookId = req.params.bid;
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return next(new HttpError('Book not found.', 404));
        }
        res.json({ book: book.toObject({ getters: true }) });
    } catch (err) {
        const error = new HttpError('Fetching book failed.', 500);
        return next(error);
    }
};

const addBook = async (req, res, next) => {
    const { title, author, description, category, language } = req.body;

    const createdBook = new Book({
        title,
        author,
        description,
        category,
        language,
        pdfUrl: req.files && req.files['pdf'] ? req.files['pdf'][0].path.replace(/\\/g, '/') : null,
        epubUrl: req.files && req.files['epub'] ? req.files['epub'][0].path.replace(/\\/g, '/') : null,
        coverImage: req.files && req.files['image'] ? req.files['image'][0].path.replace(/\\/g, '/') : null,
        uploader: req.userData.userId
    });

    try {
        await createdBook.save();
    } catch (err) {
        console.error('[addBook] ERROR:', err.message);
        const error = new HttpError('Creating book failed: ' + err.message, 500);
        return next(error);
    }

    res.status(201).json({ book: createdBook });
};

const updateBook = async (req, res, next) => {
    const { title, author, description, category, language } = req.body;
    const bookId = req.params.bid;

    let book;
    try {
        book = await Book.findById(bookId);
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update book.', 500));
    }

    if (!book) {
        return next(new HttpError('Could not find book for this id.', 404));
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.category = category || book.category;
    book.language = language || book.language;

    if (req.files) {
        if (req.files['pdf']) book.pdfUrl = req.files['pdf'][0].path.replace(/\\/g, '/');
        if (req.files['epub']) book.epubUrl = req.files['epub'][0].path.replace(/\\/g, '/');
        if (req.files['image']) book.coverImage = req.files['image'][0].path.replace(/\\/g, '/');
    }

    try {
        await book.save();
    } catch (err) {
        return next(new HttpError('Updating book failed.', 500));
    }

    res.status(200).json({ book: book.toObject({ getters: true }) });
};

const deleteBook = async (req, res, next) => {
    const bookId = req.params.bid;

    let book;
    try {
        book = await Book.findById(bookId);
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete book.', 500));
    }

    if (!book) {
        return next(new HttpError('Could not find book for this id.', 404));
    }

    try {
        // Delete files from server
        if (book.pdfUrl && fs.existsSync(book.pdfUrl)) fs.unlinkSync(book.pdfUrl);
        if (book.epubUrl && fs.existsSync(book.epubUrl)) fs.unlinkSync(book.epubUrl);
        if (book.coverImage && fs.existsSync(book.coverImage)) fs.unlinkSync(book.coverImage);

        await Book.deleteOne({ _id: bookId });
    } catch (err) {
        return next(new HttpError('Deleting book failed.', 500));
    }

    res.status(200).json({ message: 'Deleted book.' });
};

exports.getAllBooks = getAllBooks;
exports.getBookById = getBookById;
exports.addBook = addBook;
exports.updateBook = updateBook;
exports.deleteBook = deleteBook;

