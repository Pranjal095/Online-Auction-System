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
      const response = await axiosInstance.get("/api/auctions");
      const auctions = response.data;
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
  createAuction: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const response = await axiosInstance.post("/api/auctions", data);
      set({ isCreating: false });
      if (!response.data.error) {
        toast.success(response.data.message);
      }
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
      const response = await axiosInstance.get(`/api/auctions/${auction_id}`);
      const auction = response.data;
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
      const response = await axiosInstance.post(`/api/auctions/${auction_id}/bid`, { bid_amount });
      const updatedAuction = response.data;
      set({ currentAuction: updatedAuction, loading: false });
      toast.success(response.data.message);
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("placeBid error:", errorMsg);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  placeAutomatedBid: async (auction_id, automated_bid_amount) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(`/api/auctions/${auction_id}/automated-bid`, { automated_bid_amount });
      set({ currentAuction: response.data, loading: false });
      toast.success(response.data.message);
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("placeAutomatedBid error:", errorMsg);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  deleteAuction: async (auctionId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/api/auctions/${auctionId}`);
      set({ loading: false });
      toast.success(response.data.message);
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("deleteAuction error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  updateAuctionEndTime: async (auctionId, newEndTime) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/api/auctions/${auctionId}/update-end-time`, { newEndTime });
      set({ loading: false });
      toast.success(response.data.message);
      const updatedAuction = response.data;
      set({ currentAuction: updatedAuction });
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
            ? err.response.data.error
            : err.message;
        console.error("deleteAuction error:", err);
        set({ error: errorMsg, loading: false });
        toast.error(errorMsg);
    }
  },

  clearError: () => set({ error: null }),
}));
