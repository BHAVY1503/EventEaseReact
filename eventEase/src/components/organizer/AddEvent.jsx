import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Upload, Video, Building2, DollarSign } from "lucide-react";

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
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [customZonePrices, setCustomZonePrices] = useState([]);

  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/state/getallstates").then((r) => setStates(r.data.data));
    axios.get("/city/getallcitys").then((r) => setCities(r.data.data));
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
        setSelectedStadium(parsed);
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
    if (!mapContainer.current || map.current || eventCategory === "ZoomMeeting" || (eventCategory === "Indoor" && selectedStadium)) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom,
    });

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.on("dragend", () => {
      const pos = marker.getLngLat();
      setLng(pos.lng);
      setLat(pos.lat);
      setValue("latitude", pos.lat);
      setValue("longitude", pos.lng);
    });

    const geo = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl });
    map.current.addControl(geo);
    geo.on("result", (e) => {
      const [lng2, lat2] = e.result.center;
      setLng(lng2);
      setLat(lat2);
      setValue("latitude", lat2);
      setValue("longitude", lng2);
      marker.setLngLat([lng2, lat2]);
    });
  }, [eventCategory, selectedStadium]);

  const submitHandler = async (data) => {
    const formData = new FormData();
    for (const [k, v] of Object.entries(data)) {
      formData.append(k, k === "image" ? v[0] : v);
    }
    if (eventCategory === "Indoor" && selectedStadium) {
      console.log("customZonePrices being sent:", customZonePrices);
      formData.append("zonePrices", JSON.stringify(customZonePrices));
    }

    try {
      await axios.post("/event/addeventwithfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Event added successfully!");
       const role = localStorage.getItem("role");
       if (role === "Admin") {
      window.location.href = "/admin#groupbyevent";
        } else {
       window.location.href = "/organizer#viewevent";
     }
     } catch (err) {
       console.error(err);
     alert("Failed to add event.");
  }
    //   window.location.href = "/organizer#viewevent";
    // } catch (err) {
    //   console.error(err);
    //   alert("Failed to add event.");
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Event</h1>
          <p className="text-slate-600">Fill in the details to create your event</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Event Information</CardTitle>
            <CardDescription className="text-blue-100">
              Please provide all the necessary details for your event
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
              {/* Event Category Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Event Category</h3>
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="eventCategory" className="text-slate-700">Category Type</Label>
                    <select
                      id="eventCategory"
                      className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("eventCategory", { required: true })}
                      value={eventCategory}
                      onChange={(e) => {
                        setEventCategory(e.target.value);
                        setSelectedStadium(null);
                      }}
                    >
                      <option value="">Select Category</option>
                      <option value="Indoor">🏟️ Indoor</option>
                      <option value="Outdoor">🌳 Outdoor</option>
                      <option value="ZoomMeeting">💻 Zoom Meeting</option>
                    </select>
                  </div>

                  {/* Indoor Category */}
                  {eventCategory === "Indoor" && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <Label className="text-slate-700 mb-2 block">Stadium Selection</Label>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 justify-start text-left font-normal"
                          onClick={() => navigate("/stadiumselect")}
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          {selectedStadium ? selectedStadium.name : "Select Stadium"}
                        </Button>
                      </div>

                      {selectedStadium && selectedStadium.zones && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <Label className="text-slate-700 font-semibold">Customize Zone Prices</Label>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {selectedStadium.zones.map((zone, i) => (
                              <div key={i} className="space-y-1.5">
                                <Label htmlFor={`zone-${i}`} className="text-sm text-slate-600">
                                  Zone {String.fromCharCode(65 + i)}
                                </Label>
                                <Input
                                  id={`zone-${i}`}
                                  type="number"
                                  value={customZonePrices[i]}
                                  onChange={(e) => {
                                    const newPrices = [...customZonePrices];
                                    newPrices[i] = parseInt(e.target.value) || 0;
                                    setCustomZonePrices(newPrices);
                                  }}
                                  className="h-10"
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outdoor Category */}
                  {eventCategory === "Outdoor" && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="stateId" className="text-slate-700">State</Label>
                          <select
                            id="stateId"
                            className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            {...register("stateId", { required: true })}
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state._id} value={state._id}>{state.Name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="cityId" className="text-slate-700">City</Label>
                          <select
                            id="cityId"
                            className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            {...register("cityId", { required: true })}
                          >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                              <option key={city._id} value={city._id}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="ticketRate" className="text-slate-700">Ticket Price (₹)</Label>
                        <Input
                          id="ticketRate"
                          type="number"
                          placeholder="Enter price"
                          className="mt-1.5"
                          required
                          {...register("ticketRate")}
                        />
                      </div>

                      <div>
                        <Label className="text-slate-700 mb-2 block">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Location on Map
                        </Label>
                        <div 
                          ref={mapContainer} 
                          className="h-64 border-2 border-slate-300 rounded-lg shadow-inner"
                        />
                        <input type="hidden" {...register("latitude")} />
                        <input type="hidden" {...register("longitude")} />
                      </div>
                    </div>
                  )}

                  {/* Zoom Meeting Category */}
                  {eventCategory === "ZoomMeeting" && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Label htmlFor="zoomUrl" className="text-slate-700">
                        <Video className="w-4 h-4 inline mr-1" />
                        Zoom Meeting URL
                      </Label>
                      <Input
                        id="zoomUrl"
                        type="url"
                        placeholder="https://zoom.us/j/..."
                        className="mt-1.5"
                        {...register("zoomUrl", { required: true })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventName" className="text-slate-700">Event Name</Label>
                    <Input
                      id="eventName"
                      type="text"
                      placeholder="Enter event name"
                      className="mt-1.5"
                      {...register("eventName", { required: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventType" className="text-slate-700">Event Type</Label>
                    <select
                      id="eventType"
                      className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("eventType", { required: true })}
                    >
                      <option value="">Select Type</option>
                      <option value="Conference">Conference</option>
                      <option value="Exhibition">Exhibition</option>
                      <option value="Gala Dinner">Gala Dinner</option>
                      <option value="Incentive">Incentive</option>
                      <option value="Music consert">Music Concert</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="numberOfSeats" className="text-slate-700">
                      <Users className="w-4 h-4 inline mr-1" />
                      Total Seats
                    </Label>
                    <Input
                      id="numberOfSeats"
                      type="number"
                      placeholder="Enter number of seats"
                      className="mt-1.5"
                      {...register("numberOfSeats", { required: true })}
                      value={eventCategory === "Indoor" && selectedStadium ? selectedStadium.totalSeats : undefined}
                      onChange={(e) => {
                        if (eventCategory !== "Indoor") {
                          setValue("numberOfSeats", parseInt(e.target.value));
                        }
                      }}
                      disabled={eventCategory === "Indoor" && selectedStadium}
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate" className="text-slate-700">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      className="mt-1.5"
                      {...register("startDate", { required: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-slate-700">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="mt-1.5"
                      {...register("endDate", { required: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image" className="text-slate-700">
                      <Upload className="w-4 h-4 inline mr-1" />
                      Event Image
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      className="mt-1.5"
                      {...register("image", { required: true })}
                      //  onChange={(e) => setValue("image", e.target.files)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full md:w-auto px-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Create Event
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};





//working code without ui components and better structure
// import React, { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// import "mapbox-gl/dist/mapbox-gl.css";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// import axios from "axios";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// export const AddEvent = () => {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(72.8777);
//   const [lat, setLat] = useState(19.076);
//   const [zoom] = useState(10);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [eventCategory, setEventCategory] = useState("");
//   const [selectedStadium, setSelectedStadium] = useState(null);
//   const [customZonePrices, setCustomZonePrices] = useState([]);

//   const { register, handleSubmit, setValue } = useForm();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     axios.get("/state/getallstates").then((r) => setStates(r.data.data));
//     axios.get("/city/getallcitys").then((r) => setCities(r.data.data));
//   }, []);

//   useEffect(() => {
//     const storedCategory = localStorage.getItem("selectedCategory");
//     const storedStadium = localStorage.getItem("selectedStadium");

//     if (storedCategory) {
//       setEventCategory(storedCategory);
//       localStorage.removeItem("selectedCategory");
//     }

//     if (storedStadium) {
//       const parsed = JSON.parse(storedStadium);
//       if (parsed && parsed._id) {
//         setSelectedStadium(parsed);
//         setValue("stadiumId", parsed._id);
//         setValue("latitude", parsed.location.latitude);
//         setValue("longitude", parsed.location.longitude);
//         setValue("numberOfSeats", parsed.totalSeats);
//         if (parsed.zones) {
//           const defaultPrices = parsed.zones.map((z) => z.price);
//           setCustomZonePrices(defaultPrices);
//         }
//       }
//       localStorage.removeItem("selectedStadium");
//     }
//   }, []);

//   useEffect(() => {
//     if (!mapContainer.current || map.current || eventCategory === "ZoomMeeting" || (eventCategory === "Indoor" && selectedStadium)) return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/streets-v11",
//       center: [lng, lat],
//       zoom,
//     });

//     const marker = new mapboxgl.Marker({ draggable: true })
//       .setLngLat([lng, lat])
//       .addTo(map.current);

//     marker.on("dragend", () => {
//       const pos = marker.getLngLat();
//       setLng(pos.lng);
//       setLat(pos.lat);
//       setValue("latitude", pos.lat);
//       setValue("longitude", pos.lng);
//     });

//     const geo = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl });
//     map.current.addControl(geo);
//     geo.on("result", (e) => {
//       const [lng2, lat2] = e.result.center;
//       setLng(lng2);
//       setLat(lat2);
//       setValue("latitude", lat2);
//       setValue("longitude", lng2);
//       marker.setLngLat([lng2, lat2]);
//     });
//   }, [eventCategory, selectedStadium]);

//   const submitHandler = async (data) => {
//     const formData = new FormData();
//     for (const [k, v] of Object.entries(data)) {
//       formData.append(k, k === "image" ? v[0] : v);
//     }
//     // send data as string
//     if (eventCategory === "Indoor" && selectedStadium) {
//       console.log("customZonePrices being sent:", customZonePrices);
//       formData.append("zonePrices", JSON.stringify(customZonePrices));
//     }
//     //send data as array
//     // if (eventCategory === "Indoor" && selectedStadium) {
//     //   customZonePrices.forEach((price, index) => {
//     // formData.append(`zonePrices[${index}]`, price);
//     //  });
//     //  }

//     try {
//       await axios.post("/event/addeventwithfile", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       alert("Event added successfully!");
//       window.location.href = "/organizer#viewevent";
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add event.");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4 text-center">Add Event</h2>
//       <form onSubmit={handleSubmit(submitHandler)} className="bg-light p-4 rounded shadow">
//         <div className="row">
//           <div className="col-md-6 mb-3">
//             <label>Event Category</label>
//             <select
//               className="form-control"
//               {...register("eventCategory", { required: true })}
//               value={eventCategory}
//               onChange={(e) => {
//                 setEventCategory(e.target.value);
//                 setSelectedStadium(null);
//               }}
//             >
//               <option value="">Select Category</option>
//               <option value="Indoor">Indoor</option>
//               <option value="Outdoor">Outdoor</option>
//               <option value="ZoomMeeting">Zoom Meeting</option>
//             </select>
//           </div>

//           {eventCategory === "Indoor" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>Choose Stadium</label>
//                 <button
//                   type="button"
//                   className="btn btn-outline-primary form-control"
//                   onClick={() => navigate("/stadiumselect")}
//                 >
//                   {selectedStadium ? selectedStadium.name : "Select Stadium"}
//                 </button>
//               </div>
//                {selectedStadium && selectedStadium.zones && (
//                <div className="col-12 mb-4">
//                <h5>Customize Zone Prices</h5>
//                 <div className="d-flex flex-wrap gap-3">
//                 {selectedStadium.zones.map((zone, i) => (
//              <div key={i}>
//               <label>Zone {String.fromCharCode(65 + i)}</label>
//            <input
//             type="number"
//             className="form-control"
//             value={customZonePrices[i]}
//             onChange={(e) => {
//               const newPrices = [...customZonePrices];
//               newPrices[i] = parseInt(e.target.value) || 0;
//               setCustomZonePrices(newPrices);
//             }}
//             required
//           />
//         </div>
//       ))}
//     </div>
//   </div>
// )}

// {/* 
//               {selectedStadium && (
//                 <>
//                   <input type="hidden" {...register("stadiumId", { required: true })} value={selectedStadium._id} />
//                   <input type="hidden" {...register("latitude")} value={selectedStadium.location.latitude} />
//                   <input type="hidden" {...register("longitude")} value={selectedStadium.location.longitude} />

//                   <div className="col-md-12 mb-3">
//                     <label>Override Zone Prices (optional)</label>
//                     <div className="d-flex flex-wrap gap-3">
//                       {selectedStadium.zones?.map((zone, i) => (
//                         <div key={i}>
//                           <label className="form-label">Zone {String.fromCharCode(65 + i)}</label>
//                           <input
//                             type="number"
//                             className="form-control"
//                             value={customZonePrices[i] || ""}
//                             onChange={(e) => {
//                               const updated = [...customZonePrices];
//                               updated[i] = parseInt(e.target.value);
//                               setCustomZonePrices(updated);
//                             }}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </>
//               )} */}
//             </>
//           )}

//           {eventCategory === "Outdoor" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>State</label>
//                 <select className="form-control" {...register("stateId", { required: true })}>
//                   <option value="">Select State</option>
//                   {states.map((state) => (
//                     <option key={state._id} value={state._id}>{state.Name}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label>City</label>
//                 <select className="form-control" {...register("cityId", { required: true })}>
//                   <option value="">Select City</option>
//                   {cities.map((city) => (
//                     <option key={city._id} value={city._id}>{city.name}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-12 mb-3">
//                 <lable>Price &#8377;</lable>
//                 <input type='number'
//                  className="form-control"
//                  placeholder="&#8377; enter"
//                   required="true" {...register("ticketRate")}></input>
//               </div>
//               <div className="col-md-12 mb-3">
//                 <label>Location on Map</label>
//                 <div ref={mapContainer} style={{ height: "300px", border: "1px solid #ccc", borderRadius: "8px" }} />
//                 <input type="hidden" {...register("latitude")} />
//                 <input type="hidden" {...register("longitude")} />
//               </div>
//             </>
//           )}

//           {eventCategory === "ZoomMeeting" && (
//             <div className="col-md-12 mb-3">
//               <label>Zoom Meeting URL</label>
//               <input type="url" className="form-control" {...register("zoomUrl", { required: true })} />
//             </div>
//           )}

//           <div className="col-md-6 mb-3">
//             <label>Event Name</label>
//             <input type="text" className="form-control" {...register("eventName", { required: true })} />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Event Type</label>
//             <select className="form-control" {...register("eventType", { required: true })}>
//               <option value="">Select Type</option>
//               <option value="Conference">Conference</option>
//               <option value="Exhibition">Exhibition</option>
//               <option value="Gala Dinner">Gala Dinner</option>
//               <option value="Incentive">Incentive</option>
//               <option value="Music consert">Music consert</option>
//               <option value="Meeting">Meeting</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Total Seats</label>
//             <input
//               type="number"
//               className="form-control"
//               {...register("numberOfSeats", { required: true })}
//               value={eventCategory === "Indoor" && selectedStadium ? selectedStadium.totalSeats : undefined}
//               onChange={(e) => {
//                 if (eventCategory !== "Indoor") {
//                   setValue("numberOfSeats", parseInt(e.target.value));
//                 }
//               }}
//               disabled={eventCategory === "Indoor" && selectedStadium}
//             />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Start Date</label>
//             <input type="date" className="form-control" {...register("startDate", { required: true })} />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>End Date</label>
//             <input type="date" className="form-control" {...register("endDate", { required: true })} />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Event Image</label>
//             <input type="file" className="form-control" {...register("image", { required: true })} />
//           </div>

//           <div className="col-md-12 text-center mt-4">
//             <button type="submit" className="btn btn-primary">Add Event</button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddEvent;










