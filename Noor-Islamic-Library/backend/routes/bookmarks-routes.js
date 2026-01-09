const express = require('express');
const bookmarksController = require('../controllers/bookmarks-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/', bookmarksController.getBookmarksByUser);
router.post('/', bookmarksController.addBookmark);
router.delete('/:bid', bookmarksController.removeBookmark);

module.exports = router;
