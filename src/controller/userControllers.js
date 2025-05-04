const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// Log email config to confirm it's loaded
console.log("Configured email user:", process.env.EMAIL_USER);

// Nodemailer transport setup with debugging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to send messages!",success);
  }
});


// OTP expiration time (5 minutes)
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; 

// Function to generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code for Email Verification',
    text: `Your OTP code is: ${otp}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.response);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

// User Registration ✅
const register = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiration = Date.now() + OTP_EXPIRATION_TIME;

    const user = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
      otp,
      otpExpiration,
      isVerified: false
    });

    // console.log("User otp1:", user.otp); 
    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: "Registration successful. OTP has been sent to your email. Please verify your email to complete the registration."
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};


// Verify OTP ✅  
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  console.log("Received OTP:", otp); // Log the received OTP for debugging
  console.log("Received email:", email); // Log the received email for debugging

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
      console.log("User otp1:", user.otp); // Log the user object for debugging
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpiration < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// User Login ✅
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await userModel.findOne({ email });

    if (!userExists) {
      console.log("login failed: user not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!userExists.isVerified) {
      console.log("login failed: user not verified");
      return res.status(401).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      console.log("login failed: password mismatched");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: userExists._id }, process.env.JWT_SEC, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: userExists._id, fullname: userExists.fullname, email: userExists.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Send OTP manually if needed
const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOtp();
    await sendOtpEmail(email, otp);
    const user = await userModel.findOne({ email });
    if (user) {
      user.otp = otp;
      await user.save();
    }
    res.status(200).json({ message: "OTP sent to email!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = { register, userLogin, sendOtp, verifyOtp };
