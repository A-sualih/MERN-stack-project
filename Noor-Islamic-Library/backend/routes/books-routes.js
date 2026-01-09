const express = require('express');
const booksController = require('../controllers/books-controller');
const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', booksController.getAllBooks);
router.get('/:bid', booksController.getBookById);

router.use(checkAuth); // Protect following routes

router.post('/', fileUpload.single('pdf'), booksController.addBook);
router.delete('/:bid', booksController.deleteBook);

module.exports = router;
