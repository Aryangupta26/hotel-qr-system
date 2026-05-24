const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { protect } = require('../middleware/auth');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforhotelqrorderingsystem1234', {
    expiresIn: '30d'
  });
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Check for admin user (using case insensitive search for better UX)
    const admin = await AdminUser.findOne({ 
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } 
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(admin._id),
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('[Auth Route] Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

module.exports = router;
