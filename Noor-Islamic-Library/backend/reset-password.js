const mongoose = require('mongoose');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const resetPassword = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/noor_library';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('\nConnected to MongoDB.');

        const users = await User.find({});

        if (users.length === 0) {
            console.log('No users found.');
            process.exit(0);
        }

        console.log('\n--- RESET PASSWORD ---');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (Name: ${user.name})`);
        });
        console.log('----------------------\n');

        rl.question('Select user NUMBER to reset password (or 0 to cancel): ', (answer) => {
            const index = parseInt(answer) - 1;

            if (index >= 0 && index < users.length) {
                const selectedUser = users[index];

                rl.question(`Enter NEW password for ${selectedUser.email}: `, async (newPass) => {
                    if (newPass.length < 6) {
                        console.log('Error: Password must be at least 6 characters.');
                        mongoose.disconnect();
                        process.exit(1);
                    }

                    try {
                        const hashedPassword = await bcrypt.hash(newPass, 12);
                        selectedUser.password = hashedPassword;
                        await selectedUser.save();
                        console.log(`\nSUCCESS: Password for ${selectedUser.email} has been updated.`);
                    } catch (err) {
                        console.error('Error saving password:', err);
                    }

                    mongoose.disconnect();
                    rl.close();
                });

            } else {
                if (answer !== '0') console.log('\nInvalid number.');
                mongoose.disconnect();
                rl.close();
            }
        });

    } catch (err) {
        console.error('Error:', err);
        mongoose.disconnect();
        process.exit(1);
    }
};

resetPassword();
