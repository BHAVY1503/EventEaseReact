import React, { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  Trash2,
  MailOpen,
  Clock,
  AlertCircle,
  Activity,
  Globe,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Send,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/contactus", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.data || []);
        setFilteredMessages(res.data.data || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("GRID LINK FAILURE: UNABLE TO ACCESS COMMUNICATIONS CORE.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Filter messages based on search and role
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
      filtered = filtered.filter((msg) => msg.senderRole === filterRole.toLowerCase());
    }

    setFilteredMessages(filtered);
  }, [searchTerm, filterRole, messages]);

  const getRoleBadgeStyle = (role) => {
    const styles = {
      'admin': 'bg-[#E11D48]/20 text-[#E11D48] border-[#E11D48]/30',
      'organizer': 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      'user': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    };
    return styles[role?.toLowerCase()] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `TODAY AT ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toUpperCase()}`;
    } else if (diffDays === 1) {
      return "YESTERDAY";
    } else if (diffDays < 7) {
      return `${diffDays} DAYS AGO`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Decrypting Communication Buffers</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 bg-[#0A0A0A] border border-white/5 rounded-[3rem] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#E11D48] mx-auto" />
        <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.4em]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E11D48]/10 border border-[#E11D48]/20 rounded-full">
          <Mail className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Encrypted Signal Link Established</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              INBOX<br />
              <span className="text-[#E11D48]">COMMAND</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Platform-wide communications and intercept oversight.
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Signal Count</p>
              <p className="text-3xl font-black text-white">{messages.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Grid Match</p>
              <p className="text-3xl font-black text-[#E11D48]">{filteredMessages.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FILTER CONSOLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-white/5 bg-[#0A0A0A] rounded-[3rem] p-10 shadow-2xl backdrop-blur-3xl"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
            <Input
              placeholder="SCAN SIGNALS BY NAME, EMAIL, OR PAYLOAD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-16 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 placeholder:text-gray-800 transition-all"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {["All", "Organizer", "User", "Guest"].map((role) => (
              <Button
                key={role}
                onClick={() => setFilterRole(role)}
                className={cn(
                  "h-14 px-8 font-black uppercase tracking-[0.3em] text-[9px] rounded-2xl transition-all border whitespace-nowrap",
                  filterRole === role 
                    ? "bg-[#E11D48] border-[#E11D48] text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]" 
                    : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white"
                )}
              >
                {role}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* MESSAGE STREAM */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredMessages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-4"
            >
              <MailOpen className="w-12 h-12 text-gray-700 mx-auto" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Zero Signals Detected in Current Sector.</p>
            </motion.div>
          ) : (
            filteredMessages.map((msg, index) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="relative p-10 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] hover:border-[#E11D48]/30 transition-all duration-500 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
                     <MessageSquare className="w-40 h-40 text-white" />
                  </div>

                  <div className="relative z-10 space-y-8">
                    {/* META HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#991B1B] flex items-center justify-center text-white font-black text-xl shadow-xl">
                          {msg.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#E11D48] transition-colors">{msg.name}</h4>
                          <Badge variant="outline" className={cn("px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest border", getRoleBadgeStyle(msg.senderRole))}>
                            {msg.senderRole || "Guest"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(msg.createdAt)}
                      </div>
                    </div>

                    {/* SIGNAL PAYLOAD INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: Mail, label: "Signal Origin", value: msg.email },
                        { icon: Phone, label: "Comm Line", value: msg.phoneNo || "NULL" },
                        { icon: Building2, label: "Associated Corp", value: msg.company || "NULL" },
                        { icon: Calendar, label: "Deployment Type", value: msg.eventType || "NULL" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                           <div className="flex items-center gap-2 mb-1">
                              <item.icon className="w-3 h-3 text-[#E11D48]" />
                              <p className="text-[7px] font-black uppercase tracking-widest text-gray-600">{item.label}</p>
                           </div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* SOURCE INFO */}
                    {msg.question && (
                      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                         <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest text-gray-600">Referral Intelligence</p>
                         </div>
                         <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">{msg.question}</p>
                      </div>
                    )}

                    {/* MESSAGE PAYLOAD */}
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Signal Message</p>
                      </div>
                      <p className="text-sm font-bold text-gray-300 uppercase tracking-widest leading-loose">
                        {msg.message}
                      </p>
                    </div>

                    {/* PROTOCOLS */}
                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        onClick={() => window.open(`mailto:${msg.email}`, "_blank")}
                        className="h-14 px-8 bg-[#E11D48] text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-red-700 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all"
                      >
                        <Send className="w-4 h-4 mr-4" /> TRANSMIT REPLY
                      </Button>
                      <Button
                        variant="outline"
                        className="h-14 px-8 border-white/10 bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all"
                      >
                        <MailOpen className="w-4 h-4 mr-4" /> MARK PROCESSED
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER ACTION */}
      <div className="text-center pt-8">
        <Link to="/admin">
          <Button variant="outline" className="h-16 px-10 border-white/10 bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all group">
            RETURN TO COMMAND CENTER <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
