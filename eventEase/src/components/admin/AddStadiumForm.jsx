import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// import axios from "axios"; // You'll need to import this in your actual project
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, MapPin, Calculator } from "lucide-react";

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

  const totalSeats = watch("totalSeats");
  const seatsPerZone = watch("seatsPerZone");

  // Calculate zones on totalSeats/seatsPerZone change
  useEffect(() => {
    const total = parseInt(totalSeats || 0);
    const perZone = parseInt(seatsPerZone || 20);
    const count = Math.ceil(total / perZone);
    setZoneCount(count);
    setZonePrices(Array(count).fill(100)); // Default ₹100
  }, [totalSeats, seatsPerZone]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 10,
    });

    const marker = new mapboxgl.Marker({ draggable: true })
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
      const res = await axios.post("/admin/stadium", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Stadium added successfully!");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add stadium. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <div className=" bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 ">
      // <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-700 dark:via-black dark:to-black ">
    <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-800 min-h-screen text-gray-900 dark:text-gray-100">
       
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
        {/* <div className="text-center space-y-2"> */}
          <h1 className="text-4xl font-bold text-slate-900 mb-2 dark:text-gray-100">Add Indoor Stadium</h1>
          <p className="text-slate-600 dark:text-gray-100">Create a new stadium with seating zones and location details</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Stadium Information
            </CardTitle>
            <CardDescription>
              Enter the basic details of your stadium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Stadium Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter stadium name"
                    {...register("name", { required: "Stadium name is required" })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter stadium address"
                    {...register("address", { required: "Address is required" })}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Seating Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Seating Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalSeats">Total Seats</Label>
                      <Input
                        id="totalSeats"
                        type="number"
                        min="1"
                        placeholder="e.g. 1000"
                        {...register("totalSeats", { 
                          required: "Total seats is required",
                          min: { value: 1, message: "Must be at least 1 seat" }
                        })}
                      />
                      {errors.totalSeats && (
                        <p className="text-sm text-red-500">{errors.totalSeats.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seatsPerZone">Seats per Zone</Label>
                      <Input
                        id="seatsPerZone"
                        type="number"
                        min="1"
                        defaultValue={20}
                        placeholder="e.g. 20"
                        {...register("seatsPerZone")}
                      />
                    </div>
                  </div>

                  {zoneCount > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label>Zone Pricing</Label>
                        <Badge variant="secondary">{zoneCount} zones</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Array.from({ length: zoneCount }, (_, i) => (
                          <div key={i} className="space-y-1">
                            <Label className="text-sm font-medium">
                              Zone {String.fromCharCode(65 + i)}
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                                ₹
                              </span>
                              <Input
                                type="number"
                                min="0"
                                className="pl-8"
                                value={zonePrices[i] || ""}
                                onChange={(e) => handleZonePriceChange(i, e.target.value)}
                                placeholder="100"
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Stadium Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {image && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {image.name}
                  </p>
                )}
              </div>

              {/* Hidden coordinates */}
              <input type="hidden" {...register("latitude")} />
              <input type="hidden" {...register("longitude")} />

              {/* Map */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Stadium Location
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the search bar or drag the marker to set the exact location
                </p>
                <div 
                  ref={mapContainer} 
                  className="h-80 w-full rounded-lg border border-input shadow-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="w-full md:w-auto px-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
              
                {isSubmitting ? "Adding Stadium..." : "Add Stadium"}
              </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Display */}
        {message && (
          <Alert className={messageType === "error" ? "border-red-500 text-red-600" : "border-green-500 text-green-600"}>
            <AlertDescription className="font-medium">
              {message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AddStadiumForm;

// import React, { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// import "mapbox-gl/dist/mapbox-gl.css";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// import axios from "axios";
// import { useForm } from "react-hook-form";

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// const AddStadiumForm = () => {
//   const [message, setMessage] = useState("");
//   const [image, setImage] = useState(null);
//   const [zonePrices, setZonePrices] = useState([]);
//   const [zoneCount, setZoneCount] = useState(0);
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(72.8777);
//   const [lat, setLat] = useState(19.0760);

//   const { register, handleSubmit, setValue, watch } = useForm();
//   const token = localStorage.getItem("token");

//   const totalSeats = watch("totalSeats");
//   const seatsPerZone = watch("seatsPerZone");

//   // Calculate zones on totalSeats/seatsPerZone change
//   useEffect(() => {
//     const total = parseInt(totalSeats || 0);
//     const perZone = parseInt(seatsPerZone || 20);
//     const count = Math.ceil(total / perZone);
//     setZoneCount(count);
//     setZonePrices(Array(count).fill(100)); // Default ₹100
//   }, [totalSeats, seatsPerZone]);

//   useEffect(() => {
//     if (map.current) return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/streets-v11",
//       center: [lng, lat],
//       zoom: 10,
//     });

//     const marker = new mapboxgl.Marker({ draggable: true })
//       .setLngLat([lng, lat])
//       .addTo(map.current);

//     marker.on("dragend", () => {
//       const lngLat = marker.getLngLat();
//       setLng(lngLat.lng);
//       setLat(lngLat.lat);
//       setValue("latitude", lngLat.lat);
//       setValue("longitude", lngLat.lng);
//     });

//     const geocoder = new MapboxGeocoder({
//       accessToken: mapboxgl.accessToken,
//       mapboxgl: mapboxgl,
//       marker: false,
//     });

//     map.current.addControl(geocoder);
//     geocoder.on("result", (e) => {
//       const [newLng, newLat] = e.result.center;
//       setLng(newLng);
//       setLat(newLat);
//       setValue("latitude", newLat);
//       setValue("longitude", newLng);
//       marker.setLngLat([newLng, newLat]);
//       map.current.flyTo({ center: [newLng, newLat], zoom: 13 });
//     });

//     setValue("latitude", lat);
//     setValue("longitude", lng);
//   }, []);

//   const handleImageChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const handleZonePriceChange = (index, value) => {
//     const newPrices = [...zonePrices];
//     newPrices[index] = value;
//     setZonePrices(newPrices);
//   };

//   const onSubmit = async (data) => {
//     if (!image) return setMessage("Image is required.");

//     const formData = new FormData();
//     formData.append("name", data.name);
//     formData.append("totalSeats", data.totalSeats);
//     formData.append("seatsPerZone", data.seatsPerZone || 20);
//     formData.append("zonePrices", JSON.stringify(zonePrices));
//     formData.append("address", data.address);
//     formData.append("latitude", data.latitude);
//     formData.append("longitude", data.longitude);
//     formData.append("image", image);

//     try {
//       const res = await axios.post("/admin/stadium", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setMessage("✅ Stadium added successfully!");
//       return;
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Failed to add stadium");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Add Indoor Stadium</h2>
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
//           <input type="number" className="form-control" defaultValue={20} {...register("seatsPerZone")} />
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
//           <label>Upload Image</label>
//           <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} required />
//         </div>

//         <input type="hidden" {...register("latitude")} />
//         <input type="hidden" {...register("longitude")} />

//         <div className="mb-3">
//           <label>Select Location (Drag or Search)</label>
//           <div ref={mapContainer} style={{ height: "300px", borderRadius: "10px", border: "1px solid #ccc" }} />
//         </div>

//         <button type="submit" className="btn btn-primary">Add Stadium</button>
//       </form>
//       {message && <p className="mt-3 fw-bold">{message}</p>}
//     </div>
//   );
// };

// export default AddStadiumForm;




