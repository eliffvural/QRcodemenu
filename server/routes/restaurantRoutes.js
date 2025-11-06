const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const qrController = require('../controllers/qrController');
const upload = require('../middleware/upload');

// Restaurant CRUD işlemleri
router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), restaurantController.createRestaurant);
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.put('/:id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), restaurantController.updateRestaurant);
router.delete('/:id', restaurantController.deleteRestaurant);

// Demo restaurant oluştur
router.post('/demo', restaurantController.createDemoRestaurant);

// QR kod işlemleri
router.post('/:restaurantId/qr-code', qrController.generateQRCode);
router.get('/:restaurantId/qr-code', qrController.getQRCode);

module.exports = router; 