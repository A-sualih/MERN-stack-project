const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quranSchema = new Schema({
    surahNumber: { type: Number, required: true },
    surahName: { type: String, required: true },
    surahNameArabic: { type: String, required: true },
    ayahs: [{
        number: { type: Number, required: true },
        text: { type: String, required: true },
        translation: { type: String, required: true }
    }]
});

module.exports = mongoose.model('Quran', quranSchema);
