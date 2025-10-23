import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import MenuPage from './components/MenuPage';
import ScanPage from './components/ScanPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/menu/:restaurantId" element={<MenuPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Ana sayfa bileşeni
function HomePage() {
  const [demoRestaurantId, setDemoRestaurantId] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ensureDemo = async () => {
      try {
        setCreating(true);
        const res = await axios.post('/api/restaurants/demo');
        if (mounted) setDemoRestaurantId(res.data.restaurant._id);
      } catch (e) {
        // noop
      } finally {
        if (mounted) setCreating(false);
      }
    };
    ensureDemo();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1>QR Kod Menü Sistemi</h1>
        <p>Restaurant menünüzü dijital hale getirin ve müşterilerinize modern bir deneyim sunun!</p>
        <div className="hero-buttons">
          <Link
            className="btn btn-primary"
            to={demoRestaurantId ? `/menu/${demoRestaurantId}` : '#'}
            aria-disabled={!demoRestaurantId}
            onClick={(e) => { if (!demoRestaurantId) e.preventDefault(); }}
          >
            {creating && !demoRestaurantId ? 'Menü hazırlanıyor...' : 'Müşteri Menüsünü Aç'}
          </Link>
          <Link className="btn btn-secondary" to="/admin">Yönetim Paneli</Link>
        </div>
      </div>
    </div>
  );
}

export default App; 