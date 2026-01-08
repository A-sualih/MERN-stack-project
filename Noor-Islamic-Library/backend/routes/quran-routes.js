const express = require('express');
const quranController = require('../controllers/quran-controller');

const router = express.Router();

router.get('/', quranController.getAllSurahs);
router.get('/search', quranController.searchQuran);
router.get('/:sid', quranController.getSurahById);

module.exports = router;
