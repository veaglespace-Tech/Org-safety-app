import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom pulsating icon
const pulseIcon = new L.DivIcon({
  className: 'custom-pulse-icon',
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #6366f1;
        border-radius: 50%;
        animation: pulse 1.5s infinite ease-in-out;
      "></div>
      <div style="
        position: absolute;
        top: 25%;
        left: 25%;
        width: 50%;
        height: 50%;
        background-color: white;
        border-radius: 50%;
        border: 2px solid #6366f1;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/**
 * ImperativeMarkerController is responsible for updating the marker position
 * using native Leaflet APIs without triggering React re-renders.
 */
const ImperativeMarkerController = ({ lat, lng, accuracy }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const prevPosRef = useRef([lat, lng]);

  useEffect(() => {
    if (!map) return;

    // Initialize marker and accuracy circle on first mount
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
      circleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: '#6366f1',
        fillColor: '#6366f1',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);

      // Initial flyTo
      map.setView([lat, lng], 16);
    }

    return () => {
      // Cleanup on unmount
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    };
  }, [map, lat, lng, accuracy]);

  useEffect(() => {
    // Update position imperatively when lat/lng change
    if (markerRef.current && circleRef.current) {
      const newPos = [lat, lng];
      markerRef.current.setLatLng(newPos);
      circleRef.current.setLatLng(newPos);
      circleRef.current.setRadius(accuracy);

      // Check if distance moved is significant enough to pan the map
      const prevPos = prevPosRef.current;
      const distance = map.distance(L.latLng(prevPos), L.latLng(newPos));
      
      // If moved more than 10 meters, pan smoothly
      if (distance > 10) {
        map.flyTo(newPos, map.getZoom(), { animate: true, duration: 1.2 });
        prevPosRef.current = newPos;
      }
    }
  }, [lat, lng, accuracy, map]);

  return null;
};

const LiveLocationMap = ({ latitude, longitude, accuracy, history = [] }) => {
  if (!latitude || !longitude) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 min-h-[400px] rounded-lg shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium animate-pulse">Acquiring GPS Lock...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Overlay Indicator */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <span className="text-sm font-semibold text-gray-800">Live GPS Tracking</span>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <ImperativeMarkerController lat={latitude} lng={longitude} accuracy={accuracy} />
        
        {/* Breadcrumb Trail */}
        {history.length > 1 && (
          <Polyline 
            positions={history} 
            pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.8, lineJoin: 'round' }} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveLocationMap;
