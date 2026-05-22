import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEventById, updateEvent } from "../../features/events/eventsSlice";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  ChevronRight, 
  Building2, 
  Zap, 
  MapPin, 
  Video, 
  Activity, 
  Users, 
  Calendar, 
  Upload, 
  Loader2, 
  CheckCircle, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";
import '../../styles/components/ProductionForm.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const UpdateEvent = () => {
  const { id } = useParams();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.076);
  const [zoom] = useState(10);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [eventCategory, setEventCategory] = useState("");
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { list: eventsList } = useAppSelector((s) => s.events);

  const { register, handleSubmit, setValue, reset } = useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get("/state/getallstates").then((r) => setStates(r.data.data));
    api.get("/city/getallcitys").then((r) => setCities(r.data.data));
  }, []);

  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [dispatch, id]);

  useEffect(() => {
    const event = eventsList.find((e) => e._id === id);
    if (!event) return;
    setEventCategory(event.eventCategory);

    reset({
      eventName: event.eventName,
      eventType: event.eventType,
      startDate: event.startDate?.slice(0, 10),
      endDate: event.endDate?.slice(0, 10),
      numberOfSeats: event.numberOfSeats,
      stateId: event.stateId,
      cityId: event.cityId,
      zoomUrl: event.zoomUrl,
      stadiumId: event.stadiumId,
      latitude: event.latitude,
      longitude: event.longitude,
    });

    setLat(event.latitude);
    setLng(event.longitude);

    (async () => {
      if (event.eventCategory === "Indoor" && event.stadiumId) {
        try {
          const stadiumRes = await api.get(`/stadium/${event.stadiumId}`);
          setSelectedStadium(stadiumRes.data.data);
        } catch (err) {
          console.error('Failed to fetch stadium for event', err);
        }
      }
    })();
  }, [eventsList, id, reset]);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    const storedStadium = localStorage.getItem("selectedStadium");

    if (storedCategory) {
      setEventCategory(storedCategory);
      localStorage.removeItem("selectedCategory");
    }

    if (storedStadium) {
      const parsed = JSON.parse(storedStadium);
      setSelectedStadium(parsed);
      setValue("stadiumId", parsed._id);
      setValue("latitude", parsed.location.latitude);
      setValue("longitude", parsed.location.longitude);
      setValue("numberOfSeats", parsed.totalSeats);
      localStorage.removeItem("selectedStadium");
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || eventCategory === "ZoomMeeting" || (eventCategory === "Indoor" && selectedStadium)) return;

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

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [eventCategory, selectedStadium]);

  const submitHandler = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    for (const [k, v] of Object.entries(data)) {
      formData.append(k, k === "image" ? v[0] : v);
    }
    try {
      await dispatch(updateEvent({ id, formData })).unwrap();
      setShowSuccess(true);
      toast({ title: 'Event updated', description: 'Event updated successfully', status: 'success' });
      setTimeout(() => {
        const role = localStorage.getItem("role");
        if (role === "Admin") navigate('/admin/adminevents');
        else navigate('/organizer/viewevent');
      }, 1500);
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: err || 'Failed to update event', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="production-form-wrapper">
      <div className="production-form-container">
        <form onSubmit={handleSubmit(submitHandler)} className="form-grid-layout">
          {/* Left Column: Config */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="form-config-panel">
            <div className="form-config-card">
              <div className="panel-header">
                <div className="header-icon-box"><Globe className="w-5 h-5 text-[#E11D48]" /></div>
                <div className="header-title-box">
                  <h3>Production Scope</h3>
                  <p className="header-sub-label">Event environment parameters</p>
                </div>
              </div>

              <div className="form-input-group">
                <Label className="form-label-elite">Protocol Type</Label>
                <input className="form-input-elite opacity-50 cursor-not-allowed" value={eventCategory} disabled />
              </div>

              <AnimatePresence mode="wait">
                {eventCategory === "Indoor" && (
                  <motion.div key="indoor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="category-specific-panel">
                    <div className="form-input-group">
                      <Label className="form-label-elite text-[#E11D48]">Arena Relocation</Label>
                      <button
                        type="button"
                        className="stadium-select-btn group"
                        onClick={() => {
                          localStorage.setItem("selectedStadium", JSON.stringify(selectedStadium));
                          localStorage.setItem("selectedCategory", eventCategory);
                          navigate(`/stadiumselect?redirectTo=/updateevent/${id}`);
                        }}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="stadium-btn-text">{selectedStadium ? selectedStadium.name : "Select Arena"}</span>
                        </div>
                        <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                    <input type="hidden" {...register("stadiumId", { required: true })} />
                  </motion.div>
                )}

                {eventCategory === "Outdoor" && (
                  <motion.div key="outdoor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="category-specific-panel">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-input-group">
                        <Label className="form-label-elite">State Node</Label>
                        <select className="form-select-elite h-11 text-[10px]" {...register("stateId")}> 
                          {states.map((state) => (
                            <option key={state._id} value={state._id} className="bg-black">{state.Name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-input-group">
                        <Label className="form-label-elite">City Node</Label>
                        <select className="form-select-elite h-11 text-[10px]" {...register("cityId")}> 
                          {cities.map((city) => (
                            <option key={city._id} value={city._id} className="bg-black">{city.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-input-group">
                      <Label className="form-label-elite text-[#E11D48] flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Sector Map</Label>
                      <div ref={mapContainer} className="map-interface-container" />
                    </div>
                  </motion.div>
                )}

                {eventCategory === "ZoomMeeting" && (
                  <motion.div key="zoom" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="category-specific-panel">
                    <Label className="form-label-elite">Transmission URL</Label>
                    <div className="relative">
                      <Video className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E11D48] w-5 h-5" />
                      <input type="url" className="form-input-elite pl-16" {...register("zoomUrl")}/>
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
                  <h3>Modify Manifest</h3>
                  <p className="manifest-sub-label">Update production metadata</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="sm:col-span-2 form-input-group">
                  <Label className="form-label-elite">Production Title</Label>
                  <div className="relative group">
                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-[#E11D48] transition-colors" />
                    <input type="text" className="form-input-elite pl-16 font-black" {...register("eventName")}/>
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Operational Type</Label>
                  <div className="relative">
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <select className="form-select-elite text-xs" {...register("eventType")}>
                      <option value="" className="bg-black">SELECT TYPE</option>
                      <option value="Conference" className="bg-black">CONFERENCE</option>
                      <option value="Exhibition" className="bg-black">EXHIBITION</option>
                      <option value="Gala Dinner" className="bg-black">GALA DINNER</option>
                      <option value="Incentive" className="bg-black">INCENTIVE</option>
                      <option value="Music consert" className="bg-black">MUSIC CONCERT</option>
                      <option value="Meeting" className="bg-black">MEETING</option>
                      <option value="Other" className="bg-black">OTHER</option>
                    </select>
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Capacity Limit</Label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <input type="number" className="form-input-elite pl-16 disabled:opacity-30" {...register("numberOfSeats")} disabled={eventCategory === "Indoor"} />
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Commencement</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E11D48] w-4 h-4 pointer-events-none" />
                    <input type="date" className="form-input-elite pl-16 text-xs" {...register("startDate")} />
                  </div>
                </div>

                <div className="form-input-group">
                  <Label className="form-label-elite">Termination</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
                    <input type="date" className="form-input-elite pl-16 text-xs" {...register("endDate")} />
                  </div>
                </div>

                <div className="sm:col-span-2 form-input-group">
                  <Label className="form-label-elite">Update Asset (Cover Image)</Label>
                  <div className="asset-upload-area group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" {...register("image")} />
                    <div className="upload-overlay-content">
                      <Upload className="upload-icon" />
                      <p className="upload-label-text">Select New Media Asset</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-submit-row">
                <Button type="submit" disabled={isSubmitting || showSuccess} className={cn("deploy-btn-elite", showSuccess ? "success" : "primary")}>
                  {isSubmitting ? (
                    <div className="btn-content-box"><Loader2 className="w-5 h-5 animate-spin" /> UPDATING...</div>
                  ) : showSuccess ? (
                    <div className="btn-content-box"><CheckCircle className="w-5 h-5 animate-bounce" /> SYNCED</div>
                  ) : (
                    <div className="btn-content-box"><ShieldCheck className="w-5 h-5" /> UPDATE MANIFEST</div>
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

export default UpdateEvent;
