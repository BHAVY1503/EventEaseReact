import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Calendar, MapPin, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import "@/styles/components/ChatBot.css";
import "@/styles/common/Common.css";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your EventEase assistant. How can I help you today?",
      suggestions: [
        'Explore upcoming events',
        'How to book tickets',
        'Show events in Surat'
      ],
      events: [],
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
  }, [messages, isTyping]);

  const parseBotMessage = (botText) => {
    const parts = botText.split("👉 Next, you can:");
    const cleanedText = parts[0].trim();
    let suggestions = [];
    
    if (parts.length > 1) {
      const lines = parts[1].split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('-')) {
          suggestions.push(trimmed.substring(1).trim());
        } else if (trimmed.startsWith('•')) {
          suggestions.push(trimmed.substring(1).trim());
        } else if (trimmed.length > 0) {
          suggestions.push(trimmed);
        }
      });
    }
    
    return { cleanedText, suggestions };
  };

  const handleSendMessage = async (textToSend = null) => {
    const messageContent = textToSend || inputText;
    if (!messageContent.trim() || isTyping) return;

    const userMessage = {
      type: 'user',
      text: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: messageContent
      });

      const data = res.data;
      const botText = data.reply || data.response || data.text || data.message || "Sorry, I couldn't process that.";
      const events = data.events || [];

      const { cleanedText, suggestions } = parseBotMessage(botText);

      setMessages(prev => [...prev, {
        type: 'bot',
        text: cleanedText,
        suggestions: suggestions,
        events: events,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        suggestions: [],
        events: [],
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
        <div className="bg-card text-foreground rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[350px] h-[550px] max-h-[calc(100vh-120px)] flex flex-col overflow-hidden border border-black/5 dark:border-white/10 animate-slideUp">
          {/* Header */}
          <div className="bg-card text-foreground p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#E11D48] rounded-full flex items-center justify-center text-white">
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
            <button onClick={() => setIsOpen(false)} className="text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer">
               <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-card scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-3">
                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[85%] p-4 text-xs font-bold leading-relaxed whitespace-pre-line ${
                    msg.type === 'user' 
                      ? 'bg-[#E11D48] text-white rounded-2xl rounded-tr-none shadow-[0_0_20px_rgba(225,29,72,0.2)] uppercase tracking-widest' 
                      : 'bg-slate-900/5 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-black/5 dark:border-white/5 rounded-2xl rounded-tl-none tracking-normal normal-case'
                  }`}>
                    {msg.text}
                  </div>
                </div>

                {/* Suggestions rendering */}
                {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-start pl-2 animate-fadeIn">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="bg-[#E11D48]/10 hover:bg-[#E11D48] text-[#E11D48] hover:text-white border border-[#E11D48]/20 hover:border-transparent rounded-full px-3 py-1.5 text-[8px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Event Cards rendering */}
                {msg.type === 'bot' && msg.events && msg.events.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar pl-2 animate-fadeIn">
                    {msg.events.map((event) => (
                      <div 
                        key={event._id}
                        onClick={() => {
                          if (event.eventCategory === "Indoor") {
                            navigate(`/select-seats/${event._id}`);
                          } else {
                            navigate(`/user/viewevents`);
                          }
                          setIsOpen(false);
                        }}
                        className="flex-shrink-0 w-[190px] bg-slate-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl overflow-hidden hover:border-[#E11D48] transition-all duration-300 cursor-pointer shadow-sm"
                      >
                        <img 
                          src={event.eventImgUrl || "/placeholder-event.jpg"} 
                          alt={event.eventName} 
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-3 space-y-1">
                          <p className="text-[7px] text-[#E11D48] font-black uppercase tracking-widest">{event.eventType}</p>
                          <h4 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{event.eventName}</h4>
                          <div className="flex justify-between items-center text-[8px] text-slate-500 dark:text-gray-400 font-bold uppercase pt-1">
                            <span className="flex items-center gap-0.5">
                              <Ticket size={8} className="text-[#E11D48]" />
                              ₹{event.ticketRate?.toLocaleString() || "FREE"}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin size={8} className="text-[#E11D48]" />
                              {event.cityId?.name || "Global"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-slate-900/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-bounce dynamic-delay" style={{ '--delay': '0.15s' }}></div>
                    <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-bounce dynamic-delay" style={{ '--delay': '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-card border-t border-black/5 dark:border-white/5">
             <div className="flex gap-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="TRANSMIT MESSAGE..."
                  disabled={isTyping}
                  className="flex-1 bg-slate-900/5 dark:bg-white/5 border-none rounded-full px-6 py-4 text-[10px] font-black tracking-widest text-slate-900 dark:text-white focus:ring-1 focus:ring-[#E11D48] outline-none placeholder:text-slate-500 dark:placeholder:text-gray-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !inputText.trim()}
                  className="bg-[#E11D48] text-white rounded-full p-4 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 border-none cursor-pointer"
                >
                  {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
             </div>
             <p className="text-center text-[7px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-[0.4em] mt-4">
                Powered by EventEase Core AI
             </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatBot;
