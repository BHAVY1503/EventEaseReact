import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const BookedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("/tickets/organizer/self", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(res.data.data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    if (token) fetchTickets();
  }, [token]);

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < now) return "past";
    if (start > now) return "upcoming";
    return "ongoing";
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case "past":
        return "bg-destructive";
      case "upcoming":
        return "bg-primary";
      case "ongoing":
        return "bg-green-600";
      default:
        return "bg-muted";
    }
  };

  const groupSeatsByZone = (seats) => {
    const zoneMap = {};
    seats?.forEach((label) => {
      const zone = label[0];
      if (!zoneMap[zone]) zoneMap[zone] = [];
      zoneMap[zone].push(label);
    });
    return zoneMap;
  };

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-6">🎫 Booked Tickets</h2>

        {tickets.length === 0 ? (
          <p className="text-center text-muted-foreground">No tickets booked yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              const event = ticket.eventId;
              const status = getEventStatus(event?.startDate, event?.endDate);
              const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
              const isIndoor = event?.eventCategory === "Indoor";
              const isZoom = event?.eventCategory === "ZoomMeeting";

              return (
                <Card key={ticket._id} className="shadow-md hover:shadow-lg transition">
                  {event?.eventImage && (
                    <img
                      src={event.eventImage}
                      alt="Event"
                      className="w-full h-48 object-cover rounded-t-md"
                    />
                  )}
                  <CardHeader className="flex justify-between items-start">
                    <CardTitle>{event?.eventName || "Unnamed Event"}</CardTitle>
                    <Badge className={getBadgeStyle(status)}>
                      {status.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <Separator />
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>📅 Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    <p><strong>🆔 Ticket ID:</strong> {ticket._id}</p>
                    <p><strong>💵 Booked at:</strong> ₹{ticket.ticketRate} ({ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""})</p>
                    <p><strong>Organizer:</strong> {ticket.organizerId?.name || "Unknown"}</p>

                    {!isZoom && (
                      <>
                        <p>
                          <strong>📍 Location:</strong> {ticket.cityId?.name}, {ticket.stateId?.Name}
                        </p>
                        {event?.latitude && event?.longitude && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="mt-1"
                          >
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📍 View Directions
                            </a>
                          </Button>
                        )}
                      </>
                    )}

                    {isZoom && event.zoomUrl && (
                      <p>
                        <strong>🔗 Zoom URL:</strong>{" "}
                        <a
                          href={event.zoomUrl}
                          className="underline text-blue-500"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Meeting
                        </a>
                      </p>
                    )}

                    {isIndoor && ticket.selectedSeats?.length > 0 && (
                      <div>
                        <strong>🎯 Selected Seats by Zone:</strong>
                        {Object.entries(groupedSeats).map(([zone, seats]) => (
                          <div key={zone} className="mt-2">
                            <div className="font-medium text-sm">Zone {zone}</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {seats.map((s, i) => (
                                <Tooltip key={i}>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-muted text-sm">
                                      {s}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Seat {s} in Zone {zone}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-6">
          <Button variant="outline" asChild>
            <a href="/organizer">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export const BookedTickets = () => {
//   const [tickets, setTickets] = useState([]);

//   useEffect(() => {
//     const fetchTickets = async () => {
//       // const organizerId = localStorage.getItem("organizerId");
//       // if (!organizerId) return;
//       const token = localStorage.getItem("token")

//       try {
//           const res = await axios.get("/tickets/organizer/self", {
//         headers: {
//         Authorization: `Bearer ${token}`,
//          },
//         });
//         setTickets(res.data.data || []);
//       } catch (error) {
//         console.error("Error fetching tickets:", error);
//       }
//     };

//     fetchTickets();
//   }, []);

//   if (!tickets.length) {
//     return <div className="container mt-4"><h4>No tickets booked yet.</h4></div>;
//   }

//   return (
//     <div className="container mt-4">
//       <h3>Booked Tickets</h3>
//       <table className="table table-bordered table-striped">
//         <thead>
//           <tr>
//             <th>Event Name</th>
//             <th>Event Type</th>
//             <th>Booked By organizer</th>
//             {/* <th>Booked By user</th> */}
//             {/* <th>Email</th> */}
//             <th>State</th>     
//             <th>City</th> 
//             {/* <th>organizer</th>  */}
//             <th>Quantity</th>
//             <th>Booking Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tickets.map((ticket, index) => (
//             <tr key={index}>
//               <td>{ticket.eventId?.eventName || "N/A"}</td>
//               <td>{ticket.eventId?.eventType || "N/A"}</td>
//               <td>{ticket.organizerId?.name || "Unknown"}</td>
//               {/* <td>{ticket.userId?.fullName || "Unknown"}</td> */}
//               <td>{ticket.stateId?.Name || "Unknown"}</td>
//               <td>{ticket.cityId?.name || "Unknown"}</td>
//               {/* <td>{ticket.organizerId?.name || "Unknown"}</td> */}
//               <td>{ticket.quantity}</td>
//               <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };


