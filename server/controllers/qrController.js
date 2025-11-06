const QRCode = require('qrcode');
const Restaurant = require('../models/Restaurant');

// QR kod oluştur
exports.generateQRCode = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Restaurant'ı bul
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant bulunamadı' });
    }

    // Menü URL'si oluştur
    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${restaurantId}`;
    
    // QR kod oluştur
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Restaurant'a QR kod'u kaydet
    restaurant.qrCode = qrCodeDataUrl;
    await restaurant.save();

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      menuUrl: menuUrl,
      restaurant: restaurant
    });

  } catch (error) {
    console.error('QR kod oluşturma hatası:', error);
    res.status(500).json({ error: 'QR kod oluşturulamadı' });
  }
};

// QR kod'u getir
exports.getQRCode = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant bulunamadı' });
    }

    if (!restaurant.qrCode) {
      return res.status(404).json({ error: 'QR kod henüz oluşturulmamış' });
    }

    res.json({
      qrCode: restaurant.qrCode,
      restaurant: restaurant
    });

  } catch (error) {
    res.status(500).json({ error: 'QR kod getirilemedi' });
  }
}; 