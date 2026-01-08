const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ['Quran', 'Hadith', 'Book', 'Other'], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: false }, // ID of the specific ayah/hadith/book
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
