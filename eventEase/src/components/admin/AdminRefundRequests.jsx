import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2
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
        title: "Error",
        description: "Failed to fetch refund requests",
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
        title: "✅ Refund Approved",
        description: "The refund has been approved and will be processed shortly.",
      });

      fetchTickets();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Error approving refund",
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
        title: "Error",
        description: "Please provide a reason for rejection",
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
        title: "❌ Refund Rejected",
        description: "The refund request has been rejected and user has been notified.",
      });

      setRejectDialog({ open: false, ticketId: null });
      setRejectRemark("");
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Error rejecting refund",
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
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Refund Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Review and process pending refund requests
              </p>
            </div>
          </div>
          
          {/* Stats Badge */}
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-yellow-100 text-yellow-800  text-sm px-4 py-2">
              {tickets.length} Pending Request{tickets.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          </div>
        ) : tickets.length === 0 ? (
          /* Empty State */
          <Card className="border-dashed border-2 bg-white dark:bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-green-100  rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 " />
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600  text-center max-w-md">
                No pending refund requests at the moment. Check back later for new submissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Refund Requests Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <Card 
                key={ticket._id} 
                className="shadow-lg border border-gray-200  hover:shadow-xl transition-all bg-white dark:bg-gray-800"
              >
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {ticket.eventId?.eventName || "Event"}
                    </CardTitle>
                    <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                      PENDING
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    ID: {ticket._id.slice(-8).toUpperCase()}
                  </p>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* User Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-blue-600 " />
                      <span className="font-semibold text-gray-900 ">
                        {ticket.userId?.fullName || "Unknown User"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{ticket.userId?.email}</span>
                    </div>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  {/* Event & Cancellation Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 ">
                      <Calendar className="w-4 h-4 text-purple-600 " />
                      <span>Cancelled on: {formatDate(ticket.cancellationDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 ">
                      <Ticket className="w-4 h-4 text-indigo-600" />
                      <span>Quantity: {ticket.quantity} ticket(s)</span>
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  {ticket.cancellationReason && (
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600  mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700  mb-1">
                            Cancellation Reason:
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            "{ticket.cancellationReason || "No reason provided"}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="dark:bg-gray-700" />

                  {/* Refund Amount */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-green-600 " />
                        <span className="text-sm font-semibold text-gray-700">
                          Refund Amount:
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-green-600 ">
                        ₹{ticket.refundAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => approveRefund(ticket._id)}
                      disabled={processingId === ticket._id}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {processingId === ticket._id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>

                    <Button
                      onClick={() => openRejectDialog(ticket._id)}
                      disabled={processingId === ticket._id}
                      variant="destructive"
                      className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="bg-white text-gray-700 border-gray-300 dark: hover:bg-gray-950 "
                    >
                      <a href="/admin">← Back to Home</a>
                    </Button>
                  </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, ticketId: null })}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="w-5 h-5" />
              Reject Refund Request
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Please provide a reason for rejecting this refund request. The user will be notified via email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remark" className="text-gray-900 dark:text-gray-100">
                Rejection Reason *
              </Label>
              <Textarea
                id="remark"
                placeholder="E.g., Event has already started, cancellation policy violation, etc."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                className="min-h-[120px] dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, ticketId: null })}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectRemark.trim() || processingId === rejectDialog.ticketId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processingId === rejectDialog.ticketId ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { 
//   AlertCircle, 
//   CheckCircle, 
//   XCircle, 
//   Calendar, 
//   User, 
//   Mail, 
//   Ticket,
//   IndianRupee,
//   MessageSquare,
//   Loader2,
//   Bell,
//   Clock,
//   TrendingUp
// } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";

// export const AdminRefundRequests = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [processingId, setProcessingId] = useState(null);
//   const [rejectDialog, setRejectDialog] = useState({ open: false, ticketId: null });
//   const [rejectRemark, setRejectRemark] = useState("");
//   const [filter, setFilter] = useState("all"); // all, new, recent
//   const { toast } = useToast();

//   const token = localStorage.getItem("token");

//   const fetchTickets = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get("/tickets/alltickets", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Filter only cancelled tickets with pending approval
//       const filtered = res.data.data.filter(t => 
//         t.status === "Cancelled" && 
//         t.refundStatus === "Pending Approval"
//       );

//       // Sort by date (newest first)
//       filtered.sort((a, b) => new Date(b.cancellationDate) - new Date(a.cancellationDate));

//       setTickets(filtered);
//     } catch (err) {
//       console.error("Error fetching tickets", err);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to fetch refund requests",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTickets();
    
//     // Auto-refresh every 30 seconds
//     const interval = setInterval(fetchTickets, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const approveRefund = async (id) => {
//     setProcessingId(id);
//     try {
//       await axios.post(`/tickets/refund/approve/${id}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast({
//         title: "✅ Refund Approved",
//         description: "The refund has been approved and will be processed shortly.",
//       });

//       fetchTickets();
//     } catch (err) {
//       console.error(err);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: err.response?.data?.message || "Error approving refund",
//       });
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const openRejectDialog = (id) => {
//     setRejectDialog({ open: true, ticketId: id });
//     setRejectRemark("");
//   };

//   const confirmReject = async () => {
//     if (!rejectRemark.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Please provide a reason for rejection",
//       });
//       return;
//     }

//     setProcessingId(rejectDialog.ticketId);
//     try {
//       await axios.post(`/tickets/refund/reject/${rejectDialog.ticketId}`, 
//         { remark: rejectRemark }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       toast({
//         title: "❌ Refund Rejected",
//         description: "The refund request has been rejected and user has been notified.",
//       });

//       setRejectDialog({ open: false, ticketId: null });
//       setRejectRemark("");
//       fetchTickets();
//     } catch (err) {
//       console.error(err);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: err.response?.data?.message || "Error rejecting refund",
//       });
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', { 
//       weekday: 'short',
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getTimeAgo = (date) => {
//     const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
//     if (seconds < 60) return { text: "Just now", isNew: true };
//     if (seconds < 3600) return { text: `${Math.floor(seconds / 60)}m ago`, isNew: true };
//     if (seconds < 86400) return { text: `${Math.floor(seconds / 3600)}h ago`, isNew: seconds < 7200 };
//     return { text: `${Math.floor(seconds / 86400)}d ago`, isNew: false };
//   };

//   const isNewRequest = (date) => {
//     const hoursSince = (new Date() - new Date(date)) / (1000 * 60 * 60);
//     return hoursSince < 24; // Within 24 hours
//   };

//   const isUrgent = (date) => {
//     const hoursSince = (new Date() - new Date(date)) / (1000 * 60 * 60);
//     return hoursSince < 2; // Within 2 hours
//   };

//   const getFilteredTickets = () => {
//     if (filter === "new") {
//       return tickets.filter(t => isNewRequest(t.cancellationDate));
//     }
//     if (filter === "recent") {
//       return tickets.filter(t => isUrgent(t.cancellationDate));
//     }
//     return tickets;
//   };

//   const filteredTickets = getFilteredTickets();
//   const newCount = tickets.filter(t => isNewRequest(t.cancellationDate)).length;
//   const urgentCount = tickets.filter(t => isUrgent(t.cancellationDate)).length;
//   const totalAmount = tickets.reduce((sum, t) => sum + (t.refundAmount || 0), 0);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header with Stats */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center relative">
//               <AlertCircle className="w-7 h-7 text-white" />
//               {tickets.length > 0 && (
//                 <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-600 text-white text-xs animate-pulse">
//                   {tickets.length}
//                 </Badge>
//               )}
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
//                 Refund Requests
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 text-sm">
//                 Review and process pending refund requests
//               </p>
//             </div>
//           </div>
          
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Total Pending</p>
//                     <p className="text-2xl font-bold text-red-700 dark:text-red-300">{tickets.length}</p>
//                   </div>
//                   <Bell className="w-8 h-8 text-red-600 dark:text-red-400 opacity-50" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Urgent (2h)</p>
//                     <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{urgentCount}</p>
//                   </div>
//                   <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400 opacity-50" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">New (24h)</p>
//                     <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{newCount}</p>
//                   </div>
//                   <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400 opacity-50" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Total Amount</p>
//                     <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{totalAmount.toLocaleString()}</p>
//                   </div>
//                   <IndianRupee className="w-8 h-8 text-green-600 dark:text-green-400 opacity-50" />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Filter Buttons */}
//           <div className="flex items-center gap-3 flex-wrap">
//             <Button
//               variant={filter === "all" ? "default" : "outline"}
//               onClick={() => setFilter("all")}
//               className={filter === "all" ? "bg-gradient-to-r from-yellow-600 to-orange-600" : ""}
//             >
//               All Requests ({tickets.length})
//             </Button>
//             <Button
//               variant={filter === "recent" ? "default" : "outline"}
//               onClick={() => setFilter("recent")}
//               className={filter === "recent" ? "bg-gradient-to-r from-orange-600 to-red-600" : ""}
//             >
//               <Clock className="w-4 h-4 mr-2" />
//               Urgent ({urgentCount})
//             </Button>
//             <Button
//               variant={filter === "new" ? "default" : "outline"}
//               onClick={() => setFilter("new")}
//               className={filter === "new" ? "bg-gradient-to-r from-yellow-600 to-orange-600" : ""}
//             >
//               <TrendingUp className="w-4 h-4 mr-2" />
//               New Today ({newCount})
//             </Button>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
//           </div>
//         ) : filteredTickets.length === 0 ? (
//           /* Empty State */
//           <Card className="border-dashed border-2 bg-white dark:bg-gray-800">
//             <CardContent className="flex flex-col items-center justify-center py-16">
//               <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
//                 <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                 {filter === "all" ? "All Caught Up!" : `No ${filter} requests`}
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
//                 {filter === "all" 
//                   ? "No pending refund requests at the moment. Check back later for new submissions."
//                   : `There are no ${filter} refund requests. Try viewing all requests.`
//                 }
//               </p>
//             </CardContent>
//           </Card>
//         ) : (
//           /* Refund Requests Grid */
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {filteredTickets.map(ticket => {
//               const timeInfo = getTimeAgo(ticket.cancellationDate);
//               const isNew = isNewRequest(ticket.cancellationDate);
//               const urgent = isUrgent(ticket.cancellationDate);

//               return (
//                 <Card 
//                   key={ticket._id} 
//                   className={`shadow-lg border hover:shadow-xl transition-all bg-white dark:bg-gray-800 relative ${
//                     urgent ? 'border-red-400 ring-2 ring-red-200 dark:ring-red-900' : 
//                     isNew ? 'border-yellow-400 ring-2 ring-yellow-200 dark:ring-yellow-900' : 
//                     'border-gray-200 dark:border-gray-700'
//                   }`}
//                 >
//                   {/* New/Urgent Badge */}
//                   {(isNew || urgent) && (
//                     <div className="absolute -top-2 -right-2 z-10">
//                       <Badge className={`animate-pulse ${
//                         urgent 
//                           ? 'bg-red-600 text-white' 
//                           : 'bg-yellow-600 text-white'
//                       }`}>
//                         {urgent ? '🔥 URGENT' : '✨ NEW'}
//                       </Badge>
//                     </div>
//                   )}

//                   <CardHeader className={`bg-gradient-to-r ${
//                     urgent ? 'from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30' :
//                     isNew ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30' :
//                     'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
//                   } border-b border-gray-200 dark:border-gray-700`}>
//                     <div className="flex justify-between items-start">
//                       <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
//                         {ticket.eventId?.eventName || "Event"}
//                       </CardTitle>
//                       <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
//                         PENDING
//                       </Badge>
//                     </div>
//                     <div className="flex items-center justify-between mt-2">
//                       <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
//                         ID: {ticket._id.slice(-8).toUpperCase()}
//                       </p>
//                       <Badge variant="outline" className={`text-xs ${
//                         timeInfo.isNew ? 'border-green-500 text-green-700 dark:text-green-400' : ''
//                       }`}>
//                         {timeInfo.text}
//                       </Badge>
//                     </div>
//                   </CardHeader>

//                   <CardContent className="p-5 space-y-4">
//                     {/* User Info */}
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2 text-sm">
//                         <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                         <span className="font-semibold text-gray-900 dark:text-white">
//                           {ticket.userId?.fullName || "Unknown User"}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                         <Mail className="w-4 h-4 text-gray-400" />
//                         <span className="truncate">{ticket.userId?.email}</span>
//                       </div>
//                     </div>

//                     <Separator className="dark:bg-gray-700" />

//                     {/* Event & Cancellation Info */}
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                         <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                         <span>{formatDate(ticket.cancellationDate)}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                         <Ticket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//                         <span>Quantity: {ticket.quantity} ticket(s)</span>
//                       </div>
//                     </div>

//                     {/* Cancellation Reason */}
//                     {ticket.cancellationReason && (
//                       <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-l-4 border-blue-500">
//                         <div className="flex items-start gap-2">
//                           <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
//                           <div className="flex-1">
//                             <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
//                               Cancellation Reason:
//                             </p>
//                             <p className="text-sm text-gray-600 dark:text-gray-400 italic">
//                               "{ticket.cancellationReason || "No reason provided"}"
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     <Separator className="dark:bg-gray-700" />

//                     {/* Refund Amount */}
//                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
//                           <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//                             Refund Amount:
//                           </span>
//                         </div>
//                         <span className="text-2xl font-bold text-green-600 dark:text-green-400">
//                           ₹{ticket.refundAmount?.toLocaleString() || 0}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex gap-3 pt-2">
//                       <Button
//                         onClick={() => approveRefund(ticket._id)}
//                         disabled={processingId === ticket._id}
//                         className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
//                       >
//                         {processingId === ticket._id ? (
//                           <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                         ) : (
//                           <CheckCircle className="w-4 h-4 mr-2" />
//                         )}
//                         Approve
//                       </Button>

//                       <Button
//                         onClick={() => openRejectDialog(ticket._id)}
//                         disabled={processingId === ticket._id}
//                         variant="destructive"
//                         className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
//                       >
//                         <XCircle className="w-4 h-4 mr-2" />
//                         Reject
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
        
//         <div className="text-center mt-8">
//           <Button
//             variant="outline"
//             size="lg"
//             asChild
//             className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950"
//           >
//             <a href="/admin">← Back to Home</a>
//           </Button>
//         </div>
//       </div>

//       {/* Reject Dialog */}
//       <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, ticketId: null })}>
//         <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
//               <XCircle className="w-5 h-5" />
//               Reject Refund Request
//             </DialogTitle>
//             <DialogDescription className="text-gray-600 dark:text-gray-400">
//               Please provide a reason for rejecting this refund request. The user will be notified via email.
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="remark" className="text-gray-900 dark:text-gray-100">
//                 Rejection Reason *
//               </Label>
//               <Textarea
//                 id="remark"
//                 placeholder="E.g., Event has already started, cancellation policy violation, etc."
//                 value={rejectRemark}
//                 onChange={(e) => setRejectRemark(e.target.value)}
//                 className="min-h-[120px] dark:bg-gray-900 dark:border-gray-700"
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setRejectDialog({ open: false, ticketId: null })}
//               className="dark:border-gray-700 dark:text-gray-300"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmReject}
//               disabled={!rejectRemark.trim() || processingId === rejectDialog.ticketId}
//               className="bg-red-600 hover:bg-red-700 text-white"
//             >
//               {processingId === rejectDialog.ticketId ? (
//                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
//               ) : (
//                 <XCircle className="w-4 h-4 mr-2" />
//               )}
//               Confirm Rejection
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";

// export const AdminRefundRequests = () => {
//   const [tickets, setTickets] = useState([]);

//   const token = localStorage.getItem("token");

//   const fetchTickets = async () => {
//     try {
//       const res = await axios.get("/tickets/alltickets", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Filter only cancelled tickets with pending approval
//       const filtered = res.data.data.filter(t => 
//         t.status === "Cancelled" && 
//         t.refundStatus === "Pending Approval"
//       );

//       setTickets(filtered);
//     } catch (err) {
//       console.error("Error fetching tickets", err);
//     }
//   };

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   const approveRefund = async (id) => {
//     try {
//       await axios.post(`/tickets/refund/approve/${id}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       alert("Refund Approved");
//       fetchTickets();
//     } catch (err) {
//       console.error(err);
//       alert("Error approving refund");
//     }
//   };

//   const rejectRefund = async (id) => {
//     const remark = prompt("Reason for rejecting refund?");
//     if (!remark) return;

//     try {
//       await axios.post(`/tickets/refund/reject/${id}`, { remark }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       alert("Refund Rejected");
//       fetchTickets();
//     } catch (err) {
//       console.error(err);
//       alert("Error rejecting refund");
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Refund Requests</h2>

//       {tickets.length === 0 ? (
//         <p>No pending refund requests</p>
//       ) : (
//         tickets.map(ticket => (
//           <div key={ticket._id} className="border p-4 rounded mb-3">
//             <p><strong>Event:</strong> {ticket.eventId?.eventName}</p>
//             <p><strong>User:</strong> {ticket.userId?.fullName}</p>
//             <p><strong>Email:</strong> {ticket.userId?.email}</p>
//             <p><strong>Reason:</strong> {ticket.cancellationReason}</p>
//             <p><strong>Refund Amount:</strong> ₹{ticket.refundAmount}</p>

//             <div className="flex gap-3 mt-3">
//               <Button onClick={() => approveRefund(ticket._id)} className="bg-green-600">
//                 Approve Refund
//               </Button>

//               <Button onClick={() => rejectRefund(ticket._id)} className="bg-red-600">
//                 Reject Refund
//               </Button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };
