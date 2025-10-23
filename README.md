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
# Sunucu (5000)
npm run dev

# Başka bir terminalde İstemci (3000)
cd client && npm start
```

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








