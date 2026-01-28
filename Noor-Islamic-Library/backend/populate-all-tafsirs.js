const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const TAFSIR_IDS = {
    ibnKathirArabic: 14,
    muyassar: 16,
    tabari: 15,
    qurtubi: 90,
    sadi: 91,
    baghawi: 94,
    wasit: 93
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTafsir(id, verseKey) {
    const url = `https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/${verseKey}`;
    try {
        const response = await axios.get(url, { timeout: 10000 });
        return response.data.tafsir.text || '';
    } catch (error) {
        // console.error(`      ⚠️ Error fetching tafsir ${id} for ${verseKey}: ${error.message}`);
        return '';
    }
}

async function populateSurah(surahNumber) {
    console.log(`\n📖 Processing Surah ${surahNumber}...`);
    const surah = await Quran.findOne({ surahNumber });
    if (!surah) {
        console.log(`   ❌ Surah ${surahNumber} not found in DB`);
        return;
    }

    console.log(`   Found: ${surah.surahName} (${surah.ayahs.length} ayahs)`);

    for (let i = 0; i < surah.ayahs.length; i++) {
        const ayah = surah.ayahs[i];
        const verseKey = `${surahNumber}:${ayah.number}`;
        process.stdout.write(`   📝 Ayah ${ayah.number}/${surah.ayahs.length} [${verseKey}] `);

        const tafsirData = {};
        const fetchPromises = Object.entries(TAFSIR_IDS).map(async ([fieldName, id]) => {
            const text = await fetchTafsir(id, verseKey);
            if (text) tafsirData[fieldName] = text;
        });

        await Promise.all(fetchPromises);

        const foundCount = Object.keys(tafsirData).length;
        process.stdout.write(` - Found ${foundCount}/${Object.keys(TAFSIR_IDS).length} tafsirs\n`);

        if (foundCount > 0) {
            await Quran.updateOne(
                { surahNumber, 'ayahs.number': ayah.number },
                { $set: { 'ayahs.$.tafsir': { ...ayah.tafsir, ...tafsirData } } }
            );
        }

        // Small delay to prevent overwhelming API
        await delay(300);
    }
    console.log(`✅ Completed Surah ${surahNumber}`);
}

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to database');

    const args = process.argv.slice(2);
    if (args.includes('--all')) {
        for (let i = 1; i <= 114; i++) {
            await populateSurah(i);
            // Longer delay between surahs
            await delay(2000);
        }
    } else if (args.some(a => a.startsWith('--surah='))) {
        const surahNum = parseInt(args.find(a => a.startsWith('--surah=')).split('=')[1]);
        await populateSurah(surahNum);
    } else {
        console.log('Usage: node populate-all-tafsirs.js --surah=1 OR node populate-all-tafsirs.js --all');
    }

    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
