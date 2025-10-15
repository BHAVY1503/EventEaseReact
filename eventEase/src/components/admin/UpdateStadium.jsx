import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const UpdateStadium = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);
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
        setMessage("Failed to load stadium data.");
        setMessageType("error");
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
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 10,
    });

    markerRef.current = new mapboxgl.Marker({ draggable: true })
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
      map.current.flyTo({ center: [newLng, newLat], zoom: 13 });
    });
  }, []);

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
      alert("Stadium updated successfully!");
      setMessage("Stadium updated successfully!");
      setMessageType("success");
      setTimeout(() => navigate("/admin#viewstadiums"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update stadium. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-3xl shadow-xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            ✏️ Edit Indoor Stadium
          </CardTitle>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert
              className={`mb-4 ${
                messageType === "success"
                  ? "bg-green-50 border-green-400 text-green-700"
                  : "bg-red-50 border-red-400 text-red-700"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Stadium Name</Label>
              <Input {...register("name")} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Seats</Label>
                <Input type="number" {...register("totalSeats")} required />
              </div>
              <div>
                <Label>Seats per Zone</Label>
                <Input type="number" {...register("seatsPerZone")} />
              </div>
            </div>

            {zoneCount > 0 && (
              <div>
                <Label>Zone Prices (₹)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {Array.from({ length: zoneCount }, (_, i) => (
                    <div key={i}>
                      <Label>Zone {String.fromCharCode(65 + i)}</Label>
                      <Input
                        type="number"
                        value={zonePrices[i] || ""}
                        onChange={(e) =>
                          handleZonePriceChange(i, e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Address</Label>
              <Input {...register("address")} required />
            </div>

            <div>
              <Label>Upload New Image (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div>
              <Label>Select Location (Drag or Search)</Label>
              <div
                ref={mapContainer}
                className="mt-2 rounded-xl border border-gray-300"
                style={{ height: "300px" }}
              />
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" /> Updating...
                  </>
                ) : (
                  "Update Stadium"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateStadium;



// import React, { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// import "mapbox-gl/dist/mapbox-gl.css";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// import axios from "axios";
// import { useForm } from "react-hook-form";
// import { useParams, useNavigate } from "react-router-dom";

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// const UpdateStadium = () => {
//   const { id } = useParams(); // stadiumId from route
//   const navigate = useNavigate();

//   const [message, setMessage] = useState("");
//   const [image, setImage] = useState(null);
//   const [zonePrices, setZonePrices] = useState([]);
//   const [zoneCount, setZoneCount] = useState(0);
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const markerRef = useRef(null);
//   const [lng, setLng] = useState(72.8777);
//   const [lat, setLat] = useState(19.0760);

//   const { register, handleSubmit, setValue, watch } = useForm();
//   const token = localStorage.getItem("token");

//   const totalSeats = watch("totalSeats");
//   const seatsPerZone = watch("seatsPerZone");

//   useEffect(() => {
//     const fetchStadium = async () => {
//       try {
//         const res = await axios.get(`/stadium/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const stadium = res.data;
//         setValue("name", stadium.name);
//         setValue("totalSeats", stadium.totalSeats);
//         setValue("seatsPerZone", stadium.zones?.[0]?.seatLabels?.length || 20);
//         setValue("address", stadium.location.address);
//         setValue("latitude", stadium.location.latitude);
//         setValue("longitude", stadium.location.longitude);
//         setLat(stadium.location.latitude);
//         setLng(stadium.location.longitude);
//         setZonePrices(stadium.zones.map(z => z.price));
//       } catch (err) {
//         console.error("Failed to fetch stadium:", err);
//         setMessage("❌ Failed to load stadium data.");
//       }
//     };

//     fetchStadium();
//   }, [id]);

//   useEffect(() => {
//     const total = parseInt(totalSeats || 0);
//     const perZone = parseInt(seatsPerZone || 20);
//     const count = Math.ceil(total / perZone);
//     setZoneCount(count);
//     setZonePrices(prev =>
//       Array.from({ length: count }, (_, i) => parseInt(prev[i]) || 100)
//     );
//   }, [totalSeats, seatsPerZone]);

//   useEffect(() => {
//     if (map.current) return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/streets-v11",
//       center: [lng, lat],
//       zoom: 10,
//     });

//     markerRef.current = new mapboxgl.Marker({ draggable: true })
//       .setLngLat([lng, lat])
//       .addTo(map.current);

//     markerRef.current.on("dragend", () => {
//       const lngLat = markerRef.current.getLngLat();
//       setLng(lngLat.lng);
//       setLat(lngLat.lat);
//       setValue("latitude", lngLat.lat);
//       setValue("longitude", lngLat.lng);
//     });

//     const geocoder = new MapboxGeocoder({
//       accessToken: mapboxgl.accessToken,
//       mapboxgl,
//       marker: false,
//     });

//     map.current.addControl(geocoder);
//     geocoder.on("result", (e) => {
//       const [newLng, newLat] = e.result.center;
//       setLng(newLng);
//       setLat(newLat);
//       setValue("latitude", newLat);
//       setValue("longitude", newLng);
//       markerRef.current.setLngLat([newLng, newLat]);
//       map.current.flyTo({ center: [newLng, newLat], zoom: 13 });
//     });
//   }, []);

//   const handleImageChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const handleZonePriceChange = (index, value) => {
//     const updated = [...zonePrices];
//     updated[index] = value;
//     setZonePrices(updated);
//   };

//   const onSubmit = async (data) => {
//     const formData = new FormData();
//     formData.append("name", data.name);
//     formData.append("totalSeats", data.totalSeats);
//     formData.append("seatsPerZone", data.seatsPerZone);
//     formData.append("zonePrices", JSON.stringify(zonePrices));
//     formData.append("address", data.address);
//     formData.append("latitude", data.latitude);
//     formData.append("longitude", data.longitude);
//     if (image) formData.append("image", image);

//     try {
//       await axios.put(`/stadium/${id}`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setMessage("✅ Stadium updated successfully!");
//       setTimeout(() => navigate("/admin#viewstadiums"), 1500); // redirect after update
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Failed to update stadium");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Edit Indoor Stadium</h2>
//       <form onSubmit={handleSubmit(onSubmit)} className="shadow p-4 rounded bg-light">
//         <div className="mb-3">
//           <label>Stadium Name</label>
//           <input className="form-control" {...register("name")} required />
//         </div>

//         <div className="mb-3">
//           <label>Total Seats</label>
//           <input type="number" className="form-control" {...register("totalSeats")} required />
//         </div>

//         <div className="mb-3">
//           <label>Seats per Zone</label>
//           <input type="number" className="form-control" {...register("seatsPerZone")} />
//         </div>

//         {zoneCount > 0 && (
//           <div className="mb-3">
//             <label>Zone Prices (₹)</label>
//             <div className="d-flex flex-wrap gap-3">
//               {Array.from({ length: zoneCount }, (_, i) => (
//                 <div key={i}>
//                   <label className="form-label">Zone {String.fromCharCode(65 + i)}</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={zonePrices[i] || ""}
//                     onChange={(e) => handleZonePriceChange(i, e.target.value)}
//                     required
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="mb-3">
//           <label>Address</label>
//           <input className="form-control" {...register("address")} required />
//         </div>

//         <div className="mb-3">
//           <label>Upload New Image (Optional)</label>
//           <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
//         </div>

//         <input type="hidden" {...register("latitude")} />
//         <input type="hidden" {...register("longitude")} />

//         <div className="mb-3">
//           <label>Select Location (Drag or Search)</label>
//           <div ref={mapContainer} style={{ height: "300px", borderRadius: "10px", border: "1px solid #ccc" }} />
//         </div>

//         <button type="submit" className="btn btn-success">Update Stadium</button>
//       </form>
//       {message && <p className="mt-3 fw-bold">{message}</p>}
//     </div>
//   );
// };

// export default UpdateStadium;
