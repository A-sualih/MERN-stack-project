const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Book', bookSchema);
