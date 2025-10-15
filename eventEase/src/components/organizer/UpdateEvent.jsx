import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
// import "@mapbox-gl/geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

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

  const { register, handleSubmit, setValue, reset } = useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/state/getallstates").then((r) => setStates(r.data.data));
    axios.get("/city/getallcitys").then((r) => setCities(r.data.data));
  }, []);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await axios.get(`/event/geteventbyid/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const event = res.data.data;
        setEventCategory(event.eventCategory);

        reset({
          eventName: event.eventName,
          eventType: event.eventType,
          startDate: event.startDate.slice(0, 10),
          endDate: event.endDate.slice(0, 10),
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

        if (event.eventCategory === "Indoor" && event.stadiumId) {
          const stadiumRes = await axios.get(`/stadium/${event.stadiumId}`);
          setSelectedStadium(stadiumRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [id]);

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

    const geo = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
    });
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

    try {
      await axios.put(`/event/updateevent/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Event updated successfully!");
      // navigate(`/organizer/viewevent`);
      // navigate(`/stadiumselect?redirectTo=/updateevent/${id}`);
      //  navigate("/organizer/viewmyevent")
       const role = localStorage.getItem("role");
       if (role === "Admin") {
      window.location.href = "/admin#groupbyevent";
        } else {
       window.location.href = "/organizer#viewevent";
     }
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 red text-center">Update Event</h3>
      <form onSubmit={handleSubmit(submitHandler)} className="bg-light p-4 rounded shadow">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Event Category</label>
            <input className="form-control" value={eventCategory} disabled />
          </div>

          {eventCategory === "Indoor" && (
            <>
              <div className="col-md-6 mb-3">
                <label>Choose Stadium</label>
                <button
                 type="button"
                 className="btn btn-outline-primary form-control"
                 onClick={() => {
                 localStorage.setItem("selectedStadium", JSON.stringify(selectedStadium));
                 localStorage.setItem("selectedCategory", eventCategory);
                 navigate(`/stadiumselect?redirectTo=/updateevent/${id}`);
                 }}
                >
                  {selectedStadium ? selectedStadium.name : "Select Stadium"}
                </button>
                {/* <button
                  type="button"
                  className="btn btn-outline-primary form-control"
                  onClick={() => {
                    localStorage.setItem("selectedStadium", JSON.stringify(selectedStadium));
                    localStorage.setItem("selectedCategory", eventCategory);
                    navigate("/stadiumselect");
                  }}
                >
                  {selectedStadium ? selectedStadium.name : "Select Stadium"}
                </button> */}
              </div>
              <input type="hidden" {...register("stadiumId", { required: true })} />
              <input type="hidden" {...register("latitude")} />
              <input type="hidden" {...register("longitude")} />
              <input type="hidden" {...register("numberOfSeats")} />
            </>
          )}

          {eventCategory === "Outdoor" && (
            <>
              <div className="col-md-6 mb-3">
                <label>State</label>
                <select className="form-control" {...register("stateId")}> 
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>{state.Name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label>City</label>
                <select className="form-control" {...register("cityId")}> 
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-12 mb-3">
                <label>Location on Map</label>
                <div ref={mapContainer} style={{ height: "300px", border: "1px solid #ccc", borderRadius: "8px" }} />
              </div>
            </>
          )}

          {eventCategory === "ZoomMeeting" && (
            <div className="col-md-12 mb-3">
              <label>Zoom URL</label>
              <input type="url" className="form-control" {...register("zoomUrl")}/>
            </div>
          )}

          <div className="col-md-6 mb-3">
            <label>Event Name</label>
            <input type="text" className="form-control" {...register("eventName")}/>
          </div>

          <div className="col-md-6 mb-3">
            <label>Event Type</label>
            <select className="form-control" {...register("eventType")}>
              <option value="">Select Type</option>
              <option value="Conference">Conference</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Gala Dinner">Gala Dinner</option>
              <option value="Incentive">Incentive</option>
              <option value="Music consert">Music consert</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label>Total Seats</label>
            <input type="number" className="form-control" {...register("numberOfSeats")} disabled={eventCategory === "Indoor"} />
          </div>

          <div className="col-md-6 mb-3">
            <label>Start Date</label>
            <input type="date" className="form-control" {...register("startDate")} />
          </div>

          <div className="col-md-6 mb-3">
            <label>End Date</label>
            <input type="date" className="form-control" {...register("endDate")} />
          </div>

          <div className="col-md-6 mb-3">
            <label>Event Image</label>
            <input type="file" className="form-control" {...register("image")} />
          </div>

          <div className="col-md-12 text-center mt-4">
            <button type="submit" className="btn btn-primary">Update Event</button>
          </div>
        </div>
      </form>
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
// import { useNavigate, useParams } from "react-router-dom";

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// export const UpdateEvent = () => {
//   const { id } = useParams();
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(72.8777);
//   const [lat, setLat] = useState(19.076);
//   const [zoom] = useState(10);

//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [eventCategory, setEventCategory] = useState("");
//   const [selectedStadium, setSelectedStadium] = useState(null);

//   const { register, handleSubmit, setValue } = useForm();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     axios.get("/state/getallstates").then((r) => setStates(r.data.data));
//     axios.get("/city/getallcitys").then((r) => setCities(r.data.data));
//   }, []);

//   useEffect(() => {
//     const fetchEventData = async () => {
//       try {
//         const res = await axios.get(`/event/geteventbyid/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const event = res.data.data;
//         setEventCategory(event.eventCategory);
//         setValue("eventName", event.eventName);
//         setValue("eventType", event.eventType);
//         setValue("startDate", event.startDate.slice(0, 10));
//         setValue("endDate", event.endDate.slice(0, 10));
//         setValue("numberOfSeats", event.numberOfSeats);

//         if (event.eventCategory === "ZoomMeeting") {
//           setValue("zoomUrl", event.zoomUrl);
//         }

//         if (event.eventCategory === "Outdoor") {
//           setValue("stateId", event.stateId);
//           setValue("cityId", event.cityId);
//           setValue("latitude", event.latitude);
//           setValue("longitude", event.longitude);
//           setLat(event.latitude);
//           setLng(event.longitude);
//         }

//         if (event.eventCategory === "Indoor" && event.stadiumId) {
//           const stadiumRes = await axios.get(`/stadium/${event.stadiumId}`);
//           setSelectedStadium(stadiumRes.data.data);
//           setValue("stadiumId", stadiumRes.data.data._id);
//         }
//       } catch (error) {
//         console.error("Error fetching event data:", error);
//       }
//     };

//     fetchEventData();
//   }, [id]);

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

//     const geo = new MapboxGeocoder({
//       accessToken: mapboxgl.accessToken,
//       mapboxgl,
//     });
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

//     try {
//       await axios.put(`/event/updateevent/${eventId}`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       alert("Event updated successfully!");
//       navigate("/organizer");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update event.");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4 text-center">Update Event</h2>
//       <form onSubmit={handleSubmit(submitHandler)} className="bg-light p-4 rounded shadow">
//         <div className="row">
//           <div className="col-md-6 mb-3">
//             <label>Event Category</label>
//             <input className="form-control" value={eventCategory} disabled />
//           </div>

//           {eventCategory === "Indoor" && selectedStadium && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>Stadium</label>
//                 <input className="form-control" value={selectedStadium.name} disabled />
//               </div>
//               <input type="hidden" {...register("stadiumId")}/>
//               <input type="hidden" {...register("latitude")} />
//               <input type="hidden" {...register("longitude")} />
//             </>
//           )}

//           {eventCategory === "Outdoor" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>State</label>
//                 <select className="form-control" {...register("stateId")}> 
//                   {states.map((state) => (
//                     <option key={state._id} value={state._id}>{state.Name}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label>City</label>
//                 <select className="form-control" {...register("cityId")}> 
//                   {cities.map((city) => (
//                     <option key={city._id} value={city._id}>{city.name}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-12 mb-3">
//                 <label>Location on Map</label>
//                 <div ref={mapContainer} style={{ height: "300px", border: "1px solid #ccc", borderRadius: "8px" }} />
//               </div>
//             </>
//           )}

//           {eventCategory === "ZoomMeeting" && (
//             <div className="col-md-12 mb-3">
//               <label>Zoom URL</label>
//               <input type="url" className="form-control" {...register("zoomUrl")}/>
//             </div>
//           )}

//           <div className="col-md-6 mb-3">
//             <label>Event Name</label>
//             <input type="text" className="form-control" {...register("eventName")}/>
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Event Type</label>
//             <select className="form-control" {...register("eventType")}>
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
//             <input type="number" className="form-control" {...register("numberOfSeats")} disabled={eventCategory === "Indoor"} />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Start Date</label>
//             <input type="date" className="form-control" {...register("startDate")} />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>End Date</label>
//             <input type="date" className="form-control" {...register("endDate")} />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Event Image</label>
//             <input type="file" className="form-control" {...register("image")} />
//           </div>

//           <div className="col-md-12 text-center mt-4">
//             <button type="submit" className="btn btn-primary">Update Event</button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };


// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { Link, useNavigate, useParams } from 'react-router-dom'

// export const UpdateEvent = () => {
//   const [states, setStates] = useState([])
//   const [cities, setCities] = useState([])
//   const navigate = useNavigate()
//   const { id } = useParams()

//   const { register, handleSubmit, reset } = useForm()

//   const getAllStates = async () => {
//     const res = await axios.get("/state/getallstates")
//     setStates(res.data.data)
//   }

//   const getAllCities = async () => {
//     const res = await axios.get("/city/getallcitys")
//     setCities(res.data.data)
//   }

//   const fetchEventById = async () => {
//     const res = await axios.get(`/event/geteventbyid/${id}`)
//     const event = res.data.data
//     event.startDate = event.startDate?.slice(0, 10)
//     event.endDate = event.endDate?.slice(0, 10)
//     reset(event)
//   }

//   useEffect(() => {
//     getAllStates()
//     getAllCities()
//     fetchEventById()
//   }, [])

//   const submitHandler = async (data) => {
//     const formData = new FormData()
//     formData.append("eventName", data.eventName)
//     formData.append("eventType", data.eventType)
//     formData.append("zoomUrl", data.zoomUrl || "")
//     formData.append("numberOfSeats", data.numberOfSeats)
//     formData.append("stateId", data.stateId)
//     formData.append("cityId", data.cityId)
//     formData.append("location", data.location || "")
//     formData.append("startDate", data.startDate)
//     formData.append("endDate", data.endDate)

//     if (data.image && data.image[0]) {
//       formData.append("image", data.image[0])
//     }

//     try {
//       const res = await axios.put(`/event/updateevent/${id}`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       })
//       alert("Event updated successfully!")
//       navigate("/organizer")
//     } catch (err) {
//       console.error("Update failed:", err)
//       alert("Failed to update event.")
//     }
//   }

//   return (
//     <div className="container my-5">
//       <h2 className="text-center mb-4">Update Event</h2>
//       <div className="card shadow p-4">
//         <form onSubmit={handleSubmit(submitHandler)}>
//           <div className="row">
//             <div className="form-group col-md-6">
//               <label>Event Name</label>
//               <input type="text" className="form-control" {...register("eventName")} required />
//             </div>
//             <div className="form-group col-md-6">
//               <label>Event Type</label>
//               <select className="form-control" {...register("eventType")} required>
//                 <option value="">Select Type</option>
//                 <option value="Conference">Conference</option>
//                 <option value="Exhibition">Exhibition</option>
//                 <option value="Gala Dinner">Gala Dinner</option>
//                 <option value="Incentive">Incentive</option>
//                 <option value="ZoomMeeting">Zoom Meeting</option>
//                 <option value="Music Consert">Music Concert</option>
//                 <option value="Meeting">Meeting</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             <div className="form-group col-md-6">
//               <label>Zoom URL</label>
//               <input type="text" className="form-control" {...register("zoomUrl")} />
//             </div>
//             <div className="form-group col-md-6">
//               <label>Number of Seats</label>
//               <input type="number" className="form-control" {...register("numberOfSeats")} required />
//             </div>

//             <div className="form-group col-md-6">
//               <label>State</label>
//               <select className="form-control" {...register("stateId")} required>
//                 <option value="">Select State</option>
//                 {states.map(state => (
//                   <option key={state._id} value={state._id}>{state.Name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="form-group col-md-6">
//               <label>City</label>
//               <select className="form-control" {...register("cityId")} required>
//                 <option value="">Select City</option>
//                 {cities.map(city => (
//                   <option key={city._id} value={city._id}>{city.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group col-md-12">
//               <label>Location Link</label>
//               <input type="text" className="form-control" {...register("location")} />
//             </div>

//             <div className="form-group col-md-6">
//               <label>Start Date</label>
//               <input type="date" className="form-control" {...register("startDate")} required />
//             </div>
//             <div className="form-group col-md-6">
//               <label>End Date</label>
//               <input type="date" className="form-control" {...register("endDate")} required />
//             </div>

//             <div className="form-group col-md-12">
//               <label>Upload Image</label>
//               <input type="file" className="form-control" {...register("image")} />
//             </div>
//           </div>

//           <div className="text-center mt-4">
//             <button type="submit" className="btn btn-success">Update Event</button>
//             <Link to="/organizer" className="btn btn-secondary ml-3">Back</Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }


