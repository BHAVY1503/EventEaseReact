import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Users, 
  ExternalLink, 
  Edit, 
  Eye, 
  X, 
  Search, 
  ChevronDown, 
  Activity, 
  Globe, 
  Building2, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ViewStadiums = () => {
  const [stadiums, setStadiums] = useState([]);
  const [filteredStadiums, setFilteredStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [expandedZones, setExpandedZones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneView, setZoneView] = useState("grid");
  const token = localStorage.getItem("token");

  // Filter states
  const [filterName, setFilterName] = useState("");

  // Fetch stadiums from API
  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/admin/stadiums");
        setStadiums(res.data || []);
      } catch (err) {
        console.error("Error fetching stadiums:", err);
        setError("Synchronization breach. Infrastructure nodes unreachable.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStadiums();
  }, [token]);

  // Apply filters
  useEffect(() => {
    let result = stadiums;
    if (filterName) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    setFilteredStadiums(result);
  }, [filterName, stadiums]);

  const toggleZone = (zoneIndex) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneIndex]: !prev[zoneIndex],
    }));
  };

  const handleExpandAll = (expand) => {
    const newState = {};
    selectedStadium?.zones?.forEach((_, i) => {
      newState[i] = expand;
    });
    setExpandedZones(newState);
  };

  const getZoneName = (index) => String.fromCharCode(65 + index);

  const handleClearFilters = () => {
    setFilterName("");
  };

  const renderSeatsGrid = (seats) => (
    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-4 bg-black/40 rounded-2xl border border-white/5 custom-scrollbar">
      {seats.map((seat, idx) => (
        <div
          key={idx}
          className="bg-white/5 hover:bg-[#E11D48]/20 transition-colors p-2 text-center rounded-lg text-[9px] font-black border border-white/5 text-gray-400 hover:text-white"
        >
          {seat}
        </div>
      ))}
    </div>
  );

  const renderSeatsList = (seats) => (
    <div className="max-h-60 overflow-y-auto p-4 bg-black/40 rounded-2xl border border-white/5 custom-scrollbar">
      <div className="flex flex-wrap gap-2">
        {seats.map((seat, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black rounded-full border border-white/5"
          >
            {seat}
          </span>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Scanning Grid Infrastructure</p>
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
          <Globe className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Global Asset Registry Active</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              STADIUM<br />
              <span className="text-[#E11D48]">OVERVIEW</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Oversight and management of global infrastructure nodes.
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Active Nodes</p>
              <p className="text-3xl font-black text-white">{stadiums.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Grid Matches</p>
              <p className="text-3xl font-black text-[#E11D48]">{filteredStadiums.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SEARCH CONSOLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-white/5 bg-[#0A0A0A] rounded-[2rem] p-8 shadow-2xl backdrop-blur-3xl"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
             <Input
                placeholder="SEARCH NODES BY DESIGNATION..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="h-16 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 placeholder:text-gray-500 transition-all"
             />
          </div>
          <Button 
            onClick={handleClearFilters}
            variant="outline"
            className="h-16 px-8 border-white/10 bg-transparent text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-white/5 hover:text-white transition-all"
          >
             Reset Grid
          </Button>
        </div>
      </motion.div>

      {/* STADIUM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredStadiums.map((stadium, index) => (
            <motion.div
              key={stadium._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedStadium(stadium)}
              className="group cursor-pointer"
            >
              <div className="relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-[#E11D48]/40 transition-all duration-500 flex flex-col h-full">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={stadium.imageUrl || "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop"} 
                    alt={stadium.name}
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-80" />
                  
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                       <Users className="w-3 h-3 text-[#E11D48]" />
                       <span className="text-[10px] font-black text-white">{stadium.totalSeats} NODES</span>
                    </Badge>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-1">Infrastructure Segment</p>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-tight group-hover:translate-x-1 transition-transform">{stadium.name}</h3>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                        <MapPin className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{stadium.location?.city}</p>
                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">{stadium.location?.state}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-[0.3em] text-[9px] rounded-xl group-hover:bg-[#E11D48] group-hover:border-[#E11D48] group-hover:text-white transition-all duration-500 shadow-xl">
                    Sync Intelligence
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedStadium && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStadium(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(225,29,72,0.2)] max-h-full flex flex-col"
            >
              <div className="relative h-64 md:h-80 flex-shrink-0">
                <img 
                  src={selectedStadium.imageUrl} 
                  alt={selectedStadium.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                <Button 
                  onClick={() => setSelectedStadium(null)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-red-500 transition-all group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                </Button>

                <div className="absolute bottom-8 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48]">Grid Designation</p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.8]">{selectedStadium.name}</h2>
                  </div>
                  <div className="flex gap-4">
                    {selectedStadium.location?.latitude && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedStadium.location.latitude},${selectedStadium.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-14 px-6 bg-[#E11D48] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center gap-3 hover:bg-white hover:text-black transition-all shadow-2xl"
                      >
                        <Globe className="w-4 h-4" /> Uplink Map
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "Sector Clusters", value: selectedStadium.zones?.length || 0, icon: Activity, color: "text-[#E11D48]" },
                    { label: "Total Capacity", value: selectedStadium.totalSeats || 0, icon: Users, color: "text-emerald-500" },
                    { label: "Base Valuation", value: `₹${selectedStadium.zones?.length > 0 ? Math.min(...selectedStadium.zones.map((z) => z.price || 0)) : 0}`, icon: CheckCircle2, color: "text-amber-500" },
                  ].map((stat, i) => (
                    <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">{stat.label}</p>
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                      </div>
                      <p className="text-4xl font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* ZONES */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white">Sector Intelligence</h3>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Detailed Node Configuration</p>
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={() => setZoneView("grid")} className={cn("w-10 h-10 p-0 rounded-lg", zoneView === "grid" ? "bg-[#E11D48]" : "bg-white/5 border border-white/10 text-gray-600")}>
                          <Building2 className="w-4 h-4" />
                       </Button>
                       <Button onClick={() => setZoneView("list")} className={cn("w-10 h-10 p-0 rounded-lg", zoneView === "list" ? "bg-[#E11D48]" : "bg-white/5 border border-white/10 text-gray-600")}>
                          <Filter className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedStadium.zones?.map((zone, i) => (
                      <div key={i} className="border border-white/5 bg-white/5 rounded-[2rem] overflow-hidden">
                        <button 
                          onClick={() => toggleZone(i)}
                          className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#991B1B] flex items-center justify-center text-white font-black text-lg shadow-xl">
                              {getZoneName(i)}
                            </div>
                            <div className="text-left">
                              <h4 className="text-lg font-black text-white uppercase tracking-tight">Sector {getZoneName(i)}</h4>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{zone.seatLabels?.length || 0} SEATING NODES</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <p className="text-xl font-black text-[#E11D48]">₹{zone.price || 0}</p>
                             <div className={cn("w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform", expandedZones[i] && "rotate-180")}>
                               <ChevronDown className="w-4 h-4 text-white" />
                             </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedZones[i] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-8 pb-8 pt-4 border-t border-white/5"
                            >
                               {zoneView === "grid" ? renderSeatsGrid(zone.seatLabels) : renderSeatsList(zone.seatLabels)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION */}
                <div className="pt-8">
                  <Link to={`/editstadium/${selectedStadium._id}`}>
                    <Button className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.5em] text-[11px] rounded-[2rem] hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl group">
                      MODIFY CORE INFRASTRUCTURE <Edit className="w-4 h-4 ml-4 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewStadiums;
