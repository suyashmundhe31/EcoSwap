import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ latitude, longitude, mapType = 'street', height = '300px', title = 'Location' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const containerIdRef = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Set unique ID for the container
    mapRef.current.id = containerIdRef.current;

    // Create new map
    const map = L.map(containerIdRef.current).setView([latitude, longitude], 16);
    mapInstanceRef.current = map;

    // Choose tile layer based on map type
    let tileLayer;
    if (mapType === 'satellite') {
      tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© ESRI World Imagery'
      });
    } else {
      tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });
    }

    tileLayer.addTo(map);

    // Add marker
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`${title}<br>Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, mapType, title]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: height }}
      className="rounded-lg"
    />
  );
};

export default MapComponent;
