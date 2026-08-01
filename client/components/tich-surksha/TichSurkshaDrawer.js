"use client";

import React, { useEffect } from "react";
import { X, Shield, Phone, AlertTriangle, MapPin, BellRing } from "lucide-react";

export default function TichSurkshaDrawer({ isOpen, onClose }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-slate-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <Shield size={26} className="fill-rose-300 text-white" />
            <h2 className="text-2xl font-bold tracking-wide">तिची सुरक्षा</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-rose-700 hover:bg-rose-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-slate-50 dark:bg-slate-900/50">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 mb-4 shadow-sm border border-rose-200 dark:border-rose-800/50">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">आपत्कालीन मदत</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm">
              तुम्ही संकटात आहात किंवा तुम्हाला असुरक्षित वाटत असल्यास, खालील पर्यायांचा वापर करून तात्काळ मदत मिळवा.
            </p>
          </div>

          <div className="space-y-4">
            {/* SOS Button */}
            <button className="w-full relative overflow-hidden group bg-rose-600 hover:bg-rose-700 text-white font-bold py-5 px-6 rounded-2xl shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 border border-rose-500">
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -ml-12 w-1/4"></div>
              <BellRing size={24} className="animate-pulse" />
              <span className="text-lg tracking-wide">SOS पाठवा (Send Alert)</span>
            </button>

            {/* Helpline Numbers */}
            <div className="surface-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Helpline Numbers</h4>
              
              <a href="tel:1091" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">Women Helpline</p>
                  <p className="text-xs text-slate-500 font-medium">National toll-free number</p>
                </div>
                <span className="font-black text-blue-600 dark:text-blue-400 text-lg">1091</span>
              </a>

              <a href="tel:112" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-lg text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">Police Control Room</p>
                  <p className="text-xs text-slate-500 font-medium">All emergencies</p>
                </div>
                <span className="font-black text-rose-600 dark:text-rose-400 text-lg">112</span>
              </a>
            </div>

            {/* Location Sharing */}
            <button className="w-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-bold py-4 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-3">
              <MapPin size={20} className="text-emerald-500" />
              <span>Share Live Location</span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
