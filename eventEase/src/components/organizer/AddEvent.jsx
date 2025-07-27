import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Calendar, Users, Building, Video, Upload, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedZones, setExpandedZones] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
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
    setIsSubmitting(true);
    const formData = new FormData();
    for (const [k, v] of Object.entries(data)) {
      formData.append(k, k === "image" ? v[0] : v);
    }
    
    if (eventCategory === "Indoor" && selectedStadium) {
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
      window.location.href = "/organizer#viewevent";
    } catch (err) {
      console.error(err);
      alert("Failed to add event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleZoneExpansion = (index) => {
    setExpandedZones(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the details to create your amazing event</p>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          {/* Event Category Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Event Category
              </CardTitle>
              <CardDescription className="text-blue-100">
                Choose the type of event you're organizing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventCategory">Event Category *</Label>
                  <Select 
                    onValueChange={(value) => {
                      setEventCategory(value);
                      setSelectedStadium(null);
                      setValue("eventCategory", value);
                    }}
                    value={eventCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indoor">🏢 Indoor</SelectItem>
                      <SelectItem value="Outdoor">🌳 Outdoor</SelectItem>
                      <SelectItem value="ZoomMeeting">💻 Zoom Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register("eventCategory", { required: true })} />
                </div>

                {eventCategory === "Indoor" && (
                  <div className="space-y-2">
                    <Label>Stadium Selection</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/stadiumselect")}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      {selectedStadium ? selectedStadium.name : "Select Stadium"}
                    </Button>
                  </div>
                )}
              </div>

              {selectedStadium && selectedStadium.zones && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Customize Zone Prices
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedStadium.zones.map((zone, i) => (
                      <Card key={i} className="border-2 hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-sm">
                              Zone {String.fromCharCode(65 + i)}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleZoneExpansion(i)}
                            >
                              {expandedZones[i] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`zone-${i}`}>Price (₹)</Label>
                            <Input
                              id={`zone-${i}`}
                              type="number"
                              value={customZonePrices[i] || ""}
                              onChange={(e) => {
                                const newPrices = [...customZonePrices];
                                newPrices[i] = parseInt(e.target.value) || 0;
                                setCustomZonePrices(newPrices);
                              }}
                              placeholder="Enter price"
                              required
                            />
                          </div>
                          {expandedZones[i] && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600 mb-2">Available Seats:</p>
                              <div className="flex flex-wrap gap-1">
                                {zone.seatLabels?.slice(0, 10).map((label, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                                {zone.seatLabels?.length > 10 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{zone.seatLabels.length - 10} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Card */}
          {eventCategory === "Outdoor" && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Details
                </CardTitle>
                <CardDescription className="text-green-100">
                  Specify the location for your outdoor event
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stateId">State *</Label>
                    <Select onValueChange={(value) => setValue("stateId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state._id} value={state._id}>
                            {state.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register("stateId", { required: true })} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cityId">City *</Label>
                    <Select onValueChange={(value) => setValue("cityId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city._id} value={city._id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register("cityId", { required: true })} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketRate">Ticket Price (₹) *</Label>
                    <Input
                      id="ticketRate"
                      type="number"
                      placeholder="Enter ticket price"
                      {...register("ticketRate", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location on Map</Label>
                  <div 
                    ref={mapContainer} 
                    className="h-80 border-2 border-gray-200 rounded-lg shadow-inner"
                  />
                  <input type="hidden" {...register("latitude")} />
                  <input type="hidden" {...register("longitude")} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zoom Meeting Card */}
          {eventCategory === "ZoomMeeting" && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Virtual Meeting Details
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Provide the Zoom meeting link for your virtual event
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="zoomUrl">Zoom Meeting URL *</Label>
                  <Input
                    id="zoomUrl"
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    {...register("zoomUrl", { required: true })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Details Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Details
              </CardTitle>
              <CardDescription className="text-orange-100">
                Basic information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    type="text"
                    placeholder="Enter event name"
                    {...register("eventName", { required: true })}
                  />
                  {errors.eventName && (
                    <p className="text-sm text-red-500">Event name is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select onValueChange={(value) => setValue("eventType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Exhibition">Exhibition</SelectItem>
                      <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
                      <SelectItem value="Incentive">Incentive</SelectItem>
                      <SelectItem value="Music consert">Music Concert</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register("eventType", { required: true })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfSeats">Total Seats *</Label>
                  <Input
                    id="numberOfSeats"
                    type="number"
                    placeholder="Enter number of seats"
                    value={eventCategory === "Indoor" && selectedStadium ? selectedStadium.totalSeats : undefined}
                    onChange={(e) => {
                      if (eventCategory !== "Indoor") {
                        setValue("numberOfSeats", parseInt(e.target.value));
                      }
                    }}
                    disabled={eventCategory === "Indoor" && selectedStadium}
                    {...register("numberOfSeats", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Event Image *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      {...register("image", { required: true })}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate", { required: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="px-12 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transform transition hover:scale-105"
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

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














