const express= require('express');
const userModel = require('../models/user.model');
const author = require('../middleware/user.middleware');
const router= express.Router();
router.get("/getuser", author, async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });




router.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' }); // Clear the cookie
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;

