const express = require('express');
const booksController = require('../controllers/books-controller');
const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', booksController.getAllBooks);
router.get('/:bid', booksController.getBookById);

router.use(checkAuth); // Protect following routes

router.post(
    '/',
    fileUpload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: 'epub', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    booksController.addBook
);

router.patch(
    '/:bid',
    fileUpload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: 'epub', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    booksController.updateBook
);

router.delete('/:bid', booksController.deleteBook);

module.exports = router;

