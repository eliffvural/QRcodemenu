import { Home, Menu, QrCode, Settings } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <Menu size={24} />
            <span>QR Menü</span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">
              <Home size={20} />
              <span>Ana Sayfa</span>
            </Link>
            <Link to="/scan" className="nav-link">
              <QrCode size={20} />
              <span>QR ile Aç</span>
            </Link>
            <Link to="/admin" className="nav-link">
              <Settings size={20} />
              <span>Yönetim</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 