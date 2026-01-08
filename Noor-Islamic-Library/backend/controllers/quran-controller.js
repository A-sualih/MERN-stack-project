const Quran = require('../models/quran');
const HttpError = require('../models/http-error');

const getAllSurahs = async (req, res, next) => {
    let surahs;
    try {
        surahs = await Quran.find({}, 'surahNumber surahName surahNameArabic');
    } catch (err) {
        return next(new HttpError('Fetching surahs failed, please try again later.', 500));
    }
    res.json({ surahs });
};

const getSurahById = async (req, res, next) => {
    const surahNumber = req.params.sid;
    let surah;
    try {
        surah = await Quran.findOne({ surahNumber: surahNumber });
    } catch (err) {
        return next(new HttpError('Fetching surah failed, please try again later.', 500));
    }

    if (!surah) {
        return next(new HttpError('Could not find surah for the provided number.', 404));
    }

    res.json({ surah });
};

const searchQuran = async (req, res, next) => {
    const keyword = req.query.q;
    let matches;
    try {
        matches = await Quran.find({
            'ayahs.text': { $regex: keyword, $options: 'i' }
        });
    } catch (err) {
        return next(new HttpError('Searching Quran failed, please try again later.', 500));
    }
    res.json({ result: matches });
};

exports.getAllSurahs = getAllSurahs;
exports.getSurahById = getSurahById;
exports.searchQuran = searchQuran;
