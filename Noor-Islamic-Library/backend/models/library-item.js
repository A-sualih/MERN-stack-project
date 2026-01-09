const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const libraryItemSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: ['Tafsir', 'Fiqh', 'Seerah', 'Duas', 'Adhkar']
    },
    title: { type: String, required: true },
    subTopic: { type: String },
    arabicText: { type: String },
    translation: { type: String },
    explanation: { type: String },
    reference: { type: String }
});

module.exports = mongoose.model('LibraryItem', libraryItemSchema);
