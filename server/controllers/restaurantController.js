const Restaurant = require('../models/Restaurant');

// Restaurant oluştur
exports.createRestaurant = async (req, res) => {
  try {
    const restaurantData = req.body;
    
    // Logo dosyası varsa ekle
    if (req.file) {
      restaurantData.logo = `/uploads/${req.file.filename}`;
    }
    
    // Kapak fotoğrafı varsa ekle
    if (req.files && req.files.coverImage) {
      restaurantData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }

    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();

    res.status(201).json({
      success: true,
      restaurant: restaurant
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Demo restaurant oluştur
exports.createDemoRestaurant = async (req, res) => {
  try {
    // Önce mevcut demo restaurant'ı kontrol et
    let demoRestaurant = await Restaurant.findOne({ name: 'Demo Restaurant' });
    
    if (!demoRestaurant) {
      // Demo restaurant yoksa oluştur
      demoRestaurant = new Restaurant({
        name: 'Demo Restaurant',
        description: 'Lezzetli yemekler ve kaliteli hizmet',
        address: 'İstanbul, Kadıköy',
        phone: '0216 555 1234'
      });
      await demoRestaurant.save();
    }

    res.json({
      success: true,
      restaurant: demoRestaurant
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tüm restaurant'ları getir
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tek restaurant getir
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant bulunamadı' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restaurant güncelle
exports.updateRestaurant = async (req, res) => {
  try {
    console.log('Restaurant güncelleme isteği:', req.params.id);
    console.log('Gelen veriler:', req.body);
    console.log('Dosya:', req.file);
    
    const updateData = req.body;
    
    // Logo dosyası varsa ekle
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }
    
    // Kapak fotoğrafı varsa ekle
    if (req.files && req.files.coverImage) {
      updateData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }

    console.log('Güncellenecek veriler:', updateData);

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant bulunamadı' });
    }

    console.log('Güncellenmiş restaurant:', restaurant);

    res.json({
      success: true,
      restaurant: restaurant
    });

  } catch (error) {
    console.error('Restaurant güncelleme hatası:', error);
    res.status(400).json({ error: error.message });
  }
};

// Restaurant sil
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant bulunamadı' });
    }

    res.json({
      success: true,
      message: 'Restaurant başarıyla silindi'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 