import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEvents } from "../../features/events/eventsSlice";
import api from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Ticket,
  Clock,
  CheckCircle,
  Search,
  Filter,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X,
  Zap,
  LayoutGrid,
  Activity,
  ShieldCheck,
  TrendingUp,
  Globe,
  LogIn
} from "lucide-react";
import SignInModal from "@/components/user/SignInModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/*
   Premium EventCard - Cinematic Liquid Ink Edition
*/
const EventCard = React.forwardRef(({ event, getEventStatus, onCardClick, isAuthenticated, onSignInClick, onBookClick, dimmed = false }, ref) => {
  const eventStatus = getEventStatus(event);
  const StatusIcon = eventStatus.icon || Ticket;
  const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onSignInClick(event);
      return;
    }
    if (event.eventCategory === "Indoor") {
      onBookClick(event, { redirectToSeatSelection: true });
    } else {
      onCardClick(event);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col bg-[#080808] rounded-[2rem] border border-white/5 transition-all duration-700 ease-out overflow-hidden h-full",
        dimmed 
          ? "opacity-50 grayscale hover:grayscale-0 hover:opacity-100" 
          : "hover:border-[#E11D48]/30 hover:shadow-[0_40px_100px_-20px_rgba(225,29,72,0.15)]"
      )}
      onClick={() => onCardClick(event)}
    >
      {/* Visual Component */}
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={event.eventImgUrl}
          alt={event.eventName}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
        
        {/* Floating Tags */}
        <div className="absolute top-5 right-5 flex flex-col items-end gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-full text-white text-[9px] font-black tracking-widest shadow-2xl">
             {event.eventCategory === "Indoor" && event.zonePrices?.length > 0 
                ? `FROM ₹${Math.min(...event.zonePrices.filter(p => p > 0)).toLocaleString()}`
                : event.ticketRate ? `₹${event.ticketRate.toLocaleString()}` : "FREE"}
          </div>
        </div>

        <div className="absolute bottom-5 left-5">
           <div className={cn(
              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border",
              eventStatus.status === 'ongoing' 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : "bg-white/5 border-white/10 text-gray-400"
           )}>
              {eventStatus.status === 'ongoing' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
              {eventStatus.label}
           </div>
        </div>
      </div>

      {/* Info Component */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-6">
           <div className="space-y-2">
              <p className="text-[8px] font-black text-[#E11D48] uppercase tracking-[0.4em]">{event.eventType || "NODE SESSION"}</p>
              <h3 className="text-2xl font-black text-white leading-none uppercase tracking-tighter group-hover:text-[#E11D48] transition-colors line-clamp-2">
                {event.eventName}
              </h3>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-[#E11D48] transition-all">
              <Ticket className="w-4 h-4 text-white" />
           </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
           <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-gray-500">
                 <Calendar className="w-3.5 h-3.5 text-[#E11D48]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">
                   {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                 <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[80px]">
                    {event.cityId?.name || 'GLOBAL'}
                 </span>
              </div>
           </div>
           
           <div className="flex flex-col items-end justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 mb-2">
                 <Users className="w-3 h-3" /> {availableSeats} UNITS
              </div>
              <Button 
                onClick={handleActionClick}
                className="h-8 px-5 bg-white/5 hover:bg-[#E11D48] text-white border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest transition-all"
              >
                 {dimmed ? "ARCHIVE" : "DETAILS"}
              </Button>
           </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function ViewEventsOrg() {
  const dispatch = useAppDispatch();
  const { list: events, status } = useAppSelector((s) => s.events);
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const archiveScrollRef = useRef(null);
  const [hoveringArchive, setHoveringArchive] = useState(false);

  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) { setRazorpayLoaded(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  useEffect(() => {
    dispatch(fetchEvents());
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const verified = localStorage.getItem("isVerified") === "true";
      setIsAuthenticated(!!token);
      setIsVerified(verified);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [dispatch]);

  // Infinite Scroll Logic
  useEffect(() => {
    let interval;
    if (archiveScrollRef.current && !hoveringArchive) {
      interval = setInterval(() => {
        const container = archiveScrollRef.current;
        if (container) {
          container.scrollLeft += 2;
          if (container.scrollLeft >= container.scrollWidth / 2) container.scrollLeft = 0;
        }
      }, 25);
    }
    return () => clearInterval(interval);
  }, [hoveringArchive, events]);

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

    if (endDate < now) return { status: "ended", label: "Event Ended", icon: Clock };
    if (availableSeats <= 0) return { status: "soldout", label: "Sold Out", icon: AlertCircle };
    if (startDate <= now && endDate >= now) return { status: "ongoing", label: "Ongoing", icon: CheckCircle };
    return { status: "upcoming", label: "Available", icon: Ticket };
  };

  const activeEvents = events.filter(e => {
    const st = getEventStatus(e).status;
    const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || e.eventType === filterType;
    return st !== "ended" && matchesSearch && matchesType;
  });

  const endedEvents = events.filter(e => getEventStatus(e).status === "ended");

  const bookEventWithoutSeats = async (booking) => {
    try {
      const res = await api.post(`/event/bookseat/${booking.eventId}`, {
        quantity: booking.quantity,
        selectedSeats: [],
        organizerId: booking.organizerId,
        stateId: booking.stateId,
        cityId: booking.cityId,
        paymentId: booking.paymentId,
      });
      alert(res.data?.message || "Booking successful! 🎉");
      setTimeout(() => {
        const role = localStorage.getItem("role");
        navigate(role === "Organizer" ? "/bookedtickets" : "/mytickets");
        dispatch(fetchEvents());
        setIsDrawerOpen(false);
      }, 1500);
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };

  const handlePayment = (eventDetails, qty) => {
    if (!razorpayLoaded || !window.Razorpay) { alert("Payment system is still loading."); return; }
    setProcessingPayment(true);
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: qty * (eventDetails.ticketRate || 0) * 100,
      currency: "INR",
      name: "EventEase",
      description: `Booking for ${eventDetails.eventName}`,
      handler: async function (response) {
        try {
          await bookEventWithoutSeats({
            eventId: eventDetails._id,
            organizerId: eventDetails.organizerId,
            quantity: qty,
            selectedSeats: [],
            stateId: eventDetails.stateId?._id || eventDetails.stateId,
            cityId: eventDetails.cityId?._id || eventDetails.cityId,
            paymentId: response.razorpay_payment_id,
          });
        } finally {
          setProcessingPayment(false);
        }
      },
      prefill: {
        name: localStorage.getItem("name") || "",
        email: localStorage.getItem("email") || "",
      },
      theme: { color: "#E11D48" },
      modal: { ondismiss: () => setProcessingPayment(false) }
    };
    new window.Razorpay(options).open();
  };

  const handleBookingClick = (event, qty) => {
    if (!isAuthenticated) { setPendingPayment({ eventId: event._id, quantity: qty }); setShowSignInModal(true); return; }
    if (!isVerified) { setPendingPayment({ eventId: event._id, quantity: qty }); setShowVerifyModal(true); return; }
    handlePayment(event, qty);
  };

  const handleSeatSelectionClick = (event) => {
    if (!isAuthenticated) { setPendingPayment({ eventId: event._id, redirectToSeatSelection: true }); setShowSignInModal(true); return; }
    if (!isVerified) { setPendingPayment({ eventId: event._id, redirectToSeatSelection: true }); setShowVerifyModal(true); return; }
    navigate(`/select-seats/${event._id}`);
  };

  const handleCardSignIn = (event) => {
    if (event.eventCategory === "Indoor") handleSeatSelectionClick(event);
    else handleBookingClick(event, 1);
  };

  const handleCardBook = (event, config) => {
    if (config?.redirectToSeatSelection || event.eventCategory === "Indoor") navigate(`/select-seats/${event._id}`);
    else { setSelectedEvent(event); setIsDrawerOpen(true); }
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans">
       <div className="max-w-[1700px] mx-auto px-10 py-16">
          {/* Refined Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
             <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">OPERATIONAL CATALOG</h1>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-1 bg-[#E11D48]" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Transmission Node Active</p>
                </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-6">
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
                   <input 
                      placeholder="SEARCH EVENTS..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-80 bg-white/5 border border-white/10 rounded-full px-12 py-4 text-[10px] font-black tracking-widest uppercase focus:ring-0 focus:border-[#E11D48] outline-none transition-all"
                   />
                </div>
                <div className="flex items-center gap-3">
                   {["all", "Music concert", "Exhibition"].map(t => (
                     <button 
                       key={t}
                       onClick={() => setFilterType(t)}
                       className={cn(
                          "px-6 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                          filterType === t 
                           ? "bg-[#E11D48] border-[#E11D48] text-white shadow-[0_0_30px_rgba(225,29,72,0.3)]" 
                           : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
                       )}
                     >
                       {t === "all" ? "GLOBAL" : t}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* CATALOG GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
             <AnimatePresence mode="popLayout">
                {activeEvents.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    getEventStatus={getEventStatus} 
                    onCardClick={(ev) => { setSelectedEvent(ev); setIsDrawerOpen(true); }} 
                    isAuthenticated={isAuthenticated}
                    onSignInClick={handleCardSignIn}
                    onBookClick={handleCardBook}
                  />
                ))}
             </AnimatePresence>
          </div>

          {/* ARCHIVE NODES */}
          {endedEvents.length > 0 && (
            <div className="mt-40">
               <div className="flex items-center gap-10 mb-16">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">ARCHIVE NODES</h2>
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Historical Transmission</span>
               </div>

               <div className="relative group/archive overflow-hidden rounded-[3rem]">
                  <div 
                     ref={archiveScrollRef}
                     className="flex gap-12 overflow-x-auto no-scrollbar py-10 px-4"
                     onMouseEnter={() => setHoveringArchive(true)}
                     onMouseLeave={() => setHoveringArchive(false)}
                  >
                     {[...endedEvents, ...endedEvents].map((event, idx) => (
                        <div key={`${event._id}-${idx}`} className="min-w-[380px]">
                           <EventCard 
                             event={event} 
                             getEventStatus={getEventStatus} 
                             onCardClick={(ev) => { setSelectedEvent(ev); setIsDrawerOpen(true); }}
                             dimmed
                             isAuthenticated={isAuthenticated}
                             onSignInClick={handleCardSignIn}
                             onBookClick={handleCardBook}
                           />
                        </div>
                     ))}
                  </div>
                  <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black via-transparent to-transparent pointer-events-none" />
               </div>
            </div>
          )}
       </div>

       {/* PANEL DRAWER */}
       {selectedEvent && isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex">
             <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsDrawerOpen(false)} />
             <aside className="relative ml-auto w-full max-w-2xl h-full bg-[#050505] border-l border-white/5 shadow-2xl flex flex-col overflow-hidden">
                <div className="relative h-[48vh] flex-shrink-0">
                   <img src={selectedEvent.eventImgUrl} className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-50 transition-all duration-[3000ms]" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                   <button onClick={() => setIsDrawerOpen(false)} className="absolute top-10 right-10 w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#E11D48] transition-all group shadow-2xl"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
                   
                   <div className="absolute bottom-16 left-16 right-16">
                      <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#E11D48] text-white text-[10px] font-black uppercase tracking-[0.5em] mb-10 shadow-[0_0_40px_rgba(225,29,72,0.4)]">
                         <Sparkles className="w-3.5 h-3.5" /> {selectedEvent.eventType || "EXCLUSIVE"}
                      </div>
                      <h2 className="text-6xl font-black text-white leading-[0.85] uppercase tracking-tighter mb-6">{selectedEvent.eventName}</h2>
                      <div className="flex items-center gap-6 text-gray-500 font-bold uppercase tracking-[0.5em] text-[10px]">
                         <MapPin className="w-4 h-4 text-[#E11D48]" /> {selectedEvent.cityId?.name || "Global Node"}
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-16 space-y-16 no-scrollbar">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 transition-colors">
                         <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.4em] mb-4">Transmission</p>
                         <p className="text-2xl font-black">{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 transition-colors">
                         <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.4em] mb-4">Availability</p>
                         <p className="text-2xl font-black">{(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} UNITS</p>
                      </div>
                   </div>

                   <div className="space-y-8">
                      {selectedEvent.eventCategory === "Indoor" ? (
                        <Button onClick={() => handleSeatSelectionClick(selectedEvent)} className="w-full h-24 bg-white text-black font-black uppercase tracking-[0.5em] text-[12px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">INITIALIZE SEAT SELECTION</Button>
                      ) : (
                        <div className="space-y-10">
                           <div className="flex items-center justify-between px-8 py-6 bg-white/5 border border-white/5 rounded-[2rem]">
                              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Transmission Quantity</span>
                              <div className="flex items-center gap-8">
                                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xl hover:bg-white hover:text-black transition-all">-</button>
                                 <span className="text-2xl font-black">{quantity}</span>
                                 <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xl hover:bg-white hover:text-black transition-all">+</button>
                              </div>
                           </div>
                           <Button disabled={processingPayment} onClick={() => handleBookingClick(selectedEvent, quantity)} className="w-full h-24 bg-white text-black font-black uppercase tracking-[0.5em] text-[12px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                              {processingPayment ? "AUTHORIZING..." : "CONFIRM PROTOCOL"}
                           </Button>
                        </div>
                      )}
                   </div>
                </div>
             </aside>
          </div>
       )}

       {showSignInModal && <SignInModal open={showSignInModal} pendingPayment={pendingPayment} onClose={() => { setShowSignInModal(false); setPendingPayment(null); }} onLoginSuccess={(t, u) => { localStorage.setItem("token", t); localStorage.setItem("userId", u._id); setIsAuthenticated(true); setShowSignInModal(false); }} />}
    </div>
  );
}
