import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuctionStore } from "../store/useAuctionStore";
import { useAuthStore } from "../store/useAuthStore";
import { Trash } from "lucide-react";
import getLocalTime from "../helpers/getLocalTime";

const AuctionPage = () => {
  const { auction_id } = useParams();
  const { 
    currentAuction, fetchAuction, placeBid, placeAutomatedBid, loading, deleteAuction, updateAuctionEndTime, updateBid } = useAuctionStore();
  const { user } = useAuthStore();
  const [bidAmount, setBidAmount] = useState("");
  const [automatedBidAmount, setAutomatedBidAmount] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (auction_id) {
      fetchAuction(auction_id);

      const wsUrl = import.meta.env.VITE_BACKEND_URL 
        ? import.meta.env.VITE_BACKEND_URL.replace('http', 'ws') + '/ws'
        : 'ws://localhost:8000/ws';
      const ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'new_bid' && message.data.auction_id === parseInt(auction_id)) {
          fetchAuction(auction_id);
        }
      };
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.close();
      };
    }
  }, [auction_id, fetchAuction]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount) return;
    if (parseFloat(bidAmount) + 1 <= currentAuction.highest_automated_bid){
      await updateBid(auction_id, parseFloat(bidAmount) + 1);
      window.alert("The highest bid has been updated as another user has placed an automated bid on this item.");
      return;
    }
    await placeBid(auction_id, parseFloat(bidAmount));
    setBidAmount("");
  };

  const handleAutomatedBidSubmit = async (e) => {
    e.preventDefault();
    if (!automatedBidAmount) return;
    await placeAutomatedBid(auction_id, parseFloat(automatedBidAmount));
    setAutomatedBidAmount("");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      await deleteAuction(auction_id);
      navigate("/auctions");
    }
  };

  const handleEndTimeChange = async () => {
    if (!newEndTime) return;
    await updateAuctionEndTime(auction_id, getLocalTime(newEndTime));
    fetchAuction(auction_id);
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
          <div className="border-b pb-4 mb-6 ">
            <div className="flex justify-between">
              <h2 className="card-title text-4xl font-bold text-primary">{currentAuction.title}</h2>
              {user.is_admin && currentAuction.status === 'open' && (
                <button onClick={handleDelete} className="btn btn-error btn-sm">
                  <Trash className="w-5 h-5" />
                  Delete
                </button>
              )}
            </div>
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
            <h3 className="text-2xl font-semibold mb-2">Description</h3>
            <p className="text-base-content/80">{currentAuction.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-base-300 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Bid Information</h3>
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
                  <span>Current Highest Automated Bid:</span>
                  <span className="font-mono text-xl font-bold text-success">
                    {currentAuction.highest_bid > 0 
                      ? `$${currentAuction.highest_automated_bid?.toFixed(2)}` 
                      : "No bids yet"}
                  </span>
                </div>
                { currentAuction.seller_id !== user.id && (
                <>
                <div className="flex justify-between items-center">
                  <span>Your Current Bid:</span>
                  <span className="font-mono">
                    {currentAuction.current_user_bid 
                      ? `$${currentAuction.current_user_bid.toFixed(2)}`
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Your Automated Bid:</span>
                  <span className="font-mono">
                    {currentAuction.current_user_bid 
                      ? `$${currentAuction.current_automated_bid.toFixed(2)}`
                      : "None"}
                  </span>
                </div>
                </>
                )}
              </div>
            </div>
            
            <div className="bg-base-300 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Auction Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Seller:</span>
                  <span className="font-semibold">{currentAuction.seller_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Time:</span>
                  <span className="font-semibold">{new Date(currentAuction.start_time).toUTCString().slice(0, -4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>End Time:</span>
                  <span className="font-semibold">{new Date(currentAuction.end_time).toUTCString().slice(0, -4)}</span>
                </div>
              </div>
            </div>
          </div>

          {user.is_admin && currentAuction.status !== 'deleted' && (
            <div className="mt-6 bg-base-100 p-4 rounded-xl border border-warning/50">
              <h3 className="text-2xl font-semibold mb-4 text-warning text-center">Modify Auction End Time</h3>
              <div className="flex gap-4">
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
                <button 
                  onClick={handleEndTimeChange} 
                  className="btn btn-warning"
                >
                  Update End Time
                </button>
              </div>
            </div>
          )}

          {currentAuction.status === "open" && user.id !== currentAuction.seller_id && !user.is_admin && (
            <>
              <div className="mt-6 bg-base-100 p-4 rounded-xl border border-primary/30">
                <h3 className="text-2xl font-semibold mb-4 text-center">Place Your Bid</h3>
                <form onSubmit={handleBidSubmit} className="flex flex-col gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Bid Amount ($)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={currentAuction.highest_bid > 0 ? currentAuction.highest_bid + 0.01 : currentAuction.starting_bid + 0.01}
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

              <div className="mt-6 bg-base-100 p-4 rounded-xl border border-secondary/30">
                <h3 className="text-2xl font-semibold mb-4 text-center">Place Automated Bid</h3>
                <form onSubmit={handleAutomatedBidSubmit} className="flex flex-col gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Maximum Bid Amount ($)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={currentAuction.highest_bid > 0 ? currentAuction.highest_bid + 0.01 : currentAuction.starting_bid}
                      placeholder="Enter your maximum bid amount"
                      className="input input-bordered w-full"
                      value={automatedBidAmount}
                      onChange={(e) => setAutomatedBidAmount(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-secondary btn-block"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Place Automated Bid"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
