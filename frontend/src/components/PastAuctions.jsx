import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const PastAuctions = () => {
  const { pastAuctions, loading } = useProfileStore();

  // Actual code when backend is ready:
  // if (loading && pastAuctions.length === 0) {
  //   return <p>Loading past auctions...</p>;
  // }
  // if (!pastAuctions || pastAuctions.length === 0) {
  //   return <p>No past auctions available.</p>;
  // }

  // Dummy past auctions data:
  const dummyPastAuctions = [
    {
      auction_id: 3,
      item_title: "Old Camera",
      starting_bid: 80.0,
      final_bid: 120.0,
      end_time: "2025-03-31T18:00:00Z",
      status: "closed",
    },
    {
      auction_id: 4,
      item_title: "Vintage Lamp",
      starting_bid: 50.0,
      final_bid: 75.0,
      end_time: "2025-03-28T20:00:00Z",
      status: "closed",
    },
  ];

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
            {dummyPastAuctions.map((auction, index) => (
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
