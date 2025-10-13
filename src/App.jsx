import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <div>
      {/* Navbar'ı her sayfanın en üstünde gösterir. */}
      <Navbar />

      {/* Sayfa içeriğinin gösterileceği ana alan. */}
      <main>
        {/* Hangi URL'de hangi sayfanın yükleneceğini belirler. */}
        <Routes>
          {/* Ana URL ("/") için HomePage'i gösterir. */}
          <Route path="/" element={<HomePage />} />

          {/* "/chat" URL'i için ChatPage'i gösterir. */}
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;