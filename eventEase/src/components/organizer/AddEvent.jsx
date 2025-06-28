import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
      setSelectedStadium(parsed);
      setValue("stadiumId", parsed._id);
      setValue("latitude", parsed.location.latitude);
      setValue("longitude", parsed.location.longitude);
      setValue("numberOfSeats", parsed.totalSeats);

      localStorage.removeItem("selectedStadium");
    }
  }, []);

  useEffect(() => {
    if (
      !mapContainer.current ||
      map.current ||
      eventCategory === "ZoomMeeting" ||
      (eventCategory === "Indoor" && selectedStadium)
    )
      return;

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

  const [myEvents, setMyEvents] = useState([]);

const fetchMyEvents = async () => {
  try {
    const res = await axios.get(`/event/geteventbyorganizerid`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    setMyEvents(res.data.data);
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

useEffect(() => {
  fetchMyEvents();
}, []);


  const submitHandler = async (data) => {
    const formData = new FormData();
    for (const [k, v] of Object.entries(data)) {
      formData.append(k, k === "image" ? v[0] : v);
    }

    try {
      await axios.post("/event/addeventwithfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Event added successfully!");
      //  window.location.href = "/organizer#addevent";
       fetchMyEvents();  // ← refresh the list
        

    } catch (err) {
      console.error(err);
      alert("Failed to add event.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Add Event</h2>
      <form onSubmit={handleSubmit(submitHandler)} className="bg-light p-4 rounded shadow">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Event Category</label>
            <select
              className="form-control"
              {...register("eventCategory", { required: true })}
              value={eventCategory}
              onChange={(e) => {
                setEventCategory(e.target.value);
                setSelectedStadium(null);
              }}
            >
              <option value="">Select Category</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="ZoomMeeting">Zoom Meeting</option>
            </select>
          </div>

          {eventCategory === "Indoor" && (
            <>
              <div className="col-md-6 mb-3">
                <label>Choose Stadium</label>
                <button
                  type="button"
                  className="btn btn-outline-primary form-control"
                  onClick={() => navigate("/stadiumselect")}
                >
                  {selectedStadium ? selectedStadium.name : "Select Stadium"}
                </button>
              </div>

              {selectedStadium && (
                <>
                  <input type="hidden" {...register("stadiumId", { required: true })} value={selectedStadium._id} />
                  <input type="hidden" {...register("latitude")} value={selectedStadium.location.latitude} />
                  <input type="hidden" {...register("longitude")} value={selectedStadium.location.longitude} />

                  <div className="col-md-12 mb-4">
                    <div className="card shadow border-0">
                      {selectedStadium.imageUrl && (
                        <img
                          src={selectedStadium.imageUrl}
                          className="card-img-top"
                          alt={selectedStadium.name}
                          style={{ height: "250px", objectFit: "cover" }}
                        />
                      )}
                      <div className="card-body">
                        <h4>{selectedStadium.name}</h4>
                        <p>Location: {selectedStadium.location.address}</p>
                        <p>Total Seats: {selectedStadium.totalSeats}</p>

                        <div className="accordion" id="zoneAccordion">
                          {selectedStadium.zones.map((zone, i) => (
                            <div className="accordion-item" key={i}>
                              <h2 className="accordion-header" id={`heading${i}`}>
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse${i}`}
                                >
                                  Zone {String.fromCharCode(65 + i)} — ₹{zone.price}
                                </button>
                              </h2>
                              <div
                                id={`collapse${i}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading${i}`}
                                data-bs-parent="#zoneAccordion"
                              >
                                <div className="accordion-body">
                                  <div className="d-flex flex-wrap gap-2">
                                    {zone.seatLabels.map((label, index) => (
                                      <span key={index} className="badge bg-secondary">
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {eventCategory === "Outdoor" && (
            <>
              <div className="col-md-6 mb-3">
                <label>State</label>
                <select className="form-control" {...register("stateId", { required: true })}>
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label>City</label>
                <select className="form-control" {...register("cityId", { required: true })}>
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-12 mb-3">
                <label>Location on Map</label>
                <div
                  ref={mapContainer}
                  style={{
                    height: "300px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <input type="hidden" {...register("latitude")} />
                <input type="hidden" {...register("longitude")} />
              </div>
            </>
          )}

          {eventCategory === "ZoomMeeting" && (
            <div className="col-md-12 mb-3">
              <label>Zoom Meeting URL</label>
              <input
                type="url"
                className="form-control"
                {...register("zoomUrl", { required: true })}
              />
            </div>
          )}

          {/* Common Fields */}
          <div className="col-md-6 mb-3">
            <label>Event Name</label>
            <input
              type="text"
              className="form-control"
              {...register("eventName", { required: true })}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Event Type</label>
            <select className="form-control" {...register("eventType", { required: true })}>
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
  <input
    type="number"
    className="form-control"
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


          {/* <div className="col-md-6 mb-3">
            <label>Total Seats</label>
            <input
              type="number"
              className="form-control"
              {...register("numberOfSeats", { required: true })}
            />
          </div> */}

          <div className="col-md-6 mb-3">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              {...register("startDate", { required: true })}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              {...register("endDate", { required: true })}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Event Image</label>
            <input
              type="file"
              className="form-control"
              {...register("image", { required: true })}
            />
          </div>

          <div className="col-md-12 text-center mt-4">
            <button type="submit" className="btn btn-primary">
              Add Event
            </button>
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

//   const { register, handleSubmit, watch, setValue } = useForm();
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
//       setSelectedStadium(parsed);
//       setValue("stadiumId", parsed._id);
//       localStorage.removeItem("selectedStadium");
//     }
//   }, []);

//   useEffect(() => {
//     if (!mapContainer.current || map.current || eventCategory === "ZoomMeeting") return;

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
//   }, [eventCategory]);

//   const submitHandler = async (data) => {
//     const formData = new FormData();
//     for (const [k, v] of Object.entries(data)) {
//       formData.append(k, k === "image" ? v[0] : v);
//     }

//     try {
//       await axios.post("/event/addeventwithfile", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       alert("Event added!");
//       navigate("/organizer");
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
//           {/* Event Category */}
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

//           {/* Stadium Selection */}
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
//                 {selectedStadium && (
//                   <input
//                     type="hidden"
//                     value={selectedStadium._id}
//                     {...register("stadiumId", { required: true })}
//                   />
//                 )}
//               </div>

//               {selectedStadium && (
//                 <div className="col-md-12 mb-4">
//                   <div className="card shadow border-0">
//                     {selectedStadium.imageUrl && (
//                       <img
//                         src={selectedStadium.imageUrl}
//                         className="card-img-top"
//                         alt={selectedStadium.name}
//                         style={{ height: "250px", objectFit: "cover" }}
//                       />
//                     )}
//                     <div className="card-body">
//                       <h4 className="card-title">{selectedStadium.name}</h4>
//                       <p className="card-text">Total Seats: {selectedStadium.totalSeats}</p>

//                       <div className="accordion mt-4" id="zoneAccordion">
//                         {selectedStadium.zones.map((zone, index) => (
//                           <div className="accordion-item" key={index}>
//                             <h2 className="accordion-header" id={`heading${index}`}>
//                               <button
//                                 className="accordion-button collapsed"
//                                 type="button"
//                                 data-bs-toggle="collapse"
//                                 data-bs-target={`#collapse${index}`}
//                                 aria-expanded="false"
//                                 aria-controls={`collapse${index}`}
//                               >
//                                 Zone {String.fromCharCode(65 + index)} — ₹{zone.price}
//                               </button>
//                             </h2>
//                             <div
//                               id={`collapse${index}`}
//                               className="accordion-collapse collapse"
//                               aria-labelledby={`heading${index}`}
//                               data-bs-parent="#zoneAccordion"
//                             >
//                               <div className="accordion-body">
//                                 <div className="card">
//                                   <div className="card-body p-2">
//                                     <div className="d-flex flex-wrap gap-2">
//                                       {zone.seatLabels.map((label, i) => (
//                                         <span key={i} className="badge bg-secondary">
//                                           {label}
//                                         </span>
//                                       ))}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}

//           {/* Map and Location */}
//           {eventCategory !== "ZoomMeeting" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>State</label>
//                 <select className="form-control" {...register("stateId", { required: true })}>
//                   <option value="">Select State</option>
//                   {states.map((s) => (
//                     <option key={s._id} value={s._id}>
//                       {s.Name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label>City</label>
//                 <select className="form-control" {...register("cityId", { required: true })}>
//                   <option value="">Select City</option>
//                   {cities.map((c) => (
//                     <option key={c._id} value={c._id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-12 mb-3">
//                 <label>Location on Map</label>
//                 <div
//                   ref={mapContainer}
//                   style={{
//                     height: "300px",
//                     border: "1px solid #ccc",
//                     borderRadius: "8px",
//                   }}
//                 />
//                 <input type="hidden" {...register("latitude")} />
//                 <input type="hidden" {...register("longitude")} />
//               </div>
//             </>
//           )}

//           {/* Zoom URL */}
//           {eventCategory === "ZoomMeeting" && (
//             <div className="col-md-12 mb-3">
//               <label>Zoom Meeting URL</label>
//               <input
//                 type="url"
//                 className="form-control"
//                 {...register("zoomUrl", { required: true })}
//               />
//             </div>
//           )}

//           {/* Common Fields */}
//           <div className="col-md-6 mb-3">
//             <label>Event Name</label>
//             <input
//               type="text"
//               className="form-control"
//               {...register("eventName", { required: true })}
//             />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>Upload Image</label>
//             <input
//               type="file"
//               className="form-control"
//               {...register("image", { required: true })}
//             />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>Start Date</label>
//             <input
//               type="date"
//               className="form-control"
//               {...register("startDate", { required: true })}
//             />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>End Date</label>
//             <input
//               type="date"
//               className="form-control"
//               {...register("endDate", { required: true })}
//             />
//           </div>

//           <div className="col-md-12 text-center">
//             <button type="submit" className="btn btn-primary mt-3">
//               Add Event
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };




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
//   const [stadiums, setStadiums] = useState([]);
//   const [selectedStadium, setSelectedStadium] = useState(null);

//   const { register, handleSubmit, watch, setValue } = useForm();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     axios.get("/state/getallstates").then((r) => setStates(r.data.data));
//     axios.get("/city/getallcitys").then((r) => setCities(r.data.data));
//   }, []);

//   useEffect(() => {
//     if (eventCategory === "Indoor") {
//       axios
//         .get("/admin/stadiums", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then((res) => setStadiums(res.data));
//     }
//   }, [eventCategory]);

//   const stadiumId = watch("stadiumId");
//   useEffect(() => {
//     setSelectedStadium(stadiums.find((s) => s._id === stadiumId) || null);
//   }, [stadiums, stadiumId]);

//   useEffect(() => {
//     if (!mapContainer.current || map.current || eventCategory === "ZoomMeeting")
//       return;

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
//   }, [eventCategory]);

//   const submitHandler = async (data) => {
//     const formData = new FormData();
//     for (const [k, v] of Object.entries(data)) {
//       formData.append(k, k === "image" ? v[0] : v);
//     }
//     if (eventCategory === "Indoor") {
//       formData.append("stadiumId", data.stadiumId);
//     }

//     try {
//       await axios.post("/event/addeventwithfile", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       alert("Event added!");
//       navigate("/organizer");
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

//           {/* Event Category */}
//           <div className="col-md-6 mb-3">
//             <label>Event Category</label>
//             <select
//               className="form-control"
//               {...register("eventCategory", { required: true })}
//               onChange={(e) => setEventCategory(e.target.value)}
//             >
//               <option value="">Select Category</option>
//               <option value="Indoor">Indoor</option>
//               <option value="Outdoor">Outdoor</option>
//               <option value="ZoomMeeting">Zoom Meeting</option>
//             </select>
//           </div>

//           {/* Stadium Selection for Indoor */}
//           {eventCategory === "Indoor" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>Choose Stadium</label>
//                 <select
//                   className="form-control"
//                   {...register("stadiumId", { required: true })}
//                 >
//                   <option value="">Select Stadium</option>
//                   {stadiums.map((s) => (
//                     <option key={s._id} value={s._id}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedStadium && (
//                 <div className="col-md-12 mb-4">
//                   <div className="card shadow border-0">
//                     {selectedStadium.imageUrl && (
//                       <img
//                         src={selectedStadium.imageUrl}
//                         className="card-img-top"
//                         alt={selectedStadium.name}
//                         style={{ height: "250px", objectFit: "cover" }}
//                       />
//                     )}
//                     <div className="card-body">
//                       <h4 className="card-title">{selectedStadium.name}</h4>
//                       <p className="card-text">Total Seats: {selectedStadium.totalSeats}</p>
//                       <div className="card-text">
//                         <h5>Zones</h5>
//                         {selectedStadium.zones.map((zone, index) => (
//                           <div key={index} className="mb-3">
//                             <h6>
//                               Zone {String.fromCharCode(65 + index)} - ₹{zone.price}
//                             </h6>
//                             <div className="d-flex flex-wrap gap-2">
//                               {zone.seatLabels.map((label, i) => (
//                                 <span key={i} className="badge bg-secondary">{label}</span>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}

//           {/* Location: only for non-Zoom */}
//           {eventCategory !== "ZoomMeeting" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>State</label>
//                 <select
//                   className="form-control"
//                   {...register("stateId", { required: true })}
//                 >
//                   <option value="">Select State</option>
//                   {states.map((s) => (
//                     <option key={s._id} value={s._id}>
//                       {s.Name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label>City</label>
//                 <select
//                   className="form-control"
//                   {...register("cityId", { required: true })}
//                 >
//                   <option value="">Select City</option>
//                   {cities.map((c) => (
//                     <option key={c._id} value={c._id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-12 mb-3">
//                 <label>Location on Map</label>
//                 <div
//                   ref={mapContainer}
//                   style={{
//                     height: "300px",
//                     border: "1px solid #ccc",
//                     borderRadius: "8px",
//                   }}
//                 />
//                 <input type="hidden" {...register("latitude")} />
//                 <input type="hidden" {...register("longitude")} />
//               </div>
//             </>
//           )}

//           {/* Zoom Meeting URL */}
//           {eventCategory === "ZoomMeeting" && (
//             <div className="col-md-12 mb-3">
//               <label>Zoom Meeting URL</label>
//               <input
//                 type="url"
//                 className="form-control"
//                 {...register("zoomUrl", { required: true })}
//               />
//             </div>
//           )}

//           {/* Common Fields */}
//           <div className="col-md-6 mb-3">
//             <label>Event Name</label>
//             <input
//               type="text"
//               className="form-control"
//               {...register("eventName", { required: true })}
//             />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>Upload Image</label>
//             <input
//               type="file"
//               className="form-control"
//               {...register("image", { required: true })}
//             />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>Start Date</label>
//             <input
//               type="date"
//               className="form-control"
//               {...register("startDate", { required: true })}
//             />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>End Date</label>
//             <input
//               type="date"
//               className="form-control"
//               {...register("endDate", { required: true })}
//             />
//           </div>

//           <div className="col-md-12 text-center">
//             <button type="submit" className="btn btn-primary mt-3">
//               Add Event
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };


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
//   const [lat, setLat] = useState(19.0760);
//   const [zoom] = useState(10);

//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [eventCategory, setEventCategory] = useState("");
//   const [stadiums, setStadiums] = useState([]);
//   const [selectedStadium, setSelectedStadium] = useState(null);

//   const { register, handleSubmit, watch, setValue } = useForm();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   // Fetch states & cities
//   useEffect(() => {
//     axios.get("/state/getallstates").then(r => setStates(r.data.data));
//     axios.get("/city/getallcitys").then(r => setCities(r.data.data));
//   }, []);

//   // Fetch stadiums when category is Indoor
//   useEffect(() => {
//     if (eventCategory === "Indoor") {
//       axios.get("/admin/stadiums", {
//         headers: { Authorization: `Bearer ${token}` }
//       }).then(res => setStadiums(res.data));
//     }
//   }, [eventCategory]);

//   // When stadiumId changes, find selected stadium
//   const stadiumId = watch("stadiumId");
//   useEffect(() => {
//     setSelectedStadium(stadiums.find(s => s._id === stadiumId) || null);
//   }, [stadiums, stadiumId]);

//   // Initialize map only if category is not ZoomMeeting
//   useEffect(() => {
//     if (!mapContainer.current || map.current || eventCategory === "ZoomMeeting") return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/streets-v11",
//       center: [lng, lat],
//       zoom
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
//     geo.on("result", e => {
//       const [lng2, lat2] = e.result.center;
//       setLng(lng2);
//       setLat(lat2);
//       setValue("latitude", lat2);
//       setValue("longitude", lng2);
//       marker.setLngLat([lng2, lat2]);
//     });
//   }, [eventCategory]);

//   const submitHandler = async data => {
//     const formData = new FormData();
//     for (const [k, v] of Object.entries(data)) {
//       formData.append(k, k === "image" ? v[0] : v);
//     }
//     if (eventCategory === "Indoor") {
//       formData.append("stadiumId", data.stadiumId);
//     }

//     try {
//       await axios.post("/event/addeventwithfile", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`
//         }
//       });
//       alert("Event added!");
//       navigate("/organizer");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add event.");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Add Event</h2>
//       <form onSubmit={handleSubmit(submitHandler)} className="bg-light p-4 rounded">
//         <div className="row">
//           {/* Category selection */}
//           <div className="col-md-6 mb-3">
//             <label>Event Category</label>
//             <select className="form-control" {...register("eventCategory", { required: true })}
//               onChange={(e) => {
//                 setEventCategory(e.target.value);
//               }}>
//               <option value="">Select Category</option>
//               <option value="Indoor">Indoor</option>
//               <option value="Outdoor">Outdoor</option>
//               <option value="ZoomMeeting">Zoom Meeting</option>
//             </select>
//           </div>

//           {/* Stadium Selection */}
//           {eventCategory === "Indoor" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>Choose Stadium</label>
//                 <select className="form-control" {...register("stadiumId", { required: true })}>
//                   <option>Select stadium</option>
//                   {stadiums.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//                 </select>
//               </div>
//               {selectedStadium && (
//                 <div className="col-md-12">
//                   <h5>Stadium: {selectedStadium.name}</h5>
//                   <p>Total Seats: {selectedStadium.totalSeats}</p>
//                   {selectedStadium.zones.map((zone, index) => (
//                     <div key={index}>
//                       <strong>Zone {String.fromCharCode(65 + index)} - ₹{zone.price}</strong>
//                       <div className="d-flex flex-wrap gap-2 mb-2">
//                         {zone.seatLabels.map((label, i) => (
//                           <span key={i} className="badge bg-secondary">{label}</span>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {/* Location selection (Only for non-Zoom) */}
//           {eventCategory !== "ZoomMeeting" && (
//             <>
//               <div className="col-md-6 mb-3">
//                 <label>State</label>
//                 <select className="form-control" {...register("stateId", { required: true })}>
//                   <option>Select State</option>
//                   {states.map(s => <option key={s._id} value={s._id}>{s.Name}</option>)}
//                 </select>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label>City</label>
//                 <select className="form-control" {...register("cityId", { required: true })}>
//                   <option>Select City</option>
//                   {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </select>
//               </div>
//               <div className="col-md-12 mb-3">
//                 <label>Location on Map</label>
//                 <div ref={mapContainer} style={{ height: "300px", border: "1px solid #ccc", borderRadius: "8px" }} />
//                 <input type="hidden" {...register("latitude")} />
//                 <input type="hidden" {...register("longitude")} />
//               </div>
//             </>
//           )}

//           {/* Zoom URL */}
//           {eventCategory === "ZoomMeeting" && (
//             <div className="col-md-12 mb-3">
//               <label>Zoom Meeting URL</label>
//               <input type="url" className="form-control" {...register("zoomUrl", { required: true })} />
//             </div>
//           )}

//           {/* Common Fields */}
//           <div className="col-md-6 mb-3">
//             <label>Event Name</label>
//             <input type="text" className="form-control" {...register("eventName", { required: true })} />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>Upload Image</label>
//             <input type="file" className="form-control" {...register("image", { required: true })} />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>Start Date</label>
//             <input type="date" className="form-control" {...register("startDate", { required: true })} />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>End Date</label>
//             <input type="date" className="form-control" {...register("endDate", { required: true })} />
//           </div>
//           <div className="col-md-12 text-center">
//             <button type="submit" className="btn btn-primary mt-3">Add Event</button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };







// import React, { useEffect, useRef, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
// import axios from 'axios';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// export const AddEvent = () => {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(72.8777);
//   const [lat, setLat] = useState(19.0760);
//   const [zoom] = useState(10);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [eventCategory, setEventCategory] = useState("");
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [totalSeats, setTotalSeats] = useState(100);
//   const { register, handleSubmit, setValue, watch } = useForm();
//   const navigate = useNavigate();

//   const getAllStates = async () => {
//     const res = await axios.get('/state/getallstates');
//     setStates(res.data.data);
//   };

//   const getAllCities = async () => {
//     const res = await axios.get('/city/getallcitys');
//     setCities(res.data.data);
//   };

//   useEffect(() => {
//     getAllStates();
//     getAllCities();
//   }, []);

//   useEffect(() => {
//     if (map.current) return;
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [lng, lat],
//       zoom: zoom,
//     });
//     const marker = new mapboxgl.Marker({ draggable: true })
//       .setLngLat([lng, lat])
//       .addTo(map.current);
//     marker.on('dragend', () => {
//       const lngLat = marker.getLngLat();
//       setLng(lngLat.lng);
//       setLat(lngLat.lat);
//       setValue("latitude", lngLat.lat);
//       setValue("longitude", lngLat.lng);
//     });
//     setValue("latitude", lat);
//     setValue("longitude", lng);
//     const geocoder = new MapboxGeocoder({
//       accessToken: mapboxgl.accessToken,
//       mapboxgl: mapboxgl,
//       marker: false
//     });
//     map.current.addControl(geocoder);
//     geocoder.on('result', (e) => {
//       const [newLng, newLat] = e.result.center;
//       setLng(newLng);
//       setLat(newLat);
//       setValue("latitude", newLat);
//       setValue("longitude", newLng);
//       marker.setLngLat([newLng, newLat]);
//       map.current.flyTo({ center: [newLng, newLat], zoom: 13 });
//     });
//   }, []);

//   const token = localStorage.getItem("token");

//   const submitHandler = async (data) => {
//     data.selectedSeats = selectedSeats;
//     const formData = new FormData();
//     for (const key in data) {
//       if (key === "image") {
//         formData.append(key, data[key][0]);
//       } else {
//         formData.append(key, data[key]);
//       }
//     }
//     try {
//       const res = await axios.post("/event/addeventwithfile", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       alert("Event added successfully!");
//       navigate("/organizer");
//     } catch (err) {
//       console.error("Event creation failed:", err);
//       alert("Failed to add event");
//     }
//   };

//   const generateSeats = () => {
//     const rows = 20;
//     const cols = 20;
//     const seats = [];
//     for (let r = 0; r < rows; r++) {
//       for (let c = 0; c < cols; c++) {
//         const seatNo = `${String.fromCharCode(65 + r)}${c + 1}`;
//         if (seats.length < totalSeats) seats.push(seatNo);
//       }
//     }
//     return seats;
//   };

//   const toggleSeat = (seat) => {
//     setSelectedSeats((prev) =>
//       prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
//     );
//   };

//   const showZoom = watch("eventCategory") === "ZoomMeeting";
//   const isIndoor = watch("eventCategory") === "Indoor";

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">Add Event</h2>
//       <form onSubmit={handleSubmit(submitHandler)} className="shadow p-4 border rounded bg-light alert alert-primary">
//         <div className="row">
//           <div className="col-md-6 mb-3">
//             <label>Event Name</label>
//             <input type="text" className="form-control" {...register("eventName")} required />
//           </div>
//             <div className="col-md-6 mb-3">
//               <label>Event Type</label>
//               <select className="form-control" {...register("eventType")} required>
//                 <option value="">Select Type</option>
//                 <option value="Conference">Conference</option>
//                 <option value="Exhibition">Exhibition</option>
//                 <option value="Gala Dinner">Gala Dinner</option>
//                 <option value="Incentive">Incentive</option>
//                 <option value="Music Consert">Music Consert</option>
//                 <option value="Meeting">Meeting</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>
//           <div className="col-md-6 mb-3">
//             <label>Event Category</label>
//             <select className="form-control" {...register("eventCategory")}
//               onChange={(e) => setEventCategory(e.target.value)} required>
//               <option value="">Select Type</option>
//               <option value="Indoor">Indoor</option>
//               <option value="Outdoor">Outdoor</option>
//               <option value="ZoomMeeting">Zoom Meeting</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           {showZoom && (
//             <div className="col-md-12 mb-3">
//               <label>Zoom URL</label>
//               <input type="text" className="form-control" {...register("zoomUrl")} />
//             </div>
//           )}

//           <div className="col-md-6 mb-3">
//             <label>Number of Seats</label>
//             <input type="number" className="form-control" {...register("numberOfSeats", {
//               onChange: (e) => setTotalSeats(parseInt(e.target.value))
//             })} required />
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>State</label>
//             <select className="form-control" {...register("stateId")} required>
//               <option value="">Select State</option>
//               {states.map((state) => (
//                 <option key={state._id} value={state._id}>{state.Name}</option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>City</label>
//             <select className="form-control" {...register("cityId")} required>
//               <option value="">Select City</option>
//               {cities.map((city) => (
//                 <option key={city._id} value={city._id}>{city.name}</option>
//               ))}
//             </select>
//           </div>

//           <div className="col-md-6 mb-3">
//             <label>Start Date</label>
//             <input type="date" className="form-control" {...register("startDate")} required />
//           </div>
//           <div className="col-md-6 mb-3">
//             <label>End Date</label>
//             <input type="date" className="form-control" {...register("endDate")} required />
//           </div>

//           <div className="col-md-12 mb-3">
//             <label>Upload Image</label>
//             <input type="file" className="form-control" {...register("image")} required />
//           </div>

//           <input type="hidden" {...register("latitude")} />
//           <input type="hidden" {...register("longitude")} />

//           <div className="col-md-12 mb-4">
//             <label>Select Event Location on Map or Search</label>
//             <div ref={mapContainer} style={{ height: '300px', borderRadius: "10px", border: '1px solid #ccc' }} />
//           </div>

//           {isIndoor && (
//             <div className="col-md-12 mb-3">
//               <label>Select Your Seats (Max {totalSeats})</label>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
//                 {generateSeats().map((seat) => (
//                   <div
//                     key={seat}
//                     onClick={() => toggleSeat(seat)}
//                     style={{
//                       padding: '6px',
//                       borderRadius: '4px',
//                       textAlign: 'center',
//                       cursor: 'pointer',
//                       backgroundColor: selectedSeats.includes(seat) ? '#28a745' : '#eee'
//                     }}
//                   >
//                     {seat}
//                   </div>
//                 ))}
//               </div>
//               <p className="mt-2">Selected Seats: {selectedSeats.join(", ")}</p>
//             </div>
//           )}

//           <div className="col-md-12 text-center">
//             <button type="submit" className="btn btn-primary mt-3">Add Event</button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };









