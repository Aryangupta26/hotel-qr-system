const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Table = require('../models/Table');
const { protect } = require('../middleware/auth');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const tables = await Table.find({}).sort({ tableNumber: 1 });
    
    // Dynamically regenerate QR codes based on the current frontend origin
    // This guarantees QR codes work perfectly after deploying to production without database resets
    const frontendBaseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const tablesWithDynamicQR = await Promise.all(tables.map(async (table) => {
      const qrUrl = `${frontendBaseUrl}/table/${encodeURIComponent(table.tableNumber)}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      return {
        ...table.toObject(),
        qrCodeDataUrl // Override the static one from the DB
      };
    }));

    res.json({ success: true, count: tables.length, data: tablesWithDynamicQR });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tables' });
  }
});

// @desc    Validate if a table number is active/exists
// @route   GET /api/tables/validate/:tableNumber
// @access  Public
router.get('/validate/:tableNumber', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber, status: 'active' });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table is invalid or inactive' });
    }
    res.json({ success: true, tableNumber: table.tableNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error validating table' });
  }
});

// @desc    Create a new table & generate QR code
// @route   POST /api/tables
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const { tableNumber } = req.body;

  try {
    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'Please provide a table number or label' });
    }

    // Check if table already exists
    const existingTable = await Table.findOne({ tableNumber: tableNumber.trim() });
    if (existingTable) {
      return res.status(400).json({ success: false, message: 'Table number already exists' });
    }

    // Define QR code target URL pointing to frontend
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrUrl = `${frontendBaseUrl}/table/${encodeURIComponent(tableNumber.trim())}`;
    
    // Generate QR code data URL (Base64 PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a', // Tailwind slate-900 for premium dark aesthetic
        light: '#ffffff'
      }
    });

    const newTable = await Table.create({
      tableNumber: tableNumber.trim(),
      qrCodeDataUrl,
      status: 'active'
    });

    res.status(201).json({ success: true, data: newTable });
  } catch (err) {
    console.error('[Table Route] Create error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create table and generate QR code' });
  }
});

// @desc    Toggle table status (active/inactive)
// @route   PUT /api/tables/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    table.status = status || table.status;
    await table.save();
    
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update table' });
  }
});

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    await Table.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete table' });
  }
});

module.exports = router;
