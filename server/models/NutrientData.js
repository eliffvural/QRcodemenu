// Besin değerleri modeli - Kaggle veri seti için

const mongoose = require("mongoose");

const nutrientDataSchema = new mongoose.Schema({
  food_item: {
    type: String,
    required: true,
    trim: true,
    index: true // Arama performansı için index
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  fat: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  // Ek besin değerleri (opsiyonel)
  fiber: {
    type: Number,
    min: 0,
    default: 0
  },
  sugar: {
    type: Number,
    min: 0,
    default: 0
  },
  sodium: {
    type: Number,
    min: 0,
    default: 0
  },
  // Besin değerleri birim bilgisi
  serving_size: {
    type: String,
    default: "100g"
  },
  // Ürün ile ilişki kurmak için (opsiyonel)
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  }
}, { 
  timestamps: true,
  // Tekrarlanan food_item'ları önlemek için
  indexes: [
    { food_item: 1 },
    { product_id: 1 }
  ]
});

// Virtual field: Toplam makro besin değeri
nutrientDataSchema.virtual('total_macros').get(function() {
  return this.protein + this.fat + this.carbs;
});

// Virtual field: Kalori yoğunluğu (100g başına kalori)
nutrientDataSchema.virtual('calorie_density').get(function() {
  return this.calories;
});

// JSON dönüşümünde virtual field'ları dahil et
nutrientDataSchema.set('toJSON', { virtuals: true });
nutrientDataSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("NutrientData", nutrientDataSchema);
