import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  Ticket,
  Clock,
  CheckCircle
} from 'lucide-react';

export const ViewMyEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const [organizerId, setOrganizerId] = useState(null);
  
  // Get token from localStorage in real app
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getOrganizerId = async () => {
    try {
      const res = await axios.get("organizer/organizer/self", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrganizerId(res.data.data._id);
    } catch (err) {
      console.error("Failed to fetch organizer ID", err);
      setLoading(false);
    }
  };

  const getAllEvents = async () => {
    try {
      const res = await axios.get(`/event/geteventbyorganizerid`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(res.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getOrganizerId();
    } else {
      console.error("Token not found");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (organizerId) {
      getAllEvents();
    }
  }, [organizerId]);

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh events after successful deletion
      getAllEvents();
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    try {
      const res = await axios.post(
        `/event/bookseat/${eventId}`,
        {
          userId: organizerId,
          stateId,
          cityId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Seat(s) booked successfully!");
      setBookedTickets((prev) => ({
        ...prev,
        [eventId]: res.data.data.ticket,
      }));
      // Refresh events to update available seats
      getAllEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">My Events</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and track all the events you've created. View bookings, update details, or create new events.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {loading ? (
            <LoadingSkeleton />
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">You haven't created any events yet. Get started by adding your first event!</p>
              <Button onClick={() => window.location.href = "/organizer/addevent"}>
                <Calendar className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
                const booked = bookedTickets[event._id];
                const eventEnded = new Date(event.endDate) < new Date();

                return (
                  <Card key={event._id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    {/* Event Image */}
                    <div className="relative">
                      <img
                        src={event.eventImgUrl}
                        alt={event.eventName}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {eventEnded && (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">{event.eventName}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mr-2">
                          {event.eventType}
                        </Badge>
                        <Badge variant="secondary">
                          {event.eventCategory}
                        </Badge>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow space-y-3">
                      {/* Date Info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Location/Category specific info */}
                      {event.eventCategory === "Outdoor" && (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{event.stateId?.Name}, {event.cityId?.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Ticket className="w-4 h-4 mr-2" />
                            <span>₹{event.ticketRate}</span>
                          </div>
                        </>
                      )}

                      {event.eventCategory === "Indoor" && event.stadiumId?.location?.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.stadiumId.location.address}</span>
                        </div>
                      )}

                      {/* Zoom Meeting */}
                      {event.eventCategory === "ZoomMeeting" && event.zoomUrl && (
                        <div className="flex items-center text-sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          <a
                            href={event.zoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Zoom Meeting
                          </a>
                        </div>
                      )}

                      {/* Map Directions */}
                      {event.latitude && event.longitude && (
                        <div className="flex items-center">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              Get Directions
                            </Button>
                          </a>
                        </div>
                      )}

                      {/* Available Seats */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{availableSeats} seats available</span>
                      </div>

                      {/* Booking Section */}
                      {!eventEnded && event.eventType === "Indoor" && (
                        <div className="space-y-2 pt-2">
                          <Input
                            type="number"
                            min="1"
                            max={availableSeats}
                            placeholder="Number of seats"
                            value={bookingQuantity[event._id] || ''}
                            onChange={(e) =>
                              setBookingQuantity((prev) => ({
                                ...prev,
                                [event._id]: parseInt(e.target.value),
                              }))
                            }
                          />
                          <Button
                            className="w-full"
                            disabled={availableSeats <= 0}
                            onClick={() =>
                              handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
                            }
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            Book Seats
                          </Button>
                        </div>
                      )}

                      {/* Booked Ticket Info */}
                      {booked && (
                        <Alert className="mt-4">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <div><strong>Ticket Booked!</strong></div>
                              <div>Quantity: {booked.quantity}</div>
                              <div>Ticket ID: {booked._id}</div>
                              {booked.selectedSeats?.length > 0 && (
                                <div>Seats: {booked.selectedSeats.join(', ')}</div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.location.href = `/updateevent/${event._id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{event.eventName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Event
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [organizerId, setOrganizerId] = useState(null);
//   const token = localStorage.getItem("token");

//   const getOrganizerId = async () => {
//     try {
//       const res = await axios.get("organizer/organizer/self", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setOrganizerId(res.data.data._id);
//     } catch (err) {
//       console.error("Failed to fetch organizer ID", err);
//       setLoading(false);
//     }
//   };

//   const getAllEvents = async () => {
//     try {
//       const res = await axios.get(`/event/geteventbyorganizerid`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       getOrganizerId();
//     } else {
//       console.error("Token not found");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (organizerId) {
//       getAllEvents();
//     }
//   }, [organizerId]);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       getAllEvents();
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
//         {
//           userId: organizerId,
//           stateId,
//           cityId,
//           quantity,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
//     }
//   };

//   return (
//     <div className='' style={{ marginTop: "70px" }}>
//       <h1 className='text-center'>MY EVENTS!</h1>
//       <p className='text-center mb-4'>Events added by you</p>

//       <div className='container mt-4 p-4 shadow bg-dark text-white rounded'>
//         {loading ? (
//           <div className='text-center'>
//             <h4>Loading your events...</h4>
//           </div>
//         ) : events.length === 0 ? (
//           <div className='text-center'>
//             <h5>No events found.</h5>
//             <p>Click <Link to="/organizer/addevent" className="text-info">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//               const booked = bookedTickets[event._id];
//               const eventEnded = new Date(event.endDate) < new Date();

//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body text-dark'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />

//                         {/* Conditional rendering based on category */}
//                         {event.eventCategory === "Outdoor" ? (
//                           <>
//                             <strong>State:</strong> {event.stateId?.Name}<br />
//                             <strong>City:</strong> {event.cityId?.name}<br />
//                             <strong>&#8377; Price:</strong> {event?.ticketRate}<br />

//                           </>
//                         ) : (
//                           <>
//                             <strong>Location:</strong> {event?.stadiumId?.location?.address || "N/A"}<br />
//                           </>
//                         )}

//                         {/* Zoom Meeting */}
//                         {event.eventCategory === "ZoomMeeting" && event.zoomUrl && (
//                           <>
//                             <strong>Zoom URL:</strong>{" "}
//                             <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                               {event.zoomUrl}
//                             </a><br />
//                           </>
//                         )}

//                         {/* Location Link for all events with coords */}
//                         {event.latitude && event.longitude && (
//                           <>
//                             <strong>Map:</strong>{" "}
//                             <a
//                               className='btn btn-sm btn-outline-primary'
//                               href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               View Directions
//                             </a><br />
//                           </>
//                         )}

//                         <strong>Available Seats:</strong> {availableSeats}<br />
//                         {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>

//                       {!eventEnded && event.eventType === "Indoor" && (
//                         <div>
//                           <input
//                             type="number"
//                             min="1"
//                             max={availableSeats}
//                             className="form-control mb-2"
//                             placeholder="Number of seats"
//                             value={bookingQuantity[event._id] || ''}
//                             onChange={(e) =>
//                               setBookingQuantity((prev) => ({
//                                 ...prev,
//                                 [event._id]: parseInt(e.target.value),
//                               }))
//                             }
//                           />
//                           <button
//                             className="btn btn-success btn-sm w-100"
//                             disabled={availableSeats <= 0}
//                             onClick={() =>
//                               handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                             }
//                           >
//                             Book Seat
//                           </button>
//                         </div>
//                       )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}<br />
//                           {booked.selectedSeats?.length > 0 && (
//                             <>
//                               <strong>Seats:</strong> {booked.selectedSeats.join(', ')}<br />
//                             </>
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };








