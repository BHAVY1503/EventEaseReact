import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hi! I\'m your EventEase assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: currentInput,
        conversationHistory: [...messages, userMessage].map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
      });

      const data = res.data;
      const botText = data.response || data.text || data.message || 'Sorry, I couldn\'t process that.';

      setMessages(prev => [...prev, {
        type: 'bot',
        text: botText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-[#E11D48] text-white rounded-full p-4 shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={28} className="relative z-10" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#050505] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[350px] h-[550px] max-h-[calc(100vh-120px)] flex flex-col overflow-hidden border border-white/10 animate-slideUp">
          {/* Header */}
          <div className="bg-black text-white p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#E11D48] rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
               </div>
               <div>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em]">EventEase Intelligence</h3>
                  <p className="text-[8px] font-bold text-[#E11D48] uppercase tracking-widest flex items-center mt-1">
                    <span className="w-1.5 h-1.5 bg-[#E11D48] rounded-full mr-2 animate-pulse"></span>
                    Active Protocol
                  </p>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
               <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] p-4 text-[10px] font-bold uppercase tracking-widest leading-relaxed ${
                  msg.type === 'user' 
                    ? 'bg-[#E11D48] text-white rounded-2xl rounded-tr-none shadow-[0_0_20px_rgba(225,29,72,0.2)]' 
                    : 'bg-white/5 text-gray-300 border border-white/5 rounded-2xl rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                    <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-black border-t border-white/5">
             <div className="flex gap-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="TRANSMIT MESSAGE..."
                  disabled={isTyping}
                  className="flex-1 bg-white/5 border-none rounded-full px-6 py-4 text-[10px] font-black tracking-widest text-white focus:ring-1 focus:ring-[#E11D48] outline-none placeholder:text-gray-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputText.trim()}
                  className="bg-[#E11D48] text-white rounded-full p-4 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
             </div>
             <p className="text-center text-[7px] font-black text-gray-500 uppercase tracking-[0.4em] mt-4">
                Powered by EventEase Core AI
             </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ChatBot;
