import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import joblib # Modeli kaydetmek/yüklemek için

class RecommendationModel:
    def __init__(self, urunler_path, etkilesimler_path):
        self.urunler_df = pd.read_csv(urunler_path)
        self.etkilesimler_df = pd.read_csv(etkilesimler_path)
        self.user_item_matrix = None
        self.user_similarity_df = None
        print("Model verileri yüklendi.")

    def _create_user_item_matrix(self):
        """
        Kullanıcı-Ürün etkileşim matrisini oluşturur.
        Satırlar: musteri_id, Sütunlar: urun_id, Değerler: Etkileşim sayısı
        """
        # Etkileşimleri sayalım (bir müşteri bir ürünü kaç kez sipariş etmiş)
        df_agg = self.etkilesimler_df.groupby(['musteri_id', 'urun_id']).size().reset_index(name='etkilesim_sayisi')
        
        # Pivot tablo ile matrisi oluştur
        matrix = df_agg.pivot(index='musteri_id', columns='urun_id', values='etkilesim_sayisi').fillna(0)
        
        # Veriyi 0-1 arasına ölçeklendir (MinMaxScaler)
        scaler = MinMaxScaler()
        matrix_scaled = scaler.fit_transform(matrix)
        
        self.user_item_matrix = pd.DataFrame(matrix_scaled, columns=matrix.columns, index=matrix.index)
        print("Kullanıcı-Ürün matrisi oluşturuldu.")

    def _calculate_user_similarity(self):
        """
        Kullanıcılar arası benzerliği (Kosinüs Benzerliği) hesaplar.
        """
        if self.user_item_matrix is None:
            self._create_user_item_matrix()
            
        # Kosinüs benzerliğini hesapla
        similarity_matrix = cosine_similarity(self.user_item_matrix)
        
        self.user_similarity_df = pd.DataFrame(similarity_matrix, 
                                               index=self.user_item_matrix.index, 
                                               columns=self.user_item_matrix.index)
        print("Kullanıcı benzerlik matrisi hesaplandı.")

    def train(self, save_path):
        """
        Modeli eğitir (matrisleri oluşturur) ve dosyaya kaydeder.
        """
        print("Model eğitimi başlıyor...")
        self._create_user_item_matrix()
        self._calculate_user_similarity()
        
        # Eğitilmiş verileri (matrisleri) kaydet
        artifacts = {
            'user_item_matrix': self.user_item_matrix,
            'user_similarity_df': self.user_similarity_df
        }
        joblib.dump(artifacts, save_path)
        print(f"Model {save_path} adresine kaydedildi.")

    def load_model(self, load_path):
        """
        Daha önce eğitilmiş modeli dosyadan yükler.
        """
        try:
            artifacts = joblib.load(load_path)
            self.user_item_matrix = artifacts['user_item_matrix']
            self.user_similarity_df = artifacts['user_similarity_df']
            print(f"Model {load_path} adresinden yüklendi.")
            return True
        except FileNotFoundError:
            print(f"Model dosyası bulunamadı: {load_path}")
            return False

    def get_recommendations(self, user_id, top_n=5, restaurant_id=None, context=None):
        """
        Belirli bir kullanıcı için ürün tavsiyesi üretir.
        """
        if self.user_similarity_df is None:
            raise Exception("Model eğitilmedi veya yüklenmedi!")
            
        # 1. Kullanıcı sistemde var mı kontrol et
        if user_id not in self.user_similarity_df.index:
            print(f"Yeni kullanıcı: {user_id}. Popüler ürünler önerilecek.")
            # TODO: Yeni kullanıcı için popüler ürünleri (veya içerik tabanlı) öner
            # Şimdilik, urunler_df'ten rastgele 5 ürün ID'si dönelim
            # Not: MongoDB ObjectID'leri string olarak saklandığı için string'e çevir
            return self.urunler_df.sample(top_n)['urun_id'].astype(str).tolist()

        # 2. Kullanıcıya en çok benzeyen 10 kullanıcıyı bul (kendisi hariç)
        similar_users = self.user_similarity_df[user_id].sort_values(ascending=False)[1:11]
        
        # 3. Bu benzer kullanıcıların yüksek puan verdiği (çok etkileştiği) ürünleri bul
        similar_user_items = self.user_item_matrix.loc[similar_users.index]
        
        # Benzerlik skorlarıyla ağırlıklı ortalama alarak öneri skoru hesapla
        recommendation_scores = similar_user_items.apply(lambda row: row * similar_users[row.name], axis=1).sum()
        
        # 4. Hedef kullanıcının zaten etkileşimde olduğu ürünleri filtrele
        user_consumed_items = self.user_item_matrix.loc[user_id]
        user_consumed_items = user_consumed_items[user_consumed_items > 0].index
        
        recommendation_scores = recommendation_scores.drop(user_consumed_items, errors='ignore')
        
        # 5. En iyi 'top_n' ürünü seç
        top_recommendations = recommendation_scores.sort_values(ascending=False).head(top_n)
        
        # Not: MongoDB ObjectID'leri string olarak saklandığı için ID'leri string'e çevir
        return top_recommendations.index.astype(str).tolist()