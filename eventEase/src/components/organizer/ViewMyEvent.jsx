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
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';

export const ViewMyEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const [organizerId, setOrganizerId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getOrganizerId = async () => {
    try {
      const res = await axios.get("/organizer/organizer/self", {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getOrganizerId();
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (organizerId) getAllEvents();
  }, [organizerId]);

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        { stateId, cityId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Seat(s) booked successfully!");
      setBookedTickets((prev) => ({ ...prev, [eventId]: res.data.data.ticket }));
      getAllEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    }
  };

  const handleContactUs = () => {
    window.location.href = '/organizer#contactus';
  };

  // Filter events by status
  const filterEventsByStatus = (status) => {
    if (status === 'all') return events;
    return events.filter(event => event.approvalStatus === status);
  };

  const approvedEvents = filterEventsByStatus('Approved');
  const pendingEvents = filterEventsByStatus('Pending');
  const rejectedEvents = filterEventsByStatus('Rejected');

  const getDisplayEvents = () => {
    switch(activeTab) {
      case 'approved': return approvedEvents;
      case 'pending': return pendingEvents;
      case 'rejected': return rejectedEvents;
      default: return events;
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

  const EventCard = ({ event }) => {
    const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
    const booked = bookedTickets[event._id];
    const eventEnded = new Date(event.endDate) < new Date();
    const isRejected = event.approvalStatus === 'Rejected';

    return (
      <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-gray-950 text-gray-900 dark:text-gray-100 h-120 flex flex-col">
        <div className="relative overflow-hidden">
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
          {!eventEnded && (
            <>
              {event.approvalStatus === "Pending" && (
                <Badge className="absolute top-2 right-2 bg-yellow-400 text-gray-900">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
              {event.approvalStatus === "Approved" && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
              {event.approvalStatus === "Rejected" && (
                <Badge className="absolute top-2 right-2 bg-red-500">
                  <XCircle className="w-3 h-3 mr-1" />
                  Rejected
                </Badge>
              )}
            </>
          )}
        </div>

        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{event.eventName}</CardTitle>
          <CardDescription className="flex gap-2">
            <Badge variant="outline">{event.eventType}</Badge>
            <Badge variant="secondary">{event.eventCategory}</Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
          </div>

          {event.eventCategory === "Outdoor" && (
            <>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.stateId?.Name}, {event.cityId?.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Ticket className="w-4 h-4 mr-2" />
                <span>₹{event.ticketRate}</span>
              </div>
            </>
          )}
          {event.eventCategory === "Indoor" && event.stadiumId?.location?.address && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.stadiumId.location.address}</span>
            </div>
          )}
          {event.eventCategory === "ZoomMeeting" && event.zoomUrl && (
            <div className="flex items-center text-sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                Join Zoom Meeting
              </a>
            </div>
          )}
          {event.latitude && event.longitude && (
            <div className="flex items-center">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  Get Directions
                </Button>
              </a>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Users className="w-4 h-4 mr-2" />
            <span>{availableSeats} seats available</span>
          </div>

          {!eventEnded && event.eventType === "Indoor" && (
            <div className="space-y-2 pt-2">
              <Input
                type="number"
                min="1"
                max={availableSeats}
                placeholder="Number of seats"
                value={bookingQuantity[event._id] || 1}
                onChange={(e) =>
                  setBookingQuantity((prev) => ({
                    ...prev,
                    [event._id]: parseInt(e.target.value),
                  }))
                }
              />
              <Button
                className="w-full"
                disabled={availableSeats <= 0 || !event.isApproved}
                onClick={() =>
                  handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
                }
              >
                <Ticket className="w-4 h-4 mr-2" />
                Book Seats
              </Button>
            </div>
          )}

          {booked && (
            <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
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
          
          {isRejected && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="space-y-2">
                  <div><strong>Event Rejected</strong></div>
                  {event.rejectionReason ? (
                    <div className="text-sm">Reason: {event.rejectionReason}</div>
                  ) : (
                    <div className="text-sm italic text-gray-500 dark:text-gray-400">No reason provided by admin.</div>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                    onClick={handleContactUs}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
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
            <AlertDialogContent className="dark:bg-gray-900">
              <AlertDialogHeader>
                <AlertDialogTitle className="dark:text-gray-100">Delete Event</AlertDialogTitle>
                <AlertDialogDescription className="dark:text-gray-300">
                  Are you sure you want to delete "{event.eventName}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-100">Cancel</AlertDialogCancel>
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
  };

  const displayEvents = getDisplayEvents();

  return (
    // FIXED: Changed from h-screen w-screen to min-h-screen w-full
    <div className="min-h-screen w-full mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            My Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Manage and track all the events you've created. View bookings, update details, or create new events.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="min-w-[120px]"
          >
            All Events ({events.length})
          </Button>
          <Button
            variant={activeTab === 'approved' ? 'default' : 'outline'}
            onClick={() => setActiveTab('approved')}
            className="min-w-[120px]"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved ({approvedEvents.length})
          </Button>
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
            className="min-w-[120px]"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingEvents.length})
          </Button>
          <Button
            variant={activeTab === 'rejected' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rejected')}
            className="min-w-[120px]"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejected ({rejectedEvents.length})
          </Button>
        </div>

        {/* <div className="bg-gray-900 rounded-xl shadow-sm border p-8 dark:bg-gray-800 dark:border-gray-700"> */}
          {loading ? (
            <LoadingSkeleton />
          ) : displayEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-700 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No {activeTab !== 'all' ? activeTab : ''} events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeTab === 'all' 
                  ? "You haven't created any events yet. Get started by adding your first event!"
                  : `You don't have any ${activeTab} events at the moment.`
                }
              </p>
              {activeTab === 'all' && (
                <Button onClick={() => window.location.href = "/organizer/addevent"}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    // </div>
  );
};




// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
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
// import { 
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog';
// import { Skeleton } from '@/components/ui/skeleton';
// import { 
//   Calendar,
//   MapPin,
//   Users,
//   ExternalLink,
//   Edit,
//   Trash2,
//   Ticket,
//   CheckCircle,
//   Clock,
//   XCircle,
//   Mail,
//   Phone
// } from 'lucide-react';

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [organizerId, setOrganizerId] = useState(null);
//   const [activeTab, setActiveTab] = useState('all');

//   const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

//   const getOrganizerId = async () => {
//     try {
//       const res = await axios.get("/organizer/organizer/self", {
//         headers: { Authorization: `Bearer ${token}` },
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
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) getOrganizerId();
//     else setLoading(false);
//   }, []);

//   useEffect(() => {
//     if (organizerId) getAllEvents();
//   }, [organizerId]);

//   const handleDelete = async (eventId) => {
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`, {
//         headers: { Authorization: `Bearer ${token}` },
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
//         { stateId, cityId, quantity },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({ ...prev, [eventId]: res.data.data.ticket }));
//       getAllEvents();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
//     }
//   };

//   const handleContactUs = () => {
//     window.location.href = '/organizer#contactus';
//   };

//   // Filter events by status
//   const filterEventsByStatus = (status) => {
//     if (status === 'all') return events;
//     return events.filter(event => event.approvalStatus === status);
//   };

//   const approvedEvents = filterEventsByStatus('Approved');
//   const pendingEvents = filterEventsByStatus('Pending');
//   const rejectedEvents = filterEventsByStatus('Rejected');

//   const getDisplayEvents = () => {
//     switch(activeTab) {
//       case 'approved': return approvedEvents;
//       case 'pending': return pendingEvents;
//       case 'rejected': return rejectedEvents;
//       default: return events;
//     }
//   };

//   const LoadingSkeleton = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {[1, 2, 3].map((i) => (
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

//   const EventCard = ({ event }) => {
//     const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//     const booked = bookedTickets[event._id];
//     const eventEnded = new Date(event.endDate) < new Date();
//     const isRejected = event.approvalStatus === 'Rejected';

//     return (
//       <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-gray-950 text-gray-100">
//       {/* <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden dark:bg-black "> */}
//         <div className="relative overflow-hidden">
//           <img
//             src={event.eventImgUrl}
//             alt={event.eventName}
//             className="w-full h-48 object-cover rounded-t-lg"
//           />
//           {eventEnded && (
//             <Badge className="absolute top-2 right-2 bg-green-500">
//               <CheckCircle className="w-3 h-3 mr-1" />
//               Completed
//             </Badge>
//           )}
//           {!eventEnded && (
//             <>
//               {event.approvalStatus === "Pending" && (
//                 <Badge className="absolute top-2 right-2 bg-yellow-400 text-gray-900">
//                   <Clock className="w-3 h-3 mr-1" />
//                   Pending
//                 </Badge>
//               )}
//               {event.approvalStatus === "Approved" && (
//                 <Badge className="absolute top-2 right-2 bg-green-500">
//                   <CheckCircle className="w-3 h-3 mr-1" />
//                   Approved
//                 </Badge>
//               )}
//               {event.approvalStatus === "Rejected" && (
//                 <Badge className="absolute top-2 right-2 bg-red-500">
//                   <XCircle className="w-3 h-3 mr-1" />
//                   Rejected
//                 </Badge>
//               )}
//             </>
//           )}
//         </div>

//         <CardHeader className="pb-4">
//           <CardTitle className="text-xl">{event.eventName}</CardTitle>
//           <CardDescription className="flex gap-2">
//             <Badge variant="outline">{event.eventType}</Badge>
//             <Badge variant="secondary">{event.eventCategory}</Badge>
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="flex-grow space-y-3">
//           <div className="flex items-center text-sm text-gray-600">
//             <Calendar className="w-4 h-4 mr-2 dark:text-gray-100" />
//             <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
//           </div>

//           {event.eventCategory === "Outdoor" && (
//             <>
//               <div className="flex items-center text-sm text-gray-600">
//                 <MapPin className="w-4 h-4 mr-2 dark:text-gray-100" />
//                 <span>{event.stateId?.Name}, {event.cityId?.name}</span>
//               </div>
//               <div className="flex items-center text-sm text-gray-600">
//                 <Ticket className="w-4 h-4 mr-2 dark:text-gray-100" />
//                 <span>₹{event.ticketRate}</span>
//               </div>
//             </>
//           )}
//           {event.eventCategory === "Indoor" && event.stadiumId?.location?.address && (
//             <div className="flex items-center text-sm text-gray-600">
//               <MapPin className="w-4 h-4 mr-2 dark:text-gray-100" />
//               <span>{event.stadiumId.location.address}</span>
//             </div>
//           )}
//           {event.eventCategory === "ZoomMeeting" && event.zoomUrl && (
//             <div className="flex items-center text-sm">
//               <ExternalLink className="w-4 h-4 mr-2 dark:text-gray-100" />
//               <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                 Join Zoom Meeting
//               </a>
//             </div>
//           )}
//           {event.latitude && event.longitude && (
//             <div className="flex items-center">
//               <a href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">
//                 <Button variant="outline" size="sm" className="text-xs">
//                   <MapPin className="w-3 h-3 mr-1 dark:text-gray-100" />
//                   Get Directions
//                 </Button>
//               </a>
//             </div>
//           )}

//           <div className="flex items-center text-sm text-gray-600">
//             <Users className="w-4 h-4 mr-2" />
//             <span>{availableSeats} seats available</span>
//           </div>

//           {!eventEnded && event.eventType === "Indoor" && (
//             <div className="space-y-2 pt-2">
//               <Input
//                 type="number"
//                 min="1"
//                 max={availableSeats}
//                 placeholder="Number of seats"
//                 value={bookingQuantity[event._id] || 1}
//                 onChange={(e) =>
//                   setBookingQuantity((prev) => ({
//                     ...prev,
//                     [event._id]: parseInt(e.target.value),
//                   }))
//                 }
//               />
//               <Button
//                 className="w-full"
//                 disabled={availableSeats <= 0 || !event.isApproved}
//                 onClick={() =>
//                   handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                 }
//               >
//                 <Ticket className="w-4 h-4 mr-2" />
//                 Book Seats
//               </Button>
//             </div>
//           )}

//           {booked && (
//             <Alert className="mt-4">
//               <CheckCircle className="h-4 w-4" />
//               <AlertDescription>
//                 <div className="space-y-1">
//                   <div><strong>Ticket Booked!</strong></div>
//                   <div>Quantity: {booked.quantity}</div>
//                   <div>Ticket ID: {booked._id}</div>
//                   {booked.selectedSeats?.length > 0 && (
//                     <div>Seats: {booked.selectedSeats.join(', ')}</div>
//                   )}
//                 </div>
//               </AlertDescription>
//             </Alert>
//           )}
          
//            {isRejected && (
//            <Alert className="border-red-200 bg-red-50">
//            <XCircle className="h-4 w-4 text-red-600" />
//            <AlertDescription className="text-red-800">
//            <div className="space-y-2">
//           <div><strong>Event Rejected</strong></div>

//             {event.rejectionReason ? (
//            <div className="text-sm">Reason: {event.rejectionReason}</div>
//              ) : (
//             <div className="text-sm italic text-gray-500">No reason provided by admin.</div>
//             )}

//              <Button 
//              size="sm" 
//              variant="outline" 
//              className="w-full mt-2 border-red-300 text-red-700 hover:bg-red-100"
//              onClick={handleContactUs}
//              >
//             <Mail className="w-4 h-4 mr-2" />
//              Contact Support
//             </Button>
//             </div>
//            </AlertDescription>
//           </Alert>
//            )}


         
//         </CardContent>

//         <CardFooter className="flex gap-2 pt-4">
//           <Button 
//             variant="outline" 
//             size="sm" 
//             className="flex-1"
//             onClick={() => window.location.href = `/updateevent/${event._id}`}
//           >
//             <Edit className="w-4 h-4 mr-1" />
//             Edit
//           </Button>
          
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button variant="destructive" size="sm" className="flex-1">
//                 <Trash2 className="w-4 h-4 mr-1" />
//                 Delete
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Delete Event</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   Are you sure you want to delete "{event.eventName}"? This action cannot be undone.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={() => handleDelete(event._id)}
//                   className="bg-red-600 hover:bg-red-700"
//                 >
//                   Delete Event
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         </CardFooter>
//       </Card>
//     );
//   };

//   const displayEvents = getDisplayEvents();

//   return (
//     <div className="h-screen w-screen mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-700  text-gray-900 dark:text-gray-100">

//     {/* <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-12 dark:bg-gray-800"> */}
//       {/* <div className="container mx-auto px-4"> */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">My Events</h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-100">
//             Manage and track all the events you've created. View bookings, update details, or create new events.
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="mb-8 flex flex-wrap gap-2 justify-center">
//           <Button
//             variant={activeTab === 'all' ? 'default' : 'outline'}
//             onClick={() => setActiveTab('all')}
//             className="min-w-[120px]"
//           >
//             All Events ({events.length})
//           </Button>
//           <Button
//             variant={activeTab === 'approved' ? 'default' : 'outline'}
//             onClick={() => setActiveTab('approved')}
//             className="min-w-[120px]"
//           >
//             <CheckCircle className="w-4 h-4 mr-2" />
//             Approved ({approvedEvents.length})
//           </Button>
//           <Button
//             variant={activeTab === 'pending' ? 'default' : 'outline'}
//             onClick={() => setActiveTab('pending')}
//             className="min-w-[120px]"
//           >
//             <Clock className="w-4 h-4 mr-2" />
//             Pending ({pendingEvents.length})
//           </Button>
//           <Button
//             variant={activeTab === 'rejected' ? 'default' : 'outline'}
//             onClick={() => setActiveTab('rejected')}
//             className="min-w-[120px]"
//           >
//             <XCircle className="w-4 h-4 mr-2" />
//             Rejected ({rejectedEvents.length})
//           </Button>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-8 dark:bg-gray-900">
//           {loading ? (
//             <LoadingSkeleton />
//           ) : displayEvents.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
//                 <Calendar className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No {activeTab !== 'all' ? activeTab : ''} events found
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 {activeTab === 'all' 
//                   ? "You haven't created any events yet. Get started by adding your first event!"
//                   : `You don't have any ${activeTab} events at the moment.`
//                 }
//               </p>
//               {activeTab === 'all' && (
//                 <Button onClick={() => window.location.href = "/organizer/addevent"}>
//                   <Calendar className="w-4 h-4 mr-2" />
//                   Create Your First Event
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {displayEvents.map((event) => (
//                 <EventCard key={event._id} event={event} />
//               ))}
//             </div>
//           )}
//         </div>
//       {/* </div> */}
//     </div>
//   );
// };


















