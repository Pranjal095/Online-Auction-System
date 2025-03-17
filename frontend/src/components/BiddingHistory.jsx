import React, { useEffect } from "react";
import { useProfileStore } from "../store/useProfileStore";

const BiddingHistory = () => {
  const { fetchBiddingHistory, biddingHistory, loading } = useProfileStore();

  useEffect(() => {
    fetchBiddingHistory();
  }, [fetchBiddingHistory]);

  if (loading && biddingHistory.length === 0) {
    return <p>Loading bidding history...</p>;
  }
  if (!biddingHistory || biddingHistory.length === 0) {
    return <p>No bidding history available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bidding History</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
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
    </div>
  );
};

export default BiddingHistory;
