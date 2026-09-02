import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  Shield,
  AlertTriangle,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink,
  User,
  Building2,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { API_BASE_URL, CLIENT_BASE_URL } from '@/config';
import {
  useTriggerSosMutation,
  useUpdateSosLocationMutation,
  useStopSosMutation,
} from '@/services/api/authApi';
import { useAppTheme } from '@/context/ThemeContext';
import { AppFooter } from '@/components/layout/Footer';
import { useGeoLocationTracker } from '@/hooks/useGeoLocationTracker';
import { LiveLocationMap } from '@/components/ui/LiveLocationMap';

export function SOSModule() {
  const { user } = useSelector((state: any) => state.auth);
  const { isDark } = useAppTheme();

  const [triggerSos, { isLoading: isTriggering }] = useTriggerSosMutation();
  const [updateSosLocation] = useUpdateSosLocationMutation();
  const [stopSos, { isLoading: isStopping }] = useStopSosMutation();

  const [isSosActive, setIsSosActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [tapWarning, setTapWarning] = useState<string | null>(null);
  const locationState = useSelector((state: any) => state.location);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  useGeoLocationTracker(trackingToken);

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  // Hold State & Timers (Strict 3-Second Hold)
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);
  const holdCompletedRef = useRef<boolean>(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  const HOLD_DURATION = 3000; // 3.0 Seconds Hold Required
  const INTERVAL_STEP = 50;

  // Fetch Location
  const fetchLocation = async () => {
    setLocLoading(true);
    setLocationErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Location permission denied');
        setLocLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy || 10,
      });
    } catch (err: any) {
      console.warn('Could not fetch location:', err?.message || err);
      setLocationErrorMsg('Could not fetch location');
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLocation();
    }, 0);

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      clearTimeout(timer);
    };
  }, [pulseAnim]);

  // Hold Start / Cancel Handlers
  const startHold = () => {
    if (isSosActive || isTriggering || isStopping) return;
    setTapWarning(null);
    setIsHolding(true);
    setHoldProgress(0);
    holdCompletedRef.current = false;

    const startTime = new Date().getTime();

    progressTimerRef.current = setInterval(() => {
      const elapsed = new Date().getTime() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, INTERVAL_STEP);

    holdTimerRef.current = setTimeout(() => {
      clearInterval(progressTimerRef.current);
      holdCompletedRef.current = true;
      setIsHolding(false);
      setHoldProgress(100);
      handleTriggerSos();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (!isSosActive) {
      // If user released before completing 3 seconds, show friendly warning
      if (isHolding && !holdCompletedRef.current && holdProgress < 95) {
        setTapWarning('Hold for 3 full seconds to activate SOS.');
      }
      setIsHolding(false);
      setHoldProgress(0);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
  };

  // Parse emergency contacts: comma-separated string → clean array of numbers
  const getEmergencyNumbers = (): string[] => {
    const raw = user?.emergencyContact || user?.emergency_contact || '';
    if (!raw) return [];
    return String(raw)
      .split(',')
      .map((n: string) => n.replace(/\D/g, '').trim())
      .filter((n: string) => n.length >= 10 && n.length <= 15);
  };

  // Build WhatsApp message with user details and GPS location
  const buildWhatsAppMessage = (locUrl: string): string => {
    const orgName = user?.organization?.name || user?.organizations?.name || 'Safety Portal';
    return (
      `🚨 *EMERGENCY SOS ALERT* 🚨\n\n` +
      `👤 *Name:* ${user?.name || 'Unknown'}\n` +
      `📱 *Phone:* ${user?.phone || 'N/A'}\n` +
      `🏢 *Organization:* ${orgName}\n\n` +
      `📍 *LIVE TRACKING:*\n${locUrl || 'Location not available'}\n\n` +
      `⚠️ *I need immediate help! Please check on me urgently.*`
    );
  };

  // Direct Emergency Channels Dispatch (WhatsApp)
  const triggerDirectEmergencyChannels = (locUrl: string) => {
    const message = buildWhatsAppMessage(locUrl);

    // 1. WhatsApp Share (Opens contact selector to allow multi-select)
    const waNativeUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const waWebUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    if (Platform.OS === 'web') {
      Linking.openURL(waWebUrl).catch((err) => console.warn('Could not open WhatsApp Web:', err));
    } else {
      Linking.canOpenURL(waNativeUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(waNativeUrl).catch((err) => console.warn('Could not open WhatsApp:', err));
          } else {
            Linking.openURL(waWebUrl).catch((err) => console.warn('Could not open WhatsApp Web:', err));
          }
        })
        .catch((err) => console.warn('Could not open WhatsApp:', err));
        
      // Open the phone dialer for 112 after a brief delay
      setTimeout(() => {
        Linking.openURL('tel:112').catch((err) => console.warn('Could not open Dialer:', err));
      }, 1500);
    }
  };

  // Build Distress Message
  const getDistressMessage = (locUrl: string) => {
    return `🚨 EMERGENCY SOS DISTRESS ALERT 🚨

👤 Name: ${user?.name || 'Unknown'}
📧 Email: ${user?.email || 'Unknown'}
📞 Phone: ${user?.phone || 'Not provided'}
🚨 Emergency Contact: ${user?.emergencyContact || user?.emergency_contact || 'Not provided'}
🏢 Organization: ${user?.organization?.name || user?.organizations?.name || 'Safety Portal'}

📍 LATEST LIVE TRACKING LOCATION:
${locUrl || 'Location coordinates not available'}

⚠️ Immediate emergency assistance requested! Please check immediately.`;
  };

  // SOS Action Triggers (Awakened after 3-second hold)
  const handleTriggerSos = async () => {
    setIsHolding(false);
    setHoldProgress(0);
    setTapWarning(null);

    try {
      setStatus('idle');
      let locUrl = location
        ? `https://maps.google.com/?q=${location.lat},${location.lng}`
        : '';

      if (!locUrl) {
        try {
          // Use last known position for instant fallback if current location state is missing
          const freshLoc = await Location.getLastKnownPositionAsync();
          if (freshLoc) {
            locUrl = `https://maps.google.com/?q=${freshLoc.coords.latitude},${freshLoc.coords.longitude}`;
            setLocation({
              lat: freshLoc.coords.latitude,
              lng: freshLoc.coords.longitude,
              accuracy: freshLoc.coords.accuracy || 10,
            });
          }
        } catch (e) {
          console.warn('Fallback location fetch error:', e);
        }
      }

      setStatus('success');
      setIsSosActive(true);

      const newToken = user?.id ? `sos-${user.id}-${Date.now()}` : `sos-${Date.now()}`;
      setTrackingToken(newToken);
      AsyncStorage.setItem('tracking_token', newToken).catch(console.warn);

      const liveTrackingUrl = `${CLIENT_BASE_URL}/live-tracking/${newToken}`;
      const staticGoogleMapsUrl = locUrl;
      const combinedLocationMessage = `📍 LIVE TRACKING: ${liveTrackingUrl}\n📍 STATIC MAP: ${staticGoogleMapsUrl}`;

      // 1. Automatically launch WhatsApp & Phone Call INSTANTLY (don't wait for backend)
      triggerDirectEmergencyChannels(combinedLocationMessage);

      // 2. Dispatch SOS to backend server in background (Sends automated emails)
      (triggerSos as any)({ locationUrl: liveTrackingUrl || staticGoogleMapsUrl }).unwrap().catch((err: any) => {
        console.warn('Backend SOS trigger failed', err);
      });

      // 3. Setup periodic location email updates (Strictly 2 mins)
      const sosIntervalMinutes = 2;

      trackingIntervalRef.current = setInterval(async () => {
        try {
          let updatedLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          let newLocUrl = `https://maps.google.com/?q=${updatedLoc.coords.latitude},${updatedLoc.coords.longitude}`;
          let updateUrl = liveTrackingUrl || newLocUrl;
          await (updateSosLocation as any)({ locationUrl: updateUrl }).unwrap();
        } catch (e) {
          console.error('Failed to send periodic SOS location update', e);
        }
      }, sosIntervalMinutes * 60 * 1000);
    } catch (err) {
      console.error('SOS Trigger Failed', err);
      setStatus('error');
      const fallbackLocUrl = location
        ? `https://maps.google.com/?q=${location.lat},${location.lng}`
        : '';
      triggerDirectEmergencyChannels(fallbackLocUrl);
    }
  };

  const handleStopSos = async () => {
    try {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      await (stopSos as any)({}).unwrap();
      setIsSosActive(false);
      setTrackingToken(null);
      AsyncStorage.removeItem('tracking_token').catch(console.warn);
      setStatus('idle');
      setTapWarning(null);
      Alert.alert('SOS Deactivated', 'Emergency mode has been cancelled.');
    } catch (err) {
      console.error('Failed to stop SOS', err);
      setIsSosActive(false);
      setStatus('idle');
    }
  };

  // Direct Channel Handlers
  const handleCallEmergency = () => {
    Linking.openURL(`tel:112`);
  };

  const handleWhatsApp = () => {
    const locUrl = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Location coordinates being acquired...';
    const distressMessage = getDistressMessage(locUrl);

    const parentOrEmergency = user?.emergencyContact || user?.emergency_contact;
    const parentNumberStr = parentOrEmergency ? String(parentOrEmergency).replace(/\D/g, '') : '';

    const waUrl = parentNumberStr
      ? `https://wa.me/${parentNumberStr}?text=${encodeURIComponent(distressMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(distressMessage)}`;

    Linking.openURL(waUrl);
  };

  const handleEmailAdmin = () => {
    const orgEmail =
      user?.organization?.email ||
      user?.organizations?.email ||
      'shyamsingare67@gmail.com';
    const locUrl = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Location coordinates unavailable';

    const subject = `🚨 EMERGENCY SOS DISTRESS: ${user?.name || 'Member'}`;
    const body = getDistressMessage(locUrl);

    Linking.openURL(
      `mailto:${orgEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  };

  const orgLogo = user?.organization?.logo || user?.organizations?.logo;

  return (
    <View
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      {/* 1. Top 3 Header Cards Row */}
      <View className="px-3.5 sm:px-4 pt-4">
        <View className="flex-row gap-2.5 items-stretch">
          {/* Card 1: Left - Full Covered Org Image */}
          <View
            className="flex-1 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md min-h-[145px] max-h-[160px] p-2 items-center justify-center"
            style={{ backgroundColor: '#ffffff' }}
          >
            {orgLogo ? (
              <Image
                source={{ uri: orgLogo }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-full rounded-2xl items-center justify-center bg-slate-900">
                <Shield color="#38bdf8" size={32} />
              </View>
            )}
          </View>

          {/* Card 2: Center Tichi Suraksha Card */}
          <View
            className="flex-[1.25] rounded-3xl p-3 items-center justify-center shadow-xl min-h-[145px] max-h-[160px] relative overflow-hidden"
            style={{ backgroundColor: '#f97316' }}
          >
            <View className="bg-orange-100 rounded-full w-12 h-12 mb-1.5 items-center justify-center overflow-hidden border-2 border-white/95 shadow-sm">
              <Image
                source={require('@/assets/images/tich-surksha-woman.jpg')}
                style={{ width: 48, height: 48 }}
                resizeMode="cover"
              />
            </View>
            <Text
              className="text-xs font-black text-slate-950 tracking-wide text-center"
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {`"तिची सुरक्षा"`}
            </Text>
            <View className="bg-white/45 px-2 py-0.5 rounded-full mt-1 border border-white/60">
              <Text className="text-[8px] font-black text-slate-950 text-center">
                आपली जबाबदारी
              </Text>
            </View>
          </View>

          {/* Card 3: Right - Full Covered 112 Police Shield */}
          <View
            className="flex-1 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md min-h-[145px] max-h-[160px] p-2 items-center justify-center"
            style={{ backgroundColor: '#ffffff' }}
          >
            <Image
              source={require('@/assets/images/police-shield.jpg')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* 2. Main Emergency SOS Dispatch Card */}
      <View className="px-3.5 sm:px-4 mt-4">
        <View className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-[2rem] p-4 sm:p-6 shadow-sm dark:shadow-2xl relative overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-center gap-2 mb-6">
            <Shield size={18} color="#f43f5e" />
            <Text className="text-xs font-black tracking-widest uppercase text-rose-500 dark:text-rose-400">
              EMERGENCY SOS DISPATCH
            </Text>
          </View>

          {/* Center SOS Button */}
          <View className="items-center justify-center mb-5">
            <View className="relative items-center justify-center">
              {/* Outer Glowing Pulse Ring */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  position: 'absolute',
                  width: 210,
                  height: 210,
                  borderRadius: 105,
                  backgroundColor: isSosActive
                    ? 'rgba(244, 63, 94, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  backgroundColor: isSosActive
                    ? 'rgba(244, 63, 94, 0.25)'
                    : 'rgba(16, 185, 129, 0.25)',
                }}
              />

              {/* Main SOS Touch Button */}
              {isSosActive ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleStopSos}
                  className="w-40 h-40 rounded-full items-center justify-center bg-slate-950 border-4 border-rose-600"
                >
                  <View className="items-center justify-center px-2">
                    {isTriggering || isStopping ? (
                      <ActivityIndicator size="large" color="#ffffff" />
                    ) : (
                      <CheckCircle2 size={32} color="#f43f5e" />
                    )}
                    <Text className="text-white font-black text-lg tracking-widest mt-1">
                      STOP SOS
                    </Text>
                    <Text className="text-rose-400 text-[9px] font-black uppercase tracking-wider mt-0.5 text-center">
                      CANCEL ALERT
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={startHold}
                  onPressOut={cancelHold}
                  onPress={() => setTapWarning('Hold for 3 full seconds to activate SOS.')}
                  className={`w-40 h-40 rounded-full items-center justify-center ${
                    isHolding ? 'bg-emerald-600' : 'bg-emerald-500'
                  }`}
                >
                  {/* Dedicated background wrapper with overflow hidden for the progress bar */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9999, overflow: 'hidden' }}>
                    {isHolding && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: `${holdProgress}%`,
                          backgroundColor: '#065f46',
                        }}
                      />
                    )}
                  </View>

                  {/* Content (Rendered after absolute view, so it naturally sits on top without zIndex bugs) */}
                  <View className="items-center justify-center px-2 bg-transparent">
                    <AlertTriangle size={30} color="#ffffff" />
                    <Text className="text-white font-black text-lg tracking-widest mt-1 text-center">
                      {isHolding ? 'HOLDING...' : 'HOLD SOS'}
                    </Text>
                    <Text className="text-emerald-100 text-[9px] font-black tracking-wider uppercase mt-0.5 text-center">
                      {isHolding ? 'KEEP HOLDING' : 'HOLD 3 SECONDS'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Instruction / Status Subtext */}
            <Text className="text-slate-500 dark:text-slate-400 text-xs text-center max-w-xs leading-relaxed mt-5">
              {isSosActive
                ? `SOS mode is ACTIVE. Periodic GPS emails are being sent to dispatch every 5 min. Tap Stop SOS to cancel.`
                : 'Press and hold for 3 continuous seconds. SOS will automatically send email alerts, initiate a phone call, and open WhatsApp with your live GPS location.'}
            </Text>

            {tapWarning && !isSosActive && (
              <View className="mt-2.5 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
                <Text className="text-amber-600 dark:text-amber-400 text-xs font-bold text-center">
                  ⚠️ {tapWarning}
                </Text>
              </View>
            )}

            {status === 'success' && (
              <View className="mt-2 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                  ✓ SOS alert dispatched via Email, WhatsApp & Phone!
                </Text>
              </View>
            )}

            {status === 'error' && (
              <Text className="text-rose-500 font-bold mt-2 text-xs text-center">
                Alert dispatched via direct device channels.
              </Text>
            )}
          </View>

          {/* Direct Emergency Channels Section */}
          <View className="mt-2">
            <View className="flex-row items-center gap-2 mb-3.5">
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-widest text-center">
                DIRECT EMERGENCY CHANNELS
              </Text>
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </View>

            <View className="flex-row gap-2">
              {/* Call Emergency Services */}
              <TouchableOpacity
                onPress={handleCallEmergency}
                activeOpacity={0.8}
                className="flex-1 items-center justify-center py-3 px-1 rounded-2xl border border-rose-500/40 bg-rose-500/10 active:bg-rose-500/20"
              >
                <Phone size={20} color="#f43f5e" />
                <Text className="text-rose-600 dark:text-rose-400 font-black text-xs mt-1.5 text-center">
                  CALL 112
                </Text>
                <Text className="text-rose-500/80 text-[8px] font-bold uppercase tracking-wider text-center" numberOfLines={1}>
                  EMERGENCY
                </Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                onPress={handleWhatsApp}
                activeOpacity={0.8}
                className="flex-1 items-center justify-center py-3 px-1 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 active:bg-emerald-500/20"
              >
                <MessageCircle size={20} color="#10b981" />
                <Text className="text-emerald-600 dark:text-emerald-400 font-black text-xs mt-1.5 text-center">
                  WHATSAPP
                </Text>
                <Text className="text-emerald-500/80 text-[8px] font-bold uppercase tracking-wider text-center">
                  SEND LOCATION
                </Text>
              </TouchableOpacity>

              {/* Email Admin */}
              <TouchableOpacity
                onPress={handleEmailAdmin}
                activeOpacity={0.8}
                className="flex-1 items-center justify-center py-3 px-1 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 active:bg-indigo-500/20"
              >
                <Mail size={20} color="#6366f1" />
                <Text className="text-indigo-600 dark:text-indigo-400 font-black text-xs mt-1.5 text-center">
                  EMAIL
                </Text>
                <Text className="text-indigo-500/80 text-[8px] font-bold uppercase tracking-wider text-center">
                  ALERT ADMIN
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>



      {/* 4. Auto-Filled Profile Information Card */}
      <View className="px-3.5 sm:px-4 mt-4">
        <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl">
          <View className="flex-row items-center justify-between gap-2 mb-3.5">
            <View className="flex-row items-center gap-2 flex-1 shrink mr-2">
              <User size={18} color="#f43f5e" />
              <Text className="text-slate-900 dark:text-white font-black text-sm shrink" numberOfLines={1}>
                Auto-Filled Profile
              </Text>
            </View>
            <View className="bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
              <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                VERIFIED
              </Text>
            </View>
          </View>

          {/* User Row */}
          <View className="flex-row items-center gap-3 mb-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <View className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center overflow-hidden shrink-0">
              {user?.profilePhoto || user?.profile_photo ? (
                <Image
                  source={{ uri: user.profilePhoto || user.profile_photo }}
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <User size={24} color={isDark ? '#94a3b8' : '#64748b'} />
              )}
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-slate-900 dark:text-white font-black text-sm" numberOfLines={1}>
                {user?.name || 'User'}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium" numberOfLines={1}>
                {user?.email}
              </Text>
              {(user?.organization?.name || user?.organizations?.name) && (
                <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 self-start mt-1">
                  <Building2 size={10} color={isDark ? '#94a3b8' : '#64748b'} />
                  <Text className="text-slate-700 dark:text-slate-300 text-[10px] font-bold" numberOfLines={1}>
                    {user?.organization?.name || user?.organizations?.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Details List */}
          <View className="space-y-2">
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold shrink-0 mr-2">
                Contact Number:
              </Text>
              <Text className="text-slate-900 dark:text-white font-mono font-bold text-xs shrink text-right" numberOfLines={1}>
                {user?.phone || 'N/A'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-1 border-t border-slate-100 dark:border-slate-800/60">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold shrink-0 mr-2">
                Emergency Contact:
              </Text>
              <Text className="text-rose-600 dark:text-rose-400 font-mono font-bold text-xs shrink text-right" numberOfLines={1}>
                {user?.emergencyContact || user?.emergency_contact || 'N/A'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-1 border-t border-slate-100 dark:border-slate-800/60">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold shrink-0 mr-2">
                System Role:
              </Text>
              <Text className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider shrink text-right" numberOfLines={1}>
                {user?.role || 'MEMBER'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 5. How this feature works Card (Marathi Info) */}
      <View className="px-3.5 sm:px-4 mt-4">
        <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex-row items-start gap-3">
          <Info size={20} color="#3b82f6" className="mt-0.5 shrink-0" />
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white font-black text-sm mb-2.5">
              सिस्टम कसे कार्य करते?{' '}
              <Text className="text-slate-500 dark:text-slate-400 font-normal text-xs">
                (How this feature works)
              </Text>
            </Text>

            <View className="space-y-2">
              <Text className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                • <Text className="text-rose-500 dark:text-rose-400 font-bold">३ सेकंद होल्ड:</Text>{' '}
                चुकीने बटण दाबले जाऊ नये म्हणून ३ सेकंद सतत दाबून धरल्यावरच SOS सक्रिय होतो.
              </Text>
              <Text className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                • <Text className="text-rose-500 dark:text-rose-400 font-bold">तात्काळ ईमेल व GPS:</Text>{' '}
                SOS सक्रिय होताच Admin, Support व पोलीस यंत्रणेला तुमचा Live GPS Location ईमेल जातो आणि दर ५ मिनिटांनी नवीन लोकेशन अपडेट पाठवले जाते.
              </Text>
              <Text className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                • <Text className="text-rose-500 dark:text-rose-400 font-bold">पालक / आपत्कालीन फोन कॉल:</Text>{' '}
                तुमच्या Emergency Contact / पालकांना थेट फोन कॉल सुरू होतो.
              </Text>
              <Text className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                • <Text className="text-rose-500 dark:text-rose-400 font-bold">WhatsApp लोकेशन मेसेज:</Text>{' '}
                थेट WhatsApp वर Live Google Maps लिंकसह आपत्कालीन संदेश पाठवला जातो.
              </Text>
            </View>
          </View>
        </View>
      </View>

    </View>
  );
}
