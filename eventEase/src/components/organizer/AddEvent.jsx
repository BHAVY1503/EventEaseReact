import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Upload,
  Video,
  Building2,
  Loader2,
  CheckCircle,
  Zap,
  Globe,
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
import '../../styles/components/ProductionForm.css';

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
    <div className="production-form-wrapper">
      <style>{mapboxCustomStyles}</style>
      <div className="production-form-container">
        <form onSubmit={handleSubmit(submitHandler)} className="form-grid-layout">
          {/* Left Column: Operational Config */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="form-config-panel">
            <div className="form-config-card">
              <div className="panel-header">
                <div className="header-icon-box"><Globe className="w-5 h-5 text-[#E11D48]" /></div>
                <div className="header-title-box">
                  <h3>Operational Node</h3>
                  <p className="header-sub-label">Configure sector parameters</p>
                </div>
              </div>

              <div className="form-input-group">
                <Label className="form-label-elite">Environment Protocol</Label>
                <div className="relative">
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                  <select
                    className="form-select-elite"
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

              <AnimatePresence mode="wait">
                {eventCategory === "Indoor" && (
                  <motion.div key="indoor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="category-specific-panel">
                    <div className="form-input-group">
                      <Label className="form-label-elite text-[#E11D48]">Arena Synchronization</Label>
                      <button type="button" onClick={handleStadiumSelect} className="stadium-select-btn group">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="stadium-btn-text">{selectedStadium ? selectedStadium.name : "Select Target Arena"}</span>
                        </div>
                        <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {selectedStadium?.zones && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="form-label-elite">Value Distribution (₹)</Label>
                        <div className="space-y-2">
                          {selectedStadium.zones.map((zone, i) => (
                            <div key={i} className="flex items-center justify-between bg-black/40 px-6 h-12 rounded-xl border border-white/5 group hover:border-[#E11D48]/30 transition-all">
                              <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-[#E11D48]">{String.fromCharCode(65 + i)}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tier Access</span>
                              </div>
                              <input
                                type="number"
                                value={customZonePrices[i]}
                                onChange={(e) => {
                                  const newPrices = [...customZonePrices];
                                  newPrices[i] = parseInt(e.target.value) || 0;
                                  setCustomZonePrices(newPrices);
                                }}
                                className="bg-transparent border-none outline-none text-right text-sm font-black w-20 text-[#E11D48]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {eventCategory === "Outdoor" && (
                  <motion.div key="outdoor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="category-specific-panel">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-input-group">
                        <Label className="form-label-elite">State Node</Label>
                        <select className="form-select-elite h-11 text-[10px]" {...register("stateId", { required: true })}>
                          <option value="">SELECT STATE</option>
                          {states.map(s => <option key={s._id} value={s._id} className="bg-black">{s.Name}</option>)}
                        </select>
                      </div>
                      <div className="form-input-group">
                        <Label className="form-label-elite">City Node</Label>
                        <select className="form-select-elite h-11 text-[10px]" {...register("cityId", { required: true })}>
                          <option value="">SELECT CITY</option>
                          {cities.map(c => <option key={c._id} value={c._id} className="bg-black">{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-input-group">
                      <Label className="form-label-elite">Base Rate (₹)</Label>
                      <input type="number" className="form-input-elite" {...register("ticketRate")} />
                    </div>
                    <div className="form-input-group">
                      <Label className="form-label-elite text-[#E11D48] flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Mapping Interface</Label>
                      <div ref={mapContainer} className="map-interface-container" />
                    </div>
                  </motion.div>
                )}

                {eventCategory === "ZoomMeeting" && (
                  <motion.div key="zoom" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="category-specific-panel">
                    <Label className="form-label-elite">Transmission Link</Label>
                    <div className="relative">
                      <Video className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E11D48] w-5 h-5" />
                      <input type="url" className="form-input-elite pl-16" placeholder="https://zoom.us/j/..." {...register("zoomUrl", { required: true })} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Manifest */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="form-manifest-panel">
            <div className="form-manifest-card">
              <div className="manifest-header">
                <div className="manifest-icon-box"><Activity className="w-8 h-8 text-white" /></div>
                <div className="manifest-title-box">
                  <h3>Manifest Parameters</h3>
                  <p className="manifest-sub-label">Finalize production metadata</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="sm:col-span-2 form-input-group">
                  <Label className="form-label-elite">Production Title</Label>
                  <div className="relative group">
                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-[#E11D48] transition-colors" />
                    <input type="text" className="form-input-elite pl-16 font-black" placeholder="ENTER PRODUCTION IDENTIFIER" {...register("eventName", { required: true })} />
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Operational Type</Label>
                  <div className="relative">
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <select className="form-select-elite text-xs" {...register("eventType", { required: true })}>
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

                <div className="form-input-group">
                  <Label className="form-label-elite">Capacity Node</Label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <input type="number" className="form-input-elite pl-16 disabled:opacity-20" {...register("numberOfSeats", { required: true })} disabled={eventCategory === "Indoor" && selectedStadium} />
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Commencement</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E11D48] w-4 h-4 pointer-events-none" />
                    <input type="date" className="form-input-elite pl-16 text-xs" {...register("startDate", { required: true })} />
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Termination</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <input type="date" className="form-input-elite pl-16 text-xs" {...register("endDate", { required: true })} />
                  </div>
                </div>

                <div className="sm:col-span-2 form-input-group">
                  <Label className="form-label-elite">Asset Integration (Cover Image)</Label>
                  <div className="asset-upload-area group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" {...register("image", { required: true })} />
                    <div className="upload-overlay-content">
                      <Upload className="upload-icon" />
                      <p className="upload-label-text">Upload High-Res Media</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-submit-row">
                <Button type="submit" disabled={isSubmitting || showSuccess} className={cn("deploy-btn-elite", showSuccess ? "success" : "primary")}>
                  {isSubmitting ? (
                    <div className="btn-content-box"><Loader2 className="w-5 h-5 animate-spin" /> DEPLOYING...</div>
                  ) : showSuccess ? (
                    <div className="btn-content-box"><CheckCircle className="w-5 h-5 animate-bounce" /> NODE LIVE</div>
                  ) : (
                    <div className="btn-content-box"><ShieldCheck className="w-5 h-5" /> INITIALIZE</div>
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

export default AddEvent;
