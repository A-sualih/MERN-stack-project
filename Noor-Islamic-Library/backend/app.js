const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const usersRoutes = require('./routes/users-routes');
const quranRoutes = require('./routes/quran-routes');
const hadithRoutes = require('./routes/hadith-routes');
const booksRoutes = require('./routes/books-routes');
const notesRoutes = require('./routes/notes-routes');
const bookmarksRoutes = require('./routes/bookmarks-routes');
const libraryRoutes = require('./routes/library-routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/hadith', hadithRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/library', libraryRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Noor Islamic Library API' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log('MongoDB connection failed:', err);
    });
