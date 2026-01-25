const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hadithSchema = new Schema({
    collection: { type: String, required: true },
    chapter: { type: String, required: true },
    hadithNumber: { type: String, required: true },
    narrator: { type: String, required: true },
    text: { type: String, required: true },
    translation: { type: String, required: true },
    amharicTranslation: { type: String, required: false }
});

module.exports = mongoose.model('Hadith', hadithSchema);
