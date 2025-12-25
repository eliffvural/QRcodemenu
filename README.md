QR Code Menu System

Basit bir restoran QR kod menü sistemi. Sunucu Node.js/Express + MongoDB, istemci React.

Kurulum

1) Bağımlılıkları yükleyin
```
npm run install-server
cd client && npm install
```

2) Ortam değişkenlerini ayarlayın
- `server/ENV.example` dosyasını kopyalayıp `server/.env` olarak kaydedin ve değerleri güncelleyin.
- `MONGO_URI` ve `JWT_SECRET` zorunludur.

3) Geliştirme sunucularını başlatın
```
# Terminal 1: Node.js Sunucusu (5000)
cd server
npm run dev

# Terminal 2: React İstemci (3000)
cd client
npm start

# Terminal 3: AI Servisi (5001) - ÖNEMLİ!
cd ai_service
python app.py
# veya Windows'ta: start_ai_service.bat
# veya Mac/Linux'ta: ./start_ai_service.sh
```

**ÖNEMLİ:** AI servisi ayrı bir Python uygulamasıdır ve mutlaka başlatılmalıdır!
Detaylı bilgi için `AI_SERVICE_README.md` dosyasına bakın.

İstemci `client/` klasöründedir. `server/client/` klasörü kullanılmaz; lütfen üst düzey `client/` klasörünü kullanın.

Önemli Uç Noktalar
- Kategoriler: GET/POST /api/categories, GET /api/categories/predefined, POST /api/categories/initialize-predefined
- Ürünler: GET/POST /api/products, DELETE /api/products/:id
- Restoran: POST /api/restaurants (logo/cover ile), GET /api/restaurants, GET/PUT/DELETE /api/restaurants/:id, POST /api/restaurants/demo
- QR: POST/GET /api/restaurants/:restaurantId/qr-code
- Sipariş: POST/GET /api/restaurants/:restaurantId/orders, PUT /api/restaurants/:restaurantId/orders/:id/status

Notlar
- Yüklenen dosyalar `server/uploads/` klasörüne kaydedilir ve `http://localhost:5000/uploads/...` yolundan servis edilir.
- İstemci tarafında `client/package.json` içinde `proxy: http://localhost:5000` ayarı mevcuttur.







