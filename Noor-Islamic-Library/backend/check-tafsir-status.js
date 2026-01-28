const mongoose = require('mongoose');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

async function checkStatus() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database');

    const totalSurahs = await Quran.countDocuments();
    console.log(`Total Surahs in DB: ${totalSurahs}`);

    const surahs = await Quran.find({}, 'surahNumber surahName ayahs.number ayahs.tafsir');

    let stats = {
        totalAyahs: 0,
        tafsirCounts: {
            ibnKathirArabic: 0,
            ibnKathirAmharic: 0,
            muyassar: 0,
            muyassarAmharic: 0,
            tabari: 0,
            tabariAmharic: 0,
            qurtubi: 0,
            qurtubiAmharic: 0,
            sadi: 0,
            sadiAmharic: 0,
            baghawi: 0,
            baghawiAmharic: 0,
            wasit: 0,
            wasitAmharic: 0
        }
    };

    for (const surah of surahs) {
        for (const ayah of surah.ayahs) {
            stats.totalAyahs++;
            if (ayah.tafsir) {
                if (ayah.tafsir.ibnKathirArabic) stats.tafsirCounts.ibnKathirArabic++;
                if (ayah.tafsir.ibnKathirAmharic) stats.tafsirCounts.ibnKathirAmharic++;
                if (ayah.tafsir.muyassar) stats.tafsirCounts.muyassar++;
                if (ayah.tafsir.muyassarAmharic) stats.tafsirCounts.muyassarAmharic++;
                if (ayah.tafsir.tabari) stats.tafsirCounts.tabari++;
                if (ayah.tafsir.tabariAmharic) stats.tafsirCounts.tabariAmharic++;
                if (ayah.tafsir.qurtubi) stats.tafsirCounts.qurtubi++;
                if (ayah.tafsir.qurtubiAmharic) stats.tafsirCounts.qurtubiAmharic++;
                if (ayah.tafsir.sadi) stats.tafsirCounts.sadi++;
                if (ayah.tafsir.sadiAmharic) stats.tafsirCounts.sadiAmharic++;
                if (ayah.tafsir.baghawi) stats.tafsirCounts.baghawi++;
                if (ayah.tafsir.baghawiAmharic) stats.tafsirCounts.baghawiAmharic++;
                if (ayah.tafsir.wasit) stats.tafsirCounts.wasit++;
                if (ayah.tafsir.wasitAmharic) stats.tafsirCounts.wasitAmharic++;
            }
        }
    }

    console.log('\nTafsir Population Stats:');
    console.log(`Total Ayahs: ${stats.totalAyahs}`);
    for (const [key, count] of Object.entries(stats.tafsirCounts)) {
        const percentage = ((count / stats.totalAyahs) * 100).toFixed(2);
        console.log(`${key}: ${count} / ${stats.totalAyahs} (${percentage}%)`);
    }

    process.exit(0);
}

checkStatus().catch(err => {
    console.error(err);
    process.exit(1);
});
