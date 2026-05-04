import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useAppDispatch } from "../../store/hooks";
import { createStadium } from "../../features/stadiums/stadiumsSlice";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  MapPin, 
  Calculator, 
  Activity, 
  Sparkles, 
  Building2, 
  Globe, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const AddStadiumForm = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [image, setImage] = useState(null);
  const [zonePrices, setZonePrices] = useState([]);
  const [zoneCount, setZoneCount] = useState(0);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.0760);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const token = localStorage.getItem("token");
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const totalSeats = watch("totalSeats");
  const seatsPerZone = watch("seatsPerZone");

  useEffect(() => {
    const total = parseInt(totalSeats || 0);
    const perZone = parseInt(seatsPerZone || 20);
    const count = Math.ceil(total / perZone);
    setZoneCount(count);
    setZonePrices(Array(count).fill(100));
  }, [totalSeats, seatsPerZone]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Elite Dark Style
      center: [lng, lat],
      zoom: 10,
    });

    const marker = new mapboxgl.Marker({ draggable: true, color: "#E11D48" })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      setLng(lngLat.lng);
      setLat(lngLat.lat);
      setValue("latitude", lngLat.lat);
      setValue("longitude", lngLat.lng);
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    map.current.addControl(geocoder);
    geocoder.on("result", (e) => {
      const [newLng, newLat] = e.result.center;
      setLng(newLng);
      setLat(newLat);
      setValue("latitude", newLat);
      setValue("longitude", newLng);
      marker.setLngLat([newLng, newLat]);
      map.current.flyTo({ center: [newLng, newLat], zoom: 13 });
    });

    setValue("latitude", lat);
    setValue("longitude", lng);
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setMessage("");
  };

  const handleZonePriceChange = (index, value) => {
    const newPrices = [...zonePrices];
    newPrices[index] = value;
    setZonePrices(newPrices);
  };

  const onSubmit = async (data) => {
    if (!image) {
      setMessage("Image is required.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("totalSeats", data.totalSeats);
    formData.append("seatsPerZone", data.seatsPerZone || 20);
    formData.append("zonePrices", JSON.stringify(zonePrices));
    formData.append("address", data.address);
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);
    formData.append("image", image);

    try {
      await dispatch(createStadium(formData)).unwrap();
      setMessage("Stadium deployment successful.");
      setMessageType("success");
      toast({ title: "Infrastructure Deployed", description: "Stadium has been integrated into the central core." });
    } catch (err) {
      console.error(err);
      setMessage("Deployment failed. Verify network protocols.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Infrastructure Acquisition Protocol</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
            DEPLOY<br />
            <span className="text-[#E11D48]">STADIUM</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Integrate new indoor arena modules into the global event network.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* FORM SIDE (3/5) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-8"
        >
          <div className="border border-white/5 bg-[#0A0A0A] rounded-[2.5rem] p-10 space-y-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <Building2 className="w-64 h-64 text-white" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
              {/* BASIC INTEL */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center border border-[#E11D48]/20">
                    <Sparkles className="w-4 h-4 text-[#E11D48]" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Core Specification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 group">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Designation Name</p>
                    <Input
                      placeholder="ENTER STADIUM NAME"
                      className="bg-white/5 border-white/10 rounded-2xl h-14 text-[11px] font-black tracking-widest uppercase focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50"
                      {...register("name", { required: "Name is mandatory" })}
                    />
                    {errors.name && <p className="text-[8px] font-black text-[#E11D48] uppercase tracking-widest">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-3 group">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Electronic Address</p>
                    <Input
                      placeholder="ENTER PHYSICAL LOCATION"
                      className="bg-white/5 border-white/10 rounded-2xl h-14 text-[11px] font-black tracking-widest uppercase focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50"
                      {...register("address", { required: "Address is mandatory" })}
                    />
                    {errors.address && <p className="text-[8px] font-black text-[#E11D48] uppercase tracking-widest">{errors.address.message}</p>}
                  </div>
                </div>
              </div>

              {/* SEATING ARCHITECTURE */}
              <div className="space-y-8 pt-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Calculator className="w-4 h-4 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Seating Architecture</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 group">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Total Capacity Nodes</p>
                    <Input
                      type="number"
                      placeholder="E.G. 50000"
                      className="bg-white/5 border-white/10 rounded-2xl h-14 text-[11px] font-black tracking-widest uppercase focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50"
                      {...register("totalSeats", { required: true, min: 1 })}
                    />
                  </div>
                  <div className="space-y-3 group">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Nodes Per Sector</p>
                    <Input
                      type="number"
                      defaultValue={20}
                      className="bg-white/5 border-white/10 rounded-2xl h-14 text-[11px] font-black tracking-widest uppercase focus:ring-[#E11D48]/50 focus:border-[#E11D48]/50"
                      {...register("seatsPerZone")}
                    />
                  </div>
                </div>

                {zoneCount > 0 && (
                  <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sector Valuations (₹)</p>
                      <Badge className="bg-[#E11D48] text-white font-black text-[8px] uppercase tracking-widest">{zoneCount} SECTORS</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: zoneCount }, (_, i) => (
                        <div key={i} className="space-y-2 group">
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest group-focus-within:text-[#E11D48]">SECTOR {String.fromCharCode(65 + i)}</p>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-600">₹</span>
                            <Input
                              type="number"
                              className="bg-black/40 border-white/10 rounded-xl h-10 pl-8 text-[10px] font-black tracking-widest focus:ring-[#E11D48]/30"
                              value={zonePrices[i] || ""}
                              onChange={(e) => handleZonePriceChange(i, e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* IMAGE SELECTION */}
              <div className="space-y-3 group">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-[#E11D48] transition-colors">Visual Identification Matrix</p>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="stadium-upload"
                  />
                  <label 
                    htmlFor="stadium-upload"
                    className="flex flex-col items-center justify-center gap-4 w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:border-[#E11D48]/50 hover:bg-[#E11D48]/5 transition-all group/upload"
                  >
                    <Upload className="w-8 h-8 text-gray-600 group-hover/upload:text-[#E11D48] transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover/upload:text-[#E11D48]">
                      {image ? image.name : "Transmit Structural Image"}
                    </span>
                  </label>
                </div>
              </div>

              <input type="hidden" {...register("latitude")} />
              <input type="hidden" {...register("longitude")} />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl relative group overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                   {isSubmitting ? "INTEGRATING MODULE..." : "INITIATE DEPLOYMENT"}
                   {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-[#E11D48] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Button>
            </form>
          </div>
        </motion.div>

        {/* MAP SIDE (2/5) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="border border-white/5 bg-[#0A0A0A] rounded-[2.5rem] p-10 space-y-8 shadow-2xl h-full flex flex-col">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Globe className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Geospatial Link</h3>
            </div>

            <div className="space-y-4 flex-1 flex flex-col">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                Calibrate the precise deployment coordinates. Use high-resolution positioning for grid synchronization.
              </p>
              
              <div className="relative flex-1 min-h-[400px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <div ref={mapContainer} className="absolute inset-0" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Global Coordinates</p>
                    <p className="text-[9px] font-black text-white">{lat.toFixed(4)}N / {lng.toFixed(4)}E</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-6 rounded-[2rem] border backdrop-blur-3xl shadow-2xl flex items-center gap-6 z-50",
              messageType === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              messageType === "error" ? "bg-red-500/20 border-red-500/30" : "bg-emerald-500/20 border-emerald-500/30"
            )}>
              {messageType === "error" ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddStadiumForm;
