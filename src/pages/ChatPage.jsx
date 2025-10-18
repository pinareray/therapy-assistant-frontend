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
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const currentInput = input;
    setInput("");
    setIsLoading(true);

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
      const botMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Hata:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Üzgünüm, bir sorun oluştu. Lütfen tekrar deneyin.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
              <p>{message.text}</p>
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
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
