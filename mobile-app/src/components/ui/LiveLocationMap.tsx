import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { ShieldAlert, Loader } from 'lucide-react-native';

interface LiveLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading?: number | null;
  history?: { lat: number; lng: number }[];
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  latitude,
  longitude,
  accuracy,
  heading,
  history = [],
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const hasLocation = latitude != null && longitude != null;
  const displayLat = hasLocation ? latitude : 18.5204;
  const displayLng = hasLocation ? longitude : 73.8567;
  const displayAcc = accuracy || 30;

  // Use Leaflet for a highly reliable, API-key-free map using OpenStreetMap
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; }
          html, body, #map { height: 100%; width: 100%; background: #0f172a; }
          .pulse-marker {
            width: 24px;
            height: 24px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${displayLat}, ${displayLng}], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          const customIcon = L.divIcon({ className: 'pulse-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
          const marker = L.marker([${displayLat}, ${displayLng}], { icon: customIcon }).addTo(map);
          const circle = L.circle([${displayLat}, ${displayLng}], {
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            radius: ${displayAcc}
          }).addTo(map);

          window.updateLocation = function(lat, lng, acc) {
            const newLatLng = new L.LatLng(lat, lng);
            marker.setLatLng(newLatLng);
            circle.setLatLng(newLatLng);
            circle.setRadius(acc);
            map.panTo(newLatLng);
          };
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    if (mapLoaded && hasLocation && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updateLocation) {
          window.updateLocation(${latitude}, ${longitude}, ${accuracy || 30});
        }
        true;
      `);
    }
  }, [latitude, longitude, accuracy, mapLoaded, hasLocation]);

  return (
    <View className="flex-1 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900">
      {!hasLocation && (
        <View className="absolute inset-0 z-50 bg-white/70 dark:bg-slate-950/70 items-center justify-center">
          <View className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl items-center border border-slate-200 dark:border-slate-800 w-[80%]">
            <Loader size={40} color="#3b82f6" className="animate-spin mb-4" />
            <Text className="text-slate-900 dark:text-white font-black text-lg mb-1 tracking-tight">
              WAITING FOR SIGNAL
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
              Acquiring GPS Lock
            </Text>
          </View>
        </View>
      )}

      {hasLocation && (
        <View className="absolute top-4 left-4 z-40 bg-white/90 dark:bg-slate-900/90 px-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex-row items-center gap-2">
          <Animated.View
            style={{
              opacity: pulseAnim,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#10b981',
            }}
          />
          <Text className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Live Tracking
          </Text>
        </View>
      )}

      {hasLocation && accuracy != null && (
        <View className="absolute top-4 right-4 z-40 bg-white/90 dark:bg-slate-900/90 px-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex-row items-center gap-2">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#3b82f6',
            }}
          />
          <Text className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
            ±{Math.round(accuracy)}m
          </Text>
        </View>
      )}

      {/* Fallback to simple view on Web until we build a dedicated web component, but we are primarily fixing Android */}
      {Platform.OS === 'web' ? (
        <View className="flex-1 items-center justify-center bg-slate-200 dark:bg-slate-800">
           <Text className="font-bold text-slate-500">Map available on Mobile</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: leafletHTML }}
          style={StyleSheet.absoluteFillObject}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onLoadEnd={() => setMapLoaded(true)}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

