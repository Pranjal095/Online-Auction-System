import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";
import ProfileDetails from "../components/ProfileDetails";
import BiddingHistory from "../components/BiddingHistory";
import SoldItems from "../components/SoldItems";
import PastAuctions from "../components/PastAuctions";

const ProfilePage = () => {
  const { fetchProfile, fetchBiddingHistory, fetchSoldItems, fetchPastAuctions } = useProfileStore();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    // Uncomment these lines when backend is ready:
    // fetchProfile();
    // fetchBiddingHistory();
    // fetchSoldItems();
    // fetchPastAuctions();

    // For now, dummy data from the store is already loaded.
  }, [fetchProfile, fetchBiddingHistory, fetchSoldItems, fetchPastAuctions]);

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
          className={`tab tab-bordered ${activeTab === "sold" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("sold")}
        >
          Sold Items
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "past" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past Auctions
        </button>
      </div>
      <div className="mt-4">
        {activeTab === "details" && <ProfileDetails />}
        {activeTab === "bidding" && <BiddingHistory />}
        {activeTab === "sold" && <SoldItems />}
        {activeTab === "past" && <PastAuctions />}
      </div>
    </div>
  );
};

export default ProfilePage;
