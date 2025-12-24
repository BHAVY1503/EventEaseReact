import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Download, Loader2, Receipt, MapPin, Calendar, User, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const BookedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [downloadingTicket, setDownloadingTicket] = useState(null);
  const token = localStorage.getItem("token");
  const { toast } = useToast();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/tickets/organizer/self`, {
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
        return "bg-gray-500";
      case "upcoming":
        return "bg-blue-600";
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

  const calculateTotal = (ticket) => {
    return ticket.ticketRate * ticket.quantity;
  };

  const calculateTax = (ticket) => {
    const subtotal = calculateTotal(ticket);
    return (subtotal * 0.18).toFixed(2);
  };

  const calculateGrandTotal = (ticket) => {
    const subtotal = calculateTotal(ticket);
    const tax = parseFloat(calculateTax(ticket));
    return (subtotal + tax).toFixed(2);
  };

  const downloadInvoice = async (ticketId) => {
    setDownloadingTicket(ticketId);
    try {
      const response = await axios.get(
        `/tickets/invoice/${ticketId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Success!",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download invoice",
      });
    } finally {
      setDownloadingTicket(null);
    }
  };

  const printInvoice = (ticketId) => {
    const invoiceCard = document.getElementById(`invoice-${ticketId}`);
    if (!invoiceCard) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${ticketId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
            }
            .no-print { display: none !important; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${invoiceCard.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Helper to get location for display
  const getEventLocation = (event, ticket) => {
    if (event?.eventCategory === "ZoomMeeting") {
      return null;
    }
    
    // Try multiple location sources
    const location = 
      event?.location || 
      event?.stadiumId?.location?.address || 
      event?.stadiumId?.name ||
      (ticket.cityId?.name && ticket.stateId?.Name 
        ? `${ticket.cityId.name}, ${ticket.stateId.Name}` 
        : null);
    
    return location;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎟️ My Booked Tickets & Invoices
          </h2>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No tickets booked yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket) => {
                const event = ticket.eventId;
                const status = getEventStatus(event?.startDate, event?.endDate);
                const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
                const isIndoor = event?.eventCategory === "Indoor";
                const isZoom = event?.eventCategory === "ZoomMeeting";
                const today = new Date().toLocaleDateString();
                const location = getEventLocation(event, ticket);

                return (
                  <Card 
                    key={ticket._id} 
                    className="shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden bg-white"
                    id={`invoice-${ticket._id}`}
                  >
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Receipt className="w-5 h-5" />
                            <h1 className="text-xl font-bold">INVOICE</h1>
                          </div>
                          <div className="space-y-0.5 text-xs opacity-95">
                            <p className="font-mono">#{ticket._id.slice(-8).toUpperCase()}</p>
                            <p>{today}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={`${getBadgeStyle(status)} text-xs px-2 py-1 mb-2`}>
                            {status.toUpperCase()}
                          </Badge>
                          <p className="text-sm font-bold">EventEase</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3 bg-white">
                      {/* Event Image */}
                      {event?.eventImgUrl && (
                        <div className="relative rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={event.eventImgUrl}
                            alt={event.eventName}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-white/90 text-gray-800 text-xs border-0">
                              {event.eventType}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Event Info */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-base text-gray-900">
                          {event?.eventName || "Event"}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {new Date(event?.startDate).toLocaleDateString()} - {new Date(event?.endDate).toLocaleDateString()}
                        </div>

                        {location && (
                          <div className="flex items-start gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3 text-gray-600" />
                          {ticket.userId?.fullName || ticket.userId?.name || 'Guest User'}
                        </div>
                      </div>

                      {/* Seats */}
                      {isIndoor && ticket.selectedSeats?.length > 0 && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Seats</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(groupedSeats).map(([zone, seats]) => (
                              <div key={zone} className="flex gap-1">
                                {seats.slice(0, 5).map((s, i) => (
                                  <Badge 
                                    key={i}
                                    className="text-xs px-1.5 py-0 bg-white text-gray-800 border border-purple-300"
                                  >
                                    {s}
                                  </Badge>
                                ))}
                                {seats.length > 5 && (
                                  <Badge className="text-xs px-1.5 py-0 bg-white text-gray-800 border border-purple-300">
                                    +{seats.length - 5}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator className="bg-gray-200" />

                      {/* Pricing */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                        <div className="flex justify-between mb-1 text-gray-700">
                          <span>{ticket.quantity} × ₹{ticket.ticketRate.toLocaleString()}</span>
                          <span className="font-medium text-gray-900">₹{calculateTotal(ticket).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-1 text-gray-600">
                          <span>GST (18%)</span>
                          <span className="text-gray-900">₹{calculateTax(ticket)}</span>
                        </div>
                        <Separator className="my-1 bg-gray-300" />
                        <div className="flex justify-between font-bold text-sm">
                          <span className="text-gray-900">Total</span>
                          <span className="text-blue-600">₹{calculateGrandTotal(ticket)}</span>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="bg-green-50 p-2 rounded-lg border-l-2 border-green-500">
                        <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          PAID via Razorpay
                        </p>
                        {ticket.paymentId && (
                          <p className="text-xs text-gray-600 font-mono mt-0.5 truncate">
                            {ticket.paymentId}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 no-print">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printInvoice(ticket._id)}
                          className="text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Print
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => downloadInvoice(ticket._id)}
                          disabled={downloadingTicket === ticket._id}
                          className="text-xs h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                        >
                          {downloadingTicket === ticket._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              PDF
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Zoom/Directions */}
                      {isZoom && event?.zoomUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
                            🔗 Join Zoom
                          </a>
                        </Button>
                      )}
                      
                      {!isZoom && event?.latitude && event?.longitude && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📍 Directions
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
              <a href="/organizer">← Back to Home</a>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
// import { Download, FileText, Loader2 } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";

// export const BookedTickets = () => {
//   const [tickets, setTickets] = useState([]);
//   const [downloadingTicket, setDownloadingTicket] = useState(null);
//   const token = localStorage.getItem("token");
//   const { toast } = useToast();

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get(`/tickets/organizer/:organizerId`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setTickets(res.data.data);
//       } catch (error) {
//         console.error("Error fetching tickets:", error);
//       }
//     };
//     if (token) fetchTickets();
//   }, [token]);

//   const getEventStatus = (startDate, endDate) => {
//     const now = new Date();
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     if (end < now) return "past";
//     if (start > now) return "upcoming";
//     return "ongoing";
//   };

//   const getBadgeStyle = (status) => {
//     switch (status) {
//       case "past":
//         return "bg-destructive";
//       case "upcoming":
//         return "bg-primary";
//       case "ongoing":
//         return "bg-green-600";
//       default:
//         return "bg-muted";
//     }
//   };

//   const groupSeatsByZone = (seats) => {
//     const zoneMap = {};
//     seats?.forEach((label) => {
//       const zone = label[0];
//       if (!zoneMap[zone]) zoneMap[zone] = [];
//       zoneMap[zone].push(label);
//     });
//     return zoneMap;
//   };

//   const downloadInvoice = async (ticketId) => {
//     setDownloadingTicket(ticketId);
//     try {
//       const response = await axios.get(
//         `/tickets/invoice/${ticketId}/download`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: 'blob', // Important for file download
//         }
//       );

//       // Create blob link to download
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `invoice_${ticketId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast({
//         title: "Success!",
//         description: "Invoice downloaded successfully",
//       });
//     } catch (error) {
//       console.error("Error downloading invoice:", error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to download invoice",
//       });
//     } finally {
//       setDownloadingTicket(null);
//     }
//   };

//   return (
//     <TooltipProvider>
//       <div className="max-w-5xl mx-auto px-4 py-8">
//         <h2 className="text-3xl font-bold text-center mb-6">🎟️ My Tickets</h2>

//         {tickets.length === 0 ? (
//           <p className="text-center text-muted-foreground">No tickets booked yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             {tickets.map((ticket) => {
//               const event = ticket.eventId;
//               const status = getEventStatus(event?.startDate, event?.endDate);
//               const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
//               const isIndoor = event?.eventCategory === "Indoor";
//               const isZoom = event?.eventCategory === "ZoomMeeting";

//               return (
//                 <Card key={ticket._id} className="shadow-md">
//                   {event?.eventImage && (
//                     <img
//                       src={event.eventImage}
//                       alt="Event"
//                       className="w-full h-48 object-cover rounded-t-md"
//                     />
//                   )}
//                   <CardHeader className="flex justify-between items-start">
//                     <CardTitle>{event?.eventName || "Unnamed Event"}</CardTitle>
//                     <Badge className={getBadgeStyle(status)}>
//                       {status.toUpperCase()}
//                     </Badge>
//                   </CardHeader>
//                   <Separator />
//                   <CardContent className="space-y-2 text-sm">
//                     <p><strong>📅 Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
//                     <p><strong>🆔 Ticket ID:</strong> {ticket._id}</p>
//                     <p><strong>📅 Start:</strong> {new Date(event?.startDate).toLocaleDateString()}</p>
//                     <p><strong>📅 End:</strong> {new Date(event?.endDate).toLocaleDateString()}</p>
//                     <p>
//                       <strong>💵 Booked at:</strong> ₹{ticket.ticketRate} ({ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""})
//                     </p>

//                     {!isZoom && (
//                       <>
//                         <p>
//                           <strong>📍 Location:</strong>{" "}
//                           {ticket.cityId?.name}, {ticket.stateId?.Name}
//                         </p>
//                         {event?.latitude && event?.longitude && (
//                           <Button
//                             asChild
//                             variant="outline"
//                             size="sm"
//                             className="mt-1"
//                           >
//                             <a
//                               href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               📍 View Directions
//                             </a>
//                           </Button>
//                         )}
//                       </>
//                     )}

//                     {isZoom && event.zoomUrl && (
//                       <p>
//                         <strong>🔗 Zoom URL:</strong>{" "}
//                         <a
//                           href={event.zoomUrl}
//                           className="underline text-blue-500"
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           Join Meeting
//                         </a>
//                       </p>
//                     )}

//                     {isIndoor && ticket.selectedSeats?.length > 0 && (
//                       <div>
//                         <strong>🎯 Selected Seats by Zone:</strong>
//                         {Object.entries(groupedSeats).map(([zone, seats]) => (
//                           <div key={zone} className="mt-2">
//                             <div className="font-medium text-sm">Zone {zone}</div>
//                             <div className="flex flex-wrap gap-2 mt-1">
//                               {seats.map((s, i) => (
//                                 <Tooltip key={i}>
//                                   <TooltipTrigger asChild>
//                                     <Badge variant="outline" className="bg-muted text-sm">
//                                       {s}
//                                     </Badge>
//                                   </TooltipTrigger>
//                                   <TooltipContent>
//                                     Seat {s} in Zone {zone}
//                                   </TooltipContent>
//                                 </Tooltip>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Invoice Download Button */}
//                     <div className="pt-4 border-t">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="w-full"
//                         onClick={() => downloadInvoice(ticket._id)}
//                         disabled={downloadingTicket === ticket._id}
//                       >
//                         {downloadingTicket === ticket._id ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Downloading...
//                           </>
//                         ) : (
//                           <>
//                             <Download className="mr-2 h-4 w-4" />
//                             Download Invoice
//                           </>
//                         )}
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}

//         <div className="text-center mt-6">
//           <Button variant="outline" asChild>
//             <a href="/organizer">Back to Home</a>
//           </Button>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// };




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


