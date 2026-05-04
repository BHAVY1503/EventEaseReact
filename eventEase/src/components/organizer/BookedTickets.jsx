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
  Activity,
  Globe
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const BookedTickets = () => {
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
        const res = await api.get(`/tickets/organizer/self`);
        const raw = res.data?.data ?? [];
        const sorted = [...raw].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(sorted);
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

  const groupSeatsByZone = (seats) => {
    const zoneMap = {};
    seats?.forEach((label) => {
      const zone = label[0];
      if (!zoneMap[zone]) zoneMap[zone] = [];
      zoneMap[zone].push(label);
    });
    return zoneMap;
  };

  const calculateTotal = (ticket) => ticket.ticketRate * ticket.quantity;
  const calculateTax = (ticket) => (calculateTotal(ticket) * 0.18).toFixed(2);
  const calculateGrandTotal = (ticket) => (calculateTotal(ticket) + parseFloat(calculateTax(ticket))).toFixed(2);

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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-transparent text-white selection:bg-[#E11D48]/30">
        {/* Header Bar */}
        <div className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-2xl border-b border-white/5 px-8 py-6">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <button onClick={() => navigate("/organizer")} className="flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all border border-white/5 hover:bg-white/5">
              <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
            </button>
            <div className="flex flex-col items-center">
               <h2 className="text-2xl font-black uppercase tracking-tighter">PRODUCTION <span className="text-[#E11D48]">MANIFEST</span></h2>
               <p className="text-[7px] font-black tracking-[0.5em] text-gray-600 mt-1 uppercase">Operational Ticket Archive</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                  <Activity className="w-3 h-3 text-[#E11D48] animate-pulse" />
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{tickets.length} ACTIVE RECORDS</span>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-8 py-16">
          {tickets.length === 0 ? (
            <div className="py-40 text-center border border-white/5 rounded-[3rem] bg-white/5 backdrop-blur-3xl">
              <Receipt className="w-16 h-16 mx-auto text-gray-800 mb-8" />
              <h3 className="text-2xl font-black uppercase tracking-widest">No Records Found</h3>
              <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px] mt-4">Synchronization complete: 0 bookings detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {tickets.map((ticket) => {
                const event = ticket.eventId;
                const status = getEventStatus(event?.startDate, event?.endDate);
                return (
                  <div
                    key={ticket._id}
                    onClick={() => { setSelectedTicket(ticket); setIsSheetOpen(true); }}
                    className="group relative cursor-pointer bg-white rounded-[2.5rem] p-8 transition-all duration-700 hover:scale-[1.05] hover:rotate-1 shadow-2xl overflow-hidden border-4 border-transparent hover:border-[#E11D48]/20"
                  >
                    {/* Cinematic Stub Notches */}
                    <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#050505] rounded-full" />
                    <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#050505] rounded-full" />
                    
                    <div className="flex flex-col h-full space-y-6">
                      <div className="relative h-40 -mt-2 -mx-2 mb-4 overflow-hidden rounded-[1.8rem]">
                         <img src={event?.eventImgUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-gray-100 rounded-2xl group-hover:bg-[#E11D48] transition-colors duration-500">
                          <Ticket className="w-6 h-6 text-[#E11D48] group-hover:text-white" />
                        </div>
                        <Badge className={cn("text-[9px] font-black px-3 py-1 uppercase rounded-full", 
                          status === "past" ? "bg-gray-100 text-gray-500" : "bg-[#E11D48] text-white")}>
                          {status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase leading-none tracking-tighter text-black group-hover:text-[#E11D48] transition-colors truncate">
                          {event?.eventName || "RESERVED NODE"}
                        </h3>
                        <div className="flex items-center gap-3 text-gray-500 font-bold text-[9px] uppercase tracking-widest">
                           <Calendar className="w-3 h-3 text-[#E11D48]" /> {new Date(event?.startDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between items-center mt-auto">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">RECORD ID</span>
                           <span className="text-[10px] font-black text-black uppercase">#{ticket._id.slice(-8)}</span>
                        </div>
                        <div className="text-[#E11D48] font-black text-xl italic tracking-tighter">
                           ₹{calculateGrandTotal(ticket)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DETAIL PANEL (DRAWER) */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="right" className="bg-white border-l border-gray-100 w-full sm:max-w-2xl p-0 overflow-y-auto no-scrollbar">
              {selectedTicket && (() => {
                const ticket = selectedTicket;
                const event = ticket.eventId;
                const status = getEventStatus(event?.startDate, event?.endDate);
                const groupedSeats = groupSeatsByZone(ticket.selectedSeats);
                return (
                  <div className="flex flex-col min-h-screen text-black">
                    <div className="bg-gradient-to-br from-black via-gray-900 to-[#E11D48] p-12 shrink-0 relative overflow-hidden">
                      {event?.eventImgUrl && (
                        <img src={event.eventImgUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale blur-sm" />
                      )}
                      <SheetHeader className="text-left space-y-6 relative z-10">
                        <div className="flex justify-between items-center">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-white" />
                          </div>
                          <Badge className="bg-white text-black text-[10px] font-black px-6 py-2 rounded-full uppercase shadow-2xl">
                             AUTHORIZED ACCESS
                          </Badge>
                        </div>
                        <div>
                          <SheetTitle className="text-5xl font-black uppercase tracking-tighter text-white leading-none">PRODUCTION<br />RECORD</SheetTitle>
                          <p className="text-white/50 font-black uppercase tracking-[0.4em] text-[10px] mt-4">NODE-ARCHIVE: {ticket._id.toUpperCase()}</p>
                        </div>
                      </SheetHeader>
                    </div>

                    <div className="p-12 space-y-12">
                      <div className="space-y-6">
                         <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Entity Identification</span>
                            <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter">{event?.eventName}</h2>
                         </div>
                         {event?.eventImgUrl && (
                           <div className="w-full h-64 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl">
                             <img src={event.eventImgUrl} className="w-full h-full object-cover" />
                           </div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 gap-8 py-10 border-y border-gray-100">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#E11D48]" /> TRANSMISSION</p>
                          <p className="text-lg font-black">{new Date(event?.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#E11D48]" /> HOLDER</p>
                          <p className="text-lg font-black truncate">{ticket.userId?.fullName || "AUTHORIZED GUEST"}</p>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#E11D48]" /> COORDINATES</p>
                          <p className="text-sm font-bold leading-relaxed">{event?.location || "GLOBAL NODE ARCHIVE"}</p>
                        </div>
                      </div>

                      {ticket.selectedSeats?.length > 0 && (
                        <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-6 flex items-center gap-2">
                            <Rocket className="w-4 h-4" /> SECTOR ASSIGNMENTS
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {ticket.selectedSeats.map((s, i) => (
                              <Badge key={i} className="text-[11px] font-black px-4 py-2 bg-white text-black border border-gray-200 rounded-xl shadow-sm">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-black p-10 rounded-[3rem] shadow-2xl flex justify-between items-center text-white">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Node Value</p>
                          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest italic">Authorized by Razorpay Protocol</p>
                        </div>
                        <div className="text-5xl font-black tracking-tighter italic">₹{calculateGrandTotal(ticket)}</div>
                      </div>

                      <div className="flex flex-col gap-4 pt-8 pb-12">
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" onClick={() => printInvoice(ticket._id)} className="h-20 rounded-[2rem] bg-white border-gray-200 text-black hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest">
                            <Printer className="w-5 h-5 mr-3" /> PRINT DATA
                          </Button>
                          <Button onClick={() => downloadInvoice(ticket._id)} disabled={downloadingTicket === ticket._id} className="h-20 rounded-[2rem] bg-black text-white hover:bg-[#E11D48] transition-all text-[10px] font-black uppercase tracking-widest">
                            {downloadingTicket === ticket._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5 mr-3" /> EXPORT PDF</>}
                          </Button>
                        </div>
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
