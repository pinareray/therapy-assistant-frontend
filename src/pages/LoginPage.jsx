import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const LoginPage = () => {
  // Form state'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auth context ve navigation
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login API çağrısı
      await login(email, password);
      // Başarılıysa chat sayfasına yönlendir
      navigate('/chat');
    } catch (err) {
      // Hata varsa göster
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-background">
      <div className="auth-container">
        {/* Logo ve Başlık */}
        <div className="auth-header">
          <h1>ZeniTalk</h1>
          <p>Psikoloji Destek Chatbot'una Hoş Geldiniz</p>
        </div>

        {/* Login Formu */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Giriş Yap</h2>

          {/* Hata mesajı göster */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* Şifre input */}
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {/* Submit butonu */}
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          {/* Register sayfasına link */}
          <div className="auth-footer">
            <p>
              Hesabınız yok mu?{' '}
              <Link to="/register" className="auth-link">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
