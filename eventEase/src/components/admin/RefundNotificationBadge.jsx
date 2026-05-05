import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Bell, AlertCircle, ArrowRight, Loader2, IndianRupee, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const RefundNotificationBadge = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/alltickets");

      const pending = res.data.data.filter(
        (t) => t.status === "Cancelled" && t.refundStatus === "Pending Approval"
      );

      setPendingCount(pending.length);
      
      const recent = pending
        .sort((a, b) => new Date(b.cancellationDate) - new Date(a.cancellationDate))
        .slice(0, 5);
      
      setRecentRequests(recent);
    } catch (err) {
      console.error("Error fetching pending refunds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRefunds();
    const interval = setInterval(fetchPendingRefunds, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "JUST NOW";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}M AGO`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}H AGO`;
    return `${Math.floor(seconds / 86400)}D AGO`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all p-0 group"
        >
          <Bell className={cn("w-5 h-5 text-gray-400 group-hover:text-white transition-colors", pendingCount > 0 ? "animate-pulse text-[#E11D48]" : "")} />
          <AnimatePresence>
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="bg-[#E11D48] text-white h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px] font-black border-2 border-black">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[400px] p-0 bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 bg-[#E11D48]/10 border-b border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldAlert className="w-20 h-20 text-white" />
           </div>
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E11D48]/20 border border-[#E11D48]/30 flex items-center justify-center">
                 <Activity className="w-5 h-5 text-[#E11D48]" />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">REFUND REGISTRY</h3>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                    {pendingCount} FINANCIAL SETTLEMENTS PENDING
                 </p>
              </div>
           </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] mx-auto" />
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Auditing Ledger</p>
            </div>
          ) : pendingCount === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                 <Bell className="w-8 h-8 text-gray-700" />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">LEADGER BALANCED. NO REFUNDS.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentRequests.map((ticket, index) => (
                <Link key={ticket._id} to="/refunds">
                  <DropdownMenuItem className="p-6 hover:bg-white/5 focus:bg-white/5 transition-all cursor-pointer group border-none">
                    <div className="flex items-start gap-4 w-full">
                      <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-[#E11D48]/30 transition-all">
                        <AlertCircle className="w-5 h-5 text-gray-600 group-hover:text-[#E11D48] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-[#E11D48] transition-colors truncate">
                          {ticket.userId?.fullName || "ENTITY UNKNOWN"}
                        </p>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">
                          {ticket.eventId?.eventName || "ARCHIVED EVENT"}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5 text-[#E11D48]">
                             <IndianRupee className="w-3 h-3" />
                             <span className="text-[10px] font-black tracking-widest">
                               {ticket.refundAmount?.toLocaleString() || 0}
                             </span>
                          </div>
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                            {formatTimeAgo(ticket.cancellationDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}

              {pendingCount > 5 && (
                <div className="p-4 text-center bg-white/2 border-t border-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">
                    + {pendingCount - 5} ADDITIONAL SETTLEMENTS DETECTED
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {pendingCount > 0 && (
          <div className="p-6 bg-[#050505] border-t border-white/5">
            <Link to="/refunds">
              <Button className="w-full h-14 bg-[#E11D48] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.3)] group">
                AUDIT ALL SETTLEMENTS <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
