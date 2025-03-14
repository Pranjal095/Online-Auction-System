import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const BiddingHistory = () => {
  const { biddingHistory, loading } = useProfileStore();

  if (loading && biddingHistory.length === 0) {
    return <p>Loading bidding history...</p>;
  }

  if (!biddingHistory || biddingHistory.length === 0) {
    return <p>No bidding history found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Auction ID</th>
            <th>Item</th>
            <th>Bid Amount</th>
            <th>Bid Time</th>
          </tr>
        </thead>
        <tbody>
          {biddingHistory.map((bid, index) => (
            <tr key={index}>
              <td>{bid.auction_id}</td>
              <td>{bid.item_title}</td>
              <td>${bid.bid_amount}</td>
              <td>{new Date(bid.bid_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BiddingHistory;
