import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Users, 
  ExternalLink, 
  Edit, 
  X, 
  Search, 
  ChevronDown, 
  Activity, 
  Globe, 
  Building2, 
  CheckCircle2, 
  Filter,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/ViewStadiums.css";

const ViewStadiums = () => {
  const [stadiums, setStadiums] = useState([]);
  const [filteredStadiums, setFilteredStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [expandedZones, setExpandedZones] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [zoneView, setZoneView] = useState("grid");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/stadiums");
        setStadiums(res.data || []);
      } catch (err) {
        console.error("Error fetching stadiums:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStadiums();
  }, [token]);

  useEffect(() => {
    setFilteredStadiums(
      stadiums.filter((s) => s.name.toLowerCase().includes(filterName.toLowerCase()))
    );
  }, [filterName, stadiums]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Loader2 className="w-10 h-10 animate-spin text-[#E11D48]" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Scanning Grid Infrastructure</p>
      </div>
    );
  }

  return (
    <div className="stadium-view-container">
      <div className="stadium-view-content">
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stadium-header-premium">
          <div className="stadium-title-box">
            <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.3em] mb-4">Global Asset Registry Active</p>
            <h1>STADIUM<br /><span>OVERVIEW</span></h1>
          </div>
          <div className="stadium-stats-box">
            <div className="stat-item-admin">
              <p>Active Nodes</p>
              <p>{stadiums.length}</p>
            </div>
            <div className="stat-item-admin accent">
              <p>Grid Matches</p>
              <p>{filteredStadiums.length}</p>
            </div>
          </div>
        </motion.div>

        {/* SEARCH CONSOLE */}
        <div className="border border-white/5 bg-[#080808] rounded-[2rem] p-8 mb-12 flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input placeholder="SEARCH NODES BY DESIGNATION..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-widest text-white outline-none" />
          </div>
          <Button onClick={() => setFilterName("")} className="h-16 px-10 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-black">Reset Grid</Button>
        </div>

        {/* STADIUM GRID */}
        <div className="stadium-grid-admin">
          <AnimatePresence>
            {filteredStadiums.map((stadium, index) => (
              <motion.div key={stadium._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setSelectedStadium(stadium)} className="stadium-card-premium">
                <div className="stadium-image-box">
                  <img src={stadium.imageUrl || "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop"} alt="" />
                  <div className="stadium-overlay-gradient" />
                  <div className="stadium-capacity-tag">
                    <Users className="w-3 h-3 text-[#E11D48]" />
                    <span>{stadium.totalSeats} NODES</span>
                  </div>
                  <div className="stadium-card-header">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#E11D48] mb-2">Infrastructure Segment</p>
                    <h3>{stadium.name}</h3>
                  </div>
                </div>
                <div className="stadium-card-info">
                  <div className="info-row-premium">
                    <div className="info-icon-admin"><MapPin /></div>
                    <div className="info-text-admin"><h4>{stadium.location?.city}</h4><p>{stadium.location?.state}</p></div>
                  </div>
                  <Button className="w-full h-14 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-widest rounded-xl hover:bg-[#E11D48] hover:text-white transition-all">Sync Intelligence</Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* DETAIL MODAL */}
        <AnimatePresence>
          {selectedStadium && (
            <div className="stadium-detail-overlay">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="stadium-detail-premium">
                <div className="detail-image-hero">
                  <img src={selectedStadium.imageUrl} alt="" />
                  <div className="detail-hero-overlay" />
                  <Button onClick={() => setSelectedStadium(null)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center hover:bg-red-500 transition-all"><X /></Button>
                  <div className="detail-hero-content">
                    <div className="detail-hero-title">
                      <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.5em] mb-4">Grid Designation</p>
                      <h2>{selectedStadium.name}</h2>
                    </div>
                  </div>
                </div>
                <div className="detail-body-premium">
                  <div className="detail-stats-grid">
                    {[
                      { label: "Sector Clusters", value: selectedStadium.zones?.length || 0, icon: Activity, color: "text-[#E11D48]" },
                      { label: "Total Capacity", value: selectedStadium.totalSeats || 0, icon: Users, color: "text-emerald-500" },
                      { label: "Base Valuation", value: `₹${selectedStadium.zones?.length > 0 ? Math.min(...selectedStadium.zones.map(z => z.price || 0)) : 0}`, icon: CheckCircle2, color: "text-amber-500" },
                    ].map((stat, i) => (
                      <div key={i} className="detail-stat-card">
                        <div className="flex justify-between items-center mb-4"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p><stat.icon className={stat.color} /></div>
                        <p className="text-4xl font-black text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {selectedStadium.zones?.map((zone, i) => (
                      <div key={i} className="zone-accordion-admin">
                        <button onClick={() => setExpandedZones(prev => ({ ...prev, [i]: !prev[i] }))} className="zone-btn-admin">
                          <div className="zone-identity">
                            <div className="zone-badge-admin">{String.fromCharCode(65 + i)}</div>
                            <div className="zone-text-admin"><h4>Sector {String.fromCharCode(65 + i)}</h4><p>{zone.seatLabels?.length || 0} NODES</p></div>
                          </div>
                          <div className="flex items-center gap-6">
                            <p className="zone-price-admin">₹{zone.price || 0}</p>
                            <ChevronDown className={cn("transition-transform", expandedZones[i] && "rotate-180")} />
                          </div>
                        </button>
                        {expandedZones[i] && (
                          <div className="seats-grid-premium">
                            {zone.seatLabels.map((s, idx) => <div key={idx} className="seat-node-admin">{s}</div>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-12">
                    <Link to={`/editstadium/${selectedStadium._id}`}>
                      <Button className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.5em] text-[11px] rounded-[2rem] hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl">MODIFY CORE INFRASTRUCTURE <Edit className="w-4 h-4 ml-4" /></Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewStadiums;
