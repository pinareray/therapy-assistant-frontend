import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Korumalı route component'i - sadece login olmuş kullanıcılar erişebilir
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  // Kullanıcı bilgileri yüklenirken loading göster
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  // Token yoksa login sayfasına yönlendir
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token varsa, sayfayı göster
  return children;
};

export default ProtectedRoute;
