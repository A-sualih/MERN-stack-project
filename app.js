const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

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
mongoose.connect("mongodb+srv://mern-stack-26:yNKy9sayAtYL70y5@nodejsproject.kfov0sa.mongodb.net/mern_products_test?appName=nodejsproject").then(() => {
  app.listen(6000, () => {
    console.log("Listening to Port 7000")
  });
}).catch((err) => {
  console.log(err);
})

