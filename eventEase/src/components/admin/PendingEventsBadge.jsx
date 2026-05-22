import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Calendar, 
  User, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/PendingEventsBadge.css";

export const PendingEventsBadge = ({ onNavigate }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/event/groupedeventsbyorganizer");
      let pending = [];
      (res.data.data || []).forEach((group) => {
        group.events.forEach((event) => {
          if (event.approvalStatus === "Pending") {
            pending.push({ ...event, organizerName: group.organizerName });
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
    const interval = setInterval(fetchPendingEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="pending-badge-trigger">
          <Bell className={cn("bell-icon-admin", pendingCount > 0 && "active animate-pulse")} />
          <AnimatePresence>
            {pendingCount > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="pending-count-tag">
                {pendingCount > 99 ? "99+" : pendingCount}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="pending-popover-content" align="end">
        <div className="popover-header-premium">
          <div className="popover-header-bg-icon"><ShieldAlert className="w-20 h-20 text-white" /></div>
          <div className="popover-header-info">
            <div className="header-icon-box-admin"><Activity /></div>
            <div className="header-text-box-admin">
              <h3>PENDING APPROVALS</h3>
              <p>{pendingCount} SIGNALS AWAITING AUTHORIZATION</p>
            </div>
          </div>
        </div>

        <div className="pending-events-list no-scrollbar">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#E11D48] mx-auto" /></div>
          ) : pendingCount === 0 ? (
            <div className="p-16 text-center"><Bell className="w-12 h-12 text-gray-800 mx-auto mb-4" /><p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">GRID IS OPTIMAL</p></div>
          ) : (
            pendingEvents.slice(0, 10).map((event, index) => (
              <div key={event._id} className="pending-event-item-admin" onClick={() => onNavigate && onNavigate("groupbyevent")}>
                <div className="event-item-header">
                  <div className="event-info-main">
                    <h4 className="event-name-tag-admin">{event.eventName}</h4>
                    <p className="organizer-label-admin"><User className="w-2 h-2" /> {event.organizerName}</p>
                  </div>
                  {new Date() - new Date(event.createdAt) < 3600000 && <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[6px] font-black">NEW</Badge>}
                </div>
                <div className="event-item-footer">
                  <div className="meta-info-row-admin">
                    <div className="meta-tag-admin"><Calendar /> {new Date(event.startDate).toLocaleDateString()}</div>
                    <Badge variant="outline" className="border-white/5 text-gray-500 text-[6px] font-black">{event.eventType}</Badge>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-800 group-hover:text-white" />
                </div>
              </div>
            ))
          )}
        </div>

        {pendingCount > 0 && (
          <div className="popover-footer-admin">
            <Button onClick={() => onNavigate && onNavigate("groupbyevent")} className="btn-access-all">
              ACCESS ALL SIGNALS <ArrowRight className="w-4 h-4 ml-3" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PendingEventsBadge;
