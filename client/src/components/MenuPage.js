import axios from 'axios';
import { Minus, Plus, RefreshCw, Search, ShoppingCart, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AIChatWidget from './AIChatWidget'; // Yapay Zeka Bileşeni
import './MenuPage.css';

function MenuPage() {
  const { restaurantId } = useParams();
  
  // --- STATE TANIMLARI ---
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sepet ve Sipariş State'leri
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderTable, setOrderTable] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [ordering, setOrdering] = useState(false);

  // Sabit Liste Önerileri (Opsiyonel, sayfa başında çıkanlar)
  const [recommendations, setRecommendations] = useState([]);

  // --- VERİ ÇEKME VE BAŞLANGIÇ ---
  useEffect(() => {
    if (restaurantId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  // Sayfa odağa gelince veriyi taze tut
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchData(true);
    };
    const handleFocus = () => {
      fetchData(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  // LocalStorage'dan Sepeti Yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qrmenu_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // Sepet Değişince Kaydet
  useEffect(() => {
    try {
      localStorage.setItem('qrmenu_cart', JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  // --- FONKSİYONLAR ---

  const fetchData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setLoading(true);
      
      const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
      
      // Tüm verileri paralel çek (Adreslerin başında localhost:5000 var)
      const [resData, catData, prodData] = await Promise.all([
        axios.get(`http://localhost:5000/api/restaurants/${restaurantId}${timestamp}`),
        axios.get(`http://localhost:5000/api/categories${timestamp}`),
        axios.get(`http://localhost:5000/api/products${timestamp}`)
      ]);

      setRestaurant(resData.data);
      setCategories(catData.data);
      setProducts(prodData.data);

      // (Opsiyonel) Sabit Öneriler İsteği
      try {
        const customerData = { customer_id: 'simulasyon_user', context: { time_of_day: 'evening' } };
        // AI servisi için de tam adres
        const recRes = await axios.post(`http://localhost:5000/api/ai/customer-recommendation/${restaurantId}`, customerData);
        setRecommendations(recRes.data);
      } catch (e) {
        // AI servisi kapalıysa sessizce geç
        setRecommendations([]);
      }
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      // Yükleme animasyonunu durdur
      setLoading(false);
    }
  };

  const getCartItemQuantity = (productId) => cart.find(ci => ci.productId === productId)?.quantity || 0;
  
  const addToCart = (product) => {
    if (!product || !product._id) return;
    const productId = product._id;

    setCart(prev => {
      const existing = prev.find(ci => ci.productId === productId);
      if (existing) {
        return prev.map(ci => ci.productId === productId ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [
        ...prev,
        { 
          productId, 
          name: product.name, 
          price: Number(product.price) || 0, 
          image: product.image, 
          quantity: 1 
        }
      ];
    });
    
    // Ufak bir kullanıcı bildirimi (Opsiyonel)
    // console.log(`${product.name} sepete eklendi.`);
  };

  const incrementItem = (productId) => setCart(prev => prev.map(ci => ci.productId === productId ? { ...ci, quantity: ci.quantity + 1 } : ci));
  
  const decrementItem = (productId) => setCart(prev => prev.flatMap(ci => {
    if (ci.productId !== productId) return [ci];
    const nextQty = ci.quantity - 1;
    return nextQty > 0 ? [{ ...ci, quantity: nextQty }] : [];
  }));
  
  const removeItem = (productId) => setCart(prev => prev.filter(ci => ci.productId !== productId));
  const clearCart = () => setCart([]);
  
  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = cart.reduce((sum, ci) => sum + ci.quantity * (Number(ci.price) || 0), 0);

  const submitOrder = async () => {
    try {
      if (cart.length === 0) return;
      setOrdering(true);
      
      const payload = {
        table: orderTable,
        note: orderNote,
        items: cart.map(ci => ({ 
            productId: ci.productId, 
            name: ci.name, 
            price: ci.price, 
            quantity: ci.quantity 
        }))
      };

      await axios.post(`/api/restaurants/${restaurantId}/orders`, payload);
      
      setOrdering(false);
      setIsOrderModalOpen(false);
      setIsCartOpen(false);
      clearCart();
      alert('Siparişiniz mutfağa iletildi! Afiyet olsun.');
    } catch (e) {
      setOrdering(false);
      alert('Sipariş gönderilemedi: ' + (e.response?.data?.error || e.message));
    }
  };

  // Helper: Kategori ID kontrolü
  const getProductCategoryId = (product) => {
    if (!product || !product.category) return undefined;
    if (typeof product.category === 'string') return product.category;
    return product.category._id;
  };

  // Helper: Arama Filtresi
  const productsMatchingSearch = products.filter(product => {
    const term = searchTerm.toLowerCase();
    const nameMatches = product.name?.toLowerCase().includes(term);
    const descMatches = product.description?.toLowerCase().includes(term);
    return Boolean(nameMatches || descMatches);
  });

  // Helper: Ürün Listesi Render
  const renderProductList = (productList) => (
    <div className="products-grid">
      {productList.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          quantity={getCartItemQuantity(product._id)}
          onAdd={() => addToCart(product)}
          onIncrement={() => incrementItem(product._id)}
          onDecrement={() => decrementItem(product._id)}
        />
      ))}
    </div>
  );

  // --- RENDER ---

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
        <div className="loading-spinner">🍽️</div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="container"><div className="error">Restaurant bulunamadı!</div></div>;
  }

  return (
    <div className="menu-page">
      <div className="container">
        
        {/* 1. RESTORAN BİLGİSİ */}
        <div className="restaurant-info">
          {restaurant.coverImage && (
            <div className="restaurant-cover">
              <img src={restaurant.coverImage} alt={restaurant.name} className="restaurant-cover-image" />
            </div>
          )}
          <div className="restaurant-details">
            <div className="restaurant-header">
              {restaurant.logo && (
                <img src={restaurant.logo} alt={restaurant.name} className="restaurant-logo" />
              )}
              <div className="restaurant-title">
                <h1>{restaurant.name}</h1>
                {restaurant.description && <p>{restaurant.description}</p>}
                {restaurant.address && <p className="address">{restaurant.address}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ARAMA VE YENİLEME */}
        <div className="search-filter">
          <div className="search-box">
            <Search size={18} color="#999" />
            <input
              type="text"
              placeholder="Menüde lezzet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={() => fetchData(true)} title="Menüyü Yenile">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* 3. KATEGORİ SEKMELERİ */}
        <div className="category-chips">
          <button
            className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Tümü
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              className={`chip ${selectedCategory === category._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.icon && <span className="chip-icon">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>

        {/* 4. AI SABİT ÖNERİLER (Sadece anasayfada ve arama yoksa görünür) */}
        {recommendations.length > 0 && searchTerm === '' && selectedCategory === 'all' && (
          <div className="recommendations-section" style={{marginBottom: 30}}>
            <h2 className="category-title">✨ Sizin İçin Seçtiklerimiz</h2>
            {renderProductList(recommendations)}
          </div>
        )}

        {/* 5. ANA ÜRÜN LİSTESİ */}
        <div className="category-section">
          {selectedCategory === 'all' ? (
            // TÜM ÜRÜNLER (veya arama sonucu)
            productsMatchingSearch.length === 0 ? (
              <div className="no-products"><p>Aradığınız kriterde ürün bulunamadı.</p></div>
            ) : (
              renderProductList(productsMatchingSearch)
            )
          ) : (
            // KATEGORİ BAZLI GÖSTERİM
            (() => {
              const activeCategory = categories.find(c => c._id === selectedCategory);
              const activeProducts = productsMatchingSearch.filter(p => getProductCategoryId(p) === selectedCategory);
              return (
                <>
                  {activeCategory && (
                    <h2 className="category-title">
                      {activeCategory.icon} {activeCategory.name}
                    </h2>
                  )}
                  {activeProducts.length === 0 ? (
                    <div className="no-products"><p>Bu kategoride henüz ürün yok.</p></div>
                  ) : (
                    renderProductList(activeProducts)
                  )}
                </>
              );
            })()
          )}
        </div>

        {/* 6. YÜZEN SEPET BUTONU */}
        {cartCount > 0 && (
          <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
            <div style={{display:'flex', alignItems:'center', gap: '8px'}}>
                <ShoppingCart size={20} />
                <span>Sepetim ({cartCount})</span>
            </div>
            <span className="cart-fab-total">{cartTotal.toFixed(2)} ₺</span>
          </button>
        )}

        {/* 7. AI CHAT WIDGET (DİJİTAL ASİSTAN) */}
        {/* Sayfanın en altına, container içine yerleştiriyoruz */}
        <AIChatWidget 
            restaurantId={restaurantId}
            menuItems={products}
            onAddToCart={addToCart}
        />

      </div> {/* Container Sonu */}

      {/* --- MODALLAR VE DRAWERLAR --- */}

      {/* Sepet Çekmecesi */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Sepetim</h3>
              <button className="cart-close" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            
            {cart.length === 0 ? (
              <div className="cart-empty" style={{padding:20, textAlign:'center'}}>Sepetiniz boş.</div>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.productId} className="cart-item">
                    {item.image && <img className="cart-item-image" src={item.image} alt={item.name} />}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">{item.price.toFixed(2)} ₺</div>
                      <div className="cart-qty-controls">
                        <button onClick={() => decrementItem(item.productId)} className="qty-btn"><Minus size={14} /></button>
                        <span className="qty">{item.quantity}</span>
                        <button onClick={() => incrementItem(item.productId)} className="qty-btn"><Plus size={14} /></button>
                        <button onClick={() => removeItem(item.productId)} className="remove-btn"><Trash size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="cart-footer">
              <div className="cart-total">
                <span>Toplam Tutar</span>
                <strong>{cartTotal.toFixed(2)} ₺</strong>
              </div>
              <div className="cart-actions">
                <button className="btn btn-secondary" onClick={clearCart} disabled={cart.length === 0}>Temizle</button>
                <button className="btn btn-primary" onClick={() => setIsOrderModalOpen(true)} disabled={cart.length === 0}>Siparişi Tamamla</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sipariş Onay Modalı */}
      {isOrderModalOpen && (
        <div className="order-modal-overlay" onClick={() => setIsOrderModalOpen(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Siparişi Onayla</h3>
            <div className="order-form-group">
              <label>Masa No / İsim</label>
              <input 
                type="text" 
                value={orderTable} 
                onChange={(e) => setOrderTable(e.target.value)} 
                placeholder="Örn: Masa 5" 
              />
            </div>
            <div className="order-form-group">
              <label>Sipariş Notu</label>
              <textarea 
                value={orderNote} 
                onChange={(e) => setOrderNote(e.target.value)} 
                placeholder="Örn: Turşu olmasın..." 
                rows={3}
              ></textarea>
            </div>
            <div className="order-summary">
              <span>Toplam Ödenecek:</span>
              <span style={{color:'var(--primary-color)'}}>{cartTotal.toFixed(2)} ₺</span>
            </div>
            <div className="order-modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsOrderModalOpen(false)}>İptal</button>
              <button className="btn btn-primary" onClick={submitOrder} disabled={ordering}>
                {ordering ? 'Gönderiliyor...' : 'Siparişi Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- ALT BİLEŞEN: ÜRÜN KARTI ---
function ProductCard({ product, quantity = 0, onAdd, onIncrement, onDecrement }) {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
            <img src={product.image} alt={product.name} />
        ) : (
            <div style={{width:'100%', height:'100%', background:'#f1f3f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem'}}>🍔</div>
        )}
      </div>
      <div className="product-info">
        <div>
            <h3>{product.name}</h3>
            {product.description && <p>{product.description}</p>}
        </div>
        <div className="product-price">
            <span className="price">{Number(product.price).toFixed(2)} ₺</span>
            
            <div className="product-actions">
              {quantity > 0 ? (
                  <div className="qty-inline">
                  <button className="qty-btn" onClick={onDecrement}><Minus size={14} /></button>
                  <span className="qty">{quantity}</span>
                  <button className="qty-btn" onClick={onIncrement}><Plus size={14} /></button>
                  </div>
              ) : (
                  <button className="add-btn" onClick={onAdd}>Ekle</button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;