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
} from "lucide-react";
import SignInModal from "@/components/user/SignInModal";

/*
   EventCard - extracted */
const EventCard = ({ event, getEventStatus, onCardClick, dimmed = false }) => {
  const eventStatus = getEventStatus(event);
  const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);
  const StatusIcon = eventStatus.icon;

  return (
    <Card
      className={
        "group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm  overflow-hidden dark:boarder-none dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-none h-full flex flex-col hover:-translate-y-2  " +
        (dimmed ? "opacity-60 filter grayscale" : "")
      }
      onClick={() => onCardClick(event)}
    >
      <div className="relative overflow-hidden">
        <img
          src={event.eventImgUrl}
          alt={event.eventName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={eventStatus.variant} className="shadow-lg">
            <StatusIcon className="w-3 h-3 mr-1" />
            {eventStatus.label}
          </Badge>
        </div>
        {event.eventType && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 shadow-lg dark:text-gray-900">
            {event.eventType}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-gray-100 line-clamp-2">
          {event.eventName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 pb-0 flex-grow">
        <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          <span>
            {new Date(event.startDate).toLocaleDateString()}
            {" — "}
            {new Date(event.endDate).toLocaleDateString()}
          </span>
        </div>

        {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
          <div className="flex items-center text-sm text-blue-600 dark:text-gray-100">
            <ExternalLink className="w-4 h-4 mr-2" />
            <span className="truncate">Zoom Meeting</span>
          </div>
        ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
          <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span className="truncate">{event.stadiumId.location.address}</span>
          </div>
        ) : event.cityId?.name ? (
          <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span>{event.cityId.name}{event.stateId ? `, ${event.stateId?.Name || event.stateId?.name}` : ""}</span>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="pt-4 border-t border-slate-100 dark:border-gray-800">
        <div className="w-full text-center">
          {eventStatus.status === "ended" ? (
            <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Event Completed
            </Badge>
          ) : eventStatus.status === "soldout" ? (
            <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Sold Out
            </Badge>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(event);
              }}
            >
              <Ticket className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
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

      await api.post(`/event/bookseat/${booking.eventId}`, {
        quantity: booking.quantity,
        selectedSeats: booking.selectedSeats || [],
        organizerId: booking.organizerId,
        stateId: booking.stateId,
        cityId: booking.cityId,
        paymentId: booking.paymentId,
      });
      setBookingInfo("Booking successful! 🎉");
      navigate(`/mytickets`);
      getAllEvents();
      setIsDrawerOpen(false);
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

  /* UI */
  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <div className="w-full py-16 px-4 md:px-8 space-y-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Discover Amazing Events
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Find and book your next unforgettable experience. Click any event card for details.
            </p>
          </div>

          {/* Filters */}
          <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover  border p-6 mb-8 dark:bg-gray-900 dark:border-none hover:-translate-y-2 transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 ">
              <Filter className="w-5 h-5 text-blue-600 " />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Filter Events</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by Event Name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by City"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
                />
              </div>
              <Select value={filterEventType} onValueChange={setFilterEventType}>
                <SelectTrigger className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:text-gray-100 dark:bg-gray-700">
                  <SelectValue placeholder="All Event Types" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="all">All Event Types</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Exhibition">Exhibition</SelectItem>
                  <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
                  <SelectItem value="Incentive">Incentive</SelectItem>
                  <SelectItem value="Music concert">Music Concert</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts */}
          <div className="w-full max-w-7xl mx-auto">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/50 dark:border-red-700">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            {bookingInfo && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/50 dark:border-green-700">
                <AlertDescription className="text-green-800 dark:text-green-200">{bookingInfo}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Main content */}
          <div className="w-full px-4 md:px-8">
            {loading ? (
              <LoadingSkeleton />
            ) : activeEvents.length === 0 && endedEvents.length === 0 ? (
              <div className="w-full max-w-7xl mx-auto text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg dark:bg-gray-800">
                <Calendar className="mx-auto w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-gray-100">No events found</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Try adjusting filters to find events.</p>
              </div>
            ) : (
              <>
                {/* Active events carousel */}
                <section className="mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Events</h2>
                    <Button variant="link" className="text-blue-600 dark:text-blue-400">
                      See All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <Carousel opts={{ align: "start", loop: activeEvents.length > 4 }} className="w-full">
                    <CarouselContent className="-ml-4">
                      {activeEvents.map((event) => (
                        <CarouselItem key={event._id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                          <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                  </Carousel>
                </section>

                {/* Ended events */}
                {endedEvents.length > 0 && (
                  <section className="mt-12">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ended Events</h2>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{endedEvents.length} items</div>
                    </div>

                    <Carousel opts={{ align: "start", loop: endedEvents.length > 4 }} className="w-full">
                      <CarouselContent className="-ml-4">
                        {endedEvents.map((event) => (
                          <CarouselItem key={event._id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} dimmed />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden md:flex" />
                      <CarouselNext className="hidden md:flex" />
                    </Carousel>
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        {/* Side Drawer - simplified design */}
        {selectedEvent && isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsDrawerOpen(false)}
            />

            <aside
              className={`relative ml-auto w-full max-w-md h-full shadow-lg transform transition duration-200 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
              style={{
                backgroundColor: prefersDark ? '#071027' : '#ffffff',
                color: prefersDark ? '#E6EEF8' : undefined,
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start gap-4 p-4 border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'transparent' }}>
                  <img src={selectedEvent.eventImgUrl} alt={selectedEvent.eventName} className="w-20 h-20 rounded-md object-cover shadow-sm" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-2" style={{ color: prefersDark ? '#E6EEF8' : undefined }}>{selectedEvent.eventName}</h3>
                    {selectedEvent.eventType && <p className="text-sm" style={{ color: prefersDark ? '#AFC3D9' : '#6B7280' }}>{selectedEvent.eventType}</p>}
                    <div className="mt-2">
                      <Badge className={`text-xs px-2 py-1 ${prefersDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>{getEventStatus(selectedEvent).label}</Badge>
                    </div>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className={`p-2 rounded ${prefersDark ? 'text-gray-200 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto flex-1" style={{ backgroundColor: 'transparent' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded" style={{ backgroundColor: prefersDark ? '#0e1622' : '#F8FAFC' }}>
                      <p className="text-xs" style={{ color: prefersDark ? '#94A7BF' : '#6B7280' }}>Date</p>
                      <p className="text-sm font-medium" style={{ color: prefersDark ? '#E6EEF8' : '#111827' }}>{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: prefersDark ? '#0e1622' : '#F8FAFC' }}>
                      <p className="text-xs" style={{ color: prefersDark ? '#94A7BF' : '#6B7280' }}>Available</p>
                      <p className="text-sm font-medium" style={{ color: prefersDark ? '#E6EEF8' : '#111827' }}>{(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} seats</p>
                    </div>
                  </div>

                  <div className="p-3 rounded" style={{ backgroundColor: prefersDark ? '#0e1622' : '#F8FAFC' }}>
                    <p className="text-xs" style={{ color: prefersDark ? '#94A7BF' : '#6B7280' }}>Ticket Price</p>
                    <p className="text-sm font-semibold" style={{ color: prefersDark ? '#E6EEF8' : '#111827' }}>
                      {selectedEvent.ticketRate ? `₹${selectedEvent.ticketRate.toLocaleString()}` : 'FREE'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium" style={{ color: prefersDark ? '#E6EEF8' : '#111827' }}>Details</h4>
                    {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
                      <a href={selectedEvent.zoomUrl} target="_blank" rel="noreferrer" className="text-sm underline" style={{ color: prefersDark ? '#7FB0FF' : '#2563EB' }}>Join Zoom Meeting</a>
                    ) : selectedEvent.stadiumId?.location?.address ? (
                      <p className="text-sm" style={{ color: prefersDark ? '#B6C9DB' : '#374151' }}>{selectedEvent.stadiumId.location.address}</p>
                    ) : selectedEvent.cityId?.name ? (
                      <p className="text-sm" style={{ color: prefersDark ? '#B6C9DB' : '#374151' }}>{selectedEvent.cityId.name}{selectedEvent.stateId ? `, ${selectedEvent.stateId?.Name || selectedEvent.stateId?.name}` : ''}</p>
                    ) : null}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'transparent' }}>
                  {(() => {
                    const eventStatus = getEventStatus(selectedEvent);
                    const availableSeats = (selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0);

                    if (eventStatus.status === 'ended') return <div className="text-center text-sm text-gray-500">Event Ended</div>;
                    if (eventStatus.status === 'soldout') return <div className="text-center text-sm text-red-500">Sold Out</div>;

                    if (selectedEvent.eventCategory === 'Indoor') {
                      return (
                        <Button onClick={(e) => { e.stopPropagation(); handleSeatSelectionClick(selectedEvent); }} className="w-full">{isAuthenticated ? 'Select Seats' : 'Sign in to Select Seats'}</Button>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <Select value={String(ticketQuantities[selectedEvent._id] || 1)} onValueChange={(v) => setTicketQuantities({ ...ticketQuantities, [selectedEvent._id]: parseInt(v) })}>
                          <SelectTrigger className="w-full" style={{ backgroundColor: prefersDark ? '#071026' : undefined, color: prefersDark ? '#E6EEF8' : undefined }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: Math.min(10, Math.max(1, availableSeats)) }, (_, i) => (
                              <SelectItem key={i+1} value={String(i+1)}>{i+1} Ticket{i>0?'s':''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button disabled={processingPayment} onClick={(e) => { e.stopPropagation(); handleBookingClick(selectedEvent, ticketQuantities[selectedEvent._id] || 1); }} className="w-full">
                          { !isAuthenticated ? 'Sign in to Book' : processingPayment ? 'Processing...' : `Pay ₹${((ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}` }
                        </Button>

                        {isAuthenticated && !isVerified && (<p className="text-xs text-red-500 text-center">Please verify your email to book tickets</p>)}
                      </div>
                    );
                  })()}
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
            setAuthToken(token);
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





// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   ExternalLink,
//   Ticket,
//   Clock,
//   CheckCircle,
//   Search,
//   Filter,
//   AlertCircle,
//   ArrowRight,
//   LogIn,
// } from "lucide-react";
// import SignInModal from "@/components/user/SignInModal";

// /* EventCard extracted for readability */
// const EventCard = ({ event, getEventStatus, onCardClick, dimmed = false }) => {
//   const eventStatus = getEventStatus(event);
//   const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);
//   const StatusIcon = eventStatus.icon;

//   return (
//     <Card
//       className={
//         "group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-black text-gray-900 dark:text-gray-100 dark:border-gray-700 shadow-inner rounded-none h-full flex flex-col hover:-translate-y-2  " +
//         (dimmed ? "opacity-60 filter grayscale" : "")
//       }
//       onClick={() => onCardClick(event)}
//     >
//       <div className="relative overflow-hidden">
//         <img
//           src={event.eventImgUrl}
//           alt={event.eventName}
//           className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute top-3 right-3">
//           <Badge variant={eventStatus.variant} className="shadow-lg">
//             <StatusIcon className="w-3 h-3 mr-1" />
//             {eventStatus.label}
//           </Badge>
//         </div>
//         {event.eventType && (
//           <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 shadow-lg dark:text-gray-900">
//             {event.eventType}
//           </Badge>
//         )}
//       </div>

//       <CardHeader className="pb-1">
//         <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-gray-100 line-clamp-2">
//           {event.eventName}
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-2 pb-0 flex-grow">
//         <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//           <Calendar className="w-4 h-4 mr-2 text-blue-500" />
//           <span>
//             {new Date(event.startDate).toLocaleDateString()}
//             {" — "}
//             {new Date(event.endDate).toLocaleDateString()}
//           </span>
//         </div>

//         {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
//           <div className="flex items-center text-sm text-blue-600 dark:text-gray-100">
//             <ExternalLink className="w-4 h-4 mr-2" />
//             <span className="truncate">Zoom Meeting</span>
//           </div>
//         ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span className="truncate">{event.stadiumId.location.address}</span>
//           </div>
//         ) : event.cityId?.name ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span>{event.cityId.name}{event.stateId ? `, ${event.stateId?.Name || event.stateId?.name}` : ""}</span>
//           </div>
//         ) : null}

//         {/* <div className="flex items-center justify-between">
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <Users className="w-4 h-4 mr-2 text-purple-500" />
//             <span>{availableSeats} seats</span>
//           </div>

//           {(() => {
//             if (event.eventCategory === "Indoor" && event.zonePrices?.length > 0) {
//               const validPrices = event.zonePrices.filter(p => p > 0);
//               if (validPrices.length === 0) {
//                 return <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>;
//               }
//               const minPrice = Math.min(...validPrices);
//               const maxPrice = Math.max(...validPrices);
//               return (
//                 <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//                   {minPrice === maxPrice 
//                     ? `₹${minPrice.toLocaleString()}`
//                     : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
//                   }
//                 </div>
//               );
//             } else if (event.ticketRate) {
//               return (
//                 <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//                   ₹{event.ticketRate.toLocaleString()}
//                 </div>
//               );
//             } else {
//               return <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>;
//             }
//           })()}
//         </div> */}
//       </CardContent>

//       <CardFooter className="pt-4 border-t border-slate-100 dark:border-gray-800">
//         <div className="w-full text-center">
//           {eventStatus.status === "ended" ? (
//             <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
//               <CheckCircle className="w-4 h-4 mr-2" />
//               Event Completed
//             </Badge>
//           ) : eventStatus.status === "soldout" ? (
//             <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
//               <AlertCircle className="w-4 h-4 mr-2" />
//               Sold Out
//             </Badge>
//           ) : (
//             <Button
//               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onCardClick(event);
//               }}
//             >
//               <Ticket className="w-4 h-4 mr-2" />
//               View Details
//             </Button>
//           )}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState("");
//   const [filterCity, setFilterCity] = useState("");
//   const [filterEventType, setFilterEventType] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [showSignInModal, setShowSignInModal] = useState(false);
//   const [pendingPayment, setPendingPayment] = useState(null);
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);

//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [showVerifyModal, setShowVerifyModal] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadRazorpay = () => {
//       if (window.Razorpay) {
//         setRazorpayLoaded(true);
//         return;
//       }
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.async = true;
//       script.onload = () => setRazorpayLoaded(true);
//       script.onerror = () => setError("Payment system unavailable. Please refresh the page.");
//       document.body.appendChild(script);
//     };
//     loadRazorpay();
//   }, []);

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("token");
//       const verified = localStorage.getItem("isVerified") === "true";
//       setIsAuthenticated(!!token);
//       setIsVerified(verified);
//     };

//     checkAuth();
//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   useEffect(() => {
//     if (bookingInfo) {
//       const timer = setTimeout(() => setBookingInfo(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [bookingInfo]);

//   const getAllEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data || []);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     setIsDrawerOpen(true);
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("userId");
//       if (!token) throw new Error("Authentication required");

//       await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//           paymentId: booking.paymentId,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert("Booking successful! 🎉");
//       navigate(`/mytickets/${userId}`);
//       getAllEvents();
//       setIsDrawerOpen(false);
//     } catch (err) {
//       console.error("Booking error:", err);
//       alert("Booking failed: " + (err.response?.data?.message || err.message || "Unknown error"));
//     }
//   };

//   const handlePayment = (eventDetails, quantity) => {
//     if (!razorpayLoaded || !window.Razorpay) {
//       alert("Payment system is still loading. Please wait a moment and try again.");
//       return;
//     }

//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: quantity * (eventDetails.ticketRate || 0) * 100,
//       currency: "INR",
//       name: "EventEase",
//       description: `Booking for ${eventDetails.eventName}`,
//       handler: async function (response) {
//         try {
//           const booking = {
//             eventId: eventDetails._id,
//             organizerId: eventDetails.organizerId,
//             quantity: quantity,
//             selectedSeats: [],
//             stateId: eventDetails.stateId?._id || eventDetails.stateId,
//             cityId: eventDetails.cityId?._id || eventDetails.cityId,
//             paymentId: response.razorpay_payment_id,
//           };
//           await bookEventWithoutSeats(booking);
//         } catch (error) {
//           console.error("Booking failed:", error);
//           alert("Payment successful but booking failed. Please contact support.");
//         }
//       },
//       prefill: {
//         name: localStorage.getItem("name") || "Guest User",
//         email: localStorage.getItem("email") || "",
//         contact: localStorage.getItem("phone") || "",
//       },
//       theme: {
//         color: "#3B82F6",
//       },
//     };

//     try {
//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();
//     } catch (error) {
//       console.error("Error opening Razorpay:", error);
//       alert("Failed to open payment gateway. Please try again.");
//     }
//   };

//   const handleBookingClick = (event, quantity) => {
//     console.log("Booking clicked. Is authenticated:", isAuthenticated);

//     if (!isAuthenticated) {
//       setPendingPayment({
//         eventId: event._id,
//         amount: quantity * (event.ticketRate || 0),
//         quantity,
//         booking: {
//           eventId: event._id,
//           organizerId: event.organizerId,
//           quantity,
//           selectedSeats: [],
//           stateId: event.stateId?._id || event.stateId,
//           cityId: event.cityId?._id || event.cityId,
//         },
//       });
//       setShowSignInModal(true);
//       return;
//     }

//     const verified = localStorage.getItem("isVerified") === "true";
//     if (!verified) {
//       setPendingPayment({
//         eventId: event._id,
//         amount: quantity * (event.ticketRate || 0),
//         quantity,
//         booking: {
//           eventId: event._id,
//           organizerId: event.organizerId,
//           quantity,
//           selectedSeats: [],
//           stateId: event.stateId?._id || event.stateId,
//           cityId: event.cityId?._id || event.cityId,
//         },
//       });
//       setShowVerifyModal(true);
//       return;
//     }

//     handlePayment(event, quantity);
//   };

//   const handleSeatSelectionClick = (event) => {
//     console.log("Seat selection clicked. Is authenticated:", isAuthenticated);

//     if (!isAuthenticated) {
//       setPendingPayment({
//         eventId: event._id,
//         redirectToSeatSelection: true,
//       });
//       setShowSignInModal(true);
//       return;
//     }

//     const verified = localStorage.getItem("isVerified") === "true";
//     if (!verified) {
//       setPendingPayment({
//         eventId: event._id,
//         redirectToSeatSelection: true,
//       });
//       setShowVerifyModal(true);
//       return;
//     }

//     navigate(`/select-seats/${event._id}`);
//   };

//   const getEventStatus = (event) => {
//     const now = new Date();
//     const startDate = new Date(event.startDate);
//     const endDate = new Date(event.endDate);
//     const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

//     if (endDate < now) {
//       return { status: "ended", label: "Event Ended", variant: "destructive", icon: Clock };
//     }
//     if (availableSeats <= 0) {
//       return { status: "soldout", label: "Sold Out", variant: "destructive", icon: AlertCircle };
//     }
//     if (startDate <= now && endDate >= now) {
//       return { status: "ongoing", label: "Ongoing", variant: "default", icon: CheckCircle };
//     }
//     return { status: "upcoming", label: "Available", variant: "outline", icon: Ticket };
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   const sortedEvents = filteredEvents.sort((a, b) => {
//     const now = new Date();
//     const aEnded = new Date(a.endDate) < now;
//     const bEnded = new Date(b.endDate) < now;

//     if (aEnded === bEnded) {
//       return new Date(a.startDate) - new Date(b.startDate);
//     }
//     return aEnded ? 1 : -1;
//   });

//   const endedEvents = sortedEvents.filter((e) => getEventStatus(e).status === "ended");
//   const activeEvents = sortedEvents.filter((e) => getEventStatus(e).status !== "ended");

//   const LoadingSkeleton = () => (
//     <div className="space-y-12">
//       {[1, 2].map((section) => (
//         <div key={section}>
//           <Skeleton className="h-8 w-48 mb-6" />
//           <div className="flex space-x-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="w-80">
//                 <Skeleton className="h-48 w-full rounded-t-lg" />
//                 <CardHeader>
//                   <Skeleton className="h-6 w-3/4 mb-2" />
//                   <Skeleton className="h-4 w-full mb-1" />
//                 </CardHeader>
//                 <CardContent>
//                   <Skeleton className="h-4 w-full mb-2" />
//                   <Skeleton className="h-4 w-2/3 mb-2" />
//                 </CardContent>
//                 <CardFooter>
//                   <Skeleton className="h-10 w-full" />
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <>
//       <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
//         <div className="w-full py-16 px-4 md:px-8 space-y-8">
//           <div className="text-center mb-10">
//             <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
//               Discover Amazing Events
//             </h1>
//             <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
//               Find and book your next unforgettable experience. Click any event card for details.
//             </p>
//           </div>

//           {/* Filters */}
//           <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8 dark:bg-gray-800">
//             <div className="flex items-center gap-2 mb-4">
//               <Filter className="w-5 h-5 text-blue-600" />
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Filter Events</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by Event Name"
//                   value={filterName}
//                   onChange={(e) => setFilterName(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by City"
//                   value={filterCity}
//                   onChange={(e) => setFilterCity(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <Select value={filterEventType} onValueChange={setFilterEventType}>
//                 <SelectTrigger className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:text-gray-100 dark:bg-gray-700">
//                   <SelectValue placeholder="All Event Types" />
//                 </SelectTrigger>
//                 <SelectContent className="dark:bg-gray-800">
//                   <SelectItem value="all">All Event Types</SelectItem>
//                   <SelectItem value="Conference">Conference</SelectItem>
//                   <SelectItem value="Exhibition">Exhibition</SelectItem>
//                   <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
//                   <SelectItem value="Incentive">Incentive</SelectItem>
//                   <SelectItem value="Music concert">Music Concert</SelectItem>
//                   <SelectItem value="Meeting">Meeting</SelectItem>
//                   <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//                   <SelectItem value="Other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Alerts */}
//           <div className="w-full max-w-7xl mx-auto">
//             {error && (
//               <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/50 dark:border-red-700">
//                 <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
//               </Alert>
//             )}
//             {bookingInfo && (
//               <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/50 dark:border-green-700">
//                 <AlertDescription className="text-green-800 dark:text-green-200">{bookingInfo}</AlertDescription>
//               </Alert>
//             )}
//           </div>

//           {/* Main content */}
//           <div className="w-full px-4 md:px-8">
//             {loading ? (
//               <LoadingSkeleton />
//             ) : activeEvents.length === 0 && endedEvents.length === 0 ? (
//               <div className="w-full max-w-7xl mx-auto text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg dark:bg-gray-800">
//                 <Calendar className="mx-auto w-12 h-12 text-blue-500 mb-4" />
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-gray-100">No events found</h3>
//                 <p className="text-slate-600 dark:text-slate-300 mt-2">Try adjusting filters to find events.</p>
//               </div>
//             ) : (
//               <>
//                 {/* Active events carousel */}
//                 <section className="mb-12">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Events</h2>
//                     <Button variant="link" className="text-blue-600 dark:text-blue-400">
//                       See All <ArrowRight className="w-4 h-4 ml-1" />
//                     </Button>
//                   </div>

//                   <Carousel opts={{ align: "start", loop: activeEvents.length > 4 }} className="w-full">
//                     <CarouselContent className="-ml-4">
//                       {activeEvents.map((event) => (
//                         <CarouselItem key={event._id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
//                           <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} />
//                         </CarouselItem>
//                       ))}
//                     </CarouselContent>
//                     <CarouselPrevious className="hidden md:flex" />
//                     <CarouselNext className="hidden md:flex" />
//                   </Carousel>
//                 </section>

//                 {/* Ended events */}
//                 {endedEvents.length > 0 && (
//                   <section className="mt-12">
//                     <div className="flex items-center justify-between mb-4">
//                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ended Events</h2>
//                       <div className="text-sm text-slate-600 dark:text-slate-400">{endedEvents.length} items</div>
//                     </div>

//                     <Carousel opts={{ align: "start", loop: endedEvents.length > 4 }} className="w-full">
//                       <CarouselContent className="-ml-4">
//                         {endedEvents.map((event) => (
//                           <CarouselItem key={event._id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
//                             <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} dimmed />
//                           </CarouselItem>
//                         ))}
//                       </CarouselContent>
//                       <CarouselPrevious className="hidden md:flex" />
//                       <CarouselNext className="hidden md:flex" />
//                     </Carousel>
//                   </section>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* Side Drawer - NEW DESIGN */}
//         {selectedEvent && isDrawerOpen && (
//           <div className="fixed inset-0 z-50 flex">
//             {/* Backdrop */}
//             <div 
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
//               onClick={() => setIsDrawerOpen(false)}
//             />
            
//             {/* Drawer Panel */}
//             <div className={`relative ml-auto w-full max-w-lg h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//               <div className="h-full flex flex-col overflow-hidden">
//                 {/* Hero Image Section */}
//                 <div className="relative h-64 flex-shrink-0">
//                   <img 
//                     src={selectedEvent.eventImgUrl} 
//                     alt={selectedEvent.eventName} 
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
//                   {/* Close Button */}
//                   <button
//                     onClick={() => setIsDrawerOpen(false)}
//                     className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white dark:bg-black dark:hover:bg-gray-500 shadow-lg transition-all"
//                   >
//                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>

//                   {/* Event Status Badge */}
//                   <div className="absolute top-4 left-4">
//                     <Badge variant={getEventStatus(selectedEvent).variant} className="shadow-lg text-sm px-3 py-1">
//                       {React.createElement(getEventStatus(selectedEvent).icon, { className: "w-4 h-4 mr-1 inline" })}
//                       {getEventStatus(selectedEvent).label}
//                     </Badge>
//                   </div>

//                   {/* Title Overlay */}
//                   <div className="absolute bottom-0 left-0 right-0 p-6">
//                     <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
//                       {selectedEvent.eventName}
//                     </h2>
//                     {selectedEvent.eventType && (
//                       <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
//                         {selectedEvent.eventType}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>

//                 {/* Scrollable Content */}
//                 <div className="flex-1 overflow-y-auto">
//                   <div className="p-6 space-y-6 dark:bg-black">
//                     {/* Quick Info Cards */}
//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="bg-blue-50 dark:bg-blue-50 rounded-lg p-4 border border-blue-100 dark:border-blue-100">
//                         <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
//                           <Calendar className="w-4 h-4" />
//                           <span className="text-xs font-medium">Date</span>
//                         </div>
//                         <p className="text-sm font-semibold text-gray-900 dark:text-gray-900">
//                           {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                         </p>
//                       </div>

//                       <div className="bg-purple-50 dark:bg-purple-50 rounded-lg p-4 border border-purple-100 dark:border-purple-100">
//                         <div className="flex items-center gap-2 text-purple-600 dark:text-purple-600 mb-1">
//                           <Users className="w-4 h-4" />
//                           <span className="text-xs font-medium">Available</span>
//                         </div>
//                         <p className="text-sm font-semibold text-gray-900 dark:text-gray-900">
//                           {(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} seats
//                         </p>
//                       </div>
//                     </div>

//                     {/* Price Section */}
//                     <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:bg-gray-900 rounded-lg p-4 border border-orange-100 dark:border-orange-100">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2 text-orange-600 dark:text-orange-600">
//                           <Ticket className="w-5 h-5" />
//                           <span className="text-sm font-medium">Ticket Price</span>
//                         </div>
//                         <div className="text-right">
//                           {(() => {
//                             if (selectedEvent.eventCategory === "Indoor" && selectedEvent.zonePrices?.length > 0) {
//                               const valid = selectedEvent.zonePrices.filter(p => p > 0);
//                               if (valid.length === 0) return <span className="text-lg font-bold text-green-600">FREE</span>;
//                               const minPrice = Math.min(...valid);
//                               const maxPrice = Math.max(...valid);
//                               return <span className="text-lg font-bold text-gray-900 dark:text-gray-900">{minPrice === maxPrice ? `₹${minPrice.toLocaleString()}` : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`}</span>;
//                             }
//                             if (selectedEvent.ticketRate) {
//                               return <span className="text-lg font-bold text-gray-900 dark:text-gray-900">₹{selectedEvent.ticketRate.toLocaleString()}</span>;
//                             }
//                             return <span className="text-lg font-bold text-green-600">FREE</span>;
//                           })()}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Event Details */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Event Details</h3>
                      
//                       <div className="space-y-3">
//                         <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                           <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Event Duration</p>
//                             <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                               {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
//                               <br />
//                               <span className="text-gray-500">to</span>
//                               <br />
//                               {new Date(selectedEvent.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
//                             </p>
//                           </div>
//                         </div>

//                         {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
//                           <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                             <ExternalLink className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
//                             <div className="flex-1">
//                               <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Online Meeting</p>
//                               <a href={selectedEvent.zoomUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 underline">
//                                 Join Zoom Meeting →
//                               </a>
//                             </div>
//                           </div>
//                         ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.stadiumId?.location?.address ? (
//                           <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                             <MapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Venue Location</p>
//                               <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                                 {selectedEvent.stadiumId.location.address}
//                               </p>
//                             </div>
//                           </div>
//                         ) : selectedEvent.cityId?.name ? (
//                           <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                             <MapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
//                               <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                                 {selectedEvent.cityId.name}{selectedEvent.stateId ? `, ${selectedEvent.stateId?.Name || selectedEvent.stateId?.name}` : ""}
//                               </p>
//                             </div>
//                           </div>
//                         ) : null}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Fixed Bottom Action Section */}
//                 <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-300 dark:bg-black p-4 space-y-3">
//                   {(() => {
//                     const eventStatus = getEventStatus(selectedEvent);
//                     const availableSeats = (selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0);

//                     if (eventStatus.status === "ended") {
//                       return (
//                         <div className="text-center py-5">
//                           <Badge variant="secondary" className="text-base px-8 py-3">
//                             <CheckCircle className="w-5 h-5 mr-2" />
//                             Event Completed
//                           </Badge>
//                         </div>
//                       );
//                     } else if (eventStatus.status === "soldout") {
//                       return (
//                         <div className="text-center py-4">
//                           <Badge variant="destructive" className="text-base px-8 py-3">
//                             <AlertCircle className="w-5 h-5 mr-2" />
//                             Sold Out
//                           </Badge>
//                         </div>
//                       );
//                     } else if (selectedEvent.eventCategory === "Indoor") {
//                       return (
//                         <Button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleSeatSelectionClick(selectedEvent);
//                           }}
//                           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg py-6 text-base font-semibold"
//                         >
//                           {!isAuthenticated && <LogIn className="w-5 h-5 mr-2" />}
//                           <Ticket className="w-5 h-5 mr-2" />
//                           {isAuthenticated ? "Select Your Seats" : "Sign in to Select Seats"}
//                         </Button>
//                       );
//                     } else {
//                       return (
//                         <div className="space-y-2 ">
//                           <Select value={String(ticketQuantities[selectedEvent._id] || 1)} onValueChange={(value) =>
//                             setTicketQuantities({
//                               ...ticketQuantities,
//                               [selectedEvent._id]: parseInt(value),
//                             })
//                           }>
//                             <SelectTrigger className="w-full py-6 text-base bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-700">
//                               <SelectValue placeholder="Select quantity" />
//                             </SelectTrigger>
//                             <SelectContent className="dark:bg-gray-800">
//                               {Array.from({ length: Math.min(10, Math.max(1, availableSeats)) }, (_, i) => (
//                                 <SelectItem key={i + 1} value={String(i + 1)} className="py-3">
//                                   {i + 1} Ticket{i > 0 ? 's' : ''} - ₹{((i + 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>

//                           <Button
//                             disabled={!razorpayLoaded && isAuthenticated}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleBookingClick(selectedEvent, ticketQuantities[selectedEvent._id] || 1);
//                             }}
//                             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-items-center py-6 text-base font-semibold  shadow-lg"
//                           >
//                             {!isAuthenticated ? (
//                               <>
//                                 <LogIn className="w-5 h-5 mr-2" />
//                                 Sign in to Book Tickets
//                               </>
//                             ) : !razorpayLoaded ? (
//                               "Loading Payment System..."
//                             ) : (
//                               <>
//                                 <Ticket className="w-5 h-5 mr-2" />
//                                 Pay ₹{((ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
//                               </>
//                             )}
//                           </Button>

//                           {isAuthenticated && !isVerified && (
//                             <p className="text-sm text-red-500 text-center">
//                               ⚠️ Please verify your email to book tickets
//                             </p>
//                           )}
//                         </div>
//                       );
//                     }
//                   })()}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Sign In Modal */}
//       {showSignInModal && (
//         <SignInModal
//           open={showSignInModal}
//           pendingPayment={pendingPayment}
//           onClose={() => {
//             setShowSignInModal(false);
//             setPendingPayment(null);
//           }}
//           onLoginSuccess={(token, userData) => {
//             localStorage.setItem("token", token);
//             localStorage.setItem("userId", userData._id);
//             localStorage.setItem("role", userData.roleId?.name || "User");
//             localStorage.setItem("isVerified", userData.isVerified ? "true" : "false");
//             axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//             setIsAuthenticated(true);
//             setIsVerified(userData.isVerified === true);

//             if (pendingPayment?.redirectToSeatSelection) {
//               navigate(`/select-seats/${pendingPayment.eventId}`);
//               setShowSignInModal(false);
//               setPendingPayment(null);
//               setIsDrawerOpen(false);
//               return;
//             }

//             if (pendingPayment && (localStorage.getItem("isVerified") === "true") && razorpayLoaded && window.Razorpay) {
//               const options = {
//                 key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//                 amount: pendingPayment.amount * 100,
//                 currency: "INR",
//                 name: "EventEase",
//                 description: `Booking for ${selectedEvent?.eventName || ""}`,
//                 handler: async function (response) {
//                   try {
//                     await bookEventWithoutSeats({
//                       ...pendingPayment.booking,
//                       paymentId: response.razorpay_payment_id
//                     });
//                     setPendingPayment(null);
//                   } catch (error) {
//                     console.error("Booking failed:", error);
//                     alert("Payment successful but booking failed. Please contact support.");
//                   }
//                 },
//                 prefill: {
//                   name: userData.fullName || userData.name || "Guest User",
//                   email: userData.email || "",
//                   contact: userData.phone || ""
//                 },
//                 theme: { color: "#3B82F6" }
//               };

//               try {
//                 const paymentObject = new window.Razorpay(options);
//                 paymentObject.open();
//               } catch (err) {
//                 console.error("Error opening Razorpay after login:", err);
//                 alert("Failed to open payment gateway. Please try again.");
//               }
//             }

//             setShowSignInModal(false);
//           }}
//         />
//       )}

//       {/* Verify Email Modal */}
//       {showVerifyModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg text-center">
//             <h3 className="text-lg font-semibold mb-2 text-red-600">Email Not Verified</h3>
//             <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
//               Please verify your email before booking tickets. Check your inbox for the verification link.
//             </p>

//             <div className="flex gap-2 justify-center">
//               <Button onClick={() => setShowVerifyModal(false)} className="px-4">OK</Button>

//               <Button
//                 variant="outline"
//                 onClick={async () => {
//                   try {
//                     const token = localStorage.getItem("token");
//                     if (!token) {
//                       setShowSignInModal(true);
//                       setShowVerifyModal(false);
//                       return;
//                     }
//                     await axios.post("/user/resend-verification", {}, {
//                       headers: { Authorization: `Bearer ${token}` }
//                     });
//                     alert("Verification email resent. Check your inbox.");
//                   } catch (err) {
//                     console.error("Resend verification failed:", err);
//                     alert(err.response?.data?.message || "Failed to resend verification email.");
//                   } finally {
//                     setShowVerifyModal(false);
//                   }
//                 }}
//               >
//                 Resend Email
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ViewEvents;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   ExternalLink,
//   Ticket,
//   Clock,
//   CheckCircle,
//   Search,
//   Filter,
//   AlertCircle,
//   ArrowRight,
//   LogIn,
// } from "lucide-react";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
//   DrawerFooter,
// } from "@/components/ui/drawer";
// import SignInModal from "@/components/user/SignInModal";

// /* EventCard extracted for readability */
// const EventCard = ({ event, getEventStatus, onCardClick, dimmed = false }) => {
//   const eventStatus = getEventStatus(event);
//   const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);
//   const StatusIcon = eventStatus.icon;

//   return (
//     <Card
//       className={
//         "group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-inner h-full flex flex-col " +
//         (dimmed ? "opacity-60 filter grayscale" : "")
//       }
//       onClick={() => onCardClick(event)}
//     >
//       <div className="relative overflow-hidden">
//         <img
//           src={event.eventImgUrl}
//           alt={event.eventName}
//           className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute top-3 right-3">
//           <Badge variant={eventStatus.variant} className="shadow-lg">
//             <StatusIcon className="w-3 h-3 mr-1" />
//             {eventStatus.label}
//           </Badge>
//         </div>
//         {event.eventType && (
//           <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 shadow-lg dark:text-gray-900">
//             {event.eventType}
//           </Badge>
//         )}
//       </div>

//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-gray-100 line-clamp-2">
//           {event.eventName}
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-2 pb-4 flex-grow">
//         <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//           <Calendar className="w-4 h-4 mr-2 text-blue-500" />
//           <span>
//             {new Date(event.startDate).toLocaleDateString()}
//             {" — "}
//             {new Date(event.endDate).toLocaleDateString()}
//           </span>
//         </div>

//         {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
//           <div className="flex items-center text-sm text-blue-600 dark:text-gray-100">
//             <ExternalLink className="w-4 h-4 mr-2" />
//             <span className="truncate">Zoom Meeting</span>
//           </div>
//         ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span className="truncate">{event.stadiumId.location.address}</span>
//           </div>
//         ) : event.cityId?.name ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span>{event.cityId.name}{event.stateId ? `, ${event.stateId?.Name || event.stateId?.name}` : ""}</span>
//           </div>
//         ) : null}

//         <div className="flex items-center justify-between">
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <Users className="w-4 h-4 mr-2 text-purple-500" />
//             <span>{availableSeats} seats</span>
//           </div>

//           {(() => {
//             if (event.eventCategory === "Indoor" && event.zonePrices?.length > 0) {
//               const validPrices = event.zonePrices.filter(p => p > 0);
//               if (validPrices.length === 0) {
//                 return <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>;
//               }
//               const minPrice = Math.min(...validPrices);
//               const maxPrice = Math.max(...validPrices);
//               return (
//                 <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//                   {minPrice === maxPrice 
//                     ? `₹${minPrice.toLocaleString()}`
//                     : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
//                   }
//                 </div>
//               );
//             } else if (event.ticketRate) {
//               return (
//                 <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//                   ₹{event.ticketRate.toLocaleString()}
//                 </div>
//               );
//             } else {
//               return <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>;
//             }
//           })()}
//         </div>
//       </CardContent>

//       <CardFooter className="pt-4 border-t border-slate-100 dark:border-gray-800">
//         <div className="w-full text-center">
//           {eventStatus.status === "ended" ? (
//             <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
//               <CheckCircle className="w-4 h-4 mr-2" />
//               Event Completed
//             </Badge>
//           ) : eventStatus.status === "soldout" ? (
//             <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
//               <AlertCircle className="w-4 h-4 mr-2" />
//               Sold Out
//             </Badge>
//           ) : (
//             <Button
//               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onCardClick(event);
//               }}
//             >
//               <Ticket className="w-4 h-4 mr-2" />
//               View Details
//             </Button>
//           )}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState("");
//   const [filterCity, setFilterCity] = useState("");
//   const [filterEventType, setFilterEventType] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [showSignInModal, setShowSignInModal] = useState(false);
//   const [pendingPayment, setPendingPayment] = useState(null);
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);

//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [showVerifyModal, setShowVerifyModal] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     // load razorpay
//     const loadRazorpay = () => {
//       if (window.Razorpay) {
//         setRazorpayLoaded(true);
//         return;
//       }
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.async = true;
//       script.onload = () => setRazorpayLoaded(true);
//       script.onerror = () => setError("Payment system unavailable. Please refresh the page.");
//       document.body.appendChild(script);
//     };
//     loadRazorpay();
//   }, []);

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("token");
//       const verified = localStorage.getItem("isVerified") === "true";
//       setIsAuthenticated(!!token);
//       setIsVerified(verified);
//     };

//     checkAuth();
//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   useEffect(() => {
//     if (bookingInfo) {
//       const timer = setTimeout(() => setBookingInfo(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [bookingInfo]);

//   const getAllEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data || []);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     setIsDrawerOpen(true);
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("userId");
//       if (!token) throw new Error("Authentication required");

//       await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//           paymentId: booking.paymentId,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert("Booking successful! 🎉");
//       navigate(`/mytickets/${userId}`);
//       getAllEvents();
//       setIsDrawerOpen(false);
//     } catch (err) {
//       console.error("Booking error:", err);
//       alert("Booking failed: " + (err.response?.data?.message || err.message || "Unknown error"));
//     }
//   };

//   const handlePayment = (eventDetails, quantity) => {
//     if (!razorpayLoaded || !window.Razorpay) {
//       alert("Payment system is still loading. Please wait a moment and try again.");
//       return;
//     }

//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: quantity * (eventDetails.ticketRate || 0) * 100,
//       currency: "INR",
//       name: "EventEase",
//       description: `Booking for ${eventDetails.eventName}`,
//       handler: async function (response) {
//         try {
//           const booking = {
//             eventId: eventDetails._id,
//             organizerId: eventDetails.organizerId,
//             quantity: quantity,
//             selectedSeats: [],
//             stateId: eventDetails.stateId?._id || eventDetails.stateId,
//             cityId: eventDetails.cityId?._id || eventDetails.cityId,
//             paymentId: response.razorpay_payment_id,
//           };
//           await bookEventWithoutSeats(booking);
//         } catch (error) {
//           console.error("Booking failed:", error);
//           alert("Payment successful but booking failed. Please contact support.");
//         }
//       },
//       prefill: {
//         name: localStorage.getItem("name") || "Guest User",
//         email: localStorage.getItem("email") || "",
//         contact: localStorage.getItem("phone") || "",
//       },
//       theme: {
//         color: "#3B82F6",
//       },
//     };

//     try {
//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();
//     } catch (error) {
//       console.error("Error opening Razorpay:", error);
//       alert("Failed to open payment gateway. Please try again.");
//     }
//   };

//   /* ---------- UPDATED: handleBookingClick ---------- */
//   const handleBookingClick = (event, quantity) => {
//     console.log("Booking clicked. Is authenticated:", isAuthenticated);

//     if (!isAuthenticated) {
//       // Save pending payment and require login
//       setPendingPayment({
//         eventId: event._id,
//         amount: quantity * (event.ticketRate || 0),
//         quantity,
//         booking: {
//           eventId: event._id,
//           organizerId: event.organizerId,
//           quantity,
//           selectedSeats: [],
//           stateId: event.stateId?._id || event.stateId,
//           cityId: event.cityId?._id || event.cityId,
//         },
//       });
//       setShowSignInModal(true);
//       return;
//     }

//     // Authenticated -> check verification
//     const verified = localStorage.getItem("isVerified") === "true";
//     if (!verified) {
//       setPendingPayment({
//         eventId: event._id,
//         amount: quantity * (event.ticketRate || 0),
//         quantity,
//         booking: {
//           eventId: event._id,
//           organizerId: event.organizerId,
//           quantity,
//           selectedSeats: [],
//           stateId: event.stateId?._id || event.stateId,
//           cityId: event.cityId?._id || event.cityId,
//         },
//       });
//       setShowVerifyModal(true);
//       return;
//     }

//     // Authenticated & verified: proceed to payment
//     handlePayment(event, quantity);
//   };

//   /* ---------- UPDATED: handleSeatSelectionClick ---------- */
//   const handleSeatSelectionClick = (event) => {
//     console.log("Seat selection clicked. Is authenticated:", isAuthenticated);

//     if (!isAuthenticated) {
//       setPendingPayment({
//         eventId: event._id,
//         redirectToSeatSelection: true,
//       });
//       setShowSignInModal(true);
//       return;
//     }

//     const verified = localStorage.getItem("isVerified") === "true";
//     if (!verified) {
//       setPendingPayment({
//         eventId: event._id,
//         redirectToSeatSelection: true,
//       });
//       setShowVerifyModal(true);
//       return;
//     }

//     navigate(`/select-seats/${event._id}`);
//   };

//   const getEventStatus = (event) => {
//     const now = new Date();
//     const startDate = new Date(event.startDate);
//     const endDate = new Date(event.endDate);
//     const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

//     if (endDate < now) {
//       return { status: "ended", label: "Event Ended", variant: "destructive", icon: Clock };
//     }
//     if (availableSeats <= 0) {
//       return { status: "soldout", label: "Sold Out", variant: "destructive", icon: AlertCircle };
//     }
//     if (startDate <= now && endDate >= now) {
//       return { status: "ongoing", label: "Ongoing", variant: "default", icon: CheckCircle };
//     }
//     return { status: "upcoming", label: "Available", variant: "outline", icon: Ticket };
//   };

//   /* Filter/sort logic (unchanged) */
//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   const sortedEvents = filteredEvents.sort((a, b) => {
//     const now = new Date();
//     const aEnded = new Date(a.endDate) < now;
//     const bEnded = new Date(b.endDate) < now;

//     if (aEnded === bEnded) {
//       return new Date(a.startDate) - new Date(b.startDate);
//     }
//     return aEnded ? 1 : -1;
//   });

//   const endedEvents = sortedEvents.filter((e) => getEventStatus(e).status === "ended");
//   const activeEvents = sortedEvents.filter((e) => getEventStatus(e).status !== "ended");

//   const LoadingSkeleton = () => (
//     <div className="space-y-12">
//       {[1, 2].map((section) => (
//         <div key={section}>
//           <Skeleton className="h-8 w-48 mb-6" />
//           <div className="flex space-x-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="w-80">
//                 <Skeleton className="h-48 w-full rounded-t-lg" />
//                 <CardHeader>
//                   <Skeleton className="h-6 w-3/4 mb-2" />
//                   <Skeleton className="h-4 w-full mb-1" />
//                 </CardHeader>
//                 <CardContent>
//                   <Skeleton className="h-4 w-full mb-2" />
//                   <Skeleton className="h-4 w-2/3 mb-2" />
//                 </CardContent>
//                 <CardFooter>
//                   <Skeleton className="h-10 w-full" />
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <>
//       <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
//         <div className="w-full py-16 px-4 md:px-8 space-y-8">
//           <div className="text-center mb-10">
//             <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
//               Discover Amazing Events
//             </h1>
//             <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
//               Find and book your next unforgettable experience. Click any event card for details.
//             </p>
//           </div>

//           {/* Filters */}
//           <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8 dark:bg-gray-800">
//             <div className="flex items-center gap-2 mb-4">
//               <Filter className="w-5 h-5 text-blue-600" />
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Filter Events</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by Event Name"
//                   value={filterName}
//                   onChange={(e) => setFilterName(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by City"
//                   value={filterCity}
//                   onChange={(e) => setFilterCity(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <Select value={filterEventType} onValueChange={setFilterEventType}>
//                 <SelectTrigger className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:text-gray-100 dark:bg-gray-700">
//                   <SelectValue placeholder="All Event Types" />
//                 </SelectTrigger>
//                 <SelectContent className="dark:bg-gray-800">
//                   <SelectItem value="all">All Event Types</SelectItem>
//                   <SelectItem value="Conference">Conference</SelectItem>
//                   <SelectItem value="Exhibition">Exhibition</SelectItem>
//                   <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
//                   <SelectItem value="Incentive">Incentive</SelectItem>
//                   <SelectItem value="Music concert">Music Concert</SelectItem>
//                   <SelectItem value="Meeting">Meeting</SelectItem>
//                   <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//                   <SelectItem value="Other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Alerts */}
//           <div className="w-full max-w-7xl mx-auto">
//             {error && (
//               <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/50 dark:border-red-700">
//                 <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
//               </Alert>
//             )}
//             {bookingInfo && (
//               <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/50 dark:border-green-700">
//                 <AlertDescription className="text-green-800 dark:text-green-200">{bookingInfo}</AlertDescription>
//               </Alert>
//             )}
//           </div>

//           {/* Main content */}
//           <div className="w-full px-4 md:px-8">
//             {loading ? (
//               <LoadingSkeleton />
//             ) : activeEvents.length === 0 && endedEvents.length === 0 ? (
//               <div className="w-full max-w-7xl mx-auto text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg dark:bg-gray-800">
//                 <Calendar className="mx-auto w-12 h-12 text-blue-500 mb-4" />
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-gray-100">No events found</h3>
//                 <p className="text-slate-600 dark:text-slate-300 mt-2">Try adjusting filters to find events.</p>
//               </div>
//             ) : (
//               <>
//                 {/* Active events carousel */}
//                 <section className="mb-12">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Events</h2>
//                     <Button variant="link" className="text-blue-600 dark:text-blue-400">
//                       See All <ArrowRight className="w-4 h-4 ml-1" />
//                     </Button>
//                   </div>

//                   <Carousel opts={{ align: "start", loop: activeEvents.length > 4 }} className="w-full">
//                     <CarouselContent className="-ml-4">
//                       {activeEvents.map((event) => (
//                         <CarouselItem key={event._id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
//                           <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} />
//                         </CarouselItem>
//                       ))}
//                     </CarouselContent>
//                     <CarouselPrevious className="hidden md:flex" />
//                     <CarouselNext className="hidden md:flex" />
//                   </Carousel>
//                 </section>

//                 {/* Ended events */}
//                 {endedEvents.length > 0 && (
//                   <section className="mt-12">
//                     <div className="flex items-center justify-between mb-4">
//                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ended Events</h2>
//                       <div className="text-sm text-slate-600 dark:text-slate-400">{endedEvents.length} items</div>
//                     </div>

//                     <Carousel opts={{ align: "start", loop: endedEvents.length > 4 }} className="w-full">
//                       <CarouselContent className="-ml-4">
//                         {endedEvents.map((event) => (
//                           <CarouselItem key={event._id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
//                             <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} dimmed />
//                           </CarouselItem>
//                         ))}
//                       </CarouselContent>
//                       <CarouselPrevious className="hidden md:flex" />
//                       <CarouselNext className="hidden md:flex" />
//                     </Carousel>
//                   </section>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* Drawer */}
//         {selectedEvent && (
//           <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
//             <DrawerContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-white/50 dark:bg-gray-950">
//               <DrawerHeader className="border-b border-slate-100 dark:border-gray-800">
//                 <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   {selectedEvent.eventName}
//                 </DrawerTitle>
//                 <DrawerDescription>
//                   <div className="text-sm text-slate-600 space-y-2 mt-3 dark:text-gray-100">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-blue-500" />
//                       {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Ticket className="w-4 h-4 text-orange-500" />
//                       {(() => {
//                         if (selectedEvent.eventCategory === "Indoor" && selectedEvent.zonePrices?.length > 0) {
//                           const valid = selectedEvent.zonePrices.filter(p => p > 0);
//                           if (valid.length === 0) return <span className="font-semibold text-green-600">FREE</span>;
//                           const minPrice = Math.min(...valid);
//                           const maxPrice = Math.max(...valid);
//                           return <span className="font-semibold text-slate-900 dark:text-gray-100">{minPrice === maxPrice ? `₹${minPrice.toLocaleString()}` : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`}</span>;
//                         }
//                         if (selectedEvent.ticketRate) {
//                           return <span className="font-semibold text-slate-900 dark:text-gray-100">₹{selectedEvent.ticketRate.toLocaleString()}</span>;
//                         }
//                         return <span className="font-semibold text-green-600 dark:text-green-400">FREE</span>;
//                       })()}
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4 text-purple-500" />
//                       {(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} available
//                     </div>

//                     {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
//                       <div className="flex items-center gap-2">
//                         <ExternalLink className="w-4 h-4 text-blue-500" />
//                         <a href={selectedEvent.zoomUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline transition-colors">Join Zoom Meeting</a>
//                       </div>
//                     ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.stadiumId?.location?.address ? (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>{selectedEvent.stadiumId.location.address}</span>
//                       </div>
//                     ) : selectedEvent.cityId?.name ? (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>{selectedEvent.cityId.name}{selectedEvent.stateId ? `, ${selectedEvent.stateId?.Name || selectedEvent.stateId?.name}` : ""}</span>
//                       </div>
//                     ) : null}
//                   </div>
//                 </DrawerDescription>
//               </DrawerHeader>

//               <div className="px-4 pb-4">
//                 <img src={selectedEvent.eventImgUrl} alt={selectedEvent.eventName} className="rounded-xl w-full h-40 object-cover mb-4 shadow-lg" />

//                 {(() => {
//                   const eventStatus = getEventStatus(selectedEvent);
//                   const availableSeats = (selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0);

//                   if (eventStatus.status === "ended") {
//                     return (
//                       <div className="text-center py-4">
//                         <Badge variant="secondary" className="text-lg px-6 py-2">
//                           <CheckCircle className="w-5 h-5 mr-2" />
//                           Event Completed
//                         </Badge>
//                       </div>
//                     );
//                   } else if (eventStatus.status === "soldout") {
//                     return (
//                       <div className="text-center py-4">
//                         <Badge variant="destructive" className="text-lg px-6 py-2">
//                           <AlertCircle className="w-5 h-5 mr-2" />
//                           Sold Out
//                         </Badge>
//                       </div>
//                     );
//                   } else if (selectedEvent.eventCategory === "Indoor") {
//                     return (
//                       <Button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleSeatSelectionClick(selectedEvent);
//                         }}
//                         className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
//                       >
//                         {!isAuthenticated && <LogIn className="w-4 h-4 mr-2" />}
//                         <Ticket className="w-4 h-4 mr-2" />
//                         {isAuthenticated ? "Select Seats" : "Sign in to Select Seats"}
//                       </Button>
//                     );
//                   } else {
//                     return (
//                       <div className="space-y-3">
//                         <Select value={String(ticketQuantities[selectedEvent._id] || 1)} onValueChange={(value) =>
//                           setTicketQuantities({
//                             ...ticketQuantities,
//                             [selectedEvent._id]: parseInt(value),
//                           })
//                         }>
//                           <SelectTrigger className="bg-white/50 border-slate-200 dark:bg-gray-800 dark:border-gray-700">
//                             <SelectValue placeholder="Select quantity" />
//                           </SelectTrigger>
//                           <SelectContent className="dark:bg-gray-800">
//                             {Array.from({ length: Math.min(10, Math.max(1, availableSeats)) }, (_, i) => (
//                               <SelectItem key={i + 1} value={String(i + 1)}>
//                                 {i + 1} Ticket(s) - ₹{((i + 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>

//                         <Button
//                           disabled={!razorpayLoaded && isAuthenticated}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleBookingClick(selectedEvent, ticketQuantities[selectedEvent._id] || 1);
//                           }}
//                           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-md font-semibold"
//                         >
//                           {!isAuthenticated ? (
//                             <>
//                               <LogIn className="w-4 h-4 mr-2" />
//                               Sign in to Book
//                             </>
//                           ) : !razorpayLoaded ? (
//                             "Loading Payment..."
//                           ) : (
//                             `Pay ₹${((ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}`
//                           )}
//                         </Button>

//                         {/* If user is logged in but not verified, show small notice */}
//                         {isAuthenticated && !isVerified && (
//                           <p className="text-sm text-red-500 text-center mt-2">
//                             Please verify your email to book tickets.
//                           </p>
//                         )}
//                       </div>
//                     );
//                   }
//                 })()}
//               </div>

//               <DrawerFooter className="border-t border-slate-100 dark:border-gray-800">
//                 <DrawerClose asChild>
//                   <Button variant="outline" className="border-slate-200 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
//                     Close
//                   </Button>
//                 </DrawerClose>
//               </DrawerFooter>
//             </DrawerContent>
//           </Drawer>
//         )}
//       </div>

//       {/* Sign In Modal */}
//       {showSignInModal && (
//         <SignInModal
//           open={showSignInModal}
//           pendingPayment={pendingPayment}
//           onClose={() => {
//             setShowSignInModal(false);
//             setPendingPayment(null);
//           }}
//           onLoginSuccess={(token, userData) => {
//             // Store token & user info
//             localStorage.setItem("token", token);
//             localStorage.setItem("userId", userData._id);
//             localStorage.setItem("role", userData.roleId?.name || "User");
//             localStorage.setItem("isVerified", userData.isVerified ? "true" : "false");
//             axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//             setIsAuthenticated(true);
//             setIsVerified(userData.isVerified === true);

//             // If the pending action was seat selection: redirect
//             if (pendingPayment?.redirectToSeatSelection) {
//               navigate(`/select-seats/${pendingPayment.eventId}`);
//               setShowSignInModal(false);
//               setPendingPayment(null);
//               setIsDrawerOpen(false);
//               return;
//             }

//             // If pending payment exists and user is verified -> open payment
//             if (pendingPayment && (localStorage.getItem("isVerified") === "true") && razorpayLoaded && window.Razorpay) {
//               const options = {
//                 key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//                 amount: pendingPayment.amount * 100,
//                 currency: "INR",
//                 name: "EventEase",
//                 description: `Booking for ${selectedEvent?.eventName || ""}`,
//                 handler: async function (response) {
//                   try {
//                     await bookEventWithoutSeats({
//                       ...pendingPayment.booking,
//                       paymentId: response.razorpay_payment_id
//                     });
//                     setPendingPayment(null);
//                   } catch (error) {
//                     console.error("Booking failed:", error);
//                     alert("Payment successful but booking failed. Please contact support.");
//                   }
//                 },
//                 prefill: {
//                   name: userData.fullName || userData.name || "Guest User",
//                   email: userData.email || "",
//                   contact: userData.phone || ""
//                 },
//                 theme: { color: "#3B82F6" }
//               };

//               try {
//                 const paymentObject = new window.Razorpay(options);
//                 paymentObject.open();
//               } catch (err) {
//                 console.error("Error opening Razorpay after login:", err);
//                 alert("Failed to open payment gateway. Please try again.");
//               }
//             }

//             setShowSignInModal(false);
//           }}
//         />
//       )}

//       {/* Verify Email Modal */}
//       {showVerifyModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg text-center">
//             <h3 className="text-lg font-semibold mb-2 text-red-600">Email Not Verified</h3>
//             <p className="text-sm text-gray-700 dark:text-gray-700 mb-4">
//               Please verify your email before booking tickets. Check your inbox for the verification link.
//             </p>

//             <div className="flex gap-2 justify-center">
//               <Button onClick={() => setShowVerifyModal(false)} className="px-4">OK</Button>

//               <Button
//                 variant="outline"
//                 onClick={async () => {
//                   try {
//                     const token = localStorage.getItem("token");
//                     if (!token) {
//                       setShowSignInModal(true);
//                       setShowVerifyModal(false);
//                       return;
//                     }
//                     // Optional endpoint to resend verification
//                     await axios.post("/user/resend-verification", {}, {
//                       headers: { Authorization: `Bearer ${token}` }
//                     });
//                     alert("Verification email resent. Check your inbox.");
//                   } catch (err) {
//                     console.error("Resend verification failed:", err);
//                     alert(err.response?.data?.message || "Failed to resend verification email.");
//                   } finally {
//                     setShowVerifyModal(false);
//                   }
//                 }}
//               >
//                 Resend Email
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ViewEvents;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   ExternalLink,
//   Ticket,
//   Clock,
//   CheckCircle,
//   Search,
//   Filter,
//   AlertCircle,
//   ArrowRight,
//   LogIn,
//   CardSimIcon,
//   IdCardIcon,
// } from "lucide-react";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
//   DrawerFooter,
// } from "@/components/ui/drawer";
// import { SignInModal } from "@/components/user/SignInModal";

// // Extracted EventCard component
// const EventCard = ({ event, getEventStatus, onCardClick, dimmed = false }) => {
//   const eventStatus = getEventStatus(event);
//   const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);
//   const StatusIcon = eventStatus.icon;

//   return (
//     <Card
//       className={
//         "group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-inner h-full flex flex-col " +
//         (dimmed ? "opacity-60 filter grayscale" : "")
//       }
//       onClick={() => onCardClick(event)}
//     >
//       <div className="relative overflow-hidden">
//         <img
//           src={event.eventImgUrl}
//           alt={event.eventName}
//           className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute top-3 right-3">
//           <Badge variant={eventStatus.variant} className="shadow-lg">
//             <StatusIcon className="w-3 h-3 mr-1" />
//             {eventStatus.label}
//           </Badge>
//         </div>
//         {event.eventType && (
//           <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 shadow-lg dark:text-gray-900">
//             {event.eventType}
//           </Badge>
//         )}
//       </div>

//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-gray-100 line-clamp-2">
//         {event.eventName}
//         </CardTitle>
        
//       </CardHeader>

//       {/* <CardContent className="space-y-2 pb-4 flex-grow">
//         <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//           <Calendar className="w-4 h-4 mr-2 text-blue-500" />
//           <span>
//             {new Date(event.startDate).toLocaleDateString()}
//             {" — "}
//             {new Date(event.endDate).toLocaleDateString()}
//           </span>
//         </div>

//         {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
//           <div className="flex items-center text-sm text-blue-600 dark:text-gray-100">
//             <ExternalLink className="w-4 h-4 mr-2" />
//             <span className="truncate">Zoom Meeting</span>
//           </div>
//         ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span className="truncate">{event.stadiumId.location.address}</span>
//           </div>
//         ) : event.cityId?.name ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span>{event.cityId.name}{event.stateId ? `, ${event.stateId?.Name || event.stateId?.name}` : ""}</span>
//           </div>
//         ) : null}

//         <div className="flex items-center justify-between">
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <Users className="w-4 h-4 mr-2 text-purple-500" />
//             <span>{availableSeats} seats</span>
//           </div>

//           {(() => {
//             // Indoor events: show price range from zonePrices
//             if (event.eventCategory === "Indoor" && event.zonePrices?.length > 0) {
//               const validPrices = event.zonePrices.filter(p => p > 0);
//               if (validPrices.length === 0) {
//                 return <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>;
//               }
//               const minPrice = Math.min(...validPrices);
//               const maxPrice = Math.max(...validPrices);
//               return (
//                 <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//                   {minPrice === maxPrice 
//                     ? `₹${minPrice.toLocaleString()}`
//                     : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
//                   }
//                 </div>
//               );
//             }
//             // Outdoor/Zoom events: show single ticketRate
//             else if (event.ticketRate) {
//               return (
//                 <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//                   ₹{event.ticketRate.toLocaleString()}
//                 </div>
//               );
//             }
//             // Free event
//             else {
//               return <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>;
//             }
//           })()}
//         </div>
//       </CardContent> */}

//       <CardFooter className="pt-4 border-t border-slate-100 dark:border-gray-800">
//         <div className="w-full text-center">
//           {eventStatus.status === "ended" ? (
//             <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
//               <CheckCircle className="w-4 h-4 mr-2" />
//               Event Completed
//             </Badge>
//           ) : eventStatus.status === "soldout" ? (
//             <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
//               <AlertCircle className="w-4 h-4 mr-2" />
//               Sold Out
//             </Badge>
//           ) : (
//             <Button
//               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onCardClick(event);
//               }}
//             >
//               <Ticket className="w-4 h-4 mr-2" />
//               View Details
//             </Button>
//           )}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState("");
//   const [filterCity, setFilterCity] = useState("");
//   const [filterEventType, setFilterEventType] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [showSignInModal, setShowSignInModal] = useState(false);
//   const [pendingPayment, setPendingPayment] = useState(null);
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);
//   const [showVerifyModal, setShowVerifyModal] = useState(false);

//   const navigate = useNavigate();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Load Razorpay script
//   useEffect(() => {
//     const loadRazorpay = () => {
//       if (window.Razorpay) {
//         setRazorpayLoaded(true);
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.async = true;
//       script.onload = () => {
//         console.log('Razorpay SDK loaded successfully');
//         setRazorpayLoaded(true);
//       };
//       script.onerror = () => {
//         console.error('Failed to load Razorpay SDK');
//         setError('Payment system unavailable. Please refresh the page.');
//       };
//       document.body.appendChild(script);
//     };

//     loadRazorpay();
//   }, []);

//   // Check authentication status
//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("token");
//       setIsAuthenticated(!!token);
//       console.log("Auth status:", !!token); // Debug log
//     };
    
//     checkAuth();
//     window.addEventListener('storage', checkAuth);
//     return () => window.removeEventListener('storage', checkAuth);
//   }, []);

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   useEffect(() => {
//     if (bookingInfo) {
//       const timer = setTimeout(() => setBookingInfo(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [bookingInfo]);

//   const getAllEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data || []);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     setIsDrawerOpen(true);
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("id");
      
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//           paymentId: booking.paymentId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setBookingInfo("Booking successful! 🎉");
//       navigate(`/mytickets/${userId}`);
//       getAllEvents();
//       setIsDrawerOpen(false);
//     } catch (err) {
//       console.error("Booking error:", err);
//       alert("Booking failed: " + (err.response?.data?.message || err.message || "Unknown error"));
//     }
//   };

//   const handlePayment = (eventDetails, quantity) => {
//     if (!razorpayLoaded || !window.Razorpay) {
//       alert('Payment system is still loading. Please wait a moment and try again.');
//       return;
//     }

//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: quantity * (eventDetails.ticketRate || 0) * 100,
//       currency: "INR",
//       name: "EventEase",
//       description: `Booking for ${eventDetails.eventName}`,
//       handler: async function (response) {
//         try {
//           const booking = {
//             eventId: eventDetails._id,
//             organizerId: eventDetails.organizerId,
//             quantity: quantity,
//             selectedSeats: [],
//             stateId: eventDetails.stateId?._id || eventDetails.stateId,
//             cityId: eventDetails.cityId?._id || eventDetails.cityId,
//             paymentId: response.razorpay_payment_id
//           };
//           await bookEventWithoutSeats(booking);
//         } catch (error) {
//           console.error("Booking failed:", error);
//           alert("Payment successful but booking failed. Please contact support.");
//         }
//       },
//       prefill: {
//         name: localStorage.getItem("name") || "Guest User",
//         email: localStorage.getItem("email") || "",
//         contact: localStorage.getItem("phone") || ""
//       },
//       theme: {
//         color: "#3B82F6"
//       }
//     };

//     try {
//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();
//     } catch (error) {
//       console.error("Error opening Razorpay:", error);
//       alert("Failed to open payment gateway. Please try again.");
//     }
//   };

//   // Add near top of component if not already present:
// // const [showVerifyModal, setShowVerifyModal] = useState(false);

// const handleBookingClick = (event, quantity) => {
//   console.log("Booking clicked. Is authenticated:", isAuthenticated);

//   // 1) Not logged in — open sign-in modal (same as before)
//   if (!isAuthenticated) {
//     console.log("User not authenticated, showing login modal");
//     setPendingPayment({
//       eventId: event._id,
//       amount: quantity * (event.ticketRate || 0),
//       quantity: quantity,
//       booking: {
//         eventId: event._id,
//         organizerId: event.organizerId,
//         quantity: quantity,
//         selectedSeats: [],
//         stateId: event.stateId?._id || event.stateId,
//         cityId: event.cityId?._id || event.cityId,
//       }
//     });
//     setShowSignInModal(true);
//     return;
//   }

//   // 2) Logged in: check verified status (read from localStorage)
//   // Note: ensure SignInModal/store sets localStorage.setItem("isVerified", "true"/"false")
//   const isVerified = localStorage.getItem("isVerified") === "true";
//   if (!isVerified) {
//     console.log("User authenticated but not verified — show verify modal");
//     // Optionally keep pendingPayment so after verification you can auto-proceed
//     setPendingPayment({
//       eventId: event._id,
//       amount: quantity * (event.ticketRate || 0),
//       quantity,
//       booking: {
//         eventId: event._id,
//         organizerId: event.organizerId,
//         quantity,
//         selectedSeats: [],
//         stateId: event.stateId?._id || event.stateId,
//         cityId: event.cityId?._id || event.cityId,
//       }
//     });
//     setShowVerifyModal(true);
//     return;
//   }

//   // 3) Authenticated + verified -> proceed
//   console.log("User authenticated & verified, proceeding with payment");
//   handlePayment(event, quantity);
// };


// const handleSeatSelectionClick = (event) => {
//   console.log("Seat selection clicked. Is authenticated:", isAuthenticated);

//   // 1) Not logged in -> open sign-in modal and remember redirect
//   if (!isAuthenticated) {
//     console.log("User not authenticated, showing login modal");
//     setPendingPayment({
//       eventId: event._id,
//       redirectToSeatSelection: true,
//     });
//     setShowSignInModal(true);
//     return;
//   }

//   // 2) Logged in -> check verification
//   const isVerified = localStorage.getItem("isVerified") === "true";
//   if (!isVerified) {
//     console.log("User authenticated but not verified — show verify modal");
//     // Save pending redirect so you can redirect after verification if desired
//     setPendingPayment({
//       eventId: event._id,
//       redirectToSeatSelection: true,
//     });
//     setShowVerifyModal(true);
//     return;
//   }

//   // 3) Authenticated + verified -> navigate to seat selection
//   console.log("User authenticated & verified, navigating to seat selection");
//   navigate(`/select-seats/${event._id}`);
// };

//   // THIS IS THE KEY FUNCTION - Check auth BEFORE opening payment
//   // const handleBookingClick = (event, quantity) => {
//   //   console.log("Booking clicked. Is authenticated:", isAuthenticated); // Debug log
    
//   //   // Check if user is authenticated FIRST
//   //   if (!isAuthenticated) {
//   //     console.log("User not authenticated, showing login modal"); // Debug log
//   //     // Store pending payment details
//   //     setPendingPayment({
//   //       eventId: event._id,
//   //       amount: quantity * (event.ticketRate || 0),
//   //       quantity: quantity,
//   //       booking: {
//   //         eventId: event._id,
//   //         organizerId: event.organizerId,
//   //         quantity: quantity,
//   //         selectedSeats: [],
//   //         stateId: event.stateId?._id || event.stateId,
//   //         cityId: event.cityId?._id || event.cityId,
//   //       }
//   //     });
//   //     setShowSignInModal(true);
//   //     return; // STOP HERE - don't open payment
//   //   }

//   //   // If authenticated, proceed with payment
//   //   console.log("User authenticated, proceeding with payment"); // Debug log
//   //   handlePayment(event, quantity);
//   // };

//   // // THIS IS THE KEY FUNCTION - Check auth BEFORE seat selection
//   // const handleSeatSelectionClick = (event) => {
//   //   console.log("Seat selection clicked. Is authenticated:", isAuthenticated); // Debug log
    
//   //   if (!isAuthenticated) {
//   //     console.log("User not authenticated, showing login modal"); // Debug log
//   //     // For Indoor events with seat selection
//   //     setPendingPayment({
//   //       eventId: event._id,
//   //       redirectToSeatSelection: true,
//   //     });
//   //     setShowSignInModal(true);
//   //     return; // STOP HERE - don't navigate
//   //   }

//   //   // If authenticated, navigate to seat selection
//   //   console.log("User authenticated, navigating to seat selection"); // Debug log
//   //   navigate(`/select-seats/${event._id}`);
//   // };

//   const getEventStatus = (event) => {
//     const now = new Date();
//     const startDate = new Date(event.startDate);
//     const endDate = new Date(event.endDate);
//     const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

//     if (endDate < now) {
//       return { status: "ended", label: "Event Ended", variant: "destructive", icon: Clock };
//     }
//     if (availableSeats <= 0) {
//       return { status: "soldout", label: "Sold Out", variant: "destructive", icon: AlertCircle };
//     }
//     if (startDate <= now && endDate >= now) {
//       return { status: "ongoing", label: "Ongoing", variant: "default", icon: CheckCircle };
//     }
//     return { status: "upcoming", label: "Available", variant: "outline", icon: Ticket };
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   const sortedEvents = filteredEvents.sort((a, b) => {
//     const now = new Date();
//     const aEnded = new Date(a.endDate) < now;
//     const bEnded = new Date(b.endDate) < now;

//     if (aEnded === bEnded) {
//       return new Date(a.startDate) - new Date(b.startDate);
//     }
//     return aEnded ? 1 : -1;
//   });

//   const endedEvents = sortedEvents.filter((e) => getEventStatus(e).status === "ended");
//   const activeEvents = sortedEvents.filter((e) => getEventStatus(e).status !== "ended");

//   const LoadingSkeleton = () => (
//     <div className="space-y-12">
//       {[1, 2].map((section) => (
//         <div key={section}>
//           <Skeleton className="h-8 w-48 mb-6" />
//           <div className="flex space-x-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="w-80">
//                 <Skeleton className="h-48 w-full rounded-t-lg" />
//                 <CardHeader>
//                   <Skeleton className="h-6 w-3/4 mb-2" />
//                   <Skeleton className="h-4 w-full mb-1" />
//                 </CardHeader>
//                 <CardContent>
//                   <Skeleton className="h-4 w-full mb-2" />
//                   <Skeleton className="h-4 w-2/3 mb-2" />
//                 </CardContent>
//                 <CardFooter>
//                   <Skeleton className="h-10 w-full" />
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <>
//       <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
//         <div className="w-full py-16 px-4 md:px-8 space-y-8">
//           <div className="text-center mb-10">
//             <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
//               Discover Amazing Events
//             </h1>
//             <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
//               Find and book your next unforgettable experience. Click any event card for details.
//             </p>
//           </div>

//           {/* Filters Section */}
//           <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8 dark:bg-gray-800">
//             <div className="flex items-center gap-2 mb-4">
//               <Filter className="w-5 h-5 text-blue-600" />
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Filter Events</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by Event Name"
//                   value={filterName}
//                   onChange={(e) => setFilterName(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by City"
//                   value={filterCity}
//                   onChange={(e) => setFilterCity(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <Select value={filterEventType} onValueChange={setFilterEventType}>
//                 <SelectTrigger className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:text-gray-100 dark:bg-gray-700">
//                   <SelectValue placeholder="All Event Types" />
//                 </SelectTrigger>
//                 <SelectContent className="dark:bg-gray-800">
//                   <SelectItem value="all">All Event Types</SelectItem>
//                   <SelectItem value="Conference">Conference</SelectItem>
//                   <SelectItem value="Exhibition">Exhibition</SelectItem>
//                   <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
//                   <SelectItem value="Incentive">Incentive</SelectItem>
//                   <SelectItem value="Music consert">Music Concert</SelectItem>
//                   <SelectItem value="Meeting">Meeting</SelectItem>
//                   <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//                   <SelectItem value="Other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Alerts */}
//           <div className="w-full max-w-7xl mx-auto">
//             {error && (
//               <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/50 dark:border-red-700">
//                 <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
//               </Alert>
//             )}
//             {bookingInfo && (
//               <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/50 dark:border-green-700">
//                 <AlertDescription className="text-green-800 dark:text-green-200">{bookingInfo}</AlertDescription>
//               </Alert>
//             )}
//           </div>

//           {/* Main Content Section */}
//           <div className="w-full px-4 md:px-8">
//             {loading ? (
//               <LoadingSkeleton />
//             ) : activeEvents.length === 0 && endedEvents.length === 0 ? (
//               <div className="w-full max-w-7xl mx-auto text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg dark:bg-gray-800">
//                 <Calendar className="mx-auto w-12 h-12 text-blue-500 mb-4" />
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-gray-100">No events found</h3>
//                 <p className="text-slate-600 dark:text-slate-300 mt-2">Try adjusting filters to find events.</p>
//               </div>
//             ) : (
//               <>
//                 {/* Active Events Section */}
//                 <section className="mb-12">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Events</h2>
//                     <Button variant="link" className="text-blue-600 dark:text-blue-400">
//                       See All <ArrowRight className="w-4 h-4 ml-1" />
//                     </Button>
//                   </div>

//                   <Carousel
//                     opts={{
//                       align: "start",
//                       loop: activeEvents.length > 4,
//                     }}
//                     className="w-full"
//                   >
//                     <CarouselContent className="-ml-4">
//                       {activeEvents.map((event) => (
//                         <CarouselItem
//                           key={event._id}
//                           className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
//                         >
//                           <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} />
//                         </CarouselItem>
//                       ))}
//                     </CarouselContent>
//                     <CarouselPrevious className="hidden md:flex" />
//                     <CarouselNext className="hidden md:flex" />
//                   </Carousel>
//                 </section>

//                 {/* Ended Events Section */}
//                 {endedEvents.length > 0 && (
//                   <section className="mt-12">
//                     <div className="flex items-center justify-between mb-4">
//                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ended Events</h2>
//                       <div className="text-sm text-slate-600 dark:text-slate-400">{endedEvents.length} items</div>
//                     </div>

//                     <Carousel
//                       opts={{
//                         align: "start",
//                         loop: endedEvents.length > 4,
//                       }}
//                       className="w-full"
//                     >
//                       <CarouselContent className="-ml-4">
//                         {endedEvents.map((event) => (
//                           <CarouselItem
//                             key={event._id}
//                             className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
//                           >
//                             <EventCard 
//                               event={event} 
//                               getEventStatus={getEventStatus} 
//                               onCardClick={handleEventClick} 
//                               dimmed 
//                             />
//                           </CarouselItem>
//                         ))}
//                       </CarouselContent>
//                       <CarouselPrevious className="hidden md:flex" />
//                       <CarouselNext className="hidden md:flex" />
//                     </Carousel>
//                   </section>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* Drawer - THIS IS WHERE THE MAIN CHANGES ARE */}
//         {selectedEvent && (
//           <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
//             <DrawerContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-white/50 dark:bg-gray-950">
//               <DrawerHeader className="border-b border-slate-100 dark:border-gray-800">
//                 <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   {selectedEvent.eventName}
//                 </DrawerTitle>
//                 <DrawerDescription>
//                   <div className="text-sm text-slate-600 space-y-2 mt-3 dark:text-gray-100">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-blue-500" />
//                       {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
//                     </div>
//                     {/* <div className="flex items-center gap-2">
//                       <Ticket className="w-4 h-4 text-orange-500" />
//                       ₹{selectedEvent.ticketRate || "Free"}
//                     </div> */}
//                      <div className="flex items-center gap-2">
//                      <Ticket className="w-4 h-4 text-orange-500" />

//                       {(() => {
//                      // Indoor events with zone prices
//                       if (selectedEvent.eventCategory === "Indoor" && selectedEvent.zonePrices?.length > 0) {
//                       const valid = selectedEvent.zonePrices.filter(p => p > 0);
//                       if (valid.length === 0) return <span className="font-semibold text-green-600">FREE</span>;
      
//                        const minPrice = Math.min(...valid);
//                        const maxPrice = Math.max(...valid);

//                        return (
//                         <span className="font-semibold text-slate-900 dark:text-gray-100">
//                           {minPrice === maxPrice 
//                            ? `₹${minPrice.toLocaleString()}`
//                            : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
//                            }
//                         </span>
//                        );
//                      }

//                        // Outdoor or Zoom price
//                      if (selectedEvent.ticketRate) {
//                        return (
//                        <span className="font-semibold text-slate-900 dark:text-gray-100">
//                        ₹{selectedEvent.ticketRate.toLocaleString()}
//                        </span>
//                        );
//                      }

//                    // Free event
//                     return <span className="font-semibold text-green-600 dark:text-green-400">FREE</span>;
//                     })()}
//                      </div>

//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4 text-purple-500" />
//                       {(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} available
//                     </div>
//                     {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
//                       <div className="flex items-center gap-2">
//                         <ExternalLink className="w-4 h-4 text-blue-500" />
//                         <a
//                           href={selectedEvent.zoomUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 hover:text-blue-800 underline transition-colors"
//                         >
//                           Join Zoom Meeting
//                         </a>
//                       </div>
//                     ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.stadiumId?.location?.address ? (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>{selectedEvent.stadiumId.location.address}</span>
//                       </div>
//                     ) : selectedEvent.cityId?.name ? (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>{selectedEvent.cityId.name}{selectedEvent.stateId ? `, ${selectedEvent.stateId?.Name || selectedEvent.stateId?.name}` : ""}</span>
//                       </div>
//                     ) : null}
//                   </div>
//                 </DrawerDescription>
//               </DrawerHeader>

//               <div className="px-4 pb-4">
//                 <img
//                   src={selectedEvent.eventImgUrl}
//                   alt={selectedEvent.eventName}
//                   className="rounded-xl w-full h-40 object-cover mb-4 shadow-lg"
//                 />

//                 {(() => {
//                   const eventStatus = getEventStatus(selectedEvent);
//                   const availableSeats = (selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0);

//                   if (eventStatus.status === "ended") {
//                     return (
//                       <div className="text-center py-4">
//                         <Badge variant="secondary" className="text-lg px-6 py-2">
//                           <CheckCircle className="w-5 h-5 mr-2" />
//                           Event Completed
//                         </Badge>
//                       </div>
//                     );
//                   } else if (eventStatus.status === "soldout") {
//                     return (
//                       <div className="text-center py-4">
//                         <Badge variant="destructive" className="text-lg px-6 py-2">
//                           <AlertCircle className="w-5 h-5 mr-2" />
//                           Sold Out
//                         </Badge>
//                       </div>
//                     );
//                   } else if (selectedEvent.eventCategory === "Indoor") {
//                     // SEAT SELECTION BUTTON - Uses handleSeatSelectionClick
//                     return (
//                       <Button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleSeatSelectionClick(selectedEvent);
//                         }}
//                         className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
//                       >
//                         {!isAuthenticated && <LogIn className="w-4 h-4 mr-2" />}
//                         <Ticket className="w-4 h-4 mr-2" />
//                         {isAuthenticated ? "Select Seats" : "Sign in to Select Seats"}
//                       </Button>
//                     );
//                   } else {
//                     // DIRECT BOOKING - Uses handleBookingClick
//                     return (
//                       <div className="space-y-3">
//                         <Select
//                           value={String(ticketQuantities[selectedEvent._id] || 1)}
//                           onValueChange={(value) =>
//                             setTicketQuantities({
//                               ...ticketQuantities,
//                               [selectedEvent._id]: parseInt(value),
//                             })
//                           }
//                         >
//                           <SelectTrigger className="bg-white/50 border-slate-200 dark:bg-gray-800 dark:border-gray-700">
//                             <SelectValue placeholder="Select quantity" />
//                           </SelectTrigger>
//                           <SelectContent className="dark:bg-gray-800">
//                             {Array.from({ length: Math.min(10, Math.max(1, availableSeats)) }, (_, i) => (
//                               <SelectItem key={i + 1} value={String(i + 1)}>
//                                 {i + 1} Ticket(s) - ₹{((i + 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>

//                         <Button
//                           disabled={!razorpayLoaded && isAuthenticated}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleBookingClick(selectedEvent, ticketQuantities[selectedEvent._id] || 1);
//                           }}
//                           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-md font-semibold"
//                         >
//                           {!isAuthenticated ? (
//                             <>
//                               <LogIn className="w-4 h-4 mr-2" />
//                               Sign in to Book
//                             </>
//                           ) : !razorpayLoaded ? (
//                             "Loading Payment..."
//                           ) : (
//                             `Pay ₹${((ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}`
//                           )}
//                         </Button>
//                       </div>
//                     );
//                   }
//                 })()}
//               </div>

//               <DrawerFooter className="border-t border-slate-100 dark:border-gray-800">
//                 <DrawerClose asChild>
//                   <Button variant="outline" className="border-slate-200 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
//                     Close
//                   </Button>
//                 </DrawerClose>
//               </DrawerFooter>
//             </DrawerContent>
//           </Drawer>
//         )}
//       </div>

//       {/* Sign In Modal */}
//       {showSignInModal && (
//         <SignInModal 
//           pendingPayment={pendingPayment}
//           onLoginSuccess={(token, userData) => {
//             console.log("Login successful, processing pending payment"); // Debug log
//             setIsAuthenticated(true);
            
//             // Handle seat selection redirect
//             if (pendingPayment?.redirectToSeatSelection) {
//               console.log("Redirecting to seat selection"); // Debug log
//               navigate(`/select-seats/${pendingPayment.eventId}`);
//               setShowSignInModal(false);
//               setPendingPayment(null);
//               setIsDrawerOpen(false);
//               return;
//             }

//             // Handle payment after login
//             if (pendingPayment && razorpayLoaded && window.Razorpay) {
//               console.log("Opening Razorpay after login"); // Debug log
//               const options = {
//                 key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//                 amount: pendingPayment.amount * 100,
//                 currency: "INR",
//                 name: "EventEase",
//                 description: `Booking for ${selectedEvent?.eventName}`,
//                 handler: async function (response) {
//                   try {
//                     await bookEventWithoutSeats({
//                       ...pendingPayment.booking,
//                       paymentId: response.razorpay_payment_id
//                     });
//                     setPendingPayment(null);
//                   } catch (error) {
//                     console.error("Booking failed:", error);
//                     alert("Payment successful but booking failed. Please contact support.");
//                   }
//                 },
//                 prefill: {
//                   name: userData.fullName || userData.name || "Guest User",
//                   email: userData.email || "",
//                   contact: userData.phone || ""
//                 },
//                 theme: {
//                   color: "#3B82F6"
//                 }
//               };

//               try {
//                 const paymentObject = new window.Razorpay(options);
//                 paymentObject.open();
//               } catch (error) {
//                 console.error("Error opening Razorpay:", error);
//                 alert("Failed to open payment gateway. Please try again.");
//               }
//             }
//             setShowSignInModal(false);
//           }}
//           onClose={() => {
//             console.log("Login modal closed"); // Debug log
//             setShowSignInModal(false);
//             setPendingPayment(null);
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default ViewEvents;














// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   ExternalLink,
//   Ticket,
//   Clock,
//   CheckCircle,
//   Search,
//   Filter,
//   AlertCircle,
//   ArrowRight,
// } from "lucide-react";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
//   DrawerFooter,
// } from "@/components/ui/drawer";
// import { SignInModal } from "@/components/user/SignInModal";

// // Extracted EventCard component
// const EventCard = ({ event, getEventStatus, onCardClick, dimmed = false }) => {
//   const eventStatus = getEventStatus(event);
//   const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);
//   const StatusIcon = eventStatus.icon;

//   return (
//     <Card
//       key={event._id}
//       className={
//         "group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-gray-950 text-gray-900 dark:text-gray-100 h-full flex flex-col " +
//         (dimmed ? "opacity-60 filter grayscale" : "")
//       }
//       onClick={() => onCardClick(event)}
//     >
//       {/* Event Image */}
//       <div className="relative overflow-hidden">
//         <img
//           src={event.eventImgUrl}
//           alt={event.eventName}
//           className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute top-3 right-3">
//           <Badge variant={eventStatus.variant} className="shadow-lg">
//             <StatusIcon className="w-3 h-3 mr-1" />
//             {eventStatus.label}
//           </Badge>
//         </div>
//         {event.eventType && (
//           <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 shadow-lg dark:text-gray-900">
//             {event.eventType}
//           </Badge>
//         )}
//       </div>

//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-gray-100 line-clamp-2">
//           {event.eventName}
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-2 pb-4 flex-grow">
//         {/* Date Info */}
//         <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//           <Calendar className="w-4 h-4 mr-2 text-blue-500" />
//           <span>
//             {new Date(event.startDate).toLocaleDateString()}
//             {" — "}
//             {new Date(event.endDate).toLocaleDateString()}
//           </span>
//         </div>

//         {/* Location Info */}
//         {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
//           <div className="flex items-center text-sm text-blue-600 dark:text-gray-100">
//             <ExternalLink className="w-4 h-4 mr-2" />
//             <span className="truncate">Zoom Meeting</span>
//           </div>
//         ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span className="truncate">{event.stadiumId.location.address}</span>
//           </div>
//         ) : event.cityId?.name ? (
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <MapPin className="w-4 h-4 mr-2 text-green-500" />
//             <span>{event.cityId.name}{event.stateId ? `, ${event.stateId?.Name || event.stateId?.name}` : ""}</span>
//           </div>
//         ) : null}

//         {/* Seats & Price */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center text-sm text-slate-600 dark:text-gray-100">
//             <Users className="w-4 h-4 mr-2 text-purple-500" />
//             <span>{availableSeats} seats</span>
//           </div>

//           {event.ticketRate ? (
//             <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">
//               ₹{event.ticketRate.toLocaleString()}
//             </div>
//           ) : (
//             <div className="text-sm font-semibold text-green-600 dark:text-green-400">FREE</div>
//           )}
//         </div>
//       </CardContent>

//       <CardFooter className="pt-4 border-t border-slate-100 dark:border-gray-800">
//         <div className="w-full text-center">
//           {eventStatus.status === "ended" ? (
//             <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
//               <CheckCircle className="w-4 h-4 mr-2" />
//               Event Completed
//             </Badge>
//           ) : eventStatus.status === "soldout" ? (
//             <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
//               <AlertCircle className="w-4 h-4 mr-2" />
//               Sold Out
//             </Badge>
//           ) : (
//             <Button
//               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onCardClick(event);
//               }}
//             >
//               <Ticket className="w-4 h-4 mr-2" />
//               View Details
//             </Button>
//           )}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState("");
//   const [filterCity, setFilterCity] = useState("");
//   const [filterEventType, setFilterEventType] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [showSignInModal, setShowSignInModal] = useState(false);
//   const [pendingPayment, setPendingPayment] = useState(null);

//   const navigate = useNavigate();

//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("token");
//       setIsAuthenticated(!!token);
//     };
    
//     checkAuth();
//     window.addEventListener('storage', checkAuth);
//     return () => window.removeEventListener('storage', checkAuth);
//   }, []);

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   useEffect(() => {
//     if (bookingInfo) {
//       const timer = setTimeout(() => setBookingInfo(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [bookingInfo]);

//   const getAllEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data || []);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     setIsDrawerOpen(true);
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("id");
      
//       await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//           paymentId: booking.paymentId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setBookingInfo("Booking successful! 🎉");
//       navigate(`/mytickets/${userId}`);
//       getAllEvents();
//       setIsDrawerOpen(false);
//     } catch (err) {
//       alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
//     }
//   };

//   const getEventStatus = (event) => {
//     const now = new Date();
//     const startDate = new Date(event.startDate);
//     const endDate = new Date(event.endDate);
//     const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

//     if (endDate < now) {
//       return { status: "ended", label: "Event Ended", variant: "destructive", icon: Clock };
//     }
//     if (availableSeats <= 0) {
//       return { status: "soldout", label: "Sold Out", variant: "destructive", icon: AlertCircle };
//     }
//     if (startDate <= now && endDate >= now) {
//       return { status: "ongoing", label: "Ongoing", variant: "default", icon: CheckCircle };
//     }
//     return { status: "upcoming", label: "Available", variant: "outline", icon: Ticket };
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   const sortedEvents = filteredEvents.sort((a, b) => {
//     const now = new Date();
//     const aEnded = new Date(a.endDate) < now;
//     const bEnded = new Date(b.endDate) < now;

//     if (aEnded === bEnded) {
//       return new Date(a.startDate) - new Date(b.startDate);
//     }
//     return aEnded ? 1 : -1;
//   });

//   const endedEvents = sortedEvents.filter((e) => getEventStatus(e).status === "ended");
//   const activeEvents = sortedEvents.filter((e) => getEventStatus(e).status !== "ended");

//   const LoadingSkeleton = () => (
//     <div className="space-y-12">
//       {[1, 2].map((section) => (
//         <div key={section}>
//           <Skeleton className="h-8 w-48 mb-6" />
//           <div className="flex space-x-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="w-80">
//                 <Skeleton className="h-48 w-full rounded-t-lg" />
//                 <CardHeader>
//                   <Skeleton className="h-6 w-3/4 mb-2" />
//                   <Skeleton className="h-4 w-full mb-1" />
//                 </CardHeader>
//                 <CardContent>
//                   <Skeleton className="h-4 w-full mb-2" />
//                   <Skeleton className="h-4 w-2/3 mb-2" />
//                 </CardContent>
//                 <CardFooter>
//                   <Skeleton className="h-10 w-full" />
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <>
//       <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
//         {/* Header Section */}
//         <div className="w-full py-16 px-4 md:px-8 space-y-8">
//           <div className="text-center mb-10">
//             <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
//               Discover Amazing Events
//             </h1>
//             <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
//               Find and book your next unforgettable experience. Click any event card for details.
//             </p>
//           </div>

//           {/* Filters Section */}
//           <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-8 dark:bg-gray-800">
//             <div className="flex items-center gap-2 mb-4">
//               <Filter className="w-5 h-5 text-blue-600" />
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Filter Events</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by Event Name"
//                   value={filterName}
//                   onChange={(e) => setFilterName(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by City"
//                   value={filterCity}
//                   onChange={(e) => setFilterCity(e.target.value)}
//                   className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700"
//                 />
//               </div>
//               <Select value={filterEventType} onValueChange={setFilterEventType}>
//                 <SelectTrigger className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 dark:text-gray-100 dark:bg-gray-700">
//                   <SelectValue placeholder="All Event Types" />
//                 </SelectTrigger>
//                 <SelectContent className="dark:bg-gray-800">
//                   <SelectItem value="all">All Event Types</SelectItem>
//                   <SelectItem value="Seminar">Seminar</SelectItem>
//                   <SelectItem value="Workshop">Workshop</SelectItem>
//                   <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//                   <SelectItem value="Concert">Concert</SelectItem>
//                   <SelectItem value="Indoor">Indoor</SelectItem>
//                   <SelectItem value="Outdoor">Outdoor</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Alerts */}
//           <div className="w-full max-w-7xl mx-auto">
//             {error && (
//               <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/50 dark:border-red-700">
//                 <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
//               </Alert>
//             )}
//             {bookingInfo && (
//               <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/50 dark:border-green-700">
//                 <AlertDescription className="text-green-800 dark:text-green-200">{bookingInfo}</AlertDescription>
//               </Alert>
//             )}
//           </div>

//           {/* Main Content Section */}
//           <div className="w-full px-4 md:px-8">
//             {loading ? (
//               <LoadingSkeleton />
//             ) : activeEvents.length === 0 && endedEvents.length === 0 ? (
//               <div className="w-full max-w-7xl mx-auto text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg dark:bg-gray-800">
//                 <Calendar className="mx-auto w-12 h-12 text-blue-500 mb-4" />
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-gray-100">No events found</h3>
//                 <p className="text-slate-600 dark:text-slate-300 mt-2">Try adjusting filters to find events.</p>
//               </div>
//             ) : (
//               <>
//                 {/* Active Events Section */}
//                 <section className="mb-12">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Events</h2>
//                     <Button variant="link" className="text-blue-600 dark:text-blue-400">
//                       See All <ArrowRight className="w-4 h-4 ml-1" />
//                     </Button>
//                   </div>

//                   <Carousel
//                     opts={{
//                       align: "start",
//                       loop: activeEvents.length > 4,
//                     }}
//                     className="w-full"
//                   >
//                     <CarouselContent className="-ml-4">
//                       {activeEvents.map((event) => (
//                         <CarouselItem
//                           key={event._id}
//                           className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
//                         >
//                           <EventCard event={event} getEventStatus={getEventStatus} onCardClick={handleEventClick} />
//                         </CarouselItem>
//                       ))}
//                     </CarouselContent>
//                     <CarouselPrevious className="hidden md:flex" />
//                     <CarouselNext className="hidden md:flex" />
//                   </Carousel>
//                 </section>

//                 {/* Ended Events Section */}
//                 {endedEvents.length > 0 && (
//                   <section className="mt-12">
//                     <div className="flex items-center justify-between mb-4">
//                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ended Events</h2>
//                       <div className="text-sm text-slate-600 dark:text-slate-400">{endedEvents.length} items</div>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
//                       {endedEvents.map((ev) => (
//                         <EventCard 
//                           key={ev._id} 
//                           event={ev} 
//                           getEventStatus={getEventStatus} 
//                           onCardClick={handleEventClick} 
//                           dimmed 
//                         />
//                       ))}
//                     </div>
//                   </section>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* Drawer */}
//         {selectedEvent && (
//           <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
//             <DrawerContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-white/50 dark:bg-gray-950">
//               <DrawerHeader className="border-b border-slate-100 dark:border-gray-800">
//                 <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   {selectedEvent.eventName}
//                 </DrawerTitle>
//                 <DrawerDescription>
//                   <div className="text-sm text-slate-600 space-y-2 mt-3 dark:text-gray-100">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-blue-500" />
//                       {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Ticket className="w-4 h-4 text-orange-500" />
//                       ₹{selectedEvent.ticketRate || "Free"}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4 text-purple-500" />
//                       {(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} available
//                     </div>
//                     {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
//                       <div className="flex items-center gap-2">
//                         <ExternalLink className="w-4 h-4 text-blue-500" />
//                         <a
//                           href={selectedEvent.zoomUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 hover:text-blue-800 underline transition-colors"
//                         >
//                           Join Zoom Meeting
//                         </a>
//                       </div>
//                     ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.stadiumId?.location?.address ? (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>{selectedEvent.stadiumId.location.address}</span>
//                       </div>
//                     ) : selectedEvent.cityId?.name ? (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-green-500" />
//                         <span>{selectedEvent.cityId.name}{selectedEvent.stateId ? `, ${selectedEvent.stateId?.Name || selectedEvent.stateId?.name}` : ""}</span>
//                       </div>
//                     ) : null}
//                   </div>
//                 </DrawerDescription>
//               </DrawerHeader>

//               <div className="px-4 pb-4">
//                 <img
//                   src={selectedEvent.eventImgUrl}
//                   alt={selectedEvent.eventName}
//                   className="rounded-xl w-full h-40 object-cover mb-4 shadow-lg"
//                 />

//                 {(() => {
//                   const eventStatus = getEventStatus(selectedEvent);
//                   const availableSeats = (selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0);

//                   if (eventStatus.status === "ended") {
//                     return (
//                       <div className="text-center py-4">
//                         <Badge variant="secondary" className="text-lg px-6 py-2">
//                           <CheckCircle className="w-5 h-5 mr-2" />
//                           Event Completed
//                         </Badge>
//                       </div>
//                     );
//                   } else if (eventStatus.status === "soldout") {
//                     return (
//                       <div className="text-center py-4">
//                         <Badge variant="destructive" className="text-lg px-6 py-2">
//                           <AlertCircle className="w-5 h-5 mr-2" />
//                           Sold Out
//                         </Badge>
//                       </div>
//                     );
//                   } else if (selectedEvent.eventCategory === "Indoor") {
//                     return (
//                       <Link to={`/select-seats/${selectedEvent._id}`} className="w-full block mb-3">
//                         <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
//                           <Ticket className="w-4 h-4 mr-2" /> Select Seats
//                         </Button>
//                       </Link>
//                     );
//                   } else {
//                     return (
//                       <div className="space-y-3">
//                         <Select
//                           value={String(ticketQuantities[selectedEvent._id] || 1)}
//                           onValueChange={(value) =>
//                             setTicketQuantities({
//                               ...ticketQuantities,
//                               [selectedEvent._id]: parseInt(value),
//                             })
//                           }
//                         >
//                           <SelectTrigger className="bg-white/50 border-slate-200 dark:bg-gray-800 dark:border-gray-700">
//                             <SelectValue placeholder="Select quantity" />
//                           </SelectTrigger>
//                           <SelectContent className="dark:bg-gray-800">
//                             {Array.from({ length: Math.min(10, Math.max(1, availableSeats)) }, (_, i) => (
//                               <SelectItem key={i + 1} value={String(i + 1)}>
//                                 {i + 1} Ticket(s) - ₹{((i + 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>

//                         <Button
//                           onClick={() => {
//                             if (!isAuthenticated) {
//                               setPendingPayment({
//                                 eventId: selectedEvent._id,
//                                 amount: (ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0),
//                                 quantity: ticketQuantities[selectedEvent._id] || 1,
//                                 booking: {
//                                   eventId: selectedEvent._id,
//                                   organizerId: selectedEvent.organizerId,
//                                   quantity: ticketQuantities[selectedEvent._id] || 1,
//                                   selectedSeats: [],
//                                   stateId: selectedEvent.stateId?._id || selectedEvent.stateId,
//                                   cityId: selectedEvent.cityId?._id || selectedEvent.cityId,
//                                 }
//                               });
//                               setShowSignInModal(true);
//                               return;
//                             }

//                             const currentToken = localStorage.getItem("token");
//                             if (!currentToken) {
//                               setShowSignInModal(true);
//                               return;
//                             }

//                             const options = {
//                               key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//                               amount: (ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0) * 100,
//                               currency: "INR",
//                               name: "EventEase",
//                               description: `Booking for ${selectedEvent.eventName}`,
//                               handler: async function (response) {
//                                 try {
//                                   const booking = {
//                                     eventId: selectedEvent._id,
//                                     organizerId: selectedEvent.organizerId,
//                                     quantity: ticketQuantities[selectedEvent._id] || 1,
//                                     selectedSeats: [],
//                                     stateId: selectedEvent.stateId?._id || selectedEvent.stateId,
//                                     cityId: selectedEvent.cityId?._id || selectedEvent.cityId,
//                                     paymentId: response.razorpay_payment_id
//                                   };
//                                   await bookEventWithoutSeats(booking);
//                                 } catch (error) {
//                                   console.error("Booking failed:", error);
//                                   alert("Payment successful but booking failed. Please contact support.");
//                                 }
//                               },
//                               prefill: {
//                                 name: "Guest User",
//                                 email: "",
//                                 contact: ""
//                               }
//                             };

//                             const paymentObject = new window.Razorpay(options);
//                             paymentObject.open();
//                           }}
//                           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-md font-semibold"
//                         >
//                           {isAuthenticated ? `Pay ₹${(ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)}` : "Sign in to Book"}
//                         </Button>
//                       </div>
//                     );
//                   }
//                 })()}
//               </div>

//               <DrawerFooter className="border-t border-slate-100 dark:border-gray-800">
//                 <DrawerClose asChild>
//                   <Button variant="outline" className="border-slate-200 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
//                     Close
//                   </Button>
//                 </DrawerClose>
//               </DrawerFooter>
//             </DrawerContent>
//           </Drawer>
//         )}
//       </div>

//       {showSignInModal && (
//         <SignInModal 
//           pendingPayment={pendingPayment}
//           onLoginSuccess={(token, userData) => {
//             setIsAuthenticated(true);
//             if (pendingPayment) {
//               const options = {
//                 key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//                 amount: pendingPayment.amount * 100,
//                 currency: "INR",
//                 name: "EventEase",
//                 description: `Booking for ${selectedEvent?.eventName}`,
//                 handler: async function (response) {
//                   try {
//                     await bookEventWithoutSeats({
//                       ...pendingPayment.booking,
//                       paymentId: response.razorpay_payment_id
//                     });
//                     setPendingPayment(null);
//                   } catch (error) {
//                     console.error("Booking failed:", error);
//                     alert("Payment successful but booking failed. Please contact support.");
//                   }
//                 },
//                 prefill: {
//                   name: userData.fullName || userData.name || "Guest User",
//                   email: userData.email || "",
//                   contact: userData.phone || ""
//                 }
//               };

//               const paymentObject = new window.Razorpay(options);
//               paymentObject.open();
//             }
//             setShowSignInModal(false);
//           }}
//           onClose={() => setShowSignInModal(false)}
//         />
//       )}
//     </>
//   );
// };

// export default ViewEvents;
