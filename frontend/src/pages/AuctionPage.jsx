import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import { useAuctionStore } from "../store/useAuctionStore";  // Original store import

// Dummy auction data for testing
const dummyAuctions = [
  {
    auction_id: 1,
    item: {
      title: "Vintage Watch",
      description: "A classic vintage watch from the 1960s.",
      starting_bid: 100.0,
      current_highest_bid: 150.0,
    },
    start_time: "2025-04-01T12:00:00Z",
    end_time: "2025-04-01T14:00:00Z",
    status: "open",
  },
  {
    auction_id: 2,
    item: {
      title: "Antique Vase",
      description: "An exquisite antique vase with intricate design.",
      starting_bid: 200.0,
      current_highest_bid: 250.0,
    },
    start_time: "2025-04-02T12:00:00Z",
    end_time: "2025-04-02T14:00:00Z",
    status: "open",
  },
];

const AuctionPage = () => {
  const { auction_id } = useParams();
  const [bidAmount, setBidAmount] = useState("");

  // --- Dummy data implementation for testing ---
  const auction = dummyAuctions.find(
    (a) => a.auction_id === Number(auction_id)
  );

  const handleBidSubmit = (e) => {
    e.preventDefault();
    // For testing purposes, we simply log the bid amount.
    console.log(`Placing bid of $${bidAmount} on auction ${auction_id}`);
    setBidAmount("");
  };

  // --- Original implementation using useAuctionStore (commented out) ---
  /*
  const { currentAuction, fetchAuction, placeBid, loading } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (auction_id) {
      fetchAuction(auction_id);
    }
  }, [auction_id, fetchAuction]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount) {
      // Optionally, show error feedback
      return;
    }
    await placeBid(auction_id, bidAmount);
    setBidAmount("");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentAuction) {
    return <div className="min-h-screen flex items-center justify-center">No auction found</div>;
  }
  */

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No auction found.
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">{auction.item.title}</h2>
          <p>{auction.item.description}</p>
          <p>
            <strong>Starting Bid:</strong> ${auction.item.starting_bid}
          </p>
          <p>
            <strong>Current Highest Bid:</strong>{" "}
            {auction.item.current_highest_bid
              ? `$${auction.item.current_highest_bid}`
              : "No bids yet"}
          </p>
          <p>
            <strong>Status:</strong> {auction.status}
          </p>
          <p>
            <strong>Auction Ends:</strong>{" "}
            {new Date(auction.end_time).toLocaleString()}
          </p>
        </div>
        <div className="card-footer">
          <form
            onSubmit={handleBidSubmit}
            className="w-full flex gap-2 items-center"
          >
            <input
              type="number"
              placeholder="Enter bid"
              className="input input-bordered flex-1"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Place Bid
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
