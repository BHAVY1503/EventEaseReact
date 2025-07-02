import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const UpdateStadium = () => {
  const { id } = useParams(); // stadiumId from route
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [zonePrices, setZonePrices] = useState([]);
  const [zoneCount, setZoneCount] = useState(0);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.0760);

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

        const stadium = res.data.stadium;
        setValue("name", stadium.name);
        setValue("totalSeats", stadium.totalSeats);
        setValue("seatsPerZone", stadium.zones?.[0]?.seatLabels?.length || 20);
        setValue("address", stadium.location.address);
        setValue("latitude", stadium.location.latitude);
        setValue("longitude", stadium.location.longitude);
        setLat(stadium.location.latitude);
        setLng(stadium.location.longitude);
        setZonePrices(stadium.zones.map(z => z.price));
      } catch (err) {
        console.error("Failed to fetch stadium:", err);
        setMessage("❌ Failed to load stadium data.");
      }
    };

    fetchStadium();
  }, [id]);

  useEffect(() => {
    const total = parseInt(totalSeats || 0);
    const perZone = parseInt(seatsPerZone || 20);
    const count = Math.ceil(total / perZone);
    setZoneCount(count);
    setZonePrices(prev =>
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleZonePriceChange = (index, value) => {
    const updated = [...zonePrices];
    updated[index] = value;
    setZonePrices(updated);
  };

  const onSubmit = async (data) => {
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
      await axios.put(`/admin/stadium/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Stadium updated successfully!");
      setTimeout(() => navigate("/admin/stadiums"), 1500); // redirect after update
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update stadium");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Indoor Stadium</h2>
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
          <input type="number" className="form-control" {...register("seatsPerZone")} />
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
          <label>Upload New Image (Optional)</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
        </div>

        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />

        <div className="mb-3">
          <label>Select Location (Drag or Search)</label>
          <div ref={mapContainer} style={{ height: "300px", borderRadius: "10px", border: "1px solid #ccc" }} />
        </div>

        <button type="submit" className="btn btn-success">Update Stadium</button>
      </form>
      {message && <p className="mt-3 fw-bold">{message}</p>}
    </div>
  );
};

export default UpdateStadium;
