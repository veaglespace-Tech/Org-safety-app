import React, { useEffect, useRef } from 'react';
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

// Max trail points to keep in memory
const MAX_TRAIL_POINTS = 200;

/**
 * Get accuracy-based color for the circle overlay
 * Green ≤ 30m, Orange ≤ 100m, Red > 100m
 */
function getAccuracyColor(accuracy) {
  if (accuracy == null) return '#3b82f6';
  if (accuracy <= 30) return '#10b981';   // emerald
  if (accuracy <= 100) return '#f59e0b';  // amber
  return '#f43f5e';                       // rose
}

/**
 * Create a directional marker icon with heading rotation
 * Shows a pulsating dot with an arrow indicating direction of travel
 */
function createMarkerIcon(heading) {
  const rotation = heading != null && !isNaN(heading) ? heading : 0;
  const showArrow = heading != null && !isNaN(heading);

  return new L.DivIcon({
    className: 'custom-pulse-icon',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <!-- Pulse ring -->
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #3b82f6;
          border-radius: 50%;
          animation: livePulse 1.5s infinite ease-in-out;
        "></div>
        <!-- Center dot -->
        <div style="
          position: absolute;
          top: 25%;
          left: 25%;
          width: 50%;
          height: 50%;
          background-color: white;
          border-radius: 50%;
          border: 4px solid #2563eb;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
          z-index: 2;
        "></div>
        ${showArrow ? `
        <!-- Direction arrow -->
        <div style="
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%) rotate(${rotation}deg);
          transform-origin: center 28px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 16px solid #2563eb;
          filter: drop-shadow(0 0 3px rgba(37,99,235,0.6));
          z-index: 3;
        "></div>` : ''}
      </div>
      <style>
        @keyframes livePulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        /* Make map tiles dark mode compatible globally */
        html.dark .leaflet-layer,
        html.dark .leaflet-control-zoom-in,
        html.dark .leaflet-control-zoom-out,
        html.dark .leaflet-control-attribution {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

/**
 * ImperativeMarkerController is responsible for updating the marker position
 * using native Leaflet APIs without triggering React re-renders.
 * Uses smooth CSS transitions for marker movement.
 */
const ImperativeMarkerController = ({ lat, lng, accuracy, heading }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const prevPosRef = useRef([lat, lng]);

  useEffect(() => {
    if (!map) return;

    // Initialize marker and accuracy circle on first mount
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: createMarkerIcon(heading) }).addTo(map);
      
      const color = getAccuracyColor(accuracy);
      circleRef.current = L.circle([lat, lng], {
        radius: accuracy || 30,
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '4 6',
      }).addTo(map);

      // Initial view
      map.setView([lat, lng], 17);
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
  }, [map]); // Only run on map init

  useEffect(() => {
    // Update position imperatively when lat/lng change
    if (markerRef.current && circleRef.current && lat != null && lng != null) {
      const newPos = [lat, lng];

      // Update marker icon with heading rotation
      markerRef.current.setIcon(createMarkerIcon(heading));

      // Smooth transition: Leaflet doesn't natively support CSS transitions on markers,
      // so we use a small animation step
      const currentPos = markerRef.current.getLatLng();
      const steps = 20;
      const stepDuration = 50; // total ~1s animation
      let step = 0;

      const animate = () => {
        step++;
        const t = step / steps; // 0 to 1
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        const interpLat = currentPos.lat + (lat - currentPos.lat) * ease;
        const interpLng = currentPos.lng + (lng - currentPos.lng) * ease;
        
        markerRef.current.setLatLng([interpLat, interpLng]);
        circleRef.current.setLatLng([interpLat, interpLng]);

        if (step < steps) {
          setTimeout(animate, stepDuration);
        }
      };

      // Only animate if the distance is reasonable (not a teleport)
      const distance = map.distance(L.latLng(currentPos), L.latLng(newPos));
      if (distance > 1 && distance < 5000) {
        animate();
      } else {
        markerRef.current.setLatLng(newPos);
        circleRef.current.setLatLng(newPos);
      }

      // Update accuracy circle color and radius
      const color = getAccuracyColor(accuracy);
      circleRef.current.setRadius(accuracy || 30);
      circleRef.current.setStyle({
        color: color,
        fillColor: color,
      });

      // Check if distance moved is significant enough to pan the map
      const prevPos = prevPosRef.current;
      const panDistance = map.distance(L.latLng(prevPos), L.latLng(newPos));
      
      // Use smooth panTo instead of flyTo to prevent jarring zoom-out swoops
      if (panDistance > 5) {
        map.panTo(newPos, { animate: true, duration: 0.8 });
        prevPosRef.current = newPos;
      }
    }
  }, [lat, lng, accuracy, heading, map]);

  return null;
};

const LiveLocationMap = ({ latitude, longitude, accuracy, heading, history = [] }) => {
  // Cap the trail to MAX_TRAIL_POINTS (use the most recent entries)
  const cappedHistory = history.length > MAX_TRAIL_POINTS 
    ? history.slice(-MAX_TRAIL_POINTS) 
    : history;

  const hasLocation = latitude != null && longitude != null;
  // Default to Pune (18.5204, 73.8567) if no location is available yet
  const displayLat = hasLocation ? latitude : 18.5204;
  const displayLng = hasLocation ? longitude : 73.8567;

  return (
    <div className="absolute inset-0 rounded-none sm:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800">
      
      {/* Waiting for Signal Overlay (shows when no location yet) */}
      {!hasLocation && (
        <div className="absolute inset-0 z-[2000] bg-white/40 dark:bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-[90%] text-center border border-slate-200 dark:border-slate-700 transition-transform hover:scale-105">
            <div className="relative flex justify-center items-center mb-6">
              <div className="absolute animate-ping h-20 w-20 rounded-full bg-blue-400 opacity-20"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <div className="absolute h-6 w-6 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
            </div>
            <h3 className="text-slate-900 dark:text-white font-black text-xl mb-2 tracking-tight">WAITING FOR SIGNAL</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Acquiring GPS Lock from Tracker</p>
          </div>
        </div>
      )}

      {/* Overlay Indicator */}
      {hasLocation && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3 transition-all hover:scale-105">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </div>
          <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Live Tracking</span>
        </div>
      )}

      {/* Accuracy Badge */}
      {hasLocation && accuracy != null && (
        <div className="absolute top-4 right-4 z-[1000]">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 ${
            accuracy <= 30 
              ? 'bg-emerald-50/90 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
              : accuracy <= 100 
              ? 'bg-amber-50/90 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/30 text-amber-700 dark:text-amber-400' 
              : 'bg-rose-50/90 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full shadow-lg ${
              accuracy <= 30 ? 'bg-emerald-500 shadow-emerald-500/50' : accuracy <= 100 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-rose-500 shadow-rose-500/50'
            }`}></span>
            ±{Math.round(accuracy)}m
          </div>
        </div>
      )}

      <MapContainer
        center={[displayLat, displayLng]}
        zoom={hasLocation ? 17 : 12}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hasLocation && (
          <ImperativeMarkerController lat={latitude} lng={longitude} accuracy={accuracy} heading={heading} />
        )}
        
        {hasLocation && cappedHistory.length > 1 && (
          <Polyline 
            positions={cappedHistory} 
            pathOptions={{ 
              color: '#3b82f6', 
              weight: 5, 
              opacity: 0.8, 
              lineJoin: 'round',
              lineCap: 'round',
            }} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveLocationMap;
