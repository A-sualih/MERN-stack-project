const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String }, // Emoji or icon name
    type: { type: String, enum: ['Book', 'Library'], default: 'Book' } // To distinguish book categories from library topics
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
