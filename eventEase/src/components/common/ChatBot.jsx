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

  // Parse step-by-step responses and format with proper spacing
  const parseResponseParagraphs = (text) => {
    if (!text) return [];
    
    // Replace literal \n strings with actual newlines
    let cleaned = String(text).replace(/\\n/g, '\n');
    
    // Split by double newlines to get major sections (steps, suggestions, etc)
    const sections = cleaned.split(/\n\s*\n+/).filter(s => s.trim());
    
    return sections.map(section => {
      const trimmed = section.trim();
      // If section starts with a number and dot (numbered step), keep structure
      if (/^\d+\./.test(trimmed)) {
        return trimmed; // Keep as-is for step formatting
      }
      // For bullet points and regular text, preserve line breaks within section
      return trimmed;
    });
  };

  // Break long lines into readable width
  const wrapLongLine = (line, max = 100) => {
    if (!line || line.length <= max) return [line];
    
    const words = line.split(/\s+/);
    const result = [];
    let current = '';
    
    for (const word of words) {
      if ((current + ' ' + word).trim().length > max) {
        if (current) result.push(current.trim());
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) result.push(current.trim());
    
    return result.filter(Boolean);
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
      // Use shared axios instance to honor baseURL and auth headers
      const res = await api.post('/api/ai/chat', {
        message: currentInput,
        conversationHistory: [...messages, userMessage].map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
      });

      const data = res.data;

      // Prefer backend 'text' field (contains step-by-step format)
      // Then fall back to other common response shapes
      const extractAIText = (payload) => {
        if (!payload) return null;
        if (typeof payload === 'string') return payload;
        // Prefer backend text/html fields
        if (payload.text && typeof payload.text === 'string') return payload.text;
        if (payload.html && typeof payload.html === 'string') {
          // Basic HTML strip: convert <br> to newline, remove tags
          return String(payload.html)
            .replace(/<\s*br\s*\/?>/gi, '\n')
            .replace(/<\s*\/p\s*>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .trim();
        }
        if (payload.response && typeof payload.response === 'string') return payload.response;
        if (payload.message && typeof payload.message === 'string') return payload.message;
        if (payload.raw && typeof payload.raw === 'string') return payload.raw;
        // common LLM shapes
        if (Array.isArray(payload.choices) && payload.choices[0]) {
          const ch = payload.choices[0];
          if (ch.text) return ch.text;
          if (ch.message && (ch.message.content || ch.message)) {
            if (Array.isArray(ch.message.content)) return ch.message.content.map(c=>c.text||c).join('\n');
            if (typeof ch.message.content === 'string') return ch.message.content;
            if (ch.message.content?.[0]?.text) return ch.message.content[0].text;
          }
        }
        // Google Generative AI possible shapes
        if (payload.candidates && payload.candidates[0] && payload.candidates[0].content) {
          if (Array.isArray(payload.candidates[0].content)) return payload.candidates[0].content.map(c=>c.text||c).join('');
          return String(payload.candidates[0].content || '');
        }
        if (payload.output && Array.isArray(payload.output) && payload.output[0]) {
          return payload.output[0].content?.map(c=>c.text||c).join('') || payload.output[0].text;
        }
        // fallback: try stringify and show
        try { return JSON.stringify(payload); } catch (e) { return String(payload); }
      };

      const botText = extractAIText(data) || 'Sorry, I couldn\'t process that.';

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
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce"
          aria-label="Open chat"
        >
          <MessageCircle size={28} className="relative z-10" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] h-[600px] flex flex-col overflow-hidden border border-gray-200  animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MessageCircle size={22} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">EventEase Bot</h3>
                <p className="text-xs text-white/80 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 '
                  }`}
                >
                  {msg.type === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-3">
                      {parseResponseParagraphs(msg.text).map((paragraph, i) => (
                        <div key={i}>
                          {wrapLongLine(paragraph).map((line, j) => (
                            <p key={j} className="text-sm leading-relaxed">
                              {line}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className={`text-xs mt-2 block ${
                    msg.type === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gray-400  rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gray-400  rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400  rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white  border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 border border-gray-300  rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50  text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={isTyping || !inputText.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg disabled:hover:scale-100"
                aria-label="Send message"
              >
                {isTyping ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Send size={22} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by EventEase AI
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;



// import React, { useState, useRef, useEffect } from 'react';
// import { MessageCircle, X, Send } from 'lucide-react';

// const EventEaseChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       type: 'bot',
//       text: 'Hi! I\'m your EventEase assistant. How can I help you today?',
//       timestamp: new Date()
//     }
//   ]);
//   const [inputText, setInputText] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = async () => {
//     if (!inputText.trim()) return;

//     const userMessage = {
//       type: 'user',
//       text: inputText,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     const currentInput = inputText;
//     setInputText('');
//     setIsTyping(true);

//     try {
//       // Call your API
//       const response = await fetch('http://localhost:3100/api/ai/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: currentInput,
//           conversationHistory: messages.map(msg => ({
//             role: msg.type === 'user' ? 'user' : 'assistant',
//             content: msg.text
//           }))
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
      
//       setMessages(prev => [...prev, {
//         type: 'bot',
//         text: data.response || data.message || 'Sorry, I couldn\'t process that.',
//         timestamp: new Date()
//       }]);
//     } catch (error) {
//       console.error('Error calling chatbot API:', error);
//       setMessages(prev => [...prev, {
//         type: 'bot',
//         text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
//         timestamp: new Date()
//       }]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50">
//       {/* Chat Button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
//         >
//           <MessageCircle size={24} />
//         </button>
//       )}

//       {/* Chat Window */}
//       {isOpen && (
//         <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col overflow-hidden">
//           {/* Header */}
//           <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <MessageCircle size={20} />
//               <div>
//                 <h3 className="font-semibold">EventEase Assistant</h3>
//                 <p className="text-xs opacity-90">Online</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="hover:bg-blue-700 rounded-full p-1 transition-colors"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-lg p-3 ${
//                     msg.type === 'user'
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-white text-gray-800 shadow'
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
//                   <span className="text-xs opacity-70 mt-1 block">
//                     {msg.timestamp.toLocaleTimeString([], { 
//                       hour: '2-digit', 
//                       minute: '2-digit' 
//                     })}
//                   </span>
//                 </div>
//               </div>
//             ))}
            
//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="bg-white rounded-lg p-3 shadow">
//                   <div className="flex gap-1">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div className="p-4 bg-white border-t">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type your message..."
//                 className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                 disabled={isTyping}
//               />
//               <button
//                 onClick={handleSendMessage}
//                 disabled={isTyping || !inputText.trim()}
//                 className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Send size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EventEaseChatbot;