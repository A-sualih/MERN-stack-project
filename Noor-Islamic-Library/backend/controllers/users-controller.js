const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup = async (req, res, next) => {
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500));
    }

    if (existingUser) {
        return next(new HttpError('User exists already, please login instead.', 422));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        bookmarks: [],
        notes: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again.', 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email, role: createdUser.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again.', 500));
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, role: createdUser.role, token: token });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500));
    }

    if (!existingUser) {
        return next(new HttpError('Invalid credentials, could not log you in.', 403));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError('Could not log you in, please check your credentials and try again.', 500));
    }

    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in.', 403));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again.', 500));
    }

    res.json({ userId: existingUser.id, email: existingUser.email, role: existingUser.role, token: token });
};

const getProfile = async (req, res, next) => {
    const userId = req.params.uid;

    let user;
    try {
        user = await User.findById(userId, '-password');
    } catch (err) {
        return next(new HttpError('Fetching profile failed, please try again later.', 500));
    }

    if (!user) {
        return next(new HttpError('Could not find user for the provided id.', 404));
    }

    res.json({ user: user.toObject({ getters: true }) });
};

const updateProfile = async (req, res, next) => {
    const userId = req.params.uid;
    const {
        name,
        dateOfBirth,
        country,
        streetAddress,
        aptSuite,
        city,
        stateProvince,
        zipPostalCode,
        phone
    } = req.body;

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return next(new HttpError('Updating profile failed, please try again later.', 500));
    }

    if (!user) {
        return next(new HttpError('Could not find user for this id.', 404));
    }

    if (user.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this profile.', 401));
    }

    user.name = name || user.name;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.country = country || user.country;
    user.streetAddress = streetAddress || user.streetAddress;
    user.aptSuite = aptSuite || user.aptSuite;
    user.city = city || user.city;
    user.stateProvince = stateProvince || user.stateProvince;
    user.zipPostalCode = zipPostalCode || user.zipPostalCode;
    user.phone = phone || user.phone;

    try {
        await user.save();
    } catch (err) {
        return next(new HttpError('Updating profile failed, please try again.', 500));
    }

    res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.signup = signup;
exports.login = login;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
