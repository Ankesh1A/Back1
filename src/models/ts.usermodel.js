const mongoose = require('mongoose');
const tsSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    
  },
   area: {
     type: String,
    
   },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });
const tsModel= mongoose.model('ts', tsSchema);
module.exports = tsModel;