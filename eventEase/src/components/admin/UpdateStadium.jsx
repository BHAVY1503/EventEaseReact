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
  Zap,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Globe,
  Activity,
  Layers,
  Sparkles,
  IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const UpdateStadium = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "error"
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
        const res = await axios.get(`/stadium/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stadium = res.data;
        setValue("name", stadium.name);
        setValue("totalSeats", stadium.totalSeats);
        setValue("seatsPerZone", stadium.zones?.[0]?.seatLabels?.length || 20);
        setValue("address", stadium.location.address);
        setValue("latitude", stadium.location.latitude);
        setValue("longitude", stadium.location.longitude);
        setLat(stadium.location.latitude);
        setLng(stadium.location.longitude);
        setZonePrices(stadium.zones.map((z) => z.price));
      } catch (err) {
        console.error("Failed to fetch stadium:", err);
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
    setZonePrices((prev) =>
      Array.from({ length: count }, (_, i) => parseInt(prev[i]) || 100)
    );
  }, [totalSeats, seatsPerZone]);

  useEffect(() => {
    if (fetchLoading || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: 12,
    });

    markerRef.current = new mapboxgl.Marker({ 
      draggable: true,
      color: "#E11D48" 
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    markerRef.current.on("dragend", () => {
      const lngLat = markerRef.current.getLngLat();
      setLng(lngLat.lng);
      setLat(lngLat.lat);
      setValue("latitude", lngLat.lat);
      setValue("longitude", lngLat.lng);
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
    });
    map.current.addControl(geocoder);
    geocoder.on("result", (e) => {
      const [newLng, newLat] = e.result.center;
      setLng(newLng);
      setLat(newLat);
      setValue("latitude", newLat);
      setValue("longitude", newLng);
      markerRef.current.setLngLat([newLng, newLat]);
      map.current.flyTo({ center: [newLng, newLat], zoom: 15 });
    });

    return () => {
       if (map.current) {
          map.current.remove();
          map.current = null;
       }
    };
  }, [fetchLoading]);

  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handleZonePriceChange = (i, value) => {
    const updated = [...zonePrices];
    updated[i] = value;
    setZonePrices(updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("totalSeats", data.totalSeats);
    formData.append("seatsPerZone", data.seatsPerZone);
    formData.append("zonePrices", JSON.stringify(zonePrices));
    formData.append("address", data.address);
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);
    if (image) formData.append("image", image);

    try {
      await axios.put(`/stadium/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("PROTOCOL SUCCESS: INFRASTRUCTURE UPDATED.");
      setMessageType("success");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("ERROR: UPDATE SEQUENCE TERMINATED.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Decrypting Infrastructure Archive</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-32 px-10">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E11D48]/10 border border-[#E11D48]/20 rounded-full">
          <Building2 className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Entity Modification Protocol Active</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              EDIT<br />
              <span className="text-[#E11D48]">STADIUM</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Updating physical infrastructure parameters and spatial coordinates.
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div className="text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Entity Reference</p>
              <p className="text-xl font-black text-white">{id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* NOTIFICATION HUB */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "p-6 rounded-2xl border flex items-center gap-4 mb-8",
              messageType === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                : "bg-[#E11D48]/10 border-[#E11D48]/20 text-[#E11D48]"
            )}
          >
            {messageType === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <p className="text-[10px] font-black uppercase tracking-widest">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM CONSOLE */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* PRIMARY CONFIG */}
        <div className="lg:col-span-7 space-y-8">
          <div className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[3rem] space-y-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
             <div className="absolute top-0 left-0 p-8 opacity-5">
                <Layers className="w-40 h-40 text-white" />
             </div>
             
             <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Infrastructure Identity</Label>
                   <Input 
                      {...register("name")} 
                      required 
                      placeholder="STADIUM NAME..."
                      className="h-16 px-6 bg-white/5 border-white/10 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 transition-all"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Total Capacity</Label>
                      <Input 
                         type="number" 
                         {...register("totalSeats")} 
                         required 
                         className="h-16 px-6 bg-white/5 border-white/10 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 transition-all"
                      />
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Zone Density</Label>
                      <Input 
                         type="number" 
                         {...register("seatsPerZone")} 
                         className="h-16 px-6 bg-white/5 border-white/10 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Spatial Registry (Address)</Label>
                   <Input 
                      {...register("address")} 
                      required 
                      placeholder="PHYSICAL LOCATION..."
                      className="h-16 px-6 bg-white/5 border-white/10 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 transition-all"
                   />
                </div>

                <div className="space-y-4">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Visual Identification (Image)</Label>
                   <div className="relative group">
                      <Input 
                         type="file" 
                         accept="image/*" 
                         onChange={handleImageChange}
                         className="h-20 px-6 pt-7 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 transition-all cursor-pointer file:hidden"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-600 group-hover:text-white transition-colors">
                         <ImageIcon className="w-5 h-5 mr-3" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Update Visual Buffer (Optional)</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* ZONE CONFIG */}
          {zoneCount > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[3rem] space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Sparkles className="w-4 h-4 text-[#E11D48]" />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sector Valuation</h3>
                </div>
                <Badge className="bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]/20 font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg">
                   {zoneCount} SECTORS DETECTED
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: zoneCount }, (_, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4 group hover:border-[#E11D48]/30 transition-all">
                    <div className="flex items-center justify-between">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">SECTOR {String.fromCharCode(65 + i)}</p>
                       <IndianRupee className="w-3 h-3 text-[#E11D48] opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <Input
                      type="number"
                      value={zonePrices[i] || ""}
                      onChange={(e) => handleZonePriceChange(i, e.target.value)}
                      required
                      className="h-12 bg-black border-white/10 rounded-xl text-[10px] font-black tracking-widest focus:ring-[#E11D48]/30 transition-all text-white"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* SPATIAL CONSOLE (MAP) */}
        <div className="lg:col-span-5 space-y-8">
           <div className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden h-fit">
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4">
                    <MapPin className="w-4 h-4 text-[#E11D48]" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Spatial Registry</h3>
                 </div>
              </div>

              <div className="space-y-6 relative z-10">
                 <div 
                    ref={mapContainer} 
                    className="w-full h-[400px] rounded-[2rem] border border-white/10 overflow-hidden grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                       <p className="text-[7px] font-black uppercase tracking-widest text-gray-600 text-center">Latitude</p>
                       <p className="text-[10px] font-black text-white text-center tracking-widest font-mono">{lat.toFixed(6)}</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                       <p className="text-[7px] font-black uppercase tracking-widest text-gray-600 text-center">Longitude</p>
                       <p className="text-[10px] font-black text-white text-center tracking-widest font-mono">{lng.toFixed(6)}</p>
                    </div>
                 </div>

                 <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] leading-relaxed text-center">
                    DRAG THE PROTOCOL MARKER OR USE THE GLOBAL SEARCH BAR TO RECALIBRATE GEOSPATIAL COORDINATES.
                 </p>
              </div>
           </div>

           {/* ACTIONS */}
           <div className="space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-20 bg-[#E11D48] text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] hover:bg-red-700 shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <span className="relative z-10 flex items-center justify-center">
                   {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-4" /> EXECUTING UPDATE...
                      </>
                    ) : (
                      <>UPDATE INFRASTRUCTURE <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" /></>
                    )}
                </span>
              </Button>
              
              <Link to="/admin">
                 <Button
                    type="button"
                    variant="outline"
                    className="w-full h-20 border-white/10 bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] hover:bg-white hover:text-black transition-all group"
                 >
                    <ArrowLeft className="w-5 h-5 mr-4 group-hover:-translate-x-2 transition-transform" /> ABORT OPERATION
                 </Button>
              </Link>
           </div>
        </div>
      </motion.form>
    </div>
  );
};

export default UpdateStadium;
