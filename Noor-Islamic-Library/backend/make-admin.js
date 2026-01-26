const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const promoteUserToAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('Please provide an email address. Usage: node make-admin.js <email>');
        process.exit(1);
    }

    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: email });

        if (!user) {
            console.log(`User with email '${email}' not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User '${user.name}' (${user.email}) is now an ADMIN.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.disconnect();
    }
};

promoteUserToAdmin();
