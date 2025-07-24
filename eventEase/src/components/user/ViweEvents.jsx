import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import RazorpayButton from '../common/RazoryPayButton';

export const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterEventType, setFilterEventType] = useState('');

  const token = localStorage.getItem("token");

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
    try {
      const res = await axios.get(`/event/getallevents`);
      setEvents(res.data.data);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
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
      setBookingInfo(res.data.message);
      getAllEvents();
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchType = filterEventType === 'all' || !filterEventType ? true : event.eventType === filterEventType;
    return matchName && matchCity && matchType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-gray-400 text-lg">Find and book your next unforgettable experience</p>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search by Event Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
          />
          <Input
            type="text"
            placeholder="Search by City"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
          />
          <Select value={filterEventType} onValueChange={setFilterEventType}>
            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="All Event Types" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Event Types</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
              <SelectItem value="Concert">Concert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-400">Loading amazing events...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {bookingInfo && (
          <div className="bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
            {bookingInfo}
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventEnded = new Date(event.endDate) < new Date();
            const availableSeats = event.numberOfSeats - event.bookedSeats;

            return (
              <Card 
                key={event._id} 
                className="bg-gray-800/50 border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={event.eventImgUrl}
                    alt={event.eventName}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  {eventEnded && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 right-2 bg-red-500/90"
                    >
                      Event Ended
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    {event.eventName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Type:</div>
                    <div className="text-gray-200">{event.eventType}</div>
                    
                    <div className="text-gray-400">Start:</div>
                    <div className="text-gray-200">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    
                    <div className="text-gray-400">End:</div>
                    <div className="text-gray-200">
                      {new Date(event.endDate).toLocaleDateString()}
                    </div>

                    {event.eventCategory === "ZoomMeeting" ? (
                      <>
                        <div className="text-gray-400">Zoom URL:</div>
                        <a 
                          href={event.zoomUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline truncate"
                        >
                          Join Meeting
                        </a>
                      </>
                    ) : (
                      <>
                        <div className="text-gray-400">City:</div>
                        <div className="text-gray-200">{event.cityId?.name}</div>
                        
                        {event.latitude && event.longitude && (
                          <>
                            <div className="text-gray-400">Location:</div>
                            <a
                              href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              View on Map
                            </a>
                          </>
                        )}
                      </>
                    )}
                    
                    <div className="text-gray-400">Available Seats:</div>
                    <div className="text-gray-200">{availableSeats}</div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 border-t border-gray-700 bg-gray-800/30 p-4">
                  {!eventEnded ? (
                    availableSeats > 0 ? (
                      event.eventCategory === "Indoor" ? (
                        <Link to={`/select-seats/${event._id}`} className="w-full">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Select Seats
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Select
                            value={String(ticketQuantities[event._id] || 1)}
                            onValueChange={(value) =>
                              setTicketQuantities({
                                ...ticketQuantities,
                                [event._id]: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select quantity" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: availableSeats }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {i + 1} Ticket(s)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <RazorpayButton
                            eventId={event._id}
                            amount={(ticketQuantities[event._id] || 1) * event.ticketRate}
                            onPaymentSuccess={async () => {
                              const booking = {
                                eventId: event._id,
                                organizerId: event.organizerId,
                                quantity: ticketQuantities[event._id] || 1,
                                selectedSeats: [],
                                stateId: event.stateId?._id || event.stateId,
                                cityId: event.cityId?._id || event.cityId,
                              };
                              await bookEventWithoutSeats(booking);
                            }}
                          />
                        </>
                      )
                    ) : (
                      <Badge variant="destructive" className="w-full justify-center py-2">
                        Sold Out
                      </Badge>
                    )
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      Booking Closed
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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






