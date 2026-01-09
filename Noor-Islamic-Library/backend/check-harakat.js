const axios = require('axios');

async function checkHarakat() {
    const ids = [16, 90, 166, 167, 168];
    for (const id of ids) {
        try {
            const res = await axios.get(`https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/1:1`);
            console.log(`ID ${id}:`, res.data.tafsir.text.substring(0, 200));
        } catch (err) {
            console.error(`Error for ID ${id}:`, err.message);
        }
    }
}

checkHarakat();
