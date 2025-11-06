//kategori modeli oluşturma bölümü

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    isPredefined: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '🍽️', // Varsayılan emoji ikonu
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
