import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null, // Authenticated user info: { user_id, username, email, address, mobile_number, created_at }
  token: localStorage.getItem("token") || null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  error: null,

  // Login function: expects a `data` object containing credentials (e.g., { username, password }).
  login: async (data) => {
    set({ isLoggingIn: true, error: null });
    try {
      const response = await axiosInstance.post("/login", data);
      const { token, user } = response.data;
      set({ user, token, isLoggingIn: false });
      localStorage.setItem("token", token);
      toast.success("Logged in successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("Login error:", err);
      set({ error: errorMsg, isLoggingIn: false });
      toast.error(errorMsg);
    }
  },

  // Signup function: expects a `data` object containing registration details.
  signup: async (data) => {
    set({ isSigningUp: true, error: null });
    try {
      const response = await axiosInstance.post("/signup", data);
      const { token, user } = response.data;
      set({ user, token, isSigningUp: false });
      localStorage.setItem("token", token);
      toast.success("Signed up successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("Signup error:", err);
      set({ error: errorMsg, isSigningUp: false });
      toast.error(errorMsg);
    }
  },

  // Logout function: clears the authentication state and removes the token.
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
    toast.success("Logged out successfully!");
  },

  // checkAuth function: checks the current authentication status, updates the user state,
  // and returns the user object.
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/checkAuth");
      const { user } = response.data;
      set({ user, isCheckingAuth: false });
      return user;
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("checkAuth error:", err);
      set({ error: errorMsg });
      toast.error(errorMsg);
      return null;
    }
  },
}));
