const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const fetchFullQuran = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database for full seeding...');

        // Clear existing Quran data
        await Quran.deleteMany({});

        console.log('Fetching surah list...');
        const surahListResponse = await axios.get('https://api.quran.com/api/v4/chapters');
        const surahs = surahListResponse.data.chapters;

        for (const surah of surahs) {
            console.log(`Processing Surah ${surah.id}: ${surah.name_simple}...`);

            // Fetch ALL verses for this surah (Al-Baqarah has 286, so per_page=500 is safe)
            const versesResponse = await axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}`, {
                params: {
                    language: 'en',
                    per_page: 500,
                    translations: 131, // Sahih International
                    fields: 'text_uthmani,text_uthmani_tajweed,page_number,juz_number'
                }
            });

            const verses = versesResponse.data.verses;
            const ayahs = verses.map(v => ({
                number: v.verse_number,
                text: v.text_uthmani,
                tajwidText: v.text_uthmani_tajweed,
                translation: v.translations && v.translations.length > 0 ? v.translations[0].text : "Translation not available",
                page: v.page_number,
                juz: v.juz_number
            }));

            await Quran.create({
                surahNumber: surah.id,
                surahName: surah.name_simple,
                surahNameArabic: surah.name_arabic,
                ayahs: ayahs
            });
            console.log(`Saved ${ayahs.length} ayahs for ${surah.name_simple}`);
        }

        console.log('Full Quran seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding Quran:', err.message);
        process.exit(1);
    }
};

fetchFullQuran();
