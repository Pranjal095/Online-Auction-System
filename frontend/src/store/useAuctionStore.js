import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuctionStore = create((set, get) => ({
  // Auction list and related state
  auctions: [],         // List of all auctions
  loading: false,       // Generic loading state (for fetching or bidding)
  isCreating: false,    // Loading state for creating a new auction
  error: null,          // Error message, if any

  // For an individual auction's details
  currentAuction: null,

  // Fetch all auctions from the backend
  fetchAuctions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/auctions");
      const auctions = response.data.auctions;
      set({ auctions, loading: false });
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("fetchAuctions error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Create a new auction using provided data
  // Expected data example: { seller_id, title, description, starting_bid, start_time, end_time, image }
  createAuction: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const response = await axiosInstance.post("/auctions", data);
      const newAuction = response.data.auction;
      set((state) => ({
        auctions: [...state.auctions, newAuction],
        isCreating: false,
      }));
      toast.success("Auction created successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("createAuction error:", err);
      set({ error: errorMsg, isCreating: false });
      toast.error(errorMsg);
    }
  },

  // Fetch details for a specific auction
  fetchAuction: async (auction_id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/auctions/${auction_id}`);
      const auction = response.data.auction;
      set({ currentAuction: auction, loading: false });
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("fetchAuction error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Place a bid on a specific auction by sending the bid amount
  placeBid: async (auction_id, bid_amount) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(`/auctions/${auction_id}/bid`, { bid_amount });
      const updatedAuction = response.data.auction;
      set({ currentAuction: updatedAuction, loading: false });
      toast.success("Bid placed successfully!");
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("placeBid error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  clearError: () => set({ error: null }),
}));
