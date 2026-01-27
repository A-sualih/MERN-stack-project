const mongoose = require('mongoose');
const LibraryItem = require('./models/library-item');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

const duas = [
    // Morning & Evening Adhkar
    {
        category: 'Duas',
        subTopic: 'Morning Adhkar',
        title: 'Morning Remembrance',
        arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا شَرِيكَ لَهُ لَا إِلَهَ إِلَّا هُوَ وَإِلَيْهِ النُّشُورُ',
        translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Him, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.',
        explanation: 'This dua is recited in the morning to acknowledge Allah\'s sovereignty and express gratitude. It reminds us that all power and praise belong to Allah alone.',
        reference: 'Abu Dawud 4/317'
    },
    {
        category: 'Duas',
        subTopic: 'Morning Adhkar',
        title: 'Ayat al-Kursi',
        arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
        explanation: 'The greatest verse in the Quran. Reciting it in the morning and evening provides protection from harm. The Prophet (ﷺ) said whoever recites it after each prayer, nothing prevents him from entering Paradise except death.',
        reference: 'Quran 2:255'
    },
    {
        category: 'Duas',
        subTopic: 'Evening Adhkar',
        title: 'Evening Remembrance',
        arabicText: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا شَرِيكَ لَهُ لَا إِلَهَ إِلَّا هُوَ وَإِلَيْهِ النُّشُورُ',
        translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Him, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.',
        explanation: 'The evening equivalent of the morning remembrance, acknowledging Allah\'s sovereignty as the day ends.',
        reference: 'Abu Dawud 4/317'
    },

    // Before Sleep
    {
        category: 'Duas',
        subTopic: 'Before Sleep',
        title: 'Sleeping Dua',
        arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        translation: 'In Your name O Allah, I die and I live.',
        explanation: 'This dua is recited when going to bed, acknowledging that sleep is like a small death and waking is like resurrection.',
        reference: 'Sahih al-Bukhari 6312'
    },
    {
        category: 'Duas',
        subTopic: 'Before Sleep',
        title: 'Protection Before Sleep',
        arabicText: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
        explanation: 'A dua seeking Allah\'s protection from the punishment of the grave and the Day of Judgment.',
        reference: 'Abu Dawud 4/311'
    },

    // Upon Waking
    {
        category: 'Duas',
        subTopic: 'Upon Waking',
        title: 'Waking Up Dua',
        arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
        explanation: 'This dua is recited upon waking up, thanking Allah for granting us another day of life.',
        reference: 'Sahih al-Bukhari 6312'
    },

    // Entering/Leaving Home
    {
        category: 'Duas',
        subTopic: 'Entering Home',
        title: 'Entering Home',
        arabicText: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
        translation: 'In the name of Allah we enter and in the name of Allah we leave, and upon Allah, our Lord, we place our trust.',
        explanation: 'This dua is recited when entering one\'s home, seeking Allah\'s blessings and protection.',
        reference: 'Abu Dawud 4/325'
    },
    {
        category: 'Duas',
        subTopic: 'Leaving Home',
        title: 'Leaving Home',
        arabicText: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
        explanation: 'When leaving home, this dua seeks Allah\'s protection and guidance. The Prophet (ﷺ) said whoever says this will be protected, guided, and sufficient.',
        reference: 'Abu Dawud 4/325, At-Tirmidhi 5/490'
    },

    // Entering/Leaving Masjid
    {
        category: 'Duas',
        subTopic: 'Entering Masjid',
        title: 'Entering the Mosque',
        arabicText: 'أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ',
        translation: 'I seek refuge in Allah the Magnificent, in His Noble Face, and in His Eternal Dominion, from the accursed Satan.',
        explanation: 'This dua is recited when entering the mosque, seeking protection from Satan.',
        reference: 'Abu Dawud 1/126'
    },
    {
        category: 'Duas',
        subTopic: 'Leaving Masjid',
        title: 'Leaving the Mosque',
        arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        translation: 'O Allah, I ask You from Your favor.',
        explanation: 'A humble request for Allah\'s blessings and mercy when leaving the mosque.',
        reference: 'Sahih Muslim 1/494'
    },

    // Before/After Eating
    {
        category: 'Duas',
        subTopic: 'Before Eating',
        title: 'Before Eating',
        arabicText: 'بِسْمِ اللَّهِ',
        translation: 'In the name of Allah.',
        explanation: 'The simplest and most important dua before eating. If forgotten, say: "Bismillahi awwalahu wa akhirahu" (In the name of Allah at its beginning and at its end).',
        reference: 'Abu Dawud 3/347, At-Tirmidhi 4/288'
    },
    {
        category: 'Duas',
        subTopic: 'After Eating',
        title: 'After Eating',
        arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
        translation: 'All praise is for Allah, who fed us and gave us drink, and made us Muslims.',
        explanation: 'Expressing gratitude to Allah for the sustenance He has provided.',
        reference: 'Abu Dawud 4/406, At-Tirmidhi 5/507'
    },

    // Travel Duas
    {
        category: 'Duas',
        subTopic: 'Travel',
        title: 'Traveling Dua',
        arabicText: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
        translation: 'Glory is to Him Who has subjected this to us, and we could never have it by our efforts. Surely, to our Lord we are returning.',
        explanation: 'This dua is recited when mounting a vehicle or animal for travel, acknowledging Allah\'s favor.',
        reference: 'Abu Dawud 3/34, At-Tirmidhi 5/501'
    },

    // Seeking Forgiveness
    {
        category: 'Duas',
        subTopic: 'Seeking Forgiveness',
        title: 'Sayyid al-Istighfar (Master of Seeking Forgiveness)',
        arabicText: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of which I have committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.',
        explanation: 'The Prophet (ﷺ) said: "Whoever says this with firm faith in the daytime and dies on the same day before the evening, he will be from the people of Paradise; and if somebody recites it at night with firm faith in it and dies before the morning, he will be from the people of Paradise."',
        reference: 'Sahih al-Bukhari 7/150'
    },
    {
        category: 'Duas',
        subTopic: 'Seeking Forgiveness',
        title: 'Simple Istighfar',
        arabicText: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
        translation: 'I seek Allah\'s forgiveness and repent to Him.',
        explanation: 'The Prophet (ﷺ) used to seek Allah\'s forgiveness more than 70 times a day. This simple yet powerful dua should be repeated frequently.',
        reference: 'Sahih al-Bukhari 6/2662'
    },

    // Protection Duas
    {
        category: 'Duas',
        subTopic: 'Protection',
        title: 'Protection from All Evil',
        arabicText: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
        explanation: 'This dua provides protection from all harm. The Prophet (ﷺ) said whoever says this three times in the evening will be protected from harmful stings.',
        reference: 'Sahih Muslim 4/2080'
    },
    {
        category: 'Duas',
        subTopic: 'Protection',
        title: 'Protection from Evil Eye',
        arabicText: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
        translation: 'I seek refuge in the perfect words of Allah from every devil and every poisonous pest and from every evil eye.',
        explanation: 'The Prophet (ﷺ) used this dua to seek protection for Al-Hasan and Al-Husain.',
        reference: 'Sahih al-Bukhari 4/119'
    },

    // Distress & Anxiety
    {
        category: 'Duas',
        subTopic: 'Distress & Anxiety',
        title: 'Dua for Anxiety',
        arabicText: 'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
        translation: 'O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand. Your command over me is forever executed and Your decree over me is just. I ask You by every name belonging to You which You have named Yourself with, or revealed in Your Book, or You taught to any of Your creation, or You have preserved in the knowledge of the Unseen with You, that You make the Quran the life of my heart and the light of my breast, and a departure for my sorrow and a release for my anxiety.',
        explanation: 'The Prophet (ﷺ) said: "Whoever says this, Allah will take away his distress and sorrow, and replace it with relief."',
        reference: 'Ahmad 1/391'
    },
    {
        category: 'Duas',
        subTopic: 'Distress & Anxiety',
        title: 'Dua in Difficulty',
        arabicText: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
        translation: 'None has the right to be worshipped except Allah, the Magnificent, the Forbearing. None has the right to be worshipped except Allah, Lord of the Magnificent Throne. None has the right to be worshipped except Allah, Lord of the heavens, Lord of the Earth and Lord of the Noble Throne.',
        explanation: 'The Prophet (ﷺ) would say this dua at times of distress.',
        reference: 'Sahih al-Bukhari 8/154, Sahih Muslim 4/2092'
    },

    // Gratitude
    {
        category: 'Duas',
        subTopic: 'Gratitude',
        title: 'General Gratitude',
        arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'All praise is for Allah, Lord of all the worlds.',
        explanation: 'A simple yet comprehensive expression of gratitude to Allah for all His blessings.',
        reference: 'Quran 1:2'
    },
    {
        category: 'Duas',
        subTopic: 'Gratitude',
        title: 'After Sneezing',
        arabicText: 'الْحَمْدُ لِلَّهِ',
        translation: 'All praise is for Allah.',
        explanation: 'When someone sneezes and says Alhamdulillah, the response is "Yarhamukallah" (May Allah have mercy on you).',
        reference: 'Sahih al-Bukhari 7/125'
    },

    // Seeking Knowledge
    {
        category: 'Duas',
        subTopic: 'Seeking Knowledge',
        title: 'Dua for Beneficial Knowledge',
        arabicText: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا',
        translation: 'O Allah, benefit me with what You have taught me, and teach me what will benefit me, and increase me in knowledge.',
        explanation: 'A comprehensive dua for students and seekers of knowledge.',
        reference: 'Sunan Ibn Majah 251'
    },
    {
        category: 'Duas',
        subTopic: 'Seeking Knowledge',
        title: 'Dua for Understanding',
        arabicText: 'رَبِّ زِدْنِي عِلْمًا',
        translation: 'My Lord, increase me in knowledge.',
        explanation: 'A short but powerful dua from the Quran for seeking more knowledge.',
        reference: 'Quran 20:114'
    },

    // For Parents
    {
        category: 'Duas',
        subTopic: 'For Parents',
        title: 'Dua for Parents',
        arabicText: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
        explanation: 'A beautiful dua from the Quran for our parents, acknowledging their care and sacrifice.',
        reference: 'Quran 17:24'
    },

    // For Spouse & Children
    {
        category: 'Duas',
        subTopic: 'For Family',
        title: 'Dua for Righteous Spouse and Children',
        arabicText: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
        translation: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.',
        explanation: 'A comprehensive dua for a blessed family life.',
        reference: 'Quran 25:74'
    },

    // Rain & Weather
    {
        category: 'Duas',
        subTopic: 'Rain & Weather',
        title: 'When it Rains',
        arabicText: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
        translation: 'O Allah, may it be a beneficial rain cloud.',
        explanation: 'A dua to be said when it rains, asking Allah to make the rain beneficial.',
        reference: 'Sahih al-Bukhari 1/205'
    },
    {
        category: 'Duas',
        subTopic: 'Rain & Weather',
        title: 'After Rain',
        arabicText: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ',
        translation: 'It has rained by the grace of Allah and His mercy.',
        explanation: 'Acknowledging that rain is a blessing from Allah.',
        reference: 'Sahih al-Bukhari 1/205, Sahih Muslim 1/83'
    },

    // Seeing Something Pleasing
    {
        category: 'Duas',
        subTopic: 'Daily Life',
        title: 'When Seeing Something You Like',
        arabicText: 'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ',
        translation: 'What Allah wills. There is no power except with Allah.',
        explanation: 'This protects from the evil eye and acknowledges that all good is from Allah.',
        reference: 'Quran 18:39'
    },

    // For the Deceased
    {
        category: 'Duas',
        subTopic: 'For the Deceased',
        title: 'Dua for the Deceased',
        arabicText: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
        translation: 'O Allah, forgive him and have mercy on him and give him strength and pardon him.',
        explanation: 'A comprehensive dua for someone who has passed away.',
        reference: 'Sahih Muslim 2/663'
    },

    // Entering Bathroom
    {
        category: 'Duas',
        subTopic: 'Daily Life',
        title: 'Entering the Bathroom',
        arabicText: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        translation: 'O Allah, I seek refuge in You from male and female evil spirits.',
        explanation: 'Seeking Allah\'s protection when entering the bathroom.',
        reference: 'Sahih al-Bukhari 1/45, Sahih Muslim 1/283'
    },

    // General Supplications
    {
        category: 'Duas',
        subTopic: 'General Supplications',
        title: 'Dua for Good in This World and the Hereafter',
        arabicText: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        translation: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.',
        explanation: 'One of the most comprehensive and frequently recited duas, covering all aspects of life.',
        reference: 'Quran 2:201'
    }
];

const seedDuas = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database...');

        // Remove only Duas category items
        await LibraryItem.deleteMany({ category: 'Duas' });
        console.log('Cleared existing Duas...');

        // Insert new duas
        await LibraryItem.insertMany(duas);
        console.log(`Successfully seeded ${duas.length} duas!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding duas:', err);
        process.exit(1);
    }
};

seedDuas();
