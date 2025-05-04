


const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const otpStore = {}; // Temporary OTP store

// Send OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send({ message: 'OTP sent to your email!' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send({ message: 'Error sending OTP' });
  }
};

// Verify OTP
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

console.log(email,otp,otpStore[email],otpStore[email]);





  if (otpStore[email] && otpStore[email] == otp) {
    res.send({ message: 'OTP verified successfully!' });
  } else {
    res.status(400).send({ message: 'Invalid OTP' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!otpStore[email]) {
    return res.status(400).send({ message: 'OTP not verified or expired!' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    delete otpStore[email];
    res.send({ message: 'Password reset successful!' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send({ message: 'Something went wrong, please try again later.' });
  }
};





