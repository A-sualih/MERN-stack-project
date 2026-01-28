const mongoose = require('mongoose');
const Quran = require('./models/quran');
require('dotenv').config();

async function checkAyah() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library');
    const surah = await Quran.findOne({ surahNumber: 1 });
    const tafsir = surah.ayahs[0].tafsir;

    console.log('Tafsir Fields present:');
    Object.keys(tafsir).forEach(key => {
        const preview = (tafsir[key] || '').substring(0, 50);
        console.log(`- ${key}: ${preview}...`);
    });

    process.exit(0);
}

checkAyah();
