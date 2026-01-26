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

exports.signup = signup;
exports.login = login;
