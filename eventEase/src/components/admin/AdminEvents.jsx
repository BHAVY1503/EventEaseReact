import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  Users, 
  Ticket, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  BarChart3,
  Activity,
  Globe,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const token = localStorage.getItem("token");

  const fetchAdminEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/event/adminevents");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching admin events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("ARE YOU PREPARED TO TERMINATE THIS PROTOCOL?")) return;
    setDeleteLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await api.delete(`/event/deleteevent/${eventId}`);
      fetchAdminEvents();
    } catch (err) {
      alert("TERMINATION SEQUENCE FAILED.");
    } finally {
      setDeleteLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Syncing Administrative Nodes</p>
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
          <Activity className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Root Level Event Control</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              ADMIN<br />
              <span className="text-[#E11D48]">OPERATIONS</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Direct oversight of central core event modules.
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Central Assets</p>
              <p className="text-3xl font-black text-white">{events.length}</p>
            </div>
            <div>
               <Zap className="w-8 h-8 text-[#E11D48] opacity-20" />
            </div>
          </div>
        </div>
      </motion.div>

      {events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-4"
        >
          <ShieldAlert className="w-12 h-12 text-gray-700 mx-auto" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Zero Active Modules Detected in Central Core.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {events.map((event, index) => {
              const eventEnded = new Date(event.endDate) < new Date();
              const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-[#E11D48]/40 transition-all duration-500 flex flex-col h-full">
                    {/* IMAGE SECTION */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={event.eventImgUrl} 
                        alt={event.eventName} 
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-80" />
                      
                      {eventEnded && (
                        <div className="absolute top-6 right-6">
                          <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-4 py-2 rounded-xl">
                            <CheckCircle2 className="w-3 h-3 mr-2" /> TERMINATED
                          </Badge>
                        </div>
                      )}

                      <div className="absolute bottom-6 left-8 right-8">
                        <Badge variant="outline" className="border-white/20 text-gray-400 font-black text-[8px] uppercase tracking-[0.2em] mb-2">
                          {event.eventType}
                        </Badge>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-[#E11D48] transition-colors">
                          {event.eventName}
                        </h3>
                      </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-8 space-y-6 flex-1">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <Calendar className="w-3 h-3 text-gray-500" />
                          </div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <MapPin className="w-3 h-3 text-gray-500" />
                          </div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">
                            {event.cityId?.name}, {event.stateId?.Name}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <Users className="w-3 h-3 text-gray-500" />
                          </div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {availableSeats} Nodes Available
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="pt-4 space-y-3">
                        {event.zoomUrl ? (
                          <Button variant="outline" className="w-full h-12 border-white/10 bg-white/5 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-[#E11D48] hover:border-[#E11D48] transition-all" asChild>
                            <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-2" /> Establish Uplink
                            </a>
                          </Button>
                        ) : (
                          event.latitude && event.longitude && (
                            <Button variant="outline" className="w-full h-12 border-white/10 bg-white/5 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-[#E11D48] hover:border-[#E11D48] transition-all" asChild>
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="w-3 h-3 mr-2" /> Coordinate Route
                              </a>
                            </Button>
                          )
                        )}

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 h-12 border-white/10 bg-transparent text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-white hover:text-black transition-all" asChild>
                            <a href={`/updateevent/${event._id}`}>
                              <Edit className="w-3 h-3 mr-2" /> Reconfigure
                            </a>
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1 h-12 bg-transparent border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            onClick={() => handleDelete(event._id)}
                            disabled={deleteLoading[event._id]}
                          >
                            {deleteLoading[event._id] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3 mr-2" /> Purge
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
