const mongoose = require('mongoose');
const Quran = require('./models/quran');
const Hadith = require('./models/hadith');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

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

        // Sample Hadith
        await Hadith.create({
            collection: "Sahih Bukhari",
            chapter: "Revelation",
            hadithNumber: "1",
            narrator: "Umar bin Al-Khattab",
            text: "Actions are but by intentions...",
            translation: "إنما الأعمال بالنيات..."
        });

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
