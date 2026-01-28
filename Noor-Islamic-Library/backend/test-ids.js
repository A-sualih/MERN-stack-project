const axios = require('axios');

async function testApi() {
    const ids = [14, 15, 16, 90, 91, 93, 94];
    for (const id of ids) {
        const url = `https://api.quran.com/api/v4/verses/by_key/2:1?tafsirs=${id}`;
        try {
            const response = await axios.get(url);
            const count = response.data.verse.tafsirs?.length || 0;
            console.log(`ID ${id}: ${count} tafsirs returned`);
        } catch (error) {
            console.log(`ID ${id}: Error ${error.message}`);
        }
    }
}

testApi();
