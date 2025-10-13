import React, { useState } from "react";
import "../App.css"; // Genel stilleri buradan alacak

function ChatPage() {
  // 1. STATE YÖNETİMİ
  // 'input', kullanıcının yazdığı anlık metni tutar.
  const [input, setInput] = useState("");
  // 'messages', tüm sohbet geçmişini bir dizi olarak tutar.
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba! Ben ZeniTalk. Bugün sana nasıl yardımcı olabilirim?",
      sender: "bot",
    },
  ]);
  // 'isLoading', backend'den cevap beklenirken butonları pasif hale getirmek için kullanılır.
  const [isLoading, setIsLoading] = useState(false);

  // 2. MESAJ GÖNDERME FONKSİYONU
  const handleSendMessage = async () => {
    // Boş mesaj gönderilmesini engeller.
    if (!input.trim()) return;

    // Kullanıcının mesajını ekrana ekliyoruz.
    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(""); // Mesaj kutusunu temizliyoruz.
    setIsLoading(true); // Yüklenme durumunu başlatıyoruz.

    try {
      // 3. BACKEND'E API İSTEĞİ
      // 'fetch' ile backend'deki /chat endpoint'ine POST isteği gönderiyoruz.
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Gövdeye kullanıcının sorusunu 'question' anahtarıyla ekliyoruz.
        body: JSON.stringify({ question: input }),
      });

      // Yanıtın JSON formatında olduğundan emin oluyoruz.
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // 4. BOT'UN CEVABINI EKRANA EKLEME
      const botMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      // Bir hata oluşursa, kullanıcıya bir hata mesajı gösteriyoruz.
      console.error("Hata:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Üzgünüm, bir sorun oluştu. Lütfen tekrar deneyin.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false); // Yüklenme durumunu bitiriyoruz.
    }
  };

  return (
    <div className="chat-page-container">
      <header className="app-header">
        <h1>ZeniTalk - Psikoloji Destek Chatbot'u</h1>
      </header>

      <div className="chat-container">
        {/* 5. MESAJLARI EKRANA RENDER ETME */}
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

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
  );
}

export default ChatPage;
