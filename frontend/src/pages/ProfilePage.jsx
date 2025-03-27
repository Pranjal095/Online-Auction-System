import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";
import ProfileDetails from "../components/ProfileDetails";
import BiddingHistory from "../components/BiddingHistory";
import BoughtItems from "../components/BoughtItems";
import SoldItems from "../components/SoldItems"
import YourAuctions from "../components/YourAuctions";

const ProfilePage = () => {
  const { fetchBiddingHistory, fetchProfile, fetchYourAuctions, fetchSoldItems, fetchBoughtItems } = useProfileStore();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchBiddingHistory();
    fetchProfile();
    fetchYourAuctions();
    fetchSoldItems();
    fetchBoughtItems();
  }, [fetchBiddingHistory, fetchProfile, fetchYourAuctions, fetchSoldItems, fetchBoughtItems]);

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="tabs mb-6">
        <button
          className={`tab tab-bordered ${activeTab === "details" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Profile Details
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "bidding" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("bidding")}
        >
          Bidding History
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "bought" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("bought")}
        >
          Bought Items
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "sold" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("sold")}
        >
          Sold Items
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "your" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("your")}
        >
          Your Auctions
        </button>
      </div>
      <div className="mt-4">
        {activeTab === "details" && <ProfileDetails />}
        {activeTab === "bidding" && <BiddingHistory />}
        {activeTab === "bought" && <BoughtItems />}
        {activeTab === "sold" && <SoldItems />}
        {activeTab === "your" && <YourAuctions />}
      </div>
    </div>
  );
};

export default ProfilePage;
