const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'application/pdf': 'pdf',
    'application/x-pdf': 'pdf',
    'application/epub+zip': 'epub',
    'application/epub': 'epub'
};

const fileUpload = multer({
    limits: 50000000, // 50MB
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let dest = 'uploads/others';
            if (file.mimetype.startsWith('image/')) {
                dest = 'uploads/images';
            } else if (file.mimetype === 'application/pdf') {
                dest = 'uploads/books/pdfs';
            } else if (file.mimetype === 'application/epub+zip') {
                dest = 'uploads/books/epubs';
            }

            // Ensure directory exists
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuidv4() + '.' + ext);
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error('Invalid mime type!');
        cb(error, isValid);
    }
});

module.exports = fileUpload;

