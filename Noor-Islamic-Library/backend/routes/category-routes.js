const express = require('express');
const categoryControllers = require('../controllers/category-controllers');
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');

const router = express.Router();

router.get('/', categoryControllers.getCategories);

router.use(checkAuth);
router.use(checkAdmin);

router.post('/', categoryControllers.createCategory);
router.patch('/:cid', categoryControllers.updateCategory);
router.delete('/:cid', categoryControllers.deleteCategory);

module.exports = router;
