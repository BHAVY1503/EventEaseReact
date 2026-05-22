// MapPicker.js
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "@/styles/components/MapPicker.css";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const LocationMarker = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

const MapPicker = ({ location, setLocation }) => {
  const handleMapClick = (latlng) => {
    setLocation(latlng);
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center on India
      zoom={5}
      className="map-picker-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onClick={handleMapClick} />
      {location && <Marker position={location} />}
    </MapContainer>
  );
};

export default MapPicker;

