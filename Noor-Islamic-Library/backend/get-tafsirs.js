const axios = require('axios');
const fs = require('fs');

async function getAllTafsirs() {
    try {
        const res = await axios.get('https://api.quran.com/api/v4/resources/tafsirs');
        const arabicOnly = res.data.tafsirs.filter(t => t.language_name === 'arabic');
        fs.writeFileSync('all_arabic_tafsirs.json', JSON.stringify(arabicOnly, null, 2));
        console.log('Saved', arabicOnly.length, 'Arabic tafsirs.');
    } catch (err) {
        console.error(err.message);
    }
}

getAllTafsirs();
