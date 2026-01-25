const express = require('express');
const notesController = require('../controllers/notes-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/', notesController.getNotesByUser);
router.post('/', notesController.createNote);
router.delete('/:nid', notesController.deleteNote);

module.exports = router;
