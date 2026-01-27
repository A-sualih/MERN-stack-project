const HttpError = require('../models/http-error');
const Category = require('../models/category');

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.json({ categories: categories.map(cat => cat.toObject({ getters: true })) });
    } catch (err) {
        const error = new HttpError('Fetching categories failed.', 500);
        return next(error);
    }
};

const createCategory = async (req, res, next) => {
    const { name, description, icon, type } = req.body;

    const createdCategory = new Category({
        name,
        description,
        icon,
        type: type || 'Book'
    });

    try {
        await createdCategory.save();
    } catch (err) {
        const error = new HttpError('Creating category failed.', 500);
        return next(error);
    }

    res.status(201).json({ category: createdCategory });
};

const updateCategory = async (req, res, next) => {
    const { name, description, icon, type } = req.body;
    const categoryId = req.params.cid;

    let category;
    try {
        category = await Category.findById(categoryId);
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update category.', 500));
    }

    if (!category) {
        return next(new HttpError('Could not find category for this id.', 404));
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    category.type = type || category.type;

    try {
        await category.save();
    } catch (err) {
        return next(new HttpError('Updating category failed.', 500));
    }

    res.status(200).json({ category: category.toObject({ getters: true }) });
};

const deleteCategory = async (req, res, next) => {
    const categoryId = req.params.cid;

    try {
        await Category.findByIdAndDelete(categoryId);
    } catch (err) {
        return next(new HttpError('Deleting category failed.', 500));
    }

    res.status(200).json({ message: 'Deleted category.' });
};

exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
