const mongoose = require('mongoose');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const seerahContent = [
    // --- Biography of Prophet Muhammad (ﷺ) ---
    {
        category: 'Seerah',
        title: 'Seerah of Prophet Muhammad (ﷺ)',
        subTopic: 'Part 1: Birth and Early Childhood',
        explanation: 'Prophet Muhammad (ﷺ) was born in Makkah in the Year of the Elephant (approx. 570 CE). He belonged to the noble tribe of Banu Hashim. His father, Abdullah, died before his birth, and his mother, Aminah, died when he was six. He was then raised by his grandfather Abdul-Muttalib and later his uncle Abu Talib.',
        reference: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)'
    },
    {
        category: 'Seerah',
        title: 'Seerah of Prophet Muhammad (ﷺ)',
        subTopic: 'Part 2: Youth and Marriage',
        explanation: 'As a young man, Muhammad (ﷺ) was known as "Al-Amin" (The Trustworthy). At age 25, he married Khadijah bint Khuwaylid (RA), a noble widow and successful businesswoman. Their marriage was one of great love and support, lasting until her death 25 years later.',
        reference: 'The Sealed Nectar'
    },
    {
        category: 'Seerah',
        title: 'Seerah of Prophet Muhammad (ﷺ)',
        subTopic: 'Part 3: The First Revelation',
        explanation: 'At the age of 40, while meditating in the Cave of Hira, the Angel Jibril (AS) appeared to him with the first word of the Qur\'an: "Iqra!" (Read!). This marked the beginning of his prophethood and the transformation of the world.',
        reference: 'Sahih al-Bukhari'
    },
    // --- Biographies of the Sahaba (Companions) ---
    {
        category: 'Seerah',
        title: 'The Great Sahaba',
        subTopic: 'Abu Bakr As-Siddiq (RA)',
        explanation: 'The closest friend of the Prophet (ﷺ) and the first adult male to embrace Islam. He was known for his unwavering faith and was given the title "As-Siddiq" (The Truthful). He became the first Caliph of Islam.',
        reference: 'Biographies of the Companions'
    },
    {
        category: 'Seerah',
        title: 'The Great Sahaba',
        subTopic: 'Umar ibn Al-Khattab (RA)',
        explanation: 'Known as "Al-Faruq" (The one who distinguishes truth from falsehood). His conversion was a major turning point for Islam in Makkah. He became the second Caliph and was famous for his justice and strength.',
        reference: 'Biographies of the Companions'
    },
    {
        category: 'Seerah',
        title: 'The Great Sahaba',
        subTopic: 'Uthman ibn Affan (RA)',
        explanation: 'Known as "Zun-Nurayn" (Possessor of two lights) because he married two of the Prophet\'s (ﷺ) daughters. He was extremely generous and modest, and he oversaw the compilation of the standard Qur\'an Mushaf.',
        reference: 'Biographies of the Companions'
    },
    {
        category: 'Seerah',
        title: 'The Great Sahaba',
        subTopic: 'Ali ibn Abi Talib (RA)',
        explanation: 'The Prophet\'s (ﷺ) cousin and son-in-law. He was the first child to embrace Islam and was known for his extreme bravery, deep knowledge, and wisdom. He became the fourth Caliph.',
        reference: 'Biographies of the Companions'
    }
];

const seedSeerah = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        for (const item of seerahContent) {
            const exists = await LibraryItem.findOne({
                title: item.title,
                subTopic: item.subTopic
            });
            if (!exists) {
                await new LibraryItem(item).save();
                console.log(`Added: ${item.subTopic}`);
            } else {
                console.log(`Skipped: ${item.subTopic}`);
            }
        }

        console.log('Successfully updated Seerah content!');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        mongoose.disconnect();
    }
};

seedSeerah();
