const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./models/quran');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const TAFSIR_IDS = {
    ibnKathirArabic: 14,
    muyassar: 16,
    tabari: 15,
    qurtubi: 90,
    sadi: 91,
    baghawi: 94,
    wasit: 93
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTafsir(id, verseKey) {
    const url = `https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/${verseKey}`;
    try {
        const response = await axios.get(url, { timeout: 10000 });
        return response.data.tafsir.text || '';
    } catch (error) {
        return '';
    }
}

async function translateToAmharic(arabicText) {
    if (!arabicText || arabicText.trim() === '') return '';
    const text = arabicText.replace(/<[^>]*>/g, '').substring(0, 3000);
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=am&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url, { timeout: 15000 });
        if (response.data && response.data[0]) {
            return response.data[0].map(item => item[0]).join('');
        }
        return '';
    } catch (error) {
        return '';
    }
}

async function populateSurah(surahNumber, includeTranslation = false) {
    console.log(`\n📖 Processing Surah ${surahNumber}...`);
    const surah = await Quran.findOne({ surahNumber });
    if (!surah) return;

    for (let i = 0; i < surah.ayahs.length; i++) {
        const ayah = surah.ayahs[i];
        const verseKey = `${surahNumber}:${ayah.number}`;

        const tafsirData = {};
        for (const [fieldName, id] of Object.entries(TAFSIR_IDS)) {
            const text = await fetchTafsir(id, verseKey);
            if (text) {
                tafsirData[fieldName] = text;
                if (includeTranslation) {
                    const amharicField = fieldName.endsWith('Arabic') ? fieldName.replace('Arabic', 'Amharic') : fieldName + 'Amharic';
                    tafsirData[amharicField] = await translateToAmharic(text);
                    await delay(100);
                }
            }
        }

        if (Object.keys(tafsirData).length > 0) {
            await Quran.updateOne(
                { surahNumber, 'ayahs.number': ayah.number },
                { $set: { 'ayahs.$.tafsir': { ...ayah.tafsir, ...tafsirData } } }
            );
        }
        process.stdout.write('.');
        await delay(200);
    }
    console.log(`\n✅ Completed Surah ${surahNumber}`);
}

async function main() {
    await mongoose.connect(MONGO_URI);
    const start = parseInt(process.argv[2]) || 1;
    const end = parseInt(process.argv[3]) || start;
    const translate = process.argv.includes('--translate');

    console.log(`Starting population from Surah ${start} to ${end} ${translate ? 'with' : 'without'} translation...`);

    for (let i = start; i <= end; i++) {
        await populateSurah(i, translate);
        await delay(1000);
    }
    process.exit(0);
}

main();
