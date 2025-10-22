import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const RegisterPage = () => {
  // Form state'leri
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auth context ve navigation
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // İsim kontrolü
    if (!name.trim()) {
      setError('İsim gerekli');
      return;
    }

    // Soyisim kontrolü
    if (!surname.trim()) {
      setError('Soyisim gerekli');
      return;
    }

    // Şifre kontrolü - iki şifre eşleşiyor mu?
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    setIsLoading(true);

    try {
      // Register API çağrısı - isim ve soyisim ile
      await register(name, surname, email, password);
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

        {/* Register Formu */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Kayıt Ol</h2>

          {/* Hata mesajı göster */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* İsim input */}
          <div className="form-group">
            <label htmlFor="name">İsim</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız"
              required
              disabled={isLoading}
            />
          </div>

          {/* Soyisim input */}
          <div className="form-group">
            <label htmlFor="surname">Soyisim</label>
            <input
              id="surname"
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Soyadınız"
              required
              disabled={isLoading}
            />
          </div>

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

          {/* Şifre tekrar input */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
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
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>

          {/* Login sayfasına link */}
          <div className="auth-footer">
            <p>
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="auth-link">
                Giriş Yap
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
