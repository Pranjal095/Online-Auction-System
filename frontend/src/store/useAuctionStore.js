import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuctionStore = create((set) => ({
  // State variables
  auctions: [],         // List of auctions
  loading: false,       // Loading state for fetching auctions
  isCreating: false,    // Loading state for creating a new auction
  error: null,          // Error message, if any

  // Fetch all auctions from the backend
  fetchAuctions: async () => {
    set({ loading: true, error: null });
    try {
      // Assuming the backend returns a JSON object with an "auctions" field
      const response = await axiosInstance.get("/auctions");
      const auctions = response.data.auctions;
      set({ auctions, loading: false });
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("fetchAuctions error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Create a new auction (and associated item) using the provided data object
  // Expected data example: { seller_id, title, description, starting_bid, start_time, end_time }
  createAuction: async (data) => {
    set({ isCreating: true, error: null });
    try {
      // Call the backend endpoint to create the auction
      const response = await axiosInstance.post("/auctions", data);
      const newAuction = response.data.auction;
      // Append the new auction to the auctions list
      set((state) => ({
        auctions: [...state.auctions, newAuction],
        isCreating: false,
      }));
      toast.success("Auction created successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data ? err.response.data.error : err.message;
      console.error("createAuction error:", err);
      set({ error: errorMsg, isCreating: false });
      toast.error(errorMsg);
    }
  },

  // Optional: clear any stored error
  clearError: () => set({ error: null }),
}));