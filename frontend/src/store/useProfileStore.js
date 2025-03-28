import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProfileStore = create((set, get) => ({
  profile: null,
  biddingHistory: [],
  boughtItems: [],
  soldItems: [],
  yourAuctions: [],
  loading: false,
  error: null,

  // Fetch the user's profile
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/profile");
      set({ profile: response.data, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("fetchProfile error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Update the user's profile
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put("/api/profile", data);
      set({ profile: response.data, loading: false });
      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("updateProfile error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Fetch the bidding history for the user (for buyers)
  fetchBiddingHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/profile/bids");
      set({ biddingHistory: response.data, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("fetchBiddingHistory error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Fetch sold items for the user (for sellers)
  fetchSoldItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/profile/sold");
      set({ soldItems: response.data, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("fetchSoldItems error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  fetchBoughtItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/profile/bought");
      set({ boughtItems: response.data, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("fetchBoughtItems error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  submitReview: async (auction_id, star_value) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/api/reviews", {auction_id: auction_id, rating: star_value})
      set({ loading: false });
      toast.success("Review submitted successfully!");
      await get().fetchBoughtItems();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("submitReview error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Fetch auctions for the seller
  fetchYourAuctions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/profile/auctions");
      set({ yourAuctions: response.data, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("fetchYourAuctions error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  clearError: () => set({ error: null }),
}));
