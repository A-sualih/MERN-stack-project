const axios = require('axios');

async function findResources() {
    try {
        const transRes = await axios.get('https://api.quran.com/api/v4/resources/translations');
        const amharic = transRes.data.translations.find(t => t.language_name.toLowerCase() === 'amharic');
        console.log('Amharic Translation:', amharic);

        const tafsirRes = await axios.get('https://api.quran.com/api/v4/resources/tafsirs');
        const ibnKathir = tafsirRes.data.tafsirs.find(t => t.slug.includes('kathir'));
        console.log('Ibn Kathir Tafsir:', ibnKathir);
    } catch (err) {
        console.error(err.message);
    }
}

findResources();
