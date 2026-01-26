const express = require('express');
const adminControllers = require('../controllers/admin-controllers');
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');

const router = express.Router();

router.use(checkAuth);
router.use(checkAdmin);

router.get('/stats', adminControllers.getStats);
router.get('/users', adminControllers.getUsers);
router.delete('/users/:uid', adminControllers.deleteUser);

module.exports = router;
