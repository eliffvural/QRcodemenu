require('dotenv').config(); // <--- EN BAŞTA OLMALI
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Route Dosyaları
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes'); // <--- AI Rotası

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // <--- Frontend ile iletişim için şart
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik Dosyalar (Resimler için)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Tanımları
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurants/:restaurantId/orders', orderRoutes);
app.use('/api/ai', aiRoutes); // <--- AI Endpoint'i

// MongoDB Bağlantısı ve Sunucu Başlatma
if (!process.env.MONGO_URI) {
  console.error('❌ HATA: MONGO_URI .env dosyasında tanımlı değil!');
}

mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB })
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı');
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
  });