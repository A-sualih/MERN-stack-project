const express = require('express');
// const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const app = express();
// app.use(cors)
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
app.use((req, res, next) => {
  const error = new HttpError('Could not find this routes ttt.', 404);
  throw error;
});
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred!' });

});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

mongoose.connect("mongodb+srv://mern-stack-23:do8G1nw4SIGGscwY@nodejsproject.kfov0sa.mongodb.net/Places?appName=nodejsproject").then(() => {
  app.listen(5001, () => {
    console.log("Listening to Port 5001")
  });

  // do8G1nw4SIGGscwY
}).catch((err) => {
  console.log(err);
})
