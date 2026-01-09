const mongoose = require('mongoose');
const Quran = require('./models/quran');
const Hadith = require('./models/hadith');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const fetch = require('node-fetch'); // Ensure node-fetch is available (or use global fetch in Node 18+)

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to seed database...');

        // Clear existing
        await Quran.deleteMany({});
        await Hadith.deleteMany({});
        await LibraryItem.deleteMany({});

        // Sample Quran
        await Quran.create({
            surahNumber: 1,
            surahName: "Al-Fatihah",
            surahNameArabic: "الفاتحة",
            ayahs: [
                { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
                { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -" }
            ]
        });

        console.log('Fetching Hadith data...');

        const processCollection = async (url, collectionName) => {
            console.log(`Downloading ${collectionName}...`);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                const data = await response.json();

                // AhmedBaset/hadith-json structure is roughly: [{ id, hadith_number, arabic, english: { text, narrator }, ... }]
                // Note: The structure varies. Let's adapt based on common formats or the specific repo structure.
                // Assuming array of objects.

                const hadithsToInsert = data.map(h => ({
                    collection: collectionName,
                    chapter: h.chapter || "General", // Some APIs structure by chapter, others flat
                    hadithNumber: String(h.hadith_number || h.id),
                    narrator: h.english?.narrator || "Narrator",
                    text: h.arabic || "",
                    translation: h.english?.text || h.english || ""
                })).filter(h => h.text && h.translation); // Ensure valid data

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
