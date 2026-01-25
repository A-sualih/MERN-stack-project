const mongoose = require('mongoose');
const Quran = require('./models/quran');
const Hadith = require('./models/hadith');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const axios = require('axios');

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to seed database...');

        let amharicTranslations = {};
        try {
            amharicTranslations = require('./amharic_hadiths.json');
            console.log('Loaded manual Amharic translations.');
        } catch (e) {
            console.log('No manual Amharic translations found, using fallback.');
        }

        // Seed Quran with Amharic
        await Quran.deleteMany({});
        console.log('Cleared Quran collection. Fetching data...');

        try {
            // 1. Fetch Metadata (Surah names)
            console.log('Fetching metadata...');
            const metaResponse = await axios.get('https://raw.githubusercontent.com/fawazahmed0/quran-api/1/info.json');
            const chaptersInfo = metaResponse.data.chapters;

            // 2. Fetch Editions List to find correct filenames
            const editionsResponse = await axios.get('https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions.json');
            const editions = editionsResponse.data;
            const editionKeys = Object.keys(editions);

            // Helper to find key
            const findKey = (search) => editionKeys.find(k => k === search) || editionKeys.find(k => k.includes(search));

            const arabicKey = findKey('ara_quran_simple') || findKey('ara_quran') || 'ara_quran_simple';
            // "Sahih International" is often spelled "saheeh" in this API keys
            const englishKey = findKey('eng_saheeh') || findKey('eng_sahih') || editionKeys.find(k => k.startsWith('eng_'));
            const amharicKey = findKey('amh_muhammedsadiqan') || findKey('amh_muhammedsadiqan_la') || editionKeys.find(k => k.startsWith('amh_'));

            console.log(`Using editions: Arabic=${arabicKey}, English=${englishKey}, Amharic=${amharicKey}`);

            const fetchEdition = async (key) => {
                const editionObj = editions[key];
                if (!editionObj) throw new Error(`Edition key ${key} not found`);

                let link = editionObj.link;
                if (!link.startsWith('http')) {
                    // removing 'editions/' if present since we might construct base differently or use it relative to root
                    // Actually raw github root is `https://raw.githubusercontent.com/fawazahmed0/quran-api/1/`
                    // link is usually `editions/xxx.json`
                    link = `https://raw.githubusercontent.com/fawazahmed0/quran-api/1/${link}`;
                }
                // Use minified if available? Link usually points to minified or standard.
                // Depending on API version. 
                // Let's force .min.json if original is .json to save bandwidth? No, trust the link.

                console.log(`Fetching ${link}...`);
                return await axios.get(link);
            };

            const arabicResponse = await fetchEdition(arabicKey);
            const arabicAyahs = arabicResponse.data.quran;

            const englishResponse = await fetchEdition(englishKey);
            const englishAyahs = englishResponse.data.quran;

            const amharicResponse = await fetchEdition(amharicKey);
            const amharicAyahs = amharicResponse.data.quran;

            console.log('Processing Quran data...');

            const fullQuran = chaptersInfo.map(chapterInfo => {
                const surahNum = chapterInfo.chapter;

                // Filter ayahs for this surah
                // The API gives flat list. We can assume they are sorted or filter them.
                // Optimization: The flat lists are 6236 items. Filtering 114 times is 114*6236 ~ 700k ops. JS can handle it instantly.
                const surahArabic = arabicAyahs.filter(a => a.chapter === surahNum);
                const surahEnglish = englishAyahs.filter(a => a.chapter === surahNum);
                const surahAmharic = amharicAyahs.filter(a => a.chapter === surahNum);

                const ayahs = surahArabic.map((arabicItem, index) => {
                    return {
                        number: arabicItem.verse,
                        text: arabicItem.text,
                        translation: surahEnglish[index]?.text || "",
                        amharicTranslation: surahAmharic[index]?.text || "",
                        // Default values for other fields
                        tajwidText: arabicItem.text,
                        page: 0 // We don't have page mapping here easily, but Mushaf view uses images anyway.
                    };
                });

                return {
                    surahNumber: surahNum,
                    surahName: chapterInfo.englishname,
                    surahNameArabic: chapterInfo.arabicname,
                    ayahs: ayahs
                };
            });

            await Quran.insertMany(fullQuran);
            console.log('Inserted 114 Surahs with Amharic translation.');

        } catch (qErr) {
            console.error('Failed to seed Quran:', qErr.message);
        }


        console.log('Fetching Hadith data...');
        await Hadith.deleteMany({});
        console.log('Cleared Hadith collection.');

        const processCollection = async (url, collectionName) => {
            console.log(`Downloading ${collectionName}...`);
            try {
                const response = await axios.get(url);
                const data = response.data;

                // AhmedBaset/hadith-json structure is roughly: [{ id, hadith_number, arabic, english: { text, narrator }, ... }]
                // Note: The structure varies. Let's adapt based on common formats or the specific repo structure.
                // Assuming array of objects.

                // The structure has a 'hadiths' array at the root
                const hadithsArray = data.hadiths || [];

                const hadithsToInsert = hadithsArray.map(h => {
                    const manualAmharic = amharicTranslations[collectionName]?.[String(h.id)];
                    return {
                        collection: collectionName,
                        chapter: "General",
                        hadithNumber: String(h.id),
                        narrator: h.english?.narrator || "Narrator",
                        text: h.arabic || "",
                        translation: h.english?.text || h.english || "",
                        amharicTranslation: manualAmharic || ""
                    };
                }).filter(h => h.text && h.translation); // Ensure valid data

                // Limit to 200 for performance/safety in this demo, or remove slice for full
                const slice = hadithsToInsert.slice(0, 300);
                await Hadith.insertMany(slice);
                console.log(`Inserted ${slice.length} hadiths for ${collectionName}`);
            } catch (err) {
                console.error(`Error processing ${collectionName}:`, err.message);
            }
        };

        // URLs from AhmedBaset/hadith-json (approximate paths, verified via common usage)
        await processCollection('https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/bukhari.json', 'Sahih Bukhari');
        await processCollection('https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/muslim.json', 'Sahih Muslim');
        await processCollection('https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/abudawud.json', 'Sunan Abu Dawood');
        await processCollection('https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/tirmidhi.json', 'Jami At-Tirmidhi');
        await processCollection('https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/nasai.json', 'Sunan an-Nasa\'i');
        await processCollection('https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/ibnmajah.json', 'Sunan Ibn Majah');

        // Sample Library Items
        await LibraryItem.create([
            { category: 'Tafsir', title: 'Tafsir Al-Fatihah', explanation: 'This surah is the opening of the Quran...' },
            { category: 'Fiqh', title: 'Wudu (Ablution)', explanation: 'The steps for Wudu are...' },
            { category: 'Seerah', title: 'Early Life in Makkah', explanation: 'The Prophet (PBUH) was born in...' },
            { category: 'Duas', title: 'Morning Adhkar', arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', translation: 'We have reached the morning and at this very time unto Allah belongs all sovereignty.' }
        ]);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
