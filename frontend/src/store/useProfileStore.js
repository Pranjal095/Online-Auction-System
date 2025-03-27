import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProfileStore = create((set) => ({
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
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Fetch sold items for the user (for sellers)
  fetchSoldItems: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend is ready:
      // const response = await axiosInstance.get("/profile/sold-items");
      // set({ soldItems: response.data.soldItems, loading: false });
      
      // Dummy sold items:
      const dummySold = [
        {
          transaction_id: 1,
          auction_id: 2,
          title: "Antique Vase",
          price: 250.0,
          sold_date: "2025-04-02T14:05:00Z",
        },
      ];
      set({ soldItems: dummySold, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  fetchBoughtItems: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend is ready:
      // const response = await axiosInstance.get("/profile/sold-items");
      // set({ soldItems: response.data.soldItems, loading: false });
      
      // Dummy sold items:
      const dummyBought = [
        {
          transaction_id: 1,
          auction_id: 2,
          title: "Antique Vase",
          price: 250.0,
          purchase_date: "2025-04-02T14:05:00Z",
        },
      ];
      set({ boughtItems: dummyBought, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  submitReview: async (auctionId, starValue) => {
    console.log(auctionId);
    console.log(starValue);
  },

  // Fetch auctions for the seller
  fetchYourAuctions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/profile/auctions");
      set({ yourAuctions: response.data, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  clearError: () => set({ error: null }),
}));
