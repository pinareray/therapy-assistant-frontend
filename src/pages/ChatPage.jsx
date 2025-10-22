import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ChatPage() {
  // Auth context'ten user, token ve loading bilgilerini al
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  // State'ler
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba! Ben ZeniTalk. Bugün sana nasıl yardımcı olabilirim?",
      sender: "bot",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState(null); // Kullanım limiti bilgisi
  const [showLimitModal, setShowLimitModal] = useState(false); // Limit modal göster/gizle
  const chatEndRef = useRef(null);

  // Debug: Component mount olduğunda auth state'ini kontrol et
  useEffect(() => {
    console.log('═══════════════════════════════════');
    console.log('🔐 AUTH STATE KONTROLÜ');
    console.log('═══════════════════════════════════');
    console.log('User:', user);
    console.log('Token:', token);
    console.log('Loading:', loading);
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('═══════════════════════════════════');
  }, [user, token, loading]);

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

    // Loading mesajlarını sırayla değiştir
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
      // JWT token varsa gönder (authenticated), yoksa anonymous
      const headers = {
        "Content-Type": "application/json",
      };

      // Debug: Token kontrolü
      console.log('🔍 Token kontrolü:', token ? 'Token VAR ✅' : 'Token YOK ❌');
      console.log('📦 Token:', token);

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log('✅ Authorization header eklendi');
      } else {
        console.log('⚠️ Token yok, anonymous olarak gönderiliyor');
      }

      console.log('📤 Request headers:', headers);

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

        // Anonymous kullanıcı limitine ulaştıysa modal göster
        if (error.user_type === "anonymous" && error.limit_reached) {
          setShowLimitModal(true);
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

      // Debug: Backend response
      console.log('📥 Backend response:', data);
      console.log('👤 User type:', data.user_type || 'belirtilmemiş');
      console.log('📊 Usage:', data.usage);

      // Loading interval'i temizle
      clearInterval(loadingInterval);

      // Kullanım bilgisini güncelle
      if (data.usage) {
        setUsage(data.usage);
        console.log('✅ Usage bilgisi güncellendi:', data.usage);
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

  // --- GÜNCELLENMİŞ JSX YAPISI ---
  // İşte burada, güzel tasarımımızı geri getiriyoruz.
  return (
    // En dış katman: Tüm sayfayı kaplayan arka plan.
    <div className="chat-page-background">
      {/* Limit Modal - 5 soru bittiğinde göster */}
      {showLimitModal && (
        <div className="modal-overlay">
          <div className="limit-modal">
            <h2>Ücretsiz Soru Hakkınız Bitti!</h2>
            <p>
              Günde 5 ücretsiz soru hakkınızı kullandınız.
              <br />
              Sınırsız erişim için kayıt olun ve günde 50 mesaj hakkı kazanın!
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

      {/* Ön katman: Ortada duran, yüzen sohbet penceresi. */}
      <div className="chat-window">
        {/* Pencerenin başlığı */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1>ZeniTalk - Psikoloji Destek Chatbot'u</h1>
              {/* Kullanıcı durumu göster */}
              {loading ? (
                <p className="user-email">Yükleniyor...</p>
              ) : user ? (
                <p className="user-email">
                  Hoş geldin, {user.name || user.email}
                </p>
              ) : (
                <p className="user-email">
                  Misafir Kullanıcı
                  {usage && ` (${usage.remaining}/${usage.daily_limit} ücretsiz soru)`}
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
