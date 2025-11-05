from model import RecommendationModel
import os

# Model dosyalarının yolları
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
URUNLER_PATH = os.path.join(BASE_DIR, 'data', 'urunler.csv')
ETKILESIMLER_PATH = os.path.join(BASE_DIR, 'data', 'etkilesimler.csv')
MODEL_SAVE_PATH = os.path.join(BASE_DIR, 'saved_model', 'model_artifacts.pkl')

if __name__ == '__main__':
    print("Model eğitim süreci başlatılıyor...")
    
    # 1. Modeli başlat
    model = RecommendationModel(urunler_path=URUNLER_PATH, etkilesimler_path=ETKILESIMLER_PATH)
    
    # 2. Modeli eğit ve kaydet
    model.train(save_path=MODEL_SAVE_PATH)
    
    print("Model başarıyla eğitildi ve kaydedildi.")