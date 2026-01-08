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

const getAyahsByPage = async (req, res, next) => {
    const pageNumber = parseInt(req.params.page);
    let pages;
    try {
        // We search across all surahs for ayahs that belong to this page
        pages = await Quran.find({ 'ayahs.page': pageNumber });

        // Flatten and filter the results to only include ayahs for this page
        let resultAyahs = [];
        pages.forEach(surah => {
            const filtered = surah.ayahs.filter(a => a.page === pageNumber);
            resultAyahs.push(...filtered.map(a => ({
                ...a.toObject(),
                surahName: surah.surahName,
                surahNameArabic: surah.surahNameArabic,
                surahNumber: surah.surahNumber
            })));
        });

        res.json({ ayahs: resultAyahs });
    } catch (err) {
        return next(new HttpError('Fetching page failed, please try again later.', 500));
    }
};

exports.getAllSurahs = getAllSurahs;
exports.getSurahById = getSurahById;
exports.searchQuran = searchQuran;
exports.getAyahsByPage = getAyahsByPage;
