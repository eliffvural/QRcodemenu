const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { table, note, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sepet boş' });
    }
    const normalizedItems = items.map(i => ({
      product: i.productId,
      name: i.name,
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
    }));
    const total = normalizedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({ restaurant: restaurantId, table, note, items: normalizedItems, total });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurant: restaurantId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



