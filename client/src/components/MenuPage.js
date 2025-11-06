import axios from 'axios';
import { Minus, Plus, Search, ShoppingCart, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MenuPage.css';

function MenuPage() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]); // { productId, name, price, image, quantity }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderTable, setOrderTable] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Restaurant bilgilerini al
      const restaurantRes = await axios.get(`/api/restaurants/${restaurantId}`);
      setRestaurant(restaurantRes.data);
      
      // Kategorileri al (menüde göstermek için isim ve ikonları kullanacağız)
      const categoriesRes = await axios.get('/api/categories');
      setCategories(categoriesRes.data);
      
      // Ürünleri al
      const productsRes = await axios.get('/api/products');
      setProducts(productsRes.data);
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cart helpers
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qrmenu_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('qrmenu_cart', JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  const getProductId = (product) => product?._id;
  const getCartItemQuantity = (productId) => cart.find(ci => ci.productId === productId)?.quantity || 0;
  const addToCart = (product) => {
    const productId = getProductId(product);
    if (!productId) return;
    setCart(prev => {
      const existing = prev.find(ci => ci.productId === productId);
      if (existing) {
        return prev.map(ci => ci.productId === productId ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [
        ...prev,
        { productId, name: product.name, price: Number(product.price) || 0, image: product.image, quantity: 1 }
      ];
    });
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
        items: cart.map(ci => ({ productId: ci.productId, name: ci.name, price: ci.price, quantity: ci.quantity }))
      };
      await axios.post(`/api/restaurants/${restaurantId}/orders`, payload);
      setOrdering(false);
      setIsOrderModalOpen(false);
      setIsCartOpen(false);
      clearCart();
      alert('Siparişiniz alındı. Teşekkürler!');
    } catch (e) {
      setOrdering(false);
      alert('Sipariş gönderilemedi: ' + (e.response?.data?.error || e.message));
    }
  };

  // Yardımcı: ürünün kategori id'sini normalize et (string veya populate edilmiş obje olabilir)
  const getProductCategoryId = (product) => {
    if (!product || !product.category) return undefined;
    if (typeof product.category === 'string') return product.category;
    return product.category._id;
  };

  // Arama filtresi
  const productsMatchingSearch = products.filter(product => {
    const nameMatches = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatches = product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return Boolean(nameMatches || descMatches);
  });

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Menü yükleniyor...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container">
        <div className="error">Restaurant bulunamadı!</div>
      </div>
    );
  }

  // Kategori yongaları (chips) - ikon ve isimle
  const CategoryChips = () => (
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
          title={category.name}
        >
          <span className="chip-icon">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );

  // Ürünleri kategoriye göre grupla (aktif kategoriye göre filtre uygula)
  const groupedProductsByCategory = categories.map(category => {
    const categoryProducts = productsMatchingSearch.filter(p => getProductCategoryId(p) === category._id);
    return { category, products: categoryProducts };
  });

  return (
    <div className="menu-page">
      <div className="container">
        {/* Restaurant Bilgileri */}
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

        {/* Arama */}
        <div className="search-filter">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Kategori Chips */}
        <CategoryChips />

        {/* Ürünler - Kategori Gruplu */}
        {selectedCategory === 'all' ? (
          groupedProductsByCategory.every(g => g.products.length === 0) ? (
            <div className="no-products"><p>Ürün bulunamadı.</p></div>
          ) : (
            groupedProductsByCategory.map(group => (
              group.products.length === 0 ? null : (
                <div key={group.category._id} className="category-section">
                  <h2 className="category-title">
                    <span className="category-title-icon">{group.category.icon}</span>
                    {group.category.name}
                  </h2>
                  <div className="products-grid">
                    {group.products.map(product => (
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
                </div>
              )
            ))
          )
        ) : (
          (() => {
            const activeCategory = categories.find(c => c._id === selectedCategory);
            const activeProducts = productsMatchingSearch.filter(p => getProductCategoryId(p) === selectedCategory);
            return (
              <div className="category-section">
                {activeCategory && (
                  <h2 className="category-title">
                    <span className="category-title-icon">{activeCategory.icon}</span>
                    {activeCategory.name}
                  </h2>
                )}
                <div className="products-grid">
                  {activeProducts.length === 0 ? (
                    <div className="no-products"><p>Bu kategoride ürün yok.</p></div>
                  ) : (
                    activeProducts.map(product => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        quantity={getCartItemQuantity(product._id)}
                        onAdd={() => addToCart(product)}
                        onIncrement={() => incrementItem(product._id)}
                        onDecrement={() => decrementItem(product._id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })()
        )}
        
        {/* Cart Floating Button */}
        <button className="cart-fab" onClick={() => setIsCartOpen(true)} disabled={cartCount === 0}>
          <ShoppingCart size={18} />
          <span>Sepet ({cartCount})</span>
          <span className="cart-fab-total">{cartTotal.toFixed(2)} ₺</span>
        </button>
      </div>
      
      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Sepetim</h3>
              <button className="cart-close" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">Sepetiniz boş.</div>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.productId} className="cart-item">
                    {item.image && <img className="cart-item-image" src={item.image} alt={item.name} />}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">{item.price.toFixed(2)} ₺</div>
                      <div className="cart-qty-controls">
                        <button onClick={() => decrementItem(item.productId)} className="qty-btn" aria-label="Azalt"><Minus size={16} /></button>
                        <span className="qty">{item.quantity}</span>
                        <button onClick={() => incrementItem(item.productId)} className="qty-btn" aria-label="Arttır"><Plus size={16} /></button>
                        <button onClick={() => removeItem(item.productId)} className="remove-btn" aria-label="Kaldır"><Trash size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-footer">
              <div className="cart-total">
                <span>Toplam</span>
                <strong>{cartTotal.toFixed(2)} ₺</strong>
              </div>
              <div className="cart-actions">
                <button className="btn btn-secondary" onClick={clearCart} disabled={cart.length === 0}>Temizle</button>
                <button className="btn btn-primary" onClick={() => setIsOrderModalOpen(true)} disabled={cart.length === 0}>Siparişi Ver</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="order-modal-overlay" onClick={() => setIsOrderModalOpen(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Siparişi Onayla</h3>
            <div className="order-form-group">
              <label>Masa / Ad Soyad (opsiyonel)</label>
              <input type="text" value={orderTable} onChange={(e) => setOrderTable(e.target.value)} placeholder="Örn: Masa 5" />
            </div>
            <div className="order-form-group">
              <label>Not (opsiyonel)</label>
              <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Örn: Az tuzlu olsun"></textarea>
            </div>
            <div className="order-summary">
              <span>Toplam:</span>
              <strong>{cartTotal.toFixed(2)} ₺</strong>
            </div>
            <div className="order-modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsOrderModalOpen(false)}>İptal</button>
              <button className="btn btn-primary" onClick={submitOrder} disabled={ordering}>{ordering ? 'Gönderiliyor...' : 'Onayla ve Gönder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ürün Kartı Bileşeni
function ProductCard({ product, quantity = 0, onAdd, onIncrement, onDecrement }) {
  return (
    <div className="product-card">
      {product.image && (
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
      )}
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.description && <p>{product.description}</p>}
        <div className="product-price">
          <span className="price">{Number(product.price).toFixed(2)} ₺</span>
        </div>
        <div className="product-actions">
          {quantity > 0 ? (
            <div className="qty-inline">
              <button className="qty-btn" onClick={onDecrement} aria-label="Azalt"><Minus size={16} /></button>
              <span className="qty">{quantity}</span>
              <button className="qty-btn" onClick={onIncrement} aria-label="Arttır"><Plus size={16} /></button>
            </div>
          ) : (
            <button className="btn btn-primary add-btn" onClick={onAdd}>Sepete Ekle</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuPage; 