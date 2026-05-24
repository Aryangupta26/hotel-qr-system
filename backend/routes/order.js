const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/auth');

// Helper to generate a short, readable 4-digit unique order number
const generateOrderNumber = async () => {
  let isUnique = false;
  let orderNum = '';
  
  while (!isUnique) {
    // Generate a random 4-digit number
    const num = Math.floor(1000 + Math.random() * 9000);
    orderNum = `#${num}`;
    
    // Check if it's unique in the database
    const existing = await Order.findOne({ orderNumber: orderNum });
    if (!existing) {
      isUnique = true;
    }
  }
  return orderNum;
};

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
  const { tableNumber, items, specialInstructions } = req.body;

  try {
    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide table number and items in cart' });
    }

    const resolvedItems = [];
    let calculatedTotal = 0;

    // Validate each item and calculate price to ensure security against price tampering
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item not found: ${item.name}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Item ${menuItem.name} is currently out of stock` });
      }

      const itemTotal = menuItem.price * item.quantity;
      calculatedTotal += itemTotal;

      resolvedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      tableNumber,
      items: resolvedItems,
      totalAmount: calculatedTotal,
      specialInstructions: specialInstructions || '',
      orderStatus: 'New',
      paymentStatus: req.body.paymentStatus || 'Pending',
      paymentId: req.body.paymentId || ''
    });

    // Emit live socket notification to kitchen and admins
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('newOrder', order);
      console.log(`[Socket] Emitted newOrder event for order: ${order.orderNumber}`);
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error('[Order Route] Checkout error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// @desc    Get active orders (New, Preparing, Ready) for kitchen/admin boards
// @route   GET /api/orders/active
// @access  Private (Or public for kitchen board in this single-branch context)
router.get('/active', async (req, res) => {
  try {
    const activeOrders = await Order.find({
      orderStatus: { $in: ['New', 'Preparing', 'Ready'] }
    }).sort({ createdAt: 1 }); // Oldest first for queue order
    res.json({ success: true, count: activeOrders.length, data: activeOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch active orders' });
  }
});

// @desc    Get active orders for a specific table (for live tracking)
// @route   GET /api/orders/table/:tableNumber
// @access  Public
router.get('/table/:tableNumber', async (req, res) => {
  try {
    const orders = await Order.find({
      tableNumber: req.params.tableNumber,
      orderStatus: { $in: ['New', 'Preparing', 'Ready'] }
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch table orders' });
  }
});

// @desc    Get order details by order ID
// @route   GET /api/orders/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Public (Or Private, but we make it open for Kitchen Dashboard and protected for admin. Let's make it open for quick updates in this single-restaurant local setup)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['New', 'Preparing', 'Ready', 'Completed'];

  try {
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status: New, Preparing, Ready, Completed' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    // Emit live socket event to this specific table room and the general admin pool
    const io = req.app.get('io');
    if (io) {
      // Notify customer table
      io.to(`table_${order.tableNumber}`).emit('statusUpdate', order);
      // Notify admin dashboards
      io.to('admins').emit('orderUpdated', order);
      console.log(`[Socket] Emitted statusUpdate for order ${order.orderNumber} to table_${order.tableNumber}`);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('[Order Route] Status update error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// @desc    Get order dashboard analytics (revenue, metrics)
// @route   GET /api/orders/stats/summary
// @access  Private (Admin)
router.get('/stats/summary', protect, async (req, res) => {
  try {
    // Total Revenue of Completed orders
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Total order count
    const totalOrders = await Order.countDocuments({});

    // Active order count
    const activeOrders = await Order.countDocuments({ orderStatus: { $in: ['New', 'Preparing', 'Ready'] } });

    // Category breakdown logic or items summary
    const categoryStats = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 } // Top 5 sold items
    ]);

    // Daily Sales calculation
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayRevenueData = await Order.aggregate([
      { $match: { orderStatus: 'Completed', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].total : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        totalOrders,
        activeOrders,
        topItems: categoryStats
      }
    });
  } catch (err) {
    console.error('[Order Stats Route] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to compile dashboard metrics' });
  }
});

module.exports = router;
