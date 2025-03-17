import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const PastAuctions = () => {
  const { pastAuctions, loading } = useProfileStore();

  if (loading && pastAuctions.length === 0) {
    return <p>Loading past auctions...</p>;
  }
  if (!pastAuctions || pastAuctions.length === 0) {
    return <p>No past auctions available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Past Auctions</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
              <th>Starting Bid</th>
              <th>Final Bid</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pastAuctions.map((auction, index) => (
              <tr key={index}>
                <td>{auction.auction_id}</td>
                <td>{auction.item_title}</td>
                <td>${auction.starting_bid}</td>
                <td>${auction.final_bid}</td>
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

export default PastAuctions;
