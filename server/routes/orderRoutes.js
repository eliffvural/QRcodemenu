const express = require('express');
const router = express.Router({ mergeParams: true });
const orderController = require('../controllers/orderController');

// /api/restaurants/:restaurantId/orders
router.post('/', orderController.createOrder);
router.get('/', orderController.listOrders);
router.put('/:id/status', orderController.updateStatus);

module.exports = router;










