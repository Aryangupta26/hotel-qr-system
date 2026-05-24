const express = require('express');
const router = express.Router();
const fs = require('fs');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials exist
let isCloudinaryConfigured = false;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isCloudinaryConfigured = true;
  console.log('[Uploads] Cloudinary configured successfully.');
} else {
  console.log('[Uploads] Cloudinary credentials missing. Falling back to local server storage.');
}

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch menu items' });
  }
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch menu item' });
  }
});

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, description, price, image, category, isAvailable } = req.body;

  try {
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please include name, price, and category' });
    }

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      image,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error('[Menu Route] Create error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create menu item' });
  }
});

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error('[Menu Route] Update error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update menu item' });
  }
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Try to delete local image file if present and not a remote URL
    if (item.image && item.image.startsWith('/uploads/')) {
      const filePath = require('path').join(__dirname, '..', item.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Uploads] Deleted associated file: ${filePath}`);
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('[Menu Route] Delete error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete menu item' });
  }
});

// @desc    Upload an image for a food item
// @route   POST /api/menu/upload
// @access  Private
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    if (isCloudinaryConfigured) {
      // Upload local file to Cloudinary
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'hotel_qr_menu'
        });
        
        // Remove file from local server storage
        fs.unlinkSync(req.file.path);
        
        return res.json({
          success: true,
          url: result.secure_url
        });
      } catch (cloudErr) {
        console.error('[Uploads Error] Cloudinary upload failed. Falling back to local URL.', cloudErr.message);
        // Continue fallback to local path if Cloudinary fails
      }
    }

    // Local file fallback url (relative path to backend)
    const localUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: localUrl
    });
  } catch (err) {
    console.error('[Upload Route] Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Image upload failed' });
  }
});

module.exports = router;
