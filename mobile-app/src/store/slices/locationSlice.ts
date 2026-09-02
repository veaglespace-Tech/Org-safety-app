import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  lastUpdated: number | null;
  isTracking: boolean;
  error: string | null;
}

const initialState: LocationState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  speed: null,
  heading: null,
  timestamp: null,
  lastUpdated: null,
  isTracking: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Partial<LocationState>>) => {
      state.latitude = action.payload.latitude ?? state.latitude;
      state.longitude = action.payload.longitude ?? state.longitude;
      state.accuracy = action.payload.accuracy ?? state.accuracy;
      state.speed = action.payload.speed ?? state.speed;
      state.heading = action.payload.heading ?? state.heading;
      state.timestamp = action.payload.timestamp || Date.now();
      state.lastUpdated = Date.now();
      state.error = null;
    },
    setTrackingState: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearLocation: (state) => {
      state.latitude = null;
      state.longitude = null;
      state.accuracy = null;
      state.speed = null;
      state.heading = null;
      state.timestamp = null;
      state.lastUpdated = null;
      state.error = null;
    }
  },
});

export const { setLocation, setTrackingState, setLocationError, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
