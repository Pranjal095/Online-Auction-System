import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  error: null,

  login: async (data) => {
    set({ isLoggingIn: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      const user = response.data;
      set({ user, isLoggingIn: false });
      toast.success("Logged in successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("Login error:", err);
      set({ error: errorMsg, isLoggingIn: false });
      toast.error(errorMsg);
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      const user = response.data;
      set({ user, isSigningUp: false });
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
  logout: async () => {
    set({ user: null });
    try {
      const response = await axiosInstance.get("/auth/logout");
      toast.success("Logged out successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("Logout error:", err);
      set({ error: errorMsg });
      toast.error(errorMsg);
    }
  },

  // checkAuth function: checks the current authentication status, updates the user state,
  // and returns the user object.
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      const user = response.data;
      set({ user, isCheckingAuth: false });
    } catch (err) {
      console.error("checkAuth error:", err);
      set({ user: null, isCheckingAuth: false });
      return null;
    }
  },
}));
