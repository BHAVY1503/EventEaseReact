import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Mail,
  User,
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Package,
  Activity,
  Globe,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const AllEventBookings = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEventType, setFilterEventType] = useState("all");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("/tickets/alltickets", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTickets(res.data.data || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTickets();
  }, [token]);

  // Group tickets by event
  const groupedByEvent = tickets.reduce((acc, ticket) => {
    const event = ticket.eventId;
    if (!event) return acc;
    const eventId = event._id;
    if (!acc[eventId]) acc[eventId] = { event, tickets: [] };
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {});

  // Filter grouped events
  const filteredEvents = Object.values(groupedByEvent).filter(({ event, tickets }) => {
    if (!event) return false;
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tickets.some(t => t.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterEventType === "all" || event.eventType === filterEventType;
    return matchesSearch && matchesType;
  });

  // Calculate statistics
  const totalBookings = tickets.length;
  const totalRevenue = tickets.reduce((sum, ticket) => {
    const price = ticket.eventId?.ticketRate || 0;
    return sum + (price * ticket.quantity);
  }, 0);
  const uniqueEvents = Object.keys(groupedByEvent).length;

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const exportToCSV = () => {
    const headers = ["Event Name", "Event Type", "Booked By", "Email", "Quantity", "City", "State"];
    const rows = tickets.map(ticket => [
      ticket.eventId?.eventName || "N/A",
      ticket.eventId?.eventType || "N/A",
      ticket.userId?.fullName || "N/A",
      ticket.userId?.email || "N/A",
      ticket.quantity,
      ticket.cityId?.name || "N/A",
      ticket.stateId?.Name || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Analyzing Transaction Clusters</p>
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
          <CreditCard className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Financial Oversight Terminal</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              GLOBAL<br />
              <span className="text-[#E11D48]">BOOKINGS</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Platform-wide transaction analysis and user deployments.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={exportToCSV}
              className="h-14 px-8 border-white/10 bg-white/5 text-gray-500 font-black uppercase tracking-[0.3em] text-[9px] rounded-2xl hover:bg-white hover:text-black transition-all"
            >
              <Download className="w-4 h-4 mr-3" /> EXPORT ANALYTICS
            </Button>
            <Link to="/admin">
              <Button variant="outline" className="h-14 w-14 p-0 border-white/10 bg-[#0A0A0A] text-gray-500 rounded-2xl hover:bg-white hover:text-black transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Transactions", value: totalBookings, icon: Ticket, color: "text-[#E11D48]" },
          { label: "Active Deployments", value: uniqueEvents, icon: Calendar, color: "text-blue-500" },
          { label: "Gross Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <stat.icon className="w-20 h-20 text-white" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">{stat.label}</p>
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-4xl font-black text-white relative z-10">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* FILTER CONSOLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-white/5 bg-[#0A0A0A] rounded-[3rem] p-10 shadow-2xl backdrop-blur-3xl"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
            <Input
              placeholder="IDENTIFY BY EVENT OR ENTITY NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-16 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 placeholder:text-gray-500 transition-all"
            />
          </div>
          <Select value={filterEventType} onValueChange={setFilterEventType}>
            <SelectTrigger className="h-16 w-full md:w-80 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 transition-all">
              <SelectValue placeholder="SEGMENT BY TYPE" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#E11D48] transition-colors">ALL SEGMENTS</SelectItem>
              {["Conference", "Exhibition", "Gala Dinner", "Incentive", "Music concert", "Meeting", "ZoomMeeting", "Other"].map(type => (
                <SelectItem key={type} value={type} className="text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#E11D48] transition-colors">{type.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* EVENT CLUSTERS */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-4"
            >
              <Package className="w-12 h-12 text-gray-700 mx-auto" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Zero Results Detected in Current Grid.</p>
            </motion.div>
          ) : (
            filteredEvents.map(({ event, tickets }, index) => {
              if (!event) return null;
              const isExpanded = expandedEvent === event._id;
              const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);
              const eventRevenue = tickets.reduce((sum, t) => {
                const price = event.ticketRate || 0;
                return sum + (price * t.quantity);
              }, 0);

              return (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className={cn(
                    "relative border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl",
                    isExpanded ? "bg-[#050505] ring-2 ring-[#E11D48]/30" : "bg-[#0A0A0A] hover:border-[#E11D48]/30"
                  )}>
                    {/* CLUSTER HEADER */}
                    <div 
                      className="p-10 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
                      onClick={() => toggleExpand(event._id)}
                    >
                      <div className="flex items-center gap-8">
                         <div className="w-20 h-20 rounded-[2rem] overflow-hidden flex-shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all border border-white/5">
                            <img src={event.eventImgUrl} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-4">
                               <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-[#E11D48] transition-colors">{event.eventName}</h3>
                               <Badge className="bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]/20 font-black text-[8px] uppercase tracking-widest px-4 py-1.5 rounded-lg">{event.eventType}</Badge>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-3">
                                  <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                     {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                  </span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <Ticket className="w-3.5 h-3.5 text-gray-600" />
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{totalTickets} Nodes Allocated</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-12">
                         <div className="text-right">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 mb-1">Cluster Yield</p>
                            <p className="text-2xl font-black text-white">₹{eventRevenue.toLocaleString()}</p>
                         </div>
                         <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 transition-transform duration-500", isExpanded && "rotate-180 bg-[#E11D48] border-[#E11D48]")}>
                            <ChevronDown className="w-5 h-5 text-white" />
                         </div>
                      </div>
                    </div>

                    {/* EXPANDED DETAILS */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-black/40"
                        >
                           <div className="p-10 space-y-6">
                              <div className="flex items-center justify-between mb-4">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48]">Individual Node Manifest</h4>
                                 <Badge variant="outline" className="border-white/10 text-gray-500 font-black text-[8px] uppercase tracking-widest">{tickets.length} ACTIVE ENTITIES</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {tickets.map((ticket) => (
                                    <div key={ticket._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/card">
                                       <div className="flex items-center justify-between gap-6">
                                          <div className="flex items-center gap-4 flex-1">
                                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#991B1B] flex items-center justify-center text-white font-black text-sm uppercase">
                                                {ticket.userId?.fullName?.charAt(0) || 'U'}
                                             </div>
                                             <div className="space-y-1 overflow-hidden">
                                                <p className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover/card:text-[#E11D48] transition-colors">{ticket.userId?.fullName || "NULL"}</p>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate">{ticket.userId?.email || "NULL"}</p>
                                             </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-8">
                                             <div className="text-right whitespace-nowrap">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-700">Allocation</p>
                                                <p className="text-[11px] font-black text-white">{ticket.quantity} UNIT{ticket.quantity > 1 ? 'S' : ''}</p>
                                             </div>
                                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 opacity-0 group-hover/card:opacity-100 transition-all">
                                                <ArrowLeft className="w-4 h-4 text-gray-500 rotate-180" />
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
