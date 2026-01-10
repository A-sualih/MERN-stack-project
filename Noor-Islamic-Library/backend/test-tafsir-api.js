// Test alternative Tafsir endpoint - using tafsir detail API
const axios = require('axios');

async function findArabicTafsirs() {
    console.log('Fetching all available Tafsirs...\n');

    try {
        const res = await axios.get('https://api.quran.com/api/v4/resources/tafsirs');
        const tafsirs = res.data.tafsirs;

        console.log('Arabic Tafsirs:');
        console.log('===============');
        const arabicOnes = tafsirs.filter(t => t.language_name === 'arabic');
        arabicOnes.forEach(t => {
            console.log(`ID ${t.id}: ${t.name} by ${t.author_name}`);
        });

        console.log('\n\nAll Tafsirs by Language:');
        console.log('========================');
        const byLang = {};
        tafsirs.forEach(t => {
            if (!byLang[t.language_name]) byLang[t.language_name] = [];
            byLang[t.language_name].push(t);
        });

        Object.keys(byLang).sort().forEach(lang => {
            console.log(`\n${lang.toUpperCase()} (${byLang[lang].length}):`);
            byLang[lang].forEach(t => console.log(`   ${t.id}: ${t.name}`));
        });

        // Test verse 1:1 with a different endpoint
        console.log('\n\nTesting verse endpoint for 1:1...');
        const verseRes = await axios.get('https://api.quran.com/api/v4/verses/by_key/1:1?tafsirs=14,15,16,90,91,93,94&fields=text_uthmani');
        console.log('Verse data:', JSON.stringify(verseRes.data, null, 2).substring(0, 500));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

findArabicTafsirs();
