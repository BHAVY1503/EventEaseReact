import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
  AlertCircle,
  ArrowRight,
  ChevronDown,
  LogIn,
  User,
  Menu,
  X,
  Star,
  TrendingUp,
  Film,
  Music,
  Sparkles,
} from "lucide-react";
import RazorpayButton from "../common/RazoryPayButton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Compact Event Card Component
const EventCard = ({ event, getEventStatus, onCardClick, isLoggedIn, navigate }) => {
  const eventStatus = getEventStatus(event);
  const StatusIcon = eventStatus.icon;

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (isLoggedIn) {
      onCardClick(event);
    } else {
      navigate('/signin');
    }
  };

  return (
    <Card
      className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-2xl border-0 h-full flex flex-col bg-white dark:bg-gray-900"
      onClick={handleBookClick}
    >
      {/* Event Image with Gradient Overlay */}
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img
          src={event.eventImgUrl}
          alt={event.eventName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={eventStatus.variant} className="shadow-lg text-xs backdrop-blur-sm">
            <StatusIcon className="w-3 h-3 mr-1" />
            {eventStatus.label}
          </Badge>
        </div>

        {/* Event Type Badge */}
        {event.eventType && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 text-xs shadow-lg">
            {event.eventType}
          </Badge>
        )}

        {/* Hover Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            size="sm"
            className={
              isLoggedIn
                ? "w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                : "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            }
            onClick={handleBookClick}
          >
            {isLoggedIn ? "Book Now" : <><LogIn className="w-4 h-4 mr-2"/> Sign In to Book</>}
          </Button>
        </div>
      </div>

      <CardContent className="p-3 flex-grow">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
          {event.eventName}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{event.cityId?.name || event.stateId?.Name || 'Online'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          
          {event.ticketRate ? (
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              ₹{event.ticketRate}
            </span>
          ) : (
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              FREE
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Feature Banner Component
const FeatureBanner = ({ icon: Icon, title, description, color }) => (
  <div className={`flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-br ${color} text-white`}>
    <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
    <div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs opacity-90">{description}</p>
    </div>
  </div>
);

export const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLoggedIn = !!token;
  const id = "currentUser123";

  useEffect(() => {
    getAllEvents();
  }, []);

  useEffect(() => {
    if (bookingInfo) {
      const timer = setTimeout(() => setBookingInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingInfo]);

  const getAllEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/event/getallevents`);
      setEvents(res.data.data);
    } catch (err) {
      setError("Failed to load events");
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    if (isLoggedIn) {
      setSelectedEvent(event);
      setIsDrawerOpen(true);
    } else {
      navigate('/signin');
    }
  };

  const bookEventWithoutSeats = async (booking) => {
    try {
      await axios.post(
        `/event/bookseat/${booking.eventId}`,
        {
          quantity: booking.quantity,
          selectedSeats: [],
          organizerId: booking.organizerId,
          stateId: booking.stateId,
          cityId: booking.cityId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookingInfo("Booking successful! 🎉");
      navigate(`/mytickets/${id}`);
      getAllEvents();
      setIsDrawerOpen(false);
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);

    if (endDate < now) {
      return { status: 'ended', label: 'Ended', variant: 'destructive', icon: Clock };
    }
    if (availableSeats <= 0) {
      return { status: 'soldout', label: 'Sold Out', variant: 'secondary', icon: AlertCircle };
    }
    if (startDate <= now && endDate >= now) {
      return { status: 'ongoing', label: 'Live', variant: 'default', icon: CheckCircle };
    }
    return { status: 'upcoming', label: 'Available', variant: 'outline', icon: Ticket };
  };

  const filteredEvents = events.filter((event) => {
    const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchCity = filterCity === "all" ? true : event.cityId?.name?.toLowerCase() === filterCity.toLowerCase();
    return matchName && matchCity;
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

  const allUpcomingEvents = sortedEvents.filter(event => 
    getEventStatus(event).status !== 'ended' && getEventStatus(event).status !== 'soldout'
  );

  const groupedEvents = {
    "🔥 Trending Events": allUpcomingEvents.slice(0, 8),
    "🎵 Music & Concerts": allUpcomingEvents.filter(e => e.eventType === 'Concert'),
    "💼 Workshops & Seminars": allUpcomingEvents.filter(e => e.eventType === 'Workshop' || e.eventType === 'Seminar'),
    "💻 Online Events": allUpcomingEvents.filter(e => e.eventType === 'ZoomMeeting'),
    "🎭 All Events": allUpcomingEvents,
  };

  const finalGroupedEvents = Object.entries(groupedEvents).filter(([_, events]) => events.length > 0);

  const cities = ["all", "Surat", "Mumbai", "Delhi", "Bangalore", "Pune"];

  const LoadingSkeleton = () => (
    <div className="space-y-12">
      {[1, 2].map(section => (
        <div key={section}>
          <Skeleton className="h-8 w-48 mb-6 bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-[2/3] rounded-xl bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Navigation Bar - BookMyShow Style */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white hidden sm:block">
                Event<span className="text-red-600">Ease</span>
              </span>
            </Link>

            {/* City Selector */}
            <div className="flex items-center space-x-3">
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="w-32 sm:w-40 border-0 bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-red-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city === "all" ? "All Cities" : city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Desktop Search */}
              <div className="relative hidden md:block w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for Events..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-10 border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Desktop Sign In */}
              {!isLoggedIn ? (
                <Button
                  variant="ghost"
                  className="hidden sm:flex text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
                  onClick={() => navigate('/signin')}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden sm:flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800">
                    <DropdownMenuItem onClick={() => navigate('/mytickets')}>
                      <Ticket className="w-4 h-4 mr-2" />
                      My Tickets
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/signin';
                      }}
                      className="text-red-600"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for Events..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="pl-10 border-0 bg-gray-100 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4">
            {!isLoggedIn ? (
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={() => navigate('/signin')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            ) : (
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/mytickets')}>
                  <Ticket className="w-4 h-4 mr-2" />
                  My Tickets
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/signin';
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureBanner
              icon={Sparkles}
              title="Exclusive Events"
              description="Access to premium and trending events"
              color="from-yellow-500 to-orange-500"
            />
            <FeatureBanner
              icon={TrendingUp}
              title="Best Prices"
              description="Get the best deals on event tickets"
              color="from-green-500 to-emerald-500"
            />
            <FeatureBanner
              icon={Star}
              title="Easy Booking"
              description="Book tickets in just a few clicks"
              color="from-blue-500 to-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}
        {bookingInfo && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">{bookingInfo}</AlertDescription>
          </Alert>
        )}

        {/* Events Sections */}
        {loading ? (
          <LoadingSkeleton />
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search filters</p>
            {(filterName || filterCity !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterName('');
                  setFilterCity('all');
                }}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {finalGroupedEvents.map(([category, eventsInCategory]) => (
              <section key={category}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {category}
                  </h2>
                  <Button variant="link" className="text-red-600 hover:text-red-700 p-0">
                    See All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Desktop Carousel */}
                <div className="hidden lg:block">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: false,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-4">
                      {eventsInCategory.map((event) => (
                        <CarouselItem
                          key={event._id}
                          className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                        >
                          <EventCard
                            event={event}
                            getEventStatus={getEventStatus}
                            onCardClick={handleEventClick}
                            isLoggedIn={isLoggedIn}
                            navigate={navigate}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0 bg-white dark:bg-gray-800 shadow-lg" />
                    <CarouselNext className="right-0 bg-white dark:bg-gray-800 shadow-lg" />
                  </Carousel>
                </div>

                {/* Mobile/Tablet Grid */}
                <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {eventsInCategory.slice(0, 8).map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      getEventStatus={getEventStatus}
                      onCardClick={handleEventClick}
                      isLoggedIn={isLoggedIn}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Event Detail Drawer */}
      {selectedEvent && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-w-lg mx-auto bg-white dark:bg-gray-900">
            <DrawerHeader className="border-b border-gray-200 dark:border-gray-800">
              <DrawerTitle className="text-2xl font-bold text-red-600">
                {selectedEvent.eventName}
              </DrawerTitle>
              <DrawerDescription>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>
                      {new Date(selectedEvent.startDate).toLocaleDateString()} - 
                      {new Date(selectedEvent.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-orange-500" />
                    <span>₹{selectedEvent.ticketRate || 'Free'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>{selectedEvent.numberOfSeats - (selectedEvent.bookedSeats || 0)} seats available</span>
                  </div>
                  {selectedEvent.cityId?.name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{selectedEvent.cityId.name}, {selectedEvent.stateId?.Name || selectedEvent.stateId?.name}</span>
                    </div>
                  )}
                </div>
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4 pt-4">
              <img
                src={selectedEvent.eventImgUrl}
                alt={selectedEvent.eventName}
                className="rounded-xl w-full h-48 object-cover mb-6 shadow-lg"
              />

              {(() => {
                const eventStatus = getEventStatus(selectedEvent);
                const availableSeats = selectedEvent.numberOfSeats - (selectedEvent.bookedSeats || 0);

                if (eventStatus.status === 'ended') {
                  return (
                    <div className="text-center py-4">
                      <Badge variant="secondary" className="text-lg px-6 py-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Event Completed
                      </Badge>
                    </div>
                  );
                } else if (eventStatus.status === 'soldout') {
                  return (
                    <div className="text-center py-4">
                      <Badge variant="destructive" className="text-lg px-6 py-2">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Sold Out
                      </Badge>
                    </div>
                  );
                } else if (selectedEvent.eventCategory === "Indoor") {
                  return (
                    <Link to={`/select-seats/${selectedEvent._id}`} className="w-full block">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg shadow-lg">
                        <Ticket className="w-5 h-5 mr-2" /> Select Seats
                      </Button>
                    </Link>
                  );
                } else {
                  return (
                    <div className="space-y-4">
                      <Select
                        value={String(ticketQuantities[selectedEvent._id] || 1)}
                        onValueChange={(value) =>
                          setTicketQuantities({
                            ...ticketQuantities,
                            [selectedEvent._id]: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="w-full h-12 text-base dark:bg-gray-800">
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800">
                          {Array.from({ length: Math.min(10, availableSeats) }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              {i + 1} Ticket(s) - ₹{((i + 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <RazorpayButton
                        eventId={selectedEvent._id}
                        amount={(ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)}
                        onPaymentSuccess={async () => {
                          const booking = {
                            eventId: selectedEvent._id,
                            organizerId: selectedEvent.organizerId,
                            quantity: ticketQuantities[selectedEvent._id] || 1,
                            selectedSeats: [],
                            stateId: selectedEvent.stateId?._id || selectedEvent.stateId,
                            cityId: selectedEvent.cityId?._id || selectedEvent.cityId,
                          };
                          await bookEventWithoutSeats(booking);
                        }}
                      />
                    </div>
                  );
                }
              })()}
            </div>

            <DrawerFooter className="border-t border-gray-200 dark:border-gray-800">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-red-500">EventEase</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Events</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">List Your Event</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"/></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2025 EventEase. All rights reserved. | Made with ❤️ for event lovers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};