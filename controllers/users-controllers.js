const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const User=require("../models/user")
const HttpError = require('../models/http-error');
// const DUMMY_USERS = [
//   {
//     id: 'u1',
//     name: 'Max Schwarz',
//     email: 'test@test.com',
//     password: 'testers'
//   }
// ];

const getUsers =async (req, res, next) => {
  let users
  try {
       users=await User.find({},'-password')
  } catch (err) {
    const error=new HttpError("Signing Up failed",500)
    return next(error)
  }
  res.json({ users: users.map(user=>user.toObject({getters:true})) });
};
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError('Could not create user, email already exists.', 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    password, // ⚠ In production, hash the password!
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ88MFE2yUrzlrY7Lmh0uWLi6hnt3mHRTMqIg&s',
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again.", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async(req, res, next) => {
  const { email, password } = req.body;
let identifiedUser;
try {
  identifiedUser =await User.findOne({email:email});
} catch (err) {
    const error=new HttpError("Logged Up failed",500)
    return next(error)
  }
  // const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    const error= new HttpError('Invalid credential, credentials seem to be wrong.', 401);
    return next(error)
  }

  res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
