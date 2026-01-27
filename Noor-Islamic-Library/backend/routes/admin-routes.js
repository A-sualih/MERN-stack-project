const express = require('express');
const adminControllers = require('../controllers/admin-controllers');
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');

const router = express.Router();

router.use(checkAuth);
router.use(checkAdmin);

// Dashboard stats
router.get('/stats', adminControllers.getStats);

// User management
router.get('/users', adminControllers.getUsers);
router.get('/users/:uid', adminControllers.getUserById);
router.patch('/users/:uid', adminControllers.updateUser);
router.patch('/users/:uid/toggle-role', adminControllers.toggleUserRole);
router.delete('/users/:uid', adminControllers.deleteUser);

module.exports = router;

