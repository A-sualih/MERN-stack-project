const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const fetchFullQuranEnhanced = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database for enhanced seeding...');

        // Clear existing Quran data
        await Quran.deleteMany({});

        console.log('Fetching surah list...');
        const surahListResponse = await axios.get('https://api.quran.com/api/v4/chapters');
        const surahs = surahListResponse.data.chapters;

        for (const surah of surahs) {
            console.log(`Processing Surah ${surah.id}: ${surah.name_simple}...`);

            // 1. Fetch Verses with Translations (Sahih International=131, Amharic=87)
            const versesResponse = await axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}`, {
                params: {
                    per_page: 500,
                    translations: '131,87',
                    fields: 'text_uthmani,text_uthmani_tajweed,page_number,juz_number'
                }
            });

            // 2. Fetch Tafsirs (Ibn Kathir English=169, Ibn Kathir Arabic=14, Muyassar=16)
            const tafsirEngResponse = await axios.get(`https://api.quran.com/api/v4/tafsirs/169/by_chapter/${surah.id}`, {
                params: { per_page: 500 }
            });
            const tafsirArResponse = await axios.get(`https://api.quran.com/api/v4/tafsirs/14/by_chapter/${surah.id}`, {
                params: { per_page: 500 }
            });
            const tafsirMuyassarResponse = await axios.get(`https://api.quran.com/api/v4/tafsirs/16/by_chapter/${surah.id}`, {
                params: { per_page: 500 }
            });

            const verses = versesResponse.data.verses;
            const tafsirsEng = tafsirEngResponse.data.tafsirs;
            const tafsirsAr = tafsirArResponse.data.tafsirs;
            const tafsirsMuyassar = tafsirMuyassarResponse.data.tafsirs;

            const ayahs = verses.map((v, index) => {
                const amharic = v.translations.find(t => t.resource_id === 87);
                const english = v.translations.find(t => t.resource_id === 131);
                // Tafsir is matched by verse key
                const tafsirEngItem = tafsirsEng.find(t => t.verse_key === v.verse_key);
                const tafsirArItem = tafsirsAr.find(t => t.verse_key === v.verse_key);
                const tafsirMuyassarItem = tafsirsMuyassar.find(t => t.verse_key === v.verse_key);

                return {
                    number: v.verse_number,
                    text: v.text_uthmani,
                    tajwidText: v.text_uthmani_tajweed,
                    translation: english ? english.text : "Translation not available",
                    amharicTranslation: amharic ? amharic.text : "Translation not available",
                    tafsir: {
                        ibnKathir: tafsirEngItem ? tafsirEngItem.text : "Tafsir not available",
                        ibnKathirArabic: tafsirArItem ? tafsirArItem.text : "Tafsir not available",
                        muyassar: tafsirMuyassarItem ? tafsirMuyassarItem.text : "Tafsir not available"
                    },
                    page: v.page_number,
                    juz: v.juz_number
                };
            });

            await Quran.create({
                surahNumber: surah.id,
                surahName: surah.name_simple,
                surahNameArabic: surah.name_arabic,
                ayahs: ayahs
            });
            console.log(`Saved ${ayahs.length} ayahs for ${surah.name_simple} (Amharic & Tafsir included)`);
        }

        console.log('Full Quran with Amharic & Tafsir seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding Quran:', err.message);
        process.exit(1);
    }
};

fetchFullQuranEnhanced();
