const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quranSchema = new Schema({
    surahNumber: { type: Number, required: true },
    surahName: { type: String, required: true },
    surahNameArabic: { type: String, required: true },
    ayahs: [{
        number: { type: Number, required: true },
        text: { type: String, required: true },
        tajwidText: { type: String }, // HTML or tagged text for colorization
        translation: { type: String, required: true },
        amharicTranslation: { type: String },
        tafsir: {
            ibnKathir: { type: String },
            ibnKathirArabic: { type: String },
            ibnKathirAmharic: { type: String },
            muyassar: { type: String },
            muyassarAmharic: { type: String },
            tabari: { type: String },
            tabariAmharic: { type: String },
            qurtubi: { type: String },
            qurtubiAmharic: { type: String },
            sadi: { type: String },
            sadiAmharic: { type: String },
            baghawi: { type: String },
            baghawiAmharic: { type: String },
            wasit: { type: String },
            wasitAmharic: { type: String }
        },
        page: { type: Number },
        juz: { type: Number }
    }]
});

module.exports = mongoose.model('Quran', quranSchema);
