require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRoutes = require('./routes/users-routes');
const quranRoutes = require('./routes/quran-routes');
const hadithRoutes = require('./routes/hadith-routes');
const booksRoutes = require('./routes/books-routes');
const notesRoutes = require('./routes/notes-routes');
const bookmarksRoutes = require('./routes/bookmarks-routes');
const libraryRoutes = require('./routes/library-routes');
const adminRoutes = require('./routes/admin-routes');
const categoryRoutes = require('./routes/category-routes');

const app = express();


// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Vite default
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/hadith', hadithRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Noor Islamic Library API', status: 'healthy' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    console.error('API Error:', error);
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
        app.listen(PORT, () => {
            console.log(`Server is running in production mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('CRITICAL: MongoDB connection failed:', err);
        process.exit(1);
    });
