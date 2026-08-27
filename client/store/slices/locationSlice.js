import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  timestamp: null,
  isTracking: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.accuracy = action.payload.accuracy;
      state.timestamp = action.payload.timestamp || Date.now();
      state.error = null;
    },
    setTrackingState: (state, action) => {
      state.isTracking = action.payload;
    },
    setLocationError: (state, action) => {
      state.error = action.payload;
    },
    clearLocation: (state) => {
      state.latitude = null;
      state.longitude = null;
      state.accuracy = null;
      state.timestamp = null;
      state.error = null;
    }
  },
});

export const { setLocation, setTrackingState, setLocationError, clearLocation } = locationSlice.actions;

export default locationSlice.reducer;
