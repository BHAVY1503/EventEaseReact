import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  Mail, 
  Ticket,
  IndianRupee,
  MessageSquare,
  Loader2,
  Activity,
  Globe,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Clock,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const AdminRefundRequests = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, ticketId: null });
  const [rejectRemark, setRejectRemark] = useState("");
  const { toast } = useToast();

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/tickets/alltickets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only cancelled tickets with pending approval
      const filtered = res.data.data.filter(t => 
        t.status === "Cancelled" && 
        t.refundStatus === "Pending Approval"
      );

      setTickets(filtered);
    } catch (err) {
      console.error("Error fetching tickets", err);
      toast({
        variant: "destructive",
        title: "LINK FAILURE",
        description: "UNABLE TO ACCESS REFUND CORE.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const approveRefund = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`/tickets/refund/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "PROTOCOL SUCCESS",
        description: "REFUND APPROVAL SEQUENCE COMPLETED.",
      });

      fetchTickets();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "ERROR",
        description: err.response?.data?.message || "REFUND APPROVAL FAILED.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (id) => {
    setRejectDialog({ open: true, ticketId: id });
    setRejectRemark("");
  };

  const confirmReject = async () => {
    if (!rejectRemark.trim()) {
      toast({
        variant: "destructive",
        title: "VALIDATION ERROR",
        description: "REJECTION REMARK REQUIRED.",
      });
      return;
    }

    setProcessingId(rejectDialog.ticketId);
    try {
      await axios.post(`/tickets/refund/reject/${rejectDialog.ticketId}`, 
        { remark: rejectRemark }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "PROTOCOL SUCCESS",
        description: "REFUND REJECTION SEQUENCE COMPLETED.",
      });

      setRejectDialog({ open: false, ticketId: null });
      setRejectRemark("");
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "ERROR",
        description: err.response?.data?.message || "REFUND REJECTION FAILED.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Syncing Refund Core Data</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E11D48]/10 border border-[#E11D48]/20 rounded-full">
          <IndianRupee className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Global Refund Protocol Active</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              REFUND<br />
              <span className="text-[#E11D48]">COMMAND</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Oversight and regulation of platform financial reversals.
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-black text-white">{tickets.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Grid Total</p>
              <p className="text-3xl font-black text-[#E11D48]">₹{tickets.reduce((acc, t) => acc + (t.refundAmount || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Active Requests", value: tickets.length, icon: Activity, color: "text-[#E11D48]" },
          { label: "Avg. Refund Val", value: tickets.length ? `₹${Math.round(tickets.reduce((acc, t) => acc + (t.refundAmount || 0), 0) / tickets.length).toLocaleString()}` : "₹0", icon: TrendingUp, color: "text-blue-500" },
          { label: "High Priority", value: tickets.filter(t => (t.refundAmount || 0) > 5000).length, icon: AlertCircle, color: "text-emerald-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <stat.icon className="w-20 h-20 text-white" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">{stat.label}</p>
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-4xl font-black text-white relative z-10">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* MAIN REGISTRY */}
      <AnimatePresence mode="popLayout">
        {tickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-4"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Zero Pending Requests Detected. Sector Clear.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 hover:border-[#E11D48]/30 transition-all duration-500 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   <IndianRupee className="w-40 h-40 text-white" />
                </div>

                <div className="relative z-10 space-y-8">
                  {/* META HEADER */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#E11D48] transition-colors">
                        {ticket.eventId?.eventName || "UNDEFINED ENTITY"}
                      </h4>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        TICKET REF: {ticket._id.slice(-12).toUpperCase()}
                      </p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black text-[8px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg">
                       PENDING APPROVAL
                    </Badge>
                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                       <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3 text-blue-500" />
                          <p className="text-[7px] font-black uppercase tracking-widest text-gray-600">Requester</p>
                       </div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{ticket.userId?.fullName || "UNKNOWN USER"}</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                       <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3 h-3 text-purple-500" />
                          <p className="text-[7px] font-black uppercase tracking-widest text-gray-600">Cancel Date</p>
                       </div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(ticket.cancellationDate)}</p>
                    </div>
                  </div>

                  {/* REASON PAYLOAD */}
                  {ticket.cancellationReason && (
                    <div className="p-6 bg-[#E11D48]/5 border border-[#E11D48]/10 rounded-2xl space-y-2">
                       <div className="flex items-center gap-3">
                          <MessageSquare className="w-3.5 h-3.5 text-[#E11D48]" />
                          <p className="text-[8px] font-black text-[#E11D48] uppercase tracking-widest text-gray-600">Cancellation Reason</p>
                       </div>
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">"{ticket.cancellationReason}"</p>
                    </div>
                  )}

                  {/* FINANCIAL PAYLOAD */}
                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Refund Allocation</p>
                       <p className="text-4xl font-black text-emerald-500">₹{ticket.refundAmount?.toLocaleString() || 0}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                       <IndianRupee className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>

                  {/* PROTOCOLS */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      onClick={() => approveRefund(ticket._id)}
                      disabled={processingId === ticket._id}
                      className="h-14 flex-1 bg-emerald-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                      {processingId === ticket._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-4" /> AUTHORIZE</>
                      )}
                    </Button>
                    <Button
                      onClick={() => openRejectDialog(ticket._id)}
                      disabled={processingId === ticket._id}
                      variant="outline"
                      className="h-14 flex-1 border-white/10 bg-[#0A0A0A] text-red-500 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <XCircle className="w-4 h-4 mr-4" /> DENY ACCESS
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER ACTION */}
      <div className="text-center pt-8">
        <Link to="/admin">
          <Button variant="outline" className="h-16 px-10 border-white/10 bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all group">
            RETURN TO COMMAND CENTER <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* REJECT DIALOG */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, ticketId: null })}>
        <DialogContent className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-10 max-w-md">
          <DialogHeader className="space-y-6">
            <div className="w-16 h-16 bg-[#E11D48]/10 rounded-[1.5rem] flex items-center justify-center border border-[#E11D48]/20 mx-auto">
              <ShieldAlert className="w-8 h-8 text-[#E11D48]" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                REFUND REJECTION<br />
                <span className="text-[#E11D48]">PROTOCOL</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                SPECIFY THE REJECTION REMARK FOR THE ENTITY. THIS DATA WILL BE LOGGED IN THE CENTRAL REGISTRY.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-8">
            <div className="space-y-3">
              <Label htmlFor="remark" className="text-[9px] font-black uppercase tracking-widest text-gray-500">Protocol Remark *</Label>
              <Textarea
                id="remark"
                placeholder="E.G., VIOLATION OF CANCELLATION PROTOCOLS..."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 placeholder:text-gray-800 transition-all p-6"
              />
            </div>
          </div>

          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, ticketId: null })}
              className="h-14 flex-1 bg-white/5 border-white/10 text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:bg-white/10"
            >
              ABORT
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectRemark.trim() || processingId === rejectDialog.ticketId}
              className="h-14 flex-1 bg-[#E11D48] text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:bg-red-700 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all"
            >
              {processingId === rejectDialog.ticketId ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              EXECUTE DENIAL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
