# AI Servis Kullanım Kılavuzu

## 📍 AI Servisi Nerede Çalışıyor?

AI servisi **ayrı bir Python Flask uygulaması** olarak çalışıyor. İki ayrı sunucu var:

1. **Node.js Sunucusu** (Port 5000) - Ana uygulama
2. **Python Flask Sunucusu** (Port 5001) - AI servisi

## 🏗️ Mimari

```
┌─────────────────┐         ┌─────────────────┐
│   React Client  │         │  Node.js Server  │
│   (Port 3000)   │ ──────> │   (Port 5000)    │
└─────────────────┘         └────────┬─────────┘
                                      │
                                      │ HTTP Request
                                      ▼
                              ┌─────────────────┐
                              │  Python Flask   │
                              │  AI Service     │
                              │  (Port 5001)    │
                              └─────────────────┘
```

## 🚀 AI Servisini Başlatma

### 1. Gerekli Python Paketlerini Yükleyin

```bash
cd ai_service
pip install -r requirements.txt
```

### 2. Modeli Eğitin (İlk kez çalıştırıyorsanız)

```bash
python train.py
```

Bu komut:
- `data/urunler.csv` ve `data/etkilesimler.csv` dosyalarını okur
- Modeli eğitir
- `saved_model/model_artifacts.pkl` dosyasına kaydeder

### 3. AI Servisini Başlatın

```bash
python app.py
```

Servis başladığında şu mesajı göreceksiniz:
```
AI Servisi Başlıyor... Model yükleniyor...
 * Running on http://127.0.0.1:5001
```

## 📂 Dosya Yapısı

```
ai_service/
├── app.py              # Flask uygulaması (Ana dosya)
├── model.py            # AI model sınıfı
├── train.py            # Model eğitim scripti
├── requirements.txt    # Python bağımlılıkları
├── data/
│   ├── urunler.csv     # Ürün verileri
│   └── etkilesimler.csv # Kullanıcı-ürün etkileşimleri
└── saved_model/
    └── model_artifacts.pkl # Eğitilmiş model
```

## 🔌 Bağlantı Ayarları

Node.js sunucusu AI servisine şu adresten bağlanır:
- **Varsayılan:** `http://localhost:5001`
- **Değiştirmek için:** `.env` dosyasına `AI_SERVICE_URL=http://localhost:5001` ekleyin

## ✅ Servis Durumunu Kontrol Etme

1. AdminPanel'e gidin: `http://localhost:3000/admin`
2. "AI Servis" tab'ına tıklayın
3. Durum otomatik kontrol edilir

## 🐛 Sorun Giderme

### AI Servisi Çalışmıyor Hatası

1. **AI servisinin çalıştığından emin olun:**
   ```bash
   cd ai_service
   python app.py
   ```

2. **Port 5001'in boş olduğundan emin olun:**
   ```bash
   # Windows
   netstat -ano | findstr :5001
   
   # Mac/Linux
   lsof -i :5001
   ```

3. **Model dosyasının var olduğundan emin olun:**
   - `ai_service/saved_model/model_artifacts.pkl` dosyası olmalı
   - Yoksa: `python train.py` çalıştırın

### Bağlantı Hatası

- Node.js sunucusu AI servisine bağlanamıyorsa:
  - AI servisinin çalıştığından emin olun
  - Firewall ayarlarını kontrol edin
  - `AI_SERVICE_URL` environment variable'ını kontrol edin

## 📝 API Endpoint'leri

### POST /predict
AI servisinden ürün önerisi alır.

**Request:**
```json
{
  "user_id": "user123",
  "restaurant_id": "restaurant456",
  "context": {}
}
```

**Response:**
```json
{
  "recommendations": ["product1", "product2", "product3"]
}
```

## 🎯 Kullanım Senaryosu

1. **Geliştirme Ortamı:**
   - Terminal 1: `npm start` (React - Port 3000)
   - Terminal 2: `node server/app.js` (Node.js - Port 5000)
   - Terminal 3: `python ai_service/app.py` (Python Flask - Port 5001)

2. **Production:**
   - Her servisi ayrı process olarak çalıştırın
   - Process manager kullanın (PM2, Supervisor, vb.)

## 💡 İpuçları

- AI servisi bağımsız bir servis olduğu için ayrı bir terminal'de çalıştırılmalı
- Model eğitimi zaman alabilir (büyük veri setlerinde)
- Model dosyası (`model_artifacts.pkl`) her eğitimden sonra güncellenir




