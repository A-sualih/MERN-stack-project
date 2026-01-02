const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const HttpError = require("../models/http-error");
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    console.error(err);
    const error = new HttpError("Signing Up failed", 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
      });
    }
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
      });
    }
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  // 🔴 THIS WAS MISSING
  if (existingUser) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
      });
    }
    return next(
      new HttpError("Could not create user, email already exists.", 422)
    );
  }
  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.error(err);
    const error = new HttpError("Couldnot create user, please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashPassword,
    image: req.file
      ? req.file.path
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ88MFE2yUrzlrY7Lmh0uWLi6hnt3mHRTMqIg&s",
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
      });
    }
    return next(new HttpError("Sign up failed, please try again.", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { useId: createdUser.id, email: createdUser.email },
 process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.error(err);
    const error = new HttpError("Couldnot create user, please try again", 500);
    return next(error);
  }
  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    console.error(err);
    const error = new HttpError("Logged Up failed", 500);
    return next(error);
  }
  // const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser) {
    const error = new HttpError(
      "Invalid credential, credentials seem to be wrong.",
      401
    );
    return next(error);
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Could not log you in please check your credentials and try again",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credential, credentials seem to be wrong.",
      401
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Could not log you in please check your credentials and try again",
      500
    );
    return next(error);
  }
  res.json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
