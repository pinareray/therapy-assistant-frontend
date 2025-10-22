# 🆓 Freemium Model Implementation Guide

## 📋 Genel Bakış

**Yeni Özellik:** Kullanıcılar kayıt olmadan **5 soru** sorabilir, sonrasında kayıt olmaya yönlendirilir.

---

## 🔧 BACKEND'DE YAPILACAKLAR

### 1. IP Bazlı Anonymous Rate Limiting

Backend'e **IP bazlı soru sayacı** eklenecek. Her IP için günlük kaç soru sorulduğu takip edilecek.

#### A. Database Modelini Güncelle (`models.py`)

Yeni bir tablo ekle:

```python
from datetime import datetime, date
from sqlalchemy import func

class AnonymousUsage(db.Model):
    """IP bazlı anonim kullanım takibi"""
    __tablename__ = 'anonymous_usage'

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True, nullable=False)  # IPv4 veya IPv6
    question_count = db.Column(db.Integer, default=0)  # Bugün kaç soru sordu
    last_reset_date = db.Column(db.Date, default=date.today)  # Son sıfırlama tarihi
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<AnonymousUsage {self.ip_address}: {self.question_count} sorular>'
```

#### B. Chat Endpoint'ini Güncelle (`app.py`)

`/chat` endpoint'i hem **authenticated** hem **anonymous** kullanıcılara hizmet verecek:

```python
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import date

# Limitleri tanımla
ANONYMOUS_DAILY_LIMIT = 5
REGISTERED_DAILY_LIMIT = 50

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint - hem authenticated hem anonymous kullanıcılar için
    """
    data = request.json
    question = data.get('question')

    if not question:
        return jsonify({"error": "Soru gerekli"}), 400

    # JWT token var mı kontrol et (opsiyonel)
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        is_authenticated = bool(user_id)
    except:
        is_authenticated = False
        user_id = None

    # Authenticated kullanıcı
    if is_authenticated:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Kullanıcı bulunamadı"}), 404

        # Kullanıcının günlük limitini kontrol et
        usage = UsageStats.query.filter_by(user_id=user_id).first()
        if not usage:
            usage = UsageStats(user_id=user_id)
            db.session.add(usage)

        # Günlük limit kontrolü
        usage.check_and_reset_daily()
        if usage.daily_message_count >= REGISTERED_DAILY_LIMIT:
            return jsonify({
                "error": f"Günlük mesaj limitinize ulaştınız ({REGISTERED_DAILY_LIMIT} mesaj/gün)",
                "daily_limit": REGISTERED_DAILY_LIMIT,
                "used": usage.daily_message_count
            }), 429

        # Mesaj sayısını artır
        usage.increment_message_count()
        db.session.commit()

        # RAG'e gönder (session_id = user_id)
        answer = rag_chain.invoke(
            {"input": question},
            config={"configurable": {"session_id": f"user_{user_id}"}}
        )["answer"]

        # Chat history'e kaydet
        chat_history = ChatHistory(
            user_id=user_id,
            session_id=f"user_{user_id}",
            question=question,
            answer=answer
        )
        db.session.add(chat_history)
        db.session.commit()

        return jsonify({
            "answer": answer,
            "usage": {
                "daily_count": usage.daily_message_count,
                "daily_limit": REGISTERED_DAILY_LIMIT,
                "remaining": REGISTERED_DAILY_LIMIT - usage.daily_message_count
            },
            "user_type": "registered"
        })

    # Anonymous kullanıcı (IP bazlı)
    else:
        # IP adresini al
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ',' in ip_address:
            ip_address = ip_address.split(',')[0].strip()

        # IP'nin bugün kaç soru sorduğunu kontrol et
        anonymous_usage = AnonymousUsage.query.filter_by(ip_address=ip_address).first()

        if not anonymous_usage:
            # İlk defa soru soruyor
            anonymous_usage = AnonymousUsage(
                ip_address=ip_address,
                question_count=0,
                last_reset_date=date.today()
            )
            db.session.add(anonymous_usage)
        else:
            # Günlük reset kontrolü (gün değiştiyse sıfırla)
            if anonymous_usage.last_reset_date != date.today():
                anonymous_usage.question_count = 0
                anonymous_usage.last_reset_date = date.today()

        # Limit kontrolü
        if anonymous_usage.question_count >= ANONYMOUS_DAILY_LIMIT:
            return jsonify({
                "error": "Ücretsiz soru hakkınız bitti. Devam etmek için kayıt olun!",
                "daily_limit": ANONYMOUS_DAILY_LIMIT,
                "used": anonymous_usage.question_count,
                "user_type": "anonymous",
                "limit_reached": True
            }), 429

        # Mesaj sayısını artır
        anonymous_usage.question_count += 1
        db.session.commit()

        # RAG'e gönder (session_id = IP)
        answer = rag_chain.invoke(
            {"input": question},
            config={"configurable": {"session_id": f"anon_{ip_address}"}}
        )["answer"]

        return jsonify({
            "answer": answer,
            "usage": {
                "daily_count": anonymous_usage.question_count,
                "daily_limit": ANONYMOUS_DAILY_LIMIT,
                "remaining": ANONYMOUS_DAILY_LIMIT - anonymous_usage.question_count
            },
            "user_type": "anonymous"
        })
```

#### C. Database Migration

Yeni tablo için migration çalıştır:

```python
# app.py'nin en altına ekle (veya ayrı migration script'i)
with app.app_context():
    db.create_all()
    print("✅ Database tabloları oluşturuldu!")
```

---

## 🎨 FRONTEND'DE YAPILACAKLAR

### 1. Navbar'a Login/Register Butonları Ekle

**Dosya:** `src/components/Navbar.jsx`

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ZeniTalk
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Ana Sayfa</Link>
          <Link to="/chat" className="nav-link">Sohbet</Link>

          {/* Login/Register veya User Menu */}
          {user ? (
            <div className="navbar-user">
              <span className="user-email-nav">{user.email}</span>
              <button onClick={logout} className="nav-btn logout">
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="nav-btn login">
                Giriş Yap
              </Link>
              <Link to="/register" className="nav-btn register">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

### 2. ChatPage'i Herkese Aç (Protected Route Kaldır)

**Dosya:** `src/App.jsx`

```jsx
// Protected route'u kaldır
<Route path="/chat" element={<ChatPage />} />  {/* Artık herkes erişebilir */}
```

### 3. ChatPage'i Anonymous + Registered Kullanıcılar İçin Güncelle

**Dosya:** `src/pages/ChatPage.jsx`

ChatPage'de şu değişiklikleri yap:

```jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ChatPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba! Ben ZeniTalk. Bugün sana nasıl yardımcı olabilirim?",
      sender: "bot",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    const loadingMessageId = Date.now() + 1;
    const loadingMessage = {
      id: loadingMessageId,
      text: "Sorun analiz ediliyor...",
      sender: "bot",
      isLoading: true,
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      loadingMessage,
    ]);

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    const loadingTexts = [
      "Sorun analiz ediliyor...",
      "Cevap hazırlanıyor...",
      "Düşünüyor...",
    ];
    let textIndex = 0;
    const loadingInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? { ...msg, text: loadingTexts[textIndex] }
            : msg
        )
      );
    }, 1500);

    try {
      // JWT token varsa gönder, yoksa anonymous
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          question: currentInput
        }),
      });

      // Günlük limit aşıldıysa
      if (response.status === 429) {
        const error = await response.json();
        clearInterval(loadingInterval);

        // Anonymous kullanıcı limitine ulaştıysa
        if (error.user_type === "anonymous" && error.limit_reached) {
          setShowLimitModal(true); // Modal göster
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    text: "Ücretsiz soru hakkınız bitti! Devam etmek için kayıt olun.",
                    isLoading: false,
                  }
                : msg
            )
          );
        } else {
          // Registered kullanıcı limitine ulaştı
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    text: error.error || "Günlük mesaj limitinize ulaştınız",
                    isLoading: false,
                  }
                : msg
            )
          );
        }
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      clearInterval(loadingInterval);

      // Kullanım bilgisini güncelle
      if (data.usage) {
        setUsage(data.usage);
      }

      // Loading mesajını gerçek cevapla değiştir
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? { ...msg, text: data.answer, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Hata:", error);
      clearInterval(loadingInterval);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                text: "Üzgünüm, bir sorun oluştu. Lütfen tekrar deneyin.",
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page-background">
      {/* Limit Modal */}
      {showLimitModal && (
        <div className="modal-overlay">
          <div className="limit-modal">
            <h2>🎉 Ücretsiz Soru Hakkınız Bitti!</h2>
            <p>
              Günde 5 ücretsiz soru hakkınızı kullandınız.
              <br />
              Sınırsız erişim için kayıt olun!
            </p>
            <div className="modal-buttons">
              <button
                onClick={() => navigate("/register")}
                className="modal-btn primary"
              >
                Kayıt Ol (Ücretsiz)
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="modal-btn secondary"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-window">
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1>ZeniTalk - Psikoloji Destek Chatbot'u</h1>
              {user ? (
                <p className="user-email">Hoş geldin, {user.email}</p>
              ) : (
                <p className="user-email">
                  Misafir Kullanıcı (
                  {usage ? `${usage.remaining}/${usage.daily_limit}` : "5/5"} ücretsiz
                  soru)
                </p>
              )}
            </div>
            <div className="header-right">
              {/* Kullanım limiti bilgisi */}
              {usage && (
                <div className="usage-info">
                  <span>
                    {usage.daily_count}/{usage.daily_limit} mesaj
                  </span>
                  <span className="remaining">
                    ({usage.remaining} kaldı)
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mesajların gösterildiği alan */}
        <div className="chat-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <p>
                {message.text}
                {message.isLoading && (
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                )}
              </p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Mesaj giriş alanı */}
        <footer className="input-container">
          <input
            type="text"
            placeholder={
              isLoading ? "Cevap bekleniyor..." : "Mesajını buraya yaz..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? "..." : "Gönder"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ChatPage;
```

### 4. Modal ve Navbar CSS Ekle

**Dosya:** `src/App.css` (En alta ekle)

```css
/* ============================================
   NAVBAR STYLES
   ============================================ */

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-logo {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.navbar-auth {
  display: flex;
  gap: 0.75rem;
}

.nav-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.nav-btn.login {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.nav-btn.login:hover {
  background-color: white;
  color: #667eea;
}

.nav-btn.register {
  background-color: white;
  color: #667eea;
  border: 2px solid white;
}

.nav-btn.register:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email-nav {
  color: white;
  font-size: 0.9rem;
}

.nav-btn.logout {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  cursor: pointer;
}

.nav-btn.logout:hover {
  background-color: white;
  color: #667eea;
}

/* ============================================
   LIMIT MODAL
   ============================================ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.limit-modal {
  background-color: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.limit-modal h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.limit-modal p {
  margin: 0 0 2rem 0;
  color: #4a5568;
  line-height: 1.6;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 1rem;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modal-btn.secondary {
  background-color: #e2e8f0;
  color: #4a5568;
}

.modal-btn.secondary:hover {
  background-color: #cbd5e0;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }

  .navbar-links {
    gap: 0.75rem;
  }

  .nav-link {
    font-size: 0.9rem;
  }

  .nav-btn {
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
  }

  .limit-modal {
    padding: 2rem;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}
```

---

## 📝 ÖZET

### Backend Değişiklikleri:
1. ✅ `AnonymousUsage` tablosu ekle (IP bazlı tracking)
2. ✅ `/chat` endpoint'ini güncelle (hem auth hem anonymous)
3. ✅ IP bazlı 5 soru limiti
4. ✅ Registered kullanıcılar için 50 soru limiti

### Frontend Değişiklikleri:
1. ✅ Navbar'a Login/Register butonları ekle
2. ✅ ChatPage'i herkese aç (protected route kaldır)
3. ✅ Anonymous kullanıcı desteği ekle
4. ✅ Limit aşıldığında modal göster
5. ✅ Usage counter göster (X/5 veya X/50)

---

## 🧪 Test Senaryosu

1. **Anonymous kullanıcı:**
   - Chat'e git (kayıt olmadan)
   - 5 soru sor
   - 6. soruda modal görünecek: "Kayıt ol!"

2. **Registered kullanıcı:**
   - Kayıt ol / Giriş yap
   - Header'da email + 0/50 mesaj görecek
   - 50 mesaj sonra limit uyarısı

---

## 🚀 Deployment

Backend'de migration çalıştır:
```bash
cd /Users/pinareray/Desktop/akbank-genai-backend
python app.py  # db.create_all() çalışacak
```

Frontend otomatik güncellenecek (HMR)!

---

Hazır! Backend ekibine bu dökümanı at! 🎯
