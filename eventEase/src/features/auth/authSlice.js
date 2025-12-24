import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/*LOGIN */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/user/login", formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

/* SIGNUP */
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/user", formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Signup failed"
      );
    }
  }
);

// Organizer sign-in
export const organizerLogin = createAsyncThunk(
  "auth/organizerLogin",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/organizer/signin", formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Organizer login failed"
      );
    }
  }
);

// Organizer signup
export const organizerSignup = createAsyncThunk(
  "auth/organizerSignup",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/organizer/signup", formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Organizer signup failed"
      );
    }
  }
);

// Admin (user) login - reuse user endpoint but keep separate thunk for clarity
export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/user/login", formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Admin login failed"
      );
    }
  }
);

// Google login - type: 'user' or 'organizer'
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async ({ token, type = 'user' }, thunkAPI) => {
    try {
      const endpoint = type === 'organizer' ? '/organizer/googlelogin' : '/user/googlelogin';
      const res = await axios.post(endpoint, { token });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Google login failed'
      );
    }
  }
);

/* SLICE */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        state.isLoading = false;
        state.user = data;
        state.token = token;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", data._id);
        localStorage.setItem("role", data.roleId?.name || "User");
        localStorage.setItem("isVerified", data.isVerified ? "true" : "false");

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // SIGNUP
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // Organizer login
    builder
      .addCase(organizerLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(organizerLogin.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        state.isLoading = false;
        state.user = data;
        state.token = token;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", data._id);
        localStorage.setItem("role", data.roleId?.name || "Organizer");
        localStorage.setItem("isVerified", data.isVerified ? "true" : "false");

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .addCase(organizerLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Organizer signup
      .addCase(organizerSignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(organizerSignup.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(organizerSignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Admin login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        state.isLoading = false;
        state.user = data;
        state.token = token;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", data._id);
        localStorage.setItem("role", data.roleId?.name || "User");
        localStorage.setItem("isVerified", data.isVerified ? "true" : "false");

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Google login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        state.isLoading = false;
        state.user = data;
        state.token = token;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", data._id);
        localStorage.setItem("role", data.roleId?.name || "User");
        localStorage.setItem("isVerified", data.isVerified ? "true" : "false");

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;




// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: null,
//   token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setAuth(state, action) {
//       state.user = action.payload.user || null;
//       state.token = action.payload.token || null;
//       if (typeof window !== 'undefined') {
//         if (action.payload.token) localStorage.setItem('token', action.payload.token);
//         else localStorage.removeItem('token');
//       }
//     },
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       if (typeof window !== 'undefined') localStorage.removeItem('token');
//     },
//   },
// });

// export const { setAuth, logout } = authSlice.actions;
// export default authSlice.reducer;
