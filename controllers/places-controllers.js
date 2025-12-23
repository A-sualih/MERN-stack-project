const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const Place=require("../models/Place.js")
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');


const getPlaceById = async(req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
  try {
       place=await Place.findOne({_id:placeId})
  } catch (err) {
    const error=new HttpError("Something went wrong could not find a place",500)
    return next(error)
  }

  if (!place) {
   const error=  new HttpError('Could not find a place for the provided id.', 404)
   return next(error)
  }
  res.json({ place:place.toObject({getters:true}) }); // => { place } => { place: place }
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async(req, res, next) => {
  const userId = req.params.uid;
let places;
try {
  places=await Place.find({creator:userId})
} catch (err) {
    const error=new HttpError("Something went wrong could not find a place",500)
    return next(error)
  }

  // const places = DUMMY_PLACES.filter(p => {
  //   return p.creator === userId;
  // });

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  // res.json({ places });
  res.json({places:places.map(place=>place.toObject({getters:true}))})
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
console.log(req.body);

  // const title = req.body.title;
  const createdPlace =new Place( {
    // id: uuid(),
    title,
    description,
    location: coordinates,
    image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ88MFE2yUrzlrY7Lmh0uWLi6hnt3mHRTMqIg&s',
    address,
    creator
  });
  try {
    const result=await createdPlace.save();
res.json({place:result})
  } catch (err) {
    const error=new HttpError("Creating place failed, please try again",500)
    return next(error)
  }


  // DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  // res.status(201).json({ place: createdPlace });
}
const updatePlace = async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }
  const { title, description,address } = req.body;
  const placeId = req.params.pid;
let updatedPlace;
try {
  updatedPlace=await Place.findById(placeId)
} catch (err) {
    const error=new HttpError("Update place failed, please try again",500)
    return next(error)
  }
  // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  updatedPlace.address=address
  // DUMMY_PLACES[placeIndex] = updatedPlace;
try {
  await updatedPlace.save();
} catch (err) {
    const error=new HttpError("Update  place failed, please try again",500)
    return next(error)
  }
  res.status(200).json({ updatedPlace:updatedPlace.toObject({getters:true}) });

};

const deletePlace =async (req, res, next) => {
  const placeId = req.params.pid;
  // if (!DUMMY_PLACES.find(p => p.id === placeId)) {
  //   throw new HttpError('Could not find a place for that id.', 404);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  let deletedPlace;
  try {
    deletedPlace=await Place.findById(placeId)
  } catch  (err) {
    const error=new HttpError("Update  place failed, please try again",500)
    return next(error)
  }
  try {
    deletedPlace.remove();
  } catch (error) {
    
  }
  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
