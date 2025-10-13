import React from 'react';
// Sayfalar arası geçiş için 'Link' bileşenini import ediyoruz.
import { Link } from 'react-router-dom';
// Bu bileşene özel stilleri import ediyoruz.
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      {/* Sol taraftaki logo ve ana sayfaya link */}
      <div className="nav-logo">
        <Link to="/">🧠 ZeniTalk</Link>
      </div>
      {/* Sağ taraftaki sayfa linkleri */}
      <ul className="nav-links">
        <li><Link to="/">Ana Sayfa</Link></li>
        <li><Link to="/chat">Sohbet</Link></li>
        <li><a href="#">Hakkımızda</a></li>
        <li><a href="#">İletişim</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;