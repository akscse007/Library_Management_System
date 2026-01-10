const Order = require('../models/Order');
const Book = require('../models/Book');

// Stock manager: list all book orders (for librarian/manager order history).
exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort('-createdAt');
    res.json(orders);
  } catch (err) { next(err); }
};

exports.raiseOrder = async (req, res, next) => {
  try {
    const { bookTitle, isbn, quantity=1 } = req.body;
    const requestedBy = req.user?.id || req.user?._id || null;
    const order = await Order.create({ bookTitle, isbn, quantity, requestedBy });
    res.status(201).json(order);
  } catch (err) { next(err); }
};

exports.confirmOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'confirmed';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

exports.markDelivered = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // create/update book stock
    const existing = await Book.findOne({ isbn: order.isbn });
    if (existing) {
      existing.totalCopies += order.quantity;
      existing.availableCopies += order.quantity;
      await existing.save();
    } else {
      await Book.create({
        title: order.bookTitle,
        isbn: order.isbn,
        totalCopies: order.quantity,
        availableCopies: order.quantity
      });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};
