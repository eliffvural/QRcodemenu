from flask import Flask, request, jsonify
from flask_cors import CORS
from model import RecommendationModel
import os

# Flask uygulamasını başlat
app = Flask(__name__)
# Node.js'den gelen isteklere izin ver (CORS)
CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}}) # Node.js portunuz 3000 ise

# Model dosyalarının yolları
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
URUNLER_PATH = os.path.join(BASE_DIR, 'data', 'urunler.csv')
ETKILESIMLER_PATH = os.path.join(BASE_DIR, 'data', 'etkilesimler.csv')
MODEL_SAVE_PATH = os.path.join(BASE_DIR, 'saved_model', 'model_artifacts.pkl')

# Modeli global olarak yükle
print("AI Servisi Başlıyor... Model yükleniyor...")
model = RecommendationModel(urunler_path=URUNLER_PATH, etkilesimler_path=ETKILESIMLER_PATH)

# Modeli yüklemeyi dene, eğer eğitilmemişse hata verecek
# Gerçek senaryoda önce 'train.py' çalıştırılmalı
if not model.load_model(MODEL_SAVE_PATH):
    print("UYARI: Eğitilmiş model bulunamadı. Lütfen 'train.py' scriptini çalıştırın.")
    # Eğitim scripti çalıştırılana kadar servis düzgün çalışmayabilir.
    # Demo için geçici olarak eğitebiliriz:
    # print("Geçici model eğitimi yapılıyor...")
    # model.train(MODEL_SAVE_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Node.js'den gelen /predict isteğini karşılar.
    """
    try:
        data = request.json
        
        # aiController.js'den gelen veriler
        user_id = data.get('user_id')
        restaurant_id = data.get('restaurant_id')
        context = data.get('context', {}) # Saat, hava durumu vb.
        
        if not user_id:
            return jsonify({'error': 'user_id gereklidir'}), 400
            
        print(f"Öneri isteği alındı: Kullanıcı={user_id}, Restoran={restaurant_id}")

        # Modelden önerileri al
        recommendations = model.get_recommendations(
            user_id=user_id,
            top_n=5,
            restaurant_id=restaurant_id, # Henüz filtrelemede kullanmadık ama ileride eklenebilir
            context=context # Henüz filtrelemede kullanmadık ama ileride eklenebilir
        )
        
        print(f"Öneriler: {recommendations}")
        
        # Node.js'e (aiController) önerilen ürün ID'lerini JSON olarak dön
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        print(f"HATA: /predict rotasında hata oluştu: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Sunucuyu 5001 portunda çalıştır
    app.run(port=5001, debug=True)