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
  Ticket,
  Search,
  Download,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
  Package,
  Activity,
  CreditCard,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/AllEventBookings.css";

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
          headers: { Authorization: `Bearer ${token}` }
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

  const groupedByEvent = tickets.reduce((acc, ticket) => {
    const event = ticket.eventId;
    if (!event) return acc;
    if (!acc[event._id]) acc[event._id] = { event, tickets: [] };
    acc[event._id].tickets.push(ticket);
    return acc;
  }, {});

  const filteredEvents = Object.values(groupedByEvent).filter(({ event, tickets }) => {
    if (!event) return false;
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tickets.some(t => t.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterEventType === "all" || event.eventType === filterEventType;
    return matchesSearch && matchesType;
  });

  const totalRevenue = tickets.reduce((sum, t) => sum + ((t.eventId?.ticketRate || 0) * t.quantity), 0);

  const exportToCSV = () => {
    const headers = ["Event", "Type", "User", "Email", "Qty", "Total"];
    const rows = tickets.map(t => [
      t.eventId?.eventName, t.eventId?.eventType, t.userId?.fullName, t.userId?.email, t.quantity, (t.eventId?.ticketRate || 0) * t.quantity
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings_analytics.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Loader2 className="w-10 h-10 animate-spin text-[#E11D48]" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Analyzing Transaction Clusters</p>
      </div>
    );
  }

  return (
    <div className="bookings-command-container">
      <div className="bookings-command-content">
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bookings-header-premium">
          <div className="command-title-box">
            <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.3em] mb-4">Financial Oversight Terminal</p>
            <h1>GLOBAL<br /><span>BOOKINGS</span></h1>
          </div>
          <div className="command-header-actions">
            <Button onClick={exportToCSV} className="btn-header-admin bg-white/5 border border-white/10 text-gray-400 hover:bg-white hover:text-black">
              <Download className="w-4 h-4 mr-2" /> EXPORT ANALYTICS
            </Button>
            <Link to="/admin">
              <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10 text-gray-500 hover:text-white"><ArrowLeft /></Button>
            </Link>
          </div>
        </motion.div>

        {/* STATS GRID */}
        <div className="stats-grid-admin">
          {[
            { label: "Total Transactions", value: tickets.length, icon: Ticket, color: "text-[#E11D48]" },
            { label: "Active Deployments", value: Object.keys(groupedByEvent).length, icon: Calendar, color: "text-blue-500" },
            { label: "Gross Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card-admin">
              <div className="stat-bg-icon"><stat.icon className="w-20 h-20" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">{stat.label}</p>
              <p className={cn("text-4xl font-black", stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* FILTER CONSOLE */}
        <div className="filter-console-admin">
          <div className="search-input-wrapper">
            <Search className="search-icon-admin" />
            <Input placeholder="IDENTIFY BY EVENT OR ENTITY..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-premium-admin" />
          </div>
          <Select value={filterEventType} onValueChange={setFilterEventType}>
            <SelectTrigger className="select-trigger-admin md:w-80"><SelectValue placeholder="SEGMENT BY TYPE" /></SelectTrigger>
            <SelectContent className="bg-[#080808] border-white/10">
              <SelectItem value="all">ALL SEGMENTS</SelectItem>
              {["Conference", "Exhibition", "Gala Dinner", "Incentive", "Music concert", "Meeting", "ZoomMeeting", "Other"].map(t => (
                <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* EVENT CLUSTERS */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center">
                <Package className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Zero Results Detected.</p>
              </motion.div>
            ) : (
              filteredEvents.map(({ event, tickets }, index) => (
                <motion.div key={event._id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cn("event-cluster-card", expandedEvent === event._id && "expanded")}>
                  <div className="cluster-header-admin" onClick={() => setExpandedEvent(expandedEvent === event._id ? null : event._id)}>
                    <div className="cluster-brand-box">
                      <div className="cluster-image-thumb"><img src={event.eventImgUrl} alt="" /></div>
                      <div className="cluster-info-box">
                        <div className="flex items-center gap-3 mb-2">
                          <h3>{event.eventName}</h3>
                          <Badge className="bg-[#E11D48]/10 text-[#E11D48] text-[8px] font-black border-0">{event.eventType}</Badge>
                        </div>
                        <div className="cluster-meta-row">
                          <div className="meta-item-admin"><Calendar /><span>{new Date(event.startDate).toLocaleDateString()}</span></div>
                          <div className="meta-item-admin"><Ticket /><span>{tickets.length} Allocations</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="cluster-stats-box">
                      <div className="cluster-stat-node"><p>Cluster Yield</p><p>₹{(tickets.reduce((sum, t) => sum + (event.ticketRate * t.quantity), 0)).toLocaleString()}</p></div>
                      <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform", expandedEvent === event._id && "rotate-180")}><ChevronDown /></div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedEvent === event._id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="node-manifest-area">
                        <div className="node-grid-admin">
                          {tickets.map(t => (
                            <div key={t._id} className="user-node-card">
                              <div className="flex items-center gap-4">
                                <div className="node-avatar">{t.userId?.fullName?.charAt(0)}</div>
                                <div className="node-user-info"><h5>{t.userId?.fullName}</h5><p>{t.userId?.email}</p></div>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-black text-gray-700 uppercase">Qty</p>
                                <p className="text-sm font-black">{t.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
