const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: true
  }
}, { timestamps: true });
const contactModel= mongoose.model('Contact', contactSchema);
module.exports = contactModel;
