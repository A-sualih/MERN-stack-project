const express = require('express');
const hadithController = require('../controllers/hadith-controller');

const router = express.Router();

router.get('/collections', hadithController.getHadithCollections);
router.get('/search', hadithController.searchHadiths);
router.get('/:collection', hadithController.getHadithsByCollection);

module.exports = router;
