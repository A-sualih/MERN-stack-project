const express = require('express');
const { check } = require('express-validator');
const fileUploade = require('../middleware/file-upload');
const placesControllers = require('../controllers/places-controllers');
const checkAuth=require('../middleware/check-auth')
const router = express.Router();

// 🔥 FIX: specific route FIRST
router.get('/user/:uid', placesControllers.getPlacesByUserId);

// generic route AFTER
router.get('/:pid', placesControllers.getPlaceById);
router.use(checkAuth)
router.post(
  '/',
  fileUploade.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty()
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
