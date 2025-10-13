import React from 'react';
import { Link } from 'react-router-dom'; // Sayfa yönlendirmesi için
import './HomePage.css'; 

function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-content">
        <div className="hero-icon">😊</div>
        <h1>ZİHNİNİZE İYİ GELEN SOHBETLER</h1>
        <p>Her zaman, iyi yerden size destek olmaya hazır</p>
        <div className="hero-buttons">
          <Link to="/chat" className="btn btn-primary">HEMEN SOHBET ET</Link>
          <button className="btn btn-secondary">DAHA FAZLA BİLGİ</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;