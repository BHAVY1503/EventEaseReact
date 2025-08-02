import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Mail, MapPin, Users, IndianRupee, ArrowLeft, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingsOfMyEvents = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: In production, use React state instead of localStorage
  const token = localStorage.getItem("token"); // Replace with actual token from state

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("/tickets/organizer/self", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTickets(res.data.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTickets();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookings of My Events</h1>
          <Alert className="max-w-md mx-auto">
            <Ticket className="h-4 w-4" />
            <AlertDescription className="text-lg">
              No bookings yet for your events.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Group tickets by event
  const groupedByEvent = tickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId?._id;
    if (!acc[eventId]) acc[eventId] = { event: ticket.eventId, tickets: [] };
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bookings of My Events</h1>
        <p className="text-gray-600">Manage and view all bookings for your events</p>
      </div>
      
      <div className="space-y-6">
        {Object.values(groupedByEvent).map(({ event, tickets }) => (
          <Card key={event._id} className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{event.eventName}</h3>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                    {event.eventType}
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center text-white/90 mb-1">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Start: {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-white/90">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    End: {new Date(event.endDate).toLocaleDateString()}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket._id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-white shadow-sm border">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium">Booked By:</span>
                        </div>
                        <p className="text-gray-900 font-semibold ml-6">
                          {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"}
                        </p>
                        
                        <div className="flex items-center text-gray-700 mt-2">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium">Email:</span>
                        </div>
                        <p className="text-gray-600 ml-6 break-words">
                          {ticket.userId?.email || ticket.organizerId?.email || "N/A"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <Ticket className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">Quantity:</span>
                          <Badge variant="outline" className="ml-2">{ticket.quantity}</Badge>
                        </div>
                        
                        <div className="flex items-center text-gray-700 mt-2">
                          <MapPin className="w-4 h-4 mr-2 text-red-600" />
                          <span className="font-medium">Location:</span>
                        </div>
                        <p className="text-gray-600 ml-6">
                          {ticket.cityId?.name || "N/A"}, {ticket.stateId?.Name || "N/A"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">Booked at:</span>
                        </div>
                        <div className="ml-6">
                          <p className="text-lg font-bold text-green-700">
                            ₹{ticket.ticketRate}
                          </p>
                          <p className="text-sm text-gray-500">
                            ({ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""})
                          </p>
                        </div>
                      </div>
                    </div>

                    {event.eventCategory === "Indoor" && ticket.selectedSeats?.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Selected Seats:</h4>
                        <div className="flex flex-wrap gap-2">
                          {ticket.selectedSeats.map((seat, seatIndex) => (
                            <Badge key={seatIndex} variant="default" className="bg-blue-600 hover:bg-blue-700">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {index < tickets.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/organizer">
        <Button href="/" variant="outline" size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        </Link>
      </div>
    </div>
  );
};


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const BookingsOfMyEvents = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get("/tickets/organizer/self", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setTickets(res.data.data);
//       } catch (err) {
//         console.error("Error fetching tickets:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchTickets();
//     }
//   }, [token]);

//   if (loading) return <h4 className='text-center mt-4'>Loading bookings...</h4>;
//   if (!tickets.length) return <h5 className='text-center mt-4'>No bookings yet.</h5>;

//   // Group tickets by event
//   const groupedByEvent = tickets.reduce((acc, ticket) => {
//     const eventId = ticket.eventId?._id;
//     if (!acc[eventId]) acc[eventId] = { event: ticket.eventId, tickets: [] };
//     acc[eventId].tickets.push(ticket);
//     return acc;
//   }, {});

//   return (
//     <div className="container mt-5 alert alert-primary">
//       <h2 className="text-center">Bookings of My Events</h2>
      
//       {Object.values(groupedByEvent).map(({ event, tickets }) => (
//         <div key={event._id} className="card my-4">
//           <div className="card-header bg-dark text-white">
//             <h5 style={{color:'#fff'}}>{event.eventName} ({event.eventType})</h5>
//             <small>Start Date: {new Date(event.startDate).toLocaleDateString()}</small><br />
//             <small>End Date: {new Date(event.endDate).toLocaleDateString()}</small>
//           </div>
//           <div className="card-body">
//             {tickets.map((ticket) => (
//               <div key={ticket._id} className="mb-3 border-bottom pb-2">
//                 <p>
//                   <strong>Booked By:</strong>{" "}
//                   {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"} <br />
//                   <strong>Email:</strong>{" "}
//                   {ticket.userId?.email || ticket.organizerId?.email || "N/A"} <br />
//                   <strong>Quantity:</strong> {ticket.quantity} <br />
//                   <strong>City:</strong> {ticket.cityId?.name || "N/A"}, 
//                   <strong> State:</strong> {ticket.stateId?.Name || "N/A"} <br />
//                   {/* <strong>Booked at ₹:</strong> {ticket.ticketRate || "N/A"} <br /> */}


//                   <strong>Booked at:</strong>  
//                   {/* {typeof ticket.ticketRate === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(ticket.ticketRate) : "N/A"} <br /> */}
//                       ₹{ticket.ticketRate} ({ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""})

//                 </p>


//                 {event.eventCategory === "Indoor" && ticket.selectedSeats?.length > 0 && (
//                   <div className="mb-2">
//                     <strong>Selected Seats:</strong>
//                     <div className="d-flex flex-wrap gap-2 mt-1">
//                       {ticket.selectedSeats.map((seat, index) => (
//                         <span key={index} className="badge bg-info">{seat}</span>
//                       ))}
//                     </div>
//                      {/* <p className="mt-2">
//                      <strong>Total Price:</strong> ₹{ticket.ticketRate} ({ticket.selectedSeats.length} seat{ticket.selectedSeats.length > 1 ? "s" : ""})
//                      </p> */}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}

//       <div className="text-center">
//         <a href="/organizer" className="btn btn-outline-primary">Back to Home</a>
//       </div>
//     </div>
//   );
// };


