const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactModel = new Schema({
    contact_name: { type: String },
    contact_email: { type: String },
    contact_message: { type: String },
    contact_time: { type: Number }
});
module.exports = mongoose.model('contact', contactModel, 'contact');