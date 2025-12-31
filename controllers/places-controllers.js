const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs')
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
    console.error(err);
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

  if (userId === 'undefined' || userId === 'null' || !userId) {
    return next(new HttpError("Invalid User ID provided.", 422));
  }

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Fetching places failed, please try again.", 500)
    );
  }

  // ✅ return empty array if no places
  res.json({
    places: places.map(place => place.toObject({ getters: true }))
  });
};



// Create a new place
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator } = req.body;
  console.log("CreatePlace Request Body:", req.body);
  console.log("CreatePlace Request File:", req.file);

  if (creator === 'undefined' || creator === 'null' || !creator) {
    return next(new HttpError("Invalid Creator ID provided.", 422));
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.error(error);
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    image: req.file ? req.file.path : 'uploads/images/default.png', // Fallback or handle error
    address,
    creator
  });

  if (!req.file) {
    return next(new HttpError('No image provided.', 422));
  }


  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    console.error(err);
    const logMessage = `[${new Date().toISOString()}] Create Place Error: ${err.message}\n${err.stack}\n\n`;
    try {
      fs.appendFileSync('backend-error.log', logMessage);
    } catch (e) {
      console.error("Could not write to log file:", e);
    }
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
    console.error(err);
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

  const { title, description } = req.body; // only these
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    console.error(err);
    return next(new HttpError("Updating place failed, please try again", 500));
  }

  if (!updatedPlace) {
    return next(new HttpError("Place not found.", 404));
  }

  // Update only the fields you have
  if (title) updatedPlace.title = title;
  if (description) updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (err) {
    console.error(err);
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
    console.error(err);
    return next(new HttpError("Deleting place failed, please try again", 500));
  }
  if (!place) {
    return next(new HttpError("Place not found.", 404));
  }
  const imagePath = place.image;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    console.error("Delete error:", err); // Log the actual error
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Deleting place failed, please try again", 500));
  }
  fs.unlink(imagePath, err => {
    console.log(err)
  })
  res.status(200).json({ message: 'Deleted place.' });
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
