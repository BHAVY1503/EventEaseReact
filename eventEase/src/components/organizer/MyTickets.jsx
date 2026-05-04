import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Download, Loader2, Receipt, MapPin, Calendar, User, Printer, CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft, Ticket, Rocket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// 🔥 REFUND STATUS COMPONENT (inline in same file)
const RefundStatusBadge = ({ ticket }) => {
  const getRefundStatusConfig = () => {
    switch (ticket.refundStatus) {
      case 'Pending Approval':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Awaiting Approval',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:none',
          description: 'Your refund request is pending admin approval'
        };
      case 'Pending':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Processing',
          className: 'bg-blue-100 text-blue-800 border-blue-300 dark:none ',
          description: 'Refund approved! Processing payment...'
        };
      case 'Completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: 'Refund Completed',
          className: 'bg-green-100 text-green-800 border-green-300 dark:none ',
          description: `₹${ticket.refundAmount.toLocaleString()} credited on ${new Date(ticket.refundDate).toLocaleDateString()}`
        };
      case 'Rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Refund Rejected',
          className: 'bg-red-100 text-red-800 border-red-300 dark:none',
          description: ticket.adminRemark || 'Refund request was rejected'
        };
      case 'No Refund':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'No Refund',
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          description: 'Cancelled too late for refund'
        };
      default:
        return null;
    }
  };

  if (ticket.status !== 'Cancelled') return null;

  const config = getRefundStatusConfig();
  if (!config) return null;

  return (
    <Card className="mt-3 border-l-4 border-gray-300">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${config.className}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Badge className={`${config.className} text-xs`}>
                {config.text}
              </Badge>
              {ticket.refundAmount > 0 && (
                <span className="text-sm font-semibold text-gray-900">
                  ₹{ticket.refundAmount.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600">{config.description}</p>
            
            {ticket.refundStatus === 'Completed' && ticket.refundTransactionId && (
              <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                Txn ID: {ticket.refundTransactionId}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 🔥 MAIN COMPONENT
export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [downloadingTicket, setDownloadingTicket] = useState(null);
  const token = localStorage.getItem("token");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get(`/tickets/usertickets/self`);
        const raw = res.data?.data ?? res.data ?? [];
        // Sort newest first by createdAt or booking date
        const sorted = [...raw].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.bookingDate || 0);
          const dateB = new Date(b.createdAt || b.bookingDate || 0);
          return dateB - dateA;
        });
        setTickets(sorted);
      } catch (error) {
        console.error("Error fetching tickets:", error.response?.data || error.message || error);
      }
    };
    if (token) fetchTickets();
  }, [token]);

  const handleCancel = async (ticketId) => {
    const reason = window.prompt("Reason for cancellation (optional):", "");
    if (reason === null) return;

    if (!window.confirm("Are you sure you want to cancel this ticket?")) return;

    try {
      const res = await api.post(`/tickets/cancel/${ticketId}`, { reason });

      toast({
        title: "Success",
        description: res.data?.message || "Ticket cancelled",
      });

      // Update ticket using returned ticket object when available
      const returned = res.data?.data ?? res.data;
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...(returned || {}), status: returned?.status || "Cancelled" } : t))
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || error.message || "Cancellation failed",
      });
    }
  };

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
      const response = await api.get(`/tickets/invoice/${ticketId}/download`, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Success!",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading invoice:", error.response?.data || error.message || error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to download invoice",
      });
    } finally {
      setDownloadingTicket(null);
    }
  };

  const printInvoice = (ticketId) => {
    const invoiceCard = document.getElementById(`invoice-${ticketId}`);
    if (!invoiceCard) return;

    const printWindow = window.open("", "", "width=800,height=600");
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

  const getEventImage = (event) => {
    if (!event) return null;
    const url = event.eventImgUrl || event.eventImage || event.eventImg || event.image;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://eventeasenode-js.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getEventLocation = (event, ticket) => {
    if (event?.eventCategory === "ZoomMeeting") return null;
    return (
      event?.location ||
      event?.stadiumId?.location?.address ||
      event?.stadiumId?.name ||
      (ticket.cityId?.name && ticket.stateId?.Name
        ? `${ticket.cityId.name}, ${ticket.stateId.Name}`
        : null)
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-transparent text-white selection:bg-rose-500/30">
        {/* Top header bar with back button */}
        <div className={`sticky top-0 z-50 w-full transition-all duration-500 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-6`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/user"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Return
            </Link>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
               ARCHIVE <span className="text-[#E11D48]">TICKETS</span>
            </h2>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No tickets booked yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => {
                const event = ticket.eventId;
                const status = getEventStatus(event?.startDate, event?.endDate);
                
                return (
                  <div
                    key={ticket._id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsSheetOpen(true);
                    }}
                    className="group relative cursor-pointer bg-white/90 backdrop-blur-2xl border border-white/20 hover:border-[#E11D48]/50 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] shadow-2xl overflow-hidden"
                  >
                    {/* Stub Notch */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-black rounded-full border border-white/10" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-black rounded-full border border-white/10" />
                    
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-[#E11D48]/10 rounded-lg">
                          <Ticket className="w-5 h-5 text-[#E11D48]" />
                        </div>
                        <Badge className="bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]/10 text-[10px] font-black px-2 py-0.5">
                          {status.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter truncate text-gray-900 group-hover:text-[#E11D48] transition-colors">
                          {event?.eventName || "Event"}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                          {new Date(event?.startDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-dashed border-black/5 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          #{ticket._id.slice(-8).toUpperCase()}
                        </span>
                        <div className="text-[#E11D48] font-black text-sm">
                           ₹{calculateGrandTotal(ticket)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DETAIL SIDE PANEL */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="right" className="bg-white/95 backdrop-blur-3xl border-l border-gray-200 w-full sm:max-w-2xl p-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {selectedTicket && (() => {
                const ticket = selectedTicket;
                const event = ticket.eventId;
                const status = getEventStatus(event?.startDate, event?.endDate);
                const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
                const isIndoor = event?.eventCategory === "Indoor";
                const isZoom = event?.eventCategory === "ZoomMeeting";
                const today = new Date().toLocaleDateString();
                const location = getEventLocation(event, ticket);

                return (
                  <div className="flex flex-col min-h-screen text-gray-900">
                    {/* Header Strip */}
                    <div className="bg-gradient-to-r from-[#E11D48] via-rose-600 to-rose-900 p-8 shrink-0">
                      <SheetHeader className="text-left space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Ticket className="w-6 h-6 text-white" />
                          </div>
                          <Badge className="bg-white text-black text-[10px] font-black px-4 py-1 rounded-full shadow-lg border-0">
                            {status.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">
                            OFFICIAL <span className="text-white/50">PASS</span>
                          </SheetTitle>
                          <SheetDescription className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
                            RECORD #{ticket._id.slice(-12).toUpperCase()}
                          </SheetDescription>
                        </div>
                      </SheetHeader>
                    </div>

                    <div className="p-8 flex-grow space-y-10">
                      {/* Ticket Body */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Admission Control</span>
                           <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter text-gray-900">
                             {event?.eventName || "Event"}
                           </h2>
                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-6 pb-10 border-b border-gray-100">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-[#E11D48]" /> Date
                          </p>
                          <p className="text-sm font-bold text-gray-800">{new Date(event?.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3 h-3 text-[#E11D48]" /> Holder
                          </p>
                          <p className="text-sm font-bold text-gray-800 truncate">{ticket.userId?.fullName || ticket.userId?.name || "Guest"}</p>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-[#E11D48]" /> Location
                          </p>
                          <p className="text-sm font-bold text-gray-800 line-clamp-2">{location || "Universal Venue"}</p>
                        </div>
                      </div>

                      {isIndoor && ticket.selectedSeats?.length > 0 && (
                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E11D48] mb-4 flex items-center gap-2">
                            <Rocket className="w-4 h-4" /> SECTOR ACCESS
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(groupedSeats).map(([zone, seats]) => (
                              <div key={zone} className="flex flex-wrap gap-2">
                                {seats.map((s, i) => (
                                  <Badge key={i} className="text-[10px] font-black px-3 py-1 bg-white text-gray-800 border border-gray-200 rounded-lg">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grand Total</p>
                          <p className="text-gray-500 text-[10px] font-bold">Incl. GST 18%</p>
                        </div>
                        <div className="text-[#E11D48] text-4xl font-black tracking-tighter italic">
                          ₹{calculateGrandTotal(ticket)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-6 pb-12">
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" onClick={() => printInvoice(ticket._id)} className="h-14 rounded-2xl bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest">
                            <Printer className="w-4 h-4 mr-2" /> PRINT
                          </Button>
                          <Button size="sm" onClick={() => downloadInvoice(ticket._id)} disabled={downloadingTicket === ticket._id} className="h-14 rounded-2xl bg-gradient-to-r from-[#E11D48] to-rose-800 text-white text-[10px] font-black uppercase tracking-widest">
                            {downloadingTicket === ticket._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                          </Button>
                        </div>
                        {ticket.status === "Active" && status === "upcoming" && (
                          <Button size="sm" onClick={() => handleCancel(ticket._id)} className="h-14 rounded-2xl bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all">
                            CANCEL TICKET
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </SheetContent>
          </Sheet>

          <div className="text-center mt-8 text-sm text-gray-400 dark:text-gray-500">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} · Most recent first
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
//   CardContent,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { Download, Loader2, Receipt, MapPin, Calendar, User, Printer } from "lucide-react";
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

//   const handleCancel = async (ticketId) => {
//     const reason = window.prompt("Reason for cancellation (optional):", "");
//     if (reason === null) return;

//     if (!window.confirm("Are you sure you want to cancel this ticket?")) return;

//     try {
//       const res = await axios.post(
//         `/tickets/cancel/${ticketId}`,
//         { reason },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       toast({
//         title: "Success",
//         description: res.data.message || "Ticket cancelled",
//       });

//       setTickets((prev) =>
//         prev.map((t) =>
//           t._id === ticketId ? { ...t, status: "Cancelled" } : t
//         )
//       );
//     } catch (error) {
//       console.error(error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: error.response?.data?.message || "Cancellation failed",
//       });
//     }
//   };

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
//         return "bg-gray-500 text-white";
//       case "upcoming":
//         return "bg-blue-600 text-white";
//       case "ongoing":
//         return "bg-green-600 text-white";
//       default:
//         return "bg-gray-400 text-white";
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
//           responseType: "blob",
//         }
//       );

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `invoice_${ticketId}.pdf`);
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

//     const printWindow = window.open("", "", "width=800,height=600");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Invoice - ${ticketId}</title>
//           <style>
//             body { 
//               font-family: Arial, sans-serif; 
//               padding: 20px; 
//               margin: 0;
//               background: white;
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

//   const getEventLocation = (event, ticket) => {
//     if (event?.eventCategory === "ZoomMeeting") return null;
//     return (
//       event?.location ||
//       event?.stadiumId?.location?.address ||
//       event?.stadiumId?.name ||
//       (ticket.cityId?.name && ticket.stateId?.Name
//         ? `${ticket.cityId.name}, ${ticket.stateId.Name}`
//         : null)
//     );
//   };

//   return (
//     <TooltipProvider>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             🎟️ My Tickets & Invoices
//           </h2>

//           {tickets.length === 0 ? (
//             <div className="text-center py-12">
//               <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//               <p className="text-gray-500 text-lg">No tickets booked yet.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {tickets.map((ticket) => {
//                 const event = ticket.eventId;
//                 const status = getEventStatus(event?.startDate, event?.endDate);
//                 const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
//                 const isIndoor = event?.eventCategory === "Indoor";
//                 const isZoom = event?.eventCategory === "ZoomMeeting";
//                 const today = new Date().toLocaleDateString();
//                 const location = getEventLocation(event, ticket);

//                 return (
//                   <Card
//                     key={ticket._id}
//                     className="shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden bg-white"
//                     id={`invoice-${ticket._id}`}
//                   >
//                     <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <div className="flex items-center gap-2 mb-1">
//                             <Receipt className="w-5 h-5" />
//                             <h1 className="text-xl font-bold">INVOICE</h1>
//                           </div>
//                           <div className="space-y-0.5 text-xs opacity-95">
//                             <p className="font-mono">
//                               #{ticket._id.slice(-8).toUpperCase()}
//                             </p>
//                             <p>{today}</p>
//                           </div>
//                         </div>

//                         <div className="text-right">
//                           <Badge
//                             className={`${getBadgeStyle(
//                               status
//                             )} text-xs px-2 py-1 mb-2`}
//                           >
//                             {status.toUpperCase()}
//                           </Badge>
//                           <p className="text-sm font-bold">EventEase</p>
//                         </div>
//                       </div>
//                     </div>

//                     <CardContent className="p-6 space-y-6 bg-transparent text-white">
//                       {event?.eventImage && (
//                         <div className="relative rounded-lg overflow-hidden shadow-sm">
//                           <img
//                             src={event.eventImage}
//                             alt={event.eventName}
//                             className="w-full h-32 object-cover"
//                           />
//                           <div className="absolute top-2 right-2">
//                             <Badge className="bg-white/90 text-gray-800 text-xs border-0">
//                               {event.eventType}
//                             </Badge>
//                           </div>
//                         </div>
//                       )}

//                       <div className="space-y-2">
//                         <h3 className="font-bold text-base text-gray-900">
//                           {event?.eventName || "Event"}
//                         </h3>

//                         <div className="flex items-center gap-1 text-xs text-gray-600">
//                           <Calendar className="w-3 h-3 text-blue-600" />
//                           {new Date(event?.startDate).toLocaleDateString()} -{" "}
//                           {new Date(event?.endDate).toLocaleDateString()}
//                         </div>

//                         {location && (
//                           <div className="flex items-start gap-1 text-xs text-gray-600">
//                             <MapPin className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
//                             <span className="line-clamp-2">{location}</span>
//                           </div>
//                         )}

//                         <div className="flex items-center gap-1 text-xs text-gray-600">
//                           <User className="w-3 h-3 text-gray-600" />
//                           {ticket.userId?.fullName ||
//                             ticket.userId?.name ||
//                             "Guest User"}
//                         </div>
//                       </div>

//                       {isIndoor && ticket.selectedSeats?.length > 0 && (
//                         <div className="bg-purple-50 p-2 rounded border border-purple-200">
//                           <p className="text-xs font-semibold text-purple-900 mb-1">
//                             🎯 Seats
//                           </p>
//                           <div className="flex flex-wrap gap-1">
//                             {Object.entries(groupedSeats).map(
//                               ([zone, seats]) => (
//                                 <div key={zone} className="flex gap-1">
//                                   {seats.slice(0, 5).map((s, i) => (
//                                     <Badge
//                                       key={i}
//                                       className="text-xs px-1.5 py-0 bg-white text-gray-800 border border-purple-300"
//                                     >
//                                       {s}
//                                     </Badge>
//                                   ))}
//                                   {seats.length > 5 && (
//                                     <Badge className="text-xs px-1.5 py-0 bg-white text-gray-800 border border-purple-300">
//                                       +{seats.length - 5}
//                                     </Badge>
//                                   )}
//                                 </div>
//                               )
//                             )}
//                           </div>
//                         </div>
//                       )}

//                       <Separator className="bg-gray-200" />

//                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
//                         <div className="flex justify-between mb-1 text-gray-700">
//                           <span>
//                             {ticket.quantity} × ₹
//                             {ticket.ticketRate.toLocaleString()}
//                           </span>
//                           <span className="font-medium text-gray-900">
//                             ₹{calculateTotal(ticket).toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between mb-1 text-gray-600">
//                           <span>GST (18%)</span>
//                           <span className="text-gray-900">
//                             ₹{calculateTax(ticket)}
//                           </span>
//                         </div>
//                         <Separator className="my-1 bg-gray-300" />
//                         <div className="flex justify-between font-bold text-sm">
//                           <span className="text-gray-900">Total</span>
//                           <span className="text-blue-600">
//                             ₹{calculateGrandTotal(ticket)}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="bg-green-50 p-2 rounded-lg border-l-2 border-green-500">
//                         <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
//                           <Receipt className="w-3 h-3" />
//                           PAID via Razorpay
//                         </p>
//                         {ticket.paymentId && (
//                           <p className="text-xs text-gray-600 font-mono mt-0.5 truncate">
//                             {ticket.paymentId}
//                           </p>
//                         )}
//                       </div>

//                       <div className="grid grid-cols-3 gap-2 no-print">
                        
//                         {/* CANCEL BUTTON */}
//                         {ticket.status === "Active" && status === "upcoming" && (
//                           <Button
//                             size="sm"
//                             onClick={() => handleCancel(ticket._id)}
//                             className="text-xs h-8 bg-red-600 text-white hover:bg-red-700"
//                           >
//                             Cancel
//                           </Button>
//                         )}

//                         {/* PRINT */}
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => printInvoice(ticket._id)}
//                           className="text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                         >
//                           <Printer className="w-3 h-3 mr-1" />
//                           Print
//                         </Button>

//                         {/* PDF */}
//                         <Button
//                           size="sm"
//                           onClick={() => downloadInvoice(ticket._id)}
//                           disabled={downloadingTicket === ticket._id}
//                           className="text-xs h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
//                         >
//                           {downloadingTicket === ticket._id ? (
//                             <Loader2 className="w-3 h-3 animate-spin" />
//                           ) : (
//                             <>
//                               <Download className="w-3 h-3 mr-1" />
//                               PDF
//                             </>
//                           )}
//                         </Button>
//                       </div>

//                       {isZoom && event.zoomUrl && (
//                         <Button
//                           asChild
//                           variant="outline"
//                           size="sm"
//                           className="w-full text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                         >
//                           <a
//                             href={event.zoomUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             🔗 Join Zoom
//                           </a>
//                         </Button>
//                       )}

//                       {!isZoom && event?.latitude && event?.longitude && (
//                         <Button
//                           asChild
//                           variant="outline"
//                           size="sm"
//                           className="w-full text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                         >
//                           <a
//                             href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             📍 Directions
//                           </a>
//                         </Button>
//                       )}
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}

//           <div className="text-center mt-8">
//             <Button
//               variant="outline"
//               size="lg"
//               asChild
//               className="bg-white text-gray-700 border-gray-300 dark: hover:bg-gray-950 "
//             >
//               <a href="/user">← Back to Home</a>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// };



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { Download, Loader2, Receipt, MapPin, Calendar, User, Printer } from "lucide-react";
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
//         return "bg-gray-500 text-white";
//       case "upcoming":
//         return "bg-blue-600 text-white";
//       case "ongoing":
//         return "bg-green-600 text-white";
//       default:
//         return "bg-gray-400 text-white";
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
//               background: white;
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

//   const getEventLocation = (event, ticket) => {
//     if (event?.eventCategory === "ZoomMeeting") {
//       return null;
//     }
    
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
//       {/* Background - consistent for both modes */}
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             🎟️ My Tickets & Invoices
//           </h2>

//           {tickets.length === 0 ? (
//             <div className="text-center py-12">
//               <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//               <p className="text-gray-500 text-lg">No tickets booked yet.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {tickets.map((ticket) => {
//                 const event = ticket.eventId;
//                 const status = getEventStatus(event?.startDate, event?.endDate);
//                 const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
//                 const isIndoor = event?.eventCategory === "Indoor";
//                 const isZoom = event?.eventCategory === "ZoomMeeting";
//                 const today = new Date().toLocaleDateString();
//                 const location = getEventLocation(event, ticket);

//                 return (
//                   <Card 
//                     key={ticket._id} 
//                     className="shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden bg-white"
//                     id={`invoice-${ticket._id}`}
//                   >
//                     {/* Invoice Header - Fixed gradient colors */}
//                     <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <div className="flex items-center gap-2 mb-1">
//                             <Receipt className="w-5 h-5" />
//                             <h1 className="text-xl font-bold">INVOICE</h1>
//                           </div>
//                           <div className="space-y-0.5 text-xs opacity-95">
//                             <p className="font-mono">#{ticket._id.slice(-8).toUpperCase()}</p>
//                             <p>{today}</p>
//                           </div>
//                         </div>
                        
//                         <div className="text-right">
//                           <Badge className={`${getBadgeStyle(status)} text-xs px-2 py-1 mb-2`}>
//                             {status.toUpperCase()}
//                           </Badge>
//                           <p className="text-sm font-bold">EventEase</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Card Content - All with explicit colors */}
//                     <CardContent className="p-6 space-y-6 bg-transparent text-white">
//                       {/* Event Image */}
//                       {event?.eventImage && (
//                         <div className="relative rounded-lg overflow-hidden shadow-sm">
//                           <img
//                             src={event.eventImage}
//                             alt={event.eventName}
//                             className="w-full h-32 object-cover"
//                           />
//                           <div className="absolute top-2 right-2">
//                             <Badge className="bg-white/90 text-gray-800 text-xs border-0">
//                               {event.eventType}
//                             </Badge>
//                           </div>
//                         </div>
//                       )}

//                       {/* Event Info - Fixed colors */}
//                       <div className="space-y-2">
//                         <h3 className="font-bold text-base text-gray-900">
//                           {event?.eventName || "Event"}
//                         </h3>

//                         <div className="flex items-center gap-1 text-xs text-gray-600">
//                           <Calendar className="w-3 h-3 text-blue-600" />
//                           {new Date(event?.startDate).toLocaleDateString()} - {new Date(event?.endDate).toLocaleDateString()}
//                         </div>

//                         {location && (
//                           <div className="flex items-start gap-1 text-xs text-gray-600">
//                             <MapPin className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
//                             <span className="line-clamp-2">{location}</span>
//                           </div>
//                         )}

//                         <div className="flex items-center gap-1 text-xs text-gray-600">
//                           <User className="w-3 h-3 text-gray-600" />
//                           {ticket.userId?.fullName || ticket.userId?.name || 'Guest User'}
//                         </div>
//                       </div>

//                       {/* Seats - Fixed colors */}
//                       {isIndoor && ticket.selectedSeats?.length > 0 && (
//                         <div className="bg-purple-50 p-2 rounded border border-purple-200">
//                           <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Seats</p>
//                           <div className="flex flex-wrap gap-1">
//                             {Object.entries(groupedSeats).map(([zone, seats]) => (
//                               <div key={zone} className="flex gap-1">
//                                 {seats.slice(0, 5).map((s, i) => (
//                                   <Badge 
//                                     key={i}
//                                     className="text-xs px-1.5 py-0 bg-white text-gray-800 border border-purple-300"
//                                   >
//                                     {s}
//                                   </Badge>
//                                 ))}
//                                 {seats.length > 5 && (
//                                   <Badge className="text-xs px-1.5 py-0 bg-white text-gray-800 border border-purple-300">
//                                     +{seats.length - 5}
//                                   </Badge>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <Separator className="bg-gray-200" />

//                       {/* Price Table - Fixed colors */}
//                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
//                         <div className="flex justify-between mb-1 text-gray-700">
//                           <span>{ticket.quantity} × ₹{ticket.ticketRate.toLocaleString()}</span>
//                           <span className="font-medium text-gray-900">₹{calculateTotal(ticket).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between mb-1 text-gray-600">
//                           <span>GST (18%)</span>
//                           <span className="text-gray-900">₹{calculateTax(ticket)}</span>
//                         </div>
//                         <Separator className="my-1 bg-gray-300" />
//                         <div className="flex justify-between font-bold text-sm">
//                           <span className="text-gray-900">Total</span>
//                           <span className="text-blue-600">₹{calculateGrandTotal(ticket)}</span>
//                         </div>
//                       </div>

//                       {/* Payment Status - Fixed colors */}
//                       <div className="bg-green-50 p-2 rounded-lg border-l-2 border-green-500">
//                         <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
//                           <Receipt className="w-3 h-3" />
//                           PAID via Razorpay
//                         </p>
//                         {ticket.paymentId && (
//                           <p className="text-xs text-gray-600 font-mono mt-0.5 truncate">
//                             {ticket.paymentId}
//                           </p>
//                         )}
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="grid grid-cols-2 gap-2 no-print">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => printInvoice(ticket._id)}
//                           className="text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                         >
//                           <Printer className="w-3 h-3 mr-1" />
//                           Print
//                         </Button>
                        
//                         <Button
//                           size="sm"
//                           onClick={() => downloadInvoice(ticket._id)}
//                           disabled={downloadingTicket === ticket._id}
//                           className="text-xs h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
//                         >
//                           {downloadingTicket === ticket._id ? (
//                             <Loader2 className="w-3 h-3 animate-spin" />
//                           ) : (
//                             <>
//                               <Download className="w-3 h-3 mr-1" />
//                               PDF
//                             </>
//                           )}
//                         </Button>
//                       </div>

//                       {/* Zoom/Directions Buttons */}
//                       {isZoom && event.zoomUrl && (
//                         <Button
//                           asChild
//                           variant="outline"
//                           size="sm"
//                           className="w-full text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                         >
//                           <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                             🔗 Join Zoom
//                           </a>
//                         </Button>
//                       )}
                      
//                       {!isZoom && event?.latitude && event?.longitude && (
//                         <Button
//                           asChild
//                           variant="outline"
//                           size="sm"
//                           className="w-full text-xs h-8 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                         >
//                           <a
//                             href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             📍 Directions
//                           </a>
//                         </Button>
//                       )}
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}

//           <div className="text-center mt-8">
//             <Button 
//               variant="outline" 
//               size="lg" 
//               asChild
//               className="bg-white text-gray-700 border-gray-300 dark: hover:bg-gray-950 "
//             >
//               <a href="/user">← Back to Home</a>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// };































