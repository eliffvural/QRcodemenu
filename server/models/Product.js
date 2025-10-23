//urun modeli

// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: "", // İstersen zorunlu yapabilirsin
  },
  description: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  // AI ve besin değerleri için yeni alanlar
  calories: {
    type: Number,
    default: 0,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  fat: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs: {
    type: Number,
    default: 0,
    min: 0
  },
  // Alerjen bilgileri
  allergens: {
    type: [String],
    default: []
  },
  // Multi-tenant yapısı için restoran referansı
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  }
}, { timestamps: true });

// Virtual field: Toplam makro besin değeri
productSchema.virtual('total_macros').get(function() {
  return this.protein + this.fat + this.carbs;
});

// Virtual field: Kalori yoğunluğu
productSchema.virtual('calorie_density').get(function() {
  return this.calories;
});

// Virtual field: Alerjen sayısı
productSchema.virtual('allergen_count').get(function() {
  return this.allergens.length;
});

// Index'ler: Performans için
productSchema.index({ restaurant: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ calories: 1 });
productSchema.index({ allergens: 1 });

// JSON dönüşümünde virtual field'ları dahil et
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
