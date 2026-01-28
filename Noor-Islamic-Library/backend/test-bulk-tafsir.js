const axios = require('axios');

async function testApi() {
    const tafsirId = 169;
    const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}`;

    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
        console.log('Keys:', Object.keys(response.data));
    } catch (error) {
        console.error('API Error:', error.message);
    }
}

testApi();
