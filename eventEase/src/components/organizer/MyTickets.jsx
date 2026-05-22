import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { 
  Download, 
  Loader2, 
  Receipt, 
  MapPin, 
  Calendar, 
  User, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Ticket, 
  Rocket,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/MyTickets.css";

const RefundStatusBadge = ({ ticket }) => {
  const getRefundStatusConfig = () => {
    switch (ticket.refundStatus) {
      case 'Pending Approval':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Awaiting Approval',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          description: 'Your refund request is pending admin approval'
        };
      case 'Pending':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Processing',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          description: 'Refund approved! Processing payment...'
        };
      case 'Completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: 'Refund Completed',
          className: 'bg-green-100 text-green-800 border-green-300',
          description: `₹${ticket.refundAmount?.toLocaleString()} credited on ${new Date(ticket.refundDate).toLocaleDateString()}`
        };
      case 'Rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Refund Rejected',
          className: 'bg-red-100 text-red-800 border-red-300',
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
    <div className={cn("refund-card-premium p-4 border", config.className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-white/20">
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest">{config.text}</span>
            {ticket.refundAmount > 0 && (
              <span className="text-sm font-black">₹{ticket.refundAmount.toLocaleString()}</span>
            )}
          </div>
          <p className="text-[10px] font-bold opacity-80">{config.description}</p>
        </div>
      </div>
    </div>
  );
};

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [downloadingTicket, setDownloadingTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/tickets/usertickets/self`);
        const raw = res.data?.data ?? res.data ?? [];
        const sorted = [...raw].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.bookingDate || 0);
          const dateB = new Date(b.createdAt || b.bookingDate || 0);
          return dateB - dateA;
        });
        setTickets(sorted);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
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
      toast({ title: "Success", description: res.data?.message || "Ticket cancelled" });
      const returned = res.data?.data ?? res.data;
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...(returned || {}), status: returned?.status || "Cancelled" } : t))
      );
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Cancellation failed" });
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

  const calculateGrandTotal = (ticket) => {
    const subtotal = ticket.ticketRate * ticket.quantity;
    return (subtotal * 1.18).toFixed(2);
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
      toast({ title: "Success!", description: "Invoice downloaded successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to download invoice" });
    } finally {
      setDownloadingTicket(null);
    }
  };

  const printInvoice = (ticketId) => {
    const invoiceCard = document.getElementById(`invoice-${ticketId}`);
    if (!invoiceCard) return;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:20px;}</style></head><body>${invoiceCard.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const getEventLocation = (event, ticket) => {
    if (event?.eventCategory === "ZoomMeeting") return "Virtual Session";
    return event?.location || event?.stadiumId?.name || "Global Node";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Retrieving Ticket Archive</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="my-tickets-container">
        <div className="my-tickets-content">
          {/* HEADER SECTION */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="archive-header">
            <button onClick={() => navigate("/user")} className="flex items-center gap-3 text-gray-500 hover:text-white transition-all w-fit mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Portal</span>
            </button>
            <div className="archive-title-box">
              <p className="archive-subtitle">Operational Entity Archive</p>
              <h1>TICKET<br /><span>MANIFEST</span></h1>
            </div>
          </motion.div>

          {tickets.length === 0 ? (
            <div className="py-40 text-center border border-white/5 rounded-[3rem] bg-white/5">
              <Receipt className="w-16 h-16 mx-auto text-gray-800 mb-8" />
              <h3 className="text-2xl font-black uppercase tracking-widest">No Records Found</h3>
              <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px] mt-4">Zero active ticket entities detected.</p>
            </div>
          ) : (
            <div className="tickets-grid-premium">
              <AnimatePresence>
                {tickets.map((ticket, index) => {
                  const event = ticket.eventId;
                  const status = getEventStatus(event?.startDate, event?.endDate);
                  return (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => { setSelectedTicket(ticket); setIsSheetOpen(true); }}
                      className={cn(
                        "ticket-card-user",
                        ticket.status === "Cancelled" ? "cancelled-ticket" : "active-ticket"
                      )}
                    >
                      <div className="user-ticket-notch-left" />
                      <div className="user-ticket-notch-right" />
                      
                      <div className="ticket-card-header-user">
                        <div className="ticket-icon-box-user">
                          <Ticket />
                        </div>
                        <div className={cn("status-badge-user", status)}>
                          {status.toUpperCase()}
                        </div>
                      </div>

                      <h3 className="ticket-title-user">{event?.eventName || "Event Node"}</h3>
                      <div className="ticket-date-user">
                        <Calendar className="w-3 h-3" />
                        {new Date(event?.startDate).toLocaleDateString()}
                      </div>

                      <div className="ticket-footer-user">
                        <span className="ticket-id-tag-user">#{ticket._id.slice(-8).toUpperCase()}</span>
                        <span className="ticket-price-user">₹{calculateGrandTotal(ticket)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* DETAIL PANEL */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="right" className="sheet-content-premium sm:max-w-2xl p-0 overflow-y-auto no-scrollbar">
              {selectedTicket && (() => {
                const ticket = selectedTicket;
                const event = ticket.eventId;
                const status = getEventStatus(event?.startDate, event?.endDate);
                const location = getEventLocation(event, ticket);

                return (
                  <div className="flex flex-col min-h-screen">
                    <div className="sheet-header-premium">
                      <div className="flex justify-between items-center mb-10">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl">
                          <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-white text-black text-[10px] font-black px-4 py-1 rounded-full border-0">
                          {status.toUpperCase()}
                        </Badge>
                      </div>
                      <h2 className="sheet-main-title">OFFICIAL<br />PASS</h2>
                      <p className="text-white/50 font-black uppercase tracking-[0.4em] text-[10px]">RECORD #{ticket._id.toUpperCase()}</p>
                    </div>

                    <div className="sheet-body-premium">
                      <div className="mb-10">
                        <p className="sheet-section-title">Admission Control</p>
                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">{event?.eventName}</h3>
                      </div>

                      <div className="detail-grid-user">
                        <div className="detail-item-user">
                          <h4><Calendar /> TRANSMISSION</h4>
                          <p>{new Date(event?.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="detail-item-user">
                          <h4><User /> HOLDER</h4>
                          <p className="truncate">{ticket.userId?.fullName || "ENTITY GUEST"}</p>
                        </div>
                        <div className="detail-item-user col-span-2">
                          <h4><MapPin /> COORDINATES</h4>
                          <p>{location}</p>
                        </div>
                      </div>

                      {ticket.selectedSeats?.length > 0 && (
                        <div className="sector-access-box">
                          <p className="sheet-section-title"><Rocket className="w-3 h-3 inline mr-2" /> Sector Access</p>
                          <div className="flex flex-wrap gap-2">
                            {ticket.selectedSeats.map((s, i) => (
                              <Badge key={i} className="bg-white text-black border-gray-200 text-[10px] font-black px-3 py-1">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <RefundStatusBadge ticket={ticket} />

                      <div className="grand-total-user-box mt-10">
                        <div>
                          <h5>GRAND TOTAL</h5>
                          <p className="text-[8px] font-bold text-gray-500">Authorized Razorpay Protocol</p>
                        </div>
                        <div className="price-text">₹{calculateGrandTotal(ticket)}</div>
                      </div>

                      <div className="sheet-actions-user">
                        <div className="sheet-action-row">
                          <Button onClick={() => printInvoice(ticket._id)} className="btn-premium-user secondary">
                            <Printer className="w-4 h-4 mr-2" /> PRINT DATA
                          </Button>
                          <Button onClick={() => downloadInvoice(ticket._id)} disabled={downloadingTicket === ticket._id} className="btn-premium-user primary">
                            {downloadingTicket === ticket._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> EXPORT PDF</>}
                          </Button>
                        </div>
                        {ticket.status === "Active" && status === "upcoming" && (
                          <Button onClick={() => handleCancel(ticket._id)} className="btn-premium-user danger">
                            INITIATE CANCELLATION
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </TooltipProvider>
  );
};
