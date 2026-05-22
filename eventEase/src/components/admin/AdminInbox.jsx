import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "@/lib/api";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Calendar, 
  MessageSquare,
  Search,
  Trash2,
  MailOpen,
  Clock,
  AlertCircle,
  Activity,
  Zap,
  Send,
  Loader2,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/AdminInbox.css";

export const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/contactus");
      const data = res.data.data || [];
      setMessages(data);
      setFilteredMessages(data);
      if (data.length > 0) setSelectedMessage(data[0]);
      setError("");
    } catch (err) {
      console.error(err);
      setError("GRID LINK FAILURE: UNABLE TO ACCESS COMMUNICATIONS CORE.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole !== "All") {
      filtered = filtered.filter((msg) => msg.senderRole?.toLowerCase() === filterRole.toLowerCase());
    }
    setFilteredMessages(filtered);
  }, [searchTerm, filterRole, messages]);

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return "admin";
      case "organizer": return "organizer";
      default: return "user";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Initializing Signal Stream</p>
      </div>
    );
  }

  return (
    <div className="admin-inbox-container">
      <div className="admin-inbox-content">
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inbox-header"
        >
          <div className="inbox-title-box">
            <p className="inbox-subtitle">Strategic Communication Hub</p>
            <h1>
              SECURE<br />
              <span>INBOX</span>
            </h1>
          </div>

          <div className="signal-stats-box">
            <div className="signal-count-item">
              <p>Active Signals</p>
              <p>{messages.length}</p>
            </div>
            <div className="signal-count-item">
              <p>Network Load</p>
              <p>Optimal</p>
            </div>
            <Zap className="signal-zap-icon" />
          </div>
        </motion.div>

        {messages.length === 0 ? (
          <div className="empty-inbox-premium">
            <MessageSquare />
            <p>No communication packets detected in sector.</p>
          </div>
        ) : (
          <div className="inbox-main-layout">
            {/* MESSAGE STREAM */}
            <div className="message-stream-panel">
               <div className="catalog-controls mb-8">
                  <div className="search-input-wrapper">
                    <Search className="search-icon-catalog" />
                    <input
                      type="text"
                      placeholder="SCAN SIGNALS..."
                      className="search-input-catalog"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
               </div>

              <AnimatePresence>
                {filteredMessages.map((msg, index) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedMessage(msg)}
                    className={cn(
                      "stream-card-premium",
                      selectedMessage?._id === msg._id && "active"
                    )}
                  >
                    <div className="stream-card-header">
                      <div className="user-identity-box">
                        <div className="avatar-premium">
                          {msg.name?.charAt(0) || "U"}
                        </div>
                        <div className="user-meta-info">
                          <p>{msg.name || "Nexus Identity"}</p>
                          <p>{msg.email || "Encrypted Endpoint"}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "role-badge-premium",
                        getRoleBadgeStyle(msg.senderRole)
                      )}>
                        {msg.senderRole || "ENTITY"}
                      </div>
                    </div>

                    <p className="message-preview-text">{msg.message}</p>

                    <div className="stream-card-footer">
                      <div className="timestamp-signal">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-800" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* DETAIL PANEL */}
            {selectedMessage && (
              <motion.div 
                key={selectedMessage._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="message-detail-panel"
              >
                <div className="detail-header-premium">
                  <div className="user-identity-box">
                    <div className="avatar-premium">
                      {selectedMessage.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">
                        {selectedMessage.name}
                      </h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Node: {selectedMessage._id.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-gray-500 hover:text-[#E11D48] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="detail-scroll-area">
                   <div className="message-bubble-premium received">
                      {selectedMessage.message}
                   </div>
                   <div className="message-bubble-premium sent">
                      ACKNOWLEDGED. PROTOCOL ID: {Math.random().toString(36).slice(-8).toUpperCase()} - STANDBY FOR DISPATCH.
                   </div>
                </div>

                <div className="detail-footer-premium">
                  <div className="input-wrapper-premium">
                    <input
                      type="text"
                      placeholder="Input Response Protocol..."
                      className="input-premium-inbox"
                      readOnly
                      value="DIRECT TRANSMISSION VIA MAIL CLIENT AUTHORIZED."
                    />
                    <button 
                      className="send-btn-premium"
                      onClick={() => window.open(`mailto:${selectedMessage.email}`, "_blank")}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
