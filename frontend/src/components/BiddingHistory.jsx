import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const BiddingHistory = () => {
  const { biddingHistory, loading } = useProfileStore();

  // Actual code when backend is ready:
  // if (loading && biddingHistory.length === 0) {
  //   return <p>Loading bidding history...</p>;
  // }
  // if (!biddingHistory || biddingHistory.length === 0) {
  //   return <p>No bidding history available.</p>;
  // }

  // Dummy bidding history data:
  const dummyBiddingHistory = [
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
            {dummyBiddingHistory.map((bid, index) => (
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
