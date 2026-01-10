const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

// VERIFIED Arabic Tafsir IDs from Quran.com API
// These are confirmed to return Arabic content
const ARABIC_TAFSIRS = {
    ibnKathirArabic: { id: 14, name: 'Ibn Kathir', arabicName: 'ابن كثير' },
    muyassar: { id: 16, name: 'Al-Muyassar', arabicName: 'الميسر' },
    tabari: { id: 15, name: 'Al-Tabari', arabicName: 'الطبري' },
    qurtubi: { id: 90, name: 'Al-Qurtubi', arabicName: 'القرطبي' },
    sadi: { id: 91, name: 'Al-Sa\'di', arabicName: 'السعدي' },
    baghawi: { id: 94, name: 'Al-Baghawi', arabicName: 'البغوي' },
    wasit: { id: 93, name: 'Al-Wasit', arabicName: 'الوسيط' }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Translate Arabic to Amharic using Google Translate
async function translateToAmharic(arabicText) {
    if (!arabicText || arabicText.trim() === '') return '';

    // Limit text length to avoid API issues
    const text = arabicText.substring(0, 5000);

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=am&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url, { timeout: 10000 });

        if (response.data && response.data[0]) {
            return response.data[0].map(item => item[0]).join('');
        }
        return '';
    } catch (error) {
        console.error('   ⚠️ Translation error:', error.message);
        return '';
    }
}

// Fetch tafsir from Quran.com API
async function fetchTafsir(surahNumber, ayahNumber, tafsirId) {
    try {
        const url = `https://api.quran.com/api/v4/quran/tafsirs/${tafsirId}?verse_key=${surahNumber}:${ayahNumber}`;
        const response = await axios.get(url, { timeout: 10000 });

        if (response.data?.tafsirs?.[0]?.text) {
            return response.data.tafsirs[0].text;
        }
        return '';
    } catch (error) {
        console.error(`   ⚠️ API error for ${surahNumber}:${ayahNumber}:`, error.message);
        return '';
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

        const tafsirData = {};

        // Fetch all Arabic Tafsirs
        for (const [key, info] of Object.entries(ARABIC_TAFSIRS)) {
            console.log(`      Fetching ${info.name}...`);
            const arabicText = await fetchTafsir(surahNumber, ayah.number, info.id);

            if (arabicText) {
                tafsirData[key] = arabicText;
                console.log(`      ✓ ${info.name}: ${arabicText.substring(0, 50)}...`);

                // Translate to Amharic
                const amharicKey = key.replace('Arabic', '') + 'Amharic';
                const finalAmharicKey = key === 'ibnKathirArabic' ? 'ibnKathirAmharic' :
                    key + 'Amharic';

                console.log(`      Translating to Amharic...`);
                tafsirData[finalAmharicKey] = await translateToAmharic(arabicText);
                await delay(300);
            } else {
                console.log(`      ✗ ${info.name}: No data`);
            }
            await delay(500);
        }

        // Update database
        await Quran.updateOne(
            { surahNumber, 'ayahs.number': ayah.number },
            { $set: { 'ayahs.$.tafsir': { ...ayah.tafsir, ...tafsirData } } }
        );

        console.log(`   ✅ Ayah ${ayah.number} updated`);
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
    } else {
        console.log('Usage: node populate-arabic-tafsir.js --surah=1');
        console.log('To populate all: node populate-arabic-tafsir.js --all');

        if (args.includes('--all')) {
            for (let i = 1; i <= 114; i++) {
                await populateTafsirForSurah(i);
                await delay(2000);
            }
        }
    }

    console.log('\n✨ Done!');
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
