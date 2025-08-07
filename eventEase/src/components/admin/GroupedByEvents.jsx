import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  Ticket,
  User,
  Mail,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Badge as BadgeIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Minus,
  Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const GroupedByEvents = () => {
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [bookingLoading, setBookingLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const token = localStorage.getItem("token");

  const fetchGroupedEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/event/groupedeventsbyorganizer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupedEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching grouped events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGroupedEvents();
    } else {
      console.error("Token not found");
      setLoading(false);
    }
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    setDeleteLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchGroupedEvents();
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    } finally {
      setDeleteLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    setBookingLoading(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const res = await axios.post(
        `/event/bookseat/${eventId}`,
        { stateId, cityId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Seat(s) booked successfully!");
      setBookedTickets((prev) => ({
        ...prev,
        [eventId]: res.data.data.ticket,
      }));
      fetchGroupedEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    } finally {
      setBookingLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const toggleGroup = (index) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const adjustQuantity = (eventId, change) => {
    setBookingQuantity(prev => {
      const currentQuantity = prev[eventId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);
      return { ...prev, [eventId]: newQuantity };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-700">Loading grouped events...</h3>
          <p className="text-gray-500">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Events Analytics
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive view of events organized by each organizer on the platform
        </p>
        <Badge variant="secondary" className="px-4 py-2">
          <AlertCircle className="w-4 h-4 mr-2" />
          Admin View Only
        </Badge>
      </div>

      {groupedEvents.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
            <p className="text-gray-500">There are currently no events to display.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-full">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Organizers</p>
                    <p className="text-2xl font-bold text-blue-900">{groupedEvents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-600 rounded-full">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Events</p>
                    <p className="text-2xl font-bold text-green-900">
                      {groupedEvents.reduce((acc, group) => acc + group.events.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-full">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Total Seats</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {groupedEvents.reduce((acc, group) => 
                        acc + group.events.reduce((eventAcc, event) => eventAcc + event.numberOfSeats, 0), 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizer Groups */}
          <div className="space-y-4">
            {groupedEvents.map((group, index) => (
              <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Collapsible open={expandedGroups[index]} onOpenChange={() => toggleGroup(index)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                              {group.organizerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {group.organizerName}
                            </CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              <Mail className="w-4 h-4" />
                              <span>{group.organizerEmail}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="px-3 py-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {group.events.length} Events
                          </Badge>
                          {expandedGroups[index] ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <Separator />
                    <CardContent className="p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {group.events.map((event) => {
                          const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
                          const booked = bookedTickets[event._id];
                          const eventEnded = new Date(event.endDate) < new Date();
                          const currentQuantity = bookingQuantity[event._id] || 1;

                          return (
                            <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="relative">
                                <img
                                  src={event.eventImgUrl}
                                  alt={event.eventName}
                                  className="w-full h-48 object-cover"
                                />
                                {eventEnded && (
                                  <Badge className="absolute top-3 right-3 bg-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              
                              <CardContent className="p-4 space-y-3">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 mb-2">{event.eventName}</h3>
                                  <Badge variant="outline" className="mb-3">
                                    <BadgeIcon className="w-3 h-3 mr-1" />
                                    {event.eventType}
                                  </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                    <span>-</span>
                                    <span>{new Date(event.endDate).toLocaleDateString()}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.stateId?.Name}, {event.cityId?.name}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{availableSeats} seats available</span>
                                  </div>
                                </div>

                                {event.eventType === "ZoomMeeting" && event.zoomUrl && (
                                  <Button variant="outline" size="sm" className="w-full" asChild>
                                    <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Join Zoom Meeting
                                    </a>
                                  </Button>
                                )}

                                {event.latitude && event.longitude && event.eventType !== "ZoomMeeting" && (
                                  <Button variant="outline" size="sm" className="w-full" asChild>
                                    <a
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <MapPin className="w-4 h-4 mr-2" />
                                      View Directions
                                    </a>
                                  </Button>
                                )}

                                {!eventEnded && availableSeats > 0 && (
                                  <div className="space-y-3 pt-3 border-t">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => adjustQuantity(event._id, -1)}
                                        disabled={currentQuantity <= 1}
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        max={availableSeats}
                                        value={currentQuantity}
                                        onChange={(e) =>
                                          setBookingQuantity((prev) => ({
                                            ...prev,
                                            [event._id]: Math.max(1, Math.min(availableSeats, parseInt(e.target.value) || 1)),
                                          }))
                                        }
                                        className="w-20 text-center"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => adjustQuantity(event._id, 1)}
                                        disabled={currentQuantity >= availableSeats}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      className="w-full"
                                      disabled={bookingLoading[event._id]}
                                      onClick={() =>
                                        handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
                                      }
                                    >
                                      {bookingLoading[event._id] ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Booking...
                                        </>
                                      ) : (
                                        <>
                                          <Ticket className="w-4 h-4 mr-2" />
                                          Book {currentQuantity} Seat{currentQuantity > 1 ? 's' : ''}
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {booked && (
                                  <Alert className="mt-3">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                      <strong>Ticket Booked!</strong><br />
                                      Quantity: {booked.quantity} | ID: {booked._id}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </CardContent>
                              
                              <CardFooter className="p-4 bg-gray-50 flex space-x-2">
                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                  <Link to={`/updateevent/${event._id}`}>
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                  disabled={deleteLoading[event._id]}
                                  onClick={() => handleDelete(event._id)}
                                >
                                  {deleteLoading[event._id] ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 mr-1" />
                                  )}
                                  Delete
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const GroupedByEvents = () => {
//   const [groupedEvents, setGroupedEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const token = localStorage.getItem("token");

//   const fetchGroupedEvents = async () => {
//     try {
//       const res = await axios.get(`/event/groupedeventsbyorganizer`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setGroupedEvents(res.data.data);
//     } catch (err) {
//       console.error("Error fetching grouped events:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchGroupedEvents();
//     } else {
//       console.error("Token not found");
//       setLoading(false);
//     }
//   }, []);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       fetchGroupedEvents();
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${eventId}`,
//         { stateId, cityId, quantity },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       fetchGroupedEvents();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
//     }
//   };

//   return (
//     <div className='container mt-5' style={{marginTop:""}}>
//       <h2 className='text-center'>Events Grouped by Organizer</h2>
//       <p className='text-center mb-4 text-muted'>This data is visible to admins</p>

//       {loading ? (
//         <div className='text-center'>
//           <h5>Loading grouped events...</h5>
//         </div>
//       ) : groupedEvents.length === 0 ? (
//         <div className='text-center'>
//           <h6>No events found.</h6>
//         </div>
//       ) : (
//         <div className="accordion alert alert-primary" id="organizerAccordion">
//           {groupedEvents.map((group, index) => (
//             <div className="accordion-item mb-3" key={index}>
//               <h2 className="accordion-header" id={`heading${index}`}>
//                 <button
//                   className="accordion-button collapsed"
//                   type="button"
//                   data-bs-toggle="collapse"
//                   data-bs-target={`#collapse${index}`}
//                   aria-expanded="false"
//                   aria-controls={`collapse${index}`}
//                 >
//                   Organizer: {group.organizerName} ({group.organizerEmail})
//                 </button>
//               </h2>
//               <div
//                 id={`collapse${index}`}
//                 className="accordion-collapse collapse"
//                 aria-labelledby={`heading${index}`}
//                 data-bs-parent="#organizerAccordion"
//               >
//                 <div className="accordion-body bg-light">
//                   <div className="row">
//                     {group.events.map((event) => {
//                       const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//                       const booked = bookedTickets[event._id];
//                       const eventEnded = new Date(event.endDate) < new Date();

//                       return (
//                         <div className="col-md-4 mb-4" key={event._id}>
//                           <div className="card h-100 shadow-sm">
//                             <img
//                               src={event.eventImgUrl}
//                               className="card-img-top"
//                               alt={event.eventName}
//                               style={{ height: '200px', objectFit: 'cover' }}
//                             />
//                             <div className="card-body">
//                               <h5 className="card-title">{event.eventName}</h5>
//                               <p className="card-text">
//                                 <strong>Type:</strong> {event.eventType}<br />
//                                 <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                                 <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                                 <strong>State:</strong> {event.stateId?.Name}<br />
//                                 <strong>City:</strong> {event.cityId?.name}<br />
//                                 {event.eventType === "ZoomMeeting" ? (
//                                   <>
//                                     <strong>Zoom URL:</strong>{" "}
//                                     <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                                       {event.zoomUrl}
//                                     </a><br />
//                                   </>
//                                 ) : event.latitude && event.longitude && (
//                                   <>
//                                     <strong>Location:</strong>{" "}
//                                     <a
//                                       className="btn btn-sm btn-outline-primary"
//                                       href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                     >
//                                       View Directions
//                                     </a><br />
//                                   </>
//                                 )}
//                                 <strong>Available Seats:</strong> {availableSeats}<br />
//                                 {eventEnded && (
//                                   <span className="badge bg-success mt-2">Event Ended</span>
//                                 )}
//                               </p>

//                               {!eventEnded && (
//                                 <>
//                                   <input
//                                     type="number"
//                                     min="1"
//                                     max={availableSeats}
//                                     className="form-control mb-2"
//                                     placeholder="Number of seats"
//                                     value={bookingQuantity[event._id] || ''}
//                                     onChange={(e) =>
//                                       setBookingQuantity((prev) => ({
//                                         ...prev,
//                                         [event._id]: parseInt(e.target.value),
//                                       }))
//                                     }
//                                   />
//                                   <button
//                                     className="btn btn-success btn-sm w-100"
//                                     disabled={availableSeats <= 0}
//                                     onClick={() =>
//                                       handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                                     }
//                                   >
//                                     Book Seat
//                                   </button>
//                                 </>
//                               )}

//                               {booked && (
//                                 <div className="mt-2 alert alert-success p-2">
//                                   <strong>Ticket Booked:</strong><br />
//                                   Qty: {booked.quantity}<br />
//                                   ID: {booked._id}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="card-footer text-center">
//                               <Link to={`/updateevent/${event._id}`} className="btn btn-primary btn-sm me-2">
//                                 Update
//                               </Link>
//                               <button
//                                 className="btn btn-danger btn-sm"
//                                 onClick={() => handleDelete(event._id)}
//                               >
//                                 Delete
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };



