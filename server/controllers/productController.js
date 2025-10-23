const Product = require("../models/Product");
const NutrientData = require("../models/NutrientData");

// Besin değerlerini ürün adına göre arama fonksiyonu
const findNutrientData = async (productName) => {
  try {
    if (!productName || typeof productName !== 'string') {
      return null;
    }

    // Ürün adını temizle ve küçük harfe çevir
    const cleanName = productName.toLowerCase().trim();
    
    // Farklı arama stratejileri dene
    const searchStrategies = [
      // Tam eşleşme
      { food_item: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
      // İçerir eşleşme
      { food_item: { $regex: new RegExp(cleanName, 'i') } },
      // Kelime bazlı arama
      { food_item: { $regex: new RegExp(cleanName.split(' ').join('.*'), 'i') } }
    ];

    for (const strategy of searchStrategies) {
      const nutrientData = await NutrientData.findOne(strategy);
      if (nutrientData) {
        console.log(`✅ Besin değeri bulundu: ${productName} -> ${nutrientData.food_item}`);
        return nutrientData;
      }
    }

    console.log(`⚠️  Besin değeri bulunamadı: ${productName}`);
    return null;
  } catch (error) {
    console.error('❌ Besin değeri arama hatası:', error.message);
    return null;
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Resim dosyası varsa ekle
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    // Besin değerlerini otomatik olarak bul ve ata
    if (productData.name) {
      const nutrientData = await findNutrientData(productData.name);
      if (nutrientData) {
        productData.calories = nutrientData.calories;
        productData.protein = nutrientData.protein;
        productData.fat = nutrientData.fat;
        productData.carbs = nutrientData.carbs;
        
        // Ek besin değerleri varsa onları da ekle
        if (nutrientData.fiber !== undefined) productData.fiber = nutrientData.fiber;
        if (nutrientData.sugar !== undefined) productData.sugar = nutrientData.sugar;
        if (nutrientData.sodium !== undefined) productData.sodium = nutrientData.sodium;
        
        console.log(`🍎 Besin değerleri otomatik atandı: ${productData.name}`);
      } else {
        // Besin değeri bulunamazsa varsayılan değerleri ata
        productData.calories = productData.calories || 0;
        productData.protein = productData.protein || 0;
        productData.fat = productData.fat || 0;
        productData.carbs = productData.carbs || 0;
        console.log(`⚠️  Besin değeri bulunamadı, varsayılan değerler atandı: ${productData.name}`);
      }
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // Resim dosyası varsa ekle
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Ürün adı değiştiyse besin değerlerini yeniden ara
    if (updateData.name) {
      const nutrientData = await findNutrientData(updateData.name);
      if (nutrientData) {
        updateData.calories = nutrientData.calories;
        updateData.protein = nutrientData.protein;
        updateData.fat = nutrientData.fat;
        updateData.carbs = nutrientData.carbs;
        
        // Ek besin değerleri varsa onları da ekle
        if (nutrientData.fiber !== undefined) updateData.fiber = nutrientData.fiber;
        if (nutrientData.sugar !== undefined) updateData.sugar = nutrientData.sugar;
        if (nutrientData.sodium !== undefined) updateData.sodium = nutrientData.sodium;
        
        console.log(`🔄 Besin değerleri güncellendi: ${updateData.name}`);
      } else {
        // Besin değeri bulunamazsa mevcut değerleri koru veya varsayılan ata
        if (updateData.calories === undefined) updateData.calories = 0;
        if (updateData.protein === undefined) updateData.protein = 0;
        if (updateData.fat === undefined) updateData.fat = 0;
        if (updateData.carbs === undefined) updateData.carbs = 0;
        console.log(`⚠️  Besin değeri bulunamadı, varsayılan değerler atandı: ${updateData.name}`);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // Multi-tenant yapısı için restaurant filtresi
    const query = {};
    if (req.params.restaurantId) {
      query.restaurant = req.params.restaurantId;
    }
    
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("restaurant", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("restaurant", "name");
    
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};