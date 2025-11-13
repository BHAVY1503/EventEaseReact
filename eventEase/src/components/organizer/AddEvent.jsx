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
       window.location.reload();
      window.location.href = "/admin#groupbyevent";
        } else {
       window.location.reload();
       window.location.href = "/organizer#viewevent";
       alert("Check the 'View My Event' section to see your newly added event")
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
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
    <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-800 min-h-screen text-gray-900 dark:text-gray-100">

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 dark:text-gray-100">Create New Event</h1>
          <p className="text-gray-800 dark:text-gray-400">Fill in the details to create your event</p>
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Event Category</h3>
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="eventCategory" className="text-slate-700 dark:text-gray-100">Category Type</Label>
                    <select
                      id="eventCategory"
                      className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100 dark:bg-gray-950"
                      {...register("eventCategory", { required: "Event category is required" })}
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
                        <Label className="text-slate-700 mb-2 block  dark:text-gray-800">Stadium Selection</Label>
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
                                <Label htmlFor={`zone-${i}`} className="text-sm text-slate-600 dark:text-gray-800">
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
                                  className="h-10 dark:text-gray-800"
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
                            className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-gray-700"
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
                            className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-gray-700"
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
                          // className="mt-1.5"
                            className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-gray-700"
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
                <h3 className="text-lg font-semibold text-slate-900 mb-4  dark:text-gray-100">Event Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventName" className="text-slate-700  dark:text-gray-100">Event Name</Label>
                    <Input
                      id="eventName"
                      type="text"
                      placeholder="Enter event name"
                      className="mt-1.5"
                      {...register("eventName", { required: "Event name is required",
                    minLength: { value: 3, message: "Minimum 3 characters required" }, })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventType" className="text-slate-700  dark:text-gray-100">Event Type</Label>
                    <select
                      id="eventType"
                      className="w-full mt-1.5 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent  dark:text-gray-100 dark:bg-gray-950 "
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
                    <Label htmlFor="numberOfSeats" className="text-slate-700 dark:text-gray-100">
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
                    <Label htmlFor="startDate" className="text-slate-700 dark:text-gray-100">
                      <Calendar className="w-4 h-4 inline mr-1 " />
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
                    <Label htmlFor="endDate" className="text-slate-700 dark:text-gray-100">
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
                    <Label htmlFor="image" className="text-slate-700 dark:text-gray-100">
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
















