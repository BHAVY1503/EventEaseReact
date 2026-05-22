import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Building2,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Layers,
  Sparkles,
  IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import "@/styles/components/UpdateStadium.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const UpdateStadium = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [zonePrices, setZonePrices] = useState([]);
  const [zoneCount, setZoneCount] = useState(0);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.076);
  const { register, handleSubmit, setValue, watch } = useForm();
  const token = localStorage.getItem("token");
  const totalSeats = watch("totalSeats");
  const seatsPerZone = watch("seatsPerZone");

  useEffect(() => {
    const fetchStadium = async () => {
      try {
        const res = await axios.get(`/stadium/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const s = res.data;
        setValue("name", s.name);
        setValue("totalSeats", s.totalSeats);
        setValue("seatsPerZone", s.zones?.[0]?.seatLabels?.length || 20);
        setValue("address", s.location.address);
        setValue("latitude", s.location.latitude);
        setValue("longitude", s.location.longitude);
        setLat(s.location.latitude);
        setLng(s.location.longitude);
        setZonePrices(s.zones.map(z => z.price));
      } catch (err) {
        setMessage("GRID LINK FAILURE: UNABLE TO ACCESS STADIUM ARCHIVE.");
        setMessageType("error");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchStadium();
  }, [id]);

  useEffect(() => {
    const total = parseInt(totalSeats || 0);
    const perZone = parseInt(seatsPerZone || 20);
    const count = Math.ceil(total / perZone);
    setZoneCount(count);
    setZonePrices(prev => Array.from({ length: count }, (_, i) => parseInt(prev[i]) || 100));
  }, [totalSeats, seatsPerZone]);

  useEffect(() => {
    if (fetchLoading || map.current) return;
    map.current = new mapboxgl.Map({ container: mapContainer.current, style: "mapbox://styles/mapbox/dark-v11", center: [lng, lat], zoom: 12 });
    markerRef.current = new mapboxgl.Marker({ draggable: true, color: "#E11D48" }).setLngLat([lng, lat]).addTo(map.current);
    markerRef.current.on("dragend", () => {
      const pos = markerRef.current.getLngLat();
      setLng(pos.lng); setLat(pos.lat);
      setValue("latitude", pos.lat); setValue("longitude", pos.lng);
    });
    const geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl, marker: false });
    map.current.addControl(geocoder);
    geocoder.on("result", (e) => {
      const [nLng, nLat] = e.result.center;
      setLng(nLng); setLat(nLat);
      setValue("latitude", nLat); setValue("longitude", nLng);
      markerRef.current.setLngLat([nLng, nLat]);
      map.current.flyTo({ center: [nLng, nLat], zoom: 15 });
    });
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [fetchLoading]);

  const onSubmit = async (data) => {
    setLoading(true); setMessage("");
    const fd = new FormData();
    fd.append("name", data.name); fd.append("totalSeats", data.totalSeats);
    fd.append("seatsPerZone", data.seatsPerZone); fd.append("zonePrices", JSON.stringify(zonePrices));
    fd.append("address", data.address); fd.append("latitude", data.latitude); fd.append("longitude", data.longitude);
    if (image) fd.append("image", image);
    try {
      await axios.put(`/stadium/${id}`, fd, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setMessage("PROTOCOL SUCCESS: INFRASTRUCTURE UPDATED."); setMessageType("success");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setMessage("ERROR: UPDATE SEQUENCE TERMINATED."); setMessageType("error");
    } finally { setLoading(false); }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Loader2 className="w-10 h-10 animate-spin text-[#E11D48]" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Decrypting Infrastructure Archive</p>
      </div>
    );
  }

  return (
    <div className="update-stadium-container">
      <div className="update-stadium-content">
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="update-header-premium">
          <div className="update-title-box">
            <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.3em] mb-4">Entity Modification Protocol Active</p>
            <h1>EDIT<br /><span>STADIUM</span></h1>
          </div>
          <div className="ref-box-admin"><p>Entity Reference</p><p>{id.slice(-8).toUpperCase()}</p></div>
        </motion.div>

        {/* NOTIFICATION */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={cn("p-6 rounded-2xl border mb-10 flex items-center gap-4", messageType === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500")}>
              {messageType === "success" ? <CheckCircle2 /> : <XCircle />}
              <p className="text-[10px] font-black uppercase tracking-widest">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="update-form-grid">
          {/* MAIN FORM */}
          <div className="form-column-main">
            <div className="form-card-premium">
              <div className="card-bg-icon-admin"><Layers className="w-40 h-40" /></div>
              <div className="relative z-10 space-y-8">
                <div className="field-group-admin"><Label className="label-premium-admin">Infrastructure Identity</Label><Input {...register("name")} required className="input-premium-admin" /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="field-group-admin"><Label className="label-premium-admin">Total Capacity</Label><Input type="number" {...register("totalSeats")} required className="input-premium-admin" /></div>
                  <div className="field-group-admin"><Label className="label-premium-admin">Zone Density</Label><Input type="number" {...register("seatsPerZone")} className="input-premium-admin" /></div>
                </div>
                <div className="field-group-admin"><Label className="label-premium-admin">Spatial Registry (Address)</Label><Input {...register("address")} required className="input-premium-admin" /></div>
                <div className="field-group-admin">
                  <Label className="label-premium-admin">Visual Identification</Label>
                  <div className="image-upload-wrapper">
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                    <div className="upload-placeholder-admin"><ImageIcon /><span>Update Visual Buffer (Optional)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {zoneCount > 0 && (
              <div className="form-card-premium">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3"><Sparkles className="text-[#E11D48]" /><h3 className="text-xl font-black uppercase">Sector Valuation</h3></div>
                  <Badge className="bg-[#E11D48]/10 text-[#E11D48] border-0">{zoneCount} SECTORS</Badge>
                </div>
                <div className="sector-grid-admin">
                  {Array.from({ length: zoneCount }, (_, i) => (
                    <div key={i} className="sector-card-admin">
                      <div className="flex justify-between"><p className="text-[8px] font-black text-gray-600">SECTOR {String.fromCharCode(65 + i)}</p><IndianRupee className="w-3 h-3 text-[#E11D48]" /></div>
                      <Input type="number" value={zonePrices[i] || ""} onChange={(e) => { const up = [...zonePrices]; up[i] = e.target.value; setZonePrices(up); }} className="h-12 bg-black border-white/10 rounded-xl text-center text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR (MAP & ACTIONS) */}
          <div className="form-column-side">
            <div className="form-card-premium">
              <div className="flex items-center gap-3 mb-8"><MapPin className="text-[#E11D48]" /><h3 className="text-xl font-black uppercase">Spatial Registry</h3></div>
              <div ref={mapContainer} className="map-container-premium mb-8" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-[7px] font-black text-gray-600 uppercase mb-1">LAT</p><p className="text-[10px] font-mono text-white">{lat.toFixed(6)}</p></div>
                <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-[7px] font-black text-gray-600 uppercase mb-1">LNG</p><p className="text-[10px] font-mono text-white">{lng.toFixed(6)}</p></div>
              </div>
            </div>

            <div className="form-actions-admin">
              <Button type="submit" disabled={loading} className="btn-admin-submit">
                {loading ? <Loader2 className="animate-spin" /> : <>UPDATE INFRASTRUCTURE <ArrowRight className="ml-4" /></>}
              </Button>
              <Link to="/admin"><Button variant="outline" className="btn-admin-cancel"><ArrowLeft className="mr-4" /> ABORT OPERATION</Button></Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStadium;
