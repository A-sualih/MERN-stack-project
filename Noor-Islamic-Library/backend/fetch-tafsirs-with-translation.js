const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

// Tafsir IDs from Quran.com API
const TAFSIR_IDS = {
    ibnKathirArabic: 14,  // Tafsir Ibn Kathir (Arabic)
    muyassar: 16,         // Tafsir Muyassar (Arabic)
    tabari: 15,           // Tafsir al-Tabari (Arabic)
    qurtubi: 90,          // Al-Qurtubi (Arabic)
    sadi: 91,             // Al-Sa'di (Arabic)
    baghawi: 94,          // Tafseer Al-Baghawi (Arabic)
    wasit: 93             // Al-Tafsir al-Wasit (Arabic)
};

// Simple translation function using Google Translate (free tier)
// Note: For production, consider using official Google Translate API or professional translations
async function translateToAmharic(arabicText) {
    if (!arabicText || arabicText.trim() === '') return '';

    try {
        // Using a simple translation approach
        // You can replace this with Google Translate API, DeepL, or other services
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=am&dt=t&q=${encodeURIComponent(arabicText)}`;
        const response = await axios.get(url);

        if (response.data && response.data[0]) {
            return response.data[0].map(item => item[0]).join('');
        }
        return '';
    } catch (error) {
        console.error('Translation error:', error.message);
        return ''; // Return empty string on error
    }
}

// Delay function to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTafsirForAyah(surahNumber, ayahNumber, tafsirId) {
    try {
        const url = `https://api.quran.com/api/v4/quran/tafsirs/${tafsirId}?verse_key=${surahNumber}:${ayahNumber}`;
        const response = await axios.get(url);

        if (response.data && response.data.tafsirs && response.data.tafsirs.length > 0) {
            return response.data.tafsirs[0].text;
        }
        return '';
    } catch (error) {
        console.error(`Error fetching tafsir ${tafsirId} for ${surahNumber}:${ayahNumber}:`, error.message);
        return '';
    }
}

async function updateTafsirsForSurah(surahNumber, testMode = false) {
    try {
        console.log(`\n📖 Processing Surah ${surahNumber}...`);

        const surah = await Quran.findOne({ surahNumber });
        if (!surah) {
            console.log(`❌ Surah ${surahNumber} not found in database`);
            return;
        }

        console.log(`   Found: ${surah.surahName} (${surah.ayahs.length} ayahs)`);

        // Limit to first 3 ayahs in test mode
        const ayahsToProcess = testMode ? surah.ayahs.slice(0, 3) : surah.ayahs;

        for (let i = 0; i < ayahsToProcess.length; i++) {
            const ayah = ayahsToProcess[i];
            console.log(`   Processing Ayah ${ayah.number}/${surah.ayahs.length}...`);

            // Fetch all Tafsirs for this ayah
            const tafsirs = {};

            // Fetch Ibn Kathir Arabic (if not already present)
            if (!ayah.tafsir?.ibnKathirArabic) {
                tafsirs.ibnKathirArabic = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.ibnKathirArabic);
                await delay(500); // Rate limiting
            } else {
                tafsirs.ibnKathirArabic = ayah.tafsir.ibnKathirArabic;
            }

            // Fetch Muyassar (if not already present)
            if (!ayah.tafsir?.muyassar) {
                tafsirs.muyassar = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.muyassar);
                await delay(500);
            } else {
                tafsirs.muyassar = ayah.tafsir.muyassar;
            }

            // Fetch Al-Tabari
            tafsirs.tabari = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.tabari);
            await delay(500);

            // Fetch Al-Qurtubi
            tafsirs.qurtubi = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.qurtubi);
            await delay(500);

            // Fetch Al-Sa'di
            tafsirs.sadi = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.sadi);
            await delay(500);

            // Fetch Al-Baghawi
            tafsirs.baghawi = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.baghawi);
            await delay(500);

            // Fetch Al-Wasit
            tafsirs.wasit = await fetchTafsirForAyah(surahNumber, ayah.number, TAFSIR_IDS.wasit);
            await delay(500);

            // Translate to Amharic
            console.log(`   Translating to Amharic...`);

            if (tafsirs.ibnKathirArabic) {
                tafsirs.ibnKathirAmharic = await translateToAmharic(tafsirs.ibnKathirArabic);
                await delay(300);
            }

            if (tafsirs.muyassar) {
                tafsirs.muyassarAmharic = await translateToAmharic(tafsirs.muyassar);
                await delay(300);
            }

            if (tafsirs.tabari) {
                tafsirs.tabariAmharic = await translateToAmharic(tafsirs.tabari);
                await delay(300);
            }

            if (tafsirs.qurtubi) {
                tafsirs.qurtubiAmharic = await translateToAmharic(tafsirs.qurtubi);
                await delay(300);
            }

            if (tafsirs.sadi) {
                tafsirs.sadiAmharic = await translateToAmharic(tafsirs.sadi);
                await delay(300);
            }

            if (tafsirs.baghawi) {
                tafsirs.baghawiAmharic = await translateToAmharic(tafsirs.baghawi);
                await delay(300);
            }

            if (tafsirs.wasit) {
                tafsirs.wasitAmharic = await translateToAmharic(tafsirs.wasit);
                await delay(300);
            }

            // Update the ayah in the database
            await Quran.updateOne(
                { surahNumber, 'ayahs.number': ayah.number },
                {
                    $set: {
                        'ayahs.$.tafsir': {
                            ...ayah.tafsir,
                            ...tafsirs
                        }
                    }
                }
            );

            console.log(`   ✅ Updated Ayah ${ayah.number}`);
        }

        console.log(`✅ Completed Surah ${surahNumber}: ${surah.surahName}`);

    } catch (error) {
        console.error(`Error processing Surah ${surahNumber}:`, error.message);
    }
}

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔗 Connected to database...\n');

        // Check command line arguments
        const args = process.argv.slice(2);
        const testMode = args.includes('--test');
        const surahArg = args.find(arg => arg.startsWith('--surah='));

        if (testMode && surahArg) {
            const surahNumber = parseInt(surahArg.split('=')[1]);
            console.log(`🧪 TEST MODE: Processing Surah ${surahNumber} (first 3 ayahs only)\n`);
            await updateTafsirsForSurah(surahNumber, true);
        } else if (surahArg) {
            const surahNumber = parseInt(surahArg.split('=')[1]);
            console.log(`📚 Processing Surah ${surahNumber}\n`);
            await updateTafsirsForSurah(surahNumber, false);
        } else {
            console.log('📚 Processing all 114 Surahs...\n');
            console.log('⚠️  This will take several hours due to API rate limits.\n');

            for (let surahNum = 1; surahNum <= 114; surahNum++) {
                await updateTafsirsForSurah(surahNum, false);
                await delay(1000); // Extra delay between surahs
            }
        }

        console.log('\n✨ All done!');
        process.exit(0);

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { updateTafsirsForSurah, translateToAmharic };
