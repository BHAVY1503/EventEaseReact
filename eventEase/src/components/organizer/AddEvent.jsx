import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Upload,
  Video,
  Building2,
  DollarSign,
  Loader2,
  CheckCircle,
  Sparkles,
  Zap,
  Globe,
  Rocket,
  ShieldCheck,
  Activity,
  ChevronRight
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectStadium, clearSelectedStadium } from "../../features/stadiums/stadiumsSlice";
import { createEvent, fetchMyEvents } from "../../features/events/eventsSlice";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const mapboxCustomStyles = `
  .mapboxgl-ctrl-geocoder {
    background-color: rgba(0, 0, 0, 0.8) !important;
    backdrop-filter: blur(10px);
    border: 1px border rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    width: 100% !important;
    max-width: 300px !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
  }
  .mapboxgl-ctrl-geocoder--input {
    color: white !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 700 !important;
    font-size: 10px !important;
    letter-spacing: 0.1em !important;
    padding: 12px 12px 12px 40px !important;
  }
  .mapboxgl-ctrl-geocoder--icon-search {
    fill: #E11D48 !important;
    left: 12px !important;
  }
  .mapboxgl-ctrl-geocoder--suggestions {
    background-color: rgba(10, 10, 10, 0.95) !important;
    border-radius: 12px !important;
    margin-top: 8px !important;
    overflow: hidden !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
  }
  .mapboxgl-ctrl-geocoder--suggestion {
    color: #999 !important;
    padding: 10px 15px !important;
    font-size: 10px !important;
    font-weight: 600 !important;
  }
  .mapboxgl-ctrl-geocoder--suggestion-title {
    color: white !important;
  }
  .mapboxgl-ctrl-geocoder--suggestion:hover {
    background-color: #E11D48 !important;
  }
  .mapboxgl-ctrl-geocoder--suggestion:hover .mapboxgl-ctrl-geocoder--suggestion-title,
  .mapboxgl-ctrl-geocoder--suggestion:hover .mapboxgl-ctrl-geocoder--suggestion-address {
    color: white !important;
  }
`;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const AddEvent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.076);
  const [zoom] = useState(10);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [eventCategory, setEventCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const selectedStadium = useAppSelector((s) => s.stadiums.selectedStadium);
  const dispatch = useAppDispatch();
  const [customZonePrices, setCustomZonePrices] = useState([]);
  const { toast } = useToast();

  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    api.get("/state/getallstates").then((r) => setStates(r.data.data));
    api.get("/city/getallcitys").then((r) => setCities(r.data.data));
  }, []);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    const storedStadium = localStorage.getItem("selectedStadium");

    if (storedCategory) {
      setEventCategory(storedCategory);
      localStorage.removeItem("selectedCategory");
    }

    if (storedStadium) {
      const parsed = JSON.parse(storedStadium);
      if (parsed && parsed._id) {
        dispatch(selectStadium(parsed));
        setValue("stadiumId", parsed._id);
        setValue("latitude", parsed.location.latitude);
        setValue("longitude", parsed.location.longitude);
        setValue("numberOfSeats", parsed.totalSeats);
        if (parsed.zones) {
          const defaultPrices = parsed.zones.map((z) => z.price);
          setCustomZonePrices(defaultPrices);
        }
      }
      localStorage.removeItem("selectedStadium");
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || eventCategory !== "Outdoor") return;

    const timer = setTimeout(() => {
      if (!mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [lng, lat],
        zoom,
      });

      const marker = new mapboxgl.Marker({ color: "#E11D48", draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.on("dragend", () => {
        const pos = marker.getLngLat();
        setLng(pos.lng);
        setLat(pos.lat);
        setValue("latitude", pos.lat);
        setValue("longitude", pos.lng);
      });

      const geo = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
        placeholder: "SEARCH LOCATION",
        marker: false
      });
      map.current.addControl(geo, 'top-left');
      geo.on("result", (e) => {
        const [lng2, lat2] = e.result.center;
        setLng(lng2);
        setLat(lat2);
        setValue("latitude", lat2);
        setValue("longitude", lng2);
        marker.setLngLat([lng2, lat2]);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [eventCategory, selectedStadium]);

  const handleStadiumSelect = (e) => {
    e.preventDefault();
    navigate("/stadiumselect?redirectTo=/organizer/addevent");
  };

  const submitHandler = async (data) => {
    if (!token) {
      toast({ title: 'Authentication Required', description: 'Please login first.', status: 'error' });
      navigate("/organizersignin");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    for (const [k, v] of Object.entries(data)) {
      formData.append(k, k === "image" ? v[0] : v);
    }
    if (eventCategory === "Indoor" && selectedStadium) {
      formData.append("zonePrices", JSON.stringify(customZonePrices));
    }
    try {
      await dispatch(createEvent(formData)).unwrap();
      setShowSuccess(true);
      toast({ title: '✓ Event Created Successfully!', description: 'Your production is now live.', status: 'success' });
      setTimeout(() => {
        const role = localStorage.getItem("role");
        if (role === "Admin") navigate('/admin/adminevents');
        else {
          dispatch(fetchMyEvents());
          navigate('/organizer/viewevent');
        }
      }, 2000);
    } catch (err) {
      toast({ title: '✗ Failed to Create Event', description: err?.message || 'Failed to add event.', status: 'error' });
      setShowSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-transparent text-white selection:bg-[#E11D48]/30 py-6 md:py-10 px-0 relative overflow-hidden">
      <style>{mapboxCustomStyles}</style>
      <div className="max-w-[1400px] mx-auto relative z-10">

        <form onSubmit={handleSubmit(submitHandler)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          {/* Left Column: Operational Config */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 xl:col-span-4 space-y-6 md:space-y-8"
          >
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E11D48]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-[#E11D48]" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter">Operational Node</h3>
                    <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-500">Configure sector parameters</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Environment Protocol</Label>
                  <div className="relative">
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <select
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-6 text-sm font-bold focus:ring-2 focus:ring-[#E11D48] focus:border-transparent outline-none transition-all appearance-none"
                      {...register("eventCategory", { required: "Event category is required" })}
                      value={eventCategory}
                      onChange={(e) => {
                        setEventCategory(e.target.value);
                        dispatch(clearSelectedStadium());
                      }}
                    >
                      <option value="" className="bg-black">SELECT CATEGORY</option>
                      <option value="Indoor" className="bg-black">🏟️ STADIUM ARENA (INDOOR)</option>
                      <option value="Outdoor" className="bg-black">🌳 OPEN AIR (OUTDOOR)</option>
                      <option value="ZoomMeeting" className="bg-black">💻 DIGITAL STREAM (ZOOM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {eventCategory === "Indoor" && (
                  <motion.div
                    key="indoor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-6 md:p-8 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 space-y-6"
                  >
                    <div className="space-y-3">
                      <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#E11D48]">Arena Synchronization</Label>
                      <button
                        type="button"
                        onClick={handleStadiumSelect}
                        className="w-full h-14 bg-white text-black rounded-xl flex items-center justify-between px-6 hover:bg-[#E11D48] hover:text-white transition-all duration-500 group"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest truncate">
                            {selectedStadium ? selectedStadium.name : "Select Target Arena"}
                          </span>
                        </div>
                        <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {selectedStadium?.zones && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Value Distribution (₹)</Label>
                        <div className="space-y-2">
                          {selectedStadium.zones.map((zone, i) => (
                            <div key={i} className="flex items-center justify-between bg-black/40 px-6 h-12 rounded-xl border border-white/5 group hover:border-[#E11D48]/30 transition-all">
                              <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-[#E11D48]">{String.fromCharCode(65 + i)}</span>
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400">Tier Access</span>
                              </div>
                              <input
                                type="number"
                                value={customZonePrices[i]}
                                onChange={(e) => {
                                  const newPrices = [...customZonePrices];
                                  newPrices[i] = parseInt(e.target.value) || 0;
                                  setCustomZonePrices(newPrices);
                                }}
                                className="bg-transparent border-none outline-none text-right text-sm md:text-base font-black w-20 text-[#E11D48]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {eventCategory === "Outdoor" && (
                  <motion.div
                    key="outdoor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 md:p-8 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 p-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[8px] md:text-[9px] font-black uppercase text-gray-500">State Node</Label>
                        <select className="w-full bg-black/40 border border-white/5 rounded-xl px-4 h-11 text-[10px] outline-none appearance-none" {...register("stateId", { required: true })}>
                          <option value="">SELECT STATE</option>
                          {states.map(s => <option key={s._id} value={s._id} className="bg-black">{s.Name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[8px] md:text-[9px] font-black uppercase text-gray-500">City Node</Label>
                        <select className="w-full bg-black/40 border border-white/5 rounded-xl px-4 h-11 text-[10px] outline-none appearance-none" {...register("cityId", { required: true })}>
                          <option value="">SELECT CITY</option>
                          {cities.map(c => <option key={c._id} value={c._id} className="bg-black">{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[8px] md:text-[9px] font-black uppercase text-gray-500">Base Rate (₹)</Label>
                      <input type="number" className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-6 text-lg font-black" {...register("ticketRate")} />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#E11D48] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Mapping Interface
                      </Label>
                      <div
                        ref={mapContainer}
                        className="h-64 md:h-80 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-black/40 shadow-inner transition-all duration-700 relative z-0"
                      />
                      <input type="hidden" {...register("latitude")} />
                      <input type="hidden" {...register("longitude")} />
                    </div>
                  </motion.div>
                )}

                {eventCategory === "ZoomMeeting" && (
                  <motion.div
                    key="zoom"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 md:p-8 bg-white/10 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 space-y-4"
                  >
                    <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Transmission Link</Label>
                    <div className="relative">
                      <Video className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E11D48] w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type="url"
                        className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-16 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#E11D48]"
                        placeholder="https://zoom.us/j/..."
                        {...register("zoomUrl", { required: true })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Manifest Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 space-y-10 md:space-y-12 shadow-2xl">
              <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#E11D48] rounded-xl md:rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.4)] shrink-0">
                  <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none">Manifest Parameters</h3>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mt-2">Finalize production metadata</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="sm:col-span-2 space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Production Title</Label>
                  <div className="relative group">
                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-[#E11D48] transition-colors" />
                    <input
                      type="text"
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-16 pr-8 text-sm md:text-base font-black placeholder:text-white/5 focus:ring-2 focus:ring-[#E11D48]/50 outline-none transition-all"
                      placeholder="ENTER PRODUCTION IDENTIFIER"
                      {...register("eventName", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Operational Type</Label>
                  <div className="relative">
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none rotate-90 sm:rotate-0" />
                    <select
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-6 sm:pl-8 pr-12 font-bold outline-none appearance-none focus:ring-2 focus:ring-[#E11D48]/50 transition-all text-xs"
                      {...register("eventType", { required: true })}
                    >
                      <option value="" className="bg-[#0A0A0A]">SELECT TYPE</option>
                      <option value="Music consert" className="bg-[#0A0A0A]">MUSIC CONCERT</option>
                      <option value="Conference" className="bg-[#0A0A0A]">CONFERENCE</option>
                      <option value="Exhibition" className="bg-[#0A0A0A]">EXHIBITION</option>
                      <option value="Gala Dinner" className="bg-[#0A0A0A]">GALA DINNER</option>
                      <option value="Incentive" className="bg-[#0A0A0A]">INCENTIVE</option>
                      <option value="Meeting" className="bg-[#0A0A0A]">MEETING</option>
                      <option value="Other" className="bg-[#0A0A0A]">OTHER</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Capacity Node</Label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <input
                      type="number"
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-16 font-black outline-none focus:ring-2 focus:ring-[#E11D48]/50 transition-all disabled:opacity-20 text-sm md:text-base"
                      {...register("numberOfSeats", { required: true })}
                      disabled={eventCategory === "Indoor" && selectedStadium}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Commencement</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E11D48] w-4 h-4 pointer-events-none" />
                    <input type="date" className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-16 font-bold outline-none focus:ring-2 focus:ring-[#E11D48]/50 transition-all text-xs" {...register("startDate", { required: true })} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Termination</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <input type="date" className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-16 font-bold outline-none focus:ring-2 focus:ring-[#E11D48]/50 transition-all text-xs" {...register("endDate", { required: true })} />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Asset Integration (Cover Image)</Label>
                  <div className="relative h-32 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center group hover:border-[#E11D48]/50 transition-all cursor-pointer overflow-hidden">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" {...register("image", { required: true })} />
                    <div className="text-center space-y-2 relative z-10 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-[#E11D48] mx-auto mb-1" />
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400">Upload High-Res Media</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-end pt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting || showSuccess}
                  className={cn(
                    "h-14 md:h-16 w-full sm:w-auto px-12 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 relative overflow-hidden group shadow-2xl",
                    showSuccess ? "bg-green-600 text-white" : "bg-white text-black hover:bg-[#E11D48] hover:text-white"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      DEPLOYING...
                    </div>
                  ) : showSuccess ? (
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                      NODE LIVE
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ShieldCheck className="w-5 h-5" />
                      INITIALIZE
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};
