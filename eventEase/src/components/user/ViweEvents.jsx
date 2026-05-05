import React, { useEffect, useState } from "react";
import api, { setAuthToken } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
  LogIn,
  Sparkles,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";
import SignInModal from "@/components/user/SignInModal";
import { cn } from "@/lib/utils";

/*
   EventCard - Cinematic Redesign */
const EventCard = ({ event, getEventStatus, onCardClick, isAuthenticated, onSignInClick, onBookClick, dimmed = false }) => {
  const eventStatus = getEventStatus(event);
  const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);
  const StatusIcon = eventStatus.icon;

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
    <div
      className={cn(
        "group relative flex flex-col bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        dimmed
          ? "opacity-50 grayscale scale-95 hover:grayscale-0 hover:opacity-100 hover:scale-[1.08] hover:shadow-[0_0_100px_rgba(225,29,72,0.25)] hover:border-white/20 hover:z-50"
          : "hover:border-[#E11D48]/30 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(225,29,72,0.1)]"
      )}
      onClick={() => onCardClick(event)}
    >
      {/* Aura Background (Only for hovered ended events) */}
      {dimmed && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E11D48]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] blur-3xl pointer-events-none" />
      )}

      {/* Top Section: Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2.2rem] m-2">
        <img
          src={event.eventImgUrl}
          alt={event.eventName}
          className={cn(
            "w-full h-full object-cover transition-transform duration-[1200ms] ease-out",
            dimmed ? "group-hover:scale-125" : "group-hover:scale-110"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Floating Price Tag */}
        <div className="absolute top-4 right-4">
          <div className="bg-white text-black px-4 py-2 rounded-full font-black text-[9px] shadow-2xl tracking-widest transform transition-transform group-hover:-translate-y-1">
            {(() => {
              if (event.eventCategory === "Indoor" && event.zonePrices?.length > 0) {
                const validPrices = event.zonePrices.filter(p => p > 0);
                if (validPrices.length === 0) return "FREE";
                const minPrice = Math.min(...validPrices);
                return `FROM ₹${minPrice.toLocaleString()}`;
              } else if (event.ticketRate) {
                return `₹${event.ticketRate.toLocaleString()}`;
              } else {
                return "FREE";
              }
            })()}
          </div>
        </div>

        {/* 3D Archive Badge (Only for dimmed) */}
        {dimmed && (
          <div className="absolute bottom-4 left-4 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black tracking-widest text-white uppercase">
            <Clock className="w-3 h-3 text-[#E11D48]" />
            Relive Experience
          </div>
        )}
      </div>

      {/* Bottom Section: Structured Info */}
      <div className="p-8 flex flex-col flex-1 relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <p className={cn(
              "text-[9px] font-black uppercase tracking-[0.4em] mb-3 transition-colors duration-500",
              dimmed ? "text-gray-600 group-hover:text-[#E11D48]" : "text-[#E11D48]"
            )}>
              {event.eventType || "Premium Experience"}
            </p>
            <h3 className={cn(
              "text-2xl md:text-3xl font-black leading-[1.1] uppercase tracking-tighter transition-all duration-500",
              dimmed ? "text-gray-500 group-hover:text-white group-hover:translate-x-2" : "text-white group-hover:translate-x-1"
            )}>
              {event.eventName}
            </h3>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 transform group-hover:rotate-12",
            dimmed ? "bg-white/5 border border-white/5 group-hover:bg-[#E11D48] group-hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]" : "bg-white/5 border border-white/10 group-hover:bg-[#E11D48]"
          )}>
            <Ticket className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5 flex items-end justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {eventStatus.status === 'ongoing' ? (
                <div className="flex items-center gap-2">
                  <div className="live-indicator" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Status</span>
                </div>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 transition-colors duration-500",
                  dimmed ? "text-gray-700 group-hover:text-[#E11D48]" : "text-gray-500"
                )}>
                  <StatusIcon className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{eventStatus.label}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Calendar className="w-3 h-3 text-[#E11D48]" />
              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest justify-end mb-2">
              <MapPin className="w-3 h-3 text-[#E11D48]" />
              {event.cityId?.name || 'Global'}
            </div>
            <Button
              className={cn(
                "h-8 px-4 border-white/10 text-[8px] font-black tracking-widest uppercase rounded-full transition-all duration-500",
                dimmed
                  ? "bg-white/5 text-gray-600 group-hover:bg-white group-hover:text-black group-hover:scale-110"
                  : "bg-white/5 hover:bg-[#E11D48] text-white"
              )}
              onClick={handleActionClick}
            >
              {dimmed ? "ARCHIVE" : "DETAILS"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


/* -------------------------
   Main ViewEvents component
   Single-file monolith merge
   ------------------------- */
export const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterEventType, setFilterEventType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [prefersDark, setPrefersDark] = useState(false);

  const navigate = useNavigate();

  /* Load Razorpay SDK */
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setError("Payment system unavailable. Please refresh the page.");
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  /* Detect system dark mode (improves drawer contrast regardless of Tailwind 'dark' class) */
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setPrefersDark(e.matches);
      setPrefersDark(mq.matches);
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else if (mq.addListener) mq.addListener(handler);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', handler);
        else if (mq.removeListener) mq.removeListener(handler);
      };
    } catch (err) {
      // ignore in non-browser environments
    }
  }, []);

  /* Auth check (listen to storage changes) */
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const verified = localStorage.getItem("isVerified") === "true";
      setIsAuthenticated(!!token);
      setIsVerified(verified);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  /* Load events on mount */
  useEffect(() => {
    getAllEvents();
  }, []);

  useEffect(() => {
    if (bookingInfo) {
      const timer = setTimeout(() => setBookingInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingInfo]);

  /* fetch all events */
  const getAllEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/event/getallevents`);
      setEvents(res.data.data || []);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
    // initialize ticket quantity if not present
    setTicketQuantities((prev) => ({ ...prev, [event._id]: prev[event._id] || 1 }));
  };

  const bookEventWithoutSeats = async (booking) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId") || localStorage.getItem("id");
      if (!token) throw new Error("Authentication required");

      const res = await api.post(`/event/bookseat/${booking.eventId}`, {
        quantity: booking.quantity,
        selectedSeats: booking.selectedSeats || [],
        organizerId: booking.organizerId,
        stateId: booking.stateId,
        cityId: booking.cityId,
        paymentId: booking.paymentId,
      });
      const message = res.data?.message || "Booking successful! 🎉";
      alert(message);
      setBookingInfo(message);

      const userRole = localStorage.getItem("role");
      const targetPath = userRole === "Organizer" ? "/bookedtickets" : "/mytickets";
      
      setTimeout(() => {
        navigate(targetPath);
        getAllEvents();
        setIsDrawerOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };

  /* Payment flow using Razorpay (secure: server verifies order/payment) */
  const handlePayment = async (eventDetails, quantity) => {
    if (!razorpayLoaded || !window.Razorpay) {
      alert("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    setProcessingPayment(true);

    try {
      // Create order on server (server should create razorpay order and return order id)
      const token = localStorage.getItem("token");

      // Prepare amount in paise (Razorpay expects amount in smallest currency unit)
      const ticketRate = Number(eventDetails.ticketRate || 0);
      const amountPaise = Math.round(quantity * ticketRate * 100);

      // Prefer calling backend with amount, eventId and quantity. Backend should validate pricing.
      let orderRes;
      try {
        // Server calculates amount from event data; send only eventId and quantity
        orderRes = await api.post('/payment/create_order', {
          eventId: eventDetails._id,
          quantity: quantity,
        });
      } catch (err) {
        console.error('create_order failed:', err.response?.data || err.message || err);
        throw err;
      }


      const { order } = orderRes.data; // server should return razorpay_order_id & any necessary meta
      if (!order || !order.id) {
        throw new Error("Failed to create payment order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount_due || order.amount || (quantity * (eventDetails.ticketRate || 0) * 100),
        currency: "INR",
        name: "EventEase",
        description: `Booking for ${eventDetails.eventName}`,
        order_id: order.id, // pass server created order id
        handler: async function (response) {
          // After payment success on client, verify on server
          try {
            // Server must verify signature, amount, status etc.
            try {
              await api.post('/payment/verify_order', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            } catch (err) {
              console.error('verify_order failed:', err.response?.data || err.message || err);
              throw err;
            }

            // After server verification, record booking
            await bookEventWithoutSeats({
              eventId: eventDetails._id,
              organizerId: eventDetails.organizerId,
              quantity,
              selectedSeats: [],
              stateId: eventDetails.stateId?._id || eventDetails.stateId,
              cityId: eventDetails.cityId?._id || eventDetails.cityId,
              paymentId: response.razorpay_payment_id,
            });
          } catch (error) {
            console.error("Verification failed:", error);
            alert(
              "Payment successful but booking verification failed. Please contact support with your payment ID: " +
              response.razorpay_payment_id
            );
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: localStorage.getItem("name") || "Guest User",
          email: localStorage.getItem("email") || "",
          contact: localStorage.getItem("phone") || "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment initiation failed:", error.response?.data || error.message || error);
      const serverMsg = error.response?.data?.message || error.response?.data || error.message;
      alert(serverMsg || "Failed to initiate payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  const handleBookingClick = (event, quantity) => {
    // If not authenticated, save pending info and prompt sign in
    if (!isAuthenticated) {
      setPendingPayment({
        eventId: event._id,
        quantity,
      });
      setShowSignInModal(true);
      return;
    }

    // If not verified, prompt verification
    const verified = localStorage.getItem("isVerified") === "true";
    if (!verified) {
      setPendingPayment({
        eventId: event._id,
        quantity,
      });
      setShowVerifyModal(true);
      return;
    }

    handlePayment(event, quantity);
  };

  const handleSeatSelectionClick = (event) => {
    if (!isAuthenticated) {
      setPendingPayment({
        eventId: event._id,
        redirectToSeatSelection: true,
      });
      setShowSignInModal(true);
      return;
    }

    const verified = localStorage.getItem("isVerified") === "true";
    if (!verified) {
      setPendingPayment({
        eventId: event._id,
        redirectToSeatSelection: true,
      });
      setShowVerifyModal(true);
      return;
    }

    navigate(`/select-seats/${event._id}`);
  };

  /* Handle card sign-in click (Sign in to Book / Sign in to Select Seats) */
  const handleCardSignIn = (event) => {
    if (event.eventCategory === "Indoor") {
      handleSeatSelectionClick(event);
    } else {
      // For outdoor events, show quantity selector in drawer then payment
      handleBookingClick(event, 1);
    }
  };

  /* Handle card book click (Book Now / Select Seats for authenticated users) */
  const handleCardBook = (event, config) => {
    if (config?.redirectToSeatSelection) {
      navigate(`/select-seats/${event._id}`);
    } else if (event.eventCategory === "Indoor") {
      navigate(`/select-seats/${event._id}`);
    } else {
      // Open drawer for outdoor event to show quantity and payment options
      handleEventClick(event);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

    if (endDate < now) {
      return { status: "ended", label: "Event Ended", variant: "destructive", icon: Clock };
    }
    if (availableSeats <= 0) {
      return { status: "soldout", label: "Sold Out", variant: "destructive", icon: AlertCircle };
    }
    if (startDate <= now && endDate >= now) {
      return { status: "ongoing", label: "Ongoing", variant: "default", icon: CheckCircle };
    }
    return { status: "upcoming", label: "Available", variant: "outline", icon: Ticket };
  };

  const filteredEvents = events.filter((event) => {
    const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
    return matchName && matchCity && matchType;
  });

  const sortedEvents = filteredEvents.sort((a, b) => {
    const now = new Date();
    const aEnded = new Date(a.endDate) < now;
    const bEnded = new Date(b.endDate) < now;

    if (aEnded === bEnded) {
      return new Date(a.startDate) - new Date(b.startDate);
    }
    return aEnded ? 1 : -1;
  });

  const endedEvents = sortedEvents.filter((e) => getEventStatus(e).status === "ended");
  const activeEvents = sortedEvents.filter((e) => getEventStatus(e).status !== "ended");

  useEffect(() => {
    if (events.length > 0) {
      console.log("--- EVENTEASE DEBUG ---");
      console.log("Total Events from API:", events.length);
      console.log("Active Events (Upcoming/Live):", activeEvents.length);
      console.log("Past Events (Ended):", endedEvents.length);
      if (endedEvents.length > 0) console.log("Sample Ended Event:", endedEvents[0].eventName, "End Date:", endedEvents[0].endDate);
      console.log("-----------------------");
    }
  }, [events, activeEvents, endedEvents]);

  /* Lightweight loading skeleton */
  const LoadingSkeleton = () => (
    <div className="space-y-12">
      {[1, 2].map((section) => (
        <div key={section}>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex space-x-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="w-80">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const [hoveringArchive, setHoveringArchive] = useState(false);
  const archiveScrollRef = React.useRef(null);

  useEffect(() => {
    let interval;
    const container = archiveScrollRef.current;

    if (container && endedEvents.length > 0 && !hoveringArchive) {
      interval = setInterval(() => {
        if (!container) return;
        container.scrollLeft += 2;

        // Seamless loop: when we reach the end of the first set, jump back to start
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }, 25);
    }

    return () => clearInterval(interval);
  }, [endedEvents, hoveringArchive]);

  /* UI */
  return (
    <>
      <div className="w-full min-h-screen bg-transparent text-white selection:bg-[#E11D48]/30">
        <div className="w-full py-24 px-6 md:px-12 space-y-24">

          {/* Header */}
          <div className="max-w-[1800px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-8 h-[2px] bg-[#E11D48]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Show Discovery</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase">
                  FIND YOUR<br />NEXT SHOW
                </h1>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-[200px] text-right">
                Access the world's most exclusive events and live performances.
              </p>
            </div>

            {/* Minimalist Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
                <input
                  placeholder="SEARCH SHOWS"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full bg-transparent border-none pl-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-0 placeholder:text-gray-700 outline-none"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#E11D48] transition-all group-focus-within:w-full" />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
                <input
                  placeholder="LOCATION"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full bg-transparent border-none pl-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-0 placeholder:text-gray-700 outline-none"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#E11D48] transition-all group-focus-within:w-full" />
              </div>

              <div className="relative group">
                <Filter className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="w-full bg-transparent border-none pl-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase focus:ring-0 appearance-none cursor-pointer text-white outline-none"
                >
                  <option value="all" className="bg-black">ALL CATEGORIES</option>
                  <option value="Conference" className="bg-black">CONFERENCE</option>
                  <option value="Exhibition" className="bg-black">EXHIBITION</option>
                  <option value="Gala Dinner" className="bg-black">GALA DINNER</option>
                  <option value="Music concert" className="bg-black">MUSIC CONCERT</option>
                  <option value="ZoomMeeting" className="bg-black">ZOOM MEETING</option>
                </select>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#E11D48] transition-all group-focus-within:w-full" />
              </div>
            </div>
          </div>
          {/* Main content */}
          <div className="max-w-[1800px] mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />)}
              </div>
            ) : activeEvents.length === 0 && endedEvents.length === 0 ? (
              <div className="py-40 text-center border border-white/5 bg-white/5">
                <Calendar className="mx-auto w-12 h-12 text-gray-700 mb-8" />
                <h3 className="text-2xl font-black uppercase tracking-widest text-white">No Shows Found</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-40">
                {/* Active shows */}
                <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
                    {activeEvents.map((event) => (
                      <EventCard key={event._id} event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} isAuthenticated={isAuthenticated} onSignInClick={handleCardSignIn} onBookClick={handleCardBook} />
                    ))}
                  </div>
                </section>

                {endedEvents.length > 0 && (
                  <section className="space-y-16">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none">PAST SHOWS</h2>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-px bg-[#E11D48]" />
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] animate-pulse">Historical Archive</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] group cursor-pointer">
                        EXPLORE ARCHIVE <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#E11D48] group-hover:text-white transition-all"><ArrowRight className="w-4 h-4 text-[#E11D48] group-hover:translate-x-1 transition-transform" /></div>
                      </div>
                    </div>

                    <div className="relative group/scroll px-2">
                      <div
                        ref={archiveScrollRef}
                        className="flex gap-10 overflow-x-auto no-scrollbar pb-20 scroll-smooth h-fit pt-10"
                        onMouseEnter={() => setHoveringArchive(true)}
                        onMouseLeave={() => setHoveringArchive(false)}
                      >
                        {/* Duplicate the array to create an infinite loop effect */}
                        {[...endedEvents, ...endedEvents].map((event, index) => (
                          <div
                            key={`${event._id}-${index}`}
                            className="min-w-[75vw] md:min-w-[360px] animate-fade-in-right first:ml-0"
                            style={{ animationDelay: `${(index % endedEvents.length) * 150}ms` }}
                          >
                            <EventCard
                              event={event}
                              getEventStatus={getEventStatus}
                              onCardClick={handleEventClick}
                              dimmed
                              isAuthenticated={isAuthenticated}
                              onSignInClick={handleCardSignIn}
                              onBookClick={handleCardBook}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Subtle fade edges for scroll awareness */}
                      <div className="absolute top-0 right-0 bottom-0 w-64 bg-gradient-to-l from-black via-black/40 to-transparent pointer-events-none z-10 opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-1000" />
                      <div className="absolute top-0 left-0 bottom-0 w-64 bg-gradient-to-r from-black via-black/40 to-transparent pointer-events-none z-10 opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-1000" />
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cinematic Side Drawer - Redesigned */}
        {selectedEvent && isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex">
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-700"
              onClick={() => setIsDrawerOpen(false)}
            />

            <aside
              className={cn(
                "relative ml-auto w-full max-w-xl h-full bg-[#050505] border-l border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] transform transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)",
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Hero Header Section */}
                <div className="relative h-[48vh] flex-shrink-0 overflow-hidden group">
                  <div className="absolute inset-0 transition-transform duration-[2000ms] group-hover:scale-110">
                    <img
                      src={selectedEvent.eventImgUrl}
                      alt={selectedEvent.eventName}
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                    />
                  </div>

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 to-transparent" />

                  {/* Close Button */}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="absolute top-10 right-10 w-12 h-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#E11D48] transition-all duration-500 hover:rotate-90 shadow-2xl z-20"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-12 left-12 right-12 z-10">
                    <div className="flex flex-wrap items-center gap-4 mb-10">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E11D48] text-white text-[9px] font-black uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(225,29,72,0.4)]">
                        <Sparkles className="w-3 h-3" />
                        {selectedEvent.eventType || "Exclusive Access"}
                      </div>
                      {getEventStatus(selectedEvent).status === 'ongoing' && (
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.4em]">
                          <div className="live-indicator animate-pulse" />
                          Live Experience
                        </div>
                      )}
                    </div>
                    <h2 className="text-6xl md:text-[5.5rem] font-black text-white leading-[0.8] uppercase tracking-[-0.04em] mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                      {selectedEvent.eventName}
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="h-px w-12 bg-[#E11D48]" />
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">{selectedEvent.eventCategory} Protocol • Level 01</p>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-12 md:p-16 space-y-16 no-scrollbar">
                  {/* Glass Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white/5 border border-white/5 backdrop-blur-sm group/card hover:bg-white/10 transition-colors duration-500 rounded-3xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-[#E11D48]" />
                        </div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Date & Time</p>
                      </div>
                      <p className="text-xl font-black text-white uppercase leading-tight">
                        {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        <br />
                        <span className="text-gray-500 text-sm font-bold tracking-widest">{new Date(selectedEvent.startDate).getFullYear()} • 19:00 PM</span>
                      </p>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/5 backdrop-blur-sm group/card hover:bg-white/10 transition-colors duration-500 rounded-3xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#E11D48]" />
                        </div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Availability</p>
                      </div>
                      <div className="space-y-4">
                        <p className="text-xl font-black text-white uppercase leading-tight">
                          {(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} <span className="text-gray-500 text-sm font-bold tracking-widest">SEATS LEFT</span>
                        </p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E11D48] shadow-[0_0_10px_rgba(225,29,72,0.5)] transition-all duration-1000"
                            style={{ width: `${Math.max(5, 100 - (((selectedEvent.bookedSeats || 0) / (selectedEvent.numberOfSeats || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Venue Block */}
                  <div className="p-8 bg-white/5 border border-white/5 backdrop-blur-sm rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#E11D48]" />
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Security Sector / Venue</p>
                    </div>
                    {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
                      <a href={selectedEvent.zoomUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 text-2xl font-black text-white hover:text-[#E11D48] transition-colors uppercase group">
                        Secure Virtual Link <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    ) : (
                      <p className="text-2xl font-black text-white uppercase leading-tight">
                        {selectedEvent.stadiumId?.location?.address || selectedEvent.cityId?.name || "Access Point Restricted"}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Booking */}
                  <div className="pt-12 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-12">
                      <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Pricing Protocol</p>
                        <div className="flex items-baseline gap-4">
                          <span className="text-6xl font-black text-white leading-none tracking-tighter">
                            {(() => {
                              if (selectedEvent.eventCategory === 'Indoor' && selectedEvent.zonePrices?.length > 0) {
                                const validPrices = selectedEvent.zonePrices.filter(p => p > 0);
                                if (validPrices.length === 0) return 'FREE';
                                const minPrice = Math.min(...validPrices);
                                return `₹${minPrice.toLocaleString()}`;
                              } else if (selectedEvent.ticketRate) {
                                return `₹${selectedEvent.ticketRate.toLocaleString()}`;
                              } else {
                                return 'FREE';
                              }
                            })()}
                          </span>
                          {selectedEvent.eventCategory === 'Indoor' && <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">BASE TIER</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-8">
                      {(() => {
                        const eventStatus = getEventStatus(selectedEvent);
                        if (eventStatus.status === 'ended') return (
                          <div className="flex items-center justify-center p-8 border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
                            MISSION COMPLETE • ARCHIVED
                          </div>
                        );
                        if (eventStatus.status === 'soldout') return (
                          <div className="flex items-center justify-center p-8 border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                            CAPACITY REACHED • SOLD OUT
                          </div>
                        );

                        if (selectedEvent.eventCategory === 'Indoor') {
                          return (
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleSeatSelectionClick(selectedEvent); }}
                              className="w-full h-20 bg-white text-black hover:bg-gray-200 rounded-full text-[11px] font-black tracking-[0.5em] uppercase transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transform hover:scale-[1.02]"
                            >
                              INITIALIZE SEAT SELECTION
                            </Button>
                          );
                        }

                        return (
                          <div className="space-y-8">
                            <div className="relative">
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Transmission Units</p>
                              <div className="relative group">
                                <select
                                  value={String(ticketQuantities[selectedEvent._id] || 1)}
                                  onChange={(e) => setTicketQuantities({ ...ticketQuantities, [selectedEvent._id]: parseInt(e.target.value) })}
                                  className="w-full bg-white/5 border border-white/10 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] appearance-none focus:ring-0 focus:border-[#E11D48] transition-all cursor-pointer rounded-2xl"
                                >
                                  {Array.from({ length: Math.min(10, Math.max(1, (selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0))) }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1)} className="bg-black">{i + 1} TICKET UNITS</option>
                                  ))}
                                </select>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-focus-within:text-[#E11D48] transition-colors">
                                  <Ticket className="w-4 h-4" />
                                </div>
                              </div>
                            </div>

                            <Button
                              disabled={processingPayment}
                              onClick={(e) => { e.stopPropagation(); handleBookingClick(selectedEvent, ticketQuantities[selectedEvent._id] || 1); }}
                              className="w-full h-24 bg-[#E11D48] hover:bg-red-700 text-white rounded-full text-[11px] font-black tracking-[0.5em] uppercase transition-all duration-500 shadow-[0_0_50px_rgba(225,29,72,0.2)] hover:shadow-[0_0_70px_rgba(225,29,72,0.4)] transform hover:scale-[1.02] group"
                            >
                              {!isAuthenticated ? (
                                <span className="flex items-center gap-4">
                                  <LogIn className="w-5 h-5" /> AUTHORIZE ACCESS
                                </span>
                              ) : processingPayment ? (
                                <span className="flex items-center gap-4">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  TRANSMITTING...
                                </span>
                              ) : (
                                <span className="flex items-center gap-4">
                                  CONFIRM PROTOCOL <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500" />
                                </span>
                              )}
                            </Button>
                          </div>
                        );
                      })()}

                      {/* Footer Badges */}
                      <div className="pt-8 flex justify-center items-center gap-10 opacity-30 group-hover:opacity-60 transition-opacity">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-white">Secure Encrypted</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-white">Instant Fulfillment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

      </div>

      {/* Sign In Modal */}
      {showSignInModal && (
        <SignInModal
          open={showSignInModal}
          pendingPayment={pendingPayment}
          onClose={() => {
            setShowSignInModal(false);
            setPendingPayment(null);
          }}
          onLoginSuccess={(token, userData) => {
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userData._id);
            localStorage.setItem("role", userData.roleId?.name || "User");
            localStorage.setItem("isVerified", userData.isVerified ? "true" : "false");
            setIsAuthenticated(true);
            setIsVerified(userData.isVerified === true);

            if (pendingPayment?.redirectToSeatSelection) {
              navigate(`/select-seats/${pendingPayment.eventId}`);
              setShowSignInModal(false);
              setPendingPayment(null);
              setIsDrawerOpen(false);
              return;
            }

            if (pendingPayment && (localStorage.getItem("isVerified") === "true") && razorpayLoaded && window.Razorpay) {
              // start payment after successful login if pending
              const eventToPay = events.find(e => e._id === pendingPayment.eventId);
              if (eventToPay) {
                handlePayment(eventToPay, pendingPayment.quantity || 1);
              }
              setPendingPayment(null);
            }

            setShowSignInModal(false);
          }}
        />
      )}

      {/* Verify Email Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Email Not Verified</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Please verify your email before booking tickets. Check your inbox for the verification link.
            </p>

            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowVerifyModal(false)} className="px-4">OK</Button>

              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      setShowSignInModal(true);
                      setShowVerifyModal(false);
                      return;
                    }
                    await api.post("/user/resend-verification", {});
                    alert("Verification email resent. Check your inbox.");
                  } catch (err) {
                    console.error("Resend verification failed:", err);
                    alert(err.response?.data?.message || "Failed to resend verification email.");
                  } finally {
                    setShowVerifyModal(false);
                  }
                }}
              >
                Resend Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewEvents;
