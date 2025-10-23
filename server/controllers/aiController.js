// AI Controller - Yapay zeka önerileri için controller

const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const NutrientData = require('../models/NutrientData');

// Restoran için menü önerisi al
exports.getMenuSuggestion = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { preferences, budget, dietaryRestrictions } = req.body;

    // Restoran bilgilerini al
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }

    // Mevcut ürünleri al
    const existingProducts = await Product.find({ restaurant: restaurantId })
      .populate('category', 'name');

    // Besin verilerinden öneriler oluştur
    const suggestions = await generateMenuSuggestions({
      restaurant,
      existingProducts,
      preferences,
      budget,
      dietaryRestrictions
    });

    res.json({
      success: true,
      restaurant: restaurant.name,
      suggestions,
      existingProducts: existingProducts.length
    });

  } catch (error) {
    console.error('❌ Menü önerisi hatası:', error.message);
    res.status(500).json({ error: 'Menü önerisi alınamadı' });
  }
};

// Menü analizi
exports.analyzeMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const products = await Product.find({ restaurant: restaurantId })
      .populate('category', 'name');

    const analysis = await analyzeMenuData(products);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('❌ Menü analizi hatası:', error.message);
    res.status(500).json({ error: 'Menü analizi yapılamadı' });
  }
};

// Menü optimizasyonu
exports.optimizeMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { goals } = req.body; // 'profit', 'health', 'popularity'

    const products = await Product.find({ restaurant: restaurantId });
    const optimization = await optimizeMenuData(products, goals);

    res.json({
      success: true,
      optimization
    });

  } catch (error) {
    console.error('❌ Menü optimizasyonu hatası:', error.message);
    res.status(500).json({ error: 'Menü optimizasyonu yapılamadı' });
  }
};

// Beslenme analizi
exports.getNutritionAnalysis = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const products = await Product.find({ restaurant: restaurantId });
    const nutritionAnalysis = await analyzeNutritionData(products);

    res.json({
      success: true,
      nutritionAnalysis
    });

  } catch (error) {
    console.error('❌ Beslenme analizi hatası:', error.message);
    res.status(500).json({ error: 'Beslenme analizi yapılamadı' });
  }
};

// Fiyat optimizasyonu
exports.getPricingSuggestion = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { targetMargin } = req.body;

    const products = await Product.find({ restaurant: restaurantId });
    const pricingSuggestions = await generatePricingSuggestions(products, targetMargin);

    res.json({
      success: true,
      pricingSuggestions
    });

  } catch (error) {
    console.error('❌ Fiyat önerisi hatası:', error.message);
    res.status(500).json({ error: 'Fiyat önerisi alınamadı' });
  }
};

// Yardımcı fonksiyonlar

const generateMenuSuggestions = async ({ restaurant, existingProducts, preferences, budget, dietaryRestrictions }) => {
  // Mevcut kategorileri al
  const categories = await Category.find();
  
  // Besin verilerinden öneriler oluştur
  const suggestions = [];
  
  for (const category of categories) {
    const categoryProducts = await NutrientData.find({
      // Basit filtreleme - gerçek AI entegrasyonu için daha gelişmiş algoritma gerekir
    }).limit(5);

    suggestions.push({
      category: category.name,
      suggestions: categoryProducts.map(product => ({
        name: product.food_item,
        calories: product.calories,
        protein: product.protein,
        fat: product.fat,
        carbs: product.carbs,
        estimatedPrice: calculateEstimatedPrice(product, restaurant.type)
      }))
    });
  }

  return suggestions;
};

const analyzeMenuData = async (products) => {
  const totalProducts = products.length;
  const categories = {};
  let totalCalories = 0;
  let avgPrice = 0;

  products.forEach(product => {
    // Kategori analizi
    const categoryName = product.category?.name || 'Bilinmeyen';
    categories[categoryName] = (categories[categoryName] || 0) + 1;

    // Besin değeri analizi
    totalCalories += product.calories || 0;
    avgPrice += product.price || 0;
  });

  avgPrice = totalProducts > 0 ? avgPrice / totalProducts : 0;

  return {
    totalProducts,
    categories,
    averageCalories: totalProducts > 0 ? totalCalories / totalProducts : 0,
    averagePrice: avgPrice,
    healthScore: calculateHealthScore(products)
  };
};

const optimizeMenuData = async (products, goals) => {
  // Basit optimizasyon mantığı
  const optimization = {
    goal: goals,
    recommendations: []
  };

  if (goals === 'profit') {
    optimization.recommendations.push({
      type: 'pricing',
      message: 'Yüksek kalorili ürünlerin fiyatlarını artırın',
      products: products.filter(p => p.calories > 500)
    });
  }

  if (goals === 'health') {
    optimization.recommendations.push({
      type: 'nutrition',
      message: 'Düşük kalorili, yüksek proteinli ürünler ekleyin',
      suggestions: await NutrientData.find({ 
        calories: { $lt: 300 }, 
        protein: { $gt: 20 } 
      }).limit(5)
    });
  }

  return optimization;
};

const analyzeNutritionData = async (products) => {
  const nutritionStats = {
    totalProducts: products.length,
    averageCalories: 0,
    averageProtein: 0,
    averageFat: 0,
    averageCarbs: 0,
    healthCategories: {
      lowCalorie: 0,
      highProtein: 0,
      balanced: 0
    }
  };

  let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;

  products.forEach(product => {
    totalCalories += product.calories || 0;
    totalProtein += product.protein || 0;
    totalFat += product.fat || 0;
    totalCarbs += product.carbs || 0;

    // Sağlık kategorileri
    if (product.calories < 300) nutritionStats.healthCategories.lowCalorie++;
    if (product.protein > 20) nutritionStats.healthCategories.highProtein++;
    if (product.calories < 500 && product.protein > 15) nutritionStats.healthCategories.balanced++;
  });

  if (products.length > 0) {
    nutritionStats.averageCalories = totalCalories / products.length;
    nutritionStats.averageProtein = totalProtein / products.length;
    nutritionStats.averageFat = totalFat / products.length;
    nutritionStats.averageCarbs = totalCarbs / products.length;
  }

  return nutritionStats;
};

const generatePricingSuggestions = async (products, targetMargin) => {
  const suggestions = products.map(product => {
    const currentPrice = product.price;
    const suggestedPrice = currentPrice * (1 + (targetMargin || 0.3));
    
    return {
      productId: product._id,
      productName: product.name,
      currentPrice,
      suggestedPrice,
      priceIncrease: suggestedPrice - currentPrice,
      margin: targetMargin || 0.3
    };
  });

  return suggestions;
};

const calculateEstimatedPrice = (nutrientData, restaurantType) => {
  // Basit fiyat hesaplama - gerçek uygulamada daha karmaşık algoritma kullanılır
  const basePrice = 15;
  const calorieMultiplier = nutrientData.calories / 100;
  const typeMultiplier = restaurantType === 'fine-dining' ? 1.5 : 1;
  
  return Math.round((basePrice + calorieMultiplier) * typeMultiplier);
};

const calculateHealthScore = (products) => {
  if (products.length === 0) return 0;
  
  let score = 0;
  products.forEach(product => {
    if (product.calories < 400) score += 2;
    if (product.protein > 15) score += 1;
    if (product.fat < 20) score += 1;
    if (product.carbs < 50) score += 1;
  });
  
  return Math.min(100, (score / products.length) * 20);
};
