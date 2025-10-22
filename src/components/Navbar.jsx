import React, { useState } from 'react';
// Sayfalar arası geçiş için 'Link' bileşenini import ediyoruz.
import { Link } from 'react-router-dom';
// Auth context'ten user ve logout bilgisini alıyoruz
import { useAuth } from '../context/AuthContext';
// Bu bileşene özel stilleri import ediyoruz.
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // Auth state'ini al
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Sol taraftaki logo ve ana sayfaya link */}
      <div className="nav-logo">
        <Link to="/" onClick={closeMenu}>🧠 ZeniTalk</Link>
      </div>

      {/* Hamburger menu butonu - sadece mobilde görünür */}
      <button
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sağ taraftaki sayfa linkleri */}
      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Ana Sayfa</Link></li>
        <li><Link to="/chat" onClick={closeMenu}>Sohbet</Link></li>

        {/* Kullanıcı login olmuşsa profil dropdown göster */}
        {user ? (
          <li className="profile-dropdown">
            <button onClick={toggleProfile} className="profile-btn">
              <span className="profile-icon">👤</span>
              <span className="profile-name">
                {user.name || 'Profil'}
              </span>
              <span className="dropdown-arrow">{isProfileOpen ? '▲' : '▼'}</span>
            </button>
            {/* Dropdown menü */}
            {isProfileOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item-info">
                  <p className="dropdown-name">
                    {user.name && user.surname
                      ? `${user.name} ${user.surname}`
                      : user.email}
                  </p>
                  <p className="dropdown-email">{user.email}</p>
                  <p className="dropdown-usage">Günlük kullanım limiti</p>
                </div>
                <button onClick={handleLogout} className="dropdown-item-logout">
                  Çıkış Yap
                </button>
              </div>
            )}
          </li>
        ) : (
          // Login olmamışsa Login/Register butonları göster
          <>
            <li>
              <Link to="/login" onClick={closeMenu} className="nav-btn-login">
                Giriş Yap
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={closeMenu} className="nav-btn-register">
                Kayıt Ol
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;