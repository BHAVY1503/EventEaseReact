import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEvents } from "../../features/events/eventsSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, MapPin, Users, ExternalLink, ArrowRight, LogIn, Ticket, AlertCircle, CheckCircle } from "lucide-react";
import SignInModal from "@/components/user/SignInModal";

const EventCard = ({ event, getEventStatus, onCardClick, dimmed = false }) => {
  const eventStatus = getEventStatus(event);
  const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

  return (
    <Card
      className={`group cursor-pointer hover:shadow-xl transition-all bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-gray-950 h-full flex flex-col ${
        dimmed ? "opacity-60 filter grayscale" : ""
      }`}
      onClick={() => onCardClick(event)}
    >
      <div className="relative overflow-hidden">
        <img
          src={event.eventImgUrl}
          alt={event.eventName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        <Badge variant="secondary" className="absolute top-3 right-3">
          {eventStatus.label}
        </Badge>
        {event.eventType && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700">
            {event.eventType}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-2 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg line-clamp-2">{event.eventName}</h3>

        <div className="flex items-center text-xs text-slate-600">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          <span>
            {new Date(event.startDate).toLocaleDateString()} —{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </span>
        </div>

        {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
          <div className="flex items-center text-xs text-blue-600">
            <ExternalLink className="w-4 h-4 mr-2" />
            <span>Zoom Meeting</span>
          </div>
        ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
          <div className="flex items-center text-xs text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span className="truncate">{event.stadiumId.location.address}</span>
          </div>
        ) : event.cityId?.name ? (
          <div className="flex items-center text-xs text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span>
              {event.cityId.name}
              {event.stateId ? `, ${event.stateId?.Name || event.stateId?.name}` : ""}
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center text-xs text-slate-600">
            <Users className="w-4 h-4 mr-1 text-purple-500" />
            <span>{availableSeats} seats</span>
          </div>

          {event.eventCategory === "Outdoor" && event.ticketRate && (
            <span className="text-sm font-semibold text-slate-900 dark:text-gray-100">
              ₹{event.ticketRate.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>

      <div className="p-4 border-t border-slate-100 dark:border-gray-800 mt-auto">
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(event);
          }}
        >
          <Ticket className="w-4 h-4 mr-2" />
          Book Tickets
        </Button>
      </div>
    </Card>
  );
};

export default function ViewEventsOrg() {
  const dispatch = useAppDispatch();
  const { list: events, status } = useAppSelector((s) => s.events);
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay
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
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  // Check authentication
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

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const availableSeats = (event.numberOfSeats || 0) - (event.bookedSeats || 0);

    if (endDate < now) {
      return { label: "Completed", status: "ended" };
    }
    if (availableSeats <= 0) {
      return { label: "Sold Out", status: "soldout" };
    }
    if (startDate <= now && endDate >= now) {
      return { label: "Ongoing", status: "ongoing" };
    }
    return { label: "Upcoming", status: "upcoming" };
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
    setQuantity(1);
  };

  const bookEventWithoutSeats = async (booking) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      await axios.post(
        `/event/bookseat/${booking.eventId}`,
        {
          quantity: booking.quantity,
          selectedSeats: [],
          organizerId: booking.organizerId,
          stateId: booking.stateId,
          cityId: booking.cityId,
          paymentId: booking.paymentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Booking successful! 🎉");
      navigate(`/bookedtickets`);
      dispatch(fetchEvents());
      setIsDrawerOpen(false);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };

  const handlePayment = (eventDetails, qty) => {
    if (!razorpayLoaded || !window.Razorpay) {
      alert("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: qty * (eventDetails.ticketRate || 0) * 100,
      currency: "INR",
      name: "EventEase",
      description: `Booking for ${eventDetails.eventName}`,
      handler: async function (response) {
        try {
          const booking = {
            eventId: eventDetails._id,
            organizerId: eventDetails.organizerId,
            quantity: qty,
            selectedSeats: [],
            stateId: eventDetails.stateId?._id || eventDetails.stateId,
            cityId: eventDetails.cityId?._id || eventDetails.cityId,
            paymentId: response.razorpay_payment_id,
          };
          await bookEventWithoutSeats(booking);
        } catch (error) {
          console.error("Booking failed:", error);
          alert("Payment successful but booking failed. Please contact support.");
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
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      alert("Failed to open payment gateway. Please try again.");
    }
  };

  const handleBookingClick = (event, qty) => {
    if (!isAuthenticated) {
      setPendingPayment({
        eventId: event._id,
        amount: qty * (event.ticketRate || 0),
        quantity: qty,
        booking: {
          eventId: event._id,
          organizerId: event.organizerId,
          quantity: qty,
          selectedSeats: [],
          stateId: event.stateId?._id || event.stateId,
          cityId: event.cityId?._id || event.cityId,
        },
      });
      setShowSignInModal(true);
      return;
    }

    if (!isVerified) {
      setPendingPayment({
        eventId: event._id,
        amount: qty * (event.ticketRate || 0),
        quantity: qty,
        booking: {
          eventId: event._id,
          organizerId: event.organizerId,
          quantity: qty,
          selectedSeats: [],
          stateId: event.stateId?._id || event.stateId,
          cityId: event.cityId?._id || event.cityId,
        },
      });
      setShowVerifyModal(true);
      return;
    }

    handlePayment(event, qty);
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

    if (!isVerified) {
      setPendingPayment({
        eventId: event._id,
        redirectToSeatSelection: true,
      });
      setShowVerifyModal(true);
      return;
    }

    navigate(`/select-seats/${event._id}`);
  };

  const filteredEvents = events.filter((e) => getEventStatus(e).status !== "ended");
  const endedEvents = events.filter((e) => getEventStatus(e).status === "ended");

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full py-16 px-4 md:px-8 space-y-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Discover Events
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Browse and book amazing events.
            </p>
          </div>

          <div className="w-full px-4 md:px-8">
            {status === "loading" ? (
              <div className="space-y-12">
                {[1, 2].map((s) => (
                  <div key={s}>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="flex space-x-6 overflow-hidden">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="w-80 flex-shrink-0">
                          <Skeleton className="h-48 w-full" />
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 && endedEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold">No events found</h3>
              </div>
            ) : (
              <>
                {filteredEvents.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">
                        Active Events ({filteredEvents.length})
                      </h2>
                      <Button variant="link">
                        See All <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    <Carousel className="w-full">
                      <CarouselContent className="-ml-4">
                        {filteredEvents.map((e) => (
                          <CarouselItem
                            key={e._id}
                            className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                          >
                            <EventCard 
                              event={e} 
                              getEventStatus={getEventStatus} 
                              onCardClick={handleEventClick}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {filteredEvents.length > 4 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                  </section>
                )}

                {endedEvents.length > 0 && (
                  <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">
                      Ended Events ({endedEvents.length})
                    </h2>

                    <Carousel className="w-full">
                      <CarouselContent className="-ml-4">
                        {endedEvents.map((e) => (
                          <CarouselItem
                            key={e._id}
                            className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                          >
                            <EventCard 
                              event={e} 
                              getEventStatus={getEventStatus} 
                              onCardClick={handleEventClick}
                              dimmed 
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {endedEvents.length > 4 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        {/* Event Detail Drawer */}
        {selectedEvent && isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />
            
            <div className="relative ml-auto w-full max-w-lg h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
              {/* Hero Image */}
              <div className="relative h-64 flex-shrink-0">
                <img 
                  src={selectedEvent.eventImgUrl} 
                  alt={selectedEvent.eventName} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {selectedEvent.eventName}
                  </h2>
                  {selectedEvent.eventType && (
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                      {selectedEvent.eventType}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Date</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {new Date(selectedEvent.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Available</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {(selectedEvent.numberOfSeats || 0) - (selectedEvent.bookedSeats || 0)} seats
                    </p>
                  </div>
                </div>

                {/* Price Section */}
                {selectedEvent.eventCategory !== "ZoomMeeting" && (
                  <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Ticket className="w-5 h-5" />
                        <span className="text-sm font-medium">Ticket Price</span>
                      </div>
                      <div className="text-right">
                        {selectedEvent.eventCategory === "Indoor" && selectedEvent.zonePrices?.length > 0 ? (
                          <p className="text-sm font-semibold">
                            {Math.min(...selectedEvent.zonePrices)} - {Math.max(...selectedEvent.zonePrices)}
                          </p>
                        ) : selectedEvent.ticketRate ? (
                          <p className="text-sm font-semibold">₹{selectedEvent.ticketRate.toLocaleString()}</p>
                        ) : (
                          <p className="text-sm font-semibold text-green-600">FREE</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Section */}
                {selectedEvent.eventCategory === "ZoomMeeting" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      This is an online Zoom meeting event.
                    </p>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(selectedEvent.zoomUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Zoom Meeting
                    </Button>
                  </div>
                ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.zonePrices?.length > 0 ? (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handleSeatSelectionClick(selectedEvent)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Select Seats
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Number of Tickets</label>
                      <Select value={quantity.toString()} onValueChange={(v) => setQuantity(parseInt(v))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                            <SelectItem key={q} value={q.toString()}>
                              {q} Ticket{q > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Price:</span>
                        <span className="text-lg font-bold">
                          ₹{(quantity * (selectedEvent.ticketRate || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => handleBookingClick(selectedEvent, quantity)}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Proceed to Payment"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign In Modal */}
      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => {
            setShowSignInModal(false);
            setPendingPayment(null);
          }}
          onSuccess={() => {
            setShowSignInModal(false);
            setIsAuthenticated(true);
            if (pendingPayment?.redirectToSeatSelection) {
              navigate(`/select-seats/${pendingPayment.eventId}`);
            } else if (pendingPayment) {
              setShowVerifyModal(true);
            }
          }}
        />
      )}
    </>
  );
}
