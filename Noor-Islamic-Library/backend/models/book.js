const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    language: { type: String, default: 'Amharic' },
    pdfUrl: { type: String },
    epubUrl: { type: String },
    coverImage: { type: String },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

