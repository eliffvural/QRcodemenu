//`/api/categories` endpoint'leri

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Hazır kategorileri oluştur (POST) - sadece bir kez çalıştırılmalı
router.post("/initialize-predefined", categoryController.initializePredefinedCategories);

// Hazır kategorileri getir (GET)
router.get("/predefined", categoryController.getPredefinedCategories);

// Özel kategorileri getir (GET)
router.get("/custom", categoryController.getCustomCategories);

// Kategori oluştur (POST)
router.post("/", categoryController.createCategory);

// Tüm kategorileri al (GET)
router.get("/", categoryController.getAllCategories);

// Kategori sil (DELETE)
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
