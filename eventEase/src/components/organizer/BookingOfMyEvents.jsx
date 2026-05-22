import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Search,
  Calendar,
  IndianRupee,
  Activity,
  Zap,
  LayoutGrid,
  History,
  Globe,
  Ticket,
  Download,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import '../../styles/components/SalesReports.css';

export const BookingsOfMyEvents = () => {
  const [tickets, setTickets] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [dataView, setDataView] = useState('combined');
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, paymentsRes] = await Promise.all([
          api.get("/tickets/organizer/self").catch(err => ({ data: { data: [] } })),
          api.get("/payment/payment_history").catch(err => ({ data: { data: [] } }))
        ]);

        setTickets(ticketsRes.data.data || []);
        setPaymentHistory(paymentsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const getCombinedData = () => {
    const eventMap = new Map();
    tickets.forEach(ticket => {
      const eventId = ticket.eventId?._id;
      if (!eventId) return;
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, { event: ticket.eventId, tickets: [], payments: [] });
      }
      eventMap.get(eventId).tickets.push(ticket);
    });
    paymentHistory.forEach(payment => {
      const eventId = payment.eventId?._id;
      if (!eventId) return;
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, { event: payment.eventId, tickets: [], payments: [] });
      }
      eventMap.get(eventId).payments.push(payment);
    });
    return Array.from(eventMap.values());
  };

  const combinedData = getCombinedData();
  const stats = {
    totalBookings: tickets.length + paymentHistory.filter(p => p.status === 'captured').length,
    totalRevenue: [
      ...tickets.map(t => t.ticketRate * t.quantity),
      ...paymentHistory.filter(p => p.status === 'captured').map(p => p.amount / 100)
    ].reduce((sum, val) => sum + val, 0),
    totalEvents: combinedData.length,
    totalAttendees: tickets.reduce((sum, t) => sum + t.quantity, 0) + 
                    paymentHistory.filter(p => p.status === 'captured').reduce((sum, p) => sum + (p.quantity || 1), 0),
  };

  const filteredData = combinedData.filter(({ event }) => {
    if (!event) return false;
    const matchesSearch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === 'all' || event._id === filterEvent;
    if (activeTab === 'upcoming') return new Date(event.endDate) >= new Date() && matchesSearch && matchesEvent;
    if (activeTab === 'past') return new Date(event.endDate) < new Date() && matchesSearch && matchesEvent;
    return matchesSearch && matchesEvent;
  });

  const getPaymentStatusBadge = (status) => {
    const config = {
      captured: { color: 'bg-green-500/20 text-green-500', text: 'SUCCESS' },
      failed: { color: 'bg-red-500/20 text-red-500', text: 'FAILED' },
      pending: { color: 'bg-yellow-500/20 text-yellow-500', text: 'PENDING' },
      refunded: { color: 'bg-gray-500/20 text-gray-500', text: 'REFUNDED' }
    }[status] || { color: 'bg-blue-500/20 text-blue-500', text: 'PROCESSING' };

    return (
      <Badge className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none", config.color)}>
        {config.text}
      </Badge>
    );
  };

  const EventBookingCard = ({ event, tickets, payments }) => {
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.ticketRate * t.quantity), 0) + 
                         payments.filter(p => p.status === 'captured').reduce((sum, p) => sum + (p.amount / 100), 0);
    const totalAttendees = tickets.reduce((sum, t) => sum + t.quantity, 0) + 
                           payments.filter(p => p.status === 'captured').reduce((sum, p) => sum + (p.quantity || 1), 0);
    const isPastEvent = new Date(event.endDate) < new Date();

    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
        <div className="event-booking-card-elite">
          <div className="card-flex-wrapper">
            <div className="event-info-sidebar">
               <div className="space-y-4">
                  <Badge className="bg-[#E11D48]/10 text-[#E11D48] text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full border-none">
                     {isPastEvent ? "COMPLETED NODE" : "ACTIVE NODE"}
                  </Badge>
                  <h3 className="event-title-elite">{event.eventName}</h3>
                  <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                     <Calendar className="w-3.5 h-3.5 text-[#E11D48]" />
                     {new Date(event.startDate).toLocaleDateString()}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Revenue</p>
                     <p className="text-lg font-black text-white">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                     <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Attendees</p>
                     <p className="text-lg font-black text-white">{totalAttendees}</p>
                  </div>
               </div>
            </div>

            <div className="transactions-area">
               {tickets.length > 0 && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <Ticket className="w-4 h-4 text-[#E11D48]" />
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Confirmed Manifest</h4>
                    </div>
                    <div className="manifest-item-grid">
                       {tickets.map(t => (
                         <div key={t._id} className="transaction-item-card">
                            <div className="flex justify-between items-start">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-white uppercase tracking-tight">{t.userId?.fullName || t.organizerId?.name || "ANONYMOUS"}</p>
                                  <p className="text-[7px] font-bold text-gray-500 uppercase">{t.userId?.email || t.organizerId?.email}</p>
                               </div>
                               <Badge className="bg-green-500/10 text-green-500 text-[7px] font-black rounded-full border-none px-2 py-0.5">PAID</Badge>
                            </div>
                            <div className="flex justify-between items-end pt-2 border-t border-white/5">
                               <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400">
                                  <Users className="w-3 h-3" /> {t.quantity} SEATS
                                </div>
                               <p className="text-sm font-black text-[#E11D48]">₹{(t.ticketRate * t.quantity).toLocaleString()}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {payments.length > 0 && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <IndianRupee className="w-4 h-4 text-emerald-500" />
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Transaction Logs</h4>
                    </div>
                    <div className="transaction-table-wrapper no-scrollbar">
                       <table className="transaction-table">
                          <thead>
                             <tr>
                                <th className="table-header-cell">ID</th>
                                <th className="table-header-cell">Subject</th>
                                <th className="table-header-cell text-right">Amount</th>
                                <th className="table-header-cell text-right">Status</th>
                             </tr>
                          </thead>
                          <tbody>
                             {payments.map(p => (
                               <tr key={p._id} className="table-row">
                                  <td className="table-cell text-[8px] font-mono text-gray-600 uppercase">{p.orderId?.slice(-8)}</td>
                                  <td className="table-cell">
                                     <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase">{p.userId?.fullName || "ANONYMOUS"}</span>
                                        <span className="text-[7px] text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                                     </div>
                                  </td>
                                  <td className="table-cell text-right text-[10px] font-black text-white">₹{(p.amount / 100).toLocaleString()}</td>
                                  <td className="table-cell text-right">{getPaymentStatusBadge(p.status)}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="sales-report-layout">
      <div className="report-header-section">
         <div className="report-title-box">
            <div className="status-badge-elite">
               <Activity className="h-4 w-4 text-[#E11D48]" />
               <span className="status-badge-label">Operational Intelligence v4.0</span>
            </div>
            <h1 className="report-main-title">SALES <span className="report-title-accent">REPORT</span></h1>
         </div>
         <Button variant="outline" className="h-12 px-6 bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/10 border-none">
            <Download className="w-3.5 h-3.5 mr-2" /> EXPORT DATA
         </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Activity className="w-10 h-10 text-[#E11D48] animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-16">
          <div className="intelligence-stats-grid">
            {[
              { label: 'GROSS REVENUE', val: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-[#E11D48]' },
              { label: 'TOTAL BOOKINGS', val: stats.totalBookings, icon: Ticket, color: 'text-blue-500' },
              { label: 'ATTENDEE COUNT', val: stats.totalAttendees, icon: Users, color: 'text-emerald-500' },
              { label: 'ACTIVE NODES', val: stats.totalEvents, icon: Globe, color: 'text-purple-500' },
            ].map((s, i) => (
              <div key={i} className="stat-card-elite">
                <div className="flex justify-between items-start">
                   <div className="stat-icon-wrapper"><s.icon className={cn("w-5 h-5", s.color)} /></div>
                   <div className="h-1.5 w-1.5 bg-[#E11D48] rounded-full animate-pulse" />
                </div>
                <div>
                   <p className="stat-label-elite">{s.label}</p>
                   <p className="stat-value-elite">{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="filter-node-card">
             <div className="filter-grid-layout">
                <div className="search-manifest-group">
                   <p className="filter-group-label">Search Manifest</p>
                   <div className="relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#E11D48] transition-colors" />
                      <Input 
                        placeholder="ENTER EVENT IDENTITY..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-16 pl-14 bg-white/5 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-[#E11D48]/50"
                      />
                   </div>
                </div>
                <div className="timeline-filter-group">
                   <p className="filter-group-label">Timeline Filter</p>
                   <div className="custom-tabs-container">
                      {[
                        { id: 'all', label: 'ALL', icon: LayoutGrid },
                        { id: 'upcoming', label: 'UPCOMING', icon: Zap },
                        { id: 'past', label: 'HISTORICAL', icon: History },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn("custom-tab-trigger", activeTab === tab.id && "active")}
                        >
                           <tab.icon className="w-3 h-3" /> {tab.label}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="node-selection-group">
                   <p className="filter-group-label">Node Selection</p>
                   <Select value={filterEvent} onValueChange={setFilterEvent}>
                      <SelectTrigger className="h-16 bg-white/5 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-[#E11D48]/50 border-none">
                         <SelectValue placeholder="FILTER BY NODE" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/5 text-white">
                         <SelectItem value="all">ALL NODES</SelectItem>
                         {combinedData.map(({ event }) => (
                           <SelectItem key={event._id} value={event._id}>{event.eventName}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <AnimatePresence>
                {filteredData.length === 0 ? (
                  <div className="py-40 text-center bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-3xl">
                     <BarChart3 className="w-16 h-16 text-gray-800 mx-auto mb-8" />
                     <h3 className="text-2xl font-black uppercase tracking-tighter text-white">No Intelligence Detected</h3>
                     <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px] mt-2">Adjust your filters to scan different operational nodes.</p>
                  </div>
                ) : (
                  filteredData.map(({ event, tickets, payments }) => (
                    <EventBookingCard 
                      key={event._id} 
                      event={event} 
                      tickets={dataView === "payments" ? [] : tickets} 
                      payments={dataView === "tickets" ? [] : payments} 
                    />
                  ))
                )}
             </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsOfMyEvents;
