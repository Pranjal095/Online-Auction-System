import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";
import ProfileDetails from "../components/ProfileDetails";
import BiddingHistory from "../components/BiddingHistory";
import SoldItems from "../components/SoldItems";

const ProfilePage = () => {
  const { fetchProfile, fetchBiddingHistory, fetchSoldItems } = useProfileStore();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchProfile();
    fetchBiddingHistory();
    fetchSoldItems();
  }, [fetchProfile, fetchBiddingHistory, fetchSoldItems]);

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="tabs">
        <button 
          className={`tab tab-lifted ${activeTab === "profile" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button 
          className={`tab tab-lifted ${activeTab === "bidding" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("bidding")}
        >
          Bidding History
        </button>
        <button 
          className={`tab tab-lifted ${activeTab === "sold" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("sold")}
        >
          Sold Items
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "profile" && <ProfileDetails />}
        {activeTab === "bidding" && <BiddingHistory />}
        {activeTab === "sold" && <SoldItems />}
      </div>
    </div>
  );
};

export default ProfilePage;
