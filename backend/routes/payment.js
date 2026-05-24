const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Fallback mock keys if the user hasn't provided real ones
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dummysecret';

let razorpayInstance = null;

if (!RZP_KEY_ID.includes('dummy')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RZP_KEY_ID,
      key_secret: RZP_KEY_SECRET
    });
  } catch (err) {
    console.error('Failed to initialize Razorpay', err);
  }
}

// @desc    Create a Razorpay order before checkout
// @route   POST /api/payment/create-order
// @access  Public
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  // If using dummy keys, return a mock order ID
  if (!razorpayInstance) {
    console.log('[Payment] Using Mock Razorpay Order');
    return res.json({
      success: true,
      data: {
        id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        isMock: true
      }
    });
  }

  const options = {
    amount: amount * 100, // Razorpay works in paise (amount * 100)
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('[Payment Error] Failed to create Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize payment gateway' });
  }
});

// @desc    Verify payment signature
// @route   POST /api/payment/verify
// @access  Public
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

  // If we are in mock mode, bypass actual signature validation
  if (isMock || !razorpayInstance) {
    console.log('[Payment] Mock Payment Verified Successfuly');
    return res.json({ success: true, message: 'Payment verified successfully (Mock Mode)' });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment signature details' });
  }

  try {
    // Generate our own signature using the secret
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RZP_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('[Payment Verify Error]:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
