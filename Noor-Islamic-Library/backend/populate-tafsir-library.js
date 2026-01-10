const mongoose = require('mongoose');
const Quran = require('./models/quran');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

// Tafsir scholars information
const tafsirScholars = [
    {
        key: 'ibnKathir',
        name: 'Ibn Kathir',
        arabicName: 'ابن كثير',
        description: 'One of the most famous and authentic Tafsir books, known for its comprehensive explanations based on Quran, Hadith, and sayings of the Companions.'
    },
    {
        key: 'muyassar',
        name: 'Al-Muyassar',
        arabicName: 'الميسر',
        description: 'A simplified and modern Tafsir that makes Quranic meanings accessible to contemporary readers with clear and concise explanations.'
    },
    {
        key: 'tabari',
        name: 'Al-Tabari',
        arabicName: 'الطبري',
        description: 'One of the earliest and most comprehensive Tafsir works, providing historical context and linguistic analysis of the Quran.'
    },
    {
        key: 'qurtubi',
        name: 'Al-Qurtubi',
        arabicName: 'القرطبي',
        description: 'Famous for its focus on legal rulings (Ahkam) derived from Quranic verses, essential for understanding Islamic jurisprudence.'
    },
    {
        key: 'sadi',
        name: 'Al-Sa\'di',
        arabicName: 'السعدي',
        description: 'Known for clear and concise explanations that are easy to understand, making it popular among students and scholars alike.'
    },
    {
        key: 'baghawi',
        name: 'Al-Baghawi',
        arabicName: 'البغوي',
        description: 'A moderate approach Tafsir that balances between narration-based and opinion-based interpretations.'
    },
    {
        key: 'wasit',
        name: 'Al-Wasit',
        arabicName: 'الوسيط',
        description: 'Contemporary scholarly commentary that bridges classical and modern understanding of the Quran.'
    }
];

async function populateTafsirLibrary() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database...\n');

        // Clear existing Tafsir library items
        await LibraryItem.deleteMany({ category: 'Tafsir' });
        console.log('Cleared existing Tafsir library items\n');

        // Get all Surahs
        const surahs = await Quran.find({}).sort({ surahNumber: 1 });
        console.log(`Found ${surahs.length} surahs\n`);

        const tafsirItems = [];

        for (const surah of surahs) {
            console.log(`Creating entries for Surah ${surah.surahNumber}: ${surah.surahName}...`);

            // Create entries for each Tafsir scholar
            for (const scholar of tafsirScholars) {
                const firstAyah = surah.ayahs[0];

                // Check if Tafsir data exists
                const hasTafsirData = firstAyah?.tafsir?.[scholar.key + 'Arabic'] || firstAyah?.tafsir?.[scholar.key];

                let arabicText = '';
                let translation = '';

                if (hasTafsirData) {
                    // Use actual Tafsir data if available
                    const tafsirField = scholar.key === 'ibnKathir' ? 'ibnKathirArabic' : scholar.key;
                    const amharicField = scholar.key + 'Amharic';

                    arabicText = (firstAyah.tafsir[tafsirField] || '').substring(0, 400) + '...';
                    translation = (firstAyah.tafsir[amharicField] || 'Amharic translation in progress...').substring(0, 300);
                } else {
                    // Use placeholder content
                    arabicText = `تفسير ${scholar.arabicName} لسورة ${surah.surahNameArabic}`;
                    translation = `Tafsir ${scholar.name} for Surah ${surah.surahName}. Full Tafsir content will be available soon. View in Quran page for complete commentary.`;
                }

                tafsirItems.push({
                    category: 'Tafsir',
                    title: `Tafsir ${scholar.name} - ${surah.surahName}`,
                    subTopic: `Surah ${surah.surahNumber}: ${surah.surahNameArabic}`,
                    arabicText: arabicText,
                    translation: translation,
                    explanation: `${scholar.description} This entry covers Surah ${surah.surahName}. Click "VIEW TAFSIR" in the Quran page for detailed verse-by-verse commentary.`,
                    reference: scholar.name
                });
            }
        }

        // Insert all Tafsir items
        if (tafsirItems.length > 0) {
            await LibraryItem.insertMany(tafsirItems);
            console.log(`\n✅ Successfully created ${tafsirItems.length} Tafsir library items!`);
            console.log(`   (${tafsirScholars.length} scholars × ${surahs.length} surahs = ${tafsirItems.length} entries)`);
        }

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

populateTafsirLibrary();
