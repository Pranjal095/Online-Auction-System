import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import { useAuctionStore } from "../store/useAuctionStore";  // Original store import

// Dummy auction data for testing (added imageUrl for modern UI)
const dummyAuctions = [
  {
    auction_id: 1,
    item: {
      title: "Vintage Watch",
      description: "A classic vintage watch from the 1960s.",
      starting_bid: 100.0,
      current_highest_bid: 150.0,
      imageUrl: "https://via.placeholder.com/400?text=Vintage+Watch",
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
      imageUrl: "https://via.placeholder.com/400?text=Antique+Vase",
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
      <div className="card bg-base-200 shadow-lg overflow-hidden min-h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Auction Image */}
          <figure className="h-full">
            <img
              src={auction.item.imageUrl}
              alt={auction.item.title}
              className="object-cover w-full h-full"
            />
          </figure>
          {/* Auction Details */}
          <div className="card-body flex flex-col justify-between">
            <div>
              <h2 className="card-title text-3xl font-bold">{auction.item.title}</h2>
              <p className="mt-4">{auction.item.description}</p>
              <div className="mt-6 space-y-3">
                <p>
                  <span className="font-semibold">Starting Bid:</span> ${auction.item.starting_bid}
                </p>
                <p>
                  <span className="font-semibold">Current Highest Bid:</span>{" "}
                  {auction.item.current_highest_bid
                    ? `$${auction.item.current_highest_bid}`
                    : "No bids yet"}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {auction.status}
                </p>
                <p>
                  <span className="font-semibold">Auction Ends:</span>{" "}
                  {new Date(auction.end_time).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Bid Form */}
        <div className="card-footer p-6">
          <form onSubmit={handleBidSubmit} className="flex flex-col sm:flex-row gap-4 w-full items-center justify-center">
            <input
              type="number"
              placeholder="Enter bid"
              className="input input-bordered w-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary rounded-lg px-6 py-2 shadow-md hover:shadow-lg transition-shadow">
              Place Bid
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
