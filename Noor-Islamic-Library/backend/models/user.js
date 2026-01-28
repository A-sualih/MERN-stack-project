const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin', 'content-admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    dateOfBirth: { type: Date },
    country: { type: String },
    streetAddress: { type: String },
    aptSuite: { type: String },
    city: { type: String },
    stateProvince: { type: String },
    zipPostalCode: { type: String },
    phone: { type: String },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Bookmark' }],
    notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    downloads: [{ type: Schema.Types.ObjectId, ref: 'Book' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);


