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
  Activity,
  Globe,
  ShieldAlert,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/AdminEvents.css";

export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});

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
    <div className="admin-events-container">
      <div className="admin-events-content">
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-header"
        >
          <div className="admin-title-box">
            <p className="admin-subtitle">Root Level Event Control</p>
            <h1>ADMIN<br /><span>OPERATIONS</span></h1>
          </div>

          <div className="admin-stats-box">
            <div className="admin-stat-item">
              <p>Central Assets</p>
              <p>{events.length}</p>
            </div>
            <Zap className="admin-zap-icon" />
          </div>
        </motion.div>

        {events.length === 0 ? (
          <div className="p-20 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-gray-700 mx-auto" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Zero Active Modules Detected in Central Core.</p>
          </div>
        ) : (
          <div className="admin-events-grid">
            <AnimatePresence>
              {events.map((event, index) => {
                const eventEnded = new Date(event.endDate) < new Date();
                const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="admin-event-card-premium"
                  >
                    <div className="card-image-box">
                      <img src={event.eventImgUrl} alt={event.eventName} />
                      <div className="card-image-overlay" />
                      {eventEnded && (
                        <div className="status-badge-floating">
                          <CheckCircle2 className="w-3 h-3" /> TERMINATED
                        </div>
                      )}
                      <div className="card-header-floating">
                        <span className="type-label-premium">{event.eventType}</span>
                        <h3 className="card-title-premium">{event.eventName}</h3>
                      </div>
                    </div>

                    <div className="card-info-segment">
                      <div className="info-list-admin">
                        <div className="info-item-admin">
                          <div className="info-icon-box-admin"><Calendar className="w-3 h-3" /></div>
                          <p>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                        </div>
                        <div className="info-item-admin">
                          <div className="info-icon-box-admin"><MapPin className="w-3 h-3" /></div>
                          <p className="truncate">{event.cityId?.name}, {event.stateId?.Name}</p>
                        </div>
                        <div className="info-item-admin">
                          <div className="info-icon-box-admin"><Users className="w-3 h-3" /></div>
                          <p>{availableSeats} Nodes Available</p>
                        </div>
                      </div>

                      <div className="card-actions-admin">
                        {event.zoomUrl ? (
                          <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer" className="action-btn-premium secondary">
                            <ExternalLink className="w-3 h-3" /> Establish Uplink
                          </a>
                        ) : (
                          event.latitude && event.longitude && (
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer" className="action-btn-premium secondary">
                              <Globe className="w-3 h-3" /> Coordinate Route
                            </a>
                          )
                        )}

                        <div className="action-row-split">
                          <a href={`/updateevent/${event._id}`} className="action-btn-premium ghost">
                            <Edit className="w-3 h-3" /> Reconfigure
                          </a>
                          <button
                            className="action-btn-premium danger"
                            onClick={() => handleDelete(event._id)}
                            disabled={deleteLoading[event._id]}
                          >
                            {deleteLoading[event._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Trash2 className="w-3 h-3" /> Purge</>}
                          </button>
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
    </div>
  );
};
