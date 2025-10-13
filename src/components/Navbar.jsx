import React, { useState } from 'react';
// Sayfalar arası geçiş için 'Link' bileşenini import ediyoruz.
import { Link } from 'react-router-dom';
// Bu bileşene özel stilleri import ediyoruz.
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
        <li><a href="#" onClick={closeMenu}>Hakkımızda</a></li>
        <li><a href="#" onClick={closeMenu}>İletişim</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;