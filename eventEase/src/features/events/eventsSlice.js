import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchEvents = createAsyncThunk('events/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/event/getallevents');
    return res.data?.data || res.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
  }
});

export const createEvent = createAsyncThunk('events/create', async (formData, thunkAPI) => {
  try {
    const res = await axios.post('/event/addeventwithfile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create event');
  }
});

export const fetchMyEvents = createAsyncThunk('events/fetchMy', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/event/myevents');
    return res.data?.data || res.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch my events');
  }
});

export const fetchEventById = createAsyncThunk('events/fetchById', async (id, thunkAPI) => {
  try {
    const res = await axios.get(`/event/geteventbyid/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch event');
  }
});

export const updateEvent = createAsyncThunk('events/update', async ({ id, formData }, thunkAPI) => {
  try {
    const res = await axios.put(`/event/updateevent/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update event');
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (id, thunkAPI) => {
  try {
    const res = await axios.delete(`/event/deleteevent/${id}`);
    return { id };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete event');
  }
});

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents(state, action) {
      state.list = action.payload || [];
    },
    addEvent(state, action) {
      state.list.unshift(action.payload);
    },
    clearEvents(state) {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload || [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(createEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // if API returns created event in data
        const payload = action.payload?.data || action.payload;
        if (payload) state.list.unshift(payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchMyEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload || [];
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // put fetched event at top or replace existing
        const ev = action.payload;
        if (ev && ev._id) {
          const idx = state.list.findIndex((e) => e._id === ev._id);
          if (idx > -1) state.list[idx] = ev;
          else state.list.unshift(ev);
        }
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload?.data || action.payload;
        if (payload && payload._id) {
          const idx = state.list.findIndex((e) => e._id === payload._id);
          if (idx > -1) state.list[idx] = payload;
          else state.list.unshift(payload);
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = state.list.filter((e) => e._id !== action.payload.id);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setEvents, addEvent, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
