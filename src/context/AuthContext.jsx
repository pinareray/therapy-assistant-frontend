import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // İlk yüklemede localStorage'dan user bilgisini oku
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Token varsa user bilgilerini al
  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (token && !savedUser) {
      // Token var ama localStorage'da user yok, backend'den al
      console.log('🔄 Token var, user yok - backend\'den alınıyor');
      fetchUserInfo();
    } else if (token && savedUser) {
      // Token ve user var, loading'i kapat
      console.log('✅ Token ve user var - hazır!');
      setLoading(false);
    } else {
      // Token yok
      console.log('⚠️ Token yok');
      setLoading(false);
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      console.log('🔄 Fetching user info...');
      console.log('📤 Token:', token);

      const response = await fetch('http://localhost:5001/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User info alındı:', data.user);
        setUser(data.user);
        // localStorage'a da kaydet
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Hata detaylarını göster
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ /auth/me hatası:', response.status, errorData);

        // 422 hatası - Backend validation hatası, logout yapma!
        if (response.status === 422) {
          console.warn('⚠️ Backend validation hatası - Token geçerli ama endpoint çalışmıyor');
          // Token'ı tutmaya devam et, logout yapma
          setLoading(false);
          return;
        }

        // Sadece 401 (Unauthorized) da logout yap
        if (response.status === 401) {
          console.warn('⚠️ Token geçersiz, logout yapılıyor');
          logout();
        }
      }
    } catch (error) {
      console.error('❌ User info fetch error:', error);
      // Network hatası - logout yapma, token'ı koru
      console.warn('⚠️ Network hatası - Token korunuyor');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch('http://localhost:5001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Giriş başarısız');
    }

    const data = await response.json();
    console.log('✅ Login başarılı:', data.user);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user)); // User bilgisini kaydet
    return data;
  };

  const register = async (name, surname, email, password) => {
    const response = await fetch('http://localhost:5001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        surname,
        email,
        password
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Kayıt başarısız');
    }

    const data = await response.json();
    console.log('✅ Register başarılı:', data.user);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user)); // User bilgisini kaydet
    return data;
  };

  const logout = () => {
    console.log('👋 Logout yapılıyor...');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // User bilgisini de sil
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
