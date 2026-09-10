import { API_BASE_URL } from '@/config';

// Maximum acceptable accuracy in meters
export const MAX_ACCURACY_THRESHOLD = 2500; 
// Minimum distance in meters the user must move
export const MIN_DISTANCE_THRESHOLD = 1;

// Memory to prevent duplicate sends and track distance globally
let lastSentLocation: { latitude: number; longitude: number; timestamp: number } | null = null;

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const clearLocationMemory = () => {
    lastSentLocation = null;
}

export const validateAndSendLocation = async (
  locationData: { latitude: number; longitude: number; accuracy: number; speed: number | null; heading: number | null; timestamp: number },
  trackingToken: string,
  authToken: string,
  socketRef: any, 
  isBackground: boolean = false
) => {
  const { latitude, longitude, accuracy, speed, heading, timestamp } = locationData;

  // 1. Validation & Accuracy Check
  if (!latitude || !longitude) return false;
  if (accuracy && accuracy > MAX_ACCURACY_THRESHOLD) {
    console.log(`[LocationSender] Discarding inaccurate reading: ${accuracy}m (Threshold: ${MAX_ACCURACY_THRESHOLD}m)`);
    return false;
  }

  // 2. Distance Filtering
  if (lastSentLocation) {
    const timeSinceLastSend = timestamp - lastSentLocation.timestamp;
    const distance = haversineDistance(latitude, longitude, lastSentLocation.latitude, lastSentLocation.longitude);
    
    if (distance < MIN_DISTANCE_THRESHOLD && timeSinceLastSend < 60000) {
      return false; // Skipped due to distance filtering
    }
  }

  // 3. Payload Creation (Strictly ONE Contract)
  const payload = {
    token: trackingToken,
    latitude,
    longitude,
    accuracy,
    speed,
    heading,
    timestamp
  };

  let sendSuccess = false;

  // 4. Delivery Mechanism
  if (!isBackground && socketRef && socketRef.connected) {
      socketRef.emit('location-updated', payload);
      socketRef.emit('locationUpdate', payload);
      socketRef.emit('update-location', payload);
      
      // CRITICAL FIX: The web viewer sometimes joins the room with an uppercase 'SOS', 
      // but the mobile app generates a lowercase 'sos'. Emit to both to guarantee delivery.
      if (trackingToken) {
          const upperToken = trackingToken.toUpperCase();
          if (upperToken !== trackingToken) {
              const upperPayload = { ...payload, token: upperToken };
              socketRef.emit('location-updated', upperPayload);
              socketRef.emit('locationUpdate', upperPayload);
              socketRef.emit('update-location', upperPayload);
          }
      }
      
      sendSuccess = true;
      console.log(`[LocationSender] Emitted via Socket.io. Lat: ${latitude}, Lng: ${longitude}`);
  } else {
      try {
          let cleanToken = authToken;
          try { cleanToken = JSON.parse(authToken); } catch(e) {}

          const response = await fetch(`${API_BASE_URL}/sos/background-location`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${cleanToken}`
              },
              body: JSON.stringify(payload)
          });
          
          // Also fire REST for uppercase token to be completely safe
          if (trackingToken) {
              const upperToken = trackingToken.toUpperCase();
              if (upperToken !== trackingToken) {
                  const upperPayload = { ...payload, token: upperToken };
                  fetch(`${API_BASE_URL}/sos/background-location`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${cleanToken}`
                      },
                      body: JSON.stringify(upperPayload)
                  }).catch(() => {}); // silent fail for secondary
              }
          }

          if (response.ok) {
              sendSuccess = true;
              console.log(`[LocationSender] Sent via REST API (Background). Lat: ${latitude}, Lng: ${longitude}`);
          } else {
              console.error(`[LocationSender] REST API failed with status ${response.status}`);
          }
      } catch (err) {
          console.error(`[LocationSender] Failed to send via REST API`, err);
      }
  }

  // 5. Update Memory
  if (sendSuccess) {
      lastSentLocation = { latitude, longitude, timestamp };
  }

  return sendSuccess;
};
