const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, enum: ['Quran', 'Hadith', 'Book'], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true }, // Short title/description for the bookmark
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
