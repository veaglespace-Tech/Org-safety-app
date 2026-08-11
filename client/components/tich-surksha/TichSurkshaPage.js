"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTriggerSosMutation, useUpdateSosLocationMutation, useStopSosMutation } from "@/services/api/authApi";
import { AlertTriangle, Shield, Phone, MapPin, Loader2, CheckCircle2, MessageCircle, Mail, RefreshCw, ExternalLink, User, Building2, Info } from "lucide-react";
import { useSelector } from "react-redux";

export default function TichSurkshaPage() {
  const [triggerSos, { isLoading }] = useTriggerSosMutation();
  const [updateSosLocation] = useUpdateSosLocationMutation();
  const [stopSos, { isLoading: isStopping }] = useStopSosMutation();
  
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [isSosActive, setIsSosActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem('isSosActive') === 'true';
      if (active) {
        setIsSosActive(true);
      }
    }
  }, []);

  // Effect to manage SOS interval based on isSosActive state
  useEffect(() => {
    if (isSosActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const sosIntervalMinutes = parseInt(process.env.NEXT_PUBLIC_SOS_INTERVAL_MINUTES) || 1;
      intervalRef.current = setInterval(async () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const liveLoc = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
              try {
                await updateSosLocation({ locationUrl: liveLoc }).unwrap();
              } catch (err) {
                console.error("Failed to send recurring SOS update", err);
              }
            },
            (err) => {
              console.warn("Could not fetch high accuracy interval location", err);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
          );
        }
      }, sosIntervalMinutes * 60 * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSosActive, updateSosLocation]);
  
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  
  const [customEmergencyContact, setCustomEmergencyContact] = useState("");

  useEffect(() => {
    if (user?.emergencyContact) {
      setCustomEmergencyContact(user.emergencyContact);
    }
  }, [user?.emergencyContact]);

  const startHold = () => {
    if (isSosActive || isLoading || isStopping) return;
    setIsHolding(true);
    setHoldProgress(0);

    const holdDuration = 3000;
    const interval = 50;

    progressTimerRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current);
          return 100;
        }
        return prev + (interval / holdDuration) * 100;
      });
    }, interval);

    holdTimerRef.current = setTimeout(() => {
      clearInterval(progressTimerRef.current);
      setIsHolding(false);
      setHoldProgress(0);
      handleSosClick();
    }, holdDuration);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  console.log("USER OBJ IN TICH:", JSON.stringify(user, null, 2));

  const getLocation = () => {
    setLocLoading(true);
    if (!window.isSecureContext) {
      console.warn("Geolocation requires HTTPS. Location will not be attached to SOS alerts on this non-secure connection.");
      setLocLoading(false);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLocLoading(false);
        },
        (error) => {
          console.warn("Location permission denied or unavailable:", error.message || "Unknown error");
          setLocLoading(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } else {
      setLocLoading(false);
    }
  };

  // Get location on initial mount
  useEffect(() => {
    getLocation();
  }, []);

  const handleSosClick = () => {
    try {
      setStatus("success");
      setIsSosActive(true);
      if (typeof window !== "undefined") {
        localStorage.setItem('isSosActive', 'true');
      }

      let locationUrl = "";
      if (location) {
        locationUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      }

      // 1. OPEN WHATSAPP AND DIALER IMMEDIATELY (no await before this to prevent popup blockers)
      const distressMessage = `🚨 EMERGENCY SOS DISTRESS ALERT 🚨

👤 Name: ${user?.name || 'Unknown'}
📧 Email: ${user?.email || 'Unknown'}
📞 Phone: ${user?.phone || 'Not provided'}
🚨 Emergency Contact: ${user?.emergencyContact || 'Not provided'}

📍 LATEST LIVE LOCATION: ${locationUrl || 'Not available'}
`;
      
      const emContactStr = customEmergencyContact ? String(customEmergencyContact) : (user?.emergencyContact ? String(user.emergencyContact) : '');
      const whatsappNumber = emContactStr ? emContactStr.replace(/\D/g, '') : '';
      if (whatsappNumber) {
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(distressMessage)}`;
        window.open(whatsappUrl, '_blank');
      }

      const phoneLink = document.createElement("a");
      phoneLink.href = `tel:${user?.emergencyContact || ''}`;
      phoneLink.click();

      // 2. TRIGGER SOS EMAILS IN BACKGROUND (API CALL)
      (async () => {
        let apiLocationUrl = locationUrl;
        if (!apiLocationUrl && "geolocation" in navigator) {
          try {
            apiLocationUrl = await new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                (position) => resolve(`https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`),
                (err) => resolve(""),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
              );
            });
          } catch (err) {}
        }
        
        try {
          await triggerSos({ locationUrl: apiLocationUrl }).unwrap();
        } catch (error) {
          console.error("SOS trigger failed", error);
          setStatus("error");
        }
      })();

    } catch (error) {
      console.error("Error in handleSosClick", error);
      setStatus("error");
    }
  };

  const handleStopSos = async () => {
    try {
      setIsSosActive(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem('isSosActive');
      }
      setStatus("idle");
      await stopSos().unwrap();
    } catch (err) {
      console.error("Failed to stop SOS", err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-8">
      {/* Three Top Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        
        {/* Left Card: Organization Logo */}
        <div 
          className="col-span-1 md:order-1 bg-white rounded-3xl flex flex-col shadow-lg border border-slate-200/60 min-h-[140px] md:min-h-[220px] overflow-hidden relative transform hover:-translate-y-1 transition-all duration-300"
          style={{ backgroundColor: '#ffffff' }}
        >
          {(user?.organizations?.logo || user?.organization?.logo) ? (
            <img 
              src={user?.organizations?.logo || user?.organization?.logo} 
              alt="Organization Logo" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50 w-full rounded-2xl">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 md:w-20 md:h-20">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M8 11l3 3 4-4"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Center Card: Tichi Surksha Theme */}
        <div className="col-span-2 md:col-span-1 order-last md:order-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.3)] border border-orange-400/50 min-h-[200px] md:min-h-[220px] text-white relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-300/30 rounded-full blur-2xl"></div>

          <div className="bg-orange-50 rounded-full w-24 h-24 md:w-28 md:h-28 mb-3 md:mb-4 flex items-center justify-center overflow-hidden border-4 border-pink-100 shadow-[0_0_20px_rgba(255,255,255,0.4)] relative z-10 transition-transform duration-300 hover:scale-105">
            <img 
              src="/images/tich-surksha-woman.jpg" 
              alt="Tichi Surksha" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 md:mb-2 tracking-wider drop-shadow-md relative z-10 text-black">“तिची सुरक्षा”</h1>
          <p className="text-xs md:text-sm font-bold text-black bg-white/40 px-3 py-1 md:px-4 md:py-1.5 rounded-full mt-1 shadow-inner backdrop-blur-sm border border-white/50 relative z-10">
            तिची सुरक्षा, आपली जबाबदारी
          </p>
        </div>

        {/* Right Card: 112 Police Shield */}
        <div 
          className="col-span-1 md:order-3 bg-white rounded-3xl flex flex-col shadow-lg border border-slate-200/60 min-h-[140px] md:min-h-[220px] overflow-hidden relative transform hover:-translate-y-1 transition-all duration-300 p-3 md:p-4 items-center justify-center"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="w-full h-full relative flex items-center justify-center">
            <img 
              src="/images/police-shield.jpg" 
              alt="112 Maharashtra Emergency Response" 
              className="w-full h-full object-contain max-h-[110px] md:max-h-[180px] mix-blend-multiply"
            />
          </div>
        </div>

      </div>

      {/* Main SOS Dispatch Section */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-rose-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 text-rose-400">
          <div className="flex items-center gap-3">
            <Shield size={20} />
            <h2 className="text-sm font-bold tracking-widest uppercase">Emergency SOS Dispatch</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">WhatsApp To:</span>
            <input 
              type="text" 
              value={customEmergencyContact} 
              onChange={(e) => setCustomEmergencyContact(e.target.value)}
              placeholder="e.g. 919876543210"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 w-36 outline-none focus:border-rose-400"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
          
          {/* Left: Huge SOS Button */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-8">
              {/* Pulse Rings */}
              <div className={`absolute inset-0 rounded-full animate-ping ${isSosActive ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`} style={{ animationDuration: '2s' }}></div>
              <div className={`absolute inset-[-1.5rem] rounded-full animate-ping ${isSosActive ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`} style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
              
              <button
                onMouseDown={!isSosActive ? startHold : undefined}
                onMouseUp={!isSosActive ? cancelHold : undefined}
                onMouseLeave={!isSosActive ? cancelHold : undefined}
                onTouchStart={!isSosActive ? startHold : undefined}
                onTouchEnd={!isSosActive ? cancelHold : undefined}
                onClick={isSosActive ? handleStopSos : undefined}
                className={`relative z-10 w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  isSosActive
                    ? "bg-black border-4 border-rose-600 hover:bg-slate-900 shadow-[0_0_50px_rgba(225,29,72,0.6)] animate-pulse" 
                    : isHolding
                    ? "bg-emerald-700 scale-95 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                    : "bg-emerald-500 hover:bg-emerald-400 hover:scale-105 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                } overflow-hidden`}
              >
                {/* Hold Progress Background Overlay */}
                {!isSosActive && isHolding && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-emerald-900/50 transition-all duration-75" 
                    style={{ height: `${holdProgress}%` }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {isSosActive ? (
                    <>
                      {isLoading || isStopping ? (
                        <Loader2 size={48} className="text-white animate-spin" />
                      ) : (
                        <CheckCircle2 size={48} className="text-rose-500" />
                      )}
                      <span className="text-white font-black text-2xl tracking-widest leading-none mt-2">STOP SOS</span>
                      <span className="text-rose-400 text-xs font-bold tracking-widest uppercase mt-1">CANCEL ALERT</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={40} className="text-white" />
                      <span className="text-white font-black text-3xl tracking-widest leading-none mt-2">
                        {isHolding ? "HOLD..." : "PRESS SOS"}
                      </span>
                      <span className={`${isHolding ? "text-emerald-200" : "text-emerald-100"} text-xs font-bold tracking-widest uppercase mt-1`}>
                        {isHolding ? "KEEP HOLDING" : "Hold for 3s to alert"}
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
              {isSosActive ? `SOS mode is active. Live location updates are being sent to dispatch every ${process.env.NEXT_PUBLIC_SOS_INTERVAL_MINUTES || 5} minutes. Press Stop to cancel.` : "Clicking this button automatically dispatches an emergency email with your live location & details to your Org Admin and Support Team."}
            </p>
            {status === "error" && (
              <p className="text-rose-500 font-bold mt-4 text-sm">Failed to send alert. Use direct channels.</p>
            )}
          </div>

          {/* Right: Direct Channels */}
          <div className="flex-1 w-full max-w-md">
            <div className="flex items-center gap-4 mb-8 w-full">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">Direct Emergency Channels</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Call 112 */}
              <a href="tel:112" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-rose-500/50 hover:bg-rose-500/10 transition-colors group">
                <Phone size={28} className="text-rose-500 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="text-rose-400 font-bold text-sm">CALL 112</div>
                  <div className="text-rose-500/60 text-[10px] uppercase font-bold tracking-wider">Emergency</div>
                </div>
              </a>

              {/* WhatsApp */}
              <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-emerald-500/50 hover:bg-emerald-500/10 transition-colors group">
                <MessageCircle size={28} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="text-emerald-400 font-bold text-sm">WHATSAPP</div>
                  <div className="text-emerald-500/60 text-[10px] uppercase font-bold tracking-wider">Location</div>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:admin@organization.com" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-blue-500/50 hover:bg-blue-500/10 transition-colors group">
                <Mail size={28} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-sm">EMAIL</div>
                  <div className="text-blue-500/60 text-[10px] uppercase font-bold tracking-wider">Alert Admin</div>
                </div>
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Live GPS Location */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2 text-rose-500">
              <MapPin size={18} />
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">Live Real-Time GPS Location</h3>
            </div>
            <button onClick={getLocation} className="text-rose-500 hover:text-rose-400 text-xs flex items-center gap-1 font-bold">
              <RefreshCw size={12} className={locLoading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className={`border rounded-xl p-3 flex items-center justify-between mb-6 relative z-10 transition-colors ${location ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${location ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
              <CheckCircle2 size={16} /> {location ? 'Live Location Locked' : 'Locating...'}
            </div>
            {location && <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">±{location.accuracy.toFixed(0)}m Accuracy</span>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">LATITUDE</div>
              <div className="text-slate-900 dark:text-white font-mono font-bold text-base md:text-lg">{location ? location.lat.toFixed(6) : '---'}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">LONGITUDE</div>
              <div className="text-slate-900 dark:text-white font-mono font-bold text-base md:text-lg">{location ? location.lng.toFixed(6) : '---'}</div>
            </div>
          </div>

          <a href={location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '#'} target={location ? "_blank" : "_self"} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors relative z-10 ${location ? 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}>
            <ExternalLink size={16} /> View Live Map on Google Maps
          </a>
        </div>

        {/* Auto-Filled Profile */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2 text-rose-500">
              <User size={18} />
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">Auto-Filled Profile Information</h3>
            </div>
            <span className="text-emerald-600 dark:text-emerald-500 text-[10px] uppercase font-bold tracking-wider">Verified Profile</span>
          </div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <User size={32} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-lg">{user?.name}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{user?.email}</p>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 inline-flex">
                <Building2 size={12} /> {user?.organization?.name || "Organization"} (ID: {user?.organization_id})
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-500 text-sm">Contact Number:</span>
              <span className="text-slate-900 dark:text-white font-mono">{user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-500 text-sm">Emergency Contact:</span>
              <span className="text-rose-500 dark:text-rose-400 font-mono">{user?.emergencyContact || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-600 dark:text-slate-500 text-sm">System Role:</span>
              <span className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-xs">{user?.role}</span>
            </div>
          </div>
        </div>

      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl mt-6 relative overflow-hidden flex items-start gap-4">
        <Info className="text-blue-500 flex-shrink-0 mt-1" size={24} />
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
            सिस्टम कसे कार्य करते? 
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">(How this feature works)</span>
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li><span className="text-rose-500 font-bold">ऑटो-फील प्रोफाइल:</span> तुमचे नाव, ईमेल, फोन नंबर आणि संस्था (Org Name/ID) आपोआप प्रदर्शित होतात.</li>
            <li><span className="text-rose-500 font-bold">Live GPS Location:</span> Browser Geolocation API द्वारे तुमचे अचूक अक्षांश व रेखांश मिळवून Google Maps लिंक तयार केली जाते.</li>
            <li><span className="text-rose-500 font-bold">तात्काळ ईमेल अलर्ट:</span> SOS बटण दाबल्यावर Nodemailer द्वारे तुमचा लोकेशन Admin ला आणि Support टीमला त्वरित ईमेल पाठवला जातो.</li>
            <li><span className="text-rose-500 font-bold">थेट कॉल व मेसेज:</span> Direct Call व WhatsApp शेअर लिंकद्वारे तुम्ही एका क्लिकवर तुमच्या जवळच्या व्यक्तींना माहिती पाठवू शकता.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
