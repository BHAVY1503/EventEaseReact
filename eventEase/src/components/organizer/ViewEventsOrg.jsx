import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Loader2, 
  Search, 
  MapPin, 
  Calendar, 
  Ticket, 
  Activity, 
  Globe, 
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  IndianRupee,
  ChevronRight,
  X,
  Users
} from "lucide-react"; // Note: This should be lucide-react, fixed below
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/ViewEventsOrg.css";

export const ViewEventsOrg = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/event/organizer/self");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching organizer events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || event.eventType === filterType;
    return matchesSearch && matchesFilter;
  });

  const activeEvents = filteredEvents.filter(e => new Date(e.endDate) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.endDate) < new Date());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Syncing Production Nodes</p>
      </div>
    );
  }

  return (
    <div className="view-events-org-container">
      <div className="view-events-org-content">
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="catalog-header"
        >
          <div className="catalog-title-box">
            <div className="node-status-badge">
              <div className="line" />
              <p>Transmission Network Active</p>
            </div>
            <h1>Core Catalog</h1>
          </div>

          <div className="catalog-controls">
            <div className="search-input-wrapper">
              <Search className="search-icon-catalog" />
              <input
                type="text"
                placeholder="Locate Signal..."
                className="search-input-catalog"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-buttons-group">
              {["all", "Conference", "Music concert", "Other"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "filter-btn-catalog",
                    filterType === type && "active"
                  )}
                >
                  {type === "all" ? "Grid" : type}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ACTIVE NODES GRID */}
        <div className="catalog-grid">
          <AnimatePresence>
            {activeEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedEvent(event)}
                className="event-card-premium"
              >
                <div className="card-visual-segment">
                  <img 
                    src={event.eventImgUrl} 
                    alt={event.eventName} 
                    className="card-image-premium"
                  />
                  <div className="card-image-overlay" />
                  
                  <div className="floating-tags-catalog">
                    <div className="price-tag-catalog">
                      ₹{event.ticketRate?.toLocaleString()}
                    </div>
                  </div>

                  <div className="status-label-catalog">
                    <div className="status-badge-catalog ongoing">
                      <div className="pulse-dot-catalog" />
                      Ongoing Transmission
                    </div>
                  </div>
                </div>

                <div className="card-info-segment">
                  <div className="card-title-header">
                    <div className="title-meta-catalog">
                      <p>{event.eventType}</p>
                      <h3 className="card-title-text">{event.eventName}</h3>
                    </div>
                    <div className="card-icon-catalog">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="card-footer-catalog">
                    <div className="meta-details-catalog">
                      <div className="detail-item-catalog">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item-catalog">
                        <MapPin className="w-3 h-3" />
                        <span>{event.cityId?.name || "Global"}</span>
                      </div>
                    </div>
                    <div className="card-action-segment">
                      <div className="units-available-catalog">
                        <Users className="w-3 h-3" />
                        <span>{event.numberOfSeats} Nodes</span>
                      </div>
                      <button className="details-btn-catalog">Access</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ARCHIVE NODES */}
        {pastEvents.length > 0 && (
          <div className="archive-nodes-section">
            <div className="archive-header-row">
              <div className="archive-divider" />
              <h2>Signal Archive</h2>
              <div className="archive-divider" />
              <p className="archive-subtitle">Historical Data Clusters</p>
            </div>

            <div className="archive-scroller-wrapper">
              <div className="archive-scroller-track">
                {pastEvents.map((event) => (
                  <div key={event._id} className="archive-card-wrapper">
                    <div className="event-card-premium dimmed">
                      <div className="card-visual-segment">
                        <img src={event.eventImgUrl} alt="" className="card-image-premium" />
                        <div className="card-image-overlay" />
                        <div className="status-label-catalog">
                          <div className="status-badge-catalog default">Terminated</div>
                        </div>
                      </div>
                      <div className="card-info-segment">
                         <h3 className="card-title-text">{event.eventName}</h3>
                         <div className="card-footer-catalog">
                            <div className="detail-item-catalog">
                               <Calendar className="w-3 h-3" />
                               <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-right">
                               <p className="text-[8px] font-black uppercase text-gray-700">Archived</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="archive-fade-left" />
              <div className="archive-fade-right" />
            </div>
          </div>
        )}
      </div>

      {/* MODAL / DRAWER */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="panel-drawer-overlay">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="drawer-backdrop"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="panel-drawer-aside"
            >
              <div className="drawer-visual-segment">
                <img src={selectedEvent.eventImgUrl} alt="" />
                <div className="drawer-visual-overlay" />
                
                <button 
                  className="drawer-close-btn"
                  onClick={() => setSelectedEvent(null)}
                >
                  <X />
                </button>

                <div className="drawer-title-content">
                  <div className="drawer-category-badge">
                    <Sparkles className="w-3 h-3" />
                    {selectedEvent.eventType}
                  </div>
                  <h2 className="drawer-title-text">{selectedEvent.eventName}</h2>
                  <div className="drawer-location-meta">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#E11D48]" />
                      {selectedEvent.cityId?.name}, {selectedEvent.stateId?.Name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="drawer-scroll-content">
                 <div className="drawer-stats-grid">
                    <div className="drawer-stat-card">
                       <p className="stat-label-drawer">Production Date</p>
                       <p className="stat-value-drawer">{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="drawer-stat-card">
                       <p className="stat-label-drawer">Node Allocation</p>
                       <p className="stat-value-drawer">{selectedEvent.numberOfSeats}</p>
                    </div>
                 </div>

                 <div className="drawer-action-zone">
                    <div className="quantity-selector-drawer">
                       <p className="qty-label-drawer">Protocol Status</p>
                       <div className="qty-controls-drawer">
                          <span className="qty-value-drawer">ACTIVE</span>
                       </div>
                    </div>
                    <Button 
                      className="primary-protocol-btn"
                      asChild
                    >
                      <a href={`/updateevent/${selectedEvent._id}`}>
                        Reconfigure Signal
                      </a>
                    </Button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewEventsOrg;
