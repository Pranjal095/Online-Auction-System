import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuctionStore = create((set, get) => ({
  auctions: [],
  loading: false,
  isCreating: false,
  error: null,

  currentAuction: null,

  // Fetch all auctions from the backend
  fetchAuctions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/auctions");
      const auctions = Array.isArray(response.data) ? response.data : [];
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
      if (response.data && !response.data.error) {
        toast.success(response.data.message || "Auction created successfully");
        return true;
      }
      return false;
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("createAuction error:", err);
      set({ error: errorMsg, isCreating: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // Fetch details for a specific auction
  fetchAuction: async (auction_id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/api/auctions/${auction_id}`);
      if (response && response.data) {
        set({ currentAuction: response.data, loading: false });
        return response.data;
      } else {
        throw new Error("Invalid auction data received");
      }
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("fetchAuction error:", err);
      set({ error: errorMsg, loading: false, currentAuction: null });
      toast.error(errorMsg);
      return null;
    }
  },

  // Place a bid on a specific auction by sending the bid amount
  placeBid: async (auction_id, bid_amount) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(`/api/auctions/${auction_id}/bid`, { bid_amount });
      
      if (response.data && response.data.auction) {
        set({ currentAuction: response.data.auction, loading: false });
        toast.success(response.data.message || "Bid placed successfully");
        return true;
      } else {
        set({ loading: false });
        toast.success("Bid placed, refreshing auction data...");
        await get().fetchAuction(auction_id);
        return false;
      }
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("placeBid error:", errorMsg);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  placeAutomatedBid: async (auction_id, automated_bid_amount) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(`/api/auctions/${auction_id}/automated-bid`, 
        { automated_bid_amount });
      
      if (response.data && response.data.auction) {
        set({ currentAuction: response.data.auction, loading: false });
        toast.success(response.data.message || "Automated bid placed successfully");
      } else {
        set({ loading: false });
        toast.success("Automated bid placed successfully");
        await get().fetchAuction(auction_id);
      }
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
      const response = await axiosInstance.delete(`/api/auctions/${auctionId}`);
      set({ loading: false });
      
      if (response && response.data) {
        toast.success(response.data.message || "Auction deleted successfully");
      } else {
        toast.success("Auction deleted successfully");
      }
      return true;
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
          ? err.response.data.error
          : err.message;
      console.error("deleteAuction error:", err);
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  updateAuctionEndTime: async (auctionId, newEndTime) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/api/auctions/${auctionId}/update-end-time`, 
        { newEndTime });
      
      if (response && response.data) {
        const updatedAuction = response.data;
        set({ currentAuction: updatedAuction, loading: false });
        toast.success(response.data.message || "End time updated successfully");
        return true;
      } else {
        set({ loading: false });
        toast.success("End time updated");
        await get().fetchAuction(auctionId);
        return true;
      }
    } catch (err) {
      const errorMsg =
        err.response && err.response.data
            ? err.response.data.error
            : err.message;
        console.error("updateAuctionEndTime error:", err);
        set({ error: errorMsg, loading: false });
        toast.error(errorMsg);
        return false;
    }
  },

  clearError: () => set({ error: null }),
}));