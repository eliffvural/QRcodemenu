//`/api/products` endpoint'leri

// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Ürün oluşturma
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tüm ürünleri çekme
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
