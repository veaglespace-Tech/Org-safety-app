import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Pressable, Animated, Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Shield, MapPin, Loader2, Phone, MessageCircle } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { useTriggerSosMutation, useUpdateSosLocationMutation, useStopSosMutation } from '@/services/api/authApi';

export default function SOSScreen() {
  const { user } = useSelector((state: any) => state.auth);
  
  const [triggerSos, { isLoading: isTriggering }] = useTriggerSosMutation();
  const [updateSosLocation] = useUpdateSosLocationMutation();
  const [stopSos, { isLoading: isStopping }] = useStopSosMutation();

  const [isSosActive, setIsSosActive] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const holdTimerRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);
  
  const HOLD_DURATION = 3000; // 3 seconds

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        return;
      }
      
      try {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc);
      } catch (err) {
        setLocationErrorMsg('Could not fetch initial location');
      }
    })();

    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const startHold = () => {
    if (isSosActive || isTriggering || isStopping) return;
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    holdTimerRef.current = setTimeout(() => {
      handleSosTrigger();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (isSosActive) return;
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSosTrigger = async () => {
    try {
      let locUrl = '';
      if (location?.coords) {
        locUrl = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      } else {
        try {
          let freshLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setLocation(freshLoc);
          locUrl = `https://maps.google.com/?q=${freshLoc.coords.latitude},${freshLoc.coords.longitude}`;
        } catch (e) {
          console.warn("Failed fresh loc fetch");
        }
      }

      await (triggerSos as any)({ locationUrl: locUrl }).unwrap();
      
      setIsSosActive(true);
      Alert.alert("SOS Activated", "Emergency contacts have been notified.");

      triggerNativeIntents(locUrl);
      
      const sosIntervalMinutes = parseInt(process.env.EXPO_PUBLIC_SOS_INTERVAL_MINUTES || '1');
      
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = setInterval(async () => {
        try {
          let freshLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          let newLocUrl = `https://maps.google.com/?q=${freshLoc.coords.latitude},${freshLoc.coords.longitude}`;
          await (updateSosLocation as any)({ locationUrl: newLocUrl }).unwrap();
        } catch (e) {
          console.error("Failed to update SOS location", e);
        }
      }, sosIntervalMinutes * 60 * 1000);
      
    } catch (err) {
      console.error("SOS Trigger Failed", err);
      Alert.alert("Error", "Could not trigger SOS. Check connection.");
      progressAnim.setValue(0);
    }
  };

  const triggerNativeIntents = (locUrl: string) => {
    const distressMessage = `🚨 EMERGENCY SOS DISTRESS ALERT 🚨

👤 Name: ${user?.name || 'Unknown'}
📧 Email: ${user?.email || 'Unknown'}
📞 Phone: ${user?.phone || 'Not provided'}
🚨 Emergency Contact: ${user?.emergencyContact || 'Not provided'}

📍 LATEST LIVE LOCATION: ${locUrl || 'Not available'}`;

    const emContactStr = user?.emergencyContact ? String(user.emergencyContact) : '';
    const whatsappNumber = emContactStr.replace(/\D/g, '');
    
    if (whatsappNumber) {
      const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(distressMessage)}`;
      Linking.canOpenURL(whatsappUrl).then(supported => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          console.warn("WhatsApp is not installed");
        }
      });
    }

    if (emContactStr) {
      const phoneUrl = `tel:${emContactStr}`;
      Linking.canOpenURL(phoneUrl).then(supported => {
        if (supported) {
          Linking.openURL(phoneUrl);
        }
      });
    }
  };

  const handleStopSos = async () => {
    try {
      await (stopSos as any)({}).unwrap();
      setIsSosActive(false);
      progressAnim.setValue(0);
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      Alert.alert("SOS Stopped", "Emergency mode deactivated.");
    } catch (err) {
      console.error("Failed to stop SOS", err);
      Alert.alert("Error", "Could not stop SOS.");
    }
  };

  const circleSize = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 240]
  });

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        तिची सुरक्षा (SOS)
      </Text>
      <Text className="text-gray-500 mb-12 text-center px-4">
        Hold the button for 3 seconds to trigger an emergency SOS alert.
      </Text>

      {/* SOS Button Area */}
      <View className="items-center justify-center h-80">
        <Animated.View
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: 150,
            backgroundColor: isSosActive ? '#fee2e2' : '#f3f4f6',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
        
        <Pressable
          onPressIn={startHold}
          onPressOut={cancelHold}
          disabled={isSosActive || isTriggering || isStopping}
          className={`w-48 h-48 rounded-full items-center justify-center shadow-lg ${
            isSosActive ? 'bg-red-600' : 'bg-red-500'
          }`}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          {isTriggering || isStopping ? (
            <Loader2 color="#fff" size={48} className="animate-spin" />
          ) : (
            <>
              <Shield color="#fff" size={64} />
              <Text className="text-white font-bold text-2xl mt-2 tracking-widest">
                {isSosActive ? "ACTIVE" : "SOS"}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Status Indicators */}
      <View className="w-full mt-12 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <View className="flex-row items-center mb-3">
          <MapPin color={location ? "#10b981" : "#ef4444"} size={20} />
          <Text className="ml-2 text-slate-700">
            {location ? "GPS Location Acquired" : locationErrorMsg || "Acquiring GPS..."}
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <Phone color="#3b82f6" size={20} />
          <Text className="ml-2 text-slate-700">
            Emergency Contact: {user?.emergencyContact || "Not Set"}
          </Text>
        </View>
      </View>

      {isSosActive && (
        <Pressable 
          onPress={handleStopSos}
          disabled={isStopping}
          className="mt-8 bg-slate-900 py-4 px-8 rounded-full flex-row items-center"
        >
          {isStopping ? (
            <Loader2 color="#fff" size={20} className="animate-spin mr-2" />
          ) : null}
          <Text className="text-white font-bold text-lg">Stop Emergency Mode</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
