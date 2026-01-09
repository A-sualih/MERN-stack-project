const axios = require('axios');
const fs = require('fs');

async function getAllTafsirs() {
    try {
        const res = await axios.get('https://api.quran.com/api/v4/resources/tafsirs');
        fs.writeFileSync('complete_tafsirs_list.json', JSON.stringify(res.data.tafsirs, null, 2));
        console.log('Saved', res.data.tafsirs.length, 'total tafsirs.');
    } catch (err) {
        console.error(err.message);
    }
}

getAllTafsirs();
