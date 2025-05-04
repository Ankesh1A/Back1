const contactModel = require('../models/contact.models ');
const tsModel = require('../models/ts.usermodel');


const contact = async (req, res) => {
    const { email } = req.body;
    try {
      const newContact = new contactModel({  email });
      await newContact.save();
      res.status(201).json({ message: 'Message received successfully!' });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ message: 'Server error while saving message' });
    }
  }
  module.exports= {contact};