require('dotenv').config();
const express = require('express');

// const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const adminRoutes = require('./routes/admin-routes');
const HttpError = require('./models/http-error');
const multer = require('multer');

const app = express();
// app.use(cors)
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(bodyParser.json());
app.use((req, res, next) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route: ' + req.originalUrl, 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  console.error("Global Error Handler detected:", error);
  const logMessage = `[${new Date().toISOString()}] Global Error: ${error.message}\n${error.stack}\n\n`;
  const fs = require('fs');
  try {
    fs.appendFileSync('backend-error.log', logMessage);
  } catch (e) {
    console.error("Could not write to log file:", e);
  }

  // Check if it's a file upload error (multer)
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@nodejsproject.kfov0sa.mongodb.net/Places?appName=nodejsproject`).then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log("Listening to Port 5001")
  });

  // do8G1nw4SIGGscwY
}).catch((err) => {
  console.log(err);
})
