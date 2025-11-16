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

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [downloadingTicket, setDownloadingTicket] = useState(null);
  const token = localStorage.getItem("token");
  const { toast } = useToast();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/tickets/usertickets/self`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(res.data.data);
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
        return "bg-gray-500 text-white";
      case "upcoming":
        return "bg-blue-600 text-white";
      case "ongoing":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-400 text-white";
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
              background: white;
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

  const getEventLocation = (event, ticket) => {
    if (event?.eventCategory === "ZoomMeeting") {
      return null;
    }
    
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
      {/* Background - consistent for both modes */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎟️ My Tickets & Invoices
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
                    {/* Invoice Header - Fixed gradient colors */}
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

                    {/* Card Content - All with explicit colors */}
                    <CardContent className="p-4 space-y-3 bg-white">
                      {/* Event Image */}
                      {event?.eventImage && (
                        <div className="relative rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={event.eventImage}
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

                      {/* Event Info - Fixed colors */}
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

                      {/* Seats - Fixed colors */}
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

                      {/* Price Table - Fixed colors */}
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

                      {/* Payment Status - Fixed colors */}
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

                      {/* Zoom/Directions Buttons */}
                      {isZoom && event.zoomUrl && (
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
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="bg-white text-gray-700 border-gray-300 dark: hover:bg-gray-950 "
            >
              <a href="/user">← Back to Home</a>
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
// import { Download, Loader2, Receipt, Building2, Mail, Phone, MapPin, Calendar, User, Printer, CreditCard } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";

// export const MyTickets = () => {
//   const [tickets, setTickets] = useState([]);
//   const [downloadingTicket, setDownloadingTicket] = useState(null);
//   const token = localStorage.getItem("token");
//   const { toast } = useToast();

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get(`/tickets/usertickets/self`, {
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
//         return "bg-gray-500";
//       case "upcoming":
//         return "bg-blue-600";
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

//   const calculateTotal = (ticket) => {
//     return ticket.ticketRate * ticket.quantity;
//   };

//   const calculateTax = (ticket) => {
//     const subtotal = calculateTotal(ticket);
//     return (subtotal * 0.18).toFixed(2);
//   };

//   const calculateGrandTotal = (ticket) => {
//     const subtotal = calculateTotal(ticket);
//     const tax = parseFloat(calculateTax(ticket));
//     return (subtotal + tax).toFixed(2);
//   };

//   const downloadInvoice = async (ticketId) => {
//     setDownloadingTicket(ticketId);
//     try {
//       const response = await axios.get(
//         `/tickets/invoice/${ticketId}/download`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: 'blob',
//         }
//       );

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

//   const printInvoice = (ticketId) => {
//     const invoiceCard = document.getElementById(`invoice-${ticketId}`);
//     if (!invoiceCard) return;

//     const printWindow = window.open('', '', 'width=800,height=600');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Invoice - ${ticketId}</title>
//           <style>
//             body { 
//               font-family: Arial, sans-serif; 
//               padding: 20px; 
//               margin: 0;
//             }
//             .no-print { display: none !important; }
//             @media print {
//               .no-print { display: none !important; }
//               body { padding: 0; }
//             }
//           </style>
//         </head>
//         <body>
//           ${invoiceCard.innerHTML}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   // Helper to get location for display
//   const getEventLocation = (event, ticket) => {
//     if (event?.eventCategory === "ZoomMeeting") {
//       return null;
//     }
    
//     // Try multiple location sources
//     const location = 
//       event?.location || 
//       event?.stadiumId?.location?.address || 
//       event?.stadiumId?.name ||
//       (ticket.cityId?.name && ticket.stateId?.Name 
//         ? `${ticket.cityId.name}, ${ticket.stateId.Name}` 
//         : null);
    
//     return location;
//   };

//   return (
//     <TooltipProvider>
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//           🎟️ My Tickets & Invoices
//         </h2>

//         {tickets.length === 0 ? (
//           <div className="text-center py-12">
//             <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//             <p className="text-gray-500 text-lg">No tickets booked yet.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {tickets.map((ticket) => {
//               const event = ticket.eventId;
//               const status = getEventStatus(event?.startDate, event?.endDate);
//               const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
//               const isIndoor = event?.eventCategory === "Indoor";
//               const isZoom = event?.eventCategory === "ZoomMeeting";
//               const today = new Date().toLocaleDateString();
//               const location = getEventLocation(event, ticket);

//               return (
//                 <Card 
//                   key={ticket._id} 
//                   className="shadow-lg border hover:shadow-xl transition-shadow overflow-hidden"
//                   id={`invoice-${ticket._id}`}
//                 >
//                   {/* Compact Invoice Header */}
//                   <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="flex items-center gap-2 mb-1">
//                           <Receipt className="w-5 h-5" />
//                           <h1 className="text-xl font-bold">INVOICE</h1>
//                         </div>
//                         <div className="space-y-0.5 text-xs opacity-95">
//                           <p className="font-mono">#{ticket._id.slice(-8).toUpperCase()}</p>
//                           <p>{today}</p>
//                         </div>
//                       </div>
                      
//                       <div className="text-right">
//                         <Badge className={`${getBadgeStyle(status)} text-xs px-2 py-1 mb-2`}>
//                           {status.toUpperCase()}
//                         </Badge>
//                         <p className="text-sm font-bold">EventEase</p>
//                       </div>
//                     </div>
//                   </div>

//                   <CardContent className="p-4 space-y-3">
//                     {/* Event Image - Smaller */}
//                     {event?.eventImage && (
//                       <div className="relative rounded-lg overflow-hidden shadow-sm">
//                         <img
//                           src={event.eventImage}
//                           alt={event.eventName}
//                           className="w-full h-32 object-cover"
//                         />
//                         <div className="absolute top-2 right-2">
//                           <Badge className="bg-white/90 text-gray-800 text-xs">
//                             {event.eventType}
//                           </Badge>
//                         </div>
//                       </div>
//                     )}

//                     {/* Compact Info Section */}
//                     <div className="space-y-2 ">
//                       {/* Event Name */}
//                       <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
//                         {event?.eventName || "Event"}
//                       </h3>

//                       {/* Dates */}
//                       <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-100">
//                         <Calendar className="w-3 h-3 text-blue-600" />
//                         {new Date(event?.startDate).toLocaleDateString()} - {new Date(event?.endDate).toLocaleDateString()}
//                       </div>

//                       {/* Location */}
//                       {location && (
//                         <div className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-100">
//                           <MapPin className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
//                           <span className="line-clamp-2">{location}</span>
//                         </div>
//                       )}

//                       {/* User Info */}
//                       <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-100">
//                         <User className="w-3 h-3" />
//                         {ticket.userId?.fullName || ticket.userId?.name || 'Guest User'}
//                       </div>
//                     </div>

//                     {/* Seats - Compact */}
//                     {isIndoor && ticket.selectedSeats?.length > 0 && (
//                       <div className="bg-purple-50 p-2 rounded border border-purple-200">
//                         <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Seats</p>
//                         <div className="flex flex-wrap gap-1">
//                           {Object.entries(groupedSeats).map(([zone, seats]) => (
//                             <div key={zone} className="flex gap-1">
//                               {seats.slice(0, 5).map((s, i) => (
//                                 <Badge 
//                                   key={i}
//                                   variant="outline" 
//                                   className="text-xs px-1.5 py-0 text-gray-800 bg-white border-purple-300"
//                                 >
//                                   {s}
//                                 </Badge>
//                               ))}
//                               {seats.length > 5 && (
//                                 <Badge variant="outline" className="text-xs px-1.5 py-0">
//                                   +{seats.length - 5}
//                                 </Badge>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <Separator />

//                     {/* Compact Price Table */}
//                     <div className="bg-gray-50 p-3 rounded-lg border text-xs">
//                       <div className="flex justify-between mb-1 text-gray-700">
//                         <span>{ticket.quantity} × ₹{ticket.ticketRate.toLocaleString()}</span>
//                         <span className="font-medium">₹{calculateTotal(ticket).toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between mb-1 text-gray-600">
//                         <span>GST (18%)</span>
//                         <span>₹{calculateTax(ticket)}</span>
//                       </div>
//                       <Separator className="my-1" />
//                       <div className="flex justify-between font-bold text-sm">
//                         <span>Total</span>
//                         <span className="text-blue-600">₹{calculateGrandTotal(ticket)}</span>
//                       </div>
//                     </div>

//                     {/* Payment Status - Compact */}
//                     <div className="bg-green-50 p-2 rounded-lg border-l-2 border-green-500">
//                       <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
//                         <Receipt className="w-3 h-3" />
//                         PAID via Razorpay
//                       </p>
//                       {ticket.paymentId && (
//                         <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
//                           {ticket.paymentId}
//                         </p>
//                       )}
//                     </div>

//                     {/* Action Buttons - Compact */}
//                     <div className="grid grid-cols-2 gap-2 no-print">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => printInvoice(ticket._id)}
//                         className="text-xs h-8"
//                       >
//                         <Printer className="w-3 h-3 mr-1" />
//                         Print
//                       </Button>
                      
//                       <Button
//                         variant="default"
//                         size="sm"
//                         onClick={() => downloadInvoice(ticket._id)}
//                         disabled={downloadingTicket === ticket._id}
//                         className="text-xs h-8 bg-gradient-to-r from-blue-600 to-purple-600"
//                       >
//                         {downloadingTicket === ticket._id ? (
//                           <Loader2 className="w-3 h-3 animate-spin" />
//                         ) : (
//                           <>
//                             <Download className="w-3 h-3 mr-1" />
//                             PDF
//                           </>
//                         )}
//                       </Button>
//                     </div>

//                     {/* Zoom/Directions Button */}
//                     {isZoom && event.zoomUrl && (
//                       <Button
//                         asChild
//                         variant="outline"
//                         size="sm"
//                         className="w-full text-xs h-8"
//                       >
//                         <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                           🔗 Join Zoom
//                         </a>
//                       </Button>
//                     )}
                    
//                     {!isZoom && event?.latitude && event?.longitude && (
//                       <Button
//                         asChild
//                         variant="outline"
//                         size="sm"
//                         className="w-full text-xs h-8"
//                       >
//                         <a
//                           href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           📍 Directions
//                         </a>
//                       </Button>
//                     )}
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}

//         <div className="text-center mt-8">
//           <Button variant="outline" size="lg" asChild>
//             <a href="/user">← Back to Home</a>
//           </Button>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// };















