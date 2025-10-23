const Category = require('../models/Category');

// Hazır kategorileri oluştur (sadece bir kez çalıştırılmalı)
exports.initializePredefinedCategories = async (req, res) => {
  try {
    const predefinedCategories = [
      { name: 'Ana Yemekler', icon: '🍖', isPredefined: true },
      { name: 'Çorbalar', icon: '🥣', isPredefined: true },
      { name: 'Salatalar', icon: '🥗', isPredefined: true },
      { name: 'Pizzalar', icon: '🍕', isPredefined: true },
      { name: 'Hamburgerler', icon: '🍔', isPredefined: true },
      { name: 'Kebap', icon: '🥙', isPredefined: true },
      { name: 'Tatlılar', icon: '🍰', isPredefined: true },
      { name: 'İçecekler', icon: '🥤', isPredefined: true },
      { name: 'Kahvaltı', icon: '🍳', isPredefined: true },
      { name: 'Ara Sıcaklar', icon: '🍟', isPredefined: true },
      { name: 'Deniz Ürünleri', icon: '🐟', isPredefined: true },
      { name: 'Vejetaryen', icon: '🥬', isPredefined: true },
      { name: 'Çocuk Menüsü', icon: '👶', isPredefined: true },
      { name: 'Özel Günler', icon: '🎉', isPredefined: true },
      { name: 'Geleneksel', icon: '🏺', isPredefined: true }
    ];

    // Mevcut kategorileri kontrol et ve güncelle
    for (const predefinedCategory of predefinedCategories) {
      const existingCategory = await Category.findOne({ name: predefinedCategory.name });
      
      if (existingCategory) {
        // Mevcut kategoriyi güncelle
        await Category.findByIdAndUpdate(existingCategory._id, {
          isPredefined: true,
          icon: predefinedCategory.icon
        });
      } else {
        // Yeni kategori oluştur
        await Category.create(predefinedCategory);
      }
    }

    // Güncellenmiş öneri kategorilerini getir
    const updatedCategories = await Category.find({ isPredefined: true }).sort({ name: 1 });
    res.status(200).json({ 
      message: 'Öneri kategorileri güncellendi', 
      categories: updatedCategories 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hazır kategorileri getir
exports.getPredefinedCategories = async (req, res) => {
  try {
    const predefinedCategories = await Category.find({ isPredefined: true }).sort({ name: 1 });
    res.json(predefinedCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Özel kategorileri getir
exports.getCustomCategories = async (req, res) => {
  try {
    const customCategories = await Category.find({ isPredefined: false }).sort({ createdAt: -1 });
    res.json(customCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kategori oluştur
exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = new Category({ 
      name, 
      icon: icon || '🍽️',
      isPredefined: false 
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Tüm kategorileri al
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ isPredefined: -1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    // Hazır kategorileri silmeye izin verme
    if (category.isPredefined) {
      return res.status(403).json({ error: 'Hazır kategoriler silinemez' });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};