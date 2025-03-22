import React, { useEffect } from "react";
import { useProfileStore } from "../store/useProfileStore";
import { useNavigate } from "react-router-dom"

const BiddingHistory = () => {
  const { biddingHistory, loading } = useProfileStore();
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/auction/${id}`);
  } 

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
              <tr 
                key={index}
                onClick={() => handleClick(bid.auction_id)}
                className="cursor-pointer"
              >
                <td>{bid.auction_id}</td>
                <td>{bid.item_title}</td>
                <td>${bid.amount}</td>
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
