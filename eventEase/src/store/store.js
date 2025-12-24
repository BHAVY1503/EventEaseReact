import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';
import stadiumsReducer from '../features/stadiums/stadiumsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    stadiums: stadiumsReducer,
  },
});

export default store;
