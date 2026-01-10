const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

// This script fetches proper Arabic text with Tajwid from Quran.com API
async function updateArabicText() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database...\n');

        const surahs = await Quran.find({}).sort({ surahNumber: 1 });
        console.log(`Found ${surahs.length} surahs in database\n`);

        for (const surah of surahs) {
            console.log(`Processing Surah ${surah.surahNumber}: ${surah.surahName}...`);

            for (let i = 0; i < surah.ayahs.length; i++) {
                const ayah = surah.ayahs[i];
                const verseKey = `${surah.surahNumber}:${ayah.number}`;

                try {
                    // Fetch Arabic text with Tajwid from Quran.com
                    const response = await axios.get(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=false&translations=131&fields=text_uthmani,text_imlaei`);

                    if (response.data && response.data.verse) {
                        const verse = response.data.verse;

                        // Update the ayah with proper Arabic text
                        await Quran.updateOne(
                            { surahNumber: surah.surahNumber, 'ayahs.number': ayah.number },
                            {
                                $set: {
                                    'ayahs.$.text': verse.text_uthmani || verse.text_imlaei,
                                    'ayahs.$.tajwidText': verse.text_uthmani || verse.text_imlaei
                                }
                            }
                        );
                    }

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (err) {
                    console.error(`  Error fetching ${verseKey}:`, err.message);
                }
            }

            console.log(`  ✅ Updated ${surah.ayahs.length} ayahs`);
        }

        console.log('\n✨ All Arabic text updated successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateArabicText();
