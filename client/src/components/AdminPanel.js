import axios from 'axios';
import { Check, Plus, QrCode, Save, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  // Öneri kategorileri için yerel yedek (backend cevap vermezse)
  const PREDEFINED_FALLBACK = [
    { _id: 'fallback-Ana Yemekler', name: 'Ana Yemekler', icon: '🍖' },
    { _id: 'fallback-Çorbalar', name: 'Çorbalar', icon: '🥣' },
    { _id: 'fallback-Salatalar', name: 'Salatalar', icon: '🥗' },
    { _id: 'fallback-Pizzalar', name: 'Pizzalar', icon: '🍕' },
    { _id: 'fallback-Hamburgerler', name: 'Hamburgerler', icon: '🍔' },
    { _id: 'fallback-Kebap', name: 'Kebap', icon: '🥙' },
    { _id: 'fallback-Tatlılar', name: 'Tatlılar', icon: '🍰' },
    { _id: 'fallback-İçecekler', name: 'İçecekler', icon: '🥤' },
    { _id: 'fallback-Kahvaltı', name: 'Kahvaltı', icon: '🍳' },
    { _id: 'fallback-Ara Sıcaklar', name: 'Ara Sıcaklar', icon: '🍟' },
    { _id: 'fallback-Deniz Ürünleri', name: 'Deniz Ürünleri', icon: '🐟' },
    { _id: 'fallback-Vejetaryen', name: 'Vejetaryen', icon: '🥬' },
    { _id: 'fallback-Çocuk Menüsü', name: 'Çocuk Menüsü', icon: '👶' },
    { _id: 'fallback-Özel Günler', name: 'Özel Günler', icon: '🎉' },
    { _id: 'fallback-Geleneksel', name: 'Geleneksel', icon: '🏺' },
  ];
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [predefinedCategories, setPredefinedCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurant');
  const [modalActiveTab, setModalActiveTab] = useState('predefined');
  const [qrCode, setQrCode] = useState(null);

  // Form states
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '🍽️'
  });

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Önce demo restaurant oluştur veya al
      const demoRes = await axios.post('/api/restaurants/demo');
      const demoRestaurant = demoRes.data.restaurant;
      
      setRestaurant(demoRestaurant);
      setRestaurantForm({
        name: demoRestaurant.name,
        description: demoRestaurant.description,
        address: demoRestaurant.address,
        phone: demoRestaurant.phone
      });
      
      // Öneri kategorilerini al (backend boş/kapalıysa yerel yedek kullan)
      try {
        const predefinedRes = await axios.get('/api/categories/predefined');
        if (Array.isArray(predefinedRes.data) && predefinedRes.data.length > 0) {
          setPredefinedCategories(predefinedRes.data);
        } else {
          setPredefinedCategories(PREDEFINED_FALLBACK);
        }
      } catch (error) {
        console.log('Öneri kategorileri yüklenemedi, yerel yedek kullanılacak:', error.message);
        setPredefinedCategories(PREDEFINED_FALLBACK);
      }
      
      // Tüm kategorileri al
      const categoriesRes = await axios.get('/api/categories');
      setCategories(categoriesRes.data);
      
      // Seçili kategorileri ayarla (mevcut kategoriler)
      setSelectedCategories(categoriesRes.data.map(cat => cat._id));
      
      // Ürünleri al
      const productsRes = await axios.get('/api/products');
      setProducts(productsRes.data);
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      // Hata durumunda basit demo data oluştur
      setRestaurant({
        _id: 'temp-id',
        name: 'Demo Restaurant',
        description: 'Lezzetli yemekler',
        address: 'İstanbul, Kadıköy',
        phone: '0216 555 1234'
      });
      setRestaurantForm({
        name: 'Demo Restaurant',
        description: 'Lezzetli yemekler',
        address: 'İstanbul, Kadıköy',
        phone: '0216 555 1234'
      });
      setCategories([]);
      setPredefinedCategories(PREDEFINED_FALLBACK);
      setSelectedCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };



  // Restaurant güncelleme
  const handleRestaurantUpdate = async (e) => {
    e.preventDefault();
    
    // Restaurant ID kontrolü
    if (!restaurant || !restaurant._id || restaurant._id === 'temp-id') {
      alert('Önce demo restaurant oluşturun!');
      return;
    }
    
    try {
      const formData = new FormData();
      Object.keys(restaurantForm).forEach(key => {
        formData.append(key, restaurantForm[key]);
      });
      
      if (selectedImage) {
        formData.append('logo', selectedImage);
      }
      
      if (selectedCoverImage) {
        formData.append('coverImage', selectedCoverImage);
      }

      const response = await axios.put(`/api/restaurants/${restaurant._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('Restaurant bilgileri güncellendi!');
        // Restaurant state'ini güncelle
        setRestaurant(response.data.restaurant);
        // Form state'ini de güncelle
        setRestaurantForm({
          name: response.data.restaurant.name,
          description: response.data.restaurant.description,
          address: response.data.restaurant.address,
          phone: response.data.restaurant.phone
        });
        // Seçili resimleri temizle
        setSelectedImage(null);
        setSelectedCoverImage(null);
      } else {
        alert('Güncelleme başarısız!');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme hatası: ' + (error.response?.data?.error || error.message));
    }
  };

  // Hazır kategorileri başlat
  const initializePredefinedCategories = async () => {
    try {
      await axios.post('/api/categories/initialize-predefined');
      // Kategorileri yeniden yükle
      const predefinedRes = await axios.get('/api/categories/predefined');
      setPredefinedCategories(predefinedRes.data);
      
      const categoriesRes = await axios.get('/api/categories');
      setCategories(categoriesRes.data);
      setSelectedCategories(categoriesRes.data.map(cat => cat._id));
      
      alert('Hazır kategoriler başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Hazır kategoriler oluşturma hatası:', error);
      alert('Hazır kategoriler oluşturulamadı: ' + (error.response?.data?.error || error.message));
    }
  };

  // Kategori seçimi
  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Seçili kategorileri kaydet
  const saveSelectedCategories = async () => {
    try {
      // Tüm kategorileri yeniden yükle (seçili olanlar zaten dahil)
      const categoriesRes = await axios.get('/api/categories');
      setCategories(categoriesRes.data);
      setSelectedCategories(categoriesRes.data.map(cat => cat._id));
      alert('Kategori seçimleri kaydedildi!');
    } catch (error) {
      console.error('Kategori kaydetme hatası:', error);
      alert('Kategori kaydetme hatası: ' + error.message);
    }
  };

  // Kategori ekleme
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/categories', categoryForm);
      setCategoryForm({ name: '', icon: '🍽️' });
      setShowCategoryModal(false);
      setModalActiveTab('predefined');
      // Sadece kategorileri yeniden yükle
      const categoriesRes = await axios.get('/api/categories');
      setCategories(categoriesRes.data);
      setSelectedCategories(categoriesRes.data.map(cat => cat._id));
      alert('Kategori eklendi!');
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      alert('Kategori ekleme hatası: ' + (error.response?.data?.error || error.message));
    }
  };

  // Ürün ekleme
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        formData.append(key, productForm[key]);
      });
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await axios.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProductForm({ name: '', price: '', description: '', category: '' });
      setSelectedImage(null);
      setShowProductModal(false);
      // Sadece ürünleri yeniden yükle
      const productsRes = await axios.get('/api/products');
      setProducts(productsRes.data);
      alert('Ürün eklendi!');
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      alert('Ürün ekleme hatası: ' + (error.response?.data?.error || error.message));
    }
  };

  // QR kod oluşturma
  const generateQRCode = async () => {
    // Restaurant ID kontrolü
    if (!restaurant || !restaurant._id || restaurant._id === 'temp-id') {
      alert('Önce demo restaurant oluşturun!');
      return;
    }
    
    try {
      const response = await axios.post(`/api/restaurants/${restaurant._id}/qr-code`);
      setQrCode(response.data.qrCode);
      alert('QR kod başarıyla oluşturuldu!');
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      alert('QR kod oluşturma hatası: ' + (error.response?.data?.error || error.message));
    }
  };

  // Kategori silme
  const deleteCategory = async (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        fetchData();
        alert('Kategori silindi!');
      } catch (error) {
        alert('Silme hatası: ' + error.message);
      }
    }
  };

  // Ürün silme
  const deleteProduct = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        fetchData();
        alert('Ürün silindi!');
      } catch (error) {
        alert('Silme hatası: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Restaurant Yönetim Paneli</h1>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'restaurant' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurant')}
          >
            Restaurant Bilgileri
          </button>
          <button 
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Kategoriler
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Ürünler
          </button>
          <button 
            className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            QR Kod
          </button>
        </div>

        {/* Restaurant Bilgileri Tab */}
        {activeTab === 'restaurant' && (
          <div className="tab-content">
            <h2>Restaurant Bilgileri</h2>
            
            {/* Demo Restaurant Oluşturma Butonu */}
            {(!restaurant || restaurant._id === 'temp-id') && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>
                  Demo restaurant oluşturmak için aşağıdaki butona tıklayın:
                </p>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      const demoRes = await axios.post('/api/restaurants/demo');
                      const demoRestaurant = demoRes.data.restaurant;
                      setRestaurant(demoRestaurant);
                      setRestaurantForm({
                        name: demoRestaurant.name,
                        description: demoRestaurant.description,
                        address: demoRestaurant.address,
                        phone: demoRestaurant.phone
                      });
                      alert('Demo restaurant oluşturuldu!');
                    } catch (error) {
                      console.error('Demo restaurant oluşturma hatası:', error);
                      alert('Demo restaurant oluşturulamadı: ' + (error.response?.data?.error || error.message));
                    }
                  }}
                >
                  Demo Restaurant Oluştur
                </button>
              </div>
            )}
            
            <form onSubmit={handleRestaurantUpdate} className="form">
              <div className="form-group">
                <label>Restaurant Adı</label>
                <input
                  type="text"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Adres</label>
                <input
                  type="text"
                  value={restaurantForm.address}
                  onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="text"
                  value={restaurantForm.phone}
                  onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </div>
              
              <div className="form-group">
                <label>Kapak Fotoğrafı</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedCoverImage(e.target.files[0])}
                />
                <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                  Restaurant'ınızın ana görseli olarak kullanılacak
                </small>
              </div>
              
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                Güncelle
              </button>
            </form>
          </div>
        )}

        {/* Kategoriler Tab */}
        {activeTab === 'categories' && (
          <div className="tab-content">
                        <div className="section-header">
              <h2>Kategoriler</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowCategoryModal(true);
                  setModalActiveTab('predefined');
                }}
              >
                <Plus size={16} />
                Kategori Ekle
              </button>
            </div>
            
            {/* Mevcut Kategoriler */}
            <div className="categories-section">
              <h3>Mevcut Kategorileriniz</h3>
              <div className="categories-grid">
                {categories.map(category => (
                  <div key={category._id} className="category-card">
                    <div className="category-header">
                      <span className="category-icon">{category.icon}</span>
                      <h4>{category.name}</h4>
                      {category.isPredefined && (
                        <span className="suggestion-badge">Öneri</span>
                      )}
                    </div>
                    <div className="card-actions">
                      {!category.isPredefined && (
                        <button className="btn-icon" onClick={() => deleteCategory(category._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="no-categories">Henüz kategori eklenmemiş. Kategori Ekle butonuna tıklayarak başlayın.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ürünler Tab */}
        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Ürünler</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowProductModal(true)}
              >
                <Plus size={16} />
                Yeni Ürün
              </button>
            </div>
            
            <div className="products-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  {product.image && (
                    <img src={product.image} alt={product.name} />
                  )}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p className="price">{product.price} ₺</p>
                  </div>
                  <div className="card-actions">
                    <button className="btn-icon" onClick={() => deleteProduct(product._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Kod Tab */}
        {activeTab === 'qr' && (
          <div className="tab-content">
            <h2>QR Kod</h2>
            <p>Müşterilerin menünüzü görebilmesi için QR kod oluşturun.</p>
            
            <button className="btn btn-primary" onClick={generateQRCode}>
              <QrCode size={16} />
              QR Kod Oluştur
            </button>
            
            {qrCode && (
              <div className="qr-code-section">
                <h3>QR Kodunuz</h3>
                <img src={qrCode} alt="QR Code" className="qr-code" />
                <p>Bu QR kodu müşterilerinize gösterin.</p>
              </div>
            )}
          </div>
        )}

        {/* Kategori Modal */}
        {showCategoryModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Kategori Ekle</h3>
                <button onClick={() => {
                  setShowCategoryModal(false);
                  setModalActiveTab('predefined');
                  setCategoryForm({ name: '', icon: '🍽️' });
                }}>
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Tabs */}
              <div className="modal-tabs">
                <button 
                  className={`modal-tab ${modalActiveTab === 'predefined' ? 'active' : ''}`}
                  onClick={() => setModalActiveTab('predefined')}
                >
                  Öneriler
                </button>
                <button 
                  className={`modal-tab ${modalActiveTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setModalActiveTab('custom')}
                >
                  Kendi Kategorim
                </button>
              </div>
              
              {/* Hazır Kategoriler Tab */}
              {modalActiveTab === 'predefined' && (
                <div className="modal-tab-content">
                  <p className="modal-description">
                    Aşağıdaki kategoriler öneri olarak sunulmuştur. İstediğinizi seçip "Ekle" butonuna tıklayarak menünüze ekleyebilirsiniz.
                  </p>
                  
                  {predefinedCategories.length === 0 ? (
                    <div className="no-suggestion-categories">
                      <p>Öneri kategorileri yükleniyor...</p>
                    </div>
                  ) : (
                    <>
                      <div className="suggestion-categories-grid">
                        {predefinedCategories.map(category => (
                          <div 
                            key={category._id} 
                            className={`suggestion-category-card ${selectedCategories.includes(category._id) ? 'selected' : ''}`}
                            onClick={() => toggleCategorySelection(category._id)}
                          >
                            <div className="category-icon">{category.icon}</div>
                            <h4>{category.name}</h4>
                            {selectedCategories.includes(category._id) && (
                              <div className="selection-indicator">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="modal-actions">
                        <button type="button" onClick={() => {
                          setShowCategoryModal(false);
                          setModalActiveTab('predefined');
                        }}>
                          İptal
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-success"
                          onClick={async () => {
                            // Seçili öneri kategorilerini ekle
                            for (const categoryId of selectedCategories) {
                              const selectedCategory = predefinedCategories.find(cat => cat._id === categoryId);
                              if (selectedCategory) {
                                try {
                                  await axios.post('/api/categories', {
                                    name: selectedCategory.name,
                                    icon: selectedCategory.icon
                                  });
                                } catch (error) {
                                  console.log('Kategori zaten mevcut:', selectedCategory.name);
                                }
                              }
                            }
                            
                            // Kategorileri yeniden yükle
                            const categoriesRes = await axios.get('/api/categories');
                            setCategories(categoriesRes.data);
                            setSelectedCategories([]);
                            
                            alert('Seçili kategoriler menünüze eklendi!');
                            setShowCategoryModal(false);
                          }}
                        >
                          <Plus size={16} />
                          Ekle
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Özel Kategori Tab */}
              {modalActiveTab === 'custom' && (
                <div className="modal-tab-content">
                  <form onSubmit={handleCategorySubmit}>
                    <div className="form-group">
                      <label>Kategori Adı</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>İkon (Emoji)</label>
                      <input
                        type="text"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                        placeholder="🍽️"
                        maxLength="2"
                      />
                      <small>Bir emoji girin (örn: 🍕, 🍔, 🥗)</small>
                    </div>
                    <div className="modal-actions">
                                              <button type="button" onClick={() => {
                          setShowCategoryModal(false);
                          setModalActiveTab('predefined');
                          setCategoryForm({ name: '', icon: '🍽️' });
                        }}>
                          İptal
                        </button>
                      <button type="submit" className="btn btn-primary">
                        Ekle
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ürün Modal */}
        {showProductModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Yeni Ürün</h3>
                <button onClick={() => setShowProductModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleProductSubmit}>
                <div className="form-group">
                  <label>Ürün Adı</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Fiyat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Ürün Resmi</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowProductModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel; 