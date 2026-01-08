const express = require('express');
const libraryController = require('../controllers/library-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/category/:category', libraryController.getItemsByCategory);
router.get('/search', libraryController.searchItems);
router.get('/:iid', libraryController.getItemById);

router.use(checkAuth);
router.post('/', libraryController.addItem);

module.exports = router;
