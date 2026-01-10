const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { translate } = require('google-translate-api-x');

const TARGET_FILE = path.join(__dirname, 'amharic_hadiths.json');

// Load existing translations
let translations = {};
if (fs.existsSync(TARGET_FILE)) {
    try {
        translations = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
    } catch (e) {
        console.error("Error reading existing translations:", e);
    }
}

const collections = [
    { name: 'Sahih Bukhari', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/bukhari.json' },
    { name: 'Sahih Muslim', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/muslim.json' },
    { name: 'Sunan Abu Dawood', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/abudawud.json' },
    { name: 'Jami At-Tirmidhi', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/tirmidhi.json' },
    { name: "Sunan an-Nasa'i", url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/nasai.json' },
    { name: 'Sunan Ibn Majah', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/ibnmajah.json' }
];

const BATCH_SIZE = 20; // Translate 20 items per collection for demo
const DELAY_MS = 1000; // 1 second delay between requests to be polite

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTranslation = async () => {
    for (const col of collections) {
        console.log(`\nProcessing ${col.name}...`);

        if (!translations[col.name]) {
            translations[col.name] = {};
        }

        try {
            const response = await axios.get(col.url);
            const hadiths = response.data.hadiths || [];

            let count = 0;
            for (const h of hadiths) {
                const id = String(h.id);

                // Skip if already translated
                if (translations[col.name][id]) {
                    continue;
                }

                if (count >= BATCH_SIZE) break;

                const textToTranslate = h.english?.text || h.english || "";
                if (!textToTranslate) continue;

                try {
                    // Simple cleaning of text
                    const cleanText = textToTranslate.replace(/<[^>]*>/g, '').trim();
                    if (cleanText.length < 5) continue;

                    const res = await translate(cleanText, { to: 'am' });
                    translations[col.name][id] = res.text;
                    console.log(`Translated ${col.name} #${id}`);
                    count++;

                    await sleep(DELAY_MS);
                } catch (err) {
                    console.error(`Failed to translate ${col.name} #${id}:`, err.message);
                }
            }

            // Save after each collection
            fs.writeFileSync(TARGET_FILE, JSON.stringify(translations, null, 2));
            console.log(`Saved translations for ${col.name}`);

        } catch (err) {
            console.error(`Error fetching ${col.name}:`, err.message);
        }
    }
    console.log('\nTranslation complete!');
};

runTranslation();
