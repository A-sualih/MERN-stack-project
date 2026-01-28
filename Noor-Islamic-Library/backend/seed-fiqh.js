const mongoose = require('mongoose');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const fiqhItems = [
    {
        category: 'Fiqh',
        subTopic: 'Taharah (Purification)',
        title: 'Importance of Purification',
        arabicText: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
        translation: 'Purity is half of faith.',
        explanation: 'In Islam, physical and spiritual cleanliness are deeply linked. One cannot perform the major acts of worship like Salah without being in a state of ritual purity.',
        reference: 'Sahih Muslim 223'
    },
    {
        category: 'Fiqh',
        subTopic: 'Taharah (Purification)',
        title: 'How to Perform Wudu (Ablution)',
        arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ',
        translation: 'O you who have believed, when you rise to [perform] prayer, wash your faces and your forearms to the elbows and wipe over your heads and wash your feet to the ankles.',
        explanation: 'Wudu is obligatory for Salah. The essential steps are: 1) Intention, 2) Washing the face, 3) Washing arms to elbows, 4) Wiping the head, 5) Washing feet to ankles, and 6) Following the sequence.',
        reference: 'Quran 5:6'
    },
    {
        category: 'Fiqh',
        subTopic: 'Salah (Prayer)',
        title: 'The Five Daily Prayers',
        arabicText: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
        translation: 'Indeed, prayer has been decreed upon the believers a decree of specified times.',
        explanation: 'Salah is the second pillar of Islam. The five daily prayers are: Fajr (Dawn), Dhuhr (Noon), Asr (Afternoon), Maghrib (Sunset), and Isha (Night). They serve as a constant connection between the servant and the Creator.',
        reference: 'Quran 4:103'
    },
    {
        category: 'Fiqh',
        subTopic: 'Salah (Prayer)',
        title: 'Conditions of Salah (Shurut)',
        translation: 'Conditions that must be met before starting the prayer.',
        explanation: 'For Salah to be valid, nine conditions must be met: 1) Islam, 2) Sanity, 3) Age of discernment, 4) Removal of impurity (Hadath), 5) Removal of filth from body/clothes/place, 6) Covering the Awrah, 7) Entrance of the prayer time, 8) Facing the Qiblah, and 9) Intention (Niyyah).',
        reference: 'Fiqh Consensus'
    },
    {
        category: 'Fiqh',
        subTopic: 'Zakat (Almsgiving)',
        title: 'Purpose of Zakat',
        arabicText: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا',
        translation: 'Take, [O, Muhammad], from their wealth a charity by which you purify them and cause them increase.',
        explanation: 'Zakat is the third pillar of Islam. It is a mandatory charity (2.5% of surplus wealth held for a lunar year) that purifies the soul from greed and supports the less fortunate in the community.',
        reference: 'Quran 9:103'
    },
    {
        category: 'Fiqh',
        subTopic: 'Sawm (Fasting)',
        title: 'Obligation of Fasting',
        arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
        translation: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.',
        explanation: 'Fasting during the month of Ramadan is the fourth pillar of Islam. It involves abstaining from food, drink, and intimate relations from dawn until sunset, focusing on self-discipline and God-consciousness (Taqwa).',
        reference: 'Quran 2:183'
    },
    {
        category: 'Fiqh',
        subTopic: 'Hajj (Pilgrimage)',
        title: 'The Journey of a Lifetime',
        arabicText: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا',
        translation: 'And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way.',
        explanation: 'Hajj is the fifth pillar of Islam. It is obligatory once in a lifetime for every adult Muslim who is physically and financially able to undertake the journey to Makkah during the month of Dhu al-Hijjah.',
        reference: 'Quran 3:97'
    },
    {
        category: 'Fiqh',
        subTopic: 'General Rules',
        title: 'The Rule of Facilitation',
        arabicText: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ',
        translation: 'Allah intends for you ease and does not intend for you hardship.',
        explanation: 'A fundamental principle of Fiqh is that "Hardship brings ease." Islam provides concessions (Rukhsah) in difficult circumstances, such as prayng while sitting if unable to stand, or breaking the fast when ill or traveling.',
        reference: 'Quran 2:185'
    },
    {
        category: 'Fiqh',
        subTopic: 'Food and Drink',
        title: 'General Rule of Halal',
        arabicText: 'يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا',
        translation: 'O mankind, eat from whatever is on earth [that is] lawful and good.',
        explanation: 'The default ruling for food and drink is permissibility (Halal), except what has been explicitly forbidden by Allah (Haram), such as pork, intoxicants (alcohol), and animals not slaughtered in the name of Allah.',
        reference: 'Quran 2:168'
    },
    {
        category: 'Fiqh',
        subTopic: 'Business and Ethics',
        title: 'Truthfulness in Trade',
        arabicText: 'إِنَّمَا الْبَيْعُ عَنْ تَرَاضٍ',
        translation: 'Business transactions must only be by mutual consent.',
        explanation: 'Fiqh is not just about worship (Ibadah) but also about dealings (Muamalat). Islamic law emphasizes honesty, transparency, and fairness in all financial transactions, strictly prohibiting interest (Riba) and deception (Gharar).',
        reference: 'Ibn Majah 2185'
    }
];

const seedFiqh = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database...');

        // Remove only Fiqh category items
        await LibraryItem.deleteMany({ category: 'Fiqh' });
        console.log('Cleared existing Fiqh items...');

        // Insert new Fiqh items
        await LibraryItem.insertMany(fiqhItems);
        console.log(`Successfully seeded ${fiqhItems.length} Fiqh items!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding Fiqh items:', err);
        process.exit(1);
    }
};

seedFiqh();
