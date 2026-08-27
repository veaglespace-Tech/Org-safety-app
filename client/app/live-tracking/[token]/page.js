"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';
import { Navigation, PhoneCall, AlertTriangle, User } from 'lucide-react';

// Dynamically import the map to avoid SSR issues with Leaflet's window object
const LiveLocationMap = dynamic(() => import('@/components/ui/LiveLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#FFF0F3]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF2A6D] mb-4"></div>
      <p className="text-[#2A0826] font-black text-sm uppercase tracking-widest animate-pulse">Establishing Satellite Link...</p>
    </div>
  ),
});

// Extract base URL from API URL (e.g. "https://api.example.com/api" -> "https://api.example.com")
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : 'http://localhost:5001';
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || apiBaseUrl;

const LiveTrackingViewer = () => {
  const params = useParams();
  const token = params?.token;
  const socketRef = useRef(null);
  
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_SERVER_URL, {
      path: '/api/socket.io',
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-track', { token });
    });

    socketRef.current.on('location-updated', (data) => {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
      });
      if (data.latitude && data.longitude) {
        setHistory((prev) => [...prev, [data.latitude, data.longitude]]);
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Unable to connect to live tracking server.');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-track', { token });
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#2A0826] font-sans p-4 lg:p-8 max-w-6xl mx-auto space-y-4 pb-12">
      
      {/* Header Banner */}
      <div className="p-5 rounded-3xl text-white flex items-center justify-between shadow-xl bg-gradient-to-r from-[#FF2A6D] via-rose-500 to-[#FF2A6D] animate-pulse border-2 border-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full border border-white/50">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider">LIVE GPS STREAM</h1>
            <p className="text-xs sm:text-sm font-medium opacity-90 tracking-widest uppercase">ID: {token}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
          <span className="text-xs font-bold uppercase tracking-wider">Status</span>
          {isConnected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* The Responsive Grid (Map + Command Panel) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
        
        {/* Left Column: The Map */}
        <div className="lg:col-span-8 mb-4 lg:mb-0">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-80 sm:h-96 lg:h-[600px] w-full relative">
            <LiveLocationMap 
              latitude={location.latitude} 
              longitude={location.longitude} 
              accuracy={location.accuracy} 
              history={history}
            />
          </div>
        </div>

        {/* Right Column: The Command Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. Siren / Alarm Trigger Card */}
          <div className="bg-white border-2 border-[#FF2A6D] rounded-2xl p-4 shadow-md flex flex-col items-center text-center gap-3">
            <div className="bg-[#FFF0F3] p-3 rounded-full text-[#FF2A6D]">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-lg">EMERGENCY SIREN</h3>
              <p className="text-xs text-gray-500 font-medium">Trigger loud alarm on user's device</p>
            </div>
            <button className="w-full px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all bg-[#FF2A6D] text-white shadow-md flex items-center justify-center gap-2 hover:bg-[#E01A4F]">
              <AlertTriangle className="h-4 w-4" />
              PLAY EMERGENCY SIREN
            </button>
          </div>

          {/* 2. User Details Card */}
          <div className="bg-white border-2 border-[#FFCCE1] rounded-3xl p-5 space-y-3 shadow-md">
            <h3 className="font-black text-sm border-b border-[#FFCCE1] pb-2 text-gray-400 uppercase tracking-wider">Tracking Details</h3>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-500 uppercase">Emergency User Phone</span>
              <span className="text-[#FF2A6D]">Registered Device</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-500 uppercase">Last GPS Timestamp</span>
              <span className="text-gray-800">
                {location.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'Waiting for data...'}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-500 uppercase">Accuracy</span>
              <span className="text-gray-800">
                {location.accuracy ? `~${Math.round(location.accuracy)} meters` : 'Unknown'}
              </span>
            </div>
          </div>

          {/* 3. Call 112 Button */}
          <a href="tel:112" className="w-full bg-[#FF2A6D] text-white py-4 rounded-2xl text-center shadow-md flex items-center justify-center space-x-2 text-xs uppercase tracking-wider font-black hover:bg-[#E01A4F] transition-colors">
            <PhoneCall className="h-5 w-5" />
            <span>CALL 112 NATIONAL EMERGENCY</span>
          </a>

          {/* 4. Get Directions (Google Maps) Button */}
          {location.latitude && location.longitude ? (
            <a href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`} target="_blank" rel="noopener noreferrer" className="w-full bg-white border-2 border-[#FFCCE1] text-[#2A0826] py-3 rounded-2xl text-center shadow-sm flex items-center justify-center space-x-2 text-xs font-black hover:bg-gray-50 transition-colors">
              <Navigation className="h-4 w-4 text-[#FF2A6D]" />
              <span>GET DIRECTIONS (GOOGLE MAPS)</span>
            </a>
          ) : (
            <div className="w-full bg-gray-100 border-2 border-gray-200 text-gray-400 py-3 rounded-2xl text-center shadow-sm flex items-center justify-center space-x-2 text-xs font-black cursor-not-allowed">
              <Navigation className="h-4 w-4" />
              <span>WAITING FOR LOCATION...</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LiveTrackingViewer;
