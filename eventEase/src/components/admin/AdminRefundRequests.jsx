import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  Ticket,
  IndianRupee,
  MessageSquare,
  Loader2,
  Activity,
  ArrowRight,
  Zap,
  ShieldAlert,
  TrendingUp
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
import "@/styles/components/AdminRefundRequests.css";

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
      const filtered = (res.data.data || []).filter(t => 
        t.status === "Cancelled" && t.refundStatus === "Pending Approval"
      );
      setTickets(filtered);
    } catch (err) {
      console.error("Error fetching tickets", err);
      toast({ variant: "destructive", title: "LINK FAILURE", description: "UNABLE TO ACCESS REFUND CORE." });
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
      toast({ title: "PROTOCOL SUCCESS", description: "REFUND APPROVAL SEQUENCE COMPLETED." });
      fetchTickets();
    } catch (err) {
      toast({ variant: "destructive", title: "ERROR", description: err.response?.data?.message || "REFUND APPROVAL FAILED." });
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
      toast({ variant: "destructive", title: "VALIDATION ERROR", description: "REJECTION REMARK REQUIRED." });
      return;
    }
    setProcessingId(rejectDialog.ticketId);
    try {
      await axios.post(`/tickets/refund/reject/${rejectDialog.ticketId}`, 
        { remark: rejectRemark }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "PROTOCOL SUCCESS", description: "REFUND REJECTION SEQUENCE COMPLETED." });
      setRejectDialog({ open: false, ticketId: null });
      fetchTickets();
    } catch (err) {
      toast({ variant: "destructive", title: "ERROR", description: err.response?.data?.message || "REFUND REJECTION FAILED." });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
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

  const totalRefundAmount = tickets.reduce((acc, t) => acc + (t.refundAmount || 0), 0);

  return (
    <div className="refund-command-container">
      <div className="refund-command-content">
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="refund-header-premium">
          <div className="command-title-box">
            <p className="command-subtitle">Global Refund Protocol Active</p>
            <h1>REFUND<br /><span>COMMAND</span></h1>
          </div>
          <div className="command-stats-box">
            <div className="stat-node-admin">
              <p>Pending Requests</p>
              <p>{tickets.length}</p>
            </div>
            <div className="stat-node-admin highlight">
              <p>Grid Total</p>
              <p>₹{totalRefundAmount.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { label: "Active Requests", value: tickets.length, icon: Activity, color: "text-[#E11D48]" },
            { label: "Avg. Refund Val", value: tickets.length ? `₹${Math.round(totalRefundAmount / tickets.length).toLocaleString()}` : "₹0", icon: TrendingUp, color: "text-blue-500" },
            { label: "High Priority", value: tickets.filter(t => (t.refundAmount || 0) > 5000).length, icon: AlertCircle, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><stat.icon className="w-20 h-20" /></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4">{stat.label}</p>
              <p className="text-4xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* REQUESTS LIST */}
        <div className="refund-requests-grid">
          <AnimatePresence mode="popLayout">
            {tickets.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center col-span-full">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Zero Pending Requests Detected. Sector Clear.</p>
              </motion.div>
            ) : (
              tickets.map((ticket, index) => (
                <motion.div key={ticket._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="refund-request-card">
                  <div className="card-bg-icon-floating"><IndianRupee className="w-40 h-40 text-white" /></div>
                  <div className="card-meta-header">
                    <div className="event-label-box">
                      <h4>{ticket.eventId?.eventName || "UNDEFINED ENTITY"}</h4>
                      <p className="ref-tag-admin">TICKET REF: {ticket._id.slice(-12).toUpperCase()}</p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black text-[8px] uppercase tracking-widest px-4 py-2 rounded-lg">PENDING</Badge>
                  </div>
                  <div className="info-cluster-admin">
                    <div className="cluster-item-admin">
                      <div className="cluster-label-row"><User /><span>Requester</span></div>
                      <p className="cluster-value-text">{ticket.userId?.fullName || "UNKNOWN"}</p>
                    </div>
                    <div className="cluster-item-admin">
                      <div className="cluster-label-row"><Calendar /><span>Cancel Date</span></div>
                      <p className="cluster-value-text">{formatDate(ticket.cancellationDate)}</p>
                    </div>
                  </div>
                  {ticket.cancellationReason && (
                    <div className="reason-payload-admin">
                      <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-3 h-3 text-[#E11D48]" /><span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Reason</span></div>
                      <p className="text-xs font-bold text-gray-400 italic">"{ticket.cancellationReason}"</p>
                    </div>
                  )}
                  <div className="financial-node-admin">
                    <div className="amount-display-admin">₹{ticket.refundAmount?.toLocaleString()}</div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><IndianRupee className="w-5 h-5 text-emerald-500" /></div>
                  </div>
                  <div className="protocol-actions-admin">
                    <Button onClick={() => approveRefund(ticket._id)} disabled={processingId === ticket._id} className="btn-admin-protocol authorize">
                      {processingId === ticket._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> AUTHORIZE</>}
                    </Button>
                    <Button onClick={() => openRejectDialog(ticket._id)} disabled={processingId === ticket._id} className="btn-admin-protocol deny">
                      <XCircle className="w-4 h-4" /> DENY
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-20">
          <Link to="/admin">
            <Button variant="outline" className="h-16 px-10 border-white/10 bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all group">
              RETURN TO COMMAND CENTER <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, ticketId: null })}>
          <DialogContent className="admin-dialog-premium max-w-md">
            <DialogHeader>
              <div className="dialog-header-visual"><ShieldAlert className="w-8 h-8" /></div>
              <DialogTitle className="dialog-title-admin">REFUND REJECTION<br /><span className="text-[#E11D48]">PROTOCOL</span></DialogTitle>
              <DialogDescription className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">Specify the rejection remark for the entity registry.</DialogDescription>
            </DialogHeader>
            <div className="py-8">
              <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Protocol Remark *</Label>
              <Textarea placeholder="E.G. VIOLATION OF PROTOCOLS..." value={rejectRemark} onChange={(e) => setRejectRemark(e.target.value)} className="dialog-input-premium" />
            </div>
            <DialogFooter className="gap-4">
              <Button variant="outline" onClick={() => setRejectDialog({ open: false, ticketId: null })} className="h-14 flex-1 bg-white/5 border-white/10 text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl">ABORT</Button>
              <Button onClick={confirmReject} disabled={!rejectRemark.trim() || processingId === rejectDialog.ticketId} className="h-14 flex-1 bg-[#E11D48] text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl">
                {processingId === rejectDialog.ticketId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} EXECUTE DENIAL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
