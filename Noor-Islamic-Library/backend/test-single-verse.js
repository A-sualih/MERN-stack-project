const axios = require('axios');

async function testApi() {
    const tafsirId = 90;
    const verseKey = '2:1';
    const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`;

    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
        console.log('Keys:', Object.keys(response.data.tafsir));
        console.log(`Text: ${response.data.tafsir.text.substring(0, 100)}...`);
    } catch (error) {
        console.error('API Error:', error.message);
    }
}

testApi();
