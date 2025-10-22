import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    // AuthProvider ile tüm uygulamayı sarmalayarak auth state'ini tüm componentlere ulaştır
    <AuthProvider>
      <div>
        {/* Navbar'ı her sayfanın en üstünde gösterir. */}
        <Navbar />

        {/* Sayfa içeriğinin gösterileceği ana alan. */}
        <main>
          {/* Hangi URL'de hangi sayfanın yükleneceğini belirler. */}
          <Routes>
            {/* Ana URL ("/") için HomePage'i gösterir. */}
            <Route path="/" element={<HomePage />} />

            {/* Login ve Register sayfaları - kimlik doğrulama gerektirmez */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* "/chat" URL'i için ChatPage'i gösterir - artık herkes erişebilir */}
            <Route path="/chat" element={<ChatPage />} />

            {/* Bilinmeyen route'lar için ana sayfaya yönlendir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;