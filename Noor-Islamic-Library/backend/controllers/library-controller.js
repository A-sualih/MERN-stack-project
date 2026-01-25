const LibraryItem = require('../models/library-item');
const HttpError = require('../models/http-error');

const getItemsByCategory = async (req, res, next) => {
    const category = req.params.category;
    try {
        const items = await LibraryItem.find({ category: category });
        res.json({ items });
    } catch (err) {
        return next(new HttpError('Fetching items failed.', 500));
    }
};

const getItemById = async (req, res, next) => {
    const itemId = req.params.iid;
    try {
        const item = await LibraryItem.findById(itemId);
        res.json({ item });
    } catch (err) {
        return next(new HttpError('Fetching item failed.', 500));
    }
};

const addItem = async (req, res, next) => {
    if (req.userData.role !== 'admin') {
        return next(new HttpError('Not authorized.', 403));
    }

    const { category, title, subTopic, arabicText, translation, explanation, reference } = req.body;
    const createdItem = new LibraryItem({
        category,
        title,
        subTopic,
        arabicText,
        translation,
        explanation,
        reference
    });

    try {
        await createdItem.save();
    } catch (err) {
        return next(new HttpError('Adding item failed.', 500));
    }
    res.status(201).json({ item: createdItem });
};

const searchItems = async (req, res, next) => {
    const keyword = req.query.q;
    try {
        const matches = await LibraryItem.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { explanation: { $regex: keyword, $options: 'i' } },
                { translation: { $regex: keyword, $options: 'i' } }
            ]
        });
        res.json({ result: matches });
    } catch (err) {
        return next(new HttpError('Searching failed.', 500));
    }
};

exports.getItemsByCategory = getItemsByCategory;
exports.getItemById = getItemById;
exports.addItem = addItem;
exports.searchItems = searchItems;
