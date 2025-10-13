import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Lottie from "lottie-react";

// YENİ: URL yerine, projemizin içindeki JSON dosyasını doğrudan import ediyoruz.
// Dosya adının seninkine uyduğundan emin ol!
import aiAnimationData from "../assets/Technology isometric ai robot brain.json";

function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-content">
        {/* Lottie bileşeninin 'animationData' prop'una artık import ettiğimiz veriyi veriyoruz. */}
        <Lottie
          animationData={aiAnimationData} // <-- DEĞİŞİKLİK BURADA
          loop={true}
          style={{ height: 250, marginBottom: "1rem" }} // Animasyonun boyutunu biraz artırdık
        />

        <h1>ZİHNİNİZE İYİ GELEN SOHBETLER</h1>
        <p>Her zaman, iyi yerden size destek olmaya hazır</p>
        <div className="hero-buttons">
          <Link to="/chat" className="btn btn-primary">
            HEMEN SOHBET ET
          </Link>
          <button className="btn btn-secondary">DAHA FAZLA BİLGİ</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
