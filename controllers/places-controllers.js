const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Place = require("../models/Place.js");
const User = require("../models/user.js");
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

// Get a place by its ID
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find a place.", 500));
  }

  if (!place) {
    return next(new HttpError('Could not find a place for the provided id.', 404));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

// Get all places for a specific user
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let places;
  
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    return next(new HttpError("Something went wrong, could not fetch places.", 500));
  }

  if (!userWithPlaces || userWithPlaces.length === 0) {
    return next(new HttpError('Could not find places for the provided user id.', 404));
  }

  res.json({ userWithPlaces: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

// Create a new place
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ88MFE2yUrzlrY7Lmh0uWLi6hnt3mHRTMqIg&s',
    address,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id.", 404));
  }
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });

    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

// Update a place
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Updating place failed, please try again", 500));
  }

  if (!updatedPlace) {
    return next(new HttpError("Place not found.", 404));
  }

  updatedPlace.title = title;
  updatedPlace.description = description;
  updatedPlace.address = address;

  try {
    await updatedPlace.save();
  } catch (err) {
    return next(new HttpError("Updating place failed, please try again", 500));
  }

  res.status(200).json({ updatedPlace: updatedPlace.toObject({ getters: true }) });
};

// Delete a place
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    return next(new HttpError("Deleting place failed, please try again", 500));
  }
  if (!place) {
    return next(new HttpError("Place not found.", 404));
  }

  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Deleting place failed, please try again", 500));
  }
  res.status(200).json({ message: 'Deleted place.' });
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
