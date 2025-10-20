import React, { useState, useEffect, useRef } from "react";
import "../App.css"; // Stil dosyamız

function ChatPage() {
  // Tüm state ve fonksiyonlarımız, streaming mantığıyla birlikte burada.
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba! Ben ZeniTalk. Bugün sana nasıl yardımcı olabilirim?",
      sender: "bot",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const chatEndRef = useRef(null);

  // Session ID oluştur ve localStorage'da sakla
  useEffect(() => {
    let currentSessionId = localStorage.getItem("session_id");
    if (!currentSessionId) {
      currentSessionId =
        "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("session_id", currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

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
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentInput,
          session_id: sessionId,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Loading interval'i temizle
      clearInterval(loadingInterval);

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
      {/* Ön katman: Ortada duran, yüzen sohbet penceresi. */}
      <div className="chat-window">
        {/* Pencerenin başlığı */}
        <header className="app-header">
          <h1>ZeniTalk - Psikoloji Destek Chatbot'u</h1>
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
