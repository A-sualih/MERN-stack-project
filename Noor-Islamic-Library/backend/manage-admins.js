const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/user');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const manageAdmins = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('\nConnected to MongoDB.');

        const users = await User.find({});

        if (users.length === 0) {
            console.log('No users found in the database. Please sign up in the app first.');
            process.exit(0);
        }

        console.log('\n--- SYSTEM USERS ---');
        users.forEach((user, index) => {
            const role = user.role === 'admin' ? ' [ADMIN]' : '';
            console.log(`${index + 1}. ${user.name} (${user.email})${role}`);
        });
        console.log('--------------------\n');

        rl.question('Enter the NUMBER of the user you want to make Admin (or 0 to cancel): ', async (answer) => {
            const index = parseInt(answer) - 1;

            if (index >= 0 && index < users.length) {
                const selectedUser = users[index];
                selectedUser.role = 'admin';
                await selectedUser.save();
                console.log(`\nSUCCESS: ${selectedUser.name} (${selectedUser.email}) is now an ADMIN.`);
            } else if (answer !== '0') {
                console.log('\nInvalid number.');
            }

            mongoose.disconnect();
            rl.close();
            process.exit(0);
        });

    } catch (err) {
        console.error('Error:', err);
        mongoose.disconnect();
        process.exit(1);
    }
};

manageAdmins();
