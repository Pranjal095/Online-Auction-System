import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProfileStore = create((set) => ({
  profile: null,
  biddingHistory: [],
  soldItems: [],
  pastAuctions: [],
  loading: false,
  error: null,

  // Fetch the user's profile (including payment info)
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend is ready:
      // const response = await axiosInstance.get("/profile");
      // set({ profile: response.data, loading: false });
      
      // Dummy data for testing:
      const dummyProfile = {
        user_id: 1,
        username: "johndoe",
        email: "john@example.com",
        address: "123 Main St, City",
        mobile_number: "1234567890",
        created_at: "2025-01-01T00:00:00Z",
        payment_info: {
          payment_method: "credit_card",
          last_four: "4242",
        },
      };
      set({ profile: dummyProfile, loading: false });
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
      // Uncomment when backend is ready:
      // const response = await axiosInstance.put("/profile", data);
      // set({ profile: response.data, loading: false });
      
      // Dummy simulation of update:
      set((state) => ({ profile: { ...state.profile, ...data }, loading: false }));
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
      // Uncomment when backend is ready:
      // const response = await axiosInstance.get("/profile/bidding-history");
      // set({ biddingHistory: response.data.history, loading: false });
      
      // Dummy bidding history:
      const dummyHistory = [
        {
          bid_id: 1,
          auction_id: 1,
          item_title: "Vintage Watch",
          bid_amount: 150.0,
          bid_time: "2025-04-01T12:30:00Z",
        },
        {
          bid_id: 2,
          auction_id: 3,
          item_title: "Modern Painting",
          bid_amount: 300.0,
          bid_time: "2025-04-03T15:45:00Z",
        },
      ];
      set({ biddingHistory: dummyHistory, loading: false });
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
          item_title: "Antique Vase",
          sale_price: 250.0,
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

  // Fetch past auctions for the seller (auctions that have ended)
  fetchPastAuctions: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend is ready:
      // const response = await axiosInstance.get("/profile/past-auctions");
      // set({ pastAuctions: response.data.pastAuctions, loading: false });
      
      // Dummy past auctions:
      const dummyPastAuctions = [
        {
          auction_id: 3,
          item_title: "Old Camera",
          starting_bid: 80.0,
          final_bid: 120.0,
          end_time: "2025-03-31T18:00:00Z",
          status: "closed",
        },
        {
          auction_id: 4,
          item_title: "Vintage Lamp",
          starting_bid: 50.0,
          final_bid: 75.0,
          end_time: "2025-03-28T20:00:00Z",
          status: "closed",
        },
      ];
      set({ pastAuctions: dummyPastAuctions, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  clearError: () => set({ error: null }),
}));
