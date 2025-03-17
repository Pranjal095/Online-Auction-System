import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuctionStore } from "../store/useAuctionStore";
import { useNavigate } from "react-router-dom";

const AuctionPage = () => {
  const { auction_id } = useParams();
  const { currentAuction, fetchAuction, placeBid, loading } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (auction_id) {
      fetchAuction(auction_id);
    }
  }, [auction_id, fetchAuction]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount) {
      return;
    }
    await placeBid(auction_id, parseFloat(bidAmount));
    setBidAmount("");
    window.location.href = `/auction/${auction_id}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentAuction) {
    return <div className="min-h-screen flex items-center justify-center">No auction found</div>;
  }

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <div className="card bg-base-200 shadow-lg overflow-hidden">
        <div className="card-body">
          <div className="border-b pb-4 mb-6">
            <h2 className="card-title text-3xl font-bold text-primary">{currentAuction.title}</h2>
            <div className="badge badge-accent mt-2">{currentAuction.status}</div>
          </div>

          {currentAuction.image_path && (
            <div className="mb-6">
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${currentAuction.image_path}`} 
                alt={currentAuction.title}
                className="rounded-lg shadow-md max-h-96 mx-auto" 
              />
            </div>
          )}
          
          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-base-content/80">{currentAuction.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-base-300 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Bid Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Starting Bid:</span>
                  <span className="font-mono font-bold">${currentAuction.starting_bid?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Highest Bid:</span>
                  <span className="font-mono text-xl font-bold text-success">
                    {currentAuction.highest_bid > 0 
                      ? `$${currentAuction.highest_bid?.toFixed(2)}` 
                      : "No bids yet"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Bids:</span>
                  <span className="badge badge-neutral">{currentAuction.bid_count || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-base-300 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Auction Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Seller:</span>
                  <span className="font-semibold">{currentAuction.seller_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Time:</span>
                  <span>{new Date(currentAuction.start_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>End Time:</span>
                  <span className="font-semibold">{new Date(currentAuction.end_time).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-base-100 p-4 rounded-xl border border-primary/30">
            <h3 className="text-xl font-semibold mb-4 text-center">Place Your Bid</h3>
            <form onSubmit={handleBidSubmit} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bid Amount ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={currentAuction.highest_bid > 0 ? currentAuction.highest_bid + 0.01 : currentAuction.starting_bid}
                  placeholder="Enter your bid amount"
                  className="input input-bordered w-full"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Bid"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
