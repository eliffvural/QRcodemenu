import axios from 'axios'; // <--- BU SATIRI EKLE
import { MessageSquare, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './AIChatWidget.css';

const AIChatWidget = ({ restaurantId, menuItems, onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! 👋 Ben dijital garsonunuz. Ne yemek istersiniz? Size yardımcı olabilirim.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Mesaj gelince en alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true); // "Yazıyor..." animasyonunu başlat

    try {
      // 1. Menüyü sadeleştir (Gereksiz veriyi atıp token tasarrufu yapalım)
      const simplifiedMenu = menuItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        description: item.description
      }));

      // 2. BACKEND'E İSTEK AT (Gerçek Gemini Bağlantısı)
      // '/api/ai/chat' senin backend route'un olmalı
      const res = await axios.post('http://localhost:5000/api/ai/chat', { 
        message: userMessage,
        menuContext: simplifiedMenu, // Menüyü AI'a gönderiyoruz ki bilsin
        restaurantId 
      });

      const aiResponseRaw = res.data.reply;

      // 3. AKSİYON KONTROLÜ (Aynı mantık devam ediyor)
      // Gemini'den gelen {ADD:ID} etiketini yakala
      const actionRegex = /\{ADD:([a-zA-Z0-9]+)\}/;
      const match = aiResponseRaw.match(actionRegex);
      
      let displayMessage = aiResponseRaw;

      if (match) {
        const productId = match[1];
        displayMessage = aiResponseRaw.replace(match[0], ''); // Kodu gizle
        
        // Ürünü bul ve sepete at
        const productToAdd = menuItems.find(p => p._id === productId);
        if (productToAdd) {
          onAddToCart(productToAdd);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: displayMessage }]);

    } catch (error) {
      console.error("Chat Hatası:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Üzgünüm, şu an bağlantımda bir sorun var. 😔" }]);
    } finally {
      setIsTyping(false); // Animasyonu durdur
    }
  };

  return (
    <>
      {/* Yüzen Sohbet Butonu */}
      <button 
        className={`ai-chat-fab ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} color="white" />
        <span className="ai-fab-text">Asistana Sor</span>
      </button>

      {/* Sohbet Penceresi */}
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
          <div className="ai-avatar">🤖</div>
          <div className="ai-title">
            <h3>Marithen Asistan</h3>
            <span>Online</span>
          </div>
          <button className="ai-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="ai-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message assistant">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-area">
          <input 
            type="text" 
            placeholder="Örn: Acıktım, ne önerirsin?" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;