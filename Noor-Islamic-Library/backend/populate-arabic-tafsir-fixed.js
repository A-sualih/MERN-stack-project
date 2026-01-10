// Correct Arabic Tafsir Population Script
// Uses the proper Quran.com API endpoint that returns actual Arabic content
const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

// Arabic Tafsir IDs from Quran.com API
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

// Translate Arabic to Amharic
async function translateToAmharic(arabicText) {
    if (!arabicText || arabicText.trim() === '') return '';

    const text = arabicText.replace(/<[^>]*>/g, '').substring(0, 4000);

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=am&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url, { timeout: 15000 });

        if (response.data && response.data[0]) {
            return response.data[0].map(item => item[0]).join('');
        }
        return '';
    } catch (error) {
        console.log(`      ⚠️ Translation skipped`);
        return '';
    }
}

// Fetch tafsirs using the CORRECT endpoint
async function fetchTafsirsForVerse(surahNumber, ayahNumber) {
    try {
        const tafsirIdList = Object.values(TAFSIR_IDS).join(',');
        const url = `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?tafsirs=${tafsirIdList}`;

        const response = await axios.get(url, { timeout: 15000 });

        if (!response.data?.verse?.tafsirs) return null;

        const tafsirData = {};

        for (const tafsir of response.data.verse.tafsirs) {
            // Map resource_id back to our field names
            const fieldMap = {
                14: 'ibnKathirArabic',
                16: 'muyassar',
                15: 'tabari',
                90: 'qurtubi',
                91: 'sadi',
                94: 'baghawi',
                93: 'wasit'
            };

            const fieldName = fieldMap[tafsir.resource_id];
            if (fieldName && tafsir.text) {
                tafsirData[fieldName] = tafsir.text;
            }
        }

        return tafsirData;

    } catch (error) {
        console.error(`   ⚠️ API error: ${error.message}`);
        return null;
    }
}

async function populateTafsirForSurah(surahNumber) {
    console.log(`\n📖 Processing Surah ${surahNumber}...`);

    const surah = await Quran.findOne({ surahNumber });
    if (!surah) {
        console.log(`   ❌ Surah ${surahNumber} not found`);
        return;
    }

    console.log(`   Found: ${surah.surahName} (${surah.ayahs.length} ayahs)`);

    for (let i = 0; i < surah.ayahs.length; i++) {
        const ayah = surah.ayahs[i];
        console.log(`\n   📝 Ayah ${ayah.number}/${surah.ayahs.length}`);

        // Fetch all tafsirs for this verse
        const arabicTafsirs = await fetchTafsirsForVerse(surahNumber, ayah.number);

        if (!arabicTafsirs) {
            console.log(`   ⚠️ No tafsir data available`);
            continue;
        }

        const finalData = { ...arabicTafsirs };

        // Log what we got
        for (const [key, value] of Object.entries(arabicTafsirs)) {
            const preview = value.replace(/<[^>]*>/g, '').substring(0, 50);
            console.log(`      ✓ ${key}: ${preview}...`);
        }

        // Translate to Amharic
        console.log(`      Translating to Amharic...`);

        if (arabicTafsirs.ibnKathirArabic) {
            finalData.ibnKathirAmharic = await translateToAmharic(arabicTafsirs.ibnKathirArabic);
            await delay(200);
        }
        if (arabicTafsirs.muyassar) {
            finalData.muyassarAmharic = await translateToAmharic(arabicTafsirs.muyassar);
            await delay(200);
        }
        if (arabicTafsirs.tabari) {
            finalData.tabariAmharic = await translateToAmharic(arabicTafsirs.tabari);
            await delay(200);
        }
        if (arabicTafsirs.qurtubi) {
            finalData.qurtubiAmharic = await translateToAmharic(arabicTafsirs.qurtubi);
            await delay(200);
        }
        if (arabicTafsirs.sadi) {
            finalData.sadiAmharic = await translateToAmharic(arabicTafsirs.sadi);
            await delay(200);
        }
        if (arabicTafsirs.baghawi) {
            finalData.baghawiAmharic = await translateToAmharic(arabicTafsirs.baghawi);
            await delay(200);
        }
        if (arabicTafsirs.wasit) {
            finalData.wasitAmharic = await translateToAmharic(arabicTafsirs.wasit);
            await delay(200);
        }

        // Update database
        await Quran.updateOne(
            { surahNumber, 'ayahs.number': ayah.number },
            { $set: { 'ayahs.$.tafsir': { ...ayah.tafsir, ...finalData } } }
        );

        console.log(`   ✅ Ayah ${ayah.number} updated`);
        await delay(500);
    }

    console.log(`\n✅ Completed Surah ${surahNumber}`);
}

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to database\n');

    const args = process.argv.slice(2);
    const surahArg = args.find(a => a.startsWith('--surah='));

    if (surahArg) {
        const surahNum = parseInt(surahArg.split('=')[1]);
        await populateTafsirForSurah(surahNum);
    } else if (args.includes('--all')) {
        for (let i = 1; i <= 114; i++) {
            await populateTafsirForSurah(i);
            await delay(2000);
        }
    } else {
        console.log('Usage:');
        console.log('  node populate-arabic-tafsir-fixed.js --surah=1');
        console.log('  node populate-arabic-tafsir-fixed.js --all');
    }

    console.log('\n✨ Done!');
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
