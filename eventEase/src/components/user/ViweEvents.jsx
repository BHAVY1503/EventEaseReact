import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const bookEventWithoutSeats = async (booking) => {
    try {
      const res = await axios.post(
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
      return { status: 'ended', label: 'Event Ended', variant: 'destructive', icon: Clock };
    }
    if (availableSeats <= 0) {
      return { status: 'soldout', label: 'Sold Out', variant: 'secondary', icon: AlertCircle };
    }
    if (startDate <= now && endDate >= now) {
      return { status: 'ongoing', label: 'Ongoing', variant: 'default', icon: CheckCircle };
    }
    return { status: 'upcoming', label: 'Available', variant: 'outline', icon: Ticket };
  };

  const filteredEvents = events.filter((event) => {
    const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
    return matchName && matchCity && matchType;
  });

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-full">
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find and book your next unforgettable experience from our curated collection of events.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filter Events</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by Event Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="All Event Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
                <SelectItem value="Concert">Concert</SelectItem>
                <SelectItem value="Indoor">Indoor</SelectItem>
                <SelectItem value="Outdoor">Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {bookingInfo && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{bookingInfo}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-600 mb-6">
              {filterName || filterCity || filterEventType 
                ? "Try adjusting your search filters to find more events."
                : "There are currently no events available."}
            </p>
            {(filterName || filterCity || filterEventType) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterName('');
                  setFilterCity('');
                  setFilterEventType('');
                }}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
              const StatusIcon = eventStatus.icon;

              return (
                <Card 
                  key={event._id} 
                  className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden"
                  onClick={() => handleEventClick(event)}
                >
                  {/* Event Image */}
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
                      <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 shadow-lg">
                        {event.eventType}
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {event.eventName}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-4">
                    {/* Date Info */}
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Location Info */}
                    {event.eventCategory === "ZoomMeeting" && event.zoomUrl ? (
                      <div className="flex items-center text-sm text-blue-600">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        <span className="truncate">Join Zoom Meeting</span>
                      </div>
                    ) : event.eventCategory === "Indoor" && event.stadiumId?.location?.address ? (
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span className="truncate">{event.stadiumId.location.address}</span>
                      </div>
                    ) : event.cityId?.name ? (
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span>{event.cityId.name}, {event.stateId?.Name || event.stateId?.name}</span>
                      </div>
                    ) : null}

                    {/* Available Seats */}
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{availableSeats} seats available</span>
                    </div>

                    {/* Ticket Rate */}
                    {event.ticketRate && (
                      <div className="flex items-center text-sm font-semibold text-slate-900">
                        <Ticket className="w-4 h-4 mr-2 text-orange-500" />
                        <span>₹{event.ticketRate.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-slate-100">
                    <div className="w-full text-center">
                      {eventStatus.status === 'ended' ? (
                        <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Event Completed
                        </Badge>
                      ) : eventStatus.status === 'soldout' ? (
                        <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Sold Out
                        </Badge>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
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
            })}
          </div>
        )}
      </div>

      {/* Enhanced Drawer */}
      {selectedEvent && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-white/50">
            <DrawerHeader className="border-b border-slate-100">
              <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedEvent.eventName}
              </DrawerTitle>
              <DrawerDescription>
                <div className="text-sm text-slate-600 space-y-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> 
                    {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-orange-500" /> 
                    ₹{selectedEvent.ticketRate || 'Free'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" /> 
                    {selectedEvent.numberOfSeats - (selectedEvent.bookedSeats || 0)} available
                  </div>
                  {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                      <a 
                        href={selectedEvent.zoomUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline transition-colors"
                      >
                        Join Zoom Meeting
                      </a>
                    </div>
                  ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.stadiumId?.location?.address ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{selectedEvent.stadiumId.location.address}</span>
                    </div>
                  ) : selectedEvent.cityId?.name ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{selectedEvent.cityId.name}, {selectedEvent.stateId?.Name || selectedEvent.stateId?.name}</span>
                    </div>
                  ) : null}
                </div>
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4">
              <img 
                src={selectedEvent.eventImgUrl} 
                alt={selectedEvent.eventName} 
                className="rounded-xl w-full h-40 object-cover mb-4 shadow-lg" 
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
                    <Link to={`/select-seats/${selectedEvent._id}`} className="w-full block mb-3">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                        <Ticket className="w-4 h-4 mr-2" /> Select Seats
                      </Button>
                    </Link>
                  );
                } else {
                  return (
                    <div className="space-y-3">
                      <Select
                        value={String(ticketQuantities[selectedEvent._id] || 1)}
                        onValueChange={(value) =>
                          setTicketQuantities({
                            ...ticketQuantities,
                            [selectedEvent._id]: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="bg-white/50 border-slate-200">
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent>
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

            <DrawerFooter className="border-t border-slate-100">
              <DrawerClose asChild>
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
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
// } from "lucide-react";
// import RazorpayButton from "../common/RazoryPayButton";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
//   DrawerFooter,
// } from "@/components/ui/drawer";

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

//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
//       setEvents(res.data.data);
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
//       const res = await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setBookingInfo("Booking successful! 🎉");
//       getAllEvents();
//       setIsDrawerOpen(false);
//     } catch (err) {
//       alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
//     }
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === "all" || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 pt-20 pb-12">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Events</h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Find and book your next unforgettable experience from our curated collection of events.
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
//           <div className="flex items-center gap-2 mb-4">
//             <Filter className="w-5 h-5 text-gray-600" />
//             <h3 className="text-lg font-semibold text-gray-900">Filter Events</h3>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Input placeholder="Search by Event Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
//             <Input placeholder="Search by City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
//             <Select value={filterEventType} onValueChange={setFilterEventType}>
//               <SelectTrigger><SelectValue placeholder="All Event Types" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Event Types</SelectItem>
//                 <SelectItem value="Seminar">Seminar</SelectItem>
//                 <SelectItem value="Workshop">Workshop</SelectItem>
//                 <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//                 <SelectItem value="Concert">Concert</SelectItem>
//                 <SelectItem value="Indoor">Indoor</SelectItem>
//                 <SelectItem value="Outdoor">Outdoor</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {error && <Alert><AlertDescription>{error}</AlertDescription></Alert>}

//         {loading ? (
//           <div className="text-center py-16 text-gray-500">Loading events...</div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredEvents.map((event) => (
//               <Card key={event._id} className="cursor-pointer hover:shadow-lg" onClick={() => handleEventClick(event)}>
//                 <img src={event.eventImgUrl} alt={event.eventName} className="w-full h-48 object-cover" />
//                 <CardHeader>
//                   <CardTitle>{event.eventName}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex items-center text-sm text-gray-600 mb-1">
//                     <Calendar className="w-4 h-4 mr-2" />
//                     {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
//                   </div>
//                   <div className="flex items-center text-sm text-gray-700">
//                     <Ticket className="w-4 h-4 mr-2" />
//                     ₹{event.ticketRate || 'Free'}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Drawer */}
//       {selectedEvent && (
//         <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
//           <DrawerContent className="max-w-md mx-auto">
//             <DrawerHeader>
//               <DrawerTitle className="text-2xl">{selectedEvent.eventName}</DrawerTitle>
//               {/* <DrawerDescription>
//                 <div className="text-sm text-gray-600 space-y-1">
//                   <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}</div>
//                   <div className="flex items-center gap-2"><Ticket className="w-4 h-4" /> ₹{selectedEvent.ticketRate || 'Free'}</div>
//                   <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {selectedEvent.numberOfSeats - (selectedEvent.bookedSeats || 0)} available</div>
//                 </div>
//               </DrawerDescription> */}
//               <DrawerDescription>
//   <div className="text-sm text-gray-600 space-y-1">
//     <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}</div>
//     <div className="flex items-center gap-2"><Ticket className="w-4 h-4" /> ₹{selectedEvent.ticketRate || 'Free'}</div>
//     <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {selectedEvent.numberOfSeats - (selectedEvent.bookedSeats || 0)} available</div>
//     {selectedEvent.eventCategory === "ZoomMeeting" && selectedEvent.zoomUrl ? (
//       <div className="flex items-center gap-2">
//         <ExternalLink className="w-4 h-4" />
//         <a href={selectedEvent.zoomUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Join Zoom Meeting</a>
//       </div>
//     ) : selectedEvent.eventCategory === "Indoor" && selectedEvent.stadiumId?.location?.address ? (
//       <div className="flex items-center gap-2">
//         <MapPin className="w-4 h-4" />
//         {selectedEvent.stadiumId.location.address}
//       </div>
//     ) : selectedEvent.cityId?.name ? (
//       <div className="flex items-center gap-2">
//         <MapPin className="w-4 h-4" />
//         {selectedEvent.cityId.name}, {selectedEvent.stateId?.Name || selectedEvent.stateId?.name}
//       </div>
//     ) : null}
//   </div>
// </DrawerDescription>
//             </DrawerHeader>

//             <div className="px-4 pb-4">
//               <img src={selectedEvent.eventImgUrl} alt={selectedEvent.eventName} className="rounded-lg w-full h-40 object-cover mb-4" />
//               {selectedEvent.eventCategory === "Indoor" ? (
//                 <Link to={`/select-seats/${selectedEvent._id}`} className="w-full block mb-3">
//                   <Button className="w-full">
//                     <Ticket className="w-4 h-4 mr-2" /> Select Seats
//                   </Button>
//                 </Link>
//               ) : (
//                 <div className="space-y-2">
//                   <Select
//                     value={String(ticketQuantities[selectedEvent._id] || 1)}
//                     onValueChange={(value) =>
//                       setTicketQuantities({
//                         ...ticketQuantities,
//                         [selectedEvent._id]: parseInt(value),
//                       })
//                     }
//                   >
//                     <SelectTrigger><SelectValue placeholder="Select quantity" /></SelectTrigger>
//                     <SelectContent>
//                       {Array.from({ length: Math.min(10, selectedEvent.numberOfSeats - (selectedEvent.bookedSeats || 0)) }, (_, i) => (
//                         <SelectItem key={i + 1} value={String(i + 1)}>
//                           {i + 1} Ticket(s) - ₹{((i + 1) * (selectedEvent.ticketRate || 0)).toLocaleString()}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>

//                   <RazorpayButton
//                     eventId={selectedEvent._id}
//                     amount={(ticketQuantities[selectedEvent._id] || 1) * (selectedEvent.ticketRate || 0)}
//                     onPaymentSuccess={async () => {
//                       const booking = {
//                         eventId: selectedEvent._id,
//                         organizerId: selectedEvent.organizerId,
//                         quantity: ticketQuantities[selectedEvent._id] || 1,
//                         selectedSeats: [],
//                         stateId: selectedEvent.stateId?._id || selectedEvent.stateId,
//                         cityId: selectedEvent.cityId?._id || selectedEvent.cityId,
//                       };
//                       await bookEventWithoutSeats(booking);
//                     }}
//                   />
//                 </div>
//               )}
//             </div>

//             <DrawerFooter>
//               <DrawerClose asChild>
//                 <Button variant="outline">Close</Button>
//               </DrawerClose>
//             </DrawerFooter>
//           </DrawerContent>
//         </Drawer>
//       )}
//     </div>
//   );
// };






//simple
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import { 
//   Card, 
//   CardContent, 
//   CardDescription, 
//   CardFooter, 
//   CardHeader, 
//   CardTitle 
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Skeleton } from '@/components/ui/skeleton';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from '@/components/ui/select';
// import { 
//   Calendar,
//   MapPin,
//   Users,
//   ExternalLink,
//   Ticket,
//   Clock,
//   CheckCircle,
//   Search,
//   Filter
// } from 'lucide-react';
// import RazorpayButton from '../common/RazoryPayButton';

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState('');
//   const [filterCity, setFilterCity] = useState('');
//   const [filterEventType, setFilterEventType] = useState('');

//   // Get token from localStorage in real app
//   const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

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
//       setEvents(res.data.data);
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setBookingInfo("Booking successful! 🎉");
//       // Refresh events to update available seats
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
//     }
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === 'all' || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   const LoadingSkeleton = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {[1, 2, 3, 4, 5, 6].map((i) => (
//         <Card key={i} className="h-full">
//           <CardHeader>
//             <Skeleton className="h-48 w-full rounded-lg" />
//           </CardHeader>
//           <CardContent>
//             <Skeleton className="h-6 w-3/4 mb-2" />
//             <Skeleton className="h-4 w-full mb-1" />
//             <Skeleton className="h-4 w-full mb-1" />
//             <Skeleton className="h-4 w-2/3" />
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 pt-20 pb-12">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Events</h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Find and book your next unforgettable experience from our curated collection of events.
//           </p>
//         </div>

//         {/* Filters Section */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
//           <div className="flex items-center gap-2 mb-4">
//             <Filter className="w-5 h-5 text-gray-600" />
//             <h3 className="text-lg font-semibold text-gray-900">Filter Events</h3>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <Input
//                 type="text"
//                 placeholder="Search by Event Name"
//                 value={filterName}
//                 onChange={(e) => setFilterName(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <div className="relative">
//               <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <Input
//                 type="text"
//                 placeholder="Search by City"
//                 value={filterCity}
//                 onChange={(e) => setFilterCity(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Select value={filterEventType} onValueChange={setFilterEventType}>
//               <SelectTrigger>
//                 <SelectValue placeholder="All Event Types" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Event Types</SelectItem>
//                 <SelectItem value="Seminar">Seminar</SelectItem>
//                 <SelectItem value="Workshop">Workshop</SelectItem>
//                 <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//                 <SelectItem value="Concert">Concert</SelectItem>
//                 <SelectItem value="Indoor">Indoor</SelectItem>
//                 <SelectItem value="Outdoor">Outdoor</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Status Messages */}
//         {error && (
//           <Alert className="mb-6 border-red-200 bg-red-50">
//             <AlertDescription className="text-red-800">
//               {error}
//             </AlertDescription>
//           </Alert>
//         )}

//         {bookingInfo && (
//           <Alert className="mb-6 border-green-200 bg-green-50">
//             <CheckCircle className="h-4 w-4 text-green-600" />
//             <AlertDescription className="text-green-800">
//               {bookingInfo}
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Main Content */}
//         <div className="bg-white rounded-xl shadow-sm border p-8">
//           {loading ? (
//             <LoadingSkeleton />
//           ) : filteredEvents.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
//                 <Calendar className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
//               <p className="text-gray-600 mb-6">
//                 {filterName || filterCity || filterEventType 
//                   ? "Try adjusting your search filters to find more events."
//                   : "There are currently no events available."}
//               </p>
//               {(filterName || filterCity || filterEventType) && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => {
//                     setFilterName('');
//                     setFilterCity('');
//                     setFilterEventType('');
//                   }}
//                 >
//                   Clear Filters
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredEvents.map((event) => {
//                 const eventEnded = new Date(event.endDate) < new Date();
//                 const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);

//                 return (
//                   <Card key={event._id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
//                     {/* Event Image */}
//                     <div className="relative">
//                       <img
//                         src={event.eventImgUrl}
//                         alt={event.eventName}
//                         className="w-full h-48 object-cover rounded-t-lg"
//                       />
//                       {eventEnded && (
//                         <Badge className="absolute top-2 right-2 bg-red-500">
//                           <Clock className="w-3 h-3 mr-1" />
//                           Event Ended
//                         </Badge>
//                       )}
//                       {availableSeats <= 0 && !eventEnded && (
//                         <Badge className="absolute top-2 right-2 bg-orange-500">
//                           Sold Out
//                         </Badge>
//                       )}
//                     </div>

//                     <CardHeader className="pb-4">
//                       <CardTitle className="text-xl">{event.eventName}</CardTitle>
//                       <CardDescription>
//                         <Badge variant="outline" className="mr-2">
//                           {event.eventType}
//                         </Badge>
//                         <Badge variant="secondary">
//                           {event.eventCategory}
//                         </Badge>
//                       </CardDescription>
//                     </CardHeader>

//                     <CardContent className="flex-grow space-y-3">
//                       {/* Date Info */}
//                       <div className="flex items-center text-sm text-gray-600">
//                         <Calendar className="w-4 h-4 mr-2" />
//                         <span>
//                           {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
//                         </span>
//                       </div>

//                       {/* Location/Category specific info */}
//                       {event.eventCategory === "Outdoor" && (
//                         <>
//                           <div className="flex items-center text-sm text-gray-600">
//                             <MapPin className="w-4 h-4 mr-2" />
//                             <span>{event.stateId?.Name}, {event.cityId?.name}</span>
//                           </div>
//                           <div className="flex items-center text-sm text-gray-600">
//                             <Ticket className="w-4 h-4 mr-2" />
//                             <span>₹{event.ticketRate}</span>
//                           </div>
//                         </>
//                       )}

//                       {event.eventCategory === "Indoor" && event.stadiumId?.location?.address && (
//                         <div className="flex items-center text-sm text-gray-600">
//                           <MapPin className="w-4 h-4 mr-2" />
//                           <span>{event.stadiumId.location.address}</span>
//                         </div>
//                       )}

//                       {/* For Indoor events without stadium, show city */}
//                       {event.eventCategory === "Indoor" && !event.stadiumId?.location?.address && event.cityId?.name && (
//                         <div className="flex items-center text-sm text-gray-600">
//                           <MapPin className="w-4 h-4 mr-2" />
//                           <span>{event.cityId.name}</span>
//                         </div>
//                       )}

//                       {/* Zoom Meeting */}
//                       {event.eventCategory === "ZoomMeeting" && event.zoomUrl && (
//                         <div className="flex items-center text-sm">
//                           <ExternalLink className="w-4 h-4 mr-2" />
//                           <a
//                             href={event.zoomUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-600 hover:underline"
//                           >
//                             Join Zoom Meeting
//                           </a>
//                         </div>
//                       )}

//                       {/* Map Directions */}
//                       {event.latitude && event.longitude && (
//                         <div className="flex items-center">
//                           <a
//                             href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="text-xs"
//                             >
//                               <MapPin className="w-3 h-3 mr-1" />
//                               Get Directions
//                             </Button>
//                           </a>
//                         </div>
//                       )}

//                       {/* Available Seats */}
//                       <div className="flex items-center text-sm text-gray-600">
//                         <Users className="w-4 h-4 mr-2" />
//                         <span>{availableSeats} seats available</span>
//                       </div>

//                       {/* Ticket Rate (for non-outdoor events) */}
//                       {event.eventCategory !== "Outdoor" && event.ticketRate && (
//                         <div className="flex items-center text-sm text-gray-600">
//                           <Ticket className="w-4 h-4 mr-2" />
//                           <span>₹{event.ticketRate}</span>
//                         </div>
//                       )}
//                     </CardContent>

//                     <CardFooter className="flex flex-col gap-3 pt-4">
//                       {!eventEnded ? (
//                         availableSeats > 0 ? (
//                           event.eventCategory === "Indoor" ? (
//                             <Link to={`/select-seats/${event._id}`} className="w-full">
//                               <Button className="w-full bg-blue-600 hover:bg-blue-700">
//                                 <Ticket className="w-4 h-4 mr-2" />
//                                 Select Seats
//                               </Button>
//                             </Link>
//                           ) : (
//                             <div className="w-full space-y-2">
//                               <Select
//                                 value={String(ticketQuantities[event._id] || 1)}
//                                 onValueChange={(value) =>
//                                   setTicketQuantities({
//                                     ...ticketQuantities,
//                                     [event._id]: parseInt(value),
//                                   })
//                                 }
//                               >
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select quantity" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {Array.from({ length: Math.min(availableSeats, 10) }, (_, i) => (
//                                     <SelectItem key={i + 1} value={String(i + 1)}>
//                                       {i + 1} Ticket(s) - ₹{((i + 1) * event.ticketRate).toLocaleString()}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>

//                               <RazorpayButton
//                                 eventId={event._id}
//                                 amount={(ticketQuantities[event._id] || 1) * event.ticketRate}
//                                 onPaymentSuccess={async () => {
//                                   const booking = {
//                                     eventId: event._id,
//                                     organizerId: event.organizerId,
//                                     quantity: ticketQuantities[event._id] || 1,
//                                     selectedSeats: [],
//                                     stateId: event.stateId?._id || event.stateId,
//                                     cityId: event.cityId?._id || event.cityId,
//                                   };
//                                   await bookEventWithoutSeats(booking);
//                                 }}
//                               />
//                             </div>
//                           )
//                         ) : (
//                           <Badge variant="destructive" className="w-full justify-center py-2">
//                             Sold Out
//                           </Badge>
//                         )
//                       ) : (
//                         <Badge variant="secondary" className="w-full justify-center py-2">
//                           <CheckCircle className="w-4 h-4 mr-2" />
//                           Event Completed
//                         </Badge>
//                       )}
//                     </CardFooter>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };




// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
// import { Input } from "../ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// import { Badge } from "../ui/badge";
// import { Button } from "../ui/button";
// import RazorpayButton from '../common/RazoryPayButton';

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState('');
//   const [filterCity, setFilterCity] = useState('');
//   const [filterEventType, setFilterEventType] = useState('');

//   const token = localStorage.getItem("token");

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
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setBookingInfo(res.data.message);
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
//     }
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType === 'all' || !filterEventType ? true : event.eventType === filterEventType;
//     return matchName && matchCity && matchType;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 sm:px-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
//             Discover Amazing Events
//           </h1>
//           <p className="text-gray-400 text-lg">Find and book your next unforgettable experience</p>
//         </div>

//         {/* Filters Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <Input
//             type="text"
//             placeholder="Search by Event Name"
//             value={filterName}
//             onChange={(e) => setFilterName(e.target.value)}
//             className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
//           />
//           <Input
//             type="text"
//             placeholder="Search by City"
//             value={filterCity}
//             onChange={(e) => setFilterCity(e.target.value)}
//             className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
//           />
//           <Select value={filterEventType} onValueChange={setFilterEventType}>
//             <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
//               <SelectValue placeholder="All Event Types" />
//             </SelectTrigger>
//             <SelectContent className="bg-gray-800 border-gray-700">
//               <SelectItem value="all">All Event Types</SelectItem>
//               <SelectItem value="Seminar">Seminar</SelectItem>
//               <SelectItem value="Workshop">Workshop</SelectItem>
//               <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
//               <SelectItem value="Concert">Concert</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Status Messages */}
//         {loading && (
//           <div className="text-center py-8">
//             <div className="animate-pulse text-gray-400">Loading amazing events...</div>
//           </div>
//         )}
//         {error && (
//           <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
//             {error}
//           </div>
//         )}
//         {bookingInfo && (
//           <div className="bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
//             {bookingInfo}
//           </div>
//         )}

//         {/* Events Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredEvents.map((event) => {
//             const eventEnded = new Date(event.endDate) < new Date();
//             const availableSeats = event.numberOfSeats - event.bookedSeats;

//             return (
//               <Card 
//                 key={event._id} 
//                 className="bg-gray-800/50 border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
//               >
//                 <div className="aspect-video relative overflow-hidden">
//                   <img
//                     src={event.eventImgUrl}
//                     alt={event.eventName}
//                     className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
//                   />
//                   {eventEnded && (
//                     <Badge 
//                       variant="destructive" 
//                       className="absolute top-2 right-2 bg-red-500/90"
//                     >
//                       Event Ended
//                     </Badge>
//                   )}
//                 </div>

//                 <CardHeader>
//                   <CardTitle className="text-xl font-bold text-white">
//                     {event.eventName}
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div className="text-gray-400">Type:</div>
//                     <div className="text-gray-200">{event.eventType}</div>
                    
//                     <div className="text-gray-400">Start:</div>
//                     <div className="text-gray-200">
//                       {new Date(event.startDate).toLocaleDateString()}
//                     </div>
                    
//                     <div className="text-gray-400">End:</div>
//                     <div className="text-gray-200">
//                       {new Date(event.endDate).toLocaleDateString()}
//                     </div>

//                     {event.eventCategory === "ZoomMeeting" ? (
//                       <>
//                         <div className="text-gray-400">Zoom URL:</div>
//                         <a 
//                           href={event.zoomUrl} 
//                           target="_blank" 
//                           rel="noreferrer"
//                           className="text-blue-400 hover:text-blue-300 hover:underline truncate"
//                         >
//                           Join Meeting
//                         </a>
//                       </>
//                     ) : (
//                       <>
//                         <div className="text-gray-400">City:</div>
//                         <div className="text-gray-200">{event.cityId?.name}</div>
                        
//                         {event.latitude && event.longitude && (
//                           <>
//                             <div className="text-gray-400">Location:</div>
//                             <a
//                               href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
//                               target="_blank"
//                               rel="noreferrer"
//                               className="text-blue-400 hover:text-blue-300 hover:underline"
//                             >
//                               View on Map
//                             </a>
//                           </>
//                         )}
//                       </>
//                     )}
                    
//                     <div className="text-gray-400">Available Seats:</div>
//                     <div className="text-gray-200">{availableSeats}</div>
//                   </div>
//                 </CardContent>

//                 <CardFooter className="flex flex-col gap-3 border-t border-gray-700 bg-gray-800/30 p-4">
//                   {!eventEnded ? (
//                     availableSeats > 0 ? (
//                       event.eventCategory === "Indoor" ? (
//                         <Link to={`/select-seats/${event._id}`} className="w-full">
//                           <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
//                             Select Seats
//                           </Button>
//                         </Link>

//                       ) : (
//                         <>
//                           <Select
//                             value={String(ticketQuantities[event._id] || 1)}
//                             onValueChange={(value) =>
//                               setTicketQuantities({
//                                 ...ticketQuantities,
//                                 [event._id]: parseInt(value),
//                               })
//                             }
//                           >
//                             <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
//                               <SelectValue placeholder="Select quantity" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {Array.from({ length: availableSeats }, (_, i) => (
//                                 <SelectItem key={i + 1} value={String(i + 1)}>
//                                   {i + 1} Ticket(s)
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>

//                           <RazorpayButton
//                             eventId={event._id}
//                             amount={(ticketQuantities[event._id] || 1) * event.ticketRate}
//                             onPaymentSuccess={async () => {
//                               const booking = {
//                                 eventId: event._id,
//                                 organizerId: event.organizerId,
//                                 quantity: ticketQuantities[event._id] || 1,
//                                 selectedSeats: [],
//                                 stateId: event.stateId?._id || event.stateId,
//                                 cityId: event.cityId?._id || event.cityId,
//                               };
//                               await bookEventWithoutSeats(booking);
//                             }}
//                           />
//                         </>
//                       )
//                     ) : (
//                       <Badge variant="destructive" className="w-full justify-center py-2">
//                         Sold Out
//                       </Badge>
//                     )
//                   ) : (
//                     <Badge variant="secondary" className="w-full justify-center py-2">
//                       Booking Closed
//                     </Badge>
//                   )}
//                 </CardFooter>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import '../../assets/ViewEvent.css';
// import RazorpayButton from '../common/RazoryPayButton'; 

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState('');
//   const [filterCity, setFilterCity] = useState('');
//   const [filterEventType, setFilterEventType] = useState('');

//   const token = localStorage.getItem("token");

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
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const bookEventWithoutSeats = async (booking) => {
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${booking.eventId}`,
//         {
//           quantity: booking.quantity,
//           selectedSeats: [],
//           organizerId: booking.organizerId,
//           stateId: booking.stateId,
//           cityId: booking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       alert("🎉 Booking successful!");
//       setBookingInfo(res.data.message);
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
//     }
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType ? event.eventType === filterEventType : true;
//     return matchName && matchCity && matchType;
//   });

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">Upcoming Events</h2>

//       <div className="row g-2 mb-4">
//         <div className="col-md-4">
//           <input type="text" className="form-control" placeholder="Search by Event Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
//         </div>
//         <div className="col-md-4">
//           <input type="text" className="form-control" placeholder="Search by City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
//         </div>
//         <div className="col-md-4">
//           <select className="form-select" value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)}>
//             <option value="">All Event Types</option>
//             <option value="Seminar">Seminar</option>
//             <option value="Workshop">Workshop</option>
//             <option value="ZoomMeeting">Zoom Meeting</option>
//             <option value="Concert">Concert</option>
//           </select>
//         </div>
//       </div>

//       {loading && <div className="text-center">Loading events...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}
//       {bookingInfo && <div className="alert alert-success text-center">{bookingInfo}</div>}

//       <div className="row">
//         {filteredEvents.map((event) => {
//           const eventEnded = new Date(event.endDate) < new Date();
//           const availableSeats = event.numberOfSeats - event.bookedSeats;

//           return (
//             <div className="col-md-4 mb-4" key={event._id}>
//               <div className="card h-100 shadow-sm">
//                 <img src={event.eventImgUrl} className="card-img-top" alt={event.eventName} style={{ height: '200px', objectFit: 'cover' }} />
//                 <div className="card-body">
//                   <h5 className="card-title">{event.eventName}</h5>
//                   <p className="card-text">
//                     <strong>Type:</strong> {event.eventType} <br />
//                     <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
//                     <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />

//                     {event.eventCategory === "ZoomMeeting" ? (
//                       <>
//                         <strong>Zoom URL:</strong> <a href={event.zoomUrl} target="_blank" rel="noreferrer">{event.zoomUrl}</a> <br />
//                       </>
//                     ) : (
//                       <>
//                         <strong>City:</strong> {event.cityId?.name} <br />
//                         {event.latitude && event.longitude && (
//                           <>
//                             <strong>Location:</strong> <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer">View on Map</a> <br />
//                           </>
//                         )}
//                       </>
//                     )}
//                     <strong>Available Seats:</strong> {availableSeats}
//                     {eventEnded && <span className="badge bg-danger mt-2 d-block">Event Ended</span>}
//                   </p>
//                 </div>

//                 <div className="card-footer text-center">
//                   {!eventEnded ? (
//                     availableSeats > 0 ? (
//                       event.eventCategory === "Indoor" ? (
//                         <Link to={`/select-seats/${event._id}`} className="btn btn-primary">
//                           Select Seats
//                         </Link>
//                       ) : (
//                         <>
//                           <select
//                             className="form-select mb-2"
//                             value={ticketQuantities[event._id] || 1}
//                             onChange={(e) =>
//                               setTicketQuantities({
//                                 ...ticketQuantities,
//                                 [event._id]: parseInt(e.target.value),
//                               })
//                             }
//                           >
//                             {Array.from({ length: availableSeats }, (_, i) => (
//                               <option key={i + 1} value={i + 1}>{i + 1} Ticket(s)</option>
//                             ))}
//                           </select>

//                           <RazorpayButton
//                             eventId={event._id}
//                             amount={(ticketQuantities[event._id] || 1) * event.ticketRate}
//                             onPaymentSuccess={async () => {
//                               const booking = {
//                                 eventId: event._id,
//                                 organizerId: event.organizerId,
//                                 quantity: ticketQuantities[event._id] || 1,
//                                 selectedSeats: [],
//                                 stateId: event.stateId?._id || event.stateId,
//                                 cityId: event.cityId?._id || event.cityId,
//                               };
//                               await bookEventWithoutSeats(booking);
//                             }}
//                           />
//                         </>
//                       )
//                     ) : <span className="text-danger">Sold Out</span>
//                   ) : <span className="text-muted">Booking Closed</span>}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };






