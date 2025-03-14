import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProfileStore = create((set) => ({
  profile: null,
  biddingHistory: [],
  soldItems: [],
  loading: false,
  error: null,

  // Fetch user profile, including personal and payment info.
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend endpoint is ready:
      // const response = await axiosInstance.get("/profile");
      // set({ profile: response.data.profile, loading: false });

      // Dummy profile data for testing:
      const dummyProfile = {
        user_id: 1,
        username: "johndoe",
        email: "johndoe@example.com",
        address: "123 Main St, City, Country",
        mobile_number: "123-456-7890",
        created_at: "2025-01-01T10:00:00Z",
        payment_info: {
          payment_method: "credit_card",
          last_four: "1234",
        },
      };
      set({ profile: dummyProfile, loading: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Update profile information.
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend endpoint is ready:
      // const response = await axiosInstance.put("/profile", data);
      // set({ profile: response.data.profile, loading: false });

      // Dummy update simulation:
      set((state) => ({
        profile: { ...state.profile, ...data },
        loading: false,
      }));
      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Fetch bidding history for the user.
  fetchBiddingHistory: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend endpoint is ready:
      // const response = await axiosInstance.get("/profile/bidding-history");
      // set({ biddingHistory: response.data.history, loading: false });

      // Dummy bidding history:
      const dummyHistory = [
        {
          auction_id: 1,
          item_title: "Vintage Watch",
          bid_amount: 150.0,
          bid_time: "2025-04-01T12:30:00Z",
        },
        {
          auction_id: 3,
          item_title: "Modern Art Painting",
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

  // Fetch sold items (for sellers) for the user.
  fetchSoldItems: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment when backend endpoint is ready:
      // const response = await axiosInstance.get("/profile/sold-items");
      // set({ soldItems: response.data.soldItems, loading: false });

      // Dummy sold items:
      const dummySold = [
        {
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

  clearError: () => set({ error: null }),
}));
