const Hadith = require('../models/hadith');
const HttpError = require('../models/http-error');

const getHadithCollections = async (req, res, next) => {
    try {
        const collections = await Hadith.distinct('collection');
        res.json({ collections });
    } catch (err) {
        return next(new HttpError('Fetching collections failed.', 500));
    }
};

const getHadithsByCollection = async (req, res, next) => {
    const collectionName = req.params.collection;
    try {
        const hadiths = await Hadith.find({ collection: collectionName });
        res.json({ hadiths });
    } catch (err) {
        return next(new HttpError('Fetching hadiths failed.', 500));
    }
};

const searchHadiths = async (req, res, next) => {
    const keyword = req.query.q;
    try {
        const matches = await Hadith.find({
            $or: [
                { text: { $regex: keyword, $options: 'i' } },
                { translation: { $regex: keyword, $options: 'i' } }
            ]
        });
        res.json({ result: matches });
    } catch (err) {
        return next(new HttpError('Searching hadiths failed.', 500));
    }
};

exports.getHadithCollections = getHadithCollections;
exports.getHadithsByCollection = getHadithsByCollection;
exports.searchHadiths = searchHadiths;
