const express = require('express');       // Express framework'ünü projeye dahil ettik
const cors = require('cors');             // CORS ayarlarını aktif ettik (frontend'e izin ver)
const mongoose = require('mongoose');     // MongoDB bağlantısı için mongoose kullanacağız
const dotenv = require('dotenv');  
const connectDB = require('./config/db')      // .env dosyasından ortam değişkenlerini alır

dotenv.config();                          // .env dosyasını aktif ettik

const app = express();
connectDB();                    // Express uygulamasını başlattık
app.use(cors());                          // CORS’u aktif ettik
app.use(express.json());                  // JSON body parse etmeyi sağladık

// Basit test endpointi
app.get('/', (req, res) => {
  res.send('QR Menü API çalışıyor ✅');
});

// .env içindeki PORT'u al, yoksa 5000 kullan
const PORT = process.env.PORT || 5000;

// Sunucuyu başlatiyoruz
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});