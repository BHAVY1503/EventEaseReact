import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const AddStadiumForm = () => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [zonePrices, setZonePrices] = useState([]);
  const [zoneCount, setZoneCount] = useState(0);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.0760);

  const { register, handleSubmit, setValue, watch } = useForm();
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
  };

  const handleZonePriceChange = (index, value) => {
    const newPrices = [...zonePrices];
    newPrices[index] = value;
    setZonePrices(newPrices);
  };

  const onSubmit = async (data) => {
    if (!image) return setMessage("Image is required.");

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
      setMessage("✅ Stadium added successfully!");
      return;
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add stadium");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Indoor Stadium</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="shadow p-4 rounded bg-light">
        <div className="mb-3">
          <label>Stadium Name</label>
          <input className="form-control" {...register("name")} required />
        </div>

        <div className="mb-3">
          <label>Total Seats</label>
          <input type="number" className="form-control" {...register("totalSeats")} required />
        </div>

        <div className="mb-3">
          <label>Seats per Zone</label>
          <input type="number" className="form-control" defaultValue={20} {...register("seatsPerZone")} />
        </div>

        {zoneCount > 0 && (
          <div className="mb-3">
            <label>Zone Prices (₹)</label>
            <div className="d-flex flex-wrap gap-3">
              {Array.from({ length: zoneCount }, (_, i) => (
                <div key={i}>
                  <label className="form-label">Zone {String.fromCharCode(65 + i)}</label>
                  <input
                    type="number"
                    className="form-control"
                    value={zonePrices[i] || ""}
                    onChange={(e) => handleZonePriceChange(i, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label>Address</label>
          <input className="form-control" {...register("address")} required />
        </div>

        <div className="mb-3">
          <label>Upload Image</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} required />
        </div>

        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />

        <div className="mb-3">
          <label>Select Location (Drag or Search)</label>
          <div ref={mapContainer} style={{ height: "300px", borderRadius: "10px", border: "1px solid #ccc" }} />
        </div>

        <button type="submit" className="btn btn-primary">Add Stadium</button>
      </form>
      {message && <p className="mt-3 fw-bold">{message}</p>}
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
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(72.8777);
//   const [lat, setLat] = useState(19.0760);

//   const { register, handleSubmit, setValue } = useForm();
//   const token = localStorage.getItem("token");

//   // Initialize map only once
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

//   const onSubmit = async (data) => {
//     if (!image) return setMessage("Image is required.");

//     const formData = new FormData();
//     formData.append("name", data.name);
//     formData.append("totalSeats", data.totalSeats);
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
