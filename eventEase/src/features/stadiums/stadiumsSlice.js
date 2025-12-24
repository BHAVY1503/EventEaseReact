import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  list: [],
  selectedStadium: null,
  status: 'idle',
  error: null,
};

export const fetchStadiums = createAsyncThunk('stadiums/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/admin/stadiums');
    // API may return array or {stadiums: []}
    if (Array.isArray(res.data)) return res.data;
    if (res.data.stadiums) return res.data.stadiums;
    return res.data?.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch stadiums');
  }
});

export const createStadium = createAsyncThunk('stadiums/create', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/admin/stadiums', payload);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create stadium');
  }
});

const stadiumsSlice = createSlice({
  name: 'stadiums',
  initialState,
  reducers: {
    setStadiums(state, action) {
      state.list = action.payload || [];
    },
    selectStadium(state, action) {
      state.selectedStadium = action.payload || null;
    },
    clearSelectedStadium(state) {
      state.selectedStadium = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStadiums.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStadiums.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload || [];
      })
      .addCase(fetchStadiums.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(createStadium.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createStadium.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload?.data || action.payload;
        if (payload) state.list.unshift(payload);
      })
      .addCase(createStadium.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setStadiums, selectStadium, clearSelectedStadium } = stadiumsSlice.actions;
export default stadiumsSlice.reducer;
