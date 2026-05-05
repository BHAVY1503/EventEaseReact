import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertCircle, 
  Calendar, 
  User, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Activity,
  Zap,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const PendingEventsBadge = ({ onNavigate }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/event/groupedeventsbyorganizer");

      let pending = [];
      res.data.data.forEach((group) => {
        group.events.forEach((event) => {
          if (event.approvalStatus === "Pending") {
            pending.push({
              ...event,
              organizerName: group.organizerName,
              organizerEmail: group.organizerEmail,
            });
          }
        });
      });

      pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPendingEvents(pending);
      setPendingCount(pending.length);
    } catch (err) {
      console.error("Failed to fetch pending events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
    const interval = setInterval(fetchPendingEvents, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all p-0 group"
        >
          <Bell 
            className={cn(
              "w-5 h-5 text-gray-400 group-hover:text-white transition-colors",
              pendingCount > 0 ? "animate-pulse text-[#E11D48]" : ""
            )} 
          />
          <AnimatePresence>
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="bg-[#E11D48] text-white h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px] font-black border-2 border-black">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0 bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-3xl overflow-hidden" align="end">
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
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">PENDING APPROVALS</h3>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                    {pendingCount} SIGNALS AWAITING AUTHORIZATION
                 </p>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] mx-auto" />
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Synchronizing Uplink</p>
            </div>
          ) : pendingCount === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                 <Bell className="w-8 h-8 text-gray-700" />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">GRID IS OPTIMAL. NO PENDING SIGNALS.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pendingEvents.slice(0, 10).map((event, index) => {
                const isNew = new Date() - new Date(event.createdAt) < 3600000;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={event._id}
                    className="p-6 hover:bg-white/5 transition-all cursor-pointer group"
                    onClick={() => onNavigate && onNavigate("groupbyevent")}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-[#E11D48] transition-colors line-clamp-1">
                           {event.eventName}
                         </h4>
                         <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                               <User className="w-2.5 h-2.5" /> {event.organizerName}
                            </span>
                         </div>
                      </div>
                      {isNew && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                          RECENT
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="px-2 py-1 bg-white/5 rounded-md border border-white/5">
                             <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-2.5 h-2.5" /> {new Date(event.startDate).toLocaleDateString()}
                             </p>
                          </div>
                          <Badge variant="outline" className="text-[7px] font-black border-white/10 text-gray-400 uppercase tracking-widest">
                             {event.eventType}
                          </Badge>
                       </div>
                       <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-[#E11D48] transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                );
              })}
              
              {pendingEvents.length > 10 && (
                <div className="p-4 text-center bg-white/2">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">
                     + {pendingEvents.length - 10} ADDITIONAL ENTITIES DETECTED
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {pendingCount > 0 && (
          <div className="p-6 bg-[#050505] border-t border-white/5">
            <Button
              className="w-full h-14 bg-[#E11D48] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.3)] group"
              size="sm"
              onClick={() => onNavigate && onNavigate("groupbyevent")}
            >
              ACCESS ALL SIGNALS <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PendingEventsBadge;
