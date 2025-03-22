import React, { useEffect } from "react";
import { useProfileStore } from "../store/useProfileStore";
import { useNavigate } from "react-router-dom";

const YourAuctions = () => {
  const { yourAuctions, loading } = useProfileStore();

  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/auction/${id}`);
  } 

  if (loading && yourAuctions.length === 0) {
    return <p>Loading your auctions...</p>;
  }
  if (!yourAuctions || yourAuctions.length === 0) {
    return <p>No auctions available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Auctions</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
              <th>Highest Bid</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {yourAuctions.map((auction, index) => (
              <tr 
                key={index}
                onClick={() => handleClick(auction.auction_id)}
                className="cursor-pointer"
              >
                <td>{auction.auction_id}</td>
                <td>{auction.title}</td>
                <td>${auction.highest_bid}</td>
                <td>{new Date(auction.end_time).toLocaleString()}</td>
                <td>{auction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YourAuctions;
