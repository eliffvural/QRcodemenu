const express = require('express');       // Express framework'ünü projeye dahil ettik
const cors = require('cors');             // CORS ayarlarını aktif ettik (frontend'e izin ver)
const mongoose = require('mongoose');     // MongoDB bağlantısı için mongoose kullanacağız
const dotenv = require('dotenv');         // .env dosyasından ortam değişkenlerini alır

dotenv.config();                          // .env dosyasını aktif ettik
